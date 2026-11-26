'use client';

import React, { useState } from 'react';
import { Hackathon } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { useSiteTheme, isColorDark } from '@/components/theme/SiteThemeProvider';
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
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { extractSponsoredMeta } from '@/lib/hackathons/sponsoredMeta';
import { getHackathonTimelineEndDate } from '@/lib/hackathons/hackathonStatus';

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

  const isPast =
    hackathon.status === 'Archived' ||
    (hackathon.status as string) === 'Ended' ||
    (hackathon.status as string) === 'Completed' ||
    Boolean(hackathon.results_published) ||
    Boolean(
      hackathon.results_date &&
      !isNaN(new Date(hackathon.results_date).getTime()) &&
      now.getTime() >= new Date(hackathon.results_date).getTime()
    );

  const sponsoredMeta = extractSponsoredMeta(hackathon);
  const isSponsored = sponsoredMeta.isSponsored;
  const themeStyle = sponsoredMeta.theme;
  const companyName = sponsoredMeta.companyName || hackathon.organizer;
  const recruitmentPerks = sponsoredMeta.recruitmentPerks;
  const hiringRoles = sponsoredMeta.hiringRoles;
  const hiringPackage = sponsoredMeta.hiringPackage;
  const tagline = sponsoredMeta.tagline;
  const logoUrl = sponsoredMeta.sponsorLogoUrl || hackathon.logo_url || hackathon.company_logo;
  const cardBanner = hackathon.banner_url || sponsoredMeta.bannerUrl;
  const ctaText = sponsoredMeta.customCtaText || 'Apply & Compete';
  const externalRegUrl =
    (hackathon as any).registration_url ||
    (hackathon as any).external_registration_url ||
    sponsoredMeta.registrationUrl ||
    sponsoredMeta.externalRegistrationUrl ||
    ((hackathon as any).is_external_registration && hackathon.website_url && !hackathon.website_url.includes('/h/') ? hackathon.website_url : null);

  const isCardDark = isDark || isColorDark(theme.surfaceColor);

  return (
    <div
      style={{
        backgroundColor: isCardDark ? '#090C12' : theme.surfaceColor,
        borderColor: !isSponsored ? (isCardDark ? 'rgba(255,255,255,0.1)' : theme.borderColor) : 'rgba(255,255,255,0.22)',
        borderRadius: theme.borderRadius,
      }}
      className={`site-card card-hover-lift border flex flex-col justify-between group relative overflow-hidden shadow-sm hover:border-white/25 transition-all duration-300`}
    >
      {/* Top brushed silver shimmer bar */}
      <div
        className={`absolute inset-x-0 top-0 h-[1.5px] transition-opacity duration-300 pointer-events-none z-20 bg-gradient-to-r from-zinc-600 via-white/90 to-zinc-600 ${
          isSponsored ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      />

      {/* Card Header & Banner Section */}
      <div>
        {/* Banner with Floating Badges */}
        <div className="h-36 sm:h-40 overflow-hidden relative border-b border-white/10 bg-[#05070b]">
          <Link href={`/hackathons/${hackathon.id}`} className="block w-full h-full cursor-pointer">
            {cardBanner ? (
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
                <img
                  src={cardBanner}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-110 pointer-events-none"
                  aria-hidden="true"
                />
                <img
                  src={cardBanner}
                  alt={hackathon.title}
                  className="w-full h-full object-contain object-center relative z-10 group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0e131d] via-[#090C12] to-black flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-zinc-700/5 to-transparent" />
                <div className="flex items-center gap-2.5 z-10 opacity-85 group-hover:scale-105 transition-transform duration-300">
                  <div className="p-2 rounded-xl bg-white/[0.08] border border-white/15 text-zinc-200 shadow-sm">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-200 uppercase block">
                      {hackathon.mode} Sprint
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {companyName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Link>

          {/* Dark Overlay Gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/30 pointer-events-none" />

          {/* Floating Top Pill for Sponsored Challenges */}
          {isSponsored ? (
            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-lg text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <Zap className="w-3 h-3 text-zinc-200 fill-zinc-200" />
                <span className="truncate max-w-[150px]">{companyName} Partner</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/15 text-zinc-100 border border-white/25 backdrop-blur-md shadow-xs">
                Priority #{sponsoredMeta.priorityRank}
              </span>
            </div>
          ) : (
            <div className="absolute top-2.5 left-2.5 z-10">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-xs ${
                  hackathon.mode === 'Online'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#090C12]/85 text-zinc-200 border-white/20'
                }`}
              >
                {hackathon.mode}
              </span>
            </div>
          )}

          {/* Logo Badge on Banner Bottom Left */}
          {logoUrl && (
            <div className="absolute bottom-2 left-3 z-10 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white p-1 border border-white/40 shadow-xl flex items-center justify-center shrink-0">
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
                    ? 'bg-white text-zinc-950 shadow-md'
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
                      : 'bg-white/[0.06] text-zinc-200 border-white/15'
                  }`}
                >
                  {hackathon.mode}
                </span>
              )}

              {isEnrolled && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enrolled Teammate</span>
                </span>
              )}
            </div>

            {/* Deadline Countdown / Concluded State */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <Clock className="w-3 h-3 opacity-60" />
              {isPast ? (
                <span className="text-zinc-200 font-bold bg-white/[0.08] px-2 py-0.5 rounded border border-white/20 flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5 text-zinc-200" />
                  Concluded • Results Declared
                </span>
              ) : isClosed ? (
                <span className="text-zinc-400 font-bold bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/10">
                  Registration Closed
                </span>
              ) : isUrgent ? (
                <span className="text-zinc-100 font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/25">
                  {diffDays === 0 ? 'Closes today!' : diffDays === 1 ? '1 day left to apply' : `${diffDays} days left to apply`}
                </span>
              ) : (
                <span style={{ color: isCardDark ? '#a1a1aa' : theme.mutedTextColor }}>
                  {diffDays === 1 ? '1 day left to apply' : `${diffDays} days left to apply`}
                </span>
              )}
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-1">
            <Link href={`/hackathons/${hackathon.id}`}>
              <h3
                style={{ color: isCardDark ? '#ffffff' : theme.headingColor }}
                className="font-black text-base line-clamp-1 group-hover:text-zinc-200 transition-colors tracking-tight"
                title={hackathon.title}
              >
                {hackathon.title}
              </h3>
            </Link>

            {isSponsored && tagline ? (
              <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-snug">
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
                {(() => {
                  const finalDate = getHackathonTimelineEndDate(hackathon);
                  return finalDate
                    ? ` – ${new Date(finalDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : '';
                })()}
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
                    {(() => {
                      const finalDate = getHackathonTimelineEndDate(hackathon);
                      return finalDate ? ` — ${new Date(finalDate).toLocaleDateString()}` : '';
                    })()}
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
                className="w-full justify-center bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/60 font-bold shadow-md cursor-pointer"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Team Workspace
              </Button>
            </Link>
          ) : isClosed ? (
            <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center opacity-80 border-white/15 text-zinc-200 hover:bg-white/[0.06] text-xs font-bold cursor-pointer"
              >
                View Event Details
              </Button>
            </Link>
          ) : externalRegUrl ? (
            <Link href={`/hackathons/${hackathon.id}`} className="flex-1 block">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md group/btn cursor-pointer bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/60"
              >
                <span>{sponsoredMeta.customCtaText || 'Register on Unstop'}</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
              </button>
            </Link>
          ) : (
            <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md group/btn cursor-pointer bg-gradient-to-b from-white to-zinc-200 hover:from-white hover:to-white text-zinc-950 border border-white/60"
              >
                {hackathon.access_type === 'private' ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Enter Event</span>
                  </>
                ) : isSponsored ? (
                  <>
                    <span>{ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </>
                ) : (
                  <>
                    <span>Register Team</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
