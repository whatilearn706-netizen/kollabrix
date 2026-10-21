import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CAMPUS_RESOURCES } from '@/data/defaultResources';
import { LearningResource } from '@/types/resources';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let memoryResources: LearningResource[] = [...DEFAULT_CAMPUS_RESOURCES];

function getServiceSupabase() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: NextRequest) {
  try {
    const sClient = getServiceSupabase();
    if (sClient) {
      const { data, error } = await sClient
        .from('platform_settings')
        .select('value')
        .eq('key', 'campus_resources_registry')
        .maybeSingle();

      if (!error && Array.isArray(data?.value) && data.value.length > 0) {
        memoryResources = data.value;
        return NextResponse.json({ success: true, resources: data.value, source: 'database' });
      }
    }

    return NextResponse.json({ success: true, resources: memoryResources, source: 'default' });
  } catch (err: any) {
    return NextResponse.json({ success: true, resources: memoryResources, source: 'memory_fallback' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, resource, resources, id } = body;

    const sClient = getServiceSupabase();

    // Action 1: Replace full list or reset
    if (action === 'set_all' && Array.isArray(resources)) {
      memoryResources = resources;
      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_resources_registry',
          value: resources,
          updated_at: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true, resources: memoryResources });
    }

    // Action 2: Add or Edit single resource
    if (action === 'save' && resource) {
      const existingIdx = memoryResources.findIndex((r) => r.id === resource.id);
      if (existingIdx >= 0) {
        memoryResources[existingIdx] = { ...memoryResources[existingIdx], ...resource, updatedAt: new Date().toISOString() };
      } else {
        const newResource: LearningResource = {
          ...resource,
          id: resource.id || `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryResources.unshift(newResource);
      }

      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_resources_registry',
          value: memoryResources,
          updated_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, resources: memoryResources });
    }

    // Action 3: Delete
    if (action === 'delete' && id) {
      memoryResources = memoryResources.filter((r) => r.id !== id);
      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_resources_registry',
          value: memoryResources,
          updated_at: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true, resources: memoryResources });
    }

    // Action 4: Reset to Defaults
    if (action === 'reset_defaults') {
      memoryResources = [...DEFAULT_CAMPUS_RESOURCES];
      if (sClient) {
        await sClient.from('platform_settings').upsert({
          key: 'campus_resources_registry',
          value: DEFAULT_CAMPUS_RESOURCES,
          updated_at: new Date().toISOString(),
        });
      }
      return NextResponse.json({ success: true, resources: memoryResources });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
