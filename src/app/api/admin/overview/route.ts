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
    // Run all database count queries concurrently via Promise.allSettled for ultra-fast response
    const [
      usersRes,
      studentsRes,
      teachersRes,
      adminsRes,
      suspendedRes,
      projsRes,
      recruitingRes,
      inProgRes,
      completedRes,
      featuredRes,
      hacksRes,
      privHacksRes,
      teamsRes,
      subsRes,
      auditCountRes,
      recentLogsRes,
    ] = await Promise.allSettled([
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
      client.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      client.from('profiles').select('*', { count: 'exact', head: true }).or('is_suspended.eq.true,status.eq.suspended'),
      client.from('projects').select('*', { count: 'exact', head: true }),
      client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Recruiting'),
      client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'In Progress'),
      client.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
      client.from('projects').select('*', { count: 'exact', head: true }).eq('is_featured', true),
      client.from('hackathons').select('*', { count: 'exact', head: true }),
      client.from('hackathons').select('*', { count: 'exact', head: true }).eq('access_type', 'private'),
      client.from('hackathon_teams').select('*', { count: 'exact', head: true }),
      client.from('hackathon_submissions').select('*', { count: 'exact', head: true }),
      client.from('admin_audit_logs').select('*', { count: 'exact', head: true }),
      client.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(6),
    ]);

    const getCount = (r: PromiseSettledResult<any>) =>
      r.status === 'fulfilled' && typeof r.value?.count === 'number' ? r.value.count : 0;

    const totalUsers = getCount(usersRes);
    const totalStudents = getCount(studentsRes);
    const totalTeachers = getCount(teachersRes);
    const totalAdmins = getCount(adminsRes);
    const totalSuspended = getCount(suspendedRes);

    const totalProjects = getCount(projsRes);
    const recruitingProjects = getCount(recruitingRes);
    const inProgressProjects = getCount(inProgRes);
    const completedProjects = getCount(completedRes);
    const featuredProjects = getCount(featuredRes);

    const totalHackathons = getCount(hacksRes);
    const privateHackathons = getCount(privHacksRes);
    const publicHackathons = Math.max(0, totalHackathons - privateHackathons);

    const totalTeams = getCount(teamsRes);
    const totalSubmissions = getCount(subsRes);
    const auditLogsCount = getCount(auditCountRes);
    const recentLogs = recentLogsRes.status === 'fulfilled' && Array.isArray(recentLogsRes.value?.data)
      ? recentLogsRes.value.data
      : [];

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
