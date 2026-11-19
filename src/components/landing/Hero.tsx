'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Swords, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { QuantumLoomCanvas } from './QuantumLoomCanvas';

const LINE_1 = 'Code. Team Up.';
const LINE_2 = 'Win.';

export function LandingHero() {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#000002] transform-gpu will-change-transform"
    >
      {/* Exact Realm 01 Quantum Loom of Consciousness WebGL Canvas (Optimized 60-120 FPS) */}
      <QuantumLoomCanvas className="z-0" onWebGLActive={(active) => setWebGLFailed(!active)} />

      {/* Hardware-Accelerated Video Fallback: ONLY rendered if WebGL fails */}
      {webGLFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/brand/hero-quantum-loom-poster.webp"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none -z-10 filter brightness-[1.25] contrast-[1.18] saturate-[1.4]"
        >
          <source src="/videos/hero-quantum-loom.mp4" type="video/mp4" />
        </video>
      )}

      {/* Radiant Atmosphere Vignette for pristine text readability & glowing depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,2,0.50)_100%)] pointer-events-none z-10" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-amber-500/20 bg-amber-500/[0.06] backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-200/90 font-medium tracking-wide">
            1v1 Code Battle Arena & Hackathon Squad Finder
          </span>
        </motion.div>

        {/* Headline with Hardware-Accelerated Cinematic Entrance */}
        <div className="relative inline-block mb-7 overflow-hidden py-1">
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] select-none">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="block text-white"
            >
              {LINE_1}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="block mt-1 landing-gradient-text"
            >
              {LINE_2}
            </motion.span>
          </h1>

          {/* Sweeping Specular Photon Laser Light Streak */}
          <motion.div
            initial={{ left: '-15%', opacity: 0 }}
            animate={{ left: '115%', opacity: [0, 1, 1, 0] }}
            transition={{
              delay: 0.04,
              duration: 0.72,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute top-0 bottom-0 w-12 pointer-events-none z-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[2px] shadow-[0_0_35px_rgba(236,72,153,0.9)]"
          />
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.52, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg md:text-xl text-zinc-100 max-w-2xl mx-auto mb-10 leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
        >
          The fast-paced 1v1 coding arena & hackathon squad finder for college builders. Duel live in 3 minutes, recruit dream teammates, and build real projects together.
        </motion.p>

        {/* The Two Big Doors CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.68, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-8"
        >
          {/* Door 1: 3-Min Code Duel Arena */}
          <Link
            href="/arena"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(245,158,11,0.45)] border border-amber-300/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <Swords className="w-5 h-5 text-slate-950" />
            <span>Play 3-Min Code Duel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          {/* Door 2: Find Hackathon Squad */}
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-200 text-sm sm:text-base font-bold hover:border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Find Hackathon Squad</span>
          </Link>
        </motion.div>

        {/* Simple clarity feature bullets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs sm:text-sm text-slate-400 font-mono"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> 3-Min 1v1 Duels
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" /> Hackathon Teammates
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> Verified GitHub Proof
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into dark section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#090B10] to-transparent pointer-events-none" />
    </section>
  );
}
