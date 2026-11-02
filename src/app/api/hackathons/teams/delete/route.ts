import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_SERVICE_ROLE_KEY,
} from '@/lib/supabase/isConfigured';

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
    const { hackathonId, teamId, userId } = body;

    if (!hackathonId || !teamId) {
      return NextResponse.json({ error: 'Hackathon ID and Team ID are required.' }, { status: 400 });
    }

    const admin = getAdminClient();

    // 1. Delete all team submissions
    try {
      await admin.from('hackathon_submissions').delete().eq('team_id', teamId);
    } catch (e) {
      console.warn('Submissions deletion warning:', e);
    }

    // 2. Delete all team members
    try {
      await admin.from('hackathon_team_members').delete().eq('team_id', teamId);
    } catch (e) {
      console.warn('Team members deletion warning:', e);
    }

    // 3. Delete the team itself
    const { error: deleteTeamErr } = await admin.from('hackathon_teams').delete().eq('id', teamId);
    if (deleteTeamErr) {
      console.warn('Hackathon team delete warning:', deleteTeamErr.message);
    }

    // 4. Also clean up any mirror project in projects table
    try {
      await admin.from('project_members').delete().eq('project_id', teamId);
      await admin.from('projects').delete().eq('id', teamId);
    } catch (e) {
      console.warn('Project mirror delete notice:', e);
    }

    return NextResponse.json({ success: true, message: 'Team successfully removed from hackathon.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error removing team.' }, { status: 500 });
  }
}
