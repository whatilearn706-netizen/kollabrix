import { NextRequest, NextResponse } from 'next/server';
import { ProctorIncident, ProctorLiveStats, ProctorViolationType } from '@/types/icpc';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

let memoryIncidents: ProctorIncident[] = [];

async function loadProctorIncidents(): Promise<ProctorIncident[]> {
  try {
    const list = await getMasterControlSubkey<ProctorIncident[]>('icpc_proctor_incidents', []);
    if (Array.isArray(list) && list.length > 0) {
      memoryIncidents = list;
      return list;
    }
  } catch (err) {
    console.warn('Error reading icpc_proctor_incidents from master control:', err);
  }
  return memoryIncidents;
}

async function saveProctorIncidents(incidents: ProctorIncident[]): Promise<void> {
  memoryIncidents = incidents;
  try {
    // Keep max 1000 latest incidents to prevent unbounded storage
    const trimmed = incidents.slice(0, 1000);
    await updateMasterControlSubkey('icpc_proctor_incidents', trimmed);
  } catch (err) {
    console.warn('Error saving icpc_proctor_incidents to master control:', err);
  }
}

// ── GET: Read all proctor incidents & statistics ──────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const incidents = await loadProctorIncidents();

    // Compute live statistics
    const stats: ProctorLiveStats = {
      activeSessions: 0,
      totalViolations: incidents.length,
      phoneViolations: incidents.filter((i) => i.violationType === 'PHONE_DETECTED').length,
      screenViolations: incidents.filter(
        (i) => i.violationType === 'FULLSCREEN_EXIT' || i.violationType === 'TAB_SWITCH'
      ).length,
      gazeViolations: incidents.filter((i) => i.violationType === 'GAZE_DEVIATION').length,
      pasteViolations: incidents.filter((i) => i.violationType === 'SUSPICIOUS_PASTE').length,
      flaggedStudentsCount: new Set(incidents.map((i) => i.studentId || i.studentName)).size,
    };

    return NextResponse.json({
      success: true,
      incidents,
      stats,
      count: incidents.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch proctor logs' },
      { status: 500 }
    );
  }
}

// ── POST: Log a proctor violation incident ────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`icpc-proctor-log:${ip}`, 120, 60 * 1000, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Proctor telemetry rate limit reached. Please throttle.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      studentId = 'anonymous',
      studentName = 'Contestant',
      studentEmail,
      college,
      contestId = 'icpc-arena',
      contestTitle = 'ICPC Contest',
      problemId,
      problemTitle,
      violationType = 'FULLSCREEN_EXIT',
      details = 'Security incident recorded',
      warningCount = 1,
      severity = 'medium',
      screenSnapshot,
    } = body;

    const newIncident: ProctorIncident = {
      id: `proc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      studentName,
      studentEmail,
      college,
      contestId,
      contestTitle,
      problemId,
      problemTitle,
      violationType: violationType as ProctorViolationType,
      details,
      timestamp: new Date().toISOString(),
      warningCount: Number(warningCount) || 1,
      severity: severity as any,
      resolved: false,
      screenSnapshot: typeof screenSnapshot === 'string' && screenSnapshot.startsWith('data:image/') ? screenSnapshot : undefined,
    };

    const currentIncidents = await loadProctorIncidents();
    const updated = [newIncident, ...currentIncidents];
    await saveProctorIncidents(updated);

    const totalWarningsForStudent = updated.filter(
      (i) => (i.studentId === studentId || i.studentName === studentName) && !i.resolved
    ).length;

    return NextResponse.json({
      success: true,
      incident: newIncident,
      totalWarningsForStudent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record proctor telemetry' },
      { status: 500 }
    );
  }
}

// ── DELETE: Clear / Resolve incidents (Admin action) ──────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get('id');
    const studentId = searchParams.get('studentId');
    const clearAll = searchParams.get('all') === 'true';

    let current = await loadProctorIncidents();

    if (clearAll) {
      current = [];
    } else if (incidentId) {
      current = current.filter((i) => i.id !== incidentId);
    } else if (studentId) {
      current = current.filter((i) => i.studentId !== studentId && i.studentName !== studentId);
    }

    await saveProctorIncidents(current);

    return NextResponse.json({
      success: true,
      message: 'Proctor logs successfully updated.',
      remaining: current.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete proctor logs' },
      { status: 500 }
    );
  }
}
