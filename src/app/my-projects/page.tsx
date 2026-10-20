'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { Project, ProjectMember, Hackathon, HackathonTeam } from '@/types/database';
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
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import { getPageCache, setPageCache } from '@/lib/cache/pageDataCache';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { isHackathonClosed, formatTimeRemaining } from '@/lib/hackathons/hackathonStatus';

interface UserHackathonSprint {
  hackathon_id: string;
  team_id?: string | null;
  team_name?: string | null;
  invite_code?: string | null;
  role?: string | null;
  hackathon: Hackathon;
  team?: Partial<HackathonTeam> | null;
  members?: Array<{ user_id: string; display_name: string; avatar_url?: string | null }>;
  isClosed: boolean;
  timeRemaining?: string | null;
}

function MyProjectsContent() {
  const { user } = useAuth();
  const cachedWorkspace = user?.id ? getPageCache<any>(`linkora_user_workspace_${user.id}`) : null;

  const [leadingProjects, setLeadingProjects] = useState<Project[]>(() => cachedWorkspace?.leading || []);
  const [joinedProjects, setJoinedProjects] = useState<(Project & { userRole?: string })[]>(() => cachedWorkspace?.joined || []);
  const [allHackathonSprints, setAllHackathonSprints] = useState<UserHackathonSprint[]>(() => cachedWorkspace?.hackSprints || []);
  const [hackathonCodeInput, setHackathonCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'leading' | 'joined' | 'hackathons'>('leading');
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedWorkspace);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const userRef = React.useRef(user);
  userRef.current = user;

  // Active Hackathon Sprints (temporary event workshops)
  // AUTOMATICALLY EXPIRES & REMOVED when hackathon closes!
  const activeHackathonSprints = useMemo(() => {
    return allHackathonSprints.filter((s) => !s.isClosed);
  }, [allHackathonSprints]);

  const closedHackathonSprints = useMemo(() => {
    return allHackathonSprints.filter((s) => s.isClosed);
  }, [allHackathonSprints]);

  const loadProjects = useCallback(async (isInitial = false) => {
    const currentUserId = userRef.current?.id;
    if (!currentUserId) return;
    if (isInitial && !cachedWorkspace) {
      setIsLoading(true);
    }

    try {
      // 1. Fetch permanent projects where user is owner
      const { data: ownedData } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', currentUserId)
        .order('created_at', { ascending: false });

      if (ownedData) {
        setLeadingProjects(ownedData as Project[]);
      }

      // 2. Fetch permanent projects where user is a joined team member
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

      // 3. Fetch all hackathon teams user belongs to
      // (from hackathon_team_members, hackathon_teams, hackathon_participants, and local storage)
      const hackathonMap = new Map<string, UserHackathonSprint>();

      try {
        // A. Check hackathon_team_members
        const { data: memberTeams } = await supabase
          .from('hackathon_team_members')
          .select(`
            team_id,
            role,
            team:hackathon_teams(
              id,
              team_name,
              invite_code,
              challenge_id,
              hackathon:hackathons(*),
              members:hackathon_team_members(
                user_id,
                role,
                profile:profiles(user_id, display_name, avatar_url)
              )
            )
          `)
          .eq('user_id', currentUserId);

        if (Array.isArray(memberTeams)) {
          for (const item of memberTeams) {
            const t = (item as any).team;
            const h = t?.hackathon;
            if (h?.id && t?.id) {
              const closed = isHackathonClosed(h);
              const membersList = (t.members || []).map((m: any) => ({
                user_id: m.user_id,
                display_name: m.profile?.display_name || 'Student',
                avatar_url: m.profile?.avatar_url || null,
              }));

              hackathonMap.set(h.id, {
                hackathon_id: h.id,
                team_id: t.id,
                team_name: t.team_name,
                invite_code: t.invite_code,
                role: item.role || 'Member',
                hackathon: h,
                team: t,
                members: membersList,
                isClosed: closed,
                timeRemaining: formatTimeRemaining(h.submission_deadline || h.end_date),
              });
            }
          }
        }

        // B. Check hackathon_teams where user is the leader
        const { data: leaderTeams } = await supabase
          .from('hackathon_teams')
          .select(`
            id,
            team_name,
            invite_code,
            challenge_id,
            hackathon:hackathons(*),
            members:hackathon_team_members(
              user_id,
              role,
              profile:profiles(user_id, display_name, avatar_url)
            )
          `)
          .eq('leader_id', currentUserId);

        if (Array.isArray(leaderTeams)) {
          for (const t of leaderTeams as any[]) {
            const h = t?.hackathon;
            if (h?.id && !hackathonMap.has(h.id)) {
              const closed = isHackathonClosed(h);
              const membersList = (t.members || []).map((m: any) => ({
                user_id: m.user_id,
                display_name: m.profile?.display_name || 'Student',
                avatar_url: m.profile?.avatar_url || null,
              }));

              hackathonMap.set(h.id, {
                hackathon_id: h.id,
                team_id: t.id,
                team_name: t.team_name,
                invite_code: t.invite_code,
                role: 'Leader',
                hackathon: h,
                team: t,
                members: membersList,
                isClosed: closed,
                timeRemaining: formatTimeRemaining(h.submission_deadline || h.end_date),
              });
            }
          }
        }

        // C. Check hackathon_participants as fallback
        const { data: partData } = await supabase
          .from('hackathon_participants')
          .select(`
            hackathon_id,
            team_id,
            role,
            hackathon:hackathons(*)
          `)
          .eq('user_id', currentUserId);

        if (Array.isArray(partData)) {
          for (const p of partData as any[]) {
            const h = p?.hackathon;
            if (h?.id && !hackathonMap.has(h.id)) {
              const closed = isHackathonClosed(h);
              hackathonMap.set(h.id, {
                hackathon_id: h.id,
                team_id: p.team_id || null,
                team_name: 'Enrolled Hackathon Participant',
                role: p.role || 'Participant',
                hackathon: h,
                team: null,
                members: [],
                isClosed: closed,
                timeRemaining: formatTimeRemaining(h.submission_deadline || h.end_date),
              });
            }
          }
        }

        // D. Also check localStorage for local/mock hackathons
        if (typeof window !== 'undefined') {
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith('teamforge_teams_')) {
                const hackId = k.replace('teamforge_teams_', '');
                if (!hackathonMap.has(hackId)) {
                  const teamsArr = JSON.parse(localStorage.getItem(k) || '[]');
                  const userTeam = teamsArr.find((t: any) =>
                    t.leader_id === currentUserId || (t.members || []).some((m: any) => m.user_id === currentUserId)
                  );
                  if (userTeam) {
                    const curated = CURATED_HACKATHONS.find((c) => c.id === hackId);
                    if (curated) {
                      const closed = isHackathonClosed(curated);
                      hackathonMap.set(hackId, {
                        hackathon_id: hackId,
                        team_id: userTeam.id,
                        team_name: userTeam.team_name,
                        invite_code: userTeam.invite_code,
                        role: userTeam.leader_id === currentUserId ? 'Leader' : 'Member',
                        hackathon: curated as any,
                        team: userTeam,
                        members: (userTeam.members || []).map((m: any) => ({
                          user_id: m.user_id,
                          display_name: m.profile?.display_name || 'Teammate',
                          avatar_url: m.profile?.avatar_url,
                        })),
                        isClosed: closed,
                        timeRemaining: formatTimeRemaining(curated.submission_deadline || curated.end_date),
                      });
                    }
                  }
                }
              }
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Error fetching hackathon teams:', err);
      }

      const allSprints = Array.from(hackathonMap.values());
      setAllHackathonSprints(allSprints);

      setPageCache(`linkora_user_workspace_${currentUserId}`, {
        leading: ownedData || [],
        joined: memberData
          ? memberData
              .filter((m) => m.project && (m.project as unknown as Project).owner_id !== currentUserId)
              .map((m) => ({
                ...(m.project as unknown as Project),
                userRole: m.role,
              }))
          : [],
        hackSprints: allSprints,
      });
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
      }, 250);
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hackathon_team_members',
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
            <span>My Projects &amp; Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Access permanent project workspaces and active campus hackathon workshops.
          </p>
        </div>

        <Link href="/projects/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Start New Project
          </Button>
        </Link>
      </div>

      {/* ACTIVE HACKATHON SPRINT BANNER (Visible immediately if user has an ongoing hackathon team) */}
      {activeHackathonSprints.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Active Hackathon Team Sprint
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Workshop Open
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeHackathonSprints[0].hackathon.title} — Team &ldquo;{activeHackathonSprints[0].team_name}&rdquo;
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1 text-amber-300 font-mono font-semibold">
                  <Clock className="w-3 h-3" />
                  {activeHackathonSprints[0].timeRemaining}
                </span>
                <span>•</span>
                <span>Host: {activeHackathonSprints[0].hackathon.organizer}</span>
              </p>
            </div>
          </div>

          <Link href={`/hackathons/${activeHackathonSprints[0].hackathon_id}/workspace`}>
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold whitespace-nowrap shadow-sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Team Workshop
            </Button>
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3 text-sm overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('leading')}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'leading'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <span>Projects I Lead (Permanent)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono ${
              activeTab === 'leading' ? 'bg-brand-500 text-white' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {leadingProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'joined'
              ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <span>Teams I Joined (Permanent)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono ${
              activeTab === 'joined' ? 'bg-brand-500 text-white' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {joinedProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hackathons')}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'hackathons'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Active Hackathon Sprints</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'hackathons' ? 'bg-amber-500 text-white' : 'bg-charcoal-750 text-slate-400'
            }`}
          >
            {activeHackathonSprints.length}
          </span>
          {activeHackathonSprints.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5" />
          )}
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading workspaces &amp; sprints...</p>
        </div>
      ) : activeTab === 'leading' ? (
        /* ================= 1. PROJECTS I LEAD (PERMANENT) ================= */
        leadingProjects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-brand-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">You haven&apos;t created any projects yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start your first project to publish role requirements, receive student applications, and collaborate in permanent team workspaces.
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                      Permanent Project
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
        /* ================= 2. TEAMS I JOINED (PERMANENT) ================= */
        joinedProjects.length === 0 ? (
          <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">You haven&apos;t joined any project teams yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore active projects and apply for roles matching your engineering skills. Joined project teams remain permanently accessible.
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        Permanent Team
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {p.userRole || 'Contributor'}
                      </span>
                    </div>
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
        /* ================= 3. ACTIVE HACKATHON SPRINTS (TEMPORARY WORKSHOP) ================= */
        <div className="space-y-8">
          {activeHackathonSprints.length === 0 ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto">
                <Trophy className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-white">No Active Hackathon Sprints</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you form or join a team for a college hackathon, your collaborative team workshop appears here during the event.
                  <strong className="text-slate-300 block mt-1">
                    Hackathon workshops automatically close when the event deadline ends, while your regular project teams remain forever.
                  </strong>
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
                    placeholder="Enter event join code (e.g. col-apex26)..."
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

              <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="/hackathons">
                  <Button variant="outline" size="sm" leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}>
                    Browse Active College Hackathons
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-mono uppercase font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Active Event Workshops ({activeHackathonSprints.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Workshops automatically close when the hackathon timeline ends
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeHackathonSprints.map((item) => {
                  const h = item.hackathon;
                  return (
                    <div
                      key={item.hackathon_id}
                      className="p-6 rounded-2xl bg-charcoal-900 border border-amber-500/40 hover:border-amber-400 transition-all flex flex-col justify-between gap-5 shadow-sm relative overflow-hidden"
                    >
                      {/* Top Accent Strip */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Active Hackathon Sprint
                          </span>

                          <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1 bg-charcoal-950 px-2.5 py-0.5 rounded-full border border-charcoal-800">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {item.timeRemaining}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400">
                            Hackathon: <strong className="text-slate-200">{h.title}</strong>
                          </div>
                          <h4 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                            <span>Team &ldquo;{item.team_name}&rdquo;</span>
                            {item.role && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                {item.role}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {h.description}
                          </p>
                        </div>

                        {/* Team Teammates Roster */}
                        <div className="p-3 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-brand-400" />
                              Squad Workshop Members ({item.members?.length || 1})
                            </span>
                            {item.invite_code && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(item.invite_code!);
                                  setCopiedCode(item.invite_code!);
                                  setTimeout(() => setCopiedCode(null), 2000);
                                }}
                                className="text-[11px] font-mono text-amber-300 hover:underline flex items-center gap-1"
                              >
                                <span>Code: {item.invite_code}</span>
                                <Copy className="w-3 h-3" />
                                {copiedCode === item.invite_code && (
                                  <span className="text-emerald-400">Copied!</span>
                                )}
                              </button>
                            )}
                          </div>

                          {item.members && item.members.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {item.members.map((m, mIdx) => (
                                <span
                                  key={m.user_id || mIdx}
                                  className="text-[11px] px-2 py-0.5 rounded-lg bg-charcoal-850 border border-charcoal-750 text-slate-300 font-medium"
                                >
                                  {m.display_name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 font-mono">
                          Faculty / Organizer: <strong className="text-slate-400">{h.organizer}</strong>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2">
                        <Link href={`/hackathons/${h.id}/workspace`}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                            leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                          >
                            Open Team Workshop
                          </Button>
                        </Link>

                        {h.join_code && (
                          <Link href={`/h/${h.join_code}`}>
                            <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                              Event Brief
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLOSED / ARCHIVED HACKATHONS ACCORDION (Clearly shows workshops are closed) */}
          {closedHackathonSprints.length > 0 && (
            <div className="pt-6 border-t border-charcoal-800 space-y-3">
              <div className="text-xs font-mono uppercase font-bold text-slate-500 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Closed Hackathon Events ({closedHackathonSprints.length})</span>
              </div>
              <p className="text-xs text-slate-500">
                These events have completed their timeline. Active team workshop collaboration is closed, but your submissions and certificates remain archived.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {closedHackathonSprints.map((item) => (
                  <div
                    key={item.hackathon_id}
                    className="p-4 rounded-xl bg-charcoal-900/60 border border-charcoal-800 opacity-75 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Event Closed
                      </span>
                      <h5 className="text-sm font-bold text-slate-300 mt-1">
                        {item.hackathon.title} — Team &ldquo;{item.team_name}&rdquo;
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        Workshop expired • Host: {item.hackathon.organizer}
                      </span>
                    </div>

                    <Link href={`/hackathons/${item.hackathon_id}/workspace`}>
                      <Button variant="ghost" size="sm" className="text-xs text-slate-400">
                        View Archive
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
