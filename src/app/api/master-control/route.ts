import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  DEFAULT_MASTER_CONTROL_CONFIG,
  MasterControlConfig,
} from '@/types/masterControl';

export const runtime = 'nodejs';
export const revalidate = 120; // 2-minute edge cache to protect database egress

const MASTER_KEY = 'site_master_control_config';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: NextRequest) {
  try {
    let config: MasterControlConfig = DEFAULT_MASTER_CONTROL_CONFIG;
    let fromDb = false;

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
          fromDb = true;
          config = {
            ...DEFAULT_MASTER_CONTROL_CONFIG,
            ...row.value,
            banner: { ...DEFAULT_MASTER_CONTROL_CONFIG.banner, ...(row.value.banner || {}) },
            sections: { ...DEFAULT_MASTER_CONTROL_CONFIG.sections, ...(row.value.sections || {}) },
            colleges: Array.isArray(row.value.colleges) ? row.value.colleges : DEFAULT_MASTER_CONTROL_CONFIG.colleges,
            badges: Array.isArray(row.value.badges) ? row.value.badges : DEFAULT_MASTER_CONTROL_CONFIG.badges,
            maintenance: { ...DEFAULT_MASTER_CONTROL_CONFIG.maintenance, ...(row.value.maintenance || {}) },
            workspaceFeatures: { ...DEFAULT_MASTER_CONTROL_CONFIG.workspaceFeatures, ...(row.value.workspaceFeatures || {}) },
            customSection: { ...DEFAULT_MASTER_CONTROL_CONFIG.customSection, ...(row.value.customSection || {}) },
            studentTools: { ...DEFAULT_MASTER_CONTROL_CONFIG.studentTools, ...(row.value.studentTools || {}) },
            visualTemplates: { ...DEFAULT_MASTER_CONTROL_CONFIG.visualTemplates!, ...(row.value.visualTemplates || {}) },
          };
        }
      } catch (dbErr) {
        console.warn('Could not read master control config from platform_settings:', dbErr);
      }
    }

    // Fallback: If not in DB yet, read from persistent cookie
    if (!fromDb) {
      const cookieVal = request.cookies.get('linkora_master_control_config')?.value;
      if (cookieVal) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookieVal));
          config = {
            ...DEFAULT_MASTER_CONTROL_CONFIG,
            ...parsed,
            banner: { ...DEFAULT_MASTER_CONTROL_CONFIG.banner, ...(parsed.banner || {}) },
            sections: { ...DEFAULT_MASTER_CONTROL_CONFIG.sections, ...(parsed.sections || {}) },
            colleges: Array.isArray(parsed.colleges) ? parsed.colleges : DEFAULT_MASTER_CONTROL_CONFIG.colleges,
            badges: Array.isArray(parsed.badges) ? parsed.badges : DEFAULT_MASTER_CONTROL_CONFIG.badges,
            maintenance: { ...DEFAULT_MASTER_CONTROL_CONFIG.maintenance, ...(parsed.maintenance || {}) },
            workspaceFeatures: { ...DEFAULT_MASTER_CONTROL_CONFIG.workspaceFeatures, ...(parsed.workspaceFeatures || {}) },
            customSection: { ...DEFAULT_MASTER_CONTROL_CONFIG.customSection, ...(parsed.customSection || {}) },
            studentTools: { ...DEFAULT_MASTER_CONTROL_CONFIG.studentTools, ...(parsed.studentTools || {}) },
            visualTemplates: { ...DEFAULT_MASTER_CONTROL_CONFIG.visualTemplates!, ...(parsed.visualTemplates || {}) },
          };
        } catch (e) {}
      }
    }

    // Ensure brand name is migrated to Kollabrix
    if (config.banner) {
      if (config.banner.text) {
        config.banner.text = config.banner.text.replace(/Linkora/gi, 'Kollabrix');
      }
      if (config.banner.linkText) {
        config.banner.linkText = config.banner.linkText.replace(/Linkora/gi, 'Kollabrix');
      }
    }

    const isAdminRequest = request.nextUrl.searchParams.has('admin') || request.nextUrl.searchParams.has('_t');
    const responseHeaders = isAdminRequest ? NO_CACHE_HEADERS : CACHE_HEADERS;

    return NextResponse.json(
      {
        success: true,
        fromDb,
        config,
      },
      {
        headers: responseHeaders,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        fromDb: false,
        config: DEFAULT_MASTER_CONTROL_CONFIG,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}
