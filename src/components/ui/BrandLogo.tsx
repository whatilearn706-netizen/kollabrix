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
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm tracking-[0.14em]',
    md: 'text-lg tracking-[0.18em]',
    lg: 'text-2xl tracking-[0.2em]',
  };

  // Check if title is Kollabrix or default
  const cleanTitle = (title || '').trim().toLowerCase();
  const isKollabrixBrand = !cleanTitle || cleanTitle === 'kollabrix' || cleanTitle === 'linkora';

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Official Standalone 3D Interlocking Molten Amber Model (Refined Line-by-Line Cutout, Pure Transparency) */}
      <div
        className={`${iconSizes[size]} relative shrink-0 flex items-center justify-center group-hover:scale-108 transition-all duration-300 select-none`}
      >
        {/* Luminous Warm Amber Ambient Core Backlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/25 via-orange-500/20 to-transparent blur-md pointer-events-none group-hover:from-amber-500/40 group-hover:via-orange-500/30 transition-all duration-300 scale-125" />

        {/* Inline Vector SVG Emblem: Zero network dependency, 100% guaranteed rendering in all incognito / private tabs */}
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.6)] drop-shadow-[0_0_24px_rgba(251,191,36,0.3)] transition-all duration-300"
          aria-label="Kollabrix Official Dual Ascent Aerospace Emblem"
        >
          <defs>
            <linearGradient id="bl-core-flame" x1="256" y1="40" x2="256" y2="470" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="12%" stopColor="#FFE066" />
              <stop offset="35%" stopColor="#FF7A00" />
              <stop offset="80%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>

            <linearGradient id="bl-wing-l" x1="100" y1="70" x2="232" y2="430" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3A465C" />
              <stop offset="40%" stopColor="#1E2638" />
              <stop offset="100%" stopColor="#0E121B" />
            </linearGradient>

            <linearGradient id="bl-wing-r" x1="412" y1="70" x2="280" y2="430" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2D374A" />
              <stop offset="40%" stopColor="#161D2B" />
              <stop offset="100%" stopColor="#0A0D14" />
            </linearGradient>

            <radialGradient id="bl-ambient-glow" cx="256" cy="240" r="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#FF5500" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FF4400" stopOpacity="0" />
            </radialGradient>

            <filter id="bl-plasma-bloom" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ambient Radiant Core Glow */}
          <circle cx="256" cy="240" r="160" fill="url(#bl-ambient-glow)" />

          {/* Left Creator Wing (Engineering / Code) */}
          <polygon
            points="230,76 104,386 164,424 230,230"
            fill="url(#bl-wing-l)"
            stroke="#4A5874"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Right Creator Wing (Product / Design) */}
          <polygon
            points="282,76 408,386 348,424 282,230"
            fill="url(#bl-wing-r)"
            stroke="#4A5874"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Supersonic Plasma Thruster Flame (Full Beam) */}
          <polygon
            points="256,48 276,180 256,458 236,180"
            fill="url(#bl-core-flame)"
            filter="url(#bl-plasma-bloom)"
          />
          <polygon points="256,48 274,180 256,458 238,180" fill="url(#bl-core-flame)" />

          {/* Incandescent White-Hot Fusion Spike */}
          <polygon points="256,62 265,160 256,360 247,160" fill="#FFFFFF" />
        </svg>
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
