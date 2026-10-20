export async function sendAutomatedWhatsAppAlert({
  phone,
  apiKey,
  title,
  description,
  ip,
  timestamp,
  origin = 'https://linkora.in',
}: {
  phone?: string;
  apiKey?: string;
  title: string;
  description?: string;
  ip?: string;
  timestamp?: string;
  origin?: string;
}) {
  const targetPhone = (phone || process.env.WHATSAPP_PHONE || '').replace(/[^0-9+]/g, '');
  const key = apiKey || process.env.WHATSAPP_CALLMEBOT_APIKEY || '';

  if (!targetPhone || !key) {
    return {
      success: false,
      reason: 'WhatsApp phone or CallMeBot API key not configured',
    };
  }

  // Ensure phone has leading +
  const formattedPhone = targetPhone.startsWith('+') ? targetPhone : `+${targetPhone}`;
  const time = timestamp || new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
  const auditLink = `${origin}/control-center-7x9?tab=audit`;

  const messageText = 
`🚨 *LINKORA SECURITY WATCHDOG ALERT*

⚠️ *Threat*: ${title}
${description ? `📝 *Details*: ${description}\n` : ''}📍 *Source IP*: ${ip || 'Unknown'}
🕒 *Time*: ${time} IST

🛡️ *Status*: Neutralized by Edge Firewall & Serverless Sandbox.

💡 *What To Do*:
1. Review Audit Logs:
${auditLink}

2. Open the authorized admin dashboard to review and manage maintenance:
${origin}/control-center-7x9`;

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(formattedPhone)}&text=${encodeURIComponent(messageText)}&apikey=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const textResponse = await res.text();

    const isSuccess = textResponse.toLowerCase().includes('success') || textResponse.toLowerCase().includes('message queued') || res.ok;
    return {
      success: isSuccess,
      response: textResponse,
    };
  } catch (err: any) {
    console.warn('Failed to send automated WhatsApp alert via CallMeBot:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}
