'use client';

import React, { useEffect, useState } from 'react';
import { playVoxelShatterSound, playBattleSlamSound } from '@/lib/arena/soundEffects';

interface VoxelShatterTransitionProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

interface VoxelBlock {
  id: number;
  startX: number;
  startY: number;
  destX: number;
  destY: number;
  size: number;
  color: string;
  delayMs: number;
  rotateDeg: number;
}

export function VoxelShatterTransition({
  isActive,
  onAnimationComplete,
}: VoxelShatterTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'falling' | 'battle_slam' | 'shockwave_out'>('idle');
  const [blocks, setBlocks] = useState<VoxelBlock[]>([]);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    playVoxelShatterSound();
    setPhase('falling');

    // Generate ~48 1cm x 1cm (36px) neon voxel blocks originating from the 4 corners
    const colors = ['#f43f5e', '#06b6d4', '#a855f7', '#fbbf24', '#3b82f6'];
    const generated: VoxelBlock[] = [];
    const corners = [
      { x: -50, y: -50 }, // Top-Left
      { x: 105, y: -50 }, // Top-Right
      { x: -50, y: 105 }, // Bottom-Left
      { x: 105, y: 105 }, // Bottom-Right
    ];

    let idCounter = 0;
    for (let c = 0; c < 4; c++) {
      const corner = corners[c];
      for (let i = 0; i < 14; i++) {
        generated.push({
          id: idCounter++,
          startX: corner.x + (Math.random() * 20 - 10),
          startY: corner.y + (Math.random() * 20 - 10),
          destX: 50 + (Math.random() * 30 - 15),
          destY: 50 + (Math.random() * 30 - 15),
          size: Math.floor(Math.random() * 12 + 28), // approx 1cm (28-40px)
          color: colors[Math.floor(Math.random() * colors.length)],
          delayMs: Math.random() * 140,
          rotateDeg: Math.random() * 720 - 360,
        });
      }
    }
    setBlocks(generated);

    // Sequence timing (Total under 900ms)
    // 0ms -> Blocks tumble in
    // 380ms -> Blocks meet in center -> BATTLE SLAM
    const t1 = setTimeout(() => {
      playBattleSlamSound();
      setPhase('battle_slam');
    }, 380);

    // 680ms -> Shockwave outward
    const t2 = setTimeout(() => {
      setPhase('shockwave_out');
    }, 680);

    // 880ms -> Transition complete -> open arena lobby
    const t3 = setTimeout(() => {
      onAnimationComplete();
    }, 880);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onAnimationComplete]);

  if (!isActive && phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden flex items-center justify-center select-none">
      {/* Background Dim & Shockwave Filter */}
      <div
        className={`absolute inset-0 bg-[#090B10]/95 backdrop-blur-xl transition-opacity duration-300 ${
          phase === 'shockwave_out' ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Falling 1cm x 1cm Voxel Blocks */}
      <div className="absolute inset-0 pointer-events-none">
        {blocks.map((b) => {
          const isLanded = phase !== 'falling';
          const isBlasted = phase === 'shockwave_out';

          const currentX = isBlasted
            ? b.destX + (b.destX - 50) * 3
            : isLanded
            ? b.destX
            : b.startX;

          const currentY = isBlasted
            ? b.destY + (b.destY - 50) * 3
            : isLanded
            ? b.destY
            : b.startY;

          return (
            <div
              key={b.id}
              style={{
                left: `${currentX}vw`,
                top: `${currentY}vh`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                backgroundColor: b.color,
                boxShadow: `0 0 16px ${b.color}, inset 0 0 8px rgba(255,255,255,0.6)`,
                transform: `rotate(${isLanded ? b.rotateDeg : 0}deg) scale(${isBlasted ? 0 : 1})`,
                transition: `all 0.38s cubic-bezier(0.16, 1, 0.3, 1) ${b.delayMs}ms`,
              }}
              className="absolute rounded-lg border border-white/40"
            />
          );
        })}
      </div>

      {/* Center BATTLE SLAM Typography */}
      {(phase === 'battle_slam' || phase === 'shockwave_out') && (
        <div
          className={`relative z-50 text-center flex flex-col items-center justify-center transition-all duration-300 ${
            phase === 'shockwave_out'
              ? 'scale-150 opacity-0 blur-md'
              : 'scale-100 opacity-100 animate-bounce-short'
          }`}
        >
          {/* Neon Ring Shockwave */}
          <div className="absolute w-[360px] h-[360px] rounded-full border-4 border-rose-500/80 animate-ping opacity-60 pointer-events-none" />

          {/* Glitch sub-badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500/20 border border-rose-500 text-rose-400 font-mono text-xs font-black tracking-widest uppercase shadow-lg shadow-rose-950 mb-2">
            <span>● PROTOCOL ACTIVATED</span>
          </div>

          {/* Main Battle Text */}
          <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-300 to-cyan-400 drop-shadow-[0_0_35px_rgba(244,63,94,0.8)] uppercase">
            ⚡ 2v2 BATTLE ARENA ⚡
          </h1>

          <p className="text-sm font-mono font-bold text-cyan-300 tracking-wider uppercase mt-2 drop-shadow">
            LIVE MULTIPLAYER DUEL GROUND
          </p>
        </div>
      )}
    </div>
  );
}
