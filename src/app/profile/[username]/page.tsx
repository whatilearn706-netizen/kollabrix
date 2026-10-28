'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Profile, Project, ProjectTask, ProjectMember } from '@/types/database';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { GithubProfileCard } from '@/components/github/GithubProfileCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { safeExternalUrl } from '@/lib/security/urlSanitizer';
import {
  ArrowLeft,
  Edit3,
  FolderKanban,
  PlusCircle,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  Award,
  Users,
  Calendar,
  FileCheck2,
} from 'lucide-react';

interface MemberProjectRecord {
  id: string;
  role: string;
  joined_at: string;
  project: Project;
}

export default function PublicProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const username = (params?.username as string)?.toLowerCase();

  const matchingDemo = DEMO_PROJECTS.find(
    (p) => p.owner?.username?.toLowerCase() === username
  );

  const initialDemoProfile: Profile | null =
    matchingDemo && matchingDemo.owner
      ? {
          user_id: matchingDemo.owner.user_id || 'demo-user',
          username: matchingDemo.owner.username || username,
          display_name: matchingDemo.owner.display_name || 'Student Creator',
          avatar_url: matchingDemo.owner.avatar_url,
          college: matchingDemo.owner.college,
          course: matchingDemo.owner.course,
          academic_year: '3rd Year',
          role: 'student',
          is_portfolio_public: true,
          bio: 'Collegiate innovator and open source contributor passionate about building full-stack products.',
          skills: matchingDemo.required_skills || ['React', 'TypeScript', 'Node.js'],
          interests: ['Web Development', 'AI/ML', 'Hackathons'],
          preferred_roles: matchingDemo.desired_roles || ['Full-Stack Developer'],
          github_url: 'https://github.com',
          portfolio_url: null,
          created_at: matchingDemo.created_at,
          updated_at: matchingDemo.updated_at,
        }
      : null;

  const [profile, setProfile] = useState<Profile | null>(() => initialDemoProfile);
  const [userProjects, setUserProjects] = useState<Project[]>(() =>
    matchingDemo
      ? DEMO_PROJECTS.filter((p) => p.owner?.username?.toLowerCase() === username)
      : []
  );
  const [memberProjects, setMemberProjects] = useState<MemberProjectRecord[]>([]);
  const [completedTasks, setCompletedTasks] = useState<ProjectTask[]>([]);
  const [activeTab, setActiveTab] = useState<'owned' | 'teams' | 'evidence' | 'github'>('owned');
  const [isLoading, setIsLoading] = useState(() => !Boolean(initialDemoProfile));
  const [error, setError] = useState<string | null>(null);

  const loadProfileAndProjects = useCallback(async () => {
    if (initialDemoProfile) return;
    setIsLoading(true);
    setError(null);

    // Check database
    if (isSupabaseConfigured()) {
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileErr || !profileData) {
          setError('Student profile not found.');
          setIsLoading(false);
          return;
        }

        const p = profileData as Profile;

        // Check if student is verified via universal registry
        try {
          const { data: regData } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'linkedin_college_verifications')
            .maybeSingle();

          let isRegVerified = false;
          if (Array.isArray(regData?.value)) {
            isRegVerified = regData.value.some(
              (item: any) =>
                item.userId === p.user_id ||
                Boolean(p.username && item.username?.toLowerCase() === p.username.toLowerCase())
            );
          }

          p.college_verified = isRegVerified;
        } catch (e) {
          // ignore
        }

        setProfile(p);

        // 1. Fetch projects owned by this student
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', p.user_id)
          .order('created_at', { ascending: false });

        if (projectsData) {
          const enriched = projectsData.map((proj) => ({
            ...proj,
            owner: p,
          }));
          setUserProjects(enriched as Project[]);
        }

        // 2. Fetch projects where student is a team member
        const { data: membersData } = await supabase
          .from('project_members')
          .select(`
            id,
            role,
            joined_at,
            project:projects!project_members_project_id_fkey(
              *,
              owner:profiles!projects_owner_id_fkey(
                user_id,
                display_name,
                username,
                avatar_url
              )
            )
          `)
          .eq('user_id', p.user_id)
          .order('joined_at', { ascending: false });

        if (membersData) {
          const validRecords = membersData
            .filter((m) => m.project)
            .map((m) => ({
              id: m.id,
              role: m.role,
              joined_at: m.joined_at,
              project: m.project as unknown as Project,
            }));
          setMemberProjects(validRecords);
        }

        // 3. Fetch completed tasks with evidence
        const { data: tasksData } = await supabase
          .from('project_tasks')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            due_date,
            evidence_url,
            evidence_note,
            created_at,
            updated_at,
            project:projects!project_tasks_project_id_fkey(
              id,
              title,
              category
            ),
            milestone:project_milestones!project_tasks_milestone_id_fkey(
              id,
              title
            )
          `)
          .eq('assignee_id', p.user_id)
          .eq('status', 'Completed')
          .order('updated_at', { ascending: false });

        if (tasksData) {
          setCompletedTasks(tasksData as unknown as ProjectTask[]);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching profile.');
      }
    } else {
      setError('Student profile not found.');
    }
    setIsLoading(false);
  }, [username, initialDemoProfile]);

  useEffect(() => {
    if (username) {
      loadProfileAndProjects();
    }
  }, [username, loadProfileAndProjects]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading student profile & portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Profile Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          We couldn&apos;t find a student profile with the username <strong>@{username}</strong>.
        </p>
        <Link href="/explore">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(user && user.id === profile.user_id);

  // Privacy Check: If portfolio is private and viewer is not owner
  if (profile.is_portfolio_public === false && !isOwner) {
    return (
      <div className="max-w-lg mx-auto my-20 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-slate-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">This Portfolio is Private</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
          @{profile.username} has configured their profile and contribution evidence to be private.
          Only authorized team members can view project specifics within shared workspaces.
        </p>
        <div className="pt-2">
          <Link href="/explore">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Explore Open Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Projects</span>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              {profile.is_portfolio_public ? (
                <span className="text-emerald-400 font-medium">● Public Portfolio</span>
              ) : (
                <span className="text-amber-400 font-medium">● Private Portfolio</span>
              )}
            </span>
            <Link href="/settings/profile">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Edit3 className="w-3.5 h-3.5 text-brand-400" />}
              >
                Edit Your Profile
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Profile Card */}
      <ProfileCard profile={profile} isOwner={isOwner} />

      {/* Portfolio Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-charcoal-800">
        <button
          onClick={() => setActiveTab('owned')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative ${
            activeTab === 'owned'
              ? 'text-indigo-600 dark:text-brand-400 border-b-2 border-indigo-600 dark:border-brand-500 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Founded Projects ({userProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative ${
            activeTab === 'teams'
              ? 'text-indigo-600 dark:text-brand-400 border-b-2 border-indigo-600 dark:border-brand-500 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Team Roles ({memberProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative ${
            activeTab === 'evidence'
              ? 'text-indigo-600 dark:text-brand-400 border-b-2 border-indigo-600 dark:border-brand-500 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Verified Contributions ({completedTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`pb-3 px-3 text-sm font-semibold transition-all relative ${
            activeTab === 'github'
              ? 'text-indigo-600 dark:text-brand-400 border-b-2 border-indigo-600 dark:border-brand-500 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          GitHub & Open Source
        </button>
      </div>

      {/* Tab: Founded Projects */}
      {activeTab === 'owned' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-brand-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Projects Founded by {profile.display_name} ({userProjects.length})
              </h2>
            </div>

            {isOwner && (
              <Link href="/projects/new">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<PlusCircle className="w-3.5 h-3.5 text-brand-500" />}
                >
                  Publish New Project
                </Button>
              </Link>
            )}
          </div>

          {userProjects.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-8 text-center text-xs text-slate-600 dark:text-slate-400 shadow-xs">
              <p>This student has not founded any projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Team Roles */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Team Memberships & Active Roles ({memberProjects.length})
            </h2>
          </div>

          {memberProjects.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-8 text-center text-xs text-slate-600 dark:text-slate-400 shadow-xs">
              <p>No external team collaborations recorded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memberProjects.map((record) => (
                <div
                  key={record.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/50 hover:border-slate-300 dark:hover:border-charcoal-700 transition-all flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="category" size="sm">
                        {record.project.category}
                      </Badge>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 font-medium">
                        Role: {record.role}
                      </span>
                    </div>

                    <Link
                      href={`/projects/${record.project.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-300 transition-colors block mb-1"
                    >
                      {record.project.title}
                    </Link>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {record.project.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-charcoal-800">
                    <span>Joined {new Date(record.joined_at).toLocaleDateString()}</span>
                    <Link
                      href={`/projects/${record.project.id}`}
                      className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                      View Project →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Verified Contribution Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  System-Verified Contribution Evidence ({completedTasks.length})
                </h2>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Factual log of deliverables completed by this student across Kollabrix collegiate workspaces.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-100 dark:bg-charcoal-850 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-charcoal-750 self-start">
              Tamper-Resistant Records
            </span>
          </div>

          {completedTasks.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-8 text-center text-xs text-slate-600 dark:text-slate-400 shadow-xs">
              <Sparkles className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-900 dark:text-slate-300 mb-1">No Completed Tasks Recorded</p>
              <p>
                When tasks assigned to this student in project workspaces reach &quot;Completed&quot; status,
                they will be verified and showcased here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/50 space-y-3 shadow-xs"
                >
                  {/* Task Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          System Verified
                        </span>

                        {task.milestone && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                            Milestone: {task.milestone.title}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{task.title}</h3>
                    </div>

                    <div className="text-right text-xs">
                      {task.project && (
                        <Link
                          href={`/projects/${task.project.id}`}
                          className="font-medium text-brand-600 dark:text-brand-400 hover:underline block"
                        >
                          Project: {task.project.title}
                        </Link>
                      )}
                      <span className="text-[11px] text-slate-500">
                        Completed {new Date(task.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-charcoal-850/50 p-3 rounded-xl border border-slate-200 dark:border-charcoal-800">
                      {task.description}
                    </p>
                  )}

                  {/* Student-Submitted Evidence Note & URL */}
                  {(task.evidence_note || task.evidence_url) && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-charcoal-850 border border-slate-200 dark:border-charcoal-750 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-300">
                          <Sparkles className="w-3.5 h-3.5" />
                          Student-Submitted Deliverable Evidence
                        </span>
                        {task.evidence_url && (
                          <a
                            href={safeExternalUrl(task.evidence_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
                          >
                            <span>Open Deliverable</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {task.evidence_note && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          &ldquo;{task.evidence_note}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: GitHub & Open Source */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <GithubProfileCard
            githubUrl={profile.github_url}
            username={profile.username}
            isOwner={isOwner}
          />
        </div>
      )}
    </div>
  );
}
