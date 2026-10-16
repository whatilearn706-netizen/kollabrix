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
} from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div
      style={{
        backgroundColor: theme.surfaceColor,
        borderColor: theme.borderColor,
        borderRadius: theme.borderRadius,
      }}
      className="site-card border hover:border-slate-400 p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl group relative overflow-hidden space-y-4"
    >
      {hackathon.banner_url && (
        <div className="-mx-6 -mt-6 mb-1 h-32 overflow-hidden relative border-b border-white/10">
          <img
            src={hackathon.banner_url}
            alt={hackathon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      )}

      <div className="space-y-3.5">
        {/* Header: Mode, Deadline & Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                hackathon.mode === 'Online'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : hackathon.mode === 'In-Person'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-violet-500/15 text-violet-400 border-violet-500/30'
              }`}
            >
              {hackathon.mode}
            </span>

            {isEnrolled ? (
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Enrolled Teammate
              </span>
            ) : hackathon.access_type === 'private' ? (
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30 inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Private College Event
              </span>
            ) : null}

            {isClosed ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-bold">
                Registration Closed
              </span>
            ) : isUrgent ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono font-bold animate-pulse">
                Ends in {diffDays} day{diffDays !== 1 ? 's' : ''}!
              </span>
            ) : (
              <span
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  borderColor: theme.borderColor,
                  color: theme.mutedTextColor,
                }}
                className="text-[10px] px-2 py-0.5 rounded border font-mono font-semibold"
              >
                {diffDays} days left to apply
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(hackathon.id)}
              style={{
                borderColor: theme.borderColor,
              }}
              className={`p-1.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Event'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Title & Organizer */}
        <div>
          <Link
            href={hackathon.access_type === 'private' ? `/h/${hackathon.join_code || hackathon.id}` : `/hackathons/${hackathon.id}`}
            className="group/title block focus:outline-none"
          >
            <h3
              style={{ color: theme.headingColor }}
              className="text-lg font-black transition-colors line-clamp-1 hover:opacity-80"
            >
              {hackathon.title}
            </h3>
          </Link>
          <p style={{ color: theme.mutedTextColor }} className="text-xs font-semibold mt-0.5">
            Organized by <span style={{ color: theme.headingColor }} className="font-bold">{hackathon.organizer}</span>
          </p>
        </div>

        {/* Essential Metrics: Dates, Location & Prize */}
        <div style={{ color: theme.mutedTextColor }} className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
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
            <MapPin className="w-3.5 h-3.5 opacity-70 shrink-0" />
            <span className="truncate">{hackathon.location}</span>
          </div>
        </div>

        {/* Prize Pool and Team Size Badges */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: theme.borderColor }}>
          {hackathon.prize_pool ? (
            <div className="flex items-center gap-1.5 text-xs font-black font-mono" style={{ color: theme.brandColor }}>
              <Trophy className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{hackathon.prize_pool}</span>
            </div>
          ) : (
            <div className="text-xs font-mono opacity-60">Verified Hackathon</div>
          )}

          <div
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              borderColor: theme.borderColor,
              color: theme.mutedTextColor,
            }}
            className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border"
          >
            <Users className="w-3 h-3 opacity-70" />
            <span>
              {hackathon.min_team_size}–{hackathon.max_team_size} per team
            </span>
          </div>
        </div>

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

      {/* Footer Controls */}
      <div className="pt-3 border-t flex flex-col gap-2" style={{ borderColor: theme.borderColor }}>
        <div className="flex items-center gap-2">
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
              Closed
            </Button>
          ) : (
            <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: theme.brandColor, borderRadius: theme.borderRadius }}
                className="w-full justify-center text-white font-bold shadow-md"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Register Team
              </Button>
            </Link>
          )}

          {/* Details toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ borderColor: theme.borderColor, color: theme.mutedTextColor }}
            className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Show Less' : 'View Rules & Rubric'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
