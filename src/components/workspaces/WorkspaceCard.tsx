'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Trophy,
  GraduationCap,
  Layers,
  Users,
  LayoutDashboard,
  ExternalLink,
  ArrowRight,
  Clock,
  CheckCircle2,
  Copy,
  Inbox,
  ShieldCheck,
} from 'lucide-react';
import { WorkspaceOriginInfo } from '@/lib/workspaces/workspaceOrigin';

export interface EnrichedWorkspaceItem {
  id: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  category: string;
  status: string;
  current_team_size: number;
  desired_team_size: number;
  created_at: string;
  isOwner: boolean;
  userRole?: string;
  invite_code?: string | null;
  members?: Array<{ user_id: string; display_name: string; avatar_url?: string | null }>;
  origin: WorkspaceOriginInfo;
}

interface WorkspaceCardProps {
  item: EnrichedWorkspaceItem;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
  isArchiveView?: boolean;
}

/**
 * Strips technical JSON/markdown metadata tags from summary or description for clean card preview.
 */
function cleanPreviewText(text?: string | null, fallback = 'Collegiate Workspace'): string {
  if (!text) return fallback;
  let clean = text.replace(/<!--[\s\S]*?-->/g, '');
  clean = clean.replace(/###\s*[A-Za-z0-9\s&—_-]+/g, '');
  clean = clean.replace(/This team is directly tackling:\s*\*\*.*?\*\*/g, '');
  clean = clean.replace(/This workspace belongs to:[\s\S]*?\./g, '');
  clean = clean.replace(/Hackathon Team Sprint:\s*.*?—/g, '');
  clean = clean.replace(/[*_#`]/g, '');
  clean = clean.trim();
  return clean || fallback;
}

export function WorkspaceCard({
  item,
  copiedCode,
  onCopyCode,
  isArchiveView = false,
}: WorkspaceCardProps) {
  const { origin } = item;
  const isHackathon = origin.originType === 'hackathon';
  const isFacultyProblem = origin.originType === 'faculty_problem';
  const isPermanent = origin.originType === 'permanent';

  // Accent styles by origin
  const cardBorderClass = isHackathon
    ? origin.isResultsAnnounced
      ? 'border-amber-500/30 hover:border-amber-400/60'
      : 'border-amber-500/40 hover:border-amber-400'
    : isFacultyProblem
    ? origin.isResultsAnnounced
      ? 'border-purple-500/30 hover:border-purple-400/60'
      : 'border-purple-500/40 hover:border-purple-400'
    : 'border-charcoal-750/80 hover:border-charcoal-700';

  const accentStripClass = isHackathon
    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500'
    : isFacultyProblem
    ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500'
    : 'bg-gradient-to-r from-brand-500 via-emerald-500 to-brand-500';

  const previewDescription = cleanPreviewText(item.summary || item.description, item.title);

  return (
    <div
      className={`rounded-2xl bg-charcoal-900 border ${cardBorderClass} p-6 flex flex-col justify-between space-y-5 transition-all shadow-subtle relative overflow-hidden`}
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 inset-x-0 h-1 ${accentStripClass}`} />

      <div className="space-y-4">
        {/* Top Badges Bar: Provenance & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Provenance Origin Badge */}
          {isHackathon && (
            <span
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5 max-w-[280px] sm:max-w-xs truncate"
              title={origin.originTitle}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Hackathon: {origin.originTitle}</span>
            </span>
          )}

          {isFacultyProblem && (
            <span
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1.5 max-w-[280px] sm:max-w-xs truncate"
              title={origin.originTitle}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Faculty: {origin.originTitle}</span>
            </span>
          )}

          {isPermanent && (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Permanent Project</span>
            </span>
          )}

          {/* Right Status Pill */}
          <div className="flex items-center gap-1.5">
            {origin.isResultsAnnounced ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Results Announced</span>
              </span>
            ) : isHackathon ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Active Sprint</span>
                {origin.timeRemaining && (
                  <span className="text-amber-200/80 hidden sm:inline">• {origin.timeRemaining}</span>
                )}
              </span>
            ) : isFacultyProblem ? (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>Active Challenge</span>
              </span>
            ) : (
              <Badge variant="category">{item.category}</Badge>
            )}
          </div>
        </div>

        {/* Origin Organizer / Host Line */}
        {origin.originOrganizer && (
          <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-500">
              {isHackathon ? 'Host / Organizer:' : isFacultyProblem ? 'Faculty Mentor:' : 'Affiliation:'}
            </span>
            <strong className="text-slate-300 font-semibold truncate">{origin.originOrganizer}</strong>
          </div>
        )}

        {/* Title & Preview */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={origin.originWorkspaceLink}
              className="text-lg font-bold text-white hover:text-brand-300 transition-colors"
            >
              {item.title}
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 border border-charcoal-700 font-mono font-medium">
              {item.userRole || (item.isOwner ? 'Team Lead' : 'Contributor')}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {previewDescription}
          </p>
        </div>

        {/* Team Teammates Roster & Invite Code */}
        <div className="p-3 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-400" />
              <span>
                Squad Roster ({item.members?.length || item.current_team_size || 1} / {item.desired_team_size || 4} Builders)
              </span>
            </span>

            {item.invite_code && (
              <button
                type="button"
                onClick={() => onCopyCode(item.invite_code!)}
                className="text-[11px] font-mono text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                title="Click to copy squad invite code"
              >
                <span>Code: {item.invite_code}</span>
                <Copy className="w-3 h-3" />
                {copiedCode === item.invite_code && (
                  <span className="text-emerald-400 font-bold">Copied!</span>
                )}
              </button>
            )}
          </div>

          {item.members && item.members.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {item.members.map((m, mIdx) => (
                <span
                  key={m.user_id || mIdx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-charcoal-850 border border-charcoal-750 text-slate-300 font-medium"
                >
                  {m.display_name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href={origin.originWorkspaceLink}>
            <Button
              variant="primary"
              size="sm"
              className={
                isHackathon
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-sm'
                  : isFacultyProblem
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold shadow-sm'
                  : 'bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-sm'
              }
              leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
            >
              {origin.isResultsAnnounced ? 'Workspace (Archive)' : 'Open Workspace'}
            </Button>
          </Link>

          {isPermanent && item.isOwner && (
            <Link href={`/projects/${item.id}/applications`}>
              <Button variant="outline" size="sm" leftIcon={<Inbox className="w-3.5 h-3.5 text-brand-400" />}>
                Applications
              </Button>
            </Link>
          )}
        </div>

        {/* Provenance Link: Jump to Event Arena or Problem Statement */}
        <Link href={origin.originLink}>
          <Button
            variant="outline"
            size="sm"
            className={
              isHackathon
                ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-xs'
                : isFacultyProblem
                ? 'border-purple-500/40 text-purple-300 hover:bg-purple-500/10 font-bold text-xs'
                : 'border-charcoal-700 text-slate-300 hover:text-white font-medium text-xs'
            }
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {isHackathon
              ? origin.isResultsAnnounced
                ? 'View Results & Leaderboard'
                : 'Hackathon Arena'
              : isFacultyProblem
              ? 'Problem Details'
              : 'Project Details'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
