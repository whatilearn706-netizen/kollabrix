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

// =========================================================================
// SIMULTANEOUS 1V1 COMPETITIVE PROGRAMMING DUEL ENGINE
// Both coders type code concurrently in real-time, racing for the knockout.
// Dynamic alternating/random winner cycle (Left -> Right -> Left -> Right -> Right...)
// Static module-level constants to guarantee rock-solid timer & effect stability.
// =========================================================================
const DUEL_PROBLEMS = [
  {
    title: 'Two Sum',
    pyFile: 'two_sum.py',
    cppFile: 'two_sum.cpp',
    py: [
      'def two_sum(nums, target):',
      '    seen = {}',
      '    for i, n in enumerate(nums):',
      '        if target - n in seen:',
      '            return [seen[target - n], i]',
      '        seen[n] = i',
    ],
    cpp: [
      'vector<int> solve(vector<int>& v, int t) {',
      '    unordered_map<int, int> m;',
      '    for (int i = 0; i < v.size(); i++) {',
      '        if (m.count(t - v[i])) return {m[t-v[i]], i};',
      '        m[v[i]] = i;',
      '    }',
      '}',
    ],
  },
  {
    title: 'Max Subarray',
    pyFile: 'kadane.py',
    cppFile: 'kadane.cpp',
    py: [
      'def max_sub(nums):',
      '    curr = best = nums[0]',
      '    for x in nums[1:]:',
      '        curr = max(x, curr + x)',
      '        best = max(best, curr)',
      '    return best',
    ],
    cpp: [
      'int maxSub(vector<int>& nums) {',
      '    int cur = nums[0], best = nums[0];',
      '    for (int i = 1; i < nums.size(); i++) {',
      '        cur = max(nums[i], cur + nums[i]);',
      '        best = max(best, cur);',
      '    }',
      '    return best;',
      '}',
    ],
  },
  {
    title: 'Valid Parentheses',
    pyFile: 'valid_parens.py',
    cppFile: 'valid_parens.cpp',
    py: [
      'def is_valid(s):',
      '    stk, m = [], {")": "(", "}": "{", "]": "["}',
      '    for c in s:',
      '        if c in m:',
      '            if not stk or stk.pop() != m[c]: return False',
      '        else: stk.append(c)',
      '    return not stk',
    ],
    cpp: [
      'bool isValid(string s) {',
      '    stack<char> st;',
      '    for (char c : s) {',
      '        if (c == \'(\' || c == \'{\') st.push(c);',
      '        else if (st.empty() || st.top() != c) return false;',
      '        else st.pop();',
      '    }',
      '    return st.empty();',
      '}',
    ],
  },
];

// Alternating / unpredictable winner sequence so it feels 100% human and live
const WINNER_SEQUENCE: ('left' | 'right')[] = [
  'left',
  'right',
  'left',
  'right',
  'right',
  'left',
  'left',
  'right',
];

const sliceCodeLines = (lines: string[], charCount: number) => {
  return lines.join('\n').slice(0, charCount).split('\n');
};

// Robust line syntax highlighter
const renderCodeTokens = (line: string, lang: 'py' | 'cpp') => {
  if (!line) return '';
  const tokenRegex =
    lang === 'py'
      ? /\b(def|return|for|in|if|else|not|and|or)\b|\b(two_sum|max_sub|is_valid|enumerate|max)\b|(\d+)|([{}()[\],:;.<>|&+\-*\/!=%])|([a-zA-Z_]\w*)|(\s+)|(.)/g
      : /\b(vector|int|unordered_map|return|for|if|else|bool|string|stack|auto)\b|\b(solve|maxSub|isValid|count|size|max|push|pop|empty)\b|(\d+)|([{}()[\],:;.<>|&+\-*\/!=%])|([a-zA-Z_]\w*)|(\s+)|(.)/g;

  const parts: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenRegex.exec(line)) !== null) {
    const [full, kw, fn, num, punct, ident] = match;
    if (kw) {
      parts.push(
        <span key={key++} className="text-pink-400 font-bold">
          {kw}
        </span>
      );
    } else if (fn) {
      parts.push(
        <span key={key++} className="text-amber-300 font-medium">
          {fn}
        </span>
      );
    } else if (num) {
      parts.push(
        <span key={key++} className="text-purple-300">
          {num}
        </span>
      );
    } else if (punct) {
      parts.push(
        <span key={key++} className="text-slate-400">
          {punct}
        </span>
      );
    } else if (ident) {
      parts.push(
        <span
          key={key++}
          className={lang === 'py' ? 'text-cyan-200' : 'text-purple-200'}
        >
          {ident}
        </span>
      );
    } else {
      parts.push(<span key={key++}>{full}</span>);
    }
  }

  return parts.length > 0 ? parts : line;
};

export function LandingHero() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);

  // Live 3D cursor tilt on the physical centered MacBook for authentic Awwwards depth
  const [tilt, setTilt] = useState({ x: 0, y: -2 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: xPct * 7, // Subtle interactive 3D yaw rotation (-3.5deg to +3.5deg)
      y: -2 - yPct * 4, // Subtle interactive 3D pitch rotation
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: -2 });
  };

  const [timerSeconds, setTimerSeconds] = useState(172); // 02:52 match clock
  const [roundCount, setRoundCount] = useState(0);
  const [roundPhase, setRoundPhase] = useState<'duel' | 'win'>('duel');
  const [currentWinner, setCurrentWinner] = useState<'left' | 'right'>('left');
  const [adityaChars, setAdityaChars] = useState(0);
  const [rohanChars, setRohanChars] = useState(0);
  const [adityaPassedTests, setAdityaPassedTests] = useState(false);
  const [rohanPassedTests, setRohanPassedTests] = useState(false);
  const [adityaElo, setAdityaElo] = useState(1480);
  const [rohanElo, setRohanElo] = useState(1420);

  const currentProblem = DUEL_PROBLEMS[roundCount % DUEL_PROBLEMS.length];

  // Match clock ticking continuously
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev <= 10 ? 172 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Continuous simultaneous dual coding timeloop
  useEffect(() => {
    const winnerThisRound = WINNER_SEQUENCE[roundCount % WINNER_SEQUENCE.length];
    setCurrentWinner(winnerThisRound);
    setRoundPhase('duel');
    setAdityaChars(0);
    setRohanChars(0);
    setAdityaPassedTests(false);
    setRohanPassedTests(false);

    const problem = DUEL_PROBLEMS[roundCount % DUEL_PROBLEMS.length];
    const pyTotal = problem.py.join('\n').length;
    const cppTotal = problem.cpp.join('\n').length;

    const DUEL_MS = 7500;
    const CELEBRATE_MS = 3500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < DUEL_MS) {
        // Active duel: BOTH are typing concurrently in real-time!
        const progress = elapsed / DUEL_MS;

        // Winner finishes at ~92% of duel time; runner-up finishes ~82% of code
        const leftTarget = winnerThisRound === 'left' ? 1.0 : 0.82;
        const rightTarget = winnerThisRound === 'right' ? 1.0 : 0.82;

        const leftPct = Math.min(1.0, progress * (1.0 / 0.90) * leftTarget);
        const rightPct = Math.min(1.0, progress * (1.0 / 0.90) * rightTarget);

        setAdityaChars(Math.floor(leftPct * pyTotal));
        setRohanChars(Math.floor(rightPct * cppTotal));

        // When winner finishes tests just before knockout call
        if (elapsed > DUEL_MS - 800) {
          if (winnerThisRound === 'left') setAdityaPassedTests(true);
          else setRohanPassedTests(true);
        }
      } else if (elapsed < DUEL_MS + CELEBRATE_MS) {
        // Celebration phase
        setRoundPhase('win');
        if (winnerThisRound === 'left') {
          setAdityaChars(pyTotal);
          setAdityaPassedTests(true);
        } else {
          setRohanChars(cppTotal);
          setRohanPassedTests(true);
        }
      } else {
        // Round concluded -> advance to next round!
        clearInterval(interval);
        if (winnerThisRound === 'left') {
          setAdityaElo((prev) => prev + 24);
        } else {
          setRohanElo((prev) => prev + 26);
        }
        setRoundCount((prev) => prev + 1);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [roundCount]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const adityaRendered = sliceCodeLines(currentProblem.py, adityaChars);
  const rohanRendered = sliceCodeLines(currentProblem.cpp, rohanChars);
  const adityaLinesPadded = Array.from({ length: 5 }, (_, i) => adityaRendered[i] || '');
  const rohanLinesPadded = Array.from({ length: 5 }, (_, i) => rohanRendered[i] || '');
  const adityaActiveLine = Math.min(4, Math.max(0, adityaRendered.length - 1));
  const rohanActiveLine = Math.min(4, Math.max(0, rohanRendered.length - 1));

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  // Do NOT fade out while in the hero viewport; only gently dim when exiting at the very bottom
  const contentOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0.4]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-center pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-14 overflow-hidden bg-black text-white select-none"
    >
      {/* =========================================================================
          CLEAN DARK OBSIDIAN STUDIO BACKGROUND (Apple / Linear Ultra-Minimalist Style)
         ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-black">
        {/* Subtle Warm Amber Glow Centered above Headline */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.10),transparent_70%)] blur-[120px] pointer-events-none" />

        {/* Subtle Cyan / Electric Atmosphere behind Centered 3D MacBook */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-[880px] h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),rgba(99,102,241,0.03),transparent_70%)] blur-[140px] pointer-events-none" />

        {/* Soft Radial Vignette for Contrast */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black pointer-events-none" />

        {/* Top & Bottom Cinematic Dissolves */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />
      </div>

      {/* =========================================================================
          MAIN HERO CONTAINER (Centered Architecture)
         ========================================================================= */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[1440px] mx-auto flex-1 flex flex-col items-center justify-start text-center my-auto"
      >
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

        {/* Monolithic Single-Row Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.8rem] font-black tracking-tight leading-tight select-none text-center max-w-[1400px] px-2"
        >
          <span className="inline lg:whitespace-nowrap bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            Where Reputations Are Proven{' '}
          </span>
          <span className="inline lg:whitespace-nowrap bg-gradient-to-r from-amber-200 via-amber-400 to-[#FF7A00] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,122,0,0.55)]">
            In Seconds.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
        >
          No resume fluff. No fake GitHub stars. Real-time 1v1 code combat under fog-of-war proctoring. Step into the arena and defend your campus.
        </motion.p>

        {/* Action Buttons: Start Battle & Challenge a Friend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4"
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
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400"
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

        {/* ================= CENTERED PHOTOREALISTIC AWWWARDS MACBOOK (ELEVATED 3D STAGE) ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="relative z-20 w-full max-w-[920px] xl:max-w-[1000px] -mt-2 sm:-mt-6 transition-transform duration-300 ease-out mx-auto"
          style={{
            perspective: '1400px',
          }}
        >
          {/* ================= 3D STAGE ELEVATION & BACKLIGHTING ================= */}
          {/* A. Dark Ambient Stage Shield: Creates soft depth separation behind the laptop */}
          <div className="absolute -inset-6 sm:-inset-10 bg-radial-gradient from-black/95 via-black/75 to-transparent rounded-[48px] blur-2xl pointer-events-none -z-10" />

          {/* B. Dual Luminous Rim Backlight: Illuminates the MacBook lid from behind in cyan & amber */}
          <div className="absolute -top-10 sm:-top-16 left-1/2 -translate-x-1/2 w-[78%] h-36 bg-gradient-to-b from-cyan-500/25 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute -top-4 sm:-top-8 left-1/2 -translate-x-1/2 w-[55%] h-24 bg-gradient-to-b from-amber-400/20 via-orange-500/5 to-transparent rounded-full blur-2xl pointer-events-none -z-10" />

          {/* C. Physical Ground Contact Shadow & Stage Elevation: Creates real physical separation from the background */}
          <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 w-[92%] h-14 bg-black/95 rounded-[100%] blur-2xl pointer-events-none -z-10" />
          <div className="absolute -bottom-3 sm:-bottom-5 left-1/2 -translate-x-1/2 w-[75%] h-6 bg-black/90 rounded-[100%] blur-md pointer-events-none -z-10" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[55%] h-3 bg-cyan-400/20 rounded-full blur-sm pointer-events-none -z-10" />

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
            <div className="absolute left-[11.91%] top-[17.06%] w-[76.07%] h-[53.25%] overflow-hidden bg-[#06080e] flex flex-col select-none rounded-t-[4px] shadow-inner text-left z-10">
                  
                  {/* Top HUD: Brand & Live Match Clock */}
                  <div className="h-7 sm:h-9 bg-[#0b0e17] px-2.5 sm:px-3.5 flex items-center justify-between border-b border-neutral-800 text-[10px] sm:text-xs font-mono select-none z-10">
                    <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                      <span className="text-amber-400 font-black">▲</span>
                      <span>KOLLABRIX</span>
                      <span className="text-neutral-600">/</span>
                      <span className="text-amber-400/90 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                        ROUND {roundCount + 1} • {currentProblem.title.toUpperCase()}
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
                    
                    {/* Centered VS Badge (Visible during active duels) */}
                    {roundPhase === 'duel' && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                        <span className="font-black font-mono text-sm sm:text-xl tracking-tighter bg-gradient-to-r from-cyan-400 via-white to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.95)] animate-pulse">
                          VS
                        </span>
                      </div>
                    )}

                    {/* DUAL SPLIT-SCREEN IDEs */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1 items-stretch">
                      
                      {/* ================= FIGHTER 1: Aditya Verma (IIT Delhi) ================= */}
                      <div className={`flex flex-col rounded-lg bg-[#0c0f18] border p-2 text-[10px] transition-all duration-300 ${
                        roundPhase === 'win' && currentWinner === 'left'
                          ? 'border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/30'
                          : 'border-neutral-800'
                      }`}>
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
                              <span className="text-[8px] sm:text-[9px] text-cyan-400 font-mono">IIT Delhi • {adityaElo}</span>
                            </div>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">{currentProblem.pyFile}</span>
                        </div>

                        {/* Code Body */}
                        <div className="flex-1 font-mono text-[9px] sm:text-[10px] leading-relaxed pt-1 flex gap-1.5 text-slate-300 overflow-hidden">
                          <div className="select-none text-neutral-600 text-right flex flex-col text-[8px] sm:text-[9px] w-3">
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">1</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">2</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">3</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">4</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">5</span>
                          </div>
                          <div className="flex-1 whitespace-pre overflow-hidden flex flex-col">
                            {adityaLinesPadded.map((line, i) => (
                              <div
                                key={i}
                                className="text-cyan-200 truncate h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px] flex items-center"
                              >
                                <span>{renderCodeTokens(line, 'py')}</span>
                                {i === adityaActiveLine && roundPhase === 'duel' && (
                                  <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse ml-0.5" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono pt-1">
                          {adityaPassedTests ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>✔ 3/3 Tests Passed (0.04s)</span>
                            </span>
                          ) : roundPhase === 'win' ? (
                            <span className="text-slate-400 font-medium">⚡ Tests Running (2/3 Passed)</span>
                          ) : (
                            <span className="text-slate-400">⚡ Typing at 128 WPM...</span>
                          )}
                        </div>
                      </div>

                      {/* ================= FIGHTER 2: Rohan Sharma (DTU Delhi) ================= */}
                      <div className={`flex flex-col rounded-lg bg-[#0c0f18] border p-2 text-[10px] transition-all duration-300 ${
                        roundPhase === 'win' && currentWinner === 'right'
                          ? 'border-purple-400/90 shadow-[0_0_20px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/30'
                          : 'border-neutral-800'
                      }`}>
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
                              <span className="text-[8px] sm:text-[9px] text-purple-400 font-mono">DTU Delhi • {rohanElo}</span>
                            </div>
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400">{currentProblem.cppFile}</span>
                        </div>

                        {/* Code Body */}
                        <div className="flex-1 font-mono text-[9px] sm:text-[10px] leading-relaxed pt-1 flex gap-1.5 text-slate-300 overflow-hidden">
                          <div className="select-none text-neutral-600 text-right flex flex-col text-[8px] sm:text-[9px] w-3">
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">1</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">2</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">3</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">4</span>
                            <span className="h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px]">5</span>
                          </div>
                          <div className="flex-1 whitespace-pre overflow-hidden flex flex-col">
                            {rohanLinesPadded.map((line, i) => (
                              <div
                                key={i}
                                className="text-purple-200 truncate h-[15px] sm:h-[16px] leading-[15px] sm:leading-[16px] flex items-center"
                              >
                                <span>{renderCodeTokens(line, 'cpp')}</span>
                                {i === rohanActiveLine && roundPhase === 'duel' && (
                                  <span className="inline-block w-1.5 h-3 bg-purple-400 animate-pulse ml-0.5" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono pt-1">
                          {rohanPassedTests ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>✔ 3/3 Tests Passed (0.03s)</span>
                            </span>
                          ) : roundPhase === 'win' ? (
                            <span className="text-slate-400 font-medium">⚡ Tests Running (2/3 Passed)</span>
                          ) : (
                            <span className="text-slate-400">⚡ Typing at 122 WPM...</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* OVERLAY KNOCKOUT VICTORY BANNER (Dynamic winner alternation) */}
                    {roundPhase === 'win' && currentWinner === 'left' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-amber-950/95 via-black to-amber-950/95 border border-amber-400/80 rounded-md p-2 flex items-center justify-between text-[9px] sm:text-xs z-30 shadow-[0_0_25px_rgba(245,158,11,0.5)] backdrop-blur-md"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                          <span>🏆 ROUND {roundCount + 1} KNOCKOUT: Aditya Verma (IIT Delhi) WINS! (+24 ELO)</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{adityaElo + 24} ELO</span>
                      </motion.div>
                    )}

                    {roundPhase === 'win' && currentWinner === 'right' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute inset-x-2 bottom-2 bg-gradient-to-r from-purple-950/95 via-black to-purple-950/95 border border-purple-400/80 rounded-md p-2 flex items-center justify-between text-[9px] sm:text-xs z-30 shadow-[0_0_25px_rgba(168,85,247,0.5)] backdrop-blur-md"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-purple-300">
                          <Swords className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                          <span>⚔️ ROUND {roundCount + 1} KNOCKOUT: Rohan Sharma (DTU) COUNTERS! (+26 ELO)</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{rohanElo + 26} ELO</span>
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
      </motion.div>
    </section>
  );
}
