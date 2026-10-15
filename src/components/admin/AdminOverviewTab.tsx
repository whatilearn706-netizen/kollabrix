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
}

export function AdminOverviewTab({
  stats,
  recentLogs,
  isLoading,
  onNavigateTab,
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
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-charcoal-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Registered Users</span>
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
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-charcoal-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Collaborative Projects</span>
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
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-charcoal-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Hackathon Events</span>
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
        <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-5 space-y-3 relative overflow-hidden group hover:border-charcoal-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Audit Events Recorded</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
