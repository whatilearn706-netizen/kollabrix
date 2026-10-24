'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Flame, Zap, Trophy, Rocket, GraduationCap, CheckCircle2 } from 'lucide-react';

interface PulseCardData {
  icon: string;
  title: string;
  subtitle: string;
  timeAgo: string;
  badgeColor: string;
  link?: string;
}

const ROW_1: PulseCardData[] = [
  {
    icon: '⚡',
    title: 'Aarav K. matched with 2 devs',
    subtitle: 'Smart India Hackathon • IIT Delhi',
    timeAgo: '2m ago',
    badgeColor: 'text-emerald-400',
    link: '/teammates',
  },
  {
    icon: '🔥',
    title: 'Riya S. hit Day 30 Streak',
    subtitle: 'ICPC Practice • BITS Pilani',
    timeAgo: '8m ago',
    badgeColor: 'text-amber-400',
    link: '/resources',
  },
  {
    icon: '🚀',
    title: 'Team NeuralForge published v1.0',
    subtitle: 'AI Closer Kit • NIT Trichy',
    timeAgo: '14m ago',
    badgeColor: 'text-blue-400',
    link: '/explore',
  },
  {
    icon: '🎓',
    title: 'Faculty Approved Capstone',
    subtitle: 'Autonomous Drone • IIIT H',
    timeAgo: '22m ago',
    badgeColor: 'text-purple-400',
    link: '/projects',
  },
];

const ROW_2: PulseCardData[] = [
  {
    icon: '🏆',
    title: 'Won Best Innovation Prize',
    subtitle: 'HackMIT 2026 • Global Track',
    timeAgo: '25m ago',
    badgeColor: 'text-amber-400',
    link: '/hackathons',
  },
  {
    icon: '💻',
    title: '1,240 Test Cases Passed',
    subtitle: 'Compiler Arena • C++ Track',
    timeAgo: '32m ago',
    badgeColor: 'text-emerald-400',
    link: '/resources',
  },
  {
    icon: '🛡️',
    title: '500+ Verified Student IDs',
    subtitle: 'New Collegiate Cohort Joined',
    timeAgo: '40m ago',
    badgeColor: 'text-blue-400',
    link: '/explore',
  },
  {
    icon: '✨',
    title: 'New Pitch Deck Exported',
    subtitle: 'Closer Kit™ Capstone Studio',
    timeAgo: '55m ago',
    badgeColor: 'text-orange-400',
    link: '/workspace',
  },
];

export function CampusPulseMarquee() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-800/80 pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time Collegiate Ticker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white site-heading-white tracking-tight">
            3D Diagonal Campus Pulse Marquee
          </h2>
          <p className="text-sm mt-1 max-w-2xl" style={{ color: '#A8A29E' }}>
            Live stream of student match alerts, streak milestones, capstone approvals, and hackathon wins across universities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Campus Stream</span>
        </div>
      </div>

      {/* Marquee Container with edge fade overlays */}
      <div className="rounded-3xl bg-gradient-to-b from-[#1C1916] to-[#12100E] border border-stone-800/80 hover:border-amber-500/30 p-6 sm:p-8 relative overflow-hidden min-h-[300px] flex flex-col justify-center shadow-2xl transition-all">
        
        {/* Left & Right Gradient Mask Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-28 bg-gradient-to-r from-[#1C1916] via-[#1C1916]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-28 bg-gradient-to-l from-[#1C1916] via-[#1C1916]/80 to-transparent z-10 pointer-events-none" />

        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2">
          {ROW_1.map((card, i) => (
            <Link
              key={i}
              href={card.link || '/explore'}
              className="flex items-center gap-3 bg-[#181614] border border-stone-800/90 hover:border-amber-500/40 p-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
            >
              <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {card.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-stone-100 truncate group-hover:text-amber-400 transition-colors">
                  {card.title}
                </div>
                <div className="text-[11px] text-stone-400 truncate">
                  {card.subtitle}
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold shrink-0 ${card.badgeColor}`}>
                {card.timeAgo}
              </span>
            </Link>
          ))}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-2 mt-2">
          {ROW_2.map((card, i) => (
            <Link
              key={i}
              href={card.link || '/explore'}
              className="flex items-center gap-3 bg-[#181614] border border-stone-800/90 hover:border-orange-500/40 p-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group"
            >
              <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {card.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-stone-100 truncate group-hover:text-orange-400 transition-colors">
                  {card.title}
                </div>
                <div className="text-[11px] text-stone-400 truncate">
                  {card.subtitle}
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold shrink-0 ${card.badgeColor}`}>
                {card.timeAgo}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
