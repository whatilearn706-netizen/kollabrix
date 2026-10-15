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
    <div className="rounded-3xl bg-white border border-slate-200/90 hover:border-slate-400 p-6 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl group relative overflow-hidden space-y-4 text-slate-900">
      <div className="space-y-3.5">
        {/* Header: Mode, Deadline & Bookmark */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                hackathon.mode === 'Online'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : hackathon.mode === 'In-Person'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-violet-100 text-violet-800 border-violet-300'
              }`}
            >
              {hackathon.mode}
            </span>

            {isEnrolled ? (
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-300 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Enrolled Teammate
              </span>
            ) : hackathon.access_type === 'private' ? (
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300 inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                Private College Event
              </span>
            ) : null}

            {isClosed ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono font-bold">
                Registration Closed
              </span>
            ) : isUrgent ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono font-bold animate-pulse">
                Ends in {diffDays} day{diffDays !== 1 ? 's' : ''}!
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono font-semibold">
                {diffDays} days left to apply
              </span>
            )}
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={() => onToggleSave(hackathon.id)}
              className={`p-1.5 rounded-xl border transition-colors ${
                isSaved
                  ? 'bg-pink-100 text-pink-700 border-pink-300'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-800'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Hackathon'}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Title & Organizer */}
        <div>
          <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-amber-700 transition-colors tracking-tight line-clamp-1">
            {hackathon.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 truncate font-medium">
            <span>By {hackathon.organizer}</span>
            {hackathon.is_verified && (
              <span title="Verified Collegiate Opportunity" className="inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-600 shrink-0" />
              </span>
            )}
          </p>
        </div>

        {/* Prize & Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {hackathon.prize_pool && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-900 shadow-xs">
              <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Prizes</span>
                <span className="font-black font-mono text-sm truncate">{hackathon.prize_pool}</span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-violet-600 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">Event Date</span>
              <span className="font-bold truncate">
                {new Date(hackathon.start_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Eligibility */}
        <div className="space-y-1 text-xs text-slate-600 font-medium">
          {hackathon.location && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hackathon.location}</span>
            </div>
          )}
          {hackathon.eligibility && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate">
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
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/90"
              >
                {th}
              </span>
            ))}
            {hackathon.themes.length > 4 && (
              <span className="text-[10px] text-slate-500 self-center font-medium">
                +{hackathon.themes.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Expandable Description */}
        {isExpanded && (
          <div className="pt-2 text-xs text-slate-600 space-y-2 border-t border-slate-100 animate-fadeIn leading-relaxed">
            <p>{hackathon.description}</p>
            <div className="text-[11px] text-slate-500 space-y-1 font-mono pt-1">
              <div>
                Registration Deadline:{' '}
                <span className="text-slate-900 font-bold">
                  {new Date(hackathon.registration_deadline).toLocaleString()}
                </span>
              </div>
              <div>
                Event Period:{' '}
                <span className="text-slate-900 font-bold">
                  {new Date(hackathon.start_date).toLocaleDateString()}
                  {hackathon.end_date ? ` — ${new Date(hackathon.end_date).toLocaleDateString()}` : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Main Action Button */}
          {isEnrolled ? (
            <Link href={`/hackathons/${hackathon.id}/workspace`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-500/20"
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
                className="w-full justify-center bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold shadow-md shadow-orange-500/20"
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
              className="flex-1 justify-center opacity-60 text-xs font-bold border-slate-200"
            >
              Closed
            </Button>
          ) : (
            <Link href={`/hackathons/${hackathon.id}`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold shadow-md shadow-orange-500/20"
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
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
            title={isExpanded ? 'Show Less' : 'View Rules & Rubric'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
