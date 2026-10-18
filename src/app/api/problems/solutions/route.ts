import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { ProblemSolution } from '@/types/database';

export const runtime = 'nodejs';

/**
 * GET /api/problems/solutions
 * Query problem answers / solutions with optional filters:
 * - problem_id: filter by specific problem statement
 * - author_id: filter by student submitter
 * - viewer_id: student privacy protection (students only see their own answer; faculty sees all)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problem_id');
    const authorId = searchParams.get('author_id');
    const viewerId = searchParams.get('viewer_id');

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, solutions: [] });
    }

    const { data: settingRow } = await defaultClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'problem_solutions_registry')
      .maybeSingle();

    let solutions: ProblemSolution[] = [];
    if (settingRow?.value) {
      if (Array.isArray(settingRow.value)) {
        solutions = settingRow.value;
      } else if (typeof settingRow.value === 'string') {
        try {
          const parsed = JSON.parse(settingRow.value);
          if (Array.isArray(parsed)) solutions = parsed;
        } catch {}
      }
    }

    if (problemId) {
      solutions = solutions.filter(
        (s) => (s.problem_id || '').toLowerCase() === problemId.toLowerCase()
      );
    }

    if (authorId) {
      solutions = solutions.filter(
        (s) => (s.author_id || '').toLowerCase() === authorId.toLowerCase()
      );
    }

    // Student privacy / Answer isolation:
    // If viewer_id is passed, check if viewer is the faculty author of this problem.
    // If NOT the faculty author, the student can ONLY see their own team's submission.
    if (viewerId && problemId) {
      let isFacultyViewer = false;
      try {
        const { data: pData } = await defaultClient
          .from('problem_statements')
          .select('author_id')
          .eq('id', problemId)
          .maybeSingle();

        if (pData?.author_id && pData.author_id.toLowerCase() === viewerId.toLowerCase()) {
          isFacultyViewer = true;
        }
      } catch {}

      if (!isFacultyViewer) {
        // Enforce student privacy
        solutions = solutions.filter(
          (s) => (s.author_id || '').toLowerCase() === viewerId.toLowerCase()
        );
      }
    }

    // Robust, crash-proof author profile enrichment in batches
    const authorIds = Array.from(new Set(solutions.map((s) => s.author_id).filter(Boolean)));
    if (authorIds.length > 0) {
      try {
        const profMap = new Map();
        for (let i = 0; i < authorIds.length; i += 40) {
          const chunk = authorIds.slice(i, i + 40);
          const { data: profs } = await defaultClient
            .from('profiles')
            .select('user_id, display_name, username, avatar_url, college, course')
            .in('user_id', chunk);

          if (profs && Array.isArray(profs)) {
            profs.forEach((p) => profMap.set(p.user_id, p));
          }
        }

        solutions = solutions.map((s) => ({
          ...s,
          author: profMap.get(s.author_id) || s.author,
        }));
      } catch (profErr) {
        console.warn('Profile enrichment notice:', profErr);
      }
    }

    // Sort newest first
    solutions.sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    return NextResponse.json({
      success: true,
      solutions,
      count: solutions.length,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error fetching problem solutions.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/problems/solutions
 * Post a problem answer / project solution to a faculty problem statement.
 * Crash-proofed against high concurrent submissions and large payloads.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const client = token
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        })
      : defaultClient;

    const body = await request.json();
    const {
      problem_id,
      problem_title,
      project_id,
      team_name,
      title,
      solution_writeup,
      repo_url,
      demo_url,
      video_url,
      team_members = [],
      author_id,
    } = body;

    if (!problem_id) {
      return NextResponse.json(
        { error: 'Problem statement ID is required.' },
        { status: 400 }
      );
    }

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { error: 'Please enter a title for your solution / project deliverable.' },
        { status: 400 }
      );
    }

    if (!solution_writeup || String(solution_writeup).trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide a detailed write-up (at least 20 characters) explaining your solution.' },
        { status: 400 }
      );
    }

    // Identify user
    let user = null;
    if (token) {
      try {
        const { data: userData } = await client.auth.getUser(token);
        user = userData?.user;
      } catch {}
    }

    const resolvedAuthorId = user?.id || author_id;
    if (!resolvedAuthorId) {
      return NextResponse.json(
        { error: 'You must be signed in to submit a solution.' },
        { status: 401 }
      );
    }

    // Fetch author profile
    let authorProfile: any = null;
    try {
      const { data: prof } = await client
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, college, course')
        .eq('user_id', resolvedAuthorId)
        .maybeSingle();
      authorProfile = prof;
    } catch (e) {
      console.warn('Profile fetch notice:', e);
    }

    // Sanitize and bound payload sizes to prevent database column overflow
    const newSolution: ProblemSolution = {
      id: `sol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      problem_id: String(problem_id).trim(),
      problem_title: String(problem_title || 'Faculty Challenge').slice(0, 200),
      project_id: project_id ? String(project_id).trim() : null,
      author_id: resolvedAuthorId,
      author: authorProfile,
      team_name: String(team_name || authorProfile?.display_name || 'Engineering Squad').trim().slice(0, 120),
      team_members: Array.isArray(team_members) ? team_members.slice(0, 20) : [],
      title: String(title).trim().slice(0, 200),
      solution_writeup: String(solution_writeup).trim().slice(0, 50000),
      repo_url: repo_url ? String(repo_url).trim().slice(0, 1000) : null,
      demo_url: demo_url ? String(demo_url).trim().slice(0, 1000) : null,
      video_url: video_url ? String(video_url).trim().slice(0, 1000) : null,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        solution: newSolution,
        message: 'Solution posted successfully (Demo Mode).',
      });
    }

    // Read cloud platform_settings registry safely
    const { data: settingRow } = await defaultClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'problem_solutions_registry')
      .maybeSingle();

    let registry: ProblemSolution[] = [];
    if (settingRow?.value) {
      if (Array.isArray(settingRow.value)) {
        registry = settingRow.value;
      } else if (typeof settingRow.value === 'string') {
        try {
          const parsed = JSON.parse(settingRow.value);
          if (Array.isArray(parsed)) registry = parsed;
        } catch {}
      }
    }

    // Deduplicate: If same author already submitted for this problem, update in place
    const existingIdx = registry.findIndex(
      (s) => s.problem_id === problem_id && s.author_id === resolvedAuthorId
    );

    if (existingIdx >= 0) {
      registry[existingIdx] = {
        ...registry[existingIdx],
        ...newSolution,
        id: registry[existingIdx].id,
        created_at: registry[existingIdx].created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      registry.unshift(newSolution);
    }

    // Cap registry to latest 1,000 entries to prevent memory exhaustion
    if (registry.length > 1000) {
      registry = registry.slice(0, 1000);
    }

    const { error: saveErr } = await defaultClient
      .from('platform_settings')
      .upsert(
        {
          key: 'problem_solutions_registry',
          value: registry,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (saveErr) {
      throw new Error(`Failed to save solution to cloud registry: ${saveErr.message}`);
    }

    return NextResponse.json({
      success: true,
      solution: newSolution,
      message: 'Solution answer applied successfully! The faculty mentor will review your deliverables.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error posting problem answer.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/problems/solutions
 * Faculty evaluation: update status (accepted / revision_requested), add mentor feedback and grade.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { solution_id, status, mentor_feedback, grade } = body;

    if (!solution_id) {
      return NextResponse.json({ error: 'Solution ID is required.' }, { status: 400 });
    }

    if (!status || !['accepted', 'revision_requested', 'under_review'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required: accepted, revision_requested, or under_review.' },
        { status: 400 }
      );
    }

    const { data: settingRow } = await defaultClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'problem_solutions_registry')
      .maybeSingle();

    let registry: ProblemSolution[] = [];
    if (settingRow?.value) {
      if (Array.isArray(settingRow.value)) {
        registry = settingRow.value;
      } else if (typeof settingRow.value === 'string') {
        try {
          const parsed = JSON.parse(settingRow.value);
          if (Array.isArray(parsed)) registry = parsed;
        } catch {}
      }
    }

    const targetIdx = registry.findIndex((s) => s.id === solution_id);
    if (targetIdx < 0) {
      return NextResponse.json({ error: 'Solution not found.' }, { status: 404 });
    }

    registry[targetIdx] = {
      ...registry[targetIdx],
      status,
      mentor_feedback: mentor_feedback !== undefined ? String(mentor_feedback).slice(0, 20000) : registry[targetIdx].mentor_feedback,
      grade: grade !== undefined ? grade : registry[targetIdx].grade,
      updated_at: new Date().toISOString(),
    };

    const { error: saveErr } = await defaultClient
      .from('platform_settings')
      .upsert(
        {
          key: 'problem_solutions_registry',
          value: registry,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (saveErr) {
      throw new Error(`Failed to update solution: ${saveErr.message}`);
    }

    return NextResponse.json({
      success: true,
      solution: registry[targetIdx],
      message: `Solution marked as ${status}.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error evaluating solution.' },
      { status: 500 }
    );
  }
}
