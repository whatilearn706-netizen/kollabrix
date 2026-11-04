import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_SERVICE_ROLE_KEY,
} from '@/lib/supabase/isConfigured';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Allow up to 120 team creations per minute per shared IP (e.g. collegiate hostel/campus Wi-Fi NAT)
    const ipLimit = checkIpRateLimit(`team_create_ip_${ip}`, 120, 60 * 1000, 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many team creation requests from this IP. Please wait a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { hackathonId, teamName, description, challengeId, leaderUserId } = body;

    if (leaderUserId) {
      const userLimit = checkIpRateLimit(`team_create_user_${leaderUserId}`, 5, 5 * 60 * 1000, 5 * 60 * 1000);
      if (!userLimit.allowed) {
        return NextResponse.json(
          { error: 'You have reached the team creation limit. Please wait before creating another team.' },
          { status: 429 }
        );
      }
    }

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
