import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { parseDeletedHackathons, DeletedHackathonsData } from '@/lib/admin/hackathonSettings';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let dbHackathons: any[] = [];
  let deletedData: DeletedHackathonsData = { deletedIds: [], deletedAt: {} };

  if (isSupabaseConfigured()) {
    try {
      // 1. Fetch deleted hackathons tombstone setting
      const { data: settingRow } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'deleted_hackathons')
        .maybeSingle();

      if (settingRow?.value) {
        deletedData = parseDeletedHackathons(settingRow.value);
      }

      // 2. Fetch database hackathons
      const { data, error } = await client
        .from('hackathons')
        .select(`
          *,
          participants:hackathon_participants(count),
          teams:hackathon_teams(count),
          submissions:hackathon_submissions(count)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbHackathons = data.map((h: any) => ({
          ...h,
          participants_count: h.participants?.[0]?.count ?? 0,
          teams_count: h.teams?.[0]?.count ?? 0,
          submissions_count: h.submissions?.[0]?.count ?? 0,
        }));
      } else {
        const { data: simpleData } = await client
          .from('hackathons')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleData) {
          dbHackathons = simpleData.map((h: any) => ({
            ...h,
            participants_count: 0,
            teams_count: 0,
            submissions_count: 0,
          }));
        }
      }
    } catch (err) {
      console.warn('Error fetching hackathons for admin:', err);
    }
  }

  // Combine DB hackathons with curated catalog for comprehensive admin visibility
  const seenIds = new Set<string>();
  const allHackathons: any[] = [];

  for (const h of dbHackathons) {
    if (h && h.id && !seenIds.has(h.id)) {
      seenIds.add(h.id);
      if (h.join_code) seenIds.add(h.join_code);
      allHackathons.push(h);
    }
  }

  for (const c of CURATED_HACKATHONS) {
    if (c && c.id && !seenIds.has(c.id)) {
      seenIds.add(c.id);
      if (c.join_code) seenIds.add(c.join_code);
      allHackathons.push({
        ...c,
        is_curated: true,
        participants_count: 0,
        teams_count: 0,
        submissions_count: 0,
      });
    }
  }

  const deletedSet = new Set((deletedData.deletedIds || []).map((id) => id.toLowerCase()));

  const activeHackathons = allHackathons.filter(
    (h) => !deletedSet.has(h.id?.toLowerCase()) && (!h.join_code || !deletedSet.has(h.join_code.toLowerCase()))
  );

  const deletedHackathons = allHackathons.filter(
    (h) => deletedSet.has(h.id?.toLowerCase()) || (h.join_code && deletedSet.has(h.join_code.toLowerCase()))
  );

  return NextResponse.json({
    success: true,
    hackathons: activeHackathons,
    deletedHackathons,
    deletedIds: deletedData.deletedIds,
  });
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const hackathonId = body.hackathonId || searchParams.get('id');
    const joinCode = body.joinCode || searchParams.get('join_code');

    if (!hackathonId) {
      return NextResponse.json({ error: 'Hackathon ID is required.' }, { status: 400 });
    }

    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Hackathon deleted successfully (Demo Mode).',
        hackathonId,
        deletedIds: [hackathonId],
      });
    }

    // 1. Fetch title and join_code for audit logging and tombstone registration
    const { data: existing } = await client
      .from('hackathons')
      .select('id, title, organizer, creator_id, join_code, website_url')
      .eq('id', hackathonId)
      .maybeSingle();

    const hackathonTitle = existing?.title || 'Hackathon Event';
    const effectiveJoinCode = existing?.join_code || joinCode;

    // 2. Cascade delete participants, teams, and submissions if any in the database
    try {
      await client.from('hackathon_submissions').delete().eq('hackathon_id', hackathonId);
      await client.from('hackathon_teams').delete().eq('hackathon_id', hackathonId);
      await client.from('hackathon_participants').delete().eq('hackathon_id', hackathonId);
    } catch {
      // Continue to parent deletion
    }

    // 3. Delete the hackathon row from DB
    try {
      await client.from('hackathons').delete().eq('id', hackathonId);
    } catch {
      // Continue to tombstone update
    }

    // 4. Authoritative Platform Tombstone: Record ID in platform_settings['deleted_hackathons']
    let currentDeleted: DeletedHackathonsData = { deletedIds: [], deletedAt: {} };
    try {
      const { data: settingRow } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'deleted_hackathons')
        .maybeSingle();

      if (settingRow?.value) {
        currentDeleted = parseDeletedHackathons(settingRow.value);
      }

      const idsToBlock = [hackathonId];
      if (effectiveJoinCode) idsToBlock.push(effectiveJoinCode);

      const newDeletedIds = Array.from(new Set([...currentDeleted.deletedIds, ...idsToBlock]));
      const newDeletedAt = { ...(currentDeleted.deletedAt || {}) };
      newDeletedAt[hackathonId] = new Date().toISOString();

      await client.from('platform_settings').upsert({
        key: 'deleted_hackathons',
        value: {
          deletedIds: newDeletedIds,
          deletedAt: newDeletedAt,
        },
        description: 'Authoritative registry of deleted hackathons suppressed site-wide',
        updated_at: new Date().toISOString(),
      });

      currentDeleted.deletedIds = newDeletedIds;
    } catch (settingErr) {
      console.warn('Could not update deleted_hackathons platform setting:', settingErr);
    }

    // 5. Record tamper-resistant admin audit log
    await recordAdminAuditLog({
      actorId: auth.user?.id,
      actorEmail: auth.user?.email,
      action: 'DELETE_HACKATHON',
      targetType: 'hackathon',
      targetId: hackathonId,
      details: {
        title: hackathonTitle,
        organizer: existing?.organizer,
        deletedBy: auth.user?.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Hackathon "${hackathonTitle}" was permanently deleted and suppressed across the website.`,
      hackathonId,
      deletedIds: currentDeleted.deletedIds,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete hackathon.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { action, hackathonId } = body;

    if (action === 'restore' && hackathonId) {
      const client = auth.dbClient;

      // Read current deleted_hackathons
      const { data: settingRow } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'deleted_hackathons')
        .maybeSingle();

      const currentDeleted = parseDeletedHackathons(settingRow?.value);
      const updatedIds = currentDeleted.deletedIds.filter(
        (id) => id.toLowerCase() !== hackathonId.toLowerCase()
      );

      await client.from('platform_settings').upsert({
        key: 'deleted_hackathons',
        value: {
          deletedIds: updatedIds,
          deletedAt: currentDeleted.deletedAt || {},
        },
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: 'Hackathon restored successfully.',
        restoredId: hackathonId,
        deletedIds: updatedIds,
      });
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error managing hackathons.' },
      { status: 500 }
    );
  }
}
