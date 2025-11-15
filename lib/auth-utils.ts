import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema';

export async function getDbUser() {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      throw new Error('No Clerk user ID found');
    }

    // Check if user exists in database
    const dbUsers = await db.select().from(users).where(eq(users.clerkId, clerkUserId));
    
    if (dbUsers.length > 0) {
      return dbUsers[0];
    }

    // If user doesn't exist, create them
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is missing');
    }

    // Get user info from Clerk
    const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user from Clerk: ${response.status}`);
    }

    const clerkUser = await response.json();

    // Create user in database
    const [newUser] = await db.insert(users).values({
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clerkId: clerkUserId,
      email: clerkUser.email_addresses?.[0]?.email_address || 'no-email@example.com',
      firstName: clerkUser.first_name || '',
      lastName: clerkUser.last_name || '',
      imageUrl: clerkUser.image_url || '',
    }).returning();

    console.log('Created new user in database:', newUser.id);
    return newUser;

  } catch (error) {
    console.error('Error in getDbUser:', error);
    throw error;
  }
}