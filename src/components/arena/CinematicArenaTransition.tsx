'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Swords, ChevronRight, AlertTriangle, ShieldAlert, Zap, Flame } from 'lucide-react';
import {
  playGlassShatterBreachSound,
  playSubSonicBoomSound,
  playLightningArcSound,
  playCyberSwordClashSound,
  playVoxelShatterSound,
} from '@/lib/arena/soundEffects';

interface CinematicArenaTransitionProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

// 3D Voxel Cube representation
interface VoxelBlock {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  vRotX: number;
  vRotY: number;
  vRotZ: number;
  size: number;
  color: string;
  glowColor: string;
  alpha: number;
}

export function CinematicArenaTransition({
  isActive,
  onAnimationComplete,
}: CinematicArenaTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'breach' | 'sword_clash' | 'matrix_hold' | 'warp_out'>('idle');
  const [screenRumble, setScreenRumble] = useState(false);
  const [chromaticGlitch, setChromaticGlitch] = useState(false);
  const [supernovaFlash, setSupernovaFlash] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setScreenRumble(false);
      setChromaticGlitch(false);
      setSupernovaFlash(false);
      return;
    }

    // T = 0ms: Initial Shock Breach & Violent Camera Shake & Glass Crack
    setPhase('breach');
    setScreenRumble(true);
    setChromaticGlitch(true);
    playGlassShatterBreachSound();
    playSubSonicBoomSound();

    // T = 350ms: Electric arcs crackle
    const tElectric = setTimeout(() => {
      playLightningArcSound();
    }, 350);

    // T = 850ms: Dual Plasma Swords Clash at Dead Center!
    const tClash = setTimeout(() => {
      setPhase('sword_clash');
      setSupernovaFlash(true);
      setScreenRumble(true);
      playCyberSwordClashSound();
      playVoxelShatterSound();
      setTimeout(() => setSupernovaFlash(false), 200);
    }, 850);

    // T = 1350ms: Matrix Hold & Telemetry Lock
    const tHold = setTimeout(() => {
      setPhase('matrix_hold');
      setScreenRumble(false);
      setChromaticGlitch(false);
    }, 1350);

    // T = 2100ms: Hyperspace Warp Out into Battleground
    const tWarp = setTimeout(() => {
      setPhase('warp_out');
    }, 2100);

    // T = 2500ms: Complete and open Battle Arena Page
    const tDone = setTimeout(() => {
      onAnimationComplete();
    }, 2500);

    return () => {
      clearTimeout(tElectric);
      clearTimeout(tClash);
      clearTimeout(tHold);
      clearTimeout(tWarp);
      clearTimeout(tDone);
    };
  }, [isActive, onAnimationComplete]);

  // Canvas Physics Engine: 3D Corner Voxels + Glass Fractures + Lightning Arcs
  useEffect(() => {
    if (!isActive || phase === 'idle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Generate falling 3D voxels from all 4 corners (top-left, top-right, bottom-left, bottom-right)
    const voxels: VoxelBlock[] = [];
    const colors = [
      { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.8)' }, // Cyan
      { fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.8)' }, // Crimson Rose
      { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.8)' }, // Amber
      { fill: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' }, // Purple
      { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)' }, // Sky
    ];

    const corners = [
      { x: 30, y: 30, dirX: 1, dirY: 1 }, // Top-Left
      { x: width - 30, y: 30, dirX: -1, dirY: 1 }, // Top-Right
      { x: 30, y: height - 30, dirX: 1, dirY: -1 }, // Bottom-Left
      { x: width - 30, y: height - 30, dirX: -1, dirY: -1 }, // Bottom-Right
    ];

    corners.forEach((corner) => {
      for (let i = 0; i < 28; i++) {
        const palette = colors[Math.floor(Math.random() * colors.length)];
        const spreadX = corner.x + (Math.random() * 80 - 40);
        const spreadY = corner.y + (Math.random() * 80 - 40);
        voxels.push({
          x: spreadX,
          y: spreadY,
          z: Math.random() * 200 + 50,
          vx: corner.dirX * (Math.random() * 9 + 4) + (Math.random() * 4 - 2),
          vy: corner.dirY * (Math.random() * 7 + 2) + (Math.random() * 4 - 2),
          vz: Math.random() * 4 - 2,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          vRotX: (Math.random() - 0.5) * 0.12,
          vRotY: (Math.random() - 0.5) * 0.12,
          vRotZ: (Math.random() - 0.5) * 0.12,
          size: Math.random() * 16 + 14, // ~1cm to 1.5cm block visual scale
          color: palette.fill,
          glowColor: palette.glow,
          alpha: 1,
        });
      }
    });

    // Generate procedural glass fracture lines branching from corners & center
    const cracks: { x1: number; y1: number; x2: number; y2: number; color: string; width: number }[] = [];
    const makeCrackBranch = (
      x: number,
      y: number,
      angle: number,
      length: number,
      depth: number,
      color: string
    ) => {
      if (depth <= 0) return;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      cracks.push({ x1: x, y1: y, x2: endX, y2: endY, color, width: Math.max(1, depth * 0.8) });

      // Fork 1 or 2 sub-branches
      const subAngle1 = angle + (Math.random() * 0.6 - 0.3);
      makeCrackBranch(endX, endY, subAngle1, length * (Math.random() * 0.3 + 0.6), depth - 1, color);

      if (Math.random() > 0.4) {
        const subAngle2 = angle + (Math.random() * 1.2 - 0.6);
        makeCrackBranch(endX, endY, subAngle2, length * (Math.random() * 0.3 + 0.5), depth - 1, color);
      }
    };

    // Spawn cracks from corners toward center
    corners.forEach((c, idx) => {
      const angleToCenter = Math.atan2(height / 2 - c.y, width / 2 - c.x);
      const color = idx % 2 === 0 ? 'rgba(6, 182, 212, 0.75)' : 'rgba(244, 63, 94, 0.75)';
      makeCrackBranch(c.x, c.y, angleToCenter, 90, 4, color);
      makeCrackBranch(c.x, c.y, angleToCenter + 0.5, 70, 3, color);
      makeCrackBranch(c.x, c.y, angleToCenter - 0.5, 70, 3, color);
    });

    // Center explosion cracks
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      makeCrackBranch(
        width / 2,
        height / 2,
        a + (Math.random() * 0.3 - 0.15),
        80,
        3,
        'rgba(255, 255, 255, 0.85)'
      );
    }

    let shockwaveRadius = 10;
    let shockwaveAlpha = 1;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing spiderweb glass fracture lines
      cracks.forEach((crack) => {
        ctx.save();
        ctx.strokeStyle = crack.color;
        ctx.lineWidth = crack.width;
        ctx.shadowColor = crack.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(crack.x1, crack.y1);
        ctx.lineTo(crack.x2, crack.y2);
        ctx.stroke();
        ctx.restore();
      });

      // 2. Draw shockwave plasma ring during sword clash
      if (phase === 'sword_clash' || phase === 'matrix_hold') {
        shockwaveRadius += 22;
        shockwaveAlpha = Math.max(0, shockwaveAlpha - 0.025);

        ctx.save();
        ctx.strokeStyle = `rgba(244, 63, 94, ${shockwaveAlpha})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, shockwaveRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(6, 182, 212, ${shockwaveAlpha * 0.9})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, shockwaveRadius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Update & render 3D falling physical voxels
      voxels.forEach((v) => {
        // Gravity & acceleration
        v.vy += 0.42; // Gravity
        v.x += v.vx;
        v.y += v.vy;
        v.z += v.vz;

        v.rotX += v.vRotX;
        v.rotY += v.vRotY;
        v.rotZ += v.vRotZ;

        // Render 3D isometric cube
        const s = v.size * (150 / (150 + Math.max(0, v.z))); // Perspective scale
        if (s <= 0) return;

        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(v.rotZ);

        // Top face
        ctx.fillStyle = v.color;
        ctx.shadowColor = v.glowColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -s / 2);
        ctx.lineTo(s / 2, -s / 4);
        ctx.lineTo(0, 0);
        ctx.lineTo(-s / 2, -s / 4);
        ctx.closePath();
        ctx.fill();

        // Right face
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s / 2, -s / 4);
        ctx.lineTo(s / 2, s / 2);
        ctx.lineTo(0, (3 * s) / 4);
        ctx.closePath();
        ctx.fill();

        // Left face
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.moveTo(-s / 2, -s / 4);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, (3 * s) / 4);
        ctx.lineTo(-s / 2, s / 2);
        ctx.closePath();
        ctx.fill();

        // Wireframe outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, phase]);

  if (!isActive && phase === 'idle') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center select-none bg-[#030509] ${
        screenRumble ? 'animate-epic-rumble' : ''
      }`}
    >
      <style jsx global>{`
        @keyframes epicScreenRumble {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          10% {
            transform: translate3d(-10px, 7px, 0) rotate(-1.5deg) scale(1.02);
          }
          20% {
            transform: translate3d(9px, -8px, 0) rotate(1.2deg) scale(0.99);
          }
          30% {
            transform: translate3d(-12px, 9px, 0) rotate(-1.8deg) scale(1.03);
          }
          40% {
            transform: translate3d(10px, -7px, 0) rotate(1.4deg) scale(1.01);
          }
          55% {
            transform: translate3d(-7px, 5px, 0) rotate(-0.9deg) scale(1.02);
          }
          70% {
            transform: translate3d(5px, -4px, 0) rotate(0.6deg) scale(1.01);
          }
          85% {
            transform: translate3d(-3px, 2px, 0) rotate(-0.3deg) scale(1.005);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }
        .animate-epic-rumble {
          animation: epicScreenRumble 0.75s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }

        @keyframes swordSlashLeft {
          0% {
            transform: translate3d(-120%, -50%, 0) rotate(-35deg) scale(1.8);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate3d(-20%, -50%, 0) rotate(-15deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes swordSlashRight {
          0% {
            transform: translate3d(120%, -50%, 0) rotate(35deg) scale(1.8);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate3d(20%, -50%, 0) rotate(15deg) scale(1);
            opacity: 1;
          }
        }

        .animate-sword-left {
          animation: swordSlashLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-sword-right {
          animation: swordSlashRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Background Physics Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Chromatic Aberration RGB Glitch Overlay */}
      {chromaticGlitch && (
        <div className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-50 bg-gradient-to-r from-cyan-500/10 via-transparent to-rose-500/10 animate-pulse" />
      )}

      {/* Supernova Blinding Impact Flash */}
      {supernovaFlash && (
        <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-ping duration-300" />
      )}

      {/* TOP HUD: SYSTEM BREACH WARNING BANNER */}
      <div className="absolute top-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 rounded-xl bg-rose-950/80 border border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.6)] backdrop-blur-md text-white font-mono text-xs sm:text-sm uppercase tracking-widest font-black animate-bounce-short">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="text-rose-300">
            WARNING: CODE MATRIX COMPROMISED // BATTLE PROTOCOL DETECTED
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-spin" />
        </div>
      </div>

      {/* DUAL PLASMA SWORDS IMPACT SEQUENCE */}
      {phase === 'sword_clash' && (
        <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Cyan Plasma Katana from Left */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-6 bg-gradient-to-r from-transparent via-cyan-400 to-white rounded-full shadow-[0_0_50px_#22d3ee] animate-sword-left transform origin-right" />
          {/* Crimson Plasma Katana from Right */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-6 bg-gradient-to-l from-transparent via-rose-500 to-white rounded-full shadow-[0_0_50px_#f43f5e] animate-sword-right transform origin-left" />
        </div>
      )}

      {/* CENTER EPIC TITLE CORE */}
      <div
        className={`relative z-30 flex flex-col items-center justify-center text-center px-4 transition-all duration-500 ${
          phase === 'breach'
            ? 'scale-75 opacity-80 blur-xs'
            : phase === 'sword_clash' || phase === 'matrix_hold'
            ? 'scale-100 opacity-100'
            : 'scale-150 opacity-0 blur-lg duration-400'
        }`}
      >
        {/* Holographic Glowing Crest */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-500 opacity-60 blur-3xl animate-pulse" />

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-950/95 border-2 border-rose-500/90 shadow-[0_0_70px_rgba(244,63,94,0.9)] flex items-center justify-center">
            <Swords className="w-14 h-14 sm:w-16 sm:h-16 text-rose-400 drop-shadow-[0_0_30px_rgba(244,63,94,1)] animate-pulse" />
          </div>

          {/* Orbiting Spark Spheres */}
          <div className="absolute -top-3 -left-3 w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-ping" />
          <div className="absolute -bottom-3 -right-3 w-5 h-5 rounded-full bg-rose-400 shadow-[0_0_20px_#fb7185] animate-ping" />
        </div>

        {/* Title: BATTLE ARENA */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white font-mono uppercase drop-shadow-[0_0_40px_rgba(6,182,212,0.8)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-rose-400">
            BATTLE ARENA
          </span>
        </h1>

        {/* Formats Pill */}
        <div className="mt-4 flex items-center gap-3 px-5 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs sm:text-sm font-mono tracking-widest text-slate-200 shadow-2xl backdrop-blur-md">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 fill-current" />
            1v1 SHOWDOWN
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-rose-400 font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-current" />
            2v2 SQUAD RELAY
          </span>
        </div>

        {/* Live Diagnostics Terminal Readout */}
        <div className="mt-6 font-mono text-[11px] sm:text-xs text-slate-400 space-y-1 tracking-wider uppercase">
          <p className="text-cyan-400/90">&gt; JUDGE0 COMPILER CLUSTER: ONLINE [0.18ms]</p>
          <p className="text-rose-400/90">&gt; FOG-OF-WAR ANTI-CHEAT SHIELD: ACTIVE</p>
          <p className="text-amber-400/90">&gt; ENTERING TOURNAMENT COMBAT GROUND...</p>
        </div>

        {/* Loading Matrix Bar */}
        <div className="mt-5 w-64 sm:w-80 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-700 shadow-inner">
          <div
            className={`h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 transition-all duration-1000 ease-out ${
              phase === 'breach' ? 'w-1/4' : phase === 'sword_clash' ? 'w-3/4' : 'w-full'
            }`}
          />
        </div>
      </div>

      {/* Skip Button */}
      <button
        type="button"
        onClick={onAnimationComplete}
        className="absolute bottom-6 right-6 z-40 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-xl"
      >
        <span>Skip Intro</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
