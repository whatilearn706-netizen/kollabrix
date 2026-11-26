'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { FeaturedHackathonBadgeConfig } from '@/types/masterControl';
import {
  PASS_THEMES,
  LanyardStrapArtwork,
  CardSurfaceGraphic,
  SwivelClaspRig,
} from './LanyardPassArtwork';

// Natural staggered studio hang poses inspired by the reference pass lineup
const PASS_HANG_POSE = [
  { strapH: 60, restZ: 2.2, restY: -18, restX: 4 },
  { strapH: 78, restZ: 1.3, restY: -16, restX: 5 },
  { strapH: 94, restZ: -0.9, restY: -15, restX: 4 },
  { strapH: 104, restZ: 0.9, restY: -17, restX: 5 },
  { strapH: 86, restZ: 2.2, restY: -18, restX: 4 },
];

export function LanyardPassCard3D({
  badge,
  index,
}: {
  badge: FeaturedHackathonBadgeConfig;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 30 });

  const theme = PASS_THEMES[badge.themeStyle] || PASS_THEMES.cobalt;
  const pose = PASS_HANG_POSE[index % PASS_HANG_POSE.length];

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 14,
      ry: (px - 0.5) * 20,
      glowX: px * 100,
      glowY: py * 100,
    });
  };

  const resetTilt = () => {
    setHovered(false);
    setTilt({ rx: 0, ry: 0, glowX: 50, glowY: 30 });
  };

  const safePattern = badge.pattern || 'curves';
  const uid = `${badge.id}-${index}`.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      animate={{
        rotateZ: hovered ? 0 : pose.restZ,
        y: hovered ? -10 : 0,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: 'top center' }}
      className="flex flex-col items-center group relative cursor-pointer select-none shrink-0"
    >
      {/* 1. Woven Textured Lanyard Ribbon (Emerges cleanly out of studio obsidian top) */}
      <div className="relative flex flex-col items-center z-20">
        <div
          style={{ height: `${pose.strapH}px` }}
          className="w-8 sm:w-9 relative overflow-hidden shadow-[0_14px_24px_rgba(0,0,0,0.85)]"
        >
          <LanyardStrapArtwork pattern={safePattern} theme={theme} uid={uid} />
          <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#020305] to-transparent pointer-events-none" />
          <div
            style={{ backgroundColor: theme.strapFoldShadow }}
            className="absolute bottom-0 inset-x-0 h-2.5 opacity-85 border-t border-white/15"
          />
          <div className="absolute bottom-1 inset-x-2 border-t border-dashed border-white/25" />
        </div>

        {/* 2. Articulated Matte-Black Swivel Clasp Hardware (Tip locks into horizontal punch slot) */}
        <div className="relative -mt-2 -mb-[24px] z-30 flex justify-center">
          <SwivelClaspRig uid={uid} />
        </div>
      </div>

      {/* 3. True 3D Perspective Container (Hinged right at Swivel Jaw) */}
      <div style={{ perspective: '1200px' }} className="relative z-10">
        <motion.div
          animate={{
            rotateY: hovered ? tilt.ry * 0.7 - 4 : pose.restY,
            rotateX: hovered ? pose.restX + tilt.rx * 0.6 : pose.restX,
            scale: hovered ? 1.025 : 1,
          }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: '50% 6%',
          }}
          className="relative w-[210px] sm:w-[214px] lg:w-[218px] xl:w-[220px] h-[342px] sm:h-[350px] lg:h-[358px] xl:h-[364px]"
        >
          {/* Extruded 3D Rigid Card Edge Layers (Color-graded PVC thickness) */}
          {[1, 2, 3, 4, 5, 6].map((slice) => (
            <div
              key={slice}
              aria-hidden="true"
              style={{
                transform: `translateZ(${-slice * 1.5}px)`,
                backgroundColor: slice <= 3 ? theme.slabEdgeHex : theme.slabDeepHex,
                borderColor: slice === 1 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
              }}
              className="absolute inset-0 rounded-[15px] border pointer-events-none"
            />
          ))}

          {/* Dynamic 3D Studio Drop Shadow */}
          <div
            aria-hidden="true"
            style={{
              transform: 'translateZ(-18px) translateX(6px) translateY(10px)',
              boxShadow: hovered
                ? `0 36px 70px -12px rgba(0,0,0,0.98), 0 0 38px ${theme.glow}`
                : '0 26px 54px -14px rgba(0,0,0,0.92)',
            }}
            className="absolute inset-2 rounded-[15px] pointer-events-none transition-shadow duration-300"
          />

          {/* Main Interactive Card Face */}
          <Link
            href={badge.actionUrl || '/hackathons'}
            style={{ transform: 'translateZ(0px)' }}
            className={`relative w-full h-full rounded-[15px] border ${theme.cardBorder} bg-gradient-to-b ${theme.cardSurfaceBg} overflow-hidden flex flex-col justify-between transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/40`}
          >
            {/* Die-cut Recessed Horizontal Stadium Slot Punch */}
            <div
              aria-hidden="true"
              className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[48px] h-[11px] rounded-full bg-[#020305] border border-white/25 border-b-white/35 shadow-[inset_0_3px_5px_rgba(0,0,0,0.96),0_1px_0_rgba(255,255,255,0.14)] z-30"
            />

            {/* Signature Graphic Pattern Layer */}
            <CardSurfaceGraphic pattern={safePattern} theme={theme} uid={uid} />

            {/* Optional Admin Promo Banner Subtle Blend */}
            {badge.bannerUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.14] pointer-events-none mix-blend-screen saturate-150"
                style={{ backgroundImage: `url(${badge.bannerUrl})` }}
              />
            )}

            {/* Matte Protection Scrim Keeping Pattern Pop + Admin Text Readability */}
            <div
              className={`absolute inset-0 pointer-events-none ${
                theme.isLight
                  ? 'bg-gradient-to-b from-white/55 via-white/35 to-white/60'
                  : 'bg-gradient-to-b from-black/20 via-[#07080d]/42 to-black/52'
              }`}
            />

            {/* Dynamic Matte PVC Specular Sheen Tracking Cursor */}
            <div
              aria-hidden="true"
              style={{
                background: `radial-gradient(circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(255,255,255,${
                  hovered ? 0.14 : 0.05
                }), transparent 62%)`,
              }}
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            />

            {/* ================= ADMIN CONTENT: A. TOP AUTHORITY & CAMPUS ================= */}
            <div className="relative z-10 pt-8 px-3.5">
              <div className="flex items-center justify-between gap-1.5 text-[8.5px] font-mono font-bold">
                <span className={`truncate uppercase tracking-wider ${theme.isLight ? 'text-sky-800' : 'text-cyan-300/95'}`}>
                  {badge.authorityBadge || 'MOE INNOVATION CELL'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono flex items-center gap-1 border shrink-0 ${
                    theme.isLight
                      ? 'bg-slate-900/10 text-slate-900 border-slate-900/15'
                      : 'bg-black/45 text-white border-white/15 backdrop-blur-xs'
                  }`}
                >
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{badge.statusBadge || 'VERIFIED'}</span>
                </span>
              </div>

              <div
                className={`mt-1.5 text-[10.5px] font-black uppercase tracking-tight leading-tight font-heading line-clamp-2 ${
                  theme.isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                {badge.hostCollege || badge.hostName}
              </div>
            </div>

            {/* ================= ADMIN CONTENT: B. TITLE, EDITION BOX & METADATA ================= */}
            <div className="relative z-10 px-3.5 my-auto py-1">
              <h3
                className={`text-[15px] sm:text-[17px] font-black leading-snug font-heading drop-shadow-sm line-clamp-2 ${
                  theme.isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                {badge.title}
              </h3>

              <div
                className={`mt-2 p-2 rounded-xl border shadow-xs backdrop-blur-sm ${
                  theme.isLight ? 'bg-amber-500/15 border-amber-500/40' : 'bg-black/55 border-amber-400/35'
                }`}
              >
                <div className={`text-[9px] font-mono font-black uppercase tracking-wide truncate ${theme.isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                  {badge.editionBadge || '#Software Edition • GRAND FINALE'}
                </div>
                <div className={`text-[12.5px] font-black font-mono mt-0.5 ${theme.isLight ? 'text-slate-950' : 'text-white'}`}>
                  {badge.eventDate}
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-[9.5px] font-mono ${theme.isLight ? 'border-slate-900/15' : 'border-white/15'}`}>
                <div>
                  <div className={`uppercase text-[7.5px] font-bold ${theme.isLight ? 'text-slate-600' : 'text-slate-300/85'}`}>
                    PRIZE POOL
                  </div>
                  <div className={`font-bold truncate text-[11px] ${theme.isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                    {badge.prizePool}
                  </div>
                </div>
                <div>
                  <div className={`uppercase text-[7.5px] font-bold ${theme.isLight ? 'text-slate-600' : 'text-slate-300/85'}`}>
                    TEAM FORMAT
                  </div>
                  <div className={`font-bold truncate text-[11px] ${theme.isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {badge.teamSize || '3-5 Members'}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= ADMIN CONTENT: C. SIGNATURE BOTTOM STRIP ================= */}
            <div
              className={`relative z-10 w-full py-2.5 px-3.5 ${bottomBarColor} group-hover:brightness-110 flex items-center justify-between text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]`}
            >
              <span className="text-[10.5px] font-black uppercase tracking-wider font-heading truncate drop-shadow-sm">
                {badge.statusStripText || badge.passType || 'STUDENT PARTICIPANT'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
