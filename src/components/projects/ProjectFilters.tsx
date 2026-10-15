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
    <div className="space-y-4 rounded-2xl bg-midnight-900/90 border border-midnight-750/70 p-5 shadow-card">
      {/* Top Search Bar & Sort Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search projects by title, keywords, tech stack, or skills..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              filters.search ? (
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, search: '', page: 1 })}
                  className="p-1 hover:text-white"
                  aria-label="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : undefined
            }
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-44">
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
              leftIcon={<X className="w-3.5 h-3.5 text-slate-400" />}
              className="text-slate-400 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-500 font-medium mr-1 shrink-0">Category:</span>
        {activeCategories.map((cat) => {
          const isSelected = (!filters.category && cat === 'All') || filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ ...filters, category: cat, page: 1 })}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-subtle'
                  : 'bg-midnight-850 hover:bg-midnight-800 text-slate-400 hover:text-slate-200 border border-midnight-700/60'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Row: Difficulty & Status Dropdowns & Quick Skill Pills */}
      <div className="pt-3 border-t border-midnight-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Difficulty:</span>
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
            <span className="text-slate-400 font-medium">Status:</span>
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

        {/* Quick Skill Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 text-[11px]">Popular Skills:</span>
          {availableSkills.slice(0, 5).map((skill) => {
            const isSelected = filters.skill?.toLowerCase() === skill.toLowerCase();
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
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 font-medium'
                    : 'bg-midnight-850 hover:bg-midnight-800 text-slate-400 border border-midnight-700/60'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
