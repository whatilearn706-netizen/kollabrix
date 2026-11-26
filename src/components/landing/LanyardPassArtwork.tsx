'use client';

import React from 'react';
import { FeaturedHackathonBadgeConfig } from '@/types/masterControl';

export interface PassThemePalette {
  accentHex: string;
  secondaryHex: string;
  slabEdgeHex: string;
  slabDeepHex: string;
  cardSurfaceBg: string;
  cardBorder: string;
  glow: string;
  strapFoldShadow: string;
  bottomBarBg: string;
  isLight?: boolean;
}

export const PASS_THEMES: Record<
  FeaturedHackathonBadgeConfig['themeStyle'],
  PassThemePalette
> = {
  cobalt: {
    accentHex: '#2563eb',
    secondaryHex: '#0b1636',
    slabEdgeHex: '#2563eb',
    slabDeepHex: '#0f255c',
    cardSurfaceBg: 'from-[#0d1426] via-[#070a12] to-[#04060a]',
    cardBorder: 'border-blue-400/35 group-hover:border-blue-400/80',
    glow: 'rgba(37, 99, 235, 0.45)',
    strapFoldShadow: '#0a1945',
    bottomBarBg: 'bg-sky-600',
  },
  crimson: {
    accentHex: '#dc2626',
    secondaryHex: '#240507',
    slabEdgeHex: '#b91c1c',
    slabDeepHex: '#450a0d',
    cardSurfaceBg: 'from-[#180709] via-[#0c0607] to-[#070405]',
    cardBorder: 'border-rose-400/35 group-hover:border-rose-400/80',
    glow: 'rgba(220, 38, 38, 0.46)',
    strapFoldShadow: '#450a0a',
    bottomBarBg: 'bg-rose-600',
  },
  magenta: {
    accentHex: '#db2777',
    secondaryHex: '#240717',
    slabEdgeHex: '#be185d',
    slabDeepHex: '#420923',
    cardSurfaceBg: 'from-[#170813] via-[#0c060a] to-[#060406]',
    cardBorder: 'border-pink-400/35 group-hover:border-pink-400/80',
    glow: 'rgba(219, 39, 119, 0.46)',
    strapFoldShadow: '#4a0726',
    bottomBarBg: 'bg-purple-600',
  },
  teal: {
    accentHex: '#14b8a6',
    secondaryHex: '#041f1c',
    slabEdgeHex: '#0d9488',
    slabDeepHex: '#082c28',
    cardSurfaceBg: 'from-[#061413] via-[#070b0b] to-[#040606]',
    cardBorder: 'border-teal-400/35 group-hover:border-teal-400/80',
    glow: 'rgba(20, 184, 166, 0.42)',
    strapFoldShadow: '#042f2e',
    bottomBarBg: 'bg-emerald-600',
  },
  gold: {
    accentHex: '#f59e0b',
    secondaryHex: '#241804',
    slabEdgeHex: '#d97706',
    slabDeepHex: '#452804',
    cardSurfaceBg: 'from-[#171106] via-[#0b0906] to-[#050504]',
    cardBorder: 'border-amber-400/35 group-hover:border-amber-400/80',
    glow: 'rgba(245, 158, 11, 0.44)',
    strapFoldShadow: '#452305',
    bottomBarBg: 'bg-amber-600',
  },
  light_gloss: {
    accentHex: '#0284c7',
    secondaryHex: '#e2e8f0',
    slabEdgeHex: '#94a3b8',
    slabDeepHex: '#475569',
    cardSurfaceBg: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    cardBorder: 'border-slate-300 group-hover:border-sky-400',
    glow: 'rgba(2, 132, 199, 0.35)',
    strapFoldShadow: '#082f49',
    bottomBarBg: 'bg-sky-600',
    isLight: true,
  },
  dark_tactile: {
    accentHex: '#71717a',
    secondaryHex: '#18181b',
    slabEdgeHex: '#52525b',
    slabDeepHex: '#18181b',
    cardSurfaceBg: 'from-[#18181b] via-[#0c0c0e] to-[#050506]',
    cardBorder: 'border-zinc-500/45 group-hover:border-zinc-300/80',
    glow: 'rgba(255, 255, 255, 0.24)',
    strapFoldShadow: '#09090b',
    bottomBarBg: 'bg-zinc-800',
  },
};

export function LanyardStrapArtwork({
  pattern,
  theme,
  uid,
}: {
  pattern: FeaturedHackathonBadgeConfig['pattern'];
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
        <linearGradient id={`strap-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#040507" />
          <stop offset="42%" stopColor={theme.secondaryHex} />
          <stop offset="100%" stopColor={theme.accentHex} />
        </linearGradient>
      </defs>
      <rect width="36" height="140" fill={`url(#strap-${uid})`} />

      {pattern === 'circles' && (
        <g opacity="0.96">
          <rect width="36" height="140" fill={theme.accentHex} />
          <circle cx="9" cy="20" r="9.5" fill="#06080f" />
          <circle cx="29" cy="48" r="10.5" fill="#06080f" />
          <circle cx="8" cy="80" r="9.5" fill="#06080f" />
          <circle cx="28" cy="110" r="10.5" fill="#06080f" />
        </g>
      )}

      {pattern === 'wave' && (
        <g stroke={theme.accentHex} strokeWidth="1.25" fill="none" opacity="0.9">
          {Array.from({ length: 18 }).map((_, i) => (
            <path key={i} d={`M -4 ${12 + i * 7} Q 18 ${6 + i * 7} 40 ${14 + i * 7}`} />
          ))}
        </g>
      )}

      {pattern === 'soundwave' && (
        <g fill={theme.accentHex} opacity="0.96">
          {[3, 8, 13, 18, 23, 28, 32].map((x, idx) => (
            <polygon key={x} points={`${x - 2},140 ${x},${80 + (idx % 3) * 14} ${x + 2},140`} />
          ))}
        </g>
      )}

      {(pattern === 'curves' || pattern === 'rings' || pattern === 'grid' || pattern === 'hologram') && (
        <g opacity="0.92">
          <path d="M0,0 C24,35 6,85 36,140 L36,0 Z" fill={theme.accentHex} />
          <path d="M0,48 Q20,76 36,104" stroke="#000000" strokeWidth="2.5" strokeOpacity="0.35" fill="none" />
        </g>
      )}

      <rect width="36" height="140" fill="#000000" opacity="0.12" />
      <rect x="0" y="0" width="5" height="140" fill="#000000" opacity="0.35" />
      <rect x="31" y="0" width="5" height="140" fill="#000000" opacity="0.42" />
    </svg>
  );
}

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
        <linearGradient id={`surf-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={theme.accentHex} stopOpacity="0.98" />
          <stop offset="68%" stopColor={theme.secondaryHex} stopOpacity="0.72" />
          <stop offset="100%" stopColor="#06070a" stopOpacity="0.98" />
        </linearGradient>
      </defs>

      {pattern === 'curves' && (
        <g>
          <path d="M -20 -10 L 280 -10 L 280 140 C 195 165 95 105 -20 190 Z" fill={`url(#surf-${uid})`} />
          <path d="M -20 260 C 90 215 190 275 280 230 L 280 420 L -20 420 Z" fill={theme.accentHex} opacity="0.86" />
        </g>
      )}

      {pattern === 'rings' && (
        <g>
          <circle cx="245" cy="195" r="210" fill={theme.secondaryHex} opacity="0.92" />
          <circle cx="245" cy="195" r="158" fill={theme.accentHex} opacity="0.52" />
          <circle cx="245" cy="195" r="105" fill={theme.accentHex} opacity="0.74" />
          <circle cx="245" cy="195" r="56" fill="#0a060a" opacity="0.92" />
        </g>
      )}

      {pattern === 'wave' && (
        <g fill="none" stroke={theme.accentHex}>
          {Array.from({ length: 16 }).map((_, i) => (
            <path key={`wt-${i}`} d={`M -15 ${-5 + i * 7} Q 85 ${70 - i * 2} 225 ${-10 + i * 5}`} strokeWidth="1.4" opacity={0.85 - i * 0.03} />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <path key={`wb-${i}`} d={`M 35 ${410 - i * 7} Q 170 ${315 + i * 2} 275 ${385 - i * 5}`} strokeWidth="1.4" opacity={0.88 - i * 0.03} />
          ))}
        </g>
      )}

      {pattern === 'circles' && (
        <g fill={theme.accentHex}>
          {[
            [175, 42, 34], [238, 42, 34], [115, 104, 32], [178, 104, 34], [240, 104, 34],
            [178, 166, 34], [240, 166, 34], [178, 228, 34], [240, 228, 34],
            [52, 355, 32], [116, 355, 34], [180, 355, 34], [242, 355, 34],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} opacity="0.94" />
          ))}
        </g>
      )}

      {pattern === 'soundwave' && (
        <g fill={theme.accentHex}>
          {Array.from({ length: 38 }).map((_, i) => {
            const x = i * 7;
            const hTop = 18 + Math.abs(Math.sin(i * 0.65)) * 46;
            const hBot = 18 + Math.abs(Math.cos(i * 0.55)) * 52;
            return (
              <g key={i} opacity="0.94">
                <polygon points={`${x},0 ${x + 3.5},${hTop} ${x + 7},0`} />
                <polygon points={`${x},400 ${x + 3.5},${400 - hBot} ${x + 7},400`} />
              </g>
            );
          })}
        </g>
      )}

      {(pattern === 'grid' || pattern === 'hologram') && (
        <g>
          <path d="M 110 -10 L 280 -10 L 280 265 C 200 220 130 140 110 -10 Z" fill={`url(#surf-${uid})`} opacity="0.82" />
          <path d="M -10 250 C 90 220 175 290 275 270 L 275 410 L -10 410 Z" fill={theme.accentHex} opacity="0.48" />
        </g>
      )}
    </svg>
  );
}

/** Articulated matte-black anodized swivel lobster clasp + trapezoid wire buckle. */
export function SwivelClaspRig({ uid }: { uid: string }) {
  return (
    <svg
      width="74"
      height="92"
      viewBox="0 0 74 92"
      className="overflow-visible pointer-events-none drop-shadow-[0_10px_14px_rgba(0,0,0,0.92)]"
    >
      <defs>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4c5260" />
          <stop offset="35%" stopColor="#1c1f25" />
          <stop offset="80%" stopColor="#0d0f13" />
          <stop offset="100%" stopColor="#262930" />
        </linearGradient>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8992a6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#121418" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <path
        d="M 18.5 4 L 55.5 4 Q 58 4 56 8 L 45.5 25 L 28.5 25 L 18 8 Q 16 4 18.5 4 Z"
        fill="none"
        stroke={`url(#metal-${uid})`}
        strokeWidth="4.8"
        strokeLinejoin="round"
      />
      <path d="M 19.5 4.5 L 54.5 4.5 L 45 24 L 29 24 Z" fill="none" stroke={`url(#rim-${uid})`} strokeWidth="1" strokeLinejoin="round" />

      <rect x="31.5" y="23" width="11" height="8.5" rx="3" fill={`url(#metal-${uid})`} stroke="#4b515e" strokeWidth="0.7" />
      <rect x="29.5" y="30" width="15" height="9" rx="4" fill={`url(#metal-${uid})`} stroke="#4b515e" strokeWidth="0.8" />
      <circle cx="37" cy="34.5" r="2.1" fill="#636a78" />

      <path
        d="M 32 38 L 42 38 L 45.5 47 L 54.5 52.5 L 52.5 56.5 L 44.5 52.5 L 41.5 64 C 41 69 44.5 72.5 45 77.5 C 45.5 84.5 39 89 32.5 87.5 C 26 86 24 78.5 27.5 72.5 L 30.5 67.5 L 30 46 Z"
        fill={`url(#metal-${uid})`}
        stroke="#5a6170"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M 34.5 52 C 38.5 52 39.5 64 38 71 C 36.8 76.5 33.5 79 31.8 76.5 C 30.5 74.5 32.2 68 33 63 Z"
        fill="#040508"
        opacity="0.94"
      />
      <path d="M 32.5 40 L 32.5 64" stroke="#8f99ad" strokeWidth="1" strokeOpacity="0.48" strokeLinecap="round" />
      <path d="M 46 49 L 53.5 53.5" stroke="#8f99ad" strokeWidth="1.1" strokeOpacity="0.54" strokeLinecap="round" />
    </svg>
  );
}
