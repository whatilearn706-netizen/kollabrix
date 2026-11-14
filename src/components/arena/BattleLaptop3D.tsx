'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles } from 'lucide-react';

interface BattleLaptop3DProps {
  gamerTag: string;
  uid: string;
  college?: string;
  rankTitle?: string;
  className?: string;
}

export function BattleLaptop3D({
  gamerTag,
  uid,
  college = 'S-VYASA University',
  rankTitle = 'Gold II • 1,840 ELO',
  className = '',
}: BattleLaptop3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.22, y: -0.45 });
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020408, 0.12);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    // Adjusted camera position to showcase the floating laptop above the holographic disc
    camera.position.set(0, 1.8, 4.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Group for complete laptop assembly
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, 0.85, 0); // Floats above disc
    scene.add(laptopGroup);

    // --- Dynamic High-Contrast Canvas Texture for Laptop Screen ---
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const ctx = screenCanvas.getContext('2d')!;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    // Matrix characters for animated screen background
    const matrixChars = '0100101KOLLABRIXARENACYBERNET';
    const columns = 28;
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * 30));

    let frameCount = 0;
    const updateScreenTexture = () => {
      // Deep cyber obsidian background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      // Subtle cyan/amber matrix digital rain
      ctx.font = '13px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 212, 255, 0.35)' : 'rgba(245, 158, 11, 0.25)';
        ctx.fillText(text, i * 38 + 10, drops[i] * 20);
        if (drops[i] * 20 > screenCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Glass UI Overlay inside laptop screen
      ctx.fillStyle = 'rgba(7, 12, 22, 0.92)';
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(40, 40, screenCanvas.width - 80, screenCanvas.height - 80, 24);
      ctx.fill();
      ctx.stroke();

      // Top Status Bar
      ctx.fillStyle = 'rgba(0, 212, 255, 0.12)';
      ctx.fillRect(40, 40, screenCanvas.width - 80, 68);

      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('⚡ KOLLABRIX CYBER RIG // ZERO-G BATTLEFIELD', 70, 82);

      // Pulsing Green Online Indicator
      ctx.beginPath();
      ctx.arc(screenCanvas.width - 90, 74, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('ACTIVE', screenCanvas.width - 180, 80);

      // Gamer Tag (Center Highlight)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 54px system-ui, sans-serif';
      ctx.fillText(gamerTag.toUpperCase(), 70, 195);

      // 7-Digit Numeric UID Badge (BGMI / Free Fire style)
      ctx.beginPath();
      ctx.roundRect(70, 220, 280, 48, 14);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`UID: ${uid}`, 95, 254);

      // Rank & College info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px system-ui, sans-serif';
      ctx.fillText(`CAMPUS: ${college}`, 70, 315);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText(`RANK: ${rankTitle}`, 70, 360);

      // Interactive Combat Readiness Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(70, 415, screenCanvas.width - 140, 34, 12);
      ctx.fill();

      const grad = ctx.createLinearGradient(70, 0, 70 + 740, 0);
      grad.addColorStop(0, '#00d4ff');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(70, 415, 720 + Math.sin(frameCount * 0.05) * 30, 34, 12);
      ctx.fill();

      ctx.fillStyle = '#060a12';
      ctx.font = '900 17px monospace';
      ctx.fillText('COLLEGIATE COMBAT RIG LOADED • 100% READY', 85, 438);

      // Bottom Hardware Telemetry
      ctx.fillStyle = '#64748b';
      ctx.font = '16px monospace';
      ctx.fillText('LATENCY: 8ms // NEURAL LINK: SYNCED // COMPILER: CLOUD 120FPS', 70, 515);

      screenTexture.needsUpdate = true;
    };

    // --- Build 3D Laptop Geometry (Matches Image 2) ---
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x090c14,
      roughness: 0.18,
      metalness: 0.95,
    });

    const edgeNeonMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x04060a,
      roughness: 0.55,
      metalness: 0.4,
    });

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });

    // 1. Laptop Base / Chassis
    const baseGeo = new THREE.BoxGeometry(2.3, 0.08, 1.55);
    const baseMesh = new THREE.Mesh(baseGeo, chassisMaterial);
    laptopGroup.add(baseMesh);

    // Glowing Neon Edge Strip along perimeter
    const rimGeo = new THREE.BoxGeometry(2.32, 0.02, 1.57);
    const rimMesh = new THREE.Mesh(rimGeo, edgeNeonMaterial);
    rimMesh.position.y = -0.02;
    laptopGroup.add(rimMesh);

    // Keyboard well & Trackpad
    const keyboardGeo = new THREE.BoxGeometry(1.9, 0.015, 0.75);
    const keyboardMesh = new THREE.Mesh(keyboardGeo, keyboardMaterial);
    keyboardMesh.position.set(0, 0.045, -0.15);
    laptopGroup.add(keyboardMesh);

    const trackpadGeo = new THREE.BoxGeometry(0.75, 0.01, 0.48);
    const trackpadMesh = new THREE.Mesh(trackpadGeo, chassisMaterial);
    trackpadMesh.position.set(0, 0.045, 0.48);
    laptopGroup.add(trackpadMesh);

    // 2. Display Lid & Screen (Hinged at back)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.04, -0.77); // Hinge
    lidGroup.rotation.x = -0.38; // Open ~112 degrees like Image 2

    const lidGeo = new THREE.BoxGeometry(2.3, 1.5, 0.05);
    const lidMesh = new THREE.Mesh(lidGeo, chassisMaterial);
    lidMesh.position.set(0, 0.75, 0);
    lidGroup.add(lidMesh);

    // Screen surface
    const screenGeo = new THREE.PlaneGeometry(2.15, 1.35);
    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.position.set(0, 0.75, 0.028);
    lidGroup.add(screenMesh);

    laptopGroup.add(lidGroup);

    // --- Build The Glowing Holographic Cyber Disc Platform (Exact Match to Image 2) ---
    const discGroup = new THREE.Group();
    discGroup.position.set(0, -0.45, 0); // Positioned directly on the dark floor
    scene.add(discGroup);

    // Outer dark platform base
    const discBaseGeo = new THREE.CylinderGeometry(2.2, 2.3, 0.12, 64);
    const discBaseMat = new THREE.MeshStandardMaterial({
      color: 0x050914,
      roughness: 0.15,
      metalness: 0.9,
    });
    const discBase = new THREE.Mesh(discBaseGeo, discBaseMat);
    discBase.position.y = -0.06;
    discGroup.add(discBase);

    // Concentric Glowing Neon Rings (Like Image 2)
    const createNeonRing = (radius: number, tube: number, color: number, emissiveInt: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 80);
      const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: emissiveInt,
        roughness: 0.1,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      return ring;
    };

    const ringOuter = createNeonRing(2.2, 0.035, 0x00d4ff, 1.5);
    discGroup.add(ringOuter);

    const ringMid1 = createNeonRing(1.85, 0.025, 0x0088ff, 1.2);
    ringMid1.position.y = 0.01;
    discGroup.add(ringMid1);

    const ringMid2 = createNeonRing(1.45, 0.03, 0x00d4ff, 1.6);
    ringMid2.position.y = 0.02;
    discGroup.add(ringMid2);

    const ringInner = createNeonRing(0.95, 0.025, 0x38bdf8, 1.8);
    ringInner.position.y = 0.03;
    discGroup.add(ringInner);

    // Glowing Concentric Segment Ticks (Circuit markers around the disc)
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85 });
    const numTicks = 32;
    for (let i = 0; i < numTicks; i++) {
      const angle = (i / numTicks) * Math.PI * 2;
      const tickGeo = new THREE.BoxGeometry(0.12, 0.02, 0.03);
      const tickMesh = new THREE.Mesh(tickGeo, tickMat);
      tickMesh.position.set(Math.cos(angle) * 1.65, 0.025, Math.sin(angle) * 1.65);
      tickMesh.rotation.y = -angle;
      discGroup.add(tickMesh);
    }

    // Upward Volumetric Blue Hologram Glow Column
    const beamGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.8, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 0.9;
    discGroup.add(beam);

    // Ambient floating cyan particles / digital dust
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 4.5;
      particlePositions[i + 1] = Math.random() * 2.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Dark Glossy Reflective Floor (Infinite Space Floor)
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x020408,
      roughness: 0.25,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.52;
    scene.add(floor);

    // --- Cinematic Lights (Matches Image 2 Drama) ---
    const ambientLight = new THREE.AmbientLight(0x0a1428, 1.2);
    scene.add(ambientLight);

    // Disc upward cyan pointlight
    const discLight = new THREE.PointLight(0x00d4ff, 3.5, 4.5);
    discLight.position.set(0, 0.2, 0);
    scene.add(discLight);

    // Top-right Key Light (Cold white/cyan)
    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.2);
    keyLight.position.set(3.5, 4.5, 3.5);
    scene.add(keyLight);

    // Rim backlight (Electric Blue)
    const backLight = new THREE.DirectionalLight(0x0066ff, 3.0);
    backLight.position.set(-3.5, 3.0, -3.5);
    scene.add(backLight);

    // Initial rotation matching Image 2 dramatic angle
    laptopGroup.rotation.x = targetRotationRef.current.x;
    laptopGroup.rotation.y = targetRotationRef.current.y;

    // --- 360° Mouse & Touch Drag Handlers ---
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      setIsInteracting(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x = Math.max(
        -0.45,
        Math.min(0.65, targetRotationRef.current.x + deltaY * 0.008)
      );
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 2000);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setIsInteracting(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseRef.current.x;
      const deltaY = e.touches[0].clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      targetRotationRef.current.y += deltaX * 0.01;
      targetRotationRef.current.x = Math.max(
        -0.45,
        Math.min(0.65, targetRotationRef.current.x + deltaY * 0.01)
      );
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 2000);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // --- Animation Render Loop ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      frameCount++;

      const elapsed = clock.getElapsedTime();

      // Smooth damping interpolation
      laptopGroup.rotation.y += (targetRotationRef.current.y - laptopGroup.rotation.y) * 0.1;
      laptopGroup.rotation.x += (targetRotationRef.current.x - laptopGroup.rotation.x) * 0.1;

      // Zero-Gravity Floating & Levitation Bobbing (Image 2 style)
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0035; // gentle continuous 360 spin
        laptopGroup.position.y = 0.85 + Math.sin(elapsed * 1.8) * 0.07; // smooth levitation
      }

      // Rotate disc concentric rings in opposite directions
      ringMid1.rotation.z = elapsed * 0.3;
      ringMid2.rotation.z = -elapsed * 0.45;
      ringInner.rotation.z = elapsed * 0.6;

      // Pulse disc light intensity
      discLight.intensity = 3.2 + Math.sin(elapsed * 3) * 0.6;

      // Update screen texture every 3 frames (~20fps)
      if (frameCount % 3 === 0) {
        updateScreenTexture();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      screenTexture.dispose();
    };
  }, [gamerTag, uid, college, rankTitle]);

  const handleResetOrientation = () => {
    targetRotationRef.current = { x: 0.22, y: -0.45 };
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D WebGL Canvas filling the whole viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-none"
      />

      {/* Floating 360° Drag Hint & Orientation Reset */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/40 backdrop-blur-xl text-xs font-mono text-slate-300 pointer-events-auto shadow-[0_0_20px_rgba(0,212,255,0.25)]">
        <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>DRAG 360° TO ROTATE BATTLE RIG</span>
        </span>
        <button
          type="button"
          onClick={handleResetOrientation}
          title="Reset orientation"
          className="hover:text-cyan-400 text-slate-400 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
