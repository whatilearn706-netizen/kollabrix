import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_MASTER_CONTROL_CONFIG, MasterControlConfig } from '@/types/masterControl';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const EMERGENCY_SECRET = 'linkora-sec-emergency-2026';

const MASTER_KEY = 'site_master_control_config';

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// GET: Direct 1-tap link from WhatsApp to activate or deactivate Emergency Maintenance
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const action = url.searchParams.get('action'); // 'activate' | 'deactivate' | 'status'

  if (key !== EMERGENCY_SECRET) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Access Denied</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:system-ui;background:#0f172a;color:#f87171;padding:2rem;text-align:center;">
          <h2>❌ Unauthorized Emergency Access</h2>
          <p style="color:#94a3b8;">Invalid security emergency token.</p>
        </body>
      </html>`,
      { status: 403, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const client = getSupabaseClient();
  let currentConfig: MasterControlConfig = { ...DEFAULT_MASTER_CONTROL_CONFIG };

  if (client) {
    try {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', MASTER_KEY)
        .maybeSingle();

      if (data?.value) {
        currentConfig = { ...DEFAULT_MASTER_CONTROL_CONFIG, ...data.value };
      }
    } catch (e) {
      console.warn('Emergency maintenance read error:', e);
    }
  }

  let newMode: 'maintenance' | 'public' = currentConfig.maintenance?.mode === 'maintenance' ? 'maintenance' : 'public';
  let message = '';

  if (action === 'activate') {
    newMode = 'maintenance';
    currentConfig.maintenance = {
      ...(currentConfig.maintenance || DEFAULT_MASTER_CONTROL_CONFIG.maintenance),
      mode: 'maintenance',
      maintenanceHeadline: currentConfig.maintenance?.maintenanceHeadline || 'Campus Platform Upgrade in Progress',
      maintenanceMessage: currentConfig.maintenance?.maintenanceMessage || 'Linkora is currently undergoing scheduled platform upgrades to optimize high-performance collegiate services. We will be back online shortly.',
    };
    message = '🚨 EMERGENCY MAINTENANCE IS NOW ACTIVE! Your website is safely hidden from public visitors.';
  } else if (action === 'deactivate') {
    newMode = 'public';
    currentConfig.maintenance = {
      ...(currentConfig.maintenance || DEFAULT_MASTER_CONTROL_CONFIG.maintenance),
      mode: 'public',
    };
    message = '✅ MAINTENANCE DEACTIVATED! Linkora is now live and accessible to all students.';
  }

  if (client && (action === 'activate' || action === 'deactivate')) {
    try {
      await Promise.allSettled([
        client.from('platform_settings').upsert({
          key: MASTER_KEY,
          value: currentConfig,
          updated_at: new Date().toISOString(),
        }),
        client.from('platform_settings').upsert({
          key: 'master_control_config_v1',
          value: currentConfig,
          updated_at: new Date().toISOString(),
        }),
      ]);
    } catch (e) {
      console.warn('Emergency maintenance write error:', e);
    }
  }

  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Linkora Emergency Control</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
        .card { max-width: 440px; width: 100%; background: #131b2e; border: 1px solid #1e293b; border-radius: 24px; padding: 28px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }
        .icon-active { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; }
        .icon-public { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; }
        h1 { font-size: 20px; font-weight: 800; margin: 0 0 8px; color: #ffffff; }
        p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 24px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; font-family: monospace; text-transform: uppercase; margin-bottom: 16px; }
        .badge-active { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
        .badge-public { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }
        .btn { display: block; width: 100%; padding: 12px; border-radius: 14px; font-weight: 700; font-size: 13px; text-decoration: none; box-sizing: border-box; cursor: pointer; border: none; transition: all 0.2s; margin-bottom: 10px; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-success { background: #10b981; color: white; }
        .btn-outline { background: transparent; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="icon ${newMode === 'maintenance' ? 'icon-active' : 'icon-public'}">
          ${newMode === 'maintenance' ? '🔒' : '🌐'}
        </div>
        <div class="status-badge ${newMode === 'maintenance' ? 'badge-active' : 'badge-public'}">
          ${newMode === 'maintenance' ? 'WEBSITE IN EMERGENCY MAINTENANCE' : 'WEBSITE IS LIVE NATIONWIDE'}
        </div>
        <h1>Linkora Emergency Switch</h1>
        <p>${message || (newMode === 'maintenance' ? 'Linkora is hidden behind a clean maintenance screen.' : 'Linkora is online.')}</p>

        ${
          newMode === 'maintenance'
            ? `<a href="/api/admin/emergency-maintenance?key=${EMERGENCY_SECRET}&action=deactivate" class="btn btn-success">
                ✅ Restore Website Live (Deactivate Maintenance)
              </a>`
            : `<a href="/api/admin/emergency-maintenance?key=${EMERGENCY_SECRET}&action=activate" class="btn btn-danger">
                🚨 Put Website on Maintenance Now
              </a>`
        }

        <a href="/control-center-7x9" class="btn btn-outline">
          Open Admin Control Center →
        </a>
      </div>
    </body>
  </html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': `linkora_master_control_config=${encodeURIComponent(JSON.stringify(currentConfig))}; Path=/; Max-Age=31536000; SameSite=Lax`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
