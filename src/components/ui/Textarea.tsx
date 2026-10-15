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
            className="block text-xs font-bold text-slate-700 select-none"
          >
            {label}
            {props.required && <span className="text-pink-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={clsx(
            'w-full rounded-2xl bg-slate-50 border text-sm font-medium text-slate-900 placeholder-slate-400 transition-colors duration-150 p-3.5',
            'focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600',
            'disabled:opacity-50 disabled:cursor-not-allowed resize-y',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
              : 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
