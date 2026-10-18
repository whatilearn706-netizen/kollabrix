import { NextRequest, NextResponse } from 'next/server';
import { CURATED_ICPC_CONTESTS } from '@/data/mockIcpcContests';
import { IcpcContest } from '@/types/icpc';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// In-memory fallback caches
let memoryContests: IcpcContest[] = [];
let memoryDeletedProblemIds: Set<string> = new Set();
let memoryDeletedContestIds: Set<string> = new Set();
let memoryIsArenaLive: boolean = true;

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  try {
    let dbContests: IcpcContest[] = [];
    let isArenaLive = memoryIsArenaLive;
    let deletedProblemIds = new Set<string>(memoryDeletedProblemIds);
    let deletedContestIds = new Set<string>(memoryDeletedContestIds);

    const client = getSupabaseClient();
    if (client) {
      try {
        // 1. Read platform settings for ICPC
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('key, value')
          .in('key', ['icpc_contests_v1', 'icpc_settings_v1']);

        if (settingRow && Array.isArray(settingRow)) {
          for (const row of settingRow) {
            if (row.key === 'icpc_contests_v1' && Array.isArray(row.value)) {
              dbContests = row.value;
            } else if (row.key === 'icpc_settings_v1' && row.value) {
              if (typeof row.value.isArenaLive === 'boolean') {
                isArenaLive = row.value.isArenaLive;
                memoryIsArenaLive = isArenaLive;
              }
              if (Array.isArray(row.value.deletedProblemIds)) {
                row.value.deletedProblemIds.forEach((id: string) => deletedProblemIds.add(id));
              }
              if (Array.isArray(row.value.deletedContestIds)) {
                row.value.deletedContestIds.forEach((id: string) => deletedContestIds.add(id));
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not read icpc data from platform_settings:', err);
      }
    }

    // Merge: custom teacher contests first, followed by curated contests
    const rawContests = [...dbContests, ...memoryContests, ...CURATED_ICPC_CONTESTS];
    
    // Deduplicate and filter out deleted contests and problems
    const seen = new Set<string>();
    const uniqueContests: IcpcContest[] = [];

    for (const c of rawContests) {
      if (!c || !c.id || seen.has(c.id) || deletedContestIds.has(c.id)) continue;
      seen.add(c.id);

      // Filter out deleted problems
      const activeProblems = Array.isArray(c.problems)
        ? c.problems.filter((p) => p && p.id && !deletedProblemIds.has(p.id))
        : [];

      uniqueContests.push({
        ...c,
        problems: activeProblems,
      });
    }

    return NextResponse.json({
      success: true,
      isArenaLive,
      contests: uniqueContests,
      count: uniqueContests.length,
    });
  } catch (error: any) {
    console.error('Error fetching ICPC contests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load contests', contests: CURATED_ICPC_CONTESTS, isArenaLive: true },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, durationMinutes, problems, rules, visibility, passcode, college } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Contest title is required.' }, { status: 400 });
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({ success: false, error: 'Please add at least one problem to the contest.' }, { status: 400 });
    }

    const newContest: IcpcContest = {
      id: `icpc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle?.trim() || 'Collegiate Programming Challenge • LeetCode Style',
      organizer: body.organizer || 'Verified Faculty Member',
      organizerRole: body.organizerRole || 'Faculty Mentor & Contest Director',
      college: college || 'Partner Collegiate Network',
      startTime: body.startTime || new Date().toISOString(),
      endTime: body.endTime || new Date(Date.now() + (durationMinutes || 180) * 60000).toISOString(),
      durationMinutes: Number(durationMinutes) || 180,
      status: 'live',
      visibility: visibility === 'passcode' ? 'passcode' : 'public',
      passcode: passcode?.trim() || undefined,
      bannerGradient: body.bannerGradient || 'from-cyan-600 via-indigo-600 to-violet-600',
      participantCount: 1,
      scoringType: 'leetcode',
      rules: Array.isArray(rules) && rules.length > 0 ? rules : [
        'Standard LeetCode / ICPC time limits apply.',
        'Submissions evaluated against hidden and sample testcases.',
        'Instant AST analysis for code verification.',
      ],
      problems: problems.map((p: any, idx: number) => ({
        id: `prob-${Date.now()}-${idx + 1}`,
        title: p.title?.trim() || `Problem ${String.fromCharCode(65 + idx)}`,
        difficulty: (p.difficulty === 'Easy' || p.difficulty === 'Hard') ? p.difficulty : 'Medium',
        points: Number(p.points) || (p.difficulty === 'Easy' ? 100 : p.difficulty === 'Hard' ? 500 : 250),
        timeLimit: p.timeLimit || '1.0s',
        memoryLimit: p.memoryLimit || '256MB',
        tags: Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['Algorithms', 'Data Structures'],
        description: p.description?.trim() || 'Solve the given problem efficiently.',
        inputFormat: p.inputFormat?.trim() || 'Standard input format.',
        outputFormat: p.outputFormat?.trim() || 'Standard output format.',
        constraints: p.constraints?.trim() || '1 <= N <= 10^5',
        sampleInput: p.sampleInput?.trim() || '1\n5',
        sampleOutput: p.sampleOutput?.trim() || '5',
        explanation: p.explanation?.trim() || undefined,
      })),
    };

    // Save to memory cache
    memoryContests.unshift(newContest);

    // Save to Supabase if configured
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'icpc_contests_v1')
          .maybeSingle();

        const currentList: IcpcContest[] = Array.isArray(settingRow?.value) ? settingRow.value : [];
        const updatedList = [newContest, ...currentList];

        await client.from('platform_settings').upsert({
          key: 'icpc_contests_v1',
          value: updatedList,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Could not persist contest to platform_settings:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      contest: newContest,
      message: 'ICPC contest uploaded and published successfully!',
    });
  } catch (error: any) {
    console.error('Error creating ICPC contest:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload contest' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a problem from a contest or remove an entire contest
export async function DELETE(request: NextRequest) {
  try {
    let contestId: string | null = null;
    let problemId: string | null = null;

    const url = new URL(request.url);
    contestId = url.searchParams.get('contestId');
    problemId = url.searchParams.get('problemId');

    if (!contestId && !problemId) {
      try {
        const body = await request.json();
        contestId = body.contestId;
        problemId = body.problemId;
      } catch (e) {}
    }

    if (!contestId && !problemId) {
      return NextResponse.json({ success: false, error: 'Must provide contestId or problemId' }, { status: 400 });
    }

    if (problemId) {
      memoryDeletedProblemIds.add(problemId);
    }
    if (contestId && !problemId) {
      memoryDeletedContestIds.add(contestId);
    }

    // Persist to Supabase
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'icpc_settings_v1')
          .maybeSingle();

        const currentSettings = settingRow?.value || {};
        const deletedProblems: string[] = Array.isArray(currentSettings.deletedProblemIds)
          ? [...currentSettings.deletedProblemIds]
          : [];
        const deletedContests: string[] = Array.isArray(currentSettings.deletedContestIds)
          ? [...currentSettings.deletedContestIds]
          : [];

        if (problemId && !deletedProblems.includes(problemId)) {
          deletedProblems.push(problemId);
        }
        if (contestId && !problemId && !deletedContests.includes(contestId)) {
          deletedContests.push(contestId);
        }

        await client.from('platform_settings').upsert({
          key: 'icpc_settings_v1',
          value: {
            ...currentSettings,
            isArenaLive: typeof currentSettings.isArenaLive === 'boolean' ? currentSettings.isArenaLive : true,
            deletedProblemIds: deletedProblems,
            deletedContestIds: deletedContests,
          },
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Could not persist deleted problem/contest to Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: problemId ? `Problem ${problemId} removed from arena successfully!` : `Contest ${contestId} removed!`,
      problemId,
      contestId,
    });
  } catch (error: any) {
    console.error('Error removing problem/contest:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to remove' }, { status: 500 });
  }
}

// PATCH: Toggle ICPC Arena Live / Offline or update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { isArenaLive } = body;

    if (typeof isArenaLive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isArenaLive boolean required' }, { status: 400 });
    }

    memoryIsArenaLive = isArenaLive;

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'icpc_settings_v1')
          .maybeSingle();

        const currentSettings = settingRow?.value || {};
        await client.from('platform_settings').upsert({
          key: 'icpc_settings_v1',
          value: {
            ...currentSettings,
            isArenaLive,
            deletedProblemIds: currentSettings.deletedProblemIds || Array.from(memoryDeletedProblemIds),
            deletedContestIds: currentSettings.deletedContestIds || Array.from(memoryDeletedContestIds),
          },
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Could not persist arena live toggle to Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      isArenaLive,
      message: isArenaLive ? 'ICPC Collegiate Arena is now LIVE!' : 'ICPC Collegiate Arena is now OFFLINE (Maintenance Mode).',
    });
  } catch (error: any) {
    console.error('Error toggling arena live status:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update' }, { status: 500 });
  }
}
