'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
}

export const PulsatingButton = React.forwardRef<
  HTMLButtonElement,
  PulsatingButtonProps
>(
  (
    {
      className,
      children,
      pulseColor = 'rgba(139, 92, 246, 0.5)',
      duration = '1.5s',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative flex items-center justify-center cursor-pointer rounded-xl text-white bg-violet-600 px-4 py-2 font-medium transition-all select-none',
          className
        )}
        style={
          {
            '--pulse-color': pulseColor,
            '--duration': duration,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="relative z-10 flex items-center gap-1.5">{children}</div>
        <div
          className="absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 bg-inherit opacity-75 animate-pulse pointer-events-none"
          style={{
            borderRadius: 'inherit',
            animationDuration: duration,
          }}
        />
        <div
          className="absolute -inset-1 bg-inherit opacity-30 blur-xs animate-pulse pointer-events-none"
          style={{
            borderRadius: 'inherit',
            animationDuration: duration,
          }}
        />
      </button>
    );
  }
);

PulsatingButton.displayName = 'PulsatingButton';

export default PulsatingButton;
