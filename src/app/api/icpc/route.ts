import { NextRequest, NextResponse } from 'next/server';
import { CURATED_ICPC_CONTESTS } from '@/data/mockIcpcContests';
import { IcpcContest } from '@/types/icpc';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

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
    const url = new URL(request.url);
    const includeEmpty = url.searchParams.get('includeEmpty') === 'true';

    let dbContests: IcpcContest[] = [];
    let isArenaLive = memoryIsArenaLive;
    let deletedProblemIds = new Set<string>(memoryDeletedProblemIds);
    let deletedContestIds = new Set<string>(memoryDeletedContestIds);

    const client = getSupabaseClient();
    if (client) {
      try {
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
                row.value.deletedProblemIds.forEach((id: string) => {
                  deletedProblemIds.add(id);
                  memoryDeletedProblemIds.add(id);
                });
              }
              if (Array.isArray(row.value.deletedContestIds)) {
                row.value.deletedContestIds.forEach((id: string) => {
                  deletedContestIds.add(id);
                  memoryDeletedContestIds.add(id);
                });
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

      // If all problems in this contest were removed, don't show to students unless requested by admin
      if (!includeEmpty && activeProblems.length === 0 && c.status !== 'upcoming') {
        continue;
      }

      // Check anti-cheat timeline lock:
      // If contest is live and has not ended yet, lock solutionCode to prevent leaks
      const isContestLive = c.contestType !== 'practice' && (c.status === 'live' && new Date() < new Date(c.endTime));

      const sanitizedProblems = activeProblems.map((p) => {
        if (isContestLive) {
          // Mask solution code & explanation while live contest is actively underway
          const { solutionCode, solutionExplanation, ...rest } = p;
          return {
            ...rest,
            isSolutionLocked: true,
          };
        }
        return {
          ...p,
          isSolutionLocked: false,
        };
      });

      // Security Defense: Strip raw passcode so it is not visible in browser network inspection
      const { passcode: rawPasscode, ...safeContest } = c;

      uniqueContests.push({
        ...safeContest,
        hasPasscode: Boolean(rawPasscode),
        contestType: c.contestType || (c.status === 'ended' ? 'practice' : 'contest'),
        problems: sanitizedProblems,
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
      { success: false, error: error.message || 'Failed to load contests', contests: [], isArenaLive: true },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Authentication Check: Only verified faculty or administrators can create contests ──
    const auth = await verifyAdminSession(request);
    let isAuthorized = auth.authorized;

    if (!isAuthorized) {
      // Check if user is a verified teacher
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      if (token && isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          const { data: userData } = await client.auth.getUser(token);
          if (userData?.user) {
            const { data: prof } = await client
              .from('profiles')
              .select('role, faculty_verified')
              .eq('user_id', userData.user.id)
              .maybeSingle();
            if (prof?.role === 'teacher' || prof?.role === 'admin' || prof?.faculty_verified) {
              isAuthorized = true;
            }
          }
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only verified faculty mentors or administrators can create ICPC contests.' },
        { status: 403 }
      );
    }

    // ── Rate limit: max 5 contest creations per hour ──
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`create-icpc:${ip}`, 5, 60 * 60 * 1000, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many contest creations. Please wait before creating another.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, subtitle, durationMinutes, problems, rules, visibility, passcode, college, contestType } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Contest title is required.' }, { status: 400 });
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({ success: false, error: 'Please add at least one problem to the contest.' }, { status: 400 });
    }

    const isPractice = contestType === 'practice';
    const computedStatus = isPractice ? 'ended' : 'live';

    const newContest: IcpcContest = {
      id: `icpc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle?.trim() || (isPractice ? 'Collegiate Practice Problem Set • LeetCode Style' : 'Collegiate Programming Challenge • LeetCode Style'),
      organizer: body.organizer || 'Verified Faculty Member',
      organizerRole: body.organizerRole || 'Faculty Mentor & Contest Director',
      college: college || 'Partner Collegiate Network',
      contestType: isPractice ? 'practice' : 'contest',
      startTime: body.startTime || new Date().toISOString(),
      endTime: body.endTime || (isPractice ? new Date().toISOString() : new Date(Date.now() + (durationMinutes || 180) * 60000).toISOString()),
      durationMinutes: Number(durationMinutes) || 180,
      status: computedStatus,
      visibility: visibility === 'passcode' ? 'passcode' : 'public',
      passcode: passcode?.trim() || undefined,
      bannerGradient: body.bannerGradient || (isPractice ? 'from-indigo-600 via-purple-600 to-pink-600' : 'from-cyan-600 via-indigo-600 to-violet-600'),
      participantCount: 1,
      scoringType: isPractice ? 'leetcode' : 'icpc',
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
        solutionCode: p.solutionCode?.trim() || undefined,
        solutionExplanation: p.solutionExplanation?.trim() || undefined,
        solutionLanguage: p.solutionLanguage || 'cpp',
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

// DELETE: Remove a problem, remove a contest, clear all, or reset defaults (Admin Only)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can delete ICPC contests or problems.' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const clearAll = url.searchParams.get('clearAll') === 'true';
    const resetDefaults = url.searchParams.get('resetDefaults') === 'true';
    let contestId = url.searchParams.get('contestId');
    let problemId = url.searchParams.get('problemId');

    if (!contestId && !problemId && !clearAll && !resetDefaults) {
      try {
        const body = await request.json();
        contestId = body.contestId;
        problemId = body.problemId;
      } catch (e) {}
    }

    const client = getSupabaseClient();

    // 1. CLEAR ALL
    if (clearAll) {
      CURATED_ICPC_CONTESTS.forEach((c) => {
        memoryDeletedContestIds.add(c.id);
        c.problems.forEach((p) => memoryDeletedProblemIds.add(p.id));
      });
      memoryContests.forEach((c) => {
        memoryDeletedContestIds.add(c.id);
        c.problems.forEach((p) => memoryDeletedProblemIds.add(p.id));
      });
      memoryContests = [];

      if (client) {
        try {
          const { data: settingRow } = await client
            .from('platform_settings')
            .select('value')
            .eq('key', 'icpc_contests_v1')
            .maybeSingle();

          const dbList: IcpcContest[] = Array.isArray(settingRow?.value) ? settingRow.value : [];
          dbList.forEach((c) => {
            memoryDeletedContestIds.add(c.id);
            c.problems.forEach((p) => memoryDeletedProblemIds.add(p.id));
          });

          await client.from('platform_settings').upsert({
            key: 'icpc_settings_v1',
            value: {
              isArenaLive: memoryIsArenaLive,
              deletedProblemIds: Array.from(memoryDeletedProblemIds),
              deletedContestIds: Array.from(memoryDeletedContestIds),
            },
            updated_at: new Date().toISOString(),
          });

          await client.from('platform_settings').upsert({
            key: 'icpc_contests_v1',
            value: [],
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Could not clear Supabase icpc tables:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'All contests and problems cleared from ICPC arena successfully.',
      });
    }

    // 2. RESET DEFAULTS
    if (resetDefaults) {
      memoryDeletedProblemIds.clear();
      memoryDeletedContestIds.clear();
      memoryContests = [];

      if (client) {
        try {
          await client.from('platform_settings').upsert({
            key: 'icpc_settings_v1',
            value: {
              isArenaLive: true,
              deletedProblemIds: [],
              deletedContestIds: [],
            },
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Could not reset Supabase icpc settings:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Curated ICPC contests restored successfully.',
      });
    }

    // 3. REMOVE SPECIFIC PROBLEM OR CONTEST
    if (!contestId && !problemId) {
      return NextResponse.json({ success: false, error: 'Must provide contestId, problemId, clearAll, or resetDefaults' }, { status: 400 });
    }

    if (problemId) {
      memoryDeletedProblemIds.add(problemId);
    }
    if (contestId && !problemId) {
      memoryDeletedContestIds.add(contestId);
    }

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

// PATCH: Toggle ICPC Arena Live / Offline or update settings (Admin Only)
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can modify ICPC arena live status.' },
        { status: 403 }
      );
    }

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
