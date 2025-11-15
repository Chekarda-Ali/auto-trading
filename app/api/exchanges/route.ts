import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { exchangeCredentials } from '../../../lib/db/schema';
import { encryptCredentials } from '../../../lib/encryption';
import { getDbUser } from '../../../lib/auth-utils';

const exchangeSchema = z.object({
  exchangeId: z.string(),
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
  passphrase: z.string().optional(),
  sandbox: z.boolean().default(false),
});

export async function GET() {
  try {
    const dbUser = await getDbUser();
    
    const credentials = await db.select({
      id: exchangeCredentials.id,
      exchangeId: exchangeCredentials.exchangeId,
      apiKey: exchangeCredentials.apiKey,
      isActive: exchangeCredentials.isActive,
      sandbox: exchangeCredentials.sandbox,
      createdAt: exchangeCredentials.createdAt,
      updatedAt: exchangeCredentials.updatedAt,
    })
    .from(exchangeCredentials)
    .where(eq(exchangeCredentials.userId, dbUser.id));

    return NextResponse.json({ credentials });

  } catch (error: any) {
    console.error('Error fetching exchange credentials:', error);
    
    if (error.message.includes('No Clerk user ID')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch exchange credentials',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    const body = await req.json();
    const validatedData = exchangeSchema.parse(body);

    // Encrypt sensitive data
    const encryptedSecret = await encryptCredentials(validatedData.apiSecret);
    const encryptedPassphrase = validatedData.passphrase 
      ? await encryptCredentials(validatedData.passphrase)
      : null;

    // Check if credentials already exist for this exchange
    const existing = await db.select()
      .from(exchangeCredentials)
      .where(and(
        eq(exchangeCredentials.userId, dbUser.id),
        eq(exchangeCredentials.exchangeId, validatedData.exchangeId)
      ));

    if (existing.length > 0) {
      // Update existing credentials
      await db.update(exchangeCredentials)
        .set({
          apiKey: validatedData.apiKey,
          apiSecret: encryptedSecret,
          passphrase: encryptedPassphrase,
          sandbox: validatedData.sandbox,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(and(
          eq(exchangeCredentials.userId, dbUser.id),
          eq(exchangeCredentials.exchangeId, validatedData.exchangeId)
        ));
    } else {
      // Insert new credentials
      await db.insert(exchangeCredentials).values({
        userId: dbUser.id,
        exchangeId: validatedData.exchangeId,
        apiKey: validatedData.apiKey,
        apiSecret: encryptedSecret,
        passphrase: encryptedPassphrase,
        sandbox: validatedData.sandbox,
        isActive: true,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Exchange credentials saved successfully' 
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input data',
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error saving exchange credentials:', error);
    
    if (error.message.includes('No Clerk user ID')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to save exchange credentials',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    const { searchParams } = new URL(req.url);
    const exchangeId = searchParams.get('exchangeId');

    if (!exchangeId) {
      return NextResponse.json({ error: 'Exchange ID required' }, { status: 400 });
    }

    await db.update(exchangeCredentials)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(
        eq(exchangeCredentials.userId, dbUser.id),
        eq(exchangeCredentials.exchangeId, exchangeId)
      ));

    return NextResponse.json({ 
      success: true, 
      message: 'Exchange credentials deactivated' 
    });

  } catch (error: any) {
    console.error('Error deactivating exchange credentials:', error);
    
    if (error.message.includes('No Clerk user ID')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to deactivate exchange credentials',
      details: error.message 
    }, { status: 500 });
  }
}