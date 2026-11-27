'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { buildCyberDuelist3D } from './Arena3DHangarCharacter';

interface Arena3DHangarWorldProps {
  avatarId: string;
  algoLanguage: string;
  paused?: boolean;
}

function createBeamTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const ctx = c.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    // Warm Kollabrix Amber-Gold overhead volumetric cone
    grad.addColorStop(0, 'rgba(251, 191, 36, 0.36)');
    grad.addColorStop(0.55, 'rgba(234, 88, 12, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);
  }
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

/**
 * Kollabrix Dark-Luxury 3D Runway Stage (adapted from https://pin.it/2TTXAchqo):
 * - Deep obsidian #05060B vanishing corridor
 * - Converging rows of warm Kollabrix amber-gold & ivory oval runway lights
 * - Twin diagonal soft warm-amber overhead beams
 * - Mirror-polished dark floor Reflector capturing crisp runway reflections
 * - Draggable 3D Ganker Cyber-Mech standing on an obsidian + amber-trimmed dais
 */
export function Arena3DHangarWorld({ avatarId, paused = false }: Arena3DHangarWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const avatarIdRef = useRef(avatarId);
  avatarIdRef.current = avatarId;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

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
      scene.background = new THREE.Color(0x040508);
      scene.fog = new THREE.FogExp2(0x040508, 0.068);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
      camera.position.set(0, 1.38, 4.95);
      camera.lookAt(0, 0.85, -3.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
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

      // --- KOLLABRIX WARM AMBER + STUDIO WHITE LIGHTING ---
      scene.add(new THREE.HemisphereLight(0xfef3c7, 0x05060a, 0.72));

      const topKey = new THREE.DirectionalLight(0xfffbeb, 2.0);
      topKey.position.set(0.8, 5.5, 3.2);
      scene.add(topKey);

      const leftAmberRim = new THREE.PointLight(0xf59e0b, 5.2, 14);
      leftAmberRim.position.set(-2.8, 1.6, -1.2);
      scene.add(leftAmberRim);

      const rightAmberRim = new THREE.PointLight(0xea580c, 5.2, 14);
      rightAmberRim.position.set(2.8, 1.6, -1.2);
      scene.add(rightAmberRim);

      // --- DARK MIRROR FLOOR (Thermal-optimized 512px Reflector) ---
      const mirrorFloor = new Reflector(tg(new THREE.PlaneGeometry(36, 40)), {
        clipBias: 0.003,
        textureWidth: Math.min(512, width),
        textureHeight: Math.min(512, height),
        color: 0x26211c,
      });
      mirrorFloor.rotation.x = -Math.PI / 2;
      mirrorFloor.position.y = 0;
      scene.add(mirrorFloor);

      // Runway segments
      const seamMat = tm(
        new THREE.MeshBasicMaterial({ color: 0x1c1917, transparent: true, opacity: 0.55 })
      );
      for (let z = 3.5; z >= -18; z -= 1.25) {
        const line = new THREE.Mesh(tg(new THREE.BoxGeometry(5.2, 0.004, 0.025)), seamMat);
        line.position.set(0, 0.004, z);
        scene.add(line);
      }

      const railMat = tm(
        new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.38 })
      );
      [-1.7, 1.7, -2.55, 2.55].forEach((rx) => {
        const rail = new THREE.Mesh(tg(new THREE.BoxGeometry(0.018, 0.005, 32)), railMat);
        rail.position.set(rx, 0.005, -10);
        scene.add(rail);
      });

      // --- CONVERGING WARM AMBER-GOLD & IVORY OVAL RUNWAY LIGHTS ---
      const ovalHaloMat = tm(
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.72 })
      );
      const ovalCoreMat = tm(new THREE.MeshBasicMaterial({ color: 0xfef3c7 }));
      const ovalGeo = tg(new THREE.SphereGeometry(0.11, 16, 12));
      const coreGeo = tg(new THREE.SphereGeometry(0.055, 14, 10));

      for (let idx = 0; idx < 18; idx++) {
        const z = 3.2 - idx * 1.18;
        [-1, 1].forEach((side) => {
          const wallOrb = new THREE.Mesh(ovalGeo, ovalHaloMat);
          wallOrb.position.set(side * 2.75, 0.42, z);
          wallOrb.scale.set(0.55, 0.65, 1.65);
          scene.add(wallOrb);

          const wallCore = new THREE.Mesh(coreGeo, ovalCoreMat);
          wallCore.position.set(side * 2.72, 0.42, z);
          wallCore.scale.set(0.5, 0.6, 1.45);
          scene.add(wallCore);

          const edgeDot = new THREE.Mesh(coreGeo, ovalCoreMat);
          edgeDot.position.set(side * 1.92, 0.04, z);
          edgeDot.scale.set(0.75, 0.38, 1.35);
          scene.add(edgeDot);
        });
      }

      // --- DIAGONAL WARM AMBER VOLUMETRIC BEAMS ---
      const beamTex = createBeamTexture();
      textures.push(beamTex);
      const beamMat = tm(
        new THREE.MeshBasicMaterial({
          map: beamTex,
          transparent: true,
          opacity: 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );

      [-1, 1].forEach((side) => {
        const beam = new THREE.Mesh(tg(new THREE.PlaneGeometry(2.6, 8.5)), beamMat);
        beam.position.set(side * 3.1, 3.2, -5.0);
        beam.rotation.z = side * 0.68;
        scene.add(beam);
      });

      // --- CENTER OBSIDIAN + WARM AMBER PEDESTAL PAD ---
      const padBase = new THREE.Mesh(
        tg(new THREE.CylinderGeometry(1.05, 1.12, 0.04, 48)),
        tm(
          new THREE.MeshStandardMaterial({
            color: 0x0b0c10,
            metalness: 0.78,
            roughness: 0.25,
          })
        )
      );
      padBase.position.y = 0.02;
      scene.add(padBase);

      const padRing = new THREE.Mesh(
        tg(new THREE.TorusGeometry(1.06, 0.015, 10, 64)),
        tm(new THREE.MeshBasicMaterial({ color: 0xf59e0b }))
      );
      padRing.rotation.x = Math.PI / 2;
      padRing.position.y = 0.042;
      scene.add(padRing);

      // --- CENTER 3D GANKER MECH MODEL ---
      const duelist = buildCyberDuelist3D(avatarIdRef.current);
      duelist.root.position.set(0, 0.045, 0);
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

        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.lookAt(0, 0.85, -3.5);

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
  }, [avatarId]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 bg-[#040508] cursor-grab active:cursor-grabbing"
    />
  );
}
