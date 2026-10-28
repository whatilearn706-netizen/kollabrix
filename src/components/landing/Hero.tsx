'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { WarpSpeedCanvas } from './WarpSpeedCanvas';

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#090B10]"
    >
      {/* Continuous 60fps Light-Speed Hyperspace Starfield (Derived from reference Image 3 with spaceship removed) */}
      <WarpSpeedCanvas />

      {/* Soft radial vignette to keep headline & buttons ultra-readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(9,11,16,0.7)_100%)] pointer-events-none" />

      {/* Subtle ambient warm glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="landing-orb landing-orb-1 opacity-60" />
        <div className="landing-orb landing-orb-2 opacity-60" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-slate-400 font-medium tracking-wide">
            The Collegiate Innovation Network
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-7"
        >
          <span className="text-white">Where Creators</span>
          <br />
          <span className="landing-gradient-text">Build Together.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Assemble dream teams, ship hackathon projects, and showcase your
          engineering portfolio — all on one platform built for ambitious students.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold text-sm sm:text-base landing-btn-glow shadow-lg shadow-orange-500/20 hover:scale-105 transition-all duration-200"
          >
            Start Building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/[0.12] bg-white/[0.03] text-slate-200 text-sm sm:text-base font-medium hover:border-white/25 hover:bg-white/[0.08] transition-all duration-300"
          >
            Explore Projects
          </Link>
          <Link
            href="/spark"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm sm:text-base font-medium hover:bg-amber-500/20 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Spark Generator
          </Link>
        </motion.div>

        {/* Feature bullets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Verified GitHub Proof
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> College Hackathons
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Faculty Mentorship
          </span>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into dark section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#090B10] to-transparent pointer-events-none" />
    </section>
  );
}
