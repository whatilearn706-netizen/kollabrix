'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  ChevronDown,
  Swords,
  Flame,
  Trophy,
  Clock,
  Terminal,
  Sparkles,
  Bot,
  Lightbulb,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export interface CapabilityItem {
  id: string;
  label: string;
  group: 'core' | 'campus';
  href: string;
  badge: string;
  live?: boolean;
  dotColor: string;
  badgeClass: string;
  description: string;
  ctaLabel: string;
  openInNewTab?: boolean;
  icon: React.ElementType;
}

export const CAPABILITY_ITEMS: CapabilityItem[] = [
  // Group 1: CORE CAPABILITIES (Requested Sequence)
  {
    id: 'arena',
    label: '1v1 Battle Arena',
    group: 'core',
    href: '/arena',
    badge: 'LIVE DUELS · 14 ACTIVE',
    live: true,
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    description: 'Beat real coders live. Steal ELO in 3-minute speed duels.',
    ctaLabel: 'Enter Arena',
    icon: Swords,
  },
  {
    id: 'spark',
    label: 'KΛ ΛI',
    group: 'core',
    href: '/spark',
    badge: 'KΛ-1 · KΛ-PRO ENGINE',
    dotColor: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/35',
    description: 'Audit your repo, export winning slides & pass screening rounds.',
    ctaLabel: 'Open KΛ ΛI',
    openInNewTab: true,
    icon: Sparkles,
  },
  {
    id: 'resources',
    label: 'KΛ FOLIO',
    group: 'core',
    href: '/resources',
    badge: 'FOLIO LIBRARY',
    dotColor: 'bg-amber-300 shadow-[0_0_8px_#fcd34d]',
    badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-400/35',
    description: 'Language video tracks, 12 coding classics & step-by-step study studio.',
    ctaLabel: 'Open KΛ FOLIO',
    openInNewTab: true,
    icon: BookOpen,
  },
  {
    id: 'icpc',
    label: 'Practice IDE',
    group: 'core',
    href: '/icpc',
    badge: 'OA & ICPC PROCTORED LAB',
    dotColor: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/35',
    description: 'Company OA rounds, proctored mocks & instant KΛ Bug Coach fixes.',
    ctaLabel: 'Launch IDE',
    icon: Terminal,
  },
  {
    id: 'problems',
    label: 'Faculty Problems',
    group: 'core',
    href: '/problems',
    badge: 'CAMPUS BRIEFS',
    dotColor: 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]',
    badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/35',
    description: 'Tackle verified faculty & industry challenge statements for credit.',
    ctaLabel: 'Browse Problems',
    icon: Lightbulb,
  },

  // Group 2: CAMPUS & RANKINGS
  {
    id: 'war',
    label: 'Campus War',
    group: 'campus',
    href: '/war',
    badge: 'INTER-COLLEGE',
    live: true,
    dotColor: 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    description: 'Represent your university in live squad-vs-squad coding clashes.',
    ctaLabel: 'Join Campus War',
    icon: Flame,
  },
  {
    id: 'leaderboard',
    label: 'Campus Leaderboard',
    group: 'campus',
    href: '/leaderboard',
    badge: 'RANKINGS',
    dotColor: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/35',
    description: 'Track top verified coders, hackathon squads, and campus standings.',
    ctaLabel: 'View Rankings',
    icon: Trophy,
  },
  {
    id: 'deadlines',
    label: 'Deadlines Radar',
    group: 'campus',
    href: '/deadlines',
    badge: 'COUNTDOWNS',
    live: true,
    dotColor: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    description: 'Never miss closing hackathon registrations or submission locks.',
    ctaLabel: 'Track Deadlines',
    icon: Clock,
  },
];

function PreviewVisual({ item }: { item: CapabilityItem }) {
  if (item.id === 'arena') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-emerald-500/25 p-3 space-y-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Top live match stakes & timer bar */}
        <div className="flex items-center justify-between text-[9.5px] font-mono border-b border-white/[0.06] pb-1.5">
          <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            01:42 LEFT
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold text-[8.5px]">
            +28 ELO STAKE
          </span>
        </div>

        {/* Split-screen Player vs Rival HUD */}
        <div className="relative grid grid-cols-2 gap-2 font-mono">
          {/* Center VS bolt */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#090b10] border border-white/20 flex items-center justify-center text-[8.5px] font-black text-white shadow-lg">
            VS
          </div>

          {/* Player A (You) */}
          <div className="p-2 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between text-[9px]">
              <span className="font-bold text-white">YOU</span>
              <span className="text-emerald-300 font-bold">1540 ELO</span>
            </div>
            <div className="text-[8.5px] text-zinc-400 flex items-center justify-between">
              <span className="text-cyan-300">Python</span>
              <span>128 WPM</span>
            </div>
            <div className="grid grid-cols-5 gap-0.5 pt-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-1 rounded-full ${n <= 4 ? 'bg-emerald-400' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <div className="text-[8px] text-emerald-300 font-semibold">4/5 tests passed</div>
          </div>

          {/* Player B (Rival) */}
          <div className="p-2 rounded-lg bg-rose-500/[0.05] border border-rose-500/25 space-y-1.5 text-right">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-rose-300 font-bold">1582 ELO</span>
              <span className="font-bold text-white">RIVAL</span>
            </div>
            <div className="text-[8.5px] text-zinc-400 flex items-center justify-between">
              <span>119 WPM</span>
              <span className="text-violet-300">C++</span>
            </div>
            <div className="grid grid-cols-5 gap-0.5 pt-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-1 rounded-full ${n <= 3 ? 'bg-rose-400' : 'bg-white/10'}`}
                />
              ))}
            </div>
            <div className="text-[8px] text-rose-300 font-semibold">3/5 tests passed</div>
          </div>
        </div>
      </div>
    );
  }

  if (item.id === 'war') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2.5 shadow-inner font-mono">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-rose-300 font-bold">IIT DELHI</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-white text-[9px]">VS</span>
          <span className="text-cyan-300 font-bold">S-VYASA</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
          <div className="w-[56%] bg-gradient-to-r from-rose-500 to-amber-400" />
          <div className="w-[44%] bg-gradient-to-r from-cyan-400 to-emerald-400" />
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-400">
          <span>2,840 pts</span>
          <span className="text-emerald-400">● Clash Active</span>
          <span>2,690 pts</span>
        </div>
      </div>
    );
  }

  if (item.id === 'leaderboard') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-2.5 space-y-1.5 font-mono text-[10px]">
        {[
          { rank: '#1', name: 'IIT Delhi', elo: '2,140 ELO', color: 'text-amber-300' },
          { rank: '#2', name: 'BITS Pilani', elo: '1,985 ELO', color: 'text-slate-200' },
          { rank: '#3', name: 'DTU Delhi', elo: '1,910 ELO', color: 'text-cyan-300' },
        ].map((row) => (
          <div
            key={row.rank}
            className="flex items-center justify-between px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]"
          >
            <span className={`font-bold ${row.color}`}>{row.rank} {row.name}</span>
            <span className="text-emerald-400">{row.elo}</span>
          </div>
        ))}
      </div>
    );
  }

  if (item.id === 'deadlines') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-white/10 p-2.5 space-y-1.5 font-mono text-[10px]">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-rose-500/10 border border-rose-500/25">
          <span className="text-white font-semibold truncate">SIH Campus Sprint</span>
          <span className="text-rose-300 font-bold shrink-0">04h 18m left</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06]">
          <span className="text-slate-300 truncate">ETH Campus Track</span>
          <span className="text-emerald-300 font-bold shrink-0">2d 11h left</span>
        </div>
      </div>
    );
  }

  if (item.id === 'icpc') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-blue-500/25 p-3 space-y-2 font-mono text-[9.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Mini IDE Top Bar */}
        <div className="flex items-center justify-between text-[9px] border-b border-white/[0.06] pb-1.5">
          <span className="text-zinc-300 font-semibold">solution.cpp &middot; OA #4</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-400/30 text-cyan-300 font-bold text-[8px]">
            O(N log N)
          </span>
        </div>

        {/* Code Lines with L14 highlight */}
        <div className="rounded-lg bg-black/60 border border-white/[0.06] p-2 space-y-0.5 text-[8.5px]">
          <div className="text-zinc-400">
            <span className="text-zinc-600 mr-2">13</span>
            <span className="text-blue-300">for</span> (int i = 0; i &lt; n; i++) &#123;
          </div>
          <div className="px-1 -mx-1 rounded bg-amber-500/10 border-l-2 border-amber-400 text-amber-200">
            <span className="text-amber-400/70 mr-1.5">14</span>
            dp[i] = max(dp[i-1], pref[i]);
          </div>
        </div>

        {/* Glowing Test Matrix */}
        <div className="grid grid-cols-3 gap-1.5 text-[8px] font-bold text-center">
          {['TC #1 · 4ms', 'TC #2 · 6ms', 'TC #3 · 12ms'].map((tc) => (
            <div
              key={tc}
              className="py-1 px-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
            >
              ✓ {tc}
            </div>
          ))}
        </div>

        {/* AI Bug Coach Pill */}
        <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-400/25 text-[8.5px] text-amber-200 flex items-center justify-between">
          <span className="font-semibold">✨ KΛ Bug Coach</span>
          <span className="text-amber-300/90">Fix TLE on L14</span>
        </div>
      </div>
    );
  }

  if (item.id === 'spark') {
    return (
      <div className="rounded-xl bg-[#05070c] border border-violet-500/25 p-3 space-y-2 font-mono text-[9.5px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {/* Live Judge Score Meter + Repo Status */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/35 text-amber-300 font-black text-[11px]">
              91/100
            </span>
            <span className="text-[8.5px] text-zinc-300 font-semibold">Judge Score</span>
          </div>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[8px]">
            +19 pts
          </span>
        </div>

        {/* Three War-Room Asset Chips */}
        <div className="grid grid-cols-3 gap-1.5 text-[8px] font-bold text-center">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-400/25 text-amber-200">
            7-Slide .pptx
          </div>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/25 text-cyan-200">
            2m Demo + Q&amp;A
          </div>
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-400/25 text-violet-200">
            README + SQL
          </div>
        </div>

        {/* Live Scan Verification Pill */}
        <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[8.5px] text-emerald-300 flex items-center justify-between">
          <span>✓ Scanned GitHub &amp; Live Demo</span>
          <span className="text-cyan-300 font-bold">200 OK</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#05070c] border border-white/10 p-3 space-y-2 font-mono text-[9.5px]">
      <div className="text-cyan-300 font-bold">
        {item.id === 'problems' ? 'VERIFIED CAMPUS BRIEF' : 'KΛ FOLIO VOLUMES'}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(item.id === 'problems'
          ? ['AI Health Triage', 'Zero-Trust Auth', 'Campus Transit']
          : ['Java Mastery', 'C++ STL', '3D Tech Books', 'OA Patterns']
        ).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CapabilitiesMegaMenu({ isNavbarDark }: { isNavbarDark: boolean }) {
  const pathname = usePathname() || '';
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 72, left: 0 });
  const [hoveredItem, setHoveredItem] = useState<CapabilityItem>(CAPABILITY_ITEMS[0]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedByHoverAtRef = useRef<number>(0);

  const isRouteActive = CAPABILITY_ITEMS.some((item) => pathname.startsWith(item.href));

  const syncMenuPos = () => {
    if (containerRef.current) {
      const navEl = containerRef.current.closest('nav');
      const anchorRect = (navEl || containerRef.current).getBoundingClientRect();
      const centerX = anchorRect.left + anchorRect.width / 2;
      const panelWidth = Math.min(740, window.innerWidth - 32);
      const clampedLeft = Math.max(16, Math.min(centerX - panelWidth / 2, window.innerWidth - panelWidth - 16));
      setMenuPos({
        top: Math.round(anchorRect.bottom + 8),
        left: Math.round(clampedLeft),
      });
    }
  };

  // Close automatically on route transition
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!panelRef.current || !panelRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isOpen) {
      openedByHoverAtRef.current = Date.now();
    }
    syncMenuPos();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleTriggerClick = () => {
    syncMenuPos();
    if (isOpen && Date.now() - openedByHoverAtRef.current < 400) {
      // Hover just opened the menu right before click landed; keep it open cleanly
      openedByHoverAtRef.current = 0;
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const coreItems = CAPABILITY_ITEMS.filter((i) => i.group === 'core');
  const campusItems = CAPABILITY_ITEMS.filter((i) => i.group === 'campus');

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      {/* Center Capsule Pill Trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={clsx(
          'px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold tracking-[-0.01em] transition-all duration-200 inline-flex items-center justify-center gap-1 select-none active:scale-[0.97] cursor-pointer whitespace-nowrap',
          isOpen || isRouteActive
            ? isNavbarDark
              ? 'bg-gradient-to-b from-zinc-800/90 via-zinc-900/95 to-black/95 text-white ring-1 ring-white/20 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.35),inset_0_-1px_1px_rgba(255,255,255,0.12),0_2px_8px_rgba(0,0,0,0.65)]'
              : 'bg-white text-stone-950 ring-1 ring-stone-200 shadow-sm'
            : isNavbarDark
            ? 'bg-transparent text-zinc-200 hover:text-white hover:bg-white/[0.04]'
            : 'bg-transparent text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
        )}
      >
        <span>Capabilities</span>
        <ChevronDown
          className={clsx(
            'w-3.5 h-3.5 transition-transform duration-200 shrink-0',
            isOpen && 'rotate-180',
            isOpen || isRouteActive
              ? isNavbarDark
                ? 'text-white'
                : 'text-slate-950'
              : isNavbarDark
              ? 'text-zinc-300'
              : 'text-stone-600'
          )}
        />
      </button>

      {/* Split "Live Preview" Frosted-Glass Mega Menu (Portaled to document.body to escape nav backdrop-filter) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Platform Capabilities Menu"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            className="fixed z-[9999] w-[740px] max-w-[calc(100vw-2rem)] pt-3 -mt-2 select-none"
          >
            <div className="relative rounded-2xl bg-[#090b10]/95 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.2)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
            {/* Subtle top hairline glow */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

            <div className="grid grid-cols-12 gap-0">
              {/* LEFT PANE (~54% -> col-span-6): Grouped Navigation */}
              <div className="col-span-6 p-4 space-y-3.5 border-r border-white/[0.07]">
                {/* Group 1: CORE CAPABILITIES */}
                <div className="space-y-1">
                  <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Core Capabilities
                  </div>
                  {coreItems.map((item) => {
                    const isHovered = hoveredItem.id === item.id;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        target={item.openInNewTab ? '_blank' : undefined}
                        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                        onMouseEnter={() => setHoveredItem(item)}
                        onFocus={() => setHoveredItem(item)}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all border',
                          isHovered
                            ? 'bg-white/[0.08] border-white/15 text-white font-semibold shadow-sm'
                            : 'bg-transparent border-transparent text-zinc-300 hover:text-white font-medium'
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={clsx(
                              'w-1.5 h-1.5 rounded-full shrink-0 transition-opacity',
                              isHovered ? item.dotColor : 'bg-white/25'
                            )}
                          />
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.live && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0">
                            Live
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Group 2: CAMPUS & RANKINGS */}
                <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                  <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-zinc-500">
                    Campus &amp; Rankings
                  </div>
                  {campusItems.map((item) => {
                    const isHovered = hoveredItem.id === item.id;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        target={item.openInNewTab ? '_blank' : undefined}
                        rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                        onMouseEnter={() => setHoveredItem(item)}
                        onFocus={() => setHoveredItem(item)}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          'flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl text-[13px] transition-all border',
                          isHovered
                            ? 'bg-white/[0.08] border-white/15 text-white font-semibold shadow-sm'
                            : 'bg-transparent border-transparent text-zinc-300 hover:text-white font-medium'
                        )}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={clsx(
                              'w-1.5 h-1.5 rounded-full shrink-0 transition-opacity',
                              isHovered ? item.dotColor : 'bg-white/20'
                            )}
                          />
                          <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.live && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0">
                            Live
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANE (~46% -> col-span-6): Dynamic Live Preview Card */}
              <div className="col-span-6 p-4 flex">
                <div className="relative w-full rounded-xl bg-black/55 border border-white/10 p-5 flex flex-col justify-between overflow-hidden">
                  {/* Dot-matrix texture */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)',
                      backgroundSize: '12px 12px',
                    }}
                  />

                  {/* Top Preview Header */}
                  <div className="relative z-10 flex flex-col items-center text-center space-y-2.5">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border',
                        hoveredItem.badgeClass
                      )}
                    >
                      {hoveredItem.live && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      <span>{hoveredItem.badge}</span>
                    </span>

                    <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                      {hoveredItem.label}
                    </h3>
                  </div>

                  {/* Interactive Mini Preview Stage */}
                  <div className="relative z-10 my-3">
                    <PreviewVisual item={hoveredItem} />
                  </div>

                  {/* Description & Platinum Pill CTA */}
                  <div className="relative z-10 space-y-3 text-center">
                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[34px]">
                      {hoveredItem.description}
                    </p>

                    <Link
                      href={hoveredItem.href}
                      target={hoveredItem.openInNewTab ? '_blank' : undefined}
                      rel={hoveredItem.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 hover:from-white hover:to-white text-slate-950 font-extrabold text-xs tracking-wide shadow-[0_0_22px_rgba(255,255,255,0.28)] border border-white/70 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>{hoveredItem.ctaLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </div>
  );
}
