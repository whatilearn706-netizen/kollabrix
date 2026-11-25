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
import { LinkedInProjectShareModal } from '@/components/projects/LinkedInProjectShareModal';
import { safeExternalUrl } from '@/lib/security/urlSanitizer';
import { stripHackathonMeta } from '@/lib/workspaces/workspaceOrigin';
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
  Linkedin,
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

  const [teamMembers, setTeamMembers] = useState<ProjectMember[]>([]);

  const [isLoading, setIsLoading] = useState(
    () => !DEMO_PROJECTS.some((p) => p.id === projectId)
  );
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLinkedInShareOpen, setIsLinkedInShareOpen] = useState(false);
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
              skills,
              college_verified
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
          .maybeSingle();

        if (dbError || !data) {
          // Resilient fallback query without nested joins
          try {
            const { data: fallbackData } = await supabase
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
                  skills,
                  college_verified
                )
              `)
              .eq('id', projectId)
              .maybeSingle();

            if (fallbackData) {
              const fbProj = fallbackData as unknown as Project;
              if (fbProj.owner) {
                fbProj.owner.college_verified =
                  Boolean(fbProj.owner.college_verified) ||
                  Boolean(fbProj.owner.college && fbProj.owner.college.trim().length > 0);
              }
              setProject(fbProj);
              return;
            }
          } catch {}

          if (isInitial) setError('Project not found or could not be loaded from database.');
        } else if (data) {
          const proj = data as unknown as Project;
          try {
            const { data: vData } = await supabase
              .from('platform_settings')
              .select('value')
              .eq('key', 'linkedin_college_verifications')
              .maybeSingle();

            const isVerifiedInRegistry =
              Array.isArray(vData?.value) &&
              vData.value.some(
                (item: any) =>
                  item.userId === proj.owner?.user_id ||
                  item.userId === proj.owner_id ||
                  (item.username &&
                    proj.owner?.username &&
                    item.username.toLowerCase() === proj.owner.username.toLowerCase())
              );

            const isOwnerVerified =
              Boolean(proj.owner?.college_verified) ||
              Boolean(proj.owner?.college && proj.owner.college.trim().length > 0) ||
              Boolean(isVerifiedInRegistry);

            if (proj.owner) {
              proj.owner.college_verified = isOwnerVerified;
            }
          } catch (e) {
            if (proj.owner) {
              proj.owner.college_verified =
                Boolean(proj.owner.college_verified) ||
                Boolean(proj.owner?.college && proj.owner.college.trim().length > 0);
            }
          }

          setProject(proj);
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

        // Fetch all confirmed team members with profiles for squad roster
        try {
          const { data: membersData } = await supabase
            .from('project_members')
            .select('*, profile:profiles(*)')
            .eq('project_id', projectId)
            .order('joined_at', { ascending: true });

          if (membersData) {
            setTeamMembers(membersData as unknown as ProjectMember[]);
          }
        } catch (mErr) {
          console.warn('Error fetching project members:', mErr);
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
  const isConfirmedProjectMember = Boolean(
    user &&
      (isOwner ||
        isMember ||
        teamMembers.some((m) => m.user_id === user.id))
  );
  const creatorName = project.owner?.display_name || 'Student Creator';
  const creatorUsername = project.owner?.username;
  const isTeamFull = project.current_team_size >= project.desired_team_size;
  const isRecruiting = project.status === 'Recruiting' || (!isTeamFull && project.status !== 'Completed');
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
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
            leftIcon={<Share2 className="w-3.5 h-3.5 text-indigo-400" />}
          >
            Invite Squad
          </Button>

          {/* Certificate & LinkedIn Sharing — Strictly limited to project lead & confirmed teammates */}
          {isConfirmedProjectMember && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCertificateModalOpen(true)}
                leftIcon={<Award className="w-3.5 h-3.5 text-zinc-200" />}
              >
                Certificate
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLinkedInShareOpen(true)}
                className="border-[#0A66C2]/40 text-[#0A66C2] hover:bg-[#0A66C2]/10 font-bold"
                leftIcon={<Linkedin className="w-3.5 h-3.5 fill-[#0A66C2] text-[#0A66C2]" />}
              >
                Post to LinkedIn
              </Button>
            </>
          )}

          {isOwner && (
            <>
              <Link href={`/projects/${project.id}/applications`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Inbox className="w-3.5 h-3.5 text-violet-400" />}
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
                  leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-300" />}
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
      <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden text-white backdrop-blur-xl">
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl font-medium">
            {project.summary}
          </p>
        </div>

        {/* Project Meta Bar: Team Size, Deadline, Created Date */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span>
              Team Size:{' '}
              <strong className="text-white font-black">
                {project.current_team_size} / {project.desired_team_size} members
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-400" />
            <span>
              Posted:{' '}
              <strong className="text-white font-black">
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
                <strong className="text-amber-400 font-black">{project.application_deadline}</strong>
              </span>
            </div>
          )}
        </div>

        {/* External Action Links (Repo / Demo / Docs) */}
        {(project.repository_url || project.demo_url || project.documentation_url) && (
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {project.repository_url && (
              <a
                href={safeExternalUrl(project.repository_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-bold text-slate-200 border border-slate-700 shadow-xs transition-colors"
              >
                <Github className="w-4 h-4 text-slate-300" />
                <span>View Repository</span>
              </a>
            )}

            {project.demo_url && (
              <a
                href={safeExternalUrl(project.demo_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-violet-950/60 hover:bg-violet-900/60 text-xs font-bold text-violet-300 border border-violet-500/30 shadow-xs transition-colors"
              >
                <Globe className="w-4 h-4 text-violet-400" />
                <span>Live Prototype / Demo</span>
              </a>
            )}

            {project.documentation_url && (
              <a
                href={safeExternalUrl(project.documentation_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-xs font-bold text-indigo-300 border border-indigo-500/30 shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Project Documentation</span>
              </a>
            )}
          </div>
        )}

        {/* Problem Statement Link Banner */}
        {project.problem_statement && (
          <div className="mt-3 p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md text-white">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                  Addressing Faculty Problem Statement
                </span>
                <Link
                  href={`/problems/${project.problem_statement.id}`}
                  className="text-sm font-black text-white hover:text-indigo-400 transition-colors"
                >
                  {project.problem_statement.title}
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  Category: {project.problem_statement.category} • Faculty Mentor:{' '}
                  {project.problem_statement.author?.display_name || 'Academic Faculty'}
                </p>
              </div>
            </div>
            <Link href={`/problems/${project.problem_statement.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/60 shrink-0 font-bold"
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
          <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 md:p-8 space-y-4 shadow-xl text-white backdrop-blur-xl">
            <h2 className="text-lg font-black text-white border-b border-slate-800 pb-3">
              Detailed Specifications
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {stripHackathonMeta(project.description)}
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
            <div id="mentor-feedback" className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-4 shadow-xl text-white backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-violet-400" />
                  <span>Faculty Mentoring Feedback ({mentoringNotes.length})</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">Institutional Review</span>
              </div>

              <div className="space-y-3">
                {mentoringNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={note.mentor?.display_name || 'Faculty Mentor'}
                          src={note.mentor?.avatar_url}
                          size="sm"
                        />
                        <span className="text-xs font-bold text-white">
                          {note.mentor?.display_name || 'Faculty Mentor'}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-500/30">
                          {note.feedback_type}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed pl-7 font-medium">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Collaboration Status Box */}
          <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-4 shadow-xl text-white backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Team Collaboration</span>
              </h3>
              {isMember && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {memberRole || 'Team Member'}
                </span>
              )}
            </div>

            {/* Squad Members Showcase inside Team Collaboration */}
            <div className="p-4 rounded-2xl bg-[#0d1017] border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  Confirmed Squad ({Math.max(teamMembers.length, 1)} / {project.desired_team_size})
                </span>
                {!isTeamFull ? (
                  <span className="text-[11px] font-bold text-violet-300 bg-violet-950/60 px-2.5 py-0.5 rounded-full font-mono border border-violet-500/30">
                    {project.desired_team_size - Math.max(teamMembers.length, 1)} open spot remaining
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/30">
                    Squad Full
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {/* Project Lead */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12151F] border border-slate-800 shadow-2xs">
                  <Avatar name={creatorName} src={project.owner?.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <span>{creatorName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Lead</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{project.owner?.college || 'Creator'}</p>
                  </div>
                </div>

                {/* Confirmed Teammates */}
                {teamMembers
                  .filter((m) => m.user_id !== project.owner_id)
                  .map((m) => {
                    const prof = m.profile;
                    const name = prof?.display_name || 'Teammate';
                    return (
                      <div key={m.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#12151F] border border-slate-800 shadow-2xs">
                        <Avatar name={name} src={prof?.avatar_url} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                            <span>{name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-950/60 text-violet-300 border border-violet-500/30 truncate">
                              {m.role || 'Contributor'}
                            </span>
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{prof?.college || 'Teammate'}</p>
                        </div>
                      </div>
                    );
                  })}

                {/* Remaining spot callout */}
                {!isTeamFull && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-dashed border-violet-500/40 bg-violet-950/20">
                    <div className="w-7 h-7 rounded-full border border-dashed border-violet-400/60 flex items-center justify-center text-violet-300 font-bold text-xs shrink-0">
                      +
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-violet-200 truncate">
                        {project.desired_roles?.[0] || 'Open Role'}
                      </p>
                      <p className="text-[10px] text-violet-400 font-medium">Spot open to claim</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isOwner ? (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-white">You own this project</p>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
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
              <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    You are an active team member
                  </p>
                  <p className="text-xs text-emerald-200/80 mt-0.5 font-medium">
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
              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Application Under Review
                    </span>
                    <p className="text-xs text-slate-300 mt-1 font-medium">
                      You applied on{' '}
                      <strong className="text-white font-bold">
                        {userApplication.created_at
                          ? new Date(userApplication.created_at).toLocaleDateString()
                          : 'Recently'}
                      </strong>{' '}
                      for the role{' '}
                      <strong className="text-violet-300 font-bold">
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
                    className="text-red-400 border-red-500/40 hover:bg-red-950/40 shrink-0 font-bold"
                  >
                    Withdraw
                  </Button>
                </div>
                {withdrawSuccess && (
                  <p className="text-xs font-bold text-emerald-400">Application successfully withdrawn.</p>
                )}
              </div>
            ) : userApplication && userApplication.status === 'Rejected' ? (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-200">Application Not Selected</p>
                  <p className="text-[11px] text-slate-400">
                    Your previous application was not selected for this project. Keep exploring other active listings!
                  </p>
                </div>
              </div>
            ) : !isRecruiting ? (
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
                <AlertCircle className="w-5 h-5 text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-slate-200">Recruitment Closed</p>
                  <p className="text-[11px] text-slate-400">
                    This project is currently {project.status.toLowerCase()} and is not accepting new member applications.
                  </p>
                </div>
              </div>
            ) : isTeamFull ? (
              <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
                <Users className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold text-amber-200">Team Full</p>
                  <p className="text-[11px] text-amber-300/80">
                    This team has reached its target capacity of {project.desired_team_size} members.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-slate-900 border border-violet-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
                <div>
                  <p className="text-sm font-black text-white">Join this Team</p>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">
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
                      return;
                    }
                    const isVerifiedUser = Boolean(
                      profile?.college_verified ||
                      (profile as any)?.student_verified ||
                      user?.user_metadata?.college_verified ||
                      profile?.role === 'teacher' ||
                      profile?.role === 'admin' ||
                      Boolean((profile as any)?.faculty_verified)
                    );
                    if (!isVerifiedUser) {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(
                          new CustomEvent('kollabrix:open-profile-modal', {
                            detail: { step: 4 },
                          })
                        );
                      }
                      return;
                    }
                    setIsApplyModalOpen(true);
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
            <div className="rounded-3xl bg-gradient-to-br from-violet-950/40 via-purple-950/20 to-slate-900 border border-violet-500/30 p-6 space-y-3 shadow-xl text-white backdrop-blur-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ready to Collaborate?</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Submit an application explaining what skills you bring to this project. The lead will review and respond.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => {
                  if (!user) {
                    openAuthModal('signup');
                    return;
                  }
                  const isVerifiedUser = Boolean(
                    profile?.college_verified ||
                    (profile as any)?.student_verified ||
                    user?.user_metadata?.college_verified ||
                    profile?.role === 'teacher' ||
                    profile?.role === 'admin' ||
                    Boolean((profile as any)?.faculty_verified)
                  );
                  if (!isVerifiedUser) {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('kollabrix:open-profile-modal', {
                          detail: { step: 4 },
                        })
                      );
                    }
                    return;
                  }
                  setIsApplyModalOpen(true);
                }}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Apply to Join Team
              </Button>
            </div>
          )}

          {/* Creator Information Card */}
          <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-4 shadow-xl text-white backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
              Project Lead / Creator
            </h3>

            <div className="flex items-center gap-3">
              <Avatar
                name={creatorName}
                src={project.owner?.avatar_url}
                size="lg"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-black text-white truncate">{creatorName}</h4>
                {creatorUsername && (
                  <p className="text-xs text-violet-400 font-bold font-mono">@{creatorUsername}</p>
                )}
              </div>
            </div>

            {project.owner?.college && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <VerifiedCollegeBadge
                  college={project.owner.college}
                  isVerified={project.owner.college_verified}
                  userId={project.owner?.user_id || project.owner_id}
                  username={creatorUsername}
                />
              </div>
            )}

            {project.owner?.course && (
              <p className="text-xs text-slate-400 font-medium">{project.owner.course}</p>
            )}

            {project.owner?.bio && (
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                {project.owner.bio}
              </p>
            )}

            {project.owner?.skills && project.owner.skills.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Lead&apos;s Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.owner.skills.slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} variant="skill">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              {creatorUsername && (
                <Link href={`/profile/${creatorUsername}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    View Student Profile
                  </Button>
                </Link>
              )}
              {isConfirmedProjectMember && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLinkedInShareOpen(true)}
                  className="w-full justify-center border-[#0A66C2]/35 text-[#0A66C2] hover:bg-[#0A66C2]/10 text-xs font-bold"
                  leftIcon={<Linkedin className="w-3.5 h-3.5 fill-[#0A66C2] text-[#0A66C2]" />}
                >
                  Post on LinkedIn with AI
                </Button>
              )}
            </div>
          </div>

          {/* Current Squad Members Roster */}
          <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-4 shadow-xl text-white backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                Squad Teammates
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-950/60 text-violet-300 border border-violet-500/30">
                {Math.max(teamMembers.length, 1)} / {project.desired_team_size} Joined
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-800">
              {/* Always include Project Lead */}
              <div className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={creatorName} src={project.owner?.avatar_url} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                      <span>{creatorName}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Lead
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{project.owner?.college || 'Collegiate Builder'}</p>
                  </div>
                </div>
                {creatorUsername && (
                  <Link href={`/profile/${creatorUsername}`} className="shrink-0 text-[11px] font-bold text-violet-400 hover:underline font-mono">
                    Profile &rarr;
                  </Link>
                )}
              </div>

              {/* All other teammates in teamMembers */}
              {teamMembers
                .filter((m) => m.user_id !== project.owner_id)
                .map((member) => {
                  const memberProfile = member.profile;
                  const mName = memberProfile?.display_name || 'Teammate';
                  const mUsername = memberProfile?.username;
                  const mAvatar = memberProfile?.avatar_url;
                  const mCollege = memberProfile?.college;
                  const mRole = member.role || 'Contributor';

                  return (
                    <div key={member.id} className="pt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={mName} src={mAvatar} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate flex items-center gap-1.5">
                            <span>{mName}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-950/60 text-violet-300 border border-violet-500/30 truncate max-w-[110px]">
                              {mRole}
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{mCollege || 'Collegiate Builder'}</p>
                        </div>
                      </div>
                      {mUsername && (
                        <Link href={`/profile/${mUsername}`} className="shrink-0 text-[11px] font-bold text-violet-400 hover:underline font-mono">
                          Profile &rarr;
                        </Link>
                      )}
                    </div>
                  );
                })}

              {/* Remaining Open Spot Callouts */}
              {!isTeamFull && (
                <div className="pt-3">
                  <div className="p-3 rounded-2xl border-2 border-dashed border-violet-500/40 bg-violet-950/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full border border-dashed border-violet-400/60 flex items-center justify-center text-violet-300 shrink-0 text-xs font-black">
                        +
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-violet-200 truncate">
                          {project.desired_roles && project.desired_roles.length > 0
                            ? `${project.desired_roles[0]} Needed`
                            : 'Open Teammate Slot'}
                        </p>
                        <p className="text-[10px] text-violet-400 font-medium">Claim this spot</p>
                      </div>
                    </div>
                    {canApply && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsApplyModalOpen(true)}
                        className="text-[11px] font-bold py-1 px-2.5 h-auto text-violet-300 border-violet-500/40 hover:bg-violet-950/60"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Roles Sought */}
          {project.desired_roles && project.desired_roles.length > 0 && (
            <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-3 shadow-xl text-white backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                Open Roles Needed
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.desired_roles.map((role, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-violet-950/60 text-violet-300 border border-violet-500/30 shadow-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-3 shadow-xl text-white backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
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
            <div className="rounded-3xl bg-[#12151F] border border-[#1E2433] p-6 space-y-3 shadow-xl text-white backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-xl bg-slate-800/80 text-slate-200 border border-slate-700 shadow-xs"
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
        onOpenLinkedIn={isConfirmedProjectMember ? () => setIsLinkedInShareOpen(true) : undefined}
      />

      {/* LinkedIn AI Project Poster & Verified Certificate — Only for Lead & Confirmed Teammates */}
      {isConfirmedProjectMember && (
        <>
          <LinkedInProjectShareModal
            isOpen={isLinkedInShareOpen}
            onClose={() => setIsLinkedInShareOpen(false)}
            project={project}
          />

          <ProjectCertificateModal
            isOpen={isCertificateModalOpen}
            onClose={() => setIsCertificateModalOpen(false)}
            project={project}
            profile={profile}
            teamMembers={teamMembers}
            roleTitle={memberRole || (isOwner ? 'Project Lead & Architect' : 'Core Squad Member')}
          />
        </>
      )}
    </div>
  );
}
