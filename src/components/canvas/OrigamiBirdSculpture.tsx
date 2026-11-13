'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Kollabrix "K" Modular Nexus Sculpture
 * 
 * Replaces the legacy origami bird with a true 3D isometric modular "K"
 * sculpture composed of architectural voxels ("Brix"):
 * - Vertical Left Stem: Stacked golden amber modular brix
 * - Upper Diagonal Arm: Innovation arm angled up-right in sky cyan and gold
 * - Lower Diagonal Leg: High-tech foundation angled down-right in electric cyan / turquoise
 * - Central Nexus Core: Interlocking synergy prism with internal glow
 * - Ambient Floating Embers: Luminous golden and cyan micro-particles
 * - Interactive: 360° drag to rotate with inertial damping & mouse parallax
 */
export function OrigamiBirdSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let cleanupFn: (() => void) | null = null;

    const initWebGL = () => {
      if (destroyed || !containerRef.current) return;
      const activeContainer = containerRef.current;

      // 1. Check WebGL availability
      try {
        const testCanvas = document.createElement('canvas');
        const hasWebGL = Boolean(
          window.WebGLRenderingContext &&
            (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
        );
        if (!hasWebGL) {
          setWebglSupported(false);
          return;
        }
      } catch {
        setWebglSupported(false);
        return;
      }

      let animationFrameId: number;

      // Dimensions
      const width = activeContainer.clientWidth || 460;
      const height = activeContainer.clientHeight || 460;

      // 2. Scene & Camera Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.8);

      // 3. Renderer Setup
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      activeContainer.innerHTML = '';
      activeContainer.appendChild(renderer.domElement);
      setIsCanvasReady(true);

      // 4. Studio Lighting Configuration
      // Warm Key Light (Top-Left)
      const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
      keyLight.position.set(4, 5, 5);
      scene.add(keyLight);

      // Electric Cyan Fill Light (Right-Bottom)
      const cyanLight = new THREE.DirectionalLight(0x06b6d4, 2.6);
      cyanLight.position.set(5, -2, 4);
      scene.add(cyanLight);

      // Warm Amber Rim Light (Back-Top)
      const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
      rimLight.position.set(-4, 4, -4);
      scene.add(rimLight);

      // Soft Ambient Light
      const ambientLight = new THREE.AmbientLight(0x1e293b, 0.9);
      scene.add(ambientLight);

      // 5. Materials
      // Golden Amber Brix (Vertical Stem)
      const amberBrixMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.22,
        metalness: 0.12,
        emissive: 0xb45309,
        emissiveIntensity: 0.15,
      });

      // Gold Isometric Top Cap
      const goldTopMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        roughness: 0.18,
        metalness: 0.2,
        emissive: 0xd97706,
        emissiveIntensity: 0.12,
      });

      // Sky Cyan Brix (Upper Diagonal Arm)
      const skyArmMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.22,
        metalness: 0.15,
        emissive: 0x0284c7,
        emissiveIntensity: 0.22,
      });

      // Electric Cyan / Turquoise Brix (Lower Diagonal Leg)
      const cyanBrixMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.2,
        metalness: 0.15,
        emissive: 0x0891b2,
        emissiveIntensity: 0.3,
      });

      // Central Nexus Core Material
      const nexusMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.2,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.6,
      });

      // Sub-Brix Architectural Grid Line Highlight Materials
      const amberLineMat = new THREE.LineBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.7,
      });
      const cyanLineMat = new THREE.LineBasicMaterial({
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0.85,
      });

      // 6. 3D Model Construction: Master Group
      const masterGroup = new THREE.Group();
      scene.add(masterGroup);

      const sculptureGroup = new THREE.Group();
      masterGroup.add(sculptureGroup);

      // Helper to create a modular block with edges
      const createBrixBlock = (
        w: number,
        h: number,
        d: number,
        mat: THREE.Material,
        lineMat: THREE.Material,
        x: number,
        y: number,
        z: number,
        rx = 0,
        ry = 0,
        rz = 0
      ) => {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rx, ry, rz);
        sculptureGroup.add(mesh);

        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, lineMat);
        mesh.add(line);

        return mesh;
      };

      // --- 1. LEFT VERTICAL STEM (Golden Amber Stacked Brix Column) ---
      const stemX = -0.78;
      const brixSize = 0.48;
      const stemHeights = [-1.3, -0.78, -0.26, 0.26, 0.78, 1.3];

      stemHeights.forEach((y, i) => {
        const isTop = i === stemHeights.length - 1;
        createBrixBlock(
          brixSize,
          0.48,
          brixSize,
          isTop ? goldTopMat : amberBrixMat,
          amberLineMat,
          stemX,
          y,
          0
        );
      });

      // --- 2. UPPER DIAGONAL ARM (Ascending Sky Cyan / Gold Brix) ---
      const armBlocks = [
        { x: -0.32, y: 0.38, z: 0.04, mat: amberBrixMat, lineMat: amberLineMat },
        { x: 0.12, y: 0.78, z: 0.08, mat: skyArmMat, lineMat: cyanLineMat },
        { x: 0.56, y: 1.18, z: 0.12, mat: skyArmMat, lineMat: cyanLineMat },
        { x: 1.00, y: 1.58, z: 0.16, mat: skyArmMat, lineMat: cyanLineMat },
      ];

      armBlocks.forEach((b) => {
        createBrixBlock(
          brixSize * 0.95,
          brixSize * 0.95,
          brixSize * 0.95,
          b.mat,
          b.lineMat,
          b.x,
          b.y,
          b.z,
          0,
          0,
          -0.12
        );
      });

      // --- 3. LOWER DIAGONAL LEG (Electric Cyan High-Tech Brix) ---
      const legBlocks = [
        { x: -0.25, y: -0.32, z: 0.04 },
        { x: 0.18, y: -0.72, z: 0.08 },
        { x: 0.62, y: -1.12, z: 0.12 },
        { x: 1.06, y: -1.52, z: 0.16 },
      ];

      legBlocks.forEach((b) => {
        createBrixBlock(
          brixSize * 0.98,
          brixSize * 0.98,
          brixSize * 0.98,
          cyanBrixMat,
          cyanLineMat,
          b.x,
          b.y,
          b.z,
          0,
          0,
          0.12
        );
      });

      // --- 4. CENTRAL INTERLOCKING NEXUS SPARK (The Bridge Core) ---
      const nexusGeo = new THREE.OctahedronGeometry(0.24, 0);
      const nexusMesh = new THREE.Mesh(nexusGeo, nexusMat);
      nexusMesh.position.set(-0.45, 0.03, 0.28);
      sculptureGroup.add(nexusMesh);

      const nexusPointLight = new THREE.PointLight(0x38bdf8, 2.5, 3.5);
      nexusPointLight.position.set(-0.45, 0.03, 0.4);
      sculptureGroup.add(nexusPointLight);

      // --- 5. AMBIENT FLOATING EMBERS PARTICLES ---
      const particleCount = 45;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3] = (Math.random() - 0.5) * 6;
        particlePositions[i3 + 1] = (Math.random() - 0.5) * 5;
        particlePositions[i3 + 2] = (Math.random() - 0.5) * 3;

        // Half amber, half cyan particles
        if (Math.random() > 0.5) {
          particleColors[i3] = 0.96;
          particleColors[i3 + 1] = 0.62;
          particleColors[i3 + 2] = 0.04;
        } else {
          particleColors[i3] = 0.02;
          particleColors[i3 + 1] = 0.71;
          particleColors[i3 + 2] = 0.83;
        }
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
      });

      const particleSystem = new THREE.Points(particleGeo, particleMat);
      masterGroup.add(particleSystem);

      // Initial isometric orientation
      const baseRotX = 0.22;
      const baseRotY = -0.38;
      sculptureGroup.rotation.x = baseRotX;
      sculptureGroup.rotation.y = baseRotY;

      // 7. Interactive Drag & Pointer Parallax Tracking
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let targetRotX = baseRotX;
      let targetRotY = baseRotY;
      let rotVelX = 0;
      let rotVelY = 0;
      let mouseParallaxX = 0;
      let mouseParallaxY = 0;

      const onPointerDown = (e: MouseEvent | TouchEvent) => {
        isDragging = true;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        prevMouseX = clientX;
        prevMouseY = clientY;
      };

      const onPointerMove = (e: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        // Subtle ambient parallax when hovering
        const rect = activeContainer.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        mouseParallaxX = normX * 0.12;
        mouseParallaxY = normY * 0.12;

        if (!isDragging) return;

        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        prevMouseX = clientX;
        prevMouseY = clientY;

        rotVelY = deltaX * 0.008;
        rotVelX = deltaY * 0.008;

        targetRotY += rotVelY;
        targetRotX += rotVelX;
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      activeContainer.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      activeContainer.addEventListener('touchstart', onPointerDown, { passive: true });
      window.addEventListener('touchmove', onPointerMove, { passive: true });
      window.addEventListener('touchend', onPointerUp);

      // Handle Resize smoothly
      const handleResize = () => {
        if (!activeContainer) return;
        const newW = activeContainer.clientWidth || 460;
        const newH = activeContainer.clientHeight || 460;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };
      window.addEventListener('resize', handleResize);

      // 8. Animation & Render Loop
      let clock = new THREE.Clock();

      const animate = () => {
        if (destroyed) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Smooth damping rotation physics
        if (!isDragging) {
          rotVelX *= 0.92;
          rotVelY *= 0.92;
          targetRotX += rotVelX;
          targetRotY += rotVelY;

          // Idle gentle oscillation
          const idleHover = Math.sin(elapsedTime * 1.6) * 0.12;
          sculptureGroup.position.y = idleHover;

          const idleYaw = Math.sin(elapsedTime * 0.8) * 0.08;
          sculptureGroup.rotation.y += (targetRotY + idleYaw + mouseParallaxX - sculptureGroup.rotation.y) * 0.06;
          sculptureGroup.rotation.x += (targetRotX + mouseParallaxY - sculptureGroup.rotation.x) * 0.06;
        } else {
          sculptureGroup.rotation.y = targetRotY;
          sculptureGroup.rotation.x = targetRotX;
        }

        // Shimmer Nexus Point Light
        nexusPointLight.intensity = 2.2 + Math.sin(elapsedTime * 3) * 0.6;
        nexusMesh.rotation.y = elapsedTime * 0.8;
        nexusMesh.rotation.z = elapsedTime * 0.5;

        // Drift Floating Particles
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3 + 1;
          positions[i3] += 0.003;
          if (positions[i3] > 2.8) {
            positions[i3] = -2.8;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      cleanupFn = () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        activeContainer.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        activeContainer.removeEventListener('touchstart', onPointerDown);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);

        // Clean up Three.js objects
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        });
        renderer.dispose();
      };
    };

    initWebGL();

    return () => {
      destroyed = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <img
          src="/brand/kollabrix-logo.svg"
          alt="Kollabrix 3D Emblem"
          width={220}
          height={220}
          className="w-56 h-56 object-contain drop-shadow-2xl animate-pulse"
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] flex items-center justify-center select-none pointer-events-auto overflow-hidden"
    >
      {/* Soft atmospheric ambient glow tailored to Golden Amber & Electric Cyan */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-amber-500/20 via-cyan-500/25 to-transparent blur-3xl opacity-80" />
      </div>

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full z-10 cursor-grab active:cursor-grabbing transition-opacity duration-500 flex items-center justify-center ${
          isCanvasReady ? 'opacity-100' : 'opacity-0'
        }`}
        title="Interactive 3D Kollabrix Nexus • Drag to rotate"
      />

      {/* Tactile hint pill */}
      {isCanvasReady && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fadeIn whitespace-nowrap">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-black/90 text-white backdrop-blur-md border border-slate-700/80 dark:border-white/20 shadow-xl flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span>3D Kollabrix Nexus • Drag to Rotate</span>
          </span>
        </div>
      )}
    </div>
  );
}
