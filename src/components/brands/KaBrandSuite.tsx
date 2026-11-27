'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface KaBrandEmblemProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Shared KΛ emblem echoing Kollabrix's exact obsidian-silver aesthetic:
 * - Bright platinum-silver "K" (matching KOLL / BRIX)
 * - Signature Kollabrix gunmetal-graphite "Λ" (#A1A1AA -> #52525B -> #27272A) with silver bevel
 * - Subtle vertical platinum spark needle connecting the two strokes
 */
export function KaBrandEmblem({ className = '', size = 'sm' }: KaBrandEmblemProps) {
  const dims = size === 'md' ? 'w-8 h-5' : 'w-7 h-4';
  return (
    <svg
      viewBox="0 0 48 28"
      fill="none"
      aria-hidden="true"
      className={`${dims} shrink-0 drop-shadow-[0_2px_8px_rgba(226,232,240,0.22)] ${className}`}
    >
      <defs>
        {/* Bright platinum-white silver matching KOLL / BRIX */}
        <linearGradient id="kaPlatinumK" x1="12" y1="3" x2="12" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* Exact Kollabrix Λ gunmetal-graphite gradient (zinc-400 -> zinc-600 -> zinc-800) */}
        <linearGradient id="kaKollabrixLambda" x1="34" y1="3" x2="34" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A1A1AA" />
          <stop offset="50%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>

        {/* Brushed silver bevel border matching Kollabrix wings */}
        <linearGradient id="kaSilverBevel" x1="24" y1="3" x2="44" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#94A3B8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#64748B" stopOpacity="0.45" />
        </linearGradient>

        {/* Luminous silver vertical spark */}
        <linearGradient id="kaCenterSpark" x1="23" y1="1" x2="23" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Platinum-Silver K */}
      <path
        d="M4 4H9.2V12.4L17.4 4H23.1L13.7 13.9L23.3 24H17.5L9.2 15.2V24H4V4Z"
        fill="url(#kaPlatinumK)"
      />

      {/* Subtle Kollabrix Vertical Platinum Spark */}
      <polygon points="23.8,1.5 24.8,14 23.8,26.5 22.8,14" fill="url(#kaCenterSpark)" />

      {/* Signature Kollabrix Dark Gunmetal-Graphite Λ with Brushed Silver Bevel */}
      <path
        d="M32.4 4H37.2L44.6 24H39.4L34.8 10.6L30.2 24H25L32.4 4Z"
        fill="url(#kaKollabrixLambda)"
        stroke="url(#kaSilverBevel)"
        strokeWidth="0.95"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface KaSuiteSwitcherProps {
  active: 'ai' | 'codex';
  tone?: 'dark-blue' | 'dark-stone';
}

/**
 * Compact cross-product switcher connecting KΛ ΛI, KΛ CODEX, and Kollabrix.
 */
export function KaSuiteSwitcher({ active, tone = 'dark-blue' }: KaSuiteSwitcherProps) {
  const wrapClass =
    tone === 'dark-stone'
      ? 'bg-[#1C1A17]/90 border-white/[0.14]'
      : 'bg-[#070E20]/85 border-white/[0.12]';

  return (
    <div
      role="navigation"
      aria-label="KΛ Suite switcher"
      className={`inline-flex items-center gap-0.5 p-1 rounded-full border backdrop-blur-xl ${wrapClass}`}
    >
      <Link
        href="/ka-ai"
        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all inline-flex items-center gap-1.5 ${
          active === 'ai'
            ? 'bg-sky-400/15 text-sky-200 border border-sky-400/35 shadow-[0_0_14px_rgba(56,189,248,0.22)]'
            : 'text-zinc-400 hover:text-white border border-transparent'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        <span>KΛ ΛI</span>
      </Link>

      <Link
        href="/ka-codex"
        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all inline-flex items-center gap-1.5 ${
          active === 'codex'
            ? 'bg-amber-400/15 text-amber-200 border border-amber-400/35 shadow-[0_0_14px_rgba(251,191,36,0.22)]'
            : 'text-zinc-400 hover:text-white border border-transparent'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>KΛ CODEX</span>
      </Link>

      <Link
        href="/"
        className="px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-400 hover:text-white border border-transparent hover:bg-white/[0.06] transition-all inline-flex items-center gap-1"
      >
        <span>Kollabrix</span>
        <ArrowUpRight className="w-3 h-3 opacity-75" />
      </Link>
    </div>
  );
}
