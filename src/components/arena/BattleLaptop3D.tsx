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
  // Initial angle matching Image 2 heroic floating view
  const targetRotationRef = useRef({ x: 0.18, y: -0.36 });
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer (Pure Alpha for Layering over 4K AAA Hangar Stage)
    const scene = new THREE.Scene();

    // Focused camera aligned with the photorealistic disc in the backdrop
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 5.4);
    camera.lookAt(0, 0.22, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. 3D BATTLE LAPTOP CENTERPIECE (PREMIUM ANODIZED TITANIUM PBR)
    // =========================================================================
    const laptopGroup = new THREE.Group();
    laptopGroup.scale.set(0.72, 0.72, 0.72);
    // Positioned to float right in the focal sweet-spot above the glowing disc
    laptopGroup.position.set(0, 0.32, 0);
    scene.add(laptopGroup);

    // --- Dynamic High-Contrast Canvas Texture for Laptop Screen ---
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const ctx = screenCanvas.getContext('2d')!;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    // Digital matrix rain columns
    const columns = 28;
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * 20));
    const chars = '01KOLLABRIXARENA789';
    let frameCount = 0;

    const updateScreenTexture = () => {
      // Deep cyberpunk navy background with cyber grid
      ctx.fillStyle = '#020612';
      ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      // Fine grid lines
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < screenCanvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, screenCanvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < screenCanvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(screenCanvas.width, y);
        ctx.stroke();
      }

      // Matrix Digital Rain
      ctx.fillStyle = 'rgba(0, 212, 255, 0.38)';
      ctx.font = '15px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 36 + 18;
        const y = drops[i] * 20;
        ctx.fillText(text, x, y);
        if (drops[i] * 20 > screenCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Glass UI Overlay inside laptop screen
      ctx.fillStyle = 'rgba(6, 11, 24, 0.92)';
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(35, 35, screenCanvas.width - 70, screenCanvas.height - 70, 24);
      ctx.fill();
      ctx.stroke();

      // Top Status Bar
      ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.fillRect(35, 35, screenCanvas.width - 70, 70);

      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('⚡ KOLLABRIX COMBAT RIG // ZERO-G BATTLEFIELD', 65, 78);

      // Pulsing Green Online Indicator
      ctx.beginPath();
      ctx.arc(screenCanvas.width - 80, 70, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('ACTIVE', screenCanvas.width - 170, 76);

      // Gamer Tag (Center Highlight)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 56px system-ui, sans-serif';
      ctx.fillText(gamerTag.toUpperCase(), 65, 195);

      // 7-Digit Numeric UID Badge (BGMI / Free Fire style)
      ctx.beginPath();
      ctx.roundRect(65, 220, 290, 48, 14);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`UID: ${uid}`, 90, 254);

      // Rank & College info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px system-ui, sans-serif';
      ctx.fillText(`CAMPUS: ${college}`, 65, 315);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText(`RANK: ${rankTitle}`, 65, 360);

      // Interactive Combat Readiness Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(65, 415, screenCanvas.width - 130, 34, 12);
      ctx.fill();

      const grad = ctx.createLinearGradient(65, 0, 65 + 740, 0);
      grad.addColorStop(0, '#00d4ff');
      grad.addColorStop(0.5, '#3b82f6');
      grad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(65, 415, 630, 34, 12);
      ctx.fill();

      // Lower Diagnostics Readouts
      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px monospace';
      ctx.fillText('COLLEGIATE COMBAT RIG ELO // 1840 • PEAK', 65, 485);
      ctx.fillText('LATENCY: 8ms // SYNC: 120HZ // CRYPTO-UID LOCKED', 65, 520);

      screenTexture.needsUpdate = true;
    };

    updateScreenTexture();

    // Sculpted Metallic Materials
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x090e1c, // Anodized Space Obsidian Metal
      metalness: 0.94,
      roughness: 0.18,
    });

    const edgeNeonMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 2.6,
      roughness: 0.1,
    });

    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x04060d,
      roughness: 0.55,
      metalness: 0.45,
    });

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });

    // 1. Laptop Base / Chassis
    const baseGeo = new THREE.BoxGeometry(2.1, 0.065, 1.45);
    const baseMesh = new THREE.Mesh(baseGeo, chassisMaterial);
    laptopGroup.add(baseMesh);

    // Glowing Neon Edge Strip along perimeter
    const rimGeo = new THREE.BoxGeometry(2.12, 0.018, 1.47);
    const rimMesh = new THREE.Mesh(rimGeo, edgeNeonMaterial);
    rimMesh.position.y = -0.02;
    laptopGroup.add(rimMesh);

    // Keyboard well & Trackpad
    const keyboardGeo = new THREE.BoxGeometry(1.75, 0.015, 0.7);
    const keyboardMesh = new THREE.Mesh(keyboardGeo, keyboardMaterial);
    keyboardMesh.position.set(0, 0.038, -0.15);
    laptopGroup.add(keyboardMesh);

    const trackpadGeo = new THREE.BoxGeometry(0.7, 0.01, 0.44);
    const trackpadMesh = new THREE.Mesh(trackpadGeo, chassisMaterial);
    trackpadMesh.position.set(0, 0.038, 0.44);
    laptopGroup.add(trackpadMesh);

    // 2. Display Lid & Screen (Hinged at back)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.035, -0.72); // Hinge
    lidGroup.rotation.x = -0.38; // Open ~112 degrees matching Image 2

    const lidGeo = new THREE.BoxGeometry(2.1, 1.4, 0.045);
    const lidMesh = new THREE.Mesh(lidGeo, chassisMaterial);
    lidMesh.position.set(0, 0.7, 0);
    lidGroup.add(lidMesh);

    // Glowing Kollabrix Emblem on the back of the laptop lid!
    const emblemGeo = new THREE.RingGeometry(0.12, 0.18, 6);
    const emblemMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      side: THREE.DoubleSide,
    });
    const backEmblem = new THREE.Mesh(emblemGeo, emblemMat);
    backEmblem.position.set(0, 0.7, -0.026);
    lidGroup.add(backEmblem);

    // Screen surface
    const screenGeo = new THREE.PlaneGeometry(1.98, 1.28);
    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.position.set(0, 0.7, 0.025);
    lidGroup.add(screenMesh);

    laptopGroup.add(lidGroup);

    // =========================================================================
    // 3. 3D FLOATING CYBER PARTICLES & AMBIENT DUST
    // =========================================================================
    const particleCount = 50;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 5.0;
      particlePositions[i + 1] = Math.random() * 3.5 - 1.0;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.038,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // =========================================================================
    // 4. CINEMATIC LIGHTING MATCHING THE BACKGROUND STAGE
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a1428, 1.6);
    scene.add(ambientLight);

    // Upward Cyan Pointlight matching the glowing disc in the backdrop
    const discLight = new THREE.PointLight(0x00d4ff, 4.2, 4.5);
    discLight.position.set(0, -0.6, 0);
    scene.add(discLight);

    // Top-right Key Light (Warm cyber golden tone)
    const keyLight = new THREE.DirectionalLight(0x7dd3fc, 2.5);
    keyLight.position.set(3.5, 4.0, 3.5);
    scene.add(keyLight);

    // Rim Backlight (Electric Blue)
    const backLight = new THREE.DirectionalLight(0x0066ff, 3.8);
    backLight.position.set(-3.5, 3.0, -3.5);
    scene.add(backLight);

    // Initial rotation
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

      // Zero-Gravity Floating & Levitation Bobbing above the glowing disc
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.003; // gentle continuous 360 spin
        laptopGroup.position.y = 0.32 + Math.sin(elapsed * 1.8) * 0.035; // smooth levitation
      }

      // Pulse disc light intensity
      discLight.intensity = 4.0 + Math.sin(elapsed * 3) * 0.8;

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
    targetRotationRef.current = { x: 0.18, y: -0.36 };
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}>
      {/* Photorealistic 4K Cyber Stage Background (From User Reference Image 2) */}
      <img
        src="/brand/arena-stage-bg.jpg"
        alt="Battle Arena Cyber Hangar Stage"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Atmospheric Shimmer Overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-cyan-950/10 to-slate-950/60 pointer-events-none z-0" />

      {/* 3D WebGL Canvas Layer: Interactive Floating Battle Laptop */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-none z-10"
      />

      {/* Floating 360° Drag Hint & Orientation Reset */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-500/40 backdrop-blur-xl text-xs font-mono text-slate-300 pointer-events-auto shadow-[0_0_25px_rgba(0,212,255,0.25)] z-20">
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