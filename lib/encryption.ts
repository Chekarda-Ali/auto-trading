import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from './db';
import { encryptionKeys } from './db/schema';
import { eq } from 'drizzle-orm';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Get or create master encryption key
async function getMasterKey(): Promise<Buffer> {
  const masterKeyEnv = process.env.MASTER_ENCRYPTION_KEY;
  if (masterKeyEnv) {
    if (!/^[0-9a-fA-F]{64}$/.test(masterKeyEnv)) {
      throw new Error('MASTER_ENCRYPTION_KEY must be a 32-byte hex string');
    }
    return Buffer.from(masterKeyEnv, 'hex');
  }

  // Fallback for local development: persist a generated key to a file with restricted permissions.
  const keyFile = path.join(process.cwd(), '.master_encryption_key');

  try {
    const fileContents = (await fs.readFile(keyFile, 'utf8')).trim();
    if (!/^[0-9a-fA-F]{64}$/.test(fileContents)) {
      throw new Error(`Invalid master key format in ${keyFile}`);
    }
    return Buffer.from(fileContents, 'hex');
  } catch (err) {
    // If file doesn't exist or is invalid, generate and try to persist a new master key
    const newKey = crypto.randomBytes(32);
    const hex = newKey.toString('hex');
    try {
      await fs.writeFile(keyFile, hex + '\n', { mode: 0o600 });
      console.warn(`No MASTER_ENCRYPTION_KEY provided; generated and saved master key to ${keyFile}. Back it up securely.`);
    } catch (writeErr) {
      console.warn(`Failed to persist generated master key to ${keyFile}:`, writeErr);
    }
    return newKey;
  }
}

// Get active encryption key from database
async function getActiveEncryptionKey(): Promise<string> {
  const activeKey = await db
    .select()
    .from(encryptionKeys)
    .where(eq(encryptionKeys.isActive, true))
    .limit(1);

  if (activeKey.length === 0) {
    // Create new encryption key
    const keyId = crypto.randomUUID();
    const dataKey = crypto.randomBytes(32);
    const masterKey = await getMasterKey();

    // Encrypt the data key with master key (modern method)
    const iv = crypto.randomBytes(IV_LENGTH);
    const derivedKey = crypto.createHash('sha256').update(masterKey).digest(); // 32-byte key
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);

    let encryptedKey = cipher.update(dataKey);
    encryptedKey = Buffer.concat([encryptedKey, cipher.final()]);

    await db.insert(encryptionKeys).values({
      keyId,
      encryptedKey: `${iv.toString('hex')}:${encryptedKey.toString('hex')}`,
      isActive: true,
    });

    return dataKey.toString('hex');
  }

  // Decrypt existing key
  const masterKey = await getMasterKey();
  const [ivHex, encryptedKeyHex] = activeKey[0].encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedKey = Buffer.from(encryptedKeyHex, 'hex');
  const derivedKey = crypto.createHash('sha256').update(masterKey).digest();
  const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);

  let decryptedKey = decipher.update(encryptedKey);
  decryptedKey = Buffer.concat([decryptedKey, decipher.final()]);

  return decryptedKey.toString('hex');
}

export async function encryptCredentials(plaintext: string): Promise<string> {
  try {
    const dataKey = Buffer.from(await getActiveEncryptionKey(), 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(dataKey, salt, 100000, 32, 'sha256');

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted
    return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt credentials');
  }
}

export async function decryptCredentials(encryptedData: string): Promise<string> {
  try {
    const dataKey = Buffer.from(await getActiveEncryptionKey(), 'hex');
    const [saltHex, ivHex, tagHex, encrypted] = encryptedData.split(':');

    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    // Derive key using PBKDF2
    const key = crypto.pbkdf2Sync(dataKey, salt, 100000, 32, 'sha256');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt credentials');
  }
}

// Rotate encryption keys (for security)
export async function rotateEncryptionKey(): Promise<void> {
  try {
    // Mark current key as inactive
    await db
      .update(encryptionKeys)
      .set({
        isActive: false,
        rotatedAt: new Date(),
      })
      .where(eq(encryptionKeys.isActive, true));

    console.log('Encryption key rotation completed');
  } catch (error) {
    console.error('Key rotation error:', error);
    throw new Error('Failed to rotate encryption key');
  }
}
