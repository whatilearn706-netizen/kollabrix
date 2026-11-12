import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { parseDeletedHackathons } from '@/lib/admin/hackathonSettings';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { Project, Profile, Hackathon, ExploreConfig } from '@/types/database';
import { isFacultyProfile } from '@/lib/teammateMatching';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory zero-latency cache map
const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Retrieve cached data for instantaneous client rendering (0ms).
 * Checks in-memory Map first, then falls back to sessionStorage.
 */
export function getPageCache<T>(key: string, maxAgeMs = 15 * 60 * 1000): T | null {
  const now = Date.now();

  // 1. Check in-memory cache
  const mem = memoryCache.get(key);
  if (mem) {
    if (now - mem.timestamp < maxAgeMs) {
      return mem.data as T;
    }
  }

  // 2. Fall back to sessionStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(`linkora_cache_${key}`);
      if (raw) {
        const parsed: CacheEntry<T> = JSON.parse(raw);
        if (parsed && typeof parsed.timestamp === 'number') {
          memoryCache.set(key, parsed);
          if (now - parsed.timestamp < maxAgeMs) {
            return parsed.data;
          }
        }
      }
    } catch {}

    // 3. Fall back to localStorage (persists across tabs & browser restarts for 0ms loads)
    try {
      const localRaw = localStorage.getItem(`linkora_cache_${key}`);
      if (localRaw) {
        const parsed: CacheEntry<T> = JSON.parse(localRaw);
        if (parsed && typeof parsed.timestamp === 'number') {
          memoryCache.set(key, parsed);
          if (now - parsed.timestamp < maxAgeMs) {
            return parsed.data;
          }
        }
      }
    } catch {}
  }

  // Stale-While-Revalidate: Return stale cached data from memory or storage to avoid skeleton flicker
  if (mem && mem.data) {
    return mem.data as T;
  }
  if (typeof window !== 'undefined') {
    try {
      const fallbackRaw = sessionStorage.getItem(`linkora_cache_${key}`) || localStorage.getItem(`linkora_cache_${key}`);
      if (fallbackRaw) {
        const parsed = JSON.parse(fallbackRaw);
        if (parsed?.data) return parsed.data as T;
      }
    } catch {}
  }

  return null;
}

/**
 * Persist data to in-memory cache, sessionStorage, and localStorage.
 */
export function setPageCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);

  if (typeof window !== 'undefined') {
    try {
      const json = JSON.stringify(entry);
      sessionStorage.setItem(`linkora_cache_${key}`, json);
      localStorage.setItem(`linkora_cache_${key}`, json);
    } catch {}
  }
}

/**
 * Check if a valid or stale cache entry exists.
 */
export function hasPageCache(key: string, maxAgeMs = 10 * 60 * 1000): boolean {
  return getPageCache(key, maxAgeMs) !== null;
}

/**
 * Invalidate cache by exact key or prefix.
 */
export function invalidatePageCache(prefix?: string): void {
  if (!prefix) {
    memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith('linkora_cache_')) keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }
    return;
  }

  // Prefix invalidation
  memoryCache.forEach((_, k) => {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  });

  if (typeof window !== 'undefined') {
    try {
      const pfx = `linkora_cache_${prefix}`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith(pfx)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
}

/**
 * Background prefetcher for Hackathons
 */
export async function prefetchHackathonsData(): Promise<void> {
  try {
    let activeList: Hackathon[] = [];
    let deletedIdsList: string[] = [];
    let deletedTitlesList: string[] = [];

    const res = await fetch('/api/hackathons', {
      next: { revalidate: 120 },
    });
    const data = await res.json();
    if (res.ok && data.success && Array.isArray(data.hackathons)) {
      activeList = data.hackathons;
      deletedIdsList = data.deletedIds || [];
      if (Array.isArray(data.deletedTitles)) deletedTitlesList = data.deletedTitles;
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: settingRows } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['deleted_hackathons', 'site_master_control_config']);

        if (Array.isArray(settingRows)) {
          for (const row of settingRows) {
            if (row.key === 'deleted_hackathons' && row.value) {
              const parsed = parseDeletedHackathons(row.value);
              deletedIdsList.push(...parsed.deletedIds);
              if (parsed.deletedTitles) deletedTitlesList.push(...parsed.deletedTitles);
            } else if (row.key === 'site_master_control_config' && row.value?.deletedHackathons) {
              const parsed = parseDeletedHackathons(row.value.deletedHackathons);
              deletedIdsList.push(...parsed.deletedIds);
              if (parsed.deletedTitles) deletedTitlesList.push(...parsed.deletedTitles);
            }
          }
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      try {
        const localDeleted: string[] = JSON.parse(localStorage.getItem('teamforge_deleted_hackathons') || '[]');
        const sanitizedDeleted = localDeleted.filter((item) => {
          const low = item.toLowerCase().trim();
          return (
            low !== 'november 26 sprint' &&
            low !== 'november 27 sprint' &&
            low !== 'november 27 campus innovation sprint' &&
            low !== 'sprint27'
          );
        });
        if (sanitizedDeleted.length !== localDeleted.length) {
          localStorage.setItem('teamforge_deleted_hackathons', JSON.stringify(sanitizedDeleted));
        }
        deletedIdsList.push(...sanitizedDeleted);
      } catch {}
    }

    const deletedSet = new Set(deletedIdsList.map((id) => id.toLowerCase().trim()));
    const deletedTitlesSet = new Set(deletedTitlesList.map((t) => t.toLowerCase().trim()));

    const isHackathonDeleted = (h: any) => {
      if (!h) return false;
      const id = (h.id || '').toLowerCase().trim();
      const joinCode = (h.join_code || '').toLowerCase().trim();
      const title = (h.title || '').toLowerCase().trim();
      const webCode = h.website_url ? h.website_url.split('/h/')[1]?.split(/[?#]/)[0]?.toLowerCase().trim() : '';

      // Direct ID or Join Code match is authoritative
      if (id && deletedSet.has(id)) return true;
      if (joinCode && deletedSet.has(joinCode)) return true;
      if (webCode && deletedSet.has(webCode)) return true;

      // Title-based deletion applies ONLY to mock/curated hackathons without a genuine database UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(h.id);
      if (!isUUID && title && (deletedSet.has(title) || deletedTitlesSet.has(title))) {
        return true;
      }

      return false;
    };

    let localHacks: Hackathon[] = [];
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
        localHacks = rawLocal.filter((h: any) => !isHackathonDeleted(h));
      } catch {}
    }

    const seenIds = new Set<string>();
    const deduped: Hackathon[] = [];
    const candidateList = activeList.length > 0 ? [...localHacks, ...activeList] : [...localHacks, ...CURATED_HACKATHONS];

    for (const item of candidateList) {
      if (item && item.id && !seenIds.has(item.id.toLowerCase())) {
        if (!isHackathonDeleted(item)) {
          seenIds.add(item.id.toLowerCase());
          deduped.push(item);
        }
      }
    }

    setPageCache('linkora_hackathons_list', deduped);
  } catch (err) {
    // Fail silently in prefetcher
  }
}

/**
 * Background prefetcher for Explore Projects
 */
export async function prefetchExploreData(): Promise<void> {
  try {
    // Fetch explore config
    try {
      const res = await fetch('/api/explore/config');
      const data = await res.json();
      if (data?.config) {
        setPageCache('linkora_explore_config', data.config as ExploreConfig);
      }
    } catch {}

    if (!isSupabaseConfigured()) {
      setPageCache('linkora_explore_projects_p1', DEMO_PROJECTS.slice(0, 12));
      setPageCache('linkora_explore_count_p1', DEMO_PROJECTS.length);
      return;
    }

    let query = supabase
      .from('projects')
      .select(
        `
        *,
        owner:profiles!projects_owner_id_fkey(
          user_id,
          display_name,
          username,
          avatar_url,
          college,
          course
        )
      `,
        { count: 'exact' }
      )
      .is('problem_statement_id', null)
      .neq('category', 'Hackathon Sprint')
      .neq('category', 'Faculty Industry Problem')
      .not('category', 'ilike', '%hackathon%')
      .not('summary', 'ilike', 'Hackathon%')
      .not('summary', 'ilike', '%faculty challenge%')
      .not('summary', 'ilike', '%tackling faculty%')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(0, 11);

    const { data, count, error } = await query;

    if (!error && data) {
      // Tombstone and verification
      let deletedSet = new Set<string>();
      const verifiedUserSet = new Set<string>();
      try {
        const { data: sRows } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['deleted_projects', 'linkedin_college_verifications', 'site_master_control_config']);

        if (Array.isArray(sRows)) {
          for (const row of sRows) {
            if (row.key === 'deleted_projects' && row.value) {
              const raw = row.value;
              const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
              const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
              [...ids, ...titles].forEach((s: string) => {
                if (s) deletedSet.add(s.trim().toLowerCase());
              });
            } else if (row.key === 'site_master_control_config' && row.value?.deletedProjects) {
              const raw = row.value.deletedProjects;
              const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
              const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
              [...ids, ...titles].forEach((s: string) => {
                if (s) deletedSet.add(s.trim().toLowerCase());
              });
            } else if (row.key === 'linkedin_college_verifications' && Array.isArray(row.value)) {
              row.value.forEach((v: any) => {
                if (v.userId) verifiedUserSet.add(v.userId);
                if (v.username) verifiedUserSet.add(v.username.toLowerCase().trim());
              });
            }
          }
        }
      } catch {}

      const cleanData = (data as Project[]).filter((p) => {
        if (!p) return false;
        if (
          deletedSet.has((p.id || '').toLowerCase()) ||
          deletedSet.has((p.title || '').trim().toLowerCase())
        ) {
          return false;
        }
        const cat = (p.category || '').toLowerCase();
        const sum = (p.summary || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        if (
          p.problem_statement_id ||
          (p as any).problem_statement ||
          cat === 'hackathon sprint' ||
          cat === 'faculty industry problem' ||
          cat.includes('hackathon') ||
          sum.includes('hackathon team sprint') ||
          sum.includes('faculty challenge') ||
          sum.includes('tackling faculty') ||
          desc.includes('squad mission & approach') ||
          desc.includes('### looking for team members')
        ) {
          return false;
        }
        return true;
      });

      const verifiedProjects = cleanData.map((proj) => {
        const isOwnerVerified =
          (proj.owner?.user_id && verifiedUserSet.has(proj.owner.user_id)) ||
          (proj.owner?.username && verifiedUserSet.has(proj.owner.username.toLowerCase().trim())) ||
          (proj.owner_id && verifiedUserSet.has(proj.owner_id));
        if (proj.owner) {
          return { ...proj, owner: { ...proj.owner, college_verified: Boolean(isOwnerVerified) } };
        }
        return proj;
      });

      setPageCache('linkora_explore_projects_p1', verifiedProjects);
      setPageCache('linkora_explore_count_p1', count || verifiedProjects.length);
    }
  } catch {}
}

/**
 * Background prefetcher for Teammates Profiles
 */
export async function prefetchTeammatesData(): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return;

    let suspendedIds: string[] = [];
    try {
      const { data: settingData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'match_scoring_config')
        .maybeSingle();

      if (settingData?.value && Array.isArray((settingData.value as any).suspended_user_ids)) {
        suspendedIds = (settingData.value as any).suspended_user_ids;
      }
    } catch {}

    const { data: profs } = await supabase
      .from('profiles')
      .select('*')
      .neq('is_suspended', true)
      .neq('status', 'suspended')
      .order('updated_at', { ascending: false })
      .limit(60);

    const verifiedUserIds = new Set<string>();
    try {
      const { data: vData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'linkedin_college_verifications')
        .maybeSingle();
      if (Array.isArray(vData?.value)) {
        vData.value.forEach((v: any) => {
          if (v.userId) verifiedUserIds.add(v.userId);
          if (v.username) verifiedUserIds.add(v.username.toLowerCase().trim());
        });
      }
    } catch {}

    if (profs) {
      const activeProfs = (profs as Profile[])
        .filter(
          (p) =>
            !p.is_suspended &&
            p.status !== 'suspended' &&
            !suspendedIds.includes(p.user_id) &&
            !isFacultyProfile(p) &&
            Boolean(p.user_id && (p.username || p.display_name))
        )
        .map((p) => {
          const isVerified =
            verifiedUserIds.has(p.user_id) ||
            Boolean(p.username && verifiedUserIds.has(p.username.toLowerCase().trim()));
          return { ...p, college_verified: isVerified };
        });

      setPageCache('kollabrix_teammates_real_v2', activeProfs);
    }
  } catch {}
}

/**
 * High-performance idle warm-up:
 * Warms core pages into cache during idle cycles so navigation is instant 0ms on click.
 */
export function warmAppCache(): void {
  if (typeof window === 'undefined') return;

  const runWarmup = () => {
    if (!hasPageCache('linkora_hackathons_list')) prefetchHackathonsData();
    if (!hasPageCache('linkora_explore_projects_p1')) prefetchExploreData();
    if (!hasPageCache('linkora_teammates_profiles')) prefetchTeammatesData();
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runWarmup, { timeout: 1500 });
  } else {
    setTimeout(runWarmup, 800);
  }
}
