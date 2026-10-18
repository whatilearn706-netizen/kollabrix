'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Trophy,
  Lightbulb,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
  ChevronRight,
  Command,
  Terminal,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface PortalItem {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
  themeColor: 'amber' | 'violet' | 'emerald' | 'cyan';
  iconBgClass: string;
}

const PORTAL_ITEMS: PortalItem[] = [
  {
    id: 'hackathons',
    title: 'College Hackathons',
    href: '/hackathons',
    icon: Trophy,
    themeColor: 'amber',
    iconBgClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  {
    id: 'problems',
    title: 'Faculty Problems',
    href: '/problems',
    icon: Lightbulb,
    themeColor: 'violet',
    iconBgClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
  },
  {
    id: 'faculty',
    title: 'Faculty Portal',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    themeColor: 'emerald',
    iconBgClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'icpc',
    title: 'ICPC Arena',
    href: '/icpc',
    icon: Terminal,
    themeColor: 'cyan',
    iconBgClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  },
];

export function PortalsSideRail() {
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut listener: Cmd+K, Ctrl+K, Cmd+Space, Ctrl+Space, or ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey;
      const isK = e.key === 'k' || e.key === 'K';
      const isSpace = e.code === 'Space';

      if (isModifier && (isK || isSpace)) {
        const activeEl = document.activeElement;
        const tagName = activeEl?.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || (activeEl as HTMLElement)?.isContentEditable) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        setIsSpotlightOpen((prev) => !prev);
      }

      if (e.key === 'Escape' && isSpotlightOpen) {
        e.preventDefault();
        setIsSpotlightOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightOpen]);

  // Lock body scroll when Big Ring modal is open
  useEffect(() => {
    if (isSpotlightOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSpotlightOpen]);

  return (
    <>
      {/* =========================================================================
          DESKTOP FIXED PORTALS SIDE RAIL (Screens >= 1024px)
          - Position is fixed on right edge while website scrolls normally
          - Shows 2 names cleanly before scrolling
          - Lil Point of Linkora with ⌘K badge
         ========================================================================= */}
      <aside
        aria-label="Linkora Quick Portals"
        className="hidden lg:flex fixed right-3 sm:right-4 2xl:right-6 top-1/2 -translate-y-1/2 z-40 select-none pointer-events-auto"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 bg-transparent">
          {/* Vertical Scrolling Names Container - Exactly 2 names visible before scrolling */}
          <div className="relative w-[175px] sm:w-[195px] h-[82px] border-l-2 border-slate-300/80 dark:border-white/20 pl-2 sm:pl-2.5 overflow-hidden select-none">
            {/* Subtle blur curtains for upper & lower scroll edges */}
            <div className="rail-blur-curtain-top" />
            <div className="rail-blur-curtain-bottom" />

            {/* Scrolling Viewport with Smooth Non-trapping Scroll & Snap */}
            <div
              ref={scrollRef}
              className="rail-scroll-viewport blur-focus-scroll h-full space-y-1.5 snap-y snap-mandatory py-0.5"
              style={{ maxHeight: '100%' }}
            >
              {PORTAL_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIsSpotlightOpen(true)}
                    className="snap-start w-full h-[38px] flex items-center gap-2 px-1.5 text-left cursor-pointer transition-all duration-200 group rounded-lg hover:bg-slate-500/10 dark:hover:bg-white/10 active:scale-[0.98]"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                    title="Click to Open Portals Ring (⌘K)"
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${item.iconBgClass} group-hover:scale-110`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* The "Lil Point of Linkora" */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 dark:bg-black border-2 border-violet-500/70 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-violet-400 hover:shadow-violet-500/30 active:scale-95"
              aria-label="Lil Point of Linkora - Open Spotlight Ring (⌘K)"
              title="Lil Point of Linkora • Tap or press ⌘K to open Big Ring"
            >
              {/* Animated Radar Pulse */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-500 opacity-70 blur-xs animate-ping pointer-events-none" />

              {/* Glowing Center Core */}
              <span className="relative z-10 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-emerald-400 via-violet-400 to-pink-400 flex items-center justify-center shadow-inner group-hover:rotate-45 transition-transform pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </button>

            {/* Shortcut hint pill */}
            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded bg-white/80 dark:bg-charcoal-800/90 border border-slate-200/90 dark:border-charcoal-700 hover:border-violet-400 hover:text-violet-500 transition-colors cursor-pointer shadow-2xs"
              title="Tap or press ⌘K to open Big Ring"
            >
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE FIXED FLOATING PILL (Screens < 1024px)
          - Floating unobtrusively in bottom right corner
          - 1 tap opens the Big Ring modal anywhere on the page
         ========================================================================= */}
      <aside
        aria-label="Linkora Quick Portals Mobile"
        className="lg:hidden fixed bottom-5 right-4 z-40 select-none pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => setIsSpotlightOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 dark:bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-violet-500/50 shadow-xl text-white active:scale-95 transition-all cursor-pointer"
          title="Open Portals Ring"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
          </span>
          <span className="text-xs font-bold tracking-tight">Portals</span>
          <span className="text-[9px] font-mono font-bold px-1 py-0.5 rounded bg-white/20 text-violet-200 flex items-center gap-0.5">
            <Command className="w-2 h-2" />
            <span>K</span>
          </span>
        </button>
      </aside>

      {/* =========================================================================
          THE TRANSPARENT BIG RING MODAL (Mac Command + Space Style)
          - Background website is visible through frosted glass
          - Animated atmospheric blur lights on the backside
          - Pure transparent frosted cyber-glass cards
          - Closes automatically on outside tap or ESC
         ========================================================================= */}
      {mounted && isSpotlightOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={backdropRef}
          onClick={(e) => {
            if (e.target === backdropRef.current) {
              setIsSpotlightOpen(false);
            }
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 backdrop-blur-2xl bg-slate-950/60 dark:bg-black/70 animate-fadeIn cursor-pointer overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Linkora Big Portals Ring"
        >
          {/* Animated Atmospheric Blur Backside */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute w-[440px] h-[440px] sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-600/25 to-pink-500/20 blur-[120px] ambient-blur-animation" />
            <div className="absolute w-[380px] h-[380px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-bl from-amber-500/25 via-rose-500/20 to-transparent blur-[110px] ambient-blur-animation-reverse" />
            <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-r from-emerald-500/25 via-cyan-500/20 to-transparent blur-[100px] ambient-blur-animation" />
          </div>

          {/* Main Big Ring Container - True Circular Celestial Dial */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[580px] sm:max-w-[620px] aspect-square flex items-center justify-center select-none cursor-default blur-to-focus-card my-auto z-10 p-2 sm:p-4 scale-[0.88] xs:scale-[0.92] sm:scale-100 transition-transform"
          >
            {/* Concentric Rotating Orbital Rings Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg
                className="w-full h-full animate-[spin_40s_linear_infinite] opacity-75 dark:opacity-90"
                viewBox="0 0 500 500"
              >
                <circle
                  cx="250"
                  cy="250"
                  r="230"
                  fill="none"
                  stroke="url(#railRingGradOuter)"
                  strokeWidth="1.5"
                  strokeDasharray="8 14 20 14"
                />
                <circle
                  cx="250"
                  cy="250"
                  r="170"
                  fill="none"
                  stroke="url(#railRingGradInner)"
                  strokeWidth="1.2"
                  strokeDasharray="6 10"
                />
                <circle
                  cx="250"
                  cy="250"
                  r="115"
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                />
                <defs>
                  <linearGradient id="railRingGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.95" />
                    <stop offset="30%" stopColor="#ec4899" stopOpacity="0.8" />
                    <stop offset="65%" stopColor="#06b6d4" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="railRingGradInner" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Center Transparent Command Core */}
            <div className="relative z-30 flex flex-col items-center justify-center text-center p-2.5">
              <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-full bg-white/10 dark:bg-white/[0.08] border border-white/25 dark:border-white/20 shadow-[0_8px_32px_0_rgba(139,92,246,0.35)] flex flex-col items-center justify-center p-2 backdrop-blur-3xl group">
                <BrandLogo size="sm" wordmarkColor="light" showWordmark={false} />
                <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest text-white mt-0.5 drop-shadow-md">
                  LINKORA
                </span>
                <span className="text-[7px] sm:text-[8px] font-mono font-bold text-violet-300 uppercase tracking-wider">
                  PORTALS RING
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(false)}
                className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 dark:bg-white/10 hover:bg-white/25 border border-white/25 text-[8.5px] sm:text-[9px] font-mono font-bold text-white transition-all shadow-lg backdrop-blur-xl hover:scale-105 cursor-pointer"
              >
                <X className="w-2.5 h-2.5 text-rose-300" />
                <span>ESC / Tap Outside</span>
              </button>
            </div>

            {/* 4 Radial Orbital Nodes (True Celestial Ring Dial) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 1. TOP-LEFT: Faculty Portal (10:30 on Ring) */}
              <div className="absolute top-2 sm:top-4 left-1 sm:left-3 pointer-events-auto z-30 w-[185px] sm:w-[220px]">
                <Link
                  href="/teacher/dashboard"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-emerald-400/40 hover:border-emerald-400 shadow-[0_8px_32px_0_rgba(16,185,129,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-emerald-500/25 text-emerald-200 border-emerald-400/50 backdrop-blur-md">
                      EDUCATOR DESK
                    </span>
                    <div className="p-1 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                      <GraduationCap className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition-colors drop-shadow-md">
                    Faculty Portal
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 dark:text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Teacher mentor desk, challenge creation & verification.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-emerald-300">
                    <span>Faculty Access</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 2. BOTTOM-LEFT: ICPC Arena (7:30 on Ring - DIRECTLY UNDER Faculty Portal) */}
              <div className="absolute bottom-2 sm:bottom-4 left-1 sm:left-3 pointer-events-auto z-30 w-[185px] sm:w-[220px]">
                <Link
                  href="/icpc"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-cyan-400/40 hover:border-cyan-400 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-cyan-500/25 text-cyan-200 border-cyan-400/50 backdrop-blur-md">
                      ICPC // ARENA
                    </span>
                    <div className="p-1 rounded-lg bg-cyan-500/25 text-cyan-300 border border-cyan-400/40">
                      <Terminal className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                    ICPC Arena
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 dark:text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Collegiate speedruns, ACM rounds & algorithmic ranks.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-cyan-300">
                    <span>Enter ICPC</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 3. TOP-RIGHT: College Hackathons (1:30 on Ring) */}
              <div className="absolute top-2 sm:top-4 right-1 sm:right-3 pointer-events-auto z-30 w-[185px] sm:w-[220px]">
                <Link
                  href="/hackathons"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-amber-400/40 hover:border-amber-400 shadow-[0_8px_32px_0_rgba(245,158,11,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-amber-500/25 text-amber-200 border-amber-400/50 backdrop-blur-md">
                      ARENA // BOUNTIES
                    </span>
                    <div className="p-1 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-400/40">
                      <Trophy className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors drop-shadow-md">
                    College Hackathons
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 dark:text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Assemble squads, enter live hackathons & win bounties.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-amber-300">
                    <span>Explore Arenas</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 4. BOTTOM-RIGHT: Faculty Problems (4:30 on Ring) */}
              <div className="absolute bottom-2 sm:bottom-4 right-1 sm:right-3 pointer-events-auto z-30 w-[185px] sm:w-[220px]">
                <Link
                  href="/problems"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-violet-400/40 hover:border-violet-400 shadow-[0_8px_32px_0_rgba(139,92,246,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-violet-500/25 text-violet-200 border-violet-400/50 backdrop-blur-md">
                      FACULTY BRIEFS
                    </span>
                    <div className="p-1 rounded-lg bg-violet-500/25 text-violet-300 border border-violet-400/40">
                      <Lightbulb className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-violet-300 transition-colors drop-shadow-md">
                    Faculty Problems
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 dark:text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Tackle engineering briefs published by professors.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-violet-300">
                    <span>Solve Briefs</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
