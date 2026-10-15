'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function HeroSculpture() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
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
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let knotMesh: THREE.Mesh;
    let wireMesh: THREE.LineSegments | null = null;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // Custom Chromatic Flow Shader Material
    // Creates continuous silky folds with vivid violet, hot pink, electric blue, cyan, and coral
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        vPosition = position;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      varying vec3 vViewPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel edge glow
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.5);

        // Moving spatial wave coordinates
        float wave = sin(vPosition.x * 1.5 + vPosition.y * 1.2 + vPosition.z * 1.4 + uTime * 0.8);
        float wave2 = cos(vPosition.y * 2.0 - vPosition.z * 1.5 + uTime * 0.5);

        // Core Palette (Violet, Hot Pink, Electric Blue, Cyan, Coral)
        vec3 violet = vec3(0.48, 0.23, 0.93);    // #7c3aed
        vec3 hotPink = vec3(0.93, 0.28, 0.60);   // #ec4899
        vec3 electricBlue = vec3(0.15, 0.45, 0.95); // #2563eb
        vec3 cyan = vec3(0.02, 0.71, 0.83);      // #06b6d4
        vec3 coral = vec3(0.98, 0.45, 0.32);     // #fa7252

        // Multi-layered chromatic transitions
        vec3 colA = mix(violet, hotPink, smoothstep(-1.0, 1.0, wave));
        vec3 colB = mix(electricBlue, cyan, smoothstep(-1.0, 1.0, wave2));
        vec3 baseColor = mix(colA, colB, 0.45 + 0.35 * sin(uTime * 0.4));

        // Highlight with coral on steep ridges
        float ridge = smoothstep(0.5, 0.9, abs(normal.y));
        baseColor = mix(baseColor, coral, ridge * 0.4);

        // Specular studio lighting
        vec3 lightDir1 = normalize(vec3(1.2, 1.8, 2.0));
        vec3 lightDir2 = normalize(vec3(-1.5, -1.0, 1.5));
        
        float diff1 = max(dot(normal, lightDir1), 0.0);
        float diff2 = max(dot(normal, lightDir2), 0.0);

        vec3 halfVector1 = normalize(lightDir1 + viewDir);
        float spec1 = pow(max(dot(normal, halfVector1), 0.0), 32.0);

        // Compose final illuminated color
        vec3 finalColor = baseColor * (0.45 + 0.55 * diff1 + 0.25 * diff2);
        finalColor += vec3(1.0, 0.95, 0.9) * (spec1 * 0.65);
        finalColor += mix(hotPink, cyan, 0.5) * (fresnel * 0.85);

        gl_FragColor = vec4(finalColor, 0.96);
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
    });

    // Sculptural Folded Ribbon Geometry
    // 2, 3 TorusKnot geometry gives that flowing, interlocking folded ribbon look
    const knotGeometry = new THREE.TorusKnotGeometry(1.65, 0.46, 220, 48, 2, 3);
    knotMesh = new THREE.Mesh(knotGeometry, shaderMaterial);
    scene.add(knotMesh);

    // Subtle fine wireframe contour lines layered over geometry for architectural depth
    const wireGeo = new THREE.WireframeGeometry(knotGeometry);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
    });
    wireMesh = new THREE.LineSegments(wireGeo, wireMat);
    knotMesh.add(wireMesh);

    // Mouse interactive tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.2;
      targetRotX = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle touch move for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width - 0.5;
        const y = (touch.clientY - rect.top) / rect.height - 0.5;
        targetRotY = x * 0.8;
        targetRotX = y * 0.6;
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Handle window resize
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

      const elapsedTime = clock.getElapsedTime();
      shaderMaterial.uniforms.uTime.value = elapsedTime;

      // Smooth lerp toward mouse target
      currentRotX += (targetRotX - currentRotX) * 0.04;
      currentRotY += (targetRotY - currentRotY) * 0.04;

      // Base idle fluid rotation
      knotMesh.rotation.x = currentRotX + Math.sin(elapsedTime * 0.3) * 0.15 + 0.3;
      knotMesh.rotation.y += 0.005;
      knotMesh.rotation.z = Math.cos(elapsedTime * 0.4) * 0.08;

      // Gentle floating levitation
      knotMesh.position.y = Math.sin(elapsedTime * 0.8) * 0.12;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      knotGeometry.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-72 h-72 rounded-full bg-gradient-to-tr from-violet-600 via-pink-500 to-amber-400 blur-2xl opacity-60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] lg:h-[540px] flex items-center justify-center select-none pointer-events-auto">
      {/* Soft studio ambient light behind the sculpture */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-violet-400/25 via-pink-400/20 to-cyan-300/20 blur-3xl" />
      </div>

      {/* Three.js canvas container */}
      <div ref={containerRef} className="relative w-full h-full z-10 cursor-grab active:cursor-grabbing" />

      {/* Tactile interaction pill hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="text-[11px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-500 shadow-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
          <span>Interactive 3D Form • Drag to rotate</span>
        </span>
      </div>
    </div>
  );
}
