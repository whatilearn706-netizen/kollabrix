import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

async function getAuthUserId(): Promise<string | null> {
  try {
    const serverClient = createServerSupabaseClient();
    const { data: { user } } = await serverClient.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = getServiceClient();
    if (!client) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    // Allow fetching a shared session by ID so teammates can open shared Spark threads
    if (sessionId) {
      const { data, error } = await client
        .from('spark_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, session: data });
    }

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    const { data, error } = await client
      .from('spark_sessions')
      .select('id, title, prompt, track, blueprint, messages, linked_project_id, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ success: true, sessions: [] });
    }

    return NextResponse.json({ success: true, sessions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to load sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Sign in required to save Spark sessions' }, { status: 401 });
    }

    const client = getServiceClient();
    if (!client) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { id, title, prompt, track = 'open', blueprint, messages = [], linkedProjectId } = body;

    if (!title || !prompt || !blueprint) {
      return NextResponse.json({ success: false, error: 'Missing required session fields' }, { status: 400 });
    }

    if (id) {
      const { data, error } = await client
        .from('spark_sessions')
        .update({
          title,
          prompt,
          track,
          blueprint,
          messages,
          ...(linkedProjectId ? { linked_project_id: linkedProjectId } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, session: data });
    }

    const { data, error } = await client
      .from('spark_sessions')
      .insert({
        user_id: userId,
        title,
        prompt,
        track,
        blueprint,
        messages,
        linked_project_id: linkedProjectId || null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID required' }, { status: 400 });
    }

    const client = getServiceClient();
    if (!client) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    await client.from('spark_sessions').delete().eq('id', id).eq('user_id', userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
