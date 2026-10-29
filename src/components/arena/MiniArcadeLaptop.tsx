'use client';

import React, { useRef, useEffect, useState } from 'react';
import { playArcadeCoinSound } from '@/lib/arena/soundEffects';

interface MiniArcadeLaptopProps {
  onLaunchBattle: () => void;
  className?: string;
}

export function MiniArcadeLaptop({ onLaunchBattle, className = '' }: MiniArcadeLaptopProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    // Sprite state for 2 miniature fighters
    let p1X = 6;
    let p2X = 26;
    let p1Action = 'idle'; // idle | punch | jump | blast
    let p2Action = 'idle';
    let energyBall: { x: number; y: number; vx: number; color: string } | null = null;
    let sparks: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    const render = () => {
      tick++;

      // Canvas dimensions: 36 x 20
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle CRT scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let y = 0; y < canvas.height; y += 2) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Mini top health bars
      // P1 Health (Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(2, 2, 14, 2);
      // P2 Health (Rose)
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(20, 2, 14, 2);

      // Fighting choreography logic based on tick
      const phase = tick % 140;

      if (phase === 20) {
        p1Action = 'punch';
        p1X = 10;
      } else if (phase === 30) {
        p1Action = 'idle';
        p1X = 7;
        // Hit spark on P2
        for (let i = 0; i < 4; i++) {
          sparks.push({
            x: 23,
            y: 11,
            vx: (Math.random() - 0.2) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 8,
            color: '#f43f5e',
          });
        }
      } else if (phase === 55) {
        p2Action = 'jump';
      } else if (phase === 70) {
        p2Action = 'blast';
        energyBall = { x: 22, y: 11, vx: -1.2, color: '#f43f5e' };
      } else if (phase === 85) {
        p2Action = 'idle';
      } else if (phase === 110) {
        p1Action = 'blast';
        energyBall = { x: 9, y: 11, vx: 1.4, color: '#06b6d4' };
      } else if (phase === 125) {
        p1Action = 'idle';
      }

      // Update & draw energy ball
      if (energyBall) {
        energyBall.x += energyBall.vx;
        ctx.fillStyle = energyBall.color;
        ctx.fillRect(Math.floor(energyBall.x), energyBall.y, 3, 2);

        // Check impact
        if (energyBall.x <= 7 || energyBall.x >= 28) {
          for (let i = 0; i < 5; i++) {
            sparks.push({
              x: energyBall.x,
              y: energyBall.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: 10,
              color: energyBall.color,
            });
          }
          energyBall = null;
        }
      }

      // Update & draw hit sparks
      sparks = sparks.filter((s) => s.life > 0);
      sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1, 1);
      });

      // Ground Line
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 17, canvas.width, 3);

      // Draw Player 1 (Cyan Cyber Ninja)
      const p1Y = p1Action === 'jump' ? 7 : 10;
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(p1X, p1Y, 4, 7); // Body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p1X + 2, p1Y + 1, 2, 2); // Eye visor
      if (p1Action === 'punch') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p1X + 4, p1Y + 2, 3, 2); // Punch fist
      }

      // Draw Player 2 (Rose Cyber Warrior)
      const p2Y = p2Action === 'jump' ? 7 : 10;
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(p2X, p2Y, 4, 7); // Body
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p2X, p2Y + 1, 2, 2); // Eye visor
      if (p2Action === 'punch') {
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(p2X - 3, p2Y + 2, 3, 2); // Punch fist
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playArcadeCoinSound();
    onLaunchBattle();
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group cursor-pointer select-none transition-transform duration-200 active:scale-95 flex items-center ${className}`}
      title="⚔️ 2v2 Live Code Battleground (Click to Enter)"
      role="button"
      tabIndex={0}
      aria-label="Enter 2v2 Live Code Arena"
    >
      {/* Laptop Outer Bezel Chassis */}
      <div className="relative p-1 rounded-t-lg bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border border-slate-600 shadow-md group-hover:border-rose-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all">
        {/* Tiny Camera Notch */}
        <div className="w-1 h-1 rounded-full bg-slate-900 mx-auto mb-0.5 border border-slate-700" />

        {/* The Live Combat Canvas Screen */}
        <div className="relative overflow-hidden rounded-[3px] border border-slate-950 bg-black shadow-inner">
          <canvas
            ref={canvasRef}
            width={36}
            height={20}
            className="w-[38px] h-[21px] block image-pixelated"
          />

          {/* Screen Glass Reflection Glare */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Laptop Keyboard Base */}
        <div className="h-1.5 w-[46px] -mx-1 mt-0.5 rounded-b-md bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800 border-t border-slate-500 shadow-sm flex items-center justify-center">
          <div className="w-3 h-0.5 rounded-full bg-slate-900/80" />
        </div>

        {/* Live Indicator Pill on Top */}
        <div className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 border border-black"></span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg bg-slate-900/95 border border-rose-500/50 text-[10px] font-mono font-bold text-rose-400 whitespace-nowrap shadow-xl z-50 pointer-events-none flex items-center gap-1.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>2v2 CODE ARENA &bull; PLAY LIVE</span>
        </div>
      )}
    </div>
  );
}
