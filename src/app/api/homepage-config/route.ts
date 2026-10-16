import { NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
  HomepageIntentConfig,
  HomepageShowcaseConfig,
} from '@/types/homepageConfig';

export const runtime = 'nodejs';

const INTENT_KEY = 'homepage_intent_config';
const SHOWCASE_KEY = 'homepage_showcase_config';

export async function GET() {
  try {
    let intentConfig: HomepageIntentConfig = DEFAULT_HOMEPAGE_INTENT_CONFIG;
    let showcaseConfig: HomepageShowcaseConfig = DEFAULT_HOMEPAGE_SHOWCASE_CONFIG;

    if (isSupabaseConfigured()) {
      try {
        const { data: rows } = await defaultClient
          .from('platform_settings')
          .select('key, value')
          .in('key', [INTENT_KEY, SHOWCASE_KEY]);

        if (rows && rows.length > 0) {
          const intentRow = rows.find((r: any) => r.key === INTENT_KEY);
          if (intentRow?.value) {
            intentConfig = { ...DEFAULT_HOMEPAGE_INTENT_CONFIG, ...intentRow.value };
          }
          const showcaseRow = rows.find((r: any) => r.key === SHOWCASE_KEY);
          if (showcaseRow?.value) {
            showcaseConfig = { ...DEFAULT_HOMEPAGE_SHOWCASE_CONFIG, ...showcaseRow.value };
          }
        }
      } catch (err) {
        console.warn('Could not read homepage config:', err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        intentConfig,
        showcaseConfig,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      intentConfig: DEFAULT_HOMEPAGE_INTENT_CONFIG,
      showcaseConfig: DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
    });
  }
}
