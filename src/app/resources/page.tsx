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
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';
import { ALL_FOLIO_BOOK_VOLUMES } from '@/data/kaAllBooks';
import { FOLIO_BOOK_GOALS } from '@/data/codexBookMeta';
import { getKaFolioHomePath, getKollabrixHomeUrl } from '@/lib/kaBrandDomains';
import { STUDENT_PERKS } from '@/data/studentPerks';

const SAVED_STORAGE_KEY = 'kollabrix_codex_saved_ids';
const COMPLETED_STORAGE_KEY = 'kollabrix_codex_completed_lessons';
const CONTINUE_STORAGE_KEY = 'kollabrix_codex_last_track';

const FOLIO_12_BOOKS: CodexBookVolume[] = ALL_FOLIO_BOOK_VOLUMES;

const ALL_VOLUMES: CodexVolume[] = [
  ...CODEX_LANGUAGE_TRACKS,
  ...FOLIO_12_BOOKS,
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
  const [bookTopic, setBookTopic] = useState<string>('All');
  const [bookTier, setBookTier] = useState<'All' | 'Beginner' | 'Core' | 'Pro'>('All');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lastVisitedId, setLastVisitedId] = useState<string | null>(null);
  const [vaultTab, setVaultTab] = useState<'overview' | 'perks' | 'projects'>('overview');
const [perkQuery, setPerkQuery] = useState('');
const [perkCategory, setPerkCategory] = useState<string>('all');
const [claimedPerkIds, setClaimedPerkIds] = useState<string[]>([]);
const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

const MAJOR_PROJECT_BLUEPRINTS = [
  {
    id: 'raft-log-engine',
    code: 'PRJ-01',
    tag: 'DISTRIBUTED SYSTEMS',
    title: 'Distributed Log Engine with Raft Consensus',
    stack: ['Go / Rust', 'gRPC', 'Raft', 'Docker'],
    whyExaminersLoveIt: 'Real leader election, log replication, and split-brain fault tolerance — zero CRUD cliché.',
    vivaQuestion: 'How does Raft guarantee log matching if the leader crashes mid-replication?',
  },
  {
    id: 'ai-radiograph-triage',
    code: 'PRJ-02',
    tag: 'HEALTHCARE AI',
    title: 'AI-Assisted Radiograph Anomaly Triaging',
    stack: ['PyTorch', 'Grad-CAM', 'FastAPI', 'Next.js'],
    whyExaminersLoveIt: 'Includes Grad-CAM heatmaps for explainable AI, solving black-box medical skepticism.',
    vivaQuestion: 'Why use Grad-CAM saliency maps instead of a plain classification confidence score?',
  },
  {
    id: 'zero-trust-api-gateway',
    code: 'PRJ-03',
    tag: 'CYBERSECURITY',
    title: 'Zero-Trust eBPF Microservice Firewall & Rate Limiter',
    stack: ['eBPF', 'C / Go', 'Redis', 'Prometheus'],
    whyExaminersLoveIt: 'Kernel-level packet filtering with real-time anomaly telemetry dashboards.',
    vivaQuestion: 'What is the latency advantage of XDP/eBPF packet drops vs user-space Nginx filtering?',
  },
  {
    id: 'edge-iot-predictive',
    code: 'PRJ-04',
    tag: 'EDGE & IOT',
    title: 'Edge-AI Predictive Maintenance Gateway',
    stack: ['TensorFlow Lite', 'MQTT', 'ESP32', 'TimescaleDB'],
    whyExaminersLoveIt: 'Runs quantized ML models offline on edge hardware before syncing anomalies to cloud.',
    vivaQuestion: 'How much inference latency did INT8 quantization save on the edge microcontroller?',
  },
];

  const [activeModalVolume, setActiveModalVolume] = useState<CodexVolume | null>(null);
  const [curriculaMap, setCurriculaMap] =
    useState<Record<string, LanguageCurriculum>>(DEFAULT_CURRICULA);
  const [activeWorkspace, setActiveWorkspace] = useState<{
    curriculumId: string;
    track: CodexLanguageTrack | null;
    level: CodexLevel;
  } | null>(null);

  const [isResourcesLive, setIsResourcesLive] = useState<boolean>(true);
  const [statusLoaded, setStatusLoaded] = useState<boolean>(false);
  const [offlineNotice, setOfflineNotice] = useState<string>(
    'KOLLΛBRIX FOLIO is currently offline while we curate new language tracks, technical manuals, and OA playbooks. Check back soon!'
  );
  const isAdmin = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com';

  // Seed browser history on fresh /resources tab so tapping browser Back opens KΛ FOLIO homepage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const folioHome = getKaFolioHomePath();
    const currentUrl = window.location.pathname + window.location.search + window.location.hash;
    const cameFromCodexHome =
      document.referrer.includes('/ka-codex') ||
      (folioHome === '/' && document.referrer.includes('folio.kollabrix.in'));
    if (!cameFromCodexHome && !window.history.state?.kaBackSeeded && window.history.length <= 2) {
      window.history.replaceState({ ...(window.history.state || {}), kaBackRoot: folioHome }, '', folioHome);
      window.history.pushState({ kaBackSeeded: true }, '', currentUrl);
    }
    const onPopState = (e: PopStateEvent) => {
      if (window.location.pathname === folioHome || (e.state && e.state.kaBackRoot === folioHome)) {
        window.location.assign(folioHome);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Deep-link from KΛ FOLIO (?section=books&book=<id>) straight to Section 02 Bookshelf focused on that book
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section');
    const bookParam = params.get('book');

    if (sectionParam === 'books' || bookParam) {
      setActiveSection('books');
      setBookTopic('All');
      setActiveModalVolume(null);
      if (bookParam) {
        const idx = FOLIO_12_BOOKS.findIndex((b) => b.id === bookParam);
        if (idx >= 0) {
          setCarouselIndices((prev) => ({ ...prev, books: idx }));
          setLastVisitedId(FOLIO_12_BOOKS[idx].id);
        }
      }
    }
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

  const openTrackWorkspaceDirect = (
    track: CodexLanguageTrack,
    level: CodexLevel = 'beginner'
  ): boolean => {
    const targetKey =
      track.curriculumKeys[level] ||
      track.curriculumKeys.beginner ||
      track.curriculumKeys.intermediate;
    if (targetKey && curriculaMap[targetKey]) {
      setActiveModalVolume(null);
      setActiveWorkspace({ curriculumId: targetKey, track, level });
      return true;
    }
    return false;
  };

  const handleOpenVolume = (vol: CodexVolume) => {
    setLastVisitedId(vol.id);
    try {
      localStorage.setItem(CONTINUE_STORAGE_KEY, vol.id);
    } catch {}
    if (vol.kind === 'track' && openTrackWorkspaceDirect(vol, 'beginner')) {
      return;
    }
    setActiveModalVolume(vol);
  };

  const handleResumeContinue = () => {
    if (!lastVisitedId) return;
    const found = ALL_VOLUMES.find((v) => v.id === lastVisitedId);
    if (found) handleOpenVolume(found);
  };

  const handleLaunchFullWorkspace = (track: CodexLanguageTrack, level: CodexLevel) => {
    openTrackWorkspaceDirect(track, level);
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
      const topicBooks =
        bookTopic === 'All'
          ? FOLIO_12_BOOKS
          : FOLIO_12_BOOKS.filter(
              (b) =>
                b.mentorGuide?.languageGroup === bookTopic ||
                b.mentorGuide?.goalTags?.includes(bookTopic) ||
                b.languageTag === bookTopic
            );
      const tierBooks =
        bookTier === 'All'
          ? topicBooks
          : topicBooks.filter((b) => b.mentorGuide?.level === bookTier);
      const base = tierBooks.length > 0 ? tierBooks : topicBooks;
      const res = base.filter(match);
      return res.length > 0 ? res : base;
    }
    if (activeSection === 'solving') {
      const res = CODEX_PATTERNS.filter(match);
      return res.length > 0 ? res : CODEX_PATTERNS;
    }
    return [];
  }, [activeSection, searchQuery, bookTopic, bookTier]);

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
                KOLLΛBRIX FOLIO
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
            {offlineNotice}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={getKaFolioHomePath()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FAF8F5] text-[#07090E] font-semibold text-sm hover:bg-sky-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to KΛ FOLIO</span>
            </Link>
            <Link
              href="/arena"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.05] border border-white/15 hover:border-white/30 text-xs font-mono text-zinc-200"
            >
              <span>Visit KΛ ARENA</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Direct Interactive Step Studio mode when user taps any guided track
  if (activeWorkspace && curriculaMap[activeWorkspace.curriculumId]) {
    return (
      <StepLearningWorkspace
        curriculum={curriculaMap[activeWorkspace.curriculumId]}
        track={activeWorkspace.track}
        activeLevel={activeWorkspace.level}
        onSwitchLevel={(nextLvl) => {
          if (activeWorkspace.track) {
            openTrackWorkspaceDirect(activeWorkspace.track, nextLvl);
          }
        }}
        isSaved={activeWorkspace.track ? savedIds.includes(activeWorkspace.track.id) : false}
        onToggleSave={
          activeWorkspace.track ? () => toggleSave(activeWorkspace.track!.id) : undefined
        }
        onBack={() => setActiveWorkspace(null)}
        onTrackChange={() => setActiveWorkspace(null)}
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
          <div className="flex items-center gap-2">
            <Link
              href={getKollabrixHomeUrl()}
              title="Go to Kollabrix Home"
              className="text-xs sm:text-sm font-black tracking-[0.22em] uppercase text-white hover:text-sky-200 transition-colors"
            >
              KOLLΛBRIX
            </Link>
            <span className="text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-sky-300">
              FOLIO
            </span>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[9px] font-mono uppercase tracking-widest text-zinc-400">
              Library & Tracks
            </span>
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
            sectionLabel="02 · GOAL-BASED BOOK DECISION ENGINE"
            headline="Pick the right book."
            headlineAccent="Built for your goal."
            volumes={filteredVolumes}
            activeIndex={carouselIndices.books}
            onChangeIndex={(next) => setCarouselIndices((prev) => ({ ...prev, books: next }))}
            onOpenVolume={handleOpenVolume}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            topicFilterBar={
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {FOLIO_BOOK_GOALS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        setBookTopic(topic);
                        setCarouselIndices((prev) => ({ ...prev, books: 0 }));
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono cursor-pointer transition-all ${
                        bookTopic === topic
                          ? 'bg-gradient-to-b from-white to-slate-200 text-slate-950 font-bold shadow-[0_0_18px_rgba(226,232,240,0.3)]'
                          : 'bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 border border-white/10'
                      }`}
                    >
                      {topic === 'All' ? `All (${FOLIO_12_BOOKS.length})` : topic}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mr-1">
                    Tier:
                  </span>
                  {(['All', 'Beginner', 'Core', 'Pro'] as const).map((tierOpt) => (
                    <button
                      key={tierOpt}
                      type="button"
                      onClick={() => {
                        setBookTier(tierOpt);
                        setCarouselIndices((prev) => ({ ...prev, books: 0 }));
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-all ${
                        bookTier === tierOpt
                          ? 'bg-sky-400 text-slate-950 font-bold'
                          : 'bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 border border-white/10'
                      }`}
                    >
                      {tierOpt === 'All' ? 'All Tiers' : tierOpt}
                    </button>
                  ))}
                </div>
              </div>
            }
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
                Saved Folio Volumes
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
          <div className="relative flex-1 px-5 sm:px-10 lg:px-14 py-8 space-y-8 overflow-hidden">
            {/* Kollabrix Blueprint Grid Background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.06) 1px, transparent 1px)',
                backgroundSize: '42px 42px',
              }}
            />

            {/* Header + Back Button */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-5xl">
              <div className="max-w-2xl">
                <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-sky-400">
                  [ 05 · COLLEGIATE ARSENAL ]
                </p>
                <h1 className="text-3xl sm:text-5xl font-serif font-semibold text-white mt-1.5 leading-tight">
                  {vaultTab === 'overview' && 'Student Arsenal & Blueprints'}
                  {vaultTab === 'perks' && 'Student Perks Vault ($14K+)'}
                  {vaultTab === 'projects' && 'Final Year Project Blueprints'}
                </h1>
                <p className="text-sm text-zinc-400 mt-2">
                  {vaultTab === 'overview' &&
                    'Claim $14,000+ in verified software credits or pick a plagiarism-free Final Year Major Project blueprint.'}
                  {vaultTab === 'perks' &&
                    'Verified developer privileges reserved for college students — claim directly without leaving KΛ FOLIO.'}
                  {vaultTab === 'projects' &&
                    'High-tier, non-cliché architectures with Viva Q&A and IEEE paper angles built to impress external examiners.'}
                </p>
              </div>

              {vaultTab !== 'overview' && (
                <button
                  type="button"
                  onClick={() => setVaultTab('overview')}
                  className="self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#050811] border border-white/15 hover:border-sky-400/50 text-xs font-mono text-zinc-200 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                  <span>Back to Arsenal</span>
                </button>
              )}
            </div>

            {/* VIEW 1: OVERVIEW (2 Creative Kollabrix Blueprint Cards) */}
            {vaultTab === 'overview' && (
              <div className="relative z-10 space-y-8 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Card 1: Student Perks Vault -> Opens In-Place */}
                  <button
                    type="button"
                    onClick={() => setVaultTab('perks')}
                    className="group relative text-left rounded-2xl bg-[#030611]/95 border border-amber-400/25 hover:border-amber-400/75 p-7 transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_35px_rgba(245,158,11,0.2)] flex flex-col justify-between gap-6"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1.5 bg-amber-500/10 border-b border-l border-amber-400/25 rounded-bl-xl text-[10px] font-mono font-bold text-amber-300 tracking-wider">
                      01 · $14,000+ FREE
                    </div>
                    <div className="space-y-3.5 pt-2">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-amber-300" />
                      </div>
                      <h2 className="text-2xl font-serif font-semibold text-white group-hover:text-amber-200 transition-colors">
                        Student Perks Vault
                      </h2>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Claim GitHub Pro, Copilot, AWS Educate, Azure, JetBrains IDEs, and free domains using your college ID.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                      <span>Open Vault In-Place</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Card 2: Final Year Major Project Blueprints */}
                  <button
                    type="button"
                    onClick={() => setVaultTab('projects')}
                    className="group relative text-left rounded-2xl bg-[#030611]/95 border border-sky-400/25 hover:border-sky-400/75 p-7 transition-all duration-300 cursor-pointer overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] hover:shadow-[0_0_35px_rgba(56,189,248,0.2)] flex flex-col justify-between gap-6"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1.5 bg-sky-500/10 border-b border-l border-sky-400/25 rounded-bl-xl text-[10px] font-mono font-bold text-sky-300 tracking-wider">
                      02 · 3RD &amp; 4TH YEAR
                    </div>
                    <div className="space-y-3.5 pt-2">
                      <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center">
                        <Rocket className="w-5 h-5 text-sky-300" />
                      </div>
                      <h2 className="text-2xl font-serif font-semibold text-white group-hover:text-sky-200 transition-colors">
                        Final Year Project Blueprints
                      </h2>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Unique, plagiarism-free major project architectures with Viva Q&amp;A prep &amp; IEEE angles that win A+ grades.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                      <span>Explore Blueprints</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </button>
                </div>

                {/* Quick Cross-Navigation Pills */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/icpc"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#050811] border border-white/10 hover:border-sky-400/40 text-xs font-mono text-zinc-200 transition-all"
                  >
                    <Code2 className="w-3.5 h-3.5 text-sky-300" />
                    <span>Open Practice IDE</span>
                  </Link>
                  <Link
                    href="/arena"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#050811] border border-white/10 hover:border-amber-400/40 text-xs font-mono text-zinc-200 transition-all"
                  >
                    <Swords className="w-3.5 h-3.5 text-amber-300" />
                    <span>Enter KΛ ARENA</span>
                  </Link>
                  <Link
                    href="/spark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#050811] border border-white/10 hover:border-cyan-400/40 text-xs font-mono text-zinc-200 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Launch KΛ AI Studio ↗</span>
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW 2: IN-PLACE STUDENT PERKS VAULT */}
            {vaultTab === 'perks' && (
              <div className="relative z-10 space-y-6 max-w-6xl">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={perkQuery}
                      onChange={(e) => setPerkQuery(e.target.value)}
                      placeholder="Search perks (GitHub, AWS, JetBrains, Azure)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030611] border border-white/10 focus:border-sky-400/50 text-xs text-white placeholder:text-zinc-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'devtools', 'cloud', 'ai', 'domains', 'design'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPerkCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider border cursor-pointer transition-all ${
                          perkCategory === cat
                            ? 'bg-sky-500/20 border-sky-400/60 text-sky-200'
                            : 'bg-[#030611] border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {STUDENT_PERKS.filter(
                    (p) =>
                      (perkCategory === 'all' || p.category === perkCategory) &&
                      (!perkQuery.trim() ||
                        `${p.title} ${p.provider} ${p.shortDescription}`
                          .toLowerCase()
                          .includes(perkQuery.toLowerCase()))
                  ).map((perk) => {
                    const isClaimed = claimedPerkIds.includes(perk.id);
                    const isGuideOpen = activeGuideId === perk.id;
                    return (
                      <div
                        key={perk.id}
                        className="rounded-2xl bg-[#030611]/95 border border-white/10 hover:border-emerald-400/40 p-5 flex flex-col justify-between gap-4 transition-all"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                              {perk.provider}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-mono font-bold text-emerald-300">
                              {perk.value}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{perk.title}</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">{perk.shortDescription}</p>

                          {isGuideOpen && (
                            <div className="mt-3 p-3 rounded-xl bg-[#02040A] border border-white/10 space-y-2">
                              <p className="text-[10px] font-mono uppercase text-sky-300">Claim Steps:</p>
                              {perk.stepByStepGuide.map((s) => (
                                <p key={s.step} className="text-[11px] text-zinc-300">
                                  <span className="text-emerald-400 font-mono mr-1">{s.step}.</span>
                                  {s.title}: {s.description}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveGuideId(isGuideOpen ? null : perk.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[11px] font-mono text-zinc-200 cursor-pointer"
                          >
                            {isGuideOpen ? 'Hide Guide' : 'Claim Guide'}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setClaimedPerkIds((prev) =>
                                  prev.includes(perk.id)
                                    ? prev.filter((id) => id !== perk.id)
                                    : [...prev, perk.id]
                                )
                              }
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono border cursor-pointer ${
                                isClaimed
                                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                                  : 'border-white/10 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {isClaimed ? '✓ Claimed' : 'Mark Claimed'}
                            </button>
                            <a
                              href={perk.claimUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-[11px] font-bold inline-flex items-center gap-1"
                            >
                              <span>Claim</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 3: FINAL YEAR MAJOR PROJECT BLUEPRINTS */}
            {vaultTab === 'projects' && (
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl">
                {MAJOR_PROJECT_BLUEPRINTS.map((prj) => (
                  <div
                    key={prj.id}
                    className="rounded-2xl bg-[#030611]/95 border border-sky-500/20 hover:border-sky-400/60 p-6 space-y-4 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                        {prj.code} · {prj.tag}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-[10px] font-mono text-sky-200">
                        VIVA READY
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{prj.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {prj.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{prj.whyExaminersLoveIt}</p>
                    <div className="p-3 rounded-xl bg-[#02040A] border border-amber-400/20">
                      <p className="text-[10px] font-mono uppercase text-amber-300 mb-1">
                        Examiner Viva Question:
                      </p>
                      <p className="text-xs text-zinc-200 italic">&ldquo;{prj.vivaQuestion}&rdquo;</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            onSelectBookId={(nextBookId) => {
              const target = FOLIO_12_BOOKS.find((b) => b.id === nextBookId);
              if (target) setActiveModalVolume(target);
            }}
            onClose={() => setActiveModalVolume(null)}
          />
        )}
    </div>
  );
}
