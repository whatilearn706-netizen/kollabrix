'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Code2,
  Gift,
  Rocket,
  Search,
  ShieldAlert,
  Sparkles,
  Swords,
  X,
} from 'lucide-react';
import {
  CODEX_BOOKS,
  CODEX_LANGUAGE_TRACKS,
  CODEX_PATTERNS,
  type CodexBookVolume,
  type CodexLanguageTrack,
  type CodexLevel,
  type CodexPatternVolume,
  type CodexSection,
} from '@/data/codexCatalog';
import { CodexRail } from '@/components/codex/CodexRail';
import {
  CodexSpotlightCarousel,
  type CodexVolume,
} from '@/components/codex/CodexSpotlightCarousel';
import { CodexTrackModal } from '@/components/codex/CodexTrackModal';
import { CodexReaderModal } from '@/components/codex/CodexReaderModal';
import { StepLearningWorkspace } from '@/components/resources/StepLearningWorkspace';
import { DEFAULT_CURRICULA } from '@/data/defaultCurriculum';
import type { LanguageCurriculum } from '@/types/curriculum';
import { useAuth } from '@/components/auth/AuthProvider';

const SAVED_STORAGE_KEY = 'kollabrix_codex_saved_ids';
const COMPLETED_STORAGE_KEY = 'kollabrix_codex_completed_lessons';
const CONTINUE_STORAGE_KEY = 'kollabrix_codex_last_track';

const ALL_VOLUMES: CodexVolume[] = [
  ...CODEX_LANGUAGE_TRACKS,
  ...CODEX_BOOKS,
  ...CODEX_PATTERNS,
];

export default function ResourcesPage() {
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<CodexSection>('home');
  const [carouselIndices, setCarouselIndices] = useState<Record<'home' | 'books' | 'solving', number>>({
    home: 0,
    books: 0,
    solving: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lastVisitedId, setLastVisitedId] = useState<string | null>(null);

  const [activeModalVolume, setActiveModalVolume] = useState<CodexVolume | null>(null);
  const [curriculaMap, setCurriculaMap] =
    useState<Record<string, LanguageCurriculum>>(DEFAULT_CURRICULA);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  const [isResourcesLive, setIsResourcesLive] = useState<boolean>(true);
  const [statusLoaded, setStatusLoaded] = useState<boolean>(false);
  const [offlineNotice, setOfflineNotice] = useState<string>(
    'KOLLΛBRIX CODEX is currently offline while we curate new language tracks, technical manuals, and OA playbooks. Check back soon!'
  );
  const isAdmin = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com';

  // Seed browser history on fresh /resources tab so tapping browser Back opens KΛ CODEX homepage (/ka-codex)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;
    const cameFromCodexHome = document.referrer.includes('/ka-codex');
    if (!cameFromCodexHome && !window.history.state?.kaBackSeeded && window.history.length <= 2) {
      window.history.replaceState({ ...(window.history.state || {}), kaBackRoot: '/ka-codex' }, '', '/ka-codex');
      window.history.pushState({ kaBackSeeded: true }, '', currentUrl);
    }
    const onPopState = (e: PopStateEvent) => {
      if (window.location.pathname === '/ka-codex' || (e.state && e.state.kaBackRoot === '/ka-codex')) {
        window.location.assign('/ka-codex');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Hydrate bookmarks, progress, and dynamic curricula
  useEffect(() => {
    try {
      const rawSaved = localStorage.getItem(SAVED_STORAGE_KEY);
      if (rawSaved) {
        const parsed = JSON.parse(rawSaved);
        if (Array.isArray(parsed)) setSavedIds(parsed);
      }
      const rawCompleted = localStorage.getItem(COMPLETED_STORAGE_KEY);
      if (rawCompleted) {
        const parsed = JSON.parse(rawCompleted);
        if (Array.isArray(parsed)) setCompletedLessons(parsed);
      }
      const last = localStorage.getItem(CONTINUE_STORAGE_KEY);
      if (last) setLastVisitedId(last);
    } catch {}

    async function loadCurricula() {
      try {
        const res = await fetch(`/api/curriculum?_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.curricula && Object.keys(data.curricula).length > 0) {
          let loaded = data.curricula as Record<string, LanguageCurriculum>;
          try {
            const localDel = JSON.parse(localStorage.getItem('tf_deleted_curricula_ids') || '[]');
            if (Array.isArray(localDel) && localDel.length > 0) {
              const delSet = new Set(localDel.map((x: string) => String(x).toLowerCase()));
              const filtered: Record<string, LanguageCurriculum> = {};
              for (const [k, v] of Object.entries(loaded)) {
                if (!delSet.has(k.toLowerCase()) && !delSet.has((v.id || '').toLowerCase())) {
                  filtered[k] = v;
                }
              }
              loaded = filtered;
            }
          } catch {}
          setCurriculaMap(loaded);
        }
      } catch {}
    }

    async function loadResourcesStatus() {
      try {
        const res = await fetch(`/api/resources/status?_t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setIsResourcesLive(data.isLive !== false);
          if (data.maintenanceMessage) setOfflineNotice(data.maintenanceMessage);
        }
      } catch {} finally {
        setStatusLoaded(true);
      }
    }

    loadResourcesStatus();
    loadCurricula();
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = prev.includes(lessonId)
        ? prev.filter((x) => x !== lessonId)
        : [...prev, lessonId];
      try {
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleOpenVolume = (vol: CodexVolume) => {
    setActiveModalVolume(vol);
    setLastVisitedId(vol.id);
    try {
      localStorage.setItem(CONTINUE_STORAGE_KEY, vol.id);
    } catch {}
  };

  const handleResumeContinue = () => {
    if (!lastVisitedId) return;
    const found = ALL_VOLUMES.find((v) => v.id === lastVisitedId);
    if (found) setActiveModalVolume(found);
  };

  const handleLaunchFullWorkspace = (track: CodexLanguageTrack, level: CodexLevel) => {
    const targetKey = track.curriculumKeys[level] || track.curriculumKeys.beginner;
    if (targetKey && curriculaMap[targetKey]) {
      setActiveModalVolume(null);
      setActiveWorkspaceId(targetKey);
    }
  };

  // Search filtering across current tab
  const filteredVolumes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const match = (v: CodexVolume) => {
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        v.subtitle.toLowerCase().includes(q) ||
        v.spotlightAuthor.toLowerCase().includes(q) ||
        v.badgeText.toLowerCase().includes(q)
      );
    };

    if (activeSection === 'home') {
      const res = CODEX_LANGUAGE_TRACKS.filter(match);
      return res.length > 0 ? res : CODEX_LANGUAGE_TRACKS;
    }
    if (activeSection === 'books') {
      const res = CODEX_BOOKS.filter(match);
      return res.length > 0 ? res : CODEX_BOOKS;
    }
    if (activeSection === 'solving') {
      const res = CODEX_PATTERNS.filter(match);
      return res.length > 0 ? res : CODEX_PATTERNS;
    }
    return [];
  }, [activeSection, searchQuery]);

  const savedVolumes = useMemo(
    () => ALL_VOLUMES.filter((v) => savedIds.includes(v.id)),
    [savedIds]
  );

  const rawName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    '';
  const firstName = rawName.trim().split(/\s+/)[0] || '';
  const continueVolume = useMemo(
    () => (lastVisitedId ? ALL_VOLUMES.find((v) => v.id === lastVisitedId) || null : null),
    [lastVisitedId]
  );

  // Gate /resources when Admin has set Resources to Not Live (Admins still bypass to preview)
  if (statusLoaded && !isResourcesLive && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="fixed inset-y-0 right-0 w-full lg:w-1/2 bg-[#0B0F18] pointer-events-none border-l border-white/[0.03]"
        />
        <div className="relative z-10 w-full max-w-xl rounded-3xl bg-[#0A0E17] border border-white/12 p-8 sm:p-10 shadow-[0_35px_120px_rgba(0,0,0,0.85)] space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-[10px] font-mono uppercase tracking-[0.2em] text-rose-300">
                NOT LIVE · COMING SOON
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white mt-1">
                KOLLΛBRIX CODEX
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
            {offlineNotice}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/ka-codex"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF8F5] text-[#07090E] font-semibold text-sm hover:bg-sky-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to KΛ CODEX</span>
            </Link>
            <Link
              href="/arena"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.05] border border-white/15 hover:border-white/30 text-xs font-mono text-zinc-200"
            >
              <span>Visit Battle Arena</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Full interactive step workspace mode if user explicitly drilled into a curriculum
  if (activeWorkspaceId && curriculaMap[activeWorkspaceId]) {
    return (
      <StepLearningWorkspace
        curriculum={curriculaMap[activeWorkspaceId]}
        onBack={() => setActiveWorkspaceId(null)}
        onTrackChange={() => setActiveWorkspaceId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* Two-Tone Obsidian Editorial Backdrop (Left #07090E / Right #0B0F18 Split on Desktop) */}
      <div
        aria-hidden="true"
        className="fixed inset-y-0 right-0 w-full lg:w-1/2 bg-[#0B0F18] pointer-events-none z-0 border-l border-white/[0.03]"
      />
      <div
        aria-hidden="true"
        className="fixed top-[-140px] left-1/2 -translate-x-1/2 w-[780px] h-[360px] rounded-full bg-sky-500/[0.06] blur-[130px] pointer-events-none z-0"
      />

      {/* Left Vertical Editorial Icon Rail */}
      <CodexRail
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setSearchQuery('');
        }}
        savedCount={savedIds.length}
      />

      {/* Main Editorial Workspace */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {statusLoaded && !isResourcesLive && isAdmin && (
          <div className="px-5 sm:px-10 lg:px-14 py-2 bg-rose-950/70 border-b border-rose-500/30 text-rose-200 text-xs font-mono flex items-center justify-between gap-3">
            <span>
              ADMIN PREVIEW MODE: Resources (/resources) is currently <strong>NOT LIVE</strong> for students.
            </span>
            <Link
              href="/control-center-7x9"
              className="underline hover:text-white shrink-0"
            >
              Manage in Control Center →
            </Link>
          </div>
        )}
        {/* Minimal Studio Top Strip */}
        <header className="h-[72px] px-5 sm:px-10 lg:px-14 flex items-center justify-between gap-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <Link
              href="/ka-codex"
              title="Back to KΛ CODEX Homepage — Built by Kollabrix"
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-b from-[#171C28] via-[#0E121B] to-[#080A10] border border-white/15 hover:border-amber-300/45 shadow-[0_0_18px_rgba(148,163,184,0.14)] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-zinc-300 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[11px] font-semibold tracking-tight text-white">KΛ CODEX</span>
              <span className="h-3 w-px bg-white/15 hidden sm:inline" />
              <span className="text-[10px] font-mono text-zinc-300 hidden sm:inline">
                Built by <span className="text-amber-300 font-bold">Kollabrix</span>
              </span>
            </Link>
            <span className="text-zinc-700 hidden md:inline">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-[0.22em] uppercase text-white">
                KOLLΛBRIX <span className="text-sky-300 font-semibold">CODEX</span>
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
                Library & Tracks
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input (for Home / Books / Problem Solving) */}
            {(activeSection === 'home' || activeSection === 'books' || activeSection === 'solving') && (
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stack, book, pattern..."
                  className="w-48 lg:w-64 pl-8 pr-7 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-400/50 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Quick KΛ ΛI New-Tab Studio Launcher */}
            <Link
              href="/spark"
              target="_blank"
              rel="noopener noreferrer"
              title="Open KΛ ΛI Studio in a new tab"
              className="group relative inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-sky-400/50 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-sky-300" fill="none">
                <path
                  d="M12 3L4.5 20.5H8.5L12 11.8L15.5 20.5H19.5L12 3Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[11px] font-black tracking-[0.14em] text-white">KΛ</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-sky-300 transition-colors" />
            </Link>
          </div>
        </header>

        {/* Active Rail Content */}
        {activeSection === 'home' && (
          <CodexSpotlightCarousel
            sectionLabel="01 · LANGUAGE VIDEO & GUIDED TRACKS"
            headline={firstName ? `Keep building, ${firstName}.` : 'Choose your stack.'}
            headlineAccent="Master every language."
            volumes={filteredVolumes}
            activeIndex={carouselIndices.home}
            onChangeIndex={(next) => setCarouselIndices((prev) => ({ ...prev, home: next }))}
            onOpenVolume={handleOpenVolume}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            continueNote={continueVolume ? `Resume ${continueVolume.title}` : null}
            onResumeContinue={continueVolume ? handleResumeContinue : undefined}
          />
        )}

        {activeSection === 'books' && (
          <CodexSpotlightCarousel
            sectionLabel="02 · TECHNICAL BOOKSHELF & VOLUMES"
            headline="Read the manuals."
            headlineAccent="Built for engineers."
            volumes={filteredVolumes}
            activeIndex={carouselIndices.books}
            onChangeIndex={(next) => setCarouselIndices((prev) => ({ ...prev, books: next }))}
            onOpenVolume={handleOpenVolume}
            savedIds={savedIds}
            onToggleSave={toggleSave}
          />
        )}

        {activeSection === 'solving' && (
          <CodexSpotlightCarousel
            sectionLabel="03 · PROBLEM SOLVING & OA PLAYBOOKS"
            headline="Spot the pattern."
            headlineAccent="Win the arena."
            volumes={filteredVolumes}
            activeIndex={carouselIndices.solving}
            onChangeIndex={(next) => setCarouselIndices((prev) => ({ ...prev, solving: next }))}
            onOpenVolume={handleOpenVolume}
            savedIds={savedIds}
            onToggleSave={toggleSave}
          />
        )}

        {activeSection === 'saved' && (
          <div className="flex-1 px-5 sm:px-10 lg:px-14 py-8 space-y-6">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-300">
                04 · PERSONAL ARCHIVE
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-white mt-1">
                Saved Codex Volumes
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Your bookmarked tracks, manuals, and OA playbooks for instant revision.
              </p>
            </div>

            {savedVolumes.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center max-w-xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto">
                  <Bookmark className="w-5 h-5 text-amber-300" />
                </div>
                <h2 className="text-lg font-semibold text-white">No saved volumes yet</h2>
                <p className="text-sm text-zinc-400">
                  Tap <strong>Save</strong> on any language track, technical manual, or problem-solving playbook to pin it here.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection('home')}
                  className="px-5 py-2.5 rounded-full bg-[#FAF8F5] text-[#07090E] text-xs font-semibold cursor-pointer hover:bg-sky-100"
                >
                  Browse Tracks →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {savedVolumes.map((vol) => (
                  <div
                    key={vol.id}
                    className={`rounded-3xl border border-white/12 bg-gradient-to-br ${vol.coverGradient} p-6 flex flex-col justify-between gap-5 shadow-2xl`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                          {vol.edition}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleSave(vol.id)}
                          className="text-amber-300 hover:text-amber-200 cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Bookmark className="w-4 h-4 fill-amber-300" />
                        </button>
                      </div>
                      <h3 className="text-xl font-serif font-semibold text-white">{vol.title}</h3>
                      <p className="text-xs text-zinc-300/90 leading-relaxed">{vol.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenVolume(vol)}
                      className="w-full py-2.5 rounded-full bg-[#FAF8F5] text-[#07090E] text-xs font-semibold hover:bg-sky-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>{vol.ctaLabel}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'vault' && (
          <div className="flex-1 px-5 sm:px-10 lg:px-14 py-8 space-y-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-sky-300">
                05 · STUDENT PERKS & HACKATHON ARSENAL
              </p>
              <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-white mt-1 leading-tight">
                Perks & Starter Kits
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-2">
                Unlock $14,000+ in student cloud credits, production hackathon templates, and jump straight into live coding arenas.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
              <Link
                href="/perks"
                className="group rounded-3xl border border-white/12 bg-gradient-to-br from-[#1b1509] via-[#0d0b08] to-[#08090e] p-7 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-6 shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-amber-300" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-200 uppercase tracking-wider">
                      $14,000+ Value
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-semibold text-white group-hover:text-amber-200 transition-colors">
                    Student Perks Vault
                  </h2>
                  <p className="text-sm text-zinc-300/90 leading-relaxed">
                    Claim verified campus software credits across cloud hosting, GitHub developer packs, vector databases, and AI API tiers.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  <span>Open Perks Vault</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>

              <Link
                href="/starter-kits"
                className="group rounded-3xl border border-white/12 bg-gradient-to-br from-[#0b1929] via-[#080d17] to-[#07090e] p-7 hover:border-sky-400/50 transition-all flex flex-col justify-between gap-6 shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-sky-300" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-sky-400/15 border border-sky-400/30 text-[10px] font-mono font-bold text-sky-200 uppercase tracking-wider">
                      Hackathon Ready
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-semibold text-white group-hover:text-sky-200 transition-colors">
                    Hackathon Starter Kits
                  </h2>
                  <p className="text-sm text-zinc-300/90 leading-relaxed">
                    Production-ready Next.js, FastAPI, AI Agent, and Web3 scaffolds pre-configured with auth, database schemas, and deploy scripts.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                  <span>Browse Starter Kits</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/icpc"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/12 hover:border-white/30 text-xs font-mono text-zinc-200"
              >
                <Code2 className="w-3.5 h-3.5 text-sky-300" />
                <span>Open Practice IDE</span>
              </Link>
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/12 hover:border-white/30 text-xs font-mono text-zinc-200"
              >
                <Swords className="w-3.5 h-3.5 text-amber-300" />
                <span>Enter 1v1 Battle Arena</span>
              </Link>
              <Link
                href="/spark"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/12 hover:border-white/30 text-xs font-mono text-zinc-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Launch KΛ ΛI Studio ↗</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Active Modals */}
      {activeModalVolume && activeModalVolume.kind === 'track' && (
        <CodexTrackModal
          track={activeModalVolume as CodexLanguageTrack}
          completedLessons={completedLessons}
          onToggleLessonComplete={toggleLessonComplete}
          isSaved={savedIds.includes(activeModalVolume.id)}
          onToggleSave={() => toggleSave(activeModalVolume.id)}
          onLaunchFullWorkspace={(lvl) =>
            handleLaunchFullWorkspace(activeModalVolume as CodexLanguageTrack, lvl)
          }
          onClose={() => setActiveModalVolume(null)}
        />
      )}

      {activeModalVolume &&
        (activeModalVolume.kind === 'book' || activeModalVolume.kind === 'solving') && (
          <CodexReaderModal
            volume={activeModalVolume as CodexBookVolume | CodexPatternVolume}
            isSaved={savedIds.includes(activeModalVolume.id)}
            onToggleSave={() => toggleSave(activeModalVolume.id)}
            onClose={() => setActiveModalVolume(null)}
          />
        )}
    </div>
  );
}
