import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { sendTelegramSecurityAlert } from '@/lib/security/telegramAlert';
import { sendAutomatedWhatsAppAlert } from '@/lib/security/whatsappAlert';

export const runtime = 'nodejs';

// Server-side anti-bruteforce rate limiter for admin passcode attempts
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; waitMinutes?: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip);

  if (!record) {
    return { allowed: true, remaining: 5 };
  }

  if (record.lockedUntil > now) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, remaining: 0, waitMinutes };
  }

  // If lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    failedAttempts.delete(ip);
    return { allowed: true, remaining: 5 };
  }

  return { allowed: record.count < 5, remaining: Math.max(0, 5 - record.count) };
}

function recordFailure(ip: string): { locked: boolean; waitMinutes?: number; remaining: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
    failedAttempts.set(ip, record);
    return { locked: true, waitMinutes: 15, remaining: 0 };
  }

  failedAttempts.set(ip, record);
  return { locked: false, remaining: 5 - record.count };
}

function clearFailures(ip: string) {
  failedAttempts.delete(ip);
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);

  if (!auth.authorized) {
    return NextResponse.json(
      { authorized: false, error: auth.error || 'Access Denied: Administrator verification failed.' },
      { status: auth.status || 403 }
    );
  }

  return NextResponse.json({
    authorized: true,
    user: auth.user,
    profile: auth.profile,
  });
}

export async function POST(_request: NextRequest) {
  // Passcodes must never grant administrator identity.
  // Use GET with a real Supabase Bearer token to verify administrator access.
  return NextResponse.json(
    {
      authorized: false,
      error: 'Passcode authentication is disabled. Sign in with your authorized account and verify your session.',
    },
    { status: 403 }
  );
}
