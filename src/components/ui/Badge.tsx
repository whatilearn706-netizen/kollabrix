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
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500 animate-pulse',
      },
      'In Progress': {
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
      },
      Completed: {
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
      },
    }[status];

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs',
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
      Beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Intermediate: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      Advanced: 'bg-purple-100 text-purple-800 border-purple-200',
    }[difficulty];

    return (
      <span
        className={clsx(
          'inline-flex items-center font-bold rounded-xl border shadow-2xs',
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
          'inline-flex items-center font-bold rounded-xl bg-violet-100 text-violet-800 border border-violet-200 shadow-2xs',
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
          'inline-flex items-center gap-1 font-bold tracking-wider uppercase text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs',
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
          'inline-flex items-center font-semibold rounded-xl bg-slate-100 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs transition-colors',
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
        'inline-flex items-center font-bold rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs',
        sizeClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
