import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId')?.trim();

  if (!projectId || !/^[a-zA-Z0-9_\-\.]{1,64}$/.test(projectId)) {
    return NextResponse.json({ error: 'Invalid or missing projectId' }, { status: 400 });
  }

  const settingKey = `workspace_data_${projectId}`;

  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseClient();
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

export async function POST(request: NextRequest) {
  try {
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

    const settingKey = `workspace_data_${projectId.trim()}`;
    let savedToDb = false;

    if (isSupabaseConfigured()) {
      try {
        const client = getSupabaseClient();
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
