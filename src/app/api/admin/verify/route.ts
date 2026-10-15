import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

export const runtime = 'nodejs';

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
