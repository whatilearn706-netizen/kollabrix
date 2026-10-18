'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  Flame,
} from 'lucide-react';
import { OrigamiBirdSculpture } from '@/components/canvas/OrigamiBirdSculpture';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface PortalItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  desc: string;
  href: string;
  icon: React.ElementType;
  themeColor: 'amber' | 'violet' | 'emerald';
  badgeClass: string;
  borderClass: string;
  iconBgClass: string;
  glowClass: string;
  pulseClass: string;
}

const PORTAL_ITEMS: PortalItem[] = [
  {
    id: 'hackathons',
    title: 'College Hackathons',
    subtitle: 'Campus Arenas & Sprints',
    badge: 'LIVE ARENA // BOUNTIES',
    desc: 'Assemble squads, enter live college hackathons, and win verified prizes.',
    href: '/hackathons',
    icon: Trophy,
    themeColor: 'amber',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-500/40 hover:border-amber-400 group-hover:border-amber-400',
    iconBgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    glowClass: 'from-amber-500/20 via-orange-500/10 to-transparent',
    pulseClass: 'bg-amber-400',
  },
  {
    id: 'problems',
    title: 'Faculty Problems',
    subtitle: 'Academic Briefs & Solutions',
    badge: 'FACULTY CHALLENGES',
    desc: 'Solve engineering briefs published by college professors with verified answers.',
    href: '/problems',
    icon: Lightbulb,
    themeColor: 'violet',
    badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    borderClass: 'border-violet-500/40 hover:border-violet-400 group-hover:border-violet-400',
    iconBgClass: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    glowClass: 'from-violet-500/20 via-indigo-500/10 to-transparent',
    pulseClass: 'bg-violet-400',
  },
  {
    id: 'faculty',
    title: 'Faculty Portal',
    subtitle: 'Educator Desk & Review Hub',
    badge: 'FACULTY NETWORK',
    desc: 'Teacher mentor desk, challenge creation, DigiLocker verification & reviews.',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    themeColor: 'emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-500/40 hover:border-emerald-400 group-hover:border-emerald-400',
    iconBgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    glowClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    pulseClass: 'bg-emerald-400',
  },
];

export function OrigamiHeroConsole() {
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Listen for Cmd+Space / Cmd+K or ESC key to toggle/close the Spotlight Big Ring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle with Cmd + Space or Cmd + K or Ctrl + Space
      if ((e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
      // Close on Escape
      if (e.key === 'Escape' && isSpotlightOpen) {
        setIsSpotlightOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpotlightOpen]);

  // Lock body scroll when Spotlight Big Ring is open
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
    <div className="relative w-full flex flex-col xl:flex-row items-center justify-between gap-4 select-none">
      {/* 1. Center / Left Area: Clean, Unobstructed 3D Origami Animal Sculpture */}
      <div className="relative flex-1 min-w-0 w-full h-[360px] sm:h-[420px] lg:h-[460px] flex items-center justify-center">
        <OrigamiBirdSculpture isBlurred={false} />
      </div>

      {/* 2. The Very Right Side of Origami Model: Side Scrolling Strip with Blur Animation */}
      <div className="relative flex items-center gap-2 sm:gap-3 shrink-0 self-center xl:self-auto my-2 xl:my-0">
        {/* Scrollable Container with Blur Curtains at Top and Bottom */}
        <div className="relative w-[210px] sm:w-[230px] h-[340px] sm:h-[380px] rounded-2xl border border-slate-200/90 dark:border-charcoal-800 bg-slate-50/70 dark:bg-charcoal-900/60 p-2 shadow-sm backdrop-blur-md overflow-hidden">
          {/* Blur Curtains for Upper & Lower Margins */}
          <div className="scroll-blur-curtain-top" />
          <div className="scroll-blur-curtain-bottom" />

          {/* Scrolling Viewport with Blur-to-Focus Mask */}
          <div
            ref={scrollRef}
            className="tech-scroll-viewport blur-focus-scroll h-full px-1 py-3 space-y-3 overscroll-contain"
            style={{ maxHeight: '100%' }}
          >
            {PORTAL_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setIsSpotlightOpen(true)}
                  className={`blur-to-focus-card group relative cursor-pointer rounded-xl border bg-white/90 dark:bg-charcoal-900/90 p-3 shadow-xs transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${item.borderClass}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  title="Click to Open Spotlight Ring"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className={`p-1.5 rounded-lg border ${item.iconBgClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex items-center gap-1 text-[8.5px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.pulseClass} animate-pulse`} />
                      <span>{item.subtitle}</span>
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {item.desc}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-charcoal-800 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-violet-500">
                    <span>Expand Ring</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. The "Lil Point of Linkora" at the Right Side of That Scroll Animation */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSpotlightOpen(true)}
            className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 dark:bg-black border-2 border-violet-500/70 shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-violet-400 hover:shadow-violet-500/30"
            aria-label="Lil Point of Linkora - Open Spotlight Ring"
            title="Lil Point of Linkora • Tap or press ⌘+Space to open Big Ring"
          >
            {/* Radar Pulsing Wave */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-500 opacity-70 blur-xs animate-ping pointer-events-none" />

            {/* Glowing Orb Center Core */}
            <span className="relative z-10 w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-400 via-violet-400 to-pink-400 flex items-center justify-center shadow-inner group-hover:rotate-45 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </button>

          {/* Subtle Shortcut Hint Pill */}
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-charcoal-800/80 border border-slate-200 dark:border-charcoal-700">
            <Command className="w-2.5 h-2.5" />
            <span>Space</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          4. THE BIG RING TEMPLATE (Mac Command + Space Style Spotlight Overlay)
          - The desktop/website screen is visible in background through frosted glass
          - Centered futuristic BIG RING with Hackathons, Problems & Faculty Portal
          - Tapping anywhere outside the ring automatically closes it
         ========================================================================= */}
      {isSpotlightOpen && (
        <div
          ref={backdropRef}
          onClick={(e) => {
            // Close automatically when clicking outside the ring container
            if (e.target === backdropRef.current) {
              setIsSpotlightOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-2xl bg-slate-950/70 dark:bg-black/80 animate-fadeIn cursor-pointer overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Linkora Big Portals Ring"
        >
          {/* Main Big Ring Container (Clicks inside do NOT close) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[620px] aspect-square flex items-center justify-center select-none cursor-default blur-to-focus-card my-auto"
          >
            {/* Multi-layered Concentric Rotating Orbital Rings (Sci-Fi Cybernetic Feel) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Outer Slow Rotating Ring */}
              <svg
                className="w-full h-full animate-[spin_40s_linear_infinite] opacity-60 dark:opacity-75"
                viewBox="0 0 500 500"
              >
                <circle
                  cx="250"
                  cy="250"
                  r="230"
                  fill="none"
                  stroke="url(#bigRingGradOuter)"
                  strokeWidth="1.5"
                  strokeDasharray="8 14 20 14"
                />
                <circle
                  cx="250"
                  cy="250"
                  r="175"
                  fill="none"
                  stroke="url(#bigRingGradInner)"
                  strokeWidth="1.2"
                  strokeDasharray="6 10"
                />
                <circle
                  cx="250"
                  cy="250"
                  r="120"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                  strokeDasharray="3 6"
                />
                <defs>
                  <linearGradient id="bigRingGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#ec4899" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                  </linearGradient>
                  <linearGradient id="bigRingGradInner" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Radiant Ambient Core Glow */}
              <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600/25 via-pink-500/20 to-emerald-500/25 blur-3xl pointer-events-none" />
            </div>

            {/* Center Command Core Hub */}
            <div className="relative z-30 flex flex-col items-center justify-center text-center p-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/95 dark:bg-black/95 border-2 border-violet-500/70 shadow-2xl flex flex-col items-center justify-center p-3 backdrop-blur-2xl">
                <BrandLogo size="sm" wordmarkColor="light" showWordmark={false} />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-white mt-1">
                  LINKORA
                </span>
                <span className="text-[8px] font-mono text-violet-400 uppercase tracking-wider">
                  PORTALS RING
                </span>
              </div>

              {/* Interactive Close & Keyboard Instruction */}
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono font-bold text-slate-300 hover:text-white hover:border-slate-500 transition-colors shadow-sm"
              >
                <X className="w-3 h-3 text-rose-400" />
                <span>ESC or Tap Outside to Close</span>
              </button>
            </div>

            {/* THE THREE RADIAL NODES POSITIONED RADIAL ON THE BIG RING */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 1. TOP NODE: College Hackathons */}
              <div className="absolute top-1 sm:top-2 left-1/2 -translate-x-1/2 pointer-events-auto z-30 w-[240px] sm:w-[270px]">
                <Link
                  href="/hackathons"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-3 sm:p-4 rounded-2xl bg-slate-950/95 dark:bg-black/95 border border-amber-500/50 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-amber-400 hover:shadow-amber-500/20"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/40">
                      ARENA // BOUNTIES
                    </span>
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-amber-400 transition-colors">
                    College Hackathons
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    Assemble squads, enter live collegiate hackathons, and win verified bounties.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>Explore Arenas</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 2. BOTTOM-RIGHT NODE: Faculty Problem Statements */}
              <div className="absolute bottom-2 sm:bottom-4 right-1 sm:right-2 pointer-events-auto z-30 w-[230px] sm:w-[260px]">
                <Link
                  href="/problems"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-3 sm:p-4 rounded-2xl bg-slate-950/95 dark:bg-black/95 border border-violet-500/50 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-violet-400 hover:shadow-violet-500/20"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full border bg-violet-500/20 text-violet-300 border-violet-500/40">
                      FACULTY CHALLENGES
                    </span>
                    <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-violet-400 transition-colors">
                    Faculty Problems
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    Tackle engineering briefs published by college professors with verified answers.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-violet-400">
                    <span>Solve Briefs</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 3. BOTTOM-LEFT NODE: Faculty Portal */}
              <div className="absolute bottom-2 sm:bottom-4 left-1 sm:left-2 pointer-events-auto z-30 w-[230px] sm:w-[260px]">
                <Link
                  href="/teacher/dashboard"
                  onClick={() => setIsSpotlightOpen(false)}
                  className="group block p-3 sm:p-4 rounded-2xl bg-slate-950/95 dark:bg-black/95 border border-emerald-500/50 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-emerald-400 hover:shadow-emerald-500/20"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                      EDUCATOR DESK
                    </span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-400 transition-colors">
                    Faculty Portal
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    Teacher mentor desk, challenge creation, DigiLocker verification & reviews.
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Faculty Access</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
