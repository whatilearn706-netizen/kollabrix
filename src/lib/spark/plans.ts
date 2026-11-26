import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export type KaPlanId = 'free' | 'hackathon_pass' | 'pro_monthly' | 'pro_semester';

export interface KaPlanDefinition {
  id: KaPlanId;
  name: string;
  tagline: string;
  priceInr: number;
  durationDays: number | null;
  badge?: string;
  fastPerDay: number;
  deepPerDay: number;
  explainPerDay: number;
  canJudgeAudit: boolean;
  canSquadMatch: boolean;
  canExportPassport: boolean;
  hasPriorityBoost: boolean;
  highlights: string[];
}

export const KA_PLANS: Record<KaPlanId, KaPlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free Builder',
    tagline: 'Try KΛ-1 with live site intelligence',
    priceInr: 0,
    durationDays: null,
    fastPerDay: 4,
    deepPerDay: 0,
    explainPerDay: 2,
    canJudgeAudit: false,
    canSquadMatch: false,
    canExportPassport: false,
    hasPriorityBoost: false,
    highlights: [
      '4 KΛ-1 messages/day (1 guest teaser)',
      '2 Practice IDE Bug Coach hints/day',
      'Live Projects, Hackathons & Teammate search',
    ],
  },
  hackathon_pass: {
    id: 'hackathon_pass',
    name: 'Hackathon Sprint Pass',
    tagline: '7-day squad & judge boost for any hackathon',
    priceInr: 49,
    durationDays: 7,
    badge: 'IMPULSE PASS',
    fastPerDay: 25,
    deepPerDay: 15,
    explainPerDay: 25,
    canJudgeAudit: true,
    canSquadMatch: true,
    canExportPassport: false,
    hasPriorityBoost: false,
    highlights: [
      '15 KΛ-Pro Deep Think + 25 KΛ-1 msgs/day',
      'AI Judge Rubric Audit (score before submitting)',
      'AI Squad Match + 1-Click Blueprint-to-Workspace',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'KΛ Pro Builder',
    tagline: 'Full placement, arena & passport advantage',
    priceInr: 149,
    durationDays: 30,
    badge: 'MOST POPULAR',
    fastPerDay: 30,
    deepPerDay: 10,
    explainPerDay: 999,
    canJudgeAudit: true,
    canSquadMatch: true,
    canExportPassport: true,
    hasPriorityBoost: true,
    highlights: [
      '30 KΛ-1 + 10 KΛ-Pro Deep Think msgs/day',
      'Unlimited Practice IDE & 1v1 Arena Bug Coach',
      'AI Judge Audit + Squad Match + Workspace Launch',
      'Priority Teammate Boost + Builder Passport Export',
    ],
  },
  pro_semester: {
    id: 'pro_semester',
    name: 'KΛ Pro Semester',
    tagline: '6 months of uninterrupted KΛ Pro (Save 55%)',
    priceInr: 399,
    durationDays: 180,
    badge: 'BEST VALUE',
    fastPerDay: 30,
    deepPerDay: 10,
    explainPerDay: 999,
    canJudgeAudit: true,
    canSquadMatch: true,
    canExportPassport: true,
    hasPriorityBoost: true,
    highlights: [
      'Everything in KΛ Pro Builder for 180 days',
      'Covers full semester hackathons + placement OAs',
      '~₹66/month effective cost',
    ],
  },
};

export interface UserPlanRecord {
  planId: KaPlanId;
  activatedAt: string;
  expiresAt: string | null;
  utrNumber?: string;
  source?: 'upi' | 'sandbox_demo' | 'admin';
}

export interface DailyUsageCounter {
  date: string;
  fast: number;
  deep: number;
  explain: number;
}

export interface KaEntitlementSummary {
  planId: KaPlanId;
  planName: string;
  expiresAt: string | null;
  isAuthenticated: boolean;
  fastLimit: number;
  deepLimit: number;
  explainLimit: number;
  fastRemaining: number;
  deepRemaining: number;
  explainRemaining: number;
  canJudgeAudit: boolean;
  canSquadMatch: boolean;
  canExportPassport: boolean;
  hasPriorityBoost: boolean;
}

const PLANS_KEY = 'ka_user_plans_v1';
const USAGE_KEY = 'ka_daily_usage_v1';

// Short-lived local fallback if Supabase isn't reachable
const memPlans = new Map<string, UserPlanRecord>();
const memUsage = new Map<string, DailyUsageCounter>();

function getServiceClient() {
  if (!isSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}

async function readSettingsMap<T>(key: string): Promise<Record<string, T>> {
  const client = getServiceClient();
  if (!client) return {};
  try {
    const { data } = await client.from('platform_settings').select('value').eq('key', key).maybeSingle();
    if (data?.value && typeof data.value === 'object' && !Array.isArray(data.value)) {
      return data.value as Record<string, T>;
    }
  } catch {}
  return {};
}

async function writeSettingsMap<T>(key: string, mapObj: Record<string, T>): Promise<void> {
  const client = getServiceClient();
  if (!client) return;
  try {
    await client
      .from('platform_settings')
      .upsert({ key, value: mapObj, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch {}
}

export async function getUserActivePlan(userId: string | null): Promise<UserPlanRecord> {
  if (!userId) {
    return { planId: 'free', activatedAt: new Date().toISOString(), expiresAt: null };
  }

  const allPlans = await readSettingsMap<UserPlanRecord>(PLANS_KEY);
  const rec = allPlans[userId] || memPlans.get(userId);
  if (!rec || rec.planId === 'free') {
    return { planId: 'free', activatedAt: new Date().toISOString(), expiresAt: null };
  }

  if (rec.expiresAt && new Date(rec.expiresAt).getTime() <= Date.now()) {
    return { planId: 'free', activatedAt: new Date().toISOString(), expiresAt: null };
  }

  return rec;
}

export async function activateUserPlan(
  userId: string,
  planId: KaPlanId,
  opts?: { utrNumber?: string; source?: 'upi' | 'sandbox_demo' | 'admin' }
): Promise<UserPlanRecord> {
  const def = KA_PLANS[planId] || KA_PLANS.free;
  const now = new Date();
  const expiresAt = def.durationDays
    ? new Date(now.getTime() + def.durationDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const rec: UserPlanRecord = {
    planId: def.id,
    activatedAt: now.toISOString(),
    expiresAt,
    ...(opts?.utrNumber ? { utrNumber: opts.utrNumber } : {}),
    source: opts?.source || 'sandbox_demo',
  };

  memPlans.set(userId, rec);
  const allPlans = await readSettingsMap<UserPlanRecord>(PLANS_KEY);
  allPlans[userId] = rec;
  await writeSettingsMap(PLANS_KEY, allPlans);
  return rec;
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

async function getUsageCounter(actorKey: string): Promise<DailyUsageCounter> {
  const today = getTodayStr();
  const allUsage = await readSettingsMap<DailyUsageCounter>(USAGE_KEY);
  const existing = allUsage[actorKey] || memUsage.get(actorKey);
  if (existing && existing.date === today) {
    return existing;
  }
  return { date: today, fast: 0, deep: 0, explain: 0 };
}

async function saveUsageCounter(actorKey: string, counter: DailyUsageCounter): Promise<void> {
  memUsage.set(actorKey, counter);
  const today = getTodayStr();
  const allUsage = await readSettingsMap<DailyUsageCounter>(USAGE_KEY);
  // Prune stale days to keep platform_settings tiny
  const pruned: Record<string, DailyUsageCounter> = {};
  for (const [k, v] of Object.entries(allUsage)) {
    if (v && v.date === today) pruned[k] = v;
  }
  pruned[actorKey] = counter;
  await writeSettingsMap(USAGE_KEY, pruned);
}

export async function getKaEntitlements(
  actorKey: string,
  userId: string | null
): Promise<KaEntitlementSummary> {
  const isAuth = Boolean(userId);
  const planRec = await getUserActivePlan(userId);
  const def = KA_PLANS[planRec.planId] || KA_PLANS.free;
  const usage = await getUsageCounter(actorKey);

  // Guest gets 1 teaser KΛ-1 message + 0 KΛ-Pro + 1 Bug Coach teaser
  const fastLimit = isAuth ? def.fastPerDay : 1;
  const deepLimit = isAuth ? def.deepPerDay : 0;
  const explainLimit = isAuth ? def.explainPerDay : 1;

  return {
    planId: def.id,
    planName: isAuth ? def.name : 'Guest Preview',
    expiresAt: planRec.expiresAt,
    isAuthenticated: isAuth,
    fastLimit,
    deepLimit,
    explainLimit,
    fastRemaining: Math.max(0, fastLimit - usage.fast),
    deepRemaining: Math.max(0, deepLimit - usage.deep),
    explainRemaining: Math.max(0, explainLimit - usage.explain),
    canJudgeAudit: isAuth && def.canJudgeAudit,
    canSquadMatch: isAuth && def.canSquadMatch,
    canExportPassport: isAuth && def.canExportPassport,
    hasPriorityBoost: isAuth && def.hasPriorityBoost,
  };
}

export async function consumeKaChatQuota(
  actorKey: string,
  requestedTier: 'fast' | 'deep',
  userId: string | null
): Promise<{
  allowed: boolean;
  effectiveTier: 'fast' | 'deep';
  requireAuth?: boolean;
  upgradeRequired?: boolean;
  error?: string;
  note?: string;
  entitlements: KaEntitlementSummary;
}> {
  const isAuth = Boolean(userId);
  const planRec = await getUserActivePlan(userId);
  const def = KA_PLANS[planRec.planId] || KA_PLANS.free;
  const usage = await getUsageCounter(actorKey);

  const fastLimit = isAuth ? def.fastPerDay : 1;
  const deepLimit = isAuth ? def.deepPerDay : 0;

  if (requestedTier === 'deep') {
    if (usage.deep < deepLimit) {
      usage.deep += 1;
      await saveUsageCounter(actorKey, usage);
      return {
        allowed: true,
        effectiveTier: 'deep',
        entitlements: await getKaEntitlements(actorKey, userId),
      };
    }

    if (!isAuth) {
      return {
        allowed: false,
        effectiveTier: 'fast',
        requireAuth: true,
        error: 'Sign in free for 4 daily KΛ-1 messages, or unlock KΛ-Pro with Hackathon Pass (₹49 / 7 days).',
        entitlements: await getKaEntitlements(actorKey, userId),
      };
    }

    if (def.id === 'free') {
      return {
        allowed: false,
        effectiveTier: 'fast',
        upgradeRequired: true,
        error: 'KΛ-Pro Deep Think is unlocked with Hackathon Pass (₹49 / 7 days) or KΛ Pro Builder (₹149/mo).',
        entitlements: await getKaEntitlements(actorKey, userId),
      };
    }

    // Paid user hit daily KΛ-Pro cap -> fall back to KΛ-1 if fast remains
    if (usage.fast < fastLimit) {
      usage.fast += 1;
      await saveUsageCounter(actorKey, usage);
      return {
        allowed: true,
        effectiveTier: 'fast',
        note: 'Daily KΛ-Pro quota reached — routed automatically to KΛ-1.',
        entitlements: await getKaEntitlements(actorKey, userId),
      };
    }

    return {
      allowed: false,
      effectiveTier: 'fast',
      upgradeRequired: true,
      error: 'Daily KΛ ΛI quota reached. Come back tomorrow or upgrade to KΛ Pro Builder.',
      entitlements: await getKaEntitlements(actorKey, userId),
    };
  }

  // Fast tier (KΛ-1)
  if (usage.fast >= fastLimit) {
    if (!isAuth) {
      return {
        allowed: false,
        effectiveTier: 'fast',
        requireAuth: true,
        error: 'Free guest preview used (1/1). Sign in free for 4 daily KΛ-1 messages!',
        entitlements: await getKaEntitlements(actorKey, userId),
      };
    }
    return {
      allowed: false,
      effectiveTier: 'fast',
      upgradeRequired: true,
      error:
        def.id === 'free'
          ? 'Daily Free limit reached (4/4 KΛ-1). Unlock 25–30/day + KΛ-Pro with Hackathon Pass (₹49) or KΛ Pro (₹149/mo).'
          : 'Daily KΛ-1 quota reached for today.',
      entitlements: await getKaEntitlements(actorKey, userId),
    };
  }

  usage.fast += 1;
  await saveUsageCounter(actorKey, usage);
  return {
    allowed: true,
    effectiveTier: 'fast',
    entitlements: await getKaEntitlements(actorKey, userId),
  };
}

export async function consumeKaExplainQuota(
  actorKey: string,
  userId: string | null
): Promise<{ allowed: boolean; remaining: number; upgradeRequired?: boolean; error?: string }> {
  const ent = await getKaEntitlements(actorKey, userId);
  if (ent.explainRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      upgradeRequired: true,
      error: ent.isAuthenticated
        ? 'Free Bug Coach limit reached (2/2 today). Upgrade to KΛ Pro Builder (₹149/mo) for unlimited debugging hints!'
        : 'Sign in free for 2 daily Bug Coach hints, or go Pro for unlimited debugging.',
    };
  }
  const usage = await getUsageCounter(actorKey);
  usage.explain += 1;
  await saveUsageCounter(actorKey, usage);
  return {
    allowed: true,
    remaining: Math.max(0, ent.explainLimit - usage.explain),
  };
}
