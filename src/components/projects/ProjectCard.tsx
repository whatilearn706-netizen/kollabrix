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
}

export function ProjectCard({ project }: ProjectCardProps) {
  const creatorName = project.owner?.display_name || 'Student Creator';
  const creatorUsername = project.owner?.username;
  const creatorAvatar = project.owner?.avatar_url;
  const isFacultyChallenge = Boolean(project.problem_statement_id || project.problem_statement);
  const isTeamFull = (project.current_team_size || 1) >= (project.desired_team_size || 4);

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
