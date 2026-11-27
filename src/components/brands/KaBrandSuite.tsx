'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getKollabrixHomeUrl } from '@/lib/kaBrandDomains';

interface KaBrandEmblemProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Shared KΛ emblem matching Kollabrix's exact obsidian-silver palette and Image 2 asymmetric Λ geometry:
 * - Bright platinum-silver "K" (matching KOLL / BRIX)
 * - No middle divider line
 * - Asymmetric sculpted "Λ" (tucked shorter left leg hugging K + full right leg) in Kollabrix gunmetal-graphite with crisp silver bevels
 */
export function KaBrandEmblem({ className = '', size = 'sm' }: KaBrandEmblemProps) {
  const dims = size === 'md' ? 'w-8 h-5' : 'w-7 h-4';
  return (
    <svg
      viewBox="0 0 46 28"
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
        <linearGradient id="kaKollabrixLambda" x1="33" y1="3" x2="33" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A1A1AA" />
          <stop offset="50%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>

        {/* Crisp brushed silver bevel border */}
        <linearGradient id="kaSilverBevel" x1="22" y1="3" x2="44" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.92" />
          <stop offset="50%" stopColor="#94A3B8" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#64748B" stopOpacity="0.52" />
        </linearGradient>
      </defs>

      {/* Platinum-Silver K */}
      <path
        d="M3 4H8.4V12.2L16.8 4H22.8L13.1 13.8L23 24H16.9L8.4 15.1V24H3V4Z"
        fill="url(#kaPlatinumK)"
      />

      {/* Asymmetric Sculpted Gunmetal-Graphite Λ (tucked left leg + full-length right leg, matching Image 2) */}
      <path
        d="M28.6 4H33.8L43.2 24H37.4L31.2 10.4L26.2 21.4L22.6 17.6L28.6 4Z"
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
        <span>KΛ FOLIO</span>
      </Link>

      <Link
        href={getKollabrixHomeUrl()}
        className="px-2.5 py-1 rounded-full text-[11px] font-mono text-zinc-400 hover:text-white border border-transparent hover:bg-white/[0.06] transition-all inline-flex items-center gap-1"
      >
        <span>Kollabrix</span>
        <ArrowUpRight className="w-3 h-3 opacity-75" />
      </Link>
    </div>
  );
}
