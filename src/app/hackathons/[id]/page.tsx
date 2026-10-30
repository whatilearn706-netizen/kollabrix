'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Hackathon } from '@/types/database';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { normalizeHackathonDeadlines } from '@/lib/hackathons/hackathonStatus';
import { Button } from '@/components/ui/Button';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Users,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Layers,
  Award,
  Zap,
  HelpCircle,
  Code2,
  Send,
  UserPlus,
} from 'lucide-react';

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const { theme, isDark } = useSiteTheme();
  const hackathonId = (params?.id as string) || '';

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'themes' | 'schedule' | 'rules'>('overview');

  // Load Hackathon details with maximum resilience
  const loadHackathon = useCallback(async () => {
    if (!hackathonId) return;
    setIsLoading(true);
    setError(null);

    const cleanId = hackathonId.trim();

    try {
      // 0. Check admin deleted cache
      let deletedSet = new Set<string>();
      try {
        const hRes = await fetch(`/api/hackathons?_t=${Date.now()}`, { cache: 'no-store' });
        const hData = await hRes.json();
        const dIds: string[] = hData?.deletedIds || [];
        const dTitles: string[] = hData?.deletedTitles || [];
        deletedSet = new Set([...dIds, ...dTitles].map((id: string) => id.trim().toLowerCase()));
        if (deletedSet.has(cleanId.toLowerCase())) {
          setError('This hackathon has been removed.');
          setIsLoading(false);
          return;
        }
      } catch {}

      let currentHack: Hackathon | null = null;
      const isParamUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

      // 1. Fetch from Supabase
      if (isSupabaseConfigured()) {
        try {
          if (isParamUUID) {
            const { data: hackData } = await supabase
              .from('hackathons')
              .select('*')
              .eq('id', cleanId)
              .maybeSingle();

            if (hackData) currentHack = hackData as Hackathon;
          } else {
            // Check join code or custom id
            const { data: hackDataByCode } = await supabase
              .from('hackathons')
              .select('*')
              .eq('join_code', cleanId)
              .maybeSingle();

            if (hackDataByCode) currentHack = hackDataByCode as Hackathon;
          }
        } catch (err) {
          console.warn('Error fetching hackathon from Supabase:', err);
        }
      }

      // 2. Check LocalStorage created hackathons
      if (!currentHack && typeof window !== 'undefined') {
        try {
          const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const match = localHacks.find((h: any) => h.id === cleanId || h.join_code === cleanId);
          if (match) currentHack = match;
        } catch {}
      }

      // 3. Fallback to CURATED_HACKATHONS
      if (!currentHack) {
        const curated = CURATED_HACKATHONS.find(
          (ch) => ch.id === cleanId || ch.join_code === cleanId || ch.id.toLowerCase() === cleanId.toLowerCase()
        );
        if (curated) currentHack = curated as Hackathon;
      }

      if (!currentHack) {
        setError('Hackathon not found. It may have expired or been removed.');
        setIsLoading(false);
        return;
      }

      // Strip metadata comments if present
      if (currentHack.description?.includes('<!-- HACKATHON_META:')) {
        try {
          const metaMatch = currentHack.description.match(/<!-- HACKATHON_META:([\s\S]*?)-->/);
          if (metaMatch && metaMatch[1]) {
            const meta = JSON.parse(metaMatch[1]);
            currentHack = {
              ...currentHack,
              min_team_size: meta.min_team_size || currentHack.min_team_size || 1,
              max_team_size: meta.max_team_size || currentHack.max_team_size || 4,
              access_type: meta.access_type || currentHack.access_type || 'public',
              join_code: meta.join_code || currentHack.join_code,
              description: currentHack.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim(),
            };
          }
        } catch {}
      }

      currentHack = normalizeHackathonDeadlines(currentHack);
      setHackathon(currentHack);

      // Check enrollment status
      if (typeof window !== 'undefined') {
        try {
          const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
          if (
            enrolled.includes(currentHack.id) ||
            (currentHack.join_code && enrolled.includes(currentHack.join_code))
          ) {
            setIsEnrolled(true);
          }

          const saved = JSON.parse(localStorage.getItem('teamforge_saved_hackathons') || '[]');
          if (saved.includes(currentHack.id)) {
            setIsSaved(true);
          }
        } catch {}
      }

      if (user && isSupabaseConfigured() && currentHack.id) {
        try {
          const { data: participant } = await supabase
            .from('hackathon_participants')
            .select('id')
            .eq('hackathon_id', currentHack.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (participant) {
            setIsEnrolled(true);
          }
        } catch {}
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading hackathon');
    } finally {
      setIsLoading(false);
    }
  }, [hackathonId, user]);

  useEffect(() => {
    loadHackathon();
  }, [loadHackathon]);

  // Deadline countdown calculations
  const countdown = useMemo(() => {
    if (!hackathon) return { days: 0, hours: 0, isClosed: false, isUrgent: false };
    const deadline = new Date(hackathon.registration_deadline).getTime();
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, isClosed: true, isUrgent: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isUrgent = days <= 7;

    return { days, hours, isClosed: false, isUrgent };
  }, [hackathon]);

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Toggle Save
  const handleToggleSave = () => {
    if (!hackathon) return;
    try {
      const saved = JSON.parse(localStorage.getItem('teamforge_saved_hackathons') || '[]');
      let updated: string[];
      if (saved.includes(hackathon.id)) {
        updated = saved.filter((id: string) => id !== hackathon.id);
        setIsSaved(false);
      } else {
        updated = [...saved, hackathon.id];
        setIsSaved(true);
      }
      localStorage.setItem('teamforge_saved_hackathons', JSON.stringify(updated));
    } catch {}
  };

  // Handle Register / Join Hackathon
  const handleRegister = async () => {
    if (!user) {
      if (openAuthModal) {
        openAuthModal('signup');
      } else {
        router.push(`/signup?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }

    if (!hackathon) return;

    // If private hackathon with join code, route to join code page
    if (hackathon.access_type === 'private' && hackathon.join_code) {
      router.push(`/h/${hackathon.join_code}`);
      return;
    }

    setIsRegistering(true);
    try {
      // 1. Record enrollment in localStorage for instantaneous access
      const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
      if (!enrolled.includes(hackathon.id)) {
        enrolled.push(hackathon.id);
      }
      if (hackathon.join_code && !enrolled.includes(hackathon.join_code)) {
        enrolled.push(hackathon.join_code);
      }
      localStorage.setItem('teamforge_enrolled_hackathons', JSON.stringify(enrolled));

      // 2. Insert into Supabase hackathon_participants if available
      if (isSupabaseConfigured() && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hackathon.id)) {
        try {
          await supabase.from('hackathon_participants').upsert(
            {
              hackathon_id: hackathon.id,
              user_id: user.id,
              role: 'Participant',
            },
            { onConflict: 'hackathon_id,user_id' }
          );
        } catch (dbErr) {
          console.warn('Participant DB upsert warning:', dbErr);
        }
      }

      setIsEnrolled(true);
      // Seamlessly navigate to the workspace
      router.push(`/hackathons/${hackathon.id}/workspace`);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Other curated hackathons to explore
  const relatedHackathons = useMemo(() => {
    if (!hackathon) return [];
    return CURATED_HACKATHONS.filter((h) => h.id !== hackathon.id).slice(0, 3);
  }, [hackathon]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 px-4 py-24">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
          Loading Hackathon Protocol & Details...
        </p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-md p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Hackathon Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || 'The requested hackathon could not be found or has concluded.'}
            </p>
          </div>
          <div className="pt-2">
            <Link href="/hackathons">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Explore Active Hackathons
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Top Banner Image or Gradient Hero */}
      <div className="relative w-full h-72 sm:h-96 overflow-hidden border-b border-charcoal-800">
        {hackathon.banner_url ? (
          <img
            src={hackathon.banner_url}
            alt={hackathon.title}
            className="w-full h-full object-cover filter brightness-75 scale-102"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-violet-600/10 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Top Floating Navigation */}
        <div className="absolute top-6 inset-x-0 max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between z-20">
          <Link
            href="/hackathons"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-900/80 backdrop-blur-md border border-charcoal-700 text-xs font-semibold text-slate-300 hover:text-white hover:border-charcoal-600 transition-all shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Hackathons</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                isSaved
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-charcoal-900/80 border-charcoal-700 text-slate-300 hover:text-white hover:border-charcoal-600'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Hackathon'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 rounded-full bg-charcoal-900/80 backdrop-blur-md border border-charcoal-700 text-slate-300 hover:text-white hover:border-charcoal-600 transition-all"
              title="Share Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute bottom-6 inset-x-0 max-w-6xl mx-auto px-4 sm:px-6 z-20">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                  hackathon.mode === 'Online'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : hackathon.mode === 'In-Person'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                }`}
              >
                {hackathon.mode} Sprint
              </span>

              {hackathon.is_verified && (
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Collegiate Challenge</span>
                </span>
              )}

              {hackathon.access_type === 'private' && (
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Invite Only</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {hackathon.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
              <span>Organized by</span>
              <strong className="text-white font-bold">{hackathon.organizer}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-md">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Dates
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {new Date(hackathon.start_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  –{' '}
                  {hackathon.end_date
                    ? new Date(hackathon.end_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'TBA'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Location
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {hackathon.location || 'Online Virtual'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Team Size
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {hackathon.min_team_size || 1} – {hackathon.max_team_size || 4} Builders
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Prize Pool
                </span>
                <span className="text-xs font-bold text-amber-400 block truncate flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 shrink-0" />
                  <span>{hackathon.prize_pool || 'Prizes & Badges'}</span>
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-charcoal-800 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'overview'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'themes'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Themes & Tracks ({hackathon.themes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Schedule & Milestones
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'rules'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rules & Eligibility
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>About the Hackathon</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
                    <p>{hackathon.description}</p>
                  </div>
                </div>

                {/* Team Formation Highlight */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/60 to-charcoal-900 border border-violet-800/40 space-y-3">
                  <div className="flex items-center gap-2.5 text-violet-300">
                    <Users className="w-5 h-5 text-violet-400" />
                    <h4 className="text-sm font-bold text-white">Assemble Your Dream Team on Kollabrix</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Looking for a frontend designer, smart-contract developer, or AI engineer to team up with for {hackathon.title}? Connect with vetted collegiate builders on our matchmaking roster.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <Link href={`/teammates?hackathon=${encodeURIComponent(hackathon.title)}`}>
                      <Button variant="secondary" size="sm" leftIcon={<UserPlus className="w-4 h-4 text-violet-400" />}>
                        Find Teammates
                      </Button>
                    </Link>
                    <Link href="/projects/new">
                      <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
                        Post Squad Request
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-brand-400" />
                      <span>Official Tracks & Innovation Themes</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Projects submitted must address one or more of the following challenge themes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(hackathon.themes || ['Open Innovation', 'AI & Automation', 'Collegiate Web']).map(
                      (theme, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-start gap-3 hover:border-charcoal-700 transition-all"
                        >
                          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{theme}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Solve critical problems and ship high-impact collegiate solutions in this track.
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span>Official Timeline & Milestones</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Stay aligned with key submission cut-offs, mentor reviews, and jury evaluations.
                  </p>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-charcoal-800">
                  {/* Step 1: Registration Deadline */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-brand-500 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      1
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Registration Deadline</h4>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">
                          {new Date(hackathon.registration_deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        All builders must register and finalize squad rosters before this deadline.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Hackathon Kickoff */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      2
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Hackathon Opening Ceremony & Sprint Start</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {new Date(hackathon.start_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Hacking commences! Access workspace boards, mentor sprint huddles, and challenge briefs.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Project Submissions */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-purple-500 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      3
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Deliverable Submission Deadline</h4>
                        <span className="text-[10px] font-mono text-purple-400 font-semibold">
                          {hackathon.end_date
                            ? new Date(hackathon.end_date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Sprint Finale'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Submit repository link, architecture demo video, and interactive prototype for jury review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Rules & Eligibility Requirements</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Compliance criteria required for official collegiate credential verification.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Eligibility</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      {hackathon.eligibility || 'Open to all enrolled university and college students with valid institutional credentials.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-brand-400" />
                      <span>Code Originality & Plagiarism Policy</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      All core project code must be developed during the hackathon period. Pre-existing libraries and public APIs are permitted provided they are documented in your README and architecture breakdown.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span>Team Composition</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      Teams must consist of {hackathon.min_team_size || 1} to {hackathon.max_team_size || 4} verified students. Cross-disciplinary teams (engineers + product designers) are strongly encouraged.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Registration Card & Action Hub */}
          <div className="space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-2xl space-y-6 sticky top-24">
              {/* Prize Pool Highlight */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  Total Prize Pool
                </span>
                <span className="text-xl sm:text-2xl font-black text-white block">
                  {hackathon.prize_pool || 'Prizes & Recognition'}
                </span>
              </div>

              {/* Registration Deadline Countdown Card */}
              <div className="space-y-2 text-center">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  {countdown.isClosed ? 'Registration Status' : 'Registration Closes In'}
                </span>
                {countdown.isClosed ? (
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold text-xs inline-block">
                    Registration Closed
                  </span>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-slate-200">
                    <div className="px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-800">
                      <span className="text-lg font-black text-white block">{countdown.days}</span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Days</span>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-800">
                      <span className="text-lg font-black text-white block">{countdown.hours}</span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase">Hours</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-3 pt-2">
                {isEnrolled ? (
                  <Link href={`/hackathons/${hackathon.id}/workspace`} className="block">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full justify-center shadow-lg shadow-amber-500/20"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Enter Team Workspace
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleRegister}
                    isLoading={isRegistering}
                    variant="primary"
                    size="lg"
                    className="w-full justify-center shadow-lg shadow-amber-500/20"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {user ? 'Register for Hackathon' : 'Sign Up to Register'}
                  </Button>
                )}

                {hackathon.website_url && (
                  <a
                    href={hackathon.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full justify-center"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Official Event Site
                    </Button>
                  </a>
                )}
              </div>

              {/* Verified Trust Guarantees */}
              <div className="pt-4 border-t border-charcoal-800 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Verified Collegiate Credentials & Proof of Work</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-Time Team Workspace & Closer Pitch Deck Kit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Jury Evaluation & Digital Certificate on Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Curated Hackathons Section */}
        {relatedHackathons.length > 0 && (
          <div className="pt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">More Upcoming Hackathons</h3>
                <p className="text-xs text-slate-400">
                  Explore other high-caliber national and collegiate challenges.
                </p>
              </div>
              <Link href="/hackathons">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedHackathons.map((h) => (
                <Link
                  key={h.id}
                  href={`/hackathons/${h.id}`}
                  className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">{h.mode}</span>
                    <span className="text-slate-400 truncate max-w-[120px]">{h.organizer}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {h.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {h.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-charcoal-800 text-slate-300">
                    <span className="font-mono text-amber-400 font-bold truncate max-w-[140px]">
                      {h.prize_pool || 'Prizes'}
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-white flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
