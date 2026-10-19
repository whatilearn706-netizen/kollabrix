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
      // 1. Fetch current feedbacks list
      const { data: existingRow } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', FEEDBACK_SETTINGS_KEY)
        .maybeSingle();

      const currentList: UserFeedbackItem[] = Array.isArray(existingRow?.value)
        ? existingRow.value
        : [];

      // Prepend newest feedback
      const updatedList = [newFeedback, ...currentList].slice(0, 500); // keep up to 500 records

      // 2. Persist to platform_settings
      const { error: upsertErr } = await client.from('platform_settings').upsert({
        key: FEEDBACK_SETTINGS_KEY,
        value: updatedList,
        updated_at: new Date().toISOString(),
      });

      if (upsertErr) {
        console.warn('Feedback save warning in platform_settings:', upsertErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your feedback has been sent to the Linkora Admin desk.',
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
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', FEEDBACK_SETTINGS_KEY)
        .maybeSingle();

      if (Array.isArray(data?.value)) {
        feedbacks = data.value;
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
