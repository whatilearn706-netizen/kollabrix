'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ProjectCategory, ProjectDifficulty, ProjectStatus, ProjectFilterOptions } from '@/types/database';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

export interface ProjectFiltersProps {
  filters: ProjectFilterOptions;
  onChange: (newFilters: ProjectFilterOptions) => void;
  onClear: () => void;
  availableSkills?: string[];
  availableCategories?: string[];
  totalResults: number;
}

interface CategoryItem {
  label: string;
  value: ProjectCategory | 'All';
}

const DEFAULT_CATEGORY_ITEMS: CategoryItem[] = [
  { label: 'All projects', value: 'All' },
  { label: 'AI / ML', value: 'AI/ML' },
  { label: 'Developer tools', value: 'Developer Tools' },
  { label: 'IoT / Hardware', value: 'IoT/Hardware' },
  { label: 'Mobile apps', value: 'Mobile Apps' },
  { label: 'Web development', value: 'Web Development' },
  { label: 'Social impact', value: 'Social Impact' },
  { label: 'Other', value: 'Other' },
];

const DIFFICULTIES: (ProjectDifficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUSES: (ProjectStatus | 'All')[] = ['All', 'Recruiting', 'In Progress', 'Completed'];

export function ProjectFilters({
  filters,
  onChange,
  onClear,
  availableSkills = ['React', 'Python', 'TypeScript', 'PyTorch', 'UI/UX', 'Node.js', 'Next.js', 'Flutter'],
  availableCategories,
  totalResults,
}: ProjectFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Shortcut ⌘ K or Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute active filters count
  const activeFilterCount =
    (filters.status && filters.status !== 'All' ? 1 : 0) +
    (filters.difficulty && filters.difficulty !== 'All' ? 1 : 0) +
    (filters.skill ? 1 : 0) +
    (filters.technology ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Categories list
  const categoryItems: CategoryItem[] = React.useMemo(() => {
    if (availableCategories && availableCategories.length > 0) {
      const items: CategoryItem[] = [{ label: 'All projects', value: 'All' }];
      availableCategories.forEach((cat) => {
        if (cat === 'All') return;
        let label = cat;
        if (cat === 'AI/ML') label = 'AI / ML';
        else if (cat === 'Developer Tools') label = 'Developer tools';
        else if (cat === 'IoT/Hardware') label = 'IoT / Hardware';
        else if (cat === 'Mobile Apps') label = 'Mobile apps';
        else if (cat === 'Web Development') label = 'Web development';
        else if (cat === 'Social Impact') label = 'Social impact';
        items.push({ label, value: cat as ProjectCategory });
      });
      return items;
    }
    return DEFAULT_CATEGORY_ITEMS;
  }, [availableCategories]);

  return (
    <div className="w-full space-y-4">
      {/* 1. BROWSE CATEGORIES Section */}
      <div className="space-y-2.5">
       <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-semibold">
          BROWSE CATEGORIES
        </div>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
          {categoryItems.map((cat) => {
            const isSelected = (!filters.category && cat.value === 'All') || filters.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => onChange({ ...filters, category: cat.value, page: 1 })}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-950 font-bold shadow-[0_0_15px_rgba(255,255,255,0.35)] border border-white/60'
                    : 'bg-[#121622]/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/90'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sleek Search & Filter Bar */}
      <div className="relative rounded-2xl bg-[#090C12] border border-white/10 p-2 sm:p-2.5 flex items-center gap-3 shadow-lg">
        {/* Titanium Search Icon */}
        <div className="pl-2 shrink-0">
          <Search className="w-5 h-5 text-zinc-400" />
        </div>

        {/* Input Field */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search projects, skills, or technologies"
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
          className="flex-1 bg-transparent border-0 outline-none ring-0 focus:ring-0 text-sm text-slate-100 placeholder-slate-400 min-w-0"
        />

        {/* Clear Search Button */}
        {filters.search && (
          <button
            type="button"
            onClick={() => onChange({ ...filters, search: '', page: 1 })}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Shortcut ⌘ K */}
        <div className="hidden sm:flex items-center shrink-0 pr-1">
          <kbd className="px-2 py-0.5 text-xs font-mono text-slate-400 bg-white/5 border border-white/10 rounded-md select-none">
            ⌘ K
          </kbd>
        </div>

        {/* Filters Toggle Button */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            hasActiveFilters
              ? 'border border-white/60 bg-white/10 text-white hover:bg-white/15 shadow-[0_0_12px_rgba(255,255,255,0.15)]'
              : 'border border-slate-700/80 bg-[#141926] text-slate-300 hover:text-white hover:border-slate-600'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-200 shrink-0" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-white/20 text-white border border-white/40">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isFilterOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* 3. Dropdown / Expanded Filter Panel */}
      {isFilterOpen && (
        <div className="rounded-2xl bg-[#0d111c] border border-slate-800 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Difficulty
              </label>
              <select
                value={filters.difficulty || 'All'}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    difficulty: e.target.value as ProjectDifficulty | 'All',
                    page: 1,
                  })
                }
                className="w-full appearance-none rounded-xl bg-[#090C12] border border-white/10 text-sm font-semibold text-zinc-100 py-2.5 px-3.5 focus:outline-none focus:border-white/30 transition-colors"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="bg-[#090C12] text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Status
              </label>
              <select
                value={filters.status || 'All'}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    status: e.target.value as ProjectStatus | 'All',
                    page: 1,
                  })
                }
                className="w-full appearance-none rounded-xl bg-[#090C12] border border-white/10 text-sm font-semibold text-zinc-100 py-2.5 px-3.5 focus:outline-none focus:border-white/30 transition-colors"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#090C12] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Sort By
              </label>
              <select
                value={filters.sort || 'newest'}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    sort: e.target.value as 'newest' | 'alphabetical',
                    page: 1,
                  })
                }
                className="w-full appearance-none rounded-xl bg-[#090C12] border border-white/10 text-sm font-semibold text-zinc-100 py-2.5 px-3.5 focus:outline-none focus:border-white/30 transition-colors"
              >
                <option value="newest" className="bg-[#090C12] text-white">
                  Newest First
                </option>
                <option value="alphabetical" className="bg-[#090C12] text-white">
                  Alphabetical (A-Z)
                </option>
              </select>
            </div>
          </div>

          {/* Popular Skills */}
          {availableSkills && availableSkills.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Filter by Skill
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {availableSkills.map((skill) => {
                  const isSelected = filters.skill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...filters,
                          skill: isSelected ? undefined : skill,
                          page: 1,
                        })
                      }
                      className={`text-xs font-mono px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-white to-zinc-200 text-zinc-950 font-bold shadow-xs'
                          : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] hover:text-white border border-white/10'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ACTIVE FILTERS Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold mr-1 shrink-0">
            ACTIVE FILTERS
          </span>

          {/* Status Chip */}
          {filters.status && filters.status !== 'All' && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, status: 'All', page: 1 })}
              className="px-3.5 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10 text-slate-200 flex items-center gap-1.5 hover:bg-white/15 transition-all cursor-pointer"
            >
              <span>{filters.status}</span>
              <X className="w-3.5 h-3.5 hover:text-white" />
            </button>
          )}

          {/* Difficulty Chip */}
          {filters.difficulty && filters.difficulty !== 'All' && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, difficulty: 'All', page: 1 })}
              className="px-3.5 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10 text-slate-200 flex items-center gap-1.5 hover:bg-white/15 transition-all cursor-pointer"
            >
              <span>{filters.difficulty}</span>
              <X className="w-3.5 h-3.5 hover:text-white" />
            </button>
          )}

          {/* Skill Chip */}
          {filters.skill && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, skill: undefined, page: 1 })}
              className="px-3.5 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10 text-slate-200 flex items-center gap-1.5 hover:bg-white/15 transition-all cursor-pointer"
            >
              <span>{filters.skill}</span>
              <X className="w-3.5 h-3.5 hover:text-white" />
            </button>
          )}

          {/* Technology Chip */}
          {filters.technology && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, technology: undefined, page: 1 })}
              className="px-3.5 py-1 rounded-full text-xs font-medium border border-white/20 bg-white/10 text-slate-200 flex items-center gap-1.5 hover:bg-white/15 transition-all cursor-pointer"
            >
              <span>{filters.technology}</span>
              <X className="w-3.5 h-3.5 hover:text-white" />
            </button>
          )}

          {/* Clear all Button */}
          <button
            type="button"
            onClick={onClear}
            className="text-emerald-400 hover:text-emerald-300 text-xs font-medium transition-colors ml-auto cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
