'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Swords, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { WarpSpeedCanvas } from './WarpSpeedCanvas';
import { InteractiveDuelTeaser } from './InteractiveDuelTeaser';

export function LandingHero() {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.2]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, -40]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen pt-28 pb-20 flex flex-col items-center justify-center overflow-hidden bg-[#090B10]"
    >
      {/* Continuous 60fps Hyperspace Starfield */}
      <WarpSpeedCanvas />

      {/* Soft radial vignette to keep headline & buttons ultra-readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(9,11,16,0.85)_100%)] pointer-events-none" />

      {/* Subtle ambient warm glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="landing-orb landing-orb-1 opacity-50" />
        <div className="landing-orb landing-orb-2 opacity-50" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7"
      >
        {/* Crisp Top Beacon Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-xl shadow-lg shadow-cyan-500/10"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-cyan-200 font-mono tracking-wide font-semibold">
            KOLLABRIX V2.0 • 1V1 CODE ESPORTS &amp; DUAL-LENS PROCTORING
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] font-bold tracking-tight leading-[0.98]"
        >
          <span className="text-white">Where Top Collegiate</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-cyan-400 bg-clip-text text-transparent">
            Coders Duel &amp; Win.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Compete in live 1v1 speedruns, test your algorithms with instant Judge0 compilation, and battle in zero-cheat dual-camera collegiate hackathons.
        </motion.p>

        {/* High-Converting CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          <Link
            href="/icpc"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-sm sm:text-base shadow-xl shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Swords className="w-4 h-4 text-amber-200" />
            <span>Enter 1v1 Battle Arena</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          <Link
            href={user ? "/my-projects" : "/signup"}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.14] bg-white/[0.04] text-slate-200 text-sm sm:text-base font-medium hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-white transition-all duration-200"
          >
            <span>Assemble Hackathon Team</span>
          </Link>
        </motion.div>

        {/* Live Metrics Ticker Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-slate-400 pt-2"
        >
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-white">48ms</strong> Compiler Speed
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <strong className="text-white">Dual-Lens</strong> WebRTC Proctor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <strong className="text-white">C++, Python &amp; Java</strong>
          </span>
        </motion.div>

        {/* 10-Second Interactive Teaser Arena */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="pt-6 w-full"
        >
          <InteractiveDuelTeaser />
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into dark section */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#090B10] to-transparent pointer-events-none" />
    </section>
  );
}
