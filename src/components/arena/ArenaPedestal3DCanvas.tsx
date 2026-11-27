'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Interactive Three.js WebGL 3D Hologram & Pedestal Stage:
 * Renders orbiting 3D wireframe octahedrons, tilted cyan/gold energy rings,
 * and floating particles in true perspective 3D space around the hero character.
 */
export function ArenaPedestal3DCanvas({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let rafId = 0;

    try {
      const width = container.clientWidth || 620;
      const height = container.clientHeight || 540;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 1.15, 6.4);
      camera.lookAt(0, 0.15, 0);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // Floor 3D circuit torus rings under feet
      const outerGeo = new THREE.TorusGeometry(2.35, 0.02, 12, 110);
      const outerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
      const outerRing = new THREE.Mesh(outerGeo, outerMat);
      outerRing.rotation.x = Math.PI / 2;
      outerRing.position.y = -1.48;
      scene.add(outerRing);

      const innerGeo = new THREE.TorusGeometry(1.78, 0.016, 12, 96);
      const innerMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.55 });
      const innerRing = new THREE.Mesh(innerGeo, innerMat);
      innerRing.rotation.x = Math.PI / 2;
      innerRing.position.y = -1.45;
      scene.add(innerRing);

      // Twin 3D tilted holographic orbital rings framing the duelist
      const halo1Geo = new THREE.TorusGeometry(2.05, 0.009, 8, 84);
      const halo1Mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const halo1 = new THREE.Mesh(halo1Geo, halo1Mat);
      halo1.position.set(0, 0.15, -0.35);
      halo1.rotation.set(1.18, 0.32, 0);
      scene.add(halo1);

      const halo2Geo = new THREE.TorusGeometry(1.68, 0.008, 8, 72);
      const halo2Mat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const halo2 = new THREE.Mesh(halo2Geo, halo2Mat);
      halo2.position.set(0, 0.22, -0.2);
      halo2.rotation.set(1.32, -0.36, 0);
      scene.add(halo2);

      // Left & Right orbiting 3D Wireframe Code Crystals (Octahedron)
      const crystalGeo = new THREE.OctahedronGeometry(0.18, 0);
      const crystalCyanMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      });
      const crystalGoldMat = new THREE.MeshBasicMaterial({
        color: 0xfcd34d,
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      });
      const leftCrystal = new THREE.Mesh(crystalGeo, crystalCyanMat);
      const rightCrystal = new THREE.Mesh(crystalGeo, crystalGoldMat);
      scene.add(leftCrystal);
      scene.add(rightCrystal);

      // Rising code dust embers
      const count = 90;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.9 + Math.random() * 2.1;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = -1.5 + Math.random() * 3.4;
        positions[i * 3 + 2] = Math.sin(angle) * radius * 0.6;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0xfde68a,
        size: 0.036,
        transparent: true,
        opacity: 0.6,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 620;
        const h = container.clientHeight || 540;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        outerRing.rotation.z = t * 0.22;
        innerRing.rotation.z = -t * 0.34;
        halo1.rotation.z = t * 0.2;
        halo2.rotation.z = -t * 0.26;

        leftCrystal.position.set(
          Math.cos(t * 0.85) * 1.95,
          0.35 + Math.sin(t * 1.4) * 0.16,
          Math.sin(t * 0.85) * 0.75
        );
        leftCrystal.rotation.x = t * 0.9;
        leftCrystal.rotation.y = t * 1.2;

        rightCrystal.position.set(
          Math.cos(t * 0.85 + Math.PI) * 1.95,
          0.1 + Math.cos(t * 1.3) * 0.16,
          Math.sin(t * 0.85 + Math.PI) * 0.75
        );
        rightCrystal.rotation.x = -t * 0.8;
        rightCrystal.rotation.y = -t * 1.1;

        const attr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
        for (let i = 0; i < count; i++) {
          let y = attr.getY(i) + 0.004;
          if (y > 1.9) y = -1.5;
          attr.setY(i, y);
        }
        attr.needsUpdate = true;

        renderer?.render(scene, camera);
        rafId = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', handleResize);
        outerGeo.dispose();
        outerMat.dispose();
        innerGeo.dispose();
        innerMat.dispose();
        halo1Geo.dispose();
        halo1Mat.dispose();
        halo2Geo.dispose();
        halo2Mat.dispose();
        crystalGeo.dispose();
        crystalCyanMat.dispose();
        crystalGoldMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      return () => {};
    }
  }, []);

  return <div ref={containerRef} className={`pointer-events-none ${className}`} />;
}
