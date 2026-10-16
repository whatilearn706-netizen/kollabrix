'use client';

import React from 'react';
import Link from 'next/link';
import { TeammateMatch } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import {
  Sparkles,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

interface TeammateCardProps {
  match: TeammateMatch;
  onInvite: (candidate: TeammateMatch) => void;
  isInvited?: boolean;
}

export function TeammateCard({ match, onInvite, isInvited = false }: TeammateCardProps) {
  const { theme, isDark } = useSiteTheme();
  const { profile, match_score, matching_skills, matching_roles, reasons } = match;

  const scoreBadgeColor =
    match_score >= 80
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : match_score >= 60
      ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
      : 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <div
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className="site-card border hover:border-slate-400 p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl group relative overflow-hidden"
    >
      <div className="space-y-4">
        {/* Header: Avatar, Info, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${profile.username}`} className="shrink-0">
              <Avatar
                name={profile.display_name}
                src={profile.avatar_url}
                size="lg"
                className="ring-2 ring-slate-100 group-hover:ring-slate-300 transition-all"
              />
            </Link>
            <div className="min-w-0">
              <Link
                href={`/profile/${profile.username}`}
                style={{ color: theme.headingColor }}
                className="font-black text-sm sm:text-base truncate block hover:opacity-80 transition-opacity"
              >
                {profile.display_name}
              </Link>
              <p style={{ color: theme.mutedTextColor }} className="text-xs font-mono font-bold truncate">
                @{profile.username}
              </p>
              {(profile.college || profile.course) && (
                <div style={{ color: theme.mutedTextColor }} className="flex items-center gap-1.5 text-[11px] mt-1 truncate">
                  <GraduationCap className="w-3.5 h-3.5 opacity-70 shrink-0" />
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
          <p
            style={{ color: theme.bodyTextColor }}
            className="text-xs line-clamp-2 leading-relaxed opacity-90"
          >
            {profile.bio}
          </p>
        )}

        {/* Why this match? (Explainability section) */}
        {reasons && reasons.length > 0 && (
          <div
            style={{
              backgroundColor: `${theme.brandColor}10`,
              borderColor: `${theme.brandColor}25`,
            }}
            className="p-3.5 rounded-2xl border space-y-1.5 text-xs"
          >
            <span
              style={{ color: theme.brandColor }}
              className="text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Why this recommendation:
            </span>
            <ul className="space-y-1">
              {reasons.map((r, idx) => (
                <li
                  key={idx}
                  style={{ color: theme.bodyTextColor }}
                  className="flex items-start gap-1.5 text-[11px] opacity-90"
                >
                  <span style={{ color: theme.brandColor }} className="font-bold mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Matching & Highlighted Skills */}
        <div className="space-y-1.5">
          <span style={{ color: theme.mutedTextColor }} className="text-[10px] uppercase font-mono tracking-wider block font-bold">
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
                    style={{
                      backgroundColor: isMatching
                        ? `${theme.accentColor}20`
                        : isDark
                        ? 'rgba(255,255,255,0.06)'
                        : '#f1f5f9',
                      borderColor: isMatching ? `${theme.accentColor}50` : theme.borderColor,
                      color: isMatching ? theme.accentColor : theme.bodyTextColor,
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold border transition-colors"
                  >
                    {skill}
                  </span>
                );
              })
            ) : (
              <span style={{ color: theme.mutedTextColor }} className="text-xs italic">
                No skills listed yet
              </span>
            )}
            {profile.skills && profile.skills.length > 6 && (
              <span style={{ color: theme.mutedTextColor }} className="text-[10px] self-center font-medium">
                +{profile.skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Preferred Roles */}
        {profile.preferred_roles && profile.preferred_roles.length > 0 && (
          <div className="space-y-1">
            <span style={{ color: theme.mutedTextColor }} className="text-[10px] uppercase font-mono tracking-wider block font-bold">
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
                    style={{
                      backgroundColor: isMatchingRole
                        ? `${theme.brandColor}15`
                        : isDark
                        ? 'rgba(255,255,255,0.04)'
                        : '#f8fafc',
                      borderColor: isMatchingRole ? `${theme.brandColor}40` : theme.borderColor,
                      color: isMatchingRole ? theme.brandColor : theme.bodyTextColor,
                    }}
                    className="text-[10px] px-2.5 py-0.5 rounded-full border font-medium"
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
      <div
        style={{ borderColor: theme.borderColor }}
        className="pt-4 mt-4 border-t flex items-center justify-between gap-2"
      >
        <Link
          href={`/profile/${profile.username}`}
          style={{ color: theme.bodyTextColor }}
          className="text-xs inline-flex items-center gap-1 font-bold transition-opacity hover:opacity-75"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {isInvited ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Invited</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onInvite(match)}
            style={{
              backgroundColor: theme.brandColor,
              borderRadius: theme.borderRadius,
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite to Project</span>
          </button>
        )}
      </div>
    </div>
  );
}
