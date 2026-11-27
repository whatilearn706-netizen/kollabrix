'use client';

import React, { useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface KaAiParticleOrbProps {
  onClick?: () => void;
  size?: number;
}

/**
 * Interactive 3D Particle Acoustic Wave Orb inspired by pin.it/51DEzK4WU:
 * Renders layered latitude/longitude dotted contours with organic billowing crests
 * in electric cobalt & ice cyan around a dark central mic badge.
 */
export function KaAiParticleOrb({ onClick, size = 280 }: KaAiParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Precompute sphere surface dots along latitude/longitude rings
    const points: Array<{ theta: number; phi: number }> = [];
    const latSteps = 34;
    const lonSteps = 56;
    for (let i = 1; i < latSteps; i++) {
      const phi = (i / latSteps) * Math.PI;
      for (let j = 0; j < lonSteps; j++) {
        const theta = (j / lonSteps) * Math.PI * 2;
        points.push({ theta, phi });
      }
    }

    let rafId = 0;
    let time = 0;

    const render = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(render);
        return;
      }

      time += 0.014;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const baseR = Math.round(size * 0.343);
      const scaleFactor = size / 280;

      // Soft dark sphere core & outer indigo bloom
      const coreGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, baseR + 22);
      coreGrad.addColorStop(0, 'rgba(3, 10, 32, 0.96)');
      coreGrad.addColorStop(0.68, 'rgba(8, 22, 68, 0.72)');
      coreGrad.addColorStop(0.92, 'rgba(37, 99, 235, 0.25)');
      coreGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR + 22, 0, Math.PI * 2);
      ctx.fill();

      const cosY = Math.cos(time * 0.45);
      const sinY = Math.sin(time * 0.45);

      for (let i = 0; i < points.length; i++) {
        const { theta, phi } = points[i];

        // Organic harmonic wave displacement along upper-right & lower-left ridges
        const wave =
          (Math.sin(theta * 2.5 + phi * 2.0 - time * 1.4) * 9.5 +
            Math.cos(phi * 3.2 - theta * 1.5 + time * 1.1) * 5.5) *
          scaleFactor;
        const r = baseR + wave;

        const sx = r * Math.sin(phi) * Math.cos(theta);
        const sy = r * Math.cos(phi);
        const sz = r * Math.sin(phi) * Math.sin(theta);

        // Rotate slowly around Y axis
        const x = sx * cosY - sz * sinY;
        const z = sx * sinY + sz * cosY;
        const y = sy * 0.97 + sz * 0.14;

        // Perspective projection
        const depth = (z + baseR * 1.35) / (baseR * 2.4);
        if (depth < 0.08) continue;

        const px = cx + x;
        const py = cy + y;

        // Rim & crest brightness boost
        const rimBoost = Math.max(0, 1 - Math.abs(depth - 0.55) * 1.35);
        const crest = Math.max(0, wave / 15);
        const alpha = Math.min(0.95, 0.14 + depth * 0.48 + crest * 0.36);

        const dotSize = depth > 0.72 || crest > 0.45 ? 1.45 : 1.05;
        if (crest > 0.35 || rimBoost > 0.6) {
          ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        }

        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [size]);

  const badgeDim = size < 220 ? 'w-10 h-10' : 'w-14 h-14';
  const iconDim = size < 220 ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Activate KΛ ΛI Voice & Prompt Studio"
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative group inline-flex items-center justify-center cursor-pointer focus:outline-none"
    >
      <canvas ref={canvasRef} className="block" />
      {/* Center dark circular badge + crisp white microphone */}
      <span
        className={`absolute ${badgeDim} rounded-full bg-[#06102B]/90 border border-blue-300/20 shadow-[0_0_28px_rgba(37,99,235,0.4)] flex items-center justify-center group-hover:scale-110 group-hover:border-sky-300/50 transition-all duration-300`}
      >
        <Mic className={`${iconDim} text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.75)]`} />
      </span>
    </button>
  );
}
