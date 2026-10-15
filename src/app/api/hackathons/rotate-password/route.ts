import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { hashHackathonPassword } from '@/lib/security/hackathonSecurity';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hackathonId, userId, newPassword, isJoinActive, resultsPublished } = body;

    if (!userId || !hackathonId) {
      return NextResponse.json({ error: 'Authentication and Hackathon ID required.' }, { status: 400 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: 'Updated in Demo Mode.' });
    }

    // 1. Verify caller owns the hackathon
    const { data: hackathon, error: fetchErr } = await supabase
      .from('hackathons')
      .select('id, creator_id')
      .eq('id', hackathonId)
      .single();

    if (fetchErr || !hackathon || hackathon.creator_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the hackathon organizer can rotate access credentials.' },
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

    const { error: updateErr } = await supabase
      .from('hackathons')
      .update(updates)
      .eq('id', hackathonId);

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Hackathon access settings successfully updated.',
      isJoinActive: updates.is_join_active,
      resultsPublished: updates.results_published,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update access settings.' },
      { status: 500 }
    );
  }
}
