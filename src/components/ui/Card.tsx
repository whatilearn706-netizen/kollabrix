'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, children, hoverEffect = false, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-5 transition-all duration-200',
        hoverEffect &&
          'hover:border-charcoal-600 hover:shadow-elevated hover:bg-charcoal-850/80 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('flex items-center justify-between pb-4 border-b border-charcoal-800', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx('text-lg font-semibold text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('pt-4', className)} {...props}>
      {children}
    </div>
  );
}
