import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { ProblemSolution } from '@/types/database';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

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

    // ── Student privacy / Answer isolation ──
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    let authUserId: string | null = null;
    let isFacultyOrAdmin = false;

    if (token) {
      try {
        const { data: authData } = await defaultClient.auth.getUser(token);
        authUserId = authData?.user?.id || null;
      } catch {}
    }

    if (!authUserId) {
      authUserId =
        request.cookies.get('linkora_user_id')?.value ||
        request.headers.get('x-user-id') ||
        searchParams.get('viewer_id') ||
        null;
    }

    if (authUserId) {
      if (
        authUserId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
        authUserId === '9343b52f-f7e8-4ed8-a8a1-476829811b53'
      ) {
        isFacultyOrAdmin = true;
      } else {
        try {
          const { data: prof } = await defaultClient
            .from('profiles')
            .select('role')
            .eq('user_id', authUserId)
            .maybeSingle();
          if (prof?.role === 'admin' || prof?.role === 'teacher') {
            isFacultyOrAdmin = true;
          }
        } catch {}

        // Also check if authUserId is the author of this problem statement
        if (!isFacultyOrAdmin && problemId) {
          try {
            const { data: ps } = await defaultClient
              .from('problem_statements')
              .select('author_id')
              .eq('id', problemId)
              .maybeSingle();
            if (ps && ps.author_id && ps.author_id.toLowerCase() === authUserId.toLowerCase()) {
              isFacultyOrAdmin = true;
            }
          } catch {}
        }
      }
    }

    if (!isFacultyOrAdmin) {
      // Normal students can ONLY see their own team's submissions
      if (!authUserId) {
        return NextResponse.json({ success: true, solutions: [] });
      }
      solutions = solutions.filter(
        (s) => (s.author_id || '').toLowerCase() === authUserId.toLowerCase()
      );
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
    const ip = getClientIp(request);
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
      publish_to_explore = false,
    } = body;

    // User-ID rate limiting allows 1000+ students on campus Wi-Fi without false 429 blocks
    const rateLimit = checkUserOrCampusRateLimit(
      author_id,
      ip,
      15, // 15 submissions per minute per student
      60 * 1000,
      3000, // Campus NAT ceiling
      60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Submission rate limit reached. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
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

    if (!problem_id) {
      return NextResponse.json(
        { error: 'Problem statement ID is required.' },
        { status: 400 }
      );
    }

    if (!team_name || !String(team_name).trim()) {
      return NextResponse.json(
        { error: 'A registered student team name is required. You must form or join a squad before submitting an answer.' },
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

    // Handle Explore publishing preference: Yes (Permanent Project on Explore) vs No (Private to Faculty & Workspace)
    try {
      const admin = getAdminClient();
      let targetProjectId = project_id;

      if (!targetProjectId) {
        const { data: userProj } = await admin
          .from('projects')
          .select('id')
          .eq('owner_id', resolvedAuthorId)
          .eq('problem_statement_id', problem_id)
          .maybeSingle();
        if (userProj) targetProjectId = userProj.id;
      }

      // Fetch challenge category & skills context
      let probCategory = 'Web Development';
      let probDifficulty = 'Intermediate';
      let probSkills = ['Full Stack', 'Software Engineering'];
      let probTech = ['React', 'Next.js', 'TypeScript'];
      let actualTeamSize = 1;

      try {
        const { data: probRow } = await admin
          .from('problem_statements')
          .select('category, difficulty, required_skills')
          .eq('id', problem_id)
          .maybeSingle();

        if (probRow) {
          if (probRow.category) probCategory = probRow.category;
          if (probRow.difficulty) probDifficulty = probRow.difficulty;
          if (Array.isArray(probRow.required_skills) && probRow.required_skills.length > 0) {
            probSkills = probRow.required_skills;
            probTech = probRow.required_skills;
          }
        }
      } catch {}

      try {
        const { data: regRow } = await admin
          .from('platform_settings')
          .select('value')
          .eq('key', 'problem_teams_registry')
          .maybeSingle();

        if (Array.isArray(regRow?.value)) {
          const foundTeam = regRow.value.find((t: any) => t && (t.id === targetProjectId || t.title === team_name));
          if (foundTeam) {
            if (foundTeam.category) probCategory = foundTeam.category;
            if (foundTeam.difficulty) probDifficulty = foundTeam.difficulty;
            if (Array.isArray(foundTeam.technologies) && foundTeam.technologies.length > 0) {
              probTech = foundTeam.technologies;
            }
            if (Array.isArray(foundTeam.required_skills) && foundTeam.required_skills.length > 0) {
              probSkills = foundTeam.required_skills;
            }
            if (foundTeam.current_team_size) actualTeamSize = foundTeam.current_team_size;
          }
        }
      } catch {}

      const cleanSummary =
        String(solution_writeup)
          .replace(/^#+\s+/gm, '')
          .replace(/\n+/g, ' ')
          .trim()
          .slice(0, 240) ||
        `Collegiate solution for faculty challenge: ${problem_title}`;

      if (publish_to_explore && resolvedAuthorId) {
        // --- YES: Export as a permanent Completed Project on Explore ---
        const projectUpdate = {
          title: String(title).trim(),
          summary: cleanSummary,
          description: String(solution_writeup).trim(),
          category: probCategory,
          difficulty: probDifficulty,
          technologies: probTech,
          required_skills: probSkills,
          repository_url: repo_url ? String(repo_url).trim() : null,
          demo_url: demo_url ? String(demo_url).trim() : null,
          documentation_url: video_url ? String(video_url).trim() : null,
          status: 'Completed' as const,
          problem_statement_id: null, // Cleared so it is featured in the general Explore Projects feed!
          current_team_size: Math.max(actualTeamSize, Array.isArray(team_members) ? team_members.length : 1),
          updated_at: new Date().toISOString(),
        };

        // Remove from deleted tombstone if previously flagged
        try {
          const { data: delRow } = await admin
            .from('platform_settings')
            .select('value')
            .eq('key', 'deleted_projects')
            .maybeSingle();

          if (delRow?.value) {
            const raw = delRow.value;
            const targetLower = String(title).trim().toLowerCase();
            const idLower = String(targetProjectId).toLowerCase();

            if (
              (Array.isArray(raw.deletedIds) && raw.deletedIds.includes(idLower)) ||
              (Array.isArray(raw.deletedTitles) && raw.deletedTitles.includes(targetLower))
            ) {
              const updatedIds = (raw.deletedIds || []).filter((id: string) => id !== idLower);
              const updatedTitles = (raw.deletedTitles || []).filter((t: string) => t !== targetLower);
              const newDeletedAt = { ...(raw.deletedAt || {}) };
              delete newDeletedAt[idLower];
              delete newDeletedAt[targetLower];

              await admin.from('platform_settings').upsert({
                key: 'deleted_projects',
                value: {
                  deletedAt: newDeletedAt,
                  deletedIds: updatedIds,
                  deletedTitles: updatedTitles,
                },
                updated_at: new Date().toISOString(),
              });
            }
          }
        } catch {}

        if (targetProjectId) {
          const { data: updated } = await admin
            .from('projects')
            .update(projectUpdate)
            .eq('id', targetProjectId)
            .select();

          if (!updated || updated.length === 0) {
            await admin.from('projects').insert({
              id: targetProjectId,
              owner_id: resolvedAuthorId,
              desired_roles: ['Full Stack Developer'],
              desired_team_size: Math.max(4, actualTeamSize),
              ...projectUpdate,
              created_at: new Date().toISOString(),
            });
          }
        } else {
          await admin.from('projects').insert({
            id: crypto.randomUUID(),
            owner_id: resolvedAuthorId,
            desired_roles: ['Full Stack Developer'],
            desired_team_size: 4,
            ...projectUpdate,
            created_at: new Date().toISOString(),
          });
        }
      } else if (!publish_to_explore && targetProjectId) {
        // --- NO: Keep private to faculty challenge desk and team workspace (NEVER in Explore) ---
        await admin
          .from('projects')
          .update({
            status: 'In Progress',
            problem_statement_id: problem_id, // Preserved so it remains strictly scoped to faculty challenge
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetProjectId);
      }

      // Update status in problem_teams_registry for faculty & squad view
      try {
        const { data: regRow } = await admin
          .from('platform_settings')
          .select('value')
          .eq('key', 'problem_teams_registry')
          .maybeSingle();

        if (Array.isArray(regRow?.value)) {
          const updatedReg = regRow.value.map((t: any) => {
            if (t.id === targetProjectId || (t.owner_id === resolvedAuthorId && t.problem_statement_id === problem_id)) {
              return {
                ...t,
                status: 'Completed',
                demo_url: demo_url ? String(demo_url).trim() : t.demo_url,
                repository_url: repo_url ? String(repo_url).trim() : t.repository_url,
                is_permanent_project: Boolean(publish_to_explore),
              };
            }
            return t;
          });
          await admin.from('platform_settings').upsert({
            key: 'problem_teams_registry',
            value: updatedReg,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {}
    } catch (expErr) {
      console.warn('Notice processing problem solution Explore option:', expErr);
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
    // ── Authentication Check: Only verified faculty or administrators can evaluate solutions ──
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token && isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Authentication required to evaluate student solutions.' }, { status: 401 });
    }

    let authUserId: string | null = null;
    let isAuthorized = false;

    if (token) {
      try {
        const { data: authData } = await defaultClient.auth.getUser(token);
        authUserId = authData?.user?.id || null;
      } catch {}
    }

    if (authUserId) {
      if (
        authUserId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
        authUserId === '9343b52f-f7e8-4ed8-a8a1-476829811b53'
      ) {
        isAuthorized = true;
      } else {
        try {
          const { data: prof } = await defaultClient
            .from('profiles')
            .select('role')
            .eq('user_id', authUserId)
            .maybeSingle();
          if (prof?.role === 'admin' || prof?.role === 'teacher') {
            isAuthorized = true;
          }
        } catch {}
      }
    }

    if (!isAuthorized && isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Forbidden: Only faculty mentors and administrators are authorized to grade solutions.' },
        { status: 403 }
      );
    }

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
