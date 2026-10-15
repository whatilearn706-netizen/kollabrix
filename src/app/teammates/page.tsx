'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Profile, Project, TeammateMatch } from '@/types/database';
import {
  calculateProjectTeammateMatch,
  calculatePeerTeammateMatch,
} from '@/lib/teammateMatching';
import { TeammateCard } from '@/components/teammates/TeammateCard';
import { InviteTeammateModal } from '@/components/teammates/InviteTeammateModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import {
  Users,
  Sparkles,
  Search,
  Filter,
  Briefcase,
  SlidersHorizontal,
  RefreshCw,
  FolderPlus,
  GraduationCap,
  Trophy,
  Lock,
  KeyRound,
  Users2,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function TeammatesPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('peer');
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [inviteModalCandidate, setInviteModalCandidate] = useState<Profile | null>(null);
  const [inviteModalScore, setInviteModalScore] = useState<number | undefined>();

  // Quick join code state for Private Hackathons
  const [hackathonCode, setHackathonCode] = useState('');
  const [hackathonError, setHackathonError] = useState<string | null>(null);

  const [suspendedUserIds, setSuspendedUserIds] = useState<string[]>([]);

  // Load profiles, user projects, and invitations
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        // 0. Fetch match scoring config to retrieve suspended user IDs registry
        let suspendedIds: string[] = [];
        try {
          const { data: settingData } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'match_scoring_config')
            .maybeSingle();

          if (settingData?.value) {
            if ((settingData.value as any).weights) {
              setMatchWeights((settingData.value as any).weights);
            }
            if (Array.isArray((settingData.value as any).suspended_user_ids)) {
              suspendedIds = (settingData.value as any).suspended_user_ids;
              setSuspendedUserIds(suspendedIds);
            }
          }
        } catch {}

        // 1. Fetch public profiles, strictly excluding suspended or non-active accounts
        const { data: profs } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_portfolio_public', true)
          .neq('is_suspended', true)
          .neq('status', 'suspended')
          .order('updated_at', { ascending: false })
          .limit(60);

        if (profs) {
          const activeProfs = (profs as Profile[]).filter(
            (p) =>
              !p.is_suspended &&
              p.status !== 'suspended' &&
              !suspendedIds.includes(p.user_id)
          );
          setAllProfiles(activeProfs);
        }

        // 2. If logged in, fetch owned projects
        if (user) {
          const { data: projs } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_id', user.id)
            .in('status', ['Recruiting', 'In Progress'])
            .order('created_at', { ascending: false });

          if (projs && projs.length > 0) {
            setUserProjects(projs as Project[]);
            // Default to first project if available
            setSelectedProjectId((prev) => (prev === 'peer' && projs[0] ? projs[0].id : prev));
          }

          // 3. Fetch existing sent invitations
          let remoteInvitedIds: string[] = [];
          try {
            const { data: invites, error: inviteErr } = await supabase
              .from('project_invitations')
              .select('invitee_id')
              .eq('inviter_id', user.id);

            if (!inviteErr && invites) {
              remoteInvitedIds = invites.map((i) => i.invitee_id);
            }
          } catch {
            // Non-blocking schema cache fallback
          }

          // Merge with locally recorded invitations
          let localInvitedIds: string[] = [];
          if (typeof window !== 'undefined') {
            try {
              const localInvites = JSON.parse(localStorage.getItem('teamforge_sent_invitations') || '[]');
              localInvitedIds = localInvites
                .filter((li: any) => li.inviter_id === user.id)
                .map((li: any) => li.invitee_id);
            } catch {
              // ignore
            }
          }

          const combinedInvitedIds = Array.from(new Set([...remoteInvitedIds, ...localInvitedIds]));
          setInvitedUserIds(combinedInvitedIds);
        }
      }
    } catch (e) {
      console.warn('Error loading teammates data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Load existing project members when selected project changes
  useEffect(() => {
    async function loadMembers() {
      if (selectedProjectId === 'peer' || !isSupabaseConfigured()) {
        setExistingMemberIds([]);
        return;
      }
      try {
        const { data } = await supabase
          .from('project_members')
          .select('user_id')
          .eq('project_id', selectedProjectId);

        if (data) {
          setExistingMemberIds(data.map((m) => m.user_id));
        }
      } catch {
        setExistingMemberIds([]);
      }
    }
    loadMembers();
  }, [selectedProjectId]);

  const activeProject = useMemo(() => {
    return userProjects.find((p) => p.id === selectedProjectId);
  }, [userProjects, selectedProjectId]);

  const [matchWeights, setMatchWeights] = useState<any>();

  useEffect(() => {
    async function loadWeights() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'match_scoring_config')
          .maybeSingle();

        if (data?.value?.weights) {
          setMatchWeights(data.value.weights);
          if (data.value.min_recommendation_score) {
            setMinScore((prev) => (prev === 0 ? data.value.min_recommendation_score : prev));
          }
        }
      } catch {}
    }
    loadWeights();
  }, []);

  // Calculate matches dynamically based on selected project or peer profile
  const matches: TeammateMatch[] = useMemo(() => {
    if (!allProfiles || allProfiles.length === 0) return [];

    const results: TeammateMatch[] = [];

    for (const cand of allProfiles) {
      // Strictly exclude any suspended or non-active candidates
      if (
        cand.is_suspended ||
        cand.status === 'suspended' ||
        suspendedUserIds.includes(cand.user_id)
      ) {
        continue;
      }

      if (activeProject) {
        const match = calculateProjectTeammateMatch(
          cand,
          activeProject,
          user?.id,
          existingMemberIds,
          matchWeights
        );
        if (match) results.push(match);
      } else if (profile) {
        const match = calculatePeerTeammateMatch(cand, profile, matchWeights);
        if (match) results.push(match);
      } else {
        // Unauthenticated visitor view: show general profile score
        if (cand.user_id !== user?.id) {
          results.push({
            profile: cand,
            match_score: 75,
            matching_skills: (cand.skills || []).slice(0, 3),
            matching_roles: (cand.preferred_roles || []).slice(0, 1),
            matching_interests: (cand.interests || []).slice(0, 2),
            reasons: ['Active campus builder with verified skills'],
          });
        }
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.match_score - a.match_score);
  }, [allProfiles, activeProject, profile, user, existingMemberIds, matchWeights, suspendedUserIds]);

  // Extract unique skills and roles from available candidates for filters
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m) => m.profile.skills?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [matches]);

  const availableRoles = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m) => m.profile.preferred_roles?.forEach((r) => set.add(r)));
    return Array.from(set).sort();
  }, [matches]);

  // Apply search and filter
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Score filter
      if (m.match_score < minScore) return false;

      // Search query (name, username, bio, skills)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = m.profile.display_name.toLowerCase().includes(q);
        const userMatch = m.profile.username.toLowerCase().includes(q);
        const bioMatch = m.profile.bio?.toLowerCase().includes(q);
        const skillMatch = m.profile.skills?.some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !userMatch && !bioMatch && !skillMatch) return false;
      }

      // Skill filter
      if (selectedSkill !== 'All') {
        const hasSkill = m.profile.skills?.some(
          (s) => s.toLowerCase() === selectedSkill.toLowerCase()
        );
        if (!hasSkill) return false;
      }

      // Role filter
      if (selectedRole !== 'All') {
        const hasRole = m.profile.preferred_roles?.some(
          (r) => r.toLowerCase() === selectedRole.toLowerCase()
        );
        if (!hasRole) return false;
      }

      return true;
    });
  }, [matches, searchQuery, selectedSkill, selectedRole, minScore]);

  const handleOpenInvite = (candMatch: TeammateMatch) => {
    setInviteModalCandidate(candMatch.profile);
    setInviteModalScore(candMatch.match_score);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Collegiate Matchmaking Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Find Teammates
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Discover student collaborators with complementary skills and shared project goals. Our transparent algorithm scores matches based on project requirements, preferred roles, and technical skills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh Candidates
          </Button>
          <Link href="/projects/new">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FolderPlus className="w-4 h-4" />}
            >
              Start New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Compact Campus Hackathon Quick-Join Callout */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-midnight-900 to-indigo-950/20 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Assembling for a College Hackathon?</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                Campus Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your department passcode to unlock private challenge guidelines and recruit your 2–4 student squad.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setHackathonError(null);
              if (!hackathonCode.trim()) {
                setHackathonError('Please enter a hackathon join code.');
                return;
              }
              let clean = hackathonCode.trim();
              if (clean.includes('/h/')) {
                clean = clean.split('/h/')[1];
              }
              clean = clean.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
              if (!clean) {
                setHackathonError('Invalid join code format.');
                return;
              }
              router.push(`/h/${clean}`);
            }}
            className="flex items-center gap-2 flex-1 md:flex-initial"
          >
            <div className="relative flex-1 md:w-48">
              <KeyRound className="w-3.5 h-3.5 text-amber-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Passcode (e.g. col-apex26)"
                value={hackathonCode}
                onChange={(e) => setHackathonCode(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-midnight-950 border border-midnight-700/80 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-colors"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs whitespace-nowrap py-1.5 px-3"
            >
              Unlock
            </Button>
          </form>

          <Link href="/hackathons">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-midnight-700/80 text-slate-300 hover:text-white hover:bg-midnight-800 whitespace-nowrap py-1.5 px-3"
            >
              Browse All
            </Button>
          </Link>
        </div>
      </div>

      {hackathonError && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <span className="font-semibold">Error:</span> {hackathonError}
        </div>
      )}

      {/* Target Matching Context Selector */}
      <div className="rounded-2xl bg-midnight-900/90 border border-midnight-700/60 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white">Target Project for Recommendations:</h3>
          </div>
          <span className="text-xs text-slate-400">
            {activeProject
              ? `Matching students for "${activeProject.title}"`
              : 'Matching peers based on your profile skills & interests'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedProjectId === p.id
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 shadow-sm'
                  : 'bg-midnight-850 text-slate-400 border-midnight-700/60 hover:text-white hover:border-midnight-600'
              }`}
            >
              {p.title}
            </button>
          ))}

          <button
            onClick={() => setSelectedProjectId('peer')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedProjectId === 'peer'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-midnight-850 text-slate-400 border-midnight-700/60 hover:text-white hover:border-midnight-600'
            }`}
          >
            General Peer Match (Across Campus)
          </button>
        </div>

        {activeProject && (
          <div className="p-3 rounded-xl bg-midnight-850/80 border border-midnight-750 text-xs text-slate-300 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <span className="text-slate-400">Category:</span>{' '}
              <strong className="text-white">{activeProject.category}</strong>
            </div>
            <div>
              <span className="text-slate-400">Required Skills:</span>{' '}
              <span className="text-brand-300 font-mono">
                {activeProject.required_skills?.join(', ') || 'None specified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Open Roles:</span>{' '}
              <span className="text-indigo-300">
                {activeProject.desired_roles?.join(', ') || 'Any roles'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-midnight-900/90 border border-midnight-750 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, skill, bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Skill Filter */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="All">All Technical Skills</option>
            {availableSkills.map((sk) => (
              <option key={sk} value={sk}>
                Skill: {sk}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="All">All Preferred Roles</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                Role: {r}
              </option>
            ))}
          </select>

          {/* Min Match Score */}
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-midnight-850 border border-midnight-700/80 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value={0}>Any Match Score</option>
            <option value={50}>50%+ Compatibility</option>
            <option value={70}>70%+ High Match</option>
            <option value={80}>80%+ Exceptional Match</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white">{filteredMatches.length}</strong> recommended teammate
            {filteredMatches.length !== 1 ? 's' : ''}
          </span>
          {(searchQuery || selectedSkill !== 'All' || selectedRole !== 'All' || minScore > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkill('All');
                setSelectedRole('All');
                setMinScore(0);
              }}
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Teammates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-midnight-900/80 border border-midnight-800 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <TeammateCard
              key={match.profile.user_id}
              match={match}
              onInvite={handleOpenInvite}
              isInvited={invitedUserIds.includes(match.profile.user_id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-midnight-900/90 border border-midnight-750 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-midnight-800 border border-midnight-700 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Students Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, lowering the match score threshold, or inviting students from across campus.
          </p>
        </div>
      )}

      {/* Invite Modal */}
      <InviteTeammateModal
        isOpen={Boolean(inviteModalCandidate)}
        onClose={() => setInviteModalCandidate(null)}
        candidate={inviteModalCandidate}
        matchScore={inviteModalScore}
        initialProjectId={activeProject?.id}
        onSuccess={() => {
          if (inviteModalCandidate) {
            setInvitedUserIds((prev) => [...prev, inviteModalCandidate.user_id]);
          }
        }}
      />
    </div>
  );
}
