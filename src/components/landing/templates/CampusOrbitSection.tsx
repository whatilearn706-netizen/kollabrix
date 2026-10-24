'use client';

import React from 'react';
import { Orbit, Sparkles } from 'lucide-react';

export function CampusOrbitSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-800/80 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Orbit className="w-3.5 h-3.5" />
            <span>Campus Talent Centrifuge</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white site-heading-white tracking-tight">
            Animated Tech-Stack & Campus Orbit
          </h2>
          <p className="text-sm !text-stone-300 mt-1 max-w-2xl" style={{ color: '#D6D3D1' }}>
            Concentric orbital spheres displaying student skills, software frameworks, and premier collegiate ecosystems revolving around the Linkora Matching Core.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>3-Tier Harmonic Rotation</span>
        </div>
      </div>

      {/* Orbit Canvas Container */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1C1916] to-[#12100E] border border-stone-800/80 hover:border-amber-500/30 p-8 sm:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[560px] shadow-2xl transition-all">
        
        {/* Ambient Warm Backlight */}
        <div className="absolute w-96 h-96 rounded-full bg-orange-600/10 blur-[100px] pointer-events-none" />

        {/* Central Glowing Linkora Sphere */}
        <div className="relative z-20 w-24 h-24 rounded-full bg-gradient-to-tr from-[#EA580C] via-[#F59E0B] to-[#FBBF24] flex items-center justify-center shadow-[0_0_60px_rgba(234,88,12,0.55)] border-2 border-white/40 select-none">
          <div className="text-center">
            <div className="text-white font-black text-xl tracking-tight leading-none drop-shadow-md">Linkora</div>
            <div className="text-[9px] text-amber-950 font-extrabold uppercase tracking-widest mt-1">Core Engine</div>
          </div>
        </div>

        {/* Orbit Ring 1 (Inner - diameter 190px) */}
        <div className="absolute w-[190px] h-[190px] rounded-full border border-dashed border-stone-700/80 animate-[spin_26s_linear_infinite] hover:[animation-play-state:paused] pointer-events-none">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1C1916] border border-orange-500/40 text-stone-200 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_26s_linear_infinite_reverse]">
            🐍 Python
          </div>
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-[#1C1916] border border-orange-500/40 text-stone-200 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_26s_linear_infinite_reverse]">
            ⚡ Rust
          </div>
          <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 bg-[#1C1916] border border-orange-500/40 text-stone-200 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_26s_linear_infinite_reverse]">
            ⚛️ React
          </div>
          <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 bg-[#1C1916] border border-orange-500/40 text-stone-200 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_26s_linear_infinite_reverse]">
            🔷 C++20
          </div>
        </div>

        {/* Orbit Ring 2 (Middle - diameter 300px) */}
        <div className="absolute w-[300px] h-[300px] rounded-full border border-stone-800 animate-[spin_36s_linear_infinite_reverse] hover:[animation-play-state:paused] pointer-events-none">
          <div className="absolute top-4 left-6 bg-[#181614] border border-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-medium shadow-md animate-[spin_36s_linear_infinite]">
            🔥 PyTorch
          </div>
          <div className="absolute bottom-5 right-6 bg-[#181614] border border-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-medium shadow-md animate-[spin_36s_linear_infinite]">
            🐳 Docker
          </div>
          <div className="absolute top-6 right-6 bg-[#181614] border border-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-medium shadow-md animate-[spin_36s_linear_infinite]">
            ▲ Next.js 15
          </div>
          <div className="absolute bottom-6 left-6 bg-[#181614] border border-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-medium shadow-md animate-[spin_36s_linear_infinite]">
            🟢 Node.js
          </div>
        </div>

        {/* Orbit Ring 3 (Outer - diameter 420px) */}
        <div className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-stone-800/60 animate-[spin_46s_linear_infinite] hover:[animation-play-state:paused] pointer-events-none">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_46s_linear_infinite_reverse]">
            🏛️ IIT Delhi
          </div>
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_46s_linear_infinite_reverse]">
            🎓 BITS Pilani
          </div>
          <div className="absolute top-1/2 -left-4 -translate-y-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_46s_linear_infinite_reverse]">
            🌐 NIT Trichy
          </div>
          <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-bold shadow-md animate-[spin_46s_linear_infinite_reverse]">
            🏆 Smart India Hackathon
          </div>
        </div>

        {/* Footer Statistics */}
        <div className="absolute bottom-5 left-0 right-0 text-center pointer-events-none px-4">
          <p className="text-xs text-stone-400 font-mono tracking-wide">
            Over <span className="text-amber-400 font-bold">4,800+</span> Collegiate Projects active across <span className="text-orange-400 font-bold">160+</span> universities.
          </p>
        </div>

      </div>
    </section>
  );
}
