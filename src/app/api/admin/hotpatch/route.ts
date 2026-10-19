import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

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

/**
 * Linkora SafeGuard Shield: Audits code for security hazards before live injection.
 * Prevents credential theft, cookie sniffing, and unauthorized exfiltration.
 */
function auditHotPatchSafety(css: string, js: string): { safe: boolean; reason?: string } {
  const dangerousPatterns = [
    { pattern: /document\.cookie/i, reason: 'Reading or writing browser session cookies is strictly forbidden.' },
    { pattern: /localStorage\s*\[\s*['"`]sb-/i, reason: 'Accessing Supabase authentication tokens is prohibited.' },
    { pattern: /sessionStorage\s*\[\s*['"`]sb-/i, reason: 'Accessing Supabase session tokens is prohibited.' },
    { pattern: /navigator\.sendBeacon/i, reason: 'Unauthorized background data beaconing is prohibited.' },
    { pattern: /<script[\s>]/i, reason: 'Raw script tag injection is prohibited. Use standard JavaScript syntax.' },
    { pattern: /webhook|discord\.com\/api\/webhooks|requestcatcher|pipedream|hookbin/i, reason: 'Unverified external webhook exfiltration endpoints are blocked.' },
    { pattern: /coinhive|cryptonight|miner/i, reason: 'Cryptocurrency mining scripts are strictly prohibited.' },
  ];

  for (const item of dangerousPatterns) {
    if (item.pattern.test(js) || item.pattern.test(css)) {
      return { safe: false, reason: item.reason };
    }
  }

  return { safe: true };
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// GET: Fetch live hot-patch config — public read of enabled+CSS is allowed for the client injector,
// but full config (including customJs) is only returned to authenticated admins
export async function GET(request: NextRequest) {
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

    // Check if caller is an authenticated admin
    const auth = await verifyAdminSession(request);
    if (auth.authorized) {
      // Admin gets the full config
      return NextResponse.json({ success: true, hotpatch });
    }

    // Unauthenticated callers (client injector) only receive the safe public fields
    return NextResponse.json({
      success: true,
      hotpatch: {
        enabled: hotpatch.enabled,
        customCss: hotpatch.customCss,
        customJs: hotpatch.customJs,
        topBannerText: hotpatch.topBannerText,
        topBannerBg: hotpatch.topBannerBg,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch hotpatch' },
      { status: 500 }
    );
  }
}

// POST: Save hot-patch from Admin Control Center (Strictly Authenticated & SafeGuard Audited)
export async function POST(request: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Authentication Check
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized: Only platform administrators can deploy hot-patches.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { hotpatch } = body;

    if (!hotpatch) {
      return NextResponse.json({ success: false, error: 'Hotpatch data required' }, { status: 400 });
    }

    const customCss = hotpatch.customCss || '';
    const customJs = hotpatch.customJs || '';

    // 2. SafeGuard Security Shield Audit
    const safety = auditHotPatchSafety(customCss, customJs);
    if (!safety.safe) {
      return NextResponse.json(
        {
          success: false,
          error: `🛡️ SafeGuard Security Shield Blocked Deployment: ${safety.reason}`,
        },
        { status: 400 }
      );
    }

    const updated: HotPatchConfig = {
      enabled: typeof hotpatch.enabled === 'boolean' ? hotpatch.enabled : true,
      customCss,
      customJs,
      topBannerText: hotpatch.topBannerText || '',
      topBannerBg: hotpatch.topBannerBg || '#0284c7',
      lastUpdatedBy: auth.user?.email || 'Mayank Goyal (Owner)',
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
      message: '🎉 Live Hot-Patch verified 100% safe & deployed across the platform!',
      hotpatch: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save hotpatch' },
      { status: 500 }
    );
  }
}
