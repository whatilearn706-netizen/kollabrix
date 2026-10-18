import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

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

    const { data: settingRow } = await defaultClient
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

    const { data: settingRow } = await defaultClient
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

    const { error: upsertErr } = await defaultClient
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
