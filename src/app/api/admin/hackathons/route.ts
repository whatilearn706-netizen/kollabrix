import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { parseDeletedHackathons, DeletedHackathonsData } from '@/lib/admin/hackathonSettings';
import {
  getMasterControlRecord,
  getMasterControlSubkey,
  updateMasterControlSubkey,
} from '@/lib/admin/masterConfigStorage';

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
      // 1. Fetch deleted hackathons tombstone setting from master storage or platform_settings
      try {
        const master = await getMasterControlRecord();
        if (master?.deletedHackathons) {
          deletedData = parseDeletedHackathons(master.deletedHackathons);
        }
      } catch {}

      if (!deletedData.deletedIds || deletedData.deletedIds.length === 0) {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'deleted_hackathons')
          .maybeSingle();

        if (settingRow?.value) {
          deletedData = parseDeletedHackathons(settingRow.value);
        }
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
    const reqTitle = body.title || searchParams.get('title');

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

    const hackathonTitle = reqTitle || existing?.title || 'Hackathon Event';
    const effectiveJoinCode = existing?.join_code || joinCode;
    const effectiveUrlCode = existing?.website_url ? existing.website_url.split('/h/')[1]?.split(/[?#]/)[0] : null;

    // 2. Cascade delete participants, teams, and submissions if any in the database
    try {
      await client.from('hackathon_submissions').delete().eq('hackathon_id', hackathonId);
      await client.from('hackathon_teams').delete().eq('hackathon_id', hackathonId);
      await client.from('hackathon_participants').delete().eq('hackathon_id', hackathonId);
    } catch {
      // Continue to parent deletion
    }

    // 3. Delete the hackathon row from DB (and archive if hard delete is restricted)
    try {
      await client.from('hackathons').delete().eq('id', hackathonId);
    } catch {
      // Continue to tombstone update
    }

    try {
      if (effectiveJoinCode) {
        await client.from('hackathons').delete().eq('join_code', effectiveJoinCode);
      }
    } catch {}

    try {
      await client.from('hackathons').update({ status: 'Archived', is_join_active: false }).eq('id', hackathonId);
    } catch {}

    // 4. Authoritative Platform Tombstone: Record ID, Join Code, and Title in master storage & platform_settings
    let currentDeleted: DeletedHackathonsData = { deletedIds: [], deletedTitles: [], deletedAt: {} };
    try {
      try {
        const master = await getMasterControlRecord();
        if (master?.deletedHackathons) {
          currentDeleted = parseDeletedHackathons(master.deletedHackathons);
        }
      } catch {}

      if (!currentDeleted.deletedIds || currentDeleted.deletedIds.length === 0) {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'deleted_hackathons')
          .maybeSingle();

        if (settingRow?.value) {
          currentDeleted = parseDeletedHackathons(settingRow.value);
        }
      }

      const idsToBlock = [hackathonId, hackathonId.toLowerCase()];
      if (effectiveJoinCode) {
        idsToBlock.push(effectiveJoinCode);
        idsToBlock.push(effectiveJoinCode.toLowerCase());
      }
      if (effectiveUrlCode) {
        idsToBlock.push(effectiveUrlCode);
        idsToBlock.push(effectiveUrlCode.toLowerCase());
      }

      const titlesToBlock = [...(currentDeleted.deletedTitles || [])];
      if (hackathonTitle && hackathonTitle !== 'Hackathon Event') {
        titlesToBlock.push(hackathonTitle.trim().toLowerCase());
        idsToBlock.push(hackathonTitle.trim().toLowerCase());
      }

      const newDeletedIds = Array.from(new Set([...currentDeleted.deletedIds, ...idsToBlock]));
      const newDeletedTitles = Array.from(new Set(titlesToBlock));
      const newDeletedAt = { ...(currentDeleted.deletedAt || {}) };
      newDeletedAt[hackathonId] = new Date().toISOString();

      const tombstoneVal = {
        deletedIds: newDeletedIds,
        deletedTitles: newDeletedTitles,
        deletedAt: newDeletedAt,
      };

      await updateMasterControlSubkey('deletedHackathons', tombstoneVal);

      try {
        await client.from('platform_settings').upsert({
          key: 'deleted_hackathons',
          value: tombstoneVal,
          description: 'Authoritative registry of deleted hackathons suppressed site-wide',
          updated_at: new Date().toISOString(),
        });
      } catch {}

      currentDeleted.deletedIds = newDeletedIds;
      currentDeleted.deletedTitles = newDeletedTitles;
    } catch (settingErr) {
      console.warn('Could not update deleted_hackathons setting:', settingErr);
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
      message: `Hackathon "${hackathonTitle}" was permanently deleted and suppressed across the platform.`,
      hackathonId,
      deletedIds: currentDeleted.deletedIds,
      deletedTitles: currentDeleted.deletedTitles,
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

    if (action === 'create_sponsored') {
      const client = auth.dbClient;
      const {
        company_name,
        company_logo,
        theme_preset = 'sunset-gold',
        title,
        tagline,
        description = '',
        mode = 'Online',
        location = 'Global Online Hub',
        start_date,
        end_date,
        registration_deadline,
        results_date,
        prize_pool = '₹5,00,000 + Direct PPI Fast-Track Interviews',
        recruitment_perks,
        glow_color = 'gold',
        priority_rank = 10,
        hiring_roles = '',
        hiring_package = '',
        promo_video_url = '',
        custom_cta_text = '',
        themes = ['Enterprise Challenge', 'AI/Cloud Architecture'],
        banner_url,
        access_type = 'public',
      } = body;

      if (!company_name || !title) {
        return NextResponse.json({ error: 'Company name and Hackathon Title are required.' }, { status: 400 });
      }

      const joinCode = `corp-${company_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5)}-${Math.random().toString(36).substring(2, 6)}`;
      const perksArray = Array.isArray(recruitment_perks)
        ? recruitment_perks
        : typeof recruitment_perks === 'string'
        ? recruitment_perks.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['Fast-track interview', 'Direct PPI for top squads', '1:1 Tech Mentorship'];

      const parsedPriority = parseInt(String(priority_rank)) || 10;
      const metaComment = `\n\n<!-- HACKATHON_META:${JSON.stringify({
        is_sponsored: true,
        is_enterprise: true,
        company_name: company_name.trim(),
        sponsor_logo_url: company_logo?.trim() || null,
        theme_preset,
        glow_color,
        priority_rank: parsedPriority,
        hiring_roles: hiring_roles.trim(),
        hiring_package: hiring_package.trim(),
        tagline: tagline?.trim() || '',
        promo_video_url: promo_video_url?.trim() || null,
        custom_cta_text: custom_cta_text?.trim() || null,
        recruitment_perks: perksArray,
        prize_pool: prize_pool.trim(),
        access_type,
        join_code: joinCode,
        min_team_size: 1,
        max_team_size: 4,
        results_date: results_date ? new Date(results_date).toISOString() : null,
      })} -->`;

      const newHackathonPayload = {
        title: title.trim(),
        organizer: `${company_name.trim()} Campus Innovation & Recruitment`,
        description: (description || tagline || title).trim() + metaComment,
        mode,
        location: location.trim() || 'Global Online Hub',
        start_date: new Date(start_date || Date.now()).toISOString(),
        end_date: end_date ? new Date(end_date).toISOString() : null,
        registration_deadline: new Date(registration_deadline || Date.now() + 14 * 86400000).toISOString(),
        results_date: results_date ? new Date(results_date).toISOString() : null,
        eligibility: 'Open to all college students & engineering developers',
        themes: Array.isArray(themes) && themes.length > 0 ? themes : ['Enterprise Innovation', 'Cloud/AI Architecture'],
        prize_pool: prize_pool.trim() || '₹5,00,000 + Direct PPI Interviews',
        website_url: `https://kollabrix.in/h/${joinCode}`,
        banner_url: banner_url?.trim() || null,
        company_logo: company_logo?.trim() || null,
        company_name: company_name.trim(),
        is_verified: true,
        is_sponsored: true,
        priority_rank: parsedPriority,
        hiring_roles: hiring_roles.trim(),
        status: 'Published',
        creator_id: auth.user?.id || 'c86ce05f-24de-4a1a-a45f-944d4180b508',
      };

      let insertedRecord: any = null;
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await client
            .from('hackathons')
            .insert(newHackathonPayload)
            .select('*')
            .single();
          if (!error && data) {
            insertedRecord = data;
          }
        } catch (dbErr) {
          console.warn('DB insert fallback note:', dbErr);
        }
      }

      if (!insertedRecord) {
        insertedRecord = {
          id: `hack-corp-${Date.now()}`,
          ...newHackathonPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          join_code: joinCode,
          is_sponsored: true,
          is_enterprise: true,
          company_name: company_name.trim(),
          glow_color,
          recruitment_perks: perksArray,
        };
      }

      // Also persist to masterConfigStorage 'hackathons' list so it syncs universally across deadlines and feeds
      try {
        const rawMaster = await getMasterControlSubkey<any[]>('hackathons', []);
        const masterList = Array.isArray(rawMaster) ? rawMaster : [];
        await updateMasterControlSubkey('hackathons', [insertedRecord, ...masterList]);
      } catch (masterErr) {
        console.warn('Master config update note:', masterErr);
      }

      // Record Admin Audit Log
      await recordAdminAuditLog({
        actorEmail: auth.user?.email || 'admin@kollabrix.in',
        actorId: auth.user?.id || 'c86ce05f-24de-4a1a-a45f-944d4180b508',
        action: 'CREATE_SPONSORED_HACKATHON',
        targetType: 'hackathon',
        targetId: insertedRecord.id,
        details: { company_name, title, prize_pool, glow_color },
        outcome: 'SUCCESS',
      });

      return NextResponse.json({
        success: true,
        hackathon: insertedRecord,
        message: `Sponsored hackathon "${title}" for ${company_name} is now live with priority glowing spotlight!`,
      });
    }

    if (action === 'restore' && hackathonId) {
      const client = auth.dbClient;

      // Read current deleted_hackathons from master storage or platform_settings
      let currentDeleted: DeletedHackathonsData = { deletedIds: [], deletedTitles: [], deletedAt: {} };
      try {
        const master = await getMasterControlRecord();
        if (master?.deletedHackathons) {
          currentDeleted = parseDeletedHackathons(master.deletedHackathons);
        }
      } catch {}

      if (!currentDeleted.deletedIds || currentDeleted.deletedIds.length === 0) {
        const { data: settingRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'deleted_hackathons')
          .maybeSingle();

        currentDeleted = parseDeletedHackathons(settingRow?.value);
      }

      const targetTitle = (body.title || '').trim().toLowerCase();
      const updatedIds = currentDeleted.deletedIds.filter(
        (id) => id.toLowerCase() !== hackathonId.toLowerCase()
      );
      const updatedTitles = (currentDeleted.deletedTitles || []).filter(
        (t) => t.trim().toLowerCase() !== targetTitle && t.trim().toLowerCase() !== hackathonId.toLowerCase()
      );

      const restoreVal = {
        deletedIds: updatedIds,
        deletedTitles: updatedTitles,
        deletedAt: currentDeleted.deletedAt || {},
      };

      await updateMasterControlSubkey('deletedHackathons', restoreVal);

      try {
        await client.from('platform_settings').upsert({
          key: 'deleted_hackathons',
          value: restoreVal,
          updated_at: new Date().toISOString(),
        });
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'Hackathon restored successfully.',
        restoredId: hackathonId,
        deletedIds: updatedIds,
      });
    }

    if (action === 'clear_deleted') {
      const client = auth.dbClient;
      const emptyVal = {
        deletedIds: [],
        deletedTitles: [],
        deletedAt: {},
      };
      await updateMasterControlSubkey('deletedHackathons', emptyVal);
      try {
        await client.from('platform_settings').upsert({
          key: 'deleted_hackathons',
          value: emptyVal,
          updated_at: new Date().toISOString(),
        });
      } catch {}
      return NextResponse.json({
        success: true,
        message: 'Deleted/suppressed hackathons registry cleared. All competitions restored.',
      });
    }

    if (action === 'toggle_sponsored' && hackathonId) {
      const client = auth.dbClient;
      const { priority_rank = 10, company_name } = body;

      let isNowSponsored = true;
      if (isSupabaseConfigured()) {
        try {
          const { data: current } = await client
            .from('hackathons')
            .select('id, title, description, organizer, is_sponsored')
            .eq('id', hackathonId)
            .maybeSingle();

          if (current) {
            isNowSponsored = !current.is_sponsored;
            const updatedDesc = current.description || '';
            let metaObj: any = {};
            if (updatedDesc.includes('<!-- HACKATHON_META:')) {
              try {
                metaObj = JSON.parse(updatedDesc.split('<!-- HACKATHON_META:')[1].split('-->')[0]);
              } catch {}
            }
            metaObj.is_sponsored = isNowSponsored;
            metaObj.is_enterprise = isNowSponsored;
            metaObj.priority_rank = isNowSponsored ? priority_rank : 1;
            if (company_name) metaObj.company_name = company_name;

            const cleanDesc = updatedDesc.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim();
            const newDesc = `${cleanDesc}\n\n<!-- HACKATHON_META:${JSON.stringify(metaObj)} -->`;

            await client
              .from('hackathons')
              .update({
                is_sponsored: isNowSponsored,
                description: newDesc,
                updated_at: new Date().toISOString(),
              })
              .eq('id', hackathonId);
          }
        } catch (dbErr) {
          console.warn('DB toggle sponsored fallback:', dbErr);
        }
      }

      await recordAdminAuditLog({
        actorEmail: auth.user?.email || 'admin@kollabrix.in',
        actorId: auth.user?.id || 'c86ce05f-24de-4a1a-a45f-944d4180b508',
        action: isNowSponsored ? 'PROMOTE_TO_SPONSORED' : 'DEMOTE_FROM_SPONSORED',
        targetType: 'hackathon',
        targetId: hackathonId,
        details: { isNowSponsored, priority_rank },
        outcome: 'SUCCESS',
      });

      return NextResponse.json({
        success: true,
        message: isNowSponsored
          ? 'Hackathon promoted to Corporate Sponsored with Top Priority.'
          : 'Hackathon reverted to regular Collegiate status.',
        hackathonId,
        is_sponsored: isNowSponsored,
      });
    }

    if (action === 'update_sponsored_theme' && hackathonId) {
      const client = auth.dbClient;
      const {
        company_name,
        company_logo,
        theme_preset = 'sunset-gold',
        glow_color = 'gold',
        tagline = '',
        hiring_roles = '',
        hiring_package = '',
        recruitment_perks,
        priority_rank = 10,
        promo_video_url = '',
        custom_cta_text = '',
      } = body;

      const perksArray = Array.isArray(recruitment_perks)
        ? recruitment_perks
        : typeof recruitment_perks === 'string'
        ? recruitment_perks.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

      const parsedPriority = parseInt(String(priority_rank)) || 10;

      if (isSupabaseConfigured()) {
        try {
          const { data: current } = await client
            .from('hackathons')
            .select('id, description')
            .eq('id', hackathonId)
            .maybeSingle();

          if (current) {
            let cleanDesc = current.description || '';
            let metaObj: any = {};
            if (cleanDesc.includes('<!-- HACKATHON_META:')) {
              try {
                const metaStr = cleanDesc.split('<!-- HACKATHON_META:')[1].split('-->')[0];
                metaObj = JSON.parse(metaStr);
                cleanDesc = cleanDesc.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim();
              } catch {}
            }

            metaObj = {
              ...metaObj,
              is_sponsored: true,
              is_enterprise: true,
              company_name,
              sponsor_logo_url: company_logo || null,
              theme_preset,
              glow_color,
              tagline,
              hiring_roles,
              hiring_package,
              recruitment_perks: perksArray,
              priority_rank: parsedPriority,
              promo_video_url: promo_video_url || null,
              custom_cta_text: custom_cta_text || null,
            };

            const updatedDesc = `${cleanDesc}\n\n<!-- HACKATHON_META:${JSON.stringify(metaObj)} -->`;

            await client
              .from('hackathons')
              .update({
                description: updatedDesc,
                company_name,
                company_logo: company_logo || null,
                is_sponsored: true,
                priority_rank: parsedPriority,
                hiring_roles,
                updated_at: new Date().toISOString(),
              })
              .eq('id', hackathonId);
          }
        } catch (dbErr) {
          console.warn('Update sponsored theme error:', dbErr);
        }
      }

      await recordAdminAuditLog({
        actorEmail: auth.user?.email || 'admin@kollabrix.in',
        actorId: auth.user?.id || 'c86ce05f-24de-4a1a-a45f-944d4180b508',
        action: 'UPDATE_SPONSOR_THEME',
        targetType: 'hackathon',
        targetId: hackathonId,
        details: { company_name, theme_preset, priority_rank: parsedPriority },
        outcome: 'SUCCESS',
      });

      return NextResponse.json({
        success: true,
        message: `Bespoke brand theme for "${company_name || 'Hackathon'}" updated successfully!`,
        hackathonId,
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
