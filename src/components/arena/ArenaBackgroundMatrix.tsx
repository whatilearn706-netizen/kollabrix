'use client';

import React, { useEffect, useRef } from 'react';

interface ArenaBackgroundMatrixProps {
  className?: string;
}

export function ArenaBackgroundMatrix({ className = '' }: ArenaBackgroundMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Particles system
    const particleCount = Math.min(width > 768 ? 65 : 30, 80);
    const particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      color: string;
      alpha: number;
      alphaSpeed: number;
    }[] = [];

    const colors = ['#06b6d4', '#f43f5e', '#3b82f6', '#8b5cf6', '#10b981'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedY: -(Math.random() * 0.4 + 0.15),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        alphaSpeed: (Math.random() - 0.5) * 0.01,
      });
    }

    let gridOffset = 0;

    const render = () => {
      // 1. Clear background with deep cyber gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#04060d');
      bgGrad.addColorStop(0.5, '#070a14');
      bgGrad.addColorStop(1, '#03050a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Dual stadium light spotlights
      // Team Alpha Spotlight (Cyan / Blue, Top-Left)
      const spotAlpha = ctx.createRadialGradient(width * 0.2, 0, 10, width * 0.25, height * 0.4, width * 0.5);
      spotAlpha.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      spotAlpha.addColorStop(0.5, 'rgba(14, 116, 144, 0.05)');
      spotAlpha.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotAlpha;
      ctx.fillRect(0, 0, width, height);

      // Team Omega Spotlight (Rose / Crimson, Top-Right)
      const spotOmega = ctx.createRadialGradient(width * 0.8, 0, 10, width * 0.75, height * 0.4, width * 0.5);
      spotOmega.addColorStop(0, 'rgba(244, 63, 94, 0.15)');
      spotOmega.addColorStop(0.5, 'rgba(190, 18, 60, 0.05)');
      spotOmega.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotOmega;
      ctx.fillRect(0, 0, width, height);

      // 3. 3D Perspective Ground Grid
      gridOffset = (gridOffset + 0.5) % 36;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      const horizon = height * 0.62;
      const fovX = width * 0.5;

      // Vertical perspective lines radiating from horizon center
      for (let x = -width * 0.6; x <= width * 1.6; x += 70) {
        ctx.beginPath();
        ctx.moveTo(fovX, horizon);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal ground lines with exponential perspective spacing
      for (let y = horizon + 8; y <= height; y += (y - horizon) * 0.35 + 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 4. Floating Digital Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.alpha += p.alphaSpeed;

        if (p.alpha <= 0.1 || p.alpha >= 0.7) {
          p.alphaSpeed *= -1;
        }

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.7, p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // 5. Subtle CRT Horizontal Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
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
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
