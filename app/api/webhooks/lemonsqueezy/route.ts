import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../../../lib/db';
import { subscriptions } from '../../../../lib/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();
    const signature = (await headersList).get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const digest = hmac.digest('hex');

    if (signature !== digest) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { meta, data } = event;

    console.log('LemonSqueezy webhook received:', meta.event_name);

    switch (meta.event_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(data);
        break;
      case 'subscription_updated':
        await handleSubscriptionUpdated(data);
        break;
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data);
        break;
      case 'subscription_resumed':
        await handleSubscriptionResumed(data);
        break;
      case 'subscription_expired':
        await handleSubscriptionExpired(data);
        break;
      default:
        console.log('Unhandled webhook event:', meta.event_name);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(data: any) {
  const { attributes, id } = data;
  const customData = JSON.parse(attributes.custom_data || '{}');
  
  await db.insert(subscriptions).values({
    userId: customData.user_id,
    lemonSqueezyId: id,
    status: attributes.status,
    currentPeriodStart: new Date(attributes.created_at),
    currentPeriodEnd: new Date(attributes.renews_at),
    cancelAtPeriodEnd: false,
  });
}

async function handleSubscriptionUpdated(data: any) {
  const { attributes, id } = data;
  
  await db.update(subscriptions)
    .set({
      status: attributes.status,
      currentPeriodStart: new Date(attributes.created_at),
      currentPeriodEnd: new Date(attributes.renews_at),
      cancelAtPeriodEnd: attributes.cancelled,
    })
    .where(eq(subscriptions.lemonSqueezyId, id));
}

async function handleSubscriptionCancelled(data: any) {
  const { id } = data;
  
  await db.update(subscriptions)
    .set({
      status: 'cancelled',
      cancelAtPeriodEnd: true,
    })
    .where(eq(subscriptions.lemonSqueezyId, id));
}

async function handleSubscriptionResumed(data: any) {
  const { attributes, id } = data;
  
  await db.update(subscriptions)
    .set({
      status: 'active',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date(attributes.renews_at),
    })
    .where(eq(subscriptions.lemonSqueezyId, id));
}

async function handleSubscriptionExpired(data: any) {
  const { id } = data;
  
  await db.update(subscriptions)
    .set({
      status: 'expired',
    })
    .where(eq(subscriptions.lemonSqueezyId, id));
}