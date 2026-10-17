import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

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

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown-client';
  const ip = forwarded.split(',')[0].trim();

  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        authorized: false,
        error: `⛔ Security lockout active. Too many failed attempts. Please wait ${rate.waitMinutes} minutes before retrying.`,
        locked: true,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const enteredPasscode = (body.passcode || '').trim();

    const serverSecret = (process.env.ADMIN_PASSCODE || process.env.ADMIN_SECRET_KEY || '').trim();

    if (!serverSecret) {
      return NextResponse.json(
        {
          authorized: false,
          error: 'Passcode login is not configured on this production environment. Please sign in with your verified founder Google account (goyalmayank142@gmail.com).',
        },
        { status: 403 }
      );
    }

    if (!enteredPasscode || enteredPasscode !== serverSecret) {
      const fail = recordFailure(ip);
      if (fail.locked) {
        return NextResponse.json(
          {
            authorized: false,
            error: '⛔ Too many incorrect attempts. Security lockout active for 15 minutes.',
            locked: true,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          authorized: false,
          error: `Invalid administrator passcode. (${fail.remaining} attempts remaining before 15-min lockout)`,
          remaining: fail.remaining,
        },
        { status: 401 }
      );
    }

    // Success! Clear failures
    clearFailures(ip);

    return NextResponse.json({
      authorized: true,
      user: { id: '9343b52f-f7e8-4ed8-a8a1-476829811b53', email: 'goyalmayank142@gmail.com' },
      profile: {
        user_id: '9343b52f-f7e8-4ed8-a8a1-476829811b53',
        username: 'mayank_admin',
        display_name: 'Mayank Goyal (Owner)',
        role: 'admin',
        status: 'active',
        is_suspended: false,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { authorized: false, error: 'Verification failed.' },
      { status: 500 }
    );
  }
}
