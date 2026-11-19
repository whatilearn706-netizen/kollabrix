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

  // Web Audio Context for authentic tactile UI clicks
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

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

  // Mouse wheel scroll to scrub active item
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 120) return;
    if (Math.abs(e.deltaY) > 8) {
      lastWheelTimeRef.current = now;
      playTactileClick();
      if (e.deltaY > 0) {
        setActiveIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
      }
    }
  };

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
          PIERRE SÙ DAY #14 DARK THEME SIDE NAVIGATION DOCK (https://pin.it/7hRmbSaQx)
          - Translucent outer glass halo pill encasing the matte obsidian capsule
          - Top Sparkle (✦) action well launching Applications Hub & AI Spark
          - Sleek dark icons with contrasting tactile solid white circle for active item
          - Crisp tactile click feedback on wheel scroll and navigation
          - 100% transparent container background: page content behind remains fully readable
         ========================================================================= */}
      <aside
        aria-label="Pierre Sù Dark Theme Side Navigation Dock"
        onWheel={handleWheel}
        className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 select-none hidden md:block pointer-events-none"
      >
        {/* Outer Translucent Glass Halo Pill */}
        <div className="relative p-1.5 rounded-full bg-white/[0.04] border border-white/[0.14] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_20px_rgba(255,255,255,0.03)] backdrop-blur-2xl pointer-events-auto transition-all duration-300">
          {/* Inner Matte Obsidian Capsule */}
          <div className="relative flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-full bg-gradient-to-b from-[#1b1c24] via-[#111218] to-[#0d0e14] border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.85)]">
            {/* Top Sparkle (✦) Key - Opens macOS Application Launcher */}
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
                  label: 'Application Launcher (⌘K)',
                  sub: 'Search all portals & tools',
                  x: rect.left,
                  y: rect.top + rect.height / 2,
                });
              }}
              onMouseLeave={() => setHoveredNode(null)}
              aria-label="Open Applications Launchpad"
              className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/[0.1] text-amber-300 hover:text-white transition-all duration-200 active:scale-95 group shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 transition-transform duration-300 group-hover:scale-115 group-hover:rotate-12 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </button>

            {/* Subtle Divider */}
            <div className="w-6 h-[1px] bg-white/[0.1] my-0.5" />

            {/* Navigation Icons Stack */}
            <div className="flex flex-col items-center gap-1.5">
              {DOCK_ITEMS.map((item, index) => {
                const Icon = item.icon;
                const isSelected = activeIndex === index;
                const isRouteActive =
                  pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                const isHighlighted = isSelected || isRouteActive;

                return (
                  <Link
                    key={item.id}
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
                    className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 ${
                      isHighlighted
                        ? 'w-11 h-11 rounded-full bg-white text-zinc-950 shadow-[0_8px_25px_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.6)] font-bold scale-105'
                        : 'w-11 h-11 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08]'
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
          </div>
        </div>
      </aside>

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
