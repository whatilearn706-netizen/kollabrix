'use client';

import React, { useState } from 'react';
import { Hackathon } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight,
  Lock,
  Users,
  Zap,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { extractSponsoredMeta } from '@/lib/hackathons/sponsoredMeta';

interface HackathonCardProps {
  hackathon: Hackathon;
  isSaved?: boolean;
  isEnrolled?: boolean;
  onToggleSave?: (hackathonId: string) => void;
}

export function HackathonCard({
  hackathon,
  isSaved = false,
  isEnrolled = false,
  onToggleSave,
}: HackathonCardProps) {
  const { theme, isDark } = useSiteTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate days remaining until registration deadline
  const deadlineDate = new Date(hackathon.registration_deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isClosed = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 7;

  const sponsoredMeta = extractSponsoredMeta(hackathon);
  const isSponsored = sponsoredMeta.isSponsored;
  const themeStyle = sponsoredMeta.theme;
  const companyName = sponsoredMeta.companyName || hackathon.organizer;
  const recruitmentPerks = sponsoredMeta.recruitmentPerks;
  const hiringRoles = sponsoredMeta.hiringRoles;
  const hiringPackage = sponsoredMeta.hiringPackage;
  const tagline = sponsoredMeta.tagline;
  const logoUrl = sponsoredMeta.sponsorLogoUrl;
  const ctaText = sponsoredMeta.customCtaText || 'Apply & Compete';

  return (
    <div
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: !isSponsored ? theme.borderColor : undefined,
        borderRadius: theme.borderRadius,
      }}
      className={`site-card card-hover-lift border flex flex-col justify-between group relative overflow-hidden shadow-sm transition-all duration-300 ${
        isSponsored
          ? `${themeStyle.cardBorder} ${themeStyle.cardGlow} ring-1`
          : ''
      }`}
    >
      {/* Top glowing accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1.5 transition-opacity duration-300 pointer-events-none z-20 ${
          isSponsored
            ? 'opacity-100 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500'
            : 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 opacity-0 group-hover:opacity-100'
        }`}
      />

      {/* Card Header & Banner Section */}
      <div>
        {/* Banner with Floating Badges */}
        <div className="h-36 sm:h-40 overflow-hidden relative border-b border-slate-200/50 dark:border-white/10 bg-slate-950">
          {hackathon.banner_url ? (
            <img
              src={hackathon.banner_url}
              alt={hackathon.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/25 via-indigo-600/10 to-transparent" />
              <div className="flex items-center gap-2.5 z-10 opacity-80 group-hover:scale-105 transition-transform duration-300">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold tracking-widest text-amber-300/90 uppercase block">
                    {hackathon.mode} Sprint
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {companyName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dark Overlay Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

          {/* Floating Top Pill for Sponsored Challenges */}
          {isSponsored ? (
            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/20 text-white shadow-lg text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="truncate max-w-[150px]">{companyName} Partner</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/30 text-amber-200 border border-amber-400/50 backdrop-blur-md shadow-xs">
                ⭐ Priority #{sponsoredMeta.priorityRank}
              </span>
            </div>
          ) : (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-xs ${
                  hackathon.mode === 'Online'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : hackathon.mode === 'In-Person'
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    : 'bg-violet-950/80 text-violet-300 border-violet-500/40'
                }`}
              >
                {hackathon.mode}
              </span>
            </div>
          )}

          {/* Logo Badge on Banner Bottom Left for Sponsored */}
          {isSponsored && logoUrl && (
            <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white p-1 border border-white/40 shadow-xl flex items-center justify-center shrink-0">
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[11px] font-black text-white drop-shadow-md truncate max-w-[160px]">
                {companyName}
              </span>
            </div>
          )}

          {/* Bookmark Button (Top Right) */}
          <div className="absolute bottom-2 right-2.5 z-10">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(hackathon.id)}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                  isSaved
                    ? 'bg-amber-500/90 text-white shadow-md'
                    : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save Hackathon'}
              >
                {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          {/* Status Badges Row (Mode, Verified, Enrollment) */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isSponsored && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    hackathon.mode === 'Online'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : hackathon.mode === 'In-Person'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                  }`}
                >
                  {hackathon.mode}
                </span>
              )}

              {isEnrolled && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enrolled Teammate</span>
                </span>
              )}
            </div>

            {/* Deadline Countdown */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <Clock className="w-3 h-3 opacity-60" />
              {isClosed ? (
                <span className="text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                  Registration Closed
                </span>
              ) : isUrgent ? (
                <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 animate-pulse">
                  {diffDays === 0 ? 'Closes today!' : `${diffDays} days left to apply`}
                </span>
              ) : (
                <span style={{ color: theme.mutedTextColor }}>
                  {diffDays} days left to apply
                </span>
              )}
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-1">
            <Link href={`/hackathons/${hackathon.id}`}>
              <h3
                style={{ color: theme.headingColor }}
                className={`font-black text-base line-clamp-1 group-hover:${themeStyle.accentText} transition-colors tracking-tight`}
                title={hackathon.title}
              >
                {hackathon.title}
              </h3>
            </Link>

            {isSponsored && tagline ? (
              <p className="text-xs text-amber-200/80 font-medium line-clamp-2 leading-snug">
                {tagline}
              </p>
            ) : (
              <p
                style={{ color: theme.mutedTextColor }}
                className="text-xs line-clamp-1 font-medium"
              >
                Organized by <span style={{ color: theme.bodyTextColor }} className="font-semibold">{companyName}</span>
              </p>
            )}
          </div>

          {/* Key Details Grid */}
          <div
            style={{ color: theme.mutedTextColor }}
            className="grid grid-cols-2 gap-2 text-xs font-mono pt-1"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Calendar className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate">
                {new Date(hackathon.start_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
                {hackathon.end_date
                  ? ` – ${new Date(hackathon.end_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate">{hackathon.location || 'Online'}</span>
            </div>
          </div>

          {/* Prize Pool Highlight */}
          {hackathon.prize_pool && (
            <div
              style={{
                backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : '#fffbeb',
                borderColor: isDark ? 'rgba(245,158,11,0.25)' : '#fde68a',
              }}
              className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-black text-amber-500 dark:text-amber-300 truncate">
                  {hackathon.prize_pool}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 shrink-0">
                {hackathon.min_team_size}–{hackathon.max_team_size} per team
              </div>
            </div>
          )}

          {/* Hiring Track Spotlight for Sponsored Challenges */}
          {isSponsored && (hiringRoles || hiringPackage) && (
            <div className={`p-2 rounded-xl border ${themeStyle.chipBorder} ${themeStyle.chipBg} space-y-1`}>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                <Briefcase className="w-3 h-3 text-amber-400" />
                <span>Fast-Track Tech Hiring</span>
              </div>
              {hiringRoles && (
                <p className="text-[11px] font-semibold text-white/90 line-clamp-1">
                  🎯 {hiringRoles}
                </p>
              )}
              {hiringPackage && (
                <p className="text-[10px] font-mono text-amber-200/90 font-medium truncate">
                  💼 {hiringPackage}
                </p>
              )}
            </div>
          )}

          {/* Recruitment Perks Chips */}
          {isSponsored && recruitmentPerks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recruitmentPerks.slice(0, 2).map((perk, i) => (
                <span
                  key={i}
                  className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${themeStyle.badgeBorder} ${themeStyle.badgeBg} ${themeStyle.badgeText} truncate max-w-[220px]`}
                >
                  ✨ {perk}
                </span>
              ))}
            </div>
          )}

          {/* Expandable Description */}
          {isExpanded && (
            <div
              style={{ borderColor: theme.borderColor, color: theme.bodyTextColor }}
              className="pt-2 text-xs space-y-2 border-t animate-fadeIn leading-relaxed opacity-90"
            >
              <p>{hackathon.description}</p>
              <div style={{ color: theme.mutedTextColor }} className="text-[11px] space-y-1 font-mono pt-1">
                <div>
                  Registration Deadline:{' '}
                  <span style={{ color: theme.headingColor }} className="font-bold">
                    {new Date(hackathon.registration_deadline).toLocaleString()}
                  </span>
                </div>
                <div>
                  Event Period:{' '}
                  <span style={{ color: theme.headingColor }} className="font-bold">
                    {new Date(hackathon.start_date).toLocaleDateString()}
                    {hackathon.end_date ? ` — ${new Date(hackathon.end_date).toLocaleDateString()}` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls & CTA */}
      <div className="p-5 pt-0 border-t flex flex-col gap-2" style={{ borderColor: theme.borderColor }}>
        <div className="flex items-center gap-2 pt-3">
          {/* Main Action Button */}
          {isEnrolled ? (
            <Link href={`/hackathons/${hackathon.id}/workspace`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
                className="w-full justify-center text-white font-bold shadow-md"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Team Workspace
              </Button>
            </Link>
          ) : hackathon.join_code ? (
            <Link href={`/h/${hackathon.join_code}`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
                className="w-full justify-center text-white font-bold shadow-md"
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              >
                Enter Event
              </Button>
            </Link>
          ) : isClosed ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex-1 justify-center opacity-60 text-xs font-bold"
            >
              Registration Closed
            </Button>
          ) : (
            <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
              <button
                type="button"
                className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md group/btn ${
                  isSponsored
                    ? `bg-gradient-to-r ${themeStyle.buttonGradient} shadow-lg ring-1 ring-white/20`
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                <span>{isSponsored ? ctaText : 'Register Team'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </button>
            </Link>
          )}

          {/* Details toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ borderColor: theme.borderColor, color: theme.mutedTextColor }}
            className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all duration-150 shrink-0"
            title={isExpanded ? 'Show Less' : 'View Rules & Rubric'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
