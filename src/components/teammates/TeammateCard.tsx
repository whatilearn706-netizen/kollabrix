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
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : match_score >= 60
      ? 'bg-pink-100 text-pink-800 border-pink-300'
      : 'bg-violet-100 text-violet-800 border-violet-300';

  return (
    <div className="rounded-3xl bg-white border-2 border-slate-100 hover:border-pink-300 p-6 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 group relative overflow-hidden text-slate-900">
      {/* Top Colorful Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

      <div className="space-y-4 pt-1">
        {/* Header: Avatar, Info, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${profile.username}`} className="shrink-0">
              <Avatar
                name={profile.display_name}
                src={profile.avatar_url}
                size="lg"
                className="ring-2 ring-pink-100 group-hover:ring-pink-300 transition-all"
              />
            </Link>
            <div className="min-w-0">
              <Link
                href={`/profile/${profile.username}`}
                className="font-black text-sm sm:text-base text-slate-900 group-hover:text-pink-600 transition-colors truncate block"
              >
                {profile.display_name}
              </Link>
              <p className="text-xs text-pink-600 font-mono font-bold truncate">@{profile.username}</p>
              {(profile.college || profile.course) && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 truncate">
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
              className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 font-mono shadow-xs ${scoreBadgeColor}`}
            >
              <Sparkles className="w-3 h-3 text-current" />
              <span>{match_score}% Match</span>
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Why this match? (Explainability section) */}
        {reasons && reasons.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-1.5 text-xs text-slate-700">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fuchsia-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-fuchsia-500" />
              Why this recommendation:
            </span>
            <ul className="space-y-1">
              {reasons.map((r, idx) => (
                <li key={idx} className="text-slate-600 flex items-start gap-1.5 text-[11px]">
                  <span className="text-pink-500 font-bold mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Matching & Highlighted Skills */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
            Skills &amp; Stack:
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
                    className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold border transition-colors ${
                      isMatching
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
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
              <span className="text-[10px] text-slate-500 self-center font-medium">
                +{profile.skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Preferred Roles */}
        {profile.preferred_roles && profile.preferred_roles.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
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
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border ${
                      isMatchingRole
                        ? 'bg-violet-100 text-violet-800 border-violet-200 font-bold'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
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
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/profile/${profile.username}`}
          className="text-xs text-slate-700 hover:text-pink-600 inline-flex items-center gap-1 font-bold transition-colors"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {isInvited ? (
          <span className="text-xs text-emerald-800 flex items-center gap-1 font-bold bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Invited</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onInvite(match)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-md shadow-pink-500/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite to Project</span>
          </button>
        )}
      </div>
    </div>
  );
}
