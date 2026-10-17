'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project, ProjectApplication, ProjectMember, ProjectMentoringNote } from '@/types/database';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { ApplyModal } from '@/components/applications/ApplyModal';
import { GithubActivitySection } from '@/components/github/GithubActivitySection';
import { SquadShareModal } from '@/components/projects/SquadShareModal';
import { ProjectCertificateModal } from '@/components/workspace/ProjectCertificateModal';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';
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
  BookOpen,
  ExternalLink,
  MessageSquare,
  Share2,
  Award,
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();
  const projectId = params?.id as string;

  const userRef = useRef(user);
  userRef.current = user;

  const [project, setProject] = useState<Project | null>(
    () => DEMO_PROJECTS.find((p) => p.id === projectId) || null
  );
  const projectRef = useRef<Project | null>(project);
  projectRef.current = project;

  const [isLoading, setIsLoading] = useState(
    () => !DEMO_PROJECTS.some((p) => p.id === projectId)
  );
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Phase 2 Collaboration State
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [userApplication, setUserApplication] = useState<ProjectApplication | null>(null);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number>(0);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Phase 3 College Adoption State
  const [mentoringNotes, setMentoringNotes] = useState<ProjectMentoringNote[]>([]);

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
            ),
            problem_statement:problem_statements!projects_problem_statement_id_fkey(
              id,
              title,
              category,
              difficulty,
              author:profiles!problem_statements_author_id_fkey(
                display_name,
                avatar_url
              )
            )
          `)
          .eq('id', projectId)
          .single();

        if (dbError) {
          if (isInitial) setError('Project not found or could not be loaded from database.');
        } else if (data) {
          setProject(data as unknown as Project);
        }

        // Fetch faculty mentoring notes
        const { data: notesData } = await supabase
          .from('project_mentoring_notes')
          .select(`
            *,
            mentor:profiles!project_mentoring_notes_mentor_id_fkey(
              user_id,
              display_name,
              avatar_url,
              college,
              role
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (notesData) {
          setMentoringNotes(notesData as unknown as ProjectMentoringNote[]);
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
    const currentUserId = userRef.current?.id;
    if (!currentUserId || !projectId || !isSupabaseConfigured()) {
      setIsMember(false);
      setMemberRole(null);
      setUserApplication(null);
      setPendingApplicationsCount(0);
      return;
    }

    try {
      // 1. Check membership
      const { data: memberData } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', currentUserId)
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
        .eq('applicant_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appData) {
        setUserApplication(appData as ProjectApplication);
      } else {
        setUserApplication(null);
      }

      // 3. If user is owner, count pending applications
      if (projectRef.current && projectRef.current.owner_id === currentUserId) {
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
  }, [projectId]);

  // 1. Initial project fetch (only runs when projectId changes)
  useEffect(() => {
    if (projectId) {
      loadProjectData(true);
    }
  }, [projectId, loadProjectData]);

  // 2. Collaboration status (runs when projectId, user ID, or project owner changes)
  useEffect(() => {
    if (projectId && user?.id) {
      loadCollaborationStatus();
    } else {
      setIsMember(false);
      setMemberRole(null);
      setUserApplication(null);
      setPendingApplicationsCount(0);
    }
  }, [projectId, user?.id, project?.owner_id, loadCollaborationStatus]);

  // 3. Realtime listener for live updates without page reload or spinner flicker
  useEffect(() => {
    if (!projectId) return;

    let debounceTimer: NodeJS.Timeout | null = null;
    const handleSmoothUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadProjectData(false);
        if (userRef.current?.id) {
          loadCollaborationStatus();
        }
      }, 250);
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_applications',
          filter: `project_id=eq.${projectId}`,
        },
        handleSmoothUpdate
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [projectId, loadProjectData, loadCollaborationStatus]);

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
  const isAdmin = Boolean(user && ((profile as any)?.role === 'admin' || user.email === 'goyalmayank142@gmail.com'));
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Directory</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share Squad Invite Link (Feature 1) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5 text-indigo-600" />}
          >
            Invite Squad
          </Button>

          {/* Verifiable Project Certificate (Feature 3) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCertificateModalOpen(true)}
            leftIcon={<Award className="w-3.5 h-3.5 text-amber-600" />}
          >
            Certificate
          </Button>

          {isOwner && (
            <>
              <Link href={`/projects/${project.id}/applications`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Inbox className="w-3.5 h-3.5 text-violet-600" />}
                >
                  <span>Applications</span>
                  {pendingApplicationsCount > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-black">
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
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-700" />}
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

          {!isOwner && isAdmin && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Admin Delete
            </Button>
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
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 md:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="category">{project.category}</Badge>
            <Badge variant="difficulty" difficulty={project.difficulty} />
            {project.is_demo && <Badge variant="demo" />}
          </div>
          <Badge variant="status" status={project.status} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl font-medium">
            {project.summary}
          </p>
        </div>

        {/* Project Meta Bar: Team Size, Deadline, Created Date */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            <span>
              Team Size:{' '}
              <strong className="text-slate-900 font-black">
                {project.current_team_size} / {project.desired_team_size} members
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-600" />
            <span>
              Posted:{' '}
              <strong className="text-slate-900 font-black">
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
              <Clock className="w-4 h-4 text-amber-500" />
              <span>
                Target Cutoff:{' '}
                <strong className="text-amber-700 font-black">{project.application_deadline}</strong>
              </span>
            </div>
          )}
        </div>

        {/* External Action Links (Repo / Demo / Docs) */}
        {(project.repository_url || project.demo_url || project.documentation_url) && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 shadow-xs transition-colors"
              >
                <Github className="w-4 h-4 text-slate-700" />
                <span>View Repository</span>
              </a>
            )}

            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-violet-50 hover:bg-violet-100 text-xs font-bold text-violet-800 border border-violet-200 shadow-xs transition-colors"
              >
                <Globe className="w-4 h-4 text-violet-600" />
                <span>Live Prototype / Demo</span>
              </a>
            )}

            {project.documentation_url && (
              <a
                href={project.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-800 border border-indigo-200 shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Project Documentation</span>
              </a>
            )}
          </div>
        )}

        {/* Problem Statement Link Banner */}
        {project.problem_statement && (
          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-pink-50/60 border-2 border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Addressing Faculty Problem Statement
                </span>
                <Link
                  href={`/problems/${project.problem_statement.id}`}
                  className="text-sm font-black text-slate-900 hover:text-indigo-600 transition-colors"
                >
                  {project.problem_statement.title}
                </Link>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">
                  Category: {project.problem_statement.category} • Faculty Mentor:{' '}
                  {project.problem_statement.author?.display_name || 'Academic Faculty'}
                </p>
              </div>
            </div>
            <Link href={`/problems/${project.problem_statement.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-100 shrink-0 font-bold"
              >
                View Statement
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Grid: 2 Columns - Left Description, Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Detailed Problem & Solution */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 md:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Detailed Specifications
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {project.description}
            </div>
          </div>

          {/* Live GitHub Repository Activity */}
          <GithubActivitySection
            repositoryUrl={project.repository_url}
            projectId={project.id}
            isOwnerOrLead={isOwner || isMember}
          />

          {/* Faculty Mentoring & Feedback */}
          {mentoringNotes.length > 0 && (
            <div id="mentor-feedback" className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-violet-600" />
                  <span>Faculty Mentoring Feedback ({mentoringNotes.length})</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">Institutional Review</span>
              </div>

              <div className="space-y-3">
                {mentoringNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={note.mentor?.display_name || 'Faculty Mentor'}
                          src={note.mentor?.avatar_url}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-slate-900">
                          {note.mentor?.display_name || 'Faculty Mentor'}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                          {note.feedback_type}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-7 font-medium">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Collaboration Status Box */}
          <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Team Collaboration</span>
              </h3>
              {isMember && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {memberRole || 'Team Member'}
                </span>
              )}
            </div>

            {isOwner ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-900">You own this project</p>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
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
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    You are an active team member
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5 font-medium">
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
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Application Under Review
                    </span>
                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      You applied on{' '}
                      <strong className="text-slate-900 font-bold">
                        {userApplication.created_at
                          ? new Date(userApplication.created_at).toLocaleDateString()
                          : 'Recently'}
                      </strong>{' '}
                      for the role{' '}
                      <strong className="text-violet-700 font-bold">
                        {userApplication.proposed_role || 'Contributor'}
                      </strong>
                      .
                    </p>
                    <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">
                      &quot;{userApplication.application_message}&quot;
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWithdrawApplication}
                    isLoading={isWithdrawing}
                    className="text-red-600 border-red-200 hover:bg-red-50 shrink-0 font-bold"
                  >
                    Withdraw
                  </Button>
                </div>
                {withdrawSuccess && (
                  <p className="text-xs font-bold text-emerald-600">Application successfully withdrawn.</p>
                )}
              </div>
            ) : userApplication && userApplication.status === 'Rejected' ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Application Not Selected</p>
                  <p className="text-[11px] text-slate-500">
                    Your previous application was not selected for this project. Keep exploring other active listings!
                  </p>
                </div>
              </div>
            ) : !isRecruiting ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Recruitment Closed</p>
                  <p className="text-[11px] text-slate-500">
                    This project is currently {project.status.toLowerCase()} and is not accepting new member applications.
                  </p>
                </div>
              </div>
            ) : isTeamFull ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
                <Users className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-bold text-amber-950">Team Full</p>
                  <p className="text-[11px] text-amber-800">
                    This team has reached its target capacity of {project.desired_team_size} members.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50/90 via-pink-50/60 to-amber-50/60 border-2 border-violet-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-900">Join this Team</p>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
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
            <div className="rounded-3xl bg-gradient-to-br from-violet-50 via-pink-50/50 to-amber-50/50 border-2 border-violet-200/90 p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span>Ready to Collaborate?</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
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
          <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
              Project Lead / Creator
            </h3>

            <div className="flex items-center gap-3">
              <Avatar
                name={creatorName}
                src={project.owner?.avatar_url}
                size="lg"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 truncate">{creatorName}</h4>
                {creatorUsername && (
                  <p className="text-xs text-violet-600 font-bold font-mono">@{creatorUsername}</p>
                )}
              </div>
            </div>

            {project.owner?.college && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                <VerifiedCollegeBadge
                  college={project.owner.college}
                  isVerified={project.owner.college_verified}
                />
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
            <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 space-y-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
                Open Roles Needed
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.desired_roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-violet-100 text-violet-800 border border-violet-200 shadow-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 space-y-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
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
            <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 space-y-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-mono">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 shadow-xs"
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

      {/* 1-Click WhatsApp, Telegram & Discord Squad Share Modal (Feature 1) */}
      <SquadShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={project}
      />

      {/* Exportable Verified Collegiate Project Certificate (Feature 3) */}
      <ProjectCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        project={project}
        profile={profile}
        roleTitle={memberRole || (isOwner ? 'Project Lead & Architect' : 'Core Squad Member')}
      />
    </div>
  );
}
