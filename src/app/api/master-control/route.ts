import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  DEFAULT_MASTER_CONTROL_CONFIG,
  MasterControlConfig,
} from '@/types/masterControl';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const MASTER_KEY = 'site_master_control_config';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: NextRequest) {
  try {
    let config: MasterControlConfig = DEFAULT_MASTER_CONTROL_CONFIG;

    if (isSupabaseConfigured()) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey =
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          '';

        const client = createSupabaseClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });

        const { data: row } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', MASTER_KEY)
          .maybeSingle();

        if (row?.value) {
          config = {
            ...DEFAULT_MASTER_CONTROL_CONFIG,
            ...row.value,
            banner: { ...DEFAULT_MASTER_CONTROL_CONFIG.banner, ...(row.value.banner || {}) },
            sections: { ...DEFAULT_MASTER_CONTROL_CONFIG.sections, ...(row.value.sections || {}) },
            colleges: Array.isArray(row.value.colleges) ? row.value.colleges : DEFAULT_MASTER_CONTROL_CONFIG.colleges,
            badges: Array.isArray(row.value.badges) ? row.value.badges : DEFAULT_MASTER_CONTROL_CONFIG.badges,
            maintenance: { ...DEFAULT_MASTER_CONTROL_CONFIG.maintenance, ...(row.value.maintenance || {}) },
          };
        }
      } catch (dbErr) {
        console.warn('Could not read master control config from platform_settings:', dbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        config,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        config: DEFAULT_MASTER_CONTROL_CONFIG,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}
