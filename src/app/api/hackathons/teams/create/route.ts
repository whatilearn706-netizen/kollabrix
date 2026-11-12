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
    const inviteCode = teamId.replace(/-/g, '').substring(0, 6).toUpperCase();

    // Prepare team payload with only verified database schema columns:
    // id, hackathon_id, name, team_name, leader_id
    const teamPayload: Record<string, any> = {
      id: teamId,
      hackathon_id: hackathonId,
      name: teamName.trim(),
      team_name: teamName.trim(),
      leader_id: leaderUserId || null,
    };

    // Insert team with explicit cryptographically secure UUID
    const { data: newTeam, error: teamErr } = await admin
      .from('hackathon_teams')
      .insert(teamPayload)
      .select('*')
      .single();

    if (teamErr) {
      return NextResponse.json({ error: teamErr.message }, { status: 500 });
    }

    if (leaderUserId && newTeam?.id) {
      // 1. Add leader to hackathon_team_members (columns: team_id, user_id, role, joined_at)
      await admin.from('hackathon_team_members').insert({
        team_id: newTeam.id,
        user_id: leaderUserId,
        role: 'Leader',
        joined_at: new Date().toISOString(),
      });

      // 2. Pre-seed projects & project_members for instant, error-free workspace access with full Hackathon provenance
      try {
        let hackathonTitle = 'Campus Hackathon';
        try {
          const { data: hRow } = await admin
            .from('hackathons')
            .select('title')
            .eq('id', hackathonId)
            .maybeSingle();
          if (hRow?.title) hackathonTitle = hRow.title;
        } catch {}

        const metaSnippet = `<!-- HACKATHON_TEAM_META:${JSON.stringify({
          hackathon_id: hackathonId,
          hackathon_title: hackathonTitle,
        })} -->`;

        await admin.from('projects').upsert({
          id: newTeam.id,
          owner_id: leaderUserId,
          title: teamName.trim(),
          summary: `Hackathon Team Sprint: ${hackathonTitle} — ${teamName.trim()}`,
          description: `${metaSnippet}\n\n${description?.trim() || 'Collegiate Hackathon Sprint Workspace'}\n\n### Hackathon Event\nThis workspace belongs to: **${hackathonTitle}**.`,
          category: 'Other',
          difficulty: 'Intermediate',
          technologies: ['Next.js', 'React', 'TypeScript'],
          required_skills: ['Rapid Prototyping', 'Full-Stack'],
          desired_roles: ['Project Lead', 'Frontend Developer', 'Backend Developer'],
          current_team_size: 1,
          desired_team_size: 4,
          status: 'In Progress',
        }, { onConflict: 'id' });

        const { data: existingLead } = await admin
          .from('project_members')
          .select('id')
          .eq('project_id', newTeam.id)
          .eq('user_id', leaderUserId)
          .maybeSingle();

        if (!existingLead) {
          await admin.from('project_members').insert({
            project_id: newTeam.id,
            user_id: leaderUserId,
            role: 'Project Lead',
          });
        }
      } catch (seedErr) {
        // Non-blocking: Workspace layout self-heals as secondary safety net
      }
    }

    const teamResponse = {
      ...newTeam,
      team_name: teamName.trim(),
      description: description?.trim() || null,
      challenge_id: challengeId || newTeam?.challenge_id || null,
      invite_code: inviteCode,
    };
    return NextResponse.json({ success: true, team: teamResponse });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error creating team.' }, { status: 500 });
  }
}
