'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Swords,
  Trophy,
  Flame,
  Shield,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  Users,
  Lightbulb,
  Terminal,
  Crown,
  Search,
  Filter,
  ArrowRight,
  Zap,
  Lock,
} from 'lucide-react';
import {
  CampusWarConfig,
  DEFAULT_CAMPUS_WAR_CONFIG,
  WarMatch,
  WarPillar,
} from '@/types/campusWar';
import { useAuth } from '@/components/auth/AuthProvider';

export default function CampusWarPage() {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com';

  const [config, setConfig] = useState<CampusWarConfig>(DEFAULT_CAMPUS_WAR_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<'all' | WarPillar>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matches' | 'standings'>('matches');
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);

  // Challenge form state
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengePillar, setChallengePillar] = useState<WarPillar>('arena');
  const [challengerCollege, setChallengerCollege] = useState('');
  const [targetCollege, setTargetCollege] = useState('Open to All Campuses');
  const [bountyPoints, setBountyPoints] = useState(50);
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState(false);

  // Time remaining countdown
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 21,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch live Campus War configuration
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/campus-war?_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data?.config) {
          setConfig(data.config);
        }
      } catch (err) {
        console.warn('Campus war fetch note:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Update countdown clock
  useEffect(() => {
    const target = new Date(config.seasonEndDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [config.seasonEndDate]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return (config.matches || []).filter((m) => {
      const matchesPillar = selectedPillar === 'all' || m.pillar === selectedPillar;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.challengerCollege.toLowerCase().includes(q) ||
        m.targetCollege.toLowerCase().includes(q);
      return matchesPillar && matchesSearch;
    });
  }, [config.matches, selectedPillar, searchQuery]);

  // Pillar match counts
  const pillarCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: config.matches?.length || 0,
      arena: 0,
      hackathon: 0,
      problem: 0,
      icpc: 0,
    };
    (config.matches || []).forEach((m) => {
      if (counts[m.pillar] !== undefined) {
        counts[m.pillar]++;
      }
    });
    return counts;
  }, [config.matches]);

  // Handle student posting a challenge
  const handlePostChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim()) return;

    setIsSubmittingChallenge(true);
    try {
      const newMatch: WarMatch = {
        id: `match-student-${Date.now()}`,
        title: challengeTitle.trim(),
        pillar: challengePillar,
        challengerCollege: challengerCollege.trim() || 'Student Squad',
        challengerName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Challenger',
        targetCollege: targetCollege.trim() || 'Open to All Campuses',
        bountyPoints: Number(bountyPoints) || 50,
        stakes: `+${bountyPoints} War Pts • Open Community Duel`,
        status: 'open',
        actionUrl: challengePillar === 'arena' ? `/arena?room=KBX-WAR-${Math.floor(1000 + Math.random() * 9000)}` : '/hackathons',
        actionLabel: challengePillar === 'arena' ? '⚔️ Accept Duel' : '👥 Join Match',
        isPriorityShiny: false,
        createdAt: new Date().toISOString(),
      };

      setConfig((prev) => ({
        ...prev,
        matches: [newMatch, ...prev.matches],
      }));
      setIsChallengeModalOpen(false);
      setChallengeTitle('');
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  // If system is toggled off by Admin and user is not admin
  if (!config.isLive && !isAdmin) {
    return (
      <main className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
            <Swords className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              Collegiate Season Intermission
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus War Calibrating
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
              {config.maintenanceMessage}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/arena"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Practice in 1v1 Arena
            </Link>
            <Link
              href="/explore"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090E] text-slate-100 pb-24 pt-4 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Draft Mode Warning (If Offline) */}
        {!config.isLive && isAdmin && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>
                <strong>Admin Preview Notice:</strong> Campus War is currently set to <strong>OFFLINE</strong> in Control Center. Only you can view this page.
              </span>
            </div>
            <Link
              href="/control-center-7x9?tab=campus_war"
              className="text-xs font-mono font-bold underline hover:text-white"
            >
              Configure in Admin →
            </Link>
          </div>
        )}

        {/* 1. SPONSOR & PRIORITY COLLEGE SHINY SPOTLIGHT */}
        {config.sponsor?.enabled && (
          <div
            className={`relative rounded-2xl p-5 sm:p-6 transition-all overflow-hidden ${
              config.sponsor.isPriorityShiny
                ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-300/40'
                : 'bg-slate-900/70 border border-slate-800 shadow-lg'
            }`}
          >
            {config.sponsor.isPriorityShiny && (
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
            )}

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                {config.sponsor.logoUrl ? (
                  <div className="w-14 h-14 rounded-2xl bg-black/60 border border-amber-500/30 flex items-center justify-center p-2 shrink-0 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.sponsor.logoUrl}
                      alt={config.sponsor.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/50 flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{config.sponsor.badgeText || 'FEATURED PRIORITY PARTNER'}</span>
                    </span>
                    {config.sponsor.isPriorityShiny && (
                      <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-bold animate-pulse">
                        ⭐ VIP SPOTLIGHT
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {config.sponsor.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {config.sponsor.tagline}
                  </p>
                </div>
              </div>

              {config.sponsor.targetUrl && (
                <a
                  href={config.sponsor.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all shrink-0 cursor-pointer"
                >
                  <span>Visit Partner</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 2. CONTROLS: VIEW TOGGLE (MATCHES vs STANDINGS) & POST CHALLENGE */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-800">
          {/* Sub-view toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('matches')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                viewMode === 'matches'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>Active War Matches ({config.matches?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('standings')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                viewMode === 'standings'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Campus Standings ({config.standings?.length || 0})</span>
            </button>
          </div>

          {/* Right side: Season countdown summary & Post a Challenge */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-bold">{config.seasonName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">{timeLeft.days}d {timeLeft.hours}h left</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-300 font-bold">{config.totalPrizePool}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsChallengeModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Post Open Challenge</span>
            </button>
          </div>
        </div>

        {/* 3. VIEW: ACTIVE WAR MATCHES (2-COLUMN: VERTICAL PILLARS RAIL ON LEFT) */}
        {viewMode === 'matches' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start animate-fadeIn">
            {/* LEFT COLUMN: Vertical Category Cards ("battle arena hackathon faculty bounties icpc should be vertical left side so that i show in big") */}
            <aside className="w-full lg:w-80 xl:w-96 shrink-0 space-y-3">
              <div className="px-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                <span>War Arenas</span>
                <span className="text-amber-400 font-bold">{pillarCounts.all} Battles Live</span>
              </div>

              {/* 1. All Arenas */}
              <button
                type="button"
                onClick={() => setSelectedPillar('all')}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between gap-3.5 ${
                  selectedPillar === 'all'
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/5 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-300/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      selectedPillar === 'all'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-white/[0.04] border border-white/10 text-slate-300 group-hover:text-amber-300'
                    }`}
                  >
                    <Flame className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-black truncate ${selectedPillar === 'all' ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        All Battles
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      All collegiate challenges
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    selectedPillar === 'all'
                      ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                      : 'bg-white/[0.03] text-slate-400 border-white/5'
                  }`}>
                    {pillarCounts.all}
                  </span>
                </div>
              </button>

              {/* 2. Battle Arena 1v1 */}
              <button
                type="button"
                onClick={() => setSelectedPillar('arena')}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between gap-3.5 ${
                  selectedPillar === 'arena'
                    ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-500/5 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-300/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      selectedPillar === 'arena'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-white/[0.04] border border-white/10 text-slate-300 group-hover:text-amber-300'
                    }`}
                  >
                    <Swords className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-black truncate ${selectedPillar === 'arena' ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        Battle Arena 1v1
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Head-to-head live code duels
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    selectedPillar === 'arena'
                      ? 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                      : 'bg-white/[0.03] text-slate-400 border-white/5'
                  }`}>
                    {pillarCounts.arena}
                  </span>
                </div>
              </button>

              {/* 3. Hackathons */}
              <button
                type="button"
                onClick={() => setSelectedPillar('hackathon')}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between gap-3.5 ${
                  selectedPillar === 'hackathon'
                    ? 'bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-orange-500/5 border-2 border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.2)] ring-1 ring-orange-300/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      selectedPillar === 'hackathon'
                        ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-slate-950 shadow-md shadow-orange-500/30'
                        : 'bg-white/[0.04] border border-white/10 text-slate-300 group-hover:text-orange-300'
                    }`}
                  >
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-black truncate ${selectedPillar === 'hackathon' ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        Hackathons
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Inter-campus team derbies
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    selectedPillar === 'hackathon'
                      ? 'bg-orange-400/20 text-orange-200 border-orange-400/40'
                      : 'bg-white/[0.03] text-slate-400 border-white/5'
                  }`}>
                    {pillarCounts.hackathon}
                  </span>
                </div>
              </button>

              {/* 4. Faculty Bounties */}
              <button
                type="button"
                onClick={() => setSelectedPillar('problem')}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between gap-3.5 ${
                  selectedPillar === 'problem'
                    ? 'bg-gradient-to-r from-violet-500/20 via-amber-500/10 to-violet-500/5 border-2 border-violet-400 shadow-[0_0_25px_rgba(167,139,250,0.2)] ring-1 ring-violet-300/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      selectedPillar === 'problem'
                        ? 'bg-gradient-to-br from-violet-400 to-amber-500 text-slate-950 shadow-md shadow-violet-500/30'
                        : 'bg-white/[0.04] border border-white/10 text-slate-300 group-hover:text-violet-300'
                    }`}
                  >
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-black truncate ${selectedPillar === 'problem' ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        Faculty Bounties
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Professor research challenges
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    selectedPillar === 'problem'
                      ? 'bg-violet-400/20 text-violet-200 border-violet-400/40'
                      : 'bg-white/[0.03] text-slate-400 border-white/5'
                  }`}>
                    {pillarCounts.problem}
                  </span>
                </div>
              </button>

              {/* 5. ICPC Gauntlet */}
              <button
                type="button"
                onClick={() => setSelectedPillar('icpc')}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between gap-3.5 ${
                  selectedPillar === 'icpc'
                    ? 'bg-gradient-to-r from-cyan-500/20 via-amber-500/10 to-cyan-500/5 border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.2)] ring-1 ring-cyan-300/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      selectedPillar === 'icpc'
                        ? 'bg-gradient-to-br from-cyan-400 to-amber-500 text-slate-950 shadow-md shadow-cyan-500/30'
                        : 'bg-white/[0.04] border border-white/10 text-slate-300 group-hover:text-cyan-300'
                    }`}
                  >
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-black truncate ${selectedPillar === 'icpc' ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        ICPC Gauntlet
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Competitive algorithmic clashes
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    selectedPillar === 'icpc'
                      ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/40'
                      : 'bg-white/[0.03] text-slate-400 border-white/5'
                  }`}>
                    {pillarCounts.icpc}
                  </span>
                </div>
              </button>
            </aside>

            {/* RIGHT COLUMN: Matches Grid + Search Bar */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Search & active category bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    Showing:
                  </span>
                  <span className="text-xs font-bold text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    {selectedPillar === 'all' && 'All Arenas'}
                    {selectedPillar === 'arena' && '⚔️ Battle Arena 1v1'}
                    {selectedPillar === 'hackathon' && '🏆 Hackathons'}
                    {selectedPillar === 'problem' && '💡 Faculty Bounties'}
                    {selectedPillar === 'icpc' && '⚡ ICPC Gauntlet'}
                    {' '}({filteredMatches.length})
                  </span>
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search matches or colleges..."
                    className="w-full h-9 px-3 pl-8 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                </div>
              </div>

              {/* Matches Grid */}
              {filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {filteredMatches.map((match) => {
                    const isShiny = Boolean(match.isPriorityShiny);
                    return (
                      <div
                        key={match.id}
                        className={`rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                          isShiny
                            ? 'bg-gradient-to-b from-amber-500/15 via-[#0D111A] to-[#080B10] border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top tag & status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-1">
                              {match.pillar === 'arena' && <Swords className="w-3 h-3 text-amber-400" />}
                              {match.pillar === 'hackathon' && <Trophy className="w-3 h-3 text-orange-400" />}
                              {match.pillar === 'problem' && <Lightbulb className="w-3 h-3 text-violet-400" />}
                              {match.pillar === 'icpc' && <Terminal className="w-3 h-3 text-cyan-400" />}
                              <span className="uppercase">{match.pillar}</span>
                            </span>

                            <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              <span>OPEN CHALLENGE</span>
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-base font-bold text-white leading-snug">
                            {match.title}
                          </h4>

                          {/* College vs College clash */}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-amber-300 font-bold truncate max-w-[140px]">
                                {match.challengerCollege}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-500 px-1.5 py-0.5 rounded bg-white/5">
                                VS
                              </span>
                              <span className="text-slate-300 font-medium truncate max-w-[140px] text-right">
                                {match.targetCollege}
                              </span>
                            </div>
                            {match.challengerName && (
                              <div className="text-[10px] text-slate-400 font-sans truncate">
                                Posted by: <span className="text-slate-300">{match.challengerName}</span>
                              </div>
                            )}
                          </div>

                          {/* Stakes & Bounty */}
                          <div className="flex items-center justify-between text-xs font-mono pt-1">
                            <span className="text-slate-400">Bounty Stake:</span>
                            <span className="font-bold text-amber-400">{match.stakes}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 mt-2 border-t border-white/5">
                          <Link
                            href={match.actionUrl || '/arena'}
                            className="w-full h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all"
                          >
                            <span>{match.actionLabel || '⚔️ Accept Duel'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
                  <Swords className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-base font-bold text-white">No active matches found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Be the first champion to throw down the gauntlet for your college!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsChallengeModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Post First Challenge</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. VIEW: CAMPUS STANDINGS & LEADERBOARD */}
        {viewMode === 'standings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span>Official Inter-College Standings (Season 1)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Scoring based on cross-campus duels won, hackathon placements, and median top-5 ELO.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  LIVE ACCREDITED RANKINGS
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.02] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Rank</th>
                      <th className="py-3.5 px-4 font-bold">University / Campus</th>
                      <th className="py-3.5 px-4 font-bold text-right">War Points</th>
                      <th className="py-3.5 px-4 font-bold text-center">Win Rate</th>
                      <th className="py-3.5 px-4 font-bold text-center">Duels Won</th>
                      <th className="py-3.5 px-4 font-bold text-center">Hackathon Golds</th>
                      <th className="py-3.5 px-4 font-bold">Campus Champion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(config.standings || []).map((campus, idx) => {
                      const isShiny = Boolean(campus.isPriorityShiny);
                      return (
                        <tr
                          key={campus.id}
                          className={`transition-colors ${
                            isShiny
                              ? 'bg-amber-500/10 font-semibold text-amber-100 hover:bg-amber-500/15'
                              : 'hover:bg-white/[0.02] text-slate-200'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {idx === 0 && <span className="text-amber-400">🥇 #1</span>}
                            {idx === 1 && <span className="text-slate-300">🥈 #2</span>}
                            {idx === 2 && <span className="text-amber-600">🥉 #3</span>}
                            {idx > 2 && <span className="text-slate-500">#{idx + 1}</span>}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {campus.collegeName}
                              </span>
                              {isShiny && (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50 uppercase tracking-widest font-black">
                                  ⭐ HOST
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Code: {campus.shortName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400 text-sm">
                            {campus.warPoints.toLocaleString()} PTS
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                              {campus.winRate}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                            {campus.duelsWon}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-orange-400 font-bold">
                            {campus.hackathonsWon}
                          </td>
                          <td className="py-3.5 px-4 font-sans text-slate-300 text-xs">
                            <div className="flex items-center gap-1.5">
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{campus.championName}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. MODAL: POST OPEN CHALLENGE */}
        {isChallengeModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-md w-full bg-[#0D111A] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Post Open Campus Challenge</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsChallengeModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostChallenge} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Challenge Title
                  </label>
                  <input
                    type="text"
                    required
                    value={challengeTitle}
                    onChange={(e) => setChallengeTitle(e.target.value)}
                    placeholder="e.g. Speed React Duel or Algorithm Clash"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pillar Category
                    </label>
                    <select
                      value={challengePillar}
                      onChange={(e) => setChallengePillar(e.target.value as WarPillar)}
                      className="w-full h-10 px-2.5 rounded-xl bg-[#090C12] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value="arena">⚔️ Battle Arena 1v1</option>
                      <option value="hackathon">🏆 Hackathon Derby</option>
                      <option value="problem">💡 Faculty Bounty</option>
                      <option value="icpc">⚡ ICPC Gauntlet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Bounty Points
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={bountyPoints}
                      onChange={(e) => setBountyPoints(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your College Name
                  </label>
                  <input
                    type="text"
                    required
                    value={challengerCollege}
                    onChange={(e) => setChallengerCollege(e.target.value)}
                    placeholder="e.g. Thapar University"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Target Rival College (or Open to All)
                  </label>
                  <input
                    type="text"
                    value={targetCollege}
                    onChange={(e) => setTargetCollege(e.target.value)}
                    placeholder="e.g. Open to All Campuses or DTU"
                    className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChallengeModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingChallenge}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/25"
                  >
                    {isSubmittingChallenge ? 'Posting...' : 'Post Challenge ⚔️'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
