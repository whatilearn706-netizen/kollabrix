'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  Flame,
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

  // Dynamic 3D tilt state following cursor for realistic depth
  const [tilt, setTilt] = useState({ x: -11, y: 3 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -11 + xPct * 8, // base -11deg Y rotation with +/-4deg dynamic tilt
      y: 3 - yPct * 6,   // base +3deg X rotation with +/-3deg dynamic tilt
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: -11, y: 3 });
    setIsHovering(false);
  };

  // Live Duel Match Simulation: Typing code, ticking clock, tests passing
  const [matchSeconds, setMatchSeconds] = useState(83); // 01:23
  const [leftTypedLength, setLeftTypedLength] = useState(0);
  const [rightTypedLength, setRightTypedLength] = useState(0);
  const [leftTests, setLeftTests] = useState(1);
  const [rightTests, setRightTests] = useState(1);

  const leftCodeFull = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Executing test cases...
# Input: nums = [2,7,11,15], target = 9
# Output: [0, 1]`;

  const rightCodeFull = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (seen.count(diff)) return {seen[diff], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`;

  // Ticking match countdown timer (loops realistically)
  useEffect(() => {
    const timer = setInterval(() => {
      setMatchSeconds((prev) => {
        if (prev <= 10) return 83; // Reset loop at 00:10 -> 01:23
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animated live typing for Left Player (ZenCoder)
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setLeftTypedLength((prev) => {
        if (prev >= leftCodeFull.length) {
          setLeftTests(3);
          return leftCodeFull.length;
        }
        const next = prev + 2;
        if (next > 120 && leftTests < 2) setLeftTests(2);
        return next;
      });
    }, 70);
    return () => clearInterval(typingInterval);
  }, [leftCodeFull.length, leftTests]);

  // Animated live typing for Right Player (CodeRex)
  useEffect(() => {
    const typingInterval = setInterval(() => {
      setRightTypedLength((prev) => {
        if (prev >= rightCodeFull.length) {
          setRightTests(2);
          return rightCodeFull.length;
        }
        return prev + 1;
      });
    }, 95);
    return () => clearInterval(typingInterval);
  }, [rightCodeFull.length]);

  // Loop reset when both finishes
  useEffect(() => {
    if (leftTypedLength >= leftCodeFull.length && rightTypedLength >= rightCodeFull.length) {
      const resetTimeout = setTimeout(() => {
        setLeftTypedLength(30);
        setRightTypedLength(25);
        setLeftTests(1);
        setRightTests(1);
      }, 5000);
      return () => clearTimeout(resetTimeout);
    }
  }, [leftTypedLength, rightTypedLength, leftCodeFull.length, rightCodeFull.length]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[96vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-8 lg:px-14 overflow-hidden bg-[#05070c] text-white select-none"
    >
      {/* =========================================================================
          BACKGROUND ATMOSPHERE: THE CELESTIAL SOLAR ECLIPSE HORIZON
          Vector & CSS Layered for 100% Retinal Crispness (Zero Pixelation on Any Screen)
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep space radial ambient gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(245,158,11,0.12)_0%,rgba(14,18,28,0.85)_50%,#05070c_100%)]" />

        {/* The Giant Curved Solar Eclipse Horizon Arc */}
        <div
          className="absolute -top-[120px] sm:-top-[80px] -right-[15%] sm:-right-[5%] w-[125vw] sm:w-[110vw] max-w-[1700px] h-[550px] sm:h-[650px] lg:h-[750px] rounded-[50%] pointer-events-none"
          style={{
            borderTop: '3.5px solid rgba(251, 191, 36, 0.95)',
            boxShadow:
              '0 -8px 30px rgba(245, 158, 11, 0.85), 0 -25px 80px rgba(234, 88, 12, 0.5), 0 -60px 140px rgba(217, 119, 6, 0.25)',
            transform: 'rotate(-7deg)',
          }}
        />

        {/* Secondary Inner Solar Filament Arc for High-Fidelity Glow */}
        <div
          className="absolute -top-[100px] sm:-top-[60px] -right-[12%] sm:-right-[3%] w-[120vw] sm:w-[105vw] max-w-[1650px] h-[520px] sm:h-[620px] lg:h-[720px] rounded-[50%] opacity-80 pointer-events-none"
          style={{
            borderTop: '1.5px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 -2px 15px rgba(255, 245, 210, 0.9), 0 -15px 50px rgba(245, 158, 11, 0.4)',
            transform: 'rotate(-7deg)',
          }}
        />

        {/* Radiant Solar Corona Flare (Backlight Behind the Curved Monitor) */}
        <div className="absolute top-[8%] right-[15%] lg:right-[22%] w-[480px] h-[360px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-500/15 to-transparent blur-3xl pointer-events-none transform-gpu" />

        {/* Subtle Starfield & Cosmic Dust Particles */}
        <svg
          className="absolute inset-0 w-full h-full opacity-65"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12%" cy="18%" r="1" fill="#fff" opacity="0.6" />
          <circle cx="28%" cy="24%" r="1.5" fill="#fde047" opacity="0.8" />
          <circle cx="45%" cy="12%" r="1" fill="#fff" opacity="0.5" />
          <circle cx="62%" cy="16%" r="2" fill="#fbbf24" opacity="0.75" />
          <circle cx="78%" cy="9%" r="1" fill="#fff" opacity="0.4" />
          <circle cx="89%" cy="32%" r="1.5" fill="#fde047" opacity="0.7" />
          <circle cx="15%" cy="65%" r="1.2" fill="#fff" opacity="0.5" />
          <circle cx="34%" cy="78%" r="1" fill="#fbbf24" opacity="0.4" />
          <circle cx="72%" cy="72%" r="1.5" fill="#fff" opacity="0.6" />
          <circle cx="94%" cy="68%" r="1" fill="#fde047" opacity="0.5" />
          <circle cx="5%" cy="45%" r="1.5" fill="#fff" opacity="0.7" />
        </svg>

        {/* Seamless bottom fade into Obsidian page background (#090B10) */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#090B10] via-[#090B10]/70 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          HERO MAIN CONTENT: EDITORIAL HEADLINE (LEFT) & 3D BATTLE COCKPIT (RIGHT)
         ========================================================================= */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col justify-center my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 items-center">
          
          {/* ================= LEFT COLUMN: HERO HEADLINE & CTAS ================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center text-left">
            
            {/* Pill Badge matching Image 6 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-5 sm:mb-6"
            >
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-slate-900/80 hover:bg-slate-800/80 text-amber-300 text-xs sm:text-sm font-mono tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all cursor-pointer backdrop-blur-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span className="font-semibold text-slate-200">1v1 Coding Battle Arena</span>
              </Link>
            </motion.div>

            {/* Giant Monolithic Headline: Code. Compete. Win. */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[6.5rem] font-black tracking-tight leading-[0.92] text-white"
            >
              <span className="block drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">Code.</span>
              <span className="block drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">Compete.</span>
              <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(245,158,11,0.45)]">
                Win.
              </span>
            </motion.h1>

            {/* Subtitle matching Image 6 specification */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal max-w-lg drop-shadow"
            >
              Step into the ultimate 1v1 coding battlefield. Challenge your friends, sharpen your skills, and prove who&apos;s the real coder.
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
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.45),0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
              >
                <span>Start Battle</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Secondary Button */}
              <Link
                href="/arena?action=create"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.14] text-white text-sm sm:text-base font-semibold backdrop-blur-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              >
                <span>Challenge a Friend</span>
              </Link>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: 3D CURVED BATTLE COCKPIT ================= */}
          <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center lg:justify-end relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-[820px] transition-transform duration-300 ease-out"
              style={{
                perspective: '1400px',
              }}
            >
              {/* The Physical Curved Desktop Monitor Chassis */}
              <Link
                href="/arena"
                prefetch={false}
                title="Click to enter Live 1v1 Battle Arena"
                style={{
                  transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transformStyle: 'preserve-3d',
                }}
                className="block relative rounded-2xl sm:rounded-3xl p-1 sm:p-1.5 bg-gradient-to-b from-slate-600/60 via-slate-800/80 to-slate-950 border border-slate-700/80 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(245,158,11,0.2)] hover:shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_70px_rgba(245,158,11,0.35)] transition-all duration-300 group cursor-pointer overflow-hidden"
              >
                {/* Curved Screen Glass Reflection Sheen (Authentic Physical Hardware Look) */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none z-30 rounded-2xl" />

                {/* Inner Screen Bezel & Display Matrix */}
                <div className="relative rounded-xl sm:rounded-2xl bg-[#090d16] border border-slate-800/90 overflow-hidden flex flex-col">
                  
                  {/* ================= MONITOR HEADER BAR ================= */}
                  <div className="h-10 sm:h-11 bg-[#0d121f] px-3.5 sm:px-4 flex items-center justify-between border-b border-slate-800/80 select-none">
                    {/* Left Icon & Duel Room Code */}
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-800/60 text-slate-400">
                        <Menu className="w-3.5 h-3.5" />
                      </div>
                      <span className="hidden sm:inline text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
                        1v1 SPEED DUEL
                      </span>
                    </div>

                    {/* Center: Realtime Duel HUD (ZenCoder 96  VS  84 CodeRex) */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Left Player Profile */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">ZenCoder</span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[10px] sm:text-[11px] font-mono font-black text-cyan-300">
                          96
                        </span>
                      </div>

                      {/* Glowing VS Badge & Timer */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-mono font-black text-amber-400 px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                          {formatTimer(matchSeconds)}
                        </span>
                        <span className="font-black font-mono text-xs sm:text-sm tracking-wider bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                          VS
                        </span>
                      </div>

                      {/* Right Player Profile */}
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-[10px] sm:text-[11px] font-mono font-black text-amber-300">
                          84
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">CodeRex</span>
                      </div>
                    </div>

                    {/* Right: Live Telemetry Indicator (● 12.4K Online) */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] sm:text-[11px] font-mono text-emerald-300 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>12.4K Online</span>
                    </div>
                  </div>

                  {/* ================= DUAL SPLIT-SCREEN CODE BATTLEFIELD ================= */}
                  <div className="grid grid-cols-2 divide-x divide-slate-800/80 bg-[#06080e] min-h-[290px] sm:min-h-[350px] font-mono text-[11px] sm:text-[12px] leading-relaxed">
                    
                    {/* LEFT PANE: ZenCoder (Python / Active Speed) */}
                    <div className="p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
                      <div>
                        {/* Editor Tab Bar */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[10px] sm:text-[11px] text-slate-400 select-none">
                          <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            Python 3
                          </span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {leftTests}/3 Tests Passed
                          </span>
                        </div>

                        {/* Live Syntax-Highlighted Code with Blinking Cursor */}
                        <pre className="text-slate-300 font-mono overflow-x-hidden whitespace-pre-wrap">
                          <code>
                            {leftCodeFull.slice(0, leftTypedLength)}
                            <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-0.5 align-middle" />
                          </code>
                        </pre>
                      </div>

                      {/* Bottom Status Ticker */}
                      <div className="pt-2 mt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-cyan-400/90 font-mono flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-bounce" />
                          78 WPM • Fog of War Protected
                        </span>
                        <span className="text-emerald-400 font-semibold">Passes 100%</span>
                      </div>
                    </div>

                    {/* RIGHT PANE: CodeRex (C++ / Rival Solver) */}
                    <div className="p-3 sm:p-4 flex flex-col justify-between overflow-hidden bg-[#070912]">
                      <div>
                        {/* Editor Tab Bar */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[10px] sm:text-[11px] text-slate-400 select-none">
                          <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            C++ 20
                          </span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-amber-400" />
                            {rightTests}/3 Tests Passed
                          </span>
                        </div>

                        {/* Live Syntax-Highlighted Code for Right Challenger */}
                        <pre className="text-slate-300 font-mono overflow-x-hidden whitespace-pre-wrap">
                          <code>
                            {rightCodeFull.slice(0, rightTypedLength)}
                            <span className="inline-block w-1.5 h-3.5 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                          </code>
                        </pre>
                      </div>

                      {/* Bottom Status Ticker */}
                      <div className="pt-2 mt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-slate-400 font-mono flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-slate-400" />
                          64 WPM • Memory 8.4 MB
                        </span>
                        <span className="text-amber-400 font-semibold">Compiling...</span>
                      </div>
                    </div>
                  </div>

                  {/* Monitor Bottom Glow Footprint */}
                  <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 opacity-60" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          BOTTOM DOCK BAR: REAL-TIME STATS & SOCIAL PROOF PILL
          Matches Image 6 specification with high-impact collegiate validation
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 w-full max-w-[1400px] mx-auto mt-8 sm:mt-12"
      >
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          
          {/* Feature Pill 1: Real-time Coding Battle */}
          <Link
            href="/arena"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-mono text-slate-200 transition-all hover:scale-105 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Real-time Coding Battle</span>
          </Link>

          {/* Feature Pill 2: Global Leaderboard */}
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-mono text-slate-200 transition-all hover:scale-105 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Leaderboard</span>
          </Link>

          {/* Feature Pill 3: Play with Friends */}
          <Link
            href="/arena?action=create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-xs sm:text-sm font-mono text-slate-200 transition-all hover:scale-105 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Play with Friends</span>
          </Link>

          {/* Social Proof: 3 Student Avatars + 10K students battling */}
          <div className="flex items-center gap-2.5 pl-2 pr-4 py-1">
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
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-300 tracking-tight">
              <strong className="text-amber-400 font-bold">+10K</strong> students are battling right now!
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
