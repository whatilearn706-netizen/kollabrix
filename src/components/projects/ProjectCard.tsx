'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users,
  Calendar,
  ArrowRight,
  Layers,
  Sparkles,
  GraduationCap,
  Github,
  Globe,
  Star,
  CheckCircle2,
} from 'lucide-react';

export interface ProjectCardProps {
  project: Project;
  variant?: 'dark' | 'light';
}

export function ProjectCard({ project, variant = 'dark' }: ProjectCardProps) {
  const creatorName = project.owner?.display_name || 'Student Creator';
  const creatorUsername = project.owner?.username;
  const creatorAvatar = project.owner?.avatar_url;
  const isFacultyChallenge = Boolean(project.problem_statement_id || project.problem_statement);
  const isTeamFull = (project.current_team_size || 1) >= (project.desired_team_size || 4);

  if (variant === 'light') {
    return (
      <div
        className={`group flex flex-col justify-between rounded-3xl bg-white border-2 ${
          project.is_featured
            ? 'border-amber-300 shadow-xl shadow-amber-500/10'
            : 'border-slate-100'
        } hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-500/10 p-6 transition-all duration-300 relative overflow-hidden`}
      >
        {/* Colorful top accent gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400" />

        <div className="space-y-3.5 pt-1">
          {/* Top Badges Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {project.is_featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Featured</span>
                </span>
              )}
              <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800 border border-violet-200">
                {project.category}
              </span>
              <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {project.difficulty}
              </span>
              {isFacultyChallenge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  <GraduationCap className="w-3 h-3 text-blue-600" />
                  <span>Faculty Challenge</span>
                </span>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                project.status === 'Recruiting'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : project.status === 'In Progress'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
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
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-2 leading-snug">
              {project.title}
            </h3>
          </Link>

          {/* Short Plain-Language Summary */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {project.summary}
          </p>

          {/* Technologies List */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {project.technologies.slice(0, 4).map((tech, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="text-[10px] text-slate-500 font-mono font-medium">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Required Open Skills */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1 text-[11px] text-violet-700 font-semibold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span>Open Engineering Roles:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {project.required_skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/80"
                  >
                    {skill}
                  </span>
                ))}
                {project.required_skills.length > 3 && (
                  <span className="text-[10px] text-slate-500 self-center font-medium">
                    +{project.required_skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Creator info & Team Capacity */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          {/* Creator Info */}
          <div className="flex items-center gap-2 min-w-0">
            {creatorUsername ? (
              <Link
                href={`/profile/${creatorUsername}`}
                className="flex items-center gap-2 hover:text-slate-900 transition-colors truncate group/creator"
              >
                <Avatar name={creatorName} src={creatorAvatar} size="sm" />
                <div className="truncate">
                  <span className="font-bold text-slate-800 group-hover/creator:text-violet-600 truncate block">
                    {creatorName}
                  </span>
                  {project.owner?.college && (
                    <span className="text-[10px] text-slate-500 truncate block">
                      {project.owner.college}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2 truncate">
                <Avatar name={creatorName} src={creatorAvatar} size="sm" />
                <span className="font-bold text-slate-800 truncate">{creatorName}</span>
              </div>
            )}
          </div>

          {/* Team Capacity & Link */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                isTeamFull
                  ? 'bg-slate-100 text-slate-500'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <Users className="w-3 h-3 text-emerald-600" />
              <span>
                {project.current_team_size || 1}/{project.desired_team_size || 4} Joined
              </span>
            </div>

            <Link
              href={`/projects/${project.id}`}
              className="inline-flex items-center gap-1 font-bold text-xs text-violet-600 hover:text-violet-800 transition-colors group-hover:translate-x-0.5 duration-150"
              aria-label={`View details for ${project.title}`}
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default Dark Variant
  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl bg-charcoal-900/95 border ${
        project.is_featured
          ? 'border-amber-500/40 shadow-glow-sm bg-gradient-to-b from-amber-500/[0.03] to-charcoal-900/95'
          : 'border-charcoal-750/90'
      } hover:border-indigo-500/50 p-5 sm:p-6 transition-all duration-200 hover:shadow-card hover:bg-charcoal-850/90 relative`}
    >
      <div className="space-y-3">
        {/* Top Badges Row: Strict budget for visual clarity */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {project.is_featured && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Featured</span>
              </span>
            )}
            <Badge variant="category">{project.category}</Badge>
            <Badge variant="difficulty" difficulty={project.difficulty} size="sm" />
            {isFacultyChallenge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <GraduationCap className="w-3 h-3 text-indigo-400" />
                <span>Faculty</span>
              </span>
            )}
          </div>
          <Badge variant="status" status={project.status} size="sm" />
        </div>

        {/* Project Title */}
        <Link href={`/projects/${project.id}`} className="block focus:outline-none">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {project.title}
          </h3>
        </Link>

        {/* Short Plain-Language Summary */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {project.summary}
        </p>

        {/* Technologies List */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {project.technologies.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-950 text-slate-300 border border-charcoal-800"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-[10px] text-slate-500 font-mono">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Required Open Skills */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="pt-2 border-t border-charcoal-800/60">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
              <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="font-medium text-slate-300">Recruiting Roles:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.required_skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {skill}
                </span>
              ))}
              {project.required_skills.length > 3 && (
                <span className="text-[10px] text-slate-500 self-center">
                  +{project.required_skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Creator info & Team Capacity */}
      <div className="mt-5 pt-3.5 border-t border-charcoal-800/80 flex items-center justify-between gap-3 text-xs">
        {/* Creator Info */}
        <div className="flex items-center gap-2 min-w-0">
          {creatorUsername ? (
            <Link
              href={`/profile/${creatorUsername}`}
              className="flex items-center gap-2 hover:text-slate-200 transition-colors truncate group/creator"
            >
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <div className="truncate">
                <span className="font-semibold text-slate-300 group-hover/creator:text-white truncate block">
                  {creatorName}
                </span>
                {project.owner?.college && (
                  <span className="text-[10px] text-slate-500 truncate block">
                    {project.owner.college}
                  </span>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 truncate">
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <span className="font-semibold text-slate-300 truncate">{creatorName}</span>
            </div>
          )}
        </div>

        {/* Team Capacity & Link */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-mono ${
              isTeamFull
                ? 'bg-charcoal-800 text-slate-400'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>
              {project.current_team_size || 1}/{project.desired_team_size || 4}
            </span>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-0.5 duration-150"
            aria-label={`View details for ${project.title}`}
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
