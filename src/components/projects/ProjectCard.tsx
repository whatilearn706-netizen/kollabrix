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
  const cardHeadingColor = isCardDark ? '#ffffff' : (theme.headingColor || '#0f172a');

  return (
    <div
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: project.is_featured ? theme.brandColor : theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className={`site-card card-hover-lift group flex flex-col justify-between border p-6 sm:p-7 relative overflow-hidden`}
    >
      {/* Top glowing accent gradient bar on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-3.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.is_featured && (
              <span
                style={{
                  backgroundColor: `${theme.brandColor}15`,
                  borderColor: `${theme.brandColor}40`,
                  color: theme.brandColor,
                }}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Featured</span>
              </span>
            )}
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                borderColor: theme.borderColor,
                color: theme.bodyTextColor,
              }}
              className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-lg border"
            >
              {project.category}
            </span>
            <span
              style={{
                backgroundColor: effectiveDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                borderColor: theme.borderColor,
                color: theme.mutedTextColor,
              }}
              className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-lg border"
            >
              {project.difficulty}
            </span>
            {isFacultyChallenge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <GraduationCap className="w-3 h-3 text-blue-500" />
                <span>Faculty</span>
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              project.status === 'Recruiting'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                : project.status === 'In Progress'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                project.status === 'Recruiting' ? 'bg-emerald-500 animate-pulse' : 'bg-current'
              }`}
            />
            {project.status}
          </span>
        </div>

        {/* Project Title */}
        <Link href={`/projects/${project.id}`} className="block focus:outline-none">
          <h3
            style={{ color: cardHeadingColor }}
            className={`text-base sm:text-lg font-black transition-colors duration-200 line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 ${isCardDark ? 'text-white site-heading-white' : ''}`}
          >
            {project.title}
          </h3>
        </Link>

        {/* Short Summary */}
        <p
          style={{ color: theme.bodyTextColor }}
          className="text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium opacity-90"
        >
          {project.summary}
        </p>

        {/* Technologies List */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {project.technologies.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: effectiveDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  borderColor: theme.borderColor,
                  color: theme.bodyTextColor,
                }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all duration-200 group-hover:border-violet-500/30 group-hover:scale-[1.02]"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span style={{ color: theme.mutedTextColor }} className="text-[10px] font-mono font-medium">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Required Open Skills */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div
            style={{ borderColor: theme.borderColor }}
            className="pt-2 border-t opacity-90"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold mb-1.5" style={{ color: theme.headingColor }}>
              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span>Open Team Roles:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.required_skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: `${theme.brandColor}10`,
                    borderColor: `${theme.brandColor}30`,
                    color: theme.brandColor,
                  }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg border"
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
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="mt-5 pt-3.5 border-t flex items-center justify-between gap-3 text-xs"
      >
        {/* Creator Info */}
        <div className="flex items-center gap-2 min-w-0">
          {creatorUsername ? (
            <Link
              href={`/profile/${creatorUsername}`}
              className="flex items-center gap-2 transition-opacity truncate group/creator hover:opacity-80"
            >
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <div className="truncate">
                <span style={{ color: cardHeadingColor }} className={`font-bold truncate block ${isCardDark ? 'text-white site-heading-white' : ''}`}>
                  {creatorName}
                </span>
                {project.owner?.college && (
                  <span style={{ color: isCardDark ? '#94a3b8' : (theme.mutedTextColor || '#64748b') }} className="text-[10px] truncate block">
                    <VerifiedCollegeBadge
                      college={project.owner.college}
                      isVerified={project.owner.college_verified}
                      size="xs"
                    />
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <span style={{ color: cardHeadingColor }} className={`font-bold truncate ${isCardDark ? 'text-white site-heading-white' : ''}`}>
                {creatorName}
              </span>
            </div>
          )}
        </div>

        {/* Team Capacity & Link */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
              isTeamFull
                ? 'bg-slate-500/10 text-slate-400'
                : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
            }`}
          >
            <Users className="w-3 h-3 text-emerald-500" />
            <span>
              {project.current_team_size || 1}/{project.desired_team_size || 4} Joined
            </span>
          </div>

          <Link
            href={`/projects/${project.id}`}
            style={{ color: theme.brandColor }}
            className="inline-flex items-center gap-1 font-bold text-xs transition-colors group/link hover:underline"
            aria-label={`View details for ${project.title}`}
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1 group-hover/link:translate-x-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
