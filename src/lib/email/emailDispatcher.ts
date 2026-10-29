/**
 * Kollabrix Transactional Email Dispatcher
 * Powered by Resend (https://resend.com)
 * 
 * Features:
 * 1. Gorgeous Dark-Mode Cyberpunk / Collegiate HTML email templates.
 * 2. Instant delivery to student inboxes when RESEND_API_KEY is configured in .env.local.
 * 3. Graceful simulation fallback + Telegram alert fallback when API key is pending setup.
 */

export interface TransactionalEmailPayload {
  to: string;
  recipientName?: string;
  type:
    | 'project_invitation'
    | 'application_received'
    | 'application_accepted'
    | 'arena_duel_invite'
    | 'general_alert';
  subject: string;
  senderName: string;
  title: string;
  details: string;
  actionText: string;
  actionUrl: string;
}

export function generateKollabrixEmailHtml(payload: TransactionalEmailPayload): string {
  const { recipientName = 'Builder', senderName, title, details, actionText, actionUrl } = payload;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0b1120; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          <!-- Top Neon Accent Header -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%);"></td>
          </tr>
          
          <!-- Logo & Brand Header -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; border-bottom: 1px solid #1e293b;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      KOLLABRIX <span style="font-size: 11px; font-family: monospace; background-color: rgba(6, 182, 212, 0.15); color: #06b6d4; padding: 3px 8px; border-radius: 12px; border: 1px solid rgba(6, 182, 212, 0.3); vertical-align: middle; margin-left: 6px;">COLLEGIATE NETWORK</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px;">
              <p style="font-size: 13px; font-family: monospace; color: #a855f7; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0; font-weight: bold;">
                ACTION REQUIRED // TEAM SQUAD EVENT
              </p>
              
              <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3; margin: 0 0 16px 0;">
                ${title}
              </h1>

              <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px 0;">
                Hey <strong>${recipientName}</strong>, <strong>${senderName}</strong> has sent you a collegiate collaboration event on Kollabrix:
              </p>

              <!-- Highlighted Details Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #030712; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="font-size: 13px; line-height: 1.6; color: #e2e8f0; margin: 0; font-style: italic;">
                      "${details}"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 12px; letter-spacing: 0.3px; box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.4);">
                      ${actionText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 11px; color: #64748b; text-align: center; margin: 24px 0 0 0;">
                Or copy this direct link: <a href="${actionUrl}" style="color: #06b6d4; text-decoration: underline;">${actionUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #070c18; border-top: 1px solid #1e293b; text-align: center;">
              <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
                Kollabrix &bull; The Collegiate Innovation & Hackathon Network
              </p>
              <p style="font-size: 10px; color: #475569; margin: 0;">
                You received this transactional notice because your account is registered on Kollabrix.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an email via Resend if RESEND_API_KEY is configured.
 * Otherwise, gracefully logs simulated email and alerts Telegram if configured.
 */
export async function sendTransactionalEmail(payload: TransactionalEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Kollabrix <team@kollabrix.in>';

  const html = generateKollabrixEmailHtml(payload);

  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.to],
          subject: payload.subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Resend HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log(`[EMAIL DISPATCHED] To: ${payload.to} | Resend ID: ${data.id}`);
      return { success: true, messageId: data.id, simulated: false };
    } catch (err: any) {
      console.error('[EMAIL DISPATCH ERROR]', err);
      return { success: false, error: err.message };
    }
  }

  // Graceful simulation fallback when RESEND_API_KEY is not yet set
  console.log(
    `[EMAIL SIMULATION] RESEND_API_KEY pending. Email ready for delivery:\n` +
    `  To: ${payload.to}\n` +
    `  Subject: ${payload.subject}\n` +
    `  Action: ${payload.actionText} -> ${payload.actionUrl}`
  );

  // Optional: If Telegram bot token is configured in .env.local, forward notice to admin channel!
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  if (telegramToken && telegramChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `📬 *Kollabrix Notification Dispatch*\n*To:* ${payload.to}\n*Subject:* ${payload.subject}\n*From:* ${payload.senderName}\n\n_${payload.details}_\n\n[Open Kollabrix](${payload.actionUrl})`,
          parse_mode: 'Markdown',
        }),
      });
    } catch {}
  }

  return {
    success: true,
    simulated: true,
    messageId: `sim-${Date.now()}`,
  };
}
