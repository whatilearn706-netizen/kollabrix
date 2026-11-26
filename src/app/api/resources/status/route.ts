import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export interface ResourcesSystemStatus {
  isLive: boolean;
  maintenanceMessage: string;
  updatedAt: string;
}

const DEFAULT_STATUS: ResourcesSystemStatus = {
  isLive: true,
  maintenanceMessage:
    'KOLLΛBRIX CODEX is currently offline while we curate new language tracks, technical manuals, and OA playbooks. Check back soon!',
  updatedAt: new Date().toISOString(),
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

// GET: Query whether KOLLΛBRIX CODEX (/resources) is LIVE or NOT LIVE
export async function GET() {
  try {
    const rawIsLive = await getMasterControlSubkey<any>('resources_is_live', true);
    const maintenanceMessage = await getMasterControlSubkey<string>(
      'resources_maintenance_message',
      DEFAULT_STATUS.maintenanceMessage
    );
    const updatedAt = await getMasterControlSubkey<string>(
      'resources_status_updated_at',
      DEFAULT_STATUS.updatedAt
    );

    const isLive = rawIsLive !== false && rawIsLive !== 'false' && rawIsLive !== 0;

    return NextResponse.json(
      {
        success: true,
        isLive,
        maintenanceMessage: maintenanceMessage || DEFAULT_STATUS.maintenanceMessage,
        updatedAt: updatedAt || new Date().toISOString(),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      {
        success: true,
        isLive: true,
        maintenanceMessage: DEFAULT_STATUS.maintenanceMessage,
        updatedAt: new Date().toISOString(),
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST: Admin toggle to set Resources (/resources) Live or Not Live
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized admin access' },
        { status: auth.status || 403, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const isLive = body.isLive === true || body.isLive === 'true' || body.isLive === 1;
    const maintenanceMessage =
      typeof body.maintenanceMessage === 'string' && body.maintenanceMessage.trim().length > 0
        ? body.maintenanceMessage.trim()
        : DEFAULT_STATUS.maintenanceMessage;
    const now = new Date().toISOString();

    await updateMasterControlSubkey('resources_is_live', isLive);
    await updateMasterControlSubkey('resources_maintenance_message', maintenanceMessage);
    await updateMasterControlSubkey('resources_status_updated_at', now);

    return NextResponse.json(
      {
        success: true,
        isLive,
        maintenanceMessage,
        updatedAt: now,
        message: isLive
          ? 'Resources (KΛ Codex) is now LIVE for all users.'
          : 'Resources (KΛ Codex) is now NOT LIVE (hidden from students).',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update Resources status' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
