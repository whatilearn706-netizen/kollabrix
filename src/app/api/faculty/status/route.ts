import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { parseFacultySettings } from '@/lib/admin/facultyPasscodes';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const client = token
      ? createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        })
      : defaultClient;

    let user: any = null;
    if (token) {
      const { data: userData } = await client.auth.getUser(token);
      user = userData?.user;
    } else {
      const { data: sessionData } = await client.auth.getUser();
      user = sessionData?.user;
    }

    if (!user) {
      return NextResponse.json({ isFaculty: false, isRevoked: false, authenticated: false });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ isFaculty: true, isRevoked: false, authenticated: true });
    }

    // 1. Check if user is in revoked list in platform_settings
    const { data: settingData } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'faculty_access_passcodes')
      .maybeSingle();

    const { revokedUserIds } = parseFacultySettings(settingData?.value);
    const isRevoked = revokedUserIds.includes(user.id);

    if (isRevoked) {
      return NextResponse.json({
        isFaculty: false,
        isRevoked: true,
        authenticated: true,
        message: 'Your faculty privileges have been revoked by a platform administrator.',
      });
    }

    // 2. Fetch authoritative profile from database
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isFaculty = profile?.role === 'teacher';

    return NextResponse.json({
      isFaculty,
      isRevoked: false,
      authenticated: true,
      role: profile?.role || 'student',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error checking faculty status' },
      { status: 500 }
    );
  }
}
