'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Hackathon, HackathonMode } from '@/types/database';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { CreateHackathonModal } from '@/components/hackathons/CreateHackathonModal';
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

export default function HackathonsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const isTeacherOrAdmin =
    profile?.role === 'teacher' ||
    profile?.role === 'admin' ||
    profile?.faculty_verified;

  const [hackathons, setHackathons] = useState<Hackathon[]>(CURATED_HACKATHONS);
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
  const [isLoading, setIsLoading] = useState(true);

  // Load hackathons from Supabase and saved bookmarks
  const loadHackathons = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data: dbHacks } = await supabase
          .from('hackathons')
          .select('*')
          .order('registration_deadline', { ascending: true });

        // Load locally authored hackathons if any
        let localHacks: Hackathon[] = [];
        if (typeof window !== 'undefined') {
          try {
            localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          } catch {}
        }

        const normalizedDbHacks = (dbHacks || []).map((h: any) => {
          let joinCode = h.join_code;
          let accessType = h.access_type;
          let cleanDesc = h.description || '';

          if (cleanDesc.includes('<!-- HACKATHON_META:')) {
            try {
              const metaStr = cleanDesc.split('<!-- HACKATHON_META:')[1].split('-->')[0];
              const meta = JSON.parse(metaStr);
              accessType = meta.access_type || accessType || 'private';
              joinCode = meta.join_code || joinCode;
              cleanDesc = cleanDesc.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim();
            } catch {}
          }

          if (!joinCode && h.website_url && h.website_url.includes('/h/')) {
            joinCode = h.website_url.split('/h/')[1]?.split(/[?#]/)[0];
            accessType = accessType || 'private';
          }

          return {
            ...h,
            description: cleanDesc,
            join_code: joinCode || h.join_code,
            access_type: accessType || (joinCode ? 'private' : h.access_type || 'public'),
          };
        });

        // Combine: locally created first, then remote DB, then curated catalog
        const combined = [...localHacks, ...normalizedDbHacks, ...CURATED_HACKATHONS];
        const seenIds = new Set<string>();
        const deduped: Hackathon[] = [];
        for (const item of combined) {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            if (item.join_code) seenIds.add(item.join_code);
            deduped.push(item as Hackathon);
          }
        }

        setHackathons(deduped.length > 0 ? deduped : CURATED_HACKATHONS);

        // Load saved bookmarks and enrolled hackathons if logged in
        if (user) {
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
        }
      } else {
        // Local storage fallback for saved items
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('teamforge_saved_hackathons');
          if (stored) {
            setSavedIds(JSON.parse(stored));
          }
        }
      }
    } catch (e) {
      console.warn('Error loading hackathons:', e);
      setHackathons(CURATED_HACKATHONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-midnight-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4" />
            <span>Campus Innovation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Collegiate Hackathons
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Explore college hackathons, form student teams with campus teammates, and compete in private university challenges or national tournaments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadHackathons}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Events
          </Button>

          {user && (
            <Link href="/hackathons/new">
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
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
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-500/10 via-midnight-900 to-indigo-950/20 border border-amber-500/30 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <span className="p-1 rounded bg-amber-500/20 border border-amber-500/30">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span>Private College Hackathon Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Join Campus Hackathons with Your Teammates
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Did your professor or college department announce a private hackathon? Enter your event join code or link to unlock problem statements, register your team, and submit project deliverables.
            </p>
          </div>

          {/* Quick Join Passcode Form */}
          <form
            onSubmit={handleQuickJoin}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:max-w-md shrink-0"
          >
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Join Code (e.g. col-apex26 or /h/...)"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-midnight-950 border border-midnight-700/80 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold whitespace-nowrap py-2.5"
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Enter Passcode
            </Button>
          </form>
        </div>

        {quickJoinError && (
          <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{quickJoinError}</span>
          </div>
        )}

        {/* Quick Suggestion Chips if Private Hackathons Exist */}
        {privateHackathons.length > 0 && (
          <div className="pt-2 border-t border-midnight-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Active Campus Events:</span>
            {privateHackathons.map((ph) => (
              <button
                key={ph.id}
                type="button"
                onClick={() => {
                  if (ph.join_code) {
                    router.push(`/h/${ph.join_code}`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-midnight-900/90 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>{ph.title}</span>
                <span className="text-[10px] text-slate-400">({ph.join_code})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-midnight-800 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-midnight-800 text-white shadow-subtle border border-midnight-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Competitions ({hackathons.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'private'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Private College Events ({privateHackathons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my-events')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'my-events'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>My Enrolled Events ({enrolledIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Events ({savedIds.length})</span>
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer self-start sm:self-auto shrink-0">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
            className="rounded bg-midnight-800 border-midnight-700 text-brand-500 focus:ring-0"
          />
          <span>Open for Registration Only</span>
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-midnight-900/90 border border-midnight-750 p-5 space-y-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hackathons by name, theme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
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
            className="w-full px-3 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="All">All Domains & Themes</option>
            {availableThemes.map((th) => (
              <option key={th} value={th}>
                Theme: {th}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredHackathons.length}</strong> event
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
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Hackathons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-midnight-900/80 border border-midnight-800 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredHackathons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => (
            <HackathonCard
              key={hackathon.id}
              hackathon={hackathon}
              isSaved={savedIds.includes(hackathon.id)}
              isEnrolled={enrolledIds.includes(hackathon.id) || hackathon.creator_id === user?.id}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-midnight-900/90 border border-midnight-750 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-midnight-800 border border-midnight-700 flex items-center justify-center mx-auto text-slate-400">
            {activeTab === 'private' ? <Lock className="w-6 h-6 text-amber-400" /> : <Trophy className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-white">
            {activeTab === 'private'
              ? 'No Private College Hackathons Found'
              : activeTab === 'my-events'
              ? 'You Haven\'t Enrolled in Any Hackathons Yet'
              : 'No Hackathons Matched'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'private'
              ? 'Have an access passcode or link from your professor? Use the passcode portal at the top to enter your campus event.'
              : activeTab === 'my-events'
              ? 'Enter an event join code or browse open competitions to participate with campus teammates.'
              : 'Try adjusting your search query or reset the theme filters to view all upcoming collegiate events.'}
          </p>
        </div>
      )}

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
