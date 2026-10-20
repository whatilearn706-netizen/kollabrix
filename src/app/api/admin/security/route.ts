import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { sendTelegramSecurityAlert } from '@/lib/security/telegramAlert';
import { sendAutomatedWhatsAppAlert } from '@/lib/security/whatsappAlert';
import { getMasterControlRecord, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const CONFIG_KEY = 'security_watchdog_v1';
const EVENTS_KEY = 'security_events_v1';
const MAX_EVENTS = 50;
const MAX_FIELD_LENGTH = 500;

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
  // No hardcoded emergency-key fallback.
  emergencyKey: process.env.EMERGENCY_MAINTENANCE_KEY || '',
};

type SecurityConfig = typeof DEFAULT_SECURITY_CONFIG;

type SecurityEvent = {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  ip: string;
  timestamp: string;
  status: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    }
  );
}

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function safeConfig(config: SecurityConfig) {
  const {
    whatsappApiKey,
    emergencyKey,
    ...adminExposedConfig
  } = config;

  return {
    ...adminExposedConfig,
    telegramBotToken: config.telegramBotToken || '',
    telegramChatId: config.telegramChatId || '',
    telegramBotConfigured: Boolean(config.telegramBotToken),
    telegramChatConfigured: Boolean(config.telegramChatId),
    whatsappApiKeyConfigured: Boolean(whatsappApiKey),
    emergencyKeyConfigured: Boolean(emergencyKey),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function cleanText(value: unknown, maxLength = MAX_FIELD_LENGTH): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function validBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function validSeverity(value: unknown): value is string {
  return (
    value === 'info' ||
    value === 'low' ||
    value === 'medium' ||
    value === 'high' ||
    value === 'critical'
  );
}

function safeOrigin(request: NextRequest, suppliedOrigin?: unknown) {
  const allowedOrigins = new Set<string>();

  for (const value of [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://linkora-edu.vercel.app',
    'https://linkora.in',
  ]) {
    if (!value) continue;

    try {
      allowedOrigins.add(new URL(value).origin);
    } catch {
      // Ignore malformed environment values.
    }
  }

  const requestOrigin = request.nextUrl.origin;

  try {
    const requested = new URL(
      typeof suppliedOrigin === 'string' ? suppliedOrigin : requestOrigin
    );

    if (
      requested.protocol === 'https:' &&
      allowedOrigins.has(requested.origin)
    ) {
      return requested.origin;
    }
  } catch {
    // Use the configured fallback below.
  }

  if (allowedOrigins.has(requestOrigin)) return requestOrigin;

  return process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
    : 'https://linkora-edu.vercel.app';
}

async function readSettings() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error('Security settings database is unavailable.');
  }

  const { data, error } = await client
    .from('platform_settings')
    .select('key, value')
    .in('key', [CONFIG_KEY, EVENTS_KEY]);

  if (error) {
    console.error('Security settings read failed:', error.message);
    throw new Error('Could not read security settings from the database.');
  }

  let config: SecurityConfig = { ...DEFAULT_SECURITY_CONFIG };
  let events: SecurityEvent[] = [];

  for (const row of data || []) {
    if (row.key === CONFIG_KEY && isRecord(row.value)) {
      config = {
        ...config,
        ...(row.value as Partial<SecurityConfig>),
        alertTypes: {
          ...DEFAULT_SECURITY_CONFIG.alertTypes,
          ...(isRecord(row.value.alertTypes)
            ? row.value.alertTypes
            : {}),
        },
      };
    }

    if (row.key === EVENTS_KEY && Array.isArray(row.value)) {
      events = row.value.slice(0, MAX_EVENTS) as SecurityEvent[];
    }
  }

  // Also read from master control record to ensure persistence across environments
  try {
    const master = await getMasterControlRecord();
    if (master && master.security && isRecord(master.security)) {
      config = {
        ...config,
        ...(master.security as Partial<SecurityConfig>),
        alertTypes: {
          ...DEFAULT_SECURITY_CONFIG.alertTypes,
          ...(isRecord((master.security as any).alertTypes)
            ? (master.security as any).alertTypes
            : {}),
        },
      };
    }
  } catch (e) {}

  return { client, config, events };
}

async function persistSetting(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  key: string,
  value: unknown
) {
  // 1. Authoritative persistence in site_master_control_config
  await updateMasterControlSubkey(key === CONFIG_KEY ? 'security' : key, value);

  // 2. Also attempt dedicated row upsert if permissions allow
  try {
    await client.from('platform_settings').upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch (e) {}
}

function validateConfigUpdates(input: unknown) {
  if (!isRecord(input)) {
    throw new Error('Invalid security settings.');
  }

  const updates: Record<string, unknown> = {};

  const stringFields = [
    'whatsappPhone',
    'whatsappApiKey',
    'telegramBotToken',
    'telegramChatId',
  ] as const;

  for (const key of stringFields) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

    const value = input[key];

    // Blank secret fields mean retain the existing credential.
    if (
      ['whatsappApiKey', 'telegramBotToken', 'telegramChatId'].includes(key) &&
      (typeof value !== 'string' || value.trim() === '')
    ) {
      continue;
    }

    if (typeof value !== 'string' || value.length > 1000) {
      throw new Error(`Invalid value for ${key}.`);
    }

    updates[key] = value.trim();
  }

  for (const key of [
    'telegramAlertsEnabled',
    'alertsEnabled',
    'autoMaintenanceOnHighThreat',
  ] as const) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

    if (!validBoolean(input[key])) {
      throw new Error(`Invalid value for ${key}.`);
    }

    updates[key] = input[key];
  }

  if (Object.prototype.hasOwnProperty.call(input, 'alertTypes')) {
    if (!isRecord(input.alertTypes)) {
      throw new Error('Invalid alert preferences.');
    }

    const allowedAlertTypes = [
      'unauthorizedAdminLogin',
      'rapidRequestSpikes',
      'xssInjectionPayload',
      'dbTampering',
    ] as const;

    const alertTypes: Record<string, boolean> = {};

    for (const key of allowedAlertTypes) {
      if (!Object.prototype.hasOwnProperty.call(input.alertTypes, key)) {
        continue;
      }

      if (!validBoolean(input.alertTypes[key])) {
        throw new Error(`Invalid alert preference: ${key}.`);
      }

      alertTypes[key] = input.alertTypes[key];
    }

    updates.alertTypes = alertTypes;
  }

  return updates;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);

    if (!auth.authorized) {
      return jsonError('Unauthorized.', 403);
    }

    const { config, events } = await readSettings();

    return NextResponse.json(
      {
        success: true,
        config: safeConfig(config),
        events,
      },
      {
        headers: { 'Cache-Control': 'no-store, private' },
      }
    );
  } catch (error) {
    console.error(
      'Security settings GET failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : 'Failed to load security settings.',
      503
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);

    if (!auth.authorized) {
      return jsonError('Unauthorized.', 403);
    }

    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return jsonError('Invalid request body.', 400);
    }

    const action = cleanText(body.action, 80);
    const { client, config: currentConfig, events } = await readSettings();

    // 1. Save settings without accepting arbitrary config properties.
    if (action === 'save_config') {
      const updates = validateConfigUpdates(body.config);

      const nextConfig = {
        ...currentConfig,
        ...updates,
        alertTypes: {
          ...currentConfig.alertTypes,
          ...(isRecord(updates.alertTypes) ? updates.alertTypes : {}),
        },
      } as SecurityConfig;

      await persistSetting(client, CONFIG_KEY, nextConfig);

      return NextResponse.json({
        success: true,
        message: 'Security settings saved.',
        config: safeConfig(nextConfig),
      });
    }

    // 2. Log a validated security event.
    if (action === 'log_event') {
      if (!isRecord(body.event)) {
        return jsonError('A valid event is required.', 400);
      }

      const input = body.event;
      const title = cleanText(input.title, 160);
      const description = cleanText(input.description, 500);
      const type = cleanText(input.type, 80);

      if (!title || !type) {
        return jsonError('Event title and type are required.', 400);
      }

      const severity = validSeverity(input.severity)
        ? input.severity
        : 'medium';

      const newEvent: SecurityEvent = {
        id: `sec-${crypto.randomUUID()}`,
        type,
        severity,
        title,
        description,
        // Do not trust a client-supplied IP address.
        ip: 'Server-recorded',
        timestamp: new Date().toISOString(),
        status: 'recorded',
      };

      const nextEvents = [newEvent, ...events].slice(0, MAX_EVENTS);

      await persistSetting(client, EVENTS_KEY, nextEvents);

      // Alert delivery is best-effort. Event persistence is confirmed first.
      const origin = safeOrigin(request, body.origin);

      if (
        currentConfig.telegramAlertsEnabled &&
        currentConfig.telegramBotToken &&
        currentConfig.telegramChatId
      ) {
        try {
          const result = await sendTelegramSecurityAlert({
            botToken: currentConfig.telegramBotToken,
            chatId: currentConfig.telegramChatId,
            title: newEvent.title,
            description: newEvent.description,
            ip: newEvent.ip,
            origin,
            // Prevent the helper's old hardcoded key fallback.
          });

          if (!result.success) {
            console.error('Telegram alert delivery failed.');
          }
        } catch (error) {
          console.error('Telegram alert delivery failed:', error);
        }
      }

      if (
        currentConfig.alertsEnabled &&
        currentConfig.whatsappPhone &&
        currentConfig.whatsappApiKey
      ) {
        try {
          const result = await sendAutomatedWhatsAppAlert({
            phone: currentConfig.whatsappPhone,
            apiKey: currentConfig.whatsappApiKey,
            title: newEvent.title,
            description: newEvent.description,
            ip: newEvent.ip,
            origin,
          });

          if (!result.success) {
            console.error('WhatsApp alert delivery failed.');
          }
        } catch (error) {
          console.error('WhatsApp alert delivery failed:', error);
        }
      }

      return NextResponse.json({
        success: true,
        event: newEvent,
        message: 'Security event recorded.',
      });
    }

    // 3. Generate a WhatsApp message for the admin to send manually.
    if (action === 'generate_whatsapp_alert') {
      const origin = safeOrigin(request, body.origin);

      const phone = cleanText(
        currentConfig.whatsappPhone || body.phone,
        40
      ).replace(/[^0-9]/g, '');

      const eventDetails = isRecord(body.eventDetails)
        ? body.eventDetails
        : {};

      const title = cleanText(
        eventDetails.title || 'Security event requiring review',
        160
      );

      const ip = cleanText(eventDetails.ip || 'Not provided', 80);
      const timestamp = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
      });

      const messageText =
        `LINKORA SECURITY ALERT\n\n` +
        `Event: ${title}\n` +
        `Source: ${ip}\n` +
        `Time: ${timestamp} IST\n\n` +
        `Please sign in to Linkora and review the security dashboard.\n` +
        `${origin}/control-center-7x9`;

      const whatsappUrl = phone
        ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(messageText)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

      return NextResponse.json({
        success: true,
        messageText,
        whatsappUrl,
      });
    }

    // 4. Send a Telegram test using entered credentials or saved credentials.
    if (action === 'send_telegram_test') {
      const botToken =
        cleanText(body.botToken, 500) || currentConfig.telegramBotToken;

      const chatId =
        cleanText(body.chatId, 100) || currentConfig.telegramChatId;

      if (!botToken || !chatId) {
        return jsonError(
          'Configure the Telegram bot token and chat ID first.',
          400
        );
      }

      const result = await sendTelegramSecurityAlert({
        botToken,
        chatId,
        title: 'Linkora Security Watchdog Test',
        description:
          'This is a test notification. Review your security dashboard to verify the alert configuration.',
        ip: 'Test notification',
        origin: safeOrigin(request, body.origin),
      });

      return NextResponse.json({
        success: result.success,
        error: result.success
          ? undefined
          : 'Telegram delivery failed. Verify the bot token, chat ID, and that the bot can message you.',
      });
    }

    // 5. Send a WhatsApp test using entered credentials or saved credentials.
    if (action === 'send_whatsapp_automated_test') {
      const phone =
        cleanText(body.phone, 40) || currentConfig.whatsappPhone;

      const apiKey =
        cleanText(body.apiKey, 500) || currentConfig.whatsappApiKey;

      if (!phone || !apiKey) {
        return jsonError(
          'Configure the WhatsApp phone number and API key first.',
          400
        );
      }

      const result = await sendAutomatedWhatsAppAlert({
        phone,
        apiKey,
        title: 'Linkora Security Watchdog Test',
        description:
          'This is a test notification. Review your security dashboard to verify the alert configuration.',
        ip: 'Test notification',
        origin: safeOrigin(request, body.origin),
      });

      return NextResponse.json({
        success: result.success,
        error: result.success
          ? undefined
          : 'WhatsApp delivery failed. Verify the phone number, API key, and provider configuration.',
      });
    }

    return jsonError('Unknown action.', 400);
  } catch (error) {
    console.error(
      'Security API request failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return jsonError(
      error instanceof Error
        ? error.message
        : 'The security request failed.',
      500
    );
  }
}