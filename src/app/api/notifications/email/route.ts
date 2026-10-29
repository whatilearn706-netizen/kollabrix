import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '@/lib/email/emailDispatcher';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/notifications/email
 * Triggers transactional emails for invites, applications, and squad notices.
 * Safely resolves recipient email on server via Supabase Service Role Key without exposing emails to clients.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientUserId,
      recipientEmail: rawEmail,
      type = 'general_alert',
      subject,
      senderName = 'A Kollabrix Teammate',
      title,
      details,
      actionText = 'View on Kollabrix',
      actionUrl,
    } = body;

    let targetEmail = rawEmail;

    // If recipientUserId was passed, safely resolve their email address via Supabase Auth Admin
    if (!targetEmail && recipientUserId) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

      if (url && serviceRoleKey) {
        try {
          const adminSupabase = createClient(url, serviceRoleKey, {
            auth: { persistSession: false },
          });

          const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(recipientUserId);
          if (!userError && userData?.user?.email) {
            targetEmail = userData.user.email;
          }
        } catch (e) {
          console.warn('Could not resolve user email from Supabase Auth admin:', e);
        }
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Recipient email address could not be resolved.',
        },
        { status: 400 }
      );
    }

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://kollabrix.in';
    const finalActionUrl = actionUrl?.startsWith('http')
      ? actionUrl
      : `${appOrigin}${actionUrl?.startsWith('/') ? '' : '/'}${actionUrl || 'notifications'}`;

    const dispatchResult = await sendTransactionalEmail({
      to: targetEmail,
      type,
      subject: subject || 'Kollabrix Notification',
      senderName,
      title: title || subject || 'New Notification',
      details: details || 'You have a new update on your Kollabrix dashboard.',
      actionText,
      actionUrl: finalActionUrl,
    });

    return NextResponse.json(dispatchResult);
  } catch (error: any) {
    console.error('Email notification route error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
