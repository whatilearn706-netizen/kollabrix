'use client';

import React, { useRef, useEffect, useState } from 'react';
import { playArcadeCoinSound } from '@/lib/arena/soundEffects';

interface MiniArcadeLaptopProps {
  onLaunchBattle: () => void;
  className?: string;
  isLive?: boolean;
}

export function MiniArcadeLaptop({ onLaunchBattle, className = '', isLive = true }: MiniArcadeLaptopProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    // Sprite state for 2 realistic animated fighters
    // P1: Cyan Ninja (Ryu style with Hadouken blast)
    // P2: Crimson Striker (Ken style with Shoryuken uppercut)
    let p1X = 10;
    let p1Y = 22;
    let p1Action: 'stance' | 'punch' | 'jump' | 'hadouken' | 'recoil' = 'stance';
    let p1Health = 90;

    let p2X = 46;
    let p2Y = 22;
    let p2Action: 'stance' | 'block' | 'uppercut' | 'kick' | 'recoil' = 'stance';
    let p2Health = 85;

    let fireball: { x: number; y: number; vx: number; radius: number } | null = null;
    let sparks: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    const render = () => {
      tick++;

      // Canvas dimensions: 64 x 36 (High detail retro fighting arena)
      const W = canvas.width;
      const H = canvas.height;

      // 1. Background Dojo / Cyber Skyline
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#090d1a');
      bgGrad.addColorStop(0.65, '#161c2e');
      bgGrad.addColorStop(1, '#0b0f19');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Distant neon skyline silhouettes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 12, 10, 15);
      ctx.fillRect(22, 8, 8, 19);
      ctx.fillRect(36, 14, 12, 13);
      ctx.fillRect(50, 10, 9, 17);

      // Floor / Mat with dark grid lines
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 27, W, 9);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 27);
      ctx.lineTo(W, 27);
      ctx.stroke();

      // Subtle CRT scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let y = 0; y < H; y += 2) {
        ctx.fillRect(0, y, W, 1);
      }

      // 2. Street Fighter Style HUD: Health Bars & Center VS
      // P1 Health (Cyan / Green gradient)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(3, 3, 24, 3);
      const p1HealthW = Math.max(0, (p1Health / 100) * 22);
      ctx.fillStyle = p1Health > 40 ? '#06b6d4' : '#ef4444';
      ctx.fillRect(4, 4, p1HealthW, 1.5);

      // P2 Health (Rose / Red gradient)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(37, 3, 24, 3);
      const p2HealthW = Math.max(0, (p2Health / 100) * 22);
      ctx.fillStyle = p2Health > 40 ? '#f43f5e' : '#ef4444';
      ctx.fillRect(38, 4, p2HealthW, 1.5);

      // Tiny center VS text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 4px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VS', 32, 6);

      // 3. Dynamic Combat Choreography Loop (160 ticks = ~2.6s cycle)
      const phase = tick % 160;

      // Idle breathing bounce
      const bob = Math.sin(tick * 0.2) * 0.8;

      if (phase === 15) {
        // P1 advances and jabs
        p1Action = 'punch';
        p1X = 18;
      } else if (phase === 25) {
        // P2 hit by jab, creates sparks
        p2Action = 'recoil';
        p2X = 48;
        p2Health = Math.max(30, p2Health - 8);
        for (let i = 0; i < 4; i++) {
          sparks.push({
            x: p2X,
            y: 20,
            vx: (Math.random() - 0.2) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 8,
            color: '#fbbf24',
          });
        }
      } else if (phase === 40) {
        p1Action = 'stance';
        p1X = 14;
        p2Action = 'stance';
      } else if (phase === 55) {
        // P2 Ken does Shoryuken Uppercut!
        p2Action = 'uppercut';
        p2X = 30;
      } else if (phase === 65) {
        // P1 hit by uppercut
        p1Action = 'recoil';
        p1Health = Math.max(25, p1Health - 12);
        for (let i = 0; i < 6; i++) {
          sparks.push({
            x: p1X + 4,
            y: 18,
            vx: (Math.random() - 0.8) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 10,
            color: '#f43f5e',
          });
        }
      } else if (phase === 80) {
        p2Action = 'stance';
        p2X = 46;
        p1Action = 'stance';
        p1X = 10;
      } else if (phase === 105) {
        // P1 Ryu casts Hadouken fireball!
        p1Action = 'hadouken';
        fireball = { x: p1X + 8, y: 20, vx: 1.8, radius: 2.5 };
      } else if (phase === 125) {
        p1Action = 'stance';
      }

      // 4. Update & Render Fireball
      if (fireball) {
        fireball.x += fireball.vx;
        // Fireball outer plasma
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(fireball.x, fireball.y, fireball.radius, 0, Math.PI * 2);
        ctx.fill();
        // Core white heat
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fireball.x, fireball.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Hit P2
        if (fireball.x >= p2X - 2) {
          p2Action = 'recoil';
          p2Health = Math.max(15, p2Health - 15);
          for (let i = 0; i < 7; i++) {
            sparks.push({
              x: fireball.x,
              y: fireball.y,
              vx: (Math.random() - 0.2) * 2.5,
              vy: (Math.random() - 0.5) * 2.5,
              life: 12,
              color: '#38bdf8',
            });
          }
          fireball = null;
        }
      }

      // Update & Render Hit Sparks
      sparks = sparks.filter((s) => s.life > 0);
      sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        ctx.fillStyle = s.color;
        ctx.fillRect(Math.floor(s.x), Math.floor(s.y), 1.2, 1.2);
      });

      // 5. Draw Fighter 1 (Cyan Ninja / Ryu Style)
      const curP1Y = p1Action === 'jump' ? p1Y - 6 : p1Y + bob;

      // Floor Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(p1X + 4, 27, 4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs / Pants (White Gi)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(p1X + 1, curP1Y + 4, 2.5, 4);
      ctx.fillRect(p1X + 4.5, curP1Y + 4, 2.5, 4);

      // Torso & Cyan Karate Gi
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(p1X + 1, curP1Y, 6, 4.5);

      // Black Belt
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p1X + 1, curP1Y + 3.5, 6, 1);

      // Head & Skin
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(p1X + 2, curP1Y - 3.5, 4, 3.5);

      // Cyan Headband with fluttering tail
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(p1X + 1.5, curP1Y - 3.5, 5, 1.2);
      ctx.fillRect(p1X - 1.5, curP1Y - 3 + Math.sin(tick * 0.3), 3, 1);

      // Action Poses
      if (p1Action === 'punch') {
        // Extended punch fist
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(p1X + 7, curP1Y + 1, 4, 2);
      } else if (p1Action === 'hadouken') {
        // Dual palms thrust forward
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p1X + 6, curP1Y, 3, 3);
      }

      // 6. Draw Fighter 2 (Crimson Striker / Ken Style)
      const curP2Y = p2Action === 'uppercut' ? p2Y - 7 : p2Y + (1 - bob);

      // Floor Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(p2X + 3, 27, 4, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs (Crimson Gi)
      ctx.fillStyle = '#be123c';
      ctx.fillRect(p2X, curP2Y + 4, 2.5, 4);
      ctx.fillRect(p2X + 3.5, curP2Y + 4, 2.5, 4);

      // Torso & Crimson Gi
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(p2X, curP2Y, 6, 4.5);

      // Black Belt
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p2X, curP2Y + 3.5, 6, 1);

      // Head & Skin
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(p2X + 1, curP2Y - 3.5, 4, 3.5);

      // Blond / Spiky Hair
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(p2X + 1, curP2Y - 4.5, 4.5, 1.8);

      // Action Poses
      if (p2Action === 'uppercut') {
        // Fiery rising fist
        ctx.fillStyle = '#f97316';
        ctx.fillRect(p2X - 1, curP2Y - 3, 3, 4);
        // Uppercut flame spark
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(p2X - 2, curP2Y - 4, 2, 2);
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
      className={`relative group cursor-pointer select-none shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center ${className}`}
      title="⚔️ Battle Arena: 1v1 & 2v2 Live Code Duels (Click to Enter)"
      role="button"
      tabIndex={0}
      aria-label="Enter Battle Arena: 1v1 & 2v2 Live Code Duels"
    >
      {/* ================= REALISTIC METALLIC LAPTOP HOUSING ================= */}
      <div className="relative flex flex-col items-center">
        {/* Laptop Screen Top Lid with Thin Aluminum Bezel & Hinge */}
        <div className="relative p-1 rounded-t-lg bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border border-slate-400/80 shadow-[0_2px_12px_rgba(0,0,0,0.5)] group-hover:border-rose-400 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] transition-all">
          
          {/* Top Webcam Notch Dot */}
          <div className="w-1 h-1 rounded-full bg-slate-950 mx-auto mb-0.5 border border-slate-700 shadow-inner flex items-center justify-center">
            <div className="w-0.5 h-0.5 rounded-full bg-cyan-400" />
          </div>

          {/* The High-DPI Real-Time Fighting Game Canvas Screen */}
          <div className="relative overflow-hidden rounded-[3px] border border-slate-950 bg-black shadow-inner">
            <canvas
              ref={canvasRef}
              width={64}
              height={36}
              className="w-[44px] h-[26px] block image-pixelated"
            />

            {/* Screen Glass Reflection Glare Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-transparent pointer-events-none" />
          </div>

          {/* Live / Offline Indicator Pill on Laptop Top Corner */}
          <div className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-black ${isLive ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></span>
          </div>
        </div>

        {/* Realistic Laptop Keyboard Base with Chamfered Front Edge & Trackpad */}
        <div className="relative h-2 w-[54px] -mt-[1px] rounded-b-md bg-gradient-to-b from-slate-300 via-slate-500 to-slate-700 border-x border-b border-slate-400/80 shadow-md flex items-center justify-center">
          {/* Subtle Front Lip Thumb Opening Indentation */}
          <div className="w-4 h-0.5 rounded-full bg-slate-900/90 shadow-inner" />
          
          {/* Side USB / Charging LED Port */}
          <div className={`absolute left-1 top-0.5 w-1 h-0.5 rounded-[1px] ${isLive ? 'bg-cyan-400/80 shadow-[0_0_4px_#22d3ee]' : 'bg-amber-400/80 shadow-[0_0_4px_#f59e0b]'}`} />
        </div>
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-rose-500/60 text-[11px] font-mono font-bold text-white whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-50 pointer-events-none flex items-center gap-2 animate-fadeIn backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
          <span className="text-cyan-300">⚔️ BATTLE ARENA</span>
          <span className="text-slate-500">&bull;</span>
          <span className={isLive ? 'text-rose-400' : 'text-amber-400'}>
            {isLive ? '1v1 & 2v2 PLAY LIVE' : 'MAINTENANCE MODE (OFFLINE)'}
          </span>
        </div>
      )}
    </div>
  );
}
