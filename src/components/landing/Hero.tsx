'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.4], [0, -30]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[85vh] sm:min-h-[90vh] lg:min-h-[94vh] flex flex-col justify-end pb-8 sm:pb-12 lg:pb-14 overflow-hidden bg-[#0a0a0c] transform-gpu will-change-transform"
    >
      {/* Eye in the clouds surreal HD hero artwork */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none z-0">
        <img
          src="/images/hero-world-watching-hd.jpg"
          alt="The World is Watching - Kollabrix"
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01] filter brightness-[1.02] contrast-[1.03] transition-transform duration-1000 ease-out"
        />
      </div>

      {/* Subtle vignettes for contrast and seamless blend into page obsidian background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-black/25 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none z-10" />

      {/* Content: Sleek Action Doors aligned to bottom-left matching the removed explore button */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 w-full max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3.5 sm:gap-4"
          >
            <Link
              href="/arena"
              prefetch={false}
              className="group inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-200 hover:scale-[1.04] active:scale-[0.98] cursor-pointer"
            >
              <span>⚔️ Play 3-Min Code Duel</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full border border-white/25 bg-black/40 hover:bg-black/60 text-white font-medium text-xs sm:text-sm tracking-wide backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>👥 Find Hackathon Squad</span>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Right micro badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="hidden sm:flex items-center gap-4 text-[11px] font-mono text-white/75 backdrop-blur-md px-4 py-2 rounded-full bg-black/40 border border-white/10 shadow-lg"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" /> 1v1 Battle Arena
            </span>
            <span className="text-white/30">•</span>
            <span>Anti-Cheat Fog of War</span>
            <span className="text-white/30">•</span>
            <span className="text-cyan-300">Collegiate Proof</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
