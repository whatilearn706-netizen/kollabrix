import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { TaxonomyConfig, TaxonomySkill, TaxonomyRole } from '@/types/database';

import { DEFAULT_TAXONOMY_CONFIG } from '@/lib/admin/adminDefaults';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let config = DEFAULT_TAXONOMY_CONFIG;

  if (isSupabaseConfigured()) {
    try {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'taxonomy_config')
        .maybeSingle();

      if (data?.value) {
        config = { ...DEFAULT_TAXONOMY_CONFIG, ...data.value };
      }
    } catch (err) {
      console.warn('Error fetching taxonomy settings:', err);
    }
  }

  return NextResponse.json({
    success: true,
    taxonomy: config,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { action, payload, taxonomy } = body;
    const client = auth.dbClient;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Taxonomy configuration updated (Demo Mode).',
        taxonomy: taxonomy || DEFAULT_TAXONOMY_CONFIG,
      });
    }

    // Direct whole taxonomy update
    if (taxonomy) {
      const { error: upsertErr } = await client
        .from('platform_settings')
        .upsert({
          key: 'taxonomy_config',
          value: taxonomy,
          updated_at: new Date().toISOString(),
          updated_by: auth.user?.id,
        });

      if (upsertErr) throw new Error(upsertErr.message);

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'TAXONOMY_CONFIG_UPDATE',
        targetType: 'settings',
        targetId: 'taxonomy_config',
        details: {
          skills_count: (taxonomy.skills || []).length,
          roles_count: (taxonomy.roles || []).length,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: 'Taxonomy updated successfully.',
        taxonomy,
      });
    }

    // Handle single action (e.g. merge, rename, add, toggle)
    let currentConfig = DEFAULT_TAXONOMY_CONFIG;
    const { data } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'taxonomy_config')
      .maybeSingle();

    if (data?.value) {
      currentConfig = { ...DEFAULT_TAXONOMY_CONFIG, ...data.value };
    }

    if (action === 'merge_skills') {
      const { sourceSkillName, targetSkillId } = payload;
      const targetSkill = currentConfig.skills.find((s) => s.id === targetSkillId);

      if (!targetSkill) {
        return NextResponse.json({ error: 'Target skill not found in taxonomy.' }, { status: 400 });
      }

      if (!targetSkill.aliases.includes(sourceSkillName)) {
        targetSkill.aliases.push(sourceSkillName);
      }

      // Deactivate source skill if it exists separately
      const sourceSkill = currentConfig.skills.find(
        (s) => s.name.toLowerCase() === sourceSkillName.toLowerCase() && s.id !== targetSkillId
      );
      if (sourceSkill) {
        sourceSkill.isActive = false;
      }

      const { error: upsertErr } = await client
        .from('platform_settings')
        .upsert({
          key: 'taxonomy_config',
          value: currentConfig,
          updated_at: new Date().toISOString(),
          updated_by: auth.user?.id,
        });

      if (upsertErr) throw new Error(upsertErr.message);

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'TAXONOMY_SKILL_MERGED',
        targetType: 'skill',
        targetId: targetSkillId,
        details: {
          source: sourceSkillName,
          target: targetSkill.name,
          updated_aliases: targetSkill.aliases,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully merged "${sourceSkillName}" into "${targetSkill.name}". Existing selections preserved via alias mapping.`,
        taxonomy: currentConfig,
      });
    }

    return NextResponse.json({ error: 'Unsupported taxonomy action.' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error updating taxonomy.' },
      { status: 500 }
    );
  }
}
