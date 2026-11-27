'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CodingBook } from '@/data/kaCodexBooks';

interface KaCodexWebGLHeroProps {
  books: CodingBook[];
  activeIndex: number;
  paused?: boolean;
  onFocusIndexChange?: (idx: number) => void;
  onSelectBook: (book: CodingBook) => void;
}

const SPREAD_CODE_PLATES = [
  { left: 'const compose =\n  (...fns) =>\n  (x) => fns.reduceRight(\n    (v, f) => f(v), x\n  );', right: 'O(n log n)\n128\n99.9%' },
  { left: 'function twoSum(a, t) {\n  const m = new Map();\n  for (let i = 0; i < a.length; i++) {\n    if (m.has(t - a[i])) return [m.get(t - a[i]), i];\n    m.set(a[i], i);\n  }\n}', right: 'HASH\nO(N)\nMAP' },
  { left: 'WAL -> MemTable\n  -> Immutable SSTable\n  -> Bloom Filter O(1)\n  -> Level Compaction', right: 'LSM\np99\n< 4ms' },
  { left: 'type Result<T> =\n  | { ok: true; val: T }\n  | { ok: false; err: Error };', right: 'SOLID\nCLEAN\nARCH' },
  { left: 'while (lo < hi) {\n  const mid = (lo + hi) >>> 1;\n  if (arr[mid] < target) lo = mid + 1;\n  else hi = mid;\n}', right: 'LOG N\nBIN\nSRCH' },
  { left: 'RaftConsensus:\n  term++\n  requestVote()\n  appendEntries(quorum)', right: 'N/2+1\nRAFT\nSAFE' },
];

function createFallbackBookTexture(book: CodingBook): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, book.spineColor);
  grad.addColorStop(1, '#12100E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // Subtle jacket frame
  ctx.strokeStyle = 'rgba(244, 243, 239, 0.28)';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, 456, 712);

  // Spine stripe & category tag
  ctx.fillStyle = book.accentHex;
  ctx.fillRect(28, 28, 456, 12);

  ctx.fillStyle = 'rgba(244, 243, 239, 0.68)';
  ctx.font = '600 22px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(`VOL. ${String(book.index).padStart(2, '0')} // ${book.category.toUpperCase()}`, 54, 96);

  // Wrapped title
  ctx.fillStyle = '#F4F3EF';
  ctx.font = '700 44px -apple-system, BlinkMacSystemFont, sans-serif';
  const words = book.title.split(' ');
  let line = '';
  let y = 210;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > 395) {
      ctx.fillText(line, 54, y);
      line = w;
      y += 56;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, 54, y);

  ctx.fillStyle = 'rgba(244, 243, 239, 0.72)';
  ctx.font = '500 24px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(book.author, 54, 668);

  ctx.fillStyle = 'rgba(244, 243, 239, 0.4)';
  ctx.font = '500 18px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText(`ISBN ${book.isbn}`, 54, 706);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createDarkSpreadTexture(plate: { left: string; right: string }): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark editorial charcoal two-page spread matching dark theme only
  ctx.fillStyle = '#1B1917';
  ctx.fillRect(0, 0, 768, 512);

  // Subtle horizontal notebook lines
  ctx.strokeStyle = 'rgba(244, 243, 239, 0.045)';
  ctx.lineWidth = 1;
  for (let y = 40; y < 500; y += 26) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(744, y);
    ctx.stroke();
  }

  // Spine crease shadow down middle
  const spineGrad = ctx.createLinearGradient(348, 0, 420, 0);
  spineGrad.addColorStop(0, 'rgba(0,0,0,0)');
  spineGrad.addColorStop(0.48, 'rgba(0,0,0,0.65)');
  spineGrad.addColorStop(0.52, 'rgba(255,255,255,0.06)');
  spineGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(348, 0, 72, 512);

  // Left page monospace code lines
  ctx.fillStyle = 'rgba(232, 228, 218, 0.86)';
  ctx.font = '500 22px ui-monospace, SFMono-Regular, Menlo, monospace';
  const codeLines = plate.left.split('\n');
  codeLines.forEach((ln, i) => {
    ctx.fillText(ln, 44, 118 + i * 36);
  });

  // Left page micro caption
  ctx.fillStyle = 'rgba(168, 161, 150, 0.5)';
  ctx.font = '500 14px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText('KΛ FOLIO // SPREAD', 44, 466);

  // Right page oversized typographic specimen glyphs (matching pin.it/5AwPsERe4 video frame)
  ctx.fillStyle = 'rgba(244, 243, 239, 0.9)';
  ctx.font = '700 72px -apple-system, BlinkMacSystemFont, sans-serif';
  const bigLines = plate.right.split('\n');
  bigLines.forEach((ln, i) => {
    ctx.fillText(ln, 424, 175 + i * 86);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Creates a genuinely bent/curved double-page geometry dipping into the spine crease.
 */
function createCurvedSpreadGeometry(width = 3.2, height = 2.15): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, 28, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const nx = x / (width / 2); // -1 to 1 across spine
    // Classic open book gull-wing arch: dips into spine at x=0, bows gently outward, curls at edges
    const archZ =
      Math.sin(Math.abs(nx) * Math.PI) * 0.28 -
      Math.exp(-Math.abs(nx) * 6) * 0.14 +
      Math.sin(y * 0.7) * 0.04;
    pos.setZ(i, archZ);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a physical 3D coding book mesh (front jacket cover + back cover + spine + ivory page block).
 */
function createBookMeshGroup(book: CodingBook, frontMat: THREE.MeshStandardMaterial) {
  const group = new THREE.Group();
  const w = 1.68;
  const h = 2.42;
  const d = 0.22;

  const spineMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(book.spineColor),
    roughness: 0.55,
    metalness: 0.12,
  });
  const pagesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D8D2C5'),
    roughness: 0.85,
    metalness: 0.02,
  });
  const backMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#191715'),
    roughness: 0.7,
    metalness: 0.08,
  });

  // Box face order: +x (right page edge), -x (spine), +y (top pages), -y (bottom pages), +z (front cover), -z (back cover)
  const bookGeo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(bookGeo, [
    pagesMat,
    spineMat,
    pagesMat,
    pagesMat,
    frontMat,
    backMat,
  ]);
  group.add(mesh);

  return { group, bookGeo, materials: [spineMat, pagesMat, backMat, frontMat] };
}

/**
 * True Three.js WebGL Hero inspired by pin.it/5AwPsERe4 ("Books in Flight"):
 * Renders all 12 real coding books (using same-origin cached covers) and curved dark
 * two-page code spreads tumbling smoothly in 3D space inside our dark studio atmosphere.
 */
export function KaCodexWebGLHero({
  books,
  activeIndex,
  paused = false,
  onSelectBook,
}: KaCodexWebGLHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const pausedRef = useRef(paused);
  const onSelectRef = useRef(onSelectBook);

  activeIndexRef.current = activeIndex;
  pausedRef.current = paused;
  onSelectRef.current = onSelectBook;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121110);
    scene.fog = new THREE.FogExp2(0x121110, 0.048);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 0, 10.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'default',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // Warm studio directional light from top-left (matching pin.it/5AwPsERe4 light beam)
    const ambient = new THREE.AmbientLight(0xebe6dc, 0.68);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff6e8, 2.1);
    keyLight.position.set(-7, 9, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x88a4d8, 0.85);
    rimLight.position.set(8, -5, -4);
    scene.add(rimLight);

    const texLoader = new THREE.TextureLoader();
    const disposables: Array<{ dispose: () => void }> = [];

    // Diagonal cloud coordinates across depth for the 12 coding books
    const baseAnchors = [
      new THREE.Vector3(-2.4, 0.25, 3.2),
      new THREE.Vector3(2.8, 1.15, 0.6),
      new THREE.Vector3(-4.2, -1.35, -1.2),
      new THREE.Vector3(4.3, -0.65, -2.6),
      new THREE.Vector3(0.4, 2.35, -3.8),
      new THREE.Vector3(-4.8, 1.85, -4.8),
      new THREE.Vector3(1.6, -2.0, -5.8),
      new THREE.Vector3(-1.3, -2.55, -7.2),
      new THREE.Vector3(5.6, 1.9, -8.2),
      new THREE.Vector3(-5.8, -0.35, -9.2),
      new THREE.Vector3(0.2, 0.35, -10.4),
      new THREE.Vector3(3.1, -2.35, -11.4),
    ];

    const bookNodes = books.map((book, idx) => {
      const fallbackTex = createFallbackBookTexture(book);
      disposables.push(fallbackTex);

      const frontMat = new THREE.MeshStandardMaterial({
        map: fallbackTex,
        roughness: 0.42,
        metalness: 0.08,
      });

      // Async swap to genuine published jacket cover via same-origin cached route
      texLoader.load(
        book.coverUrl,
        (realTex) => {
          realTex.colorSpace = THREE.SRGBColorSpace;
          realTex.anisotropy = 4;
          disposables.push(realTex);
          frontMat.map = realTex;
          frontMat.needsUpdate = true;
        },
        undefined,
        () => {}
      );

      const { group, bookGeo, materials } = createBookMeshGroup(book, frontMat);
      disposables.push(bookGeo, ...materials);

      group.userData = { book, index: idx };
      scene.add(group);

      return {
        book,
        index: idx,
        group,
        phase: idx * 0.85,
        rotBias: new THREE.Euler(
          ((idx % 3) - 1) * 0.24,
          (idx % 2 === 0 ? -1 : 1) * (0.35 + (idx % 4) * 0.12),
          ((idx % 5) - 2) * 0.12
        ),
      };
    });

    // Floating curved dark editorial code spreads (8 curved pages tumbling gently in depth)
    const curvedGeo = createCurvedSpreadGeometry(2.35, 1.55);
    disposables.push(curvedGeo);

    const spreadNodes = Array.from({ length: 8 }).map((_, i) => {
      const plate = SPREAD_CODE_PLATES[i % SPREAD_CODE_PLATES.length];
      const tex = createDarkSpreadTexture(plate);
      disposables.push(tex);

      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        side: THREE.DoubleSide,
        roughness: 0.72,
        metalness: 0.04,
      });
      disposables.push(mat);

      const mesh = new THREE.Mesh(curvedGeo, mat);
      const scale = 0.55 + (i % 3) * 0.18;
      mesh.scale.setScalar(scale);

      const basePos = new THREE.Vector3(
        ((i % 2 === 0 ? -1 : 1) * (1.8 + (i % 4) * 1.45)),
        (((i % 3) - 1) * 1.75),
        1.2 - i * 1.65
      );
      mesh.position.copy(basePos);
      scene.add(mesh);

      return { mesh, basePos, phase: i * 1.15 };
    });

    // Mouse parallax & interactive raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(99, 99);
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };
    let hoveredBookIdx = -1;

    const findBookFromHit = (obj: THREE.Object3D | null): number => {
      let cur = obj;
      while (cur) {
        if (typeof cur.userData?.index === 'number') return cur.userData.index;
        cur = cur.parent;
      }
      return -1;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointer.set(nx, ny);
      targetMouse.x = nx;
      targetMouse.y = ny;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        bookNodes.map((n) => n.group),
        true
      );
      hoveredBookIdx = hits.length > 0 ? findBookFromHit(hits[0].object) : -1;
      renderer.domElement.style.cursor = hoveredBookIdx >= 0 ? 'pointer' : 'default';
    };

    const onClick = (e: MouseEvent) => {
      if (pausedRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      const hits = raycaster.intersectObjects(
        bookNodes.map((n) => n.group),
        true
      );
      if (hits.length > 0) {
        const hitIdx = findBookFromHit(hits[0].object);
        if (hitIdx >= 0 && bookNodes[hitIdx]) {
          onSelectRef.current(bookNodes[hitIdx].book);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Smooth continuous flight animation loop
    let rafId = 0;
    let time = 0;
    let lastTs = performance.now();
    const total = books.length;
    const smoothPositions = bookNodes.map((_, i) => baseAnchors[i % baseAnchors.length].clone());

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      if (document.hidden || pausedRef.current) {
        lastTs = now;
        return;
      }

      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      time += dt;

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;

      // Subtle camera parallax matching Halden Press depth drift
      camera.position.x = currentMouse.x * 0.75;
      camera.position.y = currentMouse.y * 0.45;
      camera.lookAt(0, 0, -2.5);

      const focusedIdx = activeIndexRef.current;

      for (let i = 0; i < bookNodes.length; i++) {
        const node = bookNodes[i];
        const relSlot = (i - focusedIdx + total) % total;
        const anchor = baseAnchors[relSlot % baseAnchors.length];

        // Smooth interpolation when user focuses another volume
        smoothPositions[i].lerp(anchor, 0.065);

        const isHovered = hoveredBookIdx === i;
        const isPrimary = relSlot === 0;

        // Continuous organic 3D flight wave across every book
        const floatX = Math.sin(time * 0.55 + node.phase) * 0.28;
        const floatY = Math.cos(time * 0.7 + node.phase * 1.2) * 0.24;
        const floatZ = Math.sin(time * 0.45 + node.phase) * 0.35 + (isHovered ? 0.85 : 0);

        node.group.position.set(
          smoothPositions[i].x + floatX,
          smoothPositions[i].y + floatY,
          smoothPositions[i].z + floatZ
        );

        node.group.rotation.set(
          node.rotBias.x + Math.sin(time * 0.42 + node.phase) * 0.16,
          node.rotBias.y + Math.cos(time * 0.36 + node.phase) * 0.24 + (isPrimary ? currentMouse.x * 0.15 : 0),
          node.rotBias.z + Math.sin(time * 0.3 + node.phase) * 0.1
        );

        const targetScale = isHovered ? 1.18 : isPrimary ? 1.08 : 0.92;
        node.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      }

      for (let i = 0; i < spreadNodes.length; i++) {
        const sp = spreadNodes[i];
        sp.mesh.position.set(
          sp.basePos.x + Math.sin(time * 0.48 + sp.phase) * 0.36,
          sp.basePos.y + Math.cos(time * 0.58 + sp.phase) * 0.28,
          sp.basePos.z + Math.sin(time * 0.35 + sp.phase) * 0.45
        );
        sp.mesh.rotation.set(
          0.35 + Math.sin(time * 0.38 + sp.phase) * 0.25,
          -0.25 + Math.cos(time * 0.32 + sp.phase) * 0.35,
          Math.sin(time * 0.28 + sp.phase) * 0.22
        );
      }

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [books]);

  return (
    <div
      ref={containerRef}
      aria-label="Interactive 3D coding books hero canvas"
      className="absolute inset-0 w-full h-full"
    />
  );
}
