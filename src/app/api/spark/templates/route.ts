import { NextRequest, NextResponse } from 'next/server';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import { getMasterControlSubkey, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// GET: Returns curated blueprints. Admin sees all blueprints; normal users match dynamically via /api/ai/spark
export async function GET(request: NextRequest) {
  try {
    const rawTemplates = await getMasterControlSubkey<SparkTemplateItem[]>('sparkTemplates', DEFAULT_SPARK_TEMPLATES);
    const templates: SparkTemplateItem[] = Array.isArray(rawTemplates) && rawTemplates.length > 0
      ? rawTemplates
      : [...DEFAULT_SPARK_TEMPLATES];

    const auth = await verifyAdminSession(request);
    // If admin is authenticated, return the full editable blueprint repository
    if (auth.authorized) {
      return NextResponse.json({
        success: true,
        templates,
        totalTemplates: templates.length,
        isAdmin: true,
      });
    }

    // For normal users, keep the curated blueprints hidden from public listing so they are matched dynamically via AI Spark
    return NextResponse.json({
      success: true,
      templates: [], // Hidden from public scrape
      totalTemplates: templates.length,
      isAdmin: false,
      message: 'Curated blueprints are matched dynamically via /api/ai/spark',
    });
  } catch (err: any) {
    return NextResponse.json(
      { templates: [], error: err.message },
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

    const rawTemplates = await getMasterControlSubkey<SparkTemplateItem[]>('sparkTemplates', DEFAULT_SPARK_TEMPLATES);
    const currentList: SparkTemplateItem[] = Array.isArray(rawTemplates) && rawTemplates.length > 0
      ? [...rawTemplates]
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

    const result = await updateMasterControlSubkey('sparkTemplates', currentList);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save to master database');
    }

    return NextResponse.json({
      success: true,
      message: 'Spark blueprint added successfully',
      template: newTemplate,
      templates: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add spark blueprint' }, { status: 500 });
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

    const rawTemplates = await getMasterControlSubkey<SparkTemplateItem[]>('sparkTemplates', DEFAULT_SPARK_TEMPLATES);
    const currentList: SparkTemplateItem[] = Array.isArray(rawTemplates) && rawTemplates.length > 0
      ? [...rawTemplates]
      : [...DEFAULT_SPARK_TEMPLATES];

    const idx = currentList.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    currentList[idx] = { ...currentList[idx], ...updates };

    const result = await updateMasterControlSubkey('sparkTemplates', currentList);
    if (!result.success) {
      throw new Error(result.error || 'Failed to save to master database');
    }

    return NextResponse.json({
      success: true,
      message: 'Spark blueprint updated successfully',
      templates: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update spark blueprint' }, { status: 500 });
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

    const rawTemplates = await getMasterControlSubkey<SparkTemplateItem[]>('sparkTemplates', DEFAULT_SPARK_TEMPLATES);
    let currentList: SparkTemplateItem[] = Array.isArray(rawTemplates) && rawTemplates.length > 0
      ? [...rawTemplates]
      : [...DEFAULT_SPARK_TEMPLATES];

    currentList = currentList.filter((t) => t.id !== id);

    const result = await updateMasterControlSubkey('sparkTemplates', currentList);
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete from master database');
    }

    return NextResponse.json({
      success: true,
      message: 'Spark blueprint removed successfully',
      templates: currentList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete spark blueprint' }, { status: 500 });
  }
}
