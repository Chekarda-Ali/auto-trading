import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

const ADMIN_EMAILS = ['alichekarda21@gmail.com'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = req.headers;
    
    const svix_id = headersList.get("svix-id");
    const svix_timestamp = headersList.get("svix-timestamp");
    const svix_signature = headersList.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occurred -- no svix headers', {
        status: 400
      });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occurred', {
        status: 400
      });
    }

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      const userEmail = email_addresses[0]?.email_address || '';
      const isAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());

      // Create user in database
      await db.insert(users).values({
        id: id, // Use Clerk ID as the primary ID
        clerkId: id,
        email: userEmail,
        firstName: first_name || '',
        lastName: last_name || '',
        imageUrl: image_url || '',
        isAdmin: isAdmin,
      });

      console.log(`Created user in database: ${id}, Admin: ${isAdmin}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}