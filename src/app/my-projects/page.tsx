'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { Project, ProjectMember } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  Users,
  PlusCircle,
  LayoutDashboard,
  Inbox,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';

function MyProjectsContent() {
  const { user } = useAuth();
  const [leadingProjects, setLeadingProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<(Project & { userRole?: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'leading' | 'joined'>('leading');
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // 1. Fetch projects where user is owner
      const { data: ownedData } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (ownedData) {
        setLeadingProjects(ownedData as Project[]);
      }

      // 2. Fetch projects where user is a member (excluding owned projects to avoid duplication)
      const { data: memberData } = await supabase
        .from('project_members')
        .select(`
          role,
          project:projects!project_members_project_id_fkey(
            id,
            owner_id,
            title,
            summary,
            category,
            difficulty,
            status,
            current_team_size,
            desired_team_size,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (memberData) {
        const joined = memberData
          .filter((m) => m.project && (m.project as unknown as Project).owner_id !== user.id)
          .map((m) => ({
            ...(m.project as unknown as Project),
            userRole: m.role,
          }));
        setJoinedProjects(joined);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-brand-400" />
            <span>My Projects & Teams</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access private workspaces for projects you lead and teams you have joined.
          </p>
        </div>

        <Link href="/projects/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Start New Project
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3 text-sm">
        <button
          onClick={() => setActiveTab('leading')}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'leading'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <span>Projects I Lead</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'leading' ? 'bg-brand-500 text-white' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {leadingProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'joined'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <span>Teams I Joined</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'joined' ? 'bg-brand-500 text-white' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {joinedProjects.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading projects...</p>
        </div>
      ) : activeTab === 'leading' ? (
        leadingProjects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-brand-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">You haven&apos;t created any projects yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start your first project to publish role requirements, receive student applications, and collaborate in private workspaces.
            </p>
            <Link href="/projects/new">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Create a Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadingProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 flex flex-col justify-between space-y-5 hover:border-charcoal-700 transition-all shadow-subtle"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="category">{p.category}</Badge>
                    <Badge variant="status" status={p.status} />
                  </div>

                  <div>
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-lg font-bold text-white hover:text-brand-300 transition-colors"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-charcoal-800">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-400" />
                      {p.current_team_size} / {p.desired_team_size} members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${p.id}/applications`}>
                      <Button variant="outline" size="sm" leftIcon={<Inbox className="w-3.5 h-3.5 text-brand-400" />}>
                        Applications
                      </Button>
                    </Link>
                    <Link href={`/projects/${p.id}/workspace`}>
                      <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                        Workspace
                      </Button>
                    </Link>
                  </div>
                  <Link href={`/projects/${p.id}`}>
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : joinedProjects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">You haven&apos;t joined any teams yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore active projects and apply for roles matching your coursework and engineering skills.
          </p>
          <Link href="/explore">
            <Button variant="primary" size="sm">Explore Open Projects</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {joinedProjects.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 flex flex-col justify-between space-y-5 hover:border-charcoal-700 transition-all shadow-subtle"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="category">{p.category}</Badge>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {p.userRole || 'Contributor'}
                  </span>
                </div>

                <div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-lg font-bold text-white hover:text-brand-300 transition-colors"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.summary}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-charcoal-800">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-400" />
                    {p.current_team_size} members
                  </span>
                  <Badge variant="status" status={p.status} />
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2 flex-wrap">
                <Link href={`/projects/${p.id}/workspace`}>
                  <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                    Open Team Workspace
                  </Button>
                </Link>
                <Link href={`/projects/${p.id}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyProjectsPage() {
  return (
    <ProtectedPageGuard>
      <MyProjectsContent />
    </ProtectedPageGuard>
  );
}
