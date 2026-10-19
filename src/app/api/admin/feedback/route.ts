import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UserFeedbackItem } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

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

// GET: Admin-only retrieval of all feedbacks
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

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
        reviewedCount: feedbacks.filter((f) => f.status === 'reviewed').length,
        resolvedCount: feedbacks.filter((f) => f.status === 'resolved').length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error retrieving feedbacks' }, { status: 500 });
  }
}

// PATCH: Admin updates feedback status or admin note
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { id, status, adminNote } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing feedback ID' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', FEEDBACK_SETTINGS_KEY)
      .maybeSingle();

    const currentList: UserFeedbackItem[] = Array.isArray(existingRow?.value)
      ? existingRow.value
      : [];

    const itemIndex = currentList.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Feedback item not found' }, { status: 404 });
    }

    const updatedItem = {
      ...currentList[itemIndex],
      ...(status ? { status } : {}),
      ...(adminNote !== undefined ? { adminNote } : {}),
    };

    currentList[itemIndex] = updatedItem;

    await client.from('platform_settings').upsert({
      key: FEEDBACK_SETTINGS_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback: updatedItem,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update feedback item' }, { status: 500 });
  }
}

// DELETE: Admin removes feedback
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database client unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', FEEDBACK_SETTINGS_KEY)
      .maybeSingle();

    const currentList: UserFeedbackItem[] = Array.isArray(existingRow?.value)
      ? existingRow.value
      : [];

    const updatedList = currentList.filter((item) => item.id !== id);

    await client.from('platform_settings').upsert({
      key: FEEDBACK_SETTINGS_KEY,
      value: updatedList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete feedback item' }, { status: 500 });
  }
}
