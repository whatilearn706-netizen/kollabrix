'use client';

import React from 'react';
import {
  Users,
  FolderGit2,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  Star,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  Sliders,
  Compass,
  GraduationCap,
  KeyRound,
  Trash2,
  Palette,
  Crown,
  Megaphone,
  LayoutGrid,
  Award,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminTab } from './AdminHeader';

interface OverviewStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
    active: number;
    suspended: number;
  };
  projects: {
    total: number;
    recruiting: number;
    in_progress: number;
    completed: number;
    featured: number;
  };
  hackathons: {
    total: number;
    private: number;
    public: number;
  };
  teams: {
    total: number;
    submissions: number;
  };
  auditLogsCount: number;
}

interface AdminOverviewTabProps {
  stats: OverviewStats | null;
  recentLogs: any[];
  isLoading: boolean;
  onNavigateTab: (tab: AdminTab) => void;
  onNavigateMasterSubTab?: (subTab: 'all' | 'banner' | 'sections' | 'colleges' | 'badges' | 'ceo' | 'maintenance') => void;
}

export function AdminOverviewTab({
  stats,
  recentLogs,
  isLoading,
  onNavigateTab,
  onNavigateMasterSubTab,
}: AdminOverviewTabProps) {
  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HEROIC MASTER CONTROL COMMAND CENTER: ALL 6 FEATURES
         ========================================================================= */}
      <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-amber-950/25 via-charcoal-900 to-charcoal-950 p-6 sm:p-7 shadow-elevated space-y-6 relative overflow-hidden">
        {/* Glow blur background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-charcoal-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                ALL 6 MASTER PLATFORM CONTROLS
              </span>
              <span className="text-xs text-slate-400 font-mono">Live on kollabrix.in</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Site Master Control Command Suite
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Instant god-mode governance: broadcast announcements, toggle homepage sections, whitelist university email domains, award honors, download CEO reports, and gate platform access.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('all');
              onNavigateTab('master');
            }}
            className="bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black shadow-elevated border-none shrink-0"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Full Master Suite (All 6)
          </Button>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 relative z-10">
          {/* 1. Broadcast Banner */}
          <div
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('banner');
              onNavigateTab('master');
            }}
            className="rounded-2xl border border-charcoal-750 bg-charcoal-850/80 p-4 space-y-2.5 hover:border-amber-500/50 hover:bg-charcoal-800 cursor-pointer transition-all group shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Feature 1
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                1. Broadcast Announcement Banner
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Manage platform-wide announcement bar with 5 color themes, custom CTA buttons, and dismiss toggles.
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Banner Manager →</span>
            </div>
          </div>

          {/* 2. Homepage Section Switcher */}
          <div
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('sections');
              onNavigateTab('master');
            }}
            className="rounded-2xl border border-charcoal-750 bg-charcoal-850/80 p-4 space-y-2.5 hover:border-amber-500/50 hover:bg-charcoal-800 cursor-pointer transition-all group shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Feature 2
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                2. Homepage Section Switcher
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                1-click show/hide toggles for Hero, Intent, Workflow, Showcase, Hackathons, Footer CTA & edit headlines.
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Section Switcher →</span>
            </div>
          </div>

          {/* 3. College Whitelist */}
          <div
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('colleges');
              onNavigateTab('master');
            }}
            className="rounded-2xl border border-charcoal-750 bg-charcoal-850/80 p-4 space-y-2.5 hover:border-amber-500/50 hover:bg-charcoal-800 cursor-pointer transition-all group shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Feature 3
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                3. College & University Whitelist
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Manage partner colleges, whitelist @iitb.ac.in, @dtu.ac.in domains, and test student email verification.
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Whitelist Manager →</span>
            </div>
          </div>

          {/* 4. Student Hall of Fame & Badges */}
          <div
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('badges');
              onNavigateTab('master');
            }}
            className="rounded-2xl border border-charcoal-750 bg-charcoal-850/80 p-4 space-y-2.5 hover:border-amber-500/50 hover:bg-charcoal-800 cursor-pointer transition-all group shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Feature 4
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                4. Student Hall of Fame & Badges
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Award glowing badges (Innovator, Hackathon Champ, Faculty Endorsed) to students with custom citations.
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Badges & Honors →</span>
            </div>
          </div>

          {/* 5. Executive CEO Analytics */}
          <div
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('ceo');
              onNavigateTab('master');
            }}
            className="rounded-2xl border border-charcoal-750 bg-charcoal-850/80 p-4 space-y-2.5 hover:border-amber-500/50 hover:bg-charcoal-800 cursor-pointer transition-all group shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Feature 5
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                5. Executive CEO & Dean Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Real-time KPIs, collegiate skill demand ranking, 1-click CSV download & Markdown pitch report generator.
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch CEO Analytics →</span>
            </div>
          </div>

          {/* 6. Site Maintenance & Access */}
          <div
            onClick={() => {
              if (onNavigateMasterSubTab) onNavigateMasterSubTab('maintenance');
              onNavigateTab('master');
            }}
            className="rounded-2xl border border-charcoal-750 bg-charcoal-850/80 p-4 space-y-2.5 hover:border-amber-500/50 hover:bg-charcoal-800 cursor-pointer transition-all group shadow-subtle"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Feature 6
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                6. Site Maintenance & Campus Passcode
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Switch between Public Production, Campus-Only (passcode protected), or Scheduled Maintenance with bypass.
              </p>
            </div>
            <div className="pt-1 flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Access Controls →</span>
            </div>
          </div>

          {/* 7. Restricted Mode & Content Safety */}
          <div
            onClick={() => onNavigateTab('restricted')}
            className="rounded-2xl border-2 border-red-500/40 bg-red-950/20 p-4 space-y-2.5 hover:border-red-500 hover:bg-red-950/40 cursor-pointer transition-all group shadow-subtle sm:col-span-2 lg:col-span-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-red-300 transition-colors flex items-center gap-2">
                    <span>7. 🚫 Restricted Mode & Prohibited Words Blocker</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE & ENFORCED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Universal content blocker active across every input, form, search bar, and chat. Intercepts 74+ prohibited terms, profanities, scams, and academic leaks in real time.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                  <span>Manage Restricted Words</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div
          onClick={() => onNavigateTab('users')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-brand-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 group-hover:text-brand-300 transition-colors">Total Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.users.total}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-charcoal-800 flex-wrap">
            <span className="text-slate-300 font-medium">{stats.users.students} Students</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">{stats.users.teachers} Faculty</span>
            {stats.users.suspended > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-medium">{stats.users.suspended} Suspended</span>
              </>
            )}
          </div>
        </div>

        {/* Projects Card */}
        <div
          onClick={() => onNavigateTab('explore')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-300 transition-colors">Collaborative Projects</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.projects.total}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-charcoal-800 flex-wrap">
            <span className="text-emerald-400 font-medium">{stats.projects.recruiting} Recruiting</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{stats.projects.in_progress} Active</span>
            <span>•</span>
            <span className="text-amber-400 font-medium flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400" />
              {stats.projects.featured} Featured
            </span>
          </div>
        </div>

        {/* Hackathons Card */}
        <div
          onClick={() => onNavigateTab('hackathons')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors">Hackathon Events</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.hackathons.total}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-charcoal-800 flex-wrap">
            <span className="text-amber-400 font-medium">{stats.hackathons.private} Private</span>
            <span>•</span>
            <span className="text-brand-400 font-medium">{stats.hackathons.public} Public</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{stats.teams.submissions} Submissions</span>
          </div>
        </div>

        {/* Governance & Audit Card */}
        <div
          onClick={() => onNavigateTab('audit')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-purple-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 group-hover:text-purple-300 transition-colors">Audit Events Recorded</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats.auditLogsCount}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-charcoal-800">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Immutable Log Active
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('faculty')}
          className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-charcoal-900/70 p-5 hover:border-indigo-500/60 hover:bg-charcoal-900 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 flex items-center gap-2">
            Faculty Passcodes & Verification
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">New</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generate faculty access passcodes with usage limits, manage active faculty codes, and verify educator credentials so teachers can access the Faculty Portal.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('hackathons')}
          className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/20 to-charcoal-900/70 p-5 hover:border-red-500/60 hover:bg-charcoal-900 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-red-300 flex items-center gap-2">
            Delete & Moderate Hackathons
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30">Admin</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review all hackathons, inspect participant numbers and project submissions, and permanently delete invalid or test hackathons with clean cascade.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('theme')}
          className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-950/25 to-charcoal-900/70 p-5 hover:border-pink-500/60 hover:bg-charcoal-900 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-pink-300 flex items-center gap-2">
            Design, Colors &amp; Fonts
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">Studio</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customize every tiny visual detail: brand palette, dark/light canvas, Google fonts, button shapes, and hero headline text in real time.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('users')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/70 p-5 hover:border-brand-500/50 hover:bg-charcoal-900 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-brand-300">
            User & Team Moderation
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review accounts, manage suspensions, and remove users from specific projects or all team rosters without deleting shared work.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('explore')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/70 p-5 hover:border-brand-500/50 hover:bg-charcoal-900 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300">
            Dynamic Explore & Featured
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customize project categories, popular skills, and mark top projects as Featured without code edits or server redeploys.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('taxonomy')}
          className="rounded-2xl border border-charcoal-750 bg-charcoal-900/70 p-5 hover:border-brand-500/50 hover:bg-charcoal-900 cursor-pointer transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-amber-300">
            Skills Taxonomy & Matching
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Merge skill aliases safely, manage collaboration roles, tune teammate match formula weights, and test live profiles.
          </p>
        </div>
      </div>

      {/* Recent Administrative Actions Feed */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400" />
            <h2 className="text-sm font-bold text-white">Recent Administrative Events</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateTab('audit')}
            className="text-xs text-brand-400 hover:text-brand-300"
          >
            View Full Audit Log
          </Button>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No audit events recorded yet.</p>
        ) : (
          <div className="divide-y divide-charcoal-800">
            {recentLogs.map((log: any) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono px-2 py-0.5 rounded bg-charcoal-800 text-brand-300 text-[10px]">
                    {log.action}
                  </span>
                  <span className="text-slate-300 font-medium">
                    {log.target_type}: {log.target_id || 'System'}
                  </span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline">
                    by {log.actor_email || 'Administrator'}
                  </span>
                </div>
                <span className="text-slate-500 font-mono text-[10px] shrink-0">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
