import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const DEFAULT_HOTPATCH = {
  enabled: true,
  customCss: '',
  topBannerText: '',
  topBannerBg: '#0284c7',
  updatedAt: null as string | null,
};

export async function GET() {
  try {
    let stored: Record<string, unknown> = {};

    if (isSupabaseConfigured()) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        '';

      if (url && key) {
        const client = createClient(url, key, {
          auth: { persistSession: false },
        });

        const { data: rows } = await client
          .from('platform_settings')
          .select('key, value')
          .in('key', ['linkora_hotpatch_v1', 'site_master_control_config']);

        if (Array.isArray(rows)) {
          const dedicatedRow = rows.find((r: any) => r.key === 'linkora_hotpatch_v1');
          const masterRow = rows.find((r: any) => r.key === 'site_master_control_config');

          const dedicatedVal = (dedicatedRow?.value as Record<string, unknown>) || null;
          const masterVal = (masterRow?.value?.hotpatch as Record<string, unknown>) || null;

          // Pick whichever was saved more recently or has content
          if (dedicatedVal && masterVal) {
            const dedicatedTime = dedicatedVal.updatedAt ? new Date(dedicatedVal.updatedAt as string).getTime() : 0;
            const masterTime = masterVal.updatedAt ? new Date(masterVal.updatedAt as string).getTime() : 0;
            stored = dedicatedTime >= masterTime ? dedicatedVal : masterVal;
          } else {
            stored = dedicatedVal || masterVal || {};
          }
        }
      }
    }

    const publicConfig = {
      enabled:
        typeof stored.enabled === 'boolean'
          ? stored.enabled
          : DEFAULT_HOTPATCH.enabled,
      customCss:
        typeof stored.customCss === 'string' ? stored.customCss : '',
      customJs:
        typeof stored.customJs === 'string' ? stored.customJs : '',
      topBannerText:
        typeof stored.topBannerText === 'string'
          ? stored.topBannerText
          : '',
      topBannerBg:
        typeof stored.topBannerBg === 'string'
          ? stored.topBannerBg
          : DEFAULT_HOTPATCH.topBannerBg,
      updatedAt:
        typeof stored.updatedAt === 'string' ? stored.updatedAt : null,
    };

    return NextResponse.json(
      { success: true, hotpatch: publicConfig },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Public hotpatch configuration could not be loaded:', error);
    return NextResponse.json(
      { success: false, error: 'Could not load public appearance settings.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
