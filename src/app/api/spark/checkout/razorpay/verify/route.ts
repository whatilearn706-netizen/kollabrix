import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRazorpaySettings, verifyRazorpaySignature } from '@/lib/spark/razorpay';
import { KA_PLANS, KaPlanId, activateUserPlan, getKaEntitlements } from '@/lib/spark/plans';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User session not found.', requireAuth: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      razorpay_order_id = '',
      razorpay_payment_id = '',
      razorpay_signature = '',
      planId,
    } = body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      planId?: KaPlanId;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: 'Missing payment signature parameters.' }, { status: 400 });
    }

    const settings = await getRazorpaySettings();
    if (!settings.keySecret) {
      return NextResponse.json({ error: 'Razorpay secret key not found in system.' }, { status: 500 });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      settings.keySecret
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment verification failed: invalid HMAC cryptographic signature.' },
        { status: 400 }
      );
    }

    const planDef = KA_PLANS[planId];
    if (!planDef) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }

    const activated = await activateUserPlan(user.id, planId, {
      source: 'razorpay',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: planDef.priceInr,
      userEmail: user.email || '',
      userName: user.user_metadata?.full_name || user.user_metadata?.name || '',
    });

    const entitlements = await getKaEntitlements(user.id, user.id);

    return NextResponse.json({
      success: true,
      message: `🎉 Payment successful! ${planDef.name} is now active.`,
      plan: activated,
      entitlements,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Error processing payment verification.' },
      { status: 500 }
    );
  }
}
