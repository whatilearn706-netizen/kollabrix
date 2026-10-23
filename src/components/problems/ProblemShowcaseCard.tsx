'use client';

import React from 'react';
import Link from 'next/link';
import { ProblemStatement } from '@/types/database';
import { useSiteTheme, isColorDark } from '@/components/theme/SiteThemeProvider';
import { GraduationCap, ArrowRight, Lightbulb, Users, Calendar } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface ProblemShowcaseCardProps {
  problem: ProblemStatement;
}

export function ProblemShowcaseCard({ problem }: ProblemShowcaseCardProps) {
  const { theme, isDark } = useSiteTheme();
  const effectiveDark = isDark || isColorDark(theme.surfaceColor);
  const headingColor = effectiveDark ? '#ffffff' : (theme.headingColor || '#1C1917');

  const authorName = problem.author?.display_name || 'Faculty Mentor';
  const collegeName = problem.author?.college || 'Faculty of Engineering & Tech';

  return (
    <div
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className="site-card card-hover-lift group flex flex-col justify-between border p-6 sm:p-7 relative overflow-hidden shadow-sm"
    >
      {/* Top glowing accent gradient bar on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-3.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <GraduationCap className="w-3 h-3 text-blue-500" />
              <span>Campus Track</span>
            </span>
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                borderColor: theme.borderColor,
                color: theme.bodyTextColor,
              }}
              className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-lg border"
            >
              {problem.category}
            </span>
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                borderColor: theme.borderColor,
                color: theme.mutedTextColor,
              }}
              className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-lg border"
            >
              {problem.difficulty}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open Brief</span>
          </span>
        </div>

        {/* Problem Title */}
        <Link href={`/problems/${problem.id}`} className="block focus:outline-none">
          <h3
            style={{ color: headingColor }}
            className="text-base sm:text-lg font-black transition-colors duration-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400"
          >
            {problem.title}
          </h3>
        </Link>

        {/* Short Summary */}
        <p
          style={{ color: theme.bodyTextColor }}
          className="text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium opacity-90"
        >
          {problem.description.replace(/###.*?\n/g, '').replace(/\n+/g, ' ')}
        </p>

        {/* Technologies / Skills */}
        {problem.required_skills && problem.required_skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {problem.required_skills.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: effectiveDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  borderColor: theme.borderColor,
                  color: theme.bodyTextColor,
                }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="mt-5 pt-3.5 border-t flex items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={authorName} size="sm" />
          <div className="truncate">
            <span style={{ color: headingColor }} className="font-bold truncate block">
              {authorName}
            </span>
            <span style={{ color: theme.mutedTextColor }} className="text-[10px] truncate block">
              {collegeName}
            </span>
          </div>
        </div>

        <Link
          href={`/problems/${problem.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-all shadow-2xs group/link active:scale-[0.98]"
        >
          <span>Solve Brief</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
