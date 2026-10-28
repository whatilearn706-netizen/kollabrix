import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UserFeedbackItem } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

/** Strip HTML/script tags from user input to prevent stored XSS */
function sanitize(str: string | undefined, maxLen = 500): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[<>"'`]/g, '') // strip remaining dangerous chars
    .trim()
    .slice(0, maxLen);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const FEEDBACK_SETTINGS_KEY = 'linkora_feedbacks_v1';

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// POST: Public submission of student & user feedback
export async function POST(request: NextRequest) {
  try {
    // ── Rate limit: max 3 feedback submissions per IP per hour ──
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`feedback:${ip}`, 3, 60 * 60 * 1000, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      const waitMins = Math.ceil((rateCheck.retryAfterMs ?? 3600000) / 60000);
      return NextResponse.json(
        { error: `Too many feedback submissions. Please wait ${waitMins} minute(s) before trying again.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateCheck.retryAfterMs ?? 3600000) / 1000)) } }
      );
    }

    const body = await request.json();
    const { name, email, campus, role, category, rating, message } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please enter a valid feedback message (at least 3 characters).' },
        { status: 400 }
      );
    }

    // ── Enforce message length cap (prevent storage exhaustion) ──
    if (message.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Feedback message must be under 2000 characters.' },
        { status: 400 }
      );
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const validCategory = [
      'bug',
      'feature',
      'ui_ux',
      'faculty',
      'icpc',
      'general',
    ].includes(category)
      ? category
      : 'general';
    const validRole = [
      'student',
      'faculty',
      'organizer',
      'visitor',
      'other',
    ].includes(role)
      ? role
      : 'student';

    const newFeedback: UserFeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: sanitize(name || 'Anonymous Student', 100),
      email: sanitize(email || 'student@linkora.in', 200),
      campus: sanitize(campus, 150),
      role: validRole as UserFeedbackItem['role'],
      category: validCategory as UserFeedbackItem['category'],
      rating: numericRating,
      message: sanitize(message, 2000),
      createdAt: new Date().toISOString(),
      status: 'new',
    };

    const client = getSupabaseClient();
    if (client) {
      try {
        let currentList: UserFeedbackItem[] = [];

        // 1. Fetch current feedbacks from site_master_control_config
        const { data: masterRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'site_master_control_config')
          .maybeSingle();

        if (Array.isArray(masterRow?.value?.feedbacks)) {
          currentList = masterRow.value.feedbacks;
        }

        // 2. Also check dedicated row
        const { data: dedicatedRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', FEEDBACK_SETTINGS_KEY)
          .maybeSingle();

        if (Array.isArray(dedicatedRow?.value)) {
          const map = new Map<string, UserFeedbackItem>();
          for (const item of [...currentList, ...dedicatedRow.value]) {
            if (item && item.id) map.set(item.id, item);
          }
          currentList = Array.from(map.values());
        }

        // Prepend newest feedback
        const updatedList = [newFeedback, ...currentList.filter(f => f.id !== newFeedback.id)].slice(0, 500);

        // 3. Persist directly into site_master_control_config (RLS guaranteed)
        if (masterRow) {
          const curVal = masterRow.value || {};
          const { error: masterErr } = await client
            .from('platform_settings')
            .update({
              value: { ...curVal, feedbacks: updatedList },
              updated_at: new Date().toISOString(),
            })
            .eq('key', 'site_master_control_config');

          if (masterErr) {
            console.warn('Feedback save warning in site_master_control_config:', masterErr);
          }
        }

        // 4. Also persist to dedicated row
        await client.from('platform_settings').upsert({
          key: FEEDBACK_SETTINGS_KEY,
          value: updatedList,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Feedback persist exception:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been sent to the Kollabrix Admin desk.',
      feedback: newFeedback,
    });
  } catch (err: any) {
    console.error('Error in feedback submission:', err);
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}

// GET: Public summary stats OR full list if Admin
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    let feedbacks: UserFeedbackItem[] = [];

    if (client) {
      try {
        const { data: masterRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'site_master_control_config')
          .maybeSingle();

        if (Array.isArray(masterRow?.value?.feedbacks)) {
          feedbacks = masterRow.value.feedbacks;
        }

        const { data: dedicatedRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', FEEDBACK_SETTINGS_KEY)
          .maybeSingle();

        if (Array.isArray(dedicatedRow?.value)) {
          const map = new Map<string, UserFeedbackItem>();
          for (const item of [...feedbacks, ...dedicatedRow.value]) {
            if (item && item.id) map.set(item.id, item);
          }
          feedbacks = Array.from(map.values());
        }

        feedbacks.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } catch (e) {
        console.warn('Failed reading feedbacks:', e);
      }
    }

    // Check if caller is admin
    const auth = await verifyAdminSession(request);
    if (auth.authorized) {
      return NextResponse.json({
        feedbacks,
        stats: {
          total: feedbacks.length,
          avgRating:
            feedbacks.length > 0
              ? Number(
                  (
                    feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) /
                    feedbacks.length
                  ).toFixed(1)
                )
              : 5.0,
          newCount: feedbacks.filter((f) => f.status === 'new').length,
          resolvedCount: feedbacks.filter((f) => f.status === 'resolved').length,
        },
      });
    }

    // Public sanitized summary
    return NextResponse.json({
      totalCount: feedbacks.length,
      avgRating:
        feedbacks.length > 0
          ? Number(
              (
                feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0) /
                feedbacks.length
              ).toFixed(1)
            )
          : 5.0,
      recentCount: feedbacks.filter(
        (f) =>
          new Date(f.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve feedback.' }, { status: 500 });
  }
}
