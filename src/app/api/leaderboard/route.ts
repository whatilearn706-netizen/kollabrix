import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { CollegeLeaderboardItem, DEFAULT_LEADERBOARD_COLLEGES } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const LEADERBOARD_KEY = 'linkora_leaderboard_v1';

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

// GET: Public fetch of collegiate leaderboard
export async function GET() {
  try {
    const client = getSupabaseClient();
    let colleges: CollegeLeaderboardItem[] = [...DEFAULT_LEADERBOARD_COLLEGES];

    if (client) {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', LEADERBOARD_KEY)
        .maybeSingle();

      if (Array.isArray(data?.value) && data.value.length > 0) {
        colleges = data.value;
      }
    }

    // Sort by points descending and ensure rank is sequentially 1, 2, 3...
    colleges.sort((a, b) => (b.points || 0) - (a.points || 0));
    colleges = colleges.map((c, idx) => ({ ...c, rank: idx + 1 }));

    return NextResponse.json({
      success: true,
      colleges,
      totalColleges: colleges.length,
      totalActiveBuilders: colleges.reduce((acc, c) => acc + (c.activeBuilders || 0), 0),
      totalProjects: colleges.reduce((acc, c) => acc + (c.projectsCount || 0), 0),
    });
  } catch (err: any) {
    return NextResponse.json(
      { colleges: DEFAULT_LEADERBOARD_COLLEGES, error: err.message },
      { status: 200 }
    );
  }
}

// POST: Admin adds a new college
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { name, shortCode, city, category, projectsCount, hackathonWins, activeBuilders, points, badge, color } = body;

    if (!name || !shortCode) {
      return NextResponse.json({ error: 'College name and shortcode are required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', LEADERBOARD_KEY)
      .maybeSingle();

    let currentList: CollegeLeaderboardItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_LEADERBOARD_COLLEGES];

    const newCollege: CollegeLeaderboardItem = {
      id: `col-${Date.now()}`,
      rank: currentList.length + 1,
      name: name.trim(),
      shortCode: shortCode.trim(),
      city: (city || 'India').trim(),
      category: category || 'state_pvt',
      projectsCount: Number(projectsCount) || 10,
      hackathonWins: Number(hackathonWins) || 2,
      activeBuilders: Number(activeBuilders) || 50,
      points: Number(points) || 1200,
      growth: '+10% this week',
      badge: badge || '⚡ Active Campus Squad',
      color: color || 'from-indigo-500 to-violet-600',
      verified: true,
    };

    currentList.push(newCollege);
    currentList.sort((a, b) => (b.points || 0) - (a.points || 0));
    currentList = currentList.map((c, idx) => ({ ...c, rank: idx + 1 }));

    await client.from('platform_settings').upsert({
      key: LEADERBOARD_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'College added to leaderboard successfully',
      college: newCollege,
      colleges: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add college' }, { status: 500 });
  }
}

// PATCH: Admin updates a college
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'College ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', LEADERBOARD_KEY)
      .maybeSingle();

    let currentList: CollegeLeaderboardItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_LEADERBOARD_COLLEGES];

    const idx = currentList.findIndex((c) => c.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'College not found' }, { status: 404 });
    }

    currentList[idx] = { ...currentList[idx], ...updates };
    currentList.sort((a, b) => (b.points || 0) - (a.points || 0));
    currentList = currentList.map((c, i) => ({ ...c, rank: i + 1 }));

    await client.from('platform_settings').upsert({
      key: LEADERBOARD_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'College updated successfully',
      colleges: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update college' }, { status: 500 });
  }
}

// DELETE: Admin removes a college
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
      return NextResponse.json({ error: 'College ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', LEADERBOARD_KEY)
      .maybeSingle();

    let currentList: CollegeLeaderboardItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_LEADERBOARD_COLLEGES];

    currentList = currentList.filter((c) => c.id !== id);
    currentList = currentList.map((c, i) => ({ ...c, rank: i + 1 }));

    await client.from('platform_settings').upsert({
      key: LEADERBOARD_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'College removed successfully',
      colleges: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to remove college' }, { status: 500 });
  }
}
