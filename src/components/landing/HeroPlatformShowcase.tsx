'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Trophy,
  Sparkles,
  Shield,
  ArrowRight,
  Code2,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  GraduationCap,
} from 'lucide-react';

export function HeroPlatformShowcase() {
  const [activeTab, setActiveTab] = useState<'squads' | 'icpc' | 'spark' | 'proof'>('squads');

  const tabs = [
    { id: 'squads' as const, label: 'Hackathon Squads', icon: Users, accent: 'text-amber-500' },
    { id: 'icpc' as const, label: 'ICPC Arena', icon: Trophy, accent: 'text-cyan-400' },
    { id: 'spark' as const, label: 'AI Spark', icon: Sparkles, accent: 'text-orange-400' },
    { id: 'proof' as const, label: 'Verified Proof', icon: Shield, accent: 'text-emerald-400' },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none select-none">
      {/* Ambient Glows */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Official 3D Kollabrix Emblem Badge */}
      <div className="absolute -top-5 -right-4 z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-950/90 border border-stone-800 shadow-xl backdrop-blur-md">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-900 border border-amber-500/30 flex items-center justify-center shrink-0">
          <img src="/brand/kollabrix-icon.png" alt="Kollabrix 3D Emblem" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">KOLLABRIX</span>
          <span className="text-[9px] text-stone-400 font-medium">3D Modular Nexus</span>
        </div>
      </div>

      {/* Main Glassmorphic Showcase Window */}
      <div className="relative z-10 rounded-3xl bg-stone-950/90 dark:bg-stone-950/95 border border-stone-800 shadow-2xl backdrop-blur-2xl overflow-hidden text-stone-100">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 border-b border-stone-800 flex items-center justify-between gap-3 bg-stone-900/60">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-mono text-stone-400 font-medium ml-2 hidden sm:inline-block">
              kollabrix.online/console
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>84 Colleges Live</span>
          </div>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="px-3 pt-3 pb-2 border-b border-stone-800/80 bg-stone-900/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-stone-800 text-white shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.accent}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="p-5 sm:p-6 min-h-[310px] flex flex-col justify-between">
          {/* TAB 1: SQUADS */}
          {activeTab === 'squads' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-1.5">
                    Smart India Hackathon • FinTech Track
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Squad: Team ZeroLeak
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Autonomous Fraud Detection with Zero-Knowledge Proofs
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-stone-900 text-stone-300 border border-stone-800">
                  3/4 Filled
                </span>
              </div>

              {/* Teammates Roster */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                    AK
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Aman K.</p>
                    <p className="text-[10px] text-amber-400 font-medium">Lead • IIT Delhi</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0">
                    SR
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">Sneha R.</p>
                    <p className="text-[10px] text-cyan-400 font-medium">ML • BITS Pilani</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-dashed border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    +1
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-300 truncate">DevOps Needed</p>
                    <p className="text-[10px] text-stone-400 font-medium">Docker / AWS</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>College Verified Roster</span>
                </div>
                <Link
                  href="/teammates"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  <span>Explore Squads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: ICPC ARENA */}
          {activeTab === 'icpc' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-1.5">
                    Proctored Arena • Live Contest #14
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Collegiate Algorithmic Sprint
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Secure contest mode with real-time judge and automated anti-cheat
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  01:42:18 Left
                </span>
              </div>

              {/* Proctor Security Badges */}
              <div className="p-3 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Proctor Security Checkpoint
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">100% SECURE</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-stone-300">
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-center">
                    Fullscreen Locked
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-center">
                    AI WebCam Active
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-center">
                    Zero Tab-Switch
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800/80">
                <span className="text-xs font-mono text-stone-400">Languages: C++20, Python, Java</span>
                <Link
                  href="/icpc"
                  className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  <span>Enter ICPC Arena</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: AI SPARK */}
          {activeTab === 'spark' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-orange-500/10 text-orange-400 border border-orange-500/30 mb-1.5">
                    AI Spark Generator
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Instant Hackathon Blueprint
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Synthesize full-stack architecture, milestones & pitch scripts in seconds
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/30">
                  ⚡ 0.04s
                </span>
              </div>

              {/* Output Preview */}
              <div className="p-3 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-stone-300 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-orange-400" />
                  <span>Synthesized Architecture:</span>
                </div>
                <div className="p-2 rounded-lg bg-stone-950 font-mono text-[11px] text-stone-300 space-y-1">
                  <p className="text-amber-400 font-semibold">➜ Next.js 14 + Tailwind + Supabase RLS</p>
                  <p className="text-cyan-400">➜ FastEmbed Semantic Search Vector Engine</p>
                  <p className="text-emerald-400">➜ Cryptographic Proof-of-Work Certificates</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800/80">
                <span className="text-xs text-stone-400">Free for all university builders</span>
                <Link
                  href="/spark"
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300"
                >
                  <span>Launch AI Spark</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFIED PROOF */}
          {activeTab === 'proof' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1.5">
                    Proof-of-Work Protocol
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Cryptographic Engineering Proof
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tamper-proof verifiable credentials signed by collegiate mentors
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  SHA-256
                </span>
              </div>

              {/* Certificate Snapshot */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-900/90 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">
                    Official Collegiate Certificate
                  </p>
                  <p className="text-xs font-bold text-white">
                    Smart India Hackathon • 1st Place Champion
                  </p>
                  <p className="text-[10px] text-stone-400 font-mono truncate">
                    ID: KBX-2026-9F83D2 • Verified On-Chain
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800/80">
                <span className="text-xs text-stone-400">Shareable to LinkedIn & Resumes</span>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Verify Work</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
