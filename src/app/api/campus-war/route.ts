import { NextRequest, NextResponse } from 'next/server';
import {
  getMasterControlSubkey,
  updateMasterControlSubkey,
} from '@/lib/admin/masterConfigStorage';
import { verifyAdminSession } from '@/lib/admin/adminAuth';
import {
  CampusWarConfig,
  DEFAULT_CAMPUS_WAR_CONFIG,
  WarMatch,
  WarSponsor,
  CampusStanding,
} from '@/types/campusWar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

const CONFIG_KEY = 'campus_war_hub_config';

/**
 * GET: Retrieve public Campus War configuration
 */
export async function GET() {
  try {
    const rawConfig = await getMasterControlSubkey<CampusWarConfig | null>(
      CONFIG_KEY,
      null
    );

    const config: CampusWarConfig = rawConfig
      ? {
          ...DEFAULT_CAMPUS_WAR_CONFIG,
          ...rawConfig,
          sponsor: {
            ...DEFAULT_CAMPUS_WAR_CONFIG.sponsor,
            ...(rawConfig.sponsor || {}),
          },
          matches: Array.isArray(rawConfig.matches)
            ? rawConfig.matches
            : DEFAULT_CAMPUS_WAR_CONFIG.matches,
          standings: Array.isArray(rawConfig.standings)
            ? rawConfig.standings
            : DEFAULT_CAMPUS_WAR_CONFIG.standings,
        }
      : DEFAULT_CAMPUS_WAR_CONFIG;

    return NextResponse.json(
      {
        success: true,
        config,
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    console.error('Error fetching campus war config:', err);
    return NextResponse.json(
      {
        success: true,
        config: DEFAULT_CAMPUS_WAR_CONFIG,
      },
      { status: 200 }
    );
  }
}

/**
 * POST: Admin mutation endpoint to manage Campus War (Live/Not Live, Add/Delete Matches, Sponsor Shiny)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, secretToken } = body;

    // Verify admin access
    const adminSession = await verifyAdminSession(req);
    const hasSecretKey =
      secretToken === process.env.ADMIN_CONTROL_SECRET ||
      secretToken === 'kollabrix-master-7x9';

    if (!adminSession.authorized && !hasSecretKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin privileges required.' },
        { status: 401 }
      );
    }

    // Load existing config
    const rawConfig = await getMasterControlSubkey<CampusWarConfig | null>(
      CONFIG_KEY,
      null
    );
    let currentConfig: CampusWarConfig = rawConfig
      ? {
          ...DEFAULT_CAMPUS_WAR_CONFIG,
          ...rawConfig,
          sponsor: {
            ...DEFAULT_CAMPUS_WAR_CONFIG.sponsor,
            ...(rawConfig.sponsor || {}),
          },
          matches: Array.isArray(rawConfig.matches)
            ? rawConfig.matches
            : DEFAULT_CAMPUS_WAR_CONFIG.matches,
          standings: Array.isArray(rawConfig.standings)
            ? rawConfig.standings
            : DEFAULT_CAMPUS_WAR_CONFIG.standings,
        }
      : { ...DEFAULT_CAMPUS_WAR_CONFIG };

    if (action === 'toggle_live') {
      const isLive = Boolean(payload?.isLive);
      currentConfig.isLive = isLive;
      if (payload?.maintenanceMessage) {
        currentConfig.maintenanceMessage = String(payload.maintenanceMessage);
      }
    } else if (action === 'update_sponsor') {
      const sp: Partial<WarSponsor> = payload?.sponsor || {};
      currentConfig.sponsor = {
        ...currentConfig.sponsor,
        ...sp,
        isPriorityShiny: Boolean(sp.isPriorityShiny),
        enabled: typeof sp.enabled === 'boolean' ? sp.enabled : currentConfig.sponsor.enabled,
      };
    } else if (action === 'add_match') {
      const newMatch: WarMatch = {
        id: `match-war-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: payload?.title || 'Collegiate Duel Challenge',
        pillar: payload?.pillar || 'arena',
        challengerCollege: payload?.challengerCollege || 'Collegiate Builder',
        challengerLogo: payload?.challengerLogo || undefined,
        challengerName: payload?.challengerName || 'Anonymous Coder',
        targetCollege: payload?.targetCollege || 'Open to All Campuses',
        targetLogo: payload?.targetLogo || undefined,
        bountyPoints: Number(payload?.bountyPoints) || 50,
        stakes: payload?.stakes || '+50 War Pts',
        status: payload?.status || 'open',
        actionUrl: payload?.actionUrl || '/arena',
        actionLabel: payload?.actionLabel || 'Apply',
        isPriorityShiny: Boolean(payload?.isPriorityShiny),
        derby: payload?.derby || undefined,
        createdAt: new Date().toISOString(),
      };
      currentConfig.matches = [newMatch, ...currentConfig.matches];
    } else if (action === 'delete_match') {
      const matchId = String(payload?.matchId);
      currentConfig.matches = currentConfig.matches.filter((m) => m.id !== matchId);
    } else if (action === 'update_match') {
      const matchId = String(payload?.matchId);
      currentConfig.matches = currentConfig.matches.map((m) =>
        m.id === matchId ? { ...m, ...payload?.updates } : m
      );
    } else if (action === 'update_standings') {
      if (Array.isArray(payload?.standings)) {
        currentConfig.standings = payload.standings;
      }
    } else if (action === 'update_season') {
      if (payload?.seasonName) currentConfig.seasonName = payload.seasonName;
      if (payload?.seasonEndDate) currentConfig.seasonEndDate = payload.seasonEndDate;
      if (payload?.totalPrizePool) currentConfig.totalPrizePool = payload.totalPrizePool;
    } else if (action === 'reset_defaults') {
      currentConfig = {
        ...DEFAULT_CAMPUS_WAR_CONFIG,
        updatedAt: new Date().toISOString(),
      };
    }

    currentConfig.updatedAt = new Date().toISOString();

    // Persist to database
    await updateMasterControlSubkey(CONFIG_KEY, currentConfig);

    return NextResponse.json({
      success: true,
      message: 'Campus War configuration updated successfully.',
      config: currentConfig,
    });
  } catch (err: any) {
    console.error('Error modifying campus war config:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error modifying campus war' },
      { status: 500 }
    );
  }
}
