'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Sliders } from 'lucide-react';

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
  // Initial angle matching Free Fire heroic 3/4 floating view
  const targetRotationRef = useRef({ x: 0.16, y: -0.42 });
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060914, 0.075);

    // Medium-wide perspective camera: gives depth to the sci-fi cyber hangar and grounded launch pad
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 6.2);
    camera.lookAt(0, -0.15, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. PROCEDURAL HIGH-TECH CYBER HANGAR FLOOR
    // =========================================================================
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024;
    floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext('2d')!;

    // Dark brushed metal panels
    fctx.fillStyle = '#080d1a';
    fctx.fillRect(0, 0, 1024, 1024);

    // Panel seams & grid tiles
    fctx.strokeStyle = '#0f172a';
    fctx.lineWidth = 4;
    const tileSize = 256;
    for (let x = 0; x <= 1024; x += tileSize) {
      fctx.beginPath();
      fctx.moveTo(x, 0);
      fctx.lineTo(x, 1024);
      fctx.stroke();
    }
    for (let y = 0; y <= 1024; y += tileSize) {
      fctx.beginPath();
      fctx.moveTo(0, y);
      fctx.lineTo(1024, y);
      fctx.stroke();
    }

    // High-tech runway guide lines (Cyan & Amber)
    fctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
    fctx.lineWidth = 6;
    fctx.beginPath();
    fctx.moveTo(512, 0);
    fctx.lineTo(512, 1024);
    fctx.stroke();

    fctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    fctx.lineWidth = 3;
    fctx.beginPath();
    fctx.moveTo(512 - 96, 0);
    fctx.lineTo(512 - 96, 1024);
    fctx.moveTo(512 + 96, 0);
    fctx.lineTo(512 + 96, 1024);
    fctx.stroke();

    // Corner rivet bolts
    fctx.fillStyle = '#334155';
    for (let x = 0; x <= 1024; x += tileSize) {
      for (let y = 0; y <= 1024; y += tileSize) {
        fctx.beginPath();
        fctx.arc(x + 12, y + 12, 3, 0, Math.PI * 2);
        fctx.arc(x - 12, y + 12, 3, 0, Math.PI * 2);
        fctx.arc(x + 12, y - 12, 3, 0, Math.PI * 2);
        fctx.arc(x - 12, y - 12, 3, 0, Math.PI * 2);
        fctx.fill();
      }
    }

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.22,
      metalness: 0.88,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.96;
    scene.add(floor);

    // =========================================================================
    // 3. SCI-FI CYBER HANGAR BACKGROUND WALL & ARCHITECTURE
    // =========================================================================
    const hangarGroup = new THREE.Group();
    hangarGroup.position.set(0, 0, -6.5);
    scene.add(hangarGroup);

    // Rear Bulkhead Wall
    const wallGeo = new THREE.PlaneGeometry(32, 14);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x070b16,
      roughness: 0.6,
      metalness: 0.75,
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 4.0, 0);
    hangarGroup.add(backWall);

    // Structural Hangar Columns (Vertical Beams)
    const columnGeo = new THREE.BoxGeometry(0.7, 12, 0.7);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.9,
    });

    const neonStripMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
    });
    const amberNeonMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
    });

    const columnPositions = [-8, -4.2, 4.2, 8];
    columnPositions.forEach((xPos, idx) => {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(xPos, 3.5, 0.35);
      hangarGroup.add(col);

      // Embedded vertical neon light runner
      const stripGeo = new THREE.BoxGeometry(0.08, 9.5, 0.08);
      const strip = new THREE.Mesh(stripGeo, idx % 2 === 0 ? neonStripMat : amberNeonMat);
      strip.position.set(xPos, 3.5, 0.72);
      hangarGroup.add(strip);
    });

    // Overhead Hangar Girders / Truss Light Bar
    const girderGeo = new THREE.BoxGeometry(22, 0.2, 0.3);
    const girder = new THREE.Mesh(girderGeo, columnMat);
    girder.position.set(0, 6.8, 0.4);
    hangarGroup.add(girder);

    const girderLightGeo = new THREE.BoxGeometry(20, 0.05, 0.05);
    const girderLight = new THREE.Mesh(girderLightGeo, neonStripMat);
    girderLight.position.set(0, 6.7, 0.55);
    hangarGroup.add(girderLight);

    // Background Server Racks with Blinking Diagnostics (Left & Right)
    const rackGeo = new THREE.BoxGeometry(1.8, 5.5, 0.8);
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.4,
      metalness: 0.85,
    });

    const leftRack = new THREE.Mesh(rackGeo, rackMat);
    leftRack.position.set(-6.2, 1.8, 0.6);
    hangarGroup.add(leftRack);

    const rightRack = new THREE.Mesh(rackGeo, rackMat);
    rightRack.position.set(6.2, 1.8, 0.6);
    hangarGroup.add(rightRack);

    // Blinking Status LEDs Array on Racks
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 128;
    ledCanvas.height = 256;
    const lctx = ledCanvas.getContext('2d')!;

    const updateLedTexture = () => {
      lctx.fillStyle = '#050811';
      lctx.fillRect(0, 0, 128, 256);
      for (let r = 0; r < 14; r++) {
        for (let c = 0; c < 6; c++) {
          const rand = Math.random();
          lctx.fillStyle =
            rand > 0.85 ? '#00d4ff' : rand > 0.7 ? '#10b981' : rand > 0.6 ? '#f59e0b' : '#1e293b';
          lctx.fillRect(c * 18 + 10, r * 16 + 12, 10, 8);
        }
      }
    };
    updateLedTexture();

    const ledTexture = new THREE.CanvasTexture(ledCanvas);
    const ledScreenMat = new THREE.MeshBasicMaterial({ map: ledTexture });

    const leftLedScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 4.2), ledScreenMat);
    leftLedScreen.position.set(-6.2, 1.8, 1.02);
    hangarGroup.add(leftLedScreen);

    const rightLedScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 4.2), ledScreenMat);
    rightLedScreen.position.set(6.2, 1.8, 1.02);
    hangarGroup.add(rightLedScreen);

    // Giant Glowing Collegiate Arena Hexagon Ring in Background
    const arenaRingGeo = new THREE.RingGeometry(2.8, 2.9, 6);
    const arenaRingMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const arenaRing = new THREE.Mesh(arenaRingGeo, arenaRingMat);
    arenaRing.position.set(0, 3.8, 0.1);
    hangarGroup.add(arenaRing);

    // =========================================================================
    // 4. RECESSED CYBER LEVITATION PAD (GROUND DISC PLATFORM)
    // =========================================================================
    const discGroup = new THREE.Group();
    discGroup.position.set(0, -0.92, 0); // Sits firmly on the hangar floor
    scene.add(discGroup);

    // Beveled Gunmetal Base Rim
    const discBaseGeo = new THREE.CylinderGeometry(1.9, 2.05, 0.08, 64);
    const discBaseMat = new THREE.MeshStandardMaterial({
      color: 0x050914,
      roughness: 0.18,
      metalness: 0.92,
    });
    const discBase = new THREE.Mesh(discBaseGeo, discBaseMat);
    discBase.position.y = -0.04;
    discGroup.add(discBase);

    // Concentric Glowing Neon Rings
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

    const ringOuter = createNeonRing(1.9, 0.035, 0x00d4ff, 1.8);
    discGroup.add(ringOuter);

    const ringMid1 = createNeonRing(1.55, 0.025, 0x0088ff, 1.4);
    ringMid1.position.y = 0.01;
    discGroup.add(ringMid1);

    const ringMid2 = createNeonRing(1.2, 0.03, 0x00d4ff, 1.8);
    ringMid2.position.y = 0.02;
    discGroup.add(ringMid2);

    const ringInner = createNeonRing(0.78, 0.025, 0x38bdf8, 2.0);
    ringInner.position.y = 0.03;
    discGroup.add(ringInner);

    // Radial Tick Markers & Circuit Nodes
    const tickMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.95 });
    const numTicks = 32;
    for (let i = 0; i < numTicks; i++) {
      const angle = (i / numTicks) * Math.PI * 2;
      const tickGeo = new THREE.BoxGeometry(0.12, 0.02, 0.03);
      const tickMesh = new THREE.Mesh(tickGeo, tickMat);
      tickMesh.position.set(Math.cos(angle) * 1.38, 0.025, Math.sin(angle) * 1.38);
      tickMesh.rotation.y = -angle;
      discGroup.add(tickMesh);
    }

    // =========================================================================
    // 5. BATTLE LAPTOP CENTERPIECE (MEDIUM SCALE, ZERO-G HOVER)
    // =========================================================================
    const laptopGroup = new THREE.Group();
    laptopGroup.scale.set(0.68, 0.68, 0.68);
    laptopGroup.position.set(0, 0.25, 0); // Floating ~1.17 units above the disc
    scene.add(laptopGroup);

    // Dynamic High-Contrast Canvas Texture for Laptop Screen
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
      ctx.fillStyle = '#030712';
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
      ctx.fillStyle = 'rgba(0, 212, 255, 0.35)';
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
      ctx.roundRect(70, 415, 620, 34, 12);
      ctx.fill();

      // Lower Diagnostics Readouts
      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px monospace';
      ctx.fillText('COLLEGIATE COMBAT RIG ELO // 1840 • PEAK', 70, 485);
      ctx.fillText('LATENCY: 8ms // SYNC: 120HZ // CRYPTO-UID LOCKED', 70, 520);

      screenTexture.needsUpdate = true;
    };

    updateScreenTexture();

    // Laptop Materials
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a101f,
      metalness: 0.95,
      roughness: 0.22,
    });

    const edgeNeonMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const keyboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x05070e,
      roughness: 0.6,
      metalness: 0.4,
    });

    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
    });

    // Laptop Base / Chassis
    const baseGeo = new THREE.BoxGeometry(2.1, 0.07, 1.45);
    const baseMesh = new THREE.Mesh(baseGeo, chassisMaterial);
    laptopGroup.add(baseMesh);

    // Glowing Neon Edge Strip along perimeter
    const rimGeo = new THREE.BoxGeometry(2.12, 0.02, 1.47);
    const rimMesh = new THREE.Mesh(rimGeo, edgeNeonMaterial);
    rimMesh.position.y = -0.02;
    laptopGroup.add(rimMesh);

    // Keyboard well & Trackpad
    const keyboardGeo = new THREE.BoxGeometry(1.75, 0.015, 0.7);
    const keyboardMesh = new THREE.Mesh(keyboardGeo, keyboardMaterial);
    keyboardMesh.position.set(0, 0.04, -0.15);
    laptopGroup.add(keyboardMesh);

    const trackpadGeo = new THREE.BoxGeometry(0.7, 0.01, 0.44);
    const trackpadMesh = new THREE.Mesh(trackpadGeo, chassisMaterial);
    trackpadMesh.position.set(0, 0.04, 0.44);
    laptopGroup.add(trackpadMesh);

    // Display Lid & Screen (Hinged at back)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.035, -0.72); // Hinge
    lidGroup.rotation.x = -0.38; // Open ~112 degrees

    const lidGeo = new THREE.BoxGeometry(2.1, 1.4, 0.045);
    const lidMesh = new THREE.Mesh(lidGeo, chassisMaterial);
    lidMesh.position.set(0, 0.7, 0);
    lidGroup.add(lidMesh);

    // Screen surface
    const screenGeo = new THREE.PlaneGeometry(1.98, 1.28);
    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.position.set(0, 0.7, 0.025);
    lidGroup.add(screenMesh);

    laptopGroup.add(lidGroup);

    // =========================================================================
    // 6. ATMOSPHERIC FLOATING DIGITAL PARTICLES / PARTICULATE MOTES
    // =========================================================================
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 7.0;
      particlePositions[i + 1] = Math.random() * 4.0 - 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6.0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // =========================================================================
    // 7. CINEMATIC HANGAR LIGHTING (HIGH-DRAMA AAA SETUP)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x0a1428, 1.4);
    scene.add(ambientLight);

    // Disc upward cyan pointlight illuminating laptop underside
    const discLight = new THREE.PointLight(0x00d4ff, 3.8, 5.0);
    discLight.position.set(0, 0.0, 0);
    scene.add(discLight);

    // Top-right Key Light (Warm golden cyber tone)
    const keyLight = new THREE.DirectionalLight(0xfbbf24, 2.4);
    keyLight.position.set(3.5, 5.0, 3.5);
    scene.add(keyLight);

    // Rim Backlight (Cool Electric Blue)
    const backLight = new THREE.DirectionalLight(0x0066ff, 3.5);
    backLight.position.set(-4.0, 4.0, -3.5);
    scene.add(backLight);

    // Ceiling Hangar Overhead Flood
    const overheadLight = new THREE.PointLight(0x38bdf8, 2.0, 10.0);
    overheadLight.position.set(0, 5.5, 0);
    scene.add(overheadLight);

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

      // Zero-Gravity Floating & Levitation Bobbing
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.003; // continuous 360 spin
        laptopGroup.position.y = 0.25 + Math.sin(elapsed * 1.8) * 0.04;
      }

      // Rotate disc concentric rings in opposite directions
      ringMid1.rotation.z = elapsed * 0.3;
      ringMid2.rotation.z = -elapsed * 0.45;
      ringInner.rotation.z = elapsed * 0.6;

      // Pulse disc light intensity
      discLight.intensity = 3.5 + Math.sin(elapsed * 3) * 0.7;

      // Slowly rotate arena background ring
      arenaRing.rotation.z = elapsed * 0.08;

      // Update screen texture every 3 frames (~20fps)
      if (frameCount % 3 === 0) {
        updateScreenTexture();
      }

      // Update rack LEDs every 15 frames
      if (frameCount % 15 === 0) {
        updateLedTexture();
        ledTexture.needsUpdate = true;
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
      floorTexture.dispose();
      ledTexture.dispose();
    };
  }, [gamerTag, uid, college, rankTitle]);

  const handleResetOrientation = () => {
    targetRotationRef.current = { x: 0.16, y: -0.42 };
  };

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D WebGL Canvas filling the whole viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-none"
      />

      {/* Floating 360° Drag Hint & Orientation Reset */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-500/40 backdrop-blur-xl text-xs font-mono text-slate-300 pointer-events-auto shadow-[0_0_25px_rgba(0,212,255,0.25)]">
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