'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { buildCyberDuelist3D } from './Arena3DHangarCharacter';

interface Arena3DHangarWorldProps {
  avatarId: string;
  algoLanguage: string;
  elo?: number;
  wins?: number;
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
  elo = 1200,
  wins = 0,
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
      scene.background = new THREE.Color(0x03060f);
      scene.fog = new THREE.FogExp2(0x040917, 0.044);

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

      // --- GLOSSY MIDNIGHT ARENA COURT FLOOR (512px Reflector) ---
      const mirrorFloor = new Reflector(tg(new THREE.PlaneGeometry(48, 48)), {
        clipBias: 0.003,
        textureWidth: Math.min(512, width),
        textureHeight: Math.min(512, height),
        color: 0x162238,
      });
      mirrorFloor.rotation.x = -Math.PI / 2;
      mirrorFloor.position.y = 0;
      scene.add(mirrorFloor);

      // Crisp white painted stadium court markings (foreground sweeping arc, center circle, midlines)
      const whiteLineMat = tm(
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.78 })
      );
      const subtleLineMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.42 })
      );

      // Sweeping foreground three-point / court arc across bottom center (pin.it/2r437XD0o signature)
      const frontArc = new THREE.Mesh(
        tg(new THREE.RingGeometry(4.65, 4.72, 72, 1, Math.PI * 0.14, Math.PI * 0.72)),
        whiteLineMat
      );
      frontArc.rotation.x = -Math.PI / 2;
      frontArc.position.set(0, 0.006, 6.1);
      scene.add(frontArc);

      // Outer secondary sweeping lane line
      const outerArc = new THREE.Mesh(
        tg(new THREE.RingGeometry(4.92, 4.97, 72, 1, Math.PI * 0.14, Math.PI * 0.72)),
        subtleLineMat
      );
      outerArc.rotation.x = -Math.PI / 2;
      outerArc.position.set(0, 0.005, 6.1);
      scene.add(outerArc);

      // Mid-court arena circle around center stage
      const midCourtRing = new THREE.Mesh(
        tg(new THREE.RingGeometry(2.55, 2.6, 64)),
        whiteLineMat
      );
      midCourtRing.rotation.x = -Math.PI / 2;
      midCourtRing.position.set(0, 0.006, -1.8);
      scene.add(midCourtRing);

      // Subtle back-court key lines & perimeter court boundary rectangle
      const backKeyArc = new THREE.Mesh(
        tg(new THREE.RingGeometry(3.8, 3.84, 64, 1, Math.PI * 1.12, Math.PI * 0.76)),
        subtleLineMat
      );
      backKeyArc.rotation.x = -Math.PI / 2;
      backKeyArc.position.set(0, 0.005, -8.5);
      scene.add(backKeyArc);

      [-7.2, 7.2].forEach((sx) => {
        const sideBound = new THREE.Mesh(tg(new THREE.PlaneGeometry(0.05, 22)), subtleLineMat);
        sideBound.rotation.x = -Math.PI / 2;
        sideBound.position.set(sx, 0.005, -4.5);
        scene.add(sideBound);
      });

      // --- ENCLOSED CURVED STADIUM AMPHITHEATER BOWL & LED RIBBON PANELS ---
      const stadiumCenterZ = -3.8;
      const tierDarkMat = tm(
        new THREE.MeshStandardMaterial({
          color: 0x060b16,
          roughness: 0.85,
          metalness: 0.25,
          side: THREE.DoubleSide,
        })
      );
      const tierTrimMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.45 })
      );

      // Lower court perimeter barrier + 3 stepped curved seating tiers wrapping back & sides
      const tierConfigs = [
        { rTop: 11.4, rBot: 11.0, h: 0.9, y: 0.45 },
        { rTop: 13.8, rBot: 11.8, h: 2.2, y: 1.9 },
        { rTop: 16.5, rBot: 14.1, h: 2.8, y: 4.3 },
      ];
      tierConfigs.forEach((tc) => {
        const cyl = new THREE.Mesh(
          tg(new THREE.CylinderGeometry(tc.rTop, tc.rBot, tc.h, 48, 1, true, Math.PI * 0.56, Math.PI * 0.88)),
          tierDarkMat
        );
        cyl.position.set(0, tc.y, stadiumCenterZ);
        scene.add(cyl);

        const rim = new THREE.Mesh(
          tg(new THREE.TorusGeometry(tc.rBot + 0.06, 0.025, 6, 48, Math.PI * 0.88)),
          tierTrimMat
        );
        rim.rotation.x = Math.PI / 2;
        rim.rotation.z = Math.PI * 1.06;
        rim.position.set(0, tc.y - tc.h * 0.48, stadiumCenterZ);
        scene.add(rim);
      });

      // Curved Mezzanine LED Ribbon Panels / Illuminated Stadium Light Boxes
      const ledPanelMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
      );
      const ledFrameMat = tm(
        new THREE.MeshStandardMaterial({ color: 0x0b1324, roughness: 0.5, metalness: 0.6 })
      );
      const ledGeo = tg(new THREE.PlaneGeometry(1.55, 0.85));
      const frameGeo = tg(new THREE.BoxGeometry(1.7, 1.0, 0.08));

      for (let i = 0; i < 12; i++) {
        // Arrange panels symmetrically along left and right curved amphitheater flanks (leave dead center for monolith)
        const side = i < 6 ? -1 : 1;
        const idx = i % 6;
        const angle = Math.PI * 1.5 + side * (0.28 + idx * 0.14);
        const radius = 13.3;
        const px = Math.sin(angle) * radius;
        const pz = stadiumCenterZ + Math.cos(angle) * radius;

        const panelFrame = new THREE.Mesh(frameGeo, ledFrameMat);
        panelFrame.position.set(px, 3.1, pz);
        panelFrame.lookAt(0, 2.2, 2.0);
        scene.add(panelFrame);

        const ledFace = new THREE.Mesh(ledGeo, ledPanelMat);
        ledFace.position.set(px * 0.992, 3.1, pz * 0.992);
        ledFace.lookAt(0, 2.2, 2.0);
        scene.add(ledFace);
      }

      // --- CENTER-BACK DARK SCOREBOARD MONOLITH & ELECTRIC BLUE PORTAL BLOOM ---
      const monolith = new THREE.Mesh(
        tg(new THREE.BoxGeometry(3.8, 7.6, 1.2)),
        tm(
          new THREE.MeshStandardMaterial({
            color: 0x04070f,
            roughness: 0.4,
            metalness: 0.6,
          })
        )
      );
      monolith.position.set(0, 3.8, -14.2);
      scene.add(monolith);

      const portalTrimMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.65 })
      );
      [-1.92, 1.92].forEach((mx) => {
        const edge = new THREE.Mesh(tg(new THREE.BoxGeometry(0.05, 7.4, 0.06)), portalTrimMat);
        edge.position.set(mx, 3.7, -13.56);
        scene.add(edge);
      });

      const bloomTex = createRadialGlowTexture(
        'rgba(147, 197, 253, 0.95)',
        'rgba(37, 99, 235, 0.42)'
      );
      textures.push(bloomTex);
      const portalBloom = new THREE.Mesh(
        tg(new THREE.PlaneGeometry(11.5, 8.5)),
        tm(
          new THREE.MeshBasicMaterial({
            map: bloomTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      portalBloom.position.set(0, 2.15, -13.1);
      scene.add(portalBloom);

      // Subtle low cobalt ground mist swirl in front of the center-back monolith
      const floorMist = new THREE.Mesh(
        tg(new THREE.PlaneGeometry(13.0, 5.5)),
        tm(
          new THREE.MeshBasicMaterial({
            map: bloomTex,
            transparent: true,
            opacity: 0.46,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        )
      );
      floorMist.rotation.x = -Math.PI / 2;
      floorMist.position.set(0, 0.03, -10.8);
      scene.add(floorMist);

      // --- CURVED ROOF FLOODLIGHT RINGS & MISTY DIAGONAL STADIUM BEAMS ---
      const lampCoreMat = tm(new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
      const lampGlowTex = createRadialGlowTexture(
        'rgba(248, 250, 252, 0.95)',
        'rgba(96, 165, 250, 0.35)'
      );
      textures.push(lampGlowTex);
      const lampSpriteMat = tm(
        new THREE.SpriteMaterial({
          map: lampGlowTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const bulbGeo = tg(new THREE.SphereGeometry(0.11, 10, 8));

      // Two arched stadium roof light banks curving across upper sky
      const roofRows = [
        { radius: 13.8, y: 6.1, count: 22 },
        { radius: 14.9, y: 7.3, count: 20 },
      ];
      roofRows.forEach((row) => {
        for (let idx = 0; idx < row.count; idx++) {
          const frac = idx / (row.count - 1);
          const angle = Math.PI * 1.07 + frac * Math.PI * 0.86;
          const lx = Math.sin(angle) * row.radius;
          const lz = stadiumCenterZ + Math.cos(angle) * row.radius;

          const bulb = new THREE.Mesh(bulbGeo, lampCoreMat);
          bulb.position.set(lx, row.y, lz);
          scene.add(bulb);

          // Every second bulb carries an additive soft starburst halo sprite
          if (idx % 2 === 0) {
            const halo = new THREE.Sprite(lampSpriteMat);
            halo.position.set(lx, row.y, lz);
            halo.scale.set(1.5, 1.5, 1.0);
            scene.add(halo);
          }
        }
      });

      const beamTex = createBeamTexture();
      textures.push(beamTex);
      const beamMat = tm(
        new THREE.MeshBasicMaterial({
          map: beamTex,
          transparent: true,
          opacity: 0.44,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );

      [-1, 1].forEach((side) => {
        const beamMain = new THREE.Mesh(tg(new THREE.PlaneGeometry(3.4, 11.0)), beamMat);
        beamMain.position.set(side * 4.4, 4.2, -7.8);
        beamMain.rotation.z = side * 0.54;
        scene.add(beamMain);

        const beamOuter = new THREE.Mesh(tg(new THREE.PlaneGeometry(2.8, 10.5)), beamMat);
        beamOuter.position.set(side * 7.2, 4.4, -5.5);
        beamOuter.rotation.z = side * 0.62;
        scene.add(beamOuter);
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

      // --- CENTER 3D CYBER-DUELIST MODEL ---
      const duelist = buildCyberDuelist3D(avatarIdRef.current, {
        elo: eloRef.current,
        wins: winsRef.current,
        streak: streakRef.current,
      });
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
  }, [avatarId, elo, wins, winStreak, teamSize]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 bg-[#03060f] cursor-grab active:cursor-grabbing"
    />
  );
}
