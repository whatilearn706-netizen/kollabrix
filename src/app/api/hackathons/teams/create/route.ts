import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hackathonId, teamName, description, challengeId, leaderUserId } = body;

    if (!hackathonId || !teamName) {
      return NextResponse.json({ error: 'Hackathon ID and Team Name are required.' }, { status: 400 });
    }

    const admin = getAdminClient();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Insert team
    const { data: newTeam, error: teamErr } = await admin
      .from('hackathon_teams')
      .insert({
        hackathon_id: hackathonId,
        team_name: teamName.trim(),
        description: description?.trim() || null,
        challenge_id: challengeId || null,
        leader_id: leaderUserId || null,
        invite_code: inviteCode,
      })
      .select('*')
      .single();

    if (teamErr) {
      return NextResponse.json({ error: teamErr.message }, { status: 500 });
    }

    if (leaderUserId && newTeam?.id) {
      await admin.from('hackathon_team_members').insert({
        team_id: newTeam.id,
        hackathon_id: hackathonId,
        user_id: leaderUserId,
        role: 'Leader',
      });
    }

    return NextResponse.json({ success: true, team: newTeam });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error creating team.' }, { status: 500 });
  }
}
