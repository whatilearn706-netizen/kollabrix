import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { parseDeletedHackathons, DeletedHackathonsData } from '@/lib/admin/hackathonSettings';
import { getMasterControlRecord } from '@/lib/admin/masterConfigStorage';
import { extractSponsoredMeta } from '@/lib/hackathons/sponsoredMeta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    let dbHackathons: any[] = [];
    let masterHackathons: any[] = [];
    let deletedData: DeletedHackathonsData = { deletedIds: [], deletedTitles: [], deletedAt: {} };

    // 1. Fetch deleted hackathons list and master config hackathons
    try {
      const master = await getMasterControlRecord();
      if (master?.deletedHackathons) {
        deletedData = parseDeletedHackathons(master.deletedHackathons);
      }
      if (Array.isArray(master?.hackathons)) {
        masterHackathons = master.hackathons;
      }
    } catch {}

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const client = createSupabaseClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: { persistSession: false },
      });

      if (!deletedData.deletedIds || deletedData.deletedIds.length === 0) {
        try {
          const { data: settingRow } = await client
            .from('platform_settings')
            .select('value')
            .eq('key', 'deleted_hackathons')
            .maybeSingle();

          if (settingRow?.value) {
            deletedData = parseDeletedHackathons(settingRow.value);
          }
        } catch (e) {
          console.warn('Could not read deleted_hackathons setting:', e);
        }
      }

      // 2. Fetch database hackathons
      try {
        const { data } = await client
          .from('hackathons')
          .select('*')
          .order('registration_deadline', { ascending: true });

        if (data) {
          dbHackathons = data;
        }
      } catch (e) {
        console.warn('Could not read hackathons table:', e);
      }
    }

    const deletedSet = new Set((deletedData.deletedIds || []).map((id) => id.toLowerCase()));
    const deletedTitlesSet = new Set((deletedData.deletedTitles || []).map((t) => t.trim().toLowerCase()));

    // Normalizer that preserves rich sponsor & meta data
    const normalizeHackathon = (h: any) => {
      let joinCode = h.join_code;
      let accessType = h.access_type;
      let resultsDate = h.results_date;
      let submissionDeadline = h.submission_deadline;

      if (h.description && h.description.includes('<!-- HACKATHON_META:')) {
        try {
          const metaStr = h.description.split('<!-- HACKATHON_META:')[1].split('-->')[0];
          const metaParsed = JSON.parse(metaStr);
          accessType = metaParsed.access_type || accessType;
          joinCode = metaParsed.join_code || joinCode;
          if (metaParsed.results_date) resultsDate = metaParsed.results_date;
          if (metaParsed.submission_deadline) submissionDeadline = metaParsed.submission_deadline;
        } catch {}
      }

      if (!joinCode && h.website_url && h.website_url.includes('/h/')) {
        joinCode = h.website_url.split('/h/')[1]?.split(/[?#]/)[0];
      }

      const meta = extractSponsoredMeta(h);

      return {
        ...h,
        submission_deadline: submissionDeadline || h.submission_deadline || null,
        results_date: resultsDate || h.results_date || null,
        description: h.description,
        join_code: joinCode || h.join_code,
        access_type: accessType || (joinCode ? 'private' : h.access_type || 'public'),
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
      };
    };

    // Combine DB hackathons, Master Config Hackathons, and curated catalog
    const seenIds = new Set<string>();
    const combined: any[] = [];

    // 1. Database hackathons first
    for (const raw of dbHackathons) {
      if (raw && raw.id && !seenIds.has(raw.id)) {
        seenIds.add(raw.id);
        if (raw.join_code) seenIds.add(raw.join_code);
        combined.push(normalizeHackathon(raw));
      }
    }

    // 2. Master config hackathons (catches any hot-patched or created corporate events)
    for (const raw of masterHackathons) {
      if (raw && raw.id && !seenIds.has(raw.id)) {
        if (!raw.join_code || !seenIds.has(raw.join_code)) {
          seenIds.add(raw.id);
          if (raw.join_code) seenIds.add(raw.join_code);
          combined.push(normalizeHackathon(raw));
        }
      }
    }

    // 3. Curated catalog
    for (const raw of CURATED_HACKATHONS) {
      if (raw && raw.id && !seenIds.has(raw.id)) {
        if (!raw.join_code || !seenIds.has(raw.join_code)) {
          seenIds.add(raw.id);
          if (raw.join_code) seenIds.add(raw.join_code);
          combined.push(normalizeHackathon(raw));
        }
      }
    }

    // Filter out deleted hackathons strictly across id, join_code, title, and website_url
    const activeHackathons = combined.filter((h) => {
      if (!h) return false;
      const id = (h.id || '').toLowerCase();
      const joinCode = (h.join_code || '').toLowerCase();
      const title = (h.title || '').trim().toLowerCase();
      const webCode = h.website_url ? h.website_url.split('/h/')[1]?.split(/[?#]/)[0]?.toLowerCase() : '';

      // Direct ID or Join Code match is authoritative
      if (id && deletedSet.has(id)) return false;
      if (joinCode && deletedSet.has(joinCode)) return false;
      if (webCode && deletedSet.has(webCode)) return false;

      // Title-based deletion applies ONLY to mock/curated hackathons without a genuine database UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(h.id);
      if (!isUUID && title && (deletedSet.has(title) || deletedTitlesSet.has(title))) {
        return false;
      }

      return true;
    });

    return NextResponse.json(
      {
        success: true,
        hackathons: activeHackathons,
        deletedIds: deletedData.deletedIds,
        deletedTitles: deletedData.deletedTitles,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error fetching hackathons.' },
      { status: 500 }
    );
  }
}
