'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Compass,
  Users2,
  Lightbulb,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DomainCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  href: string;
  icon: React.ElementType;
  gradientBg: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  iconHex: string;
  buttonColor: string;
}

const DOMAIN_CARDS: DomainCard[] = [
  {
    id: 'hackathons',
    title: 'Hackathons & Contests',
    subtitle: 'Compete & Win Cash',
    description: 'Enter SIH 2026, Google Solution Challenge, ETHIndia & collegiate hackathon tracks.',
    badge: '18+ Contests',
    href: '/hackathons',
    icon: Trophy,
    gradientBg: 'from-blue-50/90 via-sky-50/70 to-indigo-50/80 dark:from-blue-950/40 dark:via-sky-950/30 dark:to-indigo-950/40',
    borderColor: 'border-blue-200/80 hover:border-blue-400 dark:border-blue-800/40 dark:hover:border-blue-500',
    iconBg: 'bg-blue-600 text-white shadow-blue-500/30',
    iconColor: 'text-white',
    iconHex: '#2563eb',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'projects',
    title: 'Collegiate Squads',
    subtitle: 'Build Real Software',
    description: 'Collaborate on production engineering, open-source repos & campus startup apps.',
    badge: '250+ Squads',
    href: '/explore',
    icon: Compass,
    gradientBg: 'from-violet-50/90 via-purple-50/70 to-fuchsia-50/80 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/40',
    borderColor: 'border-violet-200/80 hover:border-violet-400 dark:border-violet-800/40 dark:hover:border-violet-500',
    iconBg: 'bg-violet-600 text-white shadow-violet-500/30',
    iconColor: 'text-white',
    iconHex: '#7c3aed',
    buttonColor: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
  {
    id: 'teammates',
    title: 'Student Matchmaker',
    subtitle: 'Assemble Dream Teams',
    description: 'Match with complementary frontend, backend, AI and UI/UX peers across 38+ universities.',
    badge: '94% Match',
    href: '/teammates',
    icon: Users2,
    gradientBg: 'from-amber-50/90 via-orange-50/70 to-yellow-50/80 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40',
    borderColor: 'border-amber-200/80 hover:border-amber-400 dark:border-amber-800/40 dark:hover:border-amber-500',
    iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
    iconColor: 'text-white',
    iconHex: '#f59e0b',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    id: 'problems',
    title: 'Problem Statements',
    subtitle: 'Faculty & Industry Briefs',
    description: 'Solve real challenges proposed by university professors with verified mentorship credits.',
    badge: '12 Briefs',
    href: '/problems',
    icon: Lightbulb,
    gradientBg: 'from-emerald-50/90 via-teal-50/70 to-green-50/80 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/40',
    borderColor: 'border-emerald-200/80 hover:border-emerald-400 dark:border-emerald-800/40 dark:hover:border-emerald-500',
    iconBg: 'bg-emerald-600 text-white shadow-emerald-500/30',
    iconColor: 'text-white',
    iconHex: '#059669',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    id: 'workspace',
    title: 'Real-Time Workspace',
    subtitle: 'Universal Canvas & Voice',
    description: 'Embed Figma & Canva live, launch WebRTC voice huddles, and generate AI pitch decks.',
    badge: 'Canvas & Voice',
    href: '/workspace/demo',
    icon: Layers,
    gradientBg: 'from-rose-50/90 via-pink-50/70 to-red-50/80 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-red-950/40',
    borderColor: 'border-rose-200/80 hover:border-rose-400 dark:border-rose-800/40 dark:hover:border-rose-500',
    iconBg: 'bg-rose-600 text-white shadow-rose-500/30',
    iconColor: 'text-white',
    iconHex: '#e11d48',
    buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
];

interface UnstopDomainGridProps {
  title?: string;
  subtitle?: string;
}

export function UnstopDomainGrid({ title, subtitle }: UnstopDomainGridProps = {}) {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-white/10">
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold mb-1">
              <Zap className="w-4 h-4" />
              <span>Explore Opportunities by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {title || 'What do you want to achieve today?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {subtitle || 'Pick your pathway to join collegiate hackathons, recruit teammates, or solve faculty challenges.'}
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline self-start sm:self-auto"
          >
            <span>View All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5-Column Responsive Card Grid (Unstop-Inspired) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {DOMAIN_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                data-domain-card="true"
                data-no-override="true"
                className={`group flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-br ${card.gradientBg} border ${card.borderColor} shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden`}
              >
                {/* Subtle top edge glow */}
                <div className="absolute inset-x-0 top-0 h-1 bg-white/60 dark:bg-white/10 pointer-events-none" />

                <div className="space-y-4">
                  {/* Top Row: Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      data-domain-icon="true"
                      style={{ backgroundColor: card.iconHex }}
                      className={`w-12 h-12 rounded-2xl ${card.iconBg} shadow-md flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon
                        className={`w-6 h-6 ${card.iconColor} m-auto block shrink-0`}
                        strokeWidth={2.2}
                      />
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-2xs whitespace-nowrap shrink-0">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {card.title}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug mt-0.5">
                      {card.subtitle}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Action Pill */}
                <div className="pt-5 mt-auto">
                  <div
                    className={`w-full py-2 px-3 rounded-xl ${card.buttonColor} text-xs font-bold shadow-2xs flex items-center justify-between transition-all group-hover:shadow-md`}
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
