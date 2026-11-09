'use client';

import React from 'react';

interface ThreeDOrangeSwitchProps {
  isPast: boolean;
  onToggle: (val: boolean) => void;
  liveCount?: number;
  pastCount?: number;
}

export function ThreeDOrangeSwitch({
  isPast,
  onToggle,
}: ThreeDOrangeSwitchProps) {
  return (
    <div className="flex items-center select-none">
      {/* 3D Dark Orange Recessed Track */}
      <button
        type="button"
        role="switch"
        aria-checked={isPast}
        onClick={() => onToggle(!isPast)}
        className="relative w-[68px] h-[30px] rounded-full p-[2.5px] bg-gradient-to-b from-[#0a0a0d] via-[#121217] to-[#1c1c24] border border-white/15 dark:border-white/10 shadow-[inset_0_3px_6px_rgba(0,0,0,0.95),_inset_0_1px_2px_rgba(0,0,0,0.85),_0_2px_4px_rgba(0,0,0,0.15)] cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 group overflow-hidden shrink-0"
        title={isPast ? 'Past Events (Click for Live & Upcoming)' : 'Live & Upcoming (Click for Past Events)'}
      >
        {/* Internal Amber / Orange Ambient Glow inside the track */}
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none"
          style={{
            background: isPast
              ? 'radial-gradient(ellipse at 75% 50%, #ff6a00 0%, #ea580c 45%, rgba(234,88,12,0.2) 70%, transparent 95%)'
              : 'radial-gradient(ellipse at 25% 50%, #ff6a00 0%, #ea580c 45%, rgba(234,88,12,0.2) 70%, transparent 95%)',
          }}
        />

        {/* Ambient Bloom following the thumb */}
        <div
          className="absolute inset-y-0 w-8 rounded-full blur-[3px] transition-all duration-300 pointer-events-none"
          style={{
            left: isPast ? '32px' : '2px',
            background: 'rgba(255, 106, 0, 0.55)',
          }}
        />

        {/* 3D Sliding Thumb / Capsule Pill */}
        <div
          className={`relative z-10 w-[32px] h-[25px] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center border-t border-white/70 ${
            isPast ? 'translate-x-[31px]' : 'translate-x-0'
          }`}
          style={{
            background: 'linear-gradient(180deg, #e4e4ea 0%, #a8a8b2 42%, #686874 100%)',
            boxShadow: isPast
              ? '-3px 2px 7px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)'
              : '3px 2px 7px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.6)',
          }}
        >
          {/* Subtle Specular Glint on Top Right of Thumb */}
          <div className="absolute top-[2px] right-[4px] w-2 h-1 rounded-full bg-white/80 blur-[0.3px] pointer-events-none" />

          {/* Concave Circular Center Dish / Dimple */}
          <div
            className="w-3 h-3 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 65%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.6) 100%)',
              boxShadow: 'inset 0 1.5px 2px rgba(0,0,0,0.7), inset 0 -0.8px 1px rgba(255,255,255,0.5)',
            }}
          />
        </div>
      </button>
    </div>
  );
}