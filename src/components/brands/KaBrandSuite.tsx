'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface KaBrandEmblemProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Shared KΛ liquid-silver geometric monogram with warm amber-gold (K) and ice-blue (Λ) rim accents.
 */
export function KaBrandEmblem({ className = '', size = 'sm' }: KaBrandEmblemProps) {
  const dims = size === 'md' ? 'w-7 h-5' : 'w-6 h-4';
  return (
    <svg
      viewBox="0 0 44 28"
      fill="none"
      aria-hidden="true"
      className={`${dims} shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="kaSilverBody" x1="4" y1="2" x2="40" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="kaAmberEdge" x1="4" y1="3" x2="20" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="kaIceEdge" x1="22" y1="3" x2="40" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      {/* K stroke with subtle warm amber rim */}
      <path
        d="M5 4H10V12.5L18.2 4H24L14.5 14L24.2 24H18.4L10 15.3V24H5V4Z"
        fill="url(#kaSilverBody)"
        stroke="url(#kaAmberEdge)"
        strokeWidth="0.9"
      />
      {/* Λ stroke with subtle ice-blue rim */}
      <path
        d="M30.5 4H35.3L42.5 24H37.4L32.9 10.6L28.4 24H23.3L30.5 4Z"
        fill="url(#kaSilverBody)"
        stroke="url(#kaIceEdge)"
        strokeWidth="0.9"
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
