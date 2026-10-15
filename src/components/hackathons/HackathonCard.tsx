'use client';

import React, { useState } from 'react';
import { Hackathon } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate days remaining until registration deadline
  const deadlineDate = new Date(hackathon.registration_deadline);
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isClosed = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 7;

  return (
    <div className="rounded-2xl bg-midnight-900/90 border border-midnight-750/70 p-5 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-card hover:shadow-card-hover group space-y-4">
      <div className="space-y-3.5">
        {/* Header: Mode, Deadline & Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                hackathon.mode === 'Online'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : hackathon.mode === 'In-Person'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {hackathon.mode}
            </span>

            {isEnrolled ? (
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Enrolled Teammate
              </span>
            ) : hackathon.access_type === 'private' ? (
              <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/30 inline-flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Private College Event
              </span>
            ) : null}

            {isClosed ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                Registration Closed
              </span>
            ) : isUrgent ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono animate-pulse">
                Ends in {diffDays} day{diffDays !== 1 ? 's' : ''}!
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-midnight-800 text-slate-400 border border-midnight-700 font-mono">
                {diffDays} days left to apply
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(hackathon.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-brand-500/20 text-brand-400 border-brand-500/40'
                  : 'bg-midnight-850 text-slate-400 border-midnight-750 hover:text-white'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Hackathon'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Title & Organizer */}
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors tracking-tight line-clamp-1">
            {hackathon.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
            <span>By {hackathon.organizer}</span>
            {hackathon.is_verified && (
              <span title="Verified Collegiate Opportunity" className="inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              </span>
            )}
          </p>
        </div>

        {/* Prize & Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {hackathon.prize_pool && (
            <div className="p-2.5 rounded-xl bg-midnight-850/80 border border-midnight-750/60 flex items-center gap-2 text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Prizes</span>
                <span className="font-semibold truncate">{hackathon.prize_pool}</span>
              </div>
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-midnight-850/80 border border-midnight-750/60 flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Event Date</span>
              <span className="font-medium truncate">
                {new Date(hackathon.start_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Eligibility */}
        <div className="space-y-1 text-xs text-slate-300">
          {hackathon.location && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
          )}
          {hackathon.eligibility && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hackathon.eligibility}</span>
            </div>
          )}
        </div>

        {/* Themes Chips */}
        {hackathon.themes && hackathon.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hackathon.themes.slice(0, 4).map((th) => (
              <span
                key={th}
                className="text-[10px] px-2 py-0.5 rounded-md bg-midnight-800 text-slate-300 border border-midnight-700"
              >
                {th}
              </span>
            ))}
            {hackathon.themes.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{hackathon.themes.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Expandable Description */}
        {isExpanded && (
          <div className="pt-2 text-xs text-slate-300 space-y-2 border-t border-midnight-800 animate-fadeIn leading-relaxed">
            <p>{hackathon.description}</p>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-1">
              <div>
                Registration Deadline:{' '}
                <span className="text-white">
                  {new Date(hackathon.registration_deadline).toLocaleString()}
                </span>
              </div>
              <div>
                Event Period:{' '}
                <span className="text-white">
                  {new Date(hackathon.start_date).toLocaleDateString()}
                  {hackathon.end_date ? ` — ${new Date(hackathon.end_date).toLocaleDateString()}` : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-midnight-800 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors font-medium"
        >
          <span>{isExpanded ? 'Less Details' : 'View Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isEnrolled ? (
          <Link
            href={`/hackathons/${hackathon.id}/workspace`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : hackathon.access_type === 'private' && hackathon.join_code ? (
          <Link
            href={`/h/${hackathon.join_code}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Join with Passcode</span>
          </Link>
        ) : hackathon.join_code ? (
          <Link
            href={`/h/${hackathon.join_code}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <span>Enter Hackathon</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <a
            href={hackathon.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
