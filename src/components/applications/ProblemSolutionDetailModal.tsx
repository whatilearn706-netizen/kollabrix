'use client';

import React, { useState } from 'react';
import { ProblemSolution } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { safeExternalUrl } from '@/lib/security/urlSanitizer';
import {
  X,
  FileCode2,
  Sparkles,
  Github,
  Globe,
  Video,
  Crown,
  Copy,
  Check,
  GraduationCap,
  Calendar,
  Users,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface ProblemSolutionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: ProblemSolution | null;
  problemTitle?: string;
  isAuthor?: boolean;
  onCrownWinner?: (solution: ProblemSolution) => void;
}

export function ProblemSolutionDetailModal({
  isOpen,
  onClose,
  solution,
  problemTitle,
  isAuthor = false,
  onCrownWinner,
}: ProblemSolutionDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !solution) return null;

  const handleCopyWriteup = () => {
    if (solution.solution_writeup && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(solution.solution_writeup);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleCrown = () => {
    if (onCrownWinner) {
      onCrownWinner(solution);
      onClose();
    }
  };

  const wordCount = solution.solution_writeup
    ? solution.solution_writeup.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-charcoal-900 border border-charcoal-700 rounded-3xl shadow-2xl p-5 sm:p-7 my-6 text-left space-y-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-charcoal-800 pb-4 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Deliverable Inspection</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {solution.title || 'Solution Deliverable'}
            </h2>
            {problemTitle && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                Challenge: <span className="text-slate-200 font-medium">{problemTitle}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors shrink-0"
            aria-label="Close Solution Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team & Submission Metadata Bar */}
        <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Avatar
              name={solution.author?.display_name || solution.team_name || 'Student'}
              src={solution.author?.avatar_url}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">
                  {solution.team_name || 'Student Squad'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                  Deliverable Applied
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Lead: <strong className="text-slate-200">{solution.author?.display_name || 'Student Lead'}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {solution.created_at ? new Date(solution.created_at).toLocaleDateString() : 'Recently'}
                </span>
              </p>
            </div>
          </div>

          {/* Quick External Links */}
          <div className="flex items-center gap-2 flex-wrap">
            {solution.repo_url && (
              <a
                href={safeExternalUrl(solution.repo_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-800 hover:bg-charcoal-750 text-slate-100 border border-charcoal-700 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Source Code</span>
                <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
              </a>
            )}
            {solution.demo_url && (
              <a
                href={safeExternalUrl(solution.demo_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Demo</span>
                <ExternalLink className="w-3 h-3 text-emerald-400/70 ml-0.5" />
              </a>
            )}
            {solution.video_url && (
              <a
                href={safeExternalUrl(solution.video_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-pink-400" />
                <span>Video Pitch</span>
                <ExternalLink className="w-3 h-3 text-pink-400/70 ml-0.5" />
              </a>
            )}
          </div>
        </div>

        {/* Scrollable Detailed Answer Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[11px] text-slate-300 flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Full Technical Write-up &amp; Architecture</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-400">
                {wordCount} words
              </span>
              <button
                onClick={handleCopyWriteup}
                className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Write-up</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-xs sm:text-sm text-slate-100 leading-relaxed font-mono whitespace-pre-wrap select-text">
            {solution.solution_writeup || 'No write-up provided.'}
          </div>

          {/* Mentor Feedback (if present) */}
          {solution.mentor_feedback && (
            <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-300 text-xs">
                <GraduationCap className="w-4 h-4" />
                <span>Supervising Faculty Evaluation Remarks:</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-purple-400/40">
                {solution.mentor_feedback}
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-charcoal-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Academic Integrity Verified • Submitted Deliverable</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthor && onCrownWinner && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-bold text-xs"
                leftIcon={<Crown className="w-4 h-4 text-amber-400" />}
                onClick={handleCrown}
              >
                Crown this Solution as Winner
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-charcoal-700 text-slate-300 hover:text-white hover:bg-charcoal-800 text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
