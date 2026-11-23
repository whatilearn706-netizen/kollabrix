'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Play,
  Users,
  Zap,
  Trophy,
  CheckCircle2,
  Volume2,
  Maximize2,
  MoreVertical,
  Clock,
  Crown,
  Sparkles,
  Laptop,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export function LandingHero() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);

  // Live 3D cursor tilt on the desktop arena for authentic physical perspective
  const [tilt, setTilt] = useState({ x: -10, y: 3 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -10 + xPct * 8, // Smooth interactive 3D rotation
      y: 3 - yPct * 6,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: -10, y: 3 });
  };

  // Live Duel Match State (Simulates a real-time 1v1 battle like a video)
  const [matchSeconds, setMatchSeconds] = useState(83); // 01:23
  const [leftTypedIdx, setLeftTypedIdx] = useState(0);
  const [rightTypedIdx, setRightTypedIdx] = useState(0);
  const [leftPassedTests, setLeftPassedTests] = useState(false);
  const [rightPassedTests, setRightPassedTests] = useState(false);

  // Python Code for ZenCoder (Left Player Laptop)
  const leftLines = [
    'def solve(n):',
    '    return n * 2',
    '',
    'print(solve(21))',
  ];

  // Python Code for CodeRex (Right Player Laptop)
  const rightLines = [
    'def solve(n):',
    '    return n + 1',
    '',
    'print(solve(21))',
  ];

  // Ticking countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMatchSeconds((prev) => {
        if (prev <= 10) return 83; // Loops 01:23 -> 00:10 -> 01:23
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Left Laptop Typing loop
  useEffect(() => {
    const totalChars = leftLines.join('\n').length;
    const interval = setInterval(() => {
      setLeftTypedIdx((prev) => {
        if (prev >= totalChars) {
          setLeftPassedTests(true);
          return totalChars;
        }
        return prev + 1;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [leftLines]);

  // Right Laptop Typing loop
  useEffect(() => {
    const totalChars = rightLines.join('\n').length;
    const interval = setInterval(() => {
      setRightTypedIdx((prev) => {
        if (prev >= totalChars) {
          setRightPassedTests(true);
          return totalChars;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [rightLines]);

  // Loop reset when both complete
  useEffect(() => {
    const totalLeft = leftLines.join('\n').length;
    const totalRight = rightLines.join('\n').length;
    if (leftTypedIdx >= totalLeft && rightTypedIdx >= totalRight) {
      const reset = setTimeout(() => {
        setLeftTypedIdx(0);
        setRightTypedIdx(0);
        setLeftPassedTests(false);
        setRightPassedTests(false);
      }, 5000);
      return () => clearTimeout(reset);
    }
  }, [leftTypedIdx, rightTypedIdx, leftLines, rightLines]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper to slice lines with typing cursor
  const getRenderedCode = (lines: string[], currentLength: number) => {
    const fullText = lines.join('\n');
    const sliced = fullText.slice(0, currentLength);
    return sliced.split('\n');
  };

  const currentLeftLines = getRenderedCode(leftLines, leftTypedIdx);
  const currentRightLines = getRenderedCode(rightLines, rightTypedIdx);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -30]);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-6 sm:pb-8 px-4 sm:px-8 lg:px-14 overflow-hidden bg-[#06080d] text-white select-none"
    >
      {/* =========================================================================
          AUTHENTIC REAL-LIFE DEVELOPER ROOM ENVIRONMENT BACKGROUND
          Physical desk, warm amber shelf backlight, dark studio mood
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Real-life Workstation Desk Backdrop */}
        <img
          src="/brand/hero-real-desktop-clean.jpg"
          alt="Developer Workstation Workspace"
          className="w-full h-full object-cover object-center lg:object-right filter brightness-[1.02] contrast-[1.05]"
        />

        {/* Realistic Warm Amber Shelf Backlight (Top-Right of Room) */}
        <div className="absolute top-[8%] right-[8%] w-[550px] h-[180px] bg-gradient-to-b from-amber-500/25 via-amber-400/15 to-transparent blur-3xl pointer-events-none" />

        {/* Left Side Ambient Vignette for 100% Vector Typography Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06080d] via-[#06080d]/85 md:via-[#06080d]/50 to-transparent pointer-events-none" />

        {/* Top & Bottom Cinematic Dissolves */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#090B10] via-[#090B10]/80 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          HERO MAIN CONTENT: HEADLINE (LEFT) & 3D DESKTOP WITH 2 LAPTOPS (RIGHT)
         ========================================================================= */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col justify-center my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: TAGLINE & EDITORIAL HEADLINE ================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center text-left">
            
            {/* Pill Badge matching reference */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-4 sm:mb-5"
            >
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/35 bg-black/70 hover:bg-black/90 text-amber-400 text-xs sm:text-sm font-mono tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all cursor-pointer backdrop-blur-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-200">1v1 Coding Battle Arena</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] ml-1 animate-pulse" />
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

            {/* Subtitle / Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
            >
              Step into the ultimate 1v1 collegiate coding battlefield. Challenge your friends, sharpen your skills, and prove who&apos;s the <span className="text-cyan-400 font-medium">real coder</span>.
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

          {/* ================= RIGHT COLUMN: 3D DESKTOP ARENA WITH 2 LAPTOPS CODING 1:1 ================= */}
          <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center lg:justify-end relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-[900px] transition-transform duration-300 ease-out"
              style={{
                perspective: '1400px',
              }}
            >
              {/* 3D Desktop Arena Chassis */}
              <Link
                href="/arena"
                prefetch={false}
                title="Click to launch 1v1 Battle Arena"
                style={{
                  transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transformStyle: 'preserve-3d',
                }}
                className="block relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-slate-700/80 via-slate-900 to-black border border-slate-700/90 shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_50px_rgba(245,158,11,0.2)] hover:shadow-[0_35px_110px_rgba(0,0,0,0.98),0_0_70px_rgba(245,158,11,0.35)] transition-all duration-300 group cursor-pointer overflow-hidden"
              >
                {/* Curved OLED Glass Sheen Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.035] to-transparent pointer-events-none z-30 rounded-2xl" />

                {/* Inner Screen Display / Arena Stage */}
                <div className="relative rounded-xl sm:rounded-2xl bg-[#070a12] border border-slate-800/90 overflow-hidden flex flex-col shadow-inner">
                  
                  {/* ================= DESKTOP TOP HUD BAR ================= */}
                  <div className="h-10 sm:h-11 bg-[#0b0f19] px-3.5 sm:px-5 flex items-center justify-between border-b border-slate-800/80 select-none z-20">
                    {/* Left: Brand Emblem & Stage Mode */}
                    <div className="flex items-center gap-2 text-slate-200 font-bold tracking-wider text-xs sm:text-sm font-mono">
                      <span className="text-amber-400 font-black text-sm">▲</span>
                      <span>KOLLABRIX</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-amber-400/90 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        1v1 BATTLE ARENA
                      </span>
                    </div>

                    {/* Center: Live Battle Clock */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800/80 text-cyan-300 font-mono text-xs sm:text-sm font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>{formatTimer(matchSeconds)}</span>
                    </div>

                    {/* Right: Security & Utilities */}
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Fog of War Active</span>
                      </div>
                      <Volume2 className="w-3.5 h-3.5 hover:text-white transition-colors" />
                      <Maximize2 className="w-3.5 h-3.5 hover:text-white transition-colors" />
                      <MoreVertical className="w-3.5 h-3.5 hover:text-white transition-colors" />
                    </div>
                  </div>

                  {/* ================= 3D ARENA STAGE: 2 LAPTOPS DUELING IN REAL-TIME ================= */}
                  <div className="relative bg-gradient-to-b from-[#05070d] via-[#080c16] to-[#04060a] p-3 sm:p-5 pb-5 sm:pb-7 overflow-hidden">
                    
                    {/* Ambient Neon Duel Arena Grid Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                    {/* Center Glowing Electric VS Divider & Clash Energy */}
                    <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                      <div className="relative">
                        <span className="font-black font-mono text-xl sm:text-3xl tracking-tighter bg-gradient-to-r from-cyan-400 via-white to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(6,182,212,0.95)] animate-pulse">
                          VS
                        </span>
                        {/* Electric Lightning Flare */}
                        <div className="absolute -inset-6 bg-gradient-to-r from-cyan-500/25 via-purple-500/20 to-pink-500/25 blur-2xl pointer-events-none" />
                      </div>
                      <span className="mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-950/90 border border-slate-700/60 text-slate-300">
                        1:1 DUEL
                      </span>
                    </div>

                    {/* DUAL 3D LAPTOPS CONTAINER */}
                    <div className="relative z-10 grid grid-cols-2 gap-3 sm:gap-6 items-start">

                      {/* =========================================================================
                          LAPTOP 1 (LEFT): ZenCoder (IIT Delhi • 96)
                          Angled slightly right towards center duel
                         ========================================================================= */}
                      <div 
                        style={{
                          transform: 'perspective(900px) rotateY(11deg) rotateX(4deg)',
                          transformStyle: 'preserve-3d',
                        }}
                        className="flex flex-col items-center transition-transform duration-200"
                      >
                        {/* 1. LAPTOP SCREEN / LID */}
                        <div className="w-full rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 p-1 sm:p-1.5 border border-slate-600/70 shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
                          
                          {/* Top Center Webcam Dot */}
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-700 mx-auto mb-1 opacity-80" />

                          {/* Screen Bezel & Display */}
                          <div className="rounded-lg sm:rounded-xl bg-[#06080e] border border-cyan-500/30 p-2 sm:p-3 flex flex-col gap-2 shadow-inner overflow-hidden">
                            
                            {/* Laptop Screen Top Header */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/70">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="relative">
                                  <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces"
                                    alt="ZenCoder"
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-cyan-400/80 object-cover"
                                  />
                                  <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">ZenCoder</span>
                                  <span className="text-[9px] text-cyan-400 font-mono hidden sm:inline">IIT Delhi</span>
                                </div>
                              </div>
                              {/* Score Badge */}
                              <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] sm:text-xs font-black font-mono text-cyan-300">
                                96
                              </span>
                            </div>

                            {/* File Tab */}
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400">
                              <span className="text-cyan-400 font-semibold">●</span>
                              <span className="text-slate-300">main.py</span>
                            </div>

                            {/* Live Code Editor Screen */}
                            <div className="rounded-md bg-[#04060a] border border-slate-800/80 p-2 font-mono text-[10px] sm:text-[11px] leading-relaxed min-h-[110px] sm:min-h-[135px] flex gap-2 sm:gap-2.5 text-slate-300">
                              {/* Line Numbers */}
                              <div className="select-none text-slate-600 font-mono text-right flex flex-col text-[10px]">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                              </div>
                              {/* Python Typing Animation */}
                              <div className="flex-1 font-mono whitespace-pre overflow-x-hidden">
                                {currentLeftLines.map((line, i) => (
                                  <div key={i} className="text-cyan-200">
                                    {line.includes('def') ? (
                                      <span>
                                        <span className="text-pink-400 font-bold">def </span>
                                        <span className="text-amber-300">solve</span>(n):
                                      </span>
                                    ) : line.includes('return') ? (
                                      <span>
                                        &nbsp;&nbsp;<span className="text-pink-400">return </span>
                                        <span>n * 2</span>
                                      </span>
                                    ) : line.includes('print') ? (
                                      <span>
                                        <span className="text-purple-400">print</span>(solve(21))
                                      </span>
                                    ) : (
                                      line
                                    )}
                                  </div>
                                ))}
                                {/* Blinking Blue Cursor */}
                                <span className="inline-block w-1 h-3 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
                              </div>
                            </div>

                            {/* Test Results */}
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold">
                              <CheckCircle2 className={`w-3 h-3 text-emerald-400 ${leftPassedTests ? 'animate-bounce' : ''}`} />
                              <span>All tests passed!</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. LAPTOP HINGE */}
                        <div className="w-[88%] h-1 sm:h-1.5 bg-slate-950 border-x border-slate-700/80 shadow-md" />

                        {/* 3. LAPTOP KEYBOARD BASE (DECK) IN 3D PERSPECTIVE */}
                        <div
                          style={{
                            transform: 'perspective(400px) rotateX(55deg)',
                            transformOrigin: 'top center',
                          }}
                          className="w-full h-12 sm:h-16 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-b-xl border border-slate-700/90 p-1.5 sm:p-2 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
                        >
                          {/* Simulated Backlit Keyboard Rows */}
                          <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                            <div className="h-1 sm:h-1.5 w-full bg-slate-950/90 rounded border border-cyan-500/20 shadow-[0_0_6px_rgba(6,182,212,0.3)]" />
                            <div className="h-1 sm:h-1.5 w-full bg-slate-950/90 rounded border border-cyan-500/20 shadow-[0_0_6px_rgba(6,182,212,0.3)]" />
                            <div className="h-1 sm:h-1.5 w-3/4 mx-auto bg-slate-950/90 rounded border border-cyan-500/20" />
                          </div>

                          {/* Metallic Glass Trackpad */}
                          <div className="w-8 sm:w-12 h-2.5 sm:h-3.5 mx-auto bg-slate-950/80 rounded border border-slate-700/60 shadow-inner" />
                        </div>

                        {/* 4. UNDERGLOW NEON DESK REFLECTION */}
                        <div className="w-[90%] h-2.5 bg-cyan-500/20 blur-md rounded-full mt-0.5" />
                      </div>


                      {/* =========================================================================
                          LAPTOP 2 (RIGHT): CodeRex (DTU Delhi • 84)
                          Angled slightly left towards center duel
                         ========================================================================= */}
                      <div 
                        style={{
                          transform: 'perspective(900px) rotateY(-11deg) rotateX(4deg)',
                          transformStyle: 'preserve-3d',
                        }}
                        className="flex flex-col items-center transition-transform duration-200"
                      >
                        {/* 1. LAPTOP SCREEN / LID */}
                        <div className="w-full rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 p-1 sm:p-1.5 border border-slate-600/70 shadow-[0_15px_35px_rgba(0,0,0,0.9)]">
                          
                          {/* Top Center Webcam Dot */}
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-700 mx-auto mb-1 opacity-80" />

                          {/* Screen Bezel & Display */}
                          <div className="rounded-lg sm:rounded-xl bg-[#06080e] border border-purple-500/30 p-2 sm:p-3 flex flex-col gap-2 shadow-inner overflow-hidden">
                            
                            {/* Laptop Screen Top Header */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/70">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <img
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces"
                                  alt="CodeRex"
                                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-purple-400/80 object-cover"
                                />
                                <div className="flex flex-col">
                                  <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">CodeRex</span>
                                  <span className="text-[9px] text-purple-400 font-mono hidden sm:inline">DTU Delhi</span>
                                </div>
                              </div>
                              {/* Score Badge */}
                              <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-[10px] sm:text-xs font-black font-mono text-purple-300">
                                84
                              </span>
                            </div>

                            {/* File Tab */}
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-slate-400">
                              <span className="text-purple-400 font-semibold">●</span>
                              <span className="text-slate-300">main.py</span>
                            </div>

                            {/* Live Code Editor Screen */}
                            <div className="rounded-md bg-[#04060a] border border-slate-800/80 p-2 font-mono text-[10px] sm:text-[11px] leading-relaxed min-h-[110px] sm:min-h-[135px] flex gap-2 sm:gap-2.5 text-slate-300">
                              {/* Line Numbers */}
                              <div className="select-none text-slate-600 font-mono text-right flex flex-col text-[10px]">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                              </div>
                              {/* Python Typing Animation */}
                              <div className="flex-1 font-mono whitespace-pre overflow-x-hidden">
                                {currentRightLines.map((line, i) => (
                                  <div key={i} className="text-purple-200">
                                    {line.includes('def') ? (
                                      <span>
                                        <span className="text-pink-400 font-bold">def </span>
                                        <span className="text-amber-300">solve</span>(n):
                                      </span>
                                    ) : line.includes('return') ? (
                                      <span>
                                        &nbsp;&nbsp;<span className="text-pink-400">return </span>
                                        <span>n + 1</span>
                                      </span>
                                    ) : line.includes('print') ? (
                                      <span>
                                        <span className="text-purple-400">print</span>(solve(21))
                                      </span>
                                    ) : (
                                      line
                                    )}
                                  </div>
                                ))}
                                {/* Blinking Purple Cursor */}
                                <span className="inline-block w-1 h-3 bg-purple-400 animate-pulse ml-0.5 align-middle" />
                              </div>
                            </div>

                            {/* Test Results */}
                            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold">
                              <CheckCircle2 className={`w-3 h-3 text-emerald-400 ${rightPassedTests ? 'animate-bounce' : ''}`} />
                              <span>All tests passed!</span>
                            </div>
                          </div>
                        </div>

                        {/* 2. LAPTOP HINGE */}
                        <div className="w-[88%] h-1 sm:h-1.5 bg-slate-950 border-x border-slate-700/80 shadow-md" />

                        {/* 3. LAPTOP KEYBOARD BASE (DECK) IN 3D PERSPECTIVE */}
                        <div
                          style={{
                            transform: 'perspective(400px) rotateX(55deg)',
                            transformOrigin: 'top center',
                          }}
                          className="w-full h-12 sm:h-16 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-b-xl border border-slate-700/90 p-1.5 sm:p-2 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
                        >
                          {/* Simulated Backlit Keyboard Rows */}
                          <div className="flex flex-col gap-0.5 sm:gap-1 px-1">
                            <div className="h-1 sm:h-1.5 w-full bg-slate-950/90 rounded border border-purple-500/20 shadow-[0_0_6px_rgba(168,85,247,0.3)]" />
                            <div className="h-1 sm:h-1.5 w-full bg-slate-950/90 rounded border border-purple-500/20 shadow-[0_0_6px_rgba(168,85,247,0.3)]" />
                            <div className="h-1 sm:h-1.5 w-3/4 mx-auto bg-slate-950/90 rounded border border-purple-500/20" />
                          </div>

                          {/* Metallic Glass Trackpad */}
                          <div className="w-8 sm:w-12 h-2.5 sm:h-3.5 mx-auto bg-slate-950/80 rounded border border-slate-700/60 shadow-inner" />
                        </div>

                        {/* 4. UNDERGLOW NEON DESK REFLECTION */}
                        <div className="w-[90%] h-2.5 bg-purple-500/20 blur-md rounded-full mt-0.5" />
                      </div>

                    </div>
                  </div>

                  {/* Desktop Arena Bottom Accent Strip */}
                  <div className="h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-purple-500 opacity-60" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          BOTTOM FLOATING DOCK: STATS & SOCIAL PROOF PILL
          Matches reference mockup with exact typography, badges, and avatars
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 w-full max-w-[1550px] mx-auto mt-6 sm:mt-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)]">
          
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
