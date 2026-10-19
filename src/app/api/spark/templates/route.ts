import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const SPARK_TEMPLATES_KEY = 'linkora_spark_templates_v1';

function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

// GET: Public fetch of curated spark templates
export async function GET() {
  try {
    const client = getSupabaseClient();
    let templates: SparkTemplateItem[] = [...DEFAULT_SPARK_TEMPLATES];

    if (client) {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', SPARK_TEMPLATES_KEY)
        .maybeSingle();

      if (Array.isArray(data?.value) && data.value.length > 0) {
        templates = data.value;
      }
    }

    return NextResponse.json({
      success: true,
      templates,
      totalTemplates: templates.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { templates: DEFAULT_SPARK_TEMPLATES, error: err.message },
      { status: 200 }
    );
  }
}

// POST: Admin adds a new spark template
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { title, tagline, category, difficulty, prompt, technologies, roles, featured } = body;

    if (!title || !prompt) {
      return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', SPARK_TEMPLATES_KEY)
      .maybeSingle();

    let currentList: SparkTemplateItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_SPARK_TEMPLATES];

    const newTemplate: SparkTemplateItem = {
      id: `spark-${Date.now()}`,
      title: title.trim(),
      tagline: (tagline || '').trim(),
      category: category || 'Web Development',
      difficulty: difficulty || 'Intermediate',
      prompt: prompt.trim(),
      technologies: Array.isArray(technologies)
        ? technologies
        : typeof technologies === 'string'
        ? technologies.split(',').map((t: string) => t.trim())
        : ['Next.js', 'TypeScript', 'TailwindCSS'],
      roles: Array.isArray(roles)
        ? roles
        : typeof roles === 'string'
        ? roles.split(',').map((r: string) => r.trim())
        : ['Fullstack Engineer', 'UI/UX Designer'],
      featured: Boolean(featured),
    };

    currentList.unshift(newTemplate);

    await client.from('platform_settings').upsert({
      key: SPARK_TEMPLATES_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Spark template added successfully',
      template: newTemplate,
      templates: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add spark template' }, { status: 500 });
  }
}

// PATCH: Admin updates a template
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', SPARK_TEMPLATES_KEY)
      .maybeSingle();

    let currentList: SparkTemplateItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_SPARK_TEMPLATES];

    const idx = currentList.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    currentList[idx] = { ...currentList[idx], ...updates };

    await client.from('platform_settings').upsert({
      key: SPARK_TEMPLATES_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      templates: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update template' }, { status: 500 });
  }
}

// DELETE: Admin removes a template
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const { data: existingRow } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', SPARK_TEMPLATES_KEY)
      .maybeSingle();

    let currentList: SparkTemplateItem[] =
      Array.isArray(existingRow?.value) && existingRow.value.length > 0
        ? existingRow.value
        : [...DEFAULT_SPARK_TEMPLATES];

    currentList = currentList.filter((t) => t.id !== id);

    await client.from('platform_settings').upsert({
      key: SPARK_TEMPLATES_KEY,
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
      templates: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete template' }, { status: 500 });
  }
}
