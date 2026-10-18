'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Trophy,
  Compass,
  Users,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

export function UnstopHeroBanner() {
  const router = useRouter();
  const { theme, isDark } = useSiteTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hackathons' | 'projects' | 'teammates'>('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      if (selectedCategory === 'hackathons') router.push('/hackathons');
      else if (selectedCategory === 'teammates') router.push('/teammates');
      else router.push('/explore');
      return;
    }

    if (selectedCategory === 'hackathons') {
      router.push(`/hackathons?q=${encodeURIComponent(query)}`);
    } else if (selectedCategory === 'teammates') {
      router.push(`/teammates?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/explore?q=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickTag = (tag: string, cat: 'hackathons' | 'projects' | 'teammates') => {
    if (cat === 'hackathons') router.push(`/hackathons?q=${encodeURIComponent(tag)}`);
    else if (cat === 'teammates') router.push(`/teammates?q=${encodeURIComponent(tag)}`);
    else router.push(`/explore?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="w-full relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/80 dark:border-white/10">
      {/* Subtle Unstop-style ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
        {/* Top Badge: Unstop-style verified ecosystem pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          <span>India&apos;s Premiere Student Opportunity &amp; Hackathon Workspace</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Connecting{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Collegiate Talent
            </span>
            ,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-pink-600 to-rose-600">
              Hackathons
            </span>{' '}
            &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Dream Teams
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Explore national hackathons, match with verified student builders across campuses, and collaborate live with in-browser voice huddles &amp; canvas.
          </p>
        </div>

        {/* Unstop Signature Large Interactive Search Bar */}
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 sm:p-2.5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-white/15 shadow-xl hover:border-blue-500 dark:hover:border-blue-400 focus-within:border-blue-600 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            {/* Category Dropdown */}
            <div className="shrink-0 flex items-center border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-white/10 px-3 py-1.5 sm:py-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-2"
              >
                <option value="all" className="dark:bg-slate-900">All Opportunities</option>
                <option value="hackathons" className="dark:bg-slate-900">🏆 Hackathons</option>
                <option value="projects" className="dark:bg-slate-900">🚀 Projects</option>
                <option value="teammates" className="dark:bg-slate-900">👥 Teammates</option>
              </select>
            </div>

            {/* Text Input */}
            <div className="relative flex-1 flex items-center px-3">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SIH 2026, AI drones, React developers, faculty challenges..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-1.5"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Primary Action Button (Unstop Blue) */}
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Opportunities</span>
            </button>
          </form>

          {/* Quick Trending Searches Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Trending:</span>
            </span>
            <button
              type="button"
              onClick={() => handleQuickTag('Smart India Hackathon', 'hackathons')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors text-[11px]"
            >
              Smart India Hackathon 2026
            </button>
            <button
              type="button"
              onClick={() => handleQuickTag('Google Solution Challenge', 'hackathons')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors text-[11px]"
            >
              Google Challenge
            </button>
            <button
              type="button"
              onClick={() => handleQuickTag('AI/ML', 'projects')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors text-[11px]"
            >
              AI/ML Squads
            </button>
            <button
              type="button"
              onClick={() => handleQuickTag('Full-Stack', 'teammates')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors text-[11px]"
            >
              Full-Stack Developers
            </button>
          </div>
        </div>

        {/* Unstop Scale & Social Proof Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 border-t border-slate-200/80 dark:border-white/10 max-w-4xl mx-auto text-slate-600 dark:text-slate-400 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span><strong className="font-extrabold text-slate-900 dark:text-white">₹25,00,000+</strong> Prize Pool</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-500" />
            <span><strong className="font-extrabold text-slate-900 dark:text-white">250+</strong> Active Squads</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span><strong className="font-extrabold text-slate-900 dark:text-white">94%</strong> Teammate Match</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-500" />
            <span><strong className="font-extrabold text-slate-900 dark:text-white">38+</strong> Universities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
