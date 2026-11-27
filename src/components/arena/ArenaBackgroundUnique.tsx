'use client';

import React from 'react';

const FLOATING_GLYPHS = [
  { text: 'O(log n)', top: '16%', left: '24%', delay: '0s' },
  { text: '{ compile }', top: '20%', right: '24%', delay: '1.1s' },
  { text: '0x7F::KBX', top: '64%', left: '26%', delay: '2.0s' },
  { text: '=> victory', top: '62%', right: '25%', delay: '0.8s' },
];

/**
 * Atmospheric Studio Horizon matching the warm slate-to-amber depth of pin.it/4xwFMioa5
 * fused with Kollabrix's dark obsidian esports stage and receding circuit floor.
 */
export function ArenaBackgroundUnique() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#07090F]">
      {/* Misty Slate-Blue top fading into Warm Golden-Amber Horizon Clouds */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 58% at 50% 62%, rgba(212, 148, 58, 0.24) 0%, rgba(56, 78, 98, 0.28) 38%, rgba(7, 9, 15, 0.96) 78%, #04050A 100%)',
        }}
      />

      {/* Center Overhead Volumetric Spotlight Cone */}
      <div
        className="absolute left-1/2 top-[-10%] -translate-x-1/2 w-[540px] h-[75vh] opacity-35 blur-3xl"
        style={{
          background:
            'conic-gradient(from 165deg at 50% 0%, transparent 0deg, rgba(103, 232, 249, 0.25) 18deg, rgba(251, 191, 36, 0.16) 34deg, transparent 52deg)',
        }}
      />

      {/* Receding 3D Perspective Studio Floor Grid */}
      <div
        className="absolute inset-x-[-25%] bottom-[-10%] h-[44%] opacity-35"
        style={{
          transform: 'perspective(580px) rotateX(68deg)',
          backgroundImage:
            'linear-gradient(to right, rgba(103,232,249,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(251,191,36,0.18) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse 75% 85% at 50% 60%, black 15%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 85% at 50% 60%, black 15%, transparent 90%)',
        }}
      />

      {/* Soft horizon mist band */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#04050A] via-[#04050A]/65 to-transparent" />

      {FLOATING_GLYPHS.map((g) => (
        <span
          key={g.text}
          style={{ top: g.top, left: g.left, right: g.right, animationDelay: g.delay }}
          className="hidden xl:block absolute font-mono text-[10px] tracking-[0.22em] text-amber-200/25 select-none animate-pulse"
        >
          {g.text}
        </span>
      ))}
    </div>
  );
}
