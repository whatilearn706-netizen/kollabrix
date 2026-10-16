import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let hackathons: any[] = [];

  if (isSupabaseConfigured()) {
    try {
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
        hackathons = data.map((h: any) => ({
          ...h,
          participants_count: h.participants?.[0]?.count ?? 0,
          teams_count: h.teams?.[0]?.count ?? 0,
          submissions_count: h.submissions?.[0]?.count ?? 0,
        }));
      } else {
        // Fallback without relations
        const { data: simpleData } = await client
          .from('hackathons')
          .select('*')
          .order('created_at', { ascending: false });

        if (simpleData) {
          hackathons = simpleData.map((h: any) => ({
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

  return NextResponse.json({
    success: true,
    hackathons,
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

    if (!hackathonId) {
      return NextResponse.json({ error: 'Hackathon ID is required.' }, { status: 400 });
    }

    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Hackathon deleted successfully (Demo Mode).',
        hackathonId,
      });
    }

    // 1. Fetch title for audit logging
    const { data: existing } = await client
      .from('hackathons')
      .select('id, title, organizer, creator_id')
      .eq('id', hackathonId)
      .maybeSingle();

    const hackathonTitle = existing?.title || 'Unknown Hackathon';

    // 2. Cascade delete participants, teams, and submissions if any
    try {
      await client.from('hackathon_submissions').delete().eq('hackathon_id', hackathonId);
      await client.from('hackathon_teams').delete().eq('hackathon_id', hackathonId);
      await client.from('hackathon_participants').delete().eq('hackathon_id', hackathonId);
    } catch {
      // Continue to parent deletion
    }

    // 3. Delete the hackathon
    const { error: deleteErr } = await client
      .from('hackathons')
      .delete()
      .eq('id', hackathonId);

    if (deleteErr) {
      throw new Error(deleteErr.message);
    }

    // 4. Record tamper-resistant admin audit log
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
      message: `Hackathon "${hackathonTitle}" deleted successfully.`,
      hackathonId,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete hackathon.' },
      { status: 500 }
    );
  }
}
