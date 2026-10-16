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
  title = 'Linkora',
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
      {/* Linkora Origami Bird Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-xs group-hover:scale-105 transition-all duration-200 shrink-0 flex items-center justify-center`}
      >
        <img
          src="/brand/linkora-logo.png"
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Typography Wordmark with High-Contrast Editorial Authority */}
      {showWordmark && (
        <span
          className={`font-black ${textSizes[size]} tracking-tight flex items-center gap-0.5 ${
            wordmarkColor === 'dark' ? 'text-slate-900' : 'text-white'
          }`}
        >
          <span>{title}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-0.5" />
        </span>
      )}
    </div>
  );
}
