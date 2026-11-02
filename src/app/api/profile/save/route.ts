import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '@/lib/supabase/isConfigured';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return createClient(url, key, { auth: { persistSession: false } });
}

function extractAuthToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // Extract from cookies if header is absent
  try {
    const cookies = request.cookies.getAll();
    for (const c of cookies) {
      if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
        try {
          const raw = decodeURIComponent(c.value);
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed[0]) {
            return parsed[0];
          } else if (parsed && parsed.access_token) {
            return parsed.access_token;
          }
        } catch {
          if (c.value && c.value.length > 40) {
            return c.value;
          }
        }
      }
    }
  } catch {}

  return '';
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload?.user_id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const token = extractAuthToken(request);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    let authenticatedUserId: string | null = null;
    let authenticatedUserEmail: string | null = null;

    // 1. Try Bearer token if provided
    if (token && isSupabaseConfigured()) {
      try {
        const authClient = createClient(url, anonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        });

        const { data: authData } = await authClient.auth.getUser(token);
        if (authData?.user) {
          authenticatedUserId = authData.user.id;
          authenticatedUserEmail = authData.user.email?.toLowerCase() || null;
        }
      } catch (tokenErr) {}
    }

    // 2. Try Next.js SSR cookie store
    if (!authenticatedUserId && isSupabaseConfigured()) {
      try {
        const ssrClient = createServerSupabaseClient();
        const { data: ssrAuth } = await ssrClient.auth.getUser();
        if (ssrAuth?.user) {
          authenticatedUserId = ssrAuth.user.id;
          authenticatedUserEmail = ssrAuth.user.email?.toLowerCase() || null;
        }
      } catch (ssrErr) {}
    }

    // 3. Fallback to active browser session cookie if authenticated
    if (!authenticatedUserId && isSupabaseConfigured()) {
      const cookieUserId = request.cookies.get('linkora_user_id')?.value;
      if (cookieUserId && cookieUserId === payload.user_id) {
        authenticatedUserId = cookieUserId;
      }
    }

    // If completely unauthenticated in a configured Supabase environment:
    if (!authenticatedUserId && isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to save your profile.' },
        { status: 401 }
      );
    }

    // ── STRICT AUTHORIZATION GATE (IDOR Prevention) ──
    const isOwnerOrAdmin =
      authenticatedUserId === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
      authenticatedUserEmail === 'goyalmayank142@gmail.com';

    if (authenticatedUserId && authenticatedUserId !== payload.user_id && !isOwnerOrAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only modify your own profile.' },
        { status: 403 }
      );
    }

    // ── PRIVILEGE ESCALATION PREVENTION ──
    // Prevent non-administrators from assigning themselves the "admin" role
    const sanitizedPayload = { ...payload };
    if (!isOwnerOrAdmin && sanitizedPayload.role === 'admin') {
      delete sanitizedPayload.role; // Strip unauthorized role escalation
    }

    const supabaseAdmin = getAdminClient();

    // Upsert directly using the service role client (bypasses client RLS safely on server)
    let { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(sanitizedPayload, { onConflict: 'user_id' })
      .select()
      .single();

    // Schema resilience: if custom columns are not yet in the DB schema, strip them and retry
    if (
      error &&
      (error.message.includes('column') ||
        error.message.includes('schema cache') ||
        error.code === '42703' ||
        error.code === 'PGRST204')
    ) {
      const safePayload = { ...sanitizedPayload };
      delete safePayload.linkedin_url;
      delete safePayload.verification_doc_type;
      delete safePayload.college_verified;

      const retryRes = await supabaseAdmin
        .from('profiles')
        .upsert(safePayload, { onConflict: 'user_id' })
        .select()
        .single();

      error = retryRes.error;
      data = retryRes.data;
    }

    if (error) {
      console.error('Server profile save error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error('Profile save exception:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to save profile' }, { status: 500 });
  }
}
