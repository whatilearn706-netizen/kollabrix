'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-slate-200/90 dark:bg-charcoal-800/80',
        className
      )}
      {...props}
    />
  );
}

/**
 * High-fidelity Project Card Shimmer Skeleton
 */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/80 p-5 space-y-4 shadow-sm animate-pulse">
      {/* Top badges */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-charcoal-800" />
        <div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
      </div>

      {/* Title & Tagline */}
      <div className="space-y-2">
        <div className="h-6 w-3/4 rounded-lg bg-slate-200 dark:bg-charcoal-800" />
        <div className="h-4 w-full rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
        <div className="h-4 w-5/6 rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
      </div>

      {/* Tech Stack Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-charcoal-800" />
        <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-charcoal-800" />
        <div className="h-5 w-12 rounded-md bg-slate-200 dark:bg-charcoal-800" />
      </div>

      {/* Footer Author & Team Size */}
      <div className="pt-3 border-t border-slate-100 dark:border-charcoal-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-charcoal-800" />
          <div className="h-3.5 w-20 rounded-md bg-slate-200 dark:bg-charcoal-800" />
        </div>
        <div className="h-4 w-12 rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
      </div>
    </div>
  );
}

/**
 * High-fidelity Teammate Profile Card Shimmer Skeleton
 */
export function TeammateCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/80 p-5 space-y-4 shadow-sm animate-pulse">
      {/* Avatar & Name Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-charcoal-800 shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-5 w-32 rounded-md bg-slate-200 dark:bg-charcoal-800" />
          <div className="h-3.5 w-24 rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
        </div>
      </div>

      {/* Bio snippet */}
      <div className="space-y-1.5">
        <div className="h-3.5 w-full rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
        <div className="h-3.5 w-4/5 rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
      </div>

      {/* Skills chips */}
      <div className="flex flex-wrap gap-1.5">
        <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-charcoal-800" />
        <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-charcoal-800" />
        <div className="h-5 w-18 rounded-md bg-slate-200 dark:bg-charcoal-800" />
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <div className="h-8 w-full rounded-xl bg-slate-200 dark:bg-charcoal-800" />
      </div>
    </div>
  );
}

/**
 * High-fidelity Hackathon Card Shimmer Skeleton
 */
export function HackathonCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/80 overflow-hidden shadow-sm animate-pulse">
      {/* Banner */}
      <div className="h-36 w-full bg-slate-200 dark:bg-charcoal-800" />

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-charcoal-800" />
          <div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
        </div>

        <div className="space-y-2">
          <div className="h-6 w-3/4 rounded-md bg-slate-200 dark:bg-charcoal-800" />
          <div className="h-4 w-full rounded-md bg-slate-100 dark:bg-charcoal-800/60" />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-charcoal-800/60">
          <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-charcoal-800" />
          <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-charcoal-800" />
        </div>
      </div>
    </div>
  );
}
