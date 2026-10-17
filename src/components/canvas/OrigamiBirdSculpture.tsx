'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Origami Bird Sculpture for Linkora
 * Re-creates the geometric folded origami bird in Three.js
 * Colors:
 * - One wing (left): Emerald green
 * - Other wing (right): Deep rich burgundy
 * - Neck part: Light burgundy
 * Features crisp flat-shaded paper facets, gliding flight kinematics, and interactive rotation.
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

      // Check WebGL availability
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

      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0.2, 0.1, 7.5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      activeContainer.appendChild(renderer.domElement);
      setIsCanvasReady(true);

    // Lighting setup for crisp origami paper facets
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key studio light (from top-front)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    // Emerald fill light (from bottom-left)
    const fillLight = new THREE.DirectionalLight(0x34d399, 0.6);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    // Burgundy rim light (from back-top)
    const rimLight = new THREE.DirectionalLight(0x9c3252, 0.9);
    rimLight.position.set(-2, 3, -4);
    scene.add(rimLight);

    // Materials - Flat shaded for crisp origami creases
    // 1. One wing is green
    const greenOuterMat = new THREE.MeshStandardMaterial({
      color: 0x10b981, // #10b981 Emerald bright
      roughness: 0.32,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const greenInnerMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // #059669 Deep jade
      roughness: 0.35,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // 2. Right wing is deep rich burgundy
    const burgundyMat = new THREE.MeshStandardMaterial({
      color: 0x761329, // #761329 Deep rich burgundy
      roughness: 0.32,
      metalness: 0.06,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    // 3. Neck part is light burgundy
    const lightBurgundyMat = new THREE.MeshStandardMaterial({
      color: 0xb54568, // #b54568 Soft light burgundy
      roughness: 0.32,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
    });

    // Root Bird Hierarchy
    const birdRoot = new THREE.Group();
    scene.add(birdRoot);

    // --- 1. LEFT WING (Front, Green Folded Facets) ---
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(0.1, 0.2, 0.15); // hinge at shoulder

    const leftWingGeo = new THREE.BufferGeometry();
    const lwVertices = new Float32Array([
      // Outer Wing Triangle (P0 -> P1 -> P2) - Bright Emerald
      0, 0, 0,
      -0.5, 1.7, 0.25,
      -2.1, 2.1, 0.1,

      // Inner Wing Triangle (P0 -> P2 -> P3) - Deep Jade
      0, 0, 0,
      -2.1, 2.1, 0.1,
      -0.2, -0.8, 0.1,

      // Lower Flank Triangle (P0 -> P3 -> P1)
      0, 0, 0,
      -0.2, -0.8, 0.1,
      -0.5, 1.7, 0.25,
    ]);
    leftWingGeo.setAttribute('position', new THREE.BufferAttribute(lwVertices, 3));
    leftWingGeo.computeVertexNormals();

    const leftWingMesh = new THREE.Mesh(leftWingGeo, greenOuterMat);
    leftWingGroup.add(leftWingMesh);

    const leftWire = new THREE.LineSegments(new THREE.WireframeGeometry(leftWingGeo), wireMat);
    leftWingGroup.add(leftWire);
    birdRoot.add(leftWingGroup);

    // --- 2. RIGHT WING (Other Wing - Deep Burgundy Folded Facet) ---
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.1, 0.2, -0.15);

    const rightWingGeo = new THREE.BufferGeometry();
    const rwVertices = new Float32Array([
      // Trailing Rear Wing Triangle - Deep Burgundy
      0, 0, 0,
      -1.9, 1.6, -0.2,
      -0.4, 1.3, -0.15,

      // Secondary rear facet
      0, 0, 0,
      -0.4, 1.3, -0.15,
      -0.2, -0.5, -0.1,
    ]);
    rightWingGeo.setAttribute('position', new THREE.BufferAttribute(rwVertices, 3));
    rightWingGeo.computeVertexNormals();

    const rightWingMesh = new THREE.Mesh(rightWingGeo, burgundyMat);
    rightWingGroup.add(rightWingMesh);

    const rightWire = new THREE.LineSegments(new THREE.WireframeGeometry(rightWingGeo), wireMat);
    rightWingGroup.add(rightWire);
    birdRoot.add(rightWingGroup);

    // --- 3. NECK & THROAT (Light Burgundy Folded Facets) ---
    const neckGeo = new THREE.BufferGeometry();
    const neckVertices = new Float32Array([
      // Main Neck / Chest Triangle (Light Burgundy)
      0.1, 0.2, 0.0,
      0.8, 0.7, 0.0,
      0.2, -0.4, 0.0,

      // Lower Throat Facet (Light Burgundy)
      0.8, 0.7, 0.0,
      1.2, 0.65, 0.0,
      0.5, 0.2, 0.0,

      // Breast Underbelly
      0.1, 0.2, 0.05,
      0.2, -0.4, 0.05,
      -0.2, -0.7, 0.05,
    ]);
    neckGeo.setAttribute('position', new THREE.BufferAttribute(neckVertices, 3));
    neckGeo.computeVertexNormals();

    const neckMesh = new THREE.Mesh(neckGeo, lightBurgundyMat);
    birdRoot.add(neckMesh);

    const neckWire = new THREE.LineSegments(new THREE.WireframeGeometry(neckGeo), wireMat);
    birdRoot.add(neckWire);

    // --- 4. HEAD & BEAK (Origami Crown) ---
    const headGeo = new THREE.BufferGeometry();
    const headVertices = new Float32Array([
      // Head Crown & Face
      0.8, 0.7, 0.0,
      1.3, 0.95, 0.0,
      1.2, 0.65, 0.0,

      // Beak Fold (Folded downwards-forward)
      1.3, 0.95, 0.0,
      1.7, 0.7, 0.0,
      1.2, 0.65, 0.0,
    ]);
    headGeo.setAttribute('position', new THREE.BufferAttribute(headVertices, 3));
    headGeo.computeVertexNormals();

    const headMesh = new THREE.Mesh(headGeo, lightBurgundyMat);
    birdRoot.add(headMesh);

    const headWire = new THREE.LineSegments(new THREE.WireframeGeometry(headGeo), wireMat);
    birdRoot.add(headWire);

    // --- 5. TAIL (Sharp Folded Trailing Origami Planes) ---
    // Upper green tail facet
    const tailGreenGeo = new THREE.BufferGeometry();
    const tailGreenVertices = new Float32Array([
      0.2, -0.4, 0.05,
      -1.2, -1.8, 0.05,
      -0.4, -0.7, 0.05,
    ]);
    tailGreenGeo.setAttribute('position', new THREE.BufferAttribute(tailGreenVertices, 3));
    tailGreenGeo.computeVertexNormals();

    const tailGreenMesh = new THREE.Mesh(tailGreenGeo, greenInnerMat);
    birdRoot.add(tailGreenMesh);

    const tailGreenWire = new THREE.LineSegments(new THREE.WireframeGeometry(tailGreenGeo), wireMat);
    birdRoot.add(tailGreenWire);

    // Trailing deep burgundy tail feather
    const tailBurgundyGeo = new THREE.BufferGeometry();
    const tailBurgundyVertices = new Float32Array([
      0.2, -0.4, -0.05,
      -0.4, -0.7, -0.05,
      -1.4, -2.1, -0.05,
    ]);
    tailBurgundyGeo.setAttribute('position', new THREE.BufferAttribute(tailBurgundyVertices, 3));
    tailBurgundyGeo.computeVertexNormals();

    const tailBurgundyMesh = new THREE.Mesh(tailBurgundyGeo, burgundyMat);
    birdRoot.add(tailBurgundyMesh);

    const tailBurgundyWire = new THREE.LineSegments(new THREE.WireframeGeometry(tailBurgundyGeo), wireMat);
    birdRoot.add(tailBurgundyWire);

    // Initial orientation: angled upwards-right (flying posture matching the logo)
    birdRoot.rotation.z = 0.15;
    birdRoot.rotation.y = -0.3;
    birdRoot.rotation.x = 0.1;
    birdRoot.scale.set(1.4, 1.4, 1.4);

    // Interaction variables
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = -0.3;
    let targetRotX = 0.1;
    let currentRotY = -0.3;
    let currentRotX = 0.1;

    // Mouse movement parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.01;
        targetRotX += deltaY * 0.01;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        targetRotY = -0.3 + x * 0.9;
        targetRotX = 0.1 - y * 0.6;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        targetRotY += deltaX * 0.015;
        targetRotX += deltaY * 0.015;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    activeContainer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    activeContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!activeContainer || !renderer || !camera) return;
      const newWidth = activeContainer.clientWidth;
      const newHeight = activeContainer.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth interpolation to target rotation
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;

      birdRoot.rotation.x = currentRotX;
      birdRoot.rotation.y = currentRotY;

      // Banking roll based on yaw turns
      birdRoot.rotation.z = 0.15 + (currentRotY + 0.3) * 0.25 + Math.sin(t * 0.8) * 0.03;

      // Gentle gliding flight & bobbing levitation
      birdRoot.position.y = Math.sin(t * 1.8) * 0.14;
      birdRoot.position.x = Math.cos(t * 1.2) * 0.08;

      // Subtle wing flapping / flexing along crease
      const wingFlex = Math.sin(t * 2.8) * 0.14;
      leftWingGroup.rotation.z = wingFlex;
      rightWingGroup.rotation.z = -wingFlex * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    cleanupFn = () => {
      cancelAnimationFrame(animationFrameId);
      activeContainer.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      activeContainer.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (activeContainer && renderer.domElement && activeContainer.contains(renderer.domElement)) {
        activeContainer.removeChild(renderer.domElement);
      }

      leftWingGeo.dispose();
      rightWingGeo.dispose();
      neckGeo.dispose();
      headGeo.dispose();
      tailGreenGeo.dispose();
      tailBurgundyGeo.dispose();
      greenOuterMat.dispose();
      greenInnerMat.dispose();
      burgundyMat.dispose();
      lightBurgundyMat.dispose();
      wireMat.dispose();
      renderer.dispose();
    };
  };

  // Schedule WebGL strictly during browser idle so Total Blocking Time is 0ms
  const idleId =
    typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? (window as any).requestIdleCallback(initWebGL, { timeout: 2500 })
      : setTimeout(initWebGL, 1200);

  return () => {
    destroyed = true;
    if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof idleId === 'number') {
      (window as any).cancelIdleCallback(idleId);
    } else {
      clearTimeout(idleId as any);
    }
    if (cleanupFn) cleanupFn();
  };
}, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <img
          src="/brand/linkora-logo.png"
          alt="Linkora Bird"
          width={192}
          height={192}
          className="w-48 h-48 object-contain drop-shadow-2xl animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] flex items-center justify-center select-none pointer-events-auto">
      {/* Soft atmospheric ambient glow tailored to Emerald & Burgundy */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-emerald-500/15 via-[#b54568]/20 to-transparent blur-3xl opacity-75" />
      </div>

      {/* Instant visual silhouette before 3D WebGL finishes compiling */}
      {!isCanvasReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500">
          <img
            src="/brand/linkora-logo.png"
            alt="Linkora"
            width={180}
            height={180}
            fetchPriority="high"
            className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-2xl"
          />
        </div>
      )}

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full z-10 cursor-grab active:cursor-grabbing transition-opacity duration-700 ${
          isCanvasReady ? 'opacity-100' : 'opacity-0'
        }`}
        title="Interactive 3D Origami Bird • Drag to rotate"
      />

      {/* Tactile hint pill */}
      {isCanvasReady && (
        <div className="absolute bottom-1 right-4 z-20 pointer-events-none animate-fadeIn">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 shadow-2xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>3D Origami • Drag to inspect</span>
          </span>
        </div>
      )}
    </div>
  );
}
