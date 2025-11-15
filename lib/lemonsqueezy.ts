import { lemonSqueezySetup, createCheckout as lsCreateCheckout } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error('Lemon Squeezy error:', error),
});

export async function createCheckout(variantId: string, userId: string): Promise<string> {
  try {
    const checkout = await lsCreateCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutOptions: {
          embed: false,
          media: false,
          logo: true,
        },
        checkoutData: {
          email: '', // Will be filled by user
          name: '', // Will be filled by user
          custom: {
            user_id: userId,
          },
        },
        productOptions: {
          name: 'ArbitrageBot Pro - Monthly Subscription',
          description: 'Professional multi-exchange arbitrage trading bot',
          media: [
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'
          ],
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
        },
      }
    );

    return checkout.data?.attributes.url || '';
  } catch (error) {
    console.error('Error creating checkout:', error);
    throw new Error('Failed to create checkout session');
  }
}

export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    // Implementation would use Lemon Squeezy API to get subscription details
    // This is a placeholder for the actual implementation
    return null;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    return null;
  }
}