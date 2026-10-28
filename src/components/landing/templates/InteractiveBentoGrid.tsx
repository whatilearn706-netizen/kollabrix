'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Flame,
  ShieldCheck,
  Code2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Terminal,
  Play,
  Check,
} from 'lucide-react';

export function InteractiveBentoGrid() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [outputResult, setOutputResult] = useState<string | null>(null);

  const handleRunMiniCode = () => {
    setIsRunning(true);
    setOutputResult(null);
    setTimeout(() => {
      setIsRunning(false);
      setOutputResult('Kollabrix: Team matched in 0.04s! Memory: 1.2MB');
    }, 450);
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-800/80 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Collegiate Innovation Core</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white site-heading-white tracking-tight">
            Engineered for Collegiate Builders.
          </h2>
          <p className="text-sm !text-stone-300 mt-1 max-w-2xl" style={{ color: '#D6D3D1' }}>
            Everything you need to assemble hackathon dream teams, compete with anti-cheat rigor, and ship verified software.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>100% Real-Time Live Matrix</span>
        </div>
      </div>

      {/* Bento Grid Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Team Matchmaking Radar (2 cols) */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-[#1C1916] to-[#141210] border border-stone-800/80 hover:border-amber-500/40 p-6 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-orange-500/15 text-orange-500 border border-orange-500/30">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold text-sm text-stone-100 block">Collegiate Matchmaking Radar</span>
                <span className="text-[11px] text-stone-400">Vectorized cross-campus pairing</span>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25 font-bold">
              14 Active Matches
            </span>
          </div>

          {/* Interactive Radar Simulation */}
          <div className="relative h-60 flex items-center justify-center my-3">
            <div className="absolute w-56 h-56 rounded-full border border-stone-800/80" />
            <div className="absolute w-44 h-44 rounded-full border border-stone-800/60" />
            <div className="absolute w-32 h-32 rounded-full border border-orange-500/20" />
            <div className="absolute w-20 h-20 rounded-full border border-orange-500/40 bg-orange-500/5" />

            {/* Radar sweep beam */}
            <div className="absolute w-56 h-56 rounded-full overflow-hidden animate-[spin_4s_linear_infinite] pointer-events-none opacity-75">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-amber-500/30 via-orange-500/10 to-transparent origin-bottom-right rounded-tl-full" />
            </div>

            {/* Central Core */}
            <div className="relative z-10 w-11 h-11 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#F59E0B] flex items-center justify-center shadow-[0_0_25px_rgba(234,88,12,0.6)] text-white font-black text-xs border border-white/30">
              LO
            </div>

            {/* Interactive Radar Pings / Student Avatars */}
            <Link
              href="/teammates"
              className="absolute top-6 left-12 flex items-center gap-2 bg-[#25211D]/95 border border-stone-700/80 hover:border-amber-500/60 px-3 py-1.5 rounded-full text-xs shadow-xl backdrop-blur-md transition-all hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold text-stone-200">Aarav K.</span>
              <span className="text-[10px] text-stone-400 font-mono">IIT D • PyTorch</span>
            </Link>

            <Link
              href="/teammates"
              className="absolute bottom-8 right-10 flex items-center gap-2 bg-[#25211D]/95 border border-stone-700/80 hover:border-amber-500/60 px-3 py-1.5 rounded-full text-xs shadow-xl backdrop-blur-md transition-all hover:scale-105"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-stone-200">Sneha M.</span>
              <span className="text-[10px] text-stone-400 font-mono">BITS • Next.js</span>
            </Link>

            <Link
              href="/teammates"
              className="absolute top-20 right-8 flex items-center gap-1.5 bg-[#25211D]/95 border border-stone-700/80 hover:border-amber-500/60 px-2.5 py-1 rounded-full text-[11px] shadow-xl backdrop-blur-md transition-all hover:scale-105"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="font-bold text-stone-200">Rohan S.</span>
              <span className="text-[9px] text-stone-400 font-mono">Rust / Solana</span>
            </Link>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-800/80 relative z-10">
            <span>AI analyzes 12 skill vectors + campus hackathon deadlines</span>
            <Link
              href="/teammates"
              className="text-orange-500 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors"
            >
              Auto-Match Teams <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Daily Streak & Freeze Flame */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1916] to-[#141210] border border-stone-800/80 hover:border-amber-500/40 p-6 flex flex-col justify-between shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">Daily Streak</span>
            <span className="text-xs bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-md border border-amber-500/25 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> 24 Days
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-b from-orange-500/20 to-transparent border border-orange-500/30 shadow-inner">
              <Flame className="w-12 h-12 text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <div className="text-3xl font-black text-stone-100 mt-3 tracking-tight">24-Day Streak</div>
            <p className="text-xs text-stone-400 mt-1">Collegiate Practice & Git Commits</p>
          </div>

          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-stone-800/90 text-xs">
            <span className="text-stone-400 font-medium">Streak Freeze Shield</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              2 Active 🛡️
            </span>
          </div>
        </div>

        {/* Card 3: Verified Student Credentials */}
        <div className="rounded-2xl bg-gradient-to-br from-[#1C1916] to-[#141210] border border-stone-800/80 hover:border-amber-500/40 p-6 flex flex-col justify-between shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">Trust Gate</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/25 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified EDU
            </span>
          </div>

          <div className="my-3 p-4 rounded-xl bg-gradient-to-tr from-stone-900 via-stone-800/90 to-stone-900 border border-amber-500/30 shadow-2xl relative overflow-hidden group-hover:border-amber-400/60 transition-all">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-300">
              <span className="tracking-widest font-mono">KOLLABRIX ID</span>
              <span className="text-amber-400">★★★★★</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-xs font-black text-white shadow-md">
                MG
              </div>
              <div>
                <div className="text-xs font-bold text-white">Mayank Goyal</div>
                <div className="text-[10px] text-stone-400 font-mono">B.Tech CS • Batch 2026</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-stone-400 pt-2 border-t border-stone-700/60">
              <span>COLLEGE: NIT / IIT</span>
              <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                VERIFIED <Check className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 text-center leading-relaxed">
            Spam-free collegiate network with verified institutional email authentication.
          </div>
        </div>

        {/* Card 4: Instant Code Sandbox (2 cols) */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-[#1C1916] to-[#141210] border border-stone-800/80 hover:border-amber-500/40 p-5 flex flex-col justify-between shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-xs font-mono text-stone-400 ml-2">quick_sort.cpp — Kollabrix Sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                C++20 GCC
              </span>
              <button
                onClick={handleRunMiniCode}
                disabled={isRunning}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold font-mono transition-all active:scale-95"
              >
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run'}</span>
              </button>
            </div>
          </div>

          <div className="bg-black/60 rounded-xl p-3 font-mono text-xs text-stone-300 leading-relaxed border border-stone-800/90 overflow-x-auto">
            <span className="text-purple-400">#include</span> <span className="text-emerald-400">&lt;iostream&gt;</span><br />
            <span className="text-purple-400">#include</span> <span className="text-emerald-400">&lt;vector&gt;</span><br />
            <span className="text-blue-400">int</span> <span className="text-yellow-400">main</span>() &#123;<br />
            &nbsp;&nbsp;<span className="text-stone-500">// Instant collegiate compiler execution</span><br />
            &nbsp;&nbsp;std::cout &lt;&lt; <span className="text-emerald-300">&quot;Kollabrix: Team matched in 0.04s!&quot;</span> &lt;&lt; std::endl;<br />
            &nbsp;&nbsp;<span className="text-blue-400">return</span> <span className="text-amber-400">0</span>;<br />
            &#125;
          </div>

          {outputResult && (
            <div className="mt-2 p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] animate-fade-in flex items-center justify-between">
              <span>{outputResult}</span>
              <span className="text-xs">⚡</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Execution: 4ms • Mem: 1.2MB
            </span>
            <Link
              href="/resources"
              className="text-orange-500 hover:text-amber-400 font-bold flex items-center gap-1"
            >
              Try In Hub <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 5: Closer Kit Project Deliverable Tracker (2 cols) */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-[#1C1916] to-[#141210] border border-stone-800/80 hover:border-amber-500/40 p-5 flex flex-col justify-between shadow-xl transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm text-stone-200">Closer Kit™ Capstone Framework</span>
            <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/25">
              84% Ready
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-stone-800/80 text-xs">
              <span className="flex items-center gap-2 text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Problem Statement Alignment
              </span>
              <span className="text-[10px] font-mono text-stone-400">Done</span>
            </div>

            <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-stone-800/80 text-xs">
              <span className="flex items-center gap-2 text-stone-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                GitHub Repo & Branch Protection
              </span>
              <span className="text-[10px] font-mono text-stone-400">Auto-Linked</span>
            </div>

            <div className="flex items-center justify-between bg-orange-500/10 p-2.5 rounded-lg border border-orange-500/30 text-xs">
              <span className="flex items-center gap-2 text-stone-200">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                Pitch Deck & Final Demo Video
              </span>
              <span className="text-[10px] font-mono text-orange-400 font-bold">In Progress</span>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 mt-2 text-right">
            Export verified university submission ZIP in 1-click.
          </div>
        </div>

      </div>
    </section>
  );
}
