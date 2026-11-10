'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface Spark {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 30-55 for blazing gold/orange/white
}

interface TeammateCandidate {
  name: string;
  role: string;
  squad: string;
}

const DEFAULT_TEAMMATES: TeammateCandidate[] = [
  { name: 'Mayank Goyal', role: 'AI/ML Lead', squad: 'Campus Turing' },
  { name: 'Team Titans', role: 'Hackathon Squad', squad: 'Sprint 27' },
  { name: 'Viraj Bashishtha', role: 'Full-Stack', squad: 'BST Innovators' },
  { name: 'Ayushman Sharma', role: 'UI/UX Architect', squad: 'Design Core' },
  { name: 'Team Obsidian', role: 'Web3 & Cloud', squad: 'Svyasa Hub' },
  { name: 'Priya Sharma', role: 'Smart Contracts', squad: 'Collegiate Hackers' },
  { name: 'DevForge Squad', role: 'Autonomous Systems', squad: 'NIT Labs' },
  { name: 'Rohan Verma', role: 'Systems Engineer', squad: 'CodeForge' },
];

/**
 * TeammatePortalCanvas
 * Renders an ambient, Doctor Strange-style fiery sling-ring portal in the outer flanks
 * of the landing hero. A sleek supersonic collegiate warp ship emerges carrying a
 * teammate's callsign, accelerates to lightspeed, and the portal snaps shut.
 */
export function TeammatePortalCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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

    const handleResize = () => updateDimensions();
    window.addEventListener('resize', handleResize, { passive: true });

    // Active jump state
    let isJumping = false;
    let jumpStartTime = 0;
    let nextJumpTime = performance.now() + 3200; // First jump after 3.2s
    let lastSide: 'left' | 'right' = 'right';

    // Portal geometry
    let portalX = 0;
    let portalY = 0;
    let portalTargetRadius = 60;
    let portalCurrentRadius = 0;
    let portalAngle = 0; // rotation of spark emitters
    let trajectoryAngle = 0; // Angle ship shoots towards

    // Current Teammate info
    let currentTeammate: TeammateCandidate = DEFAULT_TEAMMATES[0];
    let teammateRosterIndex = 0;

    // Particles
    const sparks: Spark[] = [];
    const warpTrails: Array<{ x: number; y: number; alpha: number; size: number }> = [];

    const spawnSparksAt = (
      cx: number,
      cy: number,
      radius: number,
      count: number,
      burst = false
    ) => {
      for (let i = 0; i < count; i++) {
        // Position along the ring
        const angle = Math.random() * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * 8;
        const sx = cx + Math.cos(angle) * r;
        const sy = cy + Math.sin(angle) * r;

        // Tangential velocity (Doctor Strange sling-ring spin)
        const tangent = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.45;
        const speed = burst
          ? Math.random() * 8 + 3
          : Math.random() * 4.5 + 2.2;
        const vx = Math.cos(tangent) * speed + (Math.random() - 0.5) * 1.5;
        const vy = Math.sin(tangent) * speed + (Math.random() - 0.5) * 1.5;

        sparks.push({
          x: sx,
          y: sy,
          prevX: sx,
          prevY: sy,
          vx,
          vy,
          life: 0,
          maxLife: Math.random() * 22 + 18,
          size: Math.random() * 1.8 + 0.9,
          hue: Math.random() < 0.25 ? 55 : Math.random() < 0.65 ? 38 : 24, // Gold, Amber, Fiery Orange
        });
      }
    };

    const triggerWarpJump = () => {
      // Pick opposite side or randomize
      const side = lastSide === 'left' ? 'right' : 'left';
      lastSide = side;

      // Position in peripheral negative space (as marked in reference Image 1)
      if (side === 'left') {
        portalX = width * (0.12 + Math.random() * 0.1);
        portalY = height * (0.32 + Math.random() * 0.32);
        // Trajectory shoots towards upper-right quadrant
        trajectoryAngle = -Math.PI * (0.1 + Math.random() * 0.16);
      } else {
        portalX = width * (0.78 + Math.random() * 0.1);
        portalY = height * (0.32 + Math.random() * 0.32);
        // Trajectory shoots towards upper-left quadrant
        trajectoryAngle = -Math.PI * (0.84 + Math.random() * 0.16);
      }

      portalTargetRadius = Math.min(68, Math.max(48, width * 0.045));
      portalCurrentRadius = 0;
      jumpStartTime = performance.now();
      isJumping = true;

      // Select next teammate (prioritize current user if signed in)
      if (user && Math.random() < 0.35) {
        currentTeammate = {
          name: profile?.display_name || user.email?.split('@')[0] || 'You',
          role: 'Collegiate Innovator',
          squad: profile?.college || 'Campus Lead',
        };
      } else {
        currentTeammate = DEFAULT_TEAMMATES[teammateRosterIndex % DEFAULT_TEAMMATES.length];
        teammateRosterIndex++;
      }
    };

    const render = (now: number) => {
      // Check if it's time for an ambient jump
      if (!isJumping && now >= nextJumpTime) {
        triggerWarpJump();
      }

      ctx.clearRect(0, 0, width, height);

      // Only draw if there are active particles or an ongoing jump
      if (isJumping || sparks.length > 0 || warpTrails.length > 0) {
        const elapsed = now - jumpStartTime;
        const totalDuration = 2400; // 2.4s sequence

        // 1. Portal Lifecycle Management
        if (isJumping) {
          if (elapsed < 600) {
            // Opening Phase (0 to 600ms)
            const progress = elapsed / 600;
            portalCurrentRadius = portalTargetRadius * Math.sin((progress * Math.PI) / 2);
            portalAngle += 0.28;
            spawnSparksAt(portalX, portalY, portalCurrentRadius, 6);
          } else if (elapsed < 1400) {
            // Active Stable Phase (600 to 1400ms) - Ship exits
            portalCurrentRadius = portalTargetRadius;
            portalAngle += 0.32;
            spawnSparksAt(portalX, portalY, portalCurrentRadius, 4);
          } else if (elapsed < 1850) {
            // Closing Collapse Phase (1400 to 1850ms)
            const closeProgress = (elapsed - 1400) / 450;
            portalCurrentRadius = portalTargetRadius * Math.max(0, 1 - closeProgress);
            portalAngle += 0.35;
            spawnSparksAt(portalX, portalY, portalCurrentRadius, 5, true);
          } else {
            // Sequence concluded
            isJumping = false;
            portalCurrentRadius = 0;
            nextJumpTime = now + (11000 + Math.random() * 5000); // 11-16s delay
          }
        }

        // 2. Render Portal Ring (Fiery Doctor Strange Glow)
        if (portalCurrentRadius > 2) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          // Inner dimensional warm core
          const grad = ctx.createRadialGradient(
            portalX,
            portalY,
            0,
            portalX,
            portalY,
            portalCurrentRadius * 1.15
          );
          grad.addColorStop(0, 'rgba(255, 230, 150, 0.22)');
          grad.addColorStop(0.5, 'rgba(255, 120, 20, 0.3)');
          grad.addColorStop(0.85, 'rgba(255, 80, 0, 0.55)');
          grad.addColorStop(1, 'rgba(255, 200, 50, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(portalX, portalY, portalCurrentRadius * 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Blazing spark ring perimeter
          ctx.strokeStyle = 'rgba(255, 220, 100, 0.85)';
          ctx.lineWidth = 2.8;
          ctx.shadowColor = '#FF8800';
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(portalX, portalY, portalCurrentRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Outer secondary ring with dashed rotation
          ctx.strokeStyle = 'rgba(255, 120, 20, 0.6)';
          ctx.lineWidth = 1.6;
          ctx.setLineDash([8, 12]);
          ctx.lineDashOffset = -portalAngle * 25;
          ctx.beginPath();
          ctx.arc(portalX, portalY, portalCurrentRadius * 1.05, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.restore();
        }

        // 3. Render Supersonic Spaceship & Teammate HUD
        if (isJumping && elapsed >= 500 && elapsed <= 1900) {
          const shipElapsed = elapsed - 500; // ms since ship emergence
          // Exponential acceleration curve (starts smooth, accelerates to warp speed)
          const flightTime = shipElapsed / 1000;
          const distance = 80 * flightTime + 480 * Math.pow(flightTime, 2.3);

          const shipX = portalX + Math.cos(trajectoryAngle) * distance;
          const shipY = portalY + Math.sin(trajectoryAngle) * distance;

          // Only render if within screen bounds (with margin)
          if (shipX > -150 && shipX < width + 150 && shipY > -150 && shipY < height + 150) {
            // Add to warp trails
            warpTrails.push({
              x: shipX,
              y: shipY,
              alpha: 0.9,
              size: Math.max(1.5, 3.5 - flightTime * 1.2),
            });

            ctx.save();
            ctx.translate(shipX, shipY);
            ctx.rotate(trajectoryAngle);

            // A) Ion Engine Thruster Trail Beam
            ctx.globalCompositeOperation = 'lighter';
            const beamLength = Math.min(220, 40 + distance * 0.35);
            const beamGrad = ctx.createLinearGradient(0, 0, -beamLength, 0);
            beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            beamGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.85)'); // Cyan core
            beamGrad.addColorStop(0.6, 'rgba(255, 140, 20, 0.6)');  // Orange flare
            beamGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');

            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(0, -3.5);
            ctx.lineTo(-beamLength, -0.8);
            ctx.lineTo(-beamLength, 0.8);
            ctx.lineTo(0, 3.5);
            ctx.closePath();
            ctx.fill();

            // Wingtip twin plasma trails
            ctx.fillStyle = 'rgba(255, 160, 40, 0.5)';
            ctx.beginPath();
            ctx.moveTo(-10, -11);
            ctx.lineTo(-beamLength * 0.6, -11);
            ctx.lineTo(-beamLength * 0.6, -10);
            ctx.lineTo(-10, -10);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-10, 11);
            ctx.lineTo(-beamLength * 0.6, 11);
            ctx.lineTo(-beamLength * 0.6, 10);
            ctx.lineTo(-10, 10);
            ctx.fill();

            // B) Sleek Delta-Wing Kinetic Starfighter Body
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#0F131D'; // Dark carbon stealth hull
            ctx.strokeStyle = '#FF9922'; // Neon orange armor trim
            ctx.lineWidth = 1.4;
            ctx.shadowColor = '#FF7700';
            ctx.shadowBlur = 8;

            ctx.beginPath();
            ctx.moveTo(18, 0);        // Nose
            ctx.lineTo(-8, -13);      // Left wingtip
            ctx.lineTo(-4, -4);       // Left fuselage join
            ctx.lineTo(-14, 0);       // Engine recess
            ctx.lineTo(-4, 4);        // Right fuselage join
            ctx.lineTo(-8, 13);       // Right wingtip
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cockpit Canopy (Glowing Neon Cyan slit)
            ctx.fillStyle = '#38BDF8';
            ctx.shadowColor = '#38BDF8';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(6, 0);
            ctx.lineTo(0, -1.8);
            ctx.lineTo(-4, 0);
            ctx.lineTo(0, 1.8);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // C) Floating Holographic Teammate Callsign Badge
            const badgeAlpha = Math.max(0, Math.min(1, (1.1 - flightTime * 0.8)));
            if (badgeAlpha > 0.05) {
              ctx.save();
              ctx.globalAlpha = badgeAlpha;

              // Position slightly above the ship
              const hudX = shipX + Math.cos(trajectoryAngle + Math.PI / 2) * 34;
              const hudY = shipY + Math.sin(trajectoryAngle + Math.PI / 2) * 34;

              const badgeWidth = 168;
              const badgeHeight = 28;
              const bx = hudX - badgeWidth / 2;
              const by = hudY - badgeHeight / 2;

              // Frosted high-tech card background
              ctx.fillStyle = 'rgba(9, 11, 16, 0.88)';
              ctx.strokeStyle = 'rgba(255, 150, 40, 0.4)';
              ctx.lineWidth = 1;
              ctx.shadowColor = 'rgba(255, 120, 0, 0.3)';
              ctx.shadowBlur = 8;

              // Rounded pill
              ctx.beginPath();
              ctx.roundRect(bx, by, badgeWidth, badgeHeight, 14);
              ctx.fill();
              ctx.stroke();

              // Glowing indicator beacon
              ctx.fillStyle = '#22C55E'; // Online live green
              ctx.shadowColor = '#22C55E';
              ctx.shadowBlur = 5;
              ctx.beginPath();
              ctx.arc(bx + 14, by + badgeHeight / 2, 3, 0, Math.PI * 2);
              ctx.fill();

              // Callsign / Teammate Name
              ctx.shadowBlur = 0;
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
              ctx.fillText(currentTeammate.name, bx + 24, by + 12);

              // Subtitle / Squad & Role
              ctx.fillStyle = '#F59E0B'; // Amber accent
              ctx.font = '9px monospace';
              ctx.fillText(`${currentTeammate.role} • ${currentTeammate.squad}`, bx + 24, by + 23);

              ctx.restore();
            }
          }
        }

        // 4. Render Dissipating Warp Particles
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = warpTrails.length - 1; i >= 0; i--) {
          const pt = warpTrails[i];
          pt.alpha -= 0.035;
          if (pt.alpha <= 0) {
            warpTrails.splice(i, 1);
            continue;
          }

          ctx.fillStyle = `rgba(255, 150, 40, ${pt.alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Render Fiery Tangential Sparks (Doctor Strange Physics)
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.prevX = s.x;
          s.prevY = s.y;

          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.94; // Air resistance drag
          s.vy *= 0.94;
          s.vy += 0.09; // Subtle gravity curl

          s.life++;

          if (s.life >= s.maxLife) {
            sparks.splice(i, 1);
            continue;
          }

          const progress = s.life / s.maxLife;
          const alpha = (1 - progress) * 0.95;

          // Motion streak line
          ctx.strokeStyle = `hsla(${s.hue}, 100%, ${Math.min(95, 50 + (1 - progress) * 45)}%, ${alpha.toFixed(2)})`;
          ctx.lineWidth = s.size * (1 - progress * 0.6);
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(s.prevX, s.prevY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Click on canvas to summon immediate portal jump
    const handleClick = (e: MouseEvent) => {
      if (!isJumping) {
        portalX = e.clientX;
        portalY = e.clientY;
        triggerWarpJump();
      }
    };
    canvas.addEventListener('click', handleClick);

    // Pause when tab hidden to save 100% resources
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, [user, profile]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${className}`}
      aria-hidden="true"
    />
  );
}
