'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const getInitials = (str: string) => {
    if (!str) return 'TF';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg font-semibold',
  };

  // Generate consistent deterministic color for avatar initials
  const getGradient = (str: string) => {
    const gradients = [
      'from-indigo-600 to-violet-700',
      'from-purple-600 to-indigo-700',
      'from-blue-600 to-indigo-800',
      'from-emerald-600 to-teal-800',
      'from-cyan-600 to-blue-800',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-charcoal-700 select-none bg-gradient-to-tr text-white shadow-subtle',
        getGradient(name || 'TF'),
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // fallback to initials on error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="font-medium tracking-wider">{getInitials(name)}</span>
      )}
    </div>
  );
}
