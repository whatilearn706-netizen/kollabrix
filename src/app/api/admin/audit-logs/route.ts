import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim().toLowerCase() || '';
  const action = searchParams.get('action') || 'all';
  const targetType = searchParams.get('targetType') || 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '15', 10)));

  const client = auth.dbClient;

  if (!isSupabaseConfigured()) {
    const mockLogs = [
      {
        id: 'log-1',
        actor_id: auth.user?.id,
        actor_email: auth.user?.email || 'admin@college.edu',
        action: 'MATCH_SETTINGS_UPDATED',
        target_type: 'settings',
        target_id: 'match_scoring_config',
        details: { weights: { required_skills: 50, desired_roles: 30, category_interests: 15, completeness_availability: 5 } },
        outcome: 'SUCCESS',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'log-2',
        actor_id: auth.user?.id,
        actor_email: auth.user?.email || 'admin@college.edu',
        action: 'USER_RESTORED',
        target_type: 'user',
        target_id: 'user-stud-2',
        details: { target_username: 'priya_dev' },
        outcome: 'SUCCESS',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'log-3',
        actor_id: auth.user?.id,
        actor_email: auth.user?.email || 'admin@college.edu',
        action: 'USER_SUSPENDED',
        target_type: 'user',
        target_id: 'user-stud-3',
        details: { target_username: 'jordan_lee', reason: 'Spam submissions reported during community review.' },
        outcome: 'SUCCESS',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'log-4',
        actor_id: auth.user?.id,
        actor_email: auth.user?.email || 'admin@college.edu',
        action: 'PROJECT_FEATURED',
        target_type: 'project',
        target_id: 'proj-101',
        details: { project_title: 'Smart Campus Shuttle Tracker' },
        outcome: 'SUCCESS',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    let filtered = [...mockLogs];
    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(search) ||
          l.target_type.toLowerCase().includes(search) ||
          (l.actor_email && l.actor_email.toLowerCase().includes(search))
      );
    }
    if (action !== 'all') {
      filtered = filtered.filter((l) => l.action === action);
    }
    if (targetType !== 'all') {
      filtered = filtered.filter((l) => l.target_type === targetType);
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      logs: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  }

  try {
    let query = client
      .from('admin_audit_logs')
      .select('*', { count: 'exact' });

    if (action !== 'all') {
      query = query.eq('action', action);
    }
    if (targetType !== 'all') {
      query = query.eq('target_type', targetType);
    }
    if (search) {
      query = query.or(`action.ilike.%${search}%,actor_email.ilike.%${search}%,target_type.ilike.%${search}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: logs, count, error: listErr } = await query;

    if (listErr) {
      throw new Error(listErr.message);
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit) || 1,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error retrieving audit logs.' },
      { status: 500 }
    );
  }
}
