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
import { extractSponsoredMeta } from '@/lib/hackathons/sponsoredMeta';

/**
 * Normalizes input date/time strings into an accurate UTC ISO timestamp.
 * Handles client timezone offsets so that dates and times chosen by admins
 * in their local timezone are never shifted by serverless UTC clocks.
 */
function parseToIso(dateStr?: string | null, clientTzOffsetMin?: number): string | null {
  if (!dateStr) return null;
  // If already full ISO with 'Z' or explicit +/- timezone offset
  if (dateStr.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  // If no timezone offset is in the string, adjust by client timezone offset if provided
  if (typeof clientTzOffsetMin === 'number' && !isNaN(clientTzOffsetMin)) {
    const normalized = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`;
    const utcBase = new Date(normalized + 'Z').getTime();
    if (!isNaN(utcBase)) {
      const realUtcMs = utcBase + (clientTzOffsetMin * 60 * 1000);
      return new Date(realUtcMs).toISOString();
    }
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

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

  // Combine DB hackathons, Master Config Hackathons, and Curated catalog for comprehensive admin visibility
  const seenIds = new Set<string>();
  const allHackathons: any[] = [];

  let masterHackathons: any[] = [];
  try {
    const master = await getMasterControlRecord();
    if (Array.isArray(master?.hackathons)) {
      masterHackathons = master.hackathons;
    }
  } catch {}

  const combinedRaw = [...dbHackathons, ...masterHackathons];

  for (const h of combinedRaw) {
    if (h && h.id && !seenIds.has(h.id)) {
      seenIds.add(h.id);
      if (h.join_code) seenIds.add(h.join_code);
      const meta = extractSponsoredMeta(h);
      allHackathons.push({
        ...h,
        is_sponsored: meta.isSponsored,
        is_enterprise: meta.isSponsored,
        company_name: meta.companyName || h.company_name,
        company_logo: meta.sponsorLogoUrl || h.company_logo,
        theme_preset: meta.themePreset,
        glow_color: meta.glowColor,
        priority_rank: meta.priorityRank,
        hiring_roles: meta.hiringRoles || h.hiring_roles,
        hiring_package: meta.hiringPackage || h.hiring_package,
        recruitment_perks: meta.recruitmentPerks || h.recruitment_perks,
        tagline: meta.tagline || h.tagline,
        promo_video_url: meta.promoVideoUrl || h.promo_video_url,
        custom_cta_text: meta.customCtaText || h.custom_cta_text,
      });
    }
  }

  for (const c of CURATED_HACKATHONS) {
    if (c && c.id && !seenIds.has(c.id)) {
      seenIds.add(c.id);
      if (c.join_code) seenIds.add(c.join_code);
      const meta = extractSponsoredMeta(c);
      allHackathons.push({
        ...c,
        is_curated: true,
        participants_count: 0,
        teams_count: 0,
        submissions_count: 0,
        is_sponsored: meta.isSponsored,
        is_enterprise: meta.isSponsored,
        company_name: meta.companyName || c.company_name,
        company_logo: meta.sponsorLogoUrl || c.company_logo,
        theme_preset: meta.themePreset,
        glow_color: meta.glowColor,
        priority_rank: meta.priorityRank,
        hiring_roles: meta.hiringRoles || c.hiring_roles,
        hiring_package: meta.hiringPackage || c.hiring_package,
        recruitment_perks: meta.recruitmentPerks || c.recruitment_perks,
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

    // 2. Cascade delete participants, teams, workspace projects, and submissions if any in the database
    try {
      const { data: teamRows } = await client
        .from('hackathon_teams')
        .select('id')
        .eq('hackathon_id', hackathonId);
      const teamIds = (teamRows || []).map((t: any) => t.id).filter(Boolean);

      const projectIdsToDelete = new Set<string>(teamIds);

      try {
        const { data: linkedProjects } = await client
          .from('projects')
          .select('id')
          .or(`description.ilike.%HACKATHON_TEAM_META%${hackathonId}%,summary.ilike.%Hackathon Team Sprint: ${hackathonTitle}%`);
        (linkedProjects || []).forEach((lp: any) => projectIdsToDelete.add(lp.id));
      } catch {}

      const allProjIds = Array.from(projectIdsToDelete);
      if (allProjIds.length > 0) {
        try { await client.from('project_tasks').delete().in('project_id', allProjIds); } catch {}
        try { await client.from('project_milestones').delete().in('project_id', allProjIds); } catch {}
        try { await client.from('project_discussions').delete().in('project_id', allProjIds); } catch {}
        try { await client.from('project_mentoring_notes').delete().in('project_id', allProjIds); } catch {}
        try { await client.from('project_members').delete().in('project_id', allProjIds); } catch {}
        try { await client.from('projects').delete().in('id', allProjIds); } catch {}
      }

      try { await client.from('hackathon_submissions').delete().eq('hackathon_id', hackathonId); } catch {}
      try { await client.from('hackathon_team_members').delete().in('team_id', teamIds); } catch {}
      try { await client.from('hackathon_teams').delete().eq('hackathon_id', hackathonId); } catch {}
      try { await client.from('hackathon_participants').delete().eq('hackathon_id', hackathonId); } catch {}
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

      // Also remove from masterConfigStorage 'hackathons' list if present
      try {
        const rawMaster = await getMasterControlSubkey<any[]>('hackathons', []);
        if (Array.isArray(rawMaster) && rawMaster.length > 0) {
          const remaining = rawMaster.filter((h: any) => {
            const matchId = h.id === hackathonId || (h.id && h.id.toLowerCase() === hackathonId.toLowerCase());
            const matchCode = effectiveJoinCode && h.join_code === effectiveJoinCode;
            return !matchId && !matchCode;
          });
          await updateMasterControlSubkey('hackathons', remaining);
        }
      } catch {}

      // Also clean up any squads from problem_teams_registry
      try {
        const { data: regRow } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'problem_teams_registry')
          .maybeSingle();

        if (Array.isArray(regRow?.value)) {
          const cleaned = regRow.value.filter((pt: any) => {
            if (!pt) return false;
            if (pt.hackathon_id === hackathonId) return false;
            if (pt.description?.includes(hackathonId)) return false;
            if (hackathonTitle && pt.summary?.includes(hackathonTitle)) return false;
            return true;
          });
          await client.from('platform_settings').upsert({
            key: 'problem_teams_registry',
            value: cleaned,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {}
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
        partner_name_2 = '',
        partner_logo_2 = '',
        sponsor_tier = 'Official Title Sponsor',
        brand_color = '#F59E0B',
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
        custom_cta_text = 'ENLIST FOR PPI TRIALS',
        themes = ['Enterprise Challenge', 'AI/Cloud Architecture'],
        banner_url,
        access_type = 'public',
        tracks = [],
        hiring_ladder = [],
        developer_sandbox = null,
        candidate_pass_title = 'VERIFIED CANDIDATE ACCESS PASS',
        candidate_pass_rank = 'TIER-1 ARCHITECT',
        live_shortlisted_count = 18,
        live_active_squads_count = 340,
        sponsor_website_url = '',
        about_sponsor_headline = '',
        about_sponsor_description = '',
        event_benefits = [],
        gift_callout_text = '',
        guidelines_url = '',
        submission_cutoff = '',
        result_announcement = '',
        registration_url = '',
        external_registration_url = '',
        is_external_registration = false,
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
        logo_url: company_logo?.trim() || null,
        banner_url: banner_url?.trim() || null,
        enable_recruiter_qr_pass: false,
        partner_name_2: partner_name_2?.trim() || null,
        partner_logo_2: partner_logo_2?.trim() || null,
        sponsor_tier: sponsor_tier?.trim() || 'Official Title Sponsor',
        brand_color: brand_color?.trim() || '#F59E0B',
        theme_preset,
        glow_color,
        priority_rank: parsedPriority,
        hiring_roles: hiring_roles.trim(),
        hiring_package: hiring_package.trim(),
        tagline: tagline?.trim() || '',
        promo_video_url: promo_video_url?.trim() || null,
        custom_cta_text: custom_cta_text?.trim() || 'ENLIST FOR PPI TRIALS',
        recruitment_perks: perksArray,
        prize_pool: prize_pool.trim(),
        tracks: Array.isArray(tracks) && tracks.length > 0 ? tracks : [
          { title: 'Track 1: Cloud & AI Innovation', bounty: '$5,000 USD + Cloud Credits', description: 'Build high-scale distributed applications and generative AI solutions.' },
          { title: 'Track 2: High-Velocity Engineering', bounty: '$5,000 USD + Direct PPIs', description: 'Best architecture, latency optimizations, and production readiness.' }
        ],
        hiring_ladder: Array.isArray(hiring_ladder) && hiring_ladder.length > 0 ? hiring_ladder : [
          { level: 1, title: 'Level 1: Qualifier', perks: '$1,000 Cloud Credits + Sandbox Keys' },
          { level: 2, title: 'Level 2: Finalist Hangar', perks: '1:1 Architecture Review with VP of Engineering' },
          { level: 3, title: 'Level 3: Grand Laureate', perks: 'Direct Technical Interview Bypass + ₹10,00,000 Escrow' }
        ],
        developer_sandbox: developer_sandbox || {
          endpoint: 'POST /v2/fintech/sprint/sandbox',
          starterRepoUrl: 'https://github.com/kollabrix/enterprise-sprint-starter',
          perks: '$1,000 Cloud Credits per Squad + Production Sandbox Keys',
          latencyMs: 130
        },
        candidate_pass_title: candidate_pass_title?.trim() || 'VERIFIED CANDIDATE ACCESS PASS',
        candidate_pass_rank: candidate_pass_rank?.trim() || 'TIER-1 ARCHITECT',
        live_shortlisted_count: parseInt(String(live_shortlisted_count)) || 18,
        live_active_squads_count: parseInt(String(live_active_squads_count)) || 340,
        sponsor_website_url: sponsor_website_url?.trim() || null,
        about_sponsor_headline: about_sponsor_headline?.trim() || null,
        about_sponsor_description: about_sponsor_description?.trim() || null,
        event_benefits: Array.isArray(event_benefits) && event_benefits.length > 0 ? event_benefits : [
          `Exclusive ${company_name} Credits (up to $500)`,
          'Top Performers Get Internships & Swags',
          `Mentorship from ${company_name} Experts`,
          `Priority Access to ${company_name} Tools`,
        ],
        gift_callout_text: gift_callout_text?.trim() || `Sponsored by ${company_name}: Get up to $500 in ${company_name} Credits!`,
        guidelines_url: guidelines_url?.trim() || null,
        submission_cutoff: submission_cutoff?.trim() || null,
        result_announcement: result_announcement?.trim() || null,
        registration_url: (registration_url || external_registration_url)?.trim() || null,
        external_registration_url: (registration_url || external_registration_url)?.trim() || null,
        is_external_registration: Boolean(is_external_registration || registration_url?.trim() || external_registration_url?.trim()),
        access_type,
        join_code: joinCode,
        min_team_size: 1,
        max_team_size: 4,
        results_date: results_date ? new Date(results_date).toISOString() : null,
      })} -->`;

      // Prepare sanitized payload strictly containing columns present in Supabase PostgreSQL hackathons table
      const dbInsertPayload = {
        title: title.trim(),
        organizer: `${company_name.trim()} Campus Innovation & Recruitment`,
        description: (description || tagline || title).trim() + metaComment,
        mode,
        location: location.trim() || 'Global Online Hub',
        start_date: parseToIso(start_date, body.clientTimezoneOffset) || new Date().toISOString(),
        end_date: parseToIso(end_date, body.clientTimezoneOffset),
        registration_deadline: parseToIso(registration_deadline, body.clientTimezoneOffset) || new Date(Date.now() + 14 * 86400000).toISOString(),
        submission_deadline: parseToIso(body.submission_deadline || results_date, body.clientTimezoneOffset),
        eligibility: (body.eligibility || 'Open to all college students & engineering developers').trim(),
        rules: (body.rules || '1. All code and designs must be created during the official hackathon timeline.\n2. Projects must address one of the released problem statements.\n3. Public GitHub repository with full commit history is required.\n4. Plagiarism leads to immediate disqualification.').trim(),
        themes: Array.isArray(themes) && themes.length > 0 ? themes : ['Enterprise Innovation', 'Cloud/AI Architecture'],
        prize_pool: prize_pool.trim() || '₹5,00,000 + Direct PPI Interviews',
        website_url: (registration_url || external_registration_url)?.trim() || `https://kollabrix.in/h/${joinCode}`,
        banner_url: banner_url?.trim() || null,
        is_verified: true,
        status: 'Published',
        access_type: access_type || 'public',
        join_code: joinCode,
        min_team_size: parseInt(String(body.min_team_size)) || 1,
        max_team_size: parseInt(String(body.max_team_size)) || 4,
        creator_id: auth.user?.id || '29359508-c755-424b-81a2-89e714577437',
      };

      let insertedRecord: any = null;
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await client
            .from('hackathons')
            .insert(dbInsertPayload)
            .select('*')
            .single();
          if (!error && data) {
            insertedRecord = data;
          } else if (error) {
            console.warn('DB insert error note:', error.message);
          }
        } catch (dbErr) {
          console.warn('DB insert fallback note:', dbErr);
        }
      }

      if (!insertedRecord) {
        insertedRecord = {
          id: `hack-corp-${Date.now()}`,
          ...dbInsertPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const enrichedRecord = {
        ...insertedRecord,
        is_sponsored: true,
        is_enterprise: true,
        company_name: company_name.trim(),
        company_logo: company_logo?.trim() || null,
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
        registration_url: (registration_url || external_registration_url)?.trim() || null,
        external_registration_url: (registration_url || external_registration_url)?.trim() || null,
        is_external_registration: Boolean(is_external_registration || registration_url?.trim() || external_registration_url?.trim()),
        website_url: (registration_url || external_registration_url)?.trim() || insertedRecord.website_url,
      };

      // Also persist to masterConfigStorage 'hackathons' list so it syncs universally across deadlines and feeds
      try {
        const rawMaster = await getMasterControlSubkey<any[]>('hackathons', []);
        const masterList = Array.isArray(rawMaster) ? rawMaster : [];
        const filteredMaster = masterList.filter(
          (h: any) => h.id !== enrichedRecord.id && h.join_code !== joinCode
        );
        await updateMasterControlSubkey('hackathons', [enrichedRecord, ...filteredMaster]);
      } catch (masterErr) {
        console.warn('Master config update note:', masterErr);
      }

      // Record Admin Audit Log
      await recordAdminAuditLog({
        actorEmail: auth.user?.email || 'admin@kollabrix.in',
        actorId: auth.user?.id || '29359508-c755-424b-81a2-89e714577437',
        action: 'CREATE_SPONSORED_HACKATHON',
        targetType: 'hackathon',
        targetId: enrichedRecord.id,
        details: { company_name, title, prize_pool, glow_color },
        outcome: 'SUCCESS',
      });

      return NextResponse.json({
        success: true,
        hackathon: enrichedRecord,
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
            .select('id, title, description, organizer')
            .eq('id', hackathonId)
            .maybeSingle();

          if (current) {
            const updatedDesc = current.description || '';
            let metaObj: any = {};
            if (updatedDesc.includes('<!-- HACKATHON_META:')) {
              try {
                metaObj = JSON.parse(updatedDesc.split('<!-- HACKATHON_META:')[1].split('-->')[0]);
              } catch {}
            }
            const currentIsSponsored = Boolean(metaObj.is_sponsored || metaObj.is_enterprise);
            isNowSponsored = !currentIsSponsored;
            metaObj.is_sponsored = isNowSponsored;
            metaObj.is_enterprise = isNowSponsored;
            metaObj.priority_rank = isNowSponsored ? priority_rank : 1;
            if (company_name) metaObj.company_name = company_name;

            const cleanDesc = updatedDesc.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim();
            const newDesc = `${cleanDesc}\n\n<!-- HACKATHON_META:${JSON.stringify(metaObj)} -->`;

            await client
              .from('hackathons')
              .update({
                description: newDesc,
                updated_at: new Date().toISOString(),
              })
              .eq('id', hackathonId);
          }
        } catch (dbErr) {
          console.warn('DB toggle sponsored fallback:', dbErr);
        }
      }

      // Also sync to masterConfigStorage 'hackathons'
      try {
        const rawMaster = await getMasterControlSubkey<any[]>('hackathons', []);
        if (Array.isArray(rawMaster)) {
          const updatedMaster = rawMaster.map((h: any) => {
            if (h.id === hackathonId || h.join_code === hackathonId) {
              const meta = extractSponsoredMeta(h);
              const toggled = !meta.isSponsored;
              return {
                ...h,
                is_sponsored: toggled,
                is_enterprise: toggled,
                priority_rank: toggled ? priority_rank : 1,
              };
            }
            return h;
          });
          await updateMasterControlSubkey('hackathons', updatedMaster);
        }
      } catch {}

      await recordAdminAuditLog({
        actorEmail: auth.user?.email || 'admin@kollabrix.in',
        actorId: auth.user?.id || '29359508-c755-424b-81a2-89e714577437',
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
        partner_name_2 = '',
        partner_logo_2 = '',
        sponsor_tier = 'Official Title Sponsor',
        brand_color = '#F59E0B',
        theme_preset = 'sunset-gold',
        glow_color = 'gold',
        tagline = '',
        hiring_roles = '',
        hiring_package = '',
        recruitment_perks,
        priority_rank = 10,
        promo_video_url = '',
        custom_cta_text = 'ENLIST FOR PPI TRIALS',
        tracks,
        hiring_ladder,
        developer_sandbox,
        candidate_pass_title,
        candidate_pass_rank,
        live_shortlisted_count,
        live_active_squads_count,
        sponsor_website_url,
        about_sponsor_headline,
        about_sponsor_description,
        event_benefits,
        gift_callout_text,
        guidelines_url,
        submission_cutoff,
        result_announcement,
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
              partner_name_2: partner_name_2 || metaObj.partner_name_2 || null,
              partner_logo_2: partner_logo_2 || metaObj.partner_logo_2 || null,
              sponsor_tier: sponsor_tier || metaObj.sponsor_tier || 'Official Title Sponsor',
              brand_color: brand_color || metaObj.brand_color || '#F59E0B',
              theme_preset,
              glow_color,
              tagline,
              hiring_roles,
              hiring_package,
              recruitment_perks: perksArray,
              priority_rank: parsedPriority,
              promo_video_url: promo_video_url || null,
              custom_cta_text: custom_cta_text || 'ENLIST FOR PPI TRIALS',
              tracks: tracks || metaObj.tracks || null,
              hiring_ladder: hiring_ladder || metaObj.hiring_ladder || null,
              developer_sandbox: developer_sandbox || metaObj.developer_sandbox || null,
              candidate_pass_title: candidate_pass_title || metaObj.candidate_pass_title || 'VERIFIED CANDIDATE ACCESS PASS',
              candidate_pass_rank: candidate_pass_rank || metaObj.candidate_pass_rank || 'TIER-1 ARCHITECT',
              live_shortlisted_count: typeof live_shortlisted_count === 'number' ? live_shortlisted_count : (metaObj.live_shortlisted_count || 18),
              live_active_squads_count: typeof live_active_squads_count === 'number' ? live_active_squads_count : (metaObj.live_active_squads_count || 340),
              sponsor_website_url: sponsor_website_url !== undefined ? sponsor_website_url : metaObj.sponsor_website_url,
              about_sponsor_headline: about_sponsor_headline !== undefined ? about_sponsor_headline : metaObj.about_sponsor_headline,
              about_sponsor_description: about_sponsor_description !== undefined ? about_sponsor_description : metaObj.about_sponsor_description,
              event_benefits: event_benefits !== undefined ? event_benefits : metaObj.event_benefits,
              gift_callout_text: gift_callout_text !== undefined ? gift_callout_text : metaObj.gift_callout_text,
              guidelines_url: guidelines_url !== undefined ? guidelines_url : metaObj.guidelines_url,
              submission_cutoff: submission_cutoff !== undefined ? submission_cutoff : metaObj.submission_cutoff,
              result_announcement: result_announcement !== undefined ? result_announcement : metaObj.result_announcement,
              banner_url: body.banner_url || metaObj.banner_url || null,
              logo_url: company_logo || metaObj.logo_url || null,
              enable_recruiter_qr_pass: Boolean(body.enable_recruiter_qr_pass ?? metaObj.enable_recruiter_qr_pass ?? false),
              registration_url: body.registration_url !== undefined ? (body.registration_url?.trim() || null) : (metaObj.registration_url || null),
              external_registration_url: body.registration_url !== undefined ? (body.registration_url?.trim() || null) : (metaObj.external_registration_url || null),
              is_external_registration: body.is_external_registration !== undefined ? Boolean(body.is_external_registration) : Boolean(metaObj.is_external_registration),
            };

            const updatedDesc = `${cleanDesc}\n\n<!-- HACKATHON_META:${JSON.stringify(metaObj)} -->`;

            const updatePayload: any = {
              description: updatedDesc,
              updated_at: new Date().toISOString(),
            };
            if (body.banner_url !== undefined) updatePayload.banner_url = body.banner_url?.trim() || null;
            if (body.registration_url) updatePayload.website_url = body.registration_url.trim();
            if (body.title) updatePayload.title = body.title.trim();
            if (body.prize_pool) updatePayload.prize_pool = body.prize_pool.trim();
            if (body.mode) updatePayload.mode = body.mode;
            if (body.location) updatePayload.location = body.location;
            if (body.start_date) updatePayload.start_date = parseToIso(body.start_date, body.clientTimezoneOffset) || new Date(body.start_date).toISOString();
            if (body.end_date) updatePayload.end_date = parseToIso(body.end_date, body.clientTimezoneOffset);
            if (body.registration_deadline) updatePayload.registration_deadline = parseToIso(body.registration_deadline, body.clientTimezoneOffset) || new Date(body.registration_deadline).toISOString();
            if (body.submission_deadline) updatePayload.submission_deadline = parseToIso(body.submission_deadline, body.clientTimezoneOffset);
            if (body.rules) updatePayload.rules = body.rules;
            if (body.eligibility) updatePayload.eligibility = body.eligibility;
            if (body.min_team_size) updatePayload.min_team_size = parseInt(String(body.min_team_size)) || 1;
            if (body.max_team_size) updatePayload.max_team_size = parseInt(String(body.max_team_size)) || 4;
            if (Array.isArray(body.themes) && body.themes.length > 0) updatePayload.themes = body.themes;

            await client
              .from('hackathons')
              .update(updatePayload)
              .eq('id', hackathonId);
          }
        } catch (dbErr) {
          console.warn('Update sponsored theme error:', dbErr);
        }
      }

      // Also sync to masterConfigStorage 'hackathons'
      try {
        const rawMaster = await getMasterControlSubkey<any[]>('hackathons', []);
        if (Array.isArray(rawMaster)) {
          const updatedMaster = rawMaster.map((h: any) => {
            if (h.id === hackathonId || h.join_code === hackathonId) {
              return {
                ...h,
                is_sponsored: true,
                is_enterprise: true,
                company_name,
                company_logo: company_logo || null,
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
            }
            return h;
          });
          await updateMasterControlSubkey('hackathons', updatedMaster);
        }
      } catch {}

      await recordAdminAuditLog({
        actorEmail: auth.user?.email || 'admin@kollabrix.in',
        actorId: auth.user?.id || '29359508-c755-424b-81a2-89e714577437',
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
