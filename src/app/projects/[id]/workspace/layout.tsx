'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Project, ProjectMember, TeamRole } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  CheckSquare,
  Milestone,
  MessageSquare,
  Users,
  Settings,
  ShieldCheck,
  ExternalLink,
  Bot,
  GitBranch,
  Sparkles,
  Laptop,
  Headphones,
  Award,
  Clock,
  ChevronRight,
  Trophy,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  WorkspaceFeaturesConfig,
  DEFAULT_MASTER_CONTROL_CONFIG,
} from '@/types/masterControl';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { isHackathonClosed } from '@/lib/hackathons/hackathonStatus';
import {
  resolveWorkspaceOrigin,
  WorkspaceOriginInfo,
} from '@/lib/workspaces/workspaceOrigin';

interface WorkspaceContextType {
  project: Project;
  members: ProjectMember[];
  isOwner: boolean;
  isLead: boolean;
  currentUserMember: ProjectMember | null;
  refreshWorkspace: () => Promise<void>;
  workspaceFeatures: WorkspaceFeaturesConfig;
  originInfo: WorkspaceOriginInfo | null;
}

export const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceLayout');
  }
  return context;
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const rawPathname = usePathname();
  const pathname = rawPathname || '';
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const projectId = params?.id as string;

  const userRef = React.useRef(user);
  userRef.current = user;

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [currentUserMember, setCurrentUserMember] = useState<ProjectMember | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hackathonId, setHackathonId] = useState<string | null>(null);
  const [isHackathonClosedState, setIsHackathonClosedState] = useState<boolean>(false);
  const [originInfo, setOriginInfo] = useState<WorkspaceOriginInfo | null>(null);
  const [workspaceFeatures, setWorkspaceFeatures] = useState<WorkspaceFeaturesConfig>(
    DEFAULT_MASTER_CONTROL_CONFIG.workspaceFeatures || {
      aiCloserKit: true,
      liveToolBridge: true,
      teamHuddle: true,
      proofOfWork: true,
    }
  );

  useEffect(() => {
    let isMounted = true;
    async function fetchFeatures() {
      try {
        const res = await fetch('/api/master-control');
        const data = await res.json();
        if (isMounted && data?.config?.workspaceFeatures) {
          setWorkspaceFeatures(data.config.workspaceFeatures);
        }
      } catch (err) {
        console.warn('Could not load master control features in workspace layout:', err);
      }
    }
    fetchFeatures();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadWorkspaceData = async (isInitial = false) => {
    let currentUserId = userRef.current?.id;
    if (!currentUserId && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_auth_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          currentUserId = parsed?.id;
        }
        if (!currentUserId) {
          const idMatch = document.cookie.match(/linkora_user_id=([^;]+)/);
          if (idMatch && idMatch[1]) currentUserId = idMatch[1];
        }
      } catch (e) {}
    }
    if (!projectId || !currentUserId) {
      if (isInitial) setIsLoading(false);
      return;
    }
    if (isInitial) {
      setIsLoading(true);
    }

    try {
      // Check in demo projects first
      const demoMatch = DEMO_PROJECTS.find((p) => p.id === projectId);
      if (demoMatch) {
        setProject(demoMatch);
        const demoMembers: ProjectMember[] = [
          {
            id: 'mem-demo-1',
            project_id: demoMatch.id,
            user_id: currentUserId,
            role: 'Project Lead',
            joined_at: new Date().toISOString(),
            profile: {
              user_id: currentUserId,
              username: userRef.current?.user_metadata?.username || 'lead_builder',
              display_name: userRef.current?.user_metadata?.display_name || 'Project Lead',
              college: 'Institute of Engineering & Tech',
              role: 'student',
              skills: demoMatch.required_skills,
              interests: ['Collegiate Innovation'],
              preferred_roles: ['Project Lead'],
            },
          },
          {
            id: 'mem-demo-2',
            project_id: demoMatch.id,
            user_id: 'teammate-2',
            role: 'Frontend Developer',
            joined_at: new Date().toISOString(),
            profile: {
              user_id: 'teammate-2',
              username: 'priya_ux',
              display_name: 'Priya Patel',
              college: 'Institute of Engineering & Tech',
              role: 'student',
              skills: ['React', 'Figma', 'TailwindCSS'],
              interests: ['UI/UX Design'],
              preferred_roles: ['Frontend Developer'],
            },
          },
          {
            id: 'mem-demo-3',
            project_id: demoMatch.id,
            user_id: 'teammate-3',
            role: 'Full-Stack Developer',
            joined_at: new Date().toISOString(),
            profile: {
              user_id: 'teammate-3',
              username: 'rohan_edge',
              display_name: 'Rohan Verma',
              college: 'Institute of Engineering & Tech',
              role: 'student',
              skills: ['TypeScript', 'Supabase', 'Node.js'],
              interests: ['Distributed Systems'],
              preferred_roles: ['Backend Developer'],
            },
          },
        ];
        setMembers(demoMembers);
        setCurrentUserMember(demoMembers[0]);
        setIsAuthorized(true);
        if (isInitial) setIsLoading(false);
        return;
      }

      // 1. Fetch project from Supabase DB
      let { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      let detectedHackathonId: string | null = null;
      let detectedClosed = false;

      if (projError || !projData) {
        // A. Check if projectId matches a team in hackathon_teams
        let cleanTeamId = projectId;
        if (cleanTeamId.startsWith('hackathon-')) {
          cleanTeamId = cleanTeamId.replace('hackathon-', '');
        }

        const { data: teamData } = await supabase
          .from('hackathon_teams')
          .select('*, hackathon:hackathons(*), challenge:hackathon_challenges(*)')
          .eq('id', cleanTeamId)
          .maybeSingle();

        if (teamData) {
          detectedHackathonId = teamData.hackathon_id;
          const h = teamData.hackathon;
          const closed = isHackathonClosed(h);
          detectedClosed = closed;

          // Fetch team members with profiles
          const { data: teamMems } = await supabase
            .from('hackathon_team_members')
            .select(`
              *,
              profile:profiles(
                user_id,
                username,
                display_name,
                avatar_url,
                bio,
                college,
                course,
                skills,
                interests,
                is_suspended,
                status
              )
            `)
            .eq('team_id', teamData.id);

          const isLeader = teamData.leader_id === currentUserId;
          const isMem = (teamMems || []).some((m: any) => m.user_id === currentUserId);

          if (isLeader || isMem) {
            // Build synthetic Project object (Categorized as 'Other' to satisfy DB check constraints, marked with 'Hackathon Team Sprint' prefix so it never leaks into Explore)
            const hackProj: Project = {
              id: teamData.id,
              owner_id: teamData.leader_id,
              title: teamData.team_name,
              summary: `Hackathon Team Sprint: ${h?.title || 'Campus Hackathon'}${teamData.description ? ` — ${teamData.description}` : ''}`,
              description: `### Problem Statement\n${teamData.challenge?.title || teamData.description || 'Assigned Hackathon Challenge'}\n\n### Proposed Solution\nBuilding an innovative solution for ${h?.title || 'the campus hackathon sprint'}.\n\n### Tech Stack & Architecture\n${(h?.themes || ['Next.js', 'React', 'TypeScript', 'TailwindCSS']).join(', ')}\n\n### Who We Need\nCollegiate student builders collaborating during the hackathon sprint.`,
              category: 'Other' as any,
              difficulty: 'Intermediate',
              technologies: h?.themes || ['Next.js', 'React', 'TypeScript'],
              required_skills: h?.themes || ['Rapid Prototyping', 'Full-Stack'],
              desired_roles: ['Project Lead', 'Frontend Developer', 'Backend Developer', 'AI/ML Engineer'],
              current_team_size: teamMems?.length || 1,
              desired_team_size: h?.max_team_size || 4,
              status: closed ? 'Completed' : 'In Progress',
              created_at: teamData.created_at || new Date().toISOString(),
              updated_at: teamData.updated_at || new Date().toISOString(),
            };

            // Self-heal: ensure row exists in projects table for DB relation foreign keys
            try {
              await supabase.from('projects').upsert({
                id: hackProj.id,
                owner_id: hackProj.owner_id,
                title: hackProj.title,
                summary: hackProj.summary,
                description: hackProj.description,
                category: hackProj.category,
                difficulty: hackProj.difficulty,
                technologies: hackProj.technologies,
                required_skills: hackProj.required_skills,
                desired_roles: hackProj.desired_roles,
                current_team_size: hackProj.current_team_size,
                desired_team_size: hackProj.desired_team_size,
                status: hackProj.status,
              }, { onConflict: 'id' });
            } catch (e) {}

            // Also ensure project_members has rows for foreign keys
            try {
              for (const tm of (teamMems || [])) {
                await supabase.from('project_members').upsert({
                  id: tm.id,
                  project_id: teamData.id,
                  user_id: tm.user_id,
                  role: tm.role === 'Leader' ? 'Project Lead' : tm.role || 'Contributor',
                }, { onConflict: 'id' });
              }
            } catch (e) {}

            projData = hackProj;
            projError = null;
          }
        } else if (projectId.startsWith('hackathon-')) {
          const hackId = projectId.replace('hackathon-', '');
          const { data: hData } = await supabase
            .from('hackathons')
            .select('*')
            .eq('id', hackId)
            .maybeSingle();

          if (hData) {
            detectedHackathonId = hData.id;
            detectedClosed = isHackathonClosed(hData);

            // If current user is the hackathon organizer, redirect to hackathon workspace (do not auto-create a student team)
            if (currentUserId === hData.creator_id) {
              router.replace(`/hackathons/${hData.id}/workspace`);
              return;
            }

            // If hackathon is closed and student does not have a team, redirect to hackathon workspace
            if (detectedClosed) {
              const { data: closedExistingTeam } = await supabase
                .from('hackathon_teams')
                .select('id')
                .eq('hackathon_id', hackId)
                .eq('leader_id', currentUserId)
                .maybeSingle();

              if (!closedExistingTeam) {
                router.replace(`/hackathons/${hData.id}/workspace`);
                return;
              }
            }

            const { data: existingTeam } = await supabase
              .from('hackathon_teams')
              .select('*')
              .eq('hackathon_id', hackId)
              .eq('leader_id', currentUserId)
              .maybeSingle();

            let targetTeam = existingTeam;
            if (!targetTeam) {
              const teamName = `Team ${userRef.current?.user_metadata?.display_name || userRef.current?.email?.split('@')[0] || 'Alpha'}`;
              const { data: createdTeam } = await supabase
                .from('hackathon_teams')
                .insert({
                  hackathon_id: hackId,
                  team_name: teamName,
                  leader_id: currentUserId,
                  invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                })
                .select('*')
                .single();

              if (createdTeam) {
                targetTeam = createdTeam;
                await supabase.from('hackathon_team_members').insert({
                  team_id: createdTeam.id,
                  hackathon_id: hackId,
                  user_id: currentUserId,
                  role: 'Leader',
                });
              }
            }

            if (targetTeam) {
              router.replace(`/projects/${targetTeam.id}/workspace`);
              return;
            }
          }
        }

        // B. Check persistent problem teams registry in platform_settings
        if (!projData) {
          try {
            const { data: regRow } = await supabase
              .from('platform_settings')
              .select('value')
              .eq('key', 'problem_teams_registry')
              .maybeSingle();

            if (Array.isArray(regRow?.value)) {
              const foundTeam = regRow.value.find((p: any) => p && p.id === projectId);
              if (foundTeam) {
                projData = foundTeam;
                projError = null;
              }
            }
          } catch {}
        }

        // C. Check local storage for problem teams
        if (!projData && typeof window !== 'undefined') {
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith('tf_problem_teams_')) {
                const teams = JSON.parse(localStorage.getItem(k) || '[]');
                const found = Array.isArray(teams) ? teams.find((t: any) => t && t.id === projectId) : null;
                if (found) {
                  projData = found;
                  projError = null;
                  break;
                }
              }
            }
          } catch {}
        }
      }

      setHackathonId(detectedHackathonId);
      setIsHackathonClosedState(detectedClosed);

      if (projError || !projData) {
        setIsAuthorized(false);
        if (isInitial) setIsLoading(false);
        return;
      }

      setProject(projData as Project);

      // Resolve origin & provenance (Hackathon Sprint / Faculty Problem / Permanent Project)
      try {
        let hackathonsList: any[] = [];
        let problemsList: any[] = [];
        const { data: hList } = await supabase
          .from('hackathons')
          .select('id, title, organizer, results_published, status, end_date, submission_deadline, start_date');
        if (Array.isArray(hList)) hackathonsList = hList;

        const { data: pList } = await supabase
          .from('problem_statements')
          .select('id, title, status, deadline, author:profiles(display_name)');
        if (Array.isArray(pList)) problemsList = pList;

        const resolvedOrigin = resolveWorkspaceOrigin(projData, {
          hackathons: hackathonsList,
          problemStatements: problemsList,
        });
        setOriginInfo(resolvedOrigin);
        if (resolvedOrigin.originType === 'hackathon' && resolvedOrigin.originId) {
          setHackathonId(resolvedOrigin.originId);
        }
        if (resolvedOrigin.isClosed) {
          setIsHackathonClosedState(true);
        }
      } catch (err) {
        console.warn('Origin resolution warning:', err);
      }

      // 2. Fetch project members with profiles
      const { data: membersData } = await supabase
        .from('project_members')
        .select(`
          *,
          profile:profiles!project_members_user_id_fkey(
            user_id,
            username,
            display_name,
            avatar_url,
            bio,
            college,
            course,
            skills,
            interests,
            is_suspended,
            status
          )
        `)
        .eq('project_id', projectId);

      // Fetch platform suspended user registry
      let suspendedIds: string[] = [];
      try {
        const { data: settingData } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'match_scoring_config')
          .maybeSingle();
        if (Array.isArray(settingData?.value?.suspended_user_ids)) {
          suspendedIds = settingData.value.suspended_user_ids;
        }
      } catch {}

      const rawMemList = (membersData as unknown as ProjectMember[]) || [];
      const memList = rawMemList.filter((m: any) => {
        const prof = m.profile;
        if (prof?.is_suspended || prof?.status === 'suspended') return false;
        if (suspendedIds.includes(m.user_id)) return false;
        return true;
      });

      const isOwner = projData.owner_id === currentUserId;
      let finalMemList = memList;
      if (finalMemList.length === 0 && isOwner) {
        finalMemList = [
          {
            id: `mem-${projData.id}-lead`,
            project_id: projData.id,
            user_id: currentUserId,
            role: 'Team Lead',
            joined_at: projData.created_at || new Date().toISOString(),
            profile: {
              user_id: currentUserId,
              username: userRef.current?.user_metadata?.username || 'teamlead',
              display_name: userRef.current?.user_metadata?.display_name || 'Team Lead',
              college: 'Collegiate Institution',
              role: 'student',
            },
          } as any,
        ];
      }

      setMembers(finalMemList);

      const userMember = finalMemList.find((m) => m.user_id === currentUserId) || null;
      setCurrentUserMember(userMember);
      const isCurrentUserSuspended = suspendedIds.includes(currentUserId);
      const hasMembership = Boolean(userMember) && !isCurrentUserSuspended;

      if ((isOwner || hasMembership) && !isCurrentUserSuspended) {
        setIsAuthorized(true);

        // Self-heal: If user is owner but not in project_members, register as Project Lead
        if (isOwner && !hasMembership) {
          try {
            await supabase.from('project_members').insert({
              project_id: projectId,
              user_id: currentUserId,
              role: 'Project Lead',
            });
          } catch {
            // non-blocking
          }
        }
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let activeUserId = user?.id;
    if (!activeUserId && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_auth_user');
        if (cached) activeUserId = JSON.parse(cached)?.id;
        if (!activeUserId) {
          const idMatch = document.cookie.match(/linkora_user_id=([^;]+)/);
          if (idMatch && idMatch[1]) activeUserId = idMatch[1];
        }
      } catch (e) {}
    }

    if (!isAuthLoading || activeUserId) {
      if (!activeUserId) {
        setIsAuthorized(false);
        setIsLoading(false);
      } else {
        loadWorkspaceData(true);

        // Smooth live subscription to team membership updates without full-page re-renders
        let debounceTimer: NodeJS.Timeout | null = null;
        const handleSmoothUpdate = () => {
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            loadWorkspaceData(false);
          }, 200);
        };

        if (projectId) {
          const channel = supabase
            .channel(`workspace-roster-${projectId}`)
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
            .subscribe();

          return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            supabase.removeChannel(channel);
          };
        }
      }
    }
  }, [projectId, user?.id, isAuthLoading]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Authenticating workspace access...</p>
      </div>
    );
  }



  if (!isAuthorized || !project) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Private Workspace</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          This project workspace is restricted to active team members and the project lead. To collaborate, submit an application from the project details page.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Project
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="primary" size="sm">
              Explore Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === project.owner_id;
  const isLead = isOwner || currentUserMember?.role === 'Project Lead';
  const isHackathonWorkspace = Boolean(hackathonId) || project.category === ('Hackathon Sprint' as any) || project.summary?.startsWith('Hackathon Team Sprint');

  const navItems = [
    {
      label: 'Overview & Team',
      description: 'Scope, roster & details',
      href: `/projects/${projectId}/workspace`,
      exact: true,
      icon: LayoutDashboard,
    },
    {
      label: 'Tasks & Kanban',
      description: 'Sprint backlog & cards',
      href: `/projects/${projectId}/workspace/tasks`,
      icon: CheckSquare,
    },
    {
      label: 'Milestones',
      description: 'Roadmap & goals',
      href: `/projects/${projectId}/workspace/milestones`,
      icon: Milestone,
    },
    ...(!isHackathonWorkspace && workspaceFeatures.aiCloserKit
      ? [
          {
            label: 'AI Closer Kit',
            description: 'Recruitment & pitch',
            href: `/projects/${projectId}/workspace/closer-kit`,
            icon: Sparkles,
          },
        ]
      : []),
    ...(!isHackathonWorkspace && workspaceFeatures.liveToolBridge
      ? [
          {
            label: 'Live Tool Bridge',
            description: 'Dev environments',
            href: `/projects/${projectId}/workspace/bridge`,
            icon: Laptop,
          },
        ]
      : []),
    ...(!isHackathonWorkspace && workspaceFeatures.teamHuddle
      ? [
          {
            label: 'Team Huddle',
            description: 'Voice room & audio',
            href: `/projects/${projectId}/workspace/huddle`,
            icon: Headphones,
          },
        ]
      : []),
    ...(!isHackathonWorkspace && workspaceFeatures.proofOfWork
      ? [
          {
            label: 'Proof-of-Work',
            description: 'Verified certificates',
            href: `/projects/${projectId}/workspace/certificate`,
            icon: Award,
          },
        ]
      : []),
    {
      label: 'AI Planner',
      description: 'Sprint architect',
      href: `/projects/${projectId}/workspace/planner`,
      icon: Bot,
    },
    {
      label: 'GitHub Activity',
      description: 'Commits & PRs',
      href: `/projects/${projectId}/workspace/github`,
      icon: GitBranch,
    },
    {
      label: 'Discussions',
      description: 'Team messaging',
      href: `/projects/${projectId}/workspace/discussions`,
      icon: MessageSquare,
    },
  ];

  return (
    <WorkspaceContext.Provider
      value={{
        project,
        members,
        isOwner,
        isLead,
        currentUserMember,
        refreshWorkspace: loadWorkspaceData,
        workspaceFeatures,
        originInfo,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Workspace Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-charcoal-800">
          <div className="flex items-center gap-3">
            <Link
              href={
                originInfo?.originLink ||
                (hackathonId ? `/hackathons/${hackathonId}/workspace` : `/projects/${project.id}`)
              }
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-charcoal-900 dark:hover:bg-charcoal-800 border border-slate-200 dark:border-charcoal-750 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              title={
                originInfo?.originType === 'hackathon'
                  ? 'Return to Hackathon'
                  : originInfo?.originType === 'faculty_problem'
                  ? 'Return to Faculty Challenge'
                  : 'Return to Public Project Page'
              }
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {project.title}
                </h1>
                <Badge variant="status" status={project.status} />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 border border-brand-500/30 font-medium">
                  Workspace
                </span>
                {originInfo?.originType === 'hackathon' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" /> Hackathon Squad
                  </span>
                )}
                {originInfo?.originType === 'faculty_problem' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-purple-400" /> Faculty Challenge Squad
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                Private team environment • {members.length} active members • {project.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={
                originInfo?.originLink ||
                (hackathonId ? `/hackathons/${hackathonId}/workspace` : `/projects/${project.id}`)
              }
              target="_blank"
            >
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-charcoal-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-charcoal-800 font-semibold"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Public View
              </Button>
            </Link>
          </div>
        </div>

        {/* Workspace Provenance Banner: Where did this workspace come from? */}
        {originInfo && originInfo.originType === 'hackathon' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    🏆 Hackathon Sprint Workspace
                  </span>
                  {originInfo.isResultsAnnounced ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Results Announced • Event Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Live Active Sprint
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Squad workspace created for <strong className="text-white">{originInfo.originTitle}</strong>
                  {originInfo.originOrganizer ? ` • Organized by ${originInfo.originOrganizer}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={originInfo.originLink}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-bold text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Hackathon Arena &amp; Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {originInfo && originInfo.originType === 'faculty_problem' && (
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    🎓 Faculty Challenge Workspace
                  </span>
                  {originInfo.isResultsAnnounced ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Faculty Evaluated • Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Active Faculty Challenge
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Directly tackling problem: <strong className="text-white">{originInfo.originTitle}</strong>
                  {originInfo.originOrganizer ? ` • Mentor: ${originInfo.originOrganizer}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={originInfo.originLink}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 font-bold text-xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Faculty Problem Statement
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Workspace Body: Left Vertical Sidebar Navigation + Right Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start pt-2">
          {/* Left Column: Vertical Sidebar Navigation */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-24 space-y-3">
            <div className="rounded-2xl border border-slate-200 dark:border-charcoal-800/90 bg-white dark:bg-charcoal-900/80 backdrop-blur-md p-2.5 sm:p-3 shadow-sm dark:shadow-card space-y-2">
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200/80 dark:border-charcoal-800/70">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-500 shadow-xs shadow-brand-500/50" />
                  Project Workspace
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-charcoal-950/70 px-2 py-0.5 rounded border border-slate-200 dark:border-charcoal-800">
                  {navItems.length} Tabs
                </span>
              </div>

              {/* Vertical Navigation Items */}
              <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible scrollbar-none pb-1 lg:pb-0" aria-label="Project workspace tabs">
                {navItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-auto lg:w-full text-left px-3 sm:px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal relative ${
                        isActive
                          ? 'bg-brand-500/15 text-brand-700 dark:text-brand-200 border border-brand-500/40 shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-charcoal-850/80 border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <span className="hidden lg:block absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-500" />
                      )}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                            isActive
                              ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300'
                              : 'bg-slate-100 dark:bg-charcoal-800/80 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 group-hover:bg-slate-200 dark:group-hover:bg-charcoal-750'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate leading-tight">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="hidden lg:block text-[10px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-brand-500 shrink-0 hidden lg:block" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Quick Project Info in Sidebar */}
              <div className="hidden lg:block pt-3 border-t border-slate-200/80 dark:border-charcoal-800/70 mt-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-charcoal-950/70 border border-slate-200 dark:border-charcoal-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Your Role</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {currentUserMember?.role || (isOwner ? 'Project Owner' : 'Member')}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 dark:border-charcoal-800/60 text-[11px] flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Team Size:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {members.length} / {project.desired_team_size || 4}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Main Content */}
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
        </div>
      </div>
    </WorkspaceContext.Provider>
  );
}
