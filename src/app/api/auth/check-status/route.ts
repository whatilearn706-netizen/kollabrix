import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ success: true, isSuspended: false }, { headers: NO_CACHE_HEADERS });
    }

    // Owner protection
    if (
      userId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
      userId === '9343b52f-f7e8-4ed8-a8a1-476829811b53'
    ) {
      return NextResponse.json({ success: true, isSuspended: false }, { headers: NO_CACHE_HEADERS });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, isSuspended: false }, { headers: NO_CACHE_HEADERS });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    let isSuspended = false;
    let reason = 'Your account has been suspended by administration. Access has been revoked.';

    // 1. Check profiles table with admin privileges
    try {
      const { data: prof } = await adminClient
        .from('profiles')
        .select('is_suspended, status, suspension_reason')
        .eq('user_id', userId)
        .maybeSingle();

      if (prof && (prof.is_suspended === true || prof.status === 'suspended')) {
        isSuspended = true;
        if (prof.suspension_reason) reason = prof.suspension_reason;
      }
    } catch (e) {}

    // 2. Check platform_settings suspended list
    if (!isSuspended) {
      try {
        const { data: setting } = await adminClient
          .from('platform_settings')
          .select('value')
          .eq('key', 'match_scoring_config')
          .maybeSingle();

        if (setting?.value) {
          const suspendedIds = setting.value.suspended_user_ids;
          if (Array.isArray(suspendedIds) && suspendedIds.includes(userId)) {
            isSuspended = true;
            const userMeta = setting.value.suspended_users?.[userId];
            if (userMeta?.reason) reason = userMeta.reason;
          }
        }
      } catch (e) {}
    }

    // 3. Check Supabase Auth user ban status if service key available
    if (!isSuspended && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: authUser } = await adminClient.auth.admin.getUserById(userId);
        if (authUser?.user?.banned_until) {
          const bannedUntil = new Date(authUser.user.banned_until).getTime();
          if (bannedUntil > Date.now()) {
            isSuspended = true;
            reason = 'This account has been banned by platform administration.';
          }
        }
      } catch (e) {}
    }

    return NextResponse.json(
      {
        success: true,
        isSuspended,
        reason: isSuspended ? reason : null,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: true, isSuspended: false },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
