import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  showWordmark = true,
  className = '',
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
      {/* Precision Geometric Forge Insignia */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-indigo-500 via-brand-600 to-violet-700 p-[1px] shadow-sm group-hover:shadow-glow-sm transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full rounded-[11px] bg-midnight-950 flex items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35)_0%,transparent_70%)] opacity-80 group-hover:opacity-100 transition-opacity" />

          {/* Precision Interlocking Anvil & Spark Icon */}
          <svg
            className="w-5 h-5 text-indigo-300 relative z-10 transition-transform duration-300 group-hover:scale-105"
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
                <stop stopColor="#818CF8" />
                <stop offset="1" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography Wordmark */}
      {showWordmark && (
        <span
          className={`font-extrabold ${textSizes[size]} tracking-tight text-white flex items-center gap-1.5`}
        >
          <span>TeamForge</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 group-hover:bg-indigo-300 transition-colors inline-block" />
        </span>
      )}
    </div>
  );
}
