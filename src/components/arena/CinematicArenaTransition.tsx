'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Zap, Flame, ShieldCheck, Swords, Cpu, Activity, Radio, Lock } from 'lucide-react';
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

// Floating cyber embers rising from below
interface CyberEmber {
  x: number;
  y: number;
  vy: number;
  vx: number;
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
  // Timeline phases
  const [phase, setPhase] = useState<
    'idle' | 'hyper_rift' | 'blade_charge' | 'supernova_clash' | 'title_lock' | 'battle_dive'
  >('idle');

  const [screenShake, setScreenShake] = useState(false);
  const [flashBloom, setFlashBloom] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [hudStatusText, setHudStatusText] = useState('ENGAGING QUANTUM WARP DRIVES...');

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

    // T = 2200ms: Hyperspace Dive into Arena
    const tDive = setTimeout(() => {
      setPhase('battle_dive');
      setHudStatusText('LAUNCHING COMBAT MATRIX: DIVE IN...');
    }, 2200);

    // T = 2600ms: Transition to Setup Room
    const tComplete = setTimeout(() => {
      onAnimationComplete();
    }, 2600);

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

    // 1. Relativistic Hyperspace Laser Streaks
    const warpStreaks: WarpStreak[] = [];
    const streakColors = ['#00f0ff', '#ffffff', '#ff0055', '#38bdf8', '#f59e0b', '#ec4899', '#a855f7'];
    for (let i = 0; i < 680; i++) {
      warpStreaks.push({
        x: (Math.random() - 0.5) * width * 2.8,
        y: (Math.random() - 0.5) * height * 2.8,
        z: Math.random() * 1200 + 1,
        pz: 1200,
        color: streakColors[Math.floor(Math.random() * streakColors.length)],
        speed: Math.random() * 24 + 14,
        width: Math.random() * 2.6 + 1,
      });
    }

    // 2. Center Plasma Sparks (Triggered on collision)
    const sparks: PlasmaSpark[] = [];
    let sparksSpawned = false;

    const spawnSparks = () => {
      for (let i = 0; i < 350; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 34 + 8;
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1.5,
          color: i % 4 === 0 ? '#00f0ff' : i % 4 === 1 ? '#ff0055' : i % 4 === 2 ? '#a855f7' : '#ffffff',
          alpha: 1,
          decay: Math.random() * 0.02 + 0.012,
        });
      }
    };

    // 3. Floating Cyber Embers
    const embers: CyberEmber[] = [];
    for (let i = 0; i < 90; i++) {
      embers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 2.5 + 1.2),
        size: Math.random() * 2.8 + 1,
        color: Math.random() > 0.5 ? '#00f0ff' : '#ff0055',
        alpha: Math.random() * 0.7 + 0.3,
        decay: Math.random() * 0.006 + 0.003,
      });
    }

    // 4. Procedural Lightning Arcs from screen corners
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
        width: Math.random() * 3.5 + 2,
      };
    };

    let shockwaveRadius = 10;
    let shockwaveAlpha = 1;
    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Cosmic Void Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, '#030712');
      bgGrad.addColorStop(0.5, '#02040a');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // ================= 1. 3D PERSPECTIVE CYBER GRID FLOOR =================
      ctx.save();
      const horizonY = height * 0.62;
      gridOffset = (gridOffset + 2.5) % 40;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;

      // Horizontal depth lines
      for (let y = horizonY; y < height; y += 14) {
        const progress = (y - horizonY) / (height - horizonY);
        const dynamicY = horizonY + Math.pow(progress, 2.2) * (height - horizonY) + (gridOffset * progress);
        if (dynamicY <= height) {
          ctx.beginPath();
          ctx.moveTo(0, dynamicY);
          ctx.lineTo(width, dynamicY);
          ctx.stroke();
        }
      }

      // Vertical converging perspective lines
      const gridCols = 24;
      for (let i = -gridCols; i <= gridCols * 2; i++) {
        const xBottom = (i / gridCols) * width * 1.5 - (width * 0.25);
        ctx.beginPath();
        ctx.moveTo(cx, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
      }
      ctx.restore();

      // ================= 2. RELATIVISTIC HYPERSPACE STREAKS =================
      ctx.save();
      for (let i = 0; i < warpStreaks.length; i++) {
        const s = warpStreaks[i];
        s.pz = s.z;
        s.z -= s.speed;

        if (s.z <= 0) {
          s.z = 1200;
          s.pz = 1200;
          s.x = (Math.random() - 0.5) * width * 2.8;
          s.y = (Math.random() - 0.5) * height * 2.8;
        }

        const k = 400 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const pk = 400 / s.pz;
        const prevX = s.x * pk + cx;
        const prevY = s.y * pk + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (1200 - s.z) / 450);
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = s.width * k * 0.6;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }
      ctx.restore();

      // ================= 3. FLOATING CYBER EMBERS =================
      ctx.save();
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.x += e.vx;
        e.y += e.vy;
        e.alpha -= e.decay;

        if (e.y < 0 || e.alpha <= 0) {
          e.y = height + 10;
          e.x = Math.random() * width;
          e.alpha = Math.random() * 0.8 + 0.2;
        }

        ctx.globalAlpha = Math.max(0, e.alpha);
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ================= 4. ELECTRIC LIGHTNING ARCS =================
      ctx.save();
      if (phase === 'blade_charge' || phase === 'supernova_clash') {
        if (Math.random() < 0.35) {
          const corners = [
            { x: 0, y: 0, c: '#00f0ff' },
            { x: width, y: 0, c: '#ff0055' },
            { x: 0, y: height, c: '#38bdf8' },
            { x: width, y: height, c: '#ec4899' },
          ];
          const chosen = corners[Math.floor(Math.random() * corners.length)];
          lightningBranches.push(generateLightning(chosen.x, chosen.y, cx, cy, chosen.c));
        }
      }

      for (let i = lightningBranches.length - 1; i >= 0; i--) {
        const b = lightningBranches[i];
        b.alpha -= 0.12;
        if (b.alpha <= 0) {
          lightningBranches.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = b.color;
        ctx.globalAlpha = b.alpha;
        ctx.lineWidth = b.width;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 20;

        ctx.beginPath();
        b.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }
      ctx.restore();

      // ================= 5. SUPERNOVA SHOCKWAVE & 350+ SPARKS =================
      if ((phase === 'supernova_clash' || phase === 'title_lock') && !sparksSpawned) {
        sparksSpawned = true;
        spawnSparks();
      }

      if (phase === 'supernova_clash' || phase === 'title_lock' || phase === 'battle_dive') {
        shockwaveRadius += 30;
        shockwaveAlpha = Math.max(0, shockwaveAlpha - 0.024);

        if (shockwaveAlpha > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(0, 240, 255, ${shockwaveAlpha})`;
          ctx.lineWidth = 6;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `rgba(255, 0, 85, ${shockwaveAlpha * 0.85})`;
          ctx.lineWidth = 4;
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(cx, cy, shockwaveRadius * 0.75, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        for (let i = sparks.length - 1; i >= 0; i--) {
          const sp = sparks[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.94;
          sp.vy *= 0.94;
          sp.vy += 0.12;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            sparks.splice(i, 1);
            continue;
          }

          ctx.globalAlpha = sp.alpha;
          ctx.fillStyle = sp.color;
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 14;
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
          40% { opacity: 1; }
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
          40% { opacity: 1; }
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

        @keyframes rotateHudOuter {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes rotateHudInner {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-hud-outer {
          animation: rotateHudOuter 24s linear infinite;
        }
        .animate-hud-inner {
          animation: rotateHudInner 16s linear infinite;
        }

        @keyframes scanLaser {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-laser {
          animation: scanLaser 2.2s ease-in-out infinite;
        }

        @keyframes titleGlowPulsar {
          0%, 100% {
            filter: drop-shadow(0 0 25px rgba(0, 240, 255, 0.85)) drop-shadow(0 0 65px rgba(255, 0, 85, 0.8));
          }
          50% {
            filter: drop-shadow(0 0 45px rgba(0, 240, 255, 1)) drop-shadow(0 0 95px rgba(255, 0, 85, 1));
          }
        }
        .animate-title-pulsar {
          animation: titleGlowPulsar 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* 60FPS Quantum Warp & 3D Perspective Grid Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Cyber Scanline Texture */}
      <div className="absolute inset-0 z-15 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_95%)] pointer-events-none" />

      {/* Supernova Flash on Blade Collision */}
      {flashBloom && (
        <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-ping duration-200" />
      )}

      {/* ================= DUAL HIGH-ENERGY PLASMA BEAMS ================= */}
      {(phase === 'blade_charge' || phase === 'supernova_clash') && (
        <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-10 bg-gradient-to-r from-transparent via-cyan-400 to-white rounded-full shadow-[0_0_90px_#00f0ff] animate-plasma-left origin-right" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-10 bg-gradient-to-l from-transparent via-rose-500 to-white rounded-full shadow-[0_0_90px_#ff0055] animate-plasma-right origin-left" />
        </div>
      )}

      {/* ================= ROTATING HOLOGRAPHIC HUD RETICLES ================= */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        {/* Outer Tech Ring */}
        <div className="w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full border border-cyan-500/25 border-dashed animate-hud-outer relative flex items-center justify-center">
          <div className="absolute top-0 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f0ff]" />
          <div className="absolute bottom-0 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#ff0055]" />
          <div className="absolute left-0 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b]" />
          <div className="absolute right-0 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#c084fc]" />
          <span className="absolute top-2 text-[9px] font-mono text-cyan-400/60 tracking-widest">000°</span>
          <span className="absolute right-2 text-[9px] font-mono text-cyan-400/60 tracking-widest">090°</span>
          <span className="absolute bottom-2 text-[9px] font-mono text-cyan-400/60 tracking-widest">180°</span>
          <span className="absolute left-2 text-[9px] font-mono text-cyan-400/60 tracking-widest">270°</span>
        </div>

        {/* Inner Counter-Rotating Hex Ring */}
        <div className="absolute w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full border border-rose-500/25 border-dotted animate-hud-inner" />
      </div>

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
        {/* Holographic Arena Crest / Mecha Core */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute -inset-16 rounded-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-400 opacity-50 blur-3xl animate-pulse" />

          {/* Futuristic Championship Emblem */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-950/90 border-2 border-cyan-400/80 shadow-[0_0_80px_rgba(0,240,255,0.85)] flex items-center justify-center backdrop-blur-2xl group">
            {/* Holographic Corner Tech Brackets */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-rose-400" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-rose-400" />

            <div className="relative">
              <Swords className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_30px_#00f0ff] animate-pulse" />
              <Flame className="w-6 h-6 text-rose-500 absolute -bottom-1 -right-1 drop-shadow-[0_0_20px_#ff0055]" />
            </div>
          </div>
        </div>

        {/* Top Tournament Header Tag */}
        <div className="mb-3 px-5 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/40 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>⚡ KOLLABRIX CHAMPIONSHIP // PROTOCOL OVERRIDE ⚡</span>
        </div>

        {/* Giant Monolithic 3D Typography: BATTLE ARENA */}
        <div className="relative overflow-hidden py-1">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white font-mono uppercase animate-title-pulsar select-none drop-shadow-[0_15px_40px_rgba(0,0,0,0.95)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 drop-shadow-[0_0_30px_rgba(0,240,255,0.6)]">
              BATTLE
            </span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-200 to-rose-500 drop-shadow-[0_0_30px_rgba(255,0,85,0.6)]">
              ARENA
            </span>
          </h1>

          {/* Sweeping Laser Scan Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#00f0ff] animate-scan-laser pointer-events-none" />
        </div>

        {/* Format Selector Pills (1v1 & 2v2) */}
        <div className="mt-4 flex items-center gap-3 sm:gap-4 px-6 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-xs sm:text-sm font-mono tracking-wider text-slate-200 shadow-2xl backdrop-blur-xl">
          <span className="text-cyan-400 font-black flex items-center gap-1.5 drop-shadow-[0_0_12px_#00f0ff]">
            <Zap className="w-4 h-4 fill-current" />
            1v1 SOLO DUEL
          </span>
          <span className="text-slate-600 font-bold">&bull;</span>
          <span className="text-rose-400 font-black flex items-center gap-1.5 drop-shadow-[0_0_12px_#ff0055]">
            <Flame className="w-4 h-4 fill-current" />
            2v2 SQUAD RELAY
          </span>
        </div>

        {/* Live Combat Telemetry Feed */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>JUDGE0 CLUSTER ONLINE</span>
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>FOG-OF-WAR ACTIVE</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-purple-400 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>MUMBAI EDGE // 12MS</span>
          </span>
        </div>

        {/* Dynamic Status HUD Text with Percentage */}
        <div className="mt-4 flex items-center gap-2">
          <p className="text-[11px] sm:text-xs font-mono text-cyan-300 font-bold tracking-widest uppercase animate-pulse">
            &gt; {hudStatusText}
          </p>
          <span className="text-[11px] font-mono text-rose-400 font-black px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">
            {progressPercent}%
          </span>
        </div>

        {/* High-Voltage Quantum Charging Bar */}
        <div className="mt-3 w-72 sm:w-96 h-2.5 rounded-full bg-slate-950/90 overflow-hidden border border-slate-700/80 shadow-[0_0_20px_rgba(0,0,0,0.8)] p-0.5 relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow-[0_0_20px_#00f0ff] transition-all duration-75 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Plasma Spark at head of bar */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
          </div>
        </div>
      </div>

      {/* Floating Skip Action (Bottom-Right) */}
      <button
        type="button"
        onClick={onAnimationComplete}
        className="absolute bottom-6 right-6 z-40 px-4 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-[0_0_25px_rgba(0,240,255,0.2)] backdrop-blur-md cursor-pointer"
        title="Skip intro animation (Esc)"
      >
        <span>Skip Intro</span>
        <span className="text-[10px] text-cyan-400 font-bold px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded">ESC</span>
        <ChevronRight className="w-4 h-4 text-cyan-400" />
      </button>
    </div>
  );
}
