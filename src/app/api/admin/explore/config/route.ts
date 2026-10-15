import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { ExploreConfig } from '@/types/database';

import { DEFAULT_EXPLORE_CONFIG } from '@/lib/admin/adminDefaults';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;

  let config = DEFAULT_EXPLORE_CONFIG;
  let featuredProjects: any[] = [];

  if (isSupabaseConfigured()) {
    try {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'explore_config')
        .maybeSingle();

      if (data?.value) {
        config = { ...DEFAULT_EXPLORE_CONFIG, ...data.value };
      }

      // Fetch featured projects
      const { data: featured } = await client
        .from('projects')
        .select('id, title, category, status, is_featured, current_team_size, desired_team_size')
        .eq('is_featured', true);

      if (featured) {
        featuredProjects = featured;
      }
    } catch (err) {
      console.warn('Error reading explore settings:', err);
    }
  }

  return NextResponse.json({
    success: true,
    config,
    featuredProjects,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { config, toggleFeaturedProjectId, isFeatured } = body;

    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Explore configuration updated (Demo Mode).',
        config: config || DEFAULT_EXPLORE_CONFIG,
      });
    }

    // 1. Toggle single project featured status if requested
    if (toggleFeaturedProjectId !== undefined) {
      const { error: featErr } = await client
        .from('projects')
        .update({ is_featured: Boolean(isFeatured) })
        .eq('id', toggleFeaturedProjectId);

      if (featErr) throw new Error(featErr.message);

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: isFeatured ? 'PROJECT_FEATURED' : 'PROJECT_UNFEATURED',
        targetType: 'project',
        targetId: toggleFeaturedProjectId,
        details: { is_featured: isFeatured },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: `Project ${isFeatured ? 'featured' : 'unfeatured'} successfully.`,
      });
    }

    // 2. Validate and Update Explore Configuration
    if (config) {
      if (!Array.isArray(config.categories) || config.categories.length === 0) {
        return NextResponse.json({ error: 'Explore configuration must contain at least one category.' }, { status: 400 });
      }

      const { error: upsertErr } = await client
        .from('platform_settings')
        .upsert({
          key: 'explore_config',
          value: config,
          updated_at: new Date().toISOString(),
          updated_by: auth.user?.id,
        });

      if (upsertErr) throw new Error(upsertErr.message);

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'EXPLORE_CONFIG_UPDATE',
        targetType: 'settings',
        targetId: 'explore_config',
        details: {
          categories_count: config.categories.length,
          popular_skills_count: (config.popular_skills || []).length,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: 'Explore configuration updated successfully.',
        config,
      });
    }

    return NextResponse.json({ error: 'No valid configuration provided.' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error updating explore configuration.' },
      { status: 500 }
    );
  }
}
