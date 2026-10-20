import { NextRequest, NextResponse } from 'next/server';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import {
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
  HomepageIntentConfig,
  HomepageShowcaseConfig,
} from '@/types/homepageConfig';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { getMasterControlRecord, updateMasterControlSubkey } from '@/lib/admin/masterConfigStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const INTENT_KEY = 'homepage_intent_config';
const SHOWCASE_KEY = 'homepage_showcase_config';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const client = auth.dbClient || defaultClient;

    let intentConfig: HomepageIntentConfig = DEFAULT_HOMEPAGE_INTENT_CONFIG;
    let showcaseConfig: HomepageShowcaseConfig = DEFAULT_HOMEPAGE_SHOWCASE_CONFIG;

    // 1. Authoritative Master Control Storage
    try {
      const master = await getMasterControlRecord();
      if (master?.homepageIntent) {
        intentConfig = {
          ...DEFAULT_HOMEPAGE_INTENT_CONFIG,
          ...master.homepageIntent,
          candidates: Array.isArray(master.homepageIntent.candidates)
            ? master.homepageIntent.candidates
            : DEFAULT_HOMEPAGE_INTENT_CONFIG.candidates,
          projectSlots: Array.isArray(master.homepageIntent.projectSlots)
            ? master.homepageIntent.projectSlots
            : DEFAULT_HOMEPAGE_INTENT_CONFIG.projectSlots,
        };
      }
      if (master?.homepageShowcase) {
        showcaseConfig = {
          ...DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
          ...master.homepageShowcase,
          selectedProjectIds: Array.isArray(master.homepageShowcase.selectedProjectIds)
            ? master.homepageShowcase.selectedProjectIds
            : DEFAULT_HOMEPAGE_SHOWCASE_CONFIG.selectedProjectIds,
        };
      }
    } catch (masterErr) {
      console.warn('Could not read homepage config from masterControlRecord:', masterErr);
    }

    // 2. Fallback to platform_settings separate rows if master was empty
    if (isSupabaseConfigured() && (!intentConfig.candidates?.length && !showcaseConfig.selectedProjectIds?.length)) {
      try {
        const { data: rows } = await client
          .from('platform_settings')
          .select('key, value')
          .in('key', [INTENT_KEY, SHOWCASE_KEY]);

        if (rows && rows.length > 0) {
          const intentRow = rows.find((r: any) => r.key === INTENT_KEY);
          if (intentRow?.value) {
            intentConfig = {
              ...DEFAULT_HOMEPAGE_INTENT_CONFIG,
              ...intentRow.value,
              candidates: Array.isArray(intentRow.value.candidates)
                ? intentRow.value.candidates
                : DEFAULT_HOMEPAGE_INTENT_CONFIG.candidates,
              projectSlots: Array.isArray(intentRow.value.projectSlots)
                ? intentRow.value.projectSlots
                : DEFAULT_HOMEPAGE_INTENT_CONFIG.projectSlots,
            };
          }
          const showcaseRow = rows.find((r: any) => r.key === SHOWCASE_KEY);
          if (showcaseRow?.value) {
            showcaseConfig = {
              ...DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
              ...showcaseRow.value,
              selectedProjectIds: Array.isArray(showcaseRow.value.selectedProjectIds)
                ? showcaseRow.value.selectedProjectIds
                : DEFAULT_HOMEPAGE_SHOWCASE_CONFIG.selectedProjectIds,
            };
          }
        }
      } catch (dbErr) {
        console.warn('Could not read homepage config from platform_settings rows:', dbErr);
      }
    }

    // Also fetch all available projects for the showcase picker
    let allProjects: any[] = [];
    if (isSupabaseConfigured()) {
      try {
        const { data: projs } = await client
          .from('projects')
          .select(`
            id,
            title,
            category,
            status,
            difficulty,
            summary,
            technologies,
            desired_roles,
            current_team_size,
            desired_team_size,
            is_featured,
            created_at,
            owner:profiles!projects_owner_id_fkey(
              display_name,
              username,
              avatar_url,
              college
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (projs && projs.length > 0) {
          allProjects = projs;
        }
      } catch (err) {
        console.warn('Error fetching all projects:', err);
      }
    }

    // Merge with demo projects so user can pick from anything
    const existingIds = new Set(allProjects.map((p) => p.id));
    for (const dp of DEMO_PROJECTS) {
      if (!existingIds.has(dp.id)) {
        allProjects.push(dp);
      }
    }

    return NextResponse.json({
      success: true,
      intentConfig,
      showcaseConfig,
      allProjects,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch homepage admin config' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminSession(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = await request.json();
    const { intentConfig, showcaseConfig } = body;
    const client = auth.dbClient || defaultClient;

    if (isSupabaseConfigured()) {
      if (intentConfig) {
        // Save to master control storage (permanent, bypasses RLS blocks)
        await updateMasterControlSubkey('homepageIntent', intentConfig);

        // Also try direct table update for legacy readers if exists
        try {
          await client.from('platform_settings').upsert({
            key: INTENT_KEY,
            value: intentConfig,
            updated_at: new Date().toISOString(),
          });
        } catch {}
      }

      if (showcaseConfig) {
        // Save to master control storage (permanent, bypasses RLS blocks)
        await updateMasterControlSubkey('homepageShowcase', showcaseConfig);

        // Also try direct table update for legacy readers if exists
        try {
          await client.from('platform_settings').upsert({
            key: SHOWCASE_KEY,
            value: showcaseConfig,
            updated_at: new Date().toISOString(),
          });
        } catch {}

        // Also sync is_featured flags on projects table if selected
        if (showcaseConfig.selectedProjectIds && Array.isArray(showcaseConfig.selectedProjectIds)) {
          try {
            // First mark all as is_featured = false
            await client
              .from('projects')
              .update({ is_featured: false })
              .neq('id', '00000000-0000-0000-0000-000000000000');

            // Then mark selected as is_featured = true
            await client
              .from('projects')
              .update({ is_featured: true })
              .in('id', showcaseConfig.selectedProjectIds);
          } catch (syncErr) {
            console.warn('Could not sync is_featured column on projects table:', syncErr);
          }
        }
      }

      // Record audit log
      try {
        await recordAdminAuditLog({
          actorId: auth.user?.id || 'system',
          actorEmail: auth.user?.email || 'admin@linkora.internal',
          action: 'update_homepage_config',
          targetType: 'platform_settings',
          targetId: 'homepage_config',
          details: {
            hasIntentConfig: Boolean(intentConfig),
            hasShowcaseConfig: Boolean(showcaseConfig),
            selectedProjectCount: showcaseConfig?.selectedProjectIds?.length || 0,
          },
        });
      } catch (auditErr) {
        console.warn('Could not write admin audit log:', auditErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Homepage Intent and Showcase settings updated successfully.',
      intentConfig: intentConfig || DEFAULT_HOMEPAGE_INTENT_CONFIG,
      showcaseConfig: showcaseConfig || DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update homepage config' },
      { status: 500 }
    );
  }
}
