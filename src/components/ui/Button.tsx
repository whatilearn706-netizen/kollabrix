'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 select-none rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:hover:translate-y-0 cursor-pointer';

    const variants = {
      primary:
        'bg-gradient-to-b from-white via-zinc-100 to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/70 shadow-[0_0_20px_rgba(255,255,255,0.12)]',
      secondary:
        'bg-[#090C12] hover:bg-white/[0.08] text-zinc-100 border border-white/15 hover:border-white/25 hover:shadow-sm',
      outline:
        'bg-[#090C12] hover:bg-white/[0.08] text-zinc-200 border border-white/15 hover:border-white/30 shadow-xs hover:shadow-sm',
      ghost:
        'bg-transparent hover:bg-white/[0.08] text-zinc-300 hover:text-white hover:translate-y-0',
      danger:
        'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md border-0',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
