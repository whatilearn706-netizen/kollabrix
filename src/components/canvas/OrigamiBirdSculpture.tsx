'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * 3D Origami Bird Sculpture for Linkora
 * Re-creates the geometric folded origami hummingbird/dove logo in Three.js
 * Features crisp flat-shaded paper facets (emerald green & coral pink),
 * gentle flight gliding kinematics, and mouse-reactive banking.
 */
export function OrigamiBirdSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    const width = container.clientWidth || 460;
    const height = container.clientHeight || 460;

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
    container.appendChild(renderer.domElement);

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

    // Coral rim light (from back-top)
    const rimLight = new THREE.DirectionalLight(0xfb7185, 0.9);
    rimLight.position.set(-2, 3, -4);
    scene.add(rimLight);

    // Materials - Flat shaded for crisp origami creases
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

    const coralPrimaryMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // #f43f5e Vibrant coral
      roughness: 0.3,
      metalness: 0.05,
      flatShading: true,
      side: THREE.DoubleSide,
    });

    const coralSecondaryMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185, // #fb7185 Soft coral pink
      roughness: 0.35,
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
    // Triangular vertices for the folded green wing
    // Vertices relative to wing hinge:
    // P0: hinge (0, 0, 0)
    // P1: upper crease (-0.5, 1.7, 0.25)
    // P2: wing tip (-2.1, 2.1, 0.1)
    // P3: lower crease (-0.2, -0.8, 0.1)
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

    // --- 2. RIGHT WING (Back, Coral Pink Folded Facet) ---
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.1, 0.2, -0.15);

    const rightWingGeo = new THREE.BufferGeometry();
    const rwVertices = new Float32Array([
      // Trailing Rear Wing Triangle - Coral Pink
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

    const rightWingMesh = new THREE.Mesh(rightWingGeo, coralPrimaryMat);
    rightWingGroup.add(rightWingMesh);

    const rightWire = new THREE.LineSegments(new THREE.WireframeGeometry(rightWingGeo), wireMat);
    rightWingGroup.add(rightWire);
    birdRoot.add(rightWingGroup);

    // --- 3. BODY, HEAD, BEAK & CHEST (Origami Folded Geometry) ---
    const bodyGeo = new THREE.BufferGeometry();
    const bodyVertices = new Float32Array([
      // Chest / Neck Triangle (Coral Primary)
      0.1, 0.2, 0.0,
      0.8, 0.7, 0.0,
      0.2, -0.4, 0.0,

      // Head Crown & Face (Coral Secondary)
      0.8, 0.7, 0.0,
      1.3, 0.95, 0.0,
      1.2, 0.65, 0.0,

      // Beak Fold (Folded downwards-forward)
      1.3, 0.95, 0.0,
      1.7, 0.7, 0.0,
      1.2, 0.65, 0.0,

      // Lower Throat Facet
      0.8, 0.7, 0.0,
      1.2, 0.65, 0.0,
      0.5, 0.2, 0.0,

      // Breast Underbelly (Front Green transition)
      0.1, 0.2, 0.05,
      0.2, -0.4, 0.05,
      -0.2, -0.7, 0.05,
    ]);
    bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyVertices, 3));
    bodyGeo.computeVertexNormals();

    const bodyMesh = new THREE.Mesh(bodyGeo, coralSecondaryMat);
    birdRoot.add(bodyMesh);

    const bodyWire = new THREE.LineSegments(new THREE.WireframeGeometry(bodyGeo), wireMat);
    birdRoot.add(bodyWire);

    // --- 4. TAIL (Sharp Folded Trailing Origami Planes) ---
    const tailGeo = new THREE.BufferGeometry();
    const tailVertices = new Float32Array([
      // Upper green tail facet
      0.2, -0.4, 0.05,
      -1.2, -1.8, 0.05,
      -0.4, -0.7, 0.05,

      // Trailing coral pink tail feather
      0.2, -0.4, -0.05,
      -0.4, -0.7, -0.05,
      -1.4, -2.1, -0.05,
    ]);
    tailGeo.setAttribute('position', new THREE.BufferAttribute(tailVertices, 3));
    tailGeo.computeVertexNormals();

    // Create tail mesh using coral for the trailing edge and jade for the upper
    const tailMesh = new THREE.Mesh(tailGeo, coralPrimaryMat);
    birdRoot.add(tailMesh);

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

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
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

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      leftWingGeo.dispose();
      rightWingGeo.dispose();
      bodyGeo.dispose();
      tailGeo.dispose();
      greenOuterMat.dispose();
      greenInnerMat.dispose();
      coralPrimaryMat.dispose();
      coralSecondaryMat.dispose();
      wireMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <img
          src="/brand/linkora-logo.png"
          alt="Linkora Bird"
          className="w-48 h-48 object-contain drop-shadow-2xl animate-pulse"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] flex items-center justify-center select-none pointer-events-auto">
      {/* Soft atmospheric ambient glow tailored to Emerald & Coral */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-emerald-500/15 via-rose-500/15 to-transparent blur-3xl opacity-75" />
      </div>

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="relative w-full h-full z-10 cursor-grab active:cursor-grabbing"
        title="Interactive 3D Origami Bird • Drag to rotate"
      />

      {/* Tactile hint pill */}
      <div className="absolute bottom-1 right-4 z-20 pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-500 shadow-2xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>3D Origami • Drag to inspect</span>
        </span>
      </div>
    </div>
  );
}
