'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/database';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Users, Calendar, ArrowRight, Layers, Sparkles } from 'lucide-react';

export interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const creatorName = project.owner?.display_name || 'Student Creator';
  const creatorUsername = project.owner?.username;
  const creatorAvatar = project.owner?.avatar_url;

  return (
    <div className="group flex flex-col justify-between rounded-xl bg-charcoal-900 border border-charcoal-750/80 hover:border-charcoal-600 p-5 transition-all duration-200 hover:shadow-elevated hover:bg-charcoal-850/60 relative">
      <div>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="category">{project.category}</Badge>
            <Badge variant="difficulty" difficulty={project.difficulty} />
            {project.is_demo && <Badge variant="demo" />}
          </div>
          <Badge variant="status" status={project.status} size="sm" />
        </div>

        {/* Project Title */}
        <Link href={`/projects/${project.id}`} className="block focus:outline-none">
          <h3 className="text-base font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
            {project.title}
          </h3>
        </Link>

        {/* Short Summary */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {project.summary}
        </p>

        {/* Technologies List */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.technologies.slice(0, 4).map((tech, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700/60"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-[10px] text-slate-500 font-mono">
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Required Skills Row */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="mt-3 pt-3 border-t border-charcoal-800/80">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1.5">
              <Sparkles className="w-3 h-3 text-brand-400 shrink-0" />
              <span className="font-medium">Seeking:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.required_skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded bg-brand-950/40 text-brand-300 border border-brand-800/40"
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

      {/* Card Footer: Creator info, Team size, & Details Action */}
      <div className="mt-5 pt-3.5 border-t border-charcoal-800/80 flex items-center justify-between gap-3 text-xs text-slate-400">
        {/* Creator Info */}
        <div className="flex items-center gap-2 min-w-0">
          {creatorUsername ? (
            <Link
              href={`/profile/${creatorUsername}`}
              className="flex items-center gap-2 hover:text-slate-200 transition-colors truncate group/creator"
            >
              <Avatar name={creatorName} src={creatorAvatar} size="sm" />
              <div className="truncate">
                <span className="font-medium text-slate-300 group-hover/creator:text-white truncate block">
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
              <span className="font-medium text-slate-300 truncate">{creatorName}</span>
            </div>
          )}
        </div>

        {/* Team Size & CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-1 text-[11px] text-slate-400"
            title={`Team size: ${project.current_team_size} of ${project.desired_team_size} members`}
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {project.current_team_size}/{project.desired_team_size}
            </span>
          </div>

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 font-medium text-brand-400 hover:text-brand-300 transition-colors group-hover:translate-x-0.5 transform duration-150"
            aria-label={`View details for ${project.title}`}
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
