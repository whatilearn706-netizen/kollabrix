'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

export function GlowingSearchSparkBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/explore');
    }
  };

  const handleSparkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/spark');
  };

  return (
    <div className="relative group max-w-2xl w-full mx-auto select-none">
      {/* 1. Outer Ambient Glow Layer - Continuously casts vibrant dynamic neon bloom onto surrounding surface */}
      <div className="absolute -inset-1 rounded-full overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none">
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #8B5CF6 290deg, #EC4899 320deg, #FFFFFF 345deg, transparent 360deg)',
          }}
        />
      </div>

      {/* 2. Secondary soft ambient glow for high-contrast neon halo */}
      <div className="absolute -inset-0.5 rounded-full overflow-hidden opacity-80 blur-md pointer-events-none">
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #6366F1 295deg, #EC4899 325deg, #06B6D4 345deg, #FFFFFF 355deg, transparent 360deg)',
          }}
        />
      </div>

      {/* 3. Razor-Sharp Outer Pill Container with Rotating Specular Light Beam (studio.baseline inspired) */}
      <div className="relative rounded-full p-[1.5px] overflow-hidden bg-slate-800/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:shadow-[0_15px_45px_rgba(139,92,246,0.3)]">
        {/* Continuous Lightning Beam */}
        <div
          className="absolute -inset-[150%] aspect-square animate-border-lightning pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #8B5CF6 295deg, #EC4899 325deg, #FFFFFF 350deg, transparent 360deg)',
          }}
        />

        {/* 4. Deep Pitch-Black Obsidian Pill Body (Inner Core) */}
        <form
          onSubmit={handleSearch}
          className="relative flex items-center justify-between h-13 sm:h-14 px-3 sm:px-4 rounded-full bg-[#07080D]/95 backdrop-blur-2xl z-10 transition-colors"
        >
          {/* Left: Search Icon + Input Field */}
          <div className="flex items-center gap-3 flex-1 min-w-0 pl-1.5 sm:pl-2">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hackathons, teammates, campus bounties, problems..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400/80 focus:outline-none focus:placeholder-slate-500 font-sans tracking-wide truncate"
            />
          </div>

          {/* Middle: Crisp Translucent Vertical Divider Line */}
          <div className="h-6 w-[1.5px] bg-gradient-to-b from-white/5 via-white/25 to-white/5 mx-2 sm:mx-3 shrink-0" />

          {/* Right: Dedicated AI Spark Action Button with ⌘K Badge */}
          <button
            type="button"
            onClick={handleSparkClick}
            className="group/spark inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-violet-600/35 via-fuchsia-600/35 to-cyan-500/35 hover:from-violet-500/50 hover:via-fuchsia-500/50 hover:to-cyan-400/50 border border-white/20 hover:border-cyan-400/60 text-white transition-all duration-300 shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
            title="Launch AI Spark Studio (⌘K)"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 group-hover/spark:rotate-12 transition-transform duration-300" />
            <span className="font-heading font-bold text-xs sm:text-sm tracking-wide bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-transparent">
              AI Spark
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 border border-white/20 text-[10px] font-mono font-semibold text-slate-300 group-hover/spark:text-white group-hover/spark:border-cyan-400/50 transition-colors">
              ⌘K
            </kbd>
          </button>
        </form>
      </div>
    </div>
  );
}
