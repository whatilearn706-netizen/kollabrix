'use client';

import React, { useState, useEffect, useRef } from 'react';
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
    tone: 'brand',
  },
  {
    id: 'hackathons',
    label: 'College Hackathons',
    sub: 'Arena & Squad Matchmaking',
    href: '/hackathons',
    icon: Trophy,
    tone: 'amber',
  },
  {
    id: 'icpc',
    label: 'Competitive Practice',
    sub: 'Placement OAs & Speedrun',
    href: '/icpc',
    icon: Terminal,
    tone: 'cyan',
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    sub: 'Professor Engineering Briefs',
    href: '/problems',
    icon: Lightbulb,
    tone: 'violet',
  },
  {
    id: 'faculty',
    label: 'Faculty Portal',
    sub: 'Educator Desk & Review',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    tone: 'emerald',
  },
  {
    id: 'resources',
    label: 'Resources Hub',
    sub: 'Curated Roadmaps & Compilers',
    href: '/resources',
    icon: BookOpen,
    tone: 'brand',
    openInNewTab: true,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    sub: 'Live Hackathon Countdowns',
    href: '/deadlines',
    icon: Clock,
    tone: 'rose',
  },
  {
    id: 'feedback',
    label: 'Community Feedback',
    sub: 'Direct Suggestions & Ideas',
    href: '/feedback',
    icon: MessageSquare,
    tone: 'violet',
  },
];

const TONE_STYLES = {
  amber: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    border: 'border-amber-500/50 hover:border-amber-400',
    text: 'text-amber-400 group-hover:text-amber-300',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
  violet: {
    bg: 'bg-violet-500/10 hover:bg-violet-500/20',
    border: 'border-violet-500/50 hover:border-violet-400',
    text: 'text-violet-400 group-hover:text-violet-300',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  emerald: {
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
    border: 'border-emerald-500/50 hover:border-emerald-400',
    text: 'text-emerald-400 group-hover:text-emerald-300',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  cyan: {
    bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    border: 'border-cyan-500/50 hover:border-cyan-400',
    text: 'text-cyan-400 group-hover:text-cyan-300',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  brand: {
    bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    border: 'border-indigo-500/50 hover:border-indigo-400',
    text: 'text-indigo-400 group-hover:text-indigo-300',
    glow: 'rgba(99, 102, 241, 0.45)',
  },
  rose: {
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    border: 'border-rose-500/50 hover:border-rose-400',
    text: 'text-rose-400 group-hover:text-rose-300',
    glow: 'rgba(244, 63, 94, 0.45)',
  },
};

// 5 Circular clock positions along the arc
const NODE_POSITIONS = [
  { x: 106, y: 54 },  // Node 01 (1 o'clock)
  { x: 53,  y: 135 }, // Node 02 (2 o'clock)
  { x: 35,  y: 230 }, // Node 03 (3 o'clock / apex)
  { x: 53,  y: 325 }, // Node 04 (4 o'clock)
  { x: 106, y: 407 }, // Node 05 (5 o'clock)
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

  // Rotation start index (0 to 7) for clock dial
  const [startIndex, setStartIndex] = useState<number>(0);
  const [tickTrigger, setTickTrigger] = useState<number>(0);

  // Web Audio Context & Tick/Tock alternator for authentic clock sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isTickRef = useRef<boolean>(true);
  const lastWheelTimeRef = useRef<number>(0);

  // Hovered node state for floating callout card
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

  // Synthesize realistic mechanical clock tick/tock via Web Audio API
  const playClockTick = () => {
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
      const isTick = isTickRef.current;
      isTickRef.current = !isTick;

      // 1. Primary mechanical escapement impulse (~1650Hz Tick, ~1320Hz Tock)
      const baseFreq = isTick ? 1650 : 1320;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.016);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);

      // 2. High-frequency metallic gear click (filtered noise burst)
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * 0.012);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(isTick ? 2400 : 2000, now);
      bandpass.Q.setValueAtTime(4.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.09, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.016);
    } catch {
      // Audio error suppressed gracefully
    }
  };

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

  // Discrete mechanical clock rotation step up
  const rotateUp = () => {
    setStartIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
    setTickTrigger((prev) => prev + 1);
    playClockTick();
  };

  // Discrete mechanical clock rotation step down
  const rotateDown = () => {
    setStartIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
    setTickTrigger((prev) => prev + 1);
    playClockTick();
  };

  // Clock scroll listener (throttled to discrete ticks)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 140) return; // Crisp mechanical clock pacing
    if (Math.abs(e.deltaY) > 12) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        rotateDown();
      } else {
        rotateUp();
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
        setIsAppsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isAppsModalOpen) {
        setIsAppsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppsModalOpen]);

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

  // 5 active visible nodes mapped to the circular clock positions
  const visibleNodes = [0, 1, 2, 3, 4].map((slotIndex) => {
    const itemIndex = (startIndex + slotIndex) % DOCK_ITEMS.length;
    const item = DOCK_ITEMS[itemIndex];
    const nodeNumber = String(slotIndex + 1).padStart(2, '0');
    return {
      slotIndex,
      itemIndex,
      item,
      nodeNumber,
      pos: NODE_POSITIONS[slotIndex],
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
          CLOCK-STYLE CIRCULAR QUICK DOCK (100% Transparent, Clock Scroll & Sound)
          - Transparent background: text underneath remains 100% readable & clickable
          - Opaque blocking lines and ribbon completely removed
          - Discrete clock rotation steps with mechanical tick-tock audio synthesis
          - 5 floating circular clock markers (01, 02, 03, 04, 05)
          - Central Command (⌘) hub
         ========================================================================= */}
      <aside
        aria-label="Kollabrix Clock Dial Dock"
        onWheel={handleWheel}
        className="fixed right-1 sm:right-3 top-1/2 -translate-y-1/2 z-40 select-none hidden md:block pointer-events-none"
      >
        <div className="relative w-[155px] h-[460px] bg-transparent pointer-events-none">
          {/* Top Clock Step Arrow (Above Node 01) */}
          <button
            type="button"
            onClick={rotateUp}
            aria-label="Rotate clock dial up"
            className="absolute top-1 right-[26px] z-20 w-7 h-6 flex items-center justify-center rounded-full text-amber-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer pointer-events-auto group"
          >
            <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </button>

          {/* 5 Circular Clock Markers floating along the arc (01, 02, 03, 04, 05) */}
          {visibleNodes.map(({ slotIndex, item, nodeNumber, pos }) => {
            const Icon = item.icon;
            const style = TONE_STYLES[item.tone] || TONE_STYLES.amber;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <div
                key={`${item.id}-${slotIndex}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredNode({
                    item,
                    nodeNumber,
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
                  aria-label={`${nodeNumber} - ${item.label}`}
                  className={`group relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 active:scale-90 focus:outline-none cursor-pointer ${
                    isActive
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_18px_rgba(245,158,11,0.55)] scale-105'
                      : 'border-slate-700/80 hover:border-amber-400 bg-[#0e1220]/80 hover:bg-[#161c32]/95 backdrop-blur-xs shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:scale-110'
                  }`}
                >
                  {/* Clock Index Badge (01, 02, 03, 04, 05) */}
                  <span className="absolute -top-1.5 -left-1 text-[9px] font-mono font-bold px-1 py-0.2 rounded-full bg-[#0a0d18] text-slate-300 border border-slate-700/80 select-none">
                    {nodeNumber}
                  </span>

                  {/* Icon */}
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${style.text}`}
                  />

                  {/* Active Page Indicator */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                  )}
                </Link>
              </div>
            );
          })}

          {/* Central Command (⌘) Clock Hub Button */}
          <div
            style={{ left: '116px', top: '230px' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredNode({
                item: {
                  id: 'cmd',
                  label: 'Applications (⌘K)',
                  sub: 'macOS Launchpad Grid',
                  href: '#',
                  icon: Command,
                  tone: 'violet',
                },
                nodeNumber: '⌘',
                x: rect.left,
                y: rect.top + rect.height / 2,
              });
            }}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <button
              type="button"
              onClick={() => setIsAppsModalOpen(true)}
              aria-label="Open Applications Launchpad"
              className="relative flex items-center justify-center w-9 h-9 rounded-full border border-violet-500/40 bg-[#120f24]/85 hover:bg-violet-600 text-violet-400 hover:text-white transition-all duration-200 active:scale-95 group focus:outline-none shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_0_16px_rgba(168,85,247,0.5)] cursor-pointer"
            >
              <Command className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" />
            </button>
          </div>

          {/* Bottom Clock Step Arrow (Below Node 05) */}
          <button
            type="button"
            onClick={rotateDown}
            aria-label="Rotate clock dial down"
            className="absolute bottom-1 right-[26px] z-20 w-7 h-6 flex items-center justify-center rounded-full text-amber-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 cursor-pointer pointer-events-auto group"
          >
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
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
              {/* Node Number Badge */}
              <div className="w-6 h-6 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
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

            {/* Dotted Leader Line pointing directly to the hovered node */}
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
