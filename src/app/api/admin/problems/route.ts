import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { DEMO_PROBLEMS } from '@/data/mockProblems';
import { parseDeletedContent, DeletedContentData } from '@/lib/admin/contentSettings';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let dbProblems: any[] = [];
  let deletedData: DeletedContentData = { deletedIds: [], deletedTitles: [], deletedAt: {} };

  if (isSupabaseConfigured()) {
    try {
      // 1. Fetch deleted problems tombstone setting
      const { data: settingRow } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'deleted_problems')
        .maybeSingle();

      if (settingRow?.value) {
        deletedData = parseDeletedContent(settingRow.value);
      }

      // 2. Fetch database problem statements with author info and counts
      const { data, error } = await client
        .from('problem_statements')
        .select(`
          *,
          author:profiles!problem_statements_author_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college,
            course,
            role
          ),
          applications:problem_applications(count),
          projects:projects(count)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbProblems = data.map((p: any) => ({
          ...p,
          applications_count: p.applications?.[0]?.count ?? 0,
          projects_count: p.projects?.[0]?.count ?? 0,
        }));
      } else {
        const { data: simpleData } = await client
          .from('problem_statements')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleData) {
          dbProblems = simpleData.map((p: any) => ({
            ...p,
            applications_count: 0,
            projects_count: 0,
          }));
        }
      }
    } catch (err) {
      console.warn('Error loading problem statements from Supabase in admin:', err);
    }

    // Merge community problem statements from platform_settings
    try {
      const { data: commRow } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'community_problem_statements')
        .maybeSingle();

      if (commRow?.value && Array.isArray(commRow.value)) {
        const commList = commRow.value;
        const existingIds = new Set(dbProblems.map((p) => p.id));
        for (const cp of commList) {
          if (cp && cp.id && !existingIds.has(cp.id)) {
            dbProblems.unshift({
              ...cp,
              applications_count: 0,
              projects_count: 0,
            });
          }
        }
      }
    } catch {}
  }

  const deletedSet = new Set([
    ...deletedData.deletedIds.map((id) => id.trim().toLowerCase()),
    ...(deletedData.deletedTitles || []).map((t) => t.trim().toLowerCase()),
  ]);

  // Merge demo problems if not in DB
  const existingIds = new Set(dbProblems.map((p) => p.id));
  const merged = [...dbProblems];

  for (const demo of DEMO_PROBLEMS) {
    if (!existingIds.has(demo.id)) {
      merged.push({
        ...demo,
        is_demo: true,
        applications_count: 0,
        projects_count: 0,
      });
    }
  }

  // Filter out any tombstoned/deleted problems
  const filtered = merged.filter((p) => {
    const idMatch = p.id && deletedSet.has(p.id.toLowerCase());
    const titleMatch = p.title && deletedSet.has(p.title.trim().toLowerCase());
    return !idMatch && !titleMatch;
  });

  return NextResponse.json({
    problems: filtered,
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
    let problemId: string | undefined;
    let reqTitle: string | undefined;
    let reason: string | undefined;

    try {
      const body = await request.json();
      problemId = body?.problemId;
      reqTitle = body?.title;
      reason = body?.reason;
    } catch {
      const url = new URL(request.url);
      problemId = url.searchParams.get('problemId') || undefined;
      reqTitle = url.searchParams.get('title') || undefined;
      reason = url.searchParams.get('reason') || undefined;
    }

    if (!problemId) {
      return NextResponse.json(
        { error: 'Problem statement ID is required for administrative deletion.' },
        { status: 400 }
      );
    }

    const client = auth.dbClient;

    // 1. Fetch title and author for audit logging
    const { data: existing } = await client
      .from('problem_statements')
      .select('id, title, author_id')
      .eq('id', problemId)
      .maybeSingle();

    const problemTitle = reqTitle || existing?.title || 'Problem Statement';
    const authorId = existing?.author_id;

    // 2. Cascade delete dependent tables
    if (isSupabaseConfigured()) {
      try {
        await client.from('problem_applications').delete().eq('problem_statement_id', problemId);
      } catch {}
      try {
        await client
          .from('projects')
          .update({ problem_statement_id: null })
          .eq('problem_statement_id', problemId);
      } catch {}
      try {
        await client.from('problem_statements').delete().eq('id', problemId);
      } catch {}
      try {
        const { data: commRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'community_problem_statements')
          .maybeSingle();

        if (commRow?.value && Array.isArray(commRow.value)) {
          const updatedComm = commRow.value.filter((p: any) => p.id !== problemId);
          await client.from('platform_settings').upsert({
            key: 'community_problem_statements',
            value: updatedComm,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {}
    }

    // 3. Platform Tombstone: Record in platform_settings['deleted_problems']
    let currentDeleted: DeletedContentData = { deletedIds: [], deletedTitles: [], deletedAt: {} };
    if (isSupabaseConfigured()) {
      try {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'deleted_problems')
          .maybeSingle();

        if (settingRow?.value) {
          currentDeleted = parseDeletedContent(settingRow.value);
        }

        const idsToBlock = [problemId, problemId.toLowerCase()];
        const titlesToBlock = [...(currentDeleted.deletedTitles || [])];
        if (problemTitle && problemTitle !== 'Problem Statement') {
          titlesToBlock.push(problemTitle.trim().toLowerCase());
          idsToBlock.push(problemTitle.trim().toLowerCase());
        }

        const newDeletedIds = Array.from(new Set([...currentDeleted.deletedIds, ...idsToBlock]));
        const newDeletedTitles = Array.from(new Set(titlesToBlock));
        const newDeletedAt = { ...(currentDeleted.deletedAt || {}) };
        newDeletedAt[problemId] = new Date().toISOString();

        await client.from('platform_settings').upsert({
          key: 'deleted_problems',
          value: {
            deletedIds: newDeletedIds,
            deletedTitles: newDeletedTitles,
            deletedAt: newDeletedAt,
          },
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Tombstone save notice for deleted problem statement:', err);
      }
    }

    // 4. Record Admin Audit Log
    try {
      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'FACULTY_PROBLEM_DELETED_BY_ADMIN',
        targetType: 'problem_statement',
        targetId: problemId,
        details: {
          problem_title: problemTitle,
          author_id: authorId,
          reason: reason || 'Administrative removal of faculty problem statement',
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Faculty problem statement "${problemTitle}" was successfully removed by platform administrator.`,
      deletedId: problemId,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete problem statement.' },
      { status: 500 }
    );
  }
}
