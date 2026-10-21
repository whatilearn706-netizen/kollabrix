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
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { CreateHackathonModal } from '@/components/hackathons/CreateHackathonModal';
import { HackathonCardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getPageCache, setPageCache } from '@/lib/cache/pageDataCache';

export default function HackathonsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { theme } = useSiteTheme();
  const isTeacherOrAdmin =
    profile?.role === 'teacher' ||
    profile?.role === 'admin' ||
    profile?.faculty_verified;

  // Instant In-Memory / Stale-While-Revalidate Cache
  const cachedHackathons = getPageCache<Hackathon[]>('linkora_hackathons_list');

  const [hackathons, setHackathons] = useState<Hackathon[]>(() => cachedHackathons || []);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'my-events' | 'saved'>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [onlyOpen, setOnlyOpen] = useState(false);

  // Quick Join Code Input
  const [quickJoinCode, setQuickJoinCode] = useState('');
  const [quickJoinError, setQuickJoinError] = useState<string | null>(null);

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

      // 1. Fetch authoritative active hackathons and deleted tombstone IDs from server API with cache busting
      try {
        const res = await fetch(`/api/hackathons?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
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

      // 3. Merge browser localStorage deleted registry if any
      if (typeof window !== 'undefined') {
        try {
          const localDeleted: string[] = JSON.parse(localStorage.getItem('teamforge_deleted_hackathons') || '[]');
          deletedIdsList.push(...localDeleted);
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

        return (
          (id && deletedSet.has(id)) ||
          (joinCode && deletedSet.has(joinCode)) ||
          (title && (deletedSet.has(title) || deletedTitlesSet.has(title))) ||
          (webCode && deletedSet.has(webCode))
        );
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

      // 5. Combine and deduplicate surviving hackathons
      const seenIds = new Set<string>();
      const deduped: Hackathon[] = [];

      const candidateList = activeList.length > 0 ? [...localHacks, ...activeList] : [...localHacks, ...CURATED_HACKATHONS];

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
      setPageCache('linkora_hackathons_list', deduped);

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
      window.addEventListener('storage', handleDeletedEvent);
      return () => {
        window.removeEventListener('teamforge_hackathon_deleted', handleDeletedEvent);
        window.removeEventListener('teamforge_hackathon_restored', handleDeletedEvent);
        window.removeEventListener('storage', handleDeletedEvent);
      };
    }
  }, [user]);

  // Handle Quick Join Submit
  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickJoinError(null);

    if (!quickJoinCode.trim()) {
      setQuickJoinError('Please enter a hackathon join code or link.');
      return;
    }

    let code = quickJoinCode.trim();
    if (code.includes('/h/')) {
      code = code.split('/h/')[1];
    }
    code = code.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();

    if (!code) {
      setQuickJoinError('Invalid hackathon join code.');
      return;
    }

    router.push(`/h/${code}`);
  };

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

  // Private hackathons list
  const privateHackathons = useMemo(() => {
    return hackathons.filter((h) => h.access_type === 'private');
  }, [hackathons]);

  // Filtered list based on active tab and filters
  const filteredHackathons = useMemo(() => {
    const now = new Date();

    return hackathons.filter((h) => {
      // Tab filter
      if (activeTab === 'private' && h.access_type !== 'private') return false;
      if (activeTab === 'my-events' && !enrolledIds.includes(h.id) && h.creator_id !== user?.id) return false;
      if (activeTab === 'saved' && !savedIds.includes(h.id)) return false;

      // Deadline filter
      if (onlyOpen) {
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
    });
  }, [hackathons, activeTab, savedIds, enrolledIds, user, onlyOpen, selectedMode, selectedTheme, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
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

          {user && (
            <Link href="/hackathons/new">
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
                className="text-white font-bold shadow-xs transition-all"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Host College Hackathon
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PRIVATE COLLEGE HACKATHON SECTION / QUICK ACCESS HUB */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
              <span className="p-1 rounded bg-amber-100 border border-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-900" />
              </span>
              <span>Private College Hackathon Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Join Campus Hackathons with Your Teammates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Did your professor or college department announce a private hackathon? Enter your event join code or link to unlock problem statements, register your team, and submit project deliverables.
            </p>
          </div>

          {/* Quick Join Passcode Form */}
          <form
            onSubmit={handleQuickJoin}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:max-w-md shrink-0"
          >
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Join Code (e.g. col-apex26 or /h/...)"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-slate-900 hover:bg-black text-white font-bold whitespace-nowrap py-2.5 shadow-xs"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Enter Passcode
            </Button>
          </form>
        </div>

        {quickJoinError && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{quickJoinError}</span>
          </div>
        )}

        {/* Quick Suggestion Chips if Private Hackathons Exist */}
        {privateHackathons.length > 0 && (
          <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-600 font-bold">Active Campus Events:</span>
            {privateHackathons.map((ph) => (
              <button
                key={ph.id}
                type="button"
                onClick={() => {
                  if (ph.join_code) {
                    router.push(`/h/${ph.join_code}`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold font-mono transition-colors shadow-xs"
              >
                <Lock className="w-3 h-3 text-amber-600" />
                <span>{ph.title}</span>
                <span className="text-[10px] text-slate-500">({ph.join_code})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Competitions ({hackathons.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'private'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private College Events ({privateHackathons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-events')}
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
            onClick={() => setActiveTab('saved')}
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

        <div className="flex items-center justify-between text-xs text-slate-600 pt-1 font-medium">
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
              className="text-violet-600 hover:text-violet-700 font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Hackathons Grid Container - Clean, Minimal & Spacious */}
      <div className="w-full">
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
                className="site-card-wrapper transition-all duration-200 hover:-translate-y-1"
                style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
              >
                <HackathonCard
                  hackathon={hackathon}
                  isSaved={savedIds.includes(hackathon.id)}
                  isEnrolled={enrolledIds.includes(hackathon.id) || hackathon.creator_id === user?.id}
                  onToggleSave={handleToggleSave}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-4 shadow-sm my-6 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
              {activeTab === 'private' ? <Lock className="w-6 h-6 text-amber-500" /> : <Trophy className="w-6 h-6" />}
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {activeTab === 'private'
                ? 'No Private College Hackathons Found'
                : activeTab === 'my-events'
                ? 'You Haven\'t Enrolled in Any Hackathons Yet'
                : 'No Hackathons Matched'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-medium">
              {activeTab === 'private'
                ? 'Have an access passcode or link from your professor? Use the passcode portal at the top to enter your campus event.'
                : activeTab === 'my-events'
                ? 'Enter an event join code or browse open competitions to participate with campus teammates.'
                : 'Try adjusting your search query or reset the theme filters to view all upcoming collegiate events.'}
            </p>
          </div>
        )}
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
