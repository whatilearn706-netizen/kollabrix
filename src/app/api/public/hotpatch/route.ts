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

        const { data: dedicatedRow, error: dedicatedError } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkora_hotpatch_v1')
          .maybeSingle();

        if (dedicatedError) throw dedicatedError;

        if (dedicatedRow?.value) {
          stored = dedicatedRow.value as Record<string, unknown>;
        } else {
          const { data: masterRow, error: masterError } = await client
            .from('platform_settings')
            .select('value')
            .eq('key', 'site_master_control_config')
            .maybeSingle();

          if (masterError) throw masterError;

          const masterValue = masterRow?.value as
            | Record<string, unknown>
            | null;
          stored = (masterValue?.hotpatch as Record<string, unknown>) || {};
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
