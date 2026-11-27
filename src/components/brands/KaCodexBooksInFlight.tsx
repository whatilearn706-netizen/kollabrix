'use client';

import React, { useEffect, useState } from 'react';
import type { CodingBook } from '@/data/kaCodexBooks';
import { KaMonographCover } from '@/components/brands/KaMonographCover';

interface KaCodexBooksInFlightProps {
  books: CodingBook[];
  activeIndex: number;
  mouseOffset: { x: number; y: number };
  onSelectBook: (book: CodingBook) => void;
}

/**
 * 12 spatial flight tracks across X, Y, Z, and tilt angles matching pin.it/5nyY3SrGG.
 * Each book continuously orbits & breathes smoothly inside the hero without requiring scroll.
 */
const SLOT_OFFSETS = [
  { x: -15, y: -5, z: 20, rotY: -24, rotX: 11, rotZ: -10, phase: 0.0 },
  { x: 18, y: -14, z: -150, rotY: 22, rotX: -8, rotZ: 13, phase: 0.9 },
  { x: -24, y: 12, z: -290, rotY: -18, rotX: 16, rotZ: 9, phase: 1.7 },
  { x: 25, y: 8, z: -430, rotY: 30, rotX: -12, rotZ: -15, phase: 2.5 },
  { x: 3, y: -21, z: -560, rotY: -12, rotX: 18, rotZ: 6, phase: 3.3 },
  { x: -27, y: -17, z: -690, rotY: 24, rotX: 10, rotZ: -18, phase: 4.1 },
  { x: 23, y: -3, z: -820, rotY: -26, rotX: -11, rotZ: 12, phase: 4.9 },
  { x: -7, y: 17, z: -950, rotY: 16, rotX: 13, rotZ: -8, phase: 5.7 },
  { x: 29, y: 15, z: -1080, rotY: -22, rotX: -16, rotZ: 16, phase: 0.4 },
  { x: -17, y: -23, z: -1200, rotY: 19, rotX: 11, rotZ: -13, phase: 1.3 },
  { x: 11, y: -9, z: -1320, rotY: -14, rotX: -6, rotZ: 9, phase: 2.2 },
  { x: -29, y: 4, z: -1440, rotY: 25, rotX: 15, rotZ: -11, phase: 3.0 },
];

const LOOSE_SPREADS = [
  { left: '34%', top: '25%', rot: -24, label: 'p99 < 12ms', scale: 0.92, blur: 0.5, phase: 0.5 },
  { left: '62%', top: '34%', rot: 18, label: 'O(n log n)', scale: 0.78, blur: 1.2, phase: 1.8 },
  { left: '53%', top: '63%', rot: -14, label: 'SOLID', scale: 0.7, blur: 2.0, phase: 2.9 },
  { left: '24%', top: '57%', rot: 22, label: 'eval/apply', scale: 0.76, blur: 1.4, phase: 4.0 },
  { left: '74%', top: '52%', rot: -28, label: 'Raft Log', scale: 0.85, blur: 0.9, phase: 5.1 },
  { left: '45%', top: '19%', rot: 14, label: 'LSM-Tree', scale: 0.66, blur: 2.1, phase: 3.4 },
];

function FloatingBookCard({
  book,
  relSlot,
  isFocused,
  floatTime,
  mouseOffset,
  onSelect,
}: {
  book: CodingBook;
  relSlot: number;
  isFocused: boolean;
  floatTime: number;
  mouseOffset: { x: number; y: number };
  onSelect: () => void;
}) {
  const slot = SLOT_OFFSETS[relSlot % SLOT_OFFSETS.length];
  const depthFactor = Math.max(0.28, 1 - relSlot * 0.075);
  const blurPx = isFocused ? 0 : Math.min(3.8, Math.max(0.3, (relSlot - 1) * 0.45));
  const opacity = isFocused ? 1 : Math.max(0.26, 0.92 - relSlot * 0.068);

  // Continuous ambient 3D orbital drift inside the hero
  const driftX = Math.sin(floatTime * 0.65 + slot.phase) * (isFocused ? 8 : 16 * depthFactor);
  const driftY = Math.cos(floatTime * 0.8 + slot.phase * 1.3) * (isFocused ? 10 : 14 * depthFactor);
  const driftZ = Math.sin(floatTime * 0.5 + slot.phase) * 28;
  const driftRotY = Math.sin(floatTime * 0.55 + slot.phase) * 7;
  const driftRotX = Math.cos(floatTime * 0.45 + slot.phase) * 4;

  const pxOffset = mouseOffset.x * (22 * depthFactor) + driftX;
  const pyOffset = mouseOffset.y * (16 * depthFactor) + driftY;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Open ${book.title} by ${book.author}`}
      style={{
        left: `calc(50% + ${slot.x}%)`,
        top: `calc(47% + ${slot.y}%)`,
        opacity,
        zIndex: 50 - relSlot,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
        transform: `translate3d(calc(-50% + ${pxOffset}px), calc(-50% + ${pyOffset}px), ${
          slot.z + driftZ
        }px) scale(${isFocused ? 1.08 : depthFactor * 0.92}) rotateY(${
          slot.rotY + driftRotY + mouseOffset.x * 8
        }deg) rotateX(${slot.rotX + driftRotX - mouseOffset.y * 6}deg) rotateZ(${slot.rotZ}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className="group absolute w-28 sm:w-36 md:w-44 aspect-[2/3] transition-[left,top,opacity,filter] duration-700 ease-out cursor-pointer focus:outline-none"
    >
      {/* Tactile 3D Hardcover Shadow */}
      <div className="absolute -inset-2 rounded-xl bg-black/70 blur-xl opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Left Book Spine */}
      <div
        style={{ backgroundColor: book.spineColor, transform: 'rotateY(-86deg) translateZ(7px)' }}
        className="absolute inset-y-0 left-0 w-3.5 rounded-l-sm shadow-inner"
      />

      {/* Right Crisp Paper Page-Block Edge */}
      <div
        style={{ transform: 'translateX(6px) translateY(3px) translateZ(-6px)' }}
        className="absolute inset-y-1 right-0 w-2.5 rounded-r bg-gradient-to-r from-[#E5E0D5] to-[#BEB7A9] opacity-85"
      />

      {/* Front Cover Jacket */}
      <div
        className={`relative w-full h-full rounded-r-md rounded-l-[2px] overflow-hidden border transition-all duration-300 ${
          isFocused
            ? 'border-[#F4F3EF]/45 shadow-[0_25px_65px_rgba(0,0,0,0.92)] ring-1 ring-white/20'
            : 'border-white/15 group-hover:border-white/50'
        } bg-[#11100E]`}
      >
        <div className="w-full h-full group-hover:scale-[1.03] transition-transform duration-500">
          <KaMonographCover book={book} size="md" />
        </div>

        {/* Hover Tap Indicator */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[#F4F3EF] font-semibold truncate">
            {book.shortTitle}
          </span>
          <span className="font-mono text-[9px] text-amber-200 shrink-0">Open →</span>
        </div>
      </div>
    </button>
  );
}

export function KaCodexBooksInFlight({
  books,
  activeIndex,
  mouseOffset,
  onSelectBook,
}: KaCodexBooksInFlightProps) {
  const [floatTime, setFloatTime] = useState(0);
  const total = books.length;

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!document.hidden) {
        setFloatTime((t) => t + dt);
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      style={{ perspective: '1250px' }}
      className="absolute inset-0 overflow-hidden select-none"
    >
      {/* Curved Loose Paper Spreads drifting gently alongside books */}
      {LOOSE_SPREADS.map((sp, idx) => {
        const sx = Math.sin(floatTime * 0.7 + sp.phase) * 14;
        const sy = Math.cos(floatTime * 0.6 + sp.phase) * 12;
        const srot = sp.rot + Math.sin(floatTime * 0.5 + sp.phase) * 8;

        return (
          <div
            key={sp.label}
            aria-hidden="true"
            style={{
              left: sp.left,
              top: sp.top,
              filter: `blur(${sp.blur}px)`,
              transform: `translate(${mouseOffset.x * (14 + idx * 3) + sx}px, ${
                mouseOffset.y * (10 + idx * 2) + sy
              }px) rotate(${srot}deg) scale(${sp.scale})`,
            }}
            className="pointer-events-none absolute w-14 sm:w-20 h-20 sm:h-24 rounded-sm bg-gradient-to-br from-[#EFECE4]/90 to-[#B9B2A4]/75 shadow-[0_14px_34px_rgba(0,0,0,0.7)] p-2 flex flex-col justify-between opacity-50"
          >
            <div className="space-y-1">
              <div className="h-[2px] w-4/5 bg-black/30" />
              <div className="h-[2px] w-3/5 bg-black/25" />
              <div className="h-[2px] w-2/3 bg-black/20" />
            </div>
            <span className="font-mono text-[7px] font-bold text-black/65 tracking-tight">
              {sp.label}
            </span>
          </div>
        );
      })}

      {/* All 12 Coding Books continuously moving & clickable in 3D hero */}
      {books.map((book, idx) => {
        const relSlot = (idx - activeIndex + total) % total;
        return (
          <FloatingBookCard
            key={book.id}
            book={book}
            relSlot={relSlot}
            isFocused={relSlot === 0}
            floatTime={floatTime}
            mouseOffset={mouseOffset}
            onSelect={() => onSelectBook(book)}
          />
        );
      })}
    </div>
  );
}
