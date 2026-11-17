'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { QuantumLoomCanvas } from './QuantumLoomCanvas';

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
        className="relative z-20 max-w-4xl mx-auto px-6 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-slate-400 font-medium tracking-wide">
            The Collegiate Innovation Network
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
          Assemble dream teams, ship hackathon projects, and showcase your
          engineering portfolio — all on one platform built for ambitious students.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.68, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8"
        >
          <Link
            href={user ? "/my-projects" : "/signup"}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-300/40 hover:scale-105 transition-all duration-200 cursor-pointer"
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
        </motion.div>

        {/* Feature bullets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
