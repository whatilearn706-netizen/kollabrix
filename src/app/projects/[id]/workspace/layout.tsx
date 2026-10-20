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
} from 'lucide-react';
import {
  WorkspaceFeaturesConfig,
  DEFAULT_MASTER_CONTROL_CONFIG,
} from '@/types/masterControl';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { isHackathonClosed } from '@/lib/hackathons/hackathonStatus';

interface WorkspaceContextType {
  project: Project;
  members: ProjectMember[];
  isOwner: boolean;
  isLead: boolean;
  currentUserMember: ProjectMember | null;
  refreshWorkspace: () => Promise<void>;
  workspaceFeatures: WorkspaceFeaturesConfig;
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
            // Build synthetic Project object (Strictly categorized as Hackathon Sprint so it never leaks into Explore or Permanent Projects)
            const hackProj: Project = {
              id: teamData.id,
              owner_id: teamData.leader_id,
              title: teamData.team_name,
              summary: `Hackathon Team Sprint: ${h?.title || 'Campus Hackathon'}${teamData.description ? ` — ${teamData.description}` : ''}`,
              description: `### Problem Statement\n${teamData.challenge?.title || teamData.description || 'Assigned Hackathon Challenge'}\n\n### Proposed Solution\nBuilding an innovative solution for ${h?.title || 'the campus hackathon sprint'}.\n\n### Tech Stack & Architecture\n${(h?.themes || ['Next.js', 'React', 'TypeScript', 'TailwindCSS']).join(', ')}\n\n### Who We Need\nCollegiate student builders collaborating during the hackathon sprint.`,
              category: 'Hackathon Sprint' as any,
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
      }

      setHackathonId(detectedHackathonId);
      setIsHackathonClosedState(detectedClosed);

      if (projError || !projData) {
        setIsAuthorized(false);
        if (isInitial) setIsLoading(false);
        return;
      }

      setProject(projData as Project);

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
      setMembers(memList);

      const userMember = memList.find((m) => m.user_id === currentUserId) || null;
      setCurrentUserMember(userMember);

      const isOwner = projData.owner_id === currentUserId;
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

  if (isHackathonClosedState) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-elevated">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Hackathon Sprint Concluded</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The official hackathon timeline has ended. As scheduled, temporary event sprint workshops are closed and archived. Your permanent projects remain accessible forever.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/my-projects">
            <Button variant="primary" size="sm">
              Back to Workspaces
            </Button>
          </Link>
          {hackathonId && (
            <Link href={`/hackathons/${hackathonId}/workspace`}>
              <Button variant="outline" size="sm">
                View Event Submissions
              </Button>
            </Link>
          )}
        </div>
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
  const isHackathonWorkspace = Boolean(hackathonId) || project.category === ('Hackathon Sprint' as any);

  const navItems = [
    {
      label: 'Overview & Team',
      href: `/projects/${projectId}/workspace`,
      exact: true,
      icon: LayoutDashboard,
    },
    {
      label: 'Tasks & Kanban',
      href: `/projects/${projectId}/workspace/tasks`,
      icon: CheckSquare,
    },
    {
      label: 'Milestones',
      href: `/projects/${projectId}/workspace/milestones`,
      icon: Milestone,
    },
    ...(!isHackathonWorkspace && workspaceFeatures.aiCloserKit
      ? [
          {
            label: 'AI Closer Kit',
            href: `/projects/${projectId}/workspace/closer-kit`,
            icon: Sparkles,
          },
        ]
      : []),
    ...(!isHackathonWorkspace && workspaceFeatures.liveToolBridge
      ? [
          {
            label: 'Live Tool Bridge',
            href: `/projects/${projectId}/workspace/bridge`,
            icon: Laptop,
          },
        ]
      : []),
    ...(!isHackathonWorkspace && workspaceFeatures.teamHuddle
      ? [
          {
            label: 'Team Huddle',
            href: `/projects/${projectId}/workspace/huddle`,
            icon: Headphones,
          },
        ]
      : []),
    ...(!isHackathonWorkspace && workspaceFeatures.proofOfWork
      ? [
          {
            label: 'Proof-of-Work',
            href: `/projects/${projectId}/workspace/certificate`,
            icon: Award,
          },
        ]
      : []),
    {
      label: 'AI Planner',
      href: `/projects/${projectId}/workspace/planner`,
      icon: Bot,
    },
    {
      label: 'GitHub Activity',
      href: `/projects/${projectId}/workspace/github`,
      icon: GitBranch,
    },
    {
      label: 'Discussions',
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
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Workspace Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
          <div className="flex items-center gap-3">
            <Link
              href={
                hackathonId
                  ? `/hackathons/${hackathonId}/workspace`
                  : `/projects/${project.id}`
              }
              className="p-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-750 text-slate-400 hover:text-white transition-colors"
              title={hackathonId ? 'Return to Hackathon' : 'Return to Public Project Page'}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {project.title}
                </h1>
                <Badge variant="status" status={project.status} />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-medium">
                  Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Private team environment • {members.length} active members • {project.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={
                hackathonId
                  ? `/hackathons/${hackathonId}/workspace`
                  : `/projects/${project.id}`
              }
              target="_blank"
            >
              <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Public View
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-charcoal-800 pb-2 text-xs">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main Workspace Body */}
        <div className="pt-2">{children}</div>
      </div>
    </WorkspaceContext.Provider>
  );
}
