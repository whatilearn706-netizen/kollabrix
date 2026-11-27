'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { buildCyberDuelist3D } from './Arena3DHangarCharacter';

interface Arena3DHangarWorldProps {
  avatarId: string;
  algoLanguage: string;
  combatMode?: string;
  playerName?: string;
  playerCollege?: string;
  tier?: string;
  elo?: number;
  wins?: number;
  losses?: number;
  winStreak?: number;
  teamSize?: string;
  paused?: boolean;
}

function createBeamTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    // Cool ice-blue & crisp white stadium floodlight cone (pin.it/2r437XD0o)
    grad.addColorStop(0, 'rgba(224, 242, 254, 0.34)');
    grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.14)');
    grad.addColorStop(1, 'rgba(3, 7, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);
  }
  return new THREE.CanvasTexture(c);
}

function createRadialGlowTexture(
  innerRgba: string,
  midRgba: string,
  outerRgba = 'rgba(0,0,0,0)'
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 128);
    g.addColorStop(0, innerRgba);
    g.addColorStop(0.42, midRgba);
    g.addColorStop(1, outerRgba);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
  }
  return new THREE.CanvasTexture(c);
}

/**
 * Kollabrix Battle Arena Stadium Stage (adapted from https://pin.it/2r437XD0o):
 * - Deep midnight navy-black enclosed indoor arena amphitheater bowl
 * - Curved upper seating tiers with glowing ice-white / pale-blue LED ribbon panels
 * - Concentric curved overhead banks of bright stadium floodlights with soft misty beams
 * - Central dark arena portal monolith & vivid cobalt-blue atmospheric horizon bloom
 * - Glossy midnight reflective court floor with crisp white sweeping court arcs & center circle
 * - Interactive 3D Boy Character standing on a sleek dark obsidian & ice-blue pedestal dais
 */
export function Arena3DHangarWorld({
  avatarId,
  algoLanguage,
  combatMode = 'blitz',
  playerName = 'Builder',
  playerCollege = 'KOLLABRIX',
  tier = 'SILVER I',
  elo = 1200,
  wins = 0,
  losses = 0,
  winStreak = 0,
  teamSize = '1v1',
  paused = false,
}: Arena3DHangarWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const avatarIdRef = useRef(avatarId);
  avatarIdRef.current = avatarId;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const eloRef = useRef(elo);
  eloRef.current = elo;
  const winsRef = useRef(wins);
  winsRef.current = wins;
  const streakRef = useRef(winStreak);
  streakRef.current = winStreak;
  const duelistInstanceRef = useRef<ReturnType<typeof buildCyberDuelist3D> | null>(null);
  const profileSnapshotRef = useRef({
    avatarId,
    playerName,
    playerCollege,
    tier,
    elo,
    wins,
    losses,
    winStreak,
    algoLanguage,
    combatMode,
  });
  profileSnapshotRef.current = {
    avatarId,
    playerName,
    playerCollege,
    tier,
    elo,
    wins,
    losses,
    winStreak,
    algoLanguage,
    combatMode,
  };

  useEffect(() => {
    duelistInstanceRef.current?.updateProfile(profileSnapshotRef.current);
  }, [avatarId, algoLanguage, combatMode, playerName, playerCollege, tier, elo, wins, losses, winStreak]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    let envRT: THREE.WebGLRenderTarget | null = null;
    let rafId = 0;

    try {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020306);
      scene.fog = new THREE.FogExp2(0x020306, 0.052);

      const camera = new THREE.PerspectiveCamera(47, width / height, 0.1, 90);
      camera.position.set(0, 1.38, 4.95);
      camera.lookAt(0, 0.92, -4.0);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      container.appendChild(renderer.domElement);

      pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envRT = pmrem.fromScene(roomEnv, 0.04);
      scene.environment = envRT.texture;
      roomEnv.dispose();

      const geos: THREE.BufferGeometry[] = [];
      const mats: THREE.Material[] = [];
      const textures: THREE.Texture[] = [];
      const tg = <T extends THREE.BufferGeometry>(g: T): T => {
        geos.push(g);
        return g;
      };
      const tm = <T extends THREE.Material>(m: T): T => {
        mats.push(m);
        return m;
      };

      // --- STADIUM FLOODLIGHT & COBALT HORIZON LIGHTING ---
      scene.add(new THREE.HemisphereLight(0xdbeafe, 0x050914, 0.96));

      const topKey = new THREE.DirectionalLight(0xf0f7ff, 2.0);
      topKey.position.set(-1.6, 5.4, 3.8);
      scene.add(topKey);

      const frontFill = new THREE.DirectionalLight(0xe0f2fe, 1.0);
      frontFill.position.set(2.2, 2.2, 4.6);
      scene.add(frontFill);

      const centerPortalLight = new THREE.PointLight(0x2563eb, 14.0, 26, 1.4);
      centerPortalLight.position.set(0, 1.8, -11.2);
      scene.add(centerPortalLight);

      const leftIceRim = new THREE.PointLight(0x60a5fa, 5.0, 16);
      leftIceRim.position.set(-3.4, 2.2, -2.0);
      scene.add(leftIceRim);

      const rightIceRim = new THREE.PointLight(0x38bdf8, 5.0, 16);
      rightIceRim.position.set(3.4, 2.2, -2.0);
      scene.add(rightIceRim);

      // --- GLOSSY KOLLABRIX OBSIDIAN FLOOR + ARCHITECTURAL BLUEPRINT GRID ---
      const mirrorFloor = new Reflector(tg(new THREE.PlaneGeometry(48, 48)), {
        clipBias: 0.003,
        textureWidth: Math.min(512, width),
        textureHeight: Math.min(512, height),
        color: 0x0b101b,
      });
      mirrorFloor.rotation.x = -Math.PI / 2;
      mirrorFloor.position.y = 0;
      scene.add(mirrorFloor);

      // Signature Kollabrix dark architectural grid matching KaEcosystemShowcase (#020306)
      const blueprintGrid = new THREE.GridHelper(48, 48, 0x1e293b, 0x0f172a);
      blueprintGrid.position.y = 0.005;
      scene.add(blueprintGrid);

      // Subtle Concentric Obsidian Floor Horizon Rings (No basketball lines!)
      const subtleRingMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.32 })
      );
      [3.1, 5.4, 8.6].forEach((r) => {
        const ring = new THREE.Mesh(tg(new THREE.RingGeometry(r, r + 0.02, 72)), subtleRingMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.006, 0);
        scene.add(ring);
      });

      // --- KOLLABRIX ARCHITECTURAL OBSIDIAN MONOLITH CATHEDRAL (No sky blobs!) ---
      const pylonMat = tm(
        new THREE.MeshStandardMaterial({
          color: 0x05080f,
          roughness: 0.35,
          metalness: 0.72,
        })
      );
      const pylonCyanTrimMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.42 })
      );
      const pylonAmberTrimMat = tm(
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 })
      );

      // Symmetrical flanking obsidian glass monolith columns
      const pylonGeo = tg(new THREE.BoxGeometry(1.15, 7.2, 0.75));
      const trimStripGeo = tg(new THREE.BoxGeometry(0.03, 7.0, 0.04));
      [-1, 1].forEach((side) => {
        [1, 2, 3].forEach((tier) => {
          const angle = side * (0.28 + tier * 0.24);
          const dist = 10.8 + tier * 0.9;
          const px = Math.sin(angle) * dist;
          const pz = -3.0 - Math.cos(angle) * dist;

          const col = new THREE.Mesh(pylonGeo, pylonMat);
          col.position.set(px, 3.6, pz);
          col.lookAt(0, 3.6, 0);
          scene.add(col);

          const strip = new THREE.Mesh(trimStripGeo, tier % 2 === 0 ? pylonAmberTrimMat : pylonCyanTrimMat);
          strip.position.set(px * 0.965, 3.6, pz * 0.965);
          strip.lookAt(0, 3.6, 0);
          scene.add(strip);
        });
      });

      // --- CENTER-BACK KΛ ARCHITECTURAL MONOLITH & SUBTLE OBSIDIAN GLOW ---
      const monolith = new THREE.Mesh(
        tg(new THREE.BoxGeometry(3.4, 8.0, 1.0)),
        tm(
          new THREE.MeshStandardMaterial({
            color: 0x04070e,
            roughness: 0.32,
            metalness: 0.78,
          })
        )
      );
      monolith.position.set(0, 4.0, -14.2);
      scene.add(monolith);

      const portalTrimMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
      );
      [-1.72, 1.72].forEach((mx) => {
        const edge = new THREE.Mesh(tg(new THREE.BoxGeometry(0.035, 7.8, 0.05)), portalTrimMat);
        edge.position.set(mx, 3.9, -13.68);
        scene.add(edge);
      });

      const bloomTex = createRadialGlowTexture(
        'rgba(56, 189, 248, 0.42)',
        'rgba(15, 23, 42, 0.22)'
      );
      textures.push(bloomTex);
      const portalBloom = new THREE.Mesh(
        tg(new THREE.PlaneGeometry(12.0, 8.5)),
        tm(
          new THREE.MeshBasicMaterial({
            map: bloomTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      portalBloom.position.set(0, 2.2, -13.2);
      scene.add(portalBloom);

      // Subtle low slate ground glow in front of center monolith
      const floorMist = new THREE.Mesh(
        tg(new THREE.PlaneGeometry(12.0, 5.0)),
        tm(
          new THREE.MeshBasicMaterial({
            map: bloomTex,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      floorMist.rotation.x = -Math.PI / 2;
      floorMist.position.set(0, 0.02, -10.5);
      scene.add(floorMist);

      // Sleek Diagonal Atmospheric Light Shafts (clean, minimal luxury)
      const beamTex = createBeamTexture();
      textures.push(beamTex);
      const beamMat = tm(
        new THREE.MeshBasicMaterial({
          map: beamTex,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );

      [-1, 1].forEach((side) => {
        const beamMain = new THREE.Mesh(tg(new THREE.PlaneGeometry(3.0, 11.0)), beamMat);
        beamMain.position.set(side * 4.6, 4.3, -8.2);
        beamMain.rotation.z = side * 0.52;
        scene.add(beamMain);
      });

      // --- CENTER OBSIDIAN + RANK-REACTIVE ROTATING ESPORTS PEDESTAL ---
      const rankRingHex =
        eloRef.current >= 1800 ? 0xc026d3 : eloRef.current >= 1300 ? 0xf59e0b : 0x38bdf8;
      const rankSubHex =
        eloRef.current >= 1800 ? 0xf43f5e : eloRef.current >= 1300 ? 0xfde047 : 0x67e8f9;

      const padBase = new THREE.Mesh(
        tg(new THREE.CylinderGeometry(1.12, 1.24, 0.06, 48)),
        tm(
          new THREE.MeshStandardMaterial({
            color: 0x070b14,
            metalness: 0.85,
            roughness: 0.22,
          })
        )
      );
      padBase.position.y = 0.03;
      scene.add(padBase);

      const padRing = new THREE.Mesh(
        tg(new THREE.TorusGeometry(1.14, 0.022, 10, 64)),
        tm(new THREE.MeshBasicMaterial({ color: rankRingHex }))
      );
      padRing.rotation.x = Math.PI / 2;
      padRing.position.y = 0.062;
      scene.add(padRing);

      // Spinning Outer Segmented Tech Ring & Counter-Rotating Rank Halo
      const outerTechRing = new THREE.Mesh(
        tg(new THREE.TorusGeometry(1.48, 0.015, 6, 36)),
        tm(
          new THREE.MeshBasicMaterial({
            color: rankSubHex,
            wireframe: true,
            transparent: true,
            opacity: 0.55,
          })
        )
      );
      outerTechRing.rotation.x = Math.PI / 2;
      outerTechRing.position.y = 0.04;
      scene.add(outerTechRing);

      const innerSpinHalo = new THREE.Mesh(
        tg(new THREE.RingGeometry(1.22, 1.28, 32, 1, 0, Math.PI * 1.4)),
        tm(
          new THREE.MeshBasicMaterial({
            color: rankRingHex,
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide,
          })
        )
      );
      innerSpinHalo.rotation.x = -Math.PI / 2;
      innerSpinHalo.position.y = 0.045;
      scene.add(innerSpinHalo);

      // 2v2 Squad Companion Hologram Pad beside the hero
      if (teamSize === '2v2') {
        const squadPad = new THREE.Mesh(
          tg(new THREE.TorusGeometry(0.65, 0.018, 8, 42)),
          tm(new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.75 }))
        );
        squadPad.rotation.x = Math.PI / 2;
        squadPad.position.set(-1.75, 0.04, -0.45);
        scene.add(squadPad);
      }

      // Rising Cyber Sparks / Embers around Pedestal
      const emberCount = 70;
      const emberPositions = new Float32Array(emberCount * 3);
      for (let i = 0; i < emberCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.8 + Math.random() * 1.6;
        emberPositions[i * 3] = Math.cos(a) * r;
        emberPositions[i * 3 + 1] = 0.08 + Math.random() * 2.5;
        emberPositions[i * 3 + 2] = Math.sin(a) * r;
      }
      const emberGeo = tg(new THREE.BufferGeometry());
      emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
      const emberMat = tm(
        new THREE.PointsMaterial({
          color: rankSubHex,
          size: 0.038,
          transparent: true,
          opacity: 0.72,
        })
      );
      const embers = new THREE.Points(emberGeo, emberMat);
      scene.add(embers);

      // --- CENTER 3D FLOATING HOLOGRAPHIC PROFILE TABLET ---
      const duelist = buildCyberDuelist3D(avatarIdRef.current, profileSnapshotRef.current);
      duelistInstanceRef.current = duelist;
      duelist.root.position.set(0, 0.06, 0);
      duelist.root.scale.setScalar(1.06);
      scene.add(duelist.root);

      // --- INTERACTIVE 360 DRAG & CAMERA PARALLAX ---
      let targetYaw = 0.0;
      let currentYaw = 0.0;
      let targetCamX = 0;
      let targetCamY = 1.38;
      let isDragging = false;
      let prevX = 0;

      const onPointerDown = (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.closest('button, a, input, aside, header')) return;
        isDragging = true;
        prevX = e.clientX;
      };
      const onPointerMove = (e: PointerEvent) => {
        if (isDragging) {
          const dx = e.clientX - prevX;
          prevX = e.clientX;
          targetYaw += dx * 0.012;
        }
        const nx = e.clientX / (window.innerWidth || 1) - 0.5;
        const ny = e.clientY / (window.innerHeight || 1) - 0.5;
        targetCamX = nx * 0.5;
        targetCamY = 1.38 - ny * 0.18;
      };
      const onPointerUp = () => {
        isDragging = false;
      };

      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      const onResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      const clock = new THREE.Clock();
      let lastRenderTime = 0;
      const animate = (nowMs: number = 0) => {
        rafId = requestAnimationFrame(animate);

        // Sleep completely (0% GPU/CPU) when modal is open or tab is hidden
        if (pausedRef.current || (typeof document !== 'undefined' && document.hidden)) {
          return;
        }

        // Throttle idle cadence (~30fps) when not dragging to keep laptop cool; 60fps while dragging
        const minInterval = isDragging ? 15 : 32;
        if (nowMs - lastRenderTime < minInterval) {
          return;
        }
        lastRenderTime = nowMs;

        const t = clock.getElapsedTime();
        currentYaw += (targetYaw - currentYaw) * 0.1;
        duelist.root.rotation.y = currentYaw;
        duelist.update(t);

        outerTechRing.rotation.z = t * 0.35;
        innerSpinHalo.rotation.z = -t * 0.65;
        embers.rotation.y = t * 0.18;

        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.lookAt(0, 1.08, -4.0);

        renderer?.render(scene, camera);
      };
      rafId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('resize', onResize);
        duelistInstanceRef.current = null;
        duelist.dispose();
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        textures.forEach((tx) => tx.dispose());
        envRT?.dispose();
        pmrem?.dispose();
        if (renderer) {
          renderer.dispose();
          try {
            renderer.forceContextLoss();
          } catch {}
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      return () => {};
    }
  }, [teamSize]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 bg-[#03060f] cursor-grab active:cursor-grabbing"
    />
  );
}
