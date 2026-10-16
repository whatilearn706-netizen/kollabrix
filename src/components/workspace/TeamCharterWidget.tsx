'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectMember, Profile } from '@/types/database';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  FileSignature,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface TeamCharterWidgetProps {
  project: Project;
  members: ProjectMember[];
  currentUserId?: string;
}

export function TeamCharterWidget({
  project,
  members,
  currentUserId,
}: TeamCharterWidgetProps) {
  const [signatures, setSignatures] = useState<Record<string, string>>(() => {
    // Initialize owner as signed
    const initial: Record<string, string> = {};
    if (project.owner_id) {
      initial[project.owner_id] = new Date(project.created_at).toLocaleDateString();
    }
    return initial;
  });

  const [hasSigned, setHasSigned] = useState(false);

  // Sync signature state from local storage or defaults
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`linkora_charter_${project.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSignatures((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore
        }
      }
    }
  }, [project.id]);

  useEffect(() => {
    if (currentUserId && signatures[currentUserId]) {
      setHasSigned(true);
    }
  }, [currentUserId, signatures]);

  const handleSignCharter = () => {
    if (!currentUserId) return;
    const nowStr = new Date().toLocaleDateString();
    const updated = {
      ...signatures,
      [currentUserId]: nowStr,
    };
    setSignatures(updated);
    setHasSigned(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_charter_${project.id}`, JSON.stringify(updated));
    }
  };

  const signedCount = Object.keys(signatures).length;
  const totalCount = Math.max(members.length, 1);
  const isFullySigned = signedCount >= totalCount;

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Squad Accountability Charter
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isFullySigned
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {signedCount}/{totalCount} Signed
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Clear commitments and anti-ghosting policies agreed by all squad teammates.
            </p>
          </div>
        </div>

        {!hasSigned && currentUserId && (
          <button
            onClick={handleSignCharter}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all active:scale-[0.98] shrink-0"
          >
            <FileSignature className="w-4 h-4 text-amber-400" />
            <span>Sign Team Charter</span>
          </button>
        )}
      </div>

      {/* 4 Core Squad Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Rule 1 */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>1. 6–8 Hours Weekly Commitment</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Every squad member commits 6–8 dedicated development/design hours per sprint.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>2. 48-Hour Communication SLA</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Respond to pull requests, blocker tags, and team pings within 48 hours.
          </p>
        </div>

        {/* Rule 3: Anti Ghosting */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
          <div className="flex items-center gap-2 font-black text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>3. 7-Day Inactivity Task Release</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Inactive for 7 days without notice? Claimed tasks automatically unlock for others.
          </p>
        </div>

        {/* Rule 4 */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1">
          <div className="flex items-center gap-2 font-black text-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>4. Mandatory Peer Code Review</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            No milestone marks complete without at least one peer approval on the PR.
          </p>
        </div>
      </div>

      {/* Member Signatures List */}
      <div className="space-y-2.5 pt-1">
        <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
          Squad Signatures ({signedCount} of {totalCount})
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Owner signature */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="truncate pr-2">
              <span className="font-bold text-slate-900 block truncate">
                {project.owner?.display_name || 'Project Founder'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Project Founder
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold shrink-0">
              ✓ Signed
            </span>
          </div>

          {/* Members signatures */}
          {members.map((m) => {
            const isSigned = Boolean(signatures[m.user_id]);
            const signDate = signatures[m.user_id];
            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isSigned
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-dashed border-slate-300'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="font-bold text-slate-900 block truncate">
                    {m.profile?.display_name || 'Squad Member'}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {m.role || 'Contributor'}
                  </span>
                </div>
                {isSigned ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold shrink-0">
                    ✓ {signDate || 'Signed'}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium shrink-0">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
