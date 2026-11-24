'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Sparkles,
  Trophy,
  Calendar,
  Users,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import {
  FeaturedHackathonBadgeConfig,
  DEFAULT_FEATURED_HACKATHON_BADGES,
} from '@/types/masterControl';

// Visual themes mapped to the user reference (Image 2 passes)
const BADGE_THEMES: Record<
  FeaturedHackathonBadgeConfig['themeStyle'],
  {
    cardBg: string;
    cardBorder: string;
    textTitle: string;
    glow: string;
    strapBg: string;
    strapPattern: string;
    metalColor: string;
    accentBadge: string;
  }
> = {
  crimson: {
    cardBg: 'from-[#1a0609] via-[#0f0406] to-[#080203]',
    cardBorder: 'border-rose-500/40 hover:border-rose-400',
    textTitle: 'text-white',
    glow: 'rgba(244, 63, 94, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#881337] to-[#e11d48]',
    strapPattern: 'bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:6px_6px]',
    metalColor: '#1c1917',
    accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
  magenta: {
    cardBg: 'from-[#1c081c] via-[#0d030f] to-[#07010a]',
    cardBorder: 'border-fuchsia-500/40 hover:border-fuchsia-400',
    textTitle: 'text-white',
    glow: 'rgba(217, 70, 239, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#701a75] to-[#c026d3]',
    strapPattern: 'bg-[linear-gradient(45deg,#ffffff22_25%,transparent_25%,transparent_75%,#ffffff22_75%)] [background-size:8px_8px]',
    metalColor: '#1c1917',
    accentBadge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
  },
  teal: {
    cardBg: 'from-[#051a17] via-[#030f0e] to-[#010808]',
    cardBorder: 'border-emerald-500/40 hover:border-emerald-400',
    textTitle: 'text-white',
    glow: 'rgba(16, 185, 129, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#064e3b] to-[#059669]',
    strapPattern: 'bg-[repeating-linear-gradient(0deg,#ffffff22,#ffffff22_2px,transparent_2px,transparent_6px)]',
    metalColor: '#1c1917',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  cobalt: {
    cardBg: 'from-[#08152e] via-[#040b17] to-[#02060f]',
    cardBorder: 'border-blue-500/40 hover:border-blue-400',
    textTitle: 'text-white',
    glow: 'rgba(59, 130, 246, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#1e3a8a] to-[#2563eb]',
    strapPattern: 'bg-[radial-gradient(#ffffff33_2px,transparent_2px)] [background-size:8px_8px]',
    metalColor: '#1c1917',
    accentBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  gold: {
    cardBg: 'from-[#1c1404] via-[#0e0a02] to-[#060401]',
    cardBorder: 'border-amber-500/40 hover:border-amber-400',
    textTitle: 'text-white',
    glow: 'rgba(245, 158, 11, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#78350f] to-[#d97706]',
    strapPattern: 'bg-[repeating-linear-gradient(45deg,#ffffff22,#ffffff22_3px,transparent_3px,transparent_9px)]',
    metalColor: '#1c1917',
    accentBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
};

export function HangingHackathonPasses() {
  const [badges, setBadges] = useState<FeaturedHackathonBadgeConfig[]>(
    DEFAULT_FEATURED_HACKATHON_BADGES
  );
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);

  // Sync dynamic badge config from Master Control API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/master-control', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (
          isMounted &&
          data?.config?.featuredHackathonBadges &&
          Array.isArray(data.config.featuredHackathonBadges) &&
          data.config.featuredHackathonBadges.length > 0
        ) {
          setBadges(data.config.featuredHackathonBadges);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative py-16 sm:py-24 bg-[#07090e] border-t border-white/[0.06] overflow-hidden select-none">
      {/* Subtle Ambient Backlighting */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_70%)] blur-[100px] pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white/[0.08] text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Collegiate Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              Curated Hackathon Passes
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              Claim your verified team credential, unlock sponsored prize tracks, and assemble squad members.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hackathons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-white transition-all group self-start sm:self-auto cursor-pointer"
            >
              <span>View All Competitions</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3D HANGING LANYARD PASSES ROW (Faithful to Image 2 Reference) */}
        {/* ============================================================== */}
        <div className="relative w-full pt-16 pb-8 overflow-x-auto no-scrollbar [perspective:1200px]">
          <div className="min-w-[1100px] flex items-start justify-center gap-5 sm:gap-7 xl:gap-8 px-4">
            {badges.map((badge, idx) => {
              const theme = BADGE_THEMES[badge.themeStyle] || BADGE_THEMES.crimson;
              const isHovered = hoveredBadgeId === badge.id;

              // Staggered lanyard strap lengths for natural physical hanging effect
              const strapLengths = [120, 140, 115, 135, 125];
              const strapHeight = strapLengths[idx % strapLengths.length];

              return (
                <div
                  key={badge.id}
                  className="flex flex-col items-center group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBadgeId(badge.id)}
                  onMouseLeave={() => setHoveredBadgeId(null)}
                >
                  {/* ================= 1. WOVEN FABRIC LANYARD STRAP ================= */}
                  <div className="relative flex flex-col items-center">
                    {/* Top ceiling clip point */}
                    <div className="w-12 h-2 rounded-full bg-slate-900 border border-slate-700 shadow-md" />

                    {/* Strap Fabric Ribbon */}
                    <div
                      style={{ height: `${strapHeight}px` }}
                      className={`w-7 sm:w-8 relative shadow-lg ${theme.strapBg} flex items-center justify-center overflow-hidden`}
                    >
                      {/* Lanyard texture pattern */}
                      <div className={`absolute inset-0 opacity-40 ${theme.strapPattern}`} />
                      {/* Center stitching groove */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 border-l border-dashed border-black/40" />
                    </div>

                    {/* Silver rivet button on strap (Image 2 detail) */}
                    <div className="relative -mt-2 z-10 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-700 shadow-sm" />

                    {/* ================= 2. MATTE METAL CARABINER CLASP ================= */}
                    <div className="relative z-10 flex flex-col items-center -mt-1">
                      {/* Triangular strap ring */}
                      <div className="w-6 h-3 rounded-t-sm border-2 border-stone-800 bg-stone-900" />
                      {/* Swivel barrel cylinder */}
                      <div className="w-2.5 h-3 bg-stone-800 border border-stone-700 rounded-xs -mt-0.5" />
                      {/* Spring snap hook clasp clipping into badge */}
                      <div className="w-4 h-6 border-2 border-stone-800 rounded-b-full bg-stone-900 -mt-0.5 flex items-end justify-center pb-0.5 shadow-md">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                      </div>
                    </div>
                  </div>

                  {/* ================= 3. PHYSICAL ID BADGE PASS (IMAGE 2 STYLE) ================= */}
                  <motion.div
                    animate={{
                      y: isHovered ? -10 : 0,
                      rotateZ: isHovered ? [0, -1.5, 1.2, 0] : 0,
                      scale: isHovered ? 1.025 : 1,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      boxShadow: isHovered
                        ? `0 35px 70px -15px rgba(0, 0, 0, 0.95), 0 0 35px ${theme.glow}`
                        : '0 20px 45px -15px rgba(0, 0, 0, 0.85)',
                    }}
                    className={`relative -mt-1.5 w-[215px] sm:w-[235px] md:w-[250px] h-[350px] sm:h-[380px] rounded-[22px] border ${theme.cardBorder} bg-gradient-to-b ${theme.cardBg} backdrop-blur-xl overflow-hidden p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 select-none`}
                  >
                    {/* Punch slot hole at top-center for lanyard clip */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-7 h-2 rounded-full bg-black/90 border border-white/20 shadow-inner z-20" />

                    {/* Chromatic Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none" />

                    {/* ================= GRAPHIC PATTERNS FAITHFUL TO IMAGE 2 ================= */}
                    {/* Pattern 1: Crimson Red Fluid Wave */}
                    {badge.pattern === 'curves' && (
                      <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-radial-gradient from-rose-600/40 via-rose-900/10 to-transparent blur-xl pointer-events-none" />
                    )}

                    {/* Pattern 2: Magenta Concentric Wave Arcs */}
                    {badge.pattern === 'rings' && (
                      <svg
                        className="absolute -bottom-12 -right-12 w-52 h-52 pointer-events-none opacity-40"
                        viewBox="0 0 200 200"
                      >
                        <circle cx="200" cy="200" r="160" fill="none" stroke="#d946ef" strokeWidth="18" />
                        <circle cx="200" cy="200" r="120" fill="none" stroke="#a21caf" strokeWidth="16" />
                        <circle cx="200" cy="200" r="80" fill="none" stroke="#701a75" strokeWidth="14" />
                      </svg>
                    )}

                    {/* Pattern 3: Teal Cyber Wave Lines */}
                    {badge.pattern === 'wave' && (
                      <svg
                        className="absolute inset-x-0 bottom-0 w-full h-32 pointer-events-none opacity-45"
                        viewBox="0 0 200 100"
                        preserveAspectRatio="none"
                      >
                        <path d="M0,40 Q50,10 100,40 T200,40" fill="none" stroke="#10b981" strokeWidth="2" />
                        <path d="M0,55 Q50,25 100,55 T200,55" fill="none" stroke="#059669" strokeWidth="2" />
                        <path d="M0,70 Q50,40 100,70 T200,70" fill="none" stroke="#047857" strokeWidth="2" />
                        <path d="M0,85 Q50,55 100,85 T200,85" fill="none" stroke="#065f46" strokeWidth="2" />
                      </svg>
                    )}

                    {/* Pattern 4: Blue Polka Dot Circle Matrix (Exact to Image 2 Card 4) */}
                    {badge.pattern === 'circles' && (
                      <div className="absolute top-12 right-0 w-28 h-44 grid grid-cols-3 gap-2.5 opacity-40 pointer-events-none">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-blue-500/80" />
                        ))}
                      </div>
                    )}

                    {/* Pattern 5: Solar Amber Vertical Paintbrush Burst (Exact to Image 2 Card 5) */}
                    {badge.pattern === 'soundwave' && (
                      <div className="absolute inset-y-0 right-0 w-16 opacity-35 pointer-events-none flex items-center justify-end overflow-hidden">
                        <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#f59e0b,#f59e0b_2px,transparent_2px,transparent_4px)] [mask-image:linear-gradient(to_left,black,transparent)]" />
                      </div>
                    )}

                    {/* ================= BADGE HEADER (HOST / EVENT BRANDING) ================= */}
                    <div className="relative z-10 pt-3">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 line-clamp-1 max-w-[150px]">
                          {badge.hostName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border ${theme.accentBadge}`}>
                          {badge.statusBadge}
                        </span>
                      </div>
                    </div>

                    {/* ================= BADGE BODY: BIG TYPOGRAPHY & DATE (IMAGE 2 STYLE) ================= */}
                    <div className="relative z-10 my-auto py-2">
                      {/* Big Bold Credential Pass Stamp (2 Lines) */}
                      <h3 className="text-3xl sm:text-[34px] font-black uppercase tracking-tight text-white leading-none font-heading drop-shadow-md">
                        {badge.passType.split(' ')[0]}
                        <br />
                        <span className="text-white/90">{badge.passType.split(' ')[1] || 'PASS'}</span>
                      </h3>

                      {/* Prominent Clean Date Stamp */}
                      <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white/90 mt-2">
                        {badge.eventDate}
                      </div>

                      {/* Hackathon Name */}
                      <p className="text-xs font-semibold text-slate-300 mt-2 line-clamp-2 leading-snug">
                        {badge.title}
                      </p>
                    </div>

                    {/* ================= BADGE FOOTER: PRIZE POOL & ACTION ================= */}
                    <div className="relative z-10 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          PRIZE POOL
                        </div>
                        <div className="text-xs font-black text-amber-300 truncate">
                          {badge.prizePool}
                        </div>
                      </div>

                      <Link
                        href={badge.actionUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-[0_2px_12px_rgba(255,255,255,0.4)] transition-all active:scale-95 shrink-0"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
