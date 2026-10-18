'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Lightbulb,
  GraduationCap,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { OrigamiBirdSculpture } from '@/components/canvas/OrigamiBirdSculpture';

export function OrigamiPortalRing() {
  const [isRingOpen, setIsRingOpen] = useState(false);

  const toggleRing = () => {
    setIsRingOpen((prev) => !prev);
  };

  const portalNodes = [
    {
      id: 'hackathons',
      title: 'College Hackathons',
      shortTitle: 'Hackathons',
      badge: 'ARENAS & BOUNTIES',
      desc: 'Compete in live collegiate sprints & hackathons',
      href: '/hackathons',
      icon: Trophy,
      themeColor: 'amber',
      borderClass: 'border-amber-500/50 hover:border-amber-400',
      glowClass: 'from-amber-500/25 via-orange-500/15 to-transparent',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      iconBgClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
      indicatorClass: 'bg-amber-400',
    },
    {
      id: 'problems',
      title: 'Faculty Problems',
      shortTitle: 'Problems',
      badge: 'FACULTY CHALLENGES',
      desc: 'Solve professor briefs & submit verified answers',
      href: '/problems',
      icon: Lightbulb,
      themeColor: 'violet',
      borderClass: 'border-violet-500/50 hover:border-violet-400',
      glowClass: 'from-violet-500/25 via-indigo-500/15 to-transparent',
      badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      iconBgClass: 'bg-violet-500/20 text-violet-400 border border-violet-500/40',
      indicatorClass: 'bg-violet-400',
    },
    {
      id: 'faculty',
      title: 'Faculty Portal',
      shortTitle: 'Faculty Portal',
      badge: 'EDUCATOR NETWORK',
      desc: 'Teacher mentor hub, challenge desk & reviews',
      href: '/teacher/dashboard',
      icon: GraduationCap,
      themeColor: 'emerald',
      borderClass: 'border-emerald-500/50 hover:border-emerald-400',
      glowClass: 'from-emerald-500/25 via-teal-500/15 to-transparent',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      iconBgClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
      indicatorClass: 'bg-emerald-400',
    },
  ];

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] lg:h-[520px] flex items-center justify-center select-none overflow-visible">
      {/* 3D Origami Animal Sculpture (Smooth Blur Transition when Ring is Open) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrigamiBirdSculpture isBlurred={isRingOpen} />
      </div>

      {/* Floating Holographic Ring Activator Button */}
      <div className="absolute top-2 sm:top-4 z-30 flex flex-col items-center gap-1.5 animate-fadeIn">
        <button
          type="button"
          onClick={toggleRing}
          className={`group flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all shadow-xl backdrop-blur-xl border ${
            isRingOpen
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
              : 'bg-slate-900/85 dark:bg-black/80 border-slate-700/80 text-white hover:border-violet-500/60 hover:bg-slate-800/90'
          }`}
          aria-label={isRingOpen ? 'Close Portals Ring' : 'Tap to Open Portals Ring'}
        >
          {isRingOpen ? (
            <>
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>✕ Close Ring • Focus 3D Animal</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="font-extrabold tracking-wide">
                Tap to Open Ring: Hackathons • Problems • Faculty
              </span>
            </>
          )}
        </button>
      </div>

      {/* Futuristic Radial Orbital Ring Viewport (Opens upon Tap) */}
      {isRingOpen && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-3 animate-fadeIn">
          {/* Animated SVG Concentric Orbital Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Outer Slow Rotating Dashed Ring */}
            <svg
              className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] animate-[spin_35s_linear_infinite] opacity-60 dark:opacity-75"
              viewBox="0 0 400 400"
            >
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="none"
                stroke="url(#ringGradOuter)"
                strokeWidth="1.5"
                strokeDasharray="6 12 18 12"
              />
              <circle
                cx="200"
                cy="200"
                r="135"
                fill="none"
                stroke="url(#ringGradInner)"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
              <defs>
                <linearGradient id="ringGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="ringGradInner" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing Center Ring Orbit Aura */}
            <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-violet-600/20 via-pink-500/15 to-emerald-500/20 blur-2xl pointer-events-none" />
          </div>

          {/* Center Command Core Hub */}
          <div className="relative z-30 flex flex-col items-center justify-center text-center">
            <button
              type="button"
              onClick={toggleRing}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-950/90 dark:bg-black/90 border-2 border-violet-500/60 shadow-2xl flex flex-col items-center justify-center group hover:scale-105 hover:border-violet-400 transition-all cursor-pointer backdrop-blur-2xl"
              title="Click to Close Ring"
            >
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400 group-hover:rotate-45 transition-transform" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300 mt-1">
                PORTALS
              </span>
            </button>
          </div>

          {/* The 3 Orbital Portal Nodes Positioned Radially Around the Center */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Node 1: Top Node -> Hackathons */}
            <div className="absolute top-1 sm:top-3 left-1/2 -translate-x-1/2 pointer-events-auto blur-to-focus-card z-30">
              <Link
                href={portalNodes[0].href}
                className={`group flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-950/90 dark:bg-black/90 border shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${portalNodes[0].borderClass}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${portalNodes[0].iconBgClass}`}>
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${portalNodes[0].badgeClass}`}>
                      {portalNodes[0].badge}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                    {portalNodes[0].title}
                  </h4>
                  <p className="text-[10px] text-slate-400 max-w-[150px] sm:max-w-[170px] truncate">
                    {portalNodes[0].desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Node 2: Bottom-Right Node -> Problem Statements */}
            <div className="absolute bottom-4 sm:bottom-6 right-2 sm:right-4 pointer-events-auto blur-to-focus-card z-30">
              <Link
                href={portalNodes[1].href}
                className={`group flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-950/90 dark:bg-black/90 border shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${portalNodes[1].borderClass}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${portalNodes[1].iconBgClass}`}>
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${portalNodes[1].badgeClass}`}>
                      {portalNodes[1].badge}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-violet-400 transition-colors">
                    {portalNodes[1].title}
                  </h4>
                  <p className="text-[10px] text-slate-400 max-w-[140px] sm:max-w-[160px] truncate">
                    {portalNodes[1].desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Node 3: Bottom-Left Node -> Faculty Portal */}
            <div className="absolute bottom-4 sm:bottom-6 left-2 sm:left-4 pointer-events-auto blur-to-focus-card z-30">
              <Link
                href={portalNodes[2].href}
                className={`group flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-950/90 dark:bg-black/90 border shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 ${portalNodes[2].borderClass}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${portalNodes[2].iconBgClass}`}>
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border ${portalNodes[2].badgeClass}`}>
                      {portalNodes[2].badge}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                    {portalNodes[2].title}
                  </h4>
                  <p className="text-[10px] text-slate-400 max-w-[140px] sm:max-w-[160px] truncate">
                    {portalNodes[2].desc}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
