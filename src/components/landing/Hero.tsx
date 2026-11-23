'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  Play,
  Swords,
  Trophy,
  Users,
  Zap,
  CheckCircle2,
  Menu,
  Terminal,
  Code2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export function LandingHero() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -30]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[96vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-6 sm:pb-8 px-4 sm:px-8 lg:px-14 overflow-hidden bg-[#040508] text-white select-none"
    >
      {/* =========================================================================
          BACKGROUND: AUTHENTIC REAL-LIFE DEVELOPER WORKSPACE PHOTOREALISM
          Features dark moody physical studio room, warm ambient shelf lighting,
          matte desk, mechanical keyboard, mouse, mug, plant, and curved monitor
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Real-life Developer Desk Atmosphere Image */}
        <img
          src="/brand/hero-real-desktop-clean.jpg"
          alt="Kollabrix Developer Workstation"
          className="w-full h-full object-cover object-center lg:object-right filter brightness-[1.03] contrast-[1.05]"
        />

        {/* Left Side Ambient Vignette for 100% Vector Typography Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#040508] via-[#040508]/85 md:via-[#040508]/60 to-transparent pointer-events-none" />

        {/* Top & Bottom Cinematic Dissolves */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#090B10] via-[#090B10]/70 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          HERO MAIN CONTENT: HEADLINE & ACTIONS (LEFT) + MONITOR CLICK TARGET (RIGHT)
         ========================================================================= */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col justify-center my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ================= LEFT COLUMN: EDITORIAL CONTENT ================= */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center text-left">
            
            {/* Pill Badge matching reference */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-4 sm:mb-5"
            >
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/35 bg-black/60 hover:bg-black/80 text-amber-400 text-xs sm:text-sm font-mono tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer backdrop-blur-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-200">1v1 Coding Battle Arena</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] ml-1" />
              </Link>
            </motion.div>

            {/* Giant Monolithic Headline: Code. Compete. Win. */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.2rem] font-black tracking-tight leading-[0.92] text-white select-none"
            >
              <span className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">Code.</span>
              <span className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">Compete.</span>
              <span className="block bg-gradient-to-r from-[#FF7A00] via-[#FF9E00] to-[#FFB800] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,122,0,0.45)]">
                Win.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
            >
              Step into the ultimate 1v1 coding battlefield. Challenge your friends, sharpen your skills, and prove who&apos;s the <span className="text-cyan-400 font-medium">real coder</span>.
            </motion.p>

            {/* Action Buttons: Start Battle & Challenge a Friend */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3.5 sm:gap-4"
            >
              {/* Primary Button */}
              <Link
                href="/arena"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.45)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Start Battle →</span>
              </Link>

              {/* Secondary Button */}
              <Link
                href="/arena?action=create"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/[0.08] hover:bg-white/[0.16] text-white text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              >
                <Users className="w-4 h-4 text-slate-300" />
                <span>Challenge a Friend</span>
              </Link>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: INTERACTIVE MONITOR HOTSPOT ================= */}
          <div className="lg:col-span-6 xl:col-span-7 h-[300px] sm:h-[420px] lg:h-[500px] relative flex items-center justify-center">
            {/* Clickable Area Over the Real Monitor on the Desk */}
            <Link
              href="/arena"
              prefetch={false}
              className="w-full h-full flex items-center justify-end group cursor-pointer"
              title="Click to launch 1v1 Battle Arena"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-[10%] top-[45%] -translate-y-1/2 px-4 py-2 rounded-full bg-black/80 border border-amber-400/40 text-amber-300 font-mono text-xs sm:text-sm font-bold shadow-[0_0_30px_rgba(245,158,11,0.5)] backdrop-blur-md flex items-center gap-2">
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Launch 1v1 Duel Arena →</span>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          BOTTOM DOCK BAR: REAL-TIME STATS & SOCIAL PROOF PILL
          Matches the reference image with exact typography and icons
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 w-full max-w-[1500px] mx-auto mt-6 sm:mt-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-black/75 border border-white/10 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
          
          {/* Feature Pill 1: Real-time Coding Battle */}
          <Link
            href="/arena"
            className="flex items-center gap-2.5 px-3.5 py-1.5 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white leading-tight">Real-time</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Coding Battle</div>
            </div>
          </Link>

          {/* Feature Pill 2: Global Leaderboard */}
          <Link
            href="/leaderboard"
            className="flex items-center gap-2.5 px-3.5 py-1.5 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white leading-tight">Global Leaderboard</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Rise to the top</div>
            </div>
          </Link>

          {/* Feature Pill 3: Play with Friends */}
          <Link
            href="/arena?action=create"
            className="flex items-center gap-2.5 px-3.5 py-1.5 hover:opacity-85 transition-opacity cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white leading-tight">Play with Friends</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono">Together is better</div>
            </div>
          </Link>

          {/* Social Proof: 4 Student Avatars + 10K students battling */}
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div className="flex -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                alt="Student Builder"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                alt="Student Builder"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces"
                alt="Student Builder"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-900 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces"
                alt="Student Builder"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-900 object-cover"
              />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-tight">
              <strong className="text-white">+10K</strong> students are battling right now! <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] ml-1" />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
