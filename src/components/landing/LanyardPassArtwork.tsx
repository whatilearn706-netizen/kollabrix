'use client';

import React from 'react';
import { FeaturedHackathonBadgeConfig } from '@/types/masterControl';

export interface PassThemePalette {
  accentHex: string;
  accentTextClass: string;
  accentDotClass: string;
  secondaryHex: string;
  slabEdgeHex: string;
  slabDeepHex: string;
  cardSurfaceBg: string;
  cardBorder: string;
  strapFoldShadow: string;
  bottomBarBg: string;
  isLight?: boolean;
}

/**
 * Obsidian Titanium pass palettes aligned with kollabrix.in studio dark aesthetic.
 * Uses matte obsidian PVC bodies with subtle surgical accents instead of bright arcade fills.
 */
export const PASS_THEMES: Record<
  FeaturedHackathonBadgeConfig['themeStyle'],
  PassThemePalette
> = {
  cobalt: {
    accentHex: '#60a5fa',
    accentTextClass: 'text-sky-300',
    accentDotClass: 'bg-sky-400',
    secondaryHex: '#0b1220',
    slabEdgeHex: '#242c3d',
    slabDeepHex: '#0d1118',
    cardSurfaceBg: 'from-[#0d1119] via-[#080a0f] to-[#050609]',
    cardBorder: 'border-white/15 group-hover:border-sky-300/45',
    strapFoldShadow: '#0a0e17',
    bottomBarBg: 'bg-[#0c1018]',
  },
  crimson: {
    accentHex: '#f87171',
    accentTextClass: 'text-rose-300',
    accentDotClass: 'bg-rose-400',
    secondaryHex: '#170c0e',
    slabEdgeHex: '#272024',
    slabDeepHex: '#0e0b0d',
    cardSurfaceBg: 'from-[#110d10] via-[#09080a] to-[#050507]',
    cardBorder: 'border-white/15 group-hover:border-rose-300/45',
    strapFoldShadow: '#120a0c',
    bottomBarBg: 'bg-[#100c0e]',
  },
  magenta: {
    accentHex: '#c084fc',
    accentTextClass: 'text-purple-300',
    accentDotClass: 'bg-purple-400',
    secondaryHex: '#130d1c',
    slabEdgeHex: '#252030',
    slabDeepHex: '#0d0b12',
    cardSurfaceBg: 'from-[#100d17] via-[#08080c] to-[#050508]',
    cardBorder: 'border-white/15 group-hover:border-purple-300/45',
    strapFoldShadow: '#0f0b17',
    bottomBarBg: 'bg-[#0e0c14]',
  },
  teal: {
    accentHex: '#34d399',
    accentTextClass: 'text-emerald-300',
    accentDotClass: 'bg-emerald-400',
    secondaryHex: '#091512',
    slabEdgeHex: '#1e2b28',
    slabDeepHex: '#0a100e',
    cardSurfaceBg: 'from-[#0b1210] via-[#070a09] to-[#040606]',
    cardBorder: 'border-white/15 group-hover:border-emerald-300/45',
    strapFoldShadow: '#08120f',
    bottomBarBg: 'bg-[#0b1110]',
  },
  gold: {
    accentHex: '#fbbf24',
    accentTextClass: 'text-amber-300',
    accentDotClass: 'bg-amber-400',
    secondaryHex: '#171208',
    slabEdgeHex: '#2b261c',
    slabDeepHex: '#100e09',
    cardSurfaceBg: 'from-[#12100b] via-[#090806] to-[#050504]',
    cardBorder: 'border-white/15 group-hover:border-amber-300/45',
    strapFoldShadow: '#120f08',
    bottomBarBg: 'bg-[#110f0a]',
  },
  light_gloss: {
    accentHex: '#334155',
    accentTextClass: 'text-slate-700',
    accentDotClass: 'bg-slate-800',
    secondaryHex: '#e2e8f0',
    slabEdgeHex: '#cbd5e1',
    slabDeepHex: '#64748b',
    cardSurfaceBg: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    cardBorder: 'border-slate-300 group-hover:border-slate-500',
    strapFoldShadow: '#0f172a',
    bottomBarBg: 'bg-slate-900',
    isLight: true,
  },
  dark_tactile: {
    accentHex: '#cbd5e1',
    accentTextClass: 'text-slate-300',
    accentDotClass: 'bg-slate-200',
    secondaryHex: '#14161b',
    slabEdgeHex: '#272a33',
    slabDeepHex: '#0c0d11',
    cardSurfaceBg: 'from-[#111318] via-[#090a0d] to-[#050507]',
    cardBorder: 'border-white/18 group-hover:border-white/45',
    strapFoldShadow: '#090a0d',
    bottomBarBg: 'bg-[#0f1116]',
  },
};

/** Woven matte nylon lanyard strap with fine horizontal ribbing & surgical edge piping. */
export function LanyardStrapArtwork({
  theme,
  uid,
}: {
  pattern?: FeaturedHackathonBadgeConfig['pattern'];
  theme: PassThemePalette;
  uid: string;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 36 140"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`strap-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#06070a" />
          <stop offset="20%" stopColor="#141720" />
          <stop offset="50%" stopColor="#1a1e29" />
          <stop offset="80%" stopColor="#12151d" />
          <stop offset="100%" stopColor="#050608" />
        </linearGradient>
        <pattern id={`weave-${uid}`} width="36" height="3" patternUnits="userSpaceOnUse">
          <line x1="0" y1="1.2" x2="36" y2="1.2" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="0.7" />
          <line x1="0" y1="2.7" x2="36" y2="2.7" stroke="#000000" strokeOpacity="0.55" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="36" height="140" fill={`url(#strap-${uid})`} />
      {/* Subtle surgical theme edge piping (real woven lanyard trim) */}
      <rect x="2.5" y="0" width="1.4" height="140" fill={theme.accentHex} opacity="0.65" />
      <rect x="32.1" y="0" width="1.4" height="140" fill={theme.accentHex} opacity="0.65" />
      {/* Nylon woven horizontal texture */}
      <rect width="36" height="140" fill={`url(#weave-${uid})`} />
      {/* Side edge shadows for cylindrical fabric feel */}
      <rect x="0" y="0" width="4" height="140" fill="#000000" opacity="0.45" />
      <rect x="32" y="0" width="4" height="140" fill="#000000" opacity="0.52" />
    </svg>
  );
}

/** Spot-UV matte embossed vector artwork + 1.8% PVC micro-grain overlay. */
export function CardSurfaceGraphic({
  pattern,
  theme,
  uid,
}: {
  pattern: FeaturedHackathonBadgeConfig['pattern'];
  theme: PassThemePalette;
  uid: string;
}) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 260 400" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spotuv-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.accentHex} stopOpacity="0.16" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <filter id={`pvcgrain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.045" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Subtle architectural Spot-UV print pattern */}
      {pattern === 'curves' && (
        <g>
          <path d="M -20 -10 L 280 -10 L 280 140 C 195 165 95 105 -20 190 Z" fill={`url(#spotuv-${uid})`} />
          <path d="M -20 190 C 95 105 195 165 280 140" fill="none" stroke={theme.accentHex} strokeOpacity="0.22" strokeWidth="1" />
        </g>
      )}
      {pattern === 'rings' && (
        <g fill="none" stroke={theme.accentHex}>
          <circle cx="235" cy="180" r="190" strokeOpacity="0.12" strokeWidth="1" />
          <circle cx="235" cy="180" r="135" strokeOpacity="0.18" strokeWidth="1" />
          <circle cx="235" cy="180" r="80" strokeOpacity="0.22" strokeWidth="1" />
        </g>
      )}
      {pattern === 'wave' && (
        <g fill="none" stroke={theme.accentHex}>
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={`wt-${i}`} d={`M -15 ${10 + i * 8} Q 95 ${65 - i * 2} 275 ${5 + i * 5}`} strokeWidth="0.9" opacity={0.18 - i * 0.01} />
          ))}
        </g>
      )}
      {(pattern === 'circles' || pattern === 'soundwave' || pattern === 'grid' || pattern === 'hologram') && (
        <g>
          <path d="M 110 -10 L 280 -10 L 280 265 C 200 220 130 140 110 -10 Z" fill={`url(#spotuv-${uid})`} />
          <path d="M 0 118 L 260 118" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.8" />
          <path d="M 0 288 L 260 288" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.8" />
        </g>
      )}

      {/* Left-edge surgical color pinstripe (subtle theme identity) */}
      <rect x="0" y="28" width="2.5" height="62" fill={theme.accentHex} opacity="0.85" />

      {/* Micro-textured matte PVC surface noise */}
      <rect width="260" height="400" filter={`url(#pvcgrain-${uid})`} opacity="0.7" />
    </svg>
  );
}

/** Brushed titanium/gunmetal swivel lobster clasp with bright steel highlights & rivet pin. */
export function SwivelClaspRig({ uid }: { uid: string }) {
  return (
    <svg
      width="74"
      height="92"
      viewBox="0 0 74 92"
      className="overflow-visible pointer-events-none drop-shadow-[0_12px_16px_rgba(0,0,0,0.95)]"
    >
      <defs>
        <linearGradient id={`gunmetal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="28%" stopColor="#475569" />
          <stop offset="68%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id={`steelrim-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#64748b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Trapezoid fabric-loop wire buckle */}
      <path
        d="M 18.5 4 L 55.5 4 Q 58 4 56 8 L 45.5 25 L 28.5 25 L 18 8 Q 16 4 18.5 4 Z"
        fill="none"
        stroke={`url(#gunmetal-${uid})`}
        strokeWidth="4.8"
        strokeLinejoin="round"
      />
      <path d="M 19.5 4.5 L 54.5 4.5 L 45 24 L 29 24 Z" fill="none" stroke={`url(#steelrim-${uid})`} strokeWidth="1.15" strokeLinejoin="round" />

      {/* Swivel collar & brushed steel rivet */}
      <rect x="31.5" y="23" width="11" height="8.5" rx="3" fill={`url(#gunmetal-${uid})`} stroke="#94a3b8" strokeWidth="0.7" />
      <rect x="29.5" y="30" width="15" height="9" rx="4" fill={`url(#gunmetal-${uid})`} stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="37" cy="34.5" r="2.1" fill="#e2e8f0" />

      {/* Lobster jaw body & thumb trigger */}
      <path
        d="M 32 38 L 42 38 L 45.5 47 L 54.5 52.5 L 52.5 56.5 L 44.5 52.5 L 41.5 64 C 41 69 44.5 72.5 45 77.5 C 45.5 84.5 39 89 32.5 87.5 C 26 86 24 78.5 27.5 72.5 L 30.5 67.5 L 30 46 Z"
        fill={`url(#gunmetal-${uid})`}
        stroke="#94a3b8"
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
      <path
        d="M 34.5 52 C 38.5 52 39.5 64 38 71 C 36.8 76.5 33.5 79 31.8 76.5 C 30.5 74.5 32.2 68 33 63 Z"
        fill="#030406"
        opacity="0.96"
      />
      {/* Specular steel edge highlights */}
      <path d="M 32.5 40 L 32.5 64" stroke="#f1f5f9" strokeWidth="1.1" strokeOpacity="0.68" strokeLinecap="round" />
      <path d="M 46 49 L 53.5 53.5" stroke="#f1f5f9" strokeWidth="1.2" strokeOpacity="0.72" strokeLinecap="round" />
    </svg>
  );
}

/** Crisp printed physical pass barcode. */
export function MicroBarcodeSvg({ seed = 0, isLight = false }: { seed?: number; isLight?: boolean }) {
  const widths = [1.5, 0.8, 2.2, 1.0, 0.8, 1.8, 1.0, 2.4, 0.8, 1.4, 0.9, 2.0, 1.0, 1.5, 0.8, 2.2, 1.2, 0.8, 1.6];
  let x = 0;
  const color = isLight ? '#0f172a' : '#e2e8f0';
  return (
    <svg width="56" height="14" viewBox="0 0 56 14" className="shrink-0 opacity-80">
      {widths.map((w, i) => {
        const barWidth = widths[(i + seed) % widths.length];
        const curX = x;
        x += barWidth + (i % 2 === 0 ? 1.2 : 1.7);
        if (curX + barWidth > 56) return null;
        return <rect key={i} x={curX} y="0" width={barWidth} height="14" fill={color} />;
      })}
    </svg>
  );
}
