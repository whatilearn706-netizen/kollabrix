'use client';

import React from 'react';
import Link from 'next/link';
import { TeammateMatch } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { useSiteTheme, isColorDark } from '@/components/theme/SiteThemeProvider';
import {
  Sparkles,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

interface TeammateCardProps {
  match: TeammateMatch;
  onInvite: (candidate: TeammateMatch) => void;
  isInvited?: boolean;
}

export function TeammateCard({ match, onInvite, isInvited = false }: TeammateCardProps) {
  const { theme, isDark } = useSiteTheme();
  const { profile, match_score, matching_skills, matching_roles, reasons } = match;

  const isCardDark = isDark || isColorDark(theme.surfaceColor);
  const teammateNameColor = isCardDark ? '#ffffff' : (theme.headingColor || '#0f172a');
  const teammateUsernameColor = isCardDark ? '#94a3b8' : (theme.mutedTextColor || '#64748b');

  const scoreBadgeColor =
    match_score >= 80
      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
      : match_score >= 60
      ? 'bg-violet-500/15 text-violet-500 border-violet-500/30'
      : 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <div
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className="site-card card-hover-lift border p-5 sm:p-6 flex flex-col justify-between h-full group relative overflow-hidden shadow-xs hover:shadow-md transition-all duration-200"
    >
      {/* Top glowing accent gradient bar on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      {/* Main Body */}
      <div className="flex-1 flex flex-col space-y-3.5">
        {/* Header: Avatar, Info, Match Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href={`/profile/${profile.username}`} className="shrink-0">
              <Avatar
                name={profile.display_name}
                src={profile.avatar_url}
                size="lg"
                className="ring-2 ring-slate-100 dark:ring-white/10 group-hover:ring-violet-400 group-hover:scale-105 transition-all duration-200"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${profile.username}`}
                style={{ color: teammateNameColor }}
                className={`font-black text-sm sm:text-base truncate block transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 ${
                  isCardDark ? 'text-white site-heading-white' : ''
                }`}
                title={profile.display_name}
              >
                {profile.display_name}
              </Link>
              <p style={{ color: teammateUsernameColor }} className="text-xs font-mono font-bold truncate">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-full border flex items-center gap-1 font-mono shadow-2xs transition-transform duration-200 group-hover:scale-105 ${scoreBadgeColor}`}
            >
              <Sparkles className="w-3 h-3 text-current" />
              <span>{match_score}% Match</span>
            </span>
          </div>
        </div>

        {/* Education & Campus Affiliation Row */}
        {(profile.college || profile.course) && (
          <div
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
              borderColor: theme.borderColor,
            }}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border min-w-0"
          >
            <GraduationCap className="w-3.5 h-3.5 text-violet-500 shrink-0 opacity-80" />
            <span
              style={{ color: theme.bodyTextColor }}
              className="truncate font-medium text-[11px] sm:text-xs flex-1 min-w-0"
              title={`${profile.course ? `${profile.course} • ` : ''}${profile.college || ''}`}
            >
              {profile.course ? `${profile.course} • ` : ''}
              {profile.college || 'Campus Builder'}
            </span>
            {profile.college && (
              <VerifiedCollegeBadge
                college={profile.college}
                isVerified={profile.college_verified}
                userId={profile.user_id}
                username={profile.username}
                badgeOnly={true}
                showUnverified={false}
              />
            )}
          </div>
        )}

        {/* Bio (Fixed 2-line height for visual symmetry) */}
        <p
          style={{ color: theme.bodyTextColor }}
          className="text-xs line-clamp-2 min-h-[2.5rem] leading-relaxed opacity-90"
        >
          {profile.bio || (
            <span className="italic opacity-60">
              Active campus builder open to innovative projects and hackathons.
            </span>
          )}
        </p>

        {/* Match Recommendation Highlight */}
        {reasons && reasons.length > 0 && (
          <div
            style={{
              backgroundColor: `${theme.brandColor}12`,
              borderColor: `${theme.brandColor}25`,
            }}
            className="px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs"
            title={reasons.join(' • ')}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles
                style={{ color: theme.brandColor }}
                className="w-3.5 h-3.5 shrink-0"
              />
              <span
                style={{ color: theme.bodyTextColor }}
                className="text-[11px] font-medium truncate"
              >
                {reasons[0]}
              </span>
            </div>
            {reasons.length > 1 && (
              <span
                style={{ color: theme.brandColor }}
                className="text-[10px] font-bold font-mono shrink-0 px-1.5 py-0.2 rounded-md bg-white/60 dark:bg-black/20"
              >
                +{reasons.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Matching & Highlighted Skills */}
        <div className="space-y-1.5">
          <div
            style={{ color: theme.mutedTextColor }}
            className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider font-bold"
          >
            <span>Skills &amp; Tech Stack</span>
            {profile.skills && profile.skills.length > 4 && (
              <span className="text-[10px] font-sans lowercase opacity-75">
                +{profile.skills.length - 4} more
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[1.75rem] items-center">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.slice(0, 4).map((skill) => {
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
                    className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold border transition-all duration-150 hover:scale-105 cursor-default"
                  >
                    {skill}
                  </span>
                );
              })
            ) : (
              <span style={{ color: theme.mutedTextColor }} className="text-[11px] italic">
                Exploring new technologies
              </span>
            )}
          </div>
        </div>

        {/* Preferred Roles */}
        <div className="space-y-1.5">
          <div
            style={{ color: theme.mutedTextColor }}
            className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider font-bold"
          >
            <span>Preferred Roles</span>
            {profile.preferred_roles && profile.preferred_roles.length > 3 && (
              <span className="text-[10px] font-sans lowercase opacity-75">
                +{profile.preferred_roles.length - 3} more
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[1.75rem] items-center">
            {profile.preferred_roles && profile.preferred_roles.length > 0 ? (
              profile.preferred_roles.slice(0, 3).map((role) => {
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
              })
            ) : (
              <span style={{ color: theme.mutedTextColor }} className="text-[10px] italic">
                Open to any project role
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer (Always pinned to bottom) */}
      <div
        style={{ borderColor: theme.borderColor }}
        className="pt-4 mt-4 border-t flex items-center justify-between gap-2"
      >
        <Link
          href={`/profile/${profile.username}`}
          style={{ color: theme.bodyTextColor }}
          className="text-xs inline-flex items-center gap-1.5 font-bold transition-opacity hover:opacity-75 group/link"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform opacity-70" />
        </Link>

        {isInvited ? (
          <span className="text-xs text-emerald-500 flex items-center gap-1.5 font-bold bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 select-none">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all duration-150 hover:brightness-110 hover:shadow-md active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite to Project</span>
          </button>
        )}
      </div>
    </div>
  );
}
