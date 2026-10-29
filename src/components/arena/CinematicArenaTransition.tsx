'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Zap, Flame, ShieldCheck } from 'lucide-react';
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

// 3D Isometric Voxel Cube representation
interface VoxelBlock {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  size: number;
  hue: 'cyan' | 'crimson' | 'gold';
  alpha: number;
}

// Warp star streak
interface WarpStar {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
  speed: number;
}

// Impact spark particle
interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export function CinematicArenaTransition({
  isActive,
  onAnimationComplete,
}: CinematicArenaTransitionProps) {
  // Phases: 'idle' -> 'voxel_shatter' -> 'warp_acceleration' -> 'sword_clash' -> 'title_lock' -> 'warp_dive'
  const [phase, setPhase] = useState<
    'idle' | 'voxel_shatter' | 'warp_acceleration' | 'sword_clash' | 'title_lock' | 'warp_dive'
  >('idle');

  const [screenRumble, setScreenRumble] = useState(false);
  const [chromaticGlitch, setChromaticGlitch] = useState(false);
  const [supernovaFlash, setSupernovaFlash] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Esc key listener for instant skip
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onAnimationComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onAnimationComplete]);

  // Main Choreography Timeline
  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setScreenRumble(false);
      setChromaticGlitch(false);
      setSupernovaFlash(false);
      setProgressPercent(0);
      return;
    }

    // T = 0ms: Voxel Shatter Explosion & Reality Rift
    setPhase('voxel_shatter');
    setScreenRumble(true);
    setChromaticGlitch(true);
    playGlassShatterBreachSound();
    playSubSonicBoomSound();

    // T = 350ms: Hyperspace Warp Acceleration
    const tWarp = setTimeout(() => {
      setPhase('warp_acceleration');
      playLightningArcSound();
    }, 350);

    // T = 800ms: Dual Supersonic Plasma Blades Clash at Dead Center
    const tClash = setTimeout(() => {
      setPhase('sword_clash');
      setSupernovaFlash(true);
      setScreenRumble(true);
      setChromaticGlitch(true);
      playCyberSwordClashSound();
      playVoxelShatterSound();
      setTimeout(() => setSupernovaFlash(false), 220);
    }, 800);

    // T = 1200ms: Title Lock & Championship Hologram
    const tTitle = setTimeout(() => {
      setPhase('title_lock');
      setScreenRumble(false);
      setChromaticGlitch(false);
    }, 1200);

    // Smooth Progress Bar
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) return 100;
        return prev + 4;
      });
    }, 45);

    // T = 2200ms: Hyperspace Dive into Battlefield
    const tDive = setTimeout(() => {
      setPhase('warp_dive');
    }, 2200);

    // T = 2650ms: Complete and transition to Step 1
    const tDone = setTimeout(() => {
      onAnimationComplete();
    }, 2650);

    return () => {
      clearTimeout(tWarp);
      clearTimeout(tClash);
      clearTimeout(tTitle);
      clearTimeout(tDive);
      clearTimeout(tDone);
      clearInterval(interval);
    };
  }, [isActive, onAnimationComplete]);

  // High Performance Canvas 3D Engine (Voxels + Warp Tunnel + Sparks + Shockwave)
  useEffect(() => {
    if (!isActive || phase === 'idle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cx = width / 2;
    const cy = height / 2;

    // 1. Generate 3D Falling Voxel Blocks (1cm / ~32px scale)
    const voxels: VoxelBlock[] = [];
    const cornerSpawns = [
      { x: 40, y: 40, vx: 5, vy: 3 },
      { x: width - 40, y: 40, vx: -5, vy: 3 },
      { x: 40, y: height - 40, vx: 5, vy: -3 },
      { x: width - 40, y: height - 40, vx: -5, vy: -3 },
      { x: cx, y: 30, vx: 0, vy: 5 },
      { x: cx, y: height - 30, vx: 0, vy: -5 },
    ];

    cornerSpawns.forEach((spawn) => {
      for (let i = 0; i < 22; i++) {
        const hueType: 'cyan' | 'crimson' | 'gold' =
          i % 3 === 0 ? 'cyan' : i % 3 === 1 ? 'crimson' : 'gold';
        voxels.push({
          x: spawn.x + (Math.random() * 120 - 60),
          y: spawn.y + (Math.random() * 120 - 60),
          z: Math.random() * 300 + 100,
          vx: spawn.vx * (Math.random() * 1.5 + 0.8) + (Math.random() * 4 - 2),
          vy: spawn.vy * (Math.random() * 1.5 + 0.8) + (Math.random() * 4 - 2),
          vz: Math.random() * 6 - 3,
          rx: Math.random() * Math.PI * 2,
          ry: Math.random() * Math.PI * 2,
          rz: Math.random() * Math.PI * 2,
          vrx: (Math.random() - 0.5) * 0.1,
          vry: (Math.random() - 0.5) * 0.1,
          vrz: (Math.random() - 0.5) * 0.1,
          size: Math.random() * 14 + 22, // 22px to 36px (~1cm block)
          hue: hueType,
          alpha: 1,
        });
      }
    });

    // 2. Generate 450+ 3D Relativistic Warp Star Streaks
    const warpStars: WarpStar[] = [];
    const starColors = ['#00f0ff', '#ffffff', '#ff0055', '#38bdf8', '#fbbf24'];
    for (let i = 0; i < 450; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * 1000 + 1,
        pz: 1000,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        speed: Math.random() * 18 + 12,
      });
    }

    // 3. Shockwave & Clash Sparks
    let shockwaveR = 5;
    let shockwaveAlpha = 1;
    const sparks: SparkParticle[] = [];

    const spawnSparks = () => {
      for (let i = 0; i < 180; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 26 + 6;
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3.5 + 1.5,
          color: i % 2 === 0 ? '#00f0ff' : '#ff0055',
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    let clashSpawned = false;
    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep space atmospheric background
      const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, '#060a17');
      bgGrad.addColorStop(0.5, '#040711');
      bgGrad.addColorStop(1, '#020308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ================= 1. RELATIVISTIC WARP TUNNEL =================
      const warpSpeedMultiplier =
        phase === 'voxel_shatter'
          ? 4
          : phase === 'warp_acceleration' || phase === 'sword_clash'
          ? 18
          : phase === 'warp_dive'
          ? 32
          : 6;

      ctx.save();
      warpStars.forEach((star) => {
        star.pz = star.z;
        star.z -= star.speed * (warpSpeedMultiplier / 8);

        if (star.z <= 0) {
          star.z = 1000;
          star.pz = 1000;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 320 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const pk = 320 / star.pz;
        const prevX = star.x * pk + cx;
        const prevY = star.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (1000 - star.z) / 400);
          ctx.strokeStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(1, (1 - star.z / 1000) * 3);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      });
      ctx.restore();

      // ================= 2. ROTATING CYBER RINGS / PORTAL ACCELERATOR =================
      ctx.save();
      ctx.translate(cx, cy);

      // Outer Portal Ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 220, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning Tech Brackets
      const ringRot = tick * 0.02;
      ctx.save();
      ctx.rotate(ringRot);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
        ctx.beginPath();
        ctx.arc(0, 0, 190, a, a + 0.35);
        ctx.stroke();
      }
      ctx.restore();

      // Counter-rotating Inner Crimson Ring
      ctx.save();
      ctx.rotate(-ringRot * 1.4);
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.arc(0, 0, 140, a, a + 0.25);
        ctx.stroke();
      }
      ctx.restore();
      ctx.restore();

      // ================= 3. 3D ISOMETRIC TUMBLING VOXELS =================
      voxels.forEach((v) => {
        v.x += v.vx;
        v.y += v.vy;
        v.z += v.vz;
        v.rx += v.vrx;
        v.ry += v.vry;
        v.rz += v.vrz;

        // Gravity pull toward center vortex
        const dx = cx - v.x;
        const dy = cy - v.y;
        v.vx += dx * 0.0008;
        v.vy += dy * 0.0008;

        if (phase === 'warp_acceleration' || phase === 'sword_clash' || phase === 'warp_dive') {
          v.alpha = Math.max(0, v.alpha - 0.02);
        }

        if (v.alpha <= 0) return;

        // Render 3D shaded isometric cube
        ctx.save();
        ctx.translate(v.x, v.y);
        ctx.rotate(v.rz);
        ctx.globalAlpha = v.alpha;

        const s = v.size * (200 / (v.z + 100));
        const colorPalette =
          v.hue === 'cyan'
            ? { top: '#22d3ee', front: '#0891b2', side: '#0e7490', glow: '#00f0ff' }
            : v.hue === 'crimson'
            ? { top: '#fb7185', front: '#e11d48', side: '#be123c', glow: '#ff0055' }
            : { top: '#fde047', front: '#eab308', side: '#ca8a04', glow: '#ffb700' };

        // Front Face
        ctx.fillStyle = colorPalette.front;
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.fill();

        // Top Face
        ctx.fillStyle = colorPalette.top;
        ctx.beginPath();
        ctx.moveTo(-s / 2, -s / 2);
        ctx.lineTo(-s / 2 + s * 0.4, -s / 2 - s * 0.3);
        ctx.lineTo(s / 2 + s * 0.4, -s / 2 - s * 0.3);
        ctx.lineTo(s / 2, -s / 2);
        ctx.closePath();
        ctx.fill();

        // Right Side Face
        ctx.fillStyle = colorPalette.side;
        ctx.beginPath();
        ctx.moveTo(s / 2, -s / 2);
        ctx.lineTo(s / 2 + s * 0.4, -s / 2 - s * 0.3);
        ctx.lineTo(s / 2 + s * 0.4, s / 2 - s * 0.3);
        ctx.lineTo(s / 2, s / 2);
        ctx.closePath();
        ctx.fill();

        // Glowing Wireframe Edges
        ctx.strokeStyle = colorPalette.glow;
        ctx.lineWidth = 1;
        ctx.shadowColor = colorPalette.glow;
        ctx.shadowBlur = 8;
        ctx.strokeRect(-s / 2, -s / 2, s, s);

        ctx.restore();
      });

      // ================= 4. SWORD CLASH SHOCKWAVE & SPARKS =================
      if ((phase === 'sword_clash' || phase === 'title_lock') && !clashSpawned) {
        clashSpawned = true;
        spawnSparks();
      }

      if (phase === 'sword_clash' || phase === 'title_lock' || phase === 'warp_dive') {
        // Shockwave 1: Crimson Outer
        shockwaveR += 24;
        shockwaveAlpha = Math.max(0, shockwaveAlpha - 0.022);

        if (shockwaveAlpha > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(255, 0, 85, ${shockwaveAlpha})`;
          ctx.lineWidth = 5;
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveR, 0, Math.PI * 2);
          ctx.stroke();

          // Shockwave 2: Cyan Inner
          ctx.strokeStyle = `rgba(0, 240, 255, ${shockwaveAlpha * 0.9})`;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveR * 0.65, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Sparks Physics
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.vy += 0.15; // gentle gravity
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = sp.alpha;
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, phase]);

  if (!isActive) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black select-none ${
        screenRumble ? 'animate-epic-rumble' : ''
      }`}
    >
      {/* Dynamic Keyframe Styles */}
      <style>{`
        @keyframes epicRumble {
          0% { transform: translate3d(0, 0, 0); }
          15% { transform: translate3d(-5px, 4px, 0) scale(1.008); }
          30% { transform: translate3d(5px, -4px, 0) scale(0.996); }
          45% { transform: translate3d(-4px, -3px, 0) scale(1.006); }
          60% { transform: translate3d(4px, 3px, 0) scale(0.998); }
          75% { transform: translate3d(-3px, 2px, 0) scale(1.004); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .animate-epic-rumble {
          animation: epicRumble 0.65s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }

        @keyframes swordStrikeLeft {
          0% {
            transform: translate3d(-140%, -100%, 0) rotate(-45deg) scale(2);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translate3d(-35%, -35%, 0) rotate(-20deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes swordStrikeRight {
          0% {
            transform: translate3d(140%, 100%, 0) rotate(135deg) scale(2);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translate3d(35%, 35%, 0) rotate(160deg) scale(1);
            opacity: 1;
          }
        }

        .animate-sword-left {
          animation: swordStrikeLeft 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-sword-right {
          animation: swordStrikeRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes neonPulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.9)) drop-shadow(0 0 50px rgba(255, 0, 85, 0.7));
          }
          50% {
            filter: drop-shadow(0 0 45px rgba(0, 240, 255, 1)) drop-shadow(0 0 85px rgba(255, 0, 85, 0.9));
          }
        }
        .animate-neon-pulse {
          animation: neonPulseGlow 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Physics Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Chromatic Glitch RGB Displacement Overlay */}
      {chromaticGlitch && (
        <div className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-60 bg-gradient-to-r from-cyan-500/15 via-transparent to-rose-500/15 animate-pulse" />
      )}

      {/* Supernova Blinding Flash on Sword Contact */}
      {supernovaFlash && (
        <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-ping duration-200" />
      )}

      {/* ================= DUAL SUPERSONIC PLASMA BLADES ================= */}
      {(phase === 'sword_clash' || phase === 'title_lock') && (
        <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Team Alpha Cyan Plasma Beam */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-8 bg-gradient-to-r from-transparent via-cyan-400 to-white rounded-full shadow-[0_0_60px_#00f0ff] animate-sword-left origin-right" />
          {/* Team Omega Crimson Plasma Beam */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-8 bg-gradient-to-l from-transparent via-rose-500 to-white rounded-full shadow-[0_0_60px_#ff0055] animate-sword-right origin-left" />
        </div>
      )}

      {/* ================= CENTER TITANIC TITLE CORE ================= */}
      <div
        className={`relative z-30 flex flex-col items-center justify-center text-center px-4 transition-all duration-500 ${
          phase === 'voxel_shatter'
            ? 'scale-70 opacity-0 blur-md'
            : phase === 'warp_acceleration'
            ? 'scale-85 opacity-70 blur-xs'
            : phase === 'sword_clash' || phase === 'title_lock'
            ? 'scale-100 opacity-100'
            : 'scale-160 opacity-0 blur-xl duration-500'
        }`}
      >
        {/* Holographic Arena Insignia */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-14 rounded-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-400 opacity-40 blur-3xl animate-pulse" />

          {/* Dual Crest Shield */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-950/95 border-2 border-cyan-400/80 shadow-[0_0_60px_rgba(0,240,255,0.7)] flex items-center justify-center backdrop-blur-xl">
            <div className="relative">
              <Zap className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_20px_#00f0ff] animate-pulse" />
              <Flame className="w-7 h-7 text-rose-500 absolute -bottom-1 -right-1 drop-shadow-[0_0_15px_#ff0055]" />
            </div>
          </div>
        </div>

        {/* Monumental 3D Title: BATTLE ARENA */}
        <div className="relative">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white font-mono uppercase animate-neon-pulse select-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500">
              BATTLE
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-300 to-rose-600">
              ARENA
            </span>
          </h1>

          {/* Subtle Cyber Grid Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[size:100%_4px] pointer-events-none opacity-40" />
        </div>

        {/* Format Selector Badges */}
        <div className="mt-5 flex items-center gap-3 sm:gap-4 px-6 py-2.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-xs sm:text-sm font-mono tracking-widest text-slate-200 shadow-2xl backdrop-blur-xl">
          <span className="text-cyan-400 font-black flex items-center gap-1.5 drop-shadow-[0_0_10px_#00f0ff]">
            <Zap className="w-4 h-4 fill-current" />
            1v1 SOLO DUEL
          </span>
          <span className="text-slate-600 font-bold">&bull;</span>
          <span className="text-rose-400 font-black flex items-center gap-1.5 drop-shadow-[0_0_10px_#ff0055]">
            <Flame className="w-4 h-4 fill-current" />
            2v2 SQUAD RELAY
          </span>
        </div>

        {/* High-Tech Telemetry HUD */}
        <div className="mt-6 flex items-center gap-3 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>JUDGE0 CLUSTER ONLINE</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>FOG-OF-WAR ACTIVE</span>
          </span>
        </div>

        {/* Glowing Matrix Charging Bar */}
        <div className="mt-5 w-64 sm:w-80 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 shadow-inner p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow-[0_0_15px_#00f0ff] transition-all duration-75 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Floating Skip Action (Bottom-Right) */}
      <button
        type="button"
        onClick={onAnimationComplete}
        className="absolute bottom-6 right-6 z-40 px-4 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-2xl backdrop-blur-md"
        title="Skip intro animation (Esc)"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] text-slate-500 font-bold px-1 py-0.2 bg-slate-800 rounded">ESC</span>
        <ChevronRight className="w-4 h-4 text-cyan-400" />
      </button>
    </div>
  );
}
