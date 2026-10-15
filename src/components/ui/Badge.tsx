'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ProjectStatus, ProjectDifficulty } from '@/types/database';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'skill' | 'category' | 'status' | 'difficulty' | 'demo' | 'outline';
  status?: ProjectStatus;
  difficulty?: ProjectDifficulty;
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  children,
  variant = 'default',
  status,
  difficulty,
  size = 'md',
  ...props
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (variant === 'status' && status) {
    const statusConfig = {
      Recruiting: {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400 animate-pulse',
      },
      'In Progress': {
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
      },
      Completed: {
        bg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
        dot: 'bg-blue-400',
      },
    }[status];

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          statusConfig.bg,
          sizeClasses,
          className
        )}
        {...props}
      >
        <span className={clsx('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
        {status}
      </span>
    );
  }

  if (variant === 'difficulty' && difficulty) {
    const diffConfig = {
      Beginner: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
      Intermediate: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40',
      Advanced: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
    }[difficulty];

    return (
      <span
        className={clsx(
          'inline-flex items-center font-medium rounded-md border',
          diffConfig,
          sizeClasses,
          className
        )}
        {...props}
      >
        {difficulty}
      </span>
    );
  }

  if (variant === 'category') {
    return (
      <span
        className={clsx(
          'inline-flex items-center font-medium rounded-md bg-brand-950/60 text-brand-300 border border-brand-800/50',
          sizeClasses,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

  if (variant === 'demo') {
    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 font-semibold tracking-wider uppercase text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30',
          className
        )}
        title="Curated realistic sample project for discovery"
        {...props}
      >
        Demo Project
      </span>
    );
  }

  if (variant === 'skill') {
    return (
      <span
        className={clsx(
          'inline-flex items-center font-normal rounded-md bg-charcoal-800/80 text-slate-300 border border-charcoal-700/60 hover:border-charcoal-600 transition-colors',
          sizeClasses,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-md bg-charcoal-800 text-slate-300 border border-charcoal-700/70',
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
