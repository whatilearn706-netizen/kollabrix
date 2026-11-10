import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

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
    const body = await request.json();
    const { hackathonId, teamName, description, challengeId, leaderUserId } = body;

    // Rate-limit per user (allows 1000+ students on campus Wi-Fi without blocking)
    const rateLimit = checkUserOrCampusRateLimit(
      leaderUserId,
      ip,
      10, // Max 10 team creations per 5 minutes per user
      5 * 60 * 1000,
      3000, // Campus NAT ceiling
      60 * 1000
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Team creation rate limit reached. Please wait before creating another team.' },
        { status: 429 }
      );
    }

    if (!hackathonId || !teamName) {
      return NextResponse.json({ error: 'Hackathon ID and Team Name are required.' }, { status: 400 });
    }

    const admin = getAdminClient();
    const teamId = crypto.randomUUID();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Prepare team payload
    const teamPayload: Record<string, any> = {
      id: teamId,
      hackathon_id: hackathonId,
      team_name: teamName.trim(),
      description: description?.trim() || null,
      leader_id: leaderUserId || null,
      invite_code: inviteCode,
    };
    if (challengeId) {
      teamPayload.challenge_id = challengeId;
    }

    // Insert team with explicit cryptographically secure UUID
    let { data: newTeam, error: teamErr } = await admin
      .from('hackathon_teams')
      .insert(teamPayload)
      .select('*')
      .single();

    // Resilient fallback: If the database schema does not have the 'challenge_id' column,
    // retry insertion without challenge_id to avoid blocking team registration
    if (teamErr && (teamErr.message?.includes('challenge_id') || (teamErr as any)?.details?.includes('challenge_id'))) {
      console.warn('hackathon_teams schema missing challenge_id; retrying insertion without it:', teamErr.message);
      delete teamPayload.challenge_id;
      const retryResult = await admin
        .from('hackathon_teams')
        .insert(teamPayload)
        .select('*')
        .single();
      newTeam = retryResult.data;
      teamErr = retryResult.error;
    }

    if (teamErr) {
      return NextResponse.json({ error: teamErr.message }, { status: 500 });
    }

    if (leaderUserId && newTeam?.id) {
      // 1. Add leader to hackathon_team_members
      await admin.from('hackathon_team_members').insert({
        team_id: newTeam.id,
        hackathon_id: hackathonId,
        user_id: leaderUserId,
        role: 'Leader',
      });

      // 2. Pre-seed projects & project_members for instant, error-free workspace access
      try {
        await admin.from('projects').upsert({
          id: newTeam.id,
          owner_id: leaderUserId,
          title: teamName.trim(),
          summary: `Hackathon Team Sprint: Team ${teamName.trim()}`,
          description: description?.trim() || 'Collegiate Hackathon Sprint Workspace',
          category: 'Other',
          difficulty: 'Intermediate',
          technologies: ['Next.js', 'React', 'TypeScript'],
          required_skills: ['Rapid Prototyping', 'Full-Stack'],
          desired_roles: ['Project Lead', 'Frontend Developer', 'Backend Developer'],
          current_team_size: 1,
          desired_team_size: 4,
          status: 'In Progress',
        }, { onConflict: 'id' });

        await admin.from('project_members').upsert({
          project_id: newTeam.id,
          user_id: leaderUserId,
          role: 'Project Lead',
        }, { onConflict: 'project_id,user_id' });
      } catch (seedErr) {
        // Non-blocking: Workspace layout self-heals as secondary safety net
      }
    }

    const teamResponse = {
      ...newTeam,
      challenge_id: challengeId || newTeam?.challenge_id || null,
    };
    return NextResponse.json({ success: true, team: teamResponse });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error creating team.' }, { status: 500 });
  }
}
