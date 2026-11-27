import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import type { UserArenaStats } from '@/app/api/arena/rating/route';
import type { StoredArenaIdentity } from '@/app/api/arena/identity/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface TopDuelistEntry {
  userId: string;
  name: string;
  college: string;
  elo: number;
  wins: number;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

function isSyntheticUserId(userId: string): boolean {
  return (
    userId.startsWith('usr_seed_') ||
    userId.startsWith('usr_') ||
    userId.startsWith('guest-') ||
    userId.startsWith('p-')
  );
}

function isFacultyAccount(row: {
  role?: string | null;
  bio?: string | null;
  course?: string | null;
}): boolean {
  if (row.role === 'faculty' || row.role === 'teacher') return true;
  const course = (row.course || '').toLowerCase();
  return course.includes('faculty') || course.includes('professor');
}

function formatCollegeShort(college?: string | null): string {
  const raw = (college || '').trim();
  if (!raw) return 'Kollabrix Builder';
  return raw;
}

/**
 * Returns the Top 5 real teammate accounts ordered by live Arena ELO & activity.
 */
export async function GET() {
  try {
    const [allRatings, allIdentities] = await Promise.all([
      getMasterControlSubkey<Record<string, UserArenaStats>>('arena_user_ratings', {}, true),
      getMasterControlSubkey<Record<string, StoredArenaIdentity>>('arena_identities', {}, true),
    ]);

    let profiles: Array<{
      user_id: string;
      username?: string | null;
      display_name?: string | null;
      college?: string | null;
      course?: string | null;
      role?: string | null;
      status?: string | null;
      is_suspended?: boolean | null;
      college_verified?: boolean | null;
      updated_at?: string | null;
    }> = [];

    if (isSupabaseConfigured()) {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'user_id, username, display_name, college, course, role, status, is_suspended, college_verified, updated_at'
        )
        .or('is_suspended.is.null,is_suspended.eq.false')
        .or('status.is.null,status.neq.suspended')
        .order('college_verified', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(120);

      if (!error && Array.isArray(data)) {
        profiles = data;
      }
    }

    const activeProfiles = profiles.filter(
      (p) =>
        Boolean(p.user_id) &&
        !p.is_suspended &&
        p.status !== 'suspended' &&
        !isFacultyAccount(p) &&
        Boolean((p.display_name || p.username || '').trim())
    );

    // Prefer genuine signed-up accounts over seeded rows if available
    const genuineProfiles = activeProfiles.filter((p) => !isSyntheticUserId(p.user_id));
    const pool = genuineProfiles.length >= 5 ? genuineProfiles : activeProfiles;

    const ranked: TopDuelistEntry[] = pool
      .map((p) => {
        const rating = allRatings[p.user_id];
        const identity = allIdentities[p.user_id];
        const elo = typeof rating?.elo === 'number' ? rating.elo : 1200;
        const wins = typeof rating?.wins === 'number' ? rating.wins : 0;
        const hasCustomRating = typeof rating?.elo === 'number';
        const name = (identity?.callsign || p.display_name || p.username || 'Builder').trim();
        return {
          userId: p.user_id,
          name,
          college: formatCollegeShort(p.college),
          elo,
          wins,
          _hasRating: hasCustomRating ? 1 : 0,
          _verified: p.college_verified ? 1 : 0,
        };
      })
      .sort((a, b) => {
        if (b.elo !== a.elo) return b.elo - a.elo;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b._hasRating !== a._hasRating) return b._hasRating - a._hasRating;
        return b._verified - a._verified;
      })
      .slice(0, 5)
      .map(({ userId, name, college, elo, wins }) => ({
        userId,
        name,
        college,
        elo,
        wins,
      }));

    return NextResponse.json(
      { success: true, duelists: ranked },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
  } catch (err: any) {
    console.warn('Error fetching top duelists:', err?.message || err);
    return NextResponse.json({ success: true, duelists: [] });
  }
}
