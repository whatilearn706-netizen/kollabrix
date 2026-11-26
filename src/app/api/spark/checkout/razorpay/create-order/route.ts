import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/spark/razorpay';
import { KA_PLANS, KaPlanId } from '@/lib/spark/plans';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in first before proceeding to payment.', requireAuth: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId } = body as { planId?: KaPlanId };

    if (!planId || !KA_PLANS[planId] || planId === 'free') {
      return NextResponse.json({ error: 'Please select a valid paid plan.' }, { status: 400 });
    }

    const order = await createRazorpayOrder({
      planId,
      userId: user.id,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.user_metadata?.name || '',
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      amount: order.amountPaise,
      currency: order.currency,
      keyId: order.keyId,
      planId,
      planName: KA_PLANS[planId].name,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.user_metadata?.name || '',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not initiate Razorpay checkout.' },
      { status: 500 }
    );
  }
}
