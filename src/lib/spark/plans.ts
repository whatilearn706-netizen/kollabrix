import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export type KaPlanId = 'free' | 'hackathon_pass' | 'pro_monthly' | 'pro_semester';
export type KaQuotaContext = 'general' | 'code' | 'dsa' | 'hackathon';

export interface KaPlanDefinition {
  id: KaPlanId;
  name: string;
  tagline: string;
  priceInr: number;
  durationDays: number | null;
  badge?: string;
  hackathonOnly?: boolean;
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
    tagline: '7-day squad & judge war-room (Hackathon Studio only)',
    priceInr: 49,
    durationDays: 7,
    badge: 'IMPULSE PASS',
    hackathonOnly: true,
    fastPerDay: 10,
    deepPerDay: 10,
    explainPerDay: 2,
    canJudgeAudit: true,
    canSquadMatch: true,
    canExportPassport: false,
    hasPriorityBoost: false,
    highlights: [
      '10 KΛ-Pro + 10 KΛ-1/day (Hackathon Studio only)',
      'Screening PPT Deck (.pptx) + Pick Winning PS Cut-List',
      '2-Min Demo Timer + Tough Judge Q&A + README/SQL Pack',
      'Live Judge Re-Audit Loop + 3-Teammate War-Room Share',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'KΛ Pro Builder',
    tagline: 'Sitewide KΛ-Pro across Coding, DSA & Hackathons',
    priceInr: 149,
    durationDays: 30,
    badge: 'MOST POPULAR',
    hackathonOnly: false,
    fastPerDay: 30,
    deepPerDay: 10,
    explainPerDay: 999,
    canJudgeAudit: true,
    canSquadMatch: true,
    canExportPassport: true,
    hasPriorityBoost: true,
    highlights: [
      '30 KΛ-1 + 10 KΛ-Pro/day across ALL features & modes',
      'Unlimited Practice IDE & 1v1 Arena Bug Coach',
      'All Hackathon Sprint War-Room Tools included',
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
    hackathonOnly: false,
    fastPerDay: 30,
    deepPerDay: 10,
    explainPerDay: 999,
    canJudgeAudit: true,
    canSquadMatch: true,
    canExportPassport: true,
    hasPriorityBoost: true,
    highlights: [
      'Everything in KΛ Pro Builder across ALL modes for 180 days',
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
  source?: 'upi' | 'sandbox_demo' | 'admin' | 'razorpay';
  userEmail?: string;
  userName?: string;
  paymentId?: string;
  orderId?: string;
  amount?: number;
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
  hackathonOnly: boolean;
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

// In-memory cache kept short so same-process rapid clicks see decrements even before replication
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
  opts?: {
    utrNumber?: string;
    source?: 'upi' | 'sandbox_demo' | 'admin' | 'razorpay';
    userEmail?: string;
    userName?: string;
    paymentId?: string;
    orderId?: string;
    amount?: number;
    customDays?: number;
  }
): Promise<UserPlanRecord> {
  const def = KA_PLANS[planId] || KA_PLANS.free;
  const now = new Date();
  const duration = typeof opts?.customDays === 'number' && opts.customDays > 0 ? opts.customDays : def.durationDays;
  const expiresAt = duration
    ? new Date(now.getTime() + duration * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const rec: UserPlanRecord = {
    planId: def.id,
    activatedAt: now.toISOString(),
    expiresAt,
    ...(opts?.utrNumber ? { utrNumber: opts.utrNumber } : {}),
    source: opts?.source || 'sandbox_demo',
    ...(opts?.userEmail ? { userEmail: opts.userEmail } : {}),
    ...(opts?.userName ? { userName: opts.userName } : {}),
    ...(opts?.paymentId ? { paymentId: opts.paymentId } : {}),
    ...(opts?.orderId ? { orderId: opts.orderId } : {}),
    ...(typeof opts?.amount === 'number' ? { amount: opts.amount } : {}),
  };

  memPlans.set(userId, rec);
  const allPlans = await readSettingsMap<UserPlanRecord>(PLANS_KEY);
  allPlans[userId] = rec;
  await writeSettingsMap(PLANS_KEY, allPlans);
  return rec;
}

export async function revokeUserPlan(userId: string): Promise<UserPlanRecord> {
  const rec: UserPlanRecord = {
    planId: 'free',
    activatedAt: new Date().toISOString(),
    expiresAt: null,
    source: 'admin',
  };
  memPlans.set(userId, rec);
  const allPlans = await readSettingsMap<UserPlanRecord>(PLANS_KEY);
  allPlans[userId] = rec;
  await writeSettingsMap(PLANS_KEY, allPlans);
  return rec;
}

export async function extendUserPlan(userId: string, extraDays: number): Promise<UserPlanRecord> {
  const current = await getUserActivePlan(userId);
  const baseTime = current.expiresAt ? Math.max(Date.now(), new Date(current.expiresAt).getTime()) : Date.now();
  const newExpiresAt = new Date(baseTime + extraDays * 24 * 60 * 60 * 1000).toISOString();
  const rec: UserPlanRecord = {
    ...current,
    expiresAt: newExpiresAt,
  };
  memPlans.set(userId, rec);
  const allPlans = await readSettingsMap<UserPlanRecord>(PLANS_KEY);
  allPlans[userId] = rec;
  await writeSettingsMap(PLANS_KEY, allPlans);
  return rec;
}

export async function getAllUserPlans(): Promise<Record<string, UserPlanRecord>> {
  return readSettingsMap<UserPlanRecord>(PLANS_KEY);
}

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

async function getUsageCounter(actorKey: string): Promise<DailyUsageCounter> {
  const today = getTodayStr();
  const allUsage = await readSettingsMap<DailyUsageCounter>(USAGE_KEY);
  const dbEntry = allUsage[actorKey];
  const memEntry = memUsage.get(actorKey);

  // Merge max values in case an instance is slightly ahead of DB read
  const dbFast = dbEntry && dbEntry.date === today ? Number(dbEntry.fast || 0) : 0;
  const dbDeep = dbEntry && dbEntry.date === today ? Number(dbEntry.deep || 0) : 0;
  const dbExplain = dbEntry && dbEntry.date === today ? Number(dbEntry.explain || 0) : 0;

  const mFast = memEntry && memEntry.date === today ? Number(memEntry.fast || 0) : 0;
  const mDeep = memEntry && memEntry.date === today ? Number(memEntry.deep || 0) : 0;
  const mExplain = memEntry && memEntry.date === today ? Number(memEntry.explain || 0) : 0;

  return {
    date: today,
    fast: Math.max(dbFast, mFast),
    deep: Math.max(dbDeep, mDeep),
    explain: Math.max(dbExplain, mExplain),
  };
}

async function saveUsageCounter(actorKey: string, counter: DailyUsageCounter): Promise<void> {
  memUsage.set(actorKey, counter);
  const today = getTodayStr();
  const allUsage = await readSettingsMap<DailyUsageCounter>(USAGE_KEY);
  const pruned: Record<string, DailyUsageCounter> = {};
  for (const [k, v] of Object.entries(allUsage)) {
    if (v && v.date === today) pruned[k] = v;
  }
  pruned[actorKey] = counter;
  await writeSettingsMap(USAGE_KEY, pruned);
}

export async function getKaEntitlements(
  actorKey: string,
  userId: string | null,
  usageOverride?: DailyUsageCounter
): Promise<KaEntitlementSummary> {
  const isAuth = Boolean(userId);
  const planRec = await getUserActivePlan(userId);
  const def = KA_PLANS[planRec.planId] || KA_PLANS.free;
  const usage = usageOverride || (await getUsageCounter(actorKey));

  const fastLimit = isAuth ? def.fastPerDay : 1;
  const deepLimit = isAuth ? def.deepPerDay : 0;
  const explainLimit = isAuth ? def.explainPerDay : 1;

  return {
    planId: def.id,
    planName: isAuth ? def.name : 'Guest Preview',
    expiresAt: planRec.expiresAt,
    isAuthenticated: isAuth,
    hackathonOnly: Boolean(def.hackathonOnly),
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
  userId: string | null,
  contextMode: KaQuotaContext = 'general'
): Promise<{
  allowed: boolean;
  effectiveTier: 'fast' | 'deep';
  requireAuth?: boolean;
  upgradeRequired?: boolean;
  recommendedPlan?: 'pro_monthly' | 'hackathon_pass';
  error?: string;
  note?: string;
  entitlements: KaEntitlementSummary;
}> {
  const isAuth = Boolean(userId);
  const planRec = await getUserActivePlan(userId);
  const def = KA_PLANS[planRec.planId] || KA_PLANS.free;
  const usage = await getUsageCounter(actorKey);

  // Enforce Hackathon Pass isolation: Hackathon Pass ₹49 ONLY gives KΛ-Pro & 10/day inside Hackathon Studio
  if (def.hackathonOnly && contextMode !== 'hackathon') {
    if (requestedTier === 'deep') {
      return {
        allowed: false,
        effectiveTier: 'fast',
        upgradeRequired: true,
        recommendedPlan: 'pro_monthly',
        error:
          'Hackathon Pass (₹49) covers Hackathon Studio only. Upgrade to KΛ Pro Builder (₹149/mo) to use KΛ-Pro in Code Sandbox, DSA & General Chat!',
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }

    // Outside Hackathon Studio on KΛ-1, keep Hackathon Pass users at Free cap (4/day)
    const generalFastLimit = 4;
    if (usage.fast >= generalFastLimit) {
      return {
        allowed: false,
        effectiveTier: 'fast',
        upgradeRequired: true,
        recommendedPlan: 'pro_monthly',
        error:
          'Free general chat limit reached (4/4). Your 10/day Hackathon Pass works in Hackathon Studio — upgrade to KΛ Pro Builder (₹149/mo) for 30/day everywhere!',
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }

    usage.fast += 1;
    await saveUsageCounter(actorKey, usage);
    return {
      allowed: true,
      effectiveTier: 'fast',
      entitlements: await getKaEntitlements(actorKey, userId, usage),
    };
  }

  const fastLimit = isAuth ? def.fastPerDay : 1;
  const deepLimit = isAuth ? def.deepPerDay : 0;

  if (requestedTier === 'deep') {
    if (usage.deep < deepLimit) {
      usage.deep += 1;
      await saveUsageCounter(actorKey, usage);
      return {
        allowed: true,
        effectiveTier: 'deep',
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }

    if (!isAuth) {
      return {
        allowed: false,
        effectiveTier: 'fast',
        requireAuth: true,
        error: 'Sign in free for 4 daily KΛ-1 messages, or unlock KΛ-Pro with Hackathon Pass (₹49 / 7 days).',
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }

    if (def.id === 'free') {
      return {
        allowed: false,
        effectiveTier: 'fast',
        upgradeRequired: true,
        recommendedPlan: contextMode === 'hackathon' ? 'hackathon_pass' : 'pro_monthly',
        error:
          contextMode === 'hackathon'
            ? 'KΛ-Pro Hackathon Studio is unlocked with Hackathon Pass (₹49 / 7 days) or KΛ Pro Builder (₹149/mo).'
            : 'KΛ-Pro in Code Sandbox, DSA & General Chat requires KΛ Pro Builder (₹149/mo).',
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }

    if (usage.fast < fastLimit) {
      usage.fast += 1;
      await saveUsageCounter(actorKey, usage);
      return {
        allowed: true,
        effectiveTier: 'fast',
        note: 'Daily KΛ-Pro quota reached — routed automatically to KΛ-1.',
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }

    return {
      allowed: false,
      effectiveTier: 'fast',
      upgradeRequired: true,
      recommendedPlan: 'pro_monthly',
      error: 'Daily KΛ ΛI quota reached (10/10). Upgrade to KΛ Pro Builder (₹149/mo) or wait for tomorrow.',
      entitlements: await getKaEntitlements(actorKey, userId, usage),
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
        entitlements: await getKaEntitlements(actorKey, userId, usage),
      };
    }
    return {
      allowed: false,
      effectiveTier: 'fast',
      upgradeRequired: true,
      recommendedPlan: contextMode === 'hackathon' ? 'hackathon_pass' : 'pro_monthly',
      error:
        def.id === 'free'
          ? 'Daily Free limit reached (4/4 KΛ-1). Upgrade to Hackathon Pass (₹49) for Hackathon Studio or KΛ Pro (₹149/mo) sitewide.'
          : 'Daily KΛ-1 quota reached for today.',
      entitlements: await getKaEntitlements(actorKey, userId, usage),
    };
  }

  usage.fast += 1;
  await saveUsageCounter(actorKey, usage);
  return {
    allowed: true,
    effectiveTier: 'fast',
    entitlements: await getKaEntitlements(actorKey, userId, usage),
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
        ? 'Bug Coach limit reached. Upgrade to KΛ Pro Builder (₹149/mo) for unlimited Practice IDE & Arena debugging hints!'
        : 'Sign in free for 2 daily Bug Coach hints, or go KΛ Pro Builder (₹149/mo) for unlimited debugging.',
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
