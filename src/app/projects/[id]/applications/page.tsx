'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Project, ProjectApplication, TeamRole } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  LayoutDashboard,
  Filter,
  Check,
  X,
} from 'lucide-react';

const AVAILABLE_ROLES: TeamRole[] = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Researcher',
  'Contributor',
];

export default function ProjectApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Rejected' | 'Withdrawn'>('Pending');

  // Accept modal state
  const [acceptingApp, setAcceptingApp] = useState<ProjectApplication | null>(null);
  const [assignedRole, setAssignedRole] = useState<string>('Contributor');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Reject dialog state
  const [rejectingApp, setRejectingApp] = useState<ProjectApplication | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);

    try {
      // 1. Fetch project details
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projErr || !projData) {
        setIsLoading(false);
        return;
      }

      setProject(projData as Project);

      // 2. Fetch applications with applicant profile joined
      const { data: appsData, error: appsErr } = await supabase
        .from('project_applications')
        .select(`
          *,
          applicant:profiles!project_applications_applicant_id_fkey(
            user_id,
            username,
            display_name,
            avatar_url,
            bio,
            college,
            course,
            academic_year,
            skills,
            interests,
            preferred_roles,
            github_url,
            portfolio_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (!appsErr && appsData) {
        setApplications(appsData as unknown as ProjectApplication[]);
      }
    } catch {
      // Catch errors
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();

    // Realtime listener for incoming applications
    if (projectId) {
      const channel = supabase
        .channel(`project-applications-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_applications',
            filter: `project_id=eq.${projectId}`,
          },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadData, projectId]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading project applications...</p>
      </div>
    );
  }

  // Authorization check: only project owner can manage applications
  if (!user || (project && project.owner_id !== user.id)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Only the designated owner of this project has permission to review candidate applications.
        </p>
        <Link href={`/projects/${projectId}`}>
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Project
          </Button>
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <Link href="/explore">
          <Button variant="outline" size="sm">Explore Projects</Button>
        </Link>
      </div>
    );
  }

  const isFull = project.current_team_size >= project.desired_team_size;
  const filteredApps = applications.filter((app) => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length;

  const handleOpenAcceptModal = (app: ProjectApplication) => {
    setAcceptingApp(app);
    setAssignedRole(app.proposed_role || 'Contributor');
    setActionError(null);
  };

  const handleConfirmAccept = async () => {
    if (!acceptingApp || !project || !user) return;
    setIsProcessingAction(true);
    setActionError(null);

    try {
      // Step A: Attempt atomic PostgreSQL function
      const { data, error: rpcError } = await supabase.rpc('accept_project_application', {
        app_id: acceptingApp.id,
        assigned_role: assignedRole || 'Contributor',
      });

      if (!rpcError && data) {
        if (data.success) {
          setAcceptingApp(null);
          await loadData();
          return;
        } else {
          setActionError(data.error || 'Failed to accept application.');
          setIsProcessingAction(false);
          return;
        }
      }

      // Step B: Robust direct fallback if RPC function is not yet installed in Supabase
      // 1. Insert member into project_members
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: acceptingApp.applicant_id,
          role: assignedRole || 'Contributor',
        });

      if (memberError && memberError.code !== '23505') {
        setActionError(memberError.message || 'Failed to add member to team roster.');
        setIsProcessingAction(false);
        return;
      }

      // 2. Update application status to Accepted
      const { error: appUpdateError } = await supabase
        .from('project_applications')
        .update({
          status: 'Accepted',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', acceptingApp.id);

      if (appUpdateError) {
        setActionError(appUpdateError.message || 'Failed to update application status.');
        setIsProcessingAction(false);
        return;
      }

      // 3. Recount team members and update project capacity
      const { count } = await supabase
        .from('project_members')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const updatedCount = count || (project.current_team_size + 1);
      const newDesired = Math.max(project.desired_team_size, updatedCount);
      const isNowFull = updatedCount >= newDesired;

      await supabase
        .from('projects')
        .update({
          current_team_size: updatedCount,
          desired_team_size: newDesired,
          status: isNowFull ? 'In Progress' : project.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      // 4. Send notification to the applicant
      try {
        await supabase.from('notifications').insert({
          recipient_id: acceptingApp.applicant_id,
          sender_id: user.id,
          type: 'application_accepted',
          title: 'Application Accepted! 🎉',
          message: `Your application to join "${project.title}" has been accepted as ${assignedRole || 'Contributor'}.`,
          link: `/projects/${projectId}/workspace`,
        });
      } catch {
        // Safe notification fallback
      }

      setAcceptingApp(null);
      await loadData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Error processing application acceptance.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingApp || !project || !user) return;
    setIsProcessingAction(true);
    setActionError(null);

    try {
      // Step A: Attempt RPC first
      const { data, error: rpcError } = await supabase.rpc('reject_project_application', {
        app_id: rejectingApp.id,
      });

      if (!rpcError && data) {
        if (data.success) {
          setRejectingApp(null);
          await loadData();
          return;
        } else {
          alert(data.error || 'Failed to reject application.');
          setIsProcessingAction(false);
          return;
        }
      }

      // Step B: Robust direct fallback
      const { error: updateErr } = await supabase
        .from('project_applications')
        .update({
          status: 'Rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', rejectingApp.id);

      if (updateErr) {
        alert(updateErr.message || 'Failed to reject application.');
        setIsProcessingAction(false);
        return;
      }

      // Send polite notification
      try {
        await supabase.from('notifications').insert({
          recipient_id: rejectingApp.applicant_id,
          sender_id: user.id,
          type: 'application_rejected',
          title: 'Application Update',
          message: `Your application to join "${project.title}" was not selected at this time.`,
          link: '/my-applications',
        });
      } catch {
        // Safe notification fallback
      }

      setRejectingApp(null);
      await loadData();
    } catch {
      alert('Failed to process rejection.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {project.title}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/projects/${project.id}/workspace`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
            >
              Open Team Workspace
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Banner: Capacity & Status */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Team Applications
              </h1>
              <Badge variant="status" status={project.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Review student applications and build your multidisciplinary team for{' '}
              <strong className="text-slate-200">{project.title}</strong>.
            </p>
          </div>

          <div className="text-right flex items-center gap-4">
            <div className="bg-charcoal-850 border border-charcoal-750 px-4 py-2.5 rounded-xl">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
                Team Capacity
              </span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 justify-end">
                <Users className="w-4 h-4 text-brand-400" />
                {project.current_team_size} / {project.desired_team_size}
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Roster Progress</span>
            <span>
              {isFull ? (
                <strong className="text-amber-400">Capacity Reached ({project.desired_team_size} members)</strong>
              ) : (
                `${project.desired_team_size - project.current_team_size} open spots remaining`
              )}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-amber-500' : 'bg-gradient-to-r from-brand-600 to-indigo-500'
              }`}
              style={{
                width: `${Math.min(100, (project.current_team_size / project.desired_team_size) * 100)}%`,
              }}
            />
          </div>
        </div>

        {isFull && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Team is currently at full capacity. Accepting additional candidates requires increasing desired team size in Project Settings.
            </span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-charcoal-800 pb-3 text-xs">
        {(['Pending', 'Accepted', 'Rejected', 'Withdrawn', 'All'] as const).map((tab) => {
          const count =
            tab === 'Pending'
              ? pendingCount
              : tab === 'Accepted'
              ? acceptedCount
              : tab === 'All'
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
      {filteredApps.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No applications in &quot;{statusFilter}&quot;</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'Pending'
              ? 'There are currently no new student applications waiting for your review.'
              : `No applications with status "${statusFilter}" were found for this project.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const applicant = app.applicant;
            const applicantName = applicant?.display_name || 'Student Applicant';
            const applicantUsername = applicant?.username;
            const matchingSkills = (applicant?.skills || []).filter((skill) =>
              (project.required_skills || []).includes(skill)
            );

            return (
              <div
                key={app.id}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5 transition-all hover:border-charcoal-700"
              >
                {/* Header: Applicant Info & Status */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <Avatar
                      name={applicantName}
                      src={applicant?.avatar_url}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white">
                          {applicantName}
                        </h3>
                        {applicantUsername && (
                          <Link
                            href={`/profile/${applicantUsername}`}
                            target="_blank"
                            className="text-xs text-brand-400 hover:underline font-mono"
                          >
                            @{applicantUsername}
                          </Link>
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

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        {applicant?.college && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                            {applicant.college}
                          </span>
                        )}
                        {app.proposed_role && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                            Proposed Role: <strong>{app.proposed_role}</strong>
                          </span>
                        )}
                        <span className="text-slate-500">
                          Applied{' '}
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Pending Applications */}
                  {app.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenAcceptModal(app)}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRejectingApp(app)}
                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                        leftIcon={<X className="w-3.5 h-3.5" />}
                      >
                        Decline
                      </Button>
                    </div>
                  )}
                </div>

                {/* Application Message */}
                <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750/80 space-y-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                    Applicant Pitch & Motivation
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {app.application_message}
                  </p>
                </div>

                {/* Skills & Badges */}
                {applicant?.skills && applicant.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                      Applicant Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.skills.map((skill, idx) => {
                        const isMatch = matchingSkills.includes(skill);
                        return (
                          <span
                            key={idx}
                            className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${
                              isMatch
                                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 ring-1 ring-brand-500/30'
                                : 'bg-charcoal-850 text-slate-300 border border-charcoal-750'
                            }`}
                          >
                            {skill} {isMatch && '★ Project Match'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Accept Application Modal */}
      {acceptingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Accept Candidate</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Accepting <strong>{acceptingApp.applicant?.display_name || 'applicant'}</strong> will grant them access to the private project workspace and notify them instantly.
            </p>

            {isFull && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Team at Capacity ({project.current_team_size}/{project.desired_team_size})</span>
                </div>
                <p className="text-[11px] text-amber-200/80 pl-6">
                  Accepting this candidate will automatically expand your project capacity to {project.current_team_size + 1} members.
                </p>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {actionError}
              </div>
            )}

            <Select
              label="Assign Team Role"
              options={AVAILABLE_ROLES.map((r) => ({ value: r, label: r }))}
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              helperText="The applicant will hold this role within the workspace roster."
            />

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAcceptingApp(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAccept}
                isLoading={isProcessingAction}
              >
                {isFull ? 'Confirm & Expand Team Capacity' : 'Confirm & Add to Team'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Application Modal */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Decline Application</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to decline the application from{' '}
              <strong>{rejectingApp.applicant?.display_name || 'this applicant'}</strong>? They will be notified politely.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectingApp(null)}
                disabled={isProcessingAction}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                isLoading={isProcessingAction}
              >
                Decline Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
