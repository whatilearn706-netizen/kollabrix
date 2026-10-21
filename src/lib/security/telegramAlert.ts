export async function sendTelegramSecurityAlert({
  botToken,
  chatId,
  title,
  description,
  ip,
  timestamp,
  origin = 'https://linkora.in',
}: {
  botToken?: string;
  chatId?: string;
  title: string;
  description?: string;
  ip?: string;
  timestamp?: string;
  origin?: string;
}) {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, reason: 'Telegram bot token or chat ID not configured' };
  }

  const time = timestamp || new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
  const auditLink = `${origin}/control-center-7x9?tab=audit`;

  const text = 
`🚨 *LINKORA SECURITY WATCHDOG ALERT*

⚠️ *Threat*: ${title}
${description ? `📝 *Details*: ${description}\n` : ''}📍 *Source IP*: \`${ip || 'Unknown'}\`
🕒 *Time*: ${time} IST

🛡️ *Status*: Neutralized by Edge Firewall & Serverless Sandbox.

💡 *What To Do*:
1. Review live Audit Logs: [Open Audit Desk](${auditLink})
2. Open the authorized admin dashboard to review and manage maintenance:
${origin}/control-center-7x9`;

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

export async function sendTelegramIcpcAlert({
  studentName,
  studentId,
  contestTitle,
  problemTitle,
  college,
  event = 'started',
  details,
  botToken,
  chatId,
  origin = 'https://linkora.in',
}: {
  studentName: string;
  studentId: string;
  contestTitle: string;
  problemTitle?: string;
  college?: string;
  event?: 'started' | 'violation' | 'demolished';
  details?: string;
  botToken?: string;
  chatId?: string;
  origin?: string;
}) {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, reason: 'Telegram bot token or chat ID not configured' };
  }

  const time = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
  const proctorLink = `${origin}/control-center-7x9`;

  const header =
    event === 'started'
      ? '🚨 <b>NEW CONTESTANT ENTERED ARENA</b>'
      : event === 'violation'
      ? '⚠️ <b>ICPC SECURITY VIOLATION DETECTED</b>'
      : '🛑 <b>CONTESTANT SESSION DEMOLISHED</b>';

  const text =
`${header}

👤 <b>Student:</b> ${studentName} (${studentId})
🏫 <b>College:</b> ${college || 'Collegiate Builder'}
🏆 <b>Contest:</b> ${contestTitle}
${problemTitle ? `📝 <b>Problem:</b> ${problemTitle}\n` : ''}${details ? `⚠️ <b>Incident:</b> ${details}\n` : ''}🕒 <b>Time:</b> ${time} IST

🛡️ <b>Action:</b> Tap below to inspect student's live screen in real time with 1-click Caution and Demolish controls.`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📺 WATCH LIVE SCREEN', url: proctorLink },
            ],
          ],
        },
      }),
    });

    const data = await res.json();
    return { success: data.ok === true, data };
  } catch (err: any) {
    console.warn('Failed to send Telegram ICPC alert:', err);
    return { success: false, error: err.message };
  }
}
