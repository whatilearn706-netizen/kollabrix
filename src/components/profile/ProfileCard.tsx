'use client';

import React from 'react';
import { Profile } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Github,
  Globe,
  Sparkles,
  Heart,
  Briefcase,
  Layers,
  Linkedin,
} from 'lucide-react';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

export interface ProfileCardProps {
  profile: Profile;
  isOwner?: boolean;
}

export function ProfileCard({ profile, isOwner = false }: ProfileCardProps) {
  return (
    <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-6">
      {/* Header: Avatar, Name, Username & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            name={profile.display_name}
            src={profile.avatar_url}
            size="xl"
            className="ring-2 ring-brand-500/30"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                style={{ color: '#ffffff' }}
                className="text-xl md:text-2xl font-black text-white site-heading-white tracking-tight"
              >
                {profile.display_name}
              </h1>
              {isOwner && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 font-mono font-medium">@{profile.username}</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-2">
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white border border-charcoal-700 transition-colors"
              title="GitHub Profile"
              aria-label="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-[#0A66C2]/15 hover:bg-[#0A66C2]/25 text-[#70B5F9] border border-[#0A66C2]/35 transition-colors"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {profile.portfolio_url && (
            <a
              href={profile.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white border border-charcoal-700 transition-colors"
              title="Portfolio Website"
              aria-label="Portfolio Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* College & Education Metadata */}
      {(profile.college || profile.course || profile.academic_year) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1 border-t border-charcoal-800">
          {profile.college && (
            <div className="flex items-center gap-1.5 bg-charcoal-850 px-2.5 py-1 rounded-md border border-charcoal-750">
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
              <VerifiedCollegeBadge
                college={profile.college}
                isVerified={profile.college_verified}
                userId={profile.user_id}
                username={profile.username}
              />
            </div>
          )}
          {profile.course && (
            <div className="flex items-center gap-1.5 bg-charcoal-850 px-2.5 py-1 rounded-md border border-charcoal-750">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>{profile.course}</span>
            </div>
          )}
          {profile.academic_year && (
            <div className="flex items-center gap-1.5 bg-charcoal-850 px-2.5 py-1 rounded-md border border-charcoal-750">
              <Calendar className="w-3.5 h-3.5 text-brand-400" />
              <span>{profile.academic_year}</span>
            </div>
          )}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">About</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-charcoal-850/50 p-4 rounded-xl border border-charcoal-800">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Technical Skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, idx) => (
              <Badge key={idx} variant="skill">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Heart className="w-3.5 h-3.5 text-purple-400" />
            <span>Project Interests</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.interests.map((interest, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/40"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preferred Roles */}
      {profile.preferred_roles && profile.preferred_roles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preferred Team Roles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.preferred_roles.map((role, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/40"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
