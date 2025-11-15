import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { botInstances } from '../../../../lib/db/schema';
import { stopBotForUser } from '../../../../lib/bot-manager';
import { getDbUser } from '../../../../lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const dbUser = await getDbUser();
    
    // Stop bot instance
    await stopBotForUser(dbUser.id);

    // Update bot instance in database
    await db.update(botInstances)
      .set({
        status: 'stopped',
        stoppedAt: new Date(),
      })
      .where(eq(botInstances.userId, dbUser.id));

    return NextResponse.json({ 
      success: true, 
      message: 'Bot stopped successfully' 
    });

  } catch (error: any) {
    console.error('Error stopping bot:', error);
    
    if (error.message.includes('No Clerk user ID')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to stop bot. Please try again.',
      details: error.message 
    }, { status: 500 });
  }
}