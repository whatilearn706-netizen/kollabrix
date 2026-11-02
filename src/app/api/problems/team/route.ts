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
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // Check sb- cookies
  try {
    const cookies = request.cookies.getAll();
    for (const c of cookies) {
      if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
        try {
          const raw = decodeURIComponent(c.value);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed[0]) {
            return parsed[0];
          } else if (parsed && parsed.access_token) {
            return parsed.access_token;
          }
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
      problemId,
      problemTitle = 'Faculty Challenge',
      teamName,
      concept = '',
      category = 'Web Development',
      difficulty = 'Intermediate',
      desiredTeamSize = 4,
      selectedRoles = ['Frontend Developer', 'Backend Developer'],
      technologies = ['Full Stack'],
      commsLink = '',
      postToExplore = false,
      userId: explicitUserId,
    } = body;

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required.' }, { status: 400 });
    }

    if (!teamName || teamName.trim().length < 2) {
      return NextResponse.json({ error: 'Team name must be at least 2 characters.' }, { status: 400 });
    }

    const token = extractAuthToken(request);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
    const supabaseAdmin = getAdminClient();

    let authenticatedUserId: string | null = null;
    let authenticatedUserEmail: string | null = null;

    if (token) {
      try {
        const authClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        });
        const { data: authData } = await authClient.auth.getUser(token);
        if (authData?.user) {
          authenticatedUserId = authData.user.id;
          authenticatedUserEmail = authData.user.email?.toLowerCase() || null;
        }
      } catch (e) {}
    }

    if (!authenticatedUserId) {
      authenticatedUserId =
        request.cookies.get('linkora_user_id')?.value ||
        request.headers.get('x-user-id') ||
        explicitUserId ||
        null;
    }

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Authentication required to form a squad.' }, { status: 401 });
    }

    // 1. Fetch user's profile to verify identity and display info
    let userProfile: any = null;
    try {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .maybeSingle();
      userProfile = prof;
    } catch {}

    // Ensure user profile row exists
    if (!userProfile) {
      try {
        const fallbackProf = {
          user_id: authenticatedUserId,
          display_name: userProfile?.display_name || 'Student Builder',
          username: `user_${authenticatedUserId.slice(0, 8)}`,
          role: 'student',
          updated_at: new Date().toISOString(),
        };
        await supabaseAdmin.from('profiles').insert(fallbackProf);
        userProfile = fallbackProf;
      } catch {}
    }

    // 2. Enforce 1 team per student per challenge
    try {
      const { data: existingUserTeams } = await supabaseAdmin
        .from('projects')
        .select('id, title')
        .eq('problem_statement_id', problemId)
        .eq('owner_id', authenticatedUserId);

      if (existingUserTeams && existingUserTeams.length > 0) {
        return NextResponse.json(
          {
            error: `You have already formed a squad ("${existingUserTeams[0].title}") for this problem statement. Each student is limited to 1 team per challenge.`,
          },
          { status: 400 }
        );
      }
    } catch (e) {}

    // 3. Assemble project description and payload
    const summaryText =
      concept.trim() ||
      (postToExplore && teamName.trim()) ||
      `Student squad tackling faculty challenge: ${problemTitle}`;

    const descriptionText = `### Squad Mission & Approach\n${
      concept.trim() || 'Building a comprehensive solution deliverable for this faculty challenge.'
    }\n\n### Faculty Problem Statement\nThis team is directly tackling: **${problemTitle}**.\n\n### Looking For Team Members\n${
      selectedRoles.map((r: string) => `- **${r}**`).join('\n') || '- Passionate student builders'
    }${commsLink.trim() ? `\n\n### Team Communication\n${commsLink.trim()}` : ''}`;

    const projectPayload = {
      title: teamName.trim(),
      summary: summaryText,
      description: descriptionText,
      category,
      difficulty,
      status: postToExplore ? 'Recruiting' : 'In Progress',
      technologies: technologies.length > 0 ? technologies : ['Full Stack'],
      required_skills: technologies.length > 0 ? technologies : ['Software Engineering'],
      desired_roles: selectedRoles.length > 0 ? selectedRoles : ['Developer'],
      current_team_size: 1,
      desired_team_size: Number(desiredTeamSize) || 4,
      problem_statement_id: problemId,
      owner_id: authenticatedUserId,
    };

    let createdProject: any = null;

    // 4. Insert into projects table via admin client
    try {
      const { data: dbProj, error: dbErr } = await supabaseAdmin
        .from('projects')
        .insert(projectPayload)
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college
          )
        `)
        .single();

      if (!dbErr && dbProj) {
        createdProject = dbProj;

        // Add owner as accepted team lead in project_members
        try {
          await supabaseAdmin.from('project_members').insert({
            project_id: dbProj.id,
            user_id: authenticatedUserId,
            role: 'Team Lead',
            status: 'Accepted',
          });
        } catch (memErr) {
          console.warn('Notice adding project lead to members:', memErr);
        }
      } else {
        console.warn('Notice inserting into projects table:', dbErr?.message);
      }
    } catch (dbEx) {
      console.warn('Exception inserting into projects table:', dbEx);
    }

    // 5. Fallback project representation if direct insert failed
    if (!createdProject) {
      createdProject = {
        id: `probteam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...projectPayload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner: {
          user_id: authenticatedUserId,
          display_name: userProfile?.display_name || 'Team Lead',
          username: userProfile?.username || 'teamlead',
          avatar_url: userProfile?.avatar_url || null,
          college: userProfile?.college || 'Collegiate Network',
        },
      };
    }

    // 6. Persist to platform_settings.problem_teams_registry for high durability & cross-user visibility
    try {
      const { data: regRow } = await supabaseAdmin
        .from('platform_settings')
        .select('value')
        .eq('key', 'problem_teams_registry')
        .maybeSingle();

      const existingRegistry = Array.isArray(regRow?.value) ? regRow.value : [];
      const updatedRegistry = [
        createdProject,
        ...existingRegistry.filter((p: any) => p.id !== createdProject.id),
      ];

      await supabaseAdmin.from('platform_settings').upsert({
        key: 'problem_teams_registry',
        value: updatedRegistry,
        description: 'Persistent registry of student teams tackling faculty problem statements',
        updated_at: new Date().toISOString(),
      });
    } catch (regErr) {
      console.warn('Notice updating problem_teams_registry:', regErr);
    }

    return NextResponse.json({
      success: true,
      project: createdProject,
    });
  } catch (err: any) {
    console.error('Error in /api/problems/team:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
