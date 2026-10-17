import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { hashHackathonPassword } from '@/lib/security/hackathonSecurity';

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
      : supabase;

    let user = null;
    if (token) {
      const { data: userData } = await client.auth.getUser(token);
      user = userData?.user;
    } else {
      const { data: sessionData } = await client.auth.getUser();
      user = sessionData?.user;
    }

    const body = await request.json();
    const { hackathonId, newPassword, isJoinActive, resultsPublished } = body;

    const effectiveUserId = user?.id || (!isSupabaseConfigured() ? body.userId : null);

    if (!effectiveUserId || !hackathonId) {
      return NextResponse.json(
        { error: 'Authentication required: You must be signed in to modify hackathon settings.' },
        { status: 401 }
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: 'Updated in Demo Mode.' });
    }

    // 1. Verify caller owns the hackathon
    const { data: hackathon, error: fetchErr } = await client
      .from('hackathons')
      .select('id, creator_id')
      .eq('id', hackathonId)
      .single();

    if (fetchErr || !hackathon || hackathon.creator_id !== effectiveUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the authentic hackathon organizer can rotate access credentials.' },
        { status: 403 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof isJoinActive === 'boolean') {
      updates.is_join_active = isJoinActive;
    }

    if (typeof resultsPublished === 'boolean') {
      updates.results_published = resultsPublished;
    }

    if (newPassword && newPassword.trim().length >= 4) {
      const hashed = hashHackathonPassword(newPassword.trim());
      updates.password_hash = hashed.hash;
      updates.password_salt = hashed.salt;
    }

    const { error: updateErr } = await client
      .from('hackathons')
      .update(updates)
      .eq('id', hackathonId);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Hackathon access security settings updated successfully.',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error while rotating credentials.' },
      { status: 500 }
    );
  }
}
