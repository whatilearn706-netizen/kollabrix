import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const service = getServiceClient();
    if (!service) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    let currentUserId: string | null = null;
    try {
      const serverClient = createServerSupabaseClient();
      const { data: { user } } = await serverClient.auth.getUser();
      currentUserId = user?.id || null;
    } catch {}

    if (action === 'match') {
      const { requiredSkills = [], desiredRoles = [], userCollege = '' } = body;
      const targetTokens = new Set<string>(
        [...requiredSkills, ...desiredRoles]
          .flatMap((s: string) => String(s || '').toLowerCase().split(/[\s,/&]+/))
          .filter((t) => t.length >= 2)
      );

      const { data: profiles, error } = await service
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, college, skills, preferred_roles, course, academic_year, status')
        .eq('status', 'active')
        .limit(80);

      if (error || !profiles) {
        return NextResponse.json({ success: true, matches: [] });
      }

      const normCollege = String(userCollege || '').trim().toLowerCase();

      const scored = profiles
        .filter((p) => p.user_id && p.user_id !== currentUserId)
        .map((p) => {
          const pSkills: string[] = Array.isArray(p.skills) ? p.skills : [];
          const pRoles: string[] = Array.isArray(p.preferred_roles) ? p.preferred_roles : [];
          const matchedSkills: string[] = [];
          let score = 0;

          for (const sk of pSkills) {
            const lower = sk.toLowerCase();
            if (Array.from(targetTokens).some((tok) => lower.includes(tok) || tok.includes(lower))) {
              matchedSkills.push(sk);
              score += 20;
            }
          }
          for (const rl of pRoles) {
            const lower = rl.toLowerCase();
            if (Array.from(targetTokens).some((tok) => lower.includes(tok) || tok.includes(lower))) {
              score += 15;
            }
          }
          if (normCollege && p.college && p.college.toLowerCase().includes(normCollege)) {
            score += 25;
          }
          if (pSkills.length > 0 && score === 0) {
            score = 5;
          }

          return {
            user_id: p.user_id,
            username: p.username,
            display_name: p.display_name || p.username || 'Campus Builder',
            avatar_url: p.avatar_url,
            college: p.college || 'Collegiate Network',
            course: p.course,
            academic_year: p.academic_year,
            skills: pSkills.slice(0, 6),
            preferred_roles: pRoles.slice(0, 3),
            matchedSkills: matchedSkills.slice(0, 4),
            matchScore: Math.min(99, Math.max(45, score)),
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

      return NextResponse.json({ success: true, matches: scored });
    }

    if (action === 'launch_workspace') {
      if (!currentUserId) {
        return NextResponse.json(
          { success: false, error: 'Please sign in to launch a live project workspace.' },
          { status: 401 }
        );
      }

      const { blueprint, invitedUserIds = [], sessionId } = body;
      if (!blueprint?.title) {
        return NextResponse.json({ success: false, error: 'Blueprint is required.' }, { status: 400 });
      }

      // Ensure profile exists for foreign key safety
      const { data: ownerProfile } = await service
        .from('profiles')
        .select('user_id, display_name')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (!ownerProfile) {
        return NextResponse.json(
          { success: false, error: 'Please complete your profile setup before creating a workspace.' },
          { status: 400 }
        );
      }

      const { data: project, error: projErr } = await service
        .from('projects')
        .insert({
          owner_id: currentUserId,
          title: blueprint.title,
          summary: blueprint.tagline || blueprint.summary?.slice(0, 140),
          description: `${blueprint.summary}\n\nWinning Twist: ${blueprint.winningTwist || ''}`,
          category: blueprint.category || 'Web Development',
          difficulty: blueprint.difficulty || 'Intermediate',
          technologies: blueprint.technologies || [],
          required_skills: blueprint.technologies || [],
          desired_roles: blueprint.desired_roles || [],
          current_team_size: 1,
          desired_team_size: Math.max(2, (blueprint.desired_roles?.length || 2) + 1),
          status: 'open',
        })
        .select('id, title')
        .single();

      if (projErr || !project) {
        return NextResponse.json({ success: false, error: projErr?.message || 'Failed to create project' }, { status: 500 });
      }

      // Add creator to project_members
      await service.from('project_members').insert({
        project_id: project.id,
        user_id: currentUserId,
        role: 'owner',
      });

      // Populate milestones & Kanban tasks from AI Spark milestones
      const milestones: Array<{ title: string; duration: string; deliverables: string }> =
        Array.isArray(blueprint.milestones) ? blueprint.milestones : [];

      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        const { data: ms } = await service
          .from('project_milestones')
          .insert({
            project_id: project.id,
            title: m.title,
            description: `${m.duration}: ${m.deliverables}`,
            status: i === 0 ? 'In Progress' : 'Upcoming',
            created_by: currentUserId,
          })
          .select('id')
          .single();

        await service.from('project_tasks').insert({
          project_id: project.id,
          milestone_id: ms?.id || null,
          title: m.deliverables?.slice(0, 90) || m.title,
          description: `Generated by AI Spark (${m.duration}): ${m.deliverables}`,
          status: i === 0 ? 'In Progress' : 'To Do',
          priority: i === 0 ? 'High' : 'Medium',
          creator_id: currentUserId,
        });
      }

      // Notify any selected matched teammates
      if (Array.isArray(invitedUserIds) && invitedUserIds.length > 0) {
        const senderName = ownerProfile.display_name || 'A campus builder';
        const notifRows = invitedUserIds.slice(0, 6).map((uid: string) => ({
          user_id: uid,
          type: 'project_invite',
          title: `Squad Invite: ${project.title}`,
          message: `${senderName} invited you to join "${project.title}" (matched via AI Spark).`,
          link: `/projects/${project.id}`,
          is_read: false,
        }));
        try {
          await service.from('notifications').insert(notifRows);
        } catch {}
      }

      if (sessionId) {
        try {
          await service
            .from('spark_sessions')
            .update({ linked_project_id: project.id, updated_at: new Date().toISOString() })
            .eq('id', sessionId)
            .eq('user_id', currentUserId);
        } catch {}
      }

      return NextResponse.json({
        success: true,
        projectId: project.id,
        workspaceUrl: `/projects/${project.id}/workspace`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Squad Match error' }, { status: 500 });
  }
}
