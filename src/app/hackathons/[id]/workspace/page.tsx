'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Hackathon,
  HackathonParticipant,
  HackathonChallenge,
  HackathonTeam,
  HackathonTeamMember,
  HackathonSubmission,
  HackathonJudgingCriteria,
  HackathonEvaluation,
  HackathonAnnouncement,
} from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Shield,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
  Github,
  Video,
  FileText,
  PlusCircle,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Award,
  Pin,
  Megaphone,
  Share2,
  Trash2,
  ArrowRight,
  Code2,
  Layers,
  ChevronRight,
  Search,
} from 'lucide-react';
import { AddChallengeModal } from '@/components/hackathons/AddChallengeModal';
import { PostAnnouncementModal } from '@/components/hackathons/PostAnnouncementModal';
import { EvaluationModal } from '@/components/hackathons/EvaluationModal';
import { HackathonSecurityModal } from '@/components/hackathons/HackathonSecurityModal';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { safeExternalUrl } from '@/lib/security/urlSanitizer';
import { isHackathonClosed } from '@/lib/hackathons/hackathonStatus';

interface TeamWithMembers extends HackathonTeam {
  members?: Array<HackathonTeamMember & { profile?: { display_name: string; avatar_url: string | null; college?: string | null } }>;
  submission?: HackathonSubmission | null;
  challenge?: HackathonChallenge | null;
}

export default function HackathonWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params?.id as string;
  const { user, profile } = useAuth();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [participants, setParticipants] = useState<HackathonParticipant[]>([]);
  const [challenges, setChallenges] = useState<HackathonChallenge[]>([]);
  const [announcements, setAnnouncements] = useState<HackathonAnnouncement[]>([]);
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [myTeam, setMyTeam] = useState<TeamWithMembers | null>(null);
  const [mySubmission, setMySubmission] = useState<HackathonSubmission | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<(HackathonSubmission & { team_name?: string })[]>([]);
  const [criteria, setCriteria] = useState<HackathonJudgingCriteria[]>([]);
  const [evaluations, setEvaluations] = useState<HackathonEvaluation[]>([]);

  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'team' | 'submission' | 'judging'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isClosed = useMemo(() => isHackathonClosed(hackathon), [hackathon]);

  // Modals state
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false);
  const [isPostAnnouncementOpen, setIsPostAnnouncementOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [selectedSubmissionForEval, setSelectedSubmissionForEval] = useState<(HackathonSubmission & { team_name?: string }) | null>(null);

  // Team creation / join state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [joinTeamCode, setJoinTeamCode] = useState('');
  const [teamActionError, setTeamActionError] = useState<string | null>(null);
  const [teamActionSuccess, setTeamActionSuccess] = useState<string | null>(null);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);

  // Project submission form state
  const [subTitle, setSubTitle] = useState('');
  const [subPitch, setSubPitch] = useState('');
  const [subProblem, setSubProblem] = useState('');
  const [subSolution, setSubSolution] = useState('');
  const [subTechStack, setSubTechStack] = useState('');
  const [subRepoUrl, setSubRepoUrl] = useState('');
  const [subDemoUrl, setSubDemoUrl] = useState('');
  const [subVideoUrl, setSubVideoUrl] = useState('');
  const [subDocsUrl, setSubDocsUrl] = useState('');
  const [isSavingSubmission, setIsSavingSubmission] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Copied states
  const [copiedJoinLink, setCopiedJoinLink] = useState(false);
  const [copiedTeamCode, setCopiedTeamCode] = useState(false);
  const [copiedTeamCodeId, setCopiedTeamCodeId] = useState<string | null>(null);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  // Role checks
  const isOrganizer = Boolean(
    user &&
      hackathon &&
      (hackathon.creator_id === user.id ||
        participants.some((p) => p.user_id === user.id && p.role === 'organizer') ||
        profile?.role === 'teacher' ||
        (profile as any)?.role === 'faculty' ||
        (profile as any)?.role === 'admin')
  );
  const isJudge = Boolean(
    user && (isOrganizer || participants.some((p) => p.user_id === user.id && p.role === 'judge'))
  );
  const isEnrolledLocally = Boolean(
    user &&
    typeof window !== 'undefined' &&
    (() => {
      try {
        const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
        return (
          enrolled.includes(hackathonId) ||
          (hackathon && enrolled.includes(hackathon.id)) ||
          (hackathon && hackathon.join_code && enrolled.includes(hackathon.join_code))
        );
      } catch {
        return false;
      }
    })()
  );

  const isParticipant = Boolean(
    user && (isOrganizer || isEnrolledLocally || participants.some((p) => p.user_id === user.id))
  );

  // Submission deadline check
  const isSubmissionClosed = Boolean(
    hackathon?.submission_deadline && new Date() > new Date(hackathon.submission_deadline)
  );

  // Load all workspace data
  const loadWorkspace = useCallback(async () => {
    if (!hackathonId || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if this hackathon was deleted by admin
      let deletedSet = new Set<string>();
      try {
        const hRes = await fetch(`/api/hackathons?_t=${Date.now()}`, { cache: 'no-store' });
        const hData = await hRes.json();
        const dIds: string[] = hData?.deletedIds || [];
        const dTitles: string[] = hData?.deletedTitles || [];
        deletedSet = new Set([...dIds, ...dTitles].map((id: string) => id.trim().toLowerCase()));
        if (deletedSet.has(hackathonId.toLowerCase())) {
          setError('This hackathon has been permanently removed by the administrator.');
          setIsLoading(false);
          return;
        }
      } catch {}

      // 1. Fetch Hackathon from Supabase safely
      let currentHack: Hackathon | null = null;
      const isParamUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hackathonId);

      try {
        if (isParamUUID) {
          const { data: hackData } = await supabase
            .from('hackathons')
            .select('*')
            .eq('id', hackathonId)
            .maybeSingle();

          if (hackData) currentHack = hackData as Hackathon;
        } else {
          // If hackathonId is a join code (e.g. col-c8c89ed6)
          const { data: hackDataByCode } = await supabase
            .from('hackathons')
            .select('*')
            .eq('join_code', hackathonId)
            .maybeSingle();

          if (hackDataByCode) currentHack = hackDataByCode as Hackathon;
        }
      } catch (err) {
        console.warn('Error fetching hackathon from Supabase:', err);
      }

      if (!currentHack && typeof window !== 'undefined') {
        try {
          const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const match = localHacks.find((h: any) => h.id === hackathonId || h.join_code === hackathonId);
          if (match) currentHack = match;
        } catch {}
      }

      if (!currentHack) {
        const curated = CURATED_HACKATHONS.find((ch) => ch.id === hackathonId || ch.join_code === hackathonId);
        if (curated) currentHack = curated as Hackathon;
      }

      if (!currentHack) {
        throw new Error('Hackathon not found.');
      }

      // If loaded from local storage but matching hackathon exists in Supabase, resolve real UUID
      if (currentHack && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentHack.id)) {
        try {
          if (currentHack.join_code) {
            const { data: dbMatch } = await supabase
              .from('hackathons')
              .select('*')
              .eq('join_code', currentHack.join_code)
              .maybeSingle();
            if (dbMatch) {
              currentHack = { ...currentHack, id: dbMatch.id };
            }
          }
        } catch {}
      }

      if (currentHack.description?.includes('<!-- HACKATHON_META:')) {
        try {
          const metaStr = currentHack.description.split('<!-- HACKATHON_META:')[1].split('-->')[0];
          const meta = JSON.parse(metaStr);
          currentHack = {
            ...currentHack,
            access_type: meta.access_type || currentHack.access_type || 'private',
            join_code: meta.join_code || currentHack.join_code,
            description: currentHack.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim(),
          };
        } catch {}
      }

      if (
        currentHack &&
        (deletedSet.has((currentHack.id || '').toLowerCase()) ||
          deletedSet.has((currentHack.join_code || '').toLowerCase()) ||
          deletedSet.has((currentHack.title || '').trim().toLowerCase()))
      ) {
        setError('This hackathon has been permanently removed by the administrator.');
        setIsLoading(false);
        return;
      }

      setHackathon(currentHack);

      const canonicalHackId = currentHack.id;
      const isCanonicalUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(canonicalHackId);

      // 2. Fetch Participants
      if (isCanonicalUUID) {
        try {
          const { data: partData } = await supabase
            .from('hackathon_participants')
            .select('*')
            .eq('hackathon_id', canonicalHackId);

          if (partData) {
            setParticipants(partData as HackathonParticipant[]);
          }
        } catch {}

        // 3. Fetch Challenges (Resilient to legacy vs modern schema & localStorage fallback)
        let allChallenges: HackathonChallenge[] = [];
        try {
          const { data: chalData } = await supabase
            .from('hackathon_challenges')
            .select('*')
            .eq('hackathon_id', canonicalHackId)
            .order('created_at', { ascending: true });

          if (chalData && chalData.length > 0) {
            allChallenges = chalData.map((c: any) => ({
              ...c,
              problem_description: c.problem_description || c.description || '',
              difficulty: c.difficulty || 'Intermediate',
              category: c.category || 'Web Development',
            }));
          }
        } catch (err) {
          console.warn('Error fetching hackathon challenges from Supabase:', err);
        }

        // Merge localStorage challenges (to recover full rich fields like context & deliverables)
        if (typeof window !== 'undefined') {
          try {
            const k1 = `teamforge_challenges_${canonicalHackId}`;
            const k2 = `teamforge_challenges_${hackathonId}`;
            const raw1 = JSON.parse(localStorage.getItem(k1) || '[]');
            const raw2 = JSON.parse(localStorage.getItem(k2) || '[]');
            const localList: HackathonChallenge[] = [
              ...(Array.isArray(raw1) ? raw1 : []),
              ...(Array.isArray(raw2) ? raw2 : []),
            ];

            const byId = new Map<string, HackathonChallenge>();
            allChallenges.forEach((c) => byId.set(c.id, c));

            for (const lc of localList) {
              if (!lc || !lc.id) continue;
              if (byId.has(lc.id)) {
                const existing = byId.get(lc.id)!;
                byId.set(lc.id, {
                  ...existing,
                  problem_description: existing.problem_description || lc.problem_description || (lc as any).description,
                  context: existing.context || lc.context,
                  expected_deliverables:
                    existing.expected_deliverables && existing.expected_deliverables.length > 0
                      ? existing.expected_deliverables
                      : lc.expected_deliverables,
                  required_skills:
                    existing.required_skills && existing.required_skills.length > 0
                      ? existing.required_skills
                      : lc.required_skills,
                  difficulty: existing.difficulty || lc.difficulty,
                  evaluation_criteria: existing.evaluation_criteria || lc.evaluation_criteria,
                });
              } else {
                byId.set(lc.id, lc);
              }
            }
            allChallenges = Array.from(byId.values());
          } catch {}
        }
        setChallenges(allChallenges);

        // 4. Fetch Announcements (Resilient to table missing & localStorage fallback)
        let allAnnouncements: HackathonAnnouncement[] = [];
        try {
          const { data: annData } = await supabase
            .from('hackathon_announcements')
            .select('*')
            .eq('hackathon_id', canonicalHackId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

          if (annData && annData.length > 0) {
            allAnnouncements = annData as HackathonAnnouncement[];
          }
        } catch (err) {
          console.warn('Error fetching hackathon announcements from Supabase:', err);
        }

        // Merge localStorage announcements
        if (typeof window !== 'undefined') {
          try {
            const k1 = `teamforge_announcements_${canonicalHackId}`;
            const k2 = `teamforge_announcements_${hackathonId}`;
            const raw1 = JSON.parse(localStorage.getItem(k1) || '[]');
            const raw2 = JSON.parse(localStorage.getItem(k2) || '[]');
            const localList: HackathonAnnouncement[] = [
              ...(Array.isArray(raw1) ? raw1 : []),
              ...(Array.isArray(raw2) ? raw2 : []),
            ];

            const byId = new Map<string, HackathonAnnouncement>();
            allAnnouncements.forEach((a) => byId.set(a.id, a));

            for (const la of localList) {
              if (la && la.id && !byId.has(la.id)) {
                byId.set(la.id, la);
              }
            }
            allAnnouncements = Array.from(byId.values());
            allAnnouncements.sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
          } catch {}
        }
        setAnnouncements(allAnnouncements);
      }

      // 5. Fetch Teams with Members safely
      let allTeams: TeamWithMembers[] = [];
      if (isCanonicalUUID) {
        try {
          const { data: teamData, error: teamFetchErr } = await supabase
            .from('hackathon_teams')
            .select(`
              *,
              challenge:hackathon_challenges(*),
              members:hackathon_team_members(*)
            `)
            .eq('hackathon_id', canonicalHackId);

          if (teamFetchErr) {
            console.error('Could not fetch teams from Supabase:', teamFetchErr.message);
          }

          if (teamData && teamData.length > 0) {
            // Hydrate member profiles safely in one batch
            const memberUserIds = Array.from(
              new Set(teamData.flatMap((t: any) => (t.members || []).map((m: any) => m.user_id)).filter(Boolean))
            );

            const profileMap = new Map<string, any>();
            if (memberUserIds.length > 0) {
              try {
                const { data: profilesData } = await supabase
                  .from('profiles')
                  .select('user_id, display_name, avatar_url, college')
                  .in('user_id', memberUserIds);

                (profilesData || []).forEach((p: any) => profileMap.set(p.user_id, p));
              } catch (pErr) {
                console.warn('Error hydrating member profiles:', pErr);
              }
            }

            allTeams = teamData.map((t: any) => ({
              ...t,
              members: (t.members || []).map((m: any) => ({
                ...m,
                profile: profileMap.get(m.user_id) || {
                  display_name: m.user_id === user?.id ? (profile?.display_name || user?.email?.split('@')[0] || 'You') : 'Student Member',
                  avatar_url: m.user_id === user?.id ? profile?.avatar_url : null,
                  college: m.user_id === user?.id ? profile?.college : null,
                },
              })),
            })) as TeamWithMembers[];
          }
        } catch (err) {
          console.warn('Error loading hackathon teams:', err);
        }
      }

      // Check localStorage for local/mock hackathon teams
      if (typeof window !== 'undefined') {
        try {
          const localKey1 = `teamforge_teams_${canonicalHackId}`;
          const localKey2 = `teamforge_teams_${hackathonId}`;
          const raw1 = JSON.parse(localStorage.getItem(localKey1) || '[]');
          const raw2 = JSON.parse(localStorage.getItem(localKey2) || '[]');
          const localTeams = [...(Array.isArray(raw1) ? raw1 : []), ...(Array.isArray(raw2) ? raw2 : [])];

          if (localTeams.length > 0) {
            const existingIds = new Set(allTeams.map((t) => t.id));
            for (const lt of localTeams) {
              if (lt?.id && !existingIds.has(lt.id)) {
                allTeams.push(lt);
                existingIds.add(lt.id);
              }
            }
          }
        } catch {}
      }

      setTeams(allTeams);

      if (user) {
        const userTeam = allTeams.find((t) =>
          t.members?.some((m) => m.user_id === user.id)
        );
        setMyTeam(userTeam || null);

        // If user has team, fetch team submission
        if (userTeam) {
          try {
            const { data: subData } = await supabase
              .from('hackathon_submissions')
              .select('*')
              .eq('team_id', userTeam.id)
              .maybeSingle();

            if (subData) {
              setMySubmission(subData as HackathonSubmission);
              setSubTitle(subData.title || '');
              setSubPitch(subData.pitch || '');
              setSubProblem(subData.problem_statement || '');
              setSubSolution(subData.solution_description || '');
              setSubTechStack((subData.tech_stack || []).join(', '));
              setSubRepoUrl(subData.repository_url || '');
              setSubDemoUrl(subData.demo_url || '');
              setSubVideoUrl(subData.video_url || '');
              setSubDocsUrl(subData.documentation_url || '');
            }
          } catch {}
        }
      }

      // 6. Fetch Judging Criteria
      if (isCanonicalUUID) {
        try {
          const { data: critData } = await supabase
            .from('hackathon_judging_criteria')
            .select('*')
            .eq('hackathon_id', canonicalHackId)
            .order('weight', { ascending: false });

          if (critData) {
            setCriteria(critData as HackathonJudgingCriteria[]);
          }
        } catch {}

        // 7. If organizer or judge, or if results published, load submissions and evaluations
        try {
          const { data: allSubs } = await supabase
            .from('hackathon_submissions')
            .select(`
              *,
              team:hackathon_teams(team_name)
            `)
            .eq('hackathon_id', canonicalHackId);

          if (allSubs) {
            const formatted = allSubs.map((s: any) => ({
              ...s,
              team_name: s.team?.team_name || 'Team',
            }));
            setAllSubmissions(formatted);
          }
        } catch {}

        // Fetch evaluations
        try {
          const { data: evalData } = await supabase
            .from('hackathon_evaluations')
            .select('*')
            .eq('hackathon_id', canonicalHackId);

          if (evalData) {
            setEvaluations(evalData as HackathonEvaluation[]);
          }
        } catch {}
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading hackathon workspace.');
    } finally {
      setIsLoading(false);
    }
  }, [hackathonId, user]);

  useEffect(() => {
    loadWorkspace();

    const activeHackId = hackathon?.id || hackathonId;
    const isUUID = activeHackId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(activeHackId);

    // Supabase Realtime subscription for live hackathon workspace sync
    const channelBuilder = supabase.channel(`hackathon-workspace-${activeHackId}`);

    if (isUUID) {
      channelBuilder
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hackathon_announcements',
            filter: `hackathon_id=eq.${activeHackId}`,
          },
          () => {
            loadWorkspace();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hackathon_teams',
            filter: `hackathon_id=eq.${activeHackId}`,
          },
          () => {
            loadWorkspace();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hackathon_challenges',
            filter: `hackathon_id=eq.${activeHackId}`,
          },
          () => {
            loadWorkspace();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hackathon_submissions',
            filter: `hackathon_id=eq.${activeHackId}`,
          },
          () => {
            loadWorkspace();
          }
        );
    } else {
      channelBuilder
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'hackathon_teams' },
          () => {
            loadWorkspace();
          }
        );
    }

    const channel = channelBuilder.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hackathonId, hackathon?.id, loadWorkspace]);

  // Handle Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamActionError(null);
    setTeamActionSuccess(null);

    if (!user || !hackathon) return;

    if (isClosed) {
      setTeamActionError('Team registration is closed because the hackathon timeline has ended.');
      return;
    }

    if (!newTeamName.trim()) {
      setTeamActionError('Please provide a team name.');
      return;
    }

    if (myTeam) {
      setTeamActionError('You are already a member of an existing team in this hackathon.');
      return;
    }

    setIsSubmittingTeam(true);

    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const canonicalHackId = hackathon.id;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(canonicalHackId);

      let createdTeamData: any = null;

      if (isUUID) {
        const isChallengeUUID =
          selectedChallengeId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedChallengeId);

        const { data: team, error: teamErr } = await supabase
          .from('hackathon_teams')
          .insert({
            hackathon_id: canonicalHackId,
            team_name: newTeamName.trim(),
            description: newTeamDesc.trim() || null,
            challenge_id: isChallengeUUID ? selectedChallengeId : null,
            leader_id: user.id,
            invite_code: inviteCode,
          })
          .select('*')
          .single();

        if (teamErr) {
          console.error('Supabase team insertion error:', teamErr);
          throw new Error(teamErr.message);
        }
        createdTeamData = team;

        // Add current user as leader in team_members
        const { error: memberErr } = await supabase
          .from('hackathon_team_members')
          .insert({
            team_id: team.id,
            hackathon_id: canonicalHackId,
            user_id: user.id,
            role: 'Leader',
          });

        if (memberErr) {
          console.error('Supabase member insertion error:', memberErr.message);
        }

        // Also sync hackathon_participants
        try {
          await supabase.from('hackathon_participants').upsert({
            hackathon_id: canonicalHackId,
            user_id: user.id,
            role: 'leader',
            team_id: team.id,
          }, { onConflict: 'hackathon_id,user_id' });
        } catch (pErr) {
          console.warn('Sync participant error:', pErr);
        }
      } else {
        // Fallback team creation object for mock/offline hackathons
        createdTeamData = {
          id: 'team-' + Date.now(),
          hackathon_id: canonicalHackId,
          team_name: newTeamName.trim(),
          description: newTeamDesc.trim() || null,
          challenge_id: selectedChallengeId || null,
          leader_id: user.id,
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      // Build full team object with leader member
      const newTeamObj: TeamWithMembers = {
        ...createdTeamData,
        challenge: challenges.find((c) => c.id === selectedChallengeId) || null,
        members: [
          {
            id: 'mem-' + Date.now(),
            team_id: createdTeamData.id,
            hackathon_id: canonicalHackId,
            user_id: user.id,
            role: 'Leader',
            joined_at: new Date().toISOString(),
            profile: {
              display_name: profile?.display_name || user.email?.split('@')[0] || 'Team Leader',
              avatar_url: profile?.avatar_url || null,
              college: profile?.college || null,
            },
          },
        ],
      };

      // Persist to localStorage backup
      if (typeof window !== 'undefined') {
        try {
          const storageKey = `teamforge_teams_${canonicalHackId}`;
          const currentLocal = JSON.parse(localStorage.getItem(storageKey) || '[]');
          localStorage.setItem(
            storageKey,
            JSON.stringify([...currentLocal.filter((t: any) => t.id !== newTeamObj.id), newTeamObj])
          );
        } catch {}
      }

      // Optimistically update React state immediately!
      setTeams((prev) => {
        const withoutOld = prev.filter((t) => t.id !== newTeamObj.id);
        return [newTeamObj, ...withoutOld];
      });
      setMyTeam(newTeamObj);

      setTeamActionSuccess(
        `🎉 Team "${newTeamObj.team_name}" registered! Your Teammate Invite Code is ${inviteCode}. Share this code with your classmates to join your team!`
      );
      setNewTeamName('');
      setNewTeamDesc('');

      // Reload fresh data from database
      await loadWorkspace();
    } catch (err: unknown) {
      setTeamActionError(err instanceof Error ? err.message : 'Error creating team.');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  // Handle Join Team via Code
  const handleJoinTeam = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    setTeamActionError(null);
    setTeamActionSuccess(null);

    if (!user || !hackathon) return;

    if (isClosed) {
      setTeamActionError('Team joining is closed because the hackathon timeline has ended.');
      return;
    }

    const codeToUse = (directCode || joinTeamCode).trim().toUpperCase();

    if (!codeToUse) {
      setTeamActionError('Please enter a valid team invite code.');
      return;
    }

    if (myTeam) {
      setTeamActionError('You are already registered on a team in this hackathon.');
      return;
    }

    setIsSubmittingTeam(true);

    try {
      const canonicalHackId = hackathon.id;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(canonicalHackId);
      let targetTeam: any = null;

      if (isUUID) {
        // 1. Try Supabase lookup
        const { data, error: findErr } = await supabase
          .from('hackathon_teams')
          .select('*, members:hackathon_team_members(id)')
          .eq('hackathon_id', canonicalHackId)
          .eq('invite_code', codeToUse)
          .single();

        if (!data || findErr) {
          const localMatch = teams.find((t) => t.invite_code?.toUpperCase() === codeToUse);
          if (localMatch) {
            targetTeam = localMatch;
          } else {
            throw new Error('Invalid team invite code. Please check with your team leader.');
          }
        } else {
          targetTeam = data;
        }
      } else {
        const localMatch = teams.find((t) => t.invite_code?.toUpperCase() === codeToUse);
        if (localMatch) {
          targetTeam = localMatch;
        } else {
          throw new Error('Invalid team invite code. Please check with your team leader.');
        }
      }

      if (targetTeam.members && targetTeam.members.length >= (hackathon.max_team_size || 4)) {
        throw new Error(`This team has already reached the maximum limit of ${hackathon.max_team_size} members.`);
      }

      // 2. Insert member in Supabase
      if (isUUID) {
        const { error: joinErr } = await supabase
          .from('hackathon_team_members')
          .insert({
            team_id: targetTeam.id,
            hackathon_id: canonicalHackId,
            user_id: user.id,
            role: 'Member',
          });

        if (joinErr) {
          console.error('Supabase join error:', joinErr);
          throw new Error(joinErr.message);
        }

        // Also sync hackathon_participants
        try {
          await supabase.from('hackathon_participants').upsert({
            hackathon_id: canonicalHackId,
            user_id: user.id,
            role: 'participant',
            team_id: targetTeam.id,
          }, { onConflict: 'hackathon_id,user_id' });
        } catch (pErr) {
          console.warn('Sync participant error:', pErr);
        }
      }

      // 3. Update localStorage and optimistic state
      const newMember = {
        id: 'mem-' + Date.now(),
        team_id: targetTeam.id,
        hackathon_id: canonicalHackId,
        user_id: user.id,
        role: 'Member' as const,
        joined_at: new Date().toISOString(),
        profile: {
          display_name: profile?.display_name || user.email?.split('@')[0] || 'Team Member',
          avatar_url: profile?.avatar_url || null,
          college: profile?.college || null,
        },
      };

      const updatedTeam: TeamWithMembers = {
        ...targetTeam,
        members: [...(targetTeam.members || []), newMember],
      };

      if (typeof window !== 'undefined') {
        try {
          const storageKey = `teamforge_teams_${canonicalHackId}`;
          const currentLocal = JSON.parse(localStorage.getItem(storageKey) || '[]');
          localStorage.setItem(
            storageKey,
            JSON.stringify([...currentLocal.filter((t: any) => t.id !== targetTeam.id), updatedTeam])
          );
        } catch {}
      }

      setTeams((prev) => prev.map((t) => (t.id === targetTeam.id ? updatedTeam : t)));
      setMyTeam(updatedTeam);

      setTeamActionSuccess(`Joined team "${targetTeam.team_name}"!`);
      setJoinTeamCode('');
      await loadWorkspace();
    } catch (err: unknown) {
      setTeamActionError(err instanceof Error ? err.message : 'Error joining team.');
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  // Handle Select Challenge for Team
  const handleSelectChallenge = async (challengeId: string) => {
    if (!myTeam || !user) return;
    try {
      await supabase
        .from('hackathon_teams')
        .update({ challenge_id: challengeId })
        .eq('id', myTeam.id);

      await loadWorkspace();
    } catch (e) {
      console.warn('Error selecting challenge:', e);
    }
  };

  // Handle Save / Submit Project
  const handleSaveSubmission = async (status: 'draft' | 'submitted') => {
    if (!myTeam || !user || !hackathon) return;
    setSubmissionError(null);
    setSubmissionFeedback(null);

    if (isSubmissionClosed) {
      setSubmissionError('The submission deadline has passed. Submissions are currently locked.');
      return;
    }

    if (status === 'submitted') {
      if (!subTitle.trim() || !subPitch.trim() || !subProblem.trim() || !subSolution.trim()) {
        setSubmissionError('Please complete the required fields: Title, Pitch, Problem Statement, and Solution.');
        return;
      }
    }

    setIsSavingSubmission(true);

    try {
      const techStack = subTechStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        hackathon_id: hackathon.id,
        team_id: myTeam.id,
        challenge_id: myTeam.challenge_id || null,
        title: subTitle.trim(),
        pitch: subPitch.trim(),
        problem_statement: subProblem.trim(),
        solution_description: subSolution.trim(),
        tech_stack: techStack,
        repository_url: subRepoUrl.trim() || null,
        demo_url: subDemoUrl.trim() || null,
        video_url: subVideoUrl.trim() || null,
        documentation_url: subDocsUrl.trim() || null,
        status,
        submitted_at: status === 'submitted' ? new Date().toISOString() : mySubmission?.submitted_at || null,
        last_edited_by: user.id,
        is_locked: false,
      };

      if (mySubmission) {
        const { error: updErr } = await supabase
          .from('hackathon_submissions')
          .update(payload)
          .eq('id', mySubmission.id);

        if (updErr) throw new Error(updErr.message);
      } else {
        const { error: insErr } = await supabase
          .from('hackathon_submissions')
          .insert(payload);

        if (insErr) throw new Error(insErr.message);
      }

      setSubmissionFeedback(
        status === 'submitted'
          ? '🎉 Project submitted successfully! Your deliverables are now queued for jury review.'
          : 'Project draft saved.'
      );

      await loadWorkspace();
    } catch (err: unknown) {
      setSubmissionError(err instanceof Error ? err.message : 'Error saving project submission.');
    } finally {
      setIsSavingSubmission(false);
    }
  };

  // Compute Leaderboard Rankings
  const leaderboard = useMemo(() => {
    if (!allSubmissions.length) return [];

    return allSubmissions.map((sub) => {
      const subEvals = evaluations.filter((e) => e.submission_id === sub.id);
      const avgScore =
        subEvals.length > 0
          ? subEvals.reduce((sum, e) => sum + Number(e.total_weighted_score), 0) / subEvals.length
          : 0;

      return {
        ...sub,
        eval_count: subEvals.length,
        average_score: parseFloat(avgScore.toFixed(2)),
        evaluations: subEvals,
      };
    }).sort((a, b) => b.average_score - a.average_score);
  }, [allSubmissions, evaluations]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-7xl mx-auto space-y-6">
        <div className="h-40 rounded-3xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
        <div className="h-96 rounded-3xl bg-charcoal-900 border border-charcoal-800 animate-pulse" />
      </div>
    );
  }

  // Error / Not Found
  if (error || !hackathon) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-md mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Event Not Available</h2>
        <p className="text-xs text-slate-400">{error || 'This hackathon workspace could not be accessed.'}</p>
        <Link href="/hackathons">
          <Button variant="outline" size="sm">Back to Hackathons</Button>
        </Link>
      </div>
    );
  }

  // If user is not participant or organizer in a private hackathon, redirect to join code page
  if (hackathon.access_type === 'private' && !isParticipant && !isOrganizer) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Private College Hackathon</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            &quot;{hackathon.title}&quot; is restricted to enrolled college students. Please authenticate with the event passcode to enter the workspace.
          </p>
        </div>
        <Link href={`/h/${hackathon.join_code}`}>
          <Button variant="primary" size="lg" className="w-full" leftIcon={<Lock className="w-4 h-4" />}>
            Enter Access Passcode
          </Button>
        </Link>
      </div>
    );
  }

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/h/${hackathon.join_code}`
    : `/h/${hackathon.join_code}`;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Hackathon Banner */}
      <div className="rounded-3xl border border-midnight-750/70 bg-gradient-to-br from-midnight-900 via-midnight-900/90 to-midnight-950 p-6 md:p-8 relative overflow-hidden shadow-card">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                  hackathon.access_type === 'private'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-brand-500/15 border-brand-500/30 text-brand-300'
                }`}
              >
                {hackathon.access_type === 'private' ? 'Private College Hackathon' : 'Open Public Event'}
              </span>

              <span className="text-[11px] font-mono text-slate-300 bg-midnight-800 px-2.5 py-0.5 rounded-full border border-midnight-700">
                Mode: {hackathon.mode} {hackathon.location ? `• ${hackathon.location}` : ''}
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Synced
              </span>

              {isOrganizer && (
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Organizer Access
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {hackathon.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {hackathon.description}
            </p>
            <div className="text-xs text-slate-500 pt-1">
              Organized by <strong className="text-slate-300">{hackathon.organizer}</strong>
            </div>

            {isClosed ? (
              <div className="mt-3.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 font-medium shadow-xs">
                <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Hackathon Timeline Closed:</strong> The event deadline has passed. The active team workshop is now closed and in read-only archive mode.
                </span>
              </div>
            ) : (
              <div className="mt-3.5 p-2.5 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>
                  <strong>Active Hackathon Workshop:</strong> Collaborate with your student team, choose problem statements, and submit code before the deadline.
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions & Countdown */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {hackathon.join_code && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(joinUrl);
                  setCopiedJoinLink(true);
                  setTimeout(() => setCopiedJoinLink(false), 2000);
                }}
                leftIcon={<Share2 className="w-3.5 h-3.5 text-brand-400" />}
              >
                {copiedJoinLink ? 'Link Copied!' : 'Share Join Link'}
              </Button>
            )}

            {isOrganizer && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSecurityModalOpen(true)}
                leftIcon={<Shield className="w-3.5 h-3.5 text-amber-400" />}
              >
                Access & Security
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-midnight-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Notices ({announcements.length})
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          className={`pb-3 px-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'challenges'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Problem Statements ({challenges.length})
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 px-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'team'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Team {myTeam ? `(${myTeam.team_name})` : '(Register)'}
        </button>

        <button
          onClick={() => setActiveTab('submission')}
          className={`pb-3 px-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'submission'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Project Deliverables {mySubmission?.status === 'submitted' ? '✅' : ''}
        </button>

        <button
          onClick={() => setActiveTab('judging')}
          className={`pb-3 px-3 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'judging'
              ? 'text-white border-b-2 border-brand-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isJudge ? `Jury Scoring (${allSubmissions.length})` : 'Leaderboard & Results'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & ANNOUNCEMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column: Announcements & Schedule */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements Header */}
            <div className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-brand-400" />
                  <h3 className="text-base font-bold text-white">Organizer Announcements</h3>
                </div>
                {isOrganizer && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsPostAnnouncementOpen(true)}
                    leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                  >
                    Post Notice
                  </Button>
                )}
              </div>

              {announcements.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-charcoal-950/50 border border-charcoal-800">
                  No announcements broadcasted yet. Check back for schedule updates and Q&A announcements!
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ann.is_pinned
                          ? 'bg-amber-500/5 border-amber-500/25'
                          : 'bg-charcoal-950/70 border-charcoal-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {ann.is_pinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {new Date(ann.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {ann.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event Rules & Code of Conduct */}
            <div className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-400" />
                Hackathon Rules & Policies
              </h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {hackathon.rules || '1. Work must be built during the official competition window.\n2. Projects must address one of the released problem statements.\n3. All submissions must include open code repositories and runnable demo links.'}
              </p>
            </div>
          </div>

          {/* Sidebar: Deadlines & Live Stats */}
          <div className="space-y-6">
            {/* Timeline Deadlines */}
            <div className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Key Deadlines
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800">
                  <div className="text-slate-400 mb-0.5">Registration Closes:</div>
                  <div className="font-semibold text-white">
                    {new Date(hackathon.registration_deadline).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800">
                  <div className="text-slate-400 mb-0.5">Final Project Submission:</div>
                  <div className="font-semibold text-amber-300">
                    {hackathon.submission_deadline
                      ? new Date(hackathon.submission_deadline).toLocaleString()
                      : 'To be announced'}
                  </div>
                  {isSubmissionClosed && (
                    <span className="inline-block mt-1 text-[10px] text-red-400 font-medium">
                      ⚠️ Submission portal is closed
                    </span>
                  )}
                </div>

                {hackathon.prize_pool && (
                  <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800">
                    <div className="text-slate-400 mb-0.5">Prizes & Awards:</div>
                    <div className="font-semibold text-emerald-400">{hackathon.prize_pool}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                Event Participation
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
                  <div className="text-lg font-bold text-white">{participants.length}</div>
                  <div className="text-[10px] text-slate-400">Students</div>
                </div>
                <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
                  <div className="text-lg font-bold text-brand-300">{teams.length}</div>
                  <div className="text-[10px] text-slate-400">Teams</div>
                </div>
                <div className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800">
                  <div className="text-lg font-bold text-emerald-300">{allSubmissions.length}</div>
                  <div className="text-[10px] text-slate-400">Projects</div>
                </div>
              </div>
            </div>

            {/* Support / Help */}
            {hackathon.contact_info && (
              <div className="p-4 rounded-xl border border-charcoal-800 bg-charcoal-900/40 text-xs text-slate-400">
                <span className="font-semibold text-slate-200 block mb-1">Faculty Organizer Contact:</span>
                <span>{hackathon.contact_info}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROBLEM STATEMENTS / CHALLENGES */}
      {/* ========================================================================= */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60">
            <div>
              <h3 className="text-base font-bold text-white">Curated Problem Statements</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select a problem statement for your team to build towards. Projects are evaluated on how effectively they resolve these challenges.
              </p>
            </div>
            {isOrganizer && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddChallengeOpen(true)}
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Add Problem Statement
              </Button>
            )}
          </div>

          {challenges.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-charcoal-750 bg-charcoal-900/20 p-12 text-center space-y-3">
              <Code2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-white">No Problem Statements Released Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The faculty organizers will release official challenge statements before hacking starts.
              </p>
              {isOrganizer && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddChallengeOpen(true)}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Publish First Challenge
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {challenges.map((chal) => {
                const isSelectedByMyTeam = myTeam?.challenge_id === chal.id;

                return (
                  <div
                    key={chal.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelectedByMyTeam
                        ? 'border-brand-500 bg-brand-500/5 shadow-subtle'
                        : 'border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-300">
                          {chal.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                          {chal.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{chal.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {chal.problem_description || (chal as any).description}
                      </p>

                      {chal.context && (
                        <div className="p-3 rounded-xl bg-charcoal-950/70 border border-charcoal-800 text-xs text-slate-300 space-y-1">
                          <span className="text-[11px] font-semibold text-brand-300 block">
                            Context & Constraints:
                          </span>
                          <p className="whitespace-pre-wrap leading-relaxed">{chal.context}</p>
                        </div>
                      )}

                      {chal.expected_deliverables && chal.expected_deliverables.length > 0 && (
                        <div className="pt-2 border-t border-charcoal-800">
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Expected Deliverables:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {chal.expected_deliverables.map((del, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-charcoal-950 text-slate-300 border border-charcoal-750 px-2 py-0.5 rounded"
                              >
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {chal.required_skills && chal.required_skills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                            Recommended Tech:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {chal.required_skills.map((sk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-charcoal-800/80 text-brand-300 border border-charcoal-700 px-2 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-charcoal-800 flex items-center justify-between">
                      {isSelectedByMyTeam ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Selected by Your Team
                        </span>
                      ) : myTeam ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectChallenge(chal.id)}
                        >
                          Select for My Team
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedChallengeId(chal.id);
                            setActiveTab('team');
                          }}
                          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        >
                          Create Team for This
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY TEAM & FORMATION */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {myTeam ? (
            /* Student has a team */
            <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-800">
                <div>
                  <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                    Your Registered Hackathon Team
                  </div>
                  <h3 className="text-2xl font-bold text-white">{myTeam.team_name}</h3>
                  {myTeam.description && (
                    <p className="text-xs text-slate-400 mt-1">{myTeam.description}</p>
                  )}
                </div>

                {/* Team Invite Code */}
                {myTeam.invite_code && (
                  <div className="p-3 bg-charcoal-950 rounded-xl border border-charcoal-800 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      Teammate Invite Code
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-brand-300">
                        {myTeam.invite_code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(myTeam.invite_code!);
                          setCopiedTeamCode(true);
                          setTimeout(() => setCopiedTeamCode(false), 2000);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded"
                        title="Copy code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {copiedTeamCode && <span className="text-[10px] text-emerald-400">Code copied!</span>}
                  </div>
                )}
              </div>

              {/* Selected Challenge */}
              <div className="p-4 rounded-xl bg-charcoal-950/70 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Assigned Problem Statement:</span>
                  <span className="text-sm font-semibold text-white">
                    {myTeam.challenge?.title || 'No challenge selected yet'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('challenges')}
                >
                  {myTeam.challenge ? 'Change Challenge' : 'Select Challenge'}
                </Button>
              </div>

              {/* Members Roster */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Team Members ({myTeam.members?.length || 0} / {hackathon.max_team_size || 4})
                  </h4>
                  {myTeam.members && myTeam.members.length < (hackathon.min_team_size || 1) && (
                    <span className="text-xs text-amber-400">
                      ⚠️ Needs at least {hackathon.min_team_size} members to submit
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {myTeam.members?.map((mem) => (
                    <div
                      key={mem.id}
                      className="p-3.5 rounded-xl bg-charcoal-950/80 border border-charcoal-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Avatar
                          name={mem.profile?.display_name || 'Member'}
                          src={mem.profile?.avatar_url}
                          size="sm"
                        />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-white truncate">
                            {mem.profile?.display_name || 'Student'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {mem.profile?.college || 'Team Member'}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          mem.role === 'Leader'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-charcoal-800 text-slate-400'
                        }`}
                      >
                        {mem.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isClosed ? (
            /* Student has NO team AND hackathon is closed */
            <div className="p-8 sm:p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4 shadow-subtle">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Event Registration &amp; Team Workshop Closed</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                The official timeline for this hackathon has ended. Collaborative team workshops are active only during the official hackathon duration.
              </p>
            </div>
          ) : (
            /* Student has NO team: Create or Join */
            <div className="space-y-6">
              {teamActionError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{teamActionError}</span>
                </div>
              )}
              {teamActionSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{teamActionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form a Team */}
                <form
                  onSubmit={handleCreateTeam}
                  className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-4"
                >
                  <div className="flex items-center gap-2 text-white font-bold text-base">
                    <PlusCircle className="w-4 h-4 text-brand-400" />
                    <span>Create a New Team</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Register a team as team leader and invite up to {hackathon.max_team_size} classmates with a private join code.
                  </p>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Team Name *
                    </label>
                    <Input
                      placeholder="e.g. ByteRunners"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Team Vision / Tagline
                    </label>
                    <Input
                      placeholder="e.g. Building NextGen Campus Logistics"
                      value={newTeamDesc}
                      onChange={(e) => setNewTeamDesc(e.target.value)}
                    />
                  </div>

                  {challenges.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Target Problem Statement (Optional)
                      </label>
                      <select
                        value={selectedChallengeId}
                        onChange={(e) => setSelectedChallengeId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-xs text-slate-200"
                      >
                        <option value="">Select challenge later</option>
                        {challenges.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isSubmittingTeam}
                  >
                    Register Team
                  </Button>
                </form>

                {/* Join Existing Team with Code */}
                <form
                  onSubmit={handleJoinTeam}
                  className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-base">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Join an Existing Team</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      If your classmate already registered a team, enter their 6-character team invite code below.
                    </p>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Team Invite Code *
                      </label>
                      <Input
                        placeholder="e.g. 7X9K2P"
                        value={joinTeamCode}
                        onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
                        className="font-mono text-center tracking-widest text-lg font-bold uppercase"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    isLoading={isSubmittingTeam}
                  >
                    Join Team
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ALL REGISTERED TEAMS DIRECTORY */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-charcoal-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-400" />
                  <h3 className="text-lg font-bold text-white">
                    All Registered Teams ({teams.length})
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Browse participating teams in this hackathon. Team invite codes are private to each squad leader.
                </p>
              </div>

              {teams.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search teams or problem tracks..."
                    value={teamSearchQuery}
                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                    className="pl-9 py-1.5 text-xs bg-charcoal-900 border-charcoal-800"
                  />
                </div>
              )}
            </div>

            {teams.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-charcoal-800 text-center space-y-2 bg-charcoal-900/30">
                <Users className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No teams registered yet</p>
                <p className="text-xs text-slate-500">
                  Be the first to register a team and invite your classmates to compete!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams
                  .filter((t) => {
                    if (!teamSearchQuery.trim()) return true;
                    const q = teamSearchQuery.toLowerCase();
                    return (
                      t.team_name.toLowerCase().includes(q) ||
                      (t.description && t.description.toLowerCase().includes(q)) ||
                      (t.challenge?.title && t.challenge.title.toLowerCase().includes(q))
                    );
                  })
                  .map((t) => {
                    const isMyTeamCard = myTeam?.id === t.id;
                    const isTeamFull = (t.members?.length || 0) >= (hackathon.max_team_size || 4);
                    const isCopied = copiedTeamCodeId === t.id;

                    return (
                      <div
                        key={t.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                          isMyTeamCard
                            ? 'bg-brand-500/[0.04] border-brand-500/40 shadow-lg shadow-brand-500/5 ring-1 ring-brand-500/30'
                            : 'bg-charcoal-900/70 border-charcoal-800 hover:border-charcoal-700'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Header: Team Name & Member Cap */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white text-base leading-snug truncate">
                                  {t.team_name}
                                </h4>
                                {isMyTeamCard && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 shrink-0">
                                    Your Team
                                  </span>
                                )}
                              </div>
                              {t.description && (
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                  {t.description}
                                </p>
                              )}
                            </div>

                            <span
                              className={`text-[11px] font-semibold px-2 py-1 rounded-md shrink-0 ${
                                isTeamFull
                                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {t.members?.length || 0} / {hackathon.max_team_size || 4}
                            </span>
                          </div>

                          {/* Challenge Track */}
                          {t.challenge?.title && (
                            <div className="text-xs text-slate-300 bg-charcoal-950/70 border border-charcoal-800/80 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                              <Code2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                              <span className="truncate">Track: {t.challenge.title}</span>
                            </div>
                          )}

                          {/* Member Avatars */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Members
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {t.members && t.members.length > 0 ? (
                                t.members.map((m) => (
                                  <div
                                    key={m.id}
                                    className="flex items-center gap-1.5 bg-charcoal-950/90 border border-charcoal-800 px-2 py-1 rounded-md text-xs text-slate-200"
                                  >
                                    <Avatar
                                      name={m.profile?.display_name || 'Member'}
                                      src={m.profile?.avatar_url}
                                      size="sm"
                                    />
                                    <span className="truncate max-w-[100px]">
                                      {m.profile?.display_name || 'Member'}
                                    </span>
                                    {m.role === 'Leader' && (
                                      <span className="text-amber-400 text-[10px] font-bold" title="Team Leader">
                                        ★
                                      </span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500 italic">No members yet</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Invite Code Box & Join Actions */}
                        <div className="mt-4 pt-3.5 border-t border-charcoal-800/80 space-y-2.5">
                          {isMyTeamCard ? (
                            /* Only the creator / member of this team can see and copy their team's code */
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2 bg-charcoal-950/90 border border-brand-500/40 px-3 py-2 rounded-xl">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="text-[11px] text-brand-300 font-semibold">Your Team Code:</span>
                                  <span className="font-mono text-xs font-bold text-white tracking-widest">
                                    {t.invite_code}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (t.invite_code) {
                                      navigator.clipboard.writeText(t.invite_code);
                                      setCopiedTeamCodeId(t.id);
                                      setTimeout(() => setCopiedTeamCodeId(null), 2000);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-white p-1 rounded transition-colors flex items-center gap-1 text-[11px]"
                                  title="Copy Invite Code"
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400 font-semibold">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 text-center">
                                Share this private code with your teammates to let them join.
                              </p>
                            </div>
                          ) : (
                            /* For everyone else: The code is hidden for privacy! */
                            <div className="flex items-center justify-between text-xs text-slate-400 bg-charcoal-950/60 border border-charcoal-800 px-3 py-2 rounded-xl">
                              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                Private Squad
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {isTeamFull ? 'Squad Full' : 'Requires Team Code'}
                              </span>
                            </div>
                          )}

                          {/* Action Button for non-members */}
                          {!myTeam ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-semibold"
                              disabled={isTeamFull}
                              onClick={() => {
                                const input = document.querySelector('input[placeholder="e.g. 7X9K2P"]') as HTMLInputElement;
                                if (input) {
                                  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  input.focus();
                                }
                              }}
                            >
                              {isTeamFull ? 'Team Full' : 'Join with Code'}
                            </Button>
                          ) : isMyTeamCard ? (
                            <div className="text-center py-1 text-xs text-brand-400 font-semibold flex items-center justify-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              <span>You are a member of this team</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROJECT DELIVERABLES & SUBMISSION */}
      {/* ========================================================================= */}
      {activeTab === 'submission' && (
        <div className="space-y-6">
          {!myTeam ? (
            <div className="p-12 rounded-2xl border border-charcoal-800 bg-charcoal-900/40 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">Team Registration Required</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Please form or join a hackathon team before submitting project deliverables.
              </p>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('team')}>
                Register or Join Team
              </Button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-charcoal-800">
                <div>
                  <h3 className="text-xl font-bold text-white">Project Deliverables Submission</h3>
                  <p className="text-xs text-slate-400">
                    Team: <strong className="text-white">{myTeam.team_name}</strong> • Status:{' '}
                    <span
                      className={`font-semibold ${
                        mySubmission?.status === 'submitted' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {mySubmission?.status === 'submitted' ? 'Submitted for Review' : 'Draft Mode'}
                    </span>
                  </p>
                </div>

                {isSubmissionClosed && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                    🔒 Submissions Closed
                  </span>
                )}
              </div>

              {submissionFeedback && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{submissionFeedback}</span>
                </div>
              )}

              {submissionError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submissionError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Project Title *
                  </label>
                  <Input
                    placeholder="e.g. EcoRide Campus Mobility"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    disabled={isSubmissionClosed}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Tagline / One-sentence Pitch *
                  </label>
                  <Input
                    placeholder="e.g. Decentralized on-campus bike sharing with zero emissions"
                    value={subPitch}
                    onChange={(e) => setSubPitch(e.target.value)}
                    disabled={isSubmissionClosed}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Problem Addressed *
                </label>
                <Textarea
                  rows={3}
                  placeholder="Detail the specific friction or challenge your team set out to resolve..."
                  value={subProblem}
                  onChange={(e) => setSubProblem(e.target.value)}
                  disabled={isSubmissionClosed}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Detailed Solution & System Architecture *
                </label>
                <Textarea
                  rows={4}
                  placeholder="Explain your approach, design decisions, and how the prototype works..."
                  value={subSolution}
                  onChange={(e) => setSubSolution(e.target.value)}
                  disabled={isSubmissionClosed}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Tech Stack (comma separated)
                </label>
                <Input
                  placeholder="e.g. Next.js, FastAPI, PostgreSQL, Supabase, Tailwind"
                  value={subTechStack}
                  onChange={(e) => setSubTechStack(e.target.value)}
                  disabled={isSubmissionClosed}
                />
              </div>

              {/* URLs: Code, Demo, Video, Docs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Github className="w-3.5 h-3.5" />
                    GitHub Repository URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/org/repo"
                    value={subRepoUrl}
                    onChange={(e) => setSubRepoUrl(e.target.value)}
                    disabled={isSubmissionClosed}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                    Live Demo URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://project.vercel.app"
                    value={subDemoUrl}
                    onChange={(e) => setSubDemoUrl(e.target.value)}
                    disabled={isSubmissionClosed}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Video className="w-3.5 h-3.5 text-red-400" />
                    Video Walkthrough / Loom URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or Loom"
                    value={subVideoUrl}
                    onChange={(e) => setSubVideoUrl(e.target.value)}
                    disabled={isSubmissionClosed}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Presentation Slides / Docs URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://docs.google.com/presentation/..."
                    value={subDocsUrl}
                    onChange={(e) => setSubDocsUrl(e.target.value)}
                    disabled={isSubmissionClosed}
                  />
                </div>
              </div>

              {!isSubmissionClosed && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSaveSubmission('draft')}
                    disabled={isSavingSubmission}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handleSaveSubmission('submitted')}
                    isLoading={isSavingSubmission}
                    leftIcon={<Award className="w-4 h-4" />}
                  >
                    Submit Project Deliverables
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: JUDGING & LEADERBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'judging' && (
        <div className="space-y-6">
          {isJudge ? (
            /* ORGANIZER & JUDGE WORKSPACE */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Jury Review & Rubric Scoring
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluate project submissions on multi-criteria weights. Scores remain private until you publish official results.
                  </p>
                </div>

                {isOrganizer && (
                  <Button
                    variant={hackathon.results_published ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setIsSecurityModalOpen(true)}
                    leftIcon={<Trophy className="w-4 h-4" />}
                  >
                    {hackathon.results_published ? 'Manage Results & Access' : 'Publish Official Results'}
                  </Button>
                )}
              </div>

              {allSubmissions.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-charcoal-900/30 border border-charcoal-800 text-xs text-slate-500">
                  No teams have submitted project deliverables yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((sub, idx) => {
                    const myEval = evaluations.find(
                      (e) => e.submission_id === sub.id && e.judge_id === user?.id
                    );

                    return (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-brand-300">
                              {sub.team_name}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                sub.status === 'submitted'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">{sub.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1">{sub.pitch}</p>

                          <div className="flex items-center gap-3 pt-1 text-xs">
                            {sub.repository_url && (
                              <a
                                href={safeExternalUrl(sub.repository_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-white inline-flex items-center gap-1"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Code</span>
                              </a>
                            )}
                            {sub.demo_url && (
                              <a
                                href={safeExternalUrl(sub.demo_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Demo</span>
                              </a>
                            )}
                            {sub.video_url && (
                              <a
                                href={safeExternalUrl(sub.video_url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Video</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-slate-400">Avg Score</div>
                            <div className="text-xl font-bold font-mono text-emerald-400">
                              {sub.average_score.toFixed(1)} / 100
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {sub.eval_count} review{sub.eval_count !== 1 ? 's' : ''}
                            </div>
                          </div>

                          <Button
                            variant={myEval ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => setSelectedSubmissionForEval(sub)}
                            leftIcon={<Award className="w-3.5 h-3.5" />}
                          >
                            {myEval ? 'Update Score' : 'Evaluate'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STUDENT VIEW: OFFICIAL LEADERBOARD */
            <div className="space-y-6">
              {!hackathon.results_published ? (
                <div className="p-16 text-center rounded-2xl bg-charcoal-900/30 border border-charcoal-800 space-y-4">
                  <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                  <h3 className="text-xl font-bold text-white">Jury Review Underway</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Faculty mentors and judges are reviewing submissions against evaluation criteria. Official rankings, awards, and jury feedback will appear here once published!
                  </p>
                </div>
              ) : (
                /* OFFICIAL RANKINGS PUBLISHED */
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border border-amber-500/30 text-center space-y-2">
                    <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
                    <h3 className="text-2xl font-extrabold text-white">Official Hackathon Results</h3>
                    <p className="text-xs text-slate-300">
                      Congratulations to all student teams! The faculty jury has finalized official rankings.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {leaderboard.map((item, idx) => {
                      const isTop3 = idx < 3;
                      const badgeColors = [
                        'bg-amber-400 text-charcoal-950 font-bold',
                        'bg-slate-300 text-charcoal-950 font-bold',
                        'bg-amber-700 text-white font-bold',
                      ];

                      return (
                        <div
                          key={item.id}
                          className={`p-5 rounded-2xl border transition-all ${
                            isTop3
                              ? 'bg-charcoal-900/80 border-charcoal-700 shadow-subtle'
                              : 'bg-charcoal-900/40 border-charcoal-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono shrink-0 ${
                                  isTop3 ? badgeColors[idx] : 'bg-charcoal-800 text-slate-400'
                                }`}
                              >
                                #{idx + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                                  <span className="text-xs text-brand-300 font-semibold">
                                    • {item.team_name}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-1">{item.pitch}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase">Jury Score</div>
                                <div className="text-lg font-bold font-mono text-emerald-400">
                                  {item.average_score.toFixed(1)} / 100
                                </div>
                              </div>
                              {item.demo_url && (
                                <a
                                  href={safeExternalUrl(item.demo_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/30"
                                  title="View Project Demo"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddChallengeModal
        hackathonId={hackathon.id}
        isOpen={isAddChallengeOpen}
        onClose={() => setIsAddChallengeOpen(false)}
        onSuccess={async (newChal) => {
          setIsAddChallengeOpen(false);
          if (newChal) {
            setChallenges((prev) => [newChal, ...prev.filter((c) => c.id !== newChal.id)]);
          }
          await loadWorkspace();
        }}
      />

      <PostAnnouncementModal
        hackathonId={hackathon.id}
        isOpen={isPostAnnouncementOpen}
        onClose={() => setIsPostAnnouncementOpen(false)}
        onSuccess={async (newAnn) => {
          setIsPostAnnouncementOpen(false);
          if (newAnn) {
            setAnnouncements((prev) => [newAnn, ...prev.filter((a) => a.id !== newAnn.id)]);
          }
          await loadWorkspace();
        }}
      />

      <HackathonSecurityModal
        hackathon={hackathon}
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onUpdated={async () => {
          await loadWorkspace();
        }}
      />

      <EvaluationModal
        hackathonId={hackathon.id}
        submission={selectedSubmissionForEval}
        criteria={criteria}
        existingEvaluation={
          evaluations.find(
            (e) =>
              e.submission_id === selectedSubmissionForEval?.id &&
              e.judge_id === user?.id
          ) || null
        }
        isOpen={Boolean(selectedSubmissionForEval)}
        onClose={() => setSelectedSubmissionForEval(null)}
        onSuccess={async () => {
          setSelectedSubmissionForEval(null);
          await loadWorkspace();
        }}
      />
    </div>
  );
}
