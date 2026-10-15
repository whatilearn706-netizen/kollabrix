import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      stats: {
        users: { total: 48, students: 42, teachers: 5, admins: 1, active: 47, suspended: 1 },
        projects: { total: 18, recruiting: 12, in_progress: 4, completed: 2, featured: 4 },
        hackathons: { total: 6, private: 4, public: 2 },
        teams: { total: 14, submissions: 9 },
        auditLogsCount: 24,
      },
      recentLogs: [
        {
          id: 'log-1',
          action: 'EXPLORE_CONFIG_UPDATE',
          target_type: 'settings',
          target_id: 'explore_config',
          actor_email: auth.user?.email || 'admin@college.edu',
          outcome: 'SUCCESS',
          created_at: new Date().toISOString(),
        },
      ],
    });
  }

  try {
    // 1. Users Counts
    const { count: totalUsers } = await client.from('profiles').select('*', { count: 'exact', head: true });
    const { count: totalStudents } = await client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: totalTeachers } = await client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
    const { count: totalAdmins } = await client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    const { count: totalSuspended } = await client.from('profiles').select('*', { count: 'exact', head: true }).or('is_suspended.eq.true,status.eq.suspended');

    // 2. Projects Counts
    const { count: totalProjects } = await client.from('projects').select('*', { count: 'exact', head: true });
    const { count: recruitingProjects } = await client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Recruiting');
    const { count: inProgressProjects } = await client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'In Progress');
    const { count: completedProjects } = await client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Completed');
    let featuredProjects = 0;
    try {
      const { count: feat } = await client.from('projects').select('*', { count: 'exact', head: true }).eq('is_featured', true);
      featuredProjects = feat || 0;
    } catch {}

    // 3. Hackathons Counts
    let totalHackathons = 0;
    let privateHackathons = 0;
    let publicHackathons = 0;
    try {
      const { count: totalHacks } = await client.from('hackathons').select('*', { count: 'exact', head: true });
      totalHackathons = totalHacks || 0;
      const { count: privHacks } = await client.from('hackathons').select('*', { count: 'exact', head: true }).eq('access_type', 'private');
      privateHackathons = privHacks || 0;
      publicHackathons = Math.max(0, totalHackathons - privateHackathons);
    } catch {}

    // 4. Teams & Submissions
    let totalTeams = 0;
    let totalSubmissions = 0;
    try {
      const { count: teams } = await client.from('hackathon_teams').select('*', { count: 'exact', head: true });
      totalTeams = teams || 0;
      const { count: subs } = await client.from('hackathon_submissions').select('*', { count: 'exact', head: true });
      totalSubmissions = subs || 0;
    } catch {}

    // 5. Audit Logs
    let auditLogsCount = 0;
    let recentLogs: any[] = [];
    try {
      const { count: logCount } = await client.from('admin_audit_logs').select('*', { count: 'exact', head: true });
      auditLogsCount = logCount || 0;

      const { data: logs } = await client
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      recentLogs = logs || [];
    } catch {}

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers || 0,
          students: totalStudents || 0,
          teachers: totalTeachers || 0,
          admins: totalAdmins || 0,
          active: Math.max(0, (totalUsers || 0) - (totalSuspended || 0)),
          suspended: totalSuspended || 0,
        },
        projects: {
          total: totalProjects || 0,
          recruiting: recruitingProjects || 0,
          in_progress: inProgressProjects || 0,
          completed: completedProjects || 0,
          featured: featuredProjects,
        },
        hackathons: {
          total: totalHackathons,
          private: privateHackathons,
          public: publicHackathons,
        },
        teams: {
          total: totalTeams,
          submissions: totalSubmissions,
        },
        auditLogsCount,
      },
      recentLogs,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error retrieving platform overview.' },
      { status: 500 }
    );
  }
}
