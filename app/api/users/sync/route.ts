import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { users } from '../../../../lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'No Clerk user ID' }, { status: 401 });
    }

    console.log('Syncing user:', clerkUserId);

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    
    if (existingUsers.length > 0) {
      console.log('User already exists in database:', existingUsers[0].id);
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists',
        userId: existingUsers[0].id 
      });
    }

    // Get user info from Clerk
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('CLERK_SECRET_KEY is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Clerk API error:', response.status, response.statusText);
      return NextResponse.json({ 
        error: `Failed to fetch user from Clerk: ${response.status}` 
      }, { status: 500 });
    }

    const clerkUser = await response.json();
    console.log('Fetched from Clerk:', clerkUser);

    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
    }

    // Create user in database
    const [newUser] = await db.insert(users).values({
      id: `user_${Date.now()}_${clerkUserId.slice(-6)}`, // More unique ID
      clerkId: clerkUserId,
      email: clerkUser.email_addresses?.[0]?.email_address || 'no-email@example.com',
      firstName: clerkUser.first_name || '',
      lastName: clerkUser.last_name || '',
      imageUrl: clerkUser.image_url || '',
    }).returning();

    console.log('Created user in database:', newUser.id);

    return NextResponse.json({ 
      success: true, 
      message: 'User synced successfully',
      userId: newUser.id 
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync user',
      details: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
    }, { status: 500 });
  }
}