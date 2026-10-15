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
} from 'lucide-react';

interface WorkspaceContextType {
  project: Project;
  members: ProjectMember[];
  isOwner: boolean;
  isLead: boolean;
  currentUserMember: ProjectMember | null;
  refreshWorkspace: () => Promise<void>;
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

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [currentUserMember, setCurrentUserMember] = useState<ProjectMember | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspaceData = async () => {
    if (!projectId || !user) return;

    try {
      // 1. Fetch project
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projError || !projData) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      setProject(projData as Project);

      // 2. Fetch project members with profiles
      const { data: membersData, error: memError } = await supabase
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
            interests
          )
        `)
        .eq('project_id', projectId);

      const memList = (membersData as unknown as ProjectMember[]) || [];
      setMembers(memList);

      const userMember = memList.find((m) => m.user_id === user.id) || null;
      setCurrentUserMember(userMember);

      const isOwner = projData.owner_id === user.id;
      const hasMembership = Boolean(userMember);

      if (isOwner || hasMembership) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch {
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
      } else {
        loadWorkspaceData();
      }
    }
  }, [projectId, user, isAuthLoading]);

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
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Workspace Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
          <div className="flex items-center gap-3">
            <Link
              href={`/projects/${project.id}`}
              className="p-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-750 text-slate-400 hover:text-white transition-colors"
              title="Return to Public Project Page"
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
            <Link href={`/projects/${project.id}`} target="_blank">
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
