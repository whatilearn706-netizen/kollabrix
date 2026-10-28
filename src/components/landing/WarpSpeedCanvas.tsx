'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  color: string;
}

/**
 * 60fps-120fps Hyperspace / Light Speed Warp Starfield
 * Recreates the exact radial light-speed stars animation from the user's reference image
 * (traveling through space at light speed, stars streaking from center outward, without the spaceship)
 */
export function WarpSpeedCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || window.innerHeight;
    };
    updateDimensions();

    const numStars = 950;
    const speed = 19; // Hyperspace light speed factor
    const maxZ = 1200;

    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(255, 255, 255, ',
      'rgba(245, 158, 11, ', // subtle warm amber
      'rgba(251, 146, 60, ',  // warm orange
      'rgba(186, 230, 253, ', // cosmic light blue
    ];

    const stars: Star[] = [];

    const spawnStar = (initialZ?: number): Star => {
      const angle = Math.random() * Math.PI * 2;
      // Exponential distribution so stars originate smoothly from center to screen edge
      const distance = Math.pow(Math.random(), 0.5) * (Math.max(width, height) * 0.95);
      const z = initialZ !== undefined ? initialZ : Math.random() * maxZ + 100;
      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        z,
        prevZ: z + speed * 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    for (let i = 0; i < numStars; i++) {
      stars.push(spawnStar(Math.random() * maxZ + 20));
    }

    const handleResize = () => {
      updateDimensions();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      const centerX = width / 2;
      const centerY = height / 2;

      // Dark space canvas with motion trail persistence
      ctx.fillStyle = '#090B10';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        star.prevZ = star.z;
        star.z -= speed;

        // Reset if star has zoomed past the viewer
        if (star.z <= 12) {
          stars[i] = spawnStar(maxZ);
          continue;
        }

        const k = 260 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        const prevK = 260 / star.prevZ;
        const prevPx = star.x * prevK + centerX;
        const prevPy = star.y * prevK + centerY;

        // If off screen, recycle to the deep horizon
        if (px < -60 || px > width + 60 || py < -60 || py > height + 60) {
          stars[i] = spawnStar(maxZ);
          continue;
        }

        const depthRatio = 1 - star.z / maxZ;
        const alpha = Math.min(1, Math.max(0.12, depthRatio * 1.5));
        const lineWidth = Math.max(0.7, depthRatio * 2.8);

        ctx.beginPath();
        ctx.strokeStyle = `${star.color}${alpha.toFixed(2)})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.moveTo(prevPx, prevPy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
