import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Profile } from '@/types/database';

export interface AdminAuthResult {
  authorized: boolean;
  user?: {
    id: string;
    email?: string;
  };
  profile?: Profile;
  dbClient?: any;
  error?: string;
  status?: number;
}

/**
 * Verify administrator identity strictly on the server against the database.
 * Never trusts client headers or unverified browser state.
 */
export async function verifyAdminSession(request: NextRequest): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    return {
      authorized: false,
      status: 503,
      error: 'Authentication service is not configured.',
    };
  }

  try {
    const authHeader = request.headers.get('authorization') || '';
    let token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    // If Authorization header wasn't provided, check cookies for Supabase auth tokens
    if (!token) {
      try {
        const cookies = request.cookies.getAll();
        for (const c of cookies) {
          if (c.name.includes('-auth-token') || c.name.startsWith('sb-')) {
            try {
              const raw = decodeURIComponent(c.value);
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed[0]) {
                token = parsed[0];
                break;
              } else if (parsed && parsed.access_token) {
                token = parsed.access_token;
                break;
              }
            } catch {
              if (c.value && c.value.length > 40) {
                token = c.value;
                break;
              }
            }
          }
        }
      } catch {}
    }

    if (!token) {
      return {
        authorized: false,
        status: 401,
        error: 'Authentication required. Please sign in.',
      };
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!url || !anonKey) {
      return {
        authorized: false,
        status: 503,
        error: 'Authentication service is not configured.',
      };
    }

    // Validate the token with Supabase Auth. Never trust browser cookies
    // or passcodes as proof of administrator identity.
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: authData, error: authError } =
      await authClient.auth.getUser(token);

    const user = authData?.user;

    if (authError || !user) {
      return {
        authorized: false,
        status: 401,
        error: 'Invalid or expired session. Please sign in again.',
      };
    }

    // Only this exact, verified Supabase account is the platform owner.
    const isOwner =
      user.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ||
      user.email?.toLowerCase() === 'goyalmayank142@gmail.com';

    // Read the authoritative profile server-side when possible.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const profileClient = serviceRoleKey
      ? createClient(url, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        })
      : authClient;

    const { data: profile, error: profileError } = await profileClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      return {
        authorized: false,
        status: 503,
        error: 'Unable to verify administrator permissions.',
      };
    }

    // A suspension always takes precedence, including for the owner.
    if (profile && (
      profile.is_suspended === true ||
      profile.status === 'suspended'
    )) {
      return {
        authorized: false,
        status: 403,
        error: 'Account suspended. Administrator access is denied.',
      };
    }

    if (!isOwner && (!profile || profile.role !== 'admin')) {
      return {
        authorized: false,
        status: 403,
        error: 'Administrator privileges are required.',
      };
    }

    const effectiveProfile = profile || (isOwner ? {
      user_id: user.id,
      username: 'mayank_admin',
      display_name: 'Platform Owner',
      role: 'admin',
      status: 'active',
      is_suspended: false,
      skills: [],
      interests: [],
      preferred_roles: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } : null);

    if (!effectiveProfile) {
      return {
        authorized: false,
        status: 403,
        error: 'Administrator profile not found.',
      };
    }

    // Keep privileged database access on the server, after authorization.
    // Never return this client or its secret key to browser code.
    return {
      authorized: true,
      user: { id: user.id, email: user.email },
      profile: effectiveProfile as Profile,
      dbClient: serviceRoleKey ? profileClient : authClient,
    };
  } catch {
    return {
      authorized: false,
      status: 500,
      error: 'Internal authorization failure.',
    };
  }
}

/**
 * Record an immutable administrative action into public.admin_audit_logs.
 * Strips any sensitive credentials or secrets.
 */
export async function recordAdminAuditLog({
  actorId,
  actorEmail,
  action,
  targetType,
  targetId,
  details = {},
  outcome = 'SUCCESS',
  ipAddress,
  dbClient,
}: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, any>;
  outcome?: 'SUCCESS' | 'FAILED';
  ipAddress?: string | null;
  dbClient?: any;
}) {
  try {
    const client = dbClient || defaultClient;

    // Sanitize details to never log passwords or tokens
    const sanitizedDetails: Record<string, any> = {};
    for (const [key, val] of Object.entries(details)) {
      if (/password|token|secret|key|hash|salt/i.test(key)) {
        sanitizedDetails[key] = '[REDACTED]';
      } else {
        sanitizedDetails[key] = val;
      }
    }

    await client.from('admin_audit_logs').insert({
      actor_id: actorId || null,
      actor_email: actorEmail || null,
      action,
      target_type: targetType,
      target_id: targetId || null,
      details: sanitizedDetails,
      outcome,
      ip_address: ipAddress || null,
    });
  } catch (err) {
    console.warn('Failed to record administrative audit log:', err);
  }
}
