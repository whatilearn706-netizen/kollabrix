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
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-xl',
  };

  const textSizes = {
    sm: 'text-sm tracking-[0.14em]',
    md: 'text-base tracking-[0.16em]',
    lg: 'text-xl tracking-[0.18em]',
  };

  const resolvedTitle = (!title || title.trim() === 'Linkora') ? 'Kollabrix' : title.replace(/Linkora/g, 'Kollabrix');

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Official 3D Interlocking Molten Amber Kollabrix Emblem */}
      <div
        className={`${iconSizes[size]} relative overflow-hidden shadow-md group-hover:scale-105 transition-all duration-200 shrink-0 flex items-center justify-center border border-amber-500/40 bg-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]`}
      >
        <img
          src="/brand/kollabrix-k.png?v=20261030e"
          alt="Kollabrix"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Official High-Tech Metallic Wordmark: KOLLΛBRIX™ */}
      {showWordmark && (
        <span
          className={`font-black uppercase flex items-center select-none font-sans ${textSizes[size]} ${
            wordmarkColor === 'dark' ? 'text-slate-900 dark:text-white' : 'text-white'
          }`}
        >
          {resolvedTitle === 'Kollabrix' ? (
            <span className="flex items-center tracking-[0.15em] font-extrabold select-none uppercase">
              <span className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                KOLL<span className="inline-block scale-y-[0.98] mx-[0.5px]">Λ</span>BRIX
              </span>
              <span className="text-[0.45em] font-bold text-slate-400 self-start relative -top-0.5 ml-1 select-none">
                ™
              </span>
            </span>
          ) : (
            <span className="tracking-wider">{resolvedTitle}</span>
          )}
        </span>
      )}
    </div>
  );
}
