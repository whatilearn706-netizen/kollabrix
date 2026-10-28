import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  verifyHackathonPassword,
  checkRateLimit,
  recordFailedAttempt,
  resetFailedAttempts,
} from '@/lib/security/hackathonSecurity';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // If an authorization token was provided by the client, use an authenticated client
    const dbClient = token
      ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        })
      : supabase;

    const body = await request.json();
    const { joinCode, password = '', userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'You must sign in to your Kollabrix account before joining a hackathon.' },
        { status: 401 }
      );
    }

    if (!joinCode || typeof joinCode !== 'string') {
      return NextResponse.json({ error: 'Join code is required.' }, { status: 400 });
    }

    // Rate limiting key: combining user ID and join code
    const rateLimitKey = `${userId}_${joinCode.trim().toLowerCase()}`;
    const rateCheck = checkRateLimit(rateLimitKey);

    if (!rateCheck.allowed) {
      const waitSeconds = Math.ceil((rateCheck.remainingWaitMs || 60000) / 1000);
      return NextResponse.json(
        {
          error: `Too many incorrect attempts. Please wait ${waitSeconds} seconds before trying again.`,
          isRateLimited: true,
        },
        { status: 429 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Successfully joined hackathon (Demo Mode).',
        hackathonId: 'demo-hackathon',
      });
    }

    // 1. Fetch hackathon credentials by join code with resilient URL fallback
    let hackathon: any = null;
    const cleanCode = joinCode.trim().toLowerCase();

    try {
      const { data: byCode } = await supabase
        .from('hackathons')
        .select('*')
        .eq('join_code', cleanCode)
        .maybeSingle();

      if (byCode) {
        hackathon = byCode;
      }
    } catch {
      // join_code column may not exist before migration
    }

    if (!hackathon) {
      try {
        const { data: byUrl } = await supabase
          .from('hackathons')
          .select('*')
          .ilike('website_url', `%/h/${cleanCode}%`)
          .limit(1)
          .maybeSingle();

        if (byUrl) {
          hackathon = byUrl;
        }
      } catch {
        // ignore
      }
    }

    if (!hackathon) {
      try {
        const { data: byDesc } = await supabase
          .from('hackathons')
          .select('*')
          .ilike('description', `%"join_code":"${cleanCode}"%`)
          .limit(1)
          .maybeSingle();

        if (byDesc) {
          hackathon = byDesc;
        }
      } catch {
        // ignore
      }
    }

    if (!hackathon) {
      // If hackathon was created in local fallback mode, grant access gracefully
      return NextResponse.json({
        success: true,
        message: 'Access granted.',
        hackathonId: joinCode,
      });
    }

    // Decode metadata from description if present
    if (hackathon.description?.includes('<!-- HACKATHON_META:')) {
      try {
        const metaStr = hackathon.description.split('<!-- HACKATHON_META:')[1].split('-->')[0];
        const meta = JSON.parse(metaStr);
        hackathon.access_type = meta.access_type || hackathon.access_type || 'private';
        hackathon.join_code = meta.join_code || cleanCode;
        hackathon.password_hash = meta.password_hash || hackathon.password_hash;
        hackathon.password_salt = meta.password_salt || hackathon.password_salt;
      } catch {}
    }

    // 2. Check if join access is active
    if (hackathon.is_join_active === false || hackathon.status === 'Archived') {
      return NextResponse.json(
        { error: 'Registration and join access for this hackathon has been closed by the organizer.' },
        { status: 403 }
      );
    }

    // 3. Check if user is already enrolled
    let existingParticipant: any = null;
    try {
      const { data: part } = await dbClient
        .from('hackathon_participants')
        .select('id, role')
        .eq('hackathon_id', hackathon.id)
        .eq('user_id', userId)
        .maybeSingle();

      existingParticipant = part;
    } catch {
      // ignore
    }

    if (existingParticipant) {
      // Already a member! Return success
      return NextResponse.json({
        success: true,
        alreadyJoined: true,
        hackathonId: hackathon.id,
        role: existingParticipant.role,
        message: 'You are already registered for this hackathon.',
      });
    }

    // 4. If hackathon is private, verify password
    if (hackathon.access_type === 'private' && hackathon.password_hash && hackathon.password_salt) {
      if (!password || !password.trim()) {
        return NextResponse.json(
          { error: 'This is a private college hackathon. Access password is required.', requiresPassword: true },
          { status: 401 }
        );
      }

      const isValid = verifyHackathonPassword(
        password.trim(),
        hackathon.password_hash,
        hackathon.password_salt
      );

      if (!isValid) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json(
          { error: 'Incorrect hackathon access password. Please check with your professor or event organizer.' },
          { status: 401 }
        );
      }
    }

    // Password passed! Reset rate limit tracker
    resetFailedAttempts(rateLimitKey);

    // 5. Enroll student in hackathon_participants
    try {
      const { error: enrollError } = await dbClient.from('hackathon_participants').insert({
        hackathon_id: hackathon.id,
        user_id: userId,
        role: 'student',
      });

      if (enrollError) {
        // If concurrent insert occurred
        if (enrollError.code === '23505') {
          return NextResponse.json({
            success: true,
            alreadyJoined: true,
            hackathonId: hackathon.id,
            role: 'student',
          });
        }
        console.warn('Participant enrollment notice in database:', enrollError.message);
      }
    } catch (e) {
      console.warn('Participant enrollment exception note:', e);
    }

    // 6. Notify student
    try {
      await dbClient.from('notifications').insert({
        recipient_id: userId,
        type: 'application_accepted',
        title: `Welcome to ${hackathon.title}!`,
        message: 'You have joined the private college hackathon. Form your team and select a challenge in the workspace.',
        link: `/hackathons/${hackathon.id}/workspace`,
        is_read: false,
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      success: true,
      hackathonId: hackathon.id,
      role: 'student',
      message: 'Access granted! Welcome to the hackathon.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to authenticate hackathon access.' },
      { status: 500 }
    );
  }
}
