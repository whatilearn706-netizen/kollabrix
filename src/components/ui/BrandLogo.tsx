import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  wordmarkColor?: 'dark' | 'light';
}

export function BrandLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkColor = 'dark',
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

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Geometric Forge Insignia with Vibrant Gradient */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-[1.5px] shadow-md shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.35)_0%,transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Precision Interlocking Anvil & Spark Icon */}
          <svg
            className="w-5 h-5 text-pink-300 relative z-10 transition-transform duration-300 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Upper Forge Beam */}
            <path
              d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V8C21 8.55228 20.5523 9 20 9H4C3.44772 9 3 8.55228 3 8V7Z"
              fill="currentColor"
              fillOpacity="0.9"
            />
            {/* Central Precision Core / Crucible */}
            <path
              d="M7 10L10 17H14L17 10H7Z"
              fill="url(#forge-grad)"
            />
            {/* Base Support Plate */}
            <path
              d="M6 18H18C18.5523 18 19 18.4477 19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19C5 18.4477 5.44772 18 6 18Z"
              fill="currentColor"
              fillOpacity="0.75"
            />
            {/* Spark Star in Crucible */}
            <circle cx="12" cy="13" r="1.5" fill="#FFFFFF" />
            <defs>
              <linearGradient id="forge-grad" x1="7" y1="10" x2="17" y2="17" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F472B6" />
                <stop offset="1" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography Wordmark with Colorful Punch */}
      {showWordmark && (
        <span
          className={`font-black ${textSizes[size]} tracking-tight flex items-center gap-1 ${
            wordmarkColor === 'dark' ? 'text-slate-900' : 'text-white'
          }`}
        >
          <span>Team</span>
          <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
            Forge
          </span>
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 inline-block shadow-sm" />
        </span>
      )}
    </div>
  );
}
