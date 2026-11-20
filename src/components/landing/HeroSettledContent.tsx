'use client';

import { motion, MotionValue } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface HeroSettledContentProps {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  isInteractive: boolean;
}

export function HeroSettledContent({
  opacity,
  y,
  scale,
  isInteractive,
}: HeroSettledContentProps) {
  return (
    <motion.div
      style={{ opacity, y, scale }}
      className={`relative z-20 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 transform-gpu will-change-transform ${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-end">
        {/* Left Column: Frosted Pill Badge + Row 1: "Code." / Row 2: "Team Up. Win." */}
        <div className="lg:col-span-7 xl:col-span-7">
          {/* Frosted Pill Badge */}
          <div>
            <Link
              href="/arena"
              prefetch={false}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-sky-400/25 bg-sky-500/[0.08] hover:bg-sky-500/[0.18] hover:border-sky-400/50 backdrop-blur-md mb-3.5 transition-all group cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
              <span className="text-xs sm:text-sm text-sky-200 group-hover:text-white font-medium tracking-wide transition-colors">
                1v1 Battle Arena & Collegiate Hackathons →
              </span>
            </Link>
          </div>

          {/* Headline: Row 1 = Code. | Row 2 = Team Up. Win. */}
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] xl:text-[5.75rem] font-bold text-white tracking-tight leading-[0.94] select-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            <span className="block text-white">
              Code.
            </span>
            <span className="block mt-1 whitespace-nowrap">
              <span className="text-white">Team Up. </span>
              <span className="bg-gradient-to-r from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">
                Win.
              </span>
            </span>
          </h1>
        </div>

        {/* Right Column: Subtitle + Two Big Doors CTAs + Bullets */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-end">
          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal mb-6 drop-shadow-md">
            The fast-paced 1v1 coding arena & hackathon squad finder for college builders. Duel live in 3 minutes, recruit dream teammates, and build real projects together.
          </p>

          {/* The Two Big Doors Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              href="/arena"
              prefetch={false}
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm sm:text-base shadow-[0_0_25px_rgba(255,255,255,0.35)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span>⚔️ Play 3-Min Code Duel</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.14] text-white text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            >
              <span>👥 Find Hackathon Squad</span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* Feature Bullets */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 font-mono mt-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" /> 3-Min 1v1 Duels
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" /> Hackathon Teammates
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> Verified GitHub Proof
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
