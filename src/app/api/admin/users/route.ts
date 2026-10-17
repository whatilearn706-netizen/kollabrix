import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { AdminUserListItem } from '@/types/database';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim().toLowerCase() || '';
  const role = searchParams.get('role') || 'all';
  const status = searchParams.get('status') || 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));

  const client = auth.dbClient;

  if (!isSupabaseConfigured()) {
    // Curated mock data for local demonstration
    const mockUsers: AdminUserListItem[] = [
      {
        user_id: auth.user?.id || 'admin-user-id',
        email: auth.user?.email || 'admin@college.edu',
        username: 'college_admin',
        display_name: 'Lead Administrator',
        role: 'admin',
        status: 'active',
        is_suspended: false,
        college: 'State Engineering College',
        course: 'Computer Science & Engineering',
        academic_year: 'Faculty Administrator',
        skills: ['Platform Governance', 'Next.js', 'PostgreSQL'],
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-10-15T12:00:00Z',
        owned_projects_count: 1,
        memberships_count: 0,
        hackathon_teams_count: 0,
        owned_projects: [{ id: 'p-1', title: 'Campus Collaborative Hub', status: 'In Progress' }],
        memberships: [],
        hackathon_teams: [],
      },
      {
        user_id: 'user-stud-1',
        email: 'alex.rivera@student.college.edu',
        username: 'alex_rivera',
        display_name: 'Alex Rivera',
        role: 'student',
        status: 'active',
        is_suspended: false,
        college: 'State Engineering College',
        course: 'B.Tech IT',
        academic_year: '3rd Year (Junior)',
        skills: ['React', 'TypeScript', 'TailwindCSS'],
        created_at: '2026-09-10T14:30:00Z',
        updated_at: '2026-10-14T11:20:00Z',
        owned_projects_count: 1,
        memberships_count: 2,
        hackathon_teams_count: 1,
        owned_projects: [{ id: 'proj-101', title: 'Smart Campus Shuttle Tracker', status: 'Recruiting' }],
        memberships: [
          { id: 'm-1', project_id: 'proj-202', project_title: 'AI Exam Prep Partner', role: 'Frontend Developer' },
        ],
        hackathon_teams: [
          { id: 'ht-1', team_name: 'CodeForgers', hackathon_id: 'h-1', hackathon_title: 'Spring Collegiate Hackathon', role: 'Leader' },
        ],
      },
      {
        user_id: 'user-stud-2',
        email: 'priya.sharma@student.college.edu',
        username: 'priya_dev',
        display_name: 'Priya Sharma',
        role: 'student',
        status: 'active',
        is_suspended: false,
        college: 'State Engineering College',
        course: 'B.Tech AI & Data Science',
        academic_year: '4th Year (Senior)',
        skills: ['Python', 'PyTorch', 'FastAPI'],
        created_at: '2026-09-12T09:15:00Z',
        updated_at: '2026-10-12T16:45:00Z',
        owned_projects_count: 0,
        memberships_count: 1,
        hackathon_teams_count: 1,
        owned_projects: [],
        memberships: [
          { id: 'm-2', project_id: 'proj-202', project_title: 'AI Exam Prep Partner', role: 'AI/ML Engineer' },
        ],
        hackathon_teams: [
          { id: 'ht-2', team_name: 'NeuralKnights', hackathon_id: 'h-1', hackathon_title: 'Spring Collegiate Hackathon', role: 'Member' },
        ],
      },
      {
        user_id: 'user-stud-3',
        email: 'jordan.lee@student.college.edu',
        username: 'jordan_lee',
        display_name: 'Jordan Lee',
        role: 'student',
        status: 'suspended',
        is_suspended: true,
        suspension_reason: 'Spam submissions reported during community review.',
        college: 'State Engineering College',
        course: 'B.Tech CS',
        academic_year: '2nd Year (Sophomore)',
        skills: ['Node.js', 'MongoDB'],
        created_at: '2026-09-15T08:00:00Z',
        updated_at: '2026-10-10T10:00:00Z',
        owned_projects_count: 0,
        memberships_count: 1,
        hackathon_teams_count: 0,
        owned_projects: [],
        memberships: [
          { id: 'm-3', project_id: 'proj-303', project_title: 'Open Robotics Lab', role: 'Contributor' },
        ],
        hackathon_teams: [],
      },
    ];

    let filtered = [...mockUsers];
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.display_name.toLowerCase().includes(search) ||
          u.username.toLowerCase().includes(search) ||
          (u.email && u.email.toLowerCase().includes(search))
      );
    }
    if (role !== 'all') {
      filtered = filtered.filter((u) => u.role === role);
    }
    if (status !== 'all') {
      filtered = filtered.filter((u) => (status === 'suspended' ? u.is_suspended : !u.is_suspended));
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      users: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  try {
    // 1. Build Base Profiles Query
    let query = client
      .from('profiles')
      .select('*', { count: 'exact' });

    if (role !== 'all') {
      query = query.eq('role', role);
    }

    if (status === 'suspended') {
      query = query.or('is_suspended.eq.true,status.eq.suspended');
    } else if (status === 'active') {
      query = query.eq('is_suspended', false).neq('status', 'suspended');
    }

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: profiles, count, error: listErr } = await query;

    if (listErr) {
      throw new Error(listErr.message);
    }

    // Fetch platform_settings suspended users registry and college verifications
    let suspendedUserIds: string[] = [];
    let suspendedUsersMap: Record<string, any> = {};
    const verifiedUserIds = new Set<string>();
    try {
      const { data: settingsRows } = await client
        .from('platform_settings')
        .select('key, value')
        .in('key', ['match_scoring_config', 'linkedin_college_verifications']);

      if (Array.isArray(settingsRows)) {
        for (const row of settingsRows) {
          if (row.key === 'match_scoring_config' && row.value) {
            if (Array.isArray(row.value.suspended_user_ids)) {
              suspendedUserIds = row.value.suspended_user_ids;
            }
            if (row.value.suspended_users) {
              suspendedUsersMap = row.value.suspended_users;
            }
          } else if (row.key === 'linkedin_college_verifications' && Array.isArray(row.value)) {
            row.value.forEach((v: any) => {
              if (v.userId) verifiedUserIds.add(v.userId);
              if (v.username) verifiedUserIds.add(v.username.toLowerCase().trim());
            });
          }
        }
      }
    } catch {}

    const userList: AdminUserListItem[] = [];

    // 2. Fetch project memberships and hackathon teams for the current page users
    for (const p of profiles || []) {
      let ownedProjects: Array<{ id: string; title: string; status: string }> = [];
      let memberships: Array<{ id: string; project_id: string; project_title: string; role: string }> = [];
      let hackathonTeams: Array<{ id: string; team_name: string; hackathon_id: string; hackathon_title: string; role: string }> = [];

      try {
        // Owned projects
        const { data: owned } = await client
          .from('projects')
          .select('id, title, status')
          .eq('owner_id', p.user_id);
        if (owned) ownedProjects = owned;

        // Project memberships
        const { data: mems } = await client
          .from('project_members')
          .select(`
            id,
            role,
            project_id,
            project:projects!project_members_project_id_fkey(id, title)
          `)
          .eq('user_id', p.user_id);

        if (mems) {
          memberships = mems.map((m: any) => ({
            id: m.id,
            project_id: m.project_id,
            project_title: m.project?.title || 'Project',
            role: m.role,
          }));
        }

        // Hackathon teams
        const { data: hTeams } = await client
          .from('hackathon_team_members')
          .select(`
            id,
            role,
            team:hackathon_teams!hackathon_team_members_team_id_fkey(
              id,
              team_name,
              hackathon:hackathons!hackathon_teams_hackathon_id_fkey(id, title)
            )
          `)
          .eq('user_id', p.user_id);

        if (hTeams) {
          hackathonTeams = hTeams.map((ht: any) => ({
            id: ht.id,
            team_name: ht.team?.team_name || 'Team',
            hackathon_id: ht.team?.hackathon?.id || '',
            hackathon_title: ht.team?.hackathon?.title || 'Hackathon',
            role: ht.role,
          }));
        }
      } catch (err) {
        // Non-blocking
      }

      const isSuspendedInSetting = suspendedUserIds.includes(p.user_id);
      const isSuspended = Boolean(p.is_suspended || isSuspendedInSetting);
      const userStatus = isSuspended ? 'suspended' : (p.status || 'active');
      const userReason = p.suspension_reason || suspendedUsersMap[p.user_id]?.reason || null;
      const isCollegeVerified =
        verifiedUserIds.has(p.user_id) ||
        Boolean(p.username && verifiedUserIds.has(p.username.toLowerCase().trim()));

      userList.push({
        user_id: p.user_id,
        username: p.username,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        role: p.role || 'student',
        status: userStatus,
        is_suspended: isSuspended,
        suspension_reason: userReason,
        college: p.college,
        college_verified: isCollegeVerified,
        course: p.course,
        academic_year: p.academic_year,
        skills: p.skills || [],
        created_at: p.created_at,
        updated_at: p.updated_at,
        owned_projects_count: ownedProjects.length,
        memberships_count: memberships.length,
        hackathon_teams_count: hackathonTeams.length,
        owned_projects: ownedProjects,
        memberships: memberships,
        hackathon_teams: hackathonTeams,
      });
    }

    return NextResponse.json({
      success: true,
      users: userList,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error fetching user moderation list.' },
      { status: 500 }
    );
  }
}
