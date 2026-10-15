'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-slate-700 select-none"
          >
            {label}
            {props.required && <span className="text-pink-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full appearance-none rounded-2xl bg-slate-50 border text-sm font-semibold text-slate-900 placeholder-slate-400 py-2.5 pl-3.5 pr-10 transition-colors duration-150',
              'focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                : 'border-slate-200 hover:border-slate-300',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white text-slate-900 font-medium">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
