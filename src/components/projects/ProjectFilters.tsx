'use client';

import React from 'react';
import { ProjectCategory, ProjectDifficulty, ProjectStatus, ProjectFilterOptions } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export interface ProjectFiltersProps {
  filters: ProjectFilterOptions;
  onChange: (newFilters: ProjectFilterOptions) => void;
  onClear: () => void;
  availableSkills?: string[];
  availableCategories?: string[];
  totalResults: number;
}

const DEFAULT_CATEGORIES: (ProjectCategory | 'All')[] = [
  'All',
  'Web Development',
  'AI/ML',
  'Mobile Apps',
  'Developer Tools',
  'Social Impact',
  'IoT/Hardware',
  'Other',
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
  const activeCategories: (ProjectCategory | 'All')[] = availableCategories && availableCategories.length > 0
    ? (availableCategories.includes('All') ? (availableCategories as any) : ['All', ...(availableCategories as any)])
    : DEFAULT_CATEGORIES;
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.category && filters.category !== 'All') ||
    (filters.difficulty && filters.difficulty !== 'All') ||
    (filters.status && filters.status !== 'All') ||
    Boolean(filters.skill) ||
    Boolean(filters.technology);

  return (
    <div className="space-y-4 rounded-3xl bg-white border-2 border-slate-200/90 p-6 shadow-sm text-slate-900">
      {/* Top Search Bar & Sort Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search projects by title, keywords, tech stack, or skills..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            leftIcon={<Search className="w-4 h-4 text-violet-500" />}
            rightIcon={
              filters.search ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, search: '', page: 1 })}
                  className="p-1 hover:text-violet-600"
                  aria-label="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-48">
            <Select
              value={filters.sort || 'newest'}
              onChange={(e) =>
                onChange({ ...filters, sort: e.target.value as 'newest' | 'alphabetical', page: 1 })
              }
              options={[
                { value: 'newest', label: 'Sort: Newest First' },
                { value: 'alphabetical', label: 'Sort: Alphabetical (A-Z)' },
              ]}
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              leftIcon={<X className="w-3.5 h-3.5 text-slate-500" />}
              className="text-slate-600 hover:text-slate-900 font-bold"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills with Colorful Active States */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-500 font-bold mr-1 shrink-0">Category:</span>
        {activeCategories.map((cat) => {
          const isSelected = (!filters.category && cat === 'All') || filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ ...filters, category: cat, page: 1 })}
              className={`text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all font-bold ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-md shadow-violet-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/90'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Row: Difficulty & Status Dropdowns & Quick Skill Pills */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Difficulty:</span>
            <div className="w-36">
              <Select
                value={filters.difficulty || 'All'}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    difficulty: e.target.value as ProjectDifficulty | 'All',
                    page: 1,
                  })
                }
                options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Status:</span>
            <div className="w-36">
              <Select
                value={filters.status || 'All'}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    status: e.target.value as ProjectStatus | 'All',
                    page: 1,
                  })
                }
                options={STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </div>
          </div>
        </div>

        {/* Quick Skill Badges */}
        {availableSkills && availableSkills.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
            <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Skills:</span>
            {availableSkills.slice(0, 5).map((skill) => {
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
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                    isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-xs'
                      : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
