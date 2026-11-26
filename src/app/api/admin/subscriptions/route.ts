import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import {
  KA_PLANS,
  KaPlanId,
  getAllUserPlans,
  activateUserPlan,
  revokeUserPlan,
  extendUserPlan,
  UserPlanRecord,
} from '@/lib/spark/plans';
import { getRazorpaySettings, saveRazorpaySettings } from '@/lib/spark/razorpay';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
  }

  try {
    const allPlans = await getAllUserPlans();
    const serviceClient = getServiceClient();

    let authUsers: any[] = [];
    let profilesMap = new Map<string, any>();

    if (serviceClient) {
      try {
        const { data: usersData } = await serviceClient.auth.admin.listUsers();
        authUsers = usersData?.users || [];
      } catch {}

      try {
        const { data: profiles } = await serviceClient.from('profiles').select('*');
        if (Array.isArray(profiles)) {
          for (const p of profiles) {
            profilesMap.set(p.user_id, p);
          }
        }
      } catch {}
    }

    const authMap = new Map<string, any>();
    for (const u of authUsers) {
      authMap.set(u.id, u);
    }

    // Build complete subscription items
    const subscribers: Array<{
      userId: string;
      email: string;
      name: string;
      avatarUrl?: string;
      college?: string;
      planId: KaPlanId;
      planName: string;
      priceInr: number;
      activatedAt: string;
      expiresAt: string | null;
      daysRemaining: number | null;
      isActive: boolean;
      source: string;
      utrNumber?: string;
      paymentId?: string;
      orderId?: string;
    }> = [];

    let totalActivePaid = 0;
    let hackathonPassCount = 0;
    let proMonthlyCount = 0;
    let proSemesterCount = 0;
    let totalRevenueInr = 0;

    for (const [userId, rec] of Object.entries(allPlans)) {
      if (!rec || rec.planId === 'free') continue;

      const authUser = authMap.get(userId);
      const profile = profilesMap.get(userId);

      const name =
        profile?.display_name ||
        rec.userName ||
        authUser?.user_metadata?.full_name ||
        authUser?.user_metadata?.name ||
        'Student User';

      const email = authUser?.email || rec.userEmail || profile?.email || 'N/A';
      const avatarUrl = profile?.avatar_url || authUser?.user_metadata?.avatar_url || null;
      const college = profile?.college || null;

      const planDef = KA_PLANS[rec.planId] || KA_PLANS.free;
      const now = Date.now();
      const expiresTime = rec.expiresAt ? new Date(rec.expiresAt).getTime() : null;
      const isExpired = expiresTime ? expiresTime <= now : false;
      const isActive = !isExpired;
      const daysRemaining = expiresTime ? Math.max(0, Math.ceil((expiresTime - now) / (24 * 3600 * 1000))) : null;

      if (isActive) {
        totalActivePaid += 1;
        if (rec.planId === 'hackathon_pass') hackathonPassCount += 1;
        if (rec.planId === 'pro_monthly') proMonthlyCount += 1;
        if (rec.planId === 'pro_semester') proSemesterCount += 1;
      }

      totalRevenueInr += rec.amount || planDef.priceInr || 0;

      subscribers.push({
        userId,
        email,
        name,
        avatarUrl,
        college,
        planId: rec.planId,
        planName: planDef.name,
        priceInr: planDef.priceInr,
        activatedAt: rec.activatedAt,
        expiresAt: rec.expiresAt,
        daysRemaining,
        isActive,
        source: rec.source || 'upi',
        utrNumber: rec.utrNumber,
        paymentId: rec.paymentId,
        orderId: rec.orderId,
      });
    }

    // Sort active first, then by activation date descending
    subscribers.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(b.activatedAt).getTime() - new Date(a.activatedAt).getTime();
    });

    // Provide registered users list for the Add / Grant Subscription dropdown
    const registeredUsers = authUsers.map((u) => {
      const p = profilesMap.get(u.id);
      return {
        id: u.id,
        email: u.email || 'N/A',
        name: p?.display_name || u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
        college: p?.college || null,
        currentPlan: allPlans[u.id]?.planId || 'free',
      };
    });

    const razorpay = await getRazorpaySettings();

    return NextResponse.json({
      success: true,
      subscribers,
      stats: {
        totalActivePaid,
        hackathonPassCount,
        proMonthlyCount,
        proSemesterCount,
        totalRevenueInr,
        totalRegisteredUsers: authUsers.length,
      },
      registeredUsers,
      plans: Object.values(KA_PLANS),
      razorpay: {
        enabled: razorpay.enabled,
        keyId: razorpay.keyId,
        hasKeySecret: Boolean(razorpay.keySecret),
        isTestMode: razorpay.isTestMode,
        lastUpdated: razorpay.lastUpdated,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { action, targetUserId, planId, customDays, notes, razorpayConfig } = body;

    if (action === 'grant_plan') {
      if (!targetUserId || !planId || !KA_PLANS[planId as KaPlanId]) {
        return NextResponse.json({ error: 'Please provide valid user ID and plan.' }, { status: 400 });
      }

      const rec = await activateUserPlan(targetUserId, planId as KaPlanId, {
        source: 'admin',
        customDays: customDays ? Number(customDays) : undefined,
        utrNumber: notes ? `ADMIN: ${notes}` : 'ADMIN_GRANT',
      });

      return NextResponse.json({
        success: true,
        message: `Plan ${KA_PLANS[planId as KaPlanId].name} granted to user!`,
        record: rec,
      });
    }

    if (action === 'revoke_plan') {
      if (!targetUserId) {
        return NextResponse.json({ error: 'Please provide valid user ID.' }, { status: 400 });
      }

      const rec = await revokeUserPlan(targetUserId);
      return NextResponse.json({
        success: true,
        message: 'Subscription revoked. User reverted to Free tier.',
        record: rec,
      });
    }

    if (action === 'extend_plan') {
      if (!targetUserId) {
        return NextResponse.json({ error: 'Please provide valid user ID.' }, { status: 400 });
      }
      const days = Number(customDays) || 7;
      const rec = await extendUserPlan(targetUserId, days);
      return NextResponse.json({
        success: true,
        message: `Plan extended by ${days} days!`,
        record: rec,
      });
    }

    if (action === 'save_razorpay') {
      if (!razorpayConfig) {
        return NextResponse.json({ error: 'Missing Razorpay configuration payload.' }, { status: 400 });
      }

      const updated = await saveRazorpaySettings({
        enabled: Boolean(razorpayConfig.enabled),
        keyId: String(razorpayConfig.keyId || '').trim(),
        keySecret: razorpayConfig.keySecret !== undefined ? String(razorpayConfig.keySecret).trim() : undefined,
      });

      return NextResponse.json({
        success: true,
        message: 'Razorpay configuration updated successfully!',
        settings: {
          enabled: updated.enabled,
          keyId: updated.keyId,
          hasKeySecret: Boolean(updated.keySecret),
          isTestMode: updated.isTestMode,
          lastUpdated: updated.lastUpdated,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown admin subscription action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Subscription operation failed.' }, { status: 500 });
  }
}
