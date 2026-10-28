'use client';

import React from 'react';
import Link from 'next/link';
import { GitMerge, Sparkles, Trophy, Package, Rocket, ArrowRight } from 'lucide-react';

export function ConnectionBeamsSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-800/80 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <GitMerge className="w-3.5 h-3.5" />
            <span>Collegiate Talent Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white site-heading-white tracking-tight">
            Animated Connection Beams Flow Graph
          </h2>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: '#A8A29E' }}>
            Visualizing how disparate campus talents route through the Kollabrix AI Matching Core into championship hackathons and funded capstones.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Real-time Synergy Synthesis</span>
        </div>
      </div>

      {/* Graph Visual Canvas */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1C1916] to-[#12100E] border border-stone-800/80 hover:border-amber-500/30 p-6 sm:p-10 relative overflow-hidden min-h-[420px] flex items-center shadow-2xl transition-all">
        
        {/* Glow backdrop */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-500/10 blur-[90px] pointer-events-none" />

        {/* 3 Columns Layout */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-4 relative z-10">
          
          {/* Left Column: Student Roles */}
          <div className="space-y-4 max-w-sm mx-auto md:mx-0 w-full">
            <div className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>Student Talent Profiles</span>
            </div>

            <div className="bg-[#1C1916] border border-stone-800/90 hover:border-orange-500/40 p-3.5 rounded-xl flex items-center gap-3 shadow-lg transition-all">
              <span className="w-9 h-9 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs shrink-0 border border-orange-500/30">
                AI
              </span>
              <div>
                <div className="text-xs font-bold text-stone-100">ML & PyTorch Dev</div>
                <div className="text-[10px] text-stone-400 font-mono">IIT Bombay • 4th Year</div>
              </div>
            </div>

            <div className="bg-[#1C1916] border border-stone-800/90 hover:border-amber-500/40 p-3.5 rounded-xl flex items-center gap-3 shadow-lg transition-all">
              <span className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-500/30">
                UI
              </span>
              <div>
                <div className="text-xs font-bold text-stone-100">Design & Frontend</div>
                <div className="text-[10px] text-stone-400 font-mono">BITS Pilani • 3rd Year</div>
              </div>
            </div>

            <div className="bg-[#1C1916] border border-stone-800/90 hover:border-emerald-500/40 p-3.5 rounded-xl flex items-center gap-3 shadow-lg transition-all">
              <span className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                BE
              </span>
              <div>
                <div className="text-xs font-bold text-stone-100">Rust & Systems Dev</div>
                <div className="text-[10px] text-stone-400 font-mono">IIIT Hyderabad • 2nd Year</div>
              </div>
            </div>
          </div>

          {/* Center Column: Kollabrix Matching Engine */}
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#F59E0B] flex items-center justify-center shadow-[0_0_50px_rgba(234,88,12,0.45)] border-2 border-white/20 select-none">
              <div className="text-white">
                <div className="text-3xl font-black tracking-tight leading-none">KB</div>
                <div className="text-[9px] uppercase tracking-wider font-bold opacity-90 mt-1">Matching Core</div>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-orange-400/50 animate-ping pointer-events-none opacity-40" />
            </div>
            
            <div className="text-xs font-bold text-stone-200 mt-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Synergy Synthesis</span>
            </div>
            <p className="text-[11px] text-stone-400 max-w-[200px] mt-1 leading-relaxed">
              Cross-analyzes skill overlap, campus schedules & GitHub commitments
            </p>
          </div>

          {/* Right Column: Deliverables & Wins */}
          <div className="space-y-4 max-w-sm mx-auto md:mx-0 w-full">
            <div className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Team Deliverables</span>
            </div>

            <div className="bg-[#1C1916] border border-stone-800/90 hover:border-amber-500/40 p-3.5 rounded-xl flex items-center gap-3 shadow-lg transition-all">
              <span className="w-9 h-9 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0 border border-yellow-500/30">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-stone-100">Smart India Hackathon</div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold">1st Prize Winner • ₹1,00,000</div>
              </div>
            </div>

            <div className="bg-[#1C1916] border border-stone-800/90 hover:border-purple-500/40 p-3.5 rounded-xl flex items-center gap-3 shadow-lg transition-all">
              <span className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/30">
                <Package className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-stone-100">Open Source Capstone</div>
                <div className="text-[10px] text-stone-400 font-mono">1.4k GitHub Stars • Closer Kit</div>
              </div>
            </div>

            <div className="bg-[#1C1916] border border-stone-800/90 hover:border-blue-500/40 p-3.5 rounded-xl flex items-center gap-3 shadow-lg transition-all">
              <span className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/30">
                <Rocket className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold text-stone-100">YC / Campus Incubator</div>
                <div className="text-[10px] text-amber-400 font-mono font-bold">Pre-Seed Funded</div>
              </div>
            </div>
          </div>

        </div>

        {/* Animated Curved Energy Beams (Visible on md and up) */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 420"
          preserveAspectRatio="none"
        >
          {/* Left Beams: Connect left cards (x~310) to Center LO (x~444, y~210) */}
          <path
            d="M 310 100 C 380 100, 400 210, 444 210"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />
          <path
            d="M 310 210 L 444 210"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />
          <path
            d="M 310 320 C 380 320, 400 210, 444 210"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />

          {/* Right Beams: Connect Center LO (x~556, y~210) to right cards (x~690) */}
          <path
            d="M 556 210 C 600 210, 620 100, 690 100"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />
          <path
            d="M 556 210 L 690 210"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />
          <path
            d="M 556 210 C 600 210, 620 320, 690 320"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            className="animate-[dash_1.5s_linear_infinite]"
          />
        </svg>

      </div>
    </section>
  );
}
