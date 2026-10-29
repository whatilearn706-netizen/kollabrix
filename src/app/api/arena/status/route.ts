import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export interface ArenaSystemStatus {
  isLive: boolean;
  maintenanceMessage: string;
  updatedAt: string;
}

const DEFAULT_STATUS: ArenaSystemStatus = {
  isLive: true,
  maintenanceMessage:
    'Battle Arena is temporarily offline for scheduled system tuning, anti-cheat calibration, and challenge additions. Please check back shortly!',
  updatedAt: new Date().toISOString(),
};

// GET: Publicly query whether the Battle Arena is LIVE or in MAINTENANCE
export async function GET() {
  try {
    const isLive = await getMasterControlSubkey<boolean>('arena_is_live', true);
    const maintenanceMessage = await getMasterControlSubkey<string>(
      'arena_maintenance_message',
      DEFAULT_STATUS.maintenanceMessage
    );
    const updatedAt = await getMasterControlSubkey<string>(
      'arena_status_updated_at',
      DEFAULT_STATUS.updatedAt
    );

    return NextResponse.json(
      {
        success: true,
        isLive: isLive !== false, // default true
        maintenanceMessage: maintenanceMessage || DEFAULT_STATUS.maintenanceMessage,
        updatedAt: updatedAt || new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        isLive: true,
        maintenanceMessage: DEFAULT_STATUS.maintenanceMessage,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

// POST: Admin toggle to change Battle Arena status
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const isLive = Boolean(body.isLive);
    const maintenanceMessage =
      typeof body.maintenanceMessage === 'string' && body.maintenanceMessage.trim().length > 0
        ? body.maintenanceMessage.trim()
        : DEFAULT_STATUS.maintenanceMessage;
    const now = new Date().toISOString();

    await updateMasterControlSubkey('arena_is_live', isLive);
    await updateMasterControlSubkey('arena_maintenance_message', maintenanceMessage);
    await updateMasterControlSubkey('arena_status_updated_at', now);

    return NextResponse.json({
      success: true,
      isLive,
      maintenanceMessage,
      updatedAt: now,
      message: isLive
        ? 'Battle Arena is now LIVE and accessible to all students.'
        : 'Battle Arena has been placed in MAINTENANCE / OFFLINE mode.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
