'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Origami Bird Sculpture for Linkora
 * Re-creates the iconic folded origami bird from the official Linkora brand identity in Three.js
 * Colors & Facets:
 * - Front wing: Brilliant emerald & deep jade green paper facets
 * - Rear wing & neck & head & tail: Radiant coral salmon pink paper facets
 * - Features crisp flat-shaded paper creases, tactile drag-to-rotate inspection, and gentle flight kinematics.
 */
export function OrigamiBirdSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const startWebGLRef = useRef<() => void>(() => {});

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

      // Precise container dimensions
      const width = activeContainer.clientWidth || 440;
      const height = activeContainer.clientHeight || 440;

      // Scene
      const scene = new THREE.Scene();

      // Camera: perfectly framed so the origami bird has generous breathing room and never clips
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
      camera.position.set(0.0, 0.0, 6.2);

      // WebGL Renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      activeContainer.innerHTML = '';
      activeContainer.appendChild(renderer.domElement);
      setIsCanvasReady(true);

      // Lighting setup specifically tuned for vibrant origami paper facets
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      // Key light (top-right highlight)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      // Emerald fill light (from bottom-left)
      const emeraldFill = new THREE.DirectionalLight(0x10b981, 0.7);
      emeraldFill.position.set(-4, -2, 3);
      scene.add(emeraldFill);

      // Coral rim light (from top-back)
      const coralRim = new THREE.DirectionalLight(0xff5c73, 0.9);
      coralRim.position.set(-2, 4, -3);
      scene.add(coralRim);

      // Materials - High-spec flat-shaded origami paper
      const greenBrightMat = new THREE.MeshStandardMaterial({
        color: 0x10b981, // #10b981 Emerald bright
        roughness: 0.28,
        metalness: 0.02,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const greenMidMat = new THREE.MeshStandardMaterial({
        color: 0x059669, // #059669 Emerald mid
        roughness: 0.32,
        metalness: 0.02,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const greenDeepMat = new THREE.MeshStandardMaterial({
        color: 0x047857, // #047857 Deep jade body
        roughness: 0.35,
        metalness: 0.03,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const coralWingMat = new THREE.MeshStandardMaterial({
        color: 0xff5c73, // #ff5c73 Vibrant coral rear wing
        roughness: 0.3,
        metalness: 0.02,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const coralTailMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e, // #f43f5e Rose coral tail
        roughness: 0.32,
        metalness: 0.03,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const coralDeepMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48, // #e11d48 Deep coral under-tail
        roughness: 0.35,
        metalness: 0.03,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const coralNeckMat = new THREE.MeshStandardMaterial({
        color: 0xff6b81, // #ff6b81 Soft coral throat
        roughness: 0.28,
        metalness: 0.02,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const coralHeadMat = new THREE.MeshStandardMaterial({
        color: 0xff758f, // #ff758f Bright coral crown
        roughness: 0.26,
        metalness: 0.02,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const coralBeakMat = new THREE.MeshStandardMaterial({
        color: 0xff8fa3, // #ff8fa3 Beak accent
        roughness: 0.24,
        metalness: 0.02,
        flatShading: true,
        side: THREE.DoubleSide,
      });

      const creaseLineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
      });

      // Root Bird Hierarchy (Centered perfectly at 0, 0, 0)
      const birdRoot = new THREE.Group();
      scene.add(birdRoot);

      // --- 1. FRONT GREEN WING (Two folded facets along center ridge) ---
      const frontWingGroup = new THREE.Group();
      frontWingGroup.position.set(-0.05, 0.0, 0.15); // Wing shoulder hinge

      // Upper facet (Bright Emerald)
      const upperWingGeo = new THREE.BufferGeometry();
      const upperWingVerts = new Float32Array([
        -0.1, 1.15, 0.1,   // Ridge top
        -1.3, 1.35, -0.05, // Wing tip
        0.0, 0.0, 0.0,     // Shoulder origin
      ]);
      upperWingGeo.setAttribute('position', new THREE.BufferAttribute(upperWingVerts, 3));
      upperWingGeo.computeVertexNormals();
      const upperWingMesh = new THREE.Mesh(upperWingGeo, greenBrightMat);
      frontWingGroup.add(upperWingMesh);
      frontWingGroup.add(new THREE.LineSegments(new THREE.WireframeGeometry(upperWingGeo), creaseLineMat));

      // Lower facet (Mid Emerald)
      const lowerWingGeo = new THREE.BufferGeometry();
      const lowerWingVerts = new Float32Array([
        0.0, 0.0, 0.0,     // Shoulder origin
        -1.3, 1.35, -0.05, // Wing tip
        -0.5, 0.25, -0.1,  // Trailing crease
      ]);
      lowerWingGeo.setAttribute('position', new THREE.BufferAttribute(lowerWingVerts, 3));
      lowerWingGeo.computeVertexNormals();
      const lowerWingMesh = new THREE.Mesh(lowerWingGeo, greenMidMat);
      frontWingGroup.add(lowerWingMesh);
      frontWingGroup.add(new THREE.LineSegments(new THREE.WireframeGeometry(lowerWingGeo), creaseLineMat));

      birdRoot.add(frontWingGroup);

      // --- 2. FRONT BODY / BREAST (Deep Jade Green Facet) ---
      const bodyGeo = new THREE.BufferGeometry();
      const bodyVerts = new Float32Array([
        -0.05, 0.0, 0.15,
        -0.08, -0.65, 0.08,
        0.72, -0.22, 0.05,
      ]);
      bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyVerts, 3));
      bodyGeo.computeVertexNormals();
      const bodyMesh = new THREE.Mesh(bodyGeo, greenDeepMat);
      birdRoot.add(bodyMesh);
      birdRoot.add(new THREE.LineSegments(new THREE.WireframeGeometry(bodyGeo), creaseLineMat));

      // --- 3. REAR WING (Coral Salmon Paper Facet Peeking Behind) ---
      const rearWingGroup = new THREE.Group();
      rearWingGroup.position.set(0.0, 0.15, -0.1);

      const rearWingGeo = new THREE.BufferGeometry();
      const rearWingVerts = new Float32Array([
        0.0, 0.0, 0.0,
        -1.42, 0.9, -0.05,
        -0.35, -0.05, 0.02,
      ]);
      rearWingGeo.setAttribute('position', new THREE.BufferAttribute(rearWingVerts, 3));
      rearWingGeo.computeVertexNormals();
      const rearWingMesh = new THREE.Mesh(rearWingGeo, coralWingMat);
      rearWingGroup.add(rearWingMesh);
      rearWingGroup.add(new THREE.LineSegments(new THREE.WireframeGeometry(rearWingGeo), creaseLineMat));

      birdRoot.add(rearWingGroup);

      // --- 4. TAIL (Coral Salmon Folded Facets - Compact & Proportionate) ---
      // Upper tail facet
      const tailUpperGeo = new THREE.BufferGeometry();
      const tailUpperVerts = new Float32Array([
        -0.08, -0.05, -0.05,
        -0.65, -1.35, -0.08,
        -0.08, -0.65, -0.05,
      ]);
      tailUpperGeo.setAttribute('position', new THREE.BufferAttribute(tailUpperVerts, 3));
      tailUpperGeo.computeVertexNormals();
      const tailUpperMesh = new THREE.Mesh(tailUpperGeo, coralTailMat);
      birdRoot.add(tailUpperMesh);
      birdRoot.add(new THREE.LineSegments(new THREE.WireframeGeometry(tailUpperGeo), creaseLineMat));

      // Lower tail under-flap
      const tailLowerGeo = new THREE.BufferGeometry();
      const tailLowerVerts = new Float32Array([
        -0.35, 0.1, -0.08,
        -0.65, -1.35, -0.08,
        -0.08, -0.65, -0.05,
      ]);
      tailLowerGeo.setAttribute('position', new THREE.BufferAttribute(tailLowerVerts, 3));
      tailLowerGeo.computeVertexNormals();
      const tailLowerMesh = new THREE.Mesh(tailLowerGeo, coralDeepMat);
      birdRoot.add(tailLowerMesh);
      birdRoot.add(new THREE.LineSegments(new THREE.WireframeGeometry(tailLowerGeo), creaseLineMat));

      // --- 5. NECK & THROAT (Coral Salmon Paper) ---
      const neckGeo = new THREE.BufferGeometry();
      const neckVerts = new Float32Array([
        -0.05, 0.0, 0.05,
        0.72, -0.22, 0.05,
        0.52, 0.42, 0.0,
      ]);
      neckGeo.setAttribute('position', new THREE.BufferAttribute(neckVerts, 3));
      neckGeo.computeVertexNormals();
      const neckMesh = new THREE.Mesh(neckGeo, coralNeckMat);
      birdRoot.add(neckMesh);
      birdRoot.add(new THREE.LineSegments(new THREE.WireframeGeometry(neckGeo), creaseLineMat));

      // --- 6. HEAD CROWN (Coral Salmon Paper) ---
      const headGeo = new THREE.BufferGeometry();
      const headVerts = new Float32Array([
        0.52, 0.42, 0.0,
        0.98, 0.42, 0.0,
        0.72, -0.22, 0.05,
      ]);
      headGeo.setAttribute('position', new THREE.BufferAttribute(headVerts, 3));
      headGeo.computeVertexNormals();
      const headMesh = new THREE.Mesh(headGeo, coralHeadMat);
      birdRoot.add(headMesh);
      birdRoot.add(new THREE.LineSegments(new THREE.WireframeGeometry(headGeo), creaseLineMat));

      // --- 7. BEAK (Folded Triangle Pointing Forward) ---
      const beakGeo = new THREE.BufferGeometry();
      const beakVerts = new Float32Array([
        0.98, 0.42, 0.0,
        1.22, 0.22, 0.0,
        0.88, 0.18, 0.0,
      ]);
      beakGeo.setAttribute('position', new THREE.BufferAttribute(beakVerts, 3));
      beakGeo.computeVertexNormals();
      const beakMesh = new THREE.Mesh(beakGeo, coralBeakMat);
      birdRoot.add(beakMesh);
      birdRoot.add(new THREE.LineSegments(new THREE.WireframeGeometry(beakGeo), creaseLineMat));

      // Balanced resting flight angle matching the logo
      birdRoot.rotation.z = 0.05;
      birdRoot.rotation.y = -0.25;
      birdRoot.rotation.x = 0.08;
      birdRoot.scale.set(1.15, 1.15, 1.15);

      // Interaction state
      let isDragging = false;
      let prevMouseX = 0;
      let prevMouseY = 0;
      let targetRotY = -0.25;
      let targetRotX = 0.08;
      let currentRotY = -0.25;
      let currentRotX = 0.08;

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const deltaX = e.clientX - prevMouseX;
          const deltaY = e.clientY - prevMouseY;
          targetRotY += deltaX * 0.01;
          targetRotX += deltaY * 0.01;
          prevMouseX = e.clientX;
          prevMouseY = e.clientY;
        } else {
          const rect = activeContainer.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          targetRotY = -0.25 + x * 0.6;
          targetRotX = 0.08 - y * 0.4;
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
          targetRotY += deltaX * 0.012;
          targetRotX += deltaY * 0.012;
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

      // Resize handler keeping the aspect ratio tight and centered
      const handleResize = () => {
        if (!activeContainer || !renderer || !camera) return;
        const newWidth = activeContainer.clientWidth;
        const newHeight = activeContainer.clientHeight;
        if (newWidth === 0 || newHeight === 0) return;
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

        // Smooth physics-based interpolation
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        birdRoot.rotation.x = currentRotX;
        birdRoot.rotation.y = currentRotY;
        birdRoot.rotation.z = 0.05 + (currentRotY + 0.25) * 0.15 + Math.sin(t * 0.8) * 0.02;

        // Subtle, elegant floating levitation
        birdRoot.position.y = Math.sin(t * 1.6) * 0.08;
        birdRoot.position.x = Math.cos(t * 1.1) * 0.04;

        // Subtle wing flapping
        const wingFlex = Math.sin(t * 2.4) * 0.08;
        frontWingGroup.rotation.z = wingFlex;
        rearWingGroup.rotation.z = -wingFlex * 0.7;

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

        // Clean up geometries and materials
        upperWingGeo.dispose();
        lowerWingGeo.dispose();
        bodyGeo.dispose();
        rearWingGeo.dispose();
        tailUpperGeo.dispose();
        tailLowerGeo.dispose();
        neckGeo.dispose();
        headGeo.dispose();
        beakGeo.dispose();

        greenBrightMat.dispose();
        greenMidMat.dispose();
        greenDeepMat.dispose();
        coralWingMat.dispose();
        coralTailMat.dispose();
        coralDeepMat.dispose();
        coralNeckMat.dispose();
        coralHeadMat.dispose();
        coralBeakMat.dispose();
        creaseLineMat.dispose();

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
          src="/brand/linkora-logo.png"
          alt="Linkora Origami Bird"
          width={192}
          height={192}
          className="w-48 h-48 object-contain drop-shadow-2xl animate-pulse"
        />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => startWebGLRef.current()}
      onTouchStart={() => startWebGLRef.current()}
      className="relative w-full h-[360px] sm:h-[400px] lg:h-[440px] flex items-center justify-center select-none pointer-events-auto overflow-hidden"
    >
      {/* Soft atmospheric ambient glow tailored to Emerald & Coral */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-emerald-500/15 via-rose-500/15 to-transparent blur-3xl opacity-80" />
      </div>

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full z-10 cursor-grab active:cursor-grabbing transition-opacity duration-500 flex items-center justify-center ${
          isCanvasReady ? 'opacity-100' : 'opacity-0'
        }`}
        title="Interactive 3D Origami Bird • Drag to rotate"
      />

      {/* Tactile hint pill */}
      {isCanvasReady && (
        <div className="absolute bottom-2 right-4 z-20 pointer-events-none animate-fadeIn">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 shadow-2xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>3D Origami • Drag to inspect</span>
          </span>
        </div>
      )}
    </div>
  );
}
