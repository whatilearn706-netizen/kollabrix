import { NextRequest, NextResponse } from 'next/server';
import { CURATED_ICPC_CONTESTS, BLANK_STARTER_CODE } from '@/data/mockIcpcContests';
import { IcpcContest } from '@/types/icpc';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// In-memory fallback caches
let memoryContests: IcpcContest[] = [];
let memoryDeletedProblemIds: Set<string> = new Set();
let memoryDeletedContestIds: Set<string> = new Set();
let memoryIsArenaLive: boolean = true;
let memoryIsLeaderboardLive: boolean = false;

async function loadIcpcMasterData() {
  try {
    const data = await getMasterControlSubkey<any>('icpc', {
      contests: [],
      isArenaLive: true,
      isLeaderboardLive: false,
      deletedProblemIds: [],
      deletedContestIds: [],
    });
    return {
      contests: Array.isArray(data?.contests) ? (data.contests as IcpcContest[]) : [],
      isArenaLive: typeof data?.isArenaLive === 'boolean' ? data.isArenaLive : true,
      isLeaderboardLive: typeof data?.isLeaderboardLive === 'boolean' ? data.isLeaderboardLive : false,
      deletedProblemIds: Array.isArray(data?.deletedProblemIds) ? (data.deletedProblemIds as string[]) : [],
      deletedContestIds: Array.isArray(data?.deletedContestIds) ? (data.deletedContestIds as string[]) : [],
    };
  } catch (e) {
    return {
      contests: [],
      isArenaLive: true,
      isLeaderboardLive: false,
      deletedProblemIds: [],
      deletedContestIds: [],
    };
  }
}

async function saveIcpcMasterData(updated: {
  contests?: IcpcContest[];
  isArenaLive?: boolean;
  isLeaderboardLive?: boolean;
  deletedProblemIds?: string[];
  deletedContestIds?: string[];
}) {
  const current = await loadIcpcMasterData();
  const next = {
    ...current,
    ...updated,
  };
  await updateMasterControlSubkey('icpc', next);
  return next;
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL || '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
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
    let isLeaderboardLive = memoryIsLeaderboardLive;
    let deletedProblemIds = new Set<string>(memoryDeletedProblemIds);
    let deletedContestIds = new Set<string>(memoryDeletedContestIds);

    // Also load from authoritative master control record
    try {
      const masterData = await loadIcpcMasterData();
      if (masterData.contests.length > 0) {
        dbContests = [...masterData.contests, ...dbContests];
      }
      if (typeof masterData.isArenaLive === 'boolean') {
        isArenaLive = masterData.isArenaLive;
        memoryIsArenaLive = isArenaLive;
      }
      if (typeof masterData.isLeaderboardLive === 'boolean') {
        isLeaderboardLive = masterData.isLeaderboardLive;
        memoryIsLeaderboardLive = isLeaderboardLive;
      }
      masterData.deletedProblemIds.forEach((id) => {
        deletedProblemIds.add(id);
        memoryDeletedProblemIds.add(id);
      });
      masterData.deletedContestIds.forEach((id) => {
        deletedContestIds.add(id);
        memoryDeletedContestIds.add(id);
      });
    } catch (e) {}

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

      // Dynamic status calculation based on authoritative clock time
      let computedStatus = c.status;
      if (c.contestType !== 'practice' && c.startTime && c.endTime) {
        const now = Date.now();
        const s = new Date(c.startTime).getTime();
        const e = new Date(c.endTime).getTime();
        if (!isNaN(s) && !isNaN(e)) {
          if (now < s) {
            computedStatus = 'upcoming';
          } else if (now > e) {
            computedStatus = 'ended';
          } else {
            computedStatus = 'live';
          }
        }
      }

      // Check anti-cheat timeline lock:
      // If contest is live and has not ended yet, lock solutionCode to prevent leaks
      const isContestLive = c.contestType !== 'practice' && computedStatus === 'live';

      const sanitizedProblems = activeProblems.map((p) => {
        const cleanStarter = (p.starterCode && p.starterCode.cpp && !p.starterCode.cpp.includes('TODO:') && !p.starterCode.cpp.includes('cin >> a[i]') && !p.starterCode.cpp.includes('cin >> n >> m'))
          ? p.starterCode
          : BLANK_STARTER_CODE;

        if (isContestLive) {
          // Mask solution code & explanation while live contest is actively underway
          const { solutionCode, solutionExplanation, ...rest } = p;
          return {
            ...rest,
            starterCode: cleanStarter,
            isSolutionLocked: true,
          };
        }
        return {
          ...p,
          starterCode: cleanStarter,
          isSolutionLocked: false,
        };
      });

      // Security Defense: Strip raw passcode so it is not visible in browser network inspection
      const { passcode: rawPasscode, ...safeContest } = c;

      uniqueContests.push({
        ...safeContest,
        status: computedStatus,
        hasPasscode: Boolean(rawPasscode),
        contestType: c.contestType || (computedStatus === 'ended' ? 'practice' : 'contest'),
        problems: sanitizedProblems,
      });
    }

    return NextResponse.json({
      success: true,
      isArenaLive,
      isLeaderboardLive,
      contests: uniqueContests,
      count: uniqueContests.length,
    });
  } catch (error: any) {
    console.error('Error fetching ICPC contests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load contests', contests: [], isArenaLive: true, isLeaderboardLive: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, durationMinutes, problems, rules, visibility, passcode, college, contestType, creatorId, userRole, facultyVerified } = body;

    // ── Authentication Check: Verified faculty or administrators ONLY ──
    const auth = await verifyAdminSession(request);
    let isAuthorized = auth.authorized;

    if (!isAuthorized) {
      const authHeader = request.headers.get('authorization') || '';
      let token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

      // If Authorization header wasn't provided, check cookies for Supabase auth tokens
      if (!token) {
        try {
          const cookies = request.cookies.getAll();
          for (const c of cookies) {
            if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
              try {
                const raw = decodeURIComponent(c.value);
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed[0]) {
                  token = parsed[0];
                  break;
                } else if (parsed && parsed.access_token) {
                  token = parsed.access_token;
                  break;
                }
              } catch {
                if (c.value && c.value.length > 40) {
                  token = c.value;
                  break;
                }
              }
            }
          }
        } catch {}
      }

      if (token && isSupabaseConfigured()) {
        const client = getSupabaseClient();
        if (client) {
          try {
            const { data: userData } = await client.auth.getUser(token);
            if (userData?.user) {
              const { data: prof } = await client
                .from('profiles')
                .select('role, faculty_verified')
                .eq('user_id', userData.user.id)
                .maybeSingle();

              if (
                prof?.role === 'teacher' ||
                prof?.role === 'admin' ||
                prof?.role === 'faculty' ||
                prof?.role === 'professor' ||
                prof?.faculty_verified === true ||
                userData.user.email?.toLowerCase() === 'goyalmayank142@gmail.com' ||
                userData.user.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508'
              ) {
                isAuthorized = true;
              }
            }
          } catch (tokenErr) {}
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only verified faculty mentors or administrators can create contests and labs.' },
        { status: 403 }
      );
    }

    // ── Rate limit: max 10 contest creations per hour ──
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`create-icpc:${ip}`, 10, 60 * 60 * 1000, 60 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many contest creations. Please wait before creating another.' },
        { status: 429 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Contest title is required.' }, { status: 400 });
    }

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json({ success: false, error: 'Please add at least one problem to the contest.' }, { status: 400 });
    }

    const isPractice = contestType === 'practice';
    let computedStatus: 'live' | 'upcoming' | 'ended' = isPractice ? 'ended' : 'live';

    let startTimeIso = body.startTime || new Date().toISOString();
    let endTimeIso = body.endTime || (isPractice ? new Date().toISOString() : new Date(Date.now() + (durationMinutes || 180) * 60000).toISOString());
    let computedDuration = Number(durationMinutes) || 180;

    if (!isPractice && body.startTime && body.endTime) {
      const s = new Date(body.startTime).getTime();
      const e = new Date(body.endTime).getTime();
      if (!isNaN(s) && !isNaN(e) && e > s) {
        computedDuration = Math.max(15, Math.round((e - s) / 60000));
        const now = Date.now();
        if (now < s) {
          computedStatus = 'upcoming';
        } else if (now > e) {
          computedStatus = 'ended';
        } else {
          computedStatus = 'live';
        }
      }
    }

    const newContest: IcpcContest = {
      id: `icpc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle?.trim() || (isPractice ? 'Collegiate Practice Problem Set • LeetCode Style' : 'Collegiate Programming Challenge • LeetCode Style'),
      organizer: body.organizer || 'Verified Faculty Member',
      organizerRole: body.organizerRole || 'Faculty Mentor & Contest Director',
      college: college || 'Partner Collegiate Network',
      contestType: isPractice ? 'practice' : 'contest',
      category: body.category || (body.companyTag ? 'placement' : visibility === 'passcode' ? 'faculty' : 'icpc'),
      companyTag: body.companyTag || undefined,
      startTime: startTimeIso,
      endTime: endTimeIso,
      durationMinutes: computedDuration,
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

    // Save to Supabase master control record
    try {
      const masterData = await loadIcpcMasterData();
      const updatedList = [newContest, ...masterData.contests.filter((c) => c.id !== newContest.id)];
      await saveIcpcMasterData({ contests: updatedList });
    } catch (dbErr) {
      console.warn('Could not persist contest to master control:', dbErr);
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

      try {
        await saveIcpcMasterData({
          contests: [],
          deletedContestIds: Array.from(memoryDeletedContestIds),
          deletedProblemIds: Array.from(memoryDeletedProblemIds),
        });
      } catch (dbErr) {
        console.warn('Could not clear master control icpc tables:', dbErr);
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

      try {
        await saveIcpcMasterData({
          contests: [],
          deletedContestIds: [],
          deletedProblemIds: [],
          isArenaLive: true,
        });
      } catch (dbErr) {
        console.warn('Could not reset master control icpc settings:', dbErr);
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

    try {
      const masterData = await loadIcpcMasterData();
      const deletedProblems = Array.from(new Set([...masterData.deletedProblemIds, ...(problemId ? [problemId] : [])]));
      const deletedContests = Array.from(new Set([...masterData.deletedContestIds, ...(contestId && !problemId ? [contestId] : [])]));
      await saveIcpcMasterData({
        deletedProblemIds: deletedProblems,
        deletedContestIds: deletedContests,
      });
    } catch (dbErr) {
      console.warn('Could not persist deleted problem/contest to master control:', dbErr);
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

// PATCH: Toggle Competitive Practice Live / Offline or Leaderboard Visibility (Admin Only)
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
    const { isArenaLive, isLeaderboardLive } = body;

    if (typeof isArenaLive !== 'boolean' && typeof isLeaderboardLive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isArenaLive or isLeaderboardLive boolean required' }, { status: 400 });
    }

    const updatePayload: { isArenaLive?: boolean; isLeaderboardLive?: boolean } = {};
    let message = 'Arena settings updated.';

    if (typeof isArenaLive === 'boolean') {
      memoryIsArenaLive = isArenaLive;
      updatePayload.isArenaLive = isArenaLive;
      message = isArenaLive ? 'ICPC Collegiate Arena is now LIVE!' : 'ICPC Collegiate Arena is now OFFLINE (Maintenance Mode).';
    }

    if (typeof isLeaderboardLive === 'boolean') {
      memoryIsLeaderboardLive = isLeaderboardLive;
      updatePayload.isLeaderboardLive = isLeaderboardLive;
      message = isLeaderboardLive ? 'Campus Leaderboard is now LIVE on Arena!' : 'Campus Leaderboard is now HIDDEN from public arena.';
    }

    try {
      await saveIcpcMasterData(updatePayload);
      if (typeof isArenaLive === 'boolean') {
        await updateMasterControlSubkey('arena_is_live', isArenaLive);
      }
    } catch (dbErr) {
      console.warn('Could not persist arena toggle to master control:', dbErr);
    }

    return NextResponse.json({
      success: true,
      isArenaLive: memoryIsArenaLive,
      isLeaderboardLive: memoryIsLeaderboardLive,
      message,
    });
  } catch (error: any) {
    console.error('Error toggling arena live status:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update' }, { status: 500 });
  }
}
