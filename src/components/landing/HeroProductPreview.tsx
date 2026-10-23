'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import {
  Compass,
  Users,
  Kanban,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  ExternalLink,
  UserPlus,
  ShieldCheck,
  Code2,
  Clock,
  Layers,
} from 'lucide-react';

type PreviewTab = 'project' | 'teammate' | 'workspace';

export function HeroProductPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('project');
  const [hasInvited, setHasInvited] = useState(false);
  const [applied, setApplied] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Precision ambient background glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-emerald-500/10 blur-xl opacity-75 -z-10 pointer-events-none" />

      {/* Main Card Surface */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 shadow-xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-200">
        {/* Window Chrome & Interactive Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
              linkora.in/preview/{activeTab}
            </span>
          </div>

          {/* Tab Selector Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('project')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                activeTab === 'project'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Project Listing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teammate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                activeTab === 'teammate'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Teammate Match</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                activeTab === 'workspace'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Workspace</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: REAL PROJECT LISTING PREVIEW
           ========================================================================= */}
        {activeTab === 'project' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Project Header Banner */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Recruiting • 2 Slots Open
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Smart Mobility & Transit
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  EcoRoute AI • Campus Transit Optimizer
                </h4>
              </div>

              <div className="flex items-center -space-x-2 shrink-0">
                <Avatar name="Aarav Sharma" size="sm" />
                <Avatar name="Priya Narang" size="sm" />
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  +2
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Building a real-time shuttle tracker and carbon route optimizer using OpenStreetMap telemetry and GTFS feeds for university campuses.
            </p>

            {/* Open Roles Breakdown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-violet-600" />
                  Open Positions (Sprint 3)
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Target: Smart India Hackathon
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">FastAPI Engineer</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Open</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Telemetry pipeline & PostGIS database.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">Frontend / GIS Lead</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">Open</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Interactive route maps in Leaflet/React.
                  </p>
                </div>
              </div>
            </div>

            {/* Tags & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium">
                  React
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium">
                  FastAPI
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium">
                  PostgreSQL
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium">
                  Leaflet
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApplied(true)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    applied
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                  }`}
                >
                  {applied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Application Sent</span>
                    </>
                  ) : (
                    <>
                      <span>Apply to Squad</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span>All Projects</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TEAMMATE MATCH PREVIEW (WITH EXPLAINED SCORE)
           ========================================================================= */}
        {activeTab === 'teammate' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Match Algorithm Proof Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-mono font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>94% Complementary Match</span>
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Recommended Teammate
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                Skills (50%) + Role Vacancy (30%) + Verification (20%)
              </span>
            </div>

            {/* Candidate Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name="Kavya Patel" size="md" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      Kavya Patel
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      B.Tech Computer Science &bull; 3rd Year
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      State Engineering College &bull; 14 Verified Commits
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHasInvited(true)}
                  disabled={hasInvited}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    hasInvited
                      ? 'bg-emerald-500 text-white cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                  }`}
                >
                  {hasInvited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Invited to Squad</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite to Team</span>
                    </>
                  )}
                </button>
              </div>

              {/* Match Factors Breakdown */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 space-y-1.5 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Why Kavya matches your team:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                    Matches 3 open role skills: React, TypeScript, Leaflet
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                    Looking for hackathon squad for SIH 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>Filter by graduation year, university, or stack</span>
              <Link
                href="/teammates"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: COLLABORATION WORKSPACE & VERIFIED PROOF PREVIEW
           ========================================================================= */}
        {activeTab === 'workspace' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Workspace Sprint Status */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Kanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Sprint 3: Real-Time Telemetry & Routing
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                3 of 4 Deliverables Merged
              </span>
            </div>

            {/* Task Deliverables List */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                      Merged
                    </span>
                    <h6 className="font-bold text-slate-900 dark:text-white text-xs">
                      PostGIS GPS Telemetry Pipeline
                    </h6>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Spatial index optimized for 100+ university campus shuttle buses.
                  </p>
                </div>
                <Avatar name="Aarav Sharma" size="sm" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold">
                      In Review
                    </span>
                    <h6 className="font-bold text-slate-900 dark:text-white text-xs">
                      Leaflet Interactive Route Map UI
                    </h6>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Live bus pin animations and dynamic ETA display.
                  </p>
                </div>
                <Avatar name="Kavya Patel" size="sm" />
              </div>
            </div>

            {/* Cryptographic Deliverable Proof Callout */}
            <div className="p-3 rounded-xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Verified GitHub Deliverable</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-normal">
                      PR #18 Merged
                    </span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Signed proof reflected on student portfolios. Zero fake resume claims.
                  </p>
                </div>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center gap-1 text-xs font-bold text-violet-300 hover:text-white shrink-0 self-end sm:self-auto"
              >
                <span>View Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
