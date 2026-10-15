'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { clsx } from 'clsx';

export interface TagInputProps {
  label?: string;
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  error?: string;
  helperText?: string;
  maxTags?: number;
  required?: boolean;
}

export function TagInput({
  label,
  placeholder = 'Type and press Enter...',
  tags,
  onChange,
  suggestions = [],
  error,
  helperText,
  maxTags = 15,
  required,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }
    if (tags.length >= maxTags) return;

    onChange([...tags, trimmed]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const unselectedSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300 select-none">
            {label}
            {required && <span className="text-brand-400 ml-1">*</span>}
          </label>
          <span className="text-[11px] text-slate-500">
            {tags.length}/{maxTags}
          </span>
        </div>
      )}

      <div
        className={clsx(
          'min-h-[46px] p-2 flex flex-wrap items-center gap-1.5 rounded-lg bg-charcoal-850 border transition-colors duration-150',
          error
            ? 'border-red-500/70 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500/50'
            : 'border-charcoal-700/80 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500'
        )}
      >
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-charcoal-750 text-slate-200 border border-charcoal-700 select-none"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue) addTag(inputValue);
            }}
            placeholder={tags.length === 0 ? placeholder : 'Add another...'}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none px-1 py-0.5"
          />
        )}
      </div>

      {unselectedSuggestions.length > 0 && tags.length < maxTags && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 mr-1">Suggestions:</span>
          {unselectedSuggestions.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addTag(item)}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-charcoal-800 hover:bg-charcoal-750 text-slate-400 hover:text-slate-200 border border-charcoal-700/60 transition-colors"
            >
              <Plus className="w-2.5 h-2.5" />
              {item}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="text-xs text-red-400 font-normal">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
