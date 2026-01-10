import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCheckout } from '../../../../lib/lemonsqueezy';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
    }

    const checkoutUrl = await createCheckout(variantId, userId);

    return NextResponse.json({ checkoutUrl });

  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ 
      error: 'Failed to create checkout session' 
    }, { status: 500 });
  }
}