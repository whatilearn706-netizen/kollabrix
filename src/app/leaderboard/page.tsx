'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Search,
  Building2,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Award,
} from 'lucide-react';
import { CollegeLeaderboardItem, DEFAULT_LEADERBOARD_COLLEGES } from '@/types/communityFeatures';

export default function CollegiateLeaderboardPage() {
  const [colleges, setColleges] = useState<CollegeLeaderboardItem[]>(DEFAULT_LEADERBOARD_COLLEGES);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'iit_nit' | 'bits_iiit' | 'state_pvt'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.colleges && Array.isArray(data.colleges) && data.colleges.length > 0) {
          setColleges(data.colleges);
        }
      } catch (err) {
        console.warn('Leaderboard fetch note:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const filteredColleges = colleges.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const totalBuilders = colleges.reduce((acc, c) => acc + (c.activeBuilders || 0), 0);
  const totalProjects = colleges.reduce((acc, c) => acc + (c.projectsCount || 0), 0);
  const totalWins = colleges.reduce((acc, c) => acc + (c.hackathonWins || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Trophy className="w-3.5 h-3.5" />
            <span>NATIONAL CAMPUS RANKINGS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Inter-College Innovation Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Real-time standings based on collegiate sprint velocity, hackathon podium finishes, verified open-source builds, and active student squads.
          </p>
        </div>

        {/* Global Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-1 shadow-2xs">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {colleges.length}
            </div>
            <div className="text-[11px] font-mono uppercase text-slate-500">
              Ranked Campuses
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-1 shadow-2xs">
            <div className="text-2xl font-black text-amber-500">
              {totalBuilders}+
            </div>
            <div className="text-[11px] font-mono uppercase text-slate-500">
              Active Builders
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-1 shadow-2xs">
            <div className="text-2xl font-black text-violet-500">
              {totalProjects}
            </div>
            <div className="text-[11px] font-mono uppercase text-slate-500">
              Collegiate Projects
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-1 shadow-2xs">
            <div className="text-2xl font-black text-emerald-500">
              {totalWins}
            </div>
            <div className="text-[11px] font-mono uppercase text-slate-500">
              Hackathon Podiums
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Campuses' },
              { id: 'iit_nit', label: 'IITs & NITs' },
              { id: 'bits_iiit', label: 'BITS & IIITs' },
              { id: 'state_pvt', label: 'State & Private' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search college, city..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Ranked Colleges List */}
        <div className="space-y-3.5">
          {filteredColleges.map((college, idx) => {
            const isTop3 = college.rank <= 3;
            const rankBadgeColor =
              college.rank === 1
                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                : college.rank === 2
                ? 'bg-slate-300/20 text-slate-400 border-slate-400/40'
                : college.rank === 3
                ? 'bg-amber-700/20 text-amber-600 border-amber-700/40'
                : 'bg-slate-100 dark:bg-charcoal-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-charcoal-700';

            return (
              <div
                key={college.id}
                className={`p-5 rounded-2xl bg-white dark:bg-charcoal-900 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                  isTop3
                    ? 'border-amber-500/30 dark:border-amber-500/20'
                    : 'border-slate-200 dark:border-charcoal-800'
                }`}
              >
                {/* Left: Rank & College Identification */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-base border shrink-0 ${rankBadgeColor}`}
                  >
                    #{college.rank}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {college.shortCode}
                      </h3>
                      {college.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-charcoal-700">
                        {college.city}
                      </span>
                      {college.badge && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {college.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {college.name}
                    </p>
                  </div>
                </div>

                {/* Right: Telemetry & Sprint Metrics */}
                <div className="flex items-center gap-6 sm:gap-8 shrink-0 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {college.points || (college.projectsCount * 80 + college.hackathonWins * 200)}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Sprint Points
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {college.projectsCount}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Projects
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-500">
                      {college.hackathonWins}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Podiums
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-violet-500">
                      {college.activeBuilders}
                    </div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Builders
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA representing one's campus */}
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="text-xl font-black">
              Want to Boost Your Campus Ranking?
            </h3>
            <p className="text-xs text-violet-100 max-w-xl leading-relaxed">
              Every verified project launch, hackathon win, or faculty challenge completed by students from your college adds authoritative sprint points to the national board.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/projects/new"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 transition-all"
            >
              Start a Project
            </Link>
            <Link
              href="/hackathons"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
            >
              Join Hackathons
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
