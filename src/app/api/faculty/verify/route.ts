import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { parseFacultySettings } from '@/lib/admin/facultyPasscodes';
import { getMasterControlRecord, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

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
    const normalized = cleanCode.replace(/[\s-_]/g, '');

    // Strictly block any attempt to use the deprecated demonstration code FACULTY2026
    if (
      normalized === 'FACULTY2026' ||
      cleanCode.includes('FACULTY2026') ||
      cleanCode.includes('FACULTY 2026') ||
      cleanCode.includes('FACULTY-2026')
    ) {
      return NextResponse.json(
        {
          error:
            '⛔ Access Denied: "FACULTY2026" has been permanently revoked and blocked. It was only an example format. Please enter an active institutional passcode issued by your administrator or verify with DigiLocker.',
        },
        { status: 403 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Faculty status verified successfully (Demo Mode).',
      });
    }

    // 1. Identify current user strictly from verified session
    let user = null;
    if (token) {
      const { data: userData } = await client.auth.getUser(token);
      user = userData?.user;
    }
    const targetUserId = user?.id;

    if (!targetUserId) {
      return NextResponse.json({ error: 'You must be signed in to verify faculty status.' }, { status: 401 });
    }

    // ── Rate limit: max 5 passcode verification attempts per IP/user per 15 minutes ──
    const { checkIpRateLimit, getClientIp } = await import('@/lib/security/ipRateLimit');
    const ip = getClientIp(request);
    const rlKey = `faculty-passcode:${targetUserId}:${ip}`;
    const rateCheck = checkIpRateLimit(rlKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      const waitMins = Math.ceil((rateCheck.retryAfterMs ?? 900000) / 60000);
      return NextResponse.json(
        { error: `Too many failed passcode attempts. Please wait ${waitMins} minute(s) before trying again.` },
        { status: 429 }
      );
    }

    // 2. Fetch passcodes from master control or platform_settings
    let rawSettings: any = null;
    try {
      const master = await getMasterControlRecord();
      if (master?.facultySettings) {
        rawSettings = master.facultySettings;
      }
    } catch {}

    if (!rawSettings) {
      const { data: settingData } = await defaultClient
        .from('platform_settings')
        .select('value')
        .eq('key', 'faculty_access_passcodes')
        .maybeSingle();
      rawSettings = settingData?.value;
    }

    const parsed = parseFacultySettings(rawSettings);
    const passcodesList = parsed.passcodes;
    let revokedUserIds = parsed.revokedUserIds;

    let isMatched = false;
    let matchedPasscodeId: string | null = null;
    let matchedDepartment = 'Academic Department';

    const found = passcodesList.find((p) => {
      const pClean = p.code.toUpperCase().trim();
      const pNorm = pClean.replace(/[\s-_]/g, '');
      return (
        pClean === cleanCode ||
        pNorm === normalized ||
        pClean === `FAC-${cleanCode}` ||
        pNorm === `FAC${normalized}` ||
        cleanCode === `FAC-${pClean}` ||
        normalized === `FAC${pNorm}`
      );
    });

    if (found) {
      if (!found.is_active) {
        return NextResponse.json(
          { error: 'This faculty passcode has been deactivated by the campus administrator.' },
          { status: 403 }
        );
      }
      if (found.max_uses && found.used_count >= found.max_uses) {
        return NextResponse.json(
          { error: 'This faculty access passcode has reached its maximum allowed uses. Please request a new passcode from the administrator.' },
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
            'Invalid faculty access passcode. Please contact your platform administrator in the Admin Control Center to issue an active faculty access passcode for you.',
        },
        { status: 400 }
      );
    }

    // 3. Update user's profile role to 'teacher' in public.profiles
    if (targetUserId) {
      try {
        const updateClient = client || defaultClient;
        await updateClient
          .from('profiles')
          .update({
            role: 'teacher',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', targetUserId);
      } catch (profErr) {
        console.warn('Could not update profile role to teacher:', profErr);
      }
    }

    // 4. Remove targetUserId from revokedUserIds, add to verifiedUserIds, and increment passcode usage count
    revokedUserIds = revokedUserIds.filter((id) => id !== targetUserId);
    const verifiedUserIds = Array.from(
      new Set([...(parsed.verifiedUserIds || []), ...(targetUserId ? [targetUserId] : [])])
    );

    const updatedPasscodes = passcodesList.map((p) => {
      if (p.id === matchedPasscodeId) {
        return { ...p, used_count: (p.used_count || 0) + 1 };
      }
      return p;
    });

    const facultyVal = { passcodes: updatedPasscodes, revokedUserIds, verifiedUserIds };
    try {
      await updateMasterControlSubkey('facultySettings', facultyVal);
      await defaultClient
        .from('platform_settings')
        .upsert({
          key: 'faculty_access_passcodes',
          value: facultyVal,
          updated_at: new Date().toISOString(),
          updated_by: 'c86ce05f-24de-4a1a-a45f-944d4180b508',
        });
    } catch (err) {
      console.warn('Could not update faculty settings after verification:', err);
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
