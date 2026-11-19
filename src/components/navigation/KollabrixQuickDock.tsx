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
    bg: 'bg-amber-500/15 hover:bg-amber-500/25',
    border: 'border-amber-500/40 hover:border-amber-400',
    text: 'text-amber-400 group-hover:text-amber-300',
    glow: 'rgba(245, 158, 11, 0.45)',
    dot: 'bg-amber-400 text-amber-400',
  },
  violet: {
    bg: 'bg-violet-500/15 hover:bg-violet-500/25',
    border: 'border-violet-500/40 hover:border-violet-400',
    text: 'text-violet-400 group-hover:text-violet-300',
    glow: 'rgba(168, 85, 247, 0.45)',
    dot: 'bg-violet-400 text-violet-400',
  },
  emerald: {
    bg: 'bg-emerald-500/15 hover:bg-emerald-500/25',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    text: 'text-emerald-400 group-hover:text-emerald-300',
    glow: 'rgba(16, 185, 129, 0.45)',
    dot: 'bg-emerald-400 text-emerald-400',
  },
  cyan: {
    bg: 'bg-cyan-500/15 hover:bg-cyan-500/25',
    border: 'border-cyan-500/40 hover:border-cyan-400',
    text: 'text-cyan-400 group-hover:text-cyan-300',
    glow: 'rgba(6, 182, 212, 0.45)',
    dot: 'bg-cyan-400 text-cyan-400',
  },
  brand: {
    bg: 'bg-indigo-500/15 hover:bg-indigo-500/25',
    border: 'border-indigo-500/40 hover:border-indigo-400',
    text: 'text-indigo-400 group-hover:text-indigo-300',
    glow: 'rgba(99, 102, 241, 0.45)',
    dot: 'bg-indigo-400 text-indigo-400',
  },
  rose: {
    bg: 'bg-rose-500/15 hover:bg-rose-500/25',
    border: 'border-rose-500/40 hover:border-rose-400',
    text: 'text-rose-400 group-hover:text-rose-300',
    glow: 'rgba(244, 63, 94, 0.45)',
    dot: 'bg-rose-400 text-rose-400',
  },
};

// Exact circular arc node coordinates (Center X=288.9, Y=230, Radius=254)
const NODE_POSITIONS = [
  { x: 106, y: 54 },  // Node 01 (top)
  { x: 53,  y: 135 }, // Node 02 (upper-mid)
  { x: 35,  y: 230 }, // Node 03 (apex / furthest to left)
  { x: 53,  y: 325 }, // Node 04 (lower-mid)
  { x: 106, y: 407 }, // Node 05 (bottom)
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

  // Rotation start index: 5 nodes displayed from startIndex along circular dial
  const [startIndex, setStartIndex] = useState<number>(0);

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

  // Mouse wheel rotation along circular arc
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 16) {
      if (e.deltaY > 0) {
        setStartIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
      } else {
        setStartIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
      }
    }
  };

  const rotateUp = () => {
    setStartIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
  };

  const rotateDown = () => {
    setStartIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
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

  // 5 active visible nodes mapped to the circular positions
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
          CIRCULAR ARC QUICK DOCK (Exact Mirrored Match to 5-Pillar Arc in Dark Theme)
          - Curved ribbon track curving to the left into the screen
          - 5 circular node pods (01, 02, 03, 04, 05) with dark glass styling
          - Circular wheel rotation via scroll or step arrows
          - Hover leader lines pointing to leftward callout cards
          - Central Command (⌘) launchpad trigger
         ========================================================================= */}
      <aside
        aria-label="Kollabrix Circular Quick Dock"
        onWheel={handleWheel}
        className="fixed right-1 sm:right-3 top-1/2 -translate-y-1/2 z-40 select-none hidden md:block pointer-events-auto"
      >
        <div className="relative w-[155px] h-[460px]">
          {/* SVG Background: Mirrored Curved Ribbon Track & Concentric Guide Lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 160 460"
            fill="none"
          >
            <defs>
              {/* Glowing neon stroke gradient */}
              <linearGradient id="arcGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>

              {/* Dark glass ribbon fill gradient */}
              <linearGradient id="trackGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0a0d18" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#101424" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#0a0d18" stopOpacity="0.95" />
              </linearGradient>

              {/* Outer soft shadow filter */}
              <filter id="arcShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="-4" dy="4" stdDeviation="12" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* 1. Outer Accent Guide Line (Mirrored Image 1) */}
            <path
              d="M 125 35 A 278 278 0 0 0 125 425"
              fill="none"
              stroke="rgba(245, 158, 11, 0.22)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />

            {/* 2. Main Curved Ribbon Track (Shadow + Body + Border) */}
            <path
              d="M 115 45 A 254 254 0 0 0 115 415"
              fill="none"
              stroke="url(#trackGlass)"
              strokeWidth="50"
              strokeLinecap="round"
              filter="url(#arcShadow)"
            />
            <path
              d="M 115 45 A 254 254 0 0 0 115 415"
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="51"
              strokeLinecap="round"
            />

            {/* 3. Glowing Center Line Track */}
            <path
              d="M 115 45 A 254 254 0 0 0 115 415"
              fill="none"
              stroke="url(#arcGlow)"
              strokeWidth="1.5"
              opacity="0.65"
            />

            {/* 4. Inner Concentric Arc Guide (Dashed line like Image 1) */}
            <path
              d="M 145 77 A 210 210 0 0 0 145 383"
              fill="none"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Top Rotation Step Arrow (Above Node 01) */}
          <button
            type="button"
            onClick={rotateUp}
            aria-label="Rotate dial up"
            className="absolute top-1 right-[26px] z-20 w-7 h-5 flex items-center justify-center text-amber-400 hover:text-white transition-all active:scale-90 cursor-pointer group"
          >
            <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
          </button>

          {/* 5 Circular Node Pods along the Arc (01, 02, 03, 04, 05) */}
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
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
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
                  className={`group relative flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300 active:scale-95 focus:outline-none cursor-pointer ${
                    isActive
                      ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.55)] scale-105'
                      : 'border-slate-700/80 hover:border-amber-400/90 bg-[#121626]/95 hover:bg-[#1a2138] shadow-[0_8px_20px_rgba(0,0,0,0.7)] hover:scale-110'
                  }`}
                >
                  {/* Micro Index Badge (01, 02, 03, 04, 05) */}
                  <span className="absolute -top-1.5 -left-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#0a0d18] text-slate-300 border border-slate-700/80 shadow-xs select-none">
                    {nodeNumber}
                  </span>

                  {/* Icon */}
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${style.text}`}
                  />

                  {/* Active Page Indicator */}
                  {isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                  )}
                </Link>
              </div>
            );
          })}

          {/* Central Command (⌘) Hub Button (Mirrors Image 1 Center Disc) */}
          <div
            style={{ left: '116px', top: '230px' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
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
              className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-violet-500/50 bg-[#141226]/95 hover:bg-violet-600 text-violet-400 hover:text-white transition-all duration-300 active:scale-95 group focus:outline-none shadow-[0_8px_24px_rgba(0,0,0,0.85)] hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] cursor-pointer"
            >
              <Command className="w-4 h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </button>
          </div>

          {/* Bottom Rotation Step Arrow (Below Node 05) */}
          <button
            type="button"
            onClick={rotateDown}
            aria-label="Rotate dial down"
            className="absolute bottom-1 right-[26px] z-20 w-7 h-5 flex items-center justify-center text-amber-400 hover:text-white transition-all active:scale-90 cursor-pointer group"
          >
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </aside>

      {/* Floating Callout Card to the LEFT with Leader Pointer Line (Mirrors Image 1) */}
      {hoveredNode && (
        <div
          style={{
            top: `${hoveredNode.y}px`,
            left: `${hoveredNode.x - 12}px`,
          }}
          className="fixed -translate-x-full -translate-y-1/2 pointer-events-none z-[9999] animate-in fade-in slide-in-from-right-2 duration-150"
        >
          <div className="relative flex items-center gap-3">
            {/* Callout Card */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#0c101d]/95 border border-slate-700/80 shadow-[0_16px_50px_rgba(0,0,0,0.92)] text-white backdrop-blur-2xl whitespace-nowrap">
              {/* Node Number Badge */}
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {hoveredNode.nodeNumber}
              </div>

              {/* Text Information */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-tight leading-tight">
                  {hoveredNode.item.label}
                </span>
                {hoveredNode.item.sub && (
                  <span className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                    {hoveredNode.item.sub}
                  </span>
                )}
              </div>
            </div>

            {/* Dotted Leader Line pointing directly to the hovered node */}
            <div className="flex items-center">
              <div className="w-3 border-t-2 border-dotted border-amber-400/80" />
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
            className="w-full max-w-[580px] rounded-3xl bg-[#181614]/95 border border-white/12 shadow-[0_30px_100px_rgba(0,0,0,0.85)] p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-200 text-white select-none"
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
