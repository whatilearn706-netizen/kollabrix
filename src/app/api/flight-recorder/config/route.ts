import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { DEFAULT_FLIGHT_RECORDER_CONFIG, FlightRecorderConfig } from '@/types/flightRecorder';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Public status of Flight Recorder (Live or Staging)
export async function GET() {
  try {
    const rawConfig = await getMasterControlSubkey<FlightRecorderConfig | null>(
      'flight_recorder_config',
      null
    );

    const config: FlightRecorderConfig = {
      ...DEFAULT_FLIGHT_RECORDER_CONFIG,
      ...(rawConfig && typeof rawConfig === 'object' ? rawConfig : {}),
    };

    return NextResponse.json(
      {
        success: true,
        config,
        is_live: Boolean(config.is_live),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, config: DEFAULT_FLIGHT_RECORDER_CONFIG, is_live: false },
      { status: 200 }
    );
  }
}

// POST: Admin updates Flight Recorder settings (including Live / Draft toggle)
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized admin access' },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const rawConfig = await getMasterControlSubkey<FlightRecorderConfig | null>(
      'flight_recorder_config',
      null
    );

    const currentConfig: FlightRecorderConfig = {
      ...DEFAULT_FLIGHT_RECORDER_CONFIG,
      ...(rawConfig && typeof rawConfig === 'object' ? rawConfig : {}),
    };

    const updatedConfig: FlightRecorderConfig = {
      ...currentConfig,
      ...body,
      last_updated: new Date().toISOString(),
      updated_by: auth.user?.email || 'admin',
    };

    const res = await updateMasterControlSubkey('flight_recorder_config', updatedConfig);
    if (!res.success) {
      throw new Error(res.error || 'Failed to update flight recorder config');
    }

    return NextResponse.json({
      success: true,
      message: `Flight Recorder is now ${updatedConfig.is_live ? 'LIVE across Kollabrix' : 'in DRAFT / STAGING mode'}`,
      config: updatedConfig,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
