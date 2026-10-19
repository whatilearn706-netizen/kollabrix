export async function sendTelegramSecurityAlert({
  botToken,
  chatId,
  title,
  description,
  ip,
  timestamp,
  origin = 'https://linkora.in',
  emergencyKey = 'linkora-sec-emergency-2026',
}: {
  botToken?: string;
  chatId?: string;
  title: string;
  description?: string;
  ip?: string;
  timestamp?: string;
  origin?: string;
  emergencyKey?: string;
}) {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, reason: 'Telegram bot token or chat ID not configured' };
  }

  const time = timestamp || new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
  const emergencyLink = `${origin}/api/admin/emergency-maintenance?key=${emergencyKey}&action=activate`;
  const restoreLink = `${origin}/api/admin/emergency-maintenance?key=${emergencyKey}&action=deactivate`;
  const auditLink = `${origin}/control-center-7x9?tab=audit`;

  const text = 
`🚨 *LINKORA SECURITY WATCHDOG ALERT*

⚠️ *Threat*: ${title}
${description ? `📝 *Details*: ${description}\n` : ''}📍 *Source IP*: \`${ip || 'Unknown'}\`
🕒 *Time*: ${time} IST

🛡️ *Status*: Neutralized by Edge Firewall & Serverless Sandbox.

💡 *What To Do*:
1. Review live Audit Logs: [Open Audit Desk](${auditLink})
2. If anything feels broken or under attack, tap the 1-Tap Kill Switch below to put the platform into instant Maintenance:

🔴 *1-Tap Instant Maintenance*:
${emergencyLink}

🟢 *Restore Website*:
${restoreLink}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔴 ACTIVATE MAINTENANCE', url: emergencyLink },
              { text: '🟢 RESTORE SITE', url: restoreLink },
            ],
            [
              { text: '📊 VIEW AUDIT LOGS', url: auditLink },
            ],
          ],
        },
      }),
    });

    const data = await res.json();
    return { success: data.ok === true, data };
  } catch (err: any) {
    console.warn('Failed to send Telegram security alert:', err);
    return { success: false, error: err.message };
  }
}
