import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export interface UserArenaStats {
  elo: number;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  highestElo: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master' | 'Grandmaster';
  lastMatchAt: string;
  lastOpponent?: string;
  history?: Array<{
    date: string;
    outcome: 'win' | 'loss' | 'draw';
    delta: number;
    newElo: number;
    opponent: string;
    arena?: string;
  }>;
}

function calculateTier(elo: number): UserArenaStats['tier'] {
  if (elo >= 2000) return 'Grandmaster';
  if (elo >= 1800) return 'Master';
  if (elo >= 1500) return 'Diamond';
  if (elo >= 1300) return 'Gold';
  if (elo >= 1050) return 'Silver';
  return 'Bronze';
}

const DEFAULT_USER_STATS: UserArenaStats = {
  elo: 1200,
  matches: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  highestElo: 1200,
  tier: 'Silver',
  lastMatchAt: new Date().toISOString(),
};

// In-memory fallback in case of transient database connection
const inMemoryRatingsCache: Record<string, UserArenaStats> = {};

function isGuestUserId(userId?: string | null): boolean {
  if (!userId) return true;
  const trimmed = userId.trim();
  return !trimmed || trimmed.startsWith('guest-') || trimmed.startsWith('p-');
}

// GET: Fetch user's current arena rating & stats (defaults to 1200 Silver)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')?.trim();

    if (isGuestUserId(userId)) {
      return NextResponse.json({
        success: true,
        guest: true,
        stats: { ...DEFAULT_USER_STATS, lastMatchAt: new Date().toISOString() },
        elo: 1200,
      });
    }

    const allRatings = await getMasterControlSubkey<Record<string, UserArenaStats>>(
      'arena_user_ratings',
      inMemoryRatingsCache,
      true
    );

    const userStats = allRatings[userId!] || inMemoryRatingsCache[userId!] || {
      ...DEFAULT_USER_STATS,
      lastMatchAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, stats: userStats, elo: userStats.elo },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.warn('Error fetching arena rating:', err.message);
    return NextResponse.json({ success: true, stats: DEFAULT_USER_STATS, elo: 1200 });
  }
}

// POST: Record match outcome and calculate authentic ELO adjustment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      outcome, // 'win' | 'loss' | 'draw'
      timeRemaining = 0,
      matchDuration = 300,
      testsPassed = 0,
      totalTests = 3,
      opponentName = 'Collegiate Builder',
      arena = 'web_dev',
    } = body;

    if (isGuestUserId(userId)) {
      return NextResponse.json({
        success: false,
        guest: true,
        error: 'Guest sessions are temporary and are not saved. Sign in to save ELO & stats.',
      }, { status: 401 });
    }

    const allRatings = await getMasterControlSubkey<Record<string, UserArenaStats>>(
      'arena_user_ratings',
      inMemoryRatingsCache,
      true
    );

    const currentStats: UserArenaStats = allRatings[userId] || inMemoryRatingsCache[userId] || {
      ...DEFAULT_USER_STATS,
      lastMatchAt: new Date().toISOString(),
    };

    let delta = 0;
    const isWin = outcome === 'win';
    const isLoss = outcome === 'loss';

    if (isWin) {
      // Base win gain: +24 ELO
      delta = 24;
      // Speed bonus: If solved in under 50% of the match time limit, award +6 bonus ELO
      if (timeRemaining > (matchDuration * 0.5)) {
        delta += 6;
      }
      // If tests were clean sweep (e.g. 3/3), award +2
      if (testsPassed >= totalTests && totalTests > 1) {
        delta += 2;
      }
    } else if (isLoss) {
      // Base loss penalty: -16 ELO
      delta = -16;
      // Partial credit: If user passed at least 1 test case before time ran out, soften the loss to -12
      if (testsPassed > 0) {
        delta = -12;
      }
    } else {
      // Draw: 0 delta
      delta = 0;
    }

    // Minimum floor 800 ELO to maintain competitive dignity
    const newElo = Math.max(800, currentStats.elo + delta);
    const newWins = currentStats.wins + (isWin ? 1 : 0);
    const newLosses = currentStats.losses + (isLoss ? 1 : 0);
    const newDraws = currentStats.draws + (!isWin && !isLoss ? 1 : 0);
    const newMatches = currentStats.matches + 1;
    const newStreak = isWin ? (currentStats.winStreak || 0) + 1 : 0;
    const newHighest = Math.max(currentStats.highestElo || 1200, newElo);
    const newTier = calculateTier(newElo);

    const matchHistoryItem = {
      date: new Date().toISOString(),
      outcome: outcome as 'win' | 'loss' | 'draw',
      delta,
      newElo,
      opponent: opponentName,
      arena,
    };

    const updatedUserStats: UserArenaStats = {
      elo: newElo,
      matches: newMatches,
      wins: newWins,
      losses: newLosses,
      draws: newDraws,
      winStreak: newStreak,
      highestElo: newHighest,
      tier: newTier,
      lastMatchAt: new Date().toISOString(),
      lastOpponent: opponentName,
      history: [matchHistoryItem, ...(currentStats.history || []).slice(0, 19)],
    };

    // Update in-memory cache
    inMemoryRatingsCache[userId] = updatedUserStats;

    // Update persistent master config in platform_settings
    const updatedAllRatings = {
      ...allRatings,
      [userId]: updatedUserStats,
    };

    await updateMasterControlSubkey('arena_user_ratings', updatedAllRatings);

    return NextResponse.json({
      success: true,
      newElo,
      eloDelta: delta,
      stats: updatedUserStats,
    });
  } catch (err: any) {
    console.error('Error updating arena rating:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update rating' }, { status: 500 });
  }
}
