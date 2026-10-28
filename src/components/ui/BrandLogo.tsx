import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  wordmarkColor?: 'dark' | 'light';
  title?: string;
}

export function BrandLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkColor = 'dark',
  title = 'Kollabrix',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const resolvedTitle = (!title || title.trim() === 'Linkora') ? 'Kollabrix' : title.replace(/Linkora/g, 'Kollabrix');

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Official 3D Isometric Kollabrix Brix Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-all duration-200 shrink-0 flex items-center justify-center border border-amber-500/30 bg-stone-900`}
      >
        <img
          src="/brand/kollabrix-k.png?v=20261028"
          alt="Kollabrix Emblem"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typography Wordmark with High-Contrast Dual-Tone Styling */}
      {showWordmark && (
        <span
          className={`font-black ${textSizes[size]} tracking-tight flex items-center ${
            wordmarkColor === 'dark' ? 'text-slate-900 dark:text-white' : 'text-white'
          }`}
        >
          {resolvedTitle === 'Kollabrix' ? (
            <span className="flex items-center tracking-tight font-black select-none">
              {/* KOLLA in brand amber-orange */}
              <span className="text-amber-500 font-black">KOLLA</span>
              {/* The 'B' letter split 50/50: left half orange (joining KOLLA -> KOLLAB) and right half cyan (joining RIX -> BRIX) */}
              <span
                className="font-black inline-block"
                style={{
                  background: 'linear-gradient(to right, #f59e0b 50%, #22d3ee 50%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                B
              </span>
              {/* RIX in brand electric cyan */}
              <span className="text-cyan-400 font-black">RIX</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block ml-1 animate-pulse" />
            </span>
          ) : (
            <>
              <span>{resolvedTitle}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-0.5 animate-pulse" />
            </>
          )}
        </span>
      )}
    </div>
  );
}
