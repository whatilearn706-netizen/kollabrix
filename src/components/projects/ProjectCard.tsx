'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useSiteTheme, isColorDark } from '@/components/theme/SiteThemeProvider';
import {
  Users,
  Calendar,
  ArrowRight,
  Layers,
  Sparkles,
  GraduationCap,
  Star,
} from 'lucide-react';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

export interface ProjectCardProps {
  project: Project;
  variant?: 'dark' | 'light';
}

export function ProjectCard({ project, variant }: ProjectCardProps) {
  const { theme, isDark } = useSiteTheme();

  const creatorName = project.owner?.display_name || 'Student Creator';
  const creatorUsername = project.owner?.username;
  const creatorAvatar = project.owner?.avatar_url;
  const isFacultyChallenge = Boolean(project.problem_statement_id || project.problem_statement);
  const isTeamFull = (project.current_team_size || 1) >= (project.desired_team_size || 4);

  // Determine effective darkness based on theme or explicit variant
  const effectiveDark = variant ? variant === 'dark' : isDark;
  const isCardDark = effectiveDark || isColorDark(theme.surfaceColor);
  const cardHeadingColor = isCardDark ? '#ffffff' : (theme.headingColor || '#1C1917');

  return (
    <div
      style={{
        backgroundColor: isCardDark ? '#090C12' : theme.surfaceColor,
        borderColor: project.is_featured
          ? isCardDark
            ? 'rgba(255, 255, 255, 0.28)'
            : theme.brandColor
          : isCardDark
            ? 'rgba(255, 255, 255, 0.1)'
            : theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className={`site-card card-hover-lift group flex flex-col justify-between border p-6 sm:p-7 relative overflow-hidden h-full shadow-sm hover:shadow-md hover:border-white/25 transition-all`}
    >
      {/* Top brushed silver shimmer bar on hover */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-zinc-600 via-white/90 to-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex-1 flex flex-col space-y-4">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.is_featured && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isCardDark
                    ? 'bg-white/10 border-white/25 text-zinc-100'
                    : 'bg-zinc-900 text-white border-zinc-800'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Featured</span>
              </span>
            )}
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                borderColor: effectiveDark ? 'rgba(255,255,255,0.1)' : theme.borderColor,
                color: effectiveDark ? '#e4e4e7' : theme.bodyTextColor,
              }}
              className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-lg border"
            >
              {project.category}
            </span>
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                borderColor: effectiveDark ? 'rgba(255,255,255,0.08)' : theme.borderColor,
                color: effectiveDark ? '#a1a1aa' : theme.mutedTextColor,
              }}
              className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-lg border"
            >
              {project.difficulty}
            </span>
            {isFacultyChallenge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-200 border border-white/20">
                <GraduationCap className="w-3 h-3 text-zinc-200" />
                <span>Faculty</span>
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              project.status === 'Recruiting'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : project.status === 'In Progress'
                ? 'bg-white/[0.07] text-zinc-200 border-white/15'
                : 'bg-white/[0.05] text-zinc-400 border-white/10'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                project.status === 'Recruiting' ? 'bg-emerald-400 animate-pulse' : 'bg-current'
              }`}
            />
            {project.status}
          </span>
        </div>

        {/* Project Title with Uniform Min Height & Generous Line Spacing */}
        <Link href={`/projects/${project.id}`} className="block focus:outline-none">
          <h3
            style={{ color: cardHeadingColor }}
            className={`text-base sm:text-lg font-black transition-colors duration-200 line-clamp-2 min-h-[3rem] leading-snug group-hover:text-zinc-200 ${isCardDark ? 'text-white site-heading-white' : ''}`}
          >
            {project.title}
          </h3>
        </Link>

        {/* Short Summary with Relaxed Leading for Effortless Reading */}
        <p
          style={{ color: theme.bodyTextColor }}
          className="text-xs sm:text-sm line-clamp-2 min-h-[2.75rem] leading-relaxed font-normal opacity-85 text-slate-300"
        >
          {project.summary}
        </p>

        {/* Technologies List with Uniform Spacing */}
        <div className="flex flex-wrap items-center gap-2 pt-1 min-h-[2rem]">
          {project.technologies && project.technologies.length > 0 ? (
            <>
              {project.technologies.slice(0, 4).map((tech, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: effectiveDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    borderColor: theme.borderColor,
                    color: theme.bodyTextColor,
                  }}
                  className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all duration-200 group-hover:border-white/25 group-hover:scale-[1.02]"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span style={{ color: theme.mutedTextColor }} className="text-[10px] font-mono font-medium">
                  +{project.technologies.length - 4}
                </span>
              )}
            </>
          ) : (
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                borderColor: theme.borderColor,
                color: theme.mutedTextColor,
              }}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg border opacity-60"
            >
              General Stack
            </span>
          )}
        </div>

        {/* Required Open Skills with Clean Visual Sectioning */}
        <div className="pt-3 min-h-[3.25rem] flex flex-col justify-center">
          {project.required_skills && project.required_skills.length > 0 ? (
            <>
              <div className="flex items-center gap-1.5 text-[11px] font-bold mb-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Open Team Roles:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.required_skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                  >
                    {skill}
                  </span>
                ))}
                {project.required_skills.length > 3 && (
                  <span style={{ color: theme.mutedTextColor }} className="text-[10px] self-center font-medium">
                    +{project.required_skills.length - 3}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
              <span>All Builder Roles Welcome</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer - Pinned to bottom with mt-auto and clean spacing */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="mt-auto pt-5 border-t space-y-3.5"
      >
        {/* Creator Info & Verified College Affiliation */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          {creatorUsername ? (
            <Link
              href={`/profile/${creatorUsername}`}
              className="flex items-center gap-2.5 min-w-0 transition-opacity hover:opacity-85 group/creator"
            >
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    style={{ color: cardHeadingColor }}
                    className={`font-bold text-xs truncate ${isCardDark ? 'text-white site-heading-white' : ''}`}
                  >
                    {creatorName}
                  </span>
                  <VerifiedCollegeBadge
                    college={project.owner?.college}
                    isVerified={project.owner?.college_verified}
                    userId={project.owner?.user_id || project.owner_id}
                    username={creatorUsername}
                    size="xs"
                    badgeOnly={true}
                    showUnverified={false}
                  />
                </div>
                {project.owner?.college && (
                  <span
                    style={{ color: isCardDark ? '#94a3b8' : (theme.mutedTextColor || '#64748b') }}
                    className="text-[10px] truncate block opacity-75 font-medium"
                  >
                    {project.owner.college}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5 truncate">
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <span
                style={{ color: cardHeadingColor }}
                className={`font-bold text-xs truncate ${isCardDark ? 'text-white site-heading-white' : ''}`}
              >
                {creatorName}
              </span>
            </div>
          )}
        </div>

        {/* Squad Capacity Status & Action CTA - Clean Spacious Row */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div
            className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl font-mono font-bold whitespace-nowrap tabular-nums ${
              isTeamFull
                ? 'bg-white/[0.05] text-zinc-400 border border-white/10'
                : (project.desired_team_size || 4) - (project.current_team_size || 1) === 1
                ? 'bg-white/10 text-zinc-100 border border-white/25 font-bold'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-current shrink-0" />
            <span className="tabular-nums">
              {`${project.current_team_size || 1}/${project.desired_team_size || 4} Joined`}
              {isTeamFull
                ? ' • Full'
                : (project.desired_team_size || 4) - (project.current_team_size || 1) === 1
                ? ' • 1 Left'
                : ''}
            </span>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/60 transition-all shadow-xs group/link active:scale-[0.97] shrink-0"
            aria-label={`View details for ${project.title}`}
          >
            <span>{isTeamFull ? 'View' : 'Apply'}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
