'use client';

import React from 'react';
import Link from 'next/link';
import { TeammateMatch } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Briefcase,
} from 'lucide-react';

interface TeammateCardProps {
  match: TeammateMatch;
  onInvite: (candidate: TeammateMatch) => void;
  isInvited?: boolean;
}

export function TeammateCard({ match, onInvite, isInvited = false }: TeammateCardProps) {
  const { profile, match_score, matching_skills, matching_roles, reasons } = match;

  const scoreBadgeColor =
    match_score >= 80
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : match_score >= 60
      ? 'bg-brand-500/15 text-brand-300 border-brand-500/30'
      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';

  return (
    <div className="rounded-2xl bg-midnight-900/90 border border-midnight-750/70 p-5 flex flex-col justify-between hover:border-brand-500/40 transition-all shadow-card hover:shadow-card-hover group">
      <div className="space-y-4">
        {/* Header: Avatar, Info, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${profile.username}`} className="shrink-0">
              <Avatar
                name={profile.display_name}
                src={profile.avatar_url}
                size="lg"
                className="ring-2 ring-midnight-750 group-hover:ring-brand-500/40 transition-all"
              />
            </Link>
            <div className="min-w-0">
              <Link
                href={`/profile/${profile.username}`}
                className="font-bold text-sm sm:text-base text-white hover:text-brand-300 transition-colors truncate block"
              >
                {profile.display_name}
              </Link>
              <p className="text-xs text-slate-400 truncate">@{profile.username}</p>
              {(profile.college || profile.course) && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {[profile.course, profile.college].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${scoreBadgeColor}`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{match_score}% Match</span>
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Why this match? (Explainability section) */}
        {reasons && reasons.length > 0 && (
          <div className="p-3 rounded-xl bg-midnight-950/70 border border-midnight-750/60 space-y-1.5 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              Why this recommendation:
            </span>
            <ul className="space-y-1">
              {reasons.map((r, idx) => (
                <li key={idx} className="text-slate-300 flex items-start gap-1.5 text-[11px]">
                  <span className="text-brand-400 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Matching & Highlighted Skills */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-medium">
            Skills & Stack:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.slice(0, 6).map((skill) => {
                const isMatching = matching_skills.some(
                  (ms) => ms.toLowerCase() === skill.toLowerCase()
                );
                return (
                  <span
                    key={skill}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                      isMatching
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-midnight-800 text-slate-300 border-midnight-700/60'
                    }`}
                  >
                    {skill}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-400 italic">No skills listed yet</span>
            )}
            {profile.skills && profile.skills.length > 6 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{profile.skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Preferred Roles */}
        {profile.preferred_roles && profile.preferred_roles.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-medium">
              Preferred Roles:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.preferred_roles.map((role) => {
                const isMatchingRole = matching_roles.some(
                  (mr) => mr.toLowerCase() === role.toLowerCase()
                );
                return (
                  <span
                    key={role}
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      isMatchingRole
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-semibold'
                        : 'bg-midnight-850 text-slate-400 border-midnight-750'
                    }`}
                  >
                    {role}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-midnight-800 flex items-center justify-between gap-2">
        <Link
          href={`/profile/${profile.username}`}
          className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1 font-medium transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {isInvited ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Invited</span>
          </span>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onInvite(match)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Invite to Project
          </Button>
        )}
      </div>
    </div>
  );
}
