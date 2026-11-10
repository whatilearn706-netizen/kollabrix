import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlRecord } from '@/lib/admin/masterConfigStorage';
import { DEFAULT_WARP_PORTAL_CONFIG, WarpPortalConfig } from '@/types/warpPortal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
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
      console.warn('Could not read warpPortalConfig from master record:', e);
    }

    return NextResponse.json(
      { success: true, config },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, config: DEFAULT_WARP_PORTAL_CONFIG, error: error?.message },
      { status: 500 }
    );
  }
}
