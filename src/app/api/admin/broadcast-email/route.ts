import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { sendTransactionalEmail } from '@/lib/email/emailDispatcher';
import { DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const {
      subject,
      title,
      message,
      actionText = 'Open Kollabrix',
      actionUrl = 'https://kollabrix.in',
      testOnly = false,
      testRecipient,
    } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
    }

    const adminEmail = auth.user?.email || 'goyalmayank142@gmail.com';

    // If testOnly is requested, send only to admin/test recipient
    if (testOnly) {
      const recipient = testRecipient?.trim() || adminEmail;
      const res = await sendTransactionalEmail({
        to: recipient,
        recipientName: 'Administrator',
        type: 'general_alert',
        subject: `[PREVIEW] ${subject}`,
        senderName: 'Mayank Goyal // Kollabrix',
        title: title || subject,
        details: message,
        actionText,
        actionUrl,
      });

      return NextResponse.json({
        success: res.success,
        testOnly: true,
        recipient,
        result: res,
      });
    }

    // Fetch all user emails
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
    const recipients = new Set<string>();

    if (url && serviceRoleKey) {
      try {
        const authRes = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          cache: 'no-store',
        });
        if (authRes.ok) {
          const authData = await authRes.json();
          if (Array.isArray(authData.users)) {
            for (const u of authData.users) {
              if (u.email && u.email.includes('@')) {
                recipients.add(u.email.toLowerCase().trim());
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch auth users for broadcast:', err);
      }
    }

    // Also fetch any emails from profiles if present
    if (auth.dbClient) {
      try {
        const { data: profiles } = await auth.dbClient.from('profiles').select('email');
        if (Array.isArray(profiles)) {
          for (const p of profiles) {
            if (p.email && p.email.includes('@')) {
              recipients.add(p.email.toLowerCase().trim());
            }
          }
        }
      } catch {}
    }

    // Ensure admin email is always included if no users found
    if (recipients.size === 0) {
      recipients.add(adminEmail);
    }

    const emailList = Array.from(recipients);
    let sentCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const email of emailList) {
      try {
        const dispatchRes = await sendTransactionalEmail({
          to: email,
          recipientName: 'Student Maker',
          type: 'general_alert',
          subject,
          senderName: 'Mayank Goyal // Kollabrix',
          title: title || subject,
          details: message,
          actionText,
          actionUrl,
        });

        if (dispatchRes.success) {
          sentCount++;
        } else {
          failCount++;
          if (dispatchRes.error) errors.push(`${email}: ${dispatchRes.error}`);
        }
      } catch (sendErr: any) {
        failCount++;
        errors.push(`${email}: ${sendErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalRecipients: emailList.length,
      sentCount,
      failCount,
      errors: errors.slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
