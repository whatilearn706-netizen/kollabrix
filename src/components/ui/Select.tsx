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
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-slate-300 select-none"
          >
            {label}
            {props.required && <span className="text-brand-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full appearance-none rounded-lg bg-charcoal-850 border text-sm text-slate-100 placeholder-slate-500 py-2.5 pl-3.5 pr-10 transition-colors duration-150',
              'focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-500/70 focus:border-red-500 focus:ring-red-500/50'
                : 'border-charcoal-700/80 hover:border-charcoal-600',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-charcoal-900 text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-400 font-normal">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
