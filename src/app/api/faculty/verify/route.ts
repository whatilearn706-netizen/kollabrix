import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { DEFAULT_FACULTY_CODES, FacultyPasscode } from '@/lib/admin/facultyPasscodes';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { code, userId } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Faculty passcode is required.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Faculty status verified successfully (Demo Mode).',
      });
    }

    // 1. Identify current user
    let user = null;
    if (token) {
      const { data: userData } = await client.auth.getUser(token);
      user = userData?.user;
    }
    const targetUserId = user?.id || userId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'You must be signed in to verify faculty status.' }, { status: 401 });
    }

    // 2. Check if code matches default built-in codes
    let isMatched = DEFAULT_FACULTY_CODES.includes(cleanCode);
    let matchedPasscodeId: string | null = null;
    let matchedDepartment = 'Academic Department';

    // 3. Check admin-generated passcodes from platform_settings
    const { data: settingData } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'faculty_access_passcodes')
      .maybeSingle();

    let passcodesList: FacultyPasscode[] = Array.isArray(settingData?.value) ? settingData.value : [];

    const found = passcodesList.find((p) => p.code.toUpperCase() === cleanCode);
    if (found) {
      if (!found.is_active) {
        return NextResponse.json(
          { error: 'This faculty passcode has been deactivated by the campus administrator.' },
          { status: 403 }
        );
      }
      if (found.max_uses && found.used_count >= found.max_uses) {
        return NextResponse.json(
          { error: 'This faculty access passcode has reached its maximum allowed uses.' },
          { status: 403 }
        );
      }
      isMatched = true;
      matchedPasscodeId = found.id;
      matchedDepartment = found.department || matchedDepartment;
    }

    if (!isMatched) {
      return NextResponse.json(
        {
          error:
            'Invalid faculty access passcode. Contact your campus administrator to generate an access passcode for you, or verify with institutional credentials.',
        },
        { status: 400 }
      );
    }

    // 4. Update user's profile role to 'teacher'
    const { error: updateErr } = await client
      .from('profiles')
      .update({
        role: 'teacher',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', targetUserId);

    if (updateErr) {
      // Fallback via RPC
      try {
        await client.rpc('verify_faculty_code', { access_code: cleanCode });
      } catch (rpcErr) {
        throw new Error(updateErr.message);
      }
    }

    // 5. If matched from admin-generated list, increment used_count
    if (matchedPasscodeId) {
      try {
        const updatedList = passcodesList.map((p) => {
          if (p.id === matchedPasscodeId) {
            return { ...p, used_count: (p.used_count || 0) + 1 };
          }
          return p;
        });

        await client
          .from('platform_settings')
          .update({
            value: updatedList,
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'faculty_access_passcodes');
      } catch (err) {
        console.warn('Could not increment passcode usage count:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Faculty verified successfully for ${matchedDepartment}! Welcome to the Faculty Portal.`,
      department: matchedDepartment,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error verifying faculty status.' },
      { status: 500 }
    );
  }
}
