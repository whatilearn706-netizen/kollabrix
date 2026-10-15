'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, ProjectApplication, ProjectMember } from '@/types/database';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ApplyModal } from '@/components/applications/ApplyModal';
import {
  Users,
  Calendar,
  Github,
  Globe,
  Edit3,
  Trash2,
  ArrowLeft,
  GraduationCap,
  Clock,
  Sparkles,
  Inbox,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(
    () => DEMO_PROJECTS.find((p) => p.id === projectId) || null
  );
  const [isLoading, setIsLoading] = useState(
    () => !DEMO_PROJECTS.some((p) => p.id === projectId)
  );
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Phase 2 Collaboration State
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [userApplication, setUserApplication] = useState<ProjectApplication | null>(null);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number>(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const loadProjectData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    }
    setError(null);

    // Check in demo projects first
    const demoMatch = DEMO_PROJECTS.find((p) => p.id === projectId);
    if (demoMatch) {
      setProject(demoMatch);
      if (isInitial) setIsLoading(false);
      return;
    }

    // Check in Supabase DB if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error: dbError } = await supabase
          .from('projects')
          .select(`
            *,
            owner:profiles!projects_owner_id_fkey(
              user_id,
              display_name,
              username,
              avatar_url,
              college,
              course,
              bio,
              skills
            )
          `)
          .eq('id', projectId)
          .single();

        if (dbError) {
          if (isInitial) setError('Project not found or could not be loaded from database.');
        } else if (data) {
          setProject(data as Project);
        }
      } catch (err: unknown) {
        if (isInitial) setError(err instanceof Error ? err.message : 'Error fetching project.');
      }
    } else {
      if (isInitial) setError('Project not found.');
    }
    if (isInitial) setIsLoading(false);
  }, [projectId]);

  const loadCollaborationStatus = useCallback(async () => {
    if (!user || !projectId || !isSupabaseConfigured()) return;

    try {
      // 1. Check membership
      const { data: memberData } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberData) {
        setIsMember(true);
        setMemberRole(memberData.role);
      } else {
        setIsMember(false);
        setMemberRole(null);
      }

      // 2. Check user's latest application
      const { data: appData } = await supabase
        .from('project_applications')
        .select('*')
        .eq('project_id', projectId)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appData) {
        setUserApplication(appData as ProjectApplication);
      } else {
        setUserApplication(null);
      }

      // 3. If user is owner, count pending applications
      if (project && project.owner_id === user.id) {
        const { count } = await supabase
          .from('project_applications')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId)
          .eq('status', 'Pending');

        setPendingApplicationsCount(count || 0);
      }
    } catch {
      // Fallback silently if tables are still initializing
    }
  }, [user, projectId, project]);

  useEffect(() => {
    if (projectId) {
      loadProjectData(true);

      // Smooth live subscription without screen flicker
      let debounceTimer: NodeJS.Timeout | null = null;
      const handleSmoothUpdate = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          loadProjectData(false);
          loadCollaborationStatus();
        }, 200);
      };

      const channel = supabase
        .channel(`project-live-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'project_members',
            filter: `project_id=eq.${projectId}`,
          },
          handleSmoothUpdate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `id=eq.${projectId}`,
          },
          handleSmoothUpdate
        )
        .subscribe();

      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, loadProjectData, loadCollaborationStatus]);

  useEffect(() => {
    if (project && user) {
      loadCollaborationStatus();
    }
  }, [project, user, loadCollaborationStatus]);

  const handleWithdrawApplication = async () => {
    if (!userApplication || userApplication.status !== 'Pending') return;
    const confirmWithdraw = window.confirm(
      'Are you sure you want to withdraw your pending application?'
    );
    if (!confirmWithdraw) return;

    setIsWithdrawing(true);
    try {
      const { error: withdrawErr } = await supabase
        .from('project_applications')
        .update({ status: 'Withdrawn' })
        .eq('id', userApplication.id)
        .eq('applicant_id', user?.id || '');

      if (withdrawErr) {
        alert(withdrawErr.message || 'Could not withdraw application.');
      } else {
        setWithdrawSuccess(true);
        setUserApplication((prev) =>
          prev ? { ...prev, status: 'Withdrawn' } : null
        );
        setTimeout(() => setWithdrawSuccess(false), 3000);
      }
    } catch {
      alert('Failed to withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading project specifications...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The project you are trying to view does not exist or may have been deleted by its owner.
        </p>
        <Link href="/explore">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Explore Projects
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(user && user.id === project.owner_id);
  const creatorName = project.owner?.display_name || 'Student Creator';
  const creatorUsername = project.owner?.username;
  const isTeamFull = project.current_team_size >= project.desired_team_size;
  const isRecruiting = project.status === 'Recruiting';
  const canApply =
    !isOwner &&
    !isMember &&
    isRecruiting &&
    !isTeamFull &&
    (!userApplication || userApplication.status === 'Withdrawn');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Directory</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {isOwner && (
            <>
              <Link href={`/projects/${project.id}/applications`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Inbox className="w-3.5 h-3.5 text-brand-400" />}
                >
                  <span>Applications</span>
                  {pendingApplicationsCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                      {pendingApplicationsCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href={`/projects/${project.id}/workspace`}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                >
                  Open Workspace
                </Button>
              </Link>

              <Link href={`/projects/${project.id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-brand-400" />}
                >
                  Edit
                </Button>
              </Link>

              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </>
          )}

          {!isOwner && isMember && (
            <Link href={`/projects/${project.id}/workspace`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
              >
                Open Team Workspace
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Project Hero Card */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="category">{project.category}</Badge>
            <Badge variant="difficulty" difficulty={project.difficulty} />
            {project.is_demo && <Badge variant="demo" />}
          </div>
          <Badge variant="status" status={project.status} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {project.summary}
          </p>
        </div>

        {/* Project Meta Bar: Team Size, Deadline, Created Date */}
        <div className="pt-4 border-t border-charcoal-800 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            <span>
              Team Size:{' '}
              <strong className="text-slate-200">
                {project.current_team_size} / {project.desired_team_size} members
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            <span>
              Posted:{' '}
              <strong className="text-slate-200">
                {project.created_at
                  ? new Date(project.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recently'}
              </strong>
            </span>
          </div>

          {project.application_deadline && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Target Cutoff:{' '}
                <strong className="text-amber-300">{project.application_deadline}</strong>
              </span>
            </div>
          )}
        </div>

        {/* External Action Links (Repo / Demo) */}
        {(project.repository_url || project.demo_url) && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-xs text-slate-200 border border-charcoal-700 transition-colors"
              >
                <Github className="w-4 h-4 text-slate-400" />
                <span>View Repository</span>
              </a>
            )}

            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-xs text-slate-200 border border-charcoal-700 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-400" />
                <span>Live Prototype / Demo</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Grid: 2 Columns - Left Description, Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Detailed Problem & Solution */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-charcoal-800 pb-3">
              Detailed Specifications
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-3">
              {project.description}
            </div>
          </div>

          {/* Dynamic Collaboration Status Box */}
          <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Team Collaboration</span>
              </h3>
              {isMember && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {memberRole || 'Team Member'}
                </span>
              )}
            </div>

            {isOwner ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">You own this project</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage team applications, assign roles, and track project tasks in your private workspace.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/projects/${project.id}/applications`}>
                    <Button variant="outline" size="sm">
                      Applications ({pendingApplicationsCount})
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/workspace`}>
                    <Button variant="primary" size="sm">
                      Workspace
                    </Button>
                  </Link>
                </div>
              </div>
            ) : isMember ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    You are an active team member
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Access private tasks, Kanban board, team milestones, and internal discussions.
                  </p>
                </div>
                <Link href={`/projects/${project.id}/workspace`}>
                  <Button variant="primary" size="sm" className="shrink-0">
                    Open Workspace
                  </Button>
                </Link>
              </div>
            ) : userApplication && userApplication.status === 'Pending' ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Application Under Review
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      You applied on{' '}
                      <strong>
                        {userApplication.created_at
                          ? new Date(userApplication.created_at).toLocaleDateString()
                          : 'Recently'}
                      </strong>{' '}
                      for the role{' '}
                      <strong className="text-brand-300">
                        {userApplication.proposed_role || 'Contributor'}
                      </strong>
                      .
                    </p>
                    <p className="text-xs text-slate-400 mt-1 italic line-clamp-2">
                      &quot;{userApplication.application_message}&quot;
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWithdrawApplication}
                    isLoading={isWithdrawing}
                    className="text-red-400 border-red-500/30 hover:bg-red-500/10 shrink-0"
                  >
                    Withdraw
                  </Button>
                </div>
                {withdrawSuccess && (
                  <p className="text-xs text-emerald-400">Application successfully withdrawn.</p>
                )}
              </div>
            ) : userApplication && userApplication.status === 'Rejected' ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center gap-3 text-xs text-slate-400">
                <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Application Not Selected</p>
                  <p className="text-[11px] text-slate-400">
                    Your previous application was not selected for this project. Keep exploring other active listings!
                  </p>
                </div>
              </div>
            ) : !isRecruiting ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center gap-3 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Recruitment Closed</p>
                  <p className="text-[11px] text-slate-400">
                    This project is currently {project.status.toLowerCase()} and is not accepting new member applications.
                  </p>
                </div>
              </div>
            ) : isTeamFull ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center gap-3 text-xs text-slate-400">
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-300">Team Full</p>
                  <p className="text-[11px] text-slate-400">
                    This team has reached its target capacity of {project.desired_team_size} members.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Join this Team</p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {project.desired_roles && project.desired_roles.length > 0
                      ? `Looking for: ${project.desired_roles.join(', ')}`
                      : 'Looking for collaborative contributors.'}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (!user) {
                      openAuthModal('signup');
                    } else {
                      setIsApplyModalOpen(true);
                    }
                  }}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="shrink-0"
                >
                  Apply to Join
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Creator Profile Card & Required Roles */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Apply CTA in Sidebar for Non-members */}
          {canApply && (
            <div className="rounded-xl bg-gradient-to-br from-brand-950/60 to-charcoal-900 border border-brand-500/30 p-5 space-y-3 shadow-glow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Ready to Collaborate?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit an application explaining what skills you bring to this project. The lead will review and respond.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  if (!user) {
                    openAuthModal('signup');
                  } else {
                    setIsApplyModalOpen(true);
                  }
                }}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Apply to Join Team
              </Button>
            </div>
          )}

          {/* Creator Information Card */}
          <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Project Lead / Creator
            </h3>

            <div className="flex items-center gap-3">
              <Avatar
                name={creatorName}
                src={project.owner?.avatar_url}
                size="lg"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{creatorName}</h4>
                {creatorUsername && (
                  <p className="text-xs text-slate-400 font-mono">@{creatorUsername}</p>
                )}
              </div>
            </div>

            {project.owner?.college && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <GraduationCap className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="truncate">{project.owner.college}</span>
              </div>
            )}

            {creatorUsername && (
              <div className="pt-2">
                <Link href={`/profile/${creatorUsername}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    View Student Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Roles Sought */}
          {project.desired_roles && project.desired_roles.length > 0 && (
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Open Roles Needed
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.desired_roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 font-medium"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Required Teammate Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.required_skills.map((skill, idx) => (
                  <Badge key={idx} variant="skill">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Technologies Stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-2 py-0.5 rounded bg-charcoal-850 text-slate-300 border border-charcoal-750"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
        projectOwnerId={project.owner_id}
        isMember={isMember}
        desiredRoles={project.desired_roles}
        onSuccess={() => {
          loadCollaborationStatus();
          loadProjectData();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        projectId={project.id}
        projectTitle={project.title}
      />
    </div>
  );
}
