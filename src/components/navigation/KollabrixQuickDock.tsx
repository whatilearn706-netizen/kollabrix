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

const TONE_COLORS = {
  amber: {
    rim: 'rgba(245, 158, 11, 0.7)',
    text: 'text-amber-400 group-hover:text-amber-300',
    glow: 'rgba(245, 158, 11, 0.45)',
  },
  violet: {
    rim: 'rgba(168, 85, 247, 0.7)',
    text: 'text-violet-400 group-hover:text-violet-300',
    glow: 'rgba(168, 85, 247, 0.45)',
  },
  emerald: {
    rim: 'rgba(16, 185, 129, 0.7)',
    text: 'text-emerald-400 group-hover:text-emerald-300',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  cyan: {
    rim: 'rgba(6, 182, 212, 0.7)',
    text: 'text-cyan-400 group-hover:text-cyan-300',
    glow: 'rgba(6, 182, 212, 0.45)',
  },
  brand: {
    rim: 'rgba(99, 102, 241, 0.7)',
    text: 'text-indigo-400 group-hover:text-indigo-300',
    glow: 'rgba(99, 102, 241, 0.45)',
  },
  rose: {
    rim: 'rgba(244, 63, 94, 0.7)',
    text: 'text-rose-400 group-hover:text-rose-300',
    glow: 'rgba(244, 63, 94, 0.45)',
  },
};

// 5 3D Conveyor Track positions (Matching the curved conveyor in the Pinterest ref)
const CONVEYOR_SLOTS = [
  { x: 80, y: 55,  scale: 0.82, rotateX: 22,  rotateY: -12, zIndex: 12 }, // Position 0: Top entrance
  { x: 60, y: 145, scale: 0.94, rotateX: 14,  rotateY: -7,  zIndex: 18 }, // Position 1: Upper approach
  { x: 44, y: 240, scale: 1.15, rotateX: 0,   rotateY: 0,   zIndex: 30 }, // Position 2: THE PORTAL GATE (Active Center)
  { x: 60, y: 335, scale: 0.94, rotateX: -14, rotateY: -7,  zIndex: 18 }, // Position 3: Lower exit
  { x: 80, y: 425, scale: 0.82, rotateX: -22, rotateY: -12, zIndex: 12 }, // Position 4: Bottom terminus
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

  // Scroll index for the conveyor track
  const [startIndex, setStartIndex] = useState<number>(0);

  // Web Audio Context for realistic kinetic portal conveyor sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Hovered token state for floating callout card
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

  // Synthesize kinetic magnetic portal activation + metallic coin snap
  const playPortalConveySound = useCallback(() => {
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
      const pitch = 0.95 + Math.random() * 0.1;

      // 1. Kinetic Magnetic Portal Sweep (Warp pulse into the portal ring)
      const sweepOsc = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      sweepOsc.type = 'sine';
      sweepOsc.frequency.setValueAtTime(260 * pitch, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(720 * pitch, now + 0.045);

      sweepGain.gain.setValueAtTime(0.16, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      sweepOsc.connect(sweepGain);
      sweepGain.connect(ctx.destination);
      sweepOsc.start(now);
      sweepOsc.stop(now + 0.055);

      // 2. Metallic Token Snap (Heavy coin docking onto magnetic rail)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(840 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.025);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
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

  // Discrete conveyor steps
  const conveyUp = useCallback(() => {
    setStartIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
    playPortalConveySound();
  }, [playPortalConveySound]);

  const conveyDown = useCallback(() => {
    setStartIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
    playPortalConveySound();
  }, [playPortalConveySound]);

  // Conveyor wheel listener
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 130) return;
    if (Math.abs(e.deltaY) > 10) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        conveyDown();
      } else {
        conveyUp();
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
        playPortalConveySound();
        setIsAppsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isAppsModalOpen) {
        setIsAppsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppsModalOpen, playPortalConveySound]);

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

  // 5 Visible 3D conveyor slots (matching the Pinterest reference video)
  const visibleSlots = CONVEYOR_SLOTS.map((slotConfig, slotIdx) => {
    const itemIndex = (startIndex + slotIdx) % DOCK_ITEMS.length;
    const item = DOCK_ITEMS[itemIndex];
    const nodeNumber = String(slotIdx + 1).padStart(2, '0');
    const isPortalCenter = slotIdx === 2; // Position 2 is docked inside the glowing portal
    return {
      slotIdx,
      itemIndex,
      item,
      nodeNumber,
      isPortalCenter,
      pos: slotConfig,
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
          3D PORTAL CONVEYOR DOCK (Built directly from Pinterest ref https://pin.it/2OmYr4b65)
          - Curved 3D isometric dark rail track with segmented micro-treads
          - Center Illuminated Neon Portal Ring with fluid magenta/violet core aura
          - Thick 3D metallic dark-chrome tokens with chamfered rims & neon lighting
          - Token docked inside portal ring illuminates with full neon intensity
          - Kinetic magnetic warp audio synthesis on conveyor scroll
          - 100% transparent backdrop: page text behind remains fully accessible
         ========================================================================= */}
      <aside
        aria-label="3D Portal Conveyor Dock"
        onWheel={handleWheel}
        className="fixed right-2 sm:right-3 top-1/2 -translate-y-1/2 z-40 select-none hidden md:block pointer-events-none"
      >
        <div className="relative w-[130px] h-[480px] bg-transparent pointer-events-none">
          {/* Top Step Arrow Button */}
          <button
            type="button"
            onClick={conveyUp}
            aria-label="Convey track up"
            className="absolute top-1 right-8 z-30 w-7 h-5 flex items-center justify-center rounded-md bg-[#131622]/80 hover:bg-violet-600/80 border border-violet-500/30 text-violet-300 hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* ============================================================== */}
          {/* SVG 3D CONVEYOR RAIL & GLOWING PORTAL RING (Matching Reference)*/}
          {/* ============================================================== */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            viewBox="0 0 130 480"
          >
            <defs>
              {/* Portal Radial Magenta Neon Glow */}
              <radialGradient id="portalCoreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#d946ef" stopOpacity="0.75" />
                <stop offset="75%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </radialGradient>

              {/* Linear Rail Track Gradient */}
              <linearGradient id="railTrackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0.15" />
                <stop offset="35%" stopColor="#c084fc" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#f472b6" stopOpacity="0.8" />
                <stop offset="65%" stopColor="#c084fc" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.15" />
              </linearGradient>

              {/* Portal Neon Blur Filter */}
              <filter id="neonHalo" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Curved Isometric Conveyor Track Bed */}
            <path
              d="M 80 50 Q 56 140 44 240 Q 56 340 80 430"
              fill="none"
              stroke="#0f172a"
              strokeWidth="28"
              strokeLinecap="round"
              opacity="0.5"
            />
            {/* Textured Track Tread Dashes */}
            <path
              d="M 80 50 Q 56 140 44 240 Q 56 340 80 430"
              fill="none"
              stroke="#334155"
              strokeWidth="24"
              strokeDasharray="4 8"
              strokeLinecap="round"
              opacity="0.35"
            />
            {/* Glowing Rail Spine */}
            <path
              d="M 80 50 Q 56 140 44 240 Q 56 340 80 430"
              fill="none"
              stroke="url(#railTrackGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* ============================================================== */}
            {/* THE GLOWING CENTER PORTAL RING (Matching the Portal in Ref)    */}
            {/* ============================================================== */}
            <g transform="translate(44, 240)">
              {/* Outer Radiant Ambient Blur */}
              <ellipse
                cx="0"
                cy="0"
                rx="38"
                ry="18"
                fill="url(#portalCoreGlow)"
                className="animate-pulse"
                style={{ animationDuration: '2.5s' }}
              />

              {/* Glowing Outer Hex / Oval Neon Ring */}
              <ellipse
                cx="0"
                cy="0"
                rx="34"
                ry="15"
                fill="none"
                stroke="#e879f9"
                strokeWidth="3"
                filter="url(#neonHalo)"
              />

              {/* Inner Glowing Fluid Core */}
              <ellipse
                cx="0"
                cy="0"
                rx="28"
                ry="11"
                fill="#fae8ff"
                opacity="0.45"
                filter="url(#neonHalo)"
              />

              {/* Perspective Rim Cross Guide */}
              <path
                d="M -30 0 L 30 0"
                stroke="#fdf4ff"
                strokeWidth="1.5"
                strokeDasharray="2 4"
                opacity="0.6"
              />
            </g>
          </svg>

          {/* ============================================================== */}
          {/* 5 3D METALLIC CONVEYOR TOKENS (Matching the Disks in Ref)      */}
          {/* ============================================================== */}
          {visibleSlots.map(({ slotIdx, item, nodeNumber, isPortalCenter, pos }) => {
            const Icon = item.icon;
            const toneConfig = TONE_COLORS[item.tone] || TONE_COLORS.amber;
            const isRouteActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <div
                key={`${item.id}-${slotIdx}`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: pos.zIndex,
                  transform: `translate(-50%, -50%) perspective(600px) rotateX(${pos.rotateX}deg) rotateY(${pos.rotateY}deg) scale(${pos.scale})`,
                  transition: 'all 0.24s cubic-bezier(0.34, 1.4, 0.64, 1)',
                }}
                className="absolute pointer-events-auto"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredNode({
                    item,
                    nodeNumber: isPortalCenter ? 'PORTAL' : nodeNumber,
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
                  onClick={(e) => {
                    if (!isPortalCenter) {
                      e.preventDefault();
                      // Convey clicked token into the portal ring
                      setStartIndex((prev) => (prev + (slotIdx - 2) + DOCK_ITEMS.length) % DOCK_ITEMS.length);
                      playPortalConveySound();
                    } else {
                      playPortalConveySound();
                    }
                  }}
                  aria-label={`${item.label} Token`}
                  className={`group relative flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                    isPortalCenter
                      ? 'w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-b from-[#2d3246] via-[#141824] to-[#090b12] border-2 border-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.95),0_0_48px_rgba(168,85,247,0.55),inset_0_2px_4px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95'
                      : 'w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-b from-[#222738] via-[#121622] to-[#0a0d15] border border-slate-600/70 shadow-[0_6px_16px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.25)] hover:border-violet-400 hover:scale-108 active:scale-95'
                  }`}
                  style={{
                    boxShadow: isPortalCenter
                      ? '0 0 25px rgba(217, 70, 239, 0.9), 0 0 45px rgba(168, 85, 247, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
                      : undefined,
                  }}
                >
                  {/* Outer Beveled Chamfer Ring */}
                  <div className="absolute inset-0.5 rounded-full border border-white/15 pointer-events-none" />

                  {/* Neon Glow Rim for Center Portal Token */}
                  {isPortalCenter && (
                    <div className="absolute -inset-1 rounded-full border border-fuchsia-400/80 blur-xs pointer-events-none animate-pulse" />
                  )}

                  {/* Micro Index Pill Top-Left */}
                  <span
                    className={`absolute -top-1.5 -left-1 text-[8px] font-mono font-bold px-1 py-0.2 rounded-full border select-none ${
                      isPortalCenter
                        ? 'bg-fuchsia-500 text-white border-fuchsia-300 shadow-[0_0_8px_#d946ef]'
                        : 'bg-[#090c14] text-slate-400 border-slate-700/80'
                    }`}
                  >
                    {item.keyLabel || nodeNumber}
                  </span>

                  {/* Embossed Token Emblem */}
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-115 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${
                      isPortalCenter
                        ? 'text-fuchsia-200 group-hover:text-white scale-110'
                        : isRouteActive
                        ? 'text-amber-400'
                        : toneConfig.text
                    }`}
                  />

                  {/* Active Destination Indicator */}
                  {isRouteActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
                  )}
                </Link>
              </div>
            );
          })}

          {/* Central ⌘ Command Launchpad Activator Token */}
          <div
            style={{ left: '96px', top: '240px' }}
            className="absolute -translate-y-1/2 z-30 pointer-events-auto"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredNode({
                item: {
                  id: 'cmd',
                  label: 'Launchpad (⌘K)',
                  sub: 'Search all portals & tools',
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
                playPortalConveySound();
                setIsAppsModalOpen(true);
              }}
              aria-label="Open Applications Launchpad"
              className="group relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-[#261f3d] to-[#120f20] border border-violet-400/50 shadow-[0_0_12px_rgba(168,85,247,0.5)] text-violet-300 hover:text-white transition-all active:scale-90 cursor-pointer"
            >
              <Command className="w-3.5 h-3.5 transition-transform group-hover:scale-115 group-hover:rotate-12" />
            </button>
          </div>

          {/* Bottom Step Arrow Button */}
          <button
            type="button"
            onClick={conveyDown}
            aria-label="Convey track down"
            className="absolute bottom-1 right-8 z-30 w-7 h-5 flex items-center justify-center rounded-md bg-[#131622]/80 hover:bg-violet-600/80 border border-violet-500/30 text-violet-300 hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
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
            left: `${hoveredNode.x - 12}px`,
          }}
          className="fixed -translate-x-full -translate-y-1/2 pointer-events-none z-[9999] animate-in fade-in slide-in-from-right-2 duration-150"
        >
          <div className="relative flex items-center gap-2.5">
            {/* Callout Card */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0b0e18]/95 border border-fuchsia-500/40 shadow-[0_16px_40px_rgba(0,0,0,0.92),0_0_20px_rgba(217,70,239,0.25)] text-white backdrop-blur-2xl whitespace-nowrap">
              {/* Token Badge */}
              <div className="w-6 h-6 rounded-md bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
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
              <div className="w-2.5 border-t-2 border-dotted border-fuchsia-400/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_8px_#d946ef]" />
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
