import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkUserOrCampusRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

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
    const body = await request.json();
    const { teamId, inviteCode, hackathonId, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 401 });
    }

    // Anti-Brute-Force Rate Limiting: Max 10 invite code guesses per minute per user/IP
    const ip = getClientIp(request);
    const rateCheck = checkUserOrCampusRateLimit(userId, ip, 10, 60000, 1000, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many team join attempts. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const admin = getAdminClient();

    // 1. Locate the target team
    let targetTeam: any = null;

    if (teamId) {
      const { data: byId } = await admin
        .from('hackathon_teams')
        .select('*')
        .eq('id', teamId)
        .maybeSingle();
      if (byId) targetTeam = byId;
    }

    if (!targetTeam && inviteCode && hackathonId) {
      // Find by matching invite code
      const { data: allTeams } = await admin
        .from('hackathon_teams')
        .select('*')
        .eq('hackathon_id', hackathonId);

      const codeToUse = String(inviteCode).trim().toUpperCase();
      targetTeam = (allTeams || []).find((t: any) => {
        const derived = t.id ? t.id.replace(/-/g, '').substring(0, 6).toUpperCase() : '';
        return (t.invite_code && t.invite_code.toUpperCase() === codeToUse) || derived === codeToUse;
      });
    }

    if (!targetTeam) {
      return NextResponse.json({ error: 'Invalid team invite code or team not found.' }, { status: 404 });
    }

    const canonicalHackId = hackathonId || targetTeam.hackathon_id;

    // Anti-Multi-Team Abuse: 1 Student = 1 Team per Hackathon
    try {
      const { data: existingPart } = await admin
        .from('hackathon_participants')
        .select('team_id')
        .eq('hackathon_id', canonicalHackId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingPart?.team_id && existingPart.team_id !== targetTeam.id) {
        return NextResponse.json(
          { error: 'You are already registered with another team in this hackathon. You must leave your current team before joining a new one.' },
          { status: 400 }
        );
      }
    } catch {}

    // 2. Fetch current team members
    const { data: currentMembers } = await admin
      .from('hackathon_team_members')
      .select('id, user_id, role')
      .eq('team_id', targetTeam.id);

    const membersList = currentMembers || [];
    const alreadyMember = membersList.some((m) => m.user_id === userId);

    // 3. Fetch hackathon max_team_size
    let maxTeamSize = 4;
    try {
      const { data: hData } = await admin
        .from('hackathons')
        .select('max_team_size')
        .eq('id', canonicalHackId)
        .maybeSingle();
      if (hData?.max_team_size) maxTeamSize = hData.max_team_size;
    } catch {}

    if (!alreadyMember && membersList.length >= maxTeamSize) {
      return NextResponse.json(
        { error: `This team has already reached the maximum limit of ${maxTeamSize} members.` },
        { status: 400 }
      );
    }

    // 4. Insert into hackathon_team_members if not present
    if (!alreadyMember) {
      const { error: insErr } = await admin
        .from('hackathon_team_members')
        .insert({
          team_id: targetTeam.id,
          user_id: userId,
          role: 'Member',
          joined_at: new Date().toISOString(),
        });

      if (insErr) {
        console.error('Failed to insert hackathon_team_members:', insErr);
      }
    }

    // 5. Ensure member is in project_members table
    try {
      const { data: existingProjMem } = await admin
        .from('project_members')
        .select('id')
        .eq('project_id', targetTeam.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingProjMem) {
        await admin.from('project_members').insert({
          project_id: targetTeam.id,
          user_id: userId,
          role: 'Contributor',
          joined_at: new Date().toISOString(),
        });
      }

      // Also ensure leader is in project_members
      if (targetTeam.leader_id) {
        const { data: existingLeader } = await admin
          .from('project_members')
          .select('id')
          .eq('project_id', targetTeam.id)
          .eq('user_id', targetTeam.leader_id)
          .maybeSingle();

        if (!existingLeader) {
          await admin.from('project_members').insert({
            project_id: targetTeam.id,
            user_id: targetTeam.leader_id,
            role: 'Project Lead',
            joined_at: new Date().toISOString(),
          });
        }
      }
    } catch (pmErr) {
      console.warn('project_members sync warning:', pmErr);
    }

    // 6. Update project current_team_size
    const newTeamSize = Math.max(membersList.length + (alreadyMember ? 0 : 1), 2);
    try {
      await admin
        .from('projects')
        .update({ current_team_size: newTeamSize })
        .eq('id', targetTeam.id);
    } catch {}

    // 7. Sync hackathon_participants
    try {
      const { data: existingPart } = await admin
        .from('hackathon_participants')
        .select('id')
        .eq('hackathon_id', canonicalHackId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingPart) {
        await admin
          .from('hackathon_participants')
          .update({ team_id: targetTeam.id })
          .eq('id', existingPart.id);
      } else {
        await admin
          .from('hackathon_participants')
          .insert({
            hackathon_id: canonicalHackId,
            user_id: userId,
            role: 'participant',
            team_id: targetTeam.id,
          });
      }
    } catch (partErr) {
      console.warn('hackathon_participants sync warning:', partErr);
    }

    return NextResponse.json({
      success: true,
      team: targetTeam,
      teamSize: newTeamSize,
    });
  } catch (err: any) {
    console.error('Error in hackathons/teams/join:', err);
    return NextResponse.json({ error: err.message || 'Server error joining team.' }, { status: 500 });
  }
}
