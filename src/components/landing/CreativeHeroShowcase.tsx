'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Users,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Clock,
  Code2,
  Zap,
} from 'lucide-react';

export function CreativeHeroShowcase() {
  const [activeCard, setActiveCard] = useState<'squad' | 'icpc' | 'proof'>('squad');

  return (
    <div className="relative w-full max-w-[580px] mx-auto select-none py-4">
      {/* Ambient Gradient Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-gradient-to-tr from-amber-500/25 via-orange-500/20 to-cyan-500/15 rounded-full blur-[80px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-0 w-[220px] h-[220px] bg-amber-400/20 rounded-full blur-[70px] pointer-events-none -z-10" />

      {/* Main Multi-Layered Floating Composition */}
      <div className="relative flex flex-col gap-4">

        {/* 1. CENTERPIECE CARD: The 3D Kollabrix Emblem & Live Collegiate Activity */}
        <div className="relative rounded-3xl p-6 bg-white/80 dark:bg-stone-900/80 border border-amber-500/25 dark:border-amber-500/20 shadow-[0_20px_50px_rgba(245,158,11,0.12)] backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(245,158,11,0.2)]">
          {/* Subtle Corner Ambient Mesh */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent rounded-bl-full pointer-events-none" />

          {/* Top Bar: Brand Identifier + Live Colleges Pulse */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg bg-stone-900 flex items-center justify-center shrink-0">
                <img
                  src="/brand/kollabrix-k.png?v=20261030k"
                  alt="Kollabrix 3D Emblem"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-stone-900 dark:text-white tracking-tight">
                    Kollabrix Network
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    v2.0
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  Inter-College Collaboration Core
                </p>
              </div>
            </div>

            {/* Live Indicator Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>84 Colleges Live</span>
            </div>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-4 p-1 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/50">
            <button
              type="button"
              onClick={() => setActiveCard('squad')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCard === 'squad'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm border border-stone-200/80 dark:border-stone-700'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Squad Match</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCard('icpc')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCard === 'icpc'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm border border-stone-200/80 dark:border-stone-700'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-cyan-500" />
              <span>ICPC Arena</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCard('proof')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCard === 'proof'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm border border-stone-200/80 dark:border-stone-700'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Proof-of-Work</span>
            </button>
          </div>

          {/* Dynamic Content Display Based on Active Tab */}
          {activeCard === 'squad' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    SMART INDIA HACKATHON • FINTECH
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 2h left
                  </span>
                </div>
                <h4 className="text-sm font-black text-stone-900 dark:text-white">
                  Squad: Team ZeroLeak
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
                  Zero-Knowledge Proofs for Fraud Prevention in UPI
                </p>

                {/* Team Members Roster */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-[10px] mx-auto flex items-center justify-center">
                      AK
                    </div>
                    <span className="text-[10px] font-bold block mt-1 text-stone-900 dark:text-white truncate">Aman K.</span>
                    <span className="text-[8px] text-stone-500 dark:text-stone-400 block truncate">IIT Delhi • Lead</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
                    <div className="w-6 h-6 rounded-full bg-cyan-500 text-white font-black text-[10px] mx-auto flex items-center justify-center">
                      SR
                    </div>
                    <span className="text-[10px] font-bold block mt-1 text-stone-900 dark:text-white truncate">Sneha R.</span>
                    <span className="text-[8px] text-stone-500 dark:text-stone-400 block truncate">BITS Pilani • ML</span>
                  </div>

                  <div className="p-2 rounded-xl border border-dashed border-amber-400/80 bg-amber-500/10 dark:bg-amber-500/5 text-center flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">+1 Needed</span>
                    <span className="text-[8px] text-amber-700 dark:text-amber-300 font-mono">DevOps / AWS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500 dark:text-stone-400 font-medium">
                  Looking for cross-college collaborators?
                </span>
                <Link
                  href="/hackathons"
                  className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1 group"
                >
                  <span>Explore Squads</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {activeCard === 'icpc' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/[0.03] border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    ACM-ICPC REGIONAL SPRINT #4
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE NOW
                  </span>
                </div>
                <h4 className="text-sm font-black text-stone-900 dark:text-white">
                  Problem C: Maximum Flow with Latency Constraints
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
                  Curated by Prof. Sharma • Evaluated on 14 Hidden Testcases
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-500" />
                    <span className="font-mono text-stone-800 dark:text-stone-200 font-bold">C++20 GCC</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">14/14 Passed • 4ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500 dark:text-stone-400 font-medium">
                  Speedrun programming contests
                </span>
                <Link
                  href="/icpc"
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center gap-1 group"
                >
                  <span>Enter ICPC Arena</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {activeCard === 'proof' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/[0.03] border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    TAMPER-PROOF VERIFIED CERTIFICATE
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    SHA-256 VERIFIED
                  </span>
                </div>
                <h4 className="text-sm font-black text-stone-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  National Hackathon Champion Credential
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 font-medium">
                  Cryptographically sealed with code repository commits & faculty signature.
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400 font-mono text-[10px]">KBX-2026-9F83D2</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">Shareable to LinkedIn</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500 dark:text-stone-400 font-medium">
                  Real proof of what you build
                </span>
                <Link
                  href="/explore"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
                >
                  <span>View Verified Projects</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 2. THREE FLOATING PILL STATS (Clean, Creative & Credible) */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 shadow-sm backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/25 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-stone-900 dark:text-white block">0.04s</span>
              <span className="text-[10px] text-stone-500 font-medium block">AI Architecture</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 shadow-sm backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-stone-900 dark:text-white block">Anti-Cheat</span>
              <span className="text-[10px] text-stone-500 font-medium block">ICPC Proctoring</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 shadow-sm backdrop-blur-md flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/25 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-stone-900 dark:text-white block">100% Free</span>
              <span className="text-[10px] text-stone-500 font-medium block">For Students</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
