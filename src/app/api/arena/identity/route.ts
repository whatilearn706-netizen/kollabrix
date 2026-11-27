import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  DEFAULT_SUPABASE_URL,
  DEFAULT_SUPABASE_ANON_KEY,
} from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getMasterControlSubkey,
  updateMasterControlSubkey,
} from '@/lib/admin/masterConfigStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface StoredArenaIdentity {
  callsign: string;
  avatarId: string;
  updatedAt: string;
}

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
  'guest',
]);

function isGuestUserId(userId?: string | null): boolean {
  if (!userId) return true;
  const trimmed = userId.trim();
  return !trimmed || trimmed.startsWith('guest-') || trimmed.startsWith('p-');
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

function extractAuthToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  try {
    const cookies = request.cookies.getAll();
    for (const c of cookies) {
      if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
        try {
          const raw = decodeURIComponent(c.value);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed[0]) return parsed[0];
          if (parsed?.access_token) return parsed.access_token;
        } catch {
          if (c.value && c.value.length > 40) return c.value;
        }
      }
    }
  } catch {}
  return '';
}

async function resolveAuthenticatedUserId(request: NextRequest, claimedUserId?: string): Promise<string | null> {
  const token = extractAuthToken(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  if (token && isSupabaseConfigured()) {
    try {
      const authClient = createClient(url, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      });
      const { data } = await authClient.auth.getUser(token);
      if (data?.user?.id) return data.user.id;
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const ssrClient = createServerSupabaseClient();
      const { data } = await ssrClient.auth.getUser();
      if (data?.user?.id) return data.user.id;
    } catch {}
  }

  const cookieUserId = request.cookies.get('linkora_user_id')?.value;
  if (cookieUserId && !isGuestUserId(cookieUserId)) {
    return cookieUserId;
  }

  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && claimedUserId && headerUserId === claimedUserId && !isGuestUserId(headerUserId)) {
    return headerUserId;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId')?.trim();

    if (isGuestUserId(userId)) {
      return NextResponse.json({ success: true, identity: null, guest: true });
    }

    const allIdentities = await getMasterControlSubkey<Record<string, StoredArenaIdentity>>(
      'arena_user_identities',
      {},
      true
    );

    return NextResponse.json(
      { success: true, identity: allIdentities[userId!] || null },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to read identity' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = String(body?.userId || '').trim();
    const rawCallsign = String(body?.callsign || '').trim();
    const avatarId = String(body?.avatarId || 'walker').trim() || 'walker';

    if (isGuestUserId(userId)) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to claim a unique Arena name and save your stats.' },
        { status: 401 }
      );
    }

    const authUserId = await resolveAuthenticatedUserId(request, userId);
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please sign in with your account to save identity.' },
        { status: 401 }
      );
    }

    if (rawCallsign.length < 3 || rawCallsign.length > 25) {
      return NextResponse.json(
        { success: false, error: 'Callsign must be between 3 and 25 characters.' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(rawCallsign)) {
      return NextResponse.json(
        { success: false, error: 'Only letters, numbers, underscores, hyphens and dots allowed.' },
        { status: 400 }
      );
    }

    const lower = rawCallsign.toLowerCase();
    if (RESERVED_CALLSIGNS.has(lower)) {
      return NextResponse.json(
        { success: false, code: 'CALLSIGN_TAKEN', error: 'This name is reserved by system administration.' },
        { status: 409 }
      );
    }

    // 1. Check uniqueness across claimed Arena identities
    const allIdentities = await getMasterControlSubkey<Record<string, StoredArenaIdentity>>(
      'arena_user_identities',
      {},
      true
    );

    const conflictingOwner = Object.entries(allIdentities).find(
      ([ownerId, entry]) =>
        ownerId !== userId && entry?.callsign && entry.callsign.toLowerCase() === lower
    );

    if (conflictingOwner) {
      return NextResponse.json(
        {
          success: false,
          code: 'CALLSIGN_TAKEN',
          error: 'This name is already taken by another user. Only one user can hold each Arena name.',
        },
        { status: 409 }
      );
    }

    // 2. Check uniqueness across Kollabrix profiles table
    if (isSupabaseConfigured()) {
      const supabase = getAdminClient();
      const { data: conflictUser } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('username', rawCallsign)
        .neq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (conflictUser) {
        return NextResponse.json(
          {
            success: false,
            code: 'CALLSIGN_TAKEN',
            error: 'This name is already taken by another user. Only one user can hold each Arena name.',
          },
          { status: 409 }
        );
      }

      const { data: conflictDisplay } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('display_name', rawCallsign)
        .neq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (conflictDisplay) {
        return NextResponse.json(
          {
            success: false,
            code: 'CALLSIGN_TAKEN',
            error: 'This name is already taken by another user. Only one user can hold each Arena name.',
          },
          { status: 409 }
        );
      }
    }

    const identity: StoredArenaIdentity = {
      callsign: rawCallsign,
      avatarId,
      updatedAt: new Date().toISOString(),
    };

    const nextAll = {
      ...allIdentities,
      [userId]: identity,
    };

    const saveRes = await updateMasterControlSubkey('arena_user_identities', nextAll);
    if (!saveRes.success) {
      return NextResponse.json(
        { success: false, error: saveRes.error || 'Failed to persist Arena identity.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, identity });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save Arena identity.' },
      { status: 500 }
    );
  }
}
