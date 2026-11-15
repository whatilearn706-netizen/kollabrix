'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Users,
  ShieldCheck,
  Terminal,
  Zap,
  Code2,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { QuantumLoomCanvas } from './QuantumLoomCanvas';
import { GlowingSearchSparkBar } from './GlowingSearchSparkBar';

const LINE_1 = 'Where Creators';
const LINE_2 = 'Build Together.';

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
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none -z-10"
        >
          <source src="/videos/hero-quantum-loom.mp4" type="video/mp4" />
        </video>
      )}

      {/* Balanced Radial Vignette for pristine text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,2,0.65)_100%)] pointer-events-none z-10" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-8 pb-16"
      >
        {/* Floating Ambient Live Badges (Desktop) */}
        <div className="hidden lg:flex items-center justify-between absolute -top-2 left-6 right-6 pointer-events-none z-30">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-xs text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-cyan-300 font-semibold">142 Builders</span>
            <span className="text-slate-400">in ICPC Arena</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-xs text-slate-200">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-amber-300 font-semibold">₹50,000 Bounty</span>
            <span className="text-slate-400">S-VYASA Hackathon</span>
          </div>
        </div>

        {/* Top Electric Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-cyan-400/40 bg-gradient-to-r from-violet-600/15 via-cyan-500/15 to-amber-500/15 backdrop-blur-xl mb-8 shadow-[0_0_24px_rgba(6,182,212,0.2)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-transparent">
            The Collegiate Innovation Network
          </span>
        </motion.div>

        {/* Headline with High-Contrast Electric Entrance */}
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
              className="block mt-1 bg-gradient-to-r from-orange-400 via-amber-300 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(249,115,22,0.35)]"
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg md:text-xl text-zinc-100 max-w-2xl mx-auto mb-9 leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]"
        >
          Assemble dream teams, ship hackathon projects, and showcase your
          engineering portfolio — all on one platform built for ambitious students.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.68, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-7"
        >
          <Link
            href={user ? "/my-projects" : "/signup"}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 text-white font-semibold text-sm sm:text-base shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.7)] hover:scale-105 transition-all duration-300"
          >
            Start Building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-500/30 bg-slate-950/60 text-slate-200 text-sm sm:text-base font-medium hover:border-cyan-400/60 hover:bg-cyan-500/10 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            Explore Projects
          </Link>
        </motion.div>

        {/* Feature bullets with Electric Accents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300 mb-10"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified GitHub Proof
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> College Hackathons
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> Faculty Mentorship
          </span>
        </motion.div>

        {/* Continuous Lightning Glowing Search & AI Spark Bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl mx-auto px-2 z-20 relative"
        >
          <GlowingSearchSparkBar />
        </motion.div>

        {/* 2. Floating 3D Glass Mockup Deck (Real Hackathon & OA Practice Live Card) */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.98, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 w-full max-w-4xl mx-auto text-left relative z-20"
        >
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#111424]/90 via-[#0B0D18]/90 to-[#07080E]/95 backdrop-blur-2xl border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(6,182,212,0.12)]">
            {/* Deck Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Live Platform Arena
                </span>
                <span className="text-xs sm:text-sm font-heading font-bold text-white">
                  S-VYASA Turing Hackathon 2026
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  ₹50,000 Cash Pool
                </span>
                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  42 Squads Assembled
                </span>
              </div>
            </div>

            {/* Split Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Active Squad Forming */}
              <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all group/card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-heading font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Autonomous Campus Drone Fleet
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    4/4 Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  Building edge obstacle evasion & medical sample dispatch across campus hostels.
                </p>

                {/* Squad Members */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex -space-x-2">
                    {[
                      { initial: 'MG', bg: 'bg-orange-500', name: 'Mayank G.' },
                      { initial: 'DK', bg: 'bg-cyan-500', name: 'Deepak K.' },
                      { initial: 'AS', bg: 'bg-violet-500', name: 'Ananya S.' },
                      { initial: 'RJ', bg: 'bg-emerald-500', name: 'Rohan J.' },
                    ].map((member, i) => (
                      <div
                        key={i}
                        title={member.name}
                        className={`w-7 h-7 rounded-full ${member.bg} text-white font-mono text-[10px] font-bold flex items-center justify-center border-2 border-[#090B10] shadow-sm`}
                      >
                        {member.initial}
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/hackathons"
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover/card:translate-x-0.5 transition-transform"
                  >
                    <span>View Squad Spec</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card B: Live Proctor & Competitive OA Speedrun */}
              <div className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-all group/card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-heading font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-violet-400" />
                    1v1 Placement OA Speedrun Arena
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Proctored
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  Amazon & Google hiring challenge simulation with anti-paste lock & dual-stream verification.
                </p>

                {/* Standings Snippet */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Top score: <strong className="text-white">100/100 (04m 12s)</strong></span>
                  </div>
                  <Link
                    href="/icpc"
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 group-hover/card:translate-x-0.5 transition-transform"
                  >
                    <span>Enter Speedrun</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade into dark section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#090B10] to-transparent pointer-events-none" />
    </section>
  );
}
