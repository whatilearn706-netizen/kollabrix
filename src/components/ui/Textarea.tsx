'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-medium text-slate-300 select-none"
          >
            {label}
            {props.required && <span className="text-brand-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={clsx(
            'w-full rounded-lg bg-charcoal-850 border text-sm text-slate-100 placeholder-slate-500 transition-colors duration-150 p-3',
            'focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500',
            'disabled:opacity-50 disabled:cursor-not-allowed resize-y',
            error
              ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/50'
              : 'border-charcoal-700/80 hover:border-charcoal-600',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-normal">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
