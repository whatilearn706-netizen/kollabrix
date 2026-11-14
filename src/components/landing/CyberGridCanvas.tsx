'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  flareTimer: number;
}

interface EmberFragment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
}

interface CyberEmber {
  x: number;
  y: number;
  startY: number;
  targetY: number;
  vx: number;
  vy: number;
  wobblePhase: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  size: number;
  alpha: number;
  hue: number; // 25 (warm orange) to 42 (bright gold)
  splitProgress: number; // point at which it breaks apart (0.5 to 0.75)
  hasSplit: boolean;
  fragments: EmberFragment[];
}

interface LightBeam {
  x: number;
  startY: number;
  targetHeight: number;
  width: number;
  alpha: number;
  maxAlpha: number;
  state: 'rising' | 'fading';
}

export function CyberGridCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Load Concept 2 background image
    const bgImage = new Image();
    bgImage.src = '/brand/hero-cyber-grid.webp';
    let isBgLoaded = false;
    bgImage.onload = () => {
      isBgLoaded = true;
    };

    const updateDimensions = () => {
      if (!canvas || !canvas.parentElement) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    updateDimensions();

    // ── 1. Twinkling Sky Stars Setup ──
    const stars: Star[] = [];
    const numStars = 65;
    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.42), // Upper cosmic sky
          radius: Math.random() * 1.3 + 0.6,
          baseAlpha: Math.random() * 0.45 + 0.2,
          twinkleSpeed: Math.random() * 0.04 + 0.015,
          phase: Math.random() * Math.PI * 2,
          flareTimer: Math.random() * 600,
        });
      }
    };
    initStars();

    // ── 2. Rising Fire Embers with Fragmentation ──
    const embers: CyberEmber[] = [];
    const maxEmbers = 48;

    const spawnEmber = (): CyberEmber => {
      // Spawn across the glowing cyber-grid floor
      const startX = Math.random() * width;
      const startY = height * (0.62 + Math.random() * 0.36);
      // Random ceiling: some disappear early (0.5h), some reach high into sky (0.18h)
      const targetY = height * (0.18 + Math.random() * 0.38);

      return {
        x: startX,
        y: startY,
        startY,
        targetY,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 1.4 + 0.9), // upward thrust
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        wobbleAmp: Math.random() * 1.2 + 0.4,
        size: Math.random() * 2.2 + 1.4,
        alpha: 0,
        hue: Math.random() > 0.4 ? 32 + Math.random() * 12 : 24 + Math.random() * 8, // molten amber-gold
        splitProgress: Math.random() * 0.25 + 0.45, // breaks apart halfway up
        hasSplit: false,
        fragments: [],
      };
    };

    for (let i = 0; i < maxEmbers; i++) {
      const e = spawnEmber();
      // Pre-warm vertical positions so they don't all start at bottom at t=0
      e.y = e.startY - Math.random() * (e.startY - e.targetY);
      embers.push(e);
    }

    // ── 3. Random Upward Vertical Light Beams ──
    const lightBeams: LightBeam[] = [];
    let beamSpawnCooldown = 0;

    const spawnBeam = () => {
      const startY = height * (0.68 + Math.random() * 0.28);
      const targetHeight = height * (0.35 + Math.random() * 0.45);
      lightBeams.push({
        x: Math.random() * width,
        startY,
        targetHeight,
        width: Math.random() * 2.5 + 1.0,
        alpha: 0,
        maxAlpha: Math.random() * 0.45 + 0.25,
        state: 'rising',
      });
    };

    // Resize handler
    const handleResize = () => {
      updateDimensions();
      initStars();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let time = 0;

    // ── Render Loop ──
    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // A. Draw Concept 2 Base Backdrop
      if (isBgLoaded) {
        // Draw image covering viewport with slight ambient vertical breathing
        const scale = Math.max(width / bgImage.width, height / bgImage.height) * 1.02;
        const imgW = bgImage.width * scale;
        const imgH = bgImage.height * scale;
        const imgX = (width - imgW) / 2;
        const imgY = (height - imgH) / 2;
        ctx.drawImage(bgImage, imgX, imgY, imgW, imgH);
      } else {
        ctx.fillStyle = '#090B10';
        ctx.fillRect(0, 0, width, height);
      }

      // B. Ambient Vignette Gradient (keeps center text ultra-readable)
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.48,
        width * 0.15,
        width / 2,
        height * 0.5,
        Math.max(width, height) * 0.72
      );
      grad.addColorStop(0, 'rgba(9, 11, 16, 0.45)');
      grad.addColorStop(0.55, 'rgba(9, 11, 16, 0.65)');
      grad.addColorStop(1, 'rgba(9, 11, 16, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // C. Render Twinkling Stars in Cosmic Sky
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.phase += s.twinkleSpeed;
        const twinkle = Math.sin(s.phase);
        let alpha = s.baseAlpha + twinkle * 0.35;
        alpha = Math.max(0.08, Math.min(1, alpha));

        ctx.fillStyle = `rgba(255, 235, 200, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Occasional brilliant sparkle glint
        s.flareTimer++;
        if (s.flareTimer > 400 && Math.sin(s.phase) > 0.92) {
          ctx.strokeStyle = `rgba(255, 200, 120, ${alpha * 0.8})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(s.x - 5, s.y);
          ctx.lineTo(s.x + 5, s.y);
          ctx.moveTo(s.x, s.y - 5);
          ctx.lineTo(s.x, s.y + 5);
          ctx.stroke();
          if (s.flareTimer > 460) s.flareTimer = 0;
        }
      }

      // D. Render Random Upward Light Beams
      beamSpawnCooldown++;
      if (beamSpawnCooldown > 95 && lightBeams.length < 4) {
        spawnBeam();
        beamSpawnCooldown = 0;
      }

      for (let i = lightBeams.length - 1; i >= 0; i--) {
        const b = lightBeams[i];
        if (b.state === 'rising') {
          b.alpha += 0.015;
          if (b.alpha >= b.maxAlpha) {
            b.state = 'fading';
          }
        } else {
          b.alpha -= 0.009;
        }

        if (b.alpha <= 0) {
          lightBeams.splice(i, 1);
          continue;
        }

        // Vertical laser conduit beam
        const beamGrad = ctx.createLinearGradient(b.x, b.startY, b.x, b.startY - b.targetHeight);
        beamGrad.addColorStop(0, `rgba(255, 140, 20, ${b.alpha * 0.9})`);
        beamGrad.addColorStop(0.3, `rgba(255, 180, 50, ${b.alpha * 0.7})`);
        beamGrad.addColorStop(0.8, `rgba(255, 220, 100, ${b.alpha * 0.3})`);
        beamGrad.addColorStop(1, 'rgba(255, 160, 40, 0)');

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = b.width;
        ctx.beginPath();
        ctx.moveTo(b.x, b.startY);
        ctx.lineTo(b.x, b.startY - b.targetHeight);
        ctx.stroke();

        // Soft glow halo
        ctx.strokeStyle = `rgba(255, 120, 0, ${b.alpha * 0.25})`;
        ctx.lineWidth = b.width * 3.5;
        ctx.stroke();
      }

      // E. Render Rising Embers & Breaking Fire Sparks
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];

        // Move upward with organic sine thermal sway
        e.wobblePhase += e.wobbleSpeed;
        e.x += e.vx + Math.sin(e.wobblePhase) * e.wobbleAmp;
        e.y += e.vy;

        const totalDist = e.startY - e.targetY;
        const currentDist = e.startY - e.y;
        const progress = Math.max(0, Math.min(1, currentDist / totalDist));

        // Fade in smoothly at bottom, fade out near top
        if (progress < 0.15) {
          e.alpha = progress / 0.15;
        } else if (progress > 0.75) {
          e.alpha = 1 - (progress - 0.75) / 0.25;
        } else {
          e.alpha = 0.95;
        }

        // "in between it start breaking": Fragment into micro-sparks
        if (!e.hasSplit && progress >= e.splitProgress) {
          e.hasSplit = true;
          const numFrags = Math.floor(Math.random() * 3) + 2;
          for (let f = 0; f < numFrags; f++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.2 + 0.4;
            e.fragments.push({
              x: e.x,
              y: e.y,
              vx: Math.cos(angle) * speed + e.vx * 0.4,
              vy: Math.sin(angle) * speed + e.vy * 0.6,
              alpha: 0.9,
              decay: Math.random() * 0.04 + 0.02,
              size: Math.max(0.8, e.size * 0.45),
            });
          }
          // Main ember shrinks after splitting
          e.size *= 0.6;
        }

        // Draw main ascending ember (if still alive)
        if (e.alpha > 0.02 && e.y > e.targetY) {
          ctx.save();
          // Molten amber outer bloom
          ctx.fillStyle = `hsla(${e.hue}, 100%, 55%, ${e.alpha * 0.85})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
          ctx.fill();

          // Incandescent white-hot center core
          ctx.fillStyle = `rgba(255, 255, 240, ${e.alpha})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Update and draw breaking fragments
        for (let f = e.fragments.length - 1; f >= 0; f--) {
          const frag = e.fragments[f];
          frag.x += frag.vx;
          frag.y += frag.vy;
          frag.vx *= 0.96; // air drag
          frag.vy *= 0.96;
          frag.alpha -= frag.decay;

          if (frag.alpha <= 0) {
            e.fragments.splice(f, 1);
            continue;
          }

          ctx.fillStyle = `hsla(${e.hue + 8}, 100%, 65%, ${frag.alpha})`;
          ctx.beginPath();
          ctx.arc(frag.x, frag.y, frag.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Respawn if ember reached its ceiling and all fragments have dispersed
        if (e.y <= e.targetY && e.fragments.length === 0) {
          embers[i] = spawnEmber();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}
