import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { getMasterControlRecord, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { DEFAULT_WARP_PORTAL_CONFIG, WarpPortalConfig } from '@/types/warpPortal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    let config: WarpPortalConfig = DEFAULT_WARP_PORTAL_CONFIG;

    try {
      const master = await getMasterControlRecord();
      if (master?.warpPortalConfig) {
        config = {
          ...DEFAULT_WARP_PORTAL_CONFIG,
          ...master.warpPortalConfig,
          candidates: Array.isArray(master.warpPortalConfig.candidates) && master.warpPortalConfig.candidates.length > 0
            ? master.warpPortalConfig.candidates
            : DEFAULT_WARP_PORTAL_CONFIG.candidates,
        };
      }
    } catch (e) {
      console.warn('Admin read error warpPortalConfig:', e);
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch warp portal configuration.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const config = body.config as WarpPortalConfig;

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Invalid configuration payload.' }, { status: 400 });
    }

    // Sanitize and ensure candidates array
    const sanitizedConfig: WarpPortalConfig = {
      enabled: Boolean(config.enabled ?? true),
      intervalSeconds: Math.max(5, Math.min(60, Number(config.intervalSeconds) || 12)),
      depthMode: config.depthMode || '3d_cinematic',
      multiRingGate: Boolean(config.multiRingGate ?? true),
      lightningArcs: Boolean(config.lightningArcs ?? true),
      candidates: Array.isArray(config.candidates)
        ? config.candidates.map((c, idx) => ({
            id: c.id || `ship-${idx + 1}-${Date.now()}`,
            name: (c.name || 'Unnamed Voyager').trim(),
            role: (c.role || 'Crew Member').trim(),
            squad: (c.squad || 'Collegiate Network').trim(),
            craftModel: c.craftModel || 'battleship',
            glowColor: c.glowColor || 'amber',
            active: Boolean(c.active ?? true),
          }))
        : DEFAULT_WARP_PORTAL_CONFIG.candidates,
    };

    const result = await updateMasterControlSubkey('warpPortalConfig', sanitizedConfig);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save warp portal config.' },
        { status: 500 }
      );
    }

    await recordAdminAuditLog({
      action: 'UPDATE_WARP_PORTAL_CONFIG',
      targetType: 'HOMEPAGE',
      targetId: 'warpPortalConfig',
      details: {
        candidateCount: sanitizedConfig.candidates.length,
        enabled: sanitizedConfig.enabled,
        intervalSeconds: sanitizedConfig.intervalSeconds,
      },
      actorEmail: auth.user?.email || 'admin',
      actorId: auth.user?.id,
    });

    return NextResponse.json({
      success: true,
      config: sanitizedConfig,
      message: '3D Warp Gate & Spacecraft settings saved successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update 3D warp portal configuration.' },
      { status: 500 }
    );
  }
}
