'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Swords, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { playBattleSlamSound, playVoxelShatterSound } from '@/lib/arena/soundEffects';

interface CinematicArenaTransitionProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

export function CinematicArenaTransition({
  isActive,
  onAnimationComplete,
}: CinematicArenaTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'charging' | 'slam' | 'warp_out'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    // Play energy charge sound
    playVoxelShatterSound();
    setPhase('charging');

    // 650ms: Battle Slam
    const t1 = setTimeout(() => {
      playBattleSlamSound();
      setPhase('slam');
    }, 650);

    // 1450ms: Warp out into the battlefield
    const t2 = setTimeout(() => {
      setPhase('warp_out');
    }, 1450);

    // 1850ms: Complete and open Battle Arena Page
    const t3 = setTimeout(() => {
      onAnimationComplete();
    }, 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onAnimationComplete]);

  // Canvas particle lines
  useEffect(() => {
    if (!isActive || phase === 'idle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Ray lines streaming towards center
    const rays: { angle: number; speed: number; length: number; color: string; dist: number }[] = [];
    const colors = ['#06b6d4', '#f43f5e', '#38bdf8', '#fb7185', '#a855f7'];

    for (let i = 0; i < 40; i++) {
      rays.push({
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 8 + 6,
        length: Math.random() * 80 + 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        dist: Math.random() * (width / 2) + 100,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw streaming warp lines
      rays.forEach((r) => {
        r.dist -= r.speed;
        if (r.dist < 20) {
          r.dist = Math.random() * (width / 2) + 200;
        }

        const x1 = centerX + Math.cos(r.angle) * r.dist;
        const y1 = centerY + Math.sin(r.angle) * r.dist;
        const x2 = centerX + Math.cos(r.angle) * (r.dist + r.length);
        const y2 = centerY + Math.sin(r.angle) * (r.dist + r.length);

        ctx.strokeStyle = r.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, phase]);

  if (!isActive && phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center select-none bg-[#05070f]">
      {/* Background Cyber Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* 4 Corner High-Energy Conduits (Pulsing Neon Laser Accents) */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-500/20 via-cyan-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-rose-500/20 via-rose-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/20 via-cyan-500/5 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-rose-500/20 via-rose-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* Center Slamming Core */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center px-4 transition-all duration-300 ${
          phase === 'charging'
            ? 'scale-75 opacity-70 blur-xs'
            : phase === 'slam'
            ? 'scale-100 opacity-100 animate-bounce-short'
            : 'scale-125 opacity-0 blur-md duration-500'
        }`}
      >
        {/* Holographic Arena Insignia */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500 opacity-30 blur-2xl animate-pulse" />
          
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-rose-500/80 shadow-[0_0_40px_rgba(244,63,94,0.6)] flex items-center justify-center">
            <Swords className="w-10 h-10 md:w-12 md:h-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse" />
          </div>

          {/* Electric Spark Orbs */}
          <div className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
          <div className="absolute -bottom-2 -right-2 w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_#fb7185] animate-ping" />
        </div>

        {/* Title: BATTLE ARENA */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white font-mono uppercase">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-rose-400 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">
            BATTLE ARENA
          </span>
        </h1>

        {/* Subtitle: 1v1 & 2v2 MULTIPLAYER */}
        <div className="mt-3 flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm font-mono tracking-widest text-slate-300 shadow-xl">
          <span className="text-cyan-400 font-bold">1v1 SHOWDOWN</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-rose-400 font-bold">2v2 RELAY SQUAD</span>
        </div>

        {/* Status progress bar */}
        <div className="mt-6 w-56 sm:w-72 h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
          <div
            className={`h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 transition-all duration-700 ease-out ${
              phase === 'charging' ? 'w-1/3' : 'w-full'
            }`}
          />
        </div>
        <p className="mt-2 text-[11px] font-mono text-slate-400 tracking-wider uppercase">
          SYNCHRONIZING BATTLEFIELD MATRIX...
        </p>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={onAnimationComplete}
        className="absolute bottom-6 right-6 z-20 px-4 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-lg"
      >
        <span>Skip Intro</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
