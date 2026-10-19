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
  Clock,
  MessageSquare,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface PortalItem {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
  themeColor: 'amber' | 'violet' | 'emerald' | 'cyan' | 'rose';
  iconBgClass: string;
  borderClass: string;
  badge: string;
  badgeBgClass: string;
  badgeTextClass: string;
  description: string;
  ctaText: string;
  ctaClass: string;
}

const PORTAL_ITEMS: PortalItem[] = [
  {
    id: 'leaderboard',
    title: 'Campus Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    themeColor: 'amber',
    iconBgClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-300 border-amber-500/30',
    borderClass: 'border-amber-400/40 hover:border-amber-400 shadow-[0_8px_32px_0_rgba(245,158,11,0.25)]',
    badge: 'CAMPUS // RANKS',
    badgeBgClass: 'bg-amber-500/25 border-amber-400/50',
    badgeTextClass: 'text-amber-200',
    description: 'Collegiate leaderboards, top builders, daily streaks & XP.',
    ctaText: 'View Leaderboard',
    ctaClass: 'text-amber-300',
  },
  {
    id: 'deadlines',
    title: 'Deadlines Radar',
    href: '/deadlines',
    icon: Clock,
    themeColor: 'rose',
    iconBgClass: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/30',
    borderClass: 'border-rose-400/40 hover:border-rose-400 shadow-[0_8px_32px_0_rgba(244,63,94,0.25)]',
    badge: 'COUNTDOWN // RADAR',
    badgeBgClass: 'bg-rose-500/25 border-rose-400/50',
    badgeTextClass: 'text-rose-200',
    description: 'Live countdowns for hackathons, faculty briefs & submissions.',
    ctaText: 'View Deadlines',
    ctaClass: 'text-rose-300',
  },
  {
    id: 'spark',
    title: 'AI Spark Studio',
    href: '/spark',
    icon: Sparkles,
    themeColor: 'violet',
    iconBgClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    borderClass: 'border-violet-400/40 hover:border-violet-400 shadow-[0_8px_32px_0_rgba(139,92,246,0.25)]',
    badge: 'AI // SQUAD BUILDER',
    badgeBgClass: 'bg-violet-500/25 border-violet-400/50',
    badgeTextClass: 'text-violet-200',
    description: 'AI project blueprint architect, squad builder & tech stacks.',
    ctaText: 'Launch AI Spark',
    ctaClass: 'text-violet-300',
  },
  {
    id: 'feedback',
    title: 'Community Feedback',
    href: '#feedback',
    icon: MessageSquare,
    themeColor: 'cyan',
    iconBgClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    borderClass: 'border-cyan-400/40 hover:border-cyan-400 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)]',
    badge: 'COMMUNITY // VOICE',
    badgeBgClass: 'bg-cyan-500/25 border-cyan-400/50',
    badgeTextClass: 'text-cyan-200',
    description: 'Direct message to Admin Control Center with ideas & bug reports.',
    ctaText: 'Community Feedback',
    ctaClass: 'text-cyan-300',
  },
  {
    id: 'hackathons',
    title: 'College Hackathons',
    href: '/hackathons',
    icon: Trophy,
    themeColor: 'amber',
    iconBgClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    borderClass: 'border-amber-400/40 hover:border-amber-400 shadow-[0_8px_32px_0_rgba(245,158,11,0.25)]',
    badge: 'ARENA // SQUADS',
    badgeBgClass: 'bg-amber-500/25 border-amber-400/50',
    badgeTextClass: 'text-amber-200',
    description: 'Assemble squads, enter live hackathons & win bounties.',
    ctaText: 'Explore Hackathons',
    ctaClass: 'text-amber-300',
  },
  {
    id: 'problems',
    title: 'Faculty Problems',
    href: '/problems',
    icon: Lightbulb,
    themeColor: 'violet',
    iconBgClass: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
    borderClass: 'border-violet-400/40 hover:border-violet-400 shadow-[0_8px_32px_0_rgba(139,92,246,0.25)]',
    badge: 'FACULTY // BRIEFS',
    badgeBgClass: 'bg-violet-500/25 border-violet-400/50',
    badgeTextClass: 'text-violet-200',
    description: 'Tackle real engineering briefs published by professors.',
    ctaText: 'Solve Problems',
    ctaClass: 'text-violet-300',
  },
  {
    id: 'icpc',
    title: 'ICPC Arena',
    href: '/icpc',
    icon: Terminal,
    themeColor: 'cyan',
    iconBgClass: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    borderClass: 'border-cyan-400/40 hover:border-cyan-400 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)]',
    badge: 'ICPC // SPEEDRUN',
    badgeBgClass: 'bg-cyan-500/25 border-cyan-400/50',
    badgeTextClass: 'text-cyan-200',
    description: 'Collegiate speedruns, ACM rounds & algorithmic ranks.',
    ctaText: 'Enter ICPC',
    ctaClass: 'text-cyan-300',
  },
  {
    id: 'faculty',
    title: 'Faculty Portal',
    href: '/teacher/dashboard',
    icon: GraduationCap,
    themeColor: 'emerald',
    iconBgClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    borderClass: 'border-emerald-400/40 hover:border-emerald-400 shadow-[0_8px_32px_0_rgba(16,185,129,0.25)]',
    badge: 'EDUCATOR // DESK',
    badgeBgClass: 'bg-emerald-500/25 border-emerald-400/50',
    badgeTextClass: 'text-emerald-200',
    description: 'Teacher mentor desk, challenge creation & verification.',
    ctaText: 'Faculty Access',
    ctaClass: 'text-emerald-300',
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

  const triggerFeedbackModal = () => {
    if (typeof window !== 'undefined') {
      if (typeof window.openLinkoraFeedback === 'function') {
        window.openLinkoraFeedback();
      }
      window.dispatchEvent(new CustomEvent('open-linkora-feedback'));
      window.dispatchEvent(new CustomEvent('linkora-feedback'));
    }
  };

  const handleLinkClick = (href: string, e?: React.MouseEvent) => {
    if (href === '#feedback' || href === '/#feedback-section' || href.includes('feedback')) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsSpotlightOpen(false);
      triggerFeedbackModal();
      return;
    }
    setIsSpotlightOpen(false);
  };

  const handleRailClick = (e: React.MouseEvent, href: string) => {
    if (href === '#feedback' || href === '/#feedback-section' || href.includes('feedback')) {
      e.preventDefault();
      e.stopPropagation();
      triggerFeedbackModal();
      return;
    }
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP FIXED PORTALS SIDE RAIL (Screens >= 1024px)
          - Position is fixed on right edge while website scrolls normally
          - Shows 2 names cleanly before scrolling
          - Direct 1-tap navigation for all orbital items
          - Lil Point of Linkora with ⌘K badge triggers Big Ring modal
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
                const isFeedback = item.id === 'feedback' || item.href === '#feedback';
                if (isFeedback) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerFeedbackModal();
                      }}
                      className="snap-start w-full h-[38px] flex items-center gap-2 px-1.5 text-left cursor-pointer transition-all duration-200 group rounded-lg hover:bg-slate-500/10 dark:hover:bg-white/10 active:scale-[0.98]"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                      title="Open Community Feedback"
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${item.iconBgClass} group-hover:scale-110`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {item.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="snap-start w-full h-[38px] flex items-center gap-2 px-1.5 text-left cursor-pointer transition-all duration-200 group rounded-lg hover:bg-slate-500/10 dark:hover:bg-white/10 active:scale-[0.98]"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                    title={`Open ${item.title}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all duration-200 ${item.iconBgClass} group-hover:scale-110`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                      {item.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* The "Lil Point of Linkora" (Radar button triggers ⌘K Big Ring Modal) */}
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
          - Shows Leaderboard, Deadlines, AI Spark, Feedback, Hackathons, Problems, ICPC & Faculty
          - 1-tap navigation directly routes to the selected portal and closes modal
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 backdrop-blur-2xl bg-slate-950/70 dark:bg-black/80 animate-fadeIn cursor-pointer overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Linkora Big Portals Ring"
        >
          {/* Animated Atmospheric Blur Backside */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="absolute w-[440px] h-[440px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-600/25 to-pink-500/20 blur-[120px] ambient-blur-animation" />
            <div className="absolute w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] rounded-full bg-gradient-to-bl from-amber-500/25 via-rose-500/20 to-transparent blur-[110px] ambient-blur-animation-reverse" />
            <div className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-to-r from-emerald-500/25 via-cyan-500/20 to-transparent blur-[100px] ambient-blur-animation" />
          </div>

          {/* =====================================================================
              DESKTOP VIEW (Screens >= 768px): True Celestial Orbital Dial
             ===================================================================== */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden md:flex relative w-full max-w-[640px] aspect-square items-center justify-center select-none cursor-default blur-to-focus-card my-auto z-10 p-2 sm:p-4 scale-[0.92] lg:scale-100 transition-transform"
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
            <div className="relative z-30 flex flex-col items-center justify-center text-center p-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 dark:bg-white/[0.08] border border-white/25 dark:border-white/20 shadow-[0_8px_32px_0_rgba(139,92,246,0.35)] flex flex-col items-center justify-center p-2 backdrop-blur-3xl group">
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

              {/* Secondary Orbital Quick Dock (Hackathons, Problems, ICPC, Faculty) */}
              <div className="mt-3 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/70 border border-white/15 backdrop-blur-xl">
                <Link
                  href="/hackathons"
                  onClick={() => handleLinkClick('/hackathons')}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold text-amber-300 hover:bg-white/10 flex items-center gap-1 transition-all"
                  title="College Hackathons"
                >
                  <Trophy className="w-2.5 h-2.5" />
                  <span>Hackathons</span>
                </Link>
                <Link
                  href="/problems"
                  onClick={() => handleLinkClick('/problems')}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold text-violet-300 hover:bg-white/10 flex items-center gap-1 transition-all"
                  title="Faculty Problems"
                >
                  <Lightbulb className="w-2.5 h-2.5" />
                  <span>Problems</span>
                </Link>
                <Link
                  href="/icpc"
                  onClick={() => handleLinkClick('/icpc')}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold text-cyan-300 hover:bg-white/10 flex items-center gap-1 transition-all"
                  title="ICPC Arena"
                >
                  <Terminal className="w-2.5 h-2.5" />
                  <span>ICPC</span>
                </Link>
                <Link
                  href="/teacher/dashboard"
                  onClick={() => handleLinkClick('/teacher/dashboard')}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold text-emerald-300 hover:bg-white/10 flex items-center gap-1 transition-all"
                  title="Faculty Portal"
                >
                  <GraduationCap className="w-2.5 h-2.5" />
                  <span>Faculty</span>
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleLinkClick('#feedback', e)}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold text-cyan-300 hover:bg-white/10 flex items-center gap-1 transition-all cursor-pointer"
                  title="Community Feedback"
                >
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>

            {/* 4 Radial Orbital Highlight Cards (Leaderboard, AI Spark, Deadlines, Feedback) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 1. TOP-LEFT: Campus Leaderboard (10:30 on Ring) */}
              <div className="absolute top-2 sm:top-4 left-1 sm:left-3 pointer-events-auto z-30 w-[190px] sm:w-[225px]">
                <Link
                  href="/leaderboard"
                  onClick={() => handleLinkClick('/leaderboard')}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-amber-400/40 hover:border-amber-400 shadow-[0_8px_32px_0_rgba(245,158,11,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-amber-500/25 text-amber-200 border-amber-400/50 backdrop-blur-md">
                      CAMPUS // RANKS
                    </span>
                    <div className="p-1 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-400/40">
                      <Trophy className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors drop-shadow-md">
                    Campus Leaderboard
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Collegiate ranks, top builders, daily streaks & XP.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-amber-300">
                    <span>View Leaderboard</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 2. TOP-RIGHT: AI Spark Studio (1:30 on Ring) */}
              <div className="absolute top-2 sm:top-4 right-1 sm:right-3 pointer-events-auto z-30 w-[190px] sm:w-[225px]">
                <Link
                  href="/spark"
                  onClick={() => handleLinkClick('/spark')}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-violet-400/40 hover:border-violet-400 shadow-[0_8px_32px_0_rgba(139,92,246,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-violet-500/25 text-violet-200 border-violet-400/50 backdrop-blur-md">
                      AI // SQUAD BUILDER
                    </span>
                    <div className="p-1 rounded-lg bg-violet-500/25 text-violet-300 border border-violet-400/40">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-violet-300 transition-colors drop-shadow-md">
                    AI Spark Studio
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    AI project architect, squad builder & tech stacks.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-violet-300">
                    <span>Launch AI Spark</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 3. BOTTOM-LEFT: Deadlines Radar (7:30 on Ring) */}
              <div className="absolute bottom-2 sm:bottom-4 left-1 sm:left-3 pointer-events-auto z-30 w-[190px] sm:w-[225px]">
                <Link
                  href="/deadlines"
                  onClick={() => handleLinkClick('/deadlines')}
                  className="group block p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-rose-400/40 hover:border-rose-400 shadow-[0_8px_32px_0_rgba(244,63,94,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-rose-500/25 text-rose-200 border-rose-400/50 backdrop-blur-md">
                      DEADLINES // RADAR
                    </span>
                    <div className="p-1 rounded-lg bg-rose-500/25 text-rose-300 border border-rose-400/40">
                      <Clock className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-rose-300 transition-colors drop-shadow-md">
                    Deadlines Radar
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Countdown to hackathons, faculty briefs & submissions.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-rose-300">
                    <span>View Deadlines</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* 4. BOTTOM-RIGHT: Write Feedback (4:30 on Ring) */}
              <div className="absolute bottom-2 sm:bottom-4 right-1 sm:right-3 pointer-events-auto z-30 w-[190px] sm:w-[225px]">
                <button
                  type="button"
                  onClick={(e) => handleLinkClick('#feedback', e)}
                  className="group block w-full text-left p-2.5 sm:p-3.5 rounded-2xl bg-white/10 dark:bg-white/[0.08] hover:bg-white/15 dark:hover:bg-white/[0.12] border border-cyan-400/40 hover:border-cyan-400 shadow-[0_8px_32px_0_rgba(6,182,212,0.25)] backdrop-blur-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[7.5px] sm:text-[8px] font-mono font-black px-1.5 py-0.5 rounded-full border bg-cyan-500/25 text-cyan-200 border-cyan-400/50 backdrop-blur-md">
                      COMMUNITY // VOICE
                    </span>
                    <div className="p-1 rounded-lg bg-cyan-500/25 text-cyan-300 border border-cyan-400/40">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                    Community Feedback
                  </h4>
                  <p className="text-[9.5px] sm:text-[10px] text-slate-200 mt-0.5 line-clamp-2 font-medium leading-tight">
                    Direct message to Admin Control Center with ideas & bug reports.
                  </p>
                  <div className="mt-1.5 pt-1 border-t border-white/15 flex items-center justify-between text-[10px] font-bold text-cyan-300">
                    <span>Community Feedback</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================================
              MOBILE VIEW (Screens < 768px): Sleek Responsive Portals Command HUD
             ===================================================================== */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="md:hidden relative w-full max-w-md my-auto z-10 bg-slate-950/90 border border-white/20 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl space-y-4"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" wordmarkColor="light" showWordmark={false} />
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>LINKORA PORTALS</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                      ⌘K
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Tap any portal to navigate immediately</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-rose-300" />
              </button>
            </div>

            {/* Mobile Grid with all 8 Portals */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {PORTAL_ITEMS.map((item) => {
                const Icon = item.icon;
                const isFeedback = item.id === 'feedback' || item.href === '#feedback';
                if (isFeedback) {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => handleLinkClick('#feedback', e)}
                      className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-cyan-400/30 hover:border-cyan-400 transition-all flex flex-col justify-between group active:scale-[0.98] text-left"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${item.iconBgClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`text-[7px] font-mono font-bold px-1 py-0.5 rounded ${item.badgeBgClass} ${item.badgeTextClass}`}>
                            {item.id.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] font-bold text-cyan-300 group-hover:text-cyan-200">
                        <span>Feedback</span>
                        <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    className="p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white/30 transition-all flex flex-col justify-between group active:scale-[0.98]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${item.iconBgClass}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[7px] font-mono font-bold px-1 py-0.5 rounded ${item.badgeBgClass} ${item.badgeTextClass}`}>
                          {item.id.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-2 pt-1 border-t border-white/10 flex items-center justify-between text-[9px] font-bold text-slate-300 group-hover:text-white">
                      <span>Open</span>
                      <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
