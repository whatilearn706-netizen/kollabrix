import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { parseDeletedHackathons, DeletedHackathonsData } from '@/lib/admin/hackathonSettings';
import { getMasterControlRecord } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    let dbHackathons: any[] = [];
    let deletedData: DeletedHackathonsData = { deletedIds: [], deletedTitles: [], deletedAt: {} };

    if (isSupabaseConfigured()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const client = createSupabaseClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: { persistSession: false },
      });

      // 1. Fetch deleted hackathons list
      try {
        const master = await getMasterControlRecord();
        if (master?.deletedHackathons) {
          deletedData = parseDeletedHackathons(master.deletedHackathons);
        }
      } catch {}

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

    // Normalize DB hackathons
    const normalizedDbHacks = (dbHackathons || []).map((h: any) => {
      let joinCode = h.join_code;
      let accessType = h.access_type;
      let cleanDesc = h.description || '';

      if (cleanDesc.includes('<!-- HACKATHON_META:')) {
        try {
          const metaStr = cleanDesc.split('<!-- HACKATHON_META:')[1].split('-->')[0];
          const meta = JSON.parse(metaStr);
          accessType = meta.access_type || accessType || 'private';
          joinCode = meta.join_code || joinCode;
          cleanDesc = cleanDesc.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim();
        } catch {}
      }

      if (!joinCode && h.website_url && h.website_url.includes('/h/')) {
        joinCode = h.website_url.split('/h/')[1]?.split(/[?#]/)[0];
        accessType = accessType || 'private';
      }

      return {
        ...h,
        description: cleanDesc,
        join_code: joinCode || h.join_code,
        access_type: accessType || (joinCode ? 'private' : h.access_type || 'public'),
      };
    });

    // Combine DB hackathons with curated catalog
    const seenIds = new Set<string>();
    const combined: any[] = [];

    for (const item of normalizedDbHacks) {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        if (item.join_code) seenIds.add(item.join_code);
        combined.push(item);
      }
    }

    for (const item of CURATED_HACKATHONS) {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        if (item.join_code) seenIds.add(item.join_code);
        combined.push(item);
      }
    }

    // Filter out deleted hackathons strictly across id, join_code, title, and website_url
    const activeHackathons = combined.filter((h) => {
      if (!h) return false;
      const id = (h.id || '').toLowerCase();
      const joinCode = (h.join_code || '').toLowerCase();
      const title = (h.title || '').trim().toLowerCase();
      const webCode = h.website_url ? h.website_url.split('/h/')[1]?.split(/[?#]/)[0]?.toLowerCase() : '';

      const isDel =
        (id && deletedSet.has(id)) ||
        (joinCode && deletedSet.has(joinCode)) ||
        (title && (deletedSet.has(title) || deletedTitlesSet.has(title))) ||
        (webCode && deletedSet.has(webCode));

      return !isDel;
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
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
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
