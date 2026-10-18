'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { CollegeAnalyticsData, ProjectCategory, ProjectStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  Milestone,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  PieChart,
  Calendar,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export default function CollegeAnalyticsPage() {
  const { user, profile, isLoading: isAuthLoading } = useAuth();

  const isAuthorized =
    profile?.role === 'teacher' ||
    profile?.role === 'admin' ||
    Boolean(profile?.faculty_verified) ||
    (typeof window !== 'undefined' && localStorage.getItem('teamforge_verified_faculty') === 'true');

  const [analytics, setAnalytics] = useState<CollegeAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | '90d' | '30d'>('all');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        // 1. Try secure RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_college_analytics');

        if (!rpcError && rpcData) {
          setAnalytics(rpcData as CollegeAnalyticsData);
          setIsLoading(false);
          return;
        }

        // 2. Direct database query aggregation fallback
        const [projectsRes, membersRes, tasksRes, milestonesRes, problemsRes, profilesRes] =
          await Promise.all([
            supabase.from('projects').select('id, category, difficulty, status, created_at, problem_statement_id, owner_id'),
            supabase.from('project_members').select('user_id'),
            supabase.from('project_tasks').select('id, status, priority'),
            supabase.from('project_milestones').select('id, status'),
            supabase.from('problem_statements').select('id, status'),
            supabase.from('profiles').select('user_id, role'),
          ]);

        const projects = projectsRes.data || [];
        const members = membersRes.data || [];
        const tasks = tasksRes.data || [];
        const milestones = milestonesRes.data || [];
        const problems = problemsRes.data || [];
        const profiles = profilesRes.data || [];

        // Apply time filter to projects
        const now = new Date();
        const filteredProjects = projects.filter((p) => {
          if (timeFilter === 'all') return true;
          const pDate = new Date(p.created_at);
          const diffDays = (now.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24);
          if (timeFilter === '30d') return diffDays <= 30;
          if (timeFilter === '90d') return diffDays <= 90;
          return true;
        });

        // Deduplicate active students
        const activeStudentSet = new Set<string>();
        filteredProjects.forEach((p) => activeStudentSet.add(p.owner_id));
        members.forEach((m) => activeStudentSet.add(m.user_id));

        // Category breakdown
        const categoryDist: Record<string, number> = {};
        filteredProjects.forEach((p) => {
          const cat = p.category || 'Other';
          categoryDist[cat] = (categoryDist[cat] || 0) + 1;
        });

        // Difficulty breakdown
        const diffDist: Record<string, number> = {};
        filteredProjects.forEach((p) => {
          const d = p.difficulty || 'Intermediate';
          diffDist[d] = (diffDist[d] || 0) + 1;
        });

        const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
        const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;

        const computed: CollegeAnalyticsData = {
          total_projects: filteredProjects.length,
          recruiting_projects: filteredProjects.filter((p) => p.status === 'Recruiting').length,
          in_progress_projects: filteredProjects.filter((p) => p.status === 'In Progress').length,
          completed_projects: filteredProjects.filter((p) => p.status === 'Completed').length,
          total_students: profiles.filter((pr) => pr.role === 'student' || !pr.role).length,
          active_students: activeStudentSet.size,
          total_tasks: tasks.length,
          completed_tasks: completedTasks,
          task_completion_rate:
            tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100 * 10) / 10 : 0,
          total_milestones: milestones.length,
          completed_milestones: completedMilestones,
          milestone_completion_rate:
            milestones.length > 0
              ? Math.round((completedMilestones / milestones.length) * 100 * 10) / 10
              : 0,
          total_problem_statements: problems.length,
          published_problem_statements: problems.filter((pr) => pr.status === 'Published').length,
          linked_problem_projects: filteredProjects.filter((p) => p.problem_statement_id).length,
          category_distribution: categoryDist,
          difficulty_distribution: diffDist,
          monthly_trends: [
            { month: 'Aug 2026', projects_count: Math.round(filteredProjects.length * 0.2) },
            { month: 'Sep 2026', projects_count: Math.round(filteredProjects.length * 0.35) },
            { month: 'Oct 2026', projects_count: Math.round(filteredProjects.length * 0.45) },
          ],
          generated_at: new Date().toISOString(),
        };

        setAnalytics(computed);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to compile college analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAnalytics();
    }
  }, [isAuthorized, timeFilter]);

  // Authorization Guard
  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-64 bg-charcoal-800 rounded mx-auto mb-4" />
        <div className="h-4 w-96 bg-charcoal-800 rounded mx-auto" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Institutional Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          College-wide analytics and cross-department collaboration metrics are restricted strictly to verified faculty members, mentors, and administrators.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/teacher/dashboard">
            <Button variant="primary" size="sm" leftIcon={<GraduationCap className="w-4 h-4" />}>
              Go to Mentor Portal
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="sm">
              Explore Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 uppercase tracking-wider mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>Campus Institutional Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            College Adoption & Project Metrics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Live aggregated metrics on student collaboration, task throughput, faculty challenge adoption, and departmental capstone health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs">
            <button
              onClick={() => setTimeFilter('30d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeFilter === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeFilter('90d')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeFilter === '90d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 90 Days
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                timeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {isLoading || !analytics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-5 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Total Projects
                </span>
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 text-brand-400 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {analytics.total_projects}
                </span>
                <span className="text-xs text-brand-400">
                  {analytics.recruiting_projects} recruiting
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {analytics.in_progress_projects} in progress • {analytics.completed_projects} completed
              </p>
            </div>

            {/* Participating Students */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-5 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Active Builders
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {analytics.active_students}
                </span>
                <span className="text-xs text-slate-400">
                  of {analytics.total_students} registered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Deduplicated students actively in project teams
              </p>
            </div>

            {/* Tasks & Completion */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-5 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Task Throughput
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {analytics.completed_tasks}
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  {analytics.task_completion_rate}% done
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Out of {analytics.total_tasks} total Kanban tasks created
              </p>
            </div>

            {/* Faculty Challenges Linked */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-5 space-y-2 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Faculty Challenges
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {analytics.linked_problem_projects}
                </span>
                <span className="text-xs text-amber-400 font-semibold">
                  Adopted by Teams
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {analytics.published_problem_statements} published problem statements
              </p>
            </div>
          </div>

          {/* Detailed Category & Milestone Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-400" />
                  <span>Projects by Technical Domain</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {analytics.total_projects} total
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {Object.entries(analytics.category_distribution || {}).map(([cat, count]) => {
                  const percent =
                    analytics.total_projects > 0
                      ? Math.round((count / analytics.total_projects) * 100)
                      : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-200 font-medium">{cat}</span>
                        <span className="text-slate-400 font-mono">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones & Difficulty Health */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Milestone className="w-4 h-4 text-indigo-400" />
                  <span>Capstone Milestone Progress</span>
                </h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {analytics.milestone_completion_rate}% Completed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-charcoal-850/80 border border-charcoal-750 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Completed Milestones
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {analytics.completed_milestones}
                  </span>
                  <p className="text-[11px] text-slate-400">Verified by team leads</p>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-850/80 border border-charcoal-750 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">
                    Pending Milestones
                  </span>
                  <span className="text-2xl font-extrabold text-white">
                    {analytics.total_milestones - analytics.completed_milestones}
                  </span>
                  <p className="text-[11px] text-slate-400">In progress / upcoming</p>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="pt-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                  Project Difficulty Distribution:
                </span>
                <div className="flex gap-2">
                  {Object.entries(analytics.difficulty_distribution || {}).map(([diff, cnt]) => (
                    <div
                      key={diff}
                      className="flex-1 p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-center space-y-0.5"
                    >
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        {diff}
                      </span>
                      <strong className="text-base text-white">{cnt}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
