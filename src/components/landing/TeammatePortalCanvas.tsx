'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  WarpPortalConfig,
  WarpShipCandidate,
  DEFAULT_WARP_PORTAL_CONFIG,
} from '@/types/warpPortal';

// 3D Point & Vector structures
interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Spark3D {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
  prevZ: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface LightningArc {
  p1: Point3D;
  p2: Point3D;
  life: number;
  maxLife: number;
  segments: Point3D[];
}

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

    // Live Config State (synchronized with Admin Control Center)
    let config: WarpPortalConfig = DEFAULT_WARP_PORTAL_CONFIG;

    // Load initial config from local storage or server
    try {
      const stored = localStorage.getItem('kollabrix_portal_warp_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.candidates)) config = parsed;
      }
    } catch {}

    fetch('/api/portal-warp')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.config) {
          config = data.config;
        }
      })
      .catch(() => {});

    // Listen for real-time live admin updates
    const handleConfigUpdate = (e: any) => {
      if (e.detail) config = e.detail;
    };
    window.addEventListener('kollabrix:portal-warp-update', handleConfigUpdate);

    // Camera 3D Perspective Parameters
    const focalLength = 650;
    const project = (p: Point3D): { x: number; y: number; scale: number; visible: boolean } => {
      const denom = p.z + focalLength;
      if (denom <= 20) return { x: 0, y: 0, scale: 0, visible: false };
      const scale = focalLength / denom;
      return {
        x: p.x * scale + width / 2,
        y: p.y * scale + height / 2,
        scale,
        visible: true,
      };
    };

    // 3D Jump Simulation State
    let isJumping = false;
    let jumpStartTime = 0;
    let nextJumpTime = performance.now() + 3000; // First jump after 3s
    let lastSide: 'left' | 'right' = 'right';

    // 3D Gate Parameters
    let gateCenter: Point3D = { x: 0, y: 0, z: 200 };
    let gateNormal: Point3D = { x: 0, y: 0, z: -1 };
    let gateRight: Point3D = { x: 1, y: 0, z: 0 };
    let gateUp: Point3D = { x: 0, y: 1, z: 0 };
    let gateRadius = 70;
    let gateCurrentRadius = 0;
    let gateSpinAngle = 0;

    // Active candidate passing through
    let activeCandidate: WarpShipCandidate = config.candidates[0] || DEFAULT_WARP_PORTAL_CONFIG.candidates[0];
    let candidateIndex = 0;

    // Particles & Lightning
    const sparks: Spark3D[] = [];
    const lightnings: LightningArc[] = [];
    const exhaustTrails: Array<{ p: Point3D; alpha: number; size: number }> = [];

    const getGlowPalette = (glowColor: string) => {
      switch (glowColor) {
        case 'cyan':
          return {
            primary: '#00E5FF',
            glow: '#38BDF8',
            rgbaHigh: 'rgba(56, 189, 248, 0.95)',
            rgbaMid: 'rgba(14, 165, 233, 0.6)',
            rgbaLow: 'rgba(2, 132, 199, 0.1)',
            sparkHue: 195,
          };
        case 'purple':
          return {
            primary: '#C084FC',
            glow: '#A855F7',
            rgbaHigh: 'rgba(192, 132, 252, 0.95)',
            rgbaMid: 'rgba(168, 85, 247, 0.6)',
            rgbaLow: 'rgba(147, 51, 234, 0.1)',
            sparkHue: 275,
          };
        case 'emerald':
          return {
            primary: '#34D399',
            glow: '#10B981',
            rgbaHigh: 'rgba(52, 211, 153, 0.95)',
            rgbaMid: 'rgba(16, 185, 129, 0.6)',
            rgbaLow: 'rgba(5, 150, 105, 0.1)',
            sparkHue: 155,
          };
        case 'amber':
        default:
          return {
            primary: '#FFD700',
            glow: '#FF8800',
            rgbaHigh: 'rgba(255, 220, 100, 0.95)',
            rgbaMid: 'rgba(255, 120, 20, 0.65)',
            rgbaLow: 'rgba(255, 80, 0, 0.1)',
            sparkHue: 42,
          };
      }
    };

    const triggerWarpJump = (overrideCandidate?: WarpShipCandidate) => {
      if (!config.enabled) return;

      const activeList = config.candidates.filter((c) => c.active);
      if (overrideCandidate) {
        activeCandidate = overrideCandidate;
      } else if (activeList.length > 0) {
        activeCandidate = activeList[candidateIndex % activeList.length];
        candidateIndex++;
      } else {
        activeCandidate = DEFAULT_WARP_PORTAL_CONFIG.candidates[0];
      }

      // Alternate flanks as circled in Image 1
      const side = lastSide === 'left' ? 'right' : 'left';
      lastSide = side;

      // 3D Depth Selection: random between distant horizon (Image 3) and cinematic mid-space
      const isFarDepth = Math.random() < 0.45;
      const targetZ = isFarDepth ? 420 + Math.random() * 200 : 120 + Math.random() * 140;

      // Position in 3D world space (left or right flank, clear of central headline)
      const xSign = side === 'left' ? -1 : 1;
      const targetX = xSign * (width * 0.38 + Math.random() * (width * 0.15));
      const targetY = (Math.random() - 0.48) * (height * 0.45);

      gateCenter = { x: targetX, y: targetY, z: targetZ };
      gateRadius = isFarDepth ? 55 : 78;
      gateCurrentRadius = 0;

      // 3D Gate Orientation Angles (Yaw & Pitch)
      // Points from the flank inwards towards the camera in dramatic 3D perspective
      const yaw = side === 'left' ? -0.85 - Math.random() * 0.25 : 0.85 + Math.random() * 0.25;
      const pitch = -0.15 + (Math.random() - 0.5) * 0.25;

      // Compute 3D Orthogonal Normal, Right, and Up basis vectors
      gateNormal = {
        x: -Math.sin(yaw) * Math.cos(pitch),
        y: Math.sin(pitch),
        z: -Math.cos(yaw) * Math.cos(pitch),
      };

      gateRight = {
        x: Math.cos(yaw),
        y: 0,
        z: -Math.sin(yaw),
      };

      gateUp = {
        x: -Math.sin(yaw) * Math.sin(pitch),
        y: -Math.cos(pitch),
        z: -Math.cos(yaw) * Math.sin(pitch),
      };

      jumpStartTime = performance.now();
      isJumping = true;
    };

    // Listen for manual trigger from Admin Control Center
    const handleTestTrigger = (e: any) => {
      triggerWarpJump(e.detail?.candidate);
    };
    window.addEventListener('kollabrix:test-warp-jump', handleTestTrigger);

    // Spawn 3D Tangential Doctor Strange Sparks around 3D ring
    const emit3DSparks = (ringCenter: Point3D, radius: number, count: number, burst = false) => {
      const palette = getGlowPalette(activeCandidate.glowColor);
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const rx = Math.cos(theta) * radius;
        const ry = Math.sin(theta) * radius;

        // Position on 3D ring plane
        const px = ringCenter.x + gateRight.x * rx + gateUp.x * ry;
        const py = ringCenter.y + gateRight.y * rx + gateUp.y * ry;
        const pz = ringCenter.z + gateRight.z * rx + gateUp.z * ry;

        // 3D Tangent Vector (sling-ring spin direction)
        const tangentX = -Math.sin(theta);
        const tangentY = Math.cos(theta);
        const speed = burst ? Math.random() * 9 + 4 : Math.random() * 5 + 2.5;

        const vx =
          (gateRight.x * tangentX + gateUp.x * tangentY) * speed +
          gateNormal.x * (Math.random() * 2) +
          (Math.random() - 0.5) * 1.5;
        const vy =
          (gateRight.y * tangentX + gateUp.y * tangentY) * speed +
          gateNormal.y * (Math.random() * 2) +
          (Math.random() - 0.5) * 1.5;
        const vz =
          (gateRight.z * tangentX + gateUp.z * tangentY) * speed +
          gateNormal.z * (Math.random() * 2) +
          (Math.random() - 0.5) * 1.5;

        sparks.push({
          x: px,
          y: py,
          z: pz,
          prevX: px,
          prevY: py,
          prevZ: pz,
          vx,
          vy,
          vz,
          life: 0,
          maxLife: Math.random() * 24 + 18,
          size: Math.random() * 2.2 + 1.0,
          hue: Math.random() < 0.25 ? 55 : palette.sparkHue,
        });
      }
    };

    // Spawn Electric Lightning Arcs between concentric rings (Image 3)
    const emitLightning = (r1Center: Point3D, r2Center: Point3D, radius: number) => {
      const theta = Math.random() * Math.PI * 2;
      const rx = Math.cos(theta) * radius;
      const ry = Math.sin(theta) * radius;

      const p1: Point3D = {
        x: r1Center.x + gateRight.x * rx + gateUp.x * ry,
        y: r1Center.y + gateRight.y * rx + gateUp.y * ry,
        z: r1Center.z + gateRight.z * rx + gateUp.z * ry,
      };

      const p2: Point3D = {
        x: r2Center.x + gateRight.x * rx + gateUp.x * ry,
        y: r2Center.y + gateRight.y * rx + gateUp.y * ry,
        z: r2Center.z + gateRight.z * rx + gateUp.z * ry,
      };

      // Generate 4-6 jagged intermediate segments
      const segments: Point3D[] = [p1];
      const count = 5;
      for (let j = 1; j < count; j++) {
        const frac = j / count;
        segments.push({
          x: p1.x + (p2.x - p1.x) * frac + (Math.random() - 0.5) * 14,
          y: p1.y + (p2.y - p1.y) * frac + (Math.random() - 0.5) * 14,
          z: p1.z + (p2.z - p1.z) * frac + (Math.random() - 0.5) * 14,
        });
      }
      segments.push(p2);

      lightnings.push({ p1, p2, life: 0, maxLife: Math.floor(Math.random() * 3 + 2), segments });
    };

    // Draw single 3D ring segment
    const draw3DRing = (
      ringCenter: Point3D,
      radius: number,
      strokeStyle: string,
      lineWidth: number,
      blurColor: string,
      blurSize: number,
      angleStart = 0,
      angleEnd = Math.PI * 2
    ) => {
      ctx.save();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = blurColor;
      ctx.shadowBlur = blurSize;

      ctx.beginPath();
      let started = false;
      const steps = 36;
      for (let i = 0; i <= steps; i++) {
        const a = angleStart + (angleEnd - angleStart) * (i / steps);
        const rx = Math.cos(a) * radius;
        const ry = Math.sin(a) * radius;

        const pt3D: Point3D = {
          x: ringCenter.x + gateRight.x * rx + gateUp.x * ry,
          y: ringCenter.y + gateRight.y * rx + gateUp.y * ry,
          z: ringCenter.z + gateRight.z * rx + gateUp.z * ry,
        };

        const proj = project(pt3D);
        if (proj.visible) {
          if (!started) {
            ctx.moveTo(proj.x, proj.y);
            started = true;
          } else {
            ctx.lineTo(proj.x, proj.y);
          }
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    // Draw 3D Volumetric Spaceship (Image 3 reference Battleship / Cruiser / Interceptor)
    const draw3DSpacecraft = (
      shipCenter: Point3D,
      progressFraction: number,
      palette: ReturnType<typeof getGlowPalette>
    ) => {
      const proj = project(shipCenter);
      if (!proj.visible) return;

      const sc = proj.scale;
      ctx.save();
      ctx.translate(proj.x, proj.y);

      // Compute 2D screen projection of ship's forward vector for orientation
      const noseTip3D: Point3D = {
        x: shipCenter.x + gateNormal.x * 40,
        y: shipCenter.y + gateNormal.y * 40,
        z: shipCenter.z + gateNormal.z * 40,
      };
      const projNose = project(noseTip3D);
      const angle2D = Math.atan2(projNose.y - proj.y, projNose.x - proj.x);
      ctx.rotate(angle2D);

      // Model Scale based on 3D perspective
      const s = sc * 1.35;

      if (activeCandidate.craftModel === 'battleship') {
        // --- 1. HEAVY INTERSTELLAR TITAN BATTLESHIP (Image 3) ---
        // A) Dual Giant Volumetric Thruster Plume
        ctx.globalCompositeOperation = 'lighter';
        const plumeLen = (180 + progressFraction * 140) * s;
        const pGrad = ctx.createLinearGradient(0, 0, -plumeLen, 0);
        pGrad.addColorStop(0, '#FFFFFF');
        pGrad.addColorStop(0.18, palette.primary);
        pGrad.addColorStop(0.65, palette.rgbaMid);
        pGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = pGrad;
        // Twin engine flares
        ctx.beginPath();
        ctx.moveTo(-16 * s, -9 * s);
        ctx.lineTo(-plumeLen, -3 * s);
        ctx.lineTo(-plumeLen, 3 * s);
        ctx.lineTo(-16 * s, 9 * s);
        ctx.closePath();
        ctx.fill();

        // B) Armored Battleship Multi-Deck Hull (Dark Titanium Carbon)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#0B0F19';
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = Math.max(1, 1.6 * s);
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 10 * s;

        // Main Lower Hull
        ctx.beginPath();
        ctx.moveTo(38 * s, 0); // Bow Ramming Prow
        ctx.lineTo(24 * s, -10 * s);
        ctx.lineTo(-14 * s, -14 * s);
        ctx.lineTo(-24 * s, -8 * s); // Port Engine Cowl
        ctx.lineTo(-24 * s, 8 * s);  // Starboard Engine Cowl
        ctx.lineTo(-14 * s, 14 * s);
        ctx.lineTo(24 * s, 10 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Upper Bridge Superstructure & Command Citadel
        ctx.fillStyle = '#161F30';
        ctx.strokeStyle = palette.rgbaHigh;
        ctx.lineWidth = Math.max(0.8, 1.2 * s);
        ctx.beginPath();
        ctx.moveTo(18 * s, 0);
        ctx.lineTo(4 * s, -6 * s);
        ctx.lineTo(-12 * s, -6 * s);
        ctx.lineTo(-18 * s, 0);
        ctx.lineTo(-12 * s, 6 * s);
        ctx.lineTo(4 * s, 6 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Outrigger Warp Nacelles (Image 3 rings generator coils)
        ctx.fillStyle = palette.primary;
        ctx.shadowBlur = 12 * s;
        ctx.fillRect(-8 * s, -13 * s, 14 * s, 2 * s);
        ctx.fillRect(-8 * s, 11 * s, 14 * s, 2 * s);
      } else {
        // --- 2. SUPERSONIC KINETIC INTERCEPTOR / CRUISER ---
        ctx.globalCompositeOperation = 'lighter';
        const plumeLen = (140 + progressFraction * 120) * s;
        const pGrad = ctx.createLinearGradient(0, 0, -plumeLen, 0);
        pGrad.addColorStop(0, '#FFFFFF');
        pGrad.addColorStop(0.3, palette.primary);
        pGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.moveTo(-10 * s, -4 * s);
        ctx.lineTo(-plumeLen, 0);
        ctx.lineTo(-10 * s, 4 * s);
        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#0D121F';
        ctx.strokeStyle = palette.primary;
        ctx.lineWidth = Math.max(1, 1.5 * s);
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 8 * s;

        // Needle Delta-Wing
        ctx.beginPath();
        ctx.moveTo(32 * s, 0);
        ctx.lineTo(-12 * s, -18 * s);
        ctx.lineTo(-6 * s, -5 * s);
        ctx.lineTo(-18 * s, 0);
        ctx.lineTo(-6 * s, 5 * s);
        ctx.lineTo(-12 * s, 18 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Glowing Cockpit Canopy
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 6 * s;
        ctx.beginPath();
        ctx.moveTo(12 * s, 0);
        ctx.lineTo(2 * s, -2 * s);
        ctx.lineTo(-2 * s, 0);
        ctx.lineTo(2 * s, 2 * s);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Holographic 3D Floating Callsign HUD Tag
      const hudAlpha = Math.max(0, Math.min(1, 1.2 - progressFraction * 0.9));
      if (hudAlpha > 0.08) {
        ctx.save();
        ctx.globalAlpha = hudAlpha;

        // Position slightly elevated in 3D
        const badgeWidth = Math.max(130, 175 * sc);
        const badgeHeight = Math.max(24, 30 * sc);
        const bx = proj.x - badgeWidth / 2;
        const by = proj.y - 36 * sc - badgeHeight;

        ctx.fillStyle = 'rgba(9, 11, 16, 0.88)';
        ctx.strokeStyle = palette.rgbaMid;
        ctx.lineWidth = 1;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.roundRect(bx, by, badgeWidth, badgeHeight, 14 * sc);
        ctx.fill();
        ctx.stroke();

        // Beacon dot
        ctx.fillStyle = '#22C55E';
        ctx.shadowColor = '#22C55E';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(bx + 14 * sc, by + badgeHeight / 2, 3 * sc, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(10, Math.round(11 * sc))}px system-ui, sans-serif`;
        ctx.fillText(activeCandidate.name, bx + 22 * sc, by + badgeHeight * 0.44);

        ctx.fillStyle = palette.primary;
        ctx.font = `${Math.max(8, Math.round(9 * sc))}px monospace`;
        ctx.fillText(
          `${activeCandidate.role} • ${activeCandidate.squad}`,
          bx + 22 * sc,
          by + badgeHeight * 0.8
        );

        ctx.restore();
      }
    };

    const render = (now: number) => {
      // Check for scheduled jump
      if (!isJumping && now >= nextJumpTime) {
        triggerWarpJump();
      }

      ctx.clearRect(0, 0, width, height);

      if (isJumping || sparks.length > 0 || lightnings.length > 0 || exhaustTrails.length > 0) {
        const elapsed = now - jumpStartTime;
        const palette = getGlowPalette(activeCandidate.glowColor);

        // 1. Gate Lifecycle & Radius Animation
        if (isJumping) {
          if (elapsed < 650) {
            // Opening Phase
            const p = elapsed / 650;
            gateCurrentRadius = gateRadius * Math.sin((p * Math.PI) / 2);
            gateSpinAngle += 0.32;
            emit3DSparks(gateCenter, gateCurrentRadius, 7);
          } else if (elapsed < 1550) {
            // Stable Active Gate - Ship traverses through!
            gateCurrentRadius = gateRadius;
            gateSpinAngle += 0.36;
            emit3DSparks(gateCenter, gateCurrentRadius, 5);

            // Generate Lightning Arcs between concentric rings (Image 3)
            if (config.lightningArcs && Math.random() < 0.38) {
              const r1 = gateCenter;
              const r2: Point3D = {
                x: gateCenter.x - gateNormal.x * 45,
                y: gateCenter.y - gateNormal.y * 45,
                z: gateCenter.z - gateNormal.z * 45,
              };
              emitLightning(r1, r2, gateCurrentRadius * 0.95);
            }
          } else if (elapsed < 2050) {
            // Closing Collapse Phase
            const cp = (elapsed - 1550) / 500;
            gateCurrentRadius = gateRadius * Math.max(0, 1 - cp);
            gateSpinAngle += 0.42;
            emit3DSparks(gateCenter, gateCurrentRadius, 6, true);
          } else {
            // Concluded sequence
            isJumping = false;
            gateCurrentRadius = 0;
            nextJumpTime = now + config.intervalSeconds * 1000 + Math.random() * 2000;
          }
        }

        // 2. Draw Back-Half of Concentric 3D Rings & Inner Dimensional Swirl
        if (gateCurrentRadius > 3) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          // Ring depth centers for multi-ring gate (Image 3)
          const ringOffsets = config.multiRingGate ? [0, -38, -76] : [0];

          // Inner Wormhole Event Horizon
          const projCenter = project(gateCenter);
          if (projCenter.visible) {
            const vGrad = ctx.createRadialGradient(
              projCenter.x,
              projCenter.y,
              0,
              projCenter.x,
              projCenter.y,
              gateCurrentRadius * projCenter.scale * 1.2
            );
            vGrad.addColorStop(0, palette.rgbaHigh);
            vGrad.addColorStop(0.45, palette.rgbaMid);
            vGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = vGrad;
            ctx.beginPath();
            ctx.arc(projCenter.x, projCenter.y, gateCurrentRadius * projCenter.scale * 1.1, 0, Math.PI * 2);
            ctx.fill();
          }

          // Back arcs of the concentric rings
          ringOffsets.forEach((dz, idx) => {
            const rCenter: Point3D = {
              x: gateCenter.x + gateNormal.x * dz,
              y: gateCenter.y + gateNormal.y * dz,
              z: gateCenter.z + gateNormal.z * dz,
            };
            const r = gateCurrentRadius * (1 - idx * 0.08);
            draw3DRing(
              rCenter,
              r,
              palette.rgbaHigh,
              Math.max(1, 2.8 * (1 - idx * 0.15)),
              palette.glow,
              14
            );
          });

          ctx.restore();
        }

        // 3. Draw 3D Spaceship Entering & Passing Through the Ring
        if (isJumping && elapsed >= 450 && elapsed <= 2100) {
          const shipElapsed = elapsed - 450;
          const flightSec = shipElapsed / 1000;
          // Exponential Warp Acceleration curve:
          // Starts from behind Ring 2 (-160px), penetrates Ring 0 (0px), and soars forward (+1200px)
          const distanceAlongNormal = -140 + 90 * flightSec + 620 * Math.pow(flightSec, 2.4);

          const shipPos3D: Point3D = {
            x: gateCenter.x + gateNormal.x * distanceAlongNormal,
            y: gateCenter.y + gateNormal.y * distanceAlongNormal,
            z: gateCenter.z + gateNormal.z * distanceAlongNormal,
          };

          draw3DSpacecraft(shipPos3D, flightSec / 1.5, palette);
        }

        // 4. Draw Electric Lightning Arcs (Image 3)
        if (lightnings.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let i = lightnings.length - 1; i >= 0; i--) {
            const arc = lightnings[i];
            arc.life++;
            if (arc.life >= arc.maxLife) {
              lightnings.splice(i, 1);
              continue;
            }

            ctx.strokeStyle = '#00E5FF';
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.2;

            ctx.beginPath();
            let started = false;
            arc.segments.forEach((pt) => {
              const pProj = project(pt);
              if (pProj.visible) {
                if (!started) {
                  ctx.moveTo(pProj.x, pProj.y);
                  started = true;
                } else {
                  ctx.lineTo(pProj.x, pProj.y);
                }
              }
            });
            ctx.stroke();
          }
          ctx.restore();
        }

        // 5. Render 3D Doctor Strange Sparks (Foreshortened Tangential Embers)
        if (sparks.length > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.prevX = s.x;
            s.prevY = s.y;
            s.prevZ = s.z;

            s.x += s.vx;
            s.y += s.vy;
            s.z += s.vz;
            s.vx *= 0.94; // 3D air resistance
            s.vy *= 0.94;
            s.vz *= 0.94;
            s.vy += 0.08; // subtle gravity

            s.life++;
            if (s.life >= s.maxLife) {
              sparks.splice(i, 1);
              continue;
            }

            const projPrev = project({ x: s.prevX, y: s.prevY, z: s.prevZ });
            const projCurr = project({ x: s.x, y: s.y, z: s.z });

            if (projPrev.visible && projCurr.visible) {
              const prog = s.life / s.maxLife;
              const alpha = (1 - prog) * 0.95;

              ctx.strokeStyle = `hsla(${s.hue}, 100%, ${Math.min(95, 50 + (1 - prog) * 45)}%, ${alpha.toFixed(2)})`;
              ctx.lineWidth = s.size * projCurr.scale * (1 - prog * 0.5);
              ctx.lineCap = 'round';

              ctx.beginPath();
              ctx.moveTo(projPrev.x, projPrev.y);
              ctx.lineTo(projCurr.x, projCurr.y);
              ctx.stroke();
            }
          }
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Pause on hidden tab to save 100% CPU
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
      window.removeEventListener('kollabrix:portal-warp-update', handleConfigUpdate);
      window.removeEventListener('kollabrix:test-warp-jump', handleTestTrigger);
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
