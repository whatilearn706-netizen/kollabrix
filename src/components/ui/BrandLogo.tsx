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
      {/* Official Obsidian & Brushed Silver Dual-Chevron Spark Mark (Pure Transparency) */}
      <div
        className={`${iconSizes[size]} relative shrink-0 flex items-center justify-center group-hover:scale-108 transition-all duration-300 select-none`}
      >
        {/* Cool Silver-White Ambient Core Backlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-300/20 via-white/15 to-transparent blur-md pointer-events-none group-hover:from-slate-200/35 group-hover:via-white/25 transition-all duration-300 scale-125" />

        {/* Inline Vector SVG Emblem: Zero network dependency, 100% guaranteed rendering in all incognito / private tabs */}
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_4px_14px_rgba(226,232,240,0.4)] drop-shadow-[0_0_20px_rgba(255,255,255,0.18)] transition-all duration-300"
          aria-label="Kollabrix Official Silver-Obsidian Emblem"
        >
          <defs>
            <linearGradient id="bl-silver-spark" x1="256" y1="32" x2="256" y2="468" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="22%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="78%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            <linearGradient id="bl-silver-border" x1="256" y1="60" x2="256" y2="430" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            <linearGradient id="bl-wing-l" x1="120" y1="74" x2="232" y2="424" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#263040" />
              <stop offset="45%" stopColor="#121824" />
              <stop offset="100%" stopColor="#07090F" />
            </linearGradient>

            <linearGradient id="bl-wing-r" x1="392" y1="74" x2="280" y2="424" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2A3445" />
              <stop offset="45%" stopColor="#131926" />
              <stop offset="100%" stopColor="#07090F" />
            </linearGradient>

            <radialGradient id="bl-ambient-glow" cx="256" cy="245" r="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.38" />
              <stop offset="48%" stopColor="#94A3B8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
            </radialGradient>

            <filter id="bl-silver-bloom" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="14" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Cool Silver Ambient Glow */}
          <circle cx="256" cy="245" r="175" fill="url(#bl-ambient-glow)" />

          {/* Left Obsidian Wing with Brushed Silver Border */}
          <polygon
            points="232,74 108,388 166,424 232,248"
            fill="url(#bl-wing-l)"
            stroke="url(#bl-silver-border)"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Right Obsidian Wing with Brushed Silver Border */}
          <polygon
            points="280,74 404,388 346,424 280,248"
            fill="url(#bl-wing-r)"
            stroke="url(#bl-silver-border)"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Precision Platinum-Silver Vertical Needle Spark */}
          <polygon
            points="256,32 269,246 256,468 243,246"
            fill="url(#bl-silver-spark)"
            filter="url(#bl-silver-bloom)"
          />
          <polygon points="256,32 268,246 256,468 244,246" fill="url(#bl-silver-spark)" />

          {/* Pure White Luminous Core */}
          <polygon points="256,68 263,246 256,412 249,246" fill="#FFFFFF" />
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
