'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Kanban,
  ShieldCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface CollegiateWorkflowProps {
  title?: string;
  subtitle?: string;
}

export function CollegiateWorkflow({
  title = 'From Idea to Verified Proof',
  subtitle = 'Three structured steps designed to eliminate ghosting and turn ideas into production code.',
}: CollegiateWorkflowProps) {
  const steps = [
    {
      number: '01',
      title: 'Match',
      description:
        'Find students with complementary tech stacks. Filter by graduation year, commit cadence, and target hackathons.',
      badges: ['Skill Match', 'SIH 2026', 'Zero Ghosting'],
      linkText: 'Find Teammates',
      href: '/teammates',
      icon: Users,
      color: 'emerald',
    },
    {
      number: '02',
      title: 'Squad Up & Build',
      description:
        'Lock role responsibilities (Frontend, Backend, AI, Design). Collaborate with sprint kanbans and shared milestones.',
      badges: ['Role Lock', '1-Click Join', 'Sprint Kanban'],
      linkText: 'Explore Squads',
      href: '/explore',
      icon: Kanban,
      color: 'indigo',
    },
    {
      number: '03',
      title: 'Ship & Prove',
      description:
        'Link merged GitHub pull requests and export signed proof-of-work credentials that verify your contributions to employers.',
      badges: ['GitHub Proof', 'Signed Certs', 'Hall of Fame'],
      linkText: 'View Competitions',
      href: '/hackathons',
      icon: ShieldCheck,
      color: 'amber',
    },
  ];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-white dark:bg-transparent border-b border-slate-200/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Collegiate Process</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black font-mono text-slate-300 dark:text-slate-700 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {step.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {step.badges.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold border border-slate-200/80 dark:border-white/5"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  href={step.href}
                  className="inline-flex items-center text-xs font-bold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors pt-2 group/link"
                >
                  <span>{step.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
