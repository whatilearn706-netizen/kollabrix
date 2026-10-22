'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Lightbulb,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Compass,
} from 'lucide-react';

export function CollegiatePortalsRadar() {
  const cards = [
    {
      title: 'College Hackathons',
      subtitle: 'Collegiate Arena & Competitions',
      desc: 'Browse inter-college hackathons, assemble dream squads, track competition deadlines, and submit real-time builds for verified awards.',
      href: '/hackathons',
      badge: 'LIVE COMPETITIONS',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: Trophy,
      iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      borderColor: 'hover:border-amber-500/50',
      accentGlow: 'from-amber-500/10 to-transparent',
      actionText: 'Explore Hackathons',
    },
    {
      title: 'Faculty Problem Statements',
      subtitle: 'Professor Briefs & Solutions',
      desc: 'Tackle real-world challenges published by college faculty. Form student teams, submit solution architectures, and earn faculty mentorship.',
      href: '/problems',
      badge: 'ACADEMIC CHALLENGES',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      icon: Lightbulb,
      iconColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      borderColor: 'hover:border-indigo-500/50',
      accentGlow: 'from-indigo-500/10 to-transparent',
      actionText: 'View Problems',
    },
    {
      title: 'Faculty Portal',
      subtitle: 'Educator Desk & Review Hub',
      desc: 'Verified professors can post academic problem statements, inspect student team solutions, publish results, and award recognition.',
      href: '/teacher/dashboard',
      badge: 'FACULTY NETWORK',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: GraduationCap,
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      borderColor: 'hover:border-emerald-500/50',
      accentGlow: 'from-emerald-500/10 to-transparent',
      actionText: 'Open Faculty Portal',
    },
  ];

  return (
    <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-charcoal-800 bg-gradient-to-b from-transparent via-slate-50/50 dark:via-charcoal-900/30 to-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                CAMPUS NETWORK RADAR
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Collegiate Innovation Hubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
              Direct access to competitive arenas, professor-curated briefs, and verified academic mentorship.
            </p>
          </div>
        </div>

        {/* 3 Portal Cards with Blur-to-Focus Stack Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="blur-to-focus-card group relative rounded-2xl border border-slate-200/90 dark:border-charcoal-800 bg-white/80 dark:bg-charcoal-900/70 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                }}
              >
                {/* Background Ambient Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.accentGlow} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none`}
                />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${card.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      {card.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 dark:border-charcoal-800 relative z-10">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-all active:scale-[0.98]"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
