'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Users, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface TickerItem {
  id: string;
  icon: 'flame' | 'trophy' | 'users' | 'zap';
  title: string;
  college?: string;
  tag: string;
  href: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    id: 't-1',
    icon: 'trophy',
    title: 'Smart India Hackathon 2026: 48 campus teams formed',
    college: 'AICTE / MoE',
    tag: 'Trending Hackathon',
    href: '/hackathons',
  },
  {
    id: 't-2',
    icon: 'users',
    title: 'Aditya (IIT Delhi) recruited 3 full-stack teammates for AI Vision squad',
    college: 'IIT Delhi',
    tag: 'Squad Match',
    href: '/teammates',
  },
  {
    id: 't-3',
    icon: 'flame',
    title: '14-Day Build Streak recorded across 18 universities',
    college: 'BITS Pilani',
    tag: 'Campus Streak',
    href: '/explore',
  },
  {
    id: 't-4',
    icon: 'zap',
    title: 'Google Solution Challenge 2026: Registration officially active',
    college: 'Global GDSC',
    tag: 'International',
    href: '/hackathons',
  },
  {
    id: 't-5',
    icon: 'trophy',
    title: 'Medical Imaging Diagnosis Challenge: 5 faculty reviews completed',
    college: 'IET Lucknow',
    tag: 'Problem Track',
    href: '/problems',
  },
];

export function CampusOpportunityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeItem = TICKER_ITEMS[currentIndex];

  const renderIcon = (type: TickerItem['icon']) => {
    switch (type) {
      case 'flame':
        return <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500/20" />;
      case 'trophy':
        return <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />;
      case 'users':
        return <Users className="w-3.5 h-3.5 text-emerald-500" />;
      case 'zap':
        return <Zap className="w-3.5 h-3.5 text-violet-500 fill-violet-500/20" />;
    }
  };

  return (
    <div className="w-full bg-slate-900 text-white py-2 px-4 border-b border-slate-800 text-xs">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px] shrink-0 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Campus Live</span>
          </div>

          <div className="flex items-center gap-2 truncate transition-all duration-300">
            <span className="shrink-0">{renderIcon(activeItem.icon)}</span>
            <span className="font-bold text-slate-100 truncate">{activeItem.title}</span>
            {activeItem.college && (
              <span className="hidden md:inline-block text-slate-400 text-[11px] font-mono shrink-0">
                • {activeItem.college}
              </span>
            )}
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-slate-300 shrink-0">
              {activeItem.tag}
            </span>
          </div>
        </div>

        <Link
          href={activeItem.href}
          className="inline-flex items-center gap-1 text-slate-300 hover:text-white font-bold shrink-0 transition-colors group"
        >
          <span className="hidden sm:inline">Explore</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
