import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { parseDeletedContent, DeletedContentData } from '@/lib/admin/contentSettings';
import { getMasterControlRecord, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let dbProjects: any[] = [];
  let deletedData: DeletedContentData = { deletedIds: [], deletedTitles: [], deletedAt: {} };

  if (isSupabaseConfigured()) {
    try {
      // 1. Fetch deleted projects tombstone setting from master storage or platform_settings
      try {
        const master = await getMasterControlRecord();
        if (master?.deletedProjects) {
          deletedData = parseDeletedContent(master.deletedProjects);
        }
      } catch {}

      if (!deletedData.deletedIds || deletedData.deletedIds.length === 0) {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'deleted_projects')
          .maybeSingle();

        if (settingRow?.value) {
          deletedData = parseDeletedContent(settingRow.value);
        }
      }

      // 2. Fetch database projects with owner info and counts
      const { data, error } = await client
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college,
            course,
            role
          ),
          members:project_members(count),
          tasks:project_tasks(count),
          applications:project_applications(count)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbProjects = data.map((p: any) => ({
          ...p,
          members_count: p.members?.[0]?.count ?? p.current_team_size ?? 1,
          tasks_count: p.tasks?.[0]?.count ?? 0,
          applications_count: p.applications?.[0]?.count ?? 0,
        }));
      } else {
        const { data: simpleData } = await client
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleData) {
          dbProjects = simpleData.map((p: any) => ({
            ...p,
            members_count: p.current_team_size ?? 1,
            tasks_count: 0,
            applications_count: 0,
          }));
        }
      }
    } catch (err) {
      console.warn('Error loading projects from Supabase in admin:', err);
    }
  }

  const deletedSet = new Set([
    ...deletedData.deletedIds.map((id) => id.trim().toLowerCase()),
    ...(deletedData.deletedTitles || []).map((t) => t.trim().toLowerCase()),
  ]);

  // Merge demo projects if not in DB
  const existingIds = new Set(dbProjects.map((p) => p.id));
  const merged = [...dbProjects];

  for (const demo of DEMO_PROJECTS) {
    if (!existingIds.has(demo.id)) {
      merged.push({
        ...demo,
        is_demo: true,
        members_count: demo.current_team_size || 1,
        tasks_count: 0,
        applications_count: 0,
      });
    }
  }

  // Filter out any tombstoned/deleted projects
  const filtered = merged.filter((p) => {
    const idMatch = p.id && deletedSet.has(p.id.toLowerCase());
    const titleMatch = p.title && deletedSet.has(p.title.trim().toLowerCase());
    return !idMatch && !titleMatch;
  });

  return NextResponse.json({
    projects: filtered,
    deletedIds: deletedData.deletedIds,
    deletedTitles: deletedData.deletedTitles,
    total: filtered.length,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    let projectId: string | undefined;
    let reqTitle: string | undefined;
    let reason: string | undefined;

    try {
      const body = await request.json();
      projectId = body?.projectId;
      reqTitle = body?.title;
      reason = body?.reason;
    } catch {
      const url = new URL(request.url);
      projectId = url.searchParams.get('projectId') || undefined;
      reqTitle = url.searchParams.get('title') || undefined;
      reason = url.searchParams.get('reason') || undefined;
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required for administrative deletion.' },
        { status: 400 }
      );
    }

    const client = auth.dbClient;

    // 1. Fetch title and owner for audit logging
    const { data: existing } = await client
      .from('projects')
      .select('id, title, owner_id')
      .eq('id', projectId)
      .maybeSingle();

    const projectTitle = reqTitle || existing?.title || 'Project Idea';
    const ownerId = existing?.owner_id;

    // 2. Cascade delete dependent tables
    if (isSupabaseConfigured()) {
      try {
        await client.from('project_tasks').delete().eq('project_id', projectId);
      } catch {}
      try {
        await client.from('project_milestones').delete().eq('project_id', projectId);
      } catch {}
      try {
        await client.from('project_discussions').delete().eq('project_id', projectId);
      } catch {}
      try {
        await client.from('project_members').delete().eq('project_id', projectId);
      } catch {}
      try {
        await client.from('project_applications').delete().eq('project_id', projectId);
      } catch {}
      try {
        await client.from('project_mentoring_notes').delete().eq('project_id', projectId);
      } catch {}
      try {
        await client.from('projects').delete().eq('id', projectId);
      } catch {}
    }

    // 3. Platform Tombstone: Record in master storage & platform_settings['deleted_projects']
    let currentDeleted: DeletedContentData = { deletedIds: [], deletedTitles: [], deletedAt: {} };
    if (isSupabaseConfigured()) {
      try {
        try {
          const master = await getMasterControlRecord();
          if (master?.deletedProjects) {
            currentDeleted = parseDeletedContent(master.deletedProjects);
          }
        } catch {}

        if (!currentDeleted.deletedIds || currentDeleted.deletedIds.length === 0) {
          const { data: settingRow } = await client
            .from('platform_settings')
            .select('value')
            .eq('key', 'deleted_projects')
            .maybeSingle();

          if (settingRow?.value) {
            currentDeleted = parseDeletedContent(settingRow.value);
          }
        }

        const idsToBlock = [projectId, projectId.toLowerCase()];
        const titlesToBlock = [...(currentDeleted.deletedTitles || [])];
        if (projectTitle && projectTitle !== 'Project Idea') {
          titlesToBlock.push(projectTitle.trim().toLowerCase());
          idsToBlock.push(projectTitle.trim().toLowerCase());
        }

        const newDeletedIds = Array.from(new Set([...currentDeleted.deletedIds, ...idsToBlock]));
        const newDeletedTitles = Array.from(new Set(titlesToBlock));
        const newDeletedAt = { ...(currentDeleted.deletedAt || {}) };
        newDeletedAt[projectId] = new Date().toISOString();

        const tombstoneVal = {
          deletedIds: newDeletedIds,
          deletedTitles: newDeletedTitles,
          deletedAt: newDeletedAt,
        };

        await updateMasterControlSubkey('deletedProjects', tombstoneVal);

        try {
          await client.from('platform_settings').upsert({
            key: 'deleted_projects',
            value: tombstoneVal,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      } catch (err) {
        console.warn('Tombstone save notice for deleted project:', err);
      }
    }

    // 4. Record Admin Audit Log
    try {
      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'PROJECT_DELETED_BY_ADMIN',
        targetType: 'project',
        targetId: projectId,
        details: {
          project_title: projectTitle,
          owner_id: ownerId,
          reason: reason || 'Administrative removal of project idea',
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Project "${projectTitle}" was successfully removed by platform administrator.`,
      deletedId: projectId,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete project.' },
      { status: 500 }
    );
  }
}
