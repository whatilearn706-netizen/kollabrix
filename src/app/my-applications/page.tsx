'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProjectApplication } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Briefcase,
  LayoutDashboard,
  Inbox,
} from 'lucide-react';

function MyApplicationsContent() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn'>('All');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('project_applications')
        .select(`
          *,
          project:projects!project_applications_project_id_fkey(
            id,
            title,
            summary,
            category,
            difficulty,
            status,
            current_team_size,
            desired_team_size
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setApplications(data as unknown as ProjectApplication[]);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleWithdraw = async (appId: string) => {
    const confirm = window.confirm('Are you sure you want to withdraw this application?');
    if (!confirm) return;

    setWithdrawingId(appId);
    try {
      const { error } = await supabase
        .from('project_applications')
        .update({ status: 'Withdrawn' })
        .eq('id', appId)
        .eq('applicant_id', user?.id || '');

      if (error) {
        alert(error.message || 'Could not withdraw application.');
      } else {
        await loadApplications();
      }
    } catch {
      alert('Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-brand-400" />
            <span>My Applications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your team applications, status updates, and workspace invitations.
          </p>
        </div>

        <Link href="/explore">
          <Button variant="outline" size="sm" leftIcon={<Compass className="w-4 h-4 text-brand-400" />}>
            Explore More Projects
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-800 pb-3 text-xs">
        {(['All', 'Pending', 'Accepted', 'Rejected', 'Withdrawn'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? applications.length
              : applications.filter((a) => a.status === tab).length;

          const isActive = statusFilter === tab;

          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-brand-500 text-white' : 'bg-charcoal-750 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading your applications...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No applications found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'All'
              ? 'You have not submitted any project applications yet. Browse the project directory to find projects seeking your skills!'
              : `You have no applications currently marked as "${statusFilter}".`}
          </p>
          <Link href="/explore">
            <Button variant="primary" size="sm">
              Discover Open Projects
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const project = app.project;

            return (
              <div
                key={app.id}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4 hover:border-charcoal-700 transition-all"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/projects/${app.project_id}`}
                        className="text-lg font-bold text-white hover:text-brand-300 transition-colors"
                      >
                        {project?.title || 'Project'}
                      </Link>
                      {project?.category && (
                        <Badge variant="category">{project.category}</Badge>
                      )}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          app.status === 'Accepted'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : app.status === 'Pending'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : app.status === 'Rejected'
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {app.proposed_role && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                          Role: <strong>{app.proposed_role}</strong>
                        </span>
                      )}
                      <span>
                        Applied:{' '}
                        {app.created_at ? new Date(app.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }) : 'Recent'}
                      </span>
                      {app.reviewed_at && (
                        <span className="text-slate-500">
                          Reviewed:{' '}
                          {new Date(app.reviewed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {app.status === 'Accepted' && (
                      <Link href={`/projects/${app.project_id}/workspace`}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                        >
                          Go to Workspace
                        </Button>
                      </Link>
                    )}

                    {app.status === 'Pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdraw(app.id)}
                        isLoading={withdrawingId === app.id}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      >
                        Withdraw
                      </Button>
                    )}

                    <Link href={`/projects/${app.project_id}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        View Project
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Pitch message snippet */}
                <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750/80 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Your Submission Pitch:</span>
                  <p className="whitespace-pre-line">{app.application_message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MyApplicationsPage() {
  return (
    <ProtectedPageGuard>
      <MyApplicationsContent />
    </ProtectedPageGuard>
  );
}
