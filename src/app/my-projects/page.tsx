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
  Trophy,
  Lock,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

function MyProjectsContent() {
  const { user } = useAuth();
  const [leadingProjects, setLeadingProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<(Project & { userRole?: string })[]>([]);
  const [enrolledHackathons, setEnrolledHackathons] = useState<any[]>([]);
  const [hackathonCodeInput, setHackathonCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'leading' | 'joined' | 'hackathons'>('leading');
  const [isLoading, setIsLoading] = useState(true);

  const userRef = React.useRef(user);
  userRef.current = user;

  const loadProjects = useCallback(async (isInitial = false) => {
    const currentUserId = userRef.current?.id;
    if (!currentUserId) return;
    if (isInitial) {
      setIsLoading(true);
    }

    try {
      // 1. Fetch projects where user is owner
      const { data: ownedData } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', currentUserId)
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
        .eq('user_id', currentUserId);

      if (memberData) {
        const joined = memberData
          .filter((m) => m.project && (m.project as unknown as Project).owner_id !== currentUserId)
          .map((m) => ({
            ...(m.project as unknown as Project),
            userRole: m.role,
          }));
        setJoinedProjects(joined);
      }

      // 3. Fetch hackathon enrollments
      try {
        const { data: hackData } = await supabase
          .from('hackathon_participants')
          .select(`
            hackathon_id,
            team_id,
            role,
            hackathon:hackathons(*),
            team:hackathon_teams(
              id,
              name,
              status
            )
          `)
          .eq('user_id', currentUserId);

        if (hackData && hackData.length > 0) {
          setEnrolledHackathons(hackData);
        }
      } catch {
        // ignore
      }
    } catch {
      // ignore
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    loadProjects(true);

    let debounceTimer: NodeJS.Timeout | null = null;
    const handleSmoothUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadProjects(false);
      }, 200);
    };

    const channel = supabase
      .channel(`my-projects-live-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members',
          filter: `user_id=eq.${user.id}`,
        },
        handleSmoothUpdate
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadProjects]);

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

        <button
          onClick={() => setActiveTab('hackathons')}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'hackathons'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Private College Hackathons</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === 'hackathons' ? 'bg-amber-500 text-white' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {enrolledHackathons.length}
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
      ) : activeTab === 'joined' ? (
        joinedProjects.length === 0 ? (
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
        )
      ) : activeTab === 'hackathons' ? (
        enrolledHackathons.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-lg mx-auto">
              <h3 className="text-lg font-bold text-white">No College Hackathons Joined Yet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Faculty mentors create private campus hackathons protected by salted passcodes. Enter your event join code below to unlock released tracks, form your student team, and access your dedicated hackathon workspace.
              </p>
            </div>

            {/* Quick Join Code Form */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-charcoal-950 border border-amber-500/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (hackathonCodeInput.trim()) {
                    let clean = hackathonCodeInput.trim();
                    if (clean.includes('/h/')) clean = clean.split('/h/')[1];
                    clean = clean.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
                    window.location.href = `/h/${clean}`;
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Enter join code (e.g. col-apex26)..."
                  value={hackathonCodeInput}
                  onChange={(e) => setHackathonCodeInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                  leftIcon={<Lock className="w-3.5 h-3.5" />}
                >
                  Join
                </Button>
              </form>
            </div>

            {/* Quick suggestion chip */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>Featured Campus Event:</span>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/h/col-apex26';
                }}
                className="font-mono text-amber-300 hover:underline px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30"
              >
                col-apex26 (Apex 2026 Inter-College Hackathon)
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/hackathons">
                <Button variant="outline" size="sm" leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}>
                  Browse All College Events
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledHackathons.map((item: any, idx: number) => {
              const h = item.hackathon;
              if (!h) return null;
              return (
                <div
                  key={item.hackathon_id || idx}
                  className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-750/80 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" />
                        Private College Event
                      </span>
                      {item.role && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
                          {item.role}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white hover:text-amber-300 transition-colors">
                        {h.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {h.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-charcoal-800 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      {item.team?.name && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Users className="w-3.5 h-3.5 text-brand-400" />
                          Team: <strong className="text-white">{item.team.name}</strong>
                        </span>
                      )}
                      <span>Organizer: {h.organizer}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2">
                    <Link href={`/hackathons/${h.id}/workspace`}>
                      <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white" leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                        Open Hackathon Workspace
                      </Button>
                    </Link>
                    {h.join_code && (
                      <Link href={`/h/${h.join_code}`}>
                        <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Passcode Portal
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : null}
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
