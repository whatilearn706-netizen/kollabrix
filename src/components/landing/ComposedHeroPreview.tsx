'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Github,
  Globe,
  ExternalLink,
  Kanban,
  UserPlus,
  GitPullRequest,
  Clock,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export function ComposedHeroPreview() {
  const [activeTab, setActiveTab] = useState<'matching' | 'kanban' | 'evidence'>('matching');
  const [invited, setInvited] = useState(false);

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
      {/* Precision Ambient Violet/Indigo Glow */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-brand-500/10 blur-2xl opacity-70 -z-10 pointer-events-none" />

      {/* Main Preview Container */}
      <div className="rounded-2xl bg-midnight-900/95 border border-charcoal-750/90 shadow-card p-5 sm:p-6 backdrop-blur-xl">
        {/* Terminal Header & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-charcoal-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-[11px] font-mono text-slate-400 font-medium">
              teamforge.workspace/live
            </span>
          </div>

          {/* Interactive Mode Pills */}
          <div className="flex items-center gap-1 bg-charcoal-950 p-1 rounded-xl border border-charcoal-800 text-[11px]">
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'matching'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Smart Matching
            </button>
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sprint Board
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'evidence'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified Proof
            </button>
          </div>
        </div>

        {/* Tab 1: Smart Teammate Matching */}
        {activeTab === 'matching' && (
          <div className="space-y-4 rounded-xl bg-charcoal-950/90 p-4 sm:p-5 border border-charcoal-800/90 animate-fadeIn">
            {/* Top Match Score Banner */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>94% Complementary Match</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                  Weights: Skills (50%) &middot; Roles (30%)
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-400">Project: EcoRoute AI</span>
            </div>

            {/* Candidate Card */}
            <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-750/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name="Kavya Patel" size="md" />
                  <div>
                    <h5 className="font-bold text-white text-sm sm:text-base">Kavya Patel</h5>
                    <p className="text-xs text-slate-400">
                      B.Tech Computer Science &middot; 3rd Year
                    </p>
                    <p className="text-[11px] text-slate-500">State Engineering College</p>
                  </div>
                </div>

                <button
                  onClick={() => setInvited(true)}
                  disabled={invited}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    invited
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {invited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Invited</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Invite to Team</span>
                    </>
                  )}
                </button>
              </div>

              {/* Match Insights */}
              <div className="p-2.5 rounded-lg bg-charcoal-950/70 border border-charcoal-800 text-xs space-y-1.5">
                <p className="text-[11px] text-indigo-300 font-medium">
                  Why this student is recommended:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-850 text-slate-200 border border-charcoal-700">
                    Matches 3 open project skills: React, TypeScript, Leaflet
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-850 text-slate-200 border border-charcoal-700">
                    Prefers open role: Frontend Engineer
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Campus student directory connected live</span>
              <Link
                href="/teammates"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 2: Live Kanban Sprint Workspace */}
        {activeTab === 'kanban' && (
          <div className="space-y-3 rounded-xl bg-charcoal-950/90 p-4 sm:p-5 border border-charcoal-800/90 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <Kanban className="w-4 h-4 text-indigo-400" />
                Active Sprint &middot; Week 3 Deliverables
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span>3 / 4 Tasks Complete</span>
              </span>
            </div>

            {/* Simulated Sprint Columns / Tasks */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Completed
                    </span>
                    <h6 className="font-semibold text-white text-xs">
                      PostGIS GPS Telemetry Indexing
                    </h6>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Spatial index optimized for 100+ university campus shuttle buses.
                  </p>
                </div>
                <Avatar name="Aarav Sharma" size="sm" />
              </div>

              <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      In Review
                    </span>
                    <h6 className="font-semibold text-white text-xs">
                      MQTT Webhook Relay Service
                    </h6>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real-time WebSocket dispatcher for live student mobile arrivals.
                  </p>
                </div>
                <Avatar name="Priya Narang" size="sm" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Task board with GitHub webhook sync</span>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Explore Workspaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Tab 3: Verified Deliverable Proof */}
        {activeTab === 'evidence' && (
          <div className="space-y-3 rounded-xl bg-charcoal-950/90 p-4 sm:p-5 border border-charcoal-800/90 animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <GitPullRequest className="w-4 h-4 text-emerald-400" />
                Cryptographic Deliverable Proof
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Verified on PostgreSQL RLS
              </span>
            </div>

            <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      System Verified
                    </span>
                    <span className="text-[11px] text-indigo-300 font-mono">
                      EcoRoute AI Project
                    </span>
                  </div>
                  <h6 className="font-bold text-white text-sm">
                    Live Route Optimization Engine & Transit API
                  </h6>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Deliverable Evidence:</span>
                  <span className="text-indigo-400 inline-flex items-center gap-1 font-mono">
                    <Github className="w-3.5 h-3.5 text-slate-400" />
                    <span>PR #18: transit-graph-dijkstra</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 italic">
                  &ldquo;Integrated graph route planner with live campus bus scheduling. Unit tests: 94% coverage.&rdquo;
                </p>
              </div>

              <p className="text-[10px] text-slate-500">
                Verified deliverable proof automatically reflected on student public portfolio.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
