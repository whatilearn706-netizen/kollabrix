'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Hackathon, HackathonMode } from '@/types/database';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { parseDeletedHackathons } from '@/lib/admin/hackathonSettings';
import { isHackathonClosed, isHackathonArchivedFromFeed } from '@/lib/hackathons/hackathonStatus';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { CreateHackathonModal } from '@/components/hackathons/CreateHackathonModal';
import { HackathonCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThreeDOrangeSwitch } from '@/components/ui/ThreeDOrangeSwitch';
import {
  Trophy,
  Search,
  Filter,
  Bookmark,
  Calendar,
  PlusCircle,
  Sparkles,
  RefreshCw,
  Globe,
  MapPin,
  Lock,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { getPageCache, setPageCache } from '@/lib/cache/pageDataCache';
import { extractSponsoredMeta } from '@/lib/hackathons/sponsoredMeta';
import { isFacultyUser } from '@/lib/auth/faculty';

export default function HackathonsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { theme } = useSiteTheme();
  const isTeacherOrAdmin = isFacultyUser(user, profile);

  // Instant In-Memory / Stale-While-Revalidate Cache
  const cachedHackathons = getPageCache<Hackathon[]>('kollabrix_hackathons_v3');

  const [hackathons, setHackathons] = useState<Hackathon[]>(() => cachedHackathons || []);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'corporate' | 'private' | 'my-events' | 'saved'>('all');
  const [hasUserSelectedTab, setHasUserSelectedTab] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<'live' | 'past'>('live');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [onlyOpen, setOnlyOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedHackathons);

  // Load hackathons from server API and saved bookmarks
  const loadHackathons = async () => {
    // Only flash skeleton if no hackathons are currently displayed
    if (hackathons.length === 0) {
      setIsLoading(true);
    }
    try {
      let activeList: Hackathon[] = [];
      let deletedIdsList: string[] = [];
      let deletedTitlesList: string[] = [];

      // 1. Fetch authoritative active hackathons from server API
      try {
        const res = await fetch(`/api/hackathons?_t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.hackathons)) {
          activeList = data.hackathons;
          deletedIdsList = data.deletedIds || [];
          if (Array.isArray(data.deletedTitles)) {
            deletedTitlesList = data.deletedTitles;
          }
        }
      } catch (err) {
        console.warn('Could not load /api/hackathons:', err);
      }

      // 2. Dual-Layer direct query from platform_settings for instant fallback
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
        } catch (dbErr) {
          console.warn('Direct tombstone check notice:', dbErr);
        }
      }

      // 3. Merge browser localStorage deleted registry if any, cleaning up legacy unblocked titles
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('linkora_hackathons_list');
          localStorage.removeItem('linkora_cache_linkora_hackathons_list');
          sessionStorage.removeItem('linkora_cache_linkora_hackathons_list');
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

      // 4. Load locally authored hackathons if any, and purge any that were deleted by admin
      let localHacks: Hackathon[] = [];
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const survivingLocal = rawLocal.filter((h: any) => !isHackathonDeleted(h));

          if (survivingLocal.length !== rawLocal.length) {
            localStorage.setItem('teamforge_created_hackathons', JSON.stringify(survivingLocal));
          }

          localHacks = survivingLocal;
        } catch {}
      }

      // 5. Combine and deduplicate surviving hackathons (Server activeList is authoritative)
      const seenIds = new Set<string>();
      const deduped: Hackathon[] = [];

      const candidateList = activeList.length > 0 ? [...activeList, ...localHacks] : [...localHacks, ...CURATED_HACKATHONS];

      for (const item of candidateList) {
        if (item && item.id && !seenIds.has(item.id.toLowerCase())) {
          if (!isHackathonDeleted(item)) {
            seenIds.add(item.id.toLowerCase());
            if (item.join_code) seenIds.add(item.join_code.toLowerCase());
            deduped.push(item as Hackathon);
          }
        }
      }
      setHackathons(deduped);
      setPageCache('kollabrix_hackathons_v3', deduped);

      // 6. Load saved bookmarks and enrolled hackathons if logged in
      if (user && isSupabaseConfigured()) {
        const { data: saved } = await supabase
          .from('saved_hackathons')
          .select('hackathon_id')
          .eq('user_id', user.id);

        if (saved) {
          setSavedIds(saved.map((s) => s.hackathon_id));
        }

        const { data: joined } = await supabase
          .from('hackathon_participants')
          .select('hackathon_id')
          .eq('user_id', user.id);

        if (joined) {
          setEnrolledIds(joined.map((j) => j.hackathon_id));
        }
      } else if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('teamforge_saved_hackathons');
        if (stored) {
          setSavedIds(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.warn('Error loading hackathons:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();

    const handleDeletedEvent = () => {
      loadHackathons();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('teamforge_hackathon_deleted', handleDeletedEvent);
      window.addEventListener('teamforge_hackathon_restored', handleDeletedEvent);
      window.addEventListener('teamforge_hackathon_updated', handleDeletedEvent);
      window.addEventListener('storage', handleDeletedEvent);
      return () => {
        window.removeEventListener('teamforge_hackathon_deleted', handleDeletedEvent);
        window.removeEventListener('teamforge_hackathon_restored', handleDeletedEvent);
        window.removeEventListener('teamforge_hackathon_updated', handleDeletedEvent);
        window.removeEventListener('storage', handleDeletedEvent);
      };
    }
  }, [user]);

  // Toggle Save / Bookmark
  const handleToggleSave = async (hackathonId: string) => {
    const isCurrentlySaved = savedIds.includes(hackathonId);
    const updated = isCurrentlySaved
      ? savedIds.filter((id) => id !== hackathonId)
      : [...savedIds, hackathonId];

    setSavedIds(updated);

    if (isSupabaseConfigured() && user) {
      try {
        if (isCurrentlySaved) {
          await supabase
            .from('saved_hackathons')
            .delete()
            .eq('user_id', user.id)
            .eq('hackathon_id', hackathonId);
        } else {
          await supabase.from('saved_hackathons').insert({
            user_id: user.id,
            hackathon_id: hackathonId,
          });
        }
      } catch (e) {
        console.warn('Failed to sync saved hackathon:', e);
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('teamforge_saved_hackathons', JSON.stringify(updated));
    }
  };

  // Collect unique themes for filter dropdown
  const availableThemes = useMemo(() => {
    const set = new Set<string>();
    hackathons.forEach((h) => h.themes?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [hackathons]);

  // Hackathons hosted by this user as Faculty / Organizer (Managed strictly in Faculty Desk)
  const myHostedHackathons = useMemo(() => {
    if (!user?.id) return [];
    return hackathons.filter((h) => h.creator_id === user.id);
  }, [hackathons, user?.id]);

  // Private hackathons list (Excludes user's hosted events)
  const privateHackathons = useMemo(() => {
    return hackathons.filter((h) => h.access_type === 'private' && (!user?.id || h.creator_id !== user.id));
  }, [hackathons, user?.id]);

  // Corporate / Sponsored hackathons list (Excludes user's hosted events)
  const corporateHackathons = useMemo(() => {
    return hackathons.filter((h) => extractSponsoredMeta(h).isSponsored && (!user?.id || h.creator_id !== user.id));
  }, [hackathons, user?.id]);

  // Free / Standard Collegiate Competitions list
  // Note: Faculty-hosted events are filtered out for the host so they manage them via Faculty Desk
  const competitionHackathons = useMemo(() => {
    return hackathons.filter(
      (h) => !extractSponsoredMeta(h).isSponsored && h.access_type !== 'private' && (!user?.id || h.creator_id !== user.id)
    );
  }, [hackathons, user?.id]);

  // Helper: check if a hackathon is concluded / past
  const isPastEvent = (h: Hackathon): boolean => {
    if (!h) return false;
    const status = (h.status || '').toLowerCase();
    if (status === 'archived' || status === 'ended' || status === 'completed' || status === 'closed') {
      return true;
    }

    // 1. If official results are published, it is automatically a PAST event!
    if (h.results_published) {
      return true;
    }

    // 2. Extract results_date from all available properties or embedded HACKATHON_META
    let resDate = h.results_date || (h as any).resultsDate || (h as any).result_date;
    if (!resDate && h.description && h.description.includes('HACKATHON_META:')) {
      try {
        const match = h.description.match(/<!-- HACKATHON_META:(.*?) -->/);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          if (parsed.results_date) resDate = parsed.results_date;
          if (parsed.results_published) return true;
        }
      } catch {}
    }

    // 3. If result announcement date & time has arrived, it is automatically PAST!
    if (resDate) {
      const resTime = new Date(resDate).getTime();
      if (!isNaN(resTime) && Date.now() >= resTime) {
        return true;
      }
    }

    return isHackathonClosed(h) || isHackathonArchivedFromFeed(h);
  };

  // Tab-scoped hackathons for real-time live vs past counters
  const tabScopedHackathons = useMemo(() => {
    return hackathons.filter((h) => {
      // Never show user's own hosted hackathons in student feed tabs
      if (user?.id && h.creator_id === user.id) return false;

      const isSponsored = extractSponsoredMeta(h).isSponsored;
      const isPrivate = h.access_type === 'private';

      if (activeTab === 'all') {
        if (isSponsored) return false;
        if (isPrivate) return false;
      } else if (activeTab === 'corporate') {
        if (!isSponsored) return false;
      } else if (activeTab === 'private') {
        if (!isPrivate) return false;
      } else if (activeTab === 'my-events') {
        if (!enrolledIds.includes(h.id)) return false;
      } else if (activeTab === 'saved') {
        if (!savedIds.includes(h.id)) return false;
      }
      return true;
    });
  }, [hackathons, activeTab, enrolledIds, savedIds, user?.id]);

  const liveCount = useMemo(() => {
    return tabScopedHackathons.filter((h) => !isPastEvent(h) && !isHackathonArchivedFromFeed(h)).length;
  }, [tabScopedHackathons]);

  const pastCount = useMemo(() => {
    return tabScopedHackathons.filter((h) => isPastEvent(h)).length;
  }, [tabScopedHackathons]);

  // Set default tab on load if only sponsored events exist
  useEffect(() => {
    if (!hasUserSelectedTab && hackathons.length > 0) {
      const hasCompetitions = hackathons.some(
        (h) => !extractSponsoredMeta(h).isSponsored && h.access_type !== 'private' && (!user?.id || h.creator_id !== user.id)
      );
      if (!hasCompetitions) {
        setActiveTab('corporate');
      }
    }
  }, [hackathons, hasUserSelectedTab, user?.id]);

  // Filtered list based on active tab, timeline (live vs past), and search filters
  const filteredHackathons = useMemo(() => {
    const now = new Date();

    return hackathons
      .filter((h) => {
        // Faculty host exclusion: never display hosted hackathon in student browsing feed for the host
        if (user?.id && h.creator_id === user.id) return false;

        const isSponsored = extractSponsoredMeta(h).isSponsored;
        const isPrivate = h.access_type === 'private';

        // Tab filter: Strict segregation between Competition, Sponsored, and Private
        if (activeTab === 'all') {
          // "Competition" tab: ONLY normal free collegiate competitions (exclude sponsored & other private events)
          if (isSponsored) return false;
          if (isPrivate) return false;
        } else if (activeTab === 'corporate') {
          // "Sponsored" tab: ONLY company sponsored hackathons
          if (!isSponsored) return false;
        } else if (activeTab === 'private') {
          // "Private Campus Events" tab: ONLY private passcoded campus events
          if (!isPrivate) return false;
        } else if (activeTab === 'my-events') {
          if (!enrolledIds.includes(h.id)) return false;
        } else if (activeTab === 'saved') {
          if (!savedIds.includes(h.id)) return false;
        }

        // Timeline filter: Live & Upcoming vs Past Events
        const isPast = isPastEvent(h);
        if (timelineFilter === 'live') {
          if (isPast) return false;
          // Disappear from public college directory the day after results are announced
          if (activeTab !== 'my-events' && isHackathonArchivedFromFeed(h)) return false;
        } else if (timelineFilter === 'past') {
          if (!isPast) return false;
        }

        // Deadline filter (only applied in live view)
        if (onlyOpen && timelineFilter === 'live') {
          const deadline = new Date(h.registration_deadline);
          if (deadline < now) return false;
        }

        // Mode filter
        if (selectedMode !== 'All' && h.mode !== selectedMode) return false;

        // Theme filter
        if (selectedTheme !== 'All') {
          const hasTheme = h.themes?.some((t) => t.toLowerCase() === selectedTheme.toLowerCase());
          if (!hasTheme) return false;
        }

        // Keyword search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = h.title.toLowerCase().includes(q);
          const orgMatch = h.organizer.toLowerCase().includes(q);
          const descMatch = h.description.toLowerCase().includes(q);
          const themeMatch = h.themes?.some((t) => t.toLowerCase().includes(q));
          if (!titleMatch && !orgMatch && !descMatch && !themeMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Concluded events sort with newest finish first
        if (timelineFilter === 'past') {
          const dateA = new Date(a.end_date || a.registration_deadline || a.created_at).getTime();
          const dateB = new Date(b.end_date || b.registration_deadline || b.created_at).getTime();
          return dateB - dateA;
        }

        const metaA = extractSponsoredMeta(a);
        const metaB = extractSponsoredMeta(b);

        // Corporate/Sponsored challenges always appear at the top in All Competitions & Corporate view
        if (metaA.isSponsored && !metaB.isSponsored) return -1;
        if (!metaA.isSponsored && metaB.isSponsored) return 1;

        // If both sponsored, sort by priorityRank descending (10 down to 1)
        if (metaA.isSponsored && metaB.isSponsored) {
          if (metaA.priorityRank !== metaB.priorityRank) {
            return metaB.priorityRank - metaA.priorityRank;
          }
        }

        // Default sorting by start date / registration deadline
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });
  }, [hackathons, activeTab, timelineFilter, savedIds, enrolledIds, user, onlyOpen, selectedMode, selectedTheme, searchQuery]);

  return (
    <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-10 space-y-8">
      {/* Top Header */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
      >
        <div>
          <div
            style={{ color: theme.brandColor }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>{theme.hackathonsBadgeText || 'Campus Innovation Hub'}</span>
          </div>
          <h1
            style={{ color: theme.headingColor }}
            className="text-2xl sm:text-4xl font-black tracking-tight"
          >
            {theme.hackathonsTitle || 'Collegiate Hackathons'}
          </h1>
          <p
            style={{ color: theme.bodyTextColor }}
            className="mt-1.5 text-xs sm:text-sm max-w-2xl font-medium opacity-80"
          >
            {theme.hackathonsSubtitle || 'Explore college hackathons, form student teams with campus teammates, and compete in private university challenges or national tournaments.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadHackathons}
            className="border-slate-300 hover:bg-slate-100 text-slate-800 font-bold"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Events
          </Button>

          {isTeacherOrAdmin && (
            <Link href="/teacher/dashboard?tab=hackathons">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold"
                leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
              >
                Faculty Desk
              </Button>
            </Link>
          )}

          {isTeacherOrAdmin && (
            <Link href="/hackathons/new">
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
                className="text-white font-bold shadow-xs transition-all cursor-pointer"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Host College Hackathon
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Faculty Organizer Notice: When faculty hosts a hackathon, they manage it from Faculty Desk */}
      {myHostedHackathons.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/35 flex items-center justify-between gap-4 flex-wrap shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Faculty Organizer Desk
                </h4>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {myHostedHackathons.length} Hosted Hackathon{myHostedHackathons.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                You are hosting {myHostedHackathons.map((h) => `“${h.title}”`).join(', ')}. Your hosted hackathons are managed exclusively from your <strong className="text-amber-400">Faculty Desk</strong> so you can easily review student teams, grade submissions, and publish official results.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/teacher/dashboard?tab=hackathons">
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open Faculty Desk
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setHasUserSelectedTab(true);
              setActiveTab('all');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Competition ({competitionHackathons.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setHasUserSelectedTab(true);
              setActiveTab('corporate');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'corporate'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-lg ring-2 ring-amber-400/50'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 shadow-2xs'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'corporate' ? 'fill-current text-amber-200' : 'text-amber-600'}`} />
            <span>Sponsored ({corporateHackathons.length})</span>
            {corporateHackathons.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setHasUserSelectedTab(true);
              setActiveTab('private');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'private'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private Campus Events ({privateHackathons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHasUserSelectedTab(true);
              setActiveTab('my-events');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'my-events'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Enrolled Events ({enrolledIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHasUserSelectedTab(true);
              setActiveTab('saved');
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Events ({savedIds.length})</span>
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer self-start sm:self-auto shrink-0">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <span>Open for Registration Only</span>
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hackathons by name, theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="All">All Formats (Online & In-Person)</option>
            <option value="Online">Online / Virtual</option>
            <option value="In-Person">In-Person (Campus)</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          {/* Theme Filter */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="All">All Domains & Themes</option>
            {availableThemes.map((th) => (
              <option key={th} value={th}>
                Theme: {th}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 pt-1 font-medium">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900 font-black">{filteredHackathons.length}</strong> event
              {filteredHackathons.length !== 1 ? 's' : ''}
            </span>
            {(searchQuery || selectedMode !== 'All' || selectedTheme !== 'All' || onlyOpen) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMode('All');
                  setSelectedTheme('All');
                  setOnlyOpen(false);
                }}
                className="text-violet-600 hover:text-violet-700 font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* 3D Dark Orange Live vs Past Toggle Switch Button (matches video design: recessed track, amber bloom, 3D metallic thumb) */}
          <div className="flex items-center justify-end">
            <ThreeDOrangeSwitch
              isPast={timelineFilter === 'past'}
              onToggle={(past) => setTimelineFilter(past ? 'past' : 'live')}
              liveCount={liveCount}
              pastCount={pastCount}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Container with Blur-to-Focus Stack */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-900/40 p-2 sm:p-4 shadow-xs overflow-hidden">
        {/* Blur Curtains for Upper & Lower Margins */}
        <div className="scroll-blur-curtain-top" />
        <div className="scroll-blur-curtain-bottom" />

        {/* Hackathons Viewport with Blur-to-Focus Mask */}
        <div className="tech-scroll-viewport blur-focus-scroll px-1 py-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, n) => (
                <HackathonCardSkeleton key={n} />
              ))}
            </div>
          ) : filteredHackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHackathons.map((hackathon, idx) => (
                <div
                  key={hackathon.id}
                  className="blur-to-focus-card"
                  style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                >
                  <HackathonCard
                    hackathon={hackathon}
                    isSaved={savedIds.includes(hackathon.id)}
                    isEnrolled={enrolledIds.includes(hackathon.id) && hackathon.creator_id !== user?.id}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-4 shadow-sm my-6 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
                {myHostedHackathons.length > 0 && activeTab === 'all' ? (
                  <GraduationCap className="w-6 h-6 text-amber-500" />
                ) : activeTab === 'private' ? (
                  <Lock className="w-6 h-6 text-amber-500" />
                ) : (
                  <Trophy className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {myHostedHackathons.length > 0 && activeTab === 'all'
                  ? 'Your Hosted Hackathon is Live on Campus!'
                  : activeTab === 'corporate'
                  ? 'No Sponsored Hackathons Found'
                  : activeTab === 'private'
                  ? 'No Private Campus Hackathons Found'
                  : activeTab === 'my-events'
                  ? "You Haven't Enrolled in Any Hackathons Yet"
                  : 'No Collegiate Competitions Available'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-medium">
                {myHostedHackathons.length > 0 && activeTab === 'all'
                  ? `As the faculty organizer, your event ${myHostedHackathons.map((h) => `“${h.title}”`).join(', ')} is live for student registrations and team formation. Manage student teams, challenges, and evaluations from your Faculty Desk.`
                  : activeTab === 'corporate'
                  ? 'Corporate and enterprise sponsored challenges with cash prize pools and direct hiring tracks will appear here.'
                  : activeTab === 'private'
                  ? 'Have an access passcode or link from your professor? Use the passcode portal at the top to enter your campus event.'
                  : activeTab === 'my-events'
                  ? 'Enter an event join code or browse open competitions to participate with campus teammates.'
                  : isTeacherOrAdmin
                  ? 'Faculty-hosted college hackathons and open student competitions will appear here. Click "Sponsored" to view enterprise challenges, or host a new college hackathon!'
                  : 'Faculty-hosted college hackathons and open student competitions will appear here. Click "Sponsored" to view enterprise challenges, or check back soon for campus competitions!'}
              </p>
              {myHostedHackathons.length > 0 && activeTab === 'all' ? (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Link href="/teacher/dashboard?tab=hackathons">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                      leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                    >
                      Open Faculty Desk
                    </Button>
                  </Link>
                  <Link href="/hackathons/new">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold"
                      leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                    >
                      Host Another Hackathon
                    </Button>
                  </Link>
                </div>
              ) : activeTab === 'all' && corporateHackathons.length > 0 ? (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setHasUserSelectedTab(true);
                      setActiveTab('corporate');
                    }}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-bold text-xs"
                    leftIcon={<Zap className="w-3.5 h-3.5" />}
                  >
                    View Sponsored Challenges ({corporateHackathons.length})
                  </Button>
                  {isTeacherOrAdmin && (
                    <Link href="/hackathons/new">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold"
                        leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                      >
                        Host College Hackathon
                      </Button>
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Create / Host Hackathon Modal */}
      <CreateHackathonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newHack) => {
          setHackathons((prev) => [newHack, ...prev]);
        }}
      />
    </div>
  );
}
