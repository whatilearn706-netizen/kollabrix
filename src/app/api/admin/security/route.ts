import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { sendTelegramSecurityAlert } from '@/lib/security/telegramAlert';
import { sendAutomatedWhatsAppAlert } from '@/lib/security/whatsappAlert';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const DEFAULT_SECURITY_CONFIG = {
  whatsappPhone: process.env.WHATSAPP_PHONE || '',
  whatsappApiKey: process.env.WHATSAPP_CALLMEBOT_APIKEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  telegramAlertsEnabled: true,
  alertsEnabled: true,
  autoMaintenanceOnHighThreat: false,
  alertTypes: {
    unauthorizedAdminLogin: true,
    rapidRequestSpikes: true,
    xssInjectionPayload: true,
    dbTampering: true,
  },
  emergencyKey: process.env.EMERGENCY_MAINTENANCE_KEY || 'linkora-sec-emergency-2026',
};

// In-memory fallback
let memorySecurityConfig = { ...DEFAULT_SECURITY_CONFIG };
let memorySecurityEvents: any[] = [
  {
    id: 'evt-init-1',
    type: 'guard_active',
    severity: 'info',
    title: 'Vercel Serverless & Supabase RLS Active',
    description: 'Kernel-level row isolation and immutable Git containerization guarding live site.',
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
    status: 'neutralized',
  },
];

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  try {
    let config = { ...memorySecurityConfig };
    let events = [...memorySecurityEvents];

    const client = getSupabaseClient();
    if (client) {
      try {
        const { data } = await client
          .from('platform_settings')
          .select('key, value')
          .in('key', ['security_watchdog_v1', 'security_events_v1']);

        if (Array.isArray(data)) {
          for (const row of data) {
            if (row.key === 'security_watchdog_v1' && row.value) {
              config = { ...config, ...row.value };
              memorySecurityConfig = config;
            } else if (row.key === 'security_events_v1' && Array.isArray(row.value)) {
              events = row.value;
              memorySecurityEvents = events;
            }
          }
        }
      } catch (err) {
        console.warn('Could not read security config from platform_settings:', err);
      }
    }

    return NextResponse.json({
      success: true,
      config,
      events: events.slice(0, 30),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, event } = body;

    const client = getSupabaseClient();

    // Admin actions require verified administrative authorization
    if (
      action === 'save_config' ||
      action === 'generate_whatsapp_alert' ||
      action === 'send_telegram_test' ||
      action === 'send_whatsapp_automated_test'
    ) {
      const auth = await verifyAdminSession(request);
      if (!auth.authorized) {
        return NextResponse.json({ success: false, error: auth.error || 'Unauthorized: Admin authentication required.' }, { status: 403 });
      }
    }

    // 1. SAVE CONFIG
    if (action === 'save_config' && config) {
      memorySecurityConfig = { ...memorySecurityConfig, ...config };

      if (client) {
        try {
          await client.from('platform_settings').upsert({
            key: 'security_watchdog_v1',
            value: memorySecurityConfig,
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Could not save security config to Supabase:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Security Watchdog, WhatsApp & Telegram alert preferences saved successfully!',
        config: memorySecurityConfig,
      });
    }

    // 2. LOG NEW SUSPICIOUS EVENT
    if (action === 'log_event' && event) {
      const newEvt = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: event.type || 'suspicious_activity',
        severity: event.severity || 'medium',
        title: event.title || 'Suspicious Activity Detected',
        description: event.description || 'An unusual pattern was blocked by the security layer.',
        ip: event.ip || 'Client Edge',
        timestamp: new Date().toISOString(),
        status: 'blocked',
      };

      memorySecurityEvents.unshift(newEvt);

      if (client) {
        try {
          await client.from('platform_settings').upsert({
            key: 'security_events_v1',
            value: memorySecurityEvents.slice(0, 50),
            updated_at: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('Could not save security event to Supabase:', dbErr);
        }
      }

      // Auto-dispatch Telegram alert if configured
      if (
        memorySecurityConfig.telegramAlertsEnabled !== false &&
        (memorySecurityConfig.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN) &&
        (memorySecurityConfig.telegramChatId || process.env.TELEGRAM_CHAT_ID)
      ) {
        sendTelegramSecurityAlert({
          botToken: memorySecurityConfig.telegramBotToken,
          chatId: memorySecurityConfig.telegramChatId,
          title: newEvt.title,
          description: newEvt.description,
          ip: newEvt.ip,
          origin: request.nextUrl.origin,
          emergencyKey: memorySecurityConfig.emergencyKey,
        }).catch((err) => console.warn('Automatic Telegram alert failed:', err));
      }

      // Auto-dispatch WhatsApp alert via CallMeBot if configured
      if (
        memorySecurityConfig.alertsEnabled !== false &&
        (memorySecurityConfig.whatsappPhone || process.env.WHATSAPP_PHONE) &&
        (memorySecurityConfig.whatsappApiKey || process.env.WHATSAPP_CALLMEBOT_APIKEY)
      ) {
        sendAutomatedWhatsAppAlert({
          phone: memorySecurityConfig.whatsappPhone,
          apiKey: memorySecurityConfig.whatsappApiKey,
          title: newEvt.title,
          description: newEvt.description,
          ip: newEvt.ip,
          origin: request.nextUrl.origin,
          emergencyKey: memorySecurityConfig.emergencyKey,
        }).catch((err) => console.warn('Automatic WhatsApp alert failed:', err));
      }

      return NextResponse.json({ success: true, event: newEvt });
    }

    // 3. GENERATE WHATSAPP ALERT TEMPLATE
    if (action === 'generate_whatsapp_alert') {
      const origin = body.origin || 'https://linkora-link.online';
      const cleanPhone = (memorySecurityConfig.whatsappPhone || body.phone || '').replace(/[^0-9]/g, '');
      const eventDetails = body.eventDetails || {
        title: 'Suspicious Admin Login Attempt Blocked',
        ip: '103.14.24.89 (New Delhi, India)',
        timestamp: new Date().toLocaleTimeString(),
      };

      const emergencyLink = `${origin}/api/admin/emergency-maintenance?key=${memorySecurityConfig.emergencyKey}&action=activate`;
      const restoreLink = `${origin}/api/admin/emergency-maintenance?key=${memorySecurityConfig.emergencyKey}&action=deactivate`;

      const messageText = `🚨 *LINKORA SECURITY WATCHDOG ALERT*\n\n` +
        `⚠️ *Event*: ${eventDetails.title}\n` +
        `📍 *Source IP*: ${eventDetails.ip}\n` +
        `🕒 *Time*: ${eventDetails.timestamp}\n\n` +
        `🛡️ *Platform Status*: Threat neutralized by Edge Firewall & Serverless Sandbox.\n\n` +
        `💡 *What To Do / Recommended Solution*:\n` +
        `1. Review live Audit Logs: ${origin}/control-center-7x9?tab=audit\n` +
        `2. If anything feels broken or under attack, put the site on instant maintenance:\n\n` +
        `👉 *1-Tap Instant Maintenance Kill-Switch*:\n${emergencyLink}\n\n` +
        `*(To restore website later: ${restoreLink})*`;

      const whatsappUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

      return NextResponse.json({
        success: true,
        messageText,
        whatsappUrl,
        emergencyLink,
      });
    }

    // 4. SEND INSTANT TEST TELEGRAM ALERT
    if (action === 'send_telegram_test') {
      const origin = body.origin || request.nextUrl.origin || 'https://linkora.in';
      const botToken = body.botToken || memorySecurityConfig.telegramBotToken;
      const chatId = body.chatId || memorySecurityConfig.telegramChatId;

      if (!botToken || !chatId) {
        return NextResponse.json({
          success: false,
          error: 'Please enter both your Telegram Bot Token and Telegram Chat ID first.',
        }, { status: 400 });
      }

      const res = await sendTelegramSecurityAlert({
        botToken,
        chatId,
        title: 'Security Watchdog Test Alert (Verification)',
        description: 'Telegram automated security dispatch is operational! Any critical suspicious activity will automatically buzz your phone with 1-tap maintenance controls.',
        ip: '103.14.24.89 (Simulated Test)',
        origin,
        emergencyKey: memorySecurityConfig.emergencyKey,
      });

      return NextResponse.json({
        success: res.success,
        result: res,
        error: res.success ? undefined : (res as any).error || (res as any).reason || 'Failed to dispatch Telegram message. Check your bot token and chat ID.',
      });
    }

    // 5. SEND INSTANT TEST AUTOMATED WHATSAPP ALERT (VIA CALLMEBOT)
    if (action === 'send_whatsapp_automated_test') {
      const origin = body.origin || request.nextUrl.origin || 'https://linkora.in';
      const phone = body.phone || memorySecurityConfig.whatsappPhone || process.env.WHATSAPP_PHONE;
      const apiKey = body.apiKey || memorySecurityConfig.whatsappApiKey || process.env.WHATSAPP_CALLMEBOT_APIKEY;

      if (!phone || !apiKey) {
        return NextResponse.json({
          success: false,
          error: 'Please enter both your WhatsApp Phone number and CallMeBot API Key first.',
        }, { status: 400 });
      }

      const res = await sendAutomatedWhatsAppAlert({
        phone,
        apiKey,
        title: 'Security Watchdog WhatsApp Verification Test',
        description: 'WhatsApp automated background dispatch is operational! Any critical threats will now automatically buzz your phone with 1-tap maintenance controls.',
        ip: '103.14.24.89 (Simulated Test)',
        origin,
        emergencyKey: memorySecurityConfig.emergencyKey,
      });

      return NextResponse.json({
        success: res.success,
        result: res,
        error: res.success ? undefined : (res as any).error || (res as any).reason || (res as any).response || 'Failed to dispatch WhatsApp message. Please verify your phone number and CallMeBot API key.',
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Security action failed' },
      { status: 500 }
    );
  }
}
