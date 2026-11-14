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
  college = 'Collegiate Warrior',
  rankTitle = 'Gold II • 1,840 ELO',
  className = '',
}: BattleLaptop3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0.003 });
  const targetRotationRef = useRef({ x: 0.2, y: -0.35 });
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 3.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for complete laptop assembly
    const laptopGroup = new THREE.Group();
    scene.add(laptopGroup);

    // --- Dynamic Canvas Texture for Laptop Screen ---
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const ctx = screenCanvas.getContext('2d')!;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;

    // Matrix characters for animated screen background
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホKOLLABRIXARENA';
    const columns = 28;
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * 30));

    let frameCount = 0;
    const updateScreenTexture = () => {
      // Dark cyber terminal background
      ctx.fillStyle = '#06080e';
      ctx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);

      // Subtle matrix digital rain
      ctx.font = '14px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 158, 11, 0.28)' : 'rgba(6, 182, 212, 0.22)';
        ctx.fillText(text, i * 38 + 10, drops[i] * 20);
        if (drops[i] * 20 > screenCanvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      // Glass UI Overlay inside laptop screen
      ctx.fillStyle = 'rgba(10, 14, 24, 0.88)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(40, 40, screenCanvas.width - 80, screenCanvas.height - 80, 24);
      ctx.fill();
      ctx.stroke();

      // Top Status Bar
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.fillRect(40, 40, screenCanvas.width - 80, 70);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('⚡ KOLLABRIX BATTLE RIG OS v4.2', 70, 84);

      // Pulsing Green Online Indicator
      ctx.beginPath();
      ctx.arc(screenCanvas.width - 90, 75, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('ONLINE', screenCanvas.width - 180, 82);

      // Gamer Tag (Center Highlight)
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 52px system-ui, sans-serif';
      ctx.fillText(gamerTag.toUpperCase(), 70, 200);

      // 7-Digit Numeric UID Badge (BGMI / Free Fire style)
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(70, 226, 260, 44, 12);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`UID: ${uid}`, 95, 257);

      // Rank & College info
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 24px system-ui, sans-serif';
      ctx.fillText(`CAMPUS: ${college}`, 70, 320);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText(`RANK: ${rankTitle}`, 70, 365);

      // Interactive Combat Readiness Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(70, 420, screenCanvas.width - 140, 32, 10);
      ctx.fill();

      // Filled gradient progress bar
      const grad = ctx.createLinearGradient(70, 0, 70 + 720, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(70, 420, 680 + Math.sin(frameCount * 0.05) * 40, 32, 10);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 16px monospace';
      ctx.fillText('DUEL ENGINE LOADED • 100% READY', 85, 442);

      // Bottom Hardware Telemetry
      ctx.fillStyle = '#64748b';
      ctx.font = '16px monospace';
      ctx.fillText('GPU: TITAN-NEO 120FPS // PING: 12ms // MEMORY: 64GB DDR5', 70, 520);

      screenTexture.needsUpdate = true;
    };

    // --- Build 3D Laptop Geometry ---
    // Materials
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1118,
      roughness: 0.25,
      metalness: 0.85,
    });

    const edgeGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    });

    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.5,
      metalness: 0.3,
    });

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });

    // 1. Laptop Base / Chassis
    const baseGeo = new THREE.BoxGeometry(2.2, 0.08, 1.5);
    const baseMesh = new THREE.Mesh(baseGeo, chassisMaterial);
    baseMesh.position.y = 0;
    laptopGroup.add(baseMesh);

    // Glowing RGB lightbar around base rim
    const rimGeo = new THREE.BoxGeometry(2.22, 0.02, 1.52);
    const rimMesh = new THREE.Mesh(rimGeo, edgeGlowMaterial);
    rimMesh.position.y = -0.02;
    laptopGroup.add(rimMesh);

    // Keyboard well & Trackpad
    const keyboardGeo = new THREE.BoxGeometry(1.8, 0.015, 0.7);
    const keyboardMesh = new THREE.Mesh(keyboardGeo, keyboardMaterial);
    keyboardMesh.position.set(0, 0.045, -0.15);
    laptopGroup.add(keyboardMesh);

    const trackpadGeo = new THREE.BoxGeometry(0.7, 0.01, 0.45);
    const trackpadMesh = new THREE.Mesh(trackpadGeo, chassisMaterial);
    trackpadMesh.position.set(0, 0.045, 0.45);
    laptopGroup.add(trackpadMesh);

    // 2. Laptop Display Lid & Screen (Hinged at back)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.04, -0.75); // Hinge location
    lidGroup.rotation.x = -0.32; // Open ~110 degrees

    const lidGeo = new THREE.BoxGeometry(2.2, 1.45, 0.05);
    const lidMesh = new THREE.Mesh(lidGeo, chassisMaterial);
    lidMesh.position.set(0, 0.725, 0);
    lidGroup.add(lidMesh);

    // Screen surface
    const screenGeo = new THREE.PlaneGeometry(2.05, 1.3);
    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.position.set(0, 0.725, 0.028);
    lidGroup.add(screenMesh);

    laptopGroup.add(lidGroup);

    // 3. Holographic Anti-Gravity Pedestal Ring (Floating Underneath)
    const ringGeo = new THREE.TorusGeometry(1.4, 0.03, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
    const pedestalRing = new THREE.Mesh(ringGeo, ringMat);
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = -0.45;
    scene.add(pedestalRing);

    const innerRingGeo = new THREE.TorusGeometry(1.0, 0.02, 16, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.8,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -0.55;
    scene.add(innerRing);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 2.5);
    dirLight1.position.set(3, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 2.0);
    dirLight2.position.set(-3, 2, -2);
    scene.add(dirLight2);

    // Initial orientation
    laptopGroup.rotation.x = targetRotationRef.current.x;
    laptopGroup.rotation.y = targetRotationRef.current.y;

    // --- Interactive Drag Rotation Handlers ---
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
        -0.4,
        Math.min(0.7, targetRotationRef.current.x + deltaY * 0.008)
      );
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => setIsInteracting(false), 2000);
    };

    // Touch Support for Mobile / Tablets
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
        -0.4,
        Math.min(0.7, targetRotationRef.current.x + deltaY * 0.01)
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

      // Smooth damping interpolation toward target rotation
      laptopGroup.rotation.y += (targetRotationRef.current.y - laptopGroup.rotation.y) * 0.1;
      laptopGroup.rotation.x += (targetRotationRef.current.x - laptopGroup.rotation.x) * 0.1;

      // When not dragging, apply gentle idle levitation and slow orbit
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0035; // gentle continuous 360 spin
        laptopGroup.position.y = Math.sin(elapsed * 1.5) * 0.06; // levitating bob
      }

      // Rotate hologram pedestal rings
      pedestalRing.rotation.z = elapsed * 0.4;
      innerRing.rotation.z = -elapsed * 0.6;

      // Update dynamic matrix code screen every 3 frames (~20fps for terminal look)
      if (frameCount % 3 === 0) {
        updateScreenTexture();
      }

      renderer.render(scene, camera);
    };

    animate();

    // Window resize handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 480;
      const newH = container.clientHeight || 360;
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
    targetRotationRef.current = { x: 0.2, y: -0.35 };
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-[320px] sm:h-[380px] md:h-[440px] cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-none"
      />

      {/* Floating 360° Drag Hint & Orientation Reset */}
      <div className="absolute bottom-2 flex items-center gap-3 px-3 py-1 rounded-full bg-slate-950/70 border border-amber-500/25 backdrop-blur-md text-[11px] font-mono text-slate-300 pointer-events-auto">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>DRAG 360° TO ROTATE RIG</span>
        </span>
        <button
          type="button"
          onClick={handleResetOrientation}
          title="Reset orientation"
          className="hover:text-amber-400 text-slate-400 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
