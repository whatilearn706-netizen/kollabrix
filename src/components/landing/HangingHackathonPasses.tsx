'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Users,
} from 'lucide-react';
import {
  FeaturedHackathonBadgeConfig,
  DEFAULT_FEATURED_HACKATHON_BADGES,
} from '@/types/masterControl';

// Visual themes mapped to the collegiate reference (Image 2 SIH pass)
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
    bottomBarBg: string;
  }
> = {
  cobalt: {
    cardBg: 'from-[#0b1329] via-[#060b18] to-[#02050c]',
    cardBorder: 'border-blue-500/40 hover:border-blue-400',
    textTitle: 'text-white',
    glow: 'rgba(59, 130, 246, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#1e3a8a] to-[#2563eb]',
    strapPattern: 'bg-[radial-gradient(#ffffff33_2px,transparent_2px)] [background-size:8px_8px]',
    metalColor: '#1c1917',
    accentBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    bottomBarBg: 'bg-sky-600',
  },
  crimson: {
    cardBg: 'from-[#1a0609] via-[#0f0406] to-[#080203]',
    cardBorder: 'border-rose-500/40 hover:border-rose-400',
    textTitle: 'text-white',
    glow: 'rgba(244, 63, 94, 0.45)',
    strapBg: 'bg-gradient-to-b from-[#881337] to-[#e11d48]',
    strapPattern: 'bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:6px_6px]',
    metalColor: '#1c1917',
    accentBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    bottomBarBg: 'bg-rose-600',
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
    bottomBarBg: 'bg-purple-600',
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
    bottomBarBg: 'bg-emerald-600',
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
    bottomBarBg: 'bg-amber-600',
  },
  light_gloss: {
    cardBg: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    cardBorder: 'border-slate-300 hover:border-slate-400 shadow-xl',
    textTitle: 'text-slate-900',
    glow: 'rgba(2, 132, 199, 0.35)',
    strapBg: 'bg-gradient-to-b from-[#0369a1] to-[#0284c7]',
    strapPattern: 'bg-[radial-gradient(#ffffff33_2px,transparent_2px)] [background-size:8px_8px]',
    metalColor: '#334155',
    accentBadge: 'bg-sky-100 text-sky-800 border-sky-300',
    bottomBarBg: 'bg-sky-600',
  },
  dark_tactile: {
    cardBg: 'from-[#18181b] via-[#09090b] to-[#000000]',
    cardBorder: 'border-zinc-700 hover:border-zinc-500 shadow-2xl',
    textTitle: 'text-white',
    glow: 'rgba(255, 255, 255, 0.25)',
    strapBg: 'bg-gradient-to-b from-[#27272a] to-[#3f3f46]',
    strapPattern: 'bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:6px_6px]',
    metalColor: '#09090b',
    accentBadge: 'bg-zinc-800 text-zinc-200 border-zinc-600',
    bottomBarBg: 'bg-zinc-800',
  },
};

export function HangingHackathonPasses() {
  const [badges, setBadges] = useState<FeaturedHackathonBadgeConfig[]>(
    DEFAULT_FEATURED_HACKATHON_BADGES
  );
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Sync dynamic badge config from Master Control API
  useEffect(() => {
    let isMounted = true;

    // 1. Try local cache for instant determination
    try {
      const cached = localStorage.getItem('linkora_master_control_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        const live =
          parsed?.featuredHackathonBadgesEnabled === true ||
          parsed?.sections?.hackathonBadges === true;
        setIsLive(Boolean(live));
        if (
          Array.isArray(parsed?.featuredHackathonBadges) &&
          parsed.featuredHackathonBadges.length > 0
        ) {
          setBadges(parsed.featuredHackathonBadges);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh from public API
    fetch('/api/master-control', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.config) {
          const live =
            data.config.featuredHackathonBadgesEnabled === true ||
            data.config.sections?.hackathonBadges === true;
          setIsLive(Boolean(live));
          if (
            Array.isArray(data.config.featuredHackathonBadges) &&
            data.config.featuredHackathonBadges.length > 0
          ) {
            setBadges(data.config.featuredHackathonBadges);
          }
        }
      })
      .catch(() => {});

    // Listen for custom broadcast update event
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('linkora_master_control_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          setIsLive(
            Boolean(
              parsed?.featuredHackathonBadgesEnabled === true ||
              parsed?.sections?.hackathonBadges === true
            )
          );
          if (Array.isArray(parsed?.featuredHackathonBadges)) {
            setBadges(parsed.featuredHackathonBadges);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  // If Not Live, do not render on the public landing page!
  if (!isLive) {
    return null;
  }

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
              <span>Collegiate Credentials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              Curated Hackathon Passes
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              Official physical-style competition badges for upcoming collegiate hackathons. Explore host campuses, prize pools, and claim your participant pass.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/hackathons"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-white transition-all group self-start sm:self-auto cursor-pointer"
            >
              <span>View All 40+ Competitions</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3D HANGING LANYARD PASSES ROW (FAITHFUL TO IMAGE 2 SIH BADGE) */}
        {/* ============================================================== */}
        <div className="relative w-full pt-16 pb-8 overflow-x-auto no-scrollbar [perspective:1200px]">
          <div className="min-w-[1150px] flex items-start justify-center gap-5 sm:gap-7 xl:gap-8 px-4">
            {badges.map((badge, idx) => {
              const theme = BADGE_THEMES[badge.themeStyle] || BADGE_THEMES.cobalt;
              const isHovered = hoveredBadgeId === badge.id;

              // Derive custom bottom bar color from statusStripTone if set
              const bottomBarColor =
                badge.statusStripTone === 'blue'
                  ? 'bg-sky-600'
                  : badge.statusStripTone === 'emerald'
                  ? 'bg-emerald-600'
                  : badge.statusStripTone === 'amber'
                  ? 'bg-amber-600'
                  : badge.statusStripTone === 'crimson'
                  ? 'bg-rose-600'
                  : badge.statusStripTone === 'purple'
                  ? 'bg-purple-600'
                  : theme.bottomBarBg;

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
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-600" />
                      </div>
                    </div>
                  </div>

                  {/* ================= 3. PHYSICAL COLLEGIATE ID BADGE PASS (IMAGE 2 STYLE) ================= */}
                  <motion.div
                    animate={{
                      y: isHovered ? -12 : 0,
                      rotateZ: isHovered ? [0, -1.8, 1.4, 0] : 0,
                      scale: isHovered ? 1.03 : 1,
                    }}
                    transition={{
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      boxShadow: isHovered
                        ? `0 35px 75px -15px rgba(0, 0, 0, 0.95), 0 0 35px ${theme.glow}`
                        : '0 20px 45px -15px rgba(0, 0, 0, 0.85)',
                    }}
                    className={`relative -mt-1.5 w-[235px] sm:w-[255px] md:w-[270px] h-[385px] sm:h-[415px] rounded-[22px] border ${theme.cardBorder} bg-gradient-to-b ${theme.cardBg} backdrop-blur-xl overflow-hidden flex flex-col justify-between transition-all duration-300 select-none`}
                  >
                    {/* Punch slot hole at top-center for lanyard clip */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-7 h-2 rounded-full bg-black/95 border border-white/25 shadow-inner z-20" />

                    {/* Banner Artwork Texture Overlay (Blended subtly if present) */}
                    {badge.bannerUrl && (
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-screen filter saturate-150"
                        style={{ backgroundImage: `url(${badge.bannerUrl})` }}
                      />
                    )}

                    {/* High-Gloss Laminated Sheen (Image 2 Acrylic/PVC Finish) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.04] pointer-events-none" />

                    {/* Micro Security Grid / Watermark Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

                    {/* ================= A. TOP HEADER: AUTHORITY & CAMPUS ================= */}
                    <div className="relative z-10 pt-4 px-4">
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                        <span className="truncate max-w-[140px] uppercase text-cyan-300 tracking-wider">
                          {badge.authorityBadge || 'MOE INNOVATION CELL'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono flex items-center gap-1 border border-white/10">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{badge.statusBadge || 'VERIFIED'}</span>
                        </span>
                      </div>

                      {/* Host College Name (Prominent Collegiate Label) */}
                      <div className="mt-2 text-[11px] font-black uppercase tracking-tight text-white leading-tight font-heading line-clamp-2">
                        {badge.hostCollege || badge.hostName}
                      </div>
                    </div>

                    {/* ================= B. CENTER IDENTITY & EDITION BADGE BOX ================= */}
                    <div className="relative z-10 px-4 my-auto py-1">
                      {/* Hackathon Title */}
                      <h3 className="text-lg sm:text-xl font-black text-white leading-snug font-heading drop-shadow-sm line-clamp-2">
                        {badge.title}
                      </h3>

                      {/* Official Edition Box (Exact to #SIH Software Edition GRAND FINALE in Image 2) */}
                      <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-emerald-500/20 border border-amber-400/40 shadow-xs">
                        <div className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-wide truncate">
                          {badge.editionBadge || '#Software Edition • GRAND FINALE'}
                        </div>
                        <div className="text-sm font-black font-mono text-white mt-0.5">
                          {badge.eventDate}
                        </div>
                      </div>

                      {/* Key Collegiate Metadata Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-white/10 text-[10px] font-mono">
                        <div>
                          <div className="text-slate-400 uppercase text-[8px] font-bold">PRIZE POOL</div>
                          <div className="font-bold text-amber-300 truncate text-xs">{badge.prizePool}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 uppercase text-[8px] font-bold">TEAM FORMAT</div>
                          <div className="font-bold text-slate-200 truncate text-xs">{badge.teamSize || '3-5 Members'}</div>
                        </div>
                      </div>
                    </div>

                    {/* ================= C. SIGNATURE SOLID COLOR BOTTOM STRIP (IMAGE 2) ================= */}
                    <Link
                      href={badge.actionUrl}
                      className={`relative z-10 w-full py-3 px-4 ${bottomBarColor} hover:brightness-110 active:brightness-95 flex items-center justify-between text-white transition-all shadow-md group/strip`}
                    >
                      <span className="text-xs font-black uppercase tracking-wider font-heading truncate drop-shadow-sm">
                        {badge.statusStripText || badge.passType || 'STUDENT PARTICIPANT'}
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover/strip:translate-x-1" />
                    </Link>
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
