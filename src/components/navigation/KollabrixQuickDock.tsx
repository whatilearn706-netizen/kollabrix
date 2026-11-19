'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Trophy,
  Lightbulb,
  GraduationCap,
  Sparkles,
  Command,
  ChevronDown,
  ChevronUp,
  Terminal,
  BookOpen,
  Clock,
  MessageSquare,
  Compass,
  Users,
  Briefcase,
  X,
  Search,
  Swords,
} from 'lucide-react';

interface DockItem {
  id: string;
  label: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  keyLabel?: string;
  tone: 'amber' | 'violet' | 'emerald' | 'cyan' | 'brand' | 'rose';
  openInNewTab?: boolean;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'campus-war',
    label: 'Campus War ⚔️',
    sub: 'Inter-College Clash & Bounties',
    href: '/war',
    icon: Swords,
    keyLabel: 'WAR',
    tone: 'brand',
  },
  {
    id: 'hackathons',
    label: 'College Hackathons',
    sub: 'Arena & Squad Matchmaking',
    href: '/hackathons',
    icon: Trophy,
    keyLabel: 'HACK',
    tone: 'amber',
  },
  {
    id: 'icpc',
    label: 'Competitive Practice',
    sub: 'Placement OAs & Speedrun',
    href: '/icpc',
    icon: Terminal,
    keyLabel: 'CODE',
    tone: 'cyan',
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    sub: 'Professor Engineering Briefs',
    href: '/problems',
    icon: Lightbulb,
    keyLabel: 'SPEC',
    tone: 'violet',
  },
  {
    id: 'faculty',
    label: 'Faculty Portal',
    sub: 'Educator Desk & Review',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    keyLabel: 'DESK',
    tone: 'emerald',
  },
  {
    id: 'resources',
    label: 'Resources Hub',
    sub: 'Curated Roadmaps & Compilers',
    href: '/resources',
    icon: BookOpen,
    keyLabel: 'DOCS',
    tone: 'brand',
    openInNewTab: true,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    sub: 'Live Hackathon Countdowns',
    href: '/deadlines',
    icon: Clock,
    keyLabel: 'TIME',
    tone: 'rose',
  },
  {
    id: 'feedback',
    label: 'Community Feedback',
    sub: 'Direct Suggestions & Ideas',
    href: '/feedback',
    icon: MessageSquare,
    keyLabel: 'CHAT',
    tone: 'violet',
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

  // Scroll index for the keycaps stack
  const [startIndex, setStartIndex] = useState<number>(0);

  // Web Audio Context for realistic mechanical keyboard typing sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Hovered keycap state for floating tooltip card
  const [hoveredNode, setHoveredNode] = useState<{
    item: DockItem;
    nodeNumber: string;
    x: number;
    y: number;
  } | null>(null);

  // macOS Applications launch modal
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'competitions' | 'academics' | 'tools' | 'community'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExamMode, setIsExamMode] = useState(false);

  // Synthesize realistic mechanical keyboard typing sound via Web Audio API
  const playKeyboardTypingSound = useCallback(() => {
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
      // Realistic ±8% pitch variation simulating different keycap positions & switch tolerances
      const pitchJitter = 0.92 + Math.random() * 0.16;

      // 1. Resonant Mechanical Thock (Plastic keycap bottoming out on PCB plate)
      const thockOsc = ctx.createOscillator();
      const thockGain = ctx.createGain();
      const thockFilter = ctx.createBiquadFilter();

      thockOsc.type = 'triangle';
      thockOsc.frequency.setValueAtTime(440 * pitchJitter, now);
      thockOsc.frequency.exponentialRampToValueAtTime(140 * pitchJitter, now + 0.022);

      thockFilter.type = 'lowpass';
      thockFilter.frequency.setValueAtTime(1400 * pitchJitter, now);

      thockGain.gain.setValueAtTime(0.24, now);
      thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      thockOsc.connect(thockFilter);
      thockFilter.connect(thockGain);
      thockGain.connect(ctx.destination);

      thockOsc.start(now);
      thockOsc.stop(now + 0.028);

      // 2. Crisp Tactile Stem Click (Plastic leaf actuation snap)
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 0.007);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
      }

      const clickSource = ctx.createBufferSource();
      clickSource.buffer = buffer;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime(4800 * pitchJitter, now);
      clickFilter.Q.setValueAtTime(3.8, now);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.18, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      clickSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickSource.start(now);
      clickSource.stop(now + 0.014);
    } catch {
      // Gracefully ignore audio errors if blocked by browser policy
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

  // Discrete keycap scroll steps
  const scrollUp = useCallback(() => {
    setStartIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
    playKeyboardTypingSound();
  }, [playKeyboardTypingSound]);

  const scrollDown = useCallback(() => {
    setStartIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
    playKeyboardTypingSound();
  }, [playKeyboardTypingSound]);

  // Mechanical keyboard wheel scroll listener
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 120) return; // Crisp mechanical keystroke pacing
    if (Math.abs(e.deltaY) > 10) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        scrollDown();
      } else {
        scrollUp();
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
        playKeyboardTypingSound();
        setIsAppsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isAppsModalOpen) {
        setIsAppsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppsModalOpen, playKeyboardTypingSound]);

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

  // 4 Visible mechanical keycap slots matching Image 2:
  // Slot 0: Chalk White Keycap ("BREAK")
  // Slot 1: Translucent Emerald Artisan Keycap ("THE") with internal cross stem
  // Slot 2: Chalk White Keycap ("SCROLL")
  // Slot 3: Mint Green Keycap (Mascot / Icon)
  const visibleSlots = [0, 1, 2, 3].map((slotIdx) => {
    const itemIndex = (startIndex + slotIdx) % DOCK_ITEMS.length;
    const item = DOCK_ITEMS[itemIndex];
    const nodeNumber = String(slotIdx + 1).padStart(2, '0');
    return {
      slotIdx,
      itemIndex,
      item,
      nodeNumber,
    };
  });

  const filteredApps = APPS_LIST.filter((app) => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* =========================================================================
          MECHANICAL KEYCAPS DOCK (Matching 2nd Image Reference)
          - Stack of physical mechanical keyboard keycaps:
            • Chalk White Keycap ("BREAK")
            • Translucent Emerald Artisan Keycap ("THE") with switch stem cross '+'
            • Chalk White Keycap ("SCROLL")
            • Mint Green Keycap (Mascot / Icon)
            • Bottom ⌘ Command Keycap (Launchpad)
          - Keyboard typing audio synthesized on scroll & click
          - Fully transparent backdrop: text behind remains 100% readable
         ========================================================================= */}
      <aside
        aria-label="Mechanical Keycaps Quick Dock"
        onWheel={handleWheel}
        className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none hidden md:block pointer-events-none"
      >
        <div className="relative flex flex-col items-center gap-2.5 p-1 bg-transparent pointer-events-none">
          {/* Top Step Keycap Arrow (Scroll Up) */}
          <button
            type="button"
            onClick={scrollUp}
            aria-label="Scroll keycaps up"
            className="flex items-center justify-center w-7 h-5 rounded-md bg-[#131622]/80 hover:bg-white/20 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:translate-y-0.5 pointer-events-auto cursor-pointer shadow-[0_2px_0_#090b12]"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Vertical Keycaps Stack (4 Physical Keycaps matching Image 2) */}
          <div className="flex flex-col items-center gap-2.5">
            {visibleSlots.map(({ slotIdx, item, nodeNumber }) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

              // Keycap Profile Styling matching Image 2
              let keycapClasses = '';
              let textColor = '';
              let isArtisanEmerald = false;

              if (slotIdx === 0 || slotIdx === 2) {
                // CHALK WHITE KEYCAP (Like "BREAK" & "SCROLL" in Image 2)
                keycapClasses =
                  'bg-gradient-to-b from-[#ffffff] via-[#f8fafc] to-[#e2e8f0] border-t border-l border-white shadow-[0_5px_0_#94a3b8,0_10px_20px_rgba(0,0,0,0.65)] hover:shadow-[0_6px_0_#94a3b8,0_12px_22px_rgba(0,0,0,0.7)] active:translate-y-[3px] active:shadow-[0_2px_0_#94a3b8,0_4px_10px_rgba(0,0,0,0.5)]';
                textColor = 'text-slate-900 group-hover:text-black';
              } else if (slotIdx === 1) {
                // TRANSLUCENT EMERALD ARTISAN KEYCAP (Like "THE" in Image 2)
                isArtisanEmerald = true;
                keycapClasses =
                  'bg-emerald-500/25 hover:bg-emerald-500/35 border border-emerald-400/60 shadow-[0_5px_0_#065f46,0_10px_22px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_0_#065f46,0_12px_24px_rgba(16,185,129,0.45)] active:translate-y-[3px] active:shadow-[0_2px_0_#065f46,0_4px_10px_rgba(16,185,129,0.25)] backdrop-blur-md';
                textColor = 'text-emerald-300 group-hover:text-emerald-200';
              } else {
                // MINT GREEN KEYCAP (Like bottom mascot keycap in Image 2)
                keycapClasses =
                  'bg-gradient-to-b from-[#34d399] to-[#059669] border-t border-l border-emerald-200/60 shadow-[0_5px_0_#064e3b,0_10px_20px_rgba(0,0,0,0.65)] hover:shadow-[0_6px_0_#064e3b,0_12px_22px_rgba(0,0,0,0.7)] active:translate-y-[3px] active:shadow-[0_2px_0_#064e3b,0_4px_10px_rgba(0,0,0,0.5)]';
                textColor = 'text-slate-950 group-hover:text-black';
              }

              return (
                <div
                  key={`${item.id}-${slotIdx}`}
                  className="pointer-events-auto"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredNode({
                      item,
                      nodeNumber: item.keyLabel || nodeNumber,
                      x: rect.left,
                      y: rect.top + rect.height / 2,
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <Link
                    href={item.href}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    onClick={() => playKeyboardTypingSound()}
                    aria-label={`${item.label} Keycap`}
                    className={`group relative flex flex-col items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-2xl transition-all duration-150 cursor-pointer ${keycapClasses} ${
                      isActive ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black' : ''
                    }`}
                  >
                    {/* Keycap Dish Inner Highlight */}
                    <div className="absolute inset-1 rounded-xl bg-gradient-to-b from-white/30 via-transparent to-black/10 pointer-events-none" />

                    {/* Translucent Artisan Internal Stem Cross '+' (For Emerald Keycap in Image 2) */}
                    {isArtisanEmerald && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                        {/* Circular Switch Stem Housing Ring */}
                        <div className="w-5 h-5 rounded-full border border-emerald-300/40 flex items-center justify-center">
                          {/* Cross Stem '+' */}
                          <div className="w-2.5 h-0.5 bg-emerald-300/70 rounded-xs" />
                          <div className="absolute w-0.5 h-2.5 bg-emerald-300/70 rounded-xs" />
                        </div>
                      </div>
                    )}

                    {/* Micro Sub-legend Top-Left */}
                    <span
                      className={`absolute top-1 left-1.5 text-[8px] font-mono font-bold tracking-tight select-none opacity-60 ${textColor}`}
                    >
                      {item.keyLabel || nodeNumber}
                    </span>

                    {/* Keycap Center Icon */}
                    <Icon
                      className={`relative z-10 w-4 h-4 transition-transform duration-150 group-hover:scale-110 drop-shadow-xs ${textColor}`}
                    />

                    {/* Active Page Glow Indicator */}
                    {isActive && (
                      <span className="absolute bottom-1 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Central Command ⌘ Keycap (Opens App Launcher Modal) */}
          <div
            className="pointer-events-auto mt-0.5"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredNode({
                item: {
                  id: 'cmd',
                  label: 'Launchpad (⌘K)',
                  sub: 'Search all platforms & tools',
                  href: '#',
                  icon: Command,
                  tone: 'violet',
                },
                nodeNumber: '⌘K',
                x: rect.left,
                y: rect.top + rect.height / 2,
              });
            }}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <button
              type="button"
              onClick={() => {
                playKeyboardTypingSound();
                setIsAppsModalOpen(true);
              }}
              aria-label="Open Applications Launchpad"
              className="group relative flex flex-col items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-b from-[#1c1b2b] to-[#100f1c] border-t border-l border-violet-400/40 shadow-[0_4px_0_#07060f,0_8px_16px_rgba(0,0,0,0.8)] text-violet-300 hover:text-white transition-all duration-150 active:translate-y-[2px] active:shadow-[0_2px_0_#07060f] cursor-pointer"
            >
              <div className="absolute inset-1 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              <Command className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
            </button>
          </div>

          {/* Bottom Step Keycap Arrow (Scroll Down) */}
          <button
            type="button"
            onClick={scrollDown}
            aria-label="Scroll keycaps down"
            className="flex items-center justify-center w-7 h-5 rounded-md bg-[#131622]/80 hover:bg-white/20 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:translate-y-0.5 pointer-events-auto cursor-pointer shadow-[0_2px_0_#090b12]"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Floating Callout Card to the LEFT with Leader Pointer Line */}
      {hoveredNode && (
        <div
          style={{
            top: `${hoveredNode.y}px`,
            left: `${hoveredNode.x - 10}px`,
          }}
          className="fixed -translate-x-full -translate-y-1/2 pointer-events-none z-[9999] animate-in fade-in slide-in-from-right-2 duration-150"
        >
          <div className="relative flex items-center gap-2.5">
            {/* Callout Card */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0c101d]/95 border border-slate-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.92)] text-white backdrop-blur-2xl whitespace-nowrap">
              {/* Keycap Badge */}
              <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                {hoveredNode.nodeNumber}
              </div>

              {/* Text Information */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-tight leading-tight">
                  {hoveredNode.item.label}
                </span>
                {hoveredNode.item.sub && (
                  <span className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
                    {hoveredNode.item.sub}
                  </span>
                )}
              </div>
            </div>

            {/* Dotted Leader Line */}
            <div className="flex items-center">
              <div className="w-2.5 border-t-2 border-dotted border-amber-400/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
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
