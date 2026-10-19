import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CampusDeadlineItem, DEFAULT_CAMPUS_DEADLINES } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const DEADLINES_KEY = 'linkora_deadlines_v1';

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

// GET: Public fetch of collegiate deadlines
export async function GET() {
  try {
    const client = getSupabaseClient();
    let deadlines: CampusDeadlineItem[] = [...DEFAULT_CAMPUS_DEADLINES];

    if (client) {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', DEADLINES_KEY)
        .maybeSingle();

      if (Array.isArray(data?.value) && data.value.length > 0) {
        deadlines = data.value;
      }
    }

    // Sort by deadline date ascending (earliest expiring first)
    deadlines.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    return NextResponse.json({
      success: true,
      deadlines,
      totalDeadlines: deadlines.length,
      urgentCount: deadlines.filter(
        (d) => new Date(d.deadlineDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
      ).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { deadlines: DEFAULT_CAMPUS_DEADLINES, error: err.message },
      { status: 200 }
    );
  }
}

// POST: Admin adds a new deadline
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { title, organizer, type, deadlineDate, category, description, link, prize, urgency, tags } = body;

    if (!title || !deadlineDate) {
      return NextResponse.json({ error: 'Title and deadline date are required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', DEADLINES_KEY)
      .maybeSingle();

    let currentList: CampusDeadlineItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_CAMPUS_DEADLINES];

    const newDeadline: CampusDeadlineItem = {
      id: `dl-${Date.now()}`,
      title: title.trim(),
      organizer: (organizer || 'Linkora Campus').trim(),
      type: type || 'hackathon',
      deadlineDate: new Date(deadlineDate).toISOString(),
      category: category || 'Campus Opportunity',
      description: (description || '').trim(),
      link: link || '/hackathons',
      prize: prize || undefined,
      urgency: urgency || 'upcoming',
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
    };

    currentList.push(newDeadline);
    currentList.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    await client.from('platform_settings').upsert({
      key: DEADLINES_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Deadline added successfully',
      deadline: newDeadline,
      deadlines: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add deadline' }, { status: 500 });
  }
}

// PATCH: Admin updates a deadline
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Deadline ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', DEADLINES_KEY)
      .maybeSingle();

    let currentList: CampusDeadlineItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_CAMPUS_DEADLINES];

    const idx = currentList.findIndex((d) => d.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
    }

    currentList[idx] = { ...currentList[idx], ...updates };
    currentList.sort(
      (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
    );

    await client.from('platform_settings').upsert({
      key: DEADLINES_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Deadline updated successfully',
      deadlines: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update deadline' }, { status: 500 });
  }
}

// DELETE: Admin removes a deadline
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
      return NextResponse.json({ error: 'Deadline ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', DEADLINES_KEY)
      .maybeSingle();

    let currentList: CampusDeadlineItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_CAMPUS_DEADLINES];

    currentList = currentList.filter((d) => d.id !== id);

    await client.from('platform_settings').upsert({
      key: DEADLINES_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Deadline removed successfully',
      deadlines: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete deadline' }, { status: 500 });
  }
}
