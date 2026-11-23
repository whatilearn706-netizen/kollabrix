'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Play,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  Crown,
  Sparkles,
  Swords,
  ShieldCheck,
  Flame,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export function LandingHero() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);

  // Live 3D cursor tilt on the physical MacBook for authentic Awwwards depth
  const [tilt, setTilt] = useState({ x: -6, y: 2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: -6 + xPct * 8, // Subtle interactive 3D rotation
      y: 2 - yPct * 5,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: -6, y: 2 });
  };

  // =========================================================================
  // 3-MINUTE RIVALRY TIMELOOP DUEL ENGINE
  // Round 1: Aditya (IIT Delhi) wins -> Knockout -> Round 2 Rematch: Rohan (DTU) counters!
  // =========================================================================
  const [battlePhase, setBattlePhase] = useState<'round1_duel' | 'round1_win' | 'round2_duel' | 'round2_win'>('round1_duel');
  const [timerSeconds, setTimerSeconds] = useState(172); // 02:52
  const [adityaCodeIdx, setAdityaCodeIdx] = useState(0);
  const [rohanCodeIdx, setRohanCodeIdx] = useState(0);
  const [adityaPassedTests, setAdityaPassedTests] = useState(false);
  const [rohanPassedTests, setRohanPassedTests] = useState(false);

  // Code for Aditya (Python Solution)
  const adityaLines = [
    'def two_sum(nums, target):',
    '    seen = {}',
    '    for i, n in enumerate(nums):',
    '        if target - n in seen:',
    '            return [seen[target - n], i]',
    '        seen[n] = i',
  ];

  // Code for Rohan (C++ Solution)
  const rohanLines = [
    'vector<int> solve(vector<int>& v, int t) {',
    '    unordered_map<int,int> m;',
    '    for(int i=0; i<v.size(); i++) {',
    '        if(m.count(t - v[i])) return {m[t-v[i]], i};',
    '        m[v[i]] = i;',
    '    }',
  ];

  // Live ticking match clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev <= 10 ? 172 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Timeloop Stage Cycle
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;
    let t4: NodeJS.Timeout;

    // Start Round 1 Duel
    setBattlePhase('round1_duel');
    setAdityaPassedTests(false);
    setRohanPassedTests(false);
    setAdityaCodeIdx(0);
    setRohanCodeIdx(0);

    // After 10s: Aditya knocks out Round 1
    t1 = setTimeout(() => {
      setAdityaPassedTests(true);
      setBattlePhase('round1_win');

      // After 4s celebration: Start Round 2 Rematch (Rohan's revenge)
      t2 = setTimeout(() => {
        setBattlePhase('round2_duel');
        setAdityaPassedTests(false);
        setRohanPassedTests(false);
        setAdityaCodeIdx(0);
        setRohanCodeIdx(0);

        // After 10s: Rohan knocks out Round 2
        t3 = setTimeout(() => {
          setRohanPassedTests(true);
          setBattlePhase('round2_win');

          // After 4s celebration: Loop back to Round 1
          t4 = setTimeout(() => {
            setBattlePhase('round1_duel');
            setAdityaPassedTests(false);
            setRohanPassedTests(false);
            setAdityaCodeIdx(0);
            setRohanCodeIdx(0);
          }, 4000);
        }, 10000);
      }, 4000);
    }, 10000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Aditya typing animation
  useEffect(() => {
    const full = adityaLines.join('\n').length;
    const interval = setInterval(() => {
      setAdityaCodeIdx((prev) => {
        if (prev >= full) return full;
        return prev + 1;
      });
    }, 70);
    return () => clearInterval(interval);
  }, [adityaLines, battlePhase]);

  // Rohan typing animation
  useEffect(() => {
    const full = rohanLines.join('\n').length;
    const interval = setInterval(() => {
      setRohanCodeIdx((prev) => {
        if (prev >= full) return full;
        return prev + 1;
      });
    }, 85);
    return () => clearInterval(interval);
  }, [rohanLines, battlePhase]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const sliceCode = (lines: string[], length: number) => {
    return lines.join('\n').slice(0, length).split('\n');
  };

  const adityaRendered = sliceCode(adityaLines, adityaCodeIdx);
  const rohanRendered = sliceCode(rohanLines, rohanCodeIdx);

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
      className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-8 lg:px-14 overflow-hidden bg-black text-white select-none"
    >
      {/* =========================================================================
          LORENZO LOTTICI DARK CELESTIAL HORIZON BACKGROUND
          Distant monochromatic celestial sphere, foggy horizon, volumetric smoke
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-black">
        {/* Full-width Lorenzo Lottici Dark Celestial Horizon Backdrop */}
        <img
          src="/brand/hero-celestial-horizon-v3.webp"
          alt="Dark Celestial Horizon Atmosphere"
          className="w-full h-full object-cover object-center filter brightness-[1.05] contrast-[1.05]"
        />

        {/* Subtle Warm Amber Glow behind Headline */}
        <div className="absolute top-[22%] left-[4%] w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-full blur-[130px] pointer-events-none" />

        {/* Subtle Cyan / Electric Glow behind MacBook */}
        <div className="absolute top-[18%] right-[8%] w-[650px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-indigo-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

        {/* Left Side Ambient Vignette for 100% Vector Headline Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 md:via-black/35 to-transparent pointer-events-none" />

        {/* Top & Bottom Cinematic Dissolves */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          MAIN HERO CONTAINER
         ========================================================================= */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[1600px] mx-auto flex-1 flex flex-col justify-center my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: MONOLITHIC EDITORIAL HEADLINE ================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center text-left">
            
            {/* Live Campus Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-4 sm:mb-5"
            >
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/35 bg-[#0e1017]/90 hover:bg-[#151926] text-amber-400 text-xs sm:text-sm font-mono tracking-tight shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all cursor-pointer backdrop-blur-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-200">1v1 Proctored Code Combat</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] ml-1 animate-pulse" />
              </Link>
            </motion.div>

            {/* Monolithic Headline: Where Reputations Are Proven In Seconds. */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-[4.8rem] xl:text-[5.4rem] font-black tracking-tight leading-[0.94] text-white select-none"
            >
              <span className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">Where</span>
              <span className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">Reputations</span>
              <span className="block drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">Are Proven</span>
              <span className="block bg-gradient-to-r from-[#FF7A00] via-[#FF9E00] to-[#FFB800] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,122,0,0.45)]">
                In Seconds.
              </span>
            </motion.h1>

            {/* High-Status Ego Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
            >
              No resume fluff. No fake GitHub stars. Real-time 1v1 code combat under fog-of-war proctoring. Step into the arena and defend your campus.
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

            {/* Verified Campus Battle Badges */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-7 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Cheating Fog of War</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>0.04s Sandboxed Exec</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Campus ELO</span>
              </div>
            </motion.div>
          </div>

          {/* ================= RIGHT COLUMN: PHOTOREALISTIC AWWWARDS MACBOOK (LORENZO LOTTICI STYLE) ================= */}
          <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center lg:justify-end relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="w-full max-w-[920px] transition-transform duration-300 ease-out"
              style={{
                perspective: '1400px',
              }}
            >
              {/* Interactive 3D Cursor Tilt Container */}
              <Link
                href="/arena"
                prefetch={false}
                title="Click to enter 1v1 Battle Arena"
                style={{
                  transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transformStyle: 'preserve-3d',
                }}
                className="block relative w-full aspect-[1024/768] transition-all duration-300 group cursor-pointer"
              >
                {/* 1. PHYSICAL MACBOOK DISPLAY: LIVE 3-MINUTE BATTLE TIMELOOP */}
                <div className="absolute left-[11.91%] top-[17.06%] w-[76.07%] h-[53.25%] overflow-hidden bg-[#06080e] flex flex-col select-none rounded-t-[4px] shadow-inner">
                  
                  {/* Top HUD: Brand & Live Match Clock */}
                  <div className="h-7 sm:h-9 bg-[#0b0e17] px-2.5 sm:px-3.5 flex items-center justify-between border-b border-neutral-800 text-[10px] sm:text-xs font-mono select-none z-10">
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                      <span className="text-amber-400 font-black">▲</span>
                      <span>KOLLABRIX</span>
                      <span className="text-neutral-600">/</span>
                      <span className="text-amber-400/90 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                        1v1 DUEL
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black border border-neutral-800 text-cyan-300 text-[10px] sm:text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                      <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>{formatTimer(timerSeconds)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="hidden sm:inline">LIVE</span>
                    </div>
                  </div>

                  {/* ARENA STAGE (DUAL SPLIT IDE OR KNOCKOUT WINNER BANNER) */}
                  <div className="relative flex-1 bg-[#05070d] p-2 sm:p-3 overflow-hidden flex flex-col justify-between">
                    
                    {/* Centered VS Badge (Visible during duels) */}
                    {(battlePhase === 'round1_duel' || battlePhase === 'round2_duel') && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                        <span className="font-black font-mono text-sm sm:text-xl tracking-tighter bg-gradient-to-r from-cyan-400 via-white to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.95)] animate-pulse">
                          VS
                        </span>
                      </div>
                    )}

                    {/* DUAL SPLIT-SCREEN IDEs */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 items-stretch">
                      
                      {/* ================= FIGHTER 1: Aditya Verma (IIT Delhi • 1480 ELO) ================= */}
                      <div className={`flex flex-col rounded-lg bg-[#0c0f18] border p-2 text-[10px] transition-all duration-300 ${battlePhase === 'round1_win' ? 'border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'border-neutral-800'}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-neutral-800/80">
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces"
                                alt="Aditya Verma"
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-cyan-400/80 object-cover"
                              />
                              <Crown className="w-2.5 h-2.5 text-amber-400 fill-amber-400 absolute -top-1 -right-1" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-white leading-tight">Aditya Verma</span>
                              <span className="text-[8px] sm:text-[9px] text-cyan-400 font-mono">IIT Delhi • 1480</span>
                            </div>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">main.py</span>
                        </div>

                        {/* Code Body */}
                        <div className="flex-1 font-mono text-[9px] sm:text-[10px] leading-relaxed pt-1 flex gap-1.5 text-slate-300 overflow-hidden">
                          <div className="select-none text-neutral-600 text-right flex flex-col text-[8px] sm:text-[9px]">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                          </div>
                          <div className="flex-1 whitespace-pre overflow-hidden">
                            {adityaRendered.slice(0, 4).map((line, i) => (
                              <div key={i} className="text-cyan-200 truncate">
                                {line.includes('def') ? (
                                  <span>
                                    <span className="text-pink-400 font-bold">def </span>
                                    <span className="text-amber-300">two_sum</span>(n,t):
                                  </span>
                                ) : line.includes('return') ? (
                                  <span>
                                    &nbsp;&nbsp;<span className="text-pink-400">return </span>
                                    <span>[seen[t-n],i]</span>
                                  </span>
                                ) : (
                                  line
                                )}
                              </div>
                            ))}
                            <span className="inline-block w-1 h-2.5 bg-cyan-400 animate-pulse ml-0.5" />
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono pt-1">
                          {adityaPassedTests ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>✔ 3/3 Tests Passed (0.04s)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">⚡ Typing at 110 WPM...</span>
                          )}
                        </div>
                      </div>

                      {/* ================= FIGHTER 2: Rohan Sharma (DTU Delhi • 1420 ELO) ================= */}
                      <div className={`flex flex-col rounded-lg bg-[#0c0f18] border p-2 text-[10px] transition-all duration-300 ${battlePhase === 'round2_win' ? 'border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-neutral-800'}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-1 border-b border-neutral-800/80">
                          <div className="flex items-center gap-1.5">
                            <img
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=faces"
                              alt="Rohan Sharma"
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-purple-400/80 object-cover"
                            />
                            <div className="flex flex-col">
                              <span className="text-[10px] sm:text-xs font-bold text-white leading-tight">Rohan Sharma</span>
                              <span className="text-[8px] sm:text-[9px] text-purple-400 font-mono">DTU Delhi • 1420</span>
                            </div>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">solve.cpp</span>
                        </div>

                        {/* Code Body */}
                        <div className="flex-1 font-mono text-[9px] sm:text-[10px] leading-relaxed pt-1 flex gap-1.5 text-slate-300 overflow-hidden">
                          <div className="select-none text-neutral-600 text-right flex flex-col text-[8px] sm:text-[9px]">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                          </div>
                          <div className="flex-1 whitespace-pre overflow-hidden">
                            {rohanRendered.slice(0, 4).map((line, i) => (
                              <div key={i} className="text-purple-200 truncate">
                                {line.includes('vector') ? (
                                  <span>
                                    <span className="text-pink-400">vector&lt;int&gt; </span>
                                    <span className="text-amber-300">solve</span>()
                                  </span>
                                ) : line.includes('return') ? (
                                  <span>
                                    &nbsp;&nbsp;<span className="text-pink-400">return </span>
                                    <span>m[t-v[i]]</span>
                                  </span>
                                ) : (
                                  line
                                )}
                              </div>
                            ))}
                            <span className="inline-block w-1 h-2.5 bg-purple-400 animate-pulse ml-0.5" />
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono pt-1">
                          {rohanPassedTests ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>✔ 3/3 Tests Passed (0.05s)</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">⚡ Typing at 95 WPM...</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* OVERLAY KNOCKOUT VICTORY BANNER (Alternates dynamically in the timeloop) */}
                    {battlePhase === 'round1_win' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-amber-950/90 via-black to-amber-950/90 border border-amber-400/80 rounded-md p-2 flex items-center justify-between text-[9px] sm:text-xs z-30 shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                          <span>🏆 ROUND 1 KNOCKOUT: Aditya Verma (IIT Delhi) WINS! (+24 ELO)</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">1504 ELO</span>
                      </motion.div>
                    )}

                    {battlePhase === 'round2_win' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-purple-950/90 via-black to-purple-950/90 border border-purple-400/80 rounded-md p-2 flex items-center justify-between text-[9px] sm:text-xs z-30 shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <Swords className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                          <span>⚔️ ROUND 2 REVENGE: Rohan Sharma (DTU) COUNTERS! (+22 ELO)</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">1442 ELO</span>
                      </motion.div>
                    )}

                  </div>
                </div>

                {/* 2. PHOTOREALISTIC MACBOOK HARDWARE FRAME (Awwwards Lorenzo Lottici Reference) */}
                <img
                  src="/brand/hero-macbook-lorenzo-v3.webp"
                  alt="Apple MacBook Pro Hardware Frame"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 drop-shadow-[0_40px_80px_rgba(0,0,0,0.98)]"
                />

                {/* 3. VOLUMETRIC SOFT SMOKE / MIST DRIFTING ACROSS BASE */}
                <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[85%] h-16 bg-gradient-to-t from-white/[0.04] via-slate-400/[0.02] to-transparent rounded-full blur-xl pointer-events-none z-30" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
