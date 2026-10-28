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
      {/* Kollabrix 3D Isometric Brix Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-sm group-hover:scale-105 transition-all duration-200 shrink-0 flex items-center justify-center p-0.5`}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bl-gold-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
            <linearGradient id="bl-amber-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="bl-amber-side" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="bl-arm-top-face" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="bl-arm-top-front" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id="bl-cyan-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5F3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="bl-cyan-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <linearGradient id="bl-cyan-side" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0E7490" />
              <stop offset="100%" stopColor="#155E75" />
            </linearGradient>
          </defs>
          <rect width="120" height="120" rx="30" fill="#141210" />
          <g transform="translate(4, 0)">
            {/* Left Tower */}
            <rect x="26" y="28" width="16" height="64" rx="2" fill="url(#bl-amber-front)" />
            <line x1="26" y1="44" x2="42" y2="44" stroke="#78350F" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="26" y1="60" x2="42" y2="60" stroke="#78350F" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="26" y1="76" x2="42" y2="76" stroke="#78350F" strokeWidth="1" strokeOpacity="0.6" />
            <polygon points="26,28 36,18 52,18 42,28" fill="url(#bl-gold-top)" />
            <polygon points="42,28 52,18 52,82 42,92" fill="url(#bl-amber-side)" />

            {/* Upper Arm */}
            <polygon points="42,54 78,22 88,28 52,66" fill="#0369A1" />
            <polygon points="42,54 78,22 88,32 52,66" fill="url(#bl-arm-top-front)" />
            <polygon points="42,46 52,38 88,18 78,22" fill="url(#bl-arm-top-face)" />
            <line x1="56" y1="41" x2="63" y2="47" stroke="#0C4A6E" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="68" y1="31" x2="75" y2="37" stroke="#0C4A6E" strokeWidth="1" strokeOpacity="0.5" />

            {/* Lower Leg */}
            <polygon points="42,66 52,58 84,88 74,96" fill="url(#bl-cyan-top)" />
            <polygon points="42,66 74,96 68,102 36,72" fill="url(#bl-cyan-front)" />
            <polygon points="74,96 84,88 78,94 68,102" fill="url(#bl-cyan-side)" />
            <line x1="51" y1="75" x2="59" y2="83" stroke="#164E63" strokeWidth="1" strokeOpacity="0.6" />
            <line x1="61" y1="84" x2="69" y2="92" stroke="#164E63" strokeWidth="1" strokeOpacity="0.6" />

            {/* Center Nexus */}
            <polygon points="38,58 46,50 54,58 46,66" fill="#FFFFFF" opacity="0.95" />
          </g>
        </svg>
      </div>

      {/* Typography Wordmark with High-Contrast Editorial Authority */}
      {showWordmark && (
        <span
          className={`font-black ${textSizes[size]} tracking-tight flex items-center gap-0.5 ${
            wordmarkColor === 'dark' ? 'text-slate-900 dark:text-white' : 'text-white'
          }`}
        >
          {resolvedTitle === 'Kollabrix' ? (
            <span className="flex items-center tracking-tight">
              <span className="text-amber-500 font-black">KOLLA</span>
              <span className="text-cyan-400 font-black">BRIX</span>
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
