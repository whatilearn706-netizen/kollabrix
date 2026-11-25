'use client';

import React, { useEffect, useRef } from 'react';

export type RadarMode = 'idle' | 'scanning' | 'countdown' | 'battle' | 'results';

interface ArenaBackgroundMatrixProps {
  className?: string;
  radarMode?: RadarMode;
}

/**
 * Tactical Radar Topography backdrop matching the Obsidian Titanium aesthetic:
 * concentric silver radar rings, orbital coordinate ticks, monochrome silver sparks,
 * soft sonar pulse while scanning, and a surgical red target dot during active countdowns.
 */
export function ArenaBackgroundMatrix({
  className = '',
  radarMode = 'idle',
}: ArenaBackgroundMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<RadarMode>(radarMode);
  modeRef.current = radarMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Monochrome silver micro-sparks
    const sparkCount = width > 768 ? 42 : 20;
    const sparks = Array.from({ length: sparkCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.3 + 0.5,
      vy: -(Math.random() * 0.28 + 0.08),
      alpha: Math.random() * 0.35 + 0.08,
      pulse: Math.random() * Math.PI * 2,
    }));

    let angle = 0;
    let sonarRadius = 0;

    const render = () => {
      const mode = modeRef.current;
      const cx = width * 0.5;
      const cy = height * 0.5;
      const maxR = Math.min(width, height) * 0.46;

      // 1. Deep Obsidian Void canvas
      const bgGrad = ctx.createRadialGradient(cx, cy * 0.85, 20, cx, cy, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, '#090D16');
      bgGrad.addColorStop(0.55, '#04060B');
      bgGrad.addColorStop(1, '#020306');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Faint coordinate crosshair axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // 3. Razor-thin concentric silver radar rings
      const rings = [0.28, 0.5, 0.72, 0.96];
      rings.forEach((factor, idx) => {
        const r = maxR * factor;
        ctx.save();
        ctx.beginPath();
        if (idx === 2) ctx.setLineDash([4, 8]);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? 'rgba(226, 232, 240, 0.07)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });

      // 4. Orbital coordinate ticks on ring 2 and ring 4
      const tickRingInner = maxR * 0.5;
      const tickRingOuter = maxR * 0.96;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.14)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 36; i++) {
        const a = (i * Math.PI * 2) / 36;
        const major = i % 9 === 0;
        const len = major ? 10 : 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (tickRingOuter - len), cy + Math.sin(a) * (tickRingOuter - len));
        ctx.lineTo(cx + Math.cos(a) * tickRingOuter, cy + Math.sin(a) * tickRingOuter);
        ctx.stroke();

        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * (tickRingInner - 3), cy + Math.sin(a) * (tickRingInner - 3));
          ctx.lineTo(cx + Math.cos(a) * (tickRingInner + 3), cy + Math.sin(a) * (tickRingInner + 3));
          ctx.stroke();
        }
      }

      // 5. Softly pulsing sonar wave when scanning for a match (subtle pulse when idle)
      const pulseSpeed = mode === 'scanning' ? 2.1 : mode === 'countdown' ? 1.5 : 0.65;
      sonarRadius = (sonarRadius + pulseSpeed) % (maxR * 1.02);
      const sonarAlpha =
        (1 - sonarRadius / (maxR * 1.02)) * (mode === 'scanning' ? 0.28 : mode === 'countdown' ? 0.2 : 0.07);
      if (sonarAlpha > 0.005) {
        ctx.beginPath();
        ctx.arc(cx, cy, sonarRadius, 0, Math.PI * 2);
        ctx.strokeStyle =
          mode === 'countdown'
            ? `rgba(239, 68, 68, ${sonarAlpha})`
            : `rgba(226, 232, 240, ${sonarAlpha})`;
        ctx.lineWidth = mode === 'scanning' ? 1.5 : 1;
        ctx.stroke();
      }

      // 6. Subtle orbital sweep line
      angle = (angle + (mode === 'scanning' ? 0.014 : 0.0035)) % (Math.PI * 2);
      const sweepLen = maxR * 0.96;
      const sx = cx + Math.cos(angle) * sweepLen;
      const sy = cy + Math.sin(angle) * sweepLen;
      const sweepGrad = ctx.createLinearGradient(cx, cy, sx, sy);
      sweepGrad.addColorStop(0, 'rgba(255,255,255,0)');
      sweepGrad.addColorStop(1, mode === 'scanning' ? 'rgba(226,232,240,0.18)' : 'rgba(226,232,240,0.06)');
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 7. One surgical red telemetry dot during active countdowns (and faint lock blip while scanning)
      if (mode === 'countdown' || mode === 'scanning') {
        const dotR = maxR * 0.72;
        const dx = cx + Math.cos(angle) * dotR;
        const dy = cy + Math.sin(angle) * dotR;
        const isRed = mode === 'countdown';

        const halo = ctx.createRadialGradient(dx, dy, 1, dx, dy, isRed ? 16 : 9);
        halo.addColorStop(0, isRed ? 'rgba(239, 68, 68, 0.85)' : 'rgba(248, 250, 252, 0.55)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(dx, dy, isRed ? 16 : 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isRed ? '#EF4444' : '#F8FAFC';
        ctx.beginPath();
        ctx.arc(dx, dy, isRed ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 8. Monochrome silver micro-sparks
      for (const s of sparks) {
        s.y += s.vy;
        s.pulse += 0.025;
        if (s.y < -6) {
          s.y = height + 6;
          s.x = Math.random() * width;
        }
        const a = Math.max(0.03, s.alpha * (0.65 + 0.35 * Math.sin(s.pulse)));
        ctx.fillStyle = `rgba(226, 232, 240, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
