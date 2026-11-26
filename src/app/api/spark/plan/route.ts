import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClientIp } from '@/lib/security/ipRateLimit';
import {
  KA_PLANS,
  KaPlanId,
  activateUserPlan,
  getKaEntitlements,
} from '@/lib/spark/plans';
import { getRazorpaySettings } from '@/lib/spark/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getAuthUserId(): Promise<string | null> {
  try {
    const serverClient = createServerSupabaseClient();
    const { data: { user } } = await serverClient.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userId = await getAuthUserId();
  const entitlements = await getKaEntitlements(userId || ip, userId);

  return NextResponse.json({
    success: true,
    entitlements,
    plans: Object.values(KA_PLANS),
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Please sign in first to activate a Hackathon Pass or KΛ Pro Builder plan.', requireAuth: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action = 'activate_demo', planId, utrNumber = '' } = body as {
      action?: 'activate_demo' | 'submit_upi' | 'reset_free';
      planId?: KaPlanId;
      utrNumber?: string;
    };

    if (action === 'reset_free') {
      await activateUserPlan(userId, 'free', { source: 'sandbox_demo' });
      const entitlements = await getKaEntitlements(userId, userId);
      return NextResponse.json({ success: true, entitlements });
    }

    if (!planId || !KA_PLANS[planId] || planId === 'free') {
      return NextResponse.json({ error: 'Invalid paid plan selected.' }, { status: 400 });
    }

    const razorpay = await getRazorpaySettings();
    if (razorpay.enabled) {
      return NextResponse.json(
        {
          error:
            'Live Razorpay checkout is enabled. Please complete payment via Razorpay to activate your subscription.',
        },
        { status: 403 }
      );
    }

    if (action === 'submit_upi' && String(utrNumber).trim().length < 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 12-digit UPI UTR / Reference ID.' },
        { status: 400 }
      );
    }

    await activateUserPlan(userId, planId, {
      utrNumber: utrNumber ? String(utrNumber).trim() : undefined,
      source: action === 'submit_upi' ? 'upi' : 'sandbox_demo',
    });

    const entitlements = await getKaEntitlements(userId, userId);
    return NextResponse.json({
      success: true,
      message: `${KA_PLANS[planId].name} activated!`,
      entitlements,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update plan' }, { status: 500 });
  }
}
