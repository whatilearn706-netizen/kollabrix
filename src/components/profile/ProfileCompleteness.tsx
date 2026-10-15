'use client';

import React from 'react';
import { Profile } from '@/types/database';
import { CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';

export interface ProfileCompletenessProps {
  profile: Partial<Profile> | null;
}

export function ProfileCompleteness({ profile }: ProfileCompletenessProps) {
  if (!profile) return null;

  const checks = [
    { label: 'Display name & username', passed: Boolean(profile.display_name && profile.username), weight: 20 },
    { label: 'Bio / About yourself', passed: Boolean(profile.bio && profile.bio.trim().length > 10), weight: 20 },
    { label: 'College & course information', passed: Boolean(profile.college && profile.course), weight: 20 },
    { label: 'Skills added (at least 2)', passed: Boolean(profile.skills && profile.skills.length >= 2), weight: 20 },
    { label: 'Interests or preferred roles', passed: Boolean((profile.interests && profile.interests.length > 0) || (profile.preferred_roles && profile.preferred_roles.length > 0)), weight: 10 },
    { label: 'GitHub or portfolio link', passed: Boolean(profile.github_url || profile.portfolio_url), weight: 10 },
  ];

  const score = checks.reduce((acc, c) => (c.passed ? acc + c.weight : acc), 0);

  return (
    <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Profile Completeness
          </h4>
          <p className="text-xs text-slate-400">
            A complete profile helps other students discover your skills for projects.
          </p>
        </div>
        <span
          className={clsx(
            'text-sm font-bold font-mono px-2.5 py-1 rounded-md border',
            score === 100
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : score >= 60
              ? 'bg-brand-500/15 text-brand-300 border-brand-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          )}
        >
          {score}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
        <div
          className={clsx(
            'h-full transition-all duration-500 rounded-full',
            score === 100
              ? 'bg-emerald-500'
              : score >= 60
              ? 'bg-brand-500'
              : 'bg-amber-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {checks.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {item.passed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
            <span className={item.passed ? 'text-slate-300' : 'text-slate-500'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
