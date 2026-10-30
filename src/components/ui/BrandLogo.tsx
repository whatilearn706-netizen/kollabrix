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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm tracking-[0.14em]',
    md: 'text-base tracking-[0.16em]',
    lg: 'text-xl tracking-[0.18em]',
  };

  // Check if title is Kollabrix or default
  const cleanTitle = (title || '').trim().toLowerCase();
  const isKollabrixBrand = !cleanTitle || cleanTitle === 'kollabrix' || cleanTitle === 'linkora';

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Official Standalone 3D Interlocking Molten Amber Model (Transparent Cutout, No Box Background) */}
      <div
        className={`${iconSizes[size]} relative shrink-0 flex items-center justify-center group-hover:scale-108 transition-all duration-300 select-none`}
      >
        {/* Subtle Ambient Radial Backlight Glow to Highlight the 3D Silhouette */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/25 via-orange-500/20 to-transparent blur-md pointer-events-none group-hover:from-amber-500/40 group-hover:via-orange-500/30 transition-all duration-300 scale-125" />

        <img
          src="/brand/kollabrix-k.png?v=20261030j"
          alt="Kollabrix 3D Model"
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_2px_14px_rgba(245,158,11,0.65)] drop-shadow-[0_0_20px_rgba(251,191,36,0.25)] transition-all duration-300"
        />
      </div>

      {/* Official High-Tech Metallic Wordmark: KOLLΛBRIX™ */}
      {showWordmark && (
        <span
          className={`font-black uppercase flex items-center select-none font-sans ${textSizes[size]} ${
            wordmarkColor === 'dark' ? 'text-slate-900 dark:text-white' : 'text-white'
          }`}
        >
          {isKollabrixBrand ? (
            <span className="flex items-center tracking-[0.15em] font-extrabold select-none uppercase">
              <span className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                KOLL<span className="inline-block scale-y-[0.98] mx-[0.5px]">Λ</span>BRIX
              </span>
              <span className="text-[0.45em] font-bold text-slate-400 self-start relative -top-0.5 ml-1 select-none">
                ™
              </span>
            </span>
          ) : (
            <span className="tracking-wider">{title}</span>
          )}
        </span>
      )}
    </div>
  );
}
