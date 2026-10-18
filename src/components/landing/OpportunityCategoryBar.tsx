'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Compass,
  Users,
  Lightbulb,
  Layers,
  Award,
  Sparkles,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  count: string;
  badge?: string;
  icon: React.ElementType;
  href: string;
  accentColor: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'hackathons',
    name: 'Hackathons & Competitions',
    count: '18+ Live Contests',
    badge: '₹25L+ Prizes',
    icon: Trophy,
    href: '/hackathons',
    accentColor: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'hover:border-amber-500/40 border-amber-500/20',
    textColor: 'text-amber-800 dark:text-amber-300',
    bgColor: 'bg-amber-50/50 dark:bg-amber-500/5',
  },
  {
    id: 'projects',
    name: 'Collegiate Squads',
    count: '250+ Recruiting',
    badge: 'Active Now',
    icon: Compass,
    href: '/explore',
    accentColor: 'from-violet-500/20 to-indigo-500/20',
    borderColor: 'hover:border-violet-500/40 border-violet-500/20',
    textColor: 'text-violet-800 dark:text-violet-300',
    bgColor: 'bg-violet-50/50 dark:bg-violet-500/5',
  },
  {
    id: 'teammates',
    name: 'Student Matchmaker',
    count: '94% Match Rate',
    badge: 'Squad Up',
    icon: Users,
    href: '/teammates',
    accentColor: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'hover:border-emerald-500/40 border-emerald-500/20',
    textColor: 'text-emerald-800 dark:text-emerald-300',
    bgColor: 'bg-emerald-50/50 dark:bg-emerald-500/5',
  },
  {
    id: 'problems',
    name: 'Problem Statements',
    count: '12 Faculty Briefs',
    badge: 'Campus Tracks',
    icon: Lightbulb,
    href: '/problems',
    accentColor: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'hover:border-blue-500/40 border-blue-500/20',
    textColor: 'text-blue-800 dark:text-blue-300',
    bgColor: 'bg-blue-50/50 dark:bg-blue-500/5',
  },
  {
    id: 'workspace',
    name: 'Real-Time Workspace',
    count: 'Canvas • Voice • Pitch',
    badge: 'Universal Bridge',
    icon: Layers,
    href: '/workspace/demo',
    accentColor: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'hover:border-pink-500/40 border-pink-500/20',
    textColor: 'text-pink-800 dark:text-pink-300',
    bgColor: 'bg-pink-50/50 dark:bg-pink-500/5',
  },
  {
    id: 'credentials',
    name: 'Proof of Work & Badges',
    count: 'Tamper-Proof Certs',
    badge: 'LinkedIn Ready',
    icon: Award,
    href: '/analytics',
    accentColor: 'from-cyan-500/20 to-teal-500/20',
    borderColor: 'hover:border-cyan-500/40 border-cyan-500/20',
    textColor: 'text-cyan-800 dark:text-cyan-300',
    bgColor: 'bg-cyan-50/50 dark:bg-cyan-500/5',
  },
];

export function OpportunityCategoryBar() {
  return (
    <div className="w-full relative border-y border-slate-200/80 dark:border-white/10 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 shadow-2xs py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header Row */}
        <div className="flex items-center justify-between mb-3.5 px-0.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Campus Opportunity Rails
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Discover student hackathons, open project slots &amp; faculty challenges</span>
          </div>
        </div>

        {/* Scrollable Category Rail */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`snap-start shrink-0 group flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all duration-200 backdrop-blur-sm ${cat.bgColor} ${cat.borderColor} hover:shadow-md hover:scale-[1.02] active:scale-[0.99]`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.accentColor} flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-white/10 group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className={`w-5 h-5 ${cat.textColor}`} />
                </div>

                <div className="text-left pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors whitespace-nowrap">
                      {cat.name}
                    </span>
                    {cat.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-2xs whitespace-nowrap">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {cat.count}
                  </p>
                </div>

                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-auto opacity-0 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
