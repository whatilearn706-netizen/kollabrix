import { NextRequest, NextResponse } from 'next/server';
import { ProctorIncident, ProctorLiveStats, ProctorViolationType, ActiveProctorSession } from '@/types/icpc';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';
import { sendTelegramIcpcAlert } from '@/lib/security/telegramAlert';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

let memoryIncidents: ProctorIncident[] = [];
let memoryActiveSessions: Record<string, ActiveProctorSession> = {};
let lastDbSessionFlush = 0;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getTelegramConfig(): Promise<{ botToken: string; chatId: string; configured: boolean }> {
  try {
    const icpcTg = await getMasterControlSubkey<{ botToken?: string; chatId?: string }>('icpc_telegram_config', {});
    if (icpcTg?.botToken && icpcTg?.chatId) {
      return { botToken: icpcTg.botToken.trim(), chatId: icpcTg.chatId.trim(), configured: true };
    }
    const watchdog = await getMasterControlSubkey<{ telegramBotToken?: string; telegramChatId?: string }>('security_watchdog_v1', {});
    if (watchdog?.telegramBotToken && watchdog?.telegramChatId) {
      return { botToken: watchdog.telegramBotToken.trim(), chatId: watchdog.telegramChatId.trim(), configured: true };
    }
  } catch (err) {
    console.warn('Error reading telegram config:', err);
  }
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const envChat = process.env.TELEGRAM_CHAT_ID?.trim() || '';
  return {
    botToken: envToken,
    chatId: envChat,
    configured: Boolean(envToken && envChat),
  };
}

async function loadProctorIncidents(): Promise<ProctorIncident[]> {
  if (memoryIncidents.length > 0) return memoryIncidents;
  try {
    const client = getSupabaseAdmin();
    if (!client) return memoryIncidents;
    const { data } = await client.from('platform_settings').select('value').eq('key', 'icpc_proctor_incidents').maybeSingle();
    if (Array.isArray(data?.value) && data.value.length > 0) {
      memoryIncidents = data.value;
      return memoryIncidents;
    }
  } catch (err) {
    console.warn('Error reading icpc_proctor_incidents:', err);
  }
  return memoryIncidents;
}

async function saveProctorIncidents(incidents: ProctorIncident[]): Promise<void> {
  memoryIncidents = incidents;
  try {
    const client = getSupabaseAdmin();
    if (!client) return;
    const trimmed = incidents.slice(0, 100); // Keep max 100 recent incidents to prevent DB egress bloat
    await client.from('platform_settings').upsert({
      key: 'icpc_proctor_incidents',
      value: trimmed,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error saving icpc_proctor_incidents to dedicated row:', err);
  }
}

async function loadActiveSessions(): Promise<Record<string, ActiveProctorSession>> {
  if (Object.keys(memoryActiveSessions).length > 0) return memoryActiveSessions;
  try {
    const client = getSupabaseAdmin();
    if (!client) return memoryActiveSessions;
    const { data } = await client.from('platform_settings').select('value').eq('key', 'icpc_active_proctor_sessions').maybeSingle();
    if (data?.value && typeof data.value === 'object') {
      memoryActiveSessions = data.value;
      return memoryActiveSessions;
    }
  } catch (err) {
    console.warn('Error reading icpc_active_proctor_sessions:', err);
  }
  return memoryActiveSessions;
}

async function saveActiveSessions(sessions: Record<string, ActiveProctorSession>, forceFlush = false): Promise<void> {
  memoryActiveSessions = sessions;
  const now = Date.now();
  // Throttle database persistence to at most once per 30 seconds to protect Supabase Egress & Log Ingestion
  if (!forceFlush && (now - lastDbSessionFlush < 30_000)) {
    return;
  }
  lastDbSessionFlush = now;

  try {
    const client = getSupabaseAdmin();
    if (!client) return;
    const cleanMap: Record<string, ActiveProctorSession> = {};
    for (const [k, s] of Object.entries(sessions)) {
      if (now - new Date(s.lastHeartbeat).getTime() < 10 * 60 * 1000) {
        // STRIP screenSnapshot so heavy Base64 images are NEVER written to Supabase!
        const { screenSnapshot, ...rest } = s;
        cleanMap[k] = rest as ActiveProctorSession;
      }
    }
    await client.from('platform_settings').upsert({
      key: 'icpc_active_proctor_sessions',
      value: cleanMap,
      updated_at: new Date().toISOString(),
    });
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

    const tgConfig = await getTelegramConfig();
    const telegramStatus = {
      configured: tgConfig.configured,
      botTokenMasked: tgConfig.botToken ? `${tgConfig.botToken.slice(0, 6)}...${tgConfig.botToken.slice(-4)}` : '',
      chatIdMasked: tgConfig.chatId ? `${tgConfig.chatId.slice(0, 3)}***${tgConfig.chatId.slice(-2)}` : '',
      botToken: tgConfig.botToken,
      chatId: tgConfig.chatId,
    };

    return NextResponse.json({
      success: true,
      incidents,
      stats,
      activeSessions: activeSessionsList,
      proctorMeetingUrl: meetingUrl,
      telegramConfig: telegramStatus,
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

    // 0a. Admin action: Save Telegram Configuration
    if (action === 'save_telegram_config') {
      const auth = await verifyAdminSession(request);
      if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
      }
      const { botToken = '', chatId = '' } = body;
      await updateMasterControlSubkey('icpc_telegram_config', {
        botToken: typeof botToken === 'string' ? botToken.trim() : '',
        chatId: typeof chatId === 'string' ? chatId.trim() : '',
      });
      return NextResponse.json({ success: true, message: 'Telegram alert configuration saved successfully.' });
    }

    // 0b. Admin action: Test Telegram Alert
    if (action === 'telegram_test') {
      const auth = await verifyAdminSession(request);
      if (!auth.authorized) {
        return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
      }
      const tg = await getTelegramConfig();
      if (!tg.configured) {
        return NextResponse.json({
          success: false,
          error: 'Telegram is not configured. Please enter a valid Telegram Bot Token and Chat ID.',
        }, { status: 400 });
      }

      const testResult = await sendTelegramIcpcAlert({
        studentName: 'Admin Diagnostic Test',
        studentId: 'admin-test',
        contestTitle: 'ICPC Arena Proctor System Verification',
        college: 'Kollabrix System Watchdog',
        event: 'started',
        details: '🔔 Real-Time Proctor Alert Test: Telegram connection is ACTIVE. You will receive live contestant notifications here with 1-click live screen inspection links!',
        botToken: tg.botToken,
        chatId: tg.chatId,
      });

      if (!testResult.success) {
        return NextResponse.json({
          success: false,
          error: testResult.reason || (testResult as any).error || 'Telegram API failed to deliver message.',
        }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Telegram test message successfully sent! Check your Telegram app.' });
    }

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
      const isFirstEntry = !activeMap[studentId] || !activeMap[studentId].startedNotified;

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
        startedNotified: false,
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

      // Send instant Telegram alert to admin when a contestant enters the arena
      if (isFirstEntry) {
        existing.startedNotified = true;
        getTelegramConfig().then((tg) => {
          if (tg.configured) {
            sendTelegramIcpcAlert({
              studentName: existing.studentName,
              studentId: existing.studentId,
              contestTitle: existing.contestTitle,
              college: existing.college,
              problemTitle: existing.problemTitle,
              event: 'started',
              botToken: tg.botToken,
              chatId: tg.chatId,
            }).catch((e) => console.warn('Failed to send entry Telegram alert:', e));
          }
        }).catch(() => {});
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
      if (!activeMap[studentId]) {
        activeMap[studentId] = {
          id: studentId,
          studentId,
          studentName: studentId,
          contestId: 'icpc-arena',
          contestTitle: 'ICPC Contest',
          warningCount: 0,
          status: 'cautioned',
          startedNotified: true,
          lastHeartbeat: new Date().toISOString(),
          cautionMessage: message,
        };
      } else {
        activeMap[studentId].status = 'cautioned';
        activeMap[studentId].cautionMessage = message;
      }
      await saveActiveSessions(activeMap);
      return NextResponse.json({ success: true, message: 'Caution alert successfully sent to student.' });
    }

    // 3. Admin action: Demolish / Disqualify contestant session
    if (action === 'demolish') {
      const { studentId, reason = 'Session forcefully demolished and contestant disqualified by faculty administrator.' } = body;
      const activeMap = await loadActiveSessions();
      const target = activeMap[studentId];

      if (target) {
        target.status = 'demolished';
      } else {
        activeMap[studentId] = {
          id: studentId,
          studentId,
          studentName: studentId,
          contestId: 'icpc-arena',
          contestTitle: 'ICPC Contest',
          warningCount: 10,
          status: 'demolished',
          startedNotified: true,
          lastHeartbeat: new Date().toISOString(),
        };
      }
      await saveActiveSessions(activeMap);

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

      // Trigger Telegram demolish alert
      getTelegramConfig().then((tg) => {
        if (tg.configured) {
          sendTelegramIcpcAlert({
            studentName: target?.studentName || studentId,
            studentId,
            contestTitle: target?.contestTitle || 'ICPC Contest',
            college: target?.college,
            event: 'demolished',
            details: reason,
            botToken: tg.botToken,
            chatId: tg.chatId,
          }).catch((e) => console.warn('Failed to send demolish Telegram alert:', e));
        }
      }).catch(() => {});

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

    // Notify admin on Telegram for phone detection or critical violations
    if (violationType === 'PHONE_DETECTED' || severity === 'critical') {
      getTelegramConfig().then((tg) => {
        if (tg.configured) {
          sendTelegramIcpcAlert({
            studentName,
            studentId,
            contestTitle,
            college,
            problemTitle,
            event: 'violation',
            details: `${violationType}: ${details}`,
            botToken: tg.botToken,
            chatId: tg.chatId,
          }).catch((e) => console.warn('Telegram violation alert failed:', e));
        }
      }).catch(() => {});
    }

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
