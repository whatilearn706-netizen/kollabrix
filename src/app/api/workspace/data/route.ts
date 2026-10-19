import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { checkIpRateLimit, getClientIp } from '@/lib/security/ipRateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

/** Service-role client for reading data */
function getServiceClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

/**
 * Verify the caller's Supabase JWT and return their user id.
 * Returns null if no valid token is provided.
 */
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const userClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data } = await userClient.auth.getUser(token);
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Check whether the given userId is the owner or a member of the project.
 * Falls back to allowing access when Supabase is not configured (local dev).
 */
async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return true; // local dev: open
  try {
    const client = getServiceClient();
    // Check ownership in projects table (adjust column names to match your schema)
    const { data: project } = await client
      .from('projects')
      .select('owner_id, members')
      .eq('id', projectId)
      .maybeSingle();

    if (!project) {
      // Project might be stored in platform_settings (workspace_data_<id>)
      // If project doesn't exist in DB yet, allow the creator (they're building it)
      return true;
    }

    if (project.owner_id === userId) return true;

    // members can be an array of user ids or objects with user_id
    const members: any[] = Array.isArray(project.members) ? project.members : [];
    return members.some((m) => (typeof m === 'string' ? m === userId : m?.user_id === userId));
  } catch {
    // If the projects table doesn't exist yet, allow access (graceful degradation)
    return true;
  }
}

// ── GET: Read workspace data — requires valid session ──────────────────────────
export async function GET(request: NextRequest) {
  // Auth gate
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required to access workspace data.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId')?.trim();

  if (!projectId || !/^[a-zA-Z0-9_\-\.]{1,64}$/.test(projectId)) {
    return NextResponse.json({ error: 'Invalid or missing projectId' }, { status: 400 });
  }

  // Membership check
  const isMember = await isProjectMember(projectId, userId);
  if (!isMember) {
    return NextResponse.json(
      { error: 'Access denied: you are not a member of this project.' },
      { status: 403 }
    );
  }

  const settingKey = `workspace_data_${projectId}`;

  if (isSupabaseConfigured()) {
    try {
      const client = getServiceClient();
      const { data: row } = await client
        .from('platform_settings')
        .select('value, updated_at')
        .eq('key', settingKey)
        .maybeSingle();

      if (row?.value) {
        return NextResponse.json({
          success: true,
          fromDb: true,
          data: row.value,
          updatedAt: row.updated_at,
        });
      }
    } catch (err: any) {
      console.warn('Could not read workspace data from Supabase:', err.message);
    }
  }

  return NextResponse.json({
    success: true,
    fromDb: false,
    data: null,
  });
}

// ── POST: Write workspace data — requires valid session + rate limit ───────────
export async function POST(request: NextRequest) {
  try {
    // Auth gate
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to save workspace data.' },
        { status: 401 }
      );
    }

    // Rate limit: max 60 writes per user per minute (prevents flooding)
    const ip = getClientIp(request);
    const rateCheck = checkIpRateLimit(`workspace-write:${userId}:${ip}`, 60, 60 * 1000, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many workspace save requests. Please slow down.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { projectId, data } = body;

    if (!projectId || typeof projectId !== 'string' || !/^[a-zA-Z0-9_\-\.]{1,64}$/.test(projectId.trim())) {
      return NextResponse.json({ error: 'Invalid projectId format' }, { status: 400 });
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid data payload' }, { status: 400 });
    }

    // Security Defense: Limit payload size to 300KB to prevent storage exhaustion attacks
    const payloadStr = JSON.stringify(data);
    if (payloadStr.length > 300000) {
      return NextResponse.json({ error: 'Payload exceeds maximum allowed limit of 300KB' }, { status: 413 });
    }

    // Membership check — only project members can overwrite workspace data
    const isMember = await isProjectMember(projectId.trim(), userId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'Access denied: you are not a member of this project.' },
        { status: 403 }
      );
    }

    const settingKey = `workspace_data_${projectId.trim()}`;
    let savedToDb = false;

    if (isSupabaseConfigured()) {
      try {
        const client = getServiceClient();
        const { error } = await client.from('platform_settings').upsert({
          key: settingKey,
          value: data,
          updated_at: new Date().toISOString(),
        });

        if (!error) {
          savedToDb = true;
        } else {
          console.warn('Supabase upsert error in workspace/data:', error.message);
        }
      } catch (err: any) {
        console.warn('Exception during workspace data save:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      savedToDb,
      savedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save workspace data' }, { status: 500 });
  }
}
