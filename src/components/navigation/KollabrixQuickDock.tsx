'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Trophy,
  Lightbulb,
  Sparkles,
  Command,
  Terminal,
  Calendar,
  FolderClosed,
  MessageSquare,
  Compass,
  Users,
  Briefcase,
  X,
  Search,
  Swords,
  GraduationCap,
  Clock,
  BookOpen,
} from 'lucide-react';

interface DockItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  openInNewTab?: boolean;
}

// Dock items faithfully mapped to Pierre Sù Day #14 Dark Theme Side Navigation (https://pin.it/7hRmbSaQx)
const DOCK_ITEMS: DockItem[] = [
  {
    id: 'hackathons',
    label: 'College Hackathons',
    sub: 'Arena & Squad Matchmaking',
    href: '/hackathons',
    icon: Trophy,
  },
  {
    id: 'war',
    label: 'Campus War ⚔️',
    sub: 'Inter-College Clash & Bounties',
    href: '/war',
    icon: Swords,
  },
  {
    id: 'icpc',
    label: 'Competitive Practice',
    sub: 'Placement OAs & Speedrun',
    href: '/icpc',
    icon: Terminal,
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    sub: 'Professor Engineering Briefs',
    href: '/problems',
    icon: Lightbulb,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    sub: 'Live Hackathon Countdowns',
    href: '/deadlines',
    icon: Calendar,
  },
  {
    id: 'resources',
    label: 'Resources Hub',
    sub: 'Curated Roadmaps & Toolkits',
    href: '/resources',
    icon: FolderClosed,
    openInNewTab: true,
  },
  {
    id: 'feedback',
    label: 'Community Feedback',
    sub: 'Direct Suggestions & Ideas',
    href: '/feedback',
    icon: MessageSquare,
  },
];

interface AppItem {
  id: string;
  name: string;
  category: 'competitions' | 'academics' | 'tools' | 'community';
  href: string;
  icon: React.ElementType;
  gradient: string;
  openInNewTab?: boolean;
}

const APPS_LIST: AppItem[] = [
  {
    id: 'war',
    name: 'Campus War',
    category: 'competitions',
    href: '/war',
    icon: Swords,
    gradient: 'from-amber-500 to-red-600',
  },
  {
    id: 'arena',
    name: 'Battle Arena',
    category: 'competitions',
    href: '/arena',
    icon: Swords,
    gradient: 'from-rose-500 to-purple-600',
  },
  {
    id: 'hackathons',
    name: 'Hackathons',
    category: 'competitions',
    href: '/hackathons',
    icon: Trophy,
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'icpc',
    name: 'Practice',
    category: 'competitions',
    href: '/icpc',
    icon: Terminal,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'problems',
    name: 'Problems',
    category: 'academics',
    href: '/problems',
    icon: Lightbulb,
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  {
    id: 'teacher',
    name: 'Faculty Desk',
    category: 'academics',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'spark',
    name: 'AI Spark',
    category: 'tools',
    href: '/spark',
    icon: Sparkles,
    gradient: 'from-amber-400 to-rose-500',
  },
  {
    id: 'resources',
    name: 'Resources',
    category: 'tools',
    href: '/resources',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-600',
    openInNewTab: true,
  },
  {
    id: 'deadlines',
    name: 'Deadlines',
    category: 'competitions',
    href: '/deadlines',
    icon: Clock,
    gradient: 'from-rose-500 to-red-600',
  },
  {
    id: 'explore',
    name: 'Explore',
    category: 'community',
    href: '/explore',
    icon: Compass,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'teammates',
    name: 'Teammates',
    category: 'community',
    href: '/teammates',
    icon: Users,
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'workspace',
    name: 'Workspace',
    category: 'tools',
    href: '/my-projects',
    icon: Briefcase,
    gradient: 'from-stone-700 to-stone-900',
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    category: 'competitions',
    href: '/leaderboard',
    icon: Trophy,
    gradient: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'feedback',
    name: 'Feedback',
    category: 'community',
    href: '/feedback',
    icon: MessageSquare,
    gradient: 'from-purple-500 to-pink-600',
  },
];

export function KollabrixQuickDock() {
  const pathname = usePathname();
  const router = useRouter();

  // Active Index
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Deck Fold State: when true, deck is outside; when false, whole deck is inside logo
  const [isDeckOpen, setIsDeckOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kollabrix_quick_dock_open');
      if (saved !== null) return saved === 'true';
    }
    return true; // Default to open/visible outside
  });

  const handleToggleDeck = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      }
    } catch {}

    setIsDeckOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kollabrix_quick_dock_open', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Web Audio Context for authentic tactile UI clicks
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastWheelTimeRef = useRef<number>(0);
  const dockAsideRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Smoothly scroll active item into view inside the 4-item viewport
  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    if (activeEl && scrollContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  // Hover state for floating callout card
  const [hoveredNode, setHoveredNode] = useState<{
    id: string;
    label: string;
    sub: string;
    x: number;
    y: number;
  } | null>(null);

  // macOS Applications launchpad modal
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'competitions' | 'academics' | 'tools' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);

  // Sync active dock item with current route
  useEffect(() => {
    const foundIndex = DOCK_ITEMS.findIndex(
      (item) => pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
    );
    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
    }
  }, [pathname]);

  // Synthesize crisp tactile UI pop sound via Web Audio API
  const playTactileClick = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft crisp haptic tactile pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Graceful suppression
    }
  }, []);

  // Check if exam arena or proctored exam is active
  useEffect(() => {
    const checkExam = () => {
      if (typeof document !== 'undefined') {
        setIsExamMode(
          document.body.classList.contains('icpc-exam-mode') ||
          window.location.pathname.startsWith('/icpc/arena')
        );
      }
    };
    checkExam();
    const handleExam = (e: any) => {
      setIsExamMode(Boolean(e.detail?.active));
    };
    window.addEventListener('linkora_exam_mode', handleExam);
    return () => window.removeEventListener('linkora_exam_mode', handleExam);
  }, [pathname]);

  // Clear hover card on window scroll
  useEffect(() => {
    const handleWindowScroll = () => setHoveredNode(null);
    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  // Dedicated wheel listener: prevents background page from jumping & smoothly scrolls the dock
  useEffect(() => {
    const asideEl = dockAsideRef.current;
    if (!asideEl) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const container = scrollContainerRef.current;
      if (!container) return;

      container.scrollTop += e.deltaY;

      const now = Date.now();
      if (now - lastWheelTimeRef.current > 80 && Math.abs(e.deltaY) > 1) {
        lastWheelTimeRef.current = now;
        playTactileClick();
      }
    };

    asideEl.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      asideEl.removeEventListener('wheel', onWheel);
    };
  }, [playTactileClick]);

  // Global ⌘K / Ctrl+K keyboard shortcut opens macOS App Launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        const target = e.target as HTMLElement;
        if (target && target.closest('input, textarea, [contenteditable="true"]')) {
          return;
        }
        e.preventDefault();
        playTactileClick();
        setIsAppsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isAppsModalOpen) {
        setIsAppsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppsModalOpen, playTactileClick]);

  // Hide on homepage, admin, control-center, battle arena, or during active proctored exam
  if (
    pathname === '/' ||
    pathname?.startsWith('/control-center-7x9') ||
    pathname?.startsWith('/arena') ||
    pathname?.startsWith('/admin') ||
    isExamMode
  ) {
    return null;
  }

  const filteredApps = APPS_LIST.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* =========================================================================
          KOLLABRIX QUICK DOCK — SHIFTED TO RIGHT OF MAYANK GOYAL
          - Top Kollabrix Logo Button sits right in navbar next to user profile
          - Tap Logo Button -> Whole deck smoothly gets sucked inside the logo
          - Tap Logo Button Again -> Whole deck springs outside and appears
         ========================================================================= */}
      <div
        ref={dockAsideRef}
        aria-label="Kollabrix Quick Navigation Deck"
        className="relative select-none flex items-center pointer-events-auto"
      >
        {/* The Official Logo Key Button (Shifted to right of Mayank Goyal) */}
        <button
          type="button"
          onClick={handleToggleDeck}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredNode({
              id: 'dock-toggle',
              label: isDeckOpen ? 'Tuck Deck Inside Logo' : 'Expand Deck Outside',
              sub: 'Click to fold or reveal navigation dock',
              x: rect.left,
              y: rect.top + rect.height / 2,
            });
          }}
          onMouseLeave={() => setHoveredNode(null)}
          aria-label={isDeckOpen ? 'Tuck deck inside logo' : 'Expand deck outside'}
          className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl transition-all duration-300 active:scale-95 group cursor-pointer shadow-sm ${
            isDeckOpen
              ? 'bg-amber-500/20 border border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.14] hover:border-amber-400/50 text-slate-300'
          }`}
        >
          <img
            src="/brand/kollabrix-logo.svg?v=20261031_v3squircle"
            alt="Kollabrix Quick Dock"
            className={`w-5 h-5 max-w-[20px] max-h-[20px] object-contain filter drop-shadow-[0_1px_6px_rgba(245,158,11,0.6)] transition-all duration-300 ${
              isDeckOpen ? 'scale-105' : 'group-hover:scale-110'
            }`}
          />
          {/* Subtle amber indicator when deck is folded inside logo */}
          {!isDeckOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-black animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]" />
          )}
        </button>

        {/* The Entire Deck: Sucks inside the logo when closed, emerges outside when open */}
        <div
          className={`absolute right-0 top-full mt-2 z-50 select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-top-right ${
            isDeckOpen
              ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
              : 'scale-0 opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          {/* Outer Translucent Glass Halo Pill */}
          <div className="relative p-1.5 rounded-3xl bg-white/[0.04] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.08)] backdrop-blur-2xl">
            {/* Inner Matte Obsidian Capsule */}
            <div className="relative flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-gradient-to-b from-[#1b1c24]/95 via-[#111218]/95 to-[#0d0e14]/95 border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.85)]">
              {/* Dock Items List */}
              <div
                ref={scrollContainerRef}
                className="flex flex-col items-center gap-1.5 max-h-[290px] overflow-y-auto overflow-x-hidden py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {DOCK_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = activeIndex === index;
                  const isRouteActive =
                    pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  const isHighlighted = isSelected || isRouteActive;

                  return (
                    <Link
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      href={item.href}
                      target={item.openInNewTab ? '_blank' : undefined}
                      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => {
                        setActiveIndex(index);
                        playTactileClick();
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredNode({
                          id: item.id,
                          label: item.label,
                          sub: item.sub,
                          x: rect.left,
                          y: rect.top + rect.height / 2,
                        });
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                      aria-label={item.label}
                      className={`relative flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer active:scale-95 ${
                        isHighlighted
                          ? 'w-10 h-10 rounded-full bg-white text-zinc-950 shadow-[0_6px_20px_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.6)] font-bold scale-105'
                          : 'w-10 h-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 ${
                          isHighlighted ? 'scale-105 stroke-[2.2]' : 'group-hover:scale-110'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Subtle Divider */}
              <div className="w-5 h-[1px] bg-white/[0.12] my-0.5" />

              {/* Hub Launcher Button (⌘K) */}
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setIsAppsModalOpen(true);
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredNode({
                    id: 'apps',
                    label: 'Platform Hub (⌘K)',
                    sub: 'Search all portals & tools',
                    x: rect.left,
                    y: rect.top + rect.height / 2,
                  });
                }}
                onMouseLeave={() => setHoveredNode(null)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Open Platform Hub"
              >
                <Sparkles className="w-4 h-4 fill-current animate-pulse" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Callout Card to the LEFT with Leader Pointer Line */}
      {hoveredNode && (
        <div
          style={{
            top: `${hoveredNode.y}px`,
            left: `${hoveredNode.x - 12}px`,
          }}
          className="fixed -translate-x-full -translate-y-1/2 pointer-events-none z-[9999] animate-in fade-in slide-in-from-right-2 duration-150"
        >
          <div className="relative flex items-center gap-2.5">
            {/* Callout Card */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0d0e14]/95 border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.92),0_0_15px_rgba(255,255,255,0.05)] text-white backdrop-blur-2xl whitespace-nowrap">
              {/* Text Information */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-tight leading-tight">
                  {hoveredNode.label}
                </span>
                {hoveredNode.sub && (
                  <span className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">
                    {hoveredNode.sub}
                  </span>
                )}
              </div>
            </div>

            {/* Dotted Leader Line */}
            <div className="flex items-center">
              <div className="w-2.5 border-t-2 border-dotted border-white/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          macOS APPLICATIONS LAUNCHPAD MODAL
         ========================================================================= */}
      {isAppsModalOpen && (
        <div
          onClick={() => setIsAppsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[580px] rounded-3xl bg-[#181614]/95 border border-white/12 shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-200 text-white select-none pointer-events-auto"
          >
            {/* Window Top Bar: macOS Traffic Lights + Title */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5">
                  <span
                    onClick={() => setIsAppsModalOpen(false)}
                    className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>
                <h3 className="text-sm font-black tracking-tight text-white/95 flex items-center gap-1.5 ml-2">
                  <span>⚡ Applications</span>
                </h3>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAppsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-4">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search portals, tools, or challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full rounded-2xl bg-white/6 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400/80 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 mt-3 pb-1 overflow-x-auto scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'competitions', label: 'Competitions' },
                  { id: 'academics', label: 'Academics' },
                  { id: 'tools', label: 'Tools' },
                  { id: 'community', label: 'Community' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'bg-white/6 hover:bg-white/10 text-stone-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Grid of Apps (macOS Launchpad style) */}
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-4 py-5 max-h-[380px] overflow-y-auto">
              {filteredApps.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => {
                      setIsAppsModalOpen(false);
                      if (app.openInNewTab) {
                        window.open(app.href, '_blank', 'noopener,noreferrer');
                      } else {
                        router.push(app.href);
                      }
                    }}
                    className="group flex flex-col items-center justify-center p-2 rounded-2xl hover:bg-white/6 transition-all duration-200 cursor-pointer text-center"
                  >
                    {/* App Squircle Icon */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${app.gradient} border border-white/20 shadow-xl flex items-center justify-center group-hover:scale-110 active:scale-95 transition-all duration-200 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]`}
                    >
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />
                    </div>

                    {/* App Name */}
                    <span className="text-xs font-semibold text-white/90 group-hover:text-amber-300 mt-2 tracking-tight transition-colors truncate max-w-full">
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Window Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
              <span className="font-mono">Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-[10px] text-white">ESC</kbd> to dismiss</span>
              <span className="text-stone-400">Kollabrix Platform Hub</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
