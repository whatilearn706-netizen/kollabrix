import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const serverClient = createServerSupabaseClient();
    const { data: { user } } = await serverClient.auth.getUser();
    if (user?.id) return user.id;
  } catch {
    // Fallback to Authorization bearer token if provided
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const service = getServiceClient();
    if (service && token) {
      try {
        const { data } = await service.auth.getUser(token);
        if (data?.user?.id) return data.user.id;
      } catch {}
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const client = getServiceClient();
    if (!client) {
      return NextResponse.json({
        success: true,
        progress: { streak: 0, lastSolvedDate: null, totalPoints: 0, solvedProblemIds: [] },
      });
    }

    const { data, error } = await client
      .from('icpc_progress')
      .select('streak, last_solved_date, total_points, solved_problem_ids')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching icpc_progress:', error.message);
      return NextResponse.json({
        success: true,
        progress: { streak: 0, lastSolvedDate: null, totalPoints: 0, solvedProblemIds: [] },
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        streak: data?.streak ?? 0,
        lastSolvedDate: data?.last_solved_date ?? null,
        totalPoints: data?.total_points ?? 0,
        solvedProblemIds: Array.isArray(data?.solved_problem_ids) ? data.solved_problem_ids : [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to load progress' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { problemId, points = 0, localMerge } = body;

    const client = getServiceClient();
    if (!client) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const { data: existing } = await client
      .from('icpc_progress')
      .select('streak, last_solved_date, total_points, solved_problem_ids')
      .eq('user_id', userId)
      .maybeSingle();

    const prevSolved = new Set<string>(
      Array.isArray(existing?.solved_problem_ids) ? existing.solved_problem_ids : []
    );

    if (localMerge && Array.isArray(localMerge.solvedProblemIds)) {
      for (const id of localMerge.solvedProblemIds) {
        if (typeof id === 'string' && id) prevSolved.add(id);
      }
    }

    let nextPoints = Math.max(
      existing?.total_points ?? 0,
      typeof localMerge?.totalPoints === 'number' ? localMerge.totalPoints : 0
    );
    let nextStreak = Math.max(
      existing?.streak ?? 0,
      typeof localMerge?.streak === 'number' ? localMerge.streak : 0
    );
    let nextLastDate: string | null = existing?.last_solved_date || localMerge?.lastSolvedDate || null;

    if (problemId && typeof problemId === 'string') {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const alreadySolved = prevSolved.has(problemId);
      if (!alreadySolved) {
        prevSolved.add(problemId);
        nextPoints += Math.max(0, Number(points) || 0);
      }

      if (nextLastDate === yesterday) {
        nextStreak = nextStreak + 1;
      } else if (nextLastDate !== today) {
        nextStreak = Math.max(1, nextStreak);
      }
      nextLastDate = today;
    }

    const solvedList = Array.from(prevSolved);

    const { error: upsertErr } = await client
      .from('icpc_progress')
      .upsert(
        {
          user_id: userId,
          streak: nextStreak,
          last_solved_date: nextLastDate,
          total_points: nextPoints,
          solved_problem_ids: solvedList,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertErr) {
      return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      progress: {
        streak: nextStreak,
        lastSolvedDate: nextLastDate,
        totalPoints: nextPoints,
        solvedProblemIds: solvedList,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save progress' }, { status: 500 });
  }
}
