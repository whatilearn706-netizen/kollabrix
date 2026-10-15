import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, recordAdminAuditLog } from '@/lib/admin/adminAuth';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { MatchScoringConfig } from '@/types/database';
import { calculateProjectTeammateMatch, calculatePeerTeammateMatch } from '@/lib/teammateMatching';

import { DEFAULT_MATCH_SCORING_CONFIG } from '@/lib/admin/adminDefaults';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const client = auth.dbClient;
  let config = DEFAULT_MATCH_SCORING_CONFIG;

  if (isSupabaseConfigured()) {
    try {
      const { data } = await client
        .from('platform_settings')
        .select('value')
        .eq('key', 'match_scoring_config')
        .maybeSingle();

      if (data?.value) {
        config = { ...DEFAULT_MATCH_SCORING_CONFIG, ...data.value };
      }
    } catch (err) {
      console.warn('Error reading match scoring config:', err);
    }
  }

  return NextResponse.json({
    success: true,
    config,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await request.json();
    const { weights, minScore, maxRecs, requirePortfolio, testCandidate, testProject } = body;
    const client = auth.dbClient;

    // Test Sandbox Mode: Calculate score on-the-fly without saving
    if (testCandidate && testProject && weights) {
      const testMatch = calculateProjectTeammateMatch(
        testCandidate,
        testProject,
        undefined,
        [],
        weights
      );

      return NextResponse.json({
        success: true,
        testResult: testMatch,
      });
    }

    if (!weights) {
      return NextResponse.json({ error: 'Matching weights are required.' }, { status: 400 });
    }

    const wSkills = Math.max(0, parseInt(weights.required_skills || '0', 10));
    const wRoles = Math.max(0, parseInt(weights.desired_roles || '0', 10));
    const wInterests = Math.max(0, parseInt(weights.category_interests || '0', 10));
    const wCompleteness = Math.max(0, parseInt(weights.completeness_availability || '0', 10));

    const totalWeight = wSkills + wRoles + wInterests + wCompleteness;
    if (totalWeight <= 0) {
      return NextResponse.json({ error: 'Total match weights must be greater than 0.' }, { status: 400 });
    }

    // Normalized weights if sum is not 100
    const normalizedWeights = {
      required_skills: Math.round((wSkills / totalWeight) * 100),
      desired_roles: Math.round((wRoles / totalWeight) * 100),
      category_interests: Math.round((wInterests / totalWeight) * 100),
      completeness_availability: Math.max(
        0,
        100 -
          (Math.round((wSkills / totalWeight) * 100) +
            Math.round((wRoles / totalWeight) * 100) +
            Math.round((wInterests / totalWeight) * 100))
      ),
    };

    const newConfig: MatchScoringConfig = {
      weights: normalizedWeights,
      min_recommendation_score: Math.max(10, Math.min(80, parseInt(minScore || '20', 10))),
      max_recommendations: Math.max(3, Math.min(25, parseInt(maxRecs || '8', 10))),
      require_public_portfolio: requirePortfolio !== false,
      formula_description: `Match Score = (Skill Match × ${normalizedWeights.required_skills}%) + (Role Match × ${normalizedWeights.desired_roles}%) + (Category Match × ${normalizedWeights.category_interests}%) + (Completeness × ${normalizedWeights.completeness_availability}%)`,
    };

    if (isSupabaseConfigured()) {
      const { error: upsertErr } = await client
        .from('platform_settings')
        .upsert({
          key: 'match_scoring_config',
          value: newConfig,
          updated_at: new Date().toISOString(),
          updated_by: auth.user?.id,
        });

      if (upsertErr) throw new Error(upsertErr.message);

      await recordAdminAuditLog({
        actorId: auth.user?.id,
        actorEmail: auth.user?.email,
        action: 'MATCH_SETTINGS_UPDATED',
        targetType: 'settings',
        targetId: 'match_scoring_config',
        details: {
          weights: normalizedWeights,
          formula: newConfig.formula_description,
        },
        outcome: 'SUCCESS',
        dbClient: client,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Match scoring weights and formula updated successfully.',
      config: newConfig,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error updating match scoring configuration.' },
      { status: 500 }
    );
  }
}
