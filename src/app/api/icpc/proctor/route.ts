import { NextRequest, NextResponse } from 'next/server';
import { ProctorIncident, ProctorLiveStats, ProctorViolationType, ActiveProctorSession } from '@/types/icpc';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

let memoryIncidents: ProctorIncident[] = [];
let memoryActiveSessions: Record<string, ActiveProctorSession> = {};

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
    const trimmed = incidents.slice(0, 1000);
    await updateMasterControlSubkey('icpc_proctor_incidents', trimmed);
  } catch (err) {
    console.warn('Error saving icpc_proctor_incidents to master control:', err);
  }
}

async function loadActiveSessions(): Promise<Record<string, ActiveProctorSession>> {
  try {
    const map = await getMasterControlSubkey<Record<string, ActiveProctorSession>>('icpc_active_proctor_sessions', {});
    if (map && typeof map === 'object') {
      memoryActiveSessions = map;
      return map;
    }
  } catch (err) {
    console.warn('Error reading icpc_active_proctor_sessions:', err);
  }
  return memoryActiveSessions;
}

async function saveActiveSessions(sessions: Record<string, ActiveProctorSession>): Promise<void> {
  memoryActiveSessions = sessions;
  try {
    const now = Date.now();
    const cleanMap: Record<string, ActiveProctorSession> = {};
    for (const [k, s] of Object.entries(sessions)) {
      if (now - new Date(s.lastHeartbeat).getTime() < 10 * 60 * 1000) {
        cleanMap[k] = s;
      }
    }
    await updateMasterControlSubkey('icpc_active_proctor_sessions', cleanMap);
  } catch (err) {
    console.warn('Error saving icpc_active_proctor_sessions:', err);
  }
}

async function loadMeetingUrl(): Promise<string> {
  try {
    return await getMasterControlSubkey<string>('icpc_proctor_meeting_url', '');
  } catch {
    return '';
  }
}

// ── GET: Read proctor incidents, live stats, and active sessions ──────────────
export async function GET(request: NextRequest) {
  try {
    const incidents = await loadProctorIncidents();
    const activeMap = await loadActiveSessions();
    const meetingUrl = await loadMeetingUrl();

    // Active within the last 45 seconds
    const now = Date.now();
    const activeSessionsList = Object.values(activeMap).filter(
      (s) => now - new Date(s.lastHeartbeat).getTime() < 45 * 1000
    );

    const stats: ProctorLiveStats = {
      activeSessions: activeSessionsList.length,
      totalViolations: incidents.length,
      phoneViolations: incidents.filter((i) => i.violationType === 'PHONE_DETECTED').length,
      screenViolations: incidents.filter(
        (i) => i.violationType === 'FULLSCREEN_EXIT' || i.violationType === 'TAB_SWITCH' || i.violationType === 'SCREEN_SHARE_STOPPED'
      ).length,
      gazeViolations: incidents.filter((i) => i.violationType === 'GAZE_DEVIATION').length,
      pasteViolations: incidents.filter((i) => i.violationType === 'SUSPICIOUS_PASTE').length,
      flaggedStudentsCount: new Set(incidents.map((i) => i.studentId || i.studentName)).size,
    };

    return NextResponse.json({
      success: true,
      incidents,
      stats,
      activeSessions: activeSessionsList,
      proctorMeetingUrl: meetingUrl,
      count: incidents.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch proctor logs' },
      { status: 500 }
    );
  }
}

// ── POST: Log incident, heartbeat, admin caution, or demolish ─────────────────
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`icpc-proctor-post:${ip}`, 300, 60 * 1000, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Proctor telemetry rate limit reached. Please throttle.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // 1. Heartbeat from student client
    if (action === 'heartbeat') {
      const {
        studentId = 'anonymous',
        studentName = 'Contestant',
        studentEmail,
        college,
        contestId = 'icpc-arena',
        contestTitle = 'ICPC Contest',
        problemTitle,
        warningCount = 0,
        screenSnapshot,
      } = body;

      const activeMap = await loadActiveSessions();
      const existing = activeMap[studentId] || {
        id: studentId,
        studentId,
        studentName,
        studentEmail,
        college,
        contestId,
        contestTitle,
        problemTitle,
        warningCount: 0,
        status: 'active',
        lastHeartbeat: new Date().toISOString(),
      };

      const cautionMessage = existing.cautionMessage;
      const isDemolished = existing.status === 'demolished';

      // Clear caution once read so it triggers modal once
      if (existing.cautionMessage) {
        existing.cautionMessage = undefined;
        existing.status = 'active';
      }

      existing.studentName = studentName || existing.studentName;
      existing.college = college || existing.college;
      existing.contestId = contestId || existing.contestId;
      existing.contestTitle = contestTitle || existing.contestTitle;
      existing.problemTitle = problemTitle || existing.problemTitle;
      existing.warningCount = Number(warningCount) || existing.warningCount;
      existing.lastHeartbeat = new Date().toISOString();
      if (typeof screenSnapshot === 'string' && screenSnapshot.startsWith('data:image/')) {
        existing.screenSnapshot = screenSnapshot;
      }

      activeMap[studentId] = existing;
      await saveActiveSessions(activeMap);

      return NextResponse.json({
        success: true,
        cautionMessage,
        isDemolished,
      });
    }

    // 2. Admin action: Give Caution to student
    if (action === 'caution') {
      const { studentId, message = 'Proctor Warning: Academic integrity caution issued by faculty proctor.' } = body;
      const activeMap = await loadActiveSessions();
      if (activeMap[studentId]) {
        activeMap[studentId].status = 'cautioned';
        activeMap[studentId].cautionMessage = message;
        await saveActiveSessions(activeMap);
      }
      return NextResponse.json({ success: true, message: 'Caution alert successfully sent to student.' });
    }

    // 3. Admin action: Demolish / Disqualify contestant session
    if (action === 'demolish') {
      const { studentId, reason = 'Session forcefully demolished and contestant disqualified by faculty administrator.' } = body;
      const activeMap = await loadActiveSessions();
      const target = activeMap[studentId];

      if (target) {
        target.status = 'demolished';
        await saveActiveSessions(activeMap);
      }

      const newIncident: ProctorIncident = {
        id: `proc-demolish-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentId,
        studentName: target?.studentName || studentId,
        studentEmail: target?.studentEmail,
        college: target?.college,
        contestId: target?.contestId || 'icpc-arena',
        contestTitle: target?.contestTitle || 'ICPC Contest',
        problemTitle: target?.problemTitle,
        violationType: 'SCREEN_SHARE_STOPPED',
        details: reason,
        timestamp: new Date().toISOString(),
        warningCount: 10,
        severity: 'critical',
        screenSnapshot: target?.screenSnapshot,
      };

      const currentIncidents = await loadProctorIncidents();
      await saveProctorIncidents([newIncident, ...currentIncidents]);

      return NextResponse.json({
        success: true,
        message: 'Contestant session demolished and disqualified.',
      });
    }

    // 4. Admin action: Update External Proctor Meeting URL (Zoom/Meet/Discord)
    if (action === 'update_meeting_url') {
      const { meetingUrl } = body;
      await updateMasterControlSubkey('icpc_proctor_meeting_url', typeof meetingUrl === 'string' ? meetingUrl.trim() : '');
      return NextResponse.json({ success: true, meetingUrl: meetingUrl || '' });
    }

    // 5. Standard incident logging (default)
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

    // Update active map with the violation info
    const activeMap = await loadActiveSessions();
    if (activeMap[studentId]) {
      activeMap[studentId].warningCount = Number(warningCount) || activeMap[studentId].warningCount;
      if (screenSnapshot) {
        activeMap[studentId].screenSnapshot = screenSnapshot;
      }
      await saveActiveSessions(activeMap);
    }

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
