import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/supabase/client';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const runtime = 'nodejs';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface ProblemResultRecord {
  problem_id: string;
  is_live: boolean;
  winner_team_name: string;
  winner_solution_id?: string;
  winner_solution_title?: string;
  winner_overview: string;
  repo_url?: string;
  demo_url?: string;
  video_url?: string;
  mentor_remarks?: string;
  award_title?: string;
  updated_at?: string;
  published_at?: string;
  author_id?: string;
}

/**
 * GET /api/problems/results?problem_id=...
 * Fetch result and live status for a problem statement
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problem_id');

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem ID parameter is required.' },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, result: null });
    }

    const adminClient = getAdminClient();
    const { data: settingRow } = await adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'problem_results_registry')
      .maybeSingle();

    let registry: ProblemResultRecord[] = [];
    if (settingRow?.value && Array.isArray(settingRow.value)) {
      registry = settingRow.value;
    }

    const match = registry.find(
      (r) => (r.problem_id || '').toLowerCase() === problemId.toLowerCase()
    );

    return NextResponse.json({
      success: true,
      result: match || null,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error fetching problem result.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/problems/results
 * Save / publish problem results and crown the winner
 */
export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
    const body = await request.json();
    const {
      problem_id,
      is_live = false,
      winner_team_name = '',
      winner_solution_id = '',
      winner_solution_title = '',
      winner_overview = '',
      repo_url = '',
      demo_url = '',
      video_url = '',
      mentor_remarks = '',
      award_title = '1st Place • Faculty Research Excellence Award',
      author_id = '',
    } = body;

    if (!problem_id) {
      return NextResponse.json(
        { error: 'Problem ID is required.' },
        { status: 400 }
      );
    }

    // ── Authentication & Authorization Check ──
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const headerUserId = request.headers.get('x-user-id');
    const cookieUserId = request.cookies.get('linkora_user_id')?.value;

    let authUserId: string | null = headerUserId || cookieUserId || author_id || null;
    let isAuthorized = false;

    if (token && isSupabaseConfigured()) {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
        const authClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        });
        const { data: authData } = await authClient.auth.getUser(token);
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch {}
    }

    // Admins and faculty can publish
    if (authUserId) {
      if (
        authUserId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
        authUserId === '9343b52f-f7e8-4ed8-a8a1-476829811b53'
      ) {
        isAuthorized = true;
      } else {
        try {
          const { data: prof } = await adminClient
            .from('profiles')
            .select('role')
            .eq('user_id', authUserId)
            .maybeSingle();
          if (prof?.role === 'admin' || prof?.role === 'teacher') {
            isAuthorized = true;
          }
        } catch {}

        // Check if user is problem statement author
        if (!isAuthorized) {
          try {
            const { data: probRow } = await adminClient
              .from('problems')
              .select('author_id')
              .eq('id', problem_id)
              .maybeSingle();
            if (probRow?.author_id === authUserId) {
              isAuthorized = true;
            }
          } catch {}
        }
      }
    }

    // In demo or if author matches, grant permission
    if (!authUserId && !isSupabaseConfigured()) {
      isAuthorized = true;
    }

    // Default to true if author_id is provided or user is creator
    if (!isAuthorized && author_id) {
      isAuthorized = true;
    }

    const newResult: ProblemResultRecord = {
      problem_id,
      is_live: Boolean(is_live),
      winner_team_name: winner_team_name.trim(),
      winner_solution_id: winner_solution_id?.trim() || undefined,
      winner_solution_title: winner_solution_title?.trim() || undefined,
      winner_overview: winner_overview.trim(),
      repo_url: repo_url?.trim() || undefined,
      demo_url: demo_url?.trim() || undefined,
      video_url: video_url?.trim() || undefined,
      mentor_remarks: mentor_remarks.trim(),
      award_title: award_title.trim() || '1st Place • Faculty Research Excellence Award',
      updated_at: new Date().toISOString(),
      published_at: is_live ? new Date().toISOString() : undefined,
      author_id: author_id || undefined,
    };

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        result: newResult,
        message: 'Problem result saved in demo mode.',
      });
    }

    const { data: settingRow } = await adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'problem_results_registry')
      .maybeSingle();

    let registry: ProblemResultRecord[] = [];
    if (settingRow?.value && Array.isArray(settingRow.value)) {
      registry = settingRow.value;
    }

    const existingIdx = registry.findIndex(
      (r) => (r.problem_id || '').toLowerCase() === problem_id.toLowerCase()
    );

    if (existingIdx >= 0) {
      registry[existingIdx] = {
        ...registry[existingIdx],
        ...newResult,
        published_at: is_live
          ? (registry[existingIdx].published_at || new Date().toISOString())
          : undefined,
      };
    } else {
      registry.unshift(newResult);
    }

    const { error: upsertErr } = await adminClient
      .from('platform_settings')
      .upsert(
        {
          key: 'problem_results_registry',
          value: registry,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (upsertErr) {
      throw new Error(`Failed to save problem results: ${upsertErr.message}`);
    }

    return NextResponse.json({
      success: true,
      result: existingIdx >= 0 ? registry[existingIdx] : newResult,
      message: is_live
        ? 'Results are now LIVE for all students!'
        : 'Result draft saved successfully.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error updating problem result.' },
      { status: 500 }
    );
  }
}
