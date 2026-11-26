'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { FeaturedHackathonBadgeConfig } from '@/types/masterControl';
import {
  PASS_THEMES,
  LanyardStrapArtwork,
  CardSurfaceGraphic,
  SwivelClaspRig,
  MicroBarcodeSvg,
} from './LanyardPassArtwork';

// Natural staggered studio hang poses inspired by the reference pass lineup
const PASS_HANG_POSE = [
  { strapH: 60, restZ: 2.0, restY: -16, restX: 4 },
  { strapH: 78, restZ: 1.1, restY: -14, restX: 5 },
  { strapH: 94, restZ: -0.8, restY: -13, restX: 4 },
  { strapH: 104, restZ: 0.8, restY: -15, restX: 5 },
  { strapH: 86, restZ: 2.0, restY: -16, restX: 4 },
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
  const serialCode = `KBX-26-0${index + 1}`;
  const sheenAngle = Math.round(115 + (tilt.glowX - 50) * 0.65);

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
      {/* 1. Woven Textured Matte Nylon Lanyard Strap */}
      <div className="relative flex flex-col items-center z-20">
        <div
          style={{ height: `${pose.strapH}px` }}
          className="w-8 sm:w-9 relative overflow-hidden shadow-[0_14px_24px_rgba(0,0,0,0.9)]"
        >
          <LanyardStrapArtwork pattern={safePattern} theme={theme} uid={uid} />
          <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-[#020305] to-transparent pointer-events-none" />
          {/* Folded fabric V-stitch crimp */}
          <div
            style={{ backgroundColor: theme.strapFoldShadow }}
            className="absolute bottom-0 inset-x-0 h-3.5 border-t border-white/15 flex items-center justify-center"
          >
            <div className="w-full mx-1 border-t border-dashed border-slate-400/45" />
          </div>
        </div>

        {/* 2. Brushed Gunmetal Swivel Clasp Hardware (tip locks into grommet) */}
        <div className="relative -mt-2 -mb-[24px] z-30 flex justify-center">
          <SwivelClaspRig uid={uid} />
        </div>
      </div>

      {/* 3. True 3D Perspective Container (Hinged at Swivel Jaw) */}
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
          className="relative w-[218px] sm:w-[222px] lg:w-[226px] xl:w-[230px] h-[358px] sm:h-[364px] lg:h-[370px] xl:h-[376px]"
        >
          {/* Extruded 3D Laminated PVC Slab Layers */}
          {[1, 2, 3, 4, 5, 6].map((slice) => (
            <div
              key={slice}
              aria-hidden="true"
              style={{
                transform: `translateZ(${-slice * 1.45}px)`,
                backgroundColor: slice <= 3 ? theme.slabEdgeHex : theme.slabDeepHex,
                borderColor: slice === 1 ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.06)',
              }}
              className="absolute inset-0 rounded-[14px] border pointer-events-none"
            />
          ))}

          {/* Sharp Neutral Studio Drop Shadow (No colored neon glow) */}
          <div
            aria-hidden="true"
            style={{
              transform: 'translateZ(-18px) translateX(6px) translateY(12px)',
              boxShadow: hovered
                ? '0 36px 68px -12px rgba(0,0,0,0.98), 0 12px 28px rgba(0,0,0,0.85)'
                : '0 26px 52px -14px rgba(0,0,0,0.94)',
            }}
            className="absolute inset-2 rounded-[14px] pointer-events-none transition-shadow duration-300"
          />

          {/* Main Physical PVC Card Face */}
          <Link
            href={badge.actionUrl || '/hackathons'}
            style={{ transform: 'translateZ(0px)' }}
            className={`relative w-full h-full rounded-[14px] border ${theme.cardBorder} bg-gradient-to-b ${theme.cardSurfaceBg} overflow-hidden flex flex-col justify-between transition-colors duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_1px_0_0_rgba(255,255,255,0.08)] focus:outline-none focus:ring-2 focus:ring-white/40`}
          >
            {/* Stamped Metal Grommet + Die-Cut Recessed Stadium Slot */}
            <div
              aria-hidden="true"
              className="absolute top-[9px] left-1/2 -translate-x-1/2 w-[52px] h-[14px] rounded-full bg-gradient-to-b from-slate-300/75 via-slate-500/50 to-slate-800/80 p-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.85)] z-30 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-[#020305] shadow-[inset_0_3px_5px_rgba(0,0,0,0.98)] border border-slate-700/70" />
            </div>

            {/* Subtle Spot-UV Print Artwork & Matte PVC Micro-Grain */}
            <CardSurfaceGraphic pattern={safePattern} theme={theme} uid={uid} />

            {/* Optional Admin Banner Subtle Watermark */}
            {badge.bannerUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.07] pointer-events-none grayscale contrast-125"
                style={{ backgroundImage: `url(${badge.bannerUrl})` }}
              />
            )}

            {/* Tight Linear Specular Studio Sheen Tracking Cursor Tilt */}
            <div
              aria-hidden="true"
              style={{
                background: `linear-gradient(${sheenAngle}deg, transparent 22%, rgba(255,255,255,${
                  hovered ? 0.13 : 0.04
                }) 49%, rgba(255,255,255,${hovered ? 0.04 : 0.01}) 54%, transparent 76%)`,
              }}
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            />

            {/* ================= A. PRINTED ISSUER HEADER ================= */}
            <div className="relative z-10 pt-8 px-4">
              <div className="flex items-center justify-between gap-2 text-[8px] font-mono font-bold tracking-widest uppercase">
                <span className={theme.isLight ? 'text-slate-600' : 'text-slate-400'}>
                  {badge.authorityBadge || 'OFFICIAL CREDENTIAL'}
                </span>
                <span className={`inline-flex items-center gap-1 shrink-0 ${theme.isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.accentDotClass}`} />
                  <span>{badge.statusBadge || 'VERIFIED'}</span>
                </span>
              </div>

              <div
                className={`mt-1 text-[10px] font-black uppercase tracking-wide leading-tight font-heading ${
                  theme.isLight ? 'text-slate-900' : 'text-slate-200'
                }`}
              >
                {badge.hostCollege || badge.hostName}
              </div>
            </div>

            {/* ================= B. SWISS-GRID EVENT TYPOGRAPHY ================= */}
            <div className="relative z-10 px-4 my-auto space-y-3">
              <h3
                className={`text-[15.5px] sm:text-[16.5px] font-black leading-[1.18] tracking-tight font-heading ${
                  theme.isLight ? 'text-slate-950' : 'text-white'
                }`}
              >
                {badge.title}
              </h3>

              {/* Clean Hairline Edition & Event Date Grid (No SaaS UI boxes) */}
              <div className={`pt-2.5 border-t space-y-0.5 ${theme.isLight ? 'border-slate-900/15' : 'border-white/12'}`}>
                <div className={`text-[8px] font-mono font-bold uppercase tracking-wider leading-tight ${theme.accentTextClass}`}>
                  {badge.editionBadge || '#Software Edition • GRAND FINALE'}
                </div>
                <div className={`text-[12px] font-black font-mono tracking-tight ${theme.isLight ? 'text-slate-950' : 'text-white'}`}>
                  {badge.eventDate}
                </div>
              </div>

              {/* Clean 2-Column Printed Specification Row (Zero Ellipsis Truncation) */}
              <div className={`grid grid-cols-2 gap-2.5 pt-2.5 border-t text-[9.5px] font-mono ${theme.isLight ? 'border-slate-900/15' : 'border-white/12'}`}>
                <div>
                  <div className={`uppercase text-[7px] font-bold tracking-widest ${theme.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    PRIZE POOL
                  </div>
                  <div className={`font-bold leading-snug text-[10px] mt-0.5 ${theme.isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {badge.prizePool}
                  </div>
                </div>
                <div>
                  <div className={`uppercase text-[7px] font-bold tracking-widest ${theme.isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    FORMAT
                  </div>
                  <div className={`font-bold leading-snug text-[10px] mt-0.5 ${theme.isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {badge.teamSize || '2–4 Builders'}
                  </div>
                </div>
              </div>
            </div>

            {/* ================= C. PRINTED BARCODE, HOLO FOIL & PASS FOOTER ================= */}
            <div className="relative z-10 mt-auto">
              {/* Security Strip: Barcode + Serial + Iridescent Holo Foil Seal */}
              <div className={`px-4 py-2 border-t flex items-center justify-between gap-2 ${theme.isLight ? 'border-slate-900/12' : 'border-white/10'}`}>
                <div className="space-y-0.5">
                  <MicroBarcodeSvg seed={index} isLight={theme.isLight} />
                  <div className={`text-[7px] font-mono tracking-[0.18em] uppercase ${theme.isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    ID // {serialCode}
                  </div>
                </div>

                {/* Iridescent Holographic Security Foil Stamp */}
                <div
                  aria-hidden="true"
                  style={{
                    backgroundImage: `linear-gradient(${130 + tilt.glowX * 0.8}deg, rgba(148,163,184,0.22), rgba(186,230,253,0.45), rgba(216,180,254,0.38), rgba(148,163,184,0.2))`,
                  }}
                  className="px-1.5 py-1 rounded-[4px] border border-white/25 text-[6.5px] font-mono font-black tracking-widest uppercase text-white/85 shadow-inner shrink-0"
                >
                  HOLO • VALID
                </div>
              </div>

              {/* Matte Anodized Credential Role Bar (No web arrows) */}
              <div
                className={`w-full py-2 px-4 ${theme.bottomBarBg} border-t ${theme.isLight ? 'border-slate-900/20 text-white' : 'border-white/12 text-slate-200'} flex items-center justify-between`}
              >
                <span className="text-[9.5px] font-black uppercase tracking-[0.14em] font-heading">
                  {badge.statusStripText || badge.passType || 'PARTICIPANT PASS'}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-400 tracking-widest">
                  #{String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
