import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

// System reserved handles
const RESERVED_CALLSIGNS = new Set([
  'admin',
  'administrator',
  'kollabrix',
  'system',
  'support',
  'moderator',
  'mod',
  'superuser',
  'official',
  'bot',
  'arena',
  'colosseum',
]);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username') || '';
    const currentUserId = searchParams.get('userId') || '';

    const username = rawUsername.trim();

    if (!username) {
      return NextResponse.json({
        available: false,
        message: 'Username cannot be blank',
      });
    }

    if (username.length < 3) {
      return NextResponse.json({
        available: false,
        message: 'Must be at least 3 characters',
      });
    }

    if (username.length > 25) {
      return NextResponse.json({
        available: false,
        message: 'Must be 25 characters or fewer',
      });
    }

    // Allow alphanumeric, underscores, hyphens, and periods
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return NextResponse.json({
        available: false,
        message: 'Only letters, numbers, hyphens and underscores allowed',
      });
    }

    const lower = username.toLowerCase();

    // Check reserved callsigns
    if (RESERVED_CALLSIGNS.has(lower)) {
      return NextResponse.json({
        available: false,
        message: 'This name is reserved by system administration',
      });
    }

    // Check database if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getAdminClient();

        // Check matching username in profiles
        const { data: matchUser, error: errUser } = await supabase
          .from('profiles')
          .select('user_id, username')
          .ilike('username', username)
          .limit(1)
          .maybeSingle();

        if (!errUser && matchUser) {
          if (currentUserId && matchUser.user_id === currentUserId) {
            return NextResponse.json({
              available: true,
              isOwn: true,
              message: 'This is your verified profile name',
            });
          }
          return NextResponse.json({
            available: false,
            message: 'This username is already taken by another combatant',
          });
        }

        // Also check if any other user's display_name exactly matches
        const { data: matchDisplay, error: errDisplay } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .ilike('display_name', username)
          .limit(1)
          .maybeSingle();

        if (!errDisplay && matchDisplay) {
          if (currentUserId && matchDisplay.user_id === currentUserId) {
            return NextResponse.json({
              available: true,
              isOwn: true,
              message: 'This is your verified profile name',
            });
          }
          return NextResponse.json({
            available: false,
            message: 'This display name is already taken by another combatant',
          });
        }
      } catch (dbErr) {
        console.warn('Database username check exception, continuing with local validation:', dbErr);
      }
    }

    return NextResponse.json({
      available: true,
      message: 'Callsign is available for combat',
    });
  } catch (error: any) {
    console.error('Error in check-username route:', error);
    return NextResponse.json(
      { available: true, message: 'Could not verify name at this moment' },
      { status: 200 }
    );
  }
}
