'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Zap, Flame, ShieldCheck, Swords, Cpu } from 'lucide-react';
import {
  playGlassShatterBreachSound,
  playSubSonicBoomSound,
  playLightningArcSound,
  playCyberSwordClashSound,
  playBattleSlamSound,
  playTacticalSelectSound,
} from '@/lib/arena/soundEffects';

interface CinematicArenaTransitionProps {
  isActive: boolean;
  onAnimationComplete: () => void;
}

// Hyperspace relativistic warp streak
interface WarpStreak {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: string;
  speed: number;
  width: number;
}

// Explosive plasma clash spark
interface PlasmaSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

// Electric lightning arc branch
interface LightningBranch {
  points: { x: number; y: number }[];
  color: string;
  alpha: number;
  width: number;
}

export function CinematicArenaTransition({
  isActive,
  onAnimationComplete,
}: CinematicArenaTransitionProps) {
  // Phases: 'hyper_rift' (0-350ms) -> 'blade_charge' (350-650ms) -> 'supernova_clash' (650-1100ms) -> 'title_lock' (1100-2200ms) -> 'battle_dive' (2200-2500ms)
  const [phase, setPhase] = useState<
    'idle' | 'hyper_rift' | 'blade_charge' | 'supernova_clash' | 'title_lock' | 'battle_dive'
  >('idle');

  const [screenShake, setScreenShake] = useState(false);
  const [flashBloom, setFlashBloom] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [hudStatusText, setHudStatusText] = useState('ENGAGING TOURNAMENT HYPERSPACE...');

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

  // Master Choreography Timeline
  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setScreenShake(false);
      setFlashBloom(false);
      setProgressPercent(0);
      return;
    }

    // T = 0ms: Dimension Tear / Hyperspace Warp
    setPhase('hyper_rift');
    setScreenShake(true);
    playGlassShatterBreachSound();
    playSubSonicBoomSound();

    // T = 350ms: Dual Plasma Blades Charge
    const tBlades = setTimeout(() => {
      setPhase('blade_charge');
      setHudStatusText('DUAL COMBATANTS LOCKING TARGET VECTOR...');
      playLightningArcSound();
    }, 350);

    // T = 650ms: THE SUPERNOVA CLASH (Shockwave & Blade Collision)
    const tClash = setTimeout(() => {
      setPhase('supernova_clash');
      setFlashBloom(true);
      setScreenShake(true);
      setHudStatusText('CRITICAL IMPACT: PROTOCOL ACTIVATED');
      playCyberSwordClashSound();
      playBattleSlamSound();
      setTimeout(() => setFlashBloom(false), 240);
    }, 650);

    // T = 1100ms: Monolithic Title Lock & Hologram Calibration
    const tTitle = setTimeout(() => {
      setPhase('title_lock');
      setScreenShake(false);
      setHudStatusText('ARENA SECURED // INITIALIZING COMBAT PODS');
      playTacticalSelectSound();
    }, 1100);

    // Progress counter
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) return 100;
        return prev + 3;
      });
    }, 45);

    // T = 2100ms: Hyperspace Dive into Arena
    const tDive = setTimeout(() => {
      setPhase('battle_dive');
      setHudStatusText('LAUNCHING DUEL MATRIX...');
    }, 2100);

    // T = 2500ms: Transition to Setup Room
    const tComplete = setTimeout(() => {
      onAnimationComplete();
    }, 2500);

    return () => {
      clearTimeout(tBlades);
      clearTimeout(tClash);
      clearTimeout(tTitle);
      clearTimeout(tDive);
      clearTimeout(tComplete);
      clearInterval(progressInterval);
    };
  }, [isActive, onAnimationComplete]);

  // High-Performance 60FPS Canvas Animation Engine
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

    // 1. Relativistic Hyperspace Laser Streaks (600+ luminous stars/lasers)
    const warpStreaks: WarpStreak[] = [];
    const streakColors = ['#00f0ff', '#ffffff', '#ff0055', '#38bdf8', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 650; i++) {
      warpStreaks.push({
        x: (Math.random() - 0.5) * width * 2.8,
        y: (Math.random() - 0.5) * height * 2.8,
        z: Math.random() * 1200 + 1,
        pz: 1200,
        color: streakColors[Math.floor(Math.random() * streakColors.length)],
        speed: Math.random() * 22 + 14,
        width: Math.random() * 2.4 + 1,
      });
    }

    // 2. Center Plasma Sparks (Triggered on collision)
    const sparks: PlasmaSpark[] = [];
    let sparksSpawned = false;

    const spawnSparks = () => {
      for (let i = 0; i < 320; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 32 + 8;
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1.5,
          color: i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#ff0055' : '#ffffff',
          alpha: 1,
          decay: Math.random() * 0.02 + 0.012,
        });
      }
    };

    // 3. Procedural Lightning Arcs from screen corners
    let lightningBranches: LightningBranch[] = [];

    const generateLightning = (startX: number, startY: number, endX: number, endY: number, color: string): LightningBranch => {
      const points = [{ x: startX, y: startY }];
      const segments = 12;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const lx = startX + (endX - startX) * t;
        const ly = startY + (endY - startY) * t;
        const offset = (Math.random() - 0.5) * 70;
        points.push({ x: lx + offset, y: ly + offset });
      }
      points.push({ x: endX, y: endY });
      return {
        points,
        color,
        alpha: 1,
        width: Math.random() * 2.5 + 1.5,
      };
    };

    // 4. Expanding Supernova Shockwaves
    let shockwaveRadius = 10;
    let shockwaveAlpha = 1;

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep space abyss gradient with cosmic ambient glow
      const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, Math.max(width, height) * 0.9);
      bgGrad.addColorStop(0, '#0a0d1e');
      bgGrad.addColorStop(0.4, '#050713');
      bgGrad.addColorStop(1, '#020308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ================= 1. 3D PERSPECTIVE STADIUM FLOOR & CEILING GRIDS =================
      const gridSpeed = (tick * 12) % 60;
      ctx.save();
      ctx.lineWidth = 1;

      // Bottom Cyber Grid (Floor)
      const floorGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
      floorGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      floorGrad.addColorStop(1, 'rgba(0, 240, 255, 0.22)');
      ctx.strokeStyle = floorGrad;

      for (let x = -width; x < width * 2; x += 110) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + 40);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = height * 0.65; y <= height; y += 28) {
        const animatedY = y + gridSpeed * 0.45;
        if (animatedY <= height) {
          ctx.beginPath();
          ctx.moveTo(0, animatedY);
          ctx.lineTo(width, animatedY);
          ctx.stroke();
        }
      }

      // Top Cyber Grid (Ceiling - Crimson)
      const ceilGrad = ctx.createLinearGradient(0, height * 0.35, 0, 0);
      ceilGrad.addColorStop(0, 'rgba(255, 0, 85, 0)');
      ceilGrad.addColorStop(1, 'rgba(255, 0, 85, 0.18)');
      ctx.strokeStyle = ceilGrad;

      for (let x = -width; x < width * 2; x += 110) {
        ctx.beginPath();
        ctx.moveTo(cx, cy - 40);
        ctx.lineTo(x, 0);
        ctx.stroke();
      }
      ctx.restore();

      // ================= 2. RELATIVISTIC WARP TUNNEL =================
      const warpSpeedMult =
        phase === 'hyper_rift'
          ? 12
          : phase === 'blade_charge'
          ? 22
          : phase === 'supernova_clash'
          ? 34
          : phase === 'battle_dive'
          ? 48
          : 16;

      ctx.save();
      warpStreaks.forEach((streak) => {
        streak.pz = streak.z;
        streak.z -= streak.speed * (warpSpeedMult / 10);

        if (streak.z <= 0) {
          streak.z = 1200;
          streak.pz = 1200;
          streak.x = (Math.random() - 0.5) * width * 2.8;
          streak.y = (Math.random() - 0.5) * height * 2.8;
        }

        const k = 340 / streak.z;
        const px = streak.x * k + cx;
        const py = streak.y * k + cy;

        const pk = 340 / streak.pz;
        const prevX = streak.x * pk + cx;
        const prevY = streak.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (1200 - streak.z) / 450);
          ctx.strokeStyle = streak.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(1, (1 - streak.z / 1200) * streak.width * 2.2);
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      });
      ctx.restore();

      // ================= 3. ROTATING TECH HUD RINGS & GYROSCOPES =================
      ctx.save();
      ctx.translate(cx, cy);

      const rotSpeed = tick * 0.025;

      // Outer Cyan Aperture Ring
      ctx.save();
      ctx.rotate(rotSpeed);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(0, 0, 240, a, a + 0.45);
        ctx.stroke();
      }
      ctx.restore();

      // Inner Crimson Reticle Ring
      ctx.save();
      ctx.rotate(-rotSpeed * 1.5);
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.55)';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        ctx.beginPath();
        ctx.arc(0, 0, 180, a, a + 0.35);
        ctx.stroke();
      }
      ctx.restore();

      // Pulsing Center Target Reticle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // ================= 4. PROCEDURAL LIGHTNING ARCS =================
      if (tick % 6 === 0 && (phase === 'hyper_rift' || phase === 'blade_charge')) {
        const corners = [
          { x: 0, y: 0, color: '#00f0ff' },
          { x: width, y: 0, color: '#ff0055' },
          { x: 0, y: height, color: '#00f0ff' },
          { x: width, y: height, color: '#ff0055' },
        ];
        const selected = corners[Math.floor(Math.random() * corners.length)];
        lightningBranches.push(
          generateLightning(selected.x, selected.y, cx + (Math.random() * 80 - 40), cy + (Math.random() * 80 - 40), selected.color)
        );
      }

      ctx.save();
      for (let i = lightningBranches.length - 1; i >= 0; i--) {
        const b = lightningBranches[i];
        b.alpha -= 0.08;
        if (b.alpha <= 0) {
          lightningBranches.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = b.color;
        ctx.globalAlpha = b.alpha;
        ctx.lineWidth = b.width;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        b.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }
      ctx.restore();

      // ================= 5. SUPERNOVA SHOCKWAVE & 300+ SPARKS =================
      if ((phase === 'supernova_clash' || phase === 'title_lock') && !sparksSpawned) {
        sparksSpawned = true;
        spawnSparks();
      }

      if (phase === 'supernova_clash' || phase === 'title_lock' || phase === 'battle_dive') {
        // Shockwave Ring 1 (Cyan/White)
        shockwaveRadius += 28;
        shockwaveAlpha = Math.max(0, shockwaveAlpha - 0.024);

        if (shockwaveAlpha > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(0, 240, 255, ${shockwaveAlpha})`;
          ctx.lineWidth = 6;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 35;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Shockwave Ring 2 (Crimson Outer)
          ctx.strokeStyle = `rgba(255, 0, 85, ${shockwaveAlpha * 0.85})`;
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius * 0.75, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Sparks Physics
        ctx.save();
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.vy += 0.12; // subtle gravity
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = sp.alpha;
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
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
        screenShake ? 'animate-titan-shake' : ''
      }`}
    >
      {/* Dynamic Keyframe Styles */}
      <style>{`
        @keyframes titanShake {
          0% { transform: translate3d(0, 0, 0); }
          15% { transform: translate3d(-6px, 4px, 0) scale(1.006); }
          30% { transform: translate3d(6px, -4px, 0) scale(0.998); }
          45% { transform: translate3d(-5px, -3px, 0) scale(1.004); }
          60% { transform: translate3d(5px, 3px, 0) scale(0.999); }
          75% { transform: translate3d(-3px, 2px, 0) scale(1.002); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .animate-titan-shake {
          animation: titanShake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
        }

        @keyframes plasmaSlashLeft {
          0% {
            transform: translate3d(-150%, -100%, 0) rotate(-35deg) scaleX(2.5);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translate3d(-20%, -15%, 0) rotate(-15deg) scaleX(1);
            opacity: 1;
          }
        }

        @keyframes plasmaSlashRight {
          0% {
            transform: translate3d(150%, 100%, 0) rotate(145deg) scaleX(2.5);
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translate3d(20%, 15%, 0) rotate(165deg) scaleX(1);
            opacity: 1;
          }
        }

        .animate-plasma-left {
          animation: plasmaSlashLeft 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-plasma-right {
          animation: plasmaSlashRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes titleGlowPulsar {
          0%, 100% {
            filter: drop-shadow(0 0 30px rgba(0, 240, 255, 0.85)) drop-shadow(0 0 60px rgba(255, 0, 85, 0.75));
          }
          50% {
            filter: drop-shadow(0 0 50px rgba(0, 240, 255, 1)) drop-shadow(0 0 95px rgba(255, 0, 85, 0.95));
          }
        }
        .animate-title-pulsar {
          animation: titleGlowPulsar 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* 60FPS Quantum Warp Canvas Background (Zero Boxes, Pure Speed Streaks & Electric Arcs) */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Supernova Flash on Blade Collision */}
      {flashBloom && (
        <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-ping duration-200" />
      )}

      {/* ================= DUAL HIGH-ENERGY PLASMA BEAMS ================= */}
      {(phase === 'blade_charge' || phase === 'supernova_clash') && (
        <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Cyan Energy Katana (Team Alpha) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-10 bg-gradient-to-r from-transparent via-cyan-400 to-white rounded-full shadow-[0_0_80px_#00f0ff] animate-plasma-left origin-right" />
          {/* Crimson Energy Katana (Team Omega) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-10 bg-gradient-to-l from-transparent via-rose-500 to-white rounded-full shadow-[0_0_80px_#ff0055] animate-plasma-right origin-left" />
        </div>
      )}

      {/* ================= MONUMENTAL CHAMPIONSHIP TITLE CORE ================= */}
      <div
        className={`relative z-30 flex flex-col items-center justify-center text-center px-4 transition-all duration-500 ${
          phase === 'hyper_rift'
            ? 'scale-70 opacity-0 blur-md'
            : phase === 'blade_charge'
            ? 'scale-85 opacity-70 blur-xs'
            : phase === 'supernova_clash' || phase === 'title_lock'
            ? 'scale-100 opacity-100'
            : 'scale-160 opacity-0 blur-xl duration-500'
        }`}
      >
        {/* Holographic Arena Crest */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -inset-16 rounded-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-400 opacity-45 blur-3xl animate-pulse" />

          {/* Championship Emblem */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-950/95 border-2 border-cyan-400/80 shadow-[0_0_70px_rgba(0,240,255,0.8)] flex items-center justify-center backdrop-blur-2xl">
            <div className="relative">
              <Swords className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_25px_#00f0ff] animate-pulse" />
              <Flame className="w-6 h-6 text-rose-500 absolute -bottom-1 -right-1 drop-shadow-[0_0_15px_#ff0055]" />
            </div>
          </div>
        </div>

        {/* Top Tournament Header Tag */}
        <div className="mb-3 px-4 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-300 shadow-lg backdrop-blur-md">
          <span>⚡ KOLLABRIX CHAMPIONSHIP // PROTOCOL OVERRIDE ⚡</span>
        </div>

        {/* Giant Monolithic 3D Typography: BATTLE ARENA */}
        <div className="relative">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white font-mono uppercase animate-title-pulsar select-none drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-500">
              BATTLE
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-300 to-rose-600">
              ARENA
            </span>
          </h1>

          {/* Cyber Scanline Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.6)_51%)] bg-[size:100%_4px] pointer-events-none opacity-30" />
        </div>

        {/* Format Selector Pills (1v1 & 2v2) */}
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

        {/* Live Combat Telemetry Feed */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>JUDGE0 CLUSTER ONLINE</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>FOG-OF-WAR ACTIVE</span>
          </span>
        </div>

        {/* Dynamic Status HUD Text */}
        <p className="mt-3 text-[11px] font-mono text-cyan-400/90 tracking-widest uppercase animate-pulse">
          &gt; {hudStatusText}
        </p>

        {/* Glowing Matrix Charging Bar */}
        <div className="mt-4 w-64 sm:w-80 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800 shadow-inner p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow-[0_0_18px_#00f0ff] transition-all duration-75 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Floating Skip Action (Bottom-Right) */}
      <button
        type="button"
        onClick={onAnimationComplete}
        className="absolute bottom-6 right-6 z-40 px-4 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-2xl backdrop-blur-md cursor-pointer"
        title="Skip intro animation (Esc)"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] text-slate-500 font-bold px-1 py-0.2 bg-slate-800 rounded">ESC</span>
        <ChevronRight className="w-4 h-4 text-cyan-400" />
      </button>
    </div>
  );
}
