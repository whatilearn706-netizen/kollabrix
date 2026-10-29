import { NextRequest, NextResponse } from 'next/server';
import { sendTransactionalEmail } from '@/lib/email/emailDispatcher';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/admin/integrations-status
 * Live diagnostic verification endpoint for Resend & PostHog API keys.
 * Also allows sending an on-demand test email via ?testEmail=user@example.com
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const testEmail = searchParams.get('testEmail');

  const resendKey = process.env.RESEND_API_KEY;
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  };

  // 1. Resend API Key Diagnostic
  if (!resendKey) {
    results.resend = {
      status: 'missing_key',
      configured: false,
      message: 'RESEND_API_KEY is not configured in environment variables.',
    };
  } else {
    try {
      const pingRes = await fetch('https://api.resend.com/api-keys', {
        headers: {
          Authorization: `Bearer ${resendKey}`,
        },
      });

      if (pingRes.ok) {
        results.resend = {
          status: 'connected',
          configured: true,
          maskedKey: `${resendKey.slice(0, 6)}...${resendKey.slice(-4)}`,
          message: 'Resend API key is valid and connected to live email servers.',
        };
      } else {
        const errorText = await pingRes.text();
        results.resend = {
          status: 'invalid_key',
          configured: true,
          httpStatus: pingRes.status,
          message: `Resend rejected API key (HTTP ${pingRes.status}): ${errorText}`,
        };
      }
    } catch (err: any) {
      results.resend = {
        status: 'network_error',
        configured: true,
        message: `Failed to contact Resend servers: ${err.message}`,
      };
    }
  }

  // 2. Optional: Send Real Test Email if requested
  if (testEmail && resendKey) {
    try {
      const emailResult = await sendTransactionalEmail({
        to: testEmail,
        type: 'general_alert',
        subject: '⚡ Kollabrix Integration Test: Email Engine Online!',
        senderName: 'Kollabrix Core Engine',
        title: 'Your Transactional Email Pipeline is Live!',
        details: 'Congratulations! Your Resend API integration on Kollabrix is verified and actively delivering to inboxes.',
        actionText: 'Return to Kollabrix Dashboard',
        actionUrl: 'https://kollabrix.in/control-center-7x9',
      });

      results.testEmailDelivery = emailResult;
    } catch (testErr: any) {
      results.testEmailDelivery = {
        success: false,
        error: testErr.message,
      };
    }
  }

  // 3. PostHog Client Telemetry Diagnostic
  if (!posthogKey) {
    results.posthog = {
      status: 'missing_key',
      configured: false,
      message: 'NEXT_PUBLIC_POSTHOG_KEY is not configured.',
    };
  } else {
    results.posthog = {
      status: 'configured',
      configured: true,
      maskedKey: `${posthogKey.slice(0, 6)}...${posthogKey.slice(-4)}`,
      host: posthogHost,
      message: 'PostHog analytics and session replay tracking is active in production client bundles.',
    };
  }

  return NextResponse.json(results);
}
