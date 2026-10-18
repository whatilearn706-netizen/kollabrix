'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Flame, ArrowRight } from 'lucide-react';

export function UnstopHeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'hackathons' | 'projects' | 'teammates'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (category === 'hackathons') {
      router.push(clean ? `/hackathons?q=${encodeURIComponent(clean)}` : '/hackathons');
    } else if (category === 'teammates') {
      router.push(clean ? `/teammates?q=${encodeURIComponent(clean)}` : '/teammates');
    } else {
      router.push(clean ? `/explore?q=${encodeURIComponent(clean)}` : '/explore');
    }
  };

  const handleTagClick = (tag: string, cat: 'hackathons' | 'projects' | 'teammates') => {
    if (cat === 'hackathons') router.push(`/hackathons?q=${encodeURIComponent(tag)}`);
    else if (cat === 'teammates') router.push(`/teammates?q=${encodeURIComponent(tag)}`);
    else router.push(`/explore?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="w-full space-y-2.5 pt-1">
      {/* Search Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-white/15 shadow-lg hover:border-blue-500 dark:hover:border-blue-400 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        {/* Category Pill Dropdown */}
        <div className="shrink-0 flex items-center border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-white/10 px-3 py-1 sm:py-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
          >
            <option value="all" className="dark:bg-slate-900">All</option>
            <option value="hackathons" className="dark:bg-slate-900">🏆 Hackathons</option>
            <option value="projects" className="dark:bg-slate-900">🚀 Projects</option>
            <option value="teammates" className="dark:bg-slate-900">👥 Teammates</option>
          </select>
        </div>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center px-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SIH 2026, React, AI, IIT Delhi..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-1"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search CTA Button */}
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Trending Tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-bold flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Trending:</span>
        </span>
        <button
          type="button"
          onClick={() => handleTagClick('Smart India Hackathon', 'hackathons')}
          className="px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 font-medium transition-colors"
        >
          SIH 2026
        </button>
        <button
          type="button"
          onClick={() => handleTagClick('Google Challenge', 'hackathons')}
          className="px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 font-medium transition-colors"
        >
          Google Challenge
        </button>
        <button
          type="button"
          onClick={() => handleTagClick('AI/ML', 'projects')}
          className="px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 font-medium transition-colors"
        >
          AI/ML Squads
        </button>
        <button
          type="button"
          onClick={() => handleTagClick('Full-Stack', 'teammates')}
          className="px-2 py-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-400 hover:text-blue-600 font-medium transition-colors"
        >
          Full-Stack
        </button>
      </div>
    </div>
  );
}
