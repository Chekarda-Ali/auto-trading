import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { FLAGS, devFlagEnabled, assertProdGuards } from './config';

const DEFAULT_ADMIN_EMAILS = ['admin@arbitragebot.pro'];
const ENV_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter((s) => !!s);
const ADMIN_EMAILS = [...DEFAULT_ADMIN_EMAILS, ...ENV_ADMIN_EMAILS];

export async function checkAdminAccess(userId: string): Promise<boolean> {
  try {
    assertProdGuards();
    // Global override to grant admin to all users (dev-only)
    if (devFlagEnabled(FLAGS.GRANT_ADMIN_TO_ALL)) {
      return true;
    }

    const adminUserIds = (process.env.ADMIN_USER_IDS || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);

    if (adminUserIds.includes(userId)) {
      return true;
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (user.length === 0) {
      return false;
    }

    const email = (user[0].email || '').toLowerCase();
    return Boolean(user[0].isAdmin) || ADMIN_EMAILS.includes(email);
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

export async function makeUserAdmin(userId: string): Promise<void> {
  try {
    await db.update(users)
      .set({ isAdmin: true })
      .where(eq(users.clerkId, userId));
  } catch (error) {
    console.error('Error making user admin:', error);
    throw new Error('Failed to update admin status');
  }
}