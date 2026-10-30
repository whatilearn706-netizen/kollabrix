import React from 'react';
import Link from 'next/link';
import { Compass, Home, Swords, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden bg-[#090B10] text-slate-100 select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-orange-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        {/* Floating 3D Logo */}
        <div className="flex justify-center">
          <BrandLogo size="lg" showWordmark={false} />
        </div>

        {/* 404 Headline */}
        <div className="space-y-2">
          <span className="inline-block font-mono text-xs font-bold uppercase tracking-[0.25em] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            HTTP 404 • Missing Coordinate
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
            Lost in Cyberspace
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
            The collegiate project, squad room, or resource you were navigating to has been relocated or never existed.
          </p>
        </div>

        {/* Fast Action Navigation Pills */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-[0_0_24px_rgba(245,158,11,0.35)] transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-700/60 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Explore Projects</span>
          </Link>
        </div>

        {/* Alternate Shortcut */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-400">
          <Link
            href="/arena"
            className="inline-flex items-center gap-1.5 hover:text-amber-400 transition-colors"
          >
            <Swords className="w-3.5 h-3.5 text-amber-500" />
            <span>ICPC Arena</span>
          </Link>
          <span className="text-slate-700">•</span>
          <Link
            href="/problems"
            className="hover:text-amber-400 transition-colors"
          >
            Problem Bank
          </Link>
          <span className="text-slate-700">•</span>
          <Link
            href="/teammates"
            className="hover:text-amber-400 transition-colors"
          >
            Find Builders
          </Link>
        </div>
      </div>
    </div>
  );
}
