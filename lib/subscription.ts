import { db } from './db';
import { subscriptions } from './db/schema';
import { eq } from 'drizzle-orm';
import { checkAdminAccess } from './admin';
import { FLAGS, devFlagEnabled, assertProdGuards } from './config';

export interface SubscriptionStatus {
  isActive: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

export async function checkSubscription(userId: string): Promise<SubscriptionStatus> {
  try {
    assertProdGuards();
    // Dev-only global billing bypass
    if (devFlagEnabled(FLAGS.BILLING_DISABLED)) {
      return {
        isActive: true,
        status: 'dev-bypass',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
    // Admins bypass subscription checks
    const isAdmin = await checkAdminAccess(userId);
    if (isAdmin) {
      return {
        isActive: true,
        status: 'admin',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (subscription.length === 0) {
      return {
        isActive: false,
        status: 'none',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    const sub = subscription[0];
    const now = new Date();
    const isActive = sub.status === 'active' && sub.currentPeriodEnd > now;

    return {
      isActive,
      status: sub.status,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return {
      isActive: false,
      status: 'error',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    return subscription[0] || null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}