'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, ExternalLink } from 'lucide-react';

/**
 * 3D "Mind Blown" Student Sculpture
 * Features:
 * - A stylized student bust (chest, shoulders, neck, head with cyber visor).
 * - A dramatic "Brain Blast" cosmic cranial opening where a luminous neural core erupts.
 * - Orbiting zero-gravity 3D medallions for Java, Python, CSS3, C++, React/JS, HTML5, and DSA.
 * - Pulsing synaptic energy lines connecting the brain core to the orbiting tech badges.
 * - 160+ swirling cosmic particle sparks erupting from the brain.
 * - Interactive: Drag to rotate in 360°, hover to accelerate orbits, and tap/click to open Resources in a new tab!
 */
export function BrainBlastSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

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

      // 1. Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 7.5);

      // 2. Renderer
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
      activeContainer.innerHTML = '';
      activeContainer.appendChild(renderer.domElement);
      setIsCanvasReady(true);

      // 3. Multi-point Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      // Key light from top-front
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
      keyLight.position.set(4, 5, 5);
      scene.add(keyLight);

      // Cyan fill light from left
      const cyanLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
      cyanLight.position.set(-5, 1, 3);
      scene.add(cyanLight);

      // Magenta/Pink rim light from right
      const magentaLight = new THREE.DirectionalLight(0xec4899, 1.4);
      magentaLight.position.set(5, 2, -3);
      scene.add(magentaLight);

      // Internal glowing point light inside brain core
      const brainLight = new THREE.PointLight(0xa855f7, 3.5, 6);
      brainLight.position.set(0, 1.3, 0);
      scene.add(brainLight);

      // 4. Main Model Root Group
      const modelRoot = new THREE.Group();
      modelRoot.position.set(0, -0.9, 0);
      scene.add(modelRoot);

      // ==========================================
      // SECTION A: STUDENT BUST (Chest & Shoulders up)
      // ==========================================
      const bustGroup = new THREE.Group();
      modelRoot.add(bustGroup);

      // Hoodie / Chest Materials
      const hoodieMat = new THREE.MeshStandardMaterial({
        color: 0x18182b, // deep obsidian navy
        roughness: 0.5,
        metalness: 0.2,
      });

      const neonTrimMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x6366f1,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });

      // Stylized Torso / Chest
      const chestGeo = new THREE.CylinderGeometry(1.2, 1.5, 1.3, 32);
      const chestMesh = new THREE.Mesh(chestGeo, hoodieMat);
      chestMesh.position.set(0, 0.15, 0);
      bustGroup.add(chestMesh);

      // Shoulder contours (Left & Right)
      const leftShoulderGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const leftShoulder = new THREE.Mesh(leftShoulderGeo, hoodieMat);
      leftShoulder.position.set(-1.25, 0.45, 0);
      bustGroup.add(leftShoulder);

      const rightShoulderGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const rightShoulder = new THREE.Mesh(rightShoulderGeo, hoodieMat);
      rightShoulder.position.set(1.25, 0.45, 0);
      bustGroup.add(rightShoulder);

      // Hoodie Collar with Neon Edge Ring
      const collarGeo = new THREE.TorusGeometry(0.65, 0.12, 16, 32);
      collarGeo.rotateX(Math.PI / 2);
      const collarMesh = new THREE.Mesh(collarGeo, neonTrimMat);
      collarMesh.position.set(0, 0.8, 0);
      bustGroup.add(collarMesh);

      // Neck
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // warm stylized character skin
        roughness: 0.45,
        metalness: 0.05,
      });

      const neckGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.6, 24);
      const neckMesh = new THREE.Mesh(neckGeo, skinMat);
      neckMesh.position.set(0, 1.05, 0);
      bustGroup.add(neckMesh);

      // Head Base
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.6, 0);
      bustGroup.add(headGroup);

      const headGeo = new THREE.SphereGeometry(0.82, 32, 28);
      headGeo.scale(0.95, 1.1, 0.95);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headGroup.add(headMesh);

      // Cyber Holographic Visor across Eyes
      const visorGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.3, 32, 1, true, -Math.PI / 2.3, Math.PI / 1.15);
      const visorMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.9,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.88,
        clearcoat: 1.0,
      });
      const visorMesh = new THREE.Mesh(visorGeo, visorMat);
      visorMesh.position.set(0, 0.05, 0.08);
      headGroup.add(visorMesh);

      // Visor frame trim
      const visorFrameGeo = new THREE.TorusGeometry(0.87, 0.03, 12, 32, Math.PI);
      visorFrameGeo.rotateX(Math.PI / 2);
      visorFrameGeo.rotateZ(Math.PI / 2);
      const visorFrameMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        emissiveIntensity: 0.7,
      });
      const visorFrame = new THREE.Mesh(visorFrameGeo, visorFrameMat);
      visorFrame.position.set(0, 0.05, 0.08);
      headGroup.add(visorFrame);

      // Hair tufts / stylized haircut
      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.6,
      });
      for (let i = 0; i < 7; i++) {
        const hairTuftGeo = new THREE.ConeGeometry(0.2, 0.45, 8);
        hairTuftGeo.rotateZ(0.2 - i * 0.06);
        const hairMesh = new THREE.Mesh(hairTuftGeo, hairMat);
        hairMesh.position.set(-0.75 + i * 0.25, 0.45 - Math.abs(i - 3) * 0.08, -0.3);
        headGroup.add(hairMesh);
      }

      // ==========================================
      // SECTION B: THE CRANIAL BRAIN BLAST VORTEX
      // ==========================================
      const brainGroup = new THREE.Group();
      brainGroup.position.set(0, 0.75, 0);
      headGroup.add(brainGroup);

      // Glowing Brain Hemispheres
      const brainMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7, // vibrant electric violet
        emissive: 0x9333ea,
        emissiveIntensity: 1.6,
        roughness: 0.2,
        metalness: 0.3,
      });

      // Left Hemisphere
      const leftHemiGeo = new THREE.SphereGeometry(0.42, 20, 20);
      leftHemiGeo.scale(0.8, 1.0, 1.2);
      const leftHemi = new THREE.Mesh(leftHemiGeo, brainMat);
      leftHemi.position.set(-0.25, 0.15, 0.05);
      brainGroup.add(leftHemi);

      // Right Hemisphere
      const rightHemiGeo = new THREE.SphereGeometry(0.42, 20, 20);
      rightHemiGeo.scale(0.8, 1.0, 1.2);
      const rightHemi = new THREE.Mesh(rightHemiGeo, brainMat);
      rightHemi.position.set(0.25, 0.15, 0.05);
      brainGroup.add(rightHemi);

      // Plasma Vortex rising from brain
      const plasmaGeo = new THREE.ConeGeometry(0.5, 1.2, 24, 1, true);
      const plasmaMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
      });
      const plasmaMesh = new THREE.Mesh(plasmaGeo, plasmaMat);
      plasmaMesh.position.set(0, 0.75, 0);
      brainGroup.add(plasmaMesh);

      // Cranium Fracture Shards (Exploding outward around crown)
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.3,
        metalness: 0.2,
      });
      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2;
        const shardGeo = new THREE.TetrahedronGeometry(0.18 + Math.random() * 0.08);
        const shard = new THREE.Mesh(shardGeo, shardMat);
        shard.position.set(Math.cos(ang) * 0.72, 0.18 + (s % 2) * 0.12, Math.sin(ang) * 0.68);
        shard.rotation.set(Math.random(), Math.random(), Math.random());
        brainGroup.add(shard);
      }

      // ==========================================
      // SECTION C: ORBITING 3D TECH BADGES (JAVA, PYTHON, CSS, C++, REACT/JS, DSA)
      // ==========================================
      const badgesGroup = new THREE.Group();
      headGroup.add(badgesGroup);

      // Helper to generate a double-sided crisp canvas texture for each language
      const createTechBadgeTexture = (
        iconText: string,
        label: string,
        tag: string,
        bgColor: string,
        borderColor: string,
        glowColor: string
      ) => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 320;
        const ctx = c.getContext('2d');
        if (!ctx) return new THREE.CanvasTexture(c);

        // Rounded Card Background
        const r = 36;
        const w = 500;
        const h = 308;
        const x = 6;
        const y = 6;

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();

        // Glowing border
        ctx.lineWidth = 14;
        ctx.strokeStyle = borderColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 24;
        ctx.stroke();

        // Icon
        ctx.shadowBlur = 0;
        ctx.font = 'bold 80px "SF Pro Display", -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(iconText, 256, 115);

        // Language Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "SF Pro Display", sans-serif';
        ctx.fillText(label, 256, 205);

        // Tech Tag
        ctx.fillStyle = borderColor;
        ctx.font = 'bold 26px monospace';
        ctx.fillText(tag, 256, 260);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      };

      // Define the 6 tech medallions exploding from the brain
      const techBadgesData = [
        {
          name: 'Java',
          icon: '☕',
          label: 'JAVA',
          tag: 'OOP & DSA',
          bg: '#2e1202',
          border: '#f59e0b',
          glow: '#d97706',
          radius: 1.85,
          angleOffset: 0,
          speed: 0.6,
          yOffset: 0.6,
        },
        {
          name: 'Python',
          icon: '🐍',
          label: 'PYTHON',
          tag: 'FASTAPI & AI',
          bg: '#042718',
          border: '#10b981',
          glow: '#059669',
          radius: 2.15,
          angleOffset: (Math.PI * 2) / 6,
          speed: 0.55,
          yOffset: 0.95,
        },
        {
          name: 'CSS3',
          icon: '🎨',
          label: 'CSS3 / UI',
          tag: 'MODERN WEB',
          bg: '#08213b',
          border: '#3b82f6',
          glow: '#2563eb',
          radius: 1.95,
          angleOffset: ((Math.PI * 2) / 6) * 2,
          speed: 0.65,
          yOffset: 1.25,
        },
        {
          name: 'C++',
          icon: '⚡',
          label: 'C++',
          tag: 'SPEED & MEMORY',
          bg: '#082630',
          border: '#06b6d4',
          glow: '#0891b2',
          radius: 2.25,
          angleOffset: ((Math.PI * 2) / 6) * 3,
          speed: 0.58,
          yOffset: 0.75,
        },
        {
          name: 'React/JS',
          icon: '⚛️',
          label: 'REACT / JS',
          tag: 'NEXT.JS & DOM',
          bg: '#250d36',
          border: '#a855f7',
          glow: '#9333ea',
          radius: 2.05,
          angleOffset: ((Math.PI * 2) / 6) * 4,
          speed: 0.62,
          yOffset: 1.15,
        },
        {
          name: 'DSA',
          icon: '🧠',
          label: 'DSA',
          tag: 'TREES & GRAPHS',
          bg: '#33081a',
          border: '#f43f5e',
          glow: '#e11d48',
          radius: 2.35,
          angleOffset: ((Math.PI * 2) / 6) * 5,
          speed: 0.52,
          yOffset: 1.35,
        },
      ];

      const activeBadgeMeshes: Array<{
        mesh: THREE.Mesh;
        data: (typeof techBadgesData)[0];
        initialY: number;
      }> = [];

      techBadgesData.forEach((item) => {
        const tex = createTechBadgeTexture(item.icon, item.label, item.tag, item.bg, item.border, item.glow);
        const badgeGeo = new THREE.BoxGeometry(0.75, 0.48, 0.06);
        const badgeMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.25,
          metalness: 0.3,
          emissive: new THREE.Color(item.border),
          emissiveIntensity: 0.25,
        });

        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgesGroup.add(badgeMesh);

        activeBadgeMeshes.push({
          mesh: badgeMesh,
          data: item,
          initialY: item.yOffset,
        });
      });

      // ==========================================
      // SECTION D: SYNAPTIC ENERGY LINES & SWIRLING SPARKS
      // ==========================================
      // Swirling cosmic particle sparks shooting out from brain
      const particleCount = 180;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);
      const particleSpeeds = new Float32Array(particleCount);

      const palette = [
        new THREE.Color(0xf59e0b), // Amber
        new THREE.Color(0x10b981), // Emerald
        new THREE.Color(0x06b6d4), // Cyan
        new THREE.Color(0xa855f7), // Purple
        new THREE.Color(0xec4899), // Pink
        new THREE.Color(0x3b82f6), // Blue
      ];

      for (let p = 0; p < particleCount; p++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = 0.2 + Math.random() * 2.2;
        const py = 0.2 + Math.random() * 2.2;

        particlePositions[p * 3] = Math.cos(ang) * rad;
        particlePositions[p * 3 + 1] = py;
        particlePositions[p * 3 + 2] = Math.sin(ang) * rad;

        const col = palette[p % palette.length];
        particleColors[p * 3] = col.r;
        particleColors[p * 3 + 1] = col.g;
        particleColors[p * 3 + 2] = col.b;

        particleSpeeds[p] = 0.4 + Math.random() * 1.2;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

      const particleMat = new THREE.PointsMaterial({
        size: 0.075,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      const sparkPoints = new THREE.Points(particleGeo, particleMat);
      headGroup.add(sparkPoints);

      // ==========================================
      // SECTION E: INTERACTIVITY (DRAG, ROTATE, TAP)
      // ==========================================
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let targetRotY = 0.35;
      let targetRotX = 0.05;
      let currentRotY = 0.35;
      let currentRotX = 0.05;
      let pointerDownPos = { x: 0, y: 0 };
      let dragDistance = 0;

      const handlePointerDown = (clientX: number, clientY: number) => {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        pointerDownPos = { x: clientX, y: clientY };
        dragDistance = 0;
      };

      const handlePointerMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        dragDistance += Math.hypot(deltaX, deltaY);

        targetRotY += deltaX * 0.0075;
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX + deltaY * 0.005));

        startX = clientX;
        startY = clientY;
      };

      const handlePointerUp = () => {
        if (isDragging) {
          isDragging = false;
          // If pointer moved less than 8px, user tapped/clicked on model!
          if (dragDistance < 8) {
            handleOpenResources();
          }
        }
      };

      const handleOpenResources = () => {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 800);
        // Open resources in a new tab
        window.open('/resources', '_blank');
      };

      // Mouse Events
      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        handlePointerDown(e.clientX, e.clientY);
      };

      const handleMouseMove = (e: MouseEvent) => {
        handlePointerMove(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        handlePointerUp();
      };

      // Touch Events
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      const handleTouchEnd = () => {
        handlePointerUp();
      };

      // Hover triggers
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => {
        setIsHovered(false);
        isDragging = false;
      };

      activeContainer.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      activeContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
      activeContainer.addEventListener('mouseenter', handleMouseEnter);
      activeContainer.addEventListener('mouseleave', handleMouseLeave);

      // Window resize
      const handleResize = () => {
        if (!activeContainer) return;
        const w = activeContainer.clientWidth || 460;
        const h = activeContainer.clientHeight || 460;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // ==========================================
      // SECTION F: REAL-TIME ANIMATION LOOP
      // ==========================================
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const t = clock.getElapsedTime();

        // 1. Smooth rotation damping towards target
        currentRotY += (targetRotY - currentRotY) * 0.08;
        currentRotX += (targetRotX - currentRotX) * 0.08;

        // Auto gentle idle rotation when not dragging
        if (!isDragging) {
          targetRotY += 0.0035;
        }

        modelRoot.rotation.y = currentRotY;
        modelRoot.rotation.x = currentRotX;

        // 2. Student breathing / subtle head bobbing
        headGroup.position.y = 1.6 + Math.sin(t * 1.8) * 0.035;
        headGroup.rotation.z = Math.sin(t * 0.9) * 0.02;

        // 3. Brain pulsating thought energy
        const brainPulse = 1.4 + Math.sin(t * 4.2) * 0.45;
        brainLight.intensity = brainPulse * 2.2;
        brainMat.emissiveIntensity = brainPulse;
        plasmaMesh.rotation.y = t * 1.5;

        // 4. Orbiting tech badges animation
        const speedMultiplier = isHovered ? 1.6 : 1.0;
        activeBadgeMeshes.forEach(({ mesh, data, initialY }) => {
          const orbitAngle = t * data.speed * speedMultiplier + data.angleOffset;
          mesh.position.x = Math.cos(orbitAngle) * data.radius;
          mesh.position.z = Math.sin(orbitAngle) * data.radius;
          mesh.position.y = initialY + Math.sin(t * 2.2 + data.angleOffset) * 0.12;

          // Always face slightly towards camera with gentle tumbling
          mesh.rotation.y = -orbitAngle + Math.PI / 2 + Math.sin(t + data.angleOffset) * 0.15;
          mesh.rotation.x = Math.sin(t * 1.8 + data.angleOffset) * 0.12;
        });

        // 5. Swirling particle sparks rising from the brain
        const posAttr = sparkPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let p = 0; p < particleCount; p++) {
          let y = positions[p * 3 + 1];
          y += delta * particleSpeeds[p];

          // If reached top, reset back to brain blast core
          if (y > 2.5) {
            y = 0.2;
            const resetAng = Math.random() * Math.PI * 2;
            const resetRad = 0.15 + Math.random() * 0.4;
            positions[p * 3] = Math.cos(resetAng) * resetRad;
            positions[p * 3 + 2] = Math.sin(resetAng) * resetRad;
          }
          positions[p * 3 + 1] = y;

          // Swirl around Y axis
          const curX = positions[p * 3];
          const curZ = positions[p * 3 + 2];
          const curAngle = Math.atan2(curZ, curX) + delta * 1.2;
          const curRad = Math.hypot(curX, curZ);
          positions[p * 3] = Math.cos(curAngle) * curRad;
          positions[p * 3 + 2] = Math.sin(curAngle) * curRad;
        }
        posAttr.needsUpdate = true;

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
        activeContainer.removeEventListener('mouseenter', handleMouseEnter);
        activeContainer.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleResize);

        if (activeContainer && renderer.domElement && activeContainer.contains(renderer.domElement)) {
          activeContainer.removeChild(renderer.domElement);
        }

        // Dispose geometries & materials
        chestGeo.dispose();
        leftShoulderGeo.dispose();
        rightShoulderGeo.dispose();
        collarGeo.dispose();
        neckGeo.dispose();
        headGeo.dispose();
        visorGeo.dispose();
        leftHemiGeo.dispose();
        rightHemiGeo.dispose();
        plasmaGeo.dispose();
        particleGeo.dispose();
        hoodieMat.dispose();
        skinMat.dispose();
        neonTrimMat.dispose();
        visorMat.dispose();
        brainMat.dispose();
        plasmaMat.dispose();
        particleMat.dispose();
        renderer.dispose();
      };
    };

    // Initialize WebGL
    initWebGL();

    return () => {
      destroyed = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  // WebGL Fallback if device does not support WebGL
  if (!webglSupported) {
    return (
      <div
        onClick={() => window.open('/resources', '_blank')}
        className="w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer text-center space-y-3"
      >
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 animate-pulse">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-5xl">
            🧠⚡
          </div>
        </div>
        <p className="text-xs font-bold text-white font-mono">Tap to Open Collegiate Resources Hub 🚀</p>
      </div>
    );
  }

  return (
    <div
      onClick={() => window.open('/resources', '_blank')}
      className="relative w-full h-[400px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none pointer-events-auto cursor-pointer group"
      title="🧠 Mind Blown by Code • Tap 3D Model to Open Resources Hub"
    >
      {/* Dynamic Cosmic Shockwave background aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-indigo-600/25 via-purple-600/30 to-pink-500/25 blur-3xl transition-all duration-700 ${
            isHovered ? 'scale-125 opacity-90' : 'scale-100 opacity-60'
          }`}
        />
        {isClicked && (
          <div className="absolute w-[450px] h-[450px] rounded-full border-2 border-cyan-400/80 animate-ping pointer-events-none" />
        )}
      </div>

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full z-10 transition-opacity duration-500 flex items-center justify-center ${
          isCanvasReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Floating Interactive Badge (Prompt to Tap / Open Resources) */}
      <div className="absolute bottom-2 z-20 pointer-events-none transition-transform duration-300 group-hover:scale-105">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 text-xs font-mono text-white shadow-xl shadow-indigo-950/60">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text">
            Mind Blown by Code • Tap Brain to Open Resources
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-pink-400 ml-0.5" />
        </div>
      </div>
    </div>
  );
}

// Export OrigamiBirdSculpture alias so any existing dynamic imports resolve seamlessly
export const OrigamiBirdSculpture = BrainBlastSculpture;
