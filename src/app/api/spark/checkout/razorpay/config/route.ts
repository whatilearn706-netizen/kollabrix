import { NextResponse } from 'next/server';
import { getRazorpaySettings } from '@/lib/spark/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const settings = await getRazorpaySettings();
    return NextResponse.json({
      enabled: settings.enabled,
      keyId: settings.enabled ? settings.keyId : null,
      isTestMode: settings.isTestMode,
    });
  } catch {
    return NextResponse.json({ enabled: false, keyId: null });
  }
}
