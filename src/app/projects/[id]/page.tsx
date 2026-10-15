'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/types/database';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import {
  Users,
  Calendar,
  Github,
  Globe,
  Edit3,
  Trash2,
  ArrowLeft,
  Sparkles,
  Layers,
  GraduationCap,
  Clock,
  ShieldAlert,
} from 'lucide-react';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(
    () => DEMO_PROJECTS.find((p) => p.id === projectId) || null
  );
  const [isLoading, setIsLoading] = useState(
    () => !DEMO_PROJECTS.some((p) => p.id === projectId)
  );
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      setError(null);

      // Check in demo projects first
      const demoMatch = DEMO_PROJECTS.find((p) => p.id === projectId);
      if (demoMatch) {
        setProject(demoMatch);
        setIsLoading(false);
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
            setError('Project not found or could not be loaded from database.');
          } else if (data) {
            setProject(data as Project);
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Error fetching project.');
        }
      } else {
        setError('Project not found.');
      }
      setIsLoading(false);
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Directory</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link href={`/projects/${project.id}/edit`}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-brand-400" />}
              >
                Edit Project
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
          </div>
        )}
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
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
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
        {/* Left: Detailed Problem & Solution (Markdown style) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-charcoal-800 pb-3">
              Detailed Specifications
            </h2>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-3">
              {project.description}
            </div>
          </div>

          {/* Phase 2 Application Notice (Compliant with prompt instruction) */}
          <div className="rounded-xl bg-charcoal-900/60 border border-charcoal-800 p-5 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300">Phase 1 Recruitment Scope</p>
              <p className="mt-0.5">
                TeamForge Phase 1 facilitates project publication, role requirements, and profile discovery. Team applications, group task boards, and chat will launch in Phase 2. To collaborate now, reach out via the creator&apos;s public profile.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Creator Profile Card & Required Roles */}
        <div className="lg:col-span-4 space-y-6">
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
