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
  keyLabel: string;
  // Coin color theme matching Pinterest reference (new_dock_ref.jpg)
  coinColor: {
    bg: string;
    border: string;
    reed: string;
    glow: string;
    indicator: string;
    text: string;
  };
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
    coinColor: {
      // Purple / Violet coin (matches "ecommpay" coin in reference)
      bg: 'from-[#7c3aed] via-[#6d28d9] to-[#4c1d95]',
      border: 'border-[#a78bfa]',
      reed: '#5b21b6',
      glow: 'rgba(139, 92, 246, 0.65)',
      indicator: 'bg-[#a855f7] shadow-[0_0_10px_#a855f7]',
      text: 'text-white',
    },
  },
  {
    id: 'hackathons',
    label: 'College Hackathons',
    sub: 'Arena & Squad Matchmaking',
    href: '/hackathons',
    icon: Trophy,
    keyLabel: 'HACK',
    coinColor: {
      // Golden Amber / Yellow coin (matches yellow coin in reference)
      bg: 'from-[#f59e0b] via-[#d97706] to-[#b45309]',
      border: 'border-[#fcd34d]',
      reed: '#92400e',
      glow: 'rgba(245, 158, 11, 0.65)',
      indicator: 'bg-[#fbbf24] shadow-[0_0_10px_#fbbf24]',
      text: 'text-amber-950',
    },
  },
  {
    id: 'icpc',
    label: 'Competitive Practice',
    sub: 'Placement OAs & Speedrun',
    href: '/icpc',
    icon: Terminal,
    keyLabel: 'CODE',
    coinColor: {
      // Royal Azure Blue coin (matches "Rapyd" coin in reference)
      bg: 'from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a]',
      border: 'border-[#60a5fa]',
      reed: '#172554',
      glow: 'rgba(37, 99, 235, 0.65)',
      indicator: 'bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]',
      text: 'text-white',
    },
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    sub: 'Professor Engineering Briefs',
    href: '/problems',
    icon: Lightbulb,
    keyLabel: 'SPEC',
    coinColor: {
      // Dark Titanium / Slate Black coin (matches "Braintree" coin in reference)
      bg: 'from-[#334155] via-[#1e293b] to-[#0f172a]',
      border: 'border-[#64748b]',
      reed: '#020617',
      glow: 'rgba(100, 116, 139, 0.55)',
      indicator: 'bg-[#94a3b8] shadow-[0_0_10px_#94a3b8]',
      text: 'text-slate-100',
    },
  },
  {
    id: 'faculty',
    label: 'Faculty Portal',
    sub: 'Educator Desk & Review',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    keyLabel: 'DESK',
    coinColor: {
      // Emerald Green coin (matches green indicator in reference)
      bg: 'from-[#10b981] via-[#059669] to-[#047857]',
      border: 'border-[#6ee7b7]',
      reed: '#064e3b',
      glow: 'rgba(16, 185, 129, 0.65)',
      indicator: 'bg-[#34d399] shadow-[0_0_10px_#34d399]',
      text: 'text-emerald-950',
    },
  },
  {
    id: 'resources',
    label: 'Resources Hub',
    sub: 'Curated Roadmaps & Compilers',
    href: '/resources',
    icon: BookOpen,
    keyLabel: 'DOCS',
    coinColor: {
      // Chalk White / Platinum Silver coin (matches white coin in reference)
      bg: 'from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1]',
      border: 'border-white',
      reed: '#94a3b8',
      glow: 'rgba(255, 255, 255, 0.55)',
      indicator: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]',
      text: 'text-slate-900',
    },
    openInNewTab: true,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    sub: 'Live Hackathon Countdowns',
    href: '/deadlines',
    icon: Clock,
    keyLabel: 'TIME',
    coinColor: {
      // Crimson Coral Red coin (matches red coin in reference)
      bg: 'from-[#ef4444] via-[#dc2626] to-[#991b1b]',
      border: 'border-[#fca5a5]',
      reed: '#7f1d1d',
      glow: 'rgba(239, 68, 68, 0.65)',
      indicator: 'bg-[#f87171] shadow-[0_0_10px_#f87171]',
      text: 'text-white',
    },
  },
  {
    id: 'feedback',
    label: 'Community Feedback',
    sub: 'Direct Suggestions & Ideas',
    href: '/feedback',
    icon: MessageSquare,
    keyLabel: 'CHAT',
    coinColor: {
      // Electric Cyan / Neon Blue coin
      bg: 'from-[#06b6d4] via-[#0891b2] to-[#155e75]',
      border: 'border-[#67e8f9]',
      reed: '#164e63',
      glow: 'rgba(6, 182, 212, 0.65)',
      indicator: 'bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]',
      text: 'text-cyan-950',
    },
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

  // Active Coin Index (the coin that pops up into the floating position)
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Sync active coin with current route on load / navigation
  useEffect(() => {
    const foundIndex = DOCK_ITEMS.findIndex(
      (item) => pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
    );
    if (foundIndex !== -1) {
      setActiveIndex(foundIndex);
    }
  }, [pathname]);

  // Web Audio Context for authentic coin clink & mechanical slot sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastWheelTimeRef = useRef<number>(0);

  // Hovered coin state for floating callout card
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

  // Synthesize realistic coin pop-up chime & mechanical slot click via Web Audio API
  const playCoinSlideSound = useCallback(() => {
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

      // 1. High-frequency Coin Clink / Chime (Metallic resonance)
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(1450 * pitch, now);
      bellOsc.frequency.exponentialRampToValueAtTime(750 * pitch, now + 0.05);

      bellGain.gain.setValueAtTime(0.18, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start(now);
      bellOsc.stop(now + 0.065);

      // 2. Mechanical Slot Click (Crisp slide into rack)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(540 * pitch, now);
      clickOsc.frequency.exponentialRampToValueAtTime(160 * pitch, now + 0.025);

      clickGain.gain.setValueAtTime(0.22, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.035);
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

  // Discrete coin slide step up / down
  const nextCoin = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % DOCK_ITEMS.length);
    playCoinSlideSound();
  }, [playCoinSlideSound]);

  const prevCoin = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + DOCK_ITEMS.length) % DOCK_ITEMS.length);
    playCoinSlideSound();
  }, [playCoinSlideSound]);

  const selectCoin = useCallback(
    (index: number, navigate: boolean = false) => {
      setActiveIndex(index);
      playCoinSlideSound();
      if (navigate) {
        const item = DOCK_ITEMS[index];
        if (item.openInNewTab) {
          window.open(item.href, '_blank', 'noopener,noreferrer');
        } else {
          router.push(item.href);
        }
      }
    },
    [playCoinSlideSound, router]
  );

  // Mouse wheel scroll listener
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 130) return;
    if (Math.abs(e.deltaY) > 10) {
      lastWheelTimeRef.current = now;
      if (e.deltaY > 0) {
        nextCoin();
      } else {
        prevCoin();
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
        playCoinSlideSound();
        setIsAppsModalOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isAppsModalOpen) {
        setIsAppsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAppsModalOpen, playCoinSlideSound]);

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

  // Active floating coin
  const activeCoin = DOCK_ITEMS[activeIndex];
  const ActiveIcon = activeCoin.icon;

  // Slotted coins on the rack (4 slots below the active coin)
  const slottedCoins = [1, 2, 3, 4].map((offset) => {
    const itemIndex = (activeIndex + offset) % DOCK_ITEMS.length;
    return {
      offset,
      itemIndex,
      item: DOCK_ITEMS[itemIndex],
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
          SLOT MACHINE COIN RACK DOCK (Built directly from Pinterest ref https://pin.it/3QmZ3zEso)
          - Floating active 3D coin pops up into mid-air above its slot
          - Authentic reeded coin edges with vertical ridges along circumference
          - Mechanical modular slot rack with vertical coin slots & illuminated indicator buttons
          - Slotted coins sit neatly queued with protruding reeded edges
          - Transparent backdrop: page content behind remains 100% visible & readable
          - Coin clink & mechanical slide audio synthesis on scroll
         ========================================================================= */}
      <aside
        aria-label="3D Coin Rack Dock"
        onWheel={handleWheel}
        className="fixed right-3 sm:right-4 top-1/2 -translate-y-1/2 z-40 select-none hidden md:block pointer-events-none"
      >
        <div className="relative flex flex-col items-center gap-3 bg-transparent pointer-events-none">
          {/* Top Step Arrow Button */}
          <button
            type="button"
            onClick={prevCoin}
            aria-label="Scroll coin rack up"
            className="flex items-center justify-center w-7 h-5 rounded-md bg-[#131622]/85 hover:bg-violet-600/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* ============================================================== */}
          {/* 1. THE FLOATING ACTIVE COIN (Hovering in air above slot rack)  */}
          {/* ============================================================== */}
          <div
            className="relative flex flex-col items-center pointer-events-auto cursor-pointer group"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredNode({
                item: activeCoin,
                nodeNumber: activeCoin.keyLabel,
                x: rect.left,
                y: rect.top + rect.height / 2,
              });
            }}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <Link
              href={activeCoin.href}
              target={activeCoin.openInNewTab ? '_blank' : undefined}
              rel={activeCoin.openInNewTab ? 'noopener noreferrer' : undefined}
              onClick={() => playCoinSlideSound()}
              aria-label={`Active ${activeCoin.label} Coin`}
              className="relative flex flex-col items-center justify-center w-[76px] h-[76px] sm:w-20 sm:h-20 rounded-full transition-all duration-300 active:scale-95 animate-in zoom-in-90 hover:scale-105"
            >
              {/* Outer Reeded Coin Edge (Vertical ridges around rim, matching ref) */}
              <div
                style={{
                  boxShadow: `0 14px 35px -5px rgba(0,0,0,0.9), 0 0 30px ${activeCoin.coinColor.glow}`,
                  backgroundImage: `repeating-conic-gradient(from 0deg, ${activeCoin.coinColor.reed} 0deg 3deg, rgba(255,255,255,0.2) 3deg 6deg)`,
                }}
                className="absolute inset-0 rounded-full p-[5px] transition-all duration-300"
              >
                {/* Raised Coin Outer Chamfer Rim */}
                <div
                  className={`relative w-full h-full rounded-full bg-gradient-to-br ${activeCoin.coinColor.bg} border-2 ${activeCoin.coinColor.border} p-2 flex flex-col items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_5px_rgba(0,0,0,0.7)]`}
                >
                  {/* Subtle Inset Circular Groove (Like authentic minted coins) */}
                  <div className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />

                  {/* Micro Index Pill Top */}
                  <span className="absolute -top-1 px-1.5 py-[1px] rounded-full bg-black/75 text-[8px] font-mono font-bold text-white border border-white/30 tracking-wider">
                    {activeCoin.keyLabel}
                  </span>

                  {/* Center Coin Emblem */}
                  <ActiveIcon
                    className={`w-6 h-6 transition-transform duration-200 group-hover:scale-115 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${activeCoin.coinColor.text}`}
                  />

                  {/* Bottom Coin Title */}
                  <span
                    className={`text-[9px] font-bold tracking-tight font-heading mt-0.5 max-w-[60px] truncate drop-shadow-sm ${activeCoin.coinColor.text}`}
                  >
                    {activeCoin.keyLabel}
                  </span>
                </div>
              </div>

              {/* Floating Drop Shadow / Light Cast beneath coin */}
              <div
                style={{
                  background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${activeCoin.coinColor.glow}, transparent 70%)`,
                }}
                className="absolute -bottom-4 w-16 h-4 pointer-events-none blur-[2px]"
              />
            </Link>
          </div>

          {/* ============================================================== */}
          {/* 2. MECHANICAL SLOT RACK BASE (Matching credit coin rack in ref)*/}
          {/* ============================================================== */}
          <div className="relative w-[76px] sm:w-20 rounded-2xl bg-gradient-to-b from-[#181d2e]/95 via-[#101422]/95 to-[#090c14]/95 border border-slate-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)] p-2 backdrop-blur-xl flex flex-col items-center gap-2 pointer-events-auto">
            {/* Top Rack Coin Slot Opening (Where active coin was elevated from) */}
            <div className="w-full h-1.5 rounded-full bg-black/90 border border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] mb-1" />

            {/* Slotted Coins (Stacked in vertical rack with reeded edge visible) */}
            <div className="w-full flex flex-col gap-2">
              {slottedCoins.map(({ offset, itemIndex, item }) => {
                const Icon = item.icon;
                const isRouteActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

                return (
                  <div
                    key={item.id}
                    className="relative w-full flex items-center justify-between gap-1.5 p-1 rounded-xl bg-black/40 hover:bg-white/10 border border-slate-800/80 hover:border-slate-600 transition-all duration-150 cursor-pointer group"
                    onClick={() => selectCoin(itemIndex, true)}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredNode({
                        item,
                        nodeNumber: item.keyLabel,
                        x: rect.left,
                        y: rect.top + rect.height / 2,
                      });
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Protruding Slotted Coin Disk with Reeded Outer Edge */}
                    <div
                      style={{
                        backgroundImage: `repeating-conic-gradient(from 0deg, ${item.coinColor.reed} 0deg 6deg, rgba(255,255,255,0.2) 6deg 12deg)`,
                      }}
                      className="relative w-7 h-7 rounded-full p-[2px] shadow-md shrink-0 transition-transform group-hover:scale-110"
                    >
                      <div
                        className={`w-full h-full rounded-full bg-gradient-to-br ${item.coinColor.bg} border border-white/20 flex items-center justify-center`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${item.coinColor.text}`} />
                      </div>
                    </div>

                    {/* Coin Label */}
                    <span className="text-[10px] font-mono font-bold text-slate-300 group-hover:text-white truncate">
                      {item.keyLabel}
                    </span>

                    {/* Illuminated Round Indicator Button on Rack Face (Matching Ref) */}
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.coinColor.indicator} shrink-0 transition-transform group-hover:scale-125`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Central ⌘ Command Launchpad Key on Rack Base */}
            <button
              type="button"
              onClick={() => {
                playCoinSlideSound();
                setIsAppsModalOpen(true);
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredNode({
                  item: {
                    id: 'cmd',
                    label: 'Launchpad (⌘K)',
                    sub: 'Search all portals & tools',
                    href: '#',
                    icon: Command,
                    keyLabel: '⌘K',
                    coinColor: {
                      bg: 'from-[#4c1d95] to-[#1e1b4b]',
                      border: 'border-violet-400',
                      reed: '#2e1065',
                      glow: 'rgba(168, 85, 247, 0.6)',
                      indicator: 'bg-violet-400',
                      text: 'text-white',
                    },
                  },
                  nodeNumber: '⌘K',
                  x: rect.left,
                  y: rect.top + rect.height / 2,
                });
              }}
              onMouseLeave={() => setHoveredNode(null)}
              aria-label="Open Applications Launchpad"
              className="mt-1 w-full py-1.5 rounded-xl bg-gradient-to-b from-[#1e1b4b] to-[#0f0e1a] border border-violet-500/40 hover:border-violet-400 text-violet-300 hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer group"
            >
              <Command className="w-3.5 h-3.5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <span className="text-[9px] font-mono font-bold">APPS</span>
            </button>
          </div>

          {/* Bottom Step Arrow Button */}
          <button
            type="button"
            onClick={nextCoin}
            aria-label="Scroll coin rack down"
            className="flex items-center justify-center w-7 h-5 rounded-md bg-[#131622]/85 hover:bg-violet-600/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all active:scale-90 cursor-pointer pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
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
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#0c101d]/95 border border-slate-700/80 shadow-[0_16px_40px_rgba(0,0,0,0.92)] text-white backdrop-blur-2xl whitespace-nowrap">
              {/* Coin Badge */}
              <div
                style={{
                  boxShadow: `0 0 10px ${hoveredNode.item.coinColor.glow}`,
                }}
                className={`w-6 h-6 rounded-md bg-gradient-to-br ${hoveredNode.item.coinColor.bg} border border-white/30 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0`}
              >
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
