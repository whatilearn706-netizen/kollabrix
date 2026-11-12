'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { Project, Hackathon, HackathonTeam } from '@/types/database';
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
  ExternalLink,
  Zap,
  Clock,
  CheckCircle2,
  Copy,
  GraduationCap,
} from 'lucide-react';
import { getPageCache, setPageCache } from '@/lib/cache/pageDataCache';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { DEMO_PROBLEMS } from '@/data/mockProblems';
import {
  isHackathonClosed,
  isHackathonResultsAnnounced,
  formatTimeRemaining,
} from '@/lib/hackathons/hackathonStatus';
import {
  resolveWorkspaceOrigin,
  extractHackathonMeta,
  extractFacultyProblemTitle,
  WorkspaceOriginInfo,
} from '@/lib/workspaces/workspaceOrigin';
import { WorkspaceCard, EnrichedWorkspaceItem } from '@/components/workspaces/WorkspaceCard';

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

  const [allWorkspaces, setAllWorkspaces] = useState<EnrichedWorkspaceItem[]>(() => cachedWorkspace?.allWorkspaces || []);
  const [allHackathonSprints, setAllHackathonSprints] = useState<UserHackathonSprint[]>(() => cachedWorkspace?.hackSprints || []);
  const [activeTab, setActiveTab] = useState<'working' | 'done' | 'registered' | 'permanent'>('working');
  const [workingFilter, setWorkingFilter] = useState<'all' | 'hackathon' | 'faculty' | 'permanent'>('all');
  const [doneFilter, setDoneFilter] = useState<'all' | 'hackathon' | 'faculty' | 'permanent'>('all');
  const [permanentFilter, setPermanentFilter] = useState<'all' | 'leading' | 'joined'>('all');
  const [hackathonCodeInput, setHackathonCodeInput] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(() => !cachedWorkspace);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const userRef = React.useRef(user);
  userRef.current = user;

  const isHackathonStarted = (h: Hackathon) => {
    if (!h?.start_date) return true;
    return new Date(h.start_date).getTime() <= Date.now();
  };

  // Registered Hackathons (Upcoming Sprints before start_date)
  const registeredUpcomingHackathons = useMemo(() => {
    return allHackathonSprints.filter((s) => !s.isClosed && !isHackathonStarted(s.hackathon));
  }, [allHackathonSprints]);

  // Helper to determine if a workspace has truly concluded and belongs in "Workspaces Done (Results Announced)"
  const isWorkspaceDone = (w: EnrichedWorkspaceItem) => {
    if (w.origin.originType === 'hackathon') {
      // Hackathons only move to "Done (Results Announced)" once official results are published/announced!
      // While submissions are closed and jury review is underway, the workspace remains active in "Working Now".
      return Boolean(w.origin.isResultsAnnounced);
    }
    if (w.origin.originType === 'faculty_problem') {
      return Boolean(w.origin.isResultsAnnounced);
    }
    // Permanent projects
    return w.status === 'Completed';
  };

  // Workspaces currently running (Hackathons underway or awaiting results, active faculty challenges, active projects)
  const activeWorkspaces = useMemo(() => {
    return allWorkspaces.filter((w) => !isWorkspaceDone(w));
  }, [allWorkspaces]);

  // Workspaces concluded (Hackathon results published, faculty evaluations completed, or projects finished)
  const doneWorkspaces = useMemo(() => {
    return allWorkspaces.filter((w) => isWorkspaceDone(w));
  }, [allWorkspaces]);

  // Independent permanent portfolio projects
  const permanentProjects = useMemo(() => {
    return allWorkspaces.filter((w) => w.origin.originType === 'permanent');
  }, [allWorkspaces]);

  // Filtered lists by sub-filter
  const filteredActiveWorkspaces = useMemo(() => {
    if (workingFilter === 'hackathon') {
      return activeWorkspaces.filter((w) => w.origin.originType === 'hackathon');
    }
    if (workingFilter === 'faculty') {
      return activeWorkspaces.filter((w) => w.origin.originType === 'faculty_problem');
    }
    if (workingFilter === 'permanent') {
      return activeWorkspaces.filter((w) => w.origin.originType === 'permanent');
    }
    return activeWorkspaces;
  }, [activeWorkspaces, workingFilter]);

  const filteredDoneWorkspaces = useMemo(() => {
    if (doneFilter === 'hackathon') {
      return doneWorkspaces.filter((w) => w.origin.originType === 'hackathon');
    }
    if (doneFilter === 'faculty') {
      return doneWorkspaces.filter((w) => w.origin.originType === 'faculty_problem');
    }
    if (doneFilter === 'permanent') {
      return doneWorkspaces.filter((w) => w.origin.originType === 'permanent');
    }
    return doneWorkspaces;
  }, [doneWorkspaces, doneFilter]);

  const filteredPermanentProjects = useMemo(() => {
    if (permanentFilter === 'leading') {
      return permanentProjects.filter((w) => w.isOwner);
    }
    if (permanentFilter === 'joined') {
      return permanentProjects.filter((w) => !w.isOwner);
    }
    return permanentProjects;
  }, [permanentProjects, permanentFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadProjects = useCallback(async (isInitial = false) => {
    const currentUserId = userRef.current?.id;
    if (!currentUserId) return;
    if (isInitial && !cachedWorkspace) {
      setIsLoading(true);
    }

    try {
      // 1. Fetch available Hackathons & Problem Statements to establish canonical provenance
      let allHackathons: Partial<Hackathon>[] = [...CURATED_HACKATHONS];
      try {
        const { data: dbHacks } = await supabase
          .from('hackathons')
          .select('id, title, organizer, description, mode, location, start_date, end_date, submission_deadline, registration_deadline, results_date, results_published, status, min_team_size, max_team_size, eligibility, themes');
        if (Array.isArray(dbHacks)) {
          const dbMap = new Map(allHackathons.map((h) => [h.id, h]));
          for (const h of dbHacks) {
            dbMap.set(h.id, { ...(dbMap.get(h.id) || {}), ...h });
          }
          allHackathons = Array.from(dbMap.values());
        }
      } catch (err) {
        console.warn('Could not load remote hackathons:', err);
      }

      let allProblems: any[] = [...DEMO_PROBLEMS];
      try {
        const { data: dbProblems } = await supabase
          .from('problem_statements')
          .select('id, title, description, category, difficulty, deadline, status, author:profiles(display_name)');
        if (Array.isArray(dbProblems)) {
          const pMap = new Map(allProblems.map((p) => [p.id, p]));
          for (const p of dbProblems) {
            pMap.set(p.id, { ...(pMap.get(p.id) || {}), ...p });
          }
          allProblems = Array.from(pMap.values());
        }
      } catch (err) {
        console.warn('Could not load remote problems:', err);
      }

      // 1b. Fetch platform tombstones for deleted hackathons and problem statements
      let deletedHackIds = new Set<string>();
      let deletedHackTitles = new Set<string>();
      let deletedProblemIds = new Set<string>();
      let deletedProblemTitles = new Set<string>();

      try {
        const { data: tombstoneRows } = await supabase
          .from('platform_settings')
          .select('key, value')
          .in('key', ['deleted_hackathons', 'deleted_problems']);

        for (const row of tombstoneRows || []) {
          if (row.key === 'deleted_hackathons' && row.value) {
            const raw = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
            (raw.deletedIds || []).forEach((id: string) => deletedHackIds.add(String(id).trim().toLowerCase()));
            (raw.deletedTitles || []).forEach((t: string) => deletedHackTitles.add(String(t).trim().toLowerCase()));
          }
          if (row.key === 'deleted_problems' && row.value) {
            const raw = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
            (raw.deletedIds || []).forEach((id: string) => deletedProblemIds.add(String(id).trim().toLowerCase()));
            (raw.deletedTitles || []).forEach((t: string) => deletedProblemTitles.add(String(t).trim().toLowerCase()));
          }
        }
      } catch {}

      // Filter active hackathons and problems lists so deleted items never establish active provenance
      allHackathons = allHackathons.filter(
        (h) => !deletedHackIds.has((h.id || '').toLowerCase()) && !deletedHackTitles.has((h.title || '').trim().toLowerCase())
      );
      allProblems = allProblems.filter(
        (p) => !deletedProblemIds.has((p.id || '').toLowerCase()) && !deletedProblemTitles.has((p.title || '').trim().toLowerCase())
      );

      // Helper: Determines if a workspace was made on a deleted hackathon or deleted faculty problem
      const isWorkspaceOrphaned = (item: any): boolean => {
        if (!item) return false;
        const desc = item.description || '';
        const summary = item.summary || '';
        const cat = (item.category || '').toLowerCase();

        // 1. Hackathon provenance check
        const hackMeta = extractHackathonMeta(desc);
        const hackId = (hackMeta?.hackathon_id || item.hackathon_id || '').toLowerCase().trim();
        const hackTitle = (
          hackMeta?.hackathon_title ||
          (summary.includes('—') ? summary.split('Hackathon Team Sprint:')[1]?.split('—')[0]?.trim() : '')
        ).toLowerCase().trim();

        const isHackathonTagged =
          Boolean(hackMeta) ||
          Boolean(hackId) ||
          cat === 'hackathon sprint' ||
          summary.startsWith('hackathon team sprint');

        if (isHackathonTagged) {
          if (hackId && deletedHackIds.has(hackId)) return true;
          if (hackTitle && deletedHackTitles.has(hackTitle)) return true;

          // If it references a specific hackathon ID not in active hackathons list
          if (hackId) {
            const exists = allHackathons.some((h) => (h.id || '').toLowerCase() === hackId);
            if (!exists) return true;
          }
          if (hackTitle && !hackId) {
            const exists = allHackathons.some((h) => (h.title || '').trim().toLowerCase() === hackTitle);
            if (!exists) return true;
          }
        }

        // 2. Faculty Problem provenance check
        const probId = (item.problem_statement_id || (item.problem_statement && item.problem_statement.id) || '').toLowerCase().trim();
        const facultyTitle = (extractFacultyProblemTitle(desc) || '').toLowerCase().trim();
        const isFacultyTagged = Boolean(probId) || Boolean(facultyTitle) || cat === 'faculty industry problem';

        if (isFacultyTagged) {
          if (probId && deletedProblemIds.has(probId)) return true;
          if (facultyTitle && deletedProblemTitles.has(facultyTitle)) return true;

          // If it references a specific problem ID not in active problems list
          if (probId) {
            const exists = allProblems.some((pr) => (pr.id || '').toLowerCase() === probId);
            if (!exists) return true;
          }
          if (facultyTitle && !probId) {
            const exists = allProblems.some((pr) => (pr.title || '').trim().toLowerCase() === facultyTitle);
            if (!exists) return true;
          }
        }

        return false;
      };

      // 2. Fetch projects owned by current user
      const { data: ownedData } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', currentUserId)
        .order('created_at', { ascending: false });

      const workspaceMap = new Map<string, EnrichedWorkspaceItem>();

      if (Array.isArray(ownedData)) {
        for (const p of ownedData as Project[]) {
          if (isWorkspaceOrphaned(p)) {
            // Automatically clean up deleted event workspaces from database so account is cleanly organized
            supabase.from('projects').delete().eq('id', p.id).then();
            continue;
          }
          const origin = resolveWorkspaceOrigin(p, {
            hackathons: allHackathons,
            problemStatements: allProblems,
          });
          workspaceMap.set(p.id, {
            id: p.id,
            title: p.title,
            summary: p.summary,
            description: p.description,
            category: p.category,
            status: p.status,
            current_team_size: p.current_team_size || 1,
            desired_team_size: p.desired_team_size || 4,
            created_at: p.created_at,
            isOwner: true,
            userRole: 'Team Lead',
            origin,
          });
        }
      }

      // 3. Merge problem teams from platform_settings registry
      try {
        const { data: regRow } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'problem_teams_registry')
          .maybeSingle();

        if (Array.isArray(regRow?.value)) {
          const userProblemTeams = regRow.value.filter(
            (p: any) => p && (p.owner_id === currentUserId || p.owner?.user_id === currentUserId)
          );
          for (const pt of userProblemTeams) {
            if (isWorkspaceOrphaned(pt)) continue;
            const origin = resolveWorkspaceOrigin(pt, {
              hackathons: allHackathons,
              problemStatements: allProblems,
            });
            const existing = workspaceMap.get(pt.id);
            workspaceMap.set(pt.id, {
              id: pt.id,
              title: pt.title,
              summary: pt.summary,
              description: pt.description,
              category: pt.category || 'Web Development',
              status: pt.status || 'In Progress',
              current_team_size: pt.current_team_size || 1,
              desired_team_size: pt.desired_team_size || 4,
              created_at: pt.created_at || new Date().toISOString(),
              isOwner: true,
              userRole: 'Team Lead',
              invite_code: existing?.invite_code || pt.invite_code,
              members: existing?.members || pt.members,
              origin,
            });
          }
        }
      } catch {}

      // 4. Merge problem teams from localStorage
      if (typeof window !== 'undefined') {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('tf_problem_teams_')) {
              const list = JSON.parse(localStorage.getItem(k) || '[]');
              if (Array.isArray(list)) {
                for (const t of list) {
                  if (t && (t.owner_id === currentUserId || t.owner?.user_id === currentUserId)) {
                    if (isWorkspaceOrphaned(t)) continue;
                    if (!workspaceMap.has(t.id)) {
                      const origin = resolveWorkspaceOrigin(t, {
                        hackathons: allHackathons,
                        problemStatements: allProblems,
                      });
                      workspaceMap.set(t.id, {
                        id: t.id,
                        title: t.title,
                        summary: t.summary,
                        description: t.description,
                        category: t.category || 'Web Development',
                        status: t.status || 'In Progress',
                        current_team_size: t.current_team_size || 1,
                        desired_team_size: t.desired_team_size || 4,
                        created_at: t.created_at || new Date().toISOString(),
                        isOwner: true,
                        userRole: 'Team Lead',
                        invite_code: t.invite_code,
                        members: t.members,
                        origin,
                      });
                    }
                  }
                }
              }
            }
          }
        } catch {}
      }

      // 5. Fetch joined projects where user is a team member
      const { data: memberData } = await supabase
        .from('project_members')
        .select(`
          role,
          project:projects!project_members_project_id_fkey(
            id,
            owner_id,
            title,
            summary,
            description,
            category,
            difficulty,
            status,
            current_team_size,
            desired_team_size,
            created_at,
            problem_statement_id
          )
        `)
        .eq('user_id', currentUserId);

      if (Array.isArray(memberData)) {
        for (const m of memberData) {
          const proj = m.project as unknown as Project;
          if (proj && proj.owner_id !== currentUserId) {
            if (isWorkspaceOrphaned(proj)) continue;
            const origin = resolveWorkspaceOrigin(proj, {
              hackathons: allHackathons,
              problemStatements: allProblems,
            });
            const existing = workspaceMap.get(proj.id);
            workspaceMap.set(proj.id, {
              id: proj.id,
              title: proj.title,
              summary: proj.summary,
              description: proj.description,
              category: proj.category,
              status: proj.status,
              current_team_size: proj.current_team_size || 1,
              desired_team_size: proj.desired_team_size || 4,
              created_at: proj.created_at,
              isOwner: false,
              userRole: m.role || 'Contributor',
              invite_code: existing?.invite_code,
              members: existing?.members,
              origin,
            });
          }
        }
      }

      // 6. Fetch Hackathon Teams user belongs to
      const hackathonSprintMap = new Map<string, UserHackathonSprint>();

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
              if (deletedHackIds.has(h.id.toLowerCase()) || !allHackathons.some((ah) => (ah.id || '').toLowerCase() === h.id.toLowerCase())) {
                continue;
              }
              const resultsAnnounced = isHackathonResultsAnnounced(h);
              const membersList = (t.members || []).map((m: any) => ({
                user_id: m.user_id,
                display_name: m.profile?.display_name || 'Student',
                avatar_url: m.profile?.avatar_url || null,
              }));

              hackathonSprintMap.set(h.id, {
                hackathon_id: h.id,
                team_id: t.id,
                team_name: t.team_name,
                invite_code: t.invite_code,
                role: item.role || 'Member',
                hackathon: h,
                team: t,
                members: membersList,
                isClosed: resultsAnnounced,
                timeRemaining: formatTimeRemaining(h.submission_deadline || h.end_date),
              });

              // Also ensure squad is represented in workspaceMap
              if (!workspaceMap.has(t.id)) {
                const origin = resolveWorkspaceOrigin(
                  { id: t.id, title: t.team_name, hackathon_id: h.id, category: 'Hackathon Sprint' },
                  { hackathons: allHackathons, problemStatements: allProblems }
                );
                workspaceMap.set(t.id, {
                  id: t.id,
                  title: t.team_name,
                  summary: `Hackathon Team Sprint: ${h.title} — ${t.team_name}`,
                  category: 'Other',
                  status: resultsAnnounced ? 'Completed' : 'In Progress',
                  current_team_size: membersList.length,
                  desired_team_size: h.max_team_size || 4,
                  created_at: t.created_at || new Date().toISOString(),
                  isOwner: item.role === 'Leader',
                  userRole: item.role || 'Contributor',
                  invite_code: t.invite_code,
                  members: membersList,
                  origin,
                });
              } else {
                const cur = workspaceMap.get(t.id)!;
                cur.invite_code = t.invite_code;
                cur.members = membersList;
              }
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
            if (h?.id) {
              if (deletedHackIds.has(h.id.toLowerCase()) || !allHackathons.some((ah) => (ah.id || '').toLowerCase() === h.id.toLowerCase())) {
                continue;
              }
              const resultsAnnounced = isHackathonResultsAnnounced(h);
              const membersList = (t.members || []).map((m: any) => ({
                user_id: m.user_id,
                display_name: m.profile?.display_name || 'Student',
                avatar_url: m.profile?.avatar_url || null,
              }));

              if (!hackathonSprintMap.has(h.id)) {
                hackathonSprintMap.set(h.id, {
                  hackathon_id: h.id,
                  team_id: t.id,
                  team_name: t.team_name,
                  invite_code: t.invite_code,
                  role: 'Leader',
                  hackathon: h,
                  team: t,
                  members: membersList,
                  isClosed: resultsAnnounced,
                  timeRemaining: formatTimeRemaining(h.submission_deadline || h.end_date),
                });
              }

              if (!workspaceMap.has(t.id)) {
                const origin = resolveWorkspaceOrigin(
                  { id: t.id, title: t.team_name, hackathon_id: h.id, category: 'Hackathon Sprint' },
                  { hackathons: allHackathons, problemStatements: allProblems }
                );
                workspaceMap.set(t.id, {
                  id: t.id,
                  title: t.team_name,
                  summary: `Hackathon Team Sprint: ${h.title} — ${t.team_name}`,
                  category: 'Other',
                  status: resultsAnnounced ? 'Completed' : 'In Progress',
                  current_team_size: membersList.length || 1,
                  desired_team_size: h.max_team_size || 4,
                  created_at: t.created_at || new Date().toISOString(),
                  isOwner: true,
                  userRole: 'Team Lead',
                  invite_code: t.invite_code,
                  members: membersList,
                  origin,
                });
              } else {
                const cur = workspaceMap.get(t.id)!;
                cur.invite_code = t.invite_code;
                cur.members = membersList;
              }
            }
          }
        }

        // C. Check hackathon_participants as fallback for registered events
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
            if (h?.id && !hackathonSprintMap.has(h.id)) {
              if (deletedHackIds.has(h.id.toLowerCase()) || !allHackathons.some((ah) => (ah.id || '').toLowerCase() === h.id.toLowerCase())) {
                continue;
              }
              let actualTeamName = 'Participant (Click to Form Squad)';
              let teamObj: any = null;
              if (p.team_id) {
                try {
                  const { data: tData } = await supabase
                    .from('hackathon_teams')
                    .select('id, team_name, invite_code, leader_id')
                    .eq('id', p.team_id)
                    .maybeSingle();
                  if (tData) {
                    actualTeamName = tData.team_name;
                    teamObj = tData;
                  }
                } catch (e) {}
              }
              const closed = isHackathonResultsAnnounced(h);
              hackathonSprintMap.set(h.id, {
                hackathon_id: h.id,
                team_id: p.team_id || null,
                team_name: actualTeamName,
                invite_code: teamObj?.invite_code || null,
                role: p.role || (teamObj?.leader_id === currentUserId ? 'Leader' : 'Participant'),
                hackathon: h,
                team: teamObj,
                members: [],
                isClosed: closed,
                timeRemaining: formatTimeRemaining(h.submission_deadline || h.end_date),
              });
            }
          }
        }

        // D. Also check registered hackathons in localStorage
        if (typeof window !== 'undefined') {
          try {
            const enrolledArr: string[] = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
            const localCreated: any[] = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');

            // Clean up localStorage from any deleted hackathons
            const cleanedEnrolled = enrolledArr.filter(
              (id) => !deletedHackIds.has(String(id).toLowerCase().trim()) && allHackathons.some((ah) => (ah.id || '').toLowerCase() === String(id).toLowerCase().trim())
            );
            if (cleanedEnrolled.length !== enrolledArr.length) {
              localStorage.setItem('teamforge_enrolled_hackathons', JSON.stringify(cleanedEnrolled));
            }

            for (const hId of cleanedEnrolled) {
              const cleanHId = String(hId || '').toLowerCase().trim();
              if (cleanHId && !deletedHackIds.has(cleanHId) && !hackathonSprintMap.has(hId)) {
                let hObj =
                  localCreated.find((lh) => lh.id === hId || lh.join_code === hId) ||
                  allHackathons.find((ch) => ch.id === hId || (ch as any).join_code === hId);

                if (hObj) {
                  const closed = isHackathonResultsAnnounced(hObj as any);
                  hackathonSprintMap.set(hObj.id!, {
                    hackathon_id: hObj.id!,
                    team_id: null,
                    team_name: 'Registered Participant',
                    invite_code: null,
                    role: 'Participant',
                    hackathon: hObj as any,
                    team: null,
                    members: [],
                    isClosed: closed,
                    timeRemaining: formatTimeRemaining((hObj as any).submission_deadline || (hObj as any).end_date),
                  });
                }
              }
            }
          } catch {}
        }
      } catch (err) {
        console.warn('Error fetching hackathon sprint teams:', err);
      }

      const allSprintsList = Array.from(hackathonSprintMap.values());
      setAllHackathonSprints(allSprintsList);

      const workspacesArray = Array.from(workspaceMap.values());
      setAllWorkspaces(workspacesArray);

      setPageCache(`linkora_user_workspace_${currentUserId}`, {
        allWorkspaces: workspacesArray,
        hackSprints: allSprintsList,
      });
    } catch (err) {
      console.warn('Error loading user workspaces:', err);
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

  // Counts for tabs and sub-filters
  const activeHackathonsCount = useMemo(
    () => activeWorkspaces.filter((w) => w.origin.originType === 'hackathon').length,
    [activeWorkspaces]
  );
  const activeFacultyCount = useMemo(
    () => activeWorkspaces.filter((w) => w.origin.originType === 'faculty_problem').length,
    [activeWorkspaces]
  );
  const activePermCount = useMemo(
    () => activeWorkspaces.filter((w) => w.origin.originType === 'permanent').length,
    [activeWorkspaces]
  );

  const doneHackathonsCount = useMemo(
    () => doneWorkspaces.filter((w) => w.origin.originType === 'hackathon').length,
    [doneWorkspaces]
  );
  const doneFacultyCount = useMemo(
    () => doneWorkspaces.filter((w) => w.origin.originType === 'faculty_problem').length,
    [doneWorkspaces]
  );
  const donePermCount = useMemo(
    () => doneWorkspaces.filter((w) => w.origin.originType === 'permanent').length,
    [doneWorkspaces]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-brand-500 dark:text-brand-400" />
            <span>My Projects &amp; Workspaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Access currently active sprints, faculty challenge squads, and concluded event workspaces.
          </p>
        </div>

        <Link href="/projects/new">
          <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Start New Project
          </Button>
        </Link>
      </div>

      {/* Primary Category Tabs: Working Now vs Done (Results Announced) vs Registered vs Permanent */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-charcoal-800 pb-3 text-sm overflow-x-auto scrollbar-none">
        {/* TAB 1: WORKING NOW (ACTIVE WORKSPACES) */}
        <button
          onClick={() => setActiveTab('working')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'working'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Working Now (Active)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'working'
                ? 'bg-amber-500 text-white'
                : 'bg-charcoal-800 text-slate-400'
            }`}
          >
            {activeWorkspaces.length}
          </span>
          {activeWorkspaces.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-0.5" />
          )}
        </button>

        {/* TAB 2: WORKSPACE DONE (RESULTS ANNOUNCED) */}
        <button
          onClick={() => setActiveTab('done')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'done'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Workspaces Done (Results Announced)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'done'
                ? 'bg-emerald-500 text-white'
                : 'bg-charcoal-800 text-slate-400'
            }`}
          >
            {doneWorkspaces.length}
          </span>
        </button>

        {/* TAB 3: REGISTERED HACKATHONS (UPCOMING) */}
        <button
          onClick={() => setActiveTab('registered')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'registered'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Registered (Upcoming)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'registered'
                ? 'bg-cyan-500 text-white'
                : 'bg-charcoal-800 text-slate-400'
            }`}
          >
            {registeredUpcomingHackathons.length}
          </span>
        </button>

        {/* TAB 4: PERMANENT PROJECTS */}
        <button
          onClick={() => setActiveTab('permanent')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'permanent'
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
          }`}
        >
          <Layers className="w-4 h-4 text-brand-400" />
          <span>Permanent Projects</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'permanent'
                ? 'bg-brand-500 text-white'
                : 'bg-charcoal-800 text-slate-400'
            }`}
          >
            {permanentProjects.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading your workspaces &amp; active sprints...</p>
        </div>
      ) : activeTab === 'working' ? (
        /* ================= 1. WORKING NOW (ACTIVE WORKSPACES) ================= */
        <div className="space-y-6">
          {/* Sub-filter bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setWorkingFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  workingFilter === 'all'
                    ? 'bg-charcoal-800 text-white border border-charcoal-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Active ({activeWorkspaces.length})
              </button>
              <button
                type="button"
                onClick={() => setWorkingFilter('hackathon')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  workingFilter === 'hackathon'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Hackathons ({activeHackathonsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkingFilter('faculty')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  workingFilter === 'faculty'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                <span>Faculty Challenges ({activeFacultyCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setWorkingFilter('permanent')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  workingFilter === 'permanent'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'text-slate-400 hover:text-brand-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-brand-400" />
                <span>Permanent ({activePermCount})</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500">
              ⚡ Sprints currently in progress
            </span>
          </div>

          {filteredActiveWorkspaces.length === 0 ? (
            <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                <Zap className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Active Workspaces In Progress</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You do not currently have any active hackathon sprints or faculty challenge teams underway. Form a team for a college hackathon or apply to a faculty problem statement to get started!
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <Link href="/hackathons">
                  <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 font-bold" leftIcon={<Trophy className="w-4 h-4" />}>
                    Browse Hackathons
                  </Button>
                </Link>
                <Link href="/problems">
                  <Button variant="outline" size="sm" className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 font-bold" leftIcon={<GraduationCap className="w-4 h-4" />}>
                    Faculty Challenges
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredActiveWorkspaces.map((item) => (
                <WorkspaceCard
                  key={item.id}
                  item={item}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'done' ? (
        /* ================= 2. WORKSPACES DONE (RESULTS ANNOUNCED) ================= */
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Concluded Workspaces &amp; Results Announced</h4>
                <p className="text-xs text-slate-400">
                  Once hackathon organizers publish official results or faculty mentors complete challenge evaluations, workspaces move here so you always know what is finished. You can still inspect project code and view rankings!
                </p>
              </div>
            </div>

            <Link href="/hackathons">
              <Button variant="outline" size="sm" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs font-bold">
                Browse New Events
              </Button>
            </Link>
          </div>

          {/* Sub-filter bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setDoneFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                doneFilter === 'all'
                  ? 'bg-charcoal-800 text-white border border-charcoal-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Done ({doneWorkspaces.length})
            </button>
            <button
              type="button"
              onClick={() => setDoneFilter('hackathon')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                doneFilter === 'hackathon'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Hackathons ({doneHackathonsCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setDoneFilter('faculty')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                doneFilter === 'faculty'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>Faculty Challenges ({doneFacultyCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setDoneFilter('permanent')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                doneFilter === 'permanent'
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                  : 'text-slate-400 hover:text-brand-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              <span>Permanent ({donePermCount})</span>
            </button>
          </div>

          {filteredDoneWorkspaces.length === 0 ? (
            <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Concluded Workspaces Yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When a hackathon sprint concludes and results are published by the faculty or jury, the completed workspace will be archived here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDoneWorkspaces.map((item) => (
                <WorkspaceCard
                  key={item.id}
                  item={item}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                  isArchiveView={true}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'registered' ? (
        /* ================= 3. REGISTERED (UPCOMING) ================= */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Registered Upcoming Hackathons</h4>
                <p className="text-xs text-slate-400">
                  You are registered. When the hackathon start date arrives, the workspace unlocks and automatically moves to your <strong className="text-amber-400">Working Now</strong> tab!
                </p>
              </div>
            </div>
            <Link href="/hackathons">
              <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs">
                Browse More Hackathons
              </Button>
            </Link>
          </div>

          {registeredUpcomingHackathons.length === 0 ? (
            <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white">No Upcoming Registered Hackathons</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When you register for an upcoming college hackathon, it will appear here with kickoff schedules and preparation details until the sprint begins.
                </p>
              </div>

              <Link href="/hackathons">
                <Button variant="primary" size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold" leftIcon={<Trophy className="w-4 h-4" />}>
                  Explore Collegiate Hackathons
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredUpcomingHackathons.map((item) => {
                const h = item.hackathon;
                const startDateStr = h.start_date
                  ? new Date(h.start_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Announced Soon';

                return (
                  <div
                    key={item.hackathon_id}
                    className="p-6 rounded-2xl bg-charcoal-900 border border-cyan-500/30 hover:border-cyan-500/50 transition-all flex flex-col justify-between gap-5 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          Registration Confirmed
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          Starts: {startDateStr}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white line-clamp-1">{h.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          Organized by <strong className="text-slate-300">{h.organizer || 'College Faculty'}</strong>
                          {(h as any).college ? ` • ${(h as any).college}` : ''}
                        </p>
                      </div>

                      {h.eligibility && (
                        <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] text-slate-300 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">Criteria: {h.eligibility}</span>
                        </div>
                      )}

                      <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800 text-xs text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Team Size:</span>
                          <span className="text-white font-medium">
                            {h.min_team_size || 1} - {h.max_team_size || 4} Builders
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Workspace Access:</span>
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Unlocks when hackathon starts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between gap-2 flex-wrap">
                      <Link href={`/hackathons/${h.id}`} className="w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 font-bold justify-center"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          View Event Details &amp; Guidelines
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'permanent' ? (
        /* ================= 4. PERMANENT PROJECTS ================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setPermanentFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  permanentFilter === 'all'
                    ? 'bg-charcoal-800 text-white border border-charcoal-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Permanent ({permanentProjects.length})
              </button>
              <button
                type="button"
                onClick={() => setPermanentFilter('leading')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  permanentFilter === 'leading'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'text-slate-400 hover:text-brand-300'
                }`}
              >
                Projects I Lead ({permanentProjects.filter((w) => w.isOwner).length})
              </button>
              <button
                type="button"
                onClick={() => setPermanentFilter('joined')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  permanentFilter === 'joined'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                    : 'text-slate-400 hover:text-brand-300'
                }`}
              >
                Teams I Joined ({permanentProjects.filter((w) => !w.isOwner).length})
              </button>
            </div>

            <Link href="/projects/new">
              <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Create New Project
              </Button>
            </Link>
          </div>

          {filteredPermanentProjects.length === 0 ? (
            <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
              <Sparkles className="w-10 h-10 text-brand-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Permanent Projects Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start your own project to assemble a long-term development team, or explore active projects looking for engineering talent.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/projects/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Create a Project
                  </Button>
                </Link>
                <Link href="/explore">
                  <Button variant="outline" size="sm">
                    Explore Projects
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPermanentProjects.map((item) => (
                <WorkspaceCard
                  key={item.id}
                  item={item}
                  copiedCode={copiedCode}
                  onCopyCode={handleCopyCode}
                />
              ))}
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
