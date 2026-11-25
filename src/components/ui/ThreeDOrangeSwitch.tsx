'use client';

import React from 'react';
import { Clock } from 'lucide-react';

interface ThreeDOrangeSwitchProps {
  isPast: boolean;
  onToggle: (val: boolean) => void;
  liveCount?: number;
  pastCount?: number;
}

/**
 * Obsidian & Brushed Titanium segmented timeline switch for /hackathons
 * showing clear "Live & New" vs "Past" states with event counts.
 */
export function ThreeDOrangeSwitch({
  isPast,
  onToggle,
  liveCount,
  pastCount,
}: ThreeDOrangeSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Filter hackathons by timeline"
      className="inline-flex items-center p-1 rounded-full bg-[#04060A] border border-white/15 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] select-none"
    >
      <button
        type="button"
        aria-pressed={!isPast}
        onClick={() => onToggle(false)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
          !isPast
            ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-950 border border-white/70 shadow-[0_2px_12px_rgba(255,255,255,0.22)]'
            : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            !isPast ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-400/70'
          }`}
        />
        <span>
          Live &amp; New
          {typeof liveCount === 'number' ? ` (${liveCount})` : ''}
        </span>
      </button>

      <button
        type="button"
        aria-pressed={isPast}
        onClick={() => onToggle(true)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
          isPast
            ? 'bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-950 border border-white/70 shadow-[0_2px_12px_rgba(255,255,255,0.22)]'
            : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
        }`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>
          Past
          {typeof pastCount === 'number' ? ` (${pastCount})` : ''}
        </span>
      </button>
    </div>
  );
}
