import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

function extractAuthToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  try {
    const cookies = request.cookies.getAll();
    for (const c of cookies) {
      if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
        try {
          const raw = decodeURIComponent(c.value);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed[0]) return parsed[0];
          if (parsed && parsed.access_token) return parsed.access_token;
        } catch {
          if (c.value && c.value.length > 40) return c.value;
        }
      }
    }
  } catch {}
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      teamId,
      hackathonId,
      action = 'publish', // 'publish' or 'delist'
      title,
      summary,
      description,
      category = 'Web Development',
      difficulty = 'Intermediate',
      technologies = ['React', 'Next.js', 'TypeScript'],
      required_skills = ['Full Stack', 'Software Engineering'],
      desired_roles = ['Frontend Developer', 'Backend Developer'],
      desired_team_size = 4,
      userId: explicitUserId,
    } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required.' }, { status: 400 });
    }

    const admin = getAdminClient();
    let authenticatedUserId: string | null = null;
    const token = extractAuthToken(request);

    if (token) {
      try {
        const { data: authData } = await admin.auth.getUser(token);
        if (authData?.user) authenticatedUserId = authData.user.id;
      } catch {}
    }

    if (!authenticatedUserId) {
      authenticatedUserId =
        request.headers.get('x-user-id') ||
        request.cookies.get('linkora_user_id')?.value ||
        explicitUserId ||
        null;
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // Verify user is leader or member of this team
    const { data: teamRow } = await admin
      .from('hackathon_teams')
      .select('id, leader_id, team_name, hackathon_id')
      .eq('id', teamId)
      .maybeSingle();

    if (!teamRow) {
      return NextResponse.json({ error: 'Hackathon team not found.' }, { status: 404 });
    }

    if (teamRow.leader_id && teamRow.leader_id !== authenticatedUserId) {
      return NextResponse.json(
        { error: 'Only the squad leader can manage Explore listing.' },
        { status: 403 }
      );
    }

    // Get current members count
    const { data: members } = await admin
      .from('hackathon_team_members')
      .select('id')
      .eq('team_id', teamId);
    const memberCount = Math.max(1, members?.length || 1);

    // Fetch hackathon title for context
    let hackathonTitle = 'Campus Hackathon';
    try {
      const { data: hRow } = await admin
        .from('hackathons')
        .select('title')
        .eq('id', hackathonId || teamRow.hackathon_id)
        .maybeSingle();
      if (hRow?.title) hackathonTitle = hRow.title;
    } catch {}

    const metaSnippet = `<!-- HACKATHON_TEAM_META:${JSON.stringify({
      hackathon_id: hackathonId || teamRow.hackathon_id,
      hackathon_title: hackathonTitle,
    })} -->`;

    if (action === 'delist') {
      // Delist: set summary back to Hackathon Team Sprint prefix so it's excluded from Explore
      await admin.from('projects').upsert({
        id: teamId,
        owner_id: authenticatedUserId,
        title: teamRow.team_name,
        summary: `Hackathon Team Sprint: ${hackathonTitle} — ${teamRow.team_name}`,
        description: `${metaSnippet}\n\nPrivate collegiate hackathon team workspace.`,
        category: 'Other',
        difficulty: 'Intermediate',
        status: 'In Progress',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      // Update registry setting
      try {
        const { data: regRow } = await admin
          .from('platform_settings')
          .select('value')
          .eq('key', 'hackathon_explore_teams')
          .maybeSingle();
        const existing: Record<string, boolean> = regRow?.value || {};
        delete existing[teamId];
        await admin.from('platform_settings').upsert({
          key: 'hackathon_explore_teams',
          value: existing,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      return NextResponse.json({
        success: true,
        action: 'delist',
        message: 'Squad has been delisted from Explore and is now private to this hackathon.',
        is_published: false,
      });
    }

    // Action: 'publish'
    const cleanTitle = (title || teamRow.team_name).trim();
    const cleanSummary = (summary || `Recruiting collegiate builders for hackathon sprint: ${cleanTitle}`).trim();
    const cleanDescription = `### Squad Mission & Hackathon Project\n${
      description?.trim() || 'We are building an innovative prototype for the hackathon sprint.'
    }\n\n### Hackathon Event\nThis project is tackling: **${hackathonTitle}**.\n\n### Open Roles We Need\n${
      desired_roles.map((r: string) => `- **${r}**`).join('\n')
    }\n\n${metaSnippet}`;

    const projectPayload = {
      id: teamId,
      owner_id: authenticatedUserId,
      title: cleanTitle,
      summary: cleanSummary,
      description: cleanDescription,
      category,
      difficulty,
      technologies: Array.isArray(technologies) && technologies.length > 0 ? technologies : ['Next.js', 'React', 'TypeScript'],
      required_skills: Array.isArray(required_skills) && required_skills.length > 0 ? required_skills : ['Software Engineering'],
      desired_roles: Array.isArray(desired_roles) && desired_roles.length > 0 ? desired_roles : ['Developer'],
      current_team_size: memberCount,
      desired_team_size: Number(desired_team_size) || 4,
      status: memberCount >= Number(desired_team_size) ? 'In Progress' : 'Recruiting',
      problem_statement_id: null, // Cleared so it is featured in the general Explore Projects feed!
      updated_at: new Date().toISOString(),
    };

    const { data: publishedProj, error: pubErr } = await admin
      .from('projects')
      .upsert(projectPayload, { onConflict: 'id' })
      .select('*')
      .single();

    if (pubErr) {
      console.warn('Notice publishing hackathon team to projects:', pubErr.message);
    }

    // Save publish state in platform_settings for instant cross-client sync
    try {
      const { data: regRow } = await admin
        .from('platform_settings')
        .select('value')
        .eq('key', 'hackathon_explore_teams')
        .maybeSingle();
      const existing: Record<string, any> = regRow?.value || {};
      existing[teamId] = {
        published_at: new Date().toISOString(),
        hackathon_id: hackathonId || teamRow.hackathon_id,
        title: cleanTitle,
        owner_id: authenticatedUserId,
      };
      await admin.from('platform_settings').upsert({
        key: 'hackathon_explore_teams',
        value: existing,
        updated_at: new Date().toISOString(),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      action: 'publish',
      message: '🎉 Your squad is now live on Explore! Campus builders can find your project and apply to join.',
      project: publishedProj || projectPayload,
      is_published: true,
    });
  } catch (err: any) {
    console.error('Exception in publish-explore route:', err);
    return NextResponse.json({ error: err.message || 'Server error publishing squad.' }, { status: 500 });
  }
}
