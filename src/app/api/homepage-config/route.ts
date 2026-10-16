import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
  HomepageIntentConfig,
  HomepageShowcaseConfig,
} from '@/types/homepageConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const INTENT_KEY = 'homepage_intent_config';
const SHOWCASE_KEY = 'homepage_showcase_config';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

export async function GET(request: NextRequest) {
  try {
    let intentConfig: HomepageIntentConfig = DEFAULT_HOMEPAGE_INTENT_CONFIG;
    let showcaseConfig: HomepageShowcaseConfig = DEFAULT_HOMEPAGE_SHOWCASE_CONFIG;

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

        const { data: rows, error } = await client
          .from('platform_settings')
          .select('key, value')
          .in('key', [INTENT_KEY, SHOWCASE_KEY]);

        if (rows && rows.length > 0) {
          const intentRow = rows.find((r: any) => r.key === INTENT_KEY);
          if (intentRow?.value) {
            intentConfig = {
              ...DEFAULT_HOMEPAGE_INTENT_CONFIG,
              ...intentRow.value,
              candidates: Array.isArray(intentRow.value.candidates)
                ? intentRow.value.candidates
                : DEFAULT_HOMEPAGE_INTENT_CONFIG.candidates,
              projectSlots: Array.isArray(intentRow.value.projectSlots)
                ? intentRow.value.projectSlots
                : DEFAULT_HOMEPAGE_INTENT_CONFIG.projectSlots,
            };
          }

          const showcaseRow = rows.find((r: any) => r.key === SHOWCASE_KEY);
          if (showcaseRow?.value) {
            showcaseConfig = {
              ...DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
              ...showcaseRow.value,
              selectedProjectIds: Array.isArray(showcaseRow.value.selectedProjectIds)
                ? showcaseRow.value.selectedProjectIds
                : DEFAULT_HOMEPAGE_SHOWCASE_CONFIG.selectedProjectIds,
            };
          }
        }
      } catch (dbErr) {
        console.warn('Could not read homepage config from platform_settings:', dbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        intentConfig,
        showcaseConfig,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        intentConfig: DEFAULT_HOMEPAGE_INTENT_CONFIG,
        showcaseConfig: DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  }
}
