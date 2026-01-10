import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { users } from '../../../../lib/db/schema';

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'No Clerk user ID found' }, { status: 401 });
    }

    // Check database
    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    
    // Try to get user from Clerk API
    let clerkUser = null;
    try {
      const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      });
      if (response.ok) {
        clerkUser = await response.json();
      }
    } catch (error) {
      console.error('Error fetching from Clerk API:', error);
    }

    return NextResponse.json({
      clerkUserId,
      inDatabase: dbUsers.length > 0,
      databaseUser: dbUsers[0] || null,
      clerkUser: clerkUser ? {
        id: clerkUser.id,
        email: clerkUser.email_addresses?.[0]?.email_address,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name
      } : null,
      hasClerkSecret: !!process.env.CLERK_SECRET_KEY
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error) 
    }, { status: 500 });
  }
}