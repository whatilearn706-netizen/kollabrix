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
      {/* Kollabrix Modular Nexus Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shadow-sm group-hover:scale-105 transition-all duration-200 shrink-0 flex items-center justify-center p-0.5`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="kb-stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="kb-top-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="kb-bot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="kb-nexus-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="13" fill="#141210" />
          <path d="M12 24H36" stroke="#26221F" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.6" />
          <path d="M24 12V36" stroke="#26221F" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.6" />
          {/* Vertical Segmented Pillars (Brix) */}
          <rect x="10" y="10" width="7" height="13" rx="3.5" fill="url(#kb-stem-grad)" />
          <rect x="10" y="25" width="7" height="13" rx="3.5" fill="url(#kb-stem-grad)" />
          {/* Upper Diagonal Arm (Hackathon Energy) */}
          <path d="M20 22L29.5 12.5C30.6 11.4 32.5 12.2 32.5 13.8V17C32.5 17.8 32.1 18.6 31.5 19.2L24.5 25L20 22Z" fill="url(#kb-top-grad)" />
          {/* Lower Diagonal Leg (Collegiate Foundation) */}
          <path d="M20 26L25 23L31.8 30.5C32.4 31.2 32.5 32.1 32.2 32.9L31.2 35.2C30.7 36.4 29.1 36.8 28.1 35.8L20 26Z" fill="url(#kb-bot-grad)" />
          {/* Central Synergy Prism */}
          <rect x="17.5" y="21.5" width="5" height="5" rx="1.5" transform="rotate(45 20 24)" fill="url(#kb-nexus-grad)" />
        </svg>
      </div>

      {/* Typography Wordmark with High-Contrast Editorial Authority */}
      {showWordmark && (
        <span
          className={`font-black ${textSizes[size]} tracking-tight flex items-center gap-0.5 ${
            wordmarkColor === 'dark' ? 'text-slate-900 dark:text-white' : 'text-white'
          }`}
        >
          <span>{resolvedTitle}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block ml-0.5 animate-pulse" />
        </span>
      )}
    </div>
  );
}
