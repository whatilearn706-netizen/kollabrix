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

async function loadAllFeedbacks(client: any): Promise<UserFeedbackItem[]> {
  let list: UserFeedbackItem[] = [];
  try {
    const { data: masterRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'site_master_control_config')
      .maybeSingle();

    if (Array.isArray(masterRow?.value?.feedbacks)) {
      list = masterRow.value.feedbacks;
    }

    const { data: dedicatedRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', FEEDBACK_SETTINGS_KEY)
      .maybeSingle();

    if (Array.isArray(dedicatedRow?.value)) {
      const map = new Map<string, UserFeedbackItem>();
      for (const item of [...list, ...dedicatedRow.value]) {
        if (item && item.id) map.set(item.id, item);
      }
      list = Array.from(map.values());
    }

    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.warn('Error loading feedbacks:', err);
  }
  return list;
}

async function saveAllFeedbacks(client: any, list: UserFeedbackItem[]) {
  try {
    const { data: masterRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'site_master_control_config')
      .maybeSingle();

    if (masterRow) {
      const curVal = masterRow.value || {};
      await client
        .from('platform_settings')
        .update({
          value: { ...curVal, feedbacks: list },
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'site_master_control_config');
    }

    await client.from('platform_settings').upsert({
      key: FEEDBACK_SETTINGS_KEY,
      value: list,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error saving feedbacks:', err);
  }
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
      feedbacks = await loadAllFeedbacks(client);
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

    const currentList = await loadAllFeedbacks(client);

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

    await saveAllFeedbacks(client, currentList);

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

    const currentList = await loadAllFeedbacks(client);
    const updatedList = currentList.filter((item) => item.id !== id);

    await saveAllFeedbacks(client, updatedList);

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete feedback item' }, { status: 500 });
  }
}
