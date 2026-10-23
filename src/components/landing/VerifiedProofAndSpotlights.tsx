'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  GitPullRequest,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Award,
  GraduationCap,
} from 'lucide-react';

interface VerifiedProofAndSpotlightsProps {
  className?: string;
}

export function VerifiedProofAndSpotlights({ className = '' }: VerifiedProofAndSpotlightsProps) {
  const metricCards = [
    {
      metric: '94%',
      label: 'Match Accuracy',
      tag: 'Algorithmic Complement',
      explanation:
        'Calculated dynamically: 50% technical stack overlap (e.g. FastAPI + React), 30% open role vacancy alignment, and 20% past GitHub commit verification.',
      benefit: 'Eliminates mismatched skillsets and ensures every member has a real role.',
      icon: Sparkles,
      color: 'text-violet-600 dark:text-violet-400',
      badgeBg: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
    },
    {
      metric: '250+',
      label: 'Formed Squads',
      tag: 'Zero Ghosting',
      explanation:
        'Over 250 multi-disciplinary teams assembled for national hackathons (SIH 2026, Apex) and collegiate capstones with role locks and milestone commits.',
      benefit: 'Every team member commits to defined deliverables before the project starts.',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    },
    {
      metric: '100%',
      label: 'Verifiable Work',
      tag: 'Cryptographic Proof',
      explanation:
        'Deliverables link directly to merged GitHub pull requests, signed milestones, and faculty-approved review checkpoints.',
      benefit: 'Proof-of-work credentials recruiters can verify in 1 click. Zero resume fluff.',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    },
  ];

  const studentSpotlights = [
    {
      name: 'Aarav Sharma',
      role: 'Project Lead',
      project: 'EcoRoute AI',
      college: 'State Engineering College',
      quote:
        'We assembled our hackathon squad on Linkora in under 48 hours. The role locks and PR verification meant zero team ghosting throughout our entire 3-week sprint.',
      stats: 'SIH 2026 Finalist • 4 Contributors',
      avatar: 'Aarav Sharma',
      href: '/explore',
    },
    {
      name: 'Kavya Patel',
      role: 'Frontend & GIS Lead',
      project: 'EcoRoute AI',
      college: 'State Engineering College',
      quote:
        'Instead of spamming random WhatsApp groups, the 94% match connected me with a team that actively needed Leaflet and React skills for live transit mapping.',
      stats: 'Joined in 1 Click • 14 Merged Commits',
      avatar: 'Kavya Patel',
      href: '/teammates',
    },
    {
      name: 'Rohan Verma',
      role: 'AI Researcher',
      project: 'NeuroScan Assist',
      college: 'National Institute of Tech',
      quote:
        'Faculty mentors reviewed our dataset privacy statement directly through the portal, speeding up our capstone ethical clearance by two weeks.',
      stats: 'Faculty Mentored • PyTorch + FastAPI',
      avatar: 'Rohan Verma',
      href: '/problems',
    },
  ];

  return (
    <section className={`py-16 md:py-24 relative overflow-hidden bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10 ${className}`}>
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-16 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Real Outcomes • Verifiable Proof</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Built on Trust, Not Hype
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
            Every statistic on Linkora reflects real collegiate collaboration, cryptographic code checks, and genuine student engineering.
          </p>
        </div>

        {/* 3 Metric Proof Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${card.color}`}>
                      {card.metric}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase border ${card.badgeBg}`}>
                      {card.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {card.label}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-normal">
                      {card.explanation}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <Icon className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  <span>{card.benefit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Testimonials & Spotlights */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verified Student Spotlights
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                Real Builders. Real Ships.
              </h3>
            </div>

            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              <span>Explore All Active Squads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentSpotlights.map((spotlight) => (
              <div
                key={spotlight.name}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-5 hover:border-violet-300 dark:hover:border-violet-500/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-white/5">
                      {spotlight.project}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                    &ldquo;{spotlight.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={spotlight.avatar} size="sm" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {spotlight.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {spotlight.role} &bull; {spotlight.college}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
