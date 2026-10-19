import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export interface HotPatchConfig {
  enabled: boolean;
  customCss: string;
  customJs: string;
  topBannerText?: string;
  topBannerBg?: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
}

const DEFAULT_HOTPATCH: HotPatchConfig = {
  enabled: true,
  customCss: `/* Linkora Live AI Hot-Patch & CSS Injection */
/* Paste any CSS from ChatGPT, Claude, or Gemini below to fix glitches live */
`,
  customJs: `// Live Safe JavaScript Hot-Fixes
// Runs after page loads to fix runtime bugs or modify DOM
`,
  topBannerText: '',
  topBannerBg: '#0284c7',
  lastUpdatedBy: 'Admin',
  updatedAt: new Date().toISOString(),
};

let memoryHotPatch = { ...DEFAULT_HOTPATCH };

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// GET: Fetch live hot-patch config for client injector & admin desk
export async function GET() {
  try {
    let hotpatch = { ...memoryHotPatch };

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data } = await client
          .from('platform_settings')
          .select('value')
          .eq('key', 'linkora_hotpatch_v1')
          .maybeSingle();

        if (data?.value) {
          hotpatch = { ...DEFAULT_HOTPATCH, ...data.value };
          memoryHotPatch = hotpatch;
        }
      } catch (e) {
        console.warn('Could not read linkora_hotpatch_v1 from Supabase:', e);
      }
    }

    return NextResponse.json({
      success: true,
      hotpatch,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch hotpatch' },
      { status: 500 }
    );
  }
}

// POST: Save hot-patch from Admin Control Center
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hotpatch } = body;

    if (!hotpatch) {
      return NextResponse.json({ success: false, error: 'Hotpatch data required' }, { status: 400 });
    }

    const updated: HotPatchConfig = {
      enabled: typeof hotpatch.enabled === 'boolean' ? hotpatch.enabled : true,
      customCss: hotpatch.customCss || '',
      customJs: hotpatch.customJs || '',
      topBannerText: hotpatch.topBannerText || '',
      topBannerBg: hotpatch.topBannerBg || '#0284c7',
      lastUpdatedBy: hotpatch.lastUpdatedBy || 'Mayank Goyal (Admin)',
      updatedAt: new Date().toISOString(),
    };

    memoryHotPatch = updated;

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('platform_settings').upsert({
          key: 'linkora_hotpatch_v1',
          value: updated,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Could not save hotpatch to Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: '🎉 Live Hot-Patch deployed across the entire website successfully!',
      hotpatch: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save hotpatch' },
      { status: 500 }
    );
  }
}
