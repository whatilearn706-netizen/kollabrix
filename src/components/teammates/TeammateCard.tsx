'use client';

import React from 'react';
import Link from 'next/link';
import { TeammateMatch } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { useSiteTheme, isColorDark } from '@/components/theme/SiteThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Sparkles,
  ExternalLink,
  UserPlus,
  CheckCircle2,
  GraduationCap,
  User,
} from 'lucide-react';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

interface TeammateCardProps {
  match: TeammateMatch;
  onInvite: (candidate: TeammateMatch) => void;
  isInvited?: boolean;
}

export function TeammateCard({ match, onInvite, isInvited = false }: TeammateCardProps) {
  const { theme, isDark } = useSiteTheme();
  const { user } = useAuth();
  const { profile, match_score, matching_skills, matching_roles, reasons } = match;

  const isCurrentUser = Boolean(user?.id && (profile.user_id === user.id || (profile as any).id === user.id));

  const isCardDark = isDark || isColorDark(theme.surfaceColor);
  const teammateNameColor = isCardDark ? '#ffffff' : (theme.headingColor || '#1C1917');
  const teammateUsernameColor = isCardDark ? '#94a3b8' : (theme.mutedTextColor || '#78716C');

  const scoreBadgeColor =
    match_score >= 80
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : match_score >= 60
      ? isCardDark
        ? 'bg-white/[0.08] text-zinc-200 border-white/20'
        : 'bg-stone-100 text-stone-700 border-stone-300'
      : isCardDark
      ? 'bg-white/[0.04] text-zinc-400 border-white/10'
      : 'bg-slate-500/15 text-slate-500 border-slate-500/30';

  return (
    <div
      style={{
        backgroundColor: isCardDark ? '#090C12' : theme.surfaceColor,
        borderColor: isCardDark ? 'rgba(255,255,255,0.1)' : theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className={`site-card card-hover-lift border p-5 sm:p-6 flex flex-col justify-between h-full group relative overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 ${
        isCardDark ? 'hover:border-white/25' : ''
      }`}
    >
      {/* Top brushed-titanium hairline shimmer on hover */}
      <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

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
                className="ring-2 ring-slate-100 dark:ring-white/10 group-hover:ring-white/30 group-hover:scale-105 transition-all duration-200"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${profile.username}`}
                  style={{ color: teammateNameColor }}
                  className={`font-black text-sm sm:text-base truncate block transition-colors duration-200 ${
                    isCardDark
                      ? 'text-white site-heading-white group-hover:text-zinc-200'
                      : 'group-hover:text-stone-700'
                  }`}
                >
                  {profile.display_name}
                </Link>
                {isCurrentUser && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/15 text-white border border-white/30">
                    You
                  </span>
                )}
              </div>
              <p style={{ color: teammateUsernameColor }} className="text-xs font-mono font-bold truncate">
                @{profile.username}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-full border flex items-center gap-1 font-mono tabular-nums tracking-tight shadow-2xs transition-transform duration-200 group-hover:scale-105 ${scoreBadgeColor}`}
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
            <GraduationCap className={`w-3.5 h-3.5 shrink-0 opacity-85 ${isCardDark ? 'text-zinc-300' : 'text-stone-600'}`} />
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
              No custom bio added yet.
            </span>
          )}
        </p>

        {/* Match Recommendation Highlight */}
        {reasons && reasons.length > 0 && (
          <div
            style={{
              backgroundColor: isCardDark ? 'rgba(255,255,255,0.035)' : '#f8fafc',
              borderColor: isCardDark ? 'rgba(255,255,255,0.1)' : theme.borderColor,
            }}
            className="px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles
                className={`w-3.5 h-3.5 shrink-0 ${
                  profile.college_verified
                    ? 'text-emerald-400'
                    : isCardDark
                    ? 'text-zinc-300'
                    : 'text-stone-600'
                }`}
              />
              <span
                style={{ color: isCardDark ? '#e4e4e7' : theme.bodyTextColor }}
                className="text-[11px] font-medium truncate"
              >
                {reasons[0]}
              </span>
            </div>
            {reasons.length > 1 && (
              <span
                className={`text-[10px] font-bold font-mono shrink-0 px-1.5 py-0.2 rounded-md ${
                  isCardDark
                    ? 'bg-white/10 text-zinc-200'
                    : 'bg-stone-200 text-stone-700'
                }`}
                title={reasons.slice(1).join(' • ')}
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
                        ? isCardDark
                          ? 'rgba(255,255,255,0.12)'
                          : '#e7e5e4'
                        : isCardDark
                        ? 'rgba(255,255,255,0.04)'
                        : '#f1f5f9',
                      borderColor: isMatching
                        ? isCardDark
                          ? 'rgba(255,255,255,0.28)'
                          : '#a8a29e'
                        : isCardDark
                        ? 'rgba(255,255,255,0.1)'
                        : theme.borderColor,
                      color: isMatching
                        ? isCardDark
                          ? '#ffffff'
                          : '#1c1917'
                        : isCardDark
                        ? '#d4d4d8'
                        : theme.bodyTextColor,
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
                        ? isCardDark
                          ? 'rgba(255,255,255,0.09)'
                          : '#e7e5e4'
                        : isCardDark
                        ? 'rgba(255,255,255,0.03)'
                        : '#f8fafc',
                      borderColor: isMatchingRole
                        ? isCardDark
                          ? 'rgba(255,255,255,0.22)'
                          : '#a8a29e'
                        : isCardDark
                        ? 'rgba(255,255,255,0.09)'
                        : theme.borderColor,
                      color: isMatchingRole
                        ? isCardDark
                          ? '#f4f4f5'
                          : '#1c1917'
                        : isCardDark
                        ? '#a1a1aa'
                        : theme.bodyTextColor,
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
        style={{ borderColor: isCardDark ? 'rgba(255,255,255,0.08)' : theme.borderColor }}
        className="pt-4 mt-4 border-t flex items-center justify-between gap-2"
      >
        <Link
          href={`/profile/${profile.username}`}
          style={{ color: isCardDark ? '#d4d4d8' : theme.bodyTextColor }}
          className="text-xs inline-flex items-center gap-1.5 font-bold transition-colors hover:text-white group/link"
        >
          <span>View Profile</span>
          <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform opacity-70" />
        </Link>

        {isCurrentUser ? (
          <Link
            href={`/profile/${profile.username}`}
            style={{
              backgroundColor: isCardDark ? 'rgba(255,255,255,0.08)' : '#f5f5f4',
              borderColor: isCardDark ? 'rgba(255,255,255,0.2)' : theme.borderColor,
              borderRadius: theme.borderRadius,
              color: isCardDark ? '#f4f4f5' : theme.headingColor,
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold border transition-all duration-150 hover:brightness-110 active:scale-95 shrink-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>Your Profile</span>
          </Link>
        ) : isInvited ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 select-none">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Invited</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onInvite(match)}
            style={{
              borderRadius: theme.borderRadius,
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold transition-all duration-150 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0 ${
              isCardDark
                ? 'bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-950 border border-white/50 shadow-[0_0_20px_rgba(255,255,255,0.18)] hover:from-white hover:to-white'
                : 'bg-stone-900 text-white border border-stone-800 hover:bg-stone-800 shadow-xs'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite to Project</span>
          </button>
        )}
      </div>
    </div>
  );
}
