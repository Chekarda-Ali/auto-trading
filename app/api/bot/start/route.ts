import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { botInstances, exchangeCredentials } from '../../../../lib/db/schema';
import { decryptCredentials } from '../../../../lib/encryption';
import { checkSubscription } from '../../../../lib/subscription';
import { startBotForUser } from '../../../../lib/bot-manager';
import { getDbUser } from '../../../../lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    
    const subscription = await checkSubscription(dbUser.id);
    if (!subscription.isActive) {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { exchangeIds, settings } = body;

    // Get user's exchange credentials
    const credentials = await db.select()
      .from(exchangeCredentials)
      .where(and(
        eq(exchangeCredentials.userId, dbUser.id),
        eq(exchangeCredentials.isActive, true)
      ));

    if (credentials.length === 0) {
      return NextResponse.json({ 
        error: 'No exchange credentials configured. Please add your API keys first.' 
      }, { status: 400 });
    }

    // Decrypt credentials for bot use
    const decryptedCredentials = await Promise.all(
      credentials.map(async (cred) => ({
        ...cred,
        apiSecret: await decryptCredentials(cred.apiSecret),
        passphrase: cred.passphrase ? await decryptCredentials(cred.passphrase) : null,
        sandbox: cred.sandbox ?? false,
      }))
    );

    // Start bot instance
    const botInstance = await startBotForUser(dbUser.id, decryptedCredentials, settings);

    // Check if bot instance already exists for this user
    const existingInstance = await db.select()
      .from(botInstances)
      .where(eq(botInstances.userId, dbUser.id));

    if (existingInstance.length > 0) {
      // Update existing instance
      await db.update(botInstances)
        .set({
          status: 'running',
          settings: JSON.stringify(settings),
          startedAt: new Date(),
          stoppedAt: null,
          lastHeartbeat: new Date(),
        })
        .where(eq(botInstances.userId, dbUser.id));
    } else {
      // Insert new instance
      await db.insert(botInstances).values({
        userId: dbUser.id,
        status: 'running',
        settings: JSON.stringify(settings),
        startedAt: new Date(),
        lastHeartbeat: new Date(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bot started successfully',
      instanceId: botInstance.id 
    });

  } catch (error: any) {
    console.error('Error starting bot:', error);
    
    if (error.message.includes('No Clerk user ID')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to start bot. Please try again.',
      details: error.message 
    }, { status: 500 });
  }
}