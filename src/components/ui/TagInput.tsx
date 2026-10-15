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
          <label className="block text-xs font-bold text-slate-700 select-none">
            {label}
            {required && <span className="text-pink-500 ml-1">*</span>}
          </label>
          <span className="text-[11px] font-semibold text-slate-500">
            {tags.length}/{maxTags}
          </span>
        </div>
      )}

      <div
        className={clsx(
          'min-h-[48px] p-2 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 transition-colors duration-150',
          error
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 bg-red-50/30'
            : 'focus-within:bg-white focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-500/20'
        )}
      >
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-violet-100 text-violet-800 border border-violet-200 select-none shadow-xs"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-violet-500 hover:text-violet-900 transition-colors"
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
            className="flex-1 min-w-[120px] bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 outline-none px-2 py-1"
          />
        )}
      </div>

      {unselectedSuggestions.length > 0 && tags.length < maxTags && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Suggestions:</span>
          {unselectedSuggestions.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addTag(item)}
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-800 border border-slate-200 hover:border-violet-300 transition-colors"
            >
              <Plus className="w-2.5 h-2.5 text-violet-600" />
              {item}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p className="text-xs text-red-500 font-semibold">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
