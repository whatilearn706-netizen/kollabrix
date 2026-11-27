import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, DEFAULT_SUPABASE_URL } from '@/lib/supabase/isConfigured';
import { DEFAULT_SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase/serviceKey';

export type KaPlanId = 'free' | 'hackathon_pass' | 'pro_monthly' | 'pro_semester';
export type KaQuotaContext = 'general' | 'code' | 'dsa' | 'hackathon';

const DAY_MS = 24 * 60 * 60 * 1000;

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
    priceInr: 99,
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
      '4 KΛ-1/day in General, Code & DSA modes',
      'Bespoke Varied PPT Deck (.pptx) + Repeat New Design',
      'AI 3-Judge Roast Q&A + 1-Click Working Starter Repo + Re-Audit',
    ],
  },
  pro_monthly: {
    id: 'pro_monthly',
    name: 'KΛ Pro Builder',
    tagline: 'Sitewide KΛ-Pro across Coding, DSA & Hackathons',
    priceInr: 249,
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
    tagline: '6 months of uninterrupted KΛ Pro (Save 46%)',
    priceInr: 799,
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
      '~₹133/month effective cost',
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
  windowKey?: string;
  windowStartAt?: number;
  fast: number;
  generalFast?: number;
  deep: number;
  explain: number;
}

export interface KaEntitlementSummary {
  planId: KaPlanId;
  planName: string;
  activatedAt?: string | null;
  expiresAt: string | null;
  nextResetAt?: string | null;
  isAuthenticated: boolean;
  hackathonOnly: boolean;
  fastLimit: number;
  deepLimit: number;
  explainLimit: number;
  fastRemaining: number;
  generalFastRemaining: number;
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
    return { planId: 'free', activatedAt: rec?.activatedAt || new Date().toISOString(), expiresAt: null };
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
  const expiresAt = duration ? new Date(now.getTime() + duration * DAY_MS).toISOString() : null;

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
  const newExpiresAt = new Date(baseTime + extraDays * DAY_MS).toISOString();
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

/**
 * Computes exact rolling 24-hour quota cycle anchored to the user's purchase timestamp (`activatedAt`).
 * Example: Buy at 7:30 PM -> daily limit resets at 7:30 PM every 24h until plan expires.
 */
function resolveRollingWindow(planRec: UserPlanRecord, stored?: DailyUsageCounter): {
  windowKey: string;
  windowStartAt: number;
  nextResetAt: string;
} {
  const now = Date.now();

  if (planRec.planId !== 'free' && planRec.activatedAt) {
    const anchorMs = new Date(planRec.activatedAt).getTime();
    if (Number.isFinite(anchorMs)) {
      const elapsed = Math.max(0, now - anchorMs);
      const cycleIdx = Math.floor(elapsed / DAY_MS);
      const cycleStartMs = anchorMs + cycleIdx * DAY_MS;
      return {
        windowKey: `${planRec.planId}:${planRec.activatedAt}:${cycleIdx}`,
        windowStartAt: cycleStartMs,
        nextResetAt: new Date(cycleStartMs + DAY_MS).toISOString(),
      };
    }
  }

  // Free / guest rolling 24h anchor from first usage in current window
  const existingStart = stored?.windowStartAt && Number.isFinite(stored.windowStartAt) ? stored.windowStartAt : 0;
  if (existingStart && now - existingStart < DAY_MS && (!stored?.windowKey || stored.windowKey.startsWith('free:'))) {
    return {
      windowKey: stored?.windowKey || `free:${existingStart}`,
      windowStartAt: existingStart,
      nextResetAt: new Date(existingStart + DAY_MS).toISOString(),
    };
  }

  return {
    windowKey: `free:${now}`,
    windowStartAt: now,
    nextResetAt: new Date(now + DAY_MS).toISOString(),
  };
}

function formatResetMessage(nextResetAt: string): string {
  const msLeft = Math.max(60_000, new Date(nextResetAt).getTime() - Date.now());
  const hrs = Math.floor(msLeft / 3_600_000);
  const mins = Math.floor((msLeft % 3_600_000) / 60_000);
  let timeStr = '';
  try {
    timeStr = new Date(nextResetAt).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  } catch {}
  return `Resets in ${hrs}h ${mins}m${timeStr ? ` (at ${timeStr} IST)` : ''}`;
}

async function getUsageCounter(actorKey: string, planRec: UserPlanRecord): Promise<{
  counter: DailyUsageCounter;
  nextResetAt: string;
}> {
  const today = getTodayStr();
  const allUsage = await readSettingsMap<DailyUsageCounter>(USAGE_KEY);
  const dbEntry = allUsage[actorKey];
  const memEntry = memUsage.get(actorKey);

  // Pick whichever entry belongs to the active rolling window
  const activeWin = resolveRollingWindow(planRec, dbEntry || memEntry);

  const dbMatches =
    dbEntry &&
    (dbEntry.windowKey ? dbEntry.windowKey === activeWin.windowKey : dbEntry.date === today && planRec.planId === 'free');
  const memMatches =
    memEntry &&
    (memEntry.windowKey ? memEntry.windowKey === activeWin.windowKey : memEntry.date === today && planRec.planId === 'free');

  const dbFast = dbMatches ? Number(dbEntry.fast || 0) : 0;
  const dbGenFast = dbMatches ? Number(dbEntry.generalFast || 0) : 0;
  const dbDeep = dbMatches ? Number(dbEntry.deep || 0) : 0;
  const dbExplain = dbMatches ? Number(dbEntry.explain || 0) : 0;

  const mFast = memMatches ? Number(memEntry.fast || 0) : 0;
  const mGenFast = memMatches ? Number(memEntry.generalFast || 0) : 0;
  const mDeep = memMatches ? Number(memEntry.deep || 0) : 0;
  const mExplain = memMatches ? Number(memEntry.explain || 0) : 0;

  return {
    counter: {
      date: today,
      windowKey: activeWin.windowKey,
      windowStartAt: activeWin.windowStartAt,
      fast: Math.max(dbFast, mFast),
      generalFast: Math.max(dbGenFast, mGenFast),
      deep: Math.max(dbDeep, mDeep),
      explain: Math.max(dbExplain, mExplain),
    },
    nextResetAt: activeWin.nextResetAt,
  };
}

async function saveUsageCounter(actorKey: string, counter: DailyUsageCounter): Promise<void> {
  memUsage.set(actorKey, counter);
  const now = Date.now();
  const today = getTodayStr();
  const allUsage = await readSettingsMap<DailyUsageCounter>(USAGE_KEY);
  const pruned: Record<string, DailyUsageCounter> = {};
  for (const [k, v] of Object.entries(allUsage)) {
    if (!v) continue;
    const stillValid = v.windowStartAt ? now - v.windowStartAt < DAY_MS * 2 : v.date === today;
    if (stillValid) pruned[k] = v;
  }
  pruned[actorKey] = counter;
  await writeSettingsMap(USAGE_KEY, pruned);
}

export async function getKaEntitlements(
  actorKey: string,
  userId: string | null,
  usageOverride?: { counter: DailyUsageCounter; nextResetAt: string }
): Promise<KaEntitlementSummary> {
  const isAuth = Boolean(userId);
  const planRec = await getUserActivePlan(userId);
  const def = KA_PLANS[planRec.planId] || KA_PLANS.free;
  const { counter: usage, nextResetAt } = usageOverride || (await getUsageCounter(actorKey, planRec));

  const fastLimit = isAuth ? def.fastPerDay : 1;
  const deepLimit = isAuth ? def.deepPerDay : 0;
  const explainLimit = isAuth ? def.explainPerDay : 1;
  const generalFastLimit = def.hackathonOnly ? 4 : fastLimit;

  return {
    planId: def.id,
    planName: isAuth ? def.name : 'Guest Preview',
    activatedAt: planRec.activatedAt || null,
    expiresAt: planRec.expiresAt,
    nextResetAt,
    isAuthenticated: isAuth,
    hackathonOnly: Boolean(def.hackathonOnly),
    fastLimit,
    deepLimit,
    explainLimit,
    fastRemaining: Math.max(0, fastLimit - usage.fast),
    generalFastRemaining: Math.max(0, generalFastLimit - (def.hackathonOnly ? (usage.generalFast || 0) : usage.fast)),
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
  contextMode: KaQuotaContext = 'general',
  tokenCost = 1
): Promise<{
  allowed: boolean;
  effectiveTier: 'fast' | 'deep';
  tokensUsed?: number;
  requireAuth?: boolean;
  upgradeRequired?: boolean;
  recommendedPlan?: 'pro_monthly' | 'hackathon_pass';
  error?: string;
  note?: string;
  entitlements: KaEntitlementSummary;
}> {
  const safeCost = Math.max(1, Math.min(2, Math.floor(tokenCost || 1)));
  const isAuth = Boolean(userId);
  const planRec = await getUserActivePlan(userId);
  const def = KA_PLANS[planRec.planId] || KA_PLANS.free;
  const usageState = await getUsageCounter(actorKey, planRec);
  const { counter: usage, nextResetAt } = usageState;
  const resetText = formatResetMessage(nextResetAt);

  // 1. Hackathon Pass (₹99 / 7 days) Isolation:
  //    - KΛ-Pro & 10/day quota are ONLY allowed in Hackathon Studio (`contextMode === 'hackathon'`)
  //    - Outside Hackathon Studio (General, Code Sandbox, DSA), KΛ-Pro is blocked and KΛ-1 is capped at 4/day!
  if (def.hackathonOnly && contextMode !== 'hackathon') {
    if (requestedTier === 'deep') {
      return {
        allowed: false,
        effectiveTier: 'fast',
        upgradeRequired: true,
        recommendedPlan: 'pro_monthly',
        error:
          '₹99 Hackathon Sprint Pass unlocks KΛ-Pro only inside Hackathon Studio. Switch to KΛ-1 (4/day) here or upgrade to KΛ Pro Builder (₹249/mo) to use KΛ-Pro anywhere on Kollabrix!',
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }

    const generalFastLimit = 4;
    const usedGen = usage.generalFast || 0;
    if (usedGen >= generalFastLimit) {
      return {
        allowed: false,
        effectiveTier: 'fast',
        upgradeRequired: true,
        recommendedPlan: 'pro_monthly',
        error: `Daily KΛ-1 general limit reached (${generalFastLimit}/${generalFastLimit}). ${resetText} — or upgrade to KΛ Pro Builder (₹249/mo) for 30 KΛ-1 + 10 KΛ-Pro/day everywhere!`,
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }

    usage.generalFast = usedGen + 1;
    await saveUsageCounter(actorKey, usage);
    return {
      allowed: true,
      effectiveTier: 'fast',
      entitlements: await getKaEntitlements(actorKey, userId, usageState),
    };
  }

  const fastLimit = isAuth ? def.fastPerDay : 1;
  const deepLimit = isAuth ? def.deepPerDay : 0;

  // 2. KΛ-Pro (`deep`) — Strict Hard Stop when 0 left (NEVER silently downgrade to KΛ-1!)
  if (requestedTier === 'deep') {
    if (!isAuth) {
      return {
        allowed: false,
        effectiveTier: 'deep',
        requireAuth: true,
        error: 'Sign in free for 4 daily KΛ-1 messages, or unlock KΛ-Pro with Hackathon Pass (₹99 / 7 days).',
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }

    if (def.id === 'free') {
      return {
        allowed: false,
        effectiveTier: 'deep',
        upgradeRequired: true,
        recommendedPlan: contextMode === 'hackathon' ? 'hackathon_pass' : 'pro_monthly',
        error:
          contextMode === 'hackathon'
            ? 'KΛ-Pro Hackathon Studio is unlocked with Hackathon Pass (₹99 / 7 days) or KΛ Pro Builder (₹249/mo).'
            : 'KΛ-Pro in Code Sandbox, DSA & General Chat requires KΛ Pro Builder (₹249/mo).',
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }

    const remainingDeep = Math.max(0, deepLimit - usage.deep);
    if (remainingDeep >= safeCost) {
      usage.deep += safeCost;
      await saveUsageCounter(actorKey, usage);
      return {
        allowed: true,
        effectiveTier: 'deep',
        tokensUsed: safeCost,
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }

    if (remainingDeep > 0 && remainingDeep < safeCost) {
      return {
        allowed: false,
        effectiveTier: 'deep',
        upgradeRequired: def.id === 'hackathon_pass',
        recommendedPlan: def.id === 'hackathon_pass' ? 'pro_monthly' : undefined,
        error: `This deep multi-link scan requires ${safeCost} KΛ-Pro tokens, and you have ${remainingDeep} remaining today. ${resetText} — remove external links for a 1-token run or upgrade to KΛ Pro Builder.`,
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }

    // 0 KΛ-Pro left -> strictly return error with exact 24h reset countdown (+ Upgrade button if on Hackathon Pass)
    return {
      allowed: false,
      effectiveTier: 'deep',
      upgradeRequired: def.id === 'hackathon_pass',
      recommendedPlan: def.id === 'hackathon_pass' ? 'pro_monthly' : undefined,
      error:
        def.id === 'hackathon_pass'
          ? `Daily KΛ-Pro limit reached (${deepLimit}/${deepLimit} used). ${resetText} — or upgrade to KΛ Pro Builder (₹249/mo) for fresh Pro access everywhere!`
          : `Daily KΛ-Pro limit reached (${deepLimit}/${deepLimit} used). ${resetText}. Switch to KΛ-1 if you still have fast messages remaining.`,
      entitlements: await getKaEntitlements(actorKey, userId, usageState),
    };
  }

  // 3. KΛ-1 (`fast`)
  if (usage.fast >= fastLimit) {
    if (!isAuth) {
      return {
        allowed: false,
        effectiveTier: 'fast',
        requireAuth: true,
        error: 'Free guest preview used (1/1). Sign in free for 4 daily KΛ-1 messages!',
        entitlements: await getKaEntitlements(actorKey, userId, usageState),
      };
    }
    return {
      allowed: false,
      effectiveTier: 'fast',
      upgradeRequired: def.id === 'free' || def.id === 'hackathon_pass',
      recommendedPlan: contextMode === 'hackathon' && def.id === 'free' ? 'hackathon_pass' : 'pro_monthly',
      error:
        def.id === 'free'
          ? `Daily Free KΛ-1 limit reached (4/4). ${resetText} — or upgrade to Hackathon Pass (₹99) / KΛ Pro Builder (₹249/mo).`
          : `Daily KΛ-1 limit reached (${fastLimit}/${fastLimit}). ${resetText}.`,
      entitlements: await getKaEntitlements(actorKey, userId, usageState),
    };
  }

  usage.fast += 1;
  await saveUsageCounter(actorKey, usage);
  return {
    allowed: true,
    effectiveTier: 'fast',
    entitlements: await getKaEntitlements(actorKey, userId, usageState),
  };
}

export async function consumeKaExplainQuota(
  actorKey: string,
  userId: string | null
): Promise<{ allowed: boolean; remaining: number; upgradeRequired?: boolean; error?: string }> {
  const ent = await getKaEntitlements(actorKey, userId);
  if (ent.explainRemaining <= 0) {
    const resetHint = ent.nextResetAt ? ` ${formatResetMessage(ent.nextResetAt)}.` : '';
    return {
      allowed: false,
      remaining: 0,
      upgradeRequired: true,
      error: ent.isAuthenticated
        ? `Bug Coach limit reached.${resetHint} Upgrade to KΛ Pro Builder (₹249/mo) for unlimited Practice IDE & Arena debugging hints!`
        : 'Sign in free for 2 daily Bug Coach hints, or go KΛ Pro Builder (₹249/mo) for unlimited debugging.',
    };
  }
  const planRec = await getUserActivePlan(userId);
  const { counter: usage } = await getUsageCounter(actorKey, planRec);
  usage.explain += 1;
  await saveUsageCounter(actorKey, usage);
  return {
    allowed: true,
    remaining: Math.max(0, ent.explainLimit - usage.explain),
  };
}
