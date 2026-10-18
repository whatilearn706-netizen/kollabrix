'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProblemStatement, Project, ProblemSolution } from '@/types/database';
import { ProblemResultRecord } from '@/app/api/problems/results/route';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProblemSolutionModal } from '@/components/applications/ProblemSolutionModal';
import { ProblemTeamModal } from '@/components/applications/ProblemTeamModal';
import {
  FileCode2,
  GraduationCap,
  Calendar,
  Layers,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Github,
  Globe,
  Video,
  Award,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Trophy,
  Crown,
  Radio,
  Building,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Plus,
} from 'lucide-react';

import { DEMO_PROBLEMS } from '@/data/mockProblems';
import { DEMO_PROJECTS } from '@/data/mockProjects';

export default function ProblemStatementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, openAuthModal } = useAuth();

  const demoMatch = DEMO_PROBLEMS.find((p) => p.id === id);

  const [problem, setProblem] = useState<ProblemStatement | null>(() => demoMatch || null);
  const [tacklingProjects, setTacklingProjects] = useState<Project[]>(() =>
    demoMatch ? DEMO_PROJECTS.filter((p) => p.problem_statement_id === id) : []
  );

  const [isLoading, setIsLoading] = useState(() => !Boolean(demoMatch));
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Link Sharing state
  const [isCopied, setIsCopied] = useState(false);

  // Student answer state
  const [hasApplied, setHasApplied] = useState(false);
  const [myAppliedDetails, setMyAppliedDetails] = useState<{ teamName?: string; title?: string } | null>(null);

  // Problem answers & solutions state
  const [solutions, setSolutions] = useState<ProblemSolution[]>([]);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
  const [isSolutionModalOpen, setIsSolutionModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [myProjects, setMyProjects] = useState<Project[]>([]);

  // Results & Live Winner state
  const [problemResult, setProblemResult] = useState<ProblemResultRecord | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [isTogglingLive, setIsTogglingLive] = useState(false);
  const [isSavingWinner, setIsSavingWinner] = useState(false);

  // Winner Form fields for Faculty Author
  const [winnerTeamName, setWinnerTeamName] = useState('');
  const [winnerSolutionTitle, setWinnerSolutionTitle] = useState('');
  const [winnerOverview, setWinnerOverview] = useState('');
  const [winnerRepoUrl, setWinnerRepoUrl] = useState('');
  const [winnerDemoUrl, setWinnerDemoUrl] = useState('');
  const [winnerVideoUrl, setWinnerVideoUrl] = useState('');
  const [winnerRemarks, setWinnerRemarks] = useState('');
  const [winnerAwardTitle, setWinnerAwardTitle] = useState('1st Place • Faculty Research Excellence Award');

  // Load problem details & tackling projects
  const loadData = useCallback(async () => {
    if (!id) return;

    const matched = DEMO_PROBLEMS.find((p) => p.id === id);
    if (matched && !isSupabaseConfigured()) {
      setProblem(matched);
      setTacklingProjects(DEMO_PROJECTS.filter((p) => p.problem_statement_id === id));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data: probData, error: probError } = await supabase
        .from('problem_statements')
        .select(`
          *,
          author:profiles!problem_statements_author_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url,
            college,
            course,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (probError) {
        let foundComm: any = null;
        try {
          const { data: commRow } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'community_problem_statements')
            .maybeSingle();

          if (commRow?.value && Array.isArray(commRow.value)) {
            foundComm = commRow.value.find((p: any) => p.id === id);
          }
        } catch {}

        if (foundComm) {
          setProblem(foundComm as ProblemStatement);
        } else if (matched) {
          setProblem(matched);
          setTacklingProjects(DEMO_PROJECTS.filter((p) => p.problem_statement_id === id));
        } else {
          throw new Error(probError.message);
        }
      } else if (probData) {
        setProblem(probData as unknown as ProblemStatement);
      }

      // Load student projects referencing this problem
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          summary,
          category,
          difficulty,
          status,
          current_team_size,
          desired_team_size,
          created_at,
          owner_id,
          problem_statement_id,
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('problem_statement_id', id)
        .order('created_at', { ascending: false });

      let combinedProjects: Project[] = [];
      if (!projError && projData) {
        combinedProjects = projData as unknown as Project[];
      }

      // Merge locally created problem teams
      if (typeof window !== 'undefined') {
        try {
          const localTeams = JSON.parse(localStorage.getItem(`tf_problem_teams_${id}`) || '[]');
          if (Array.isArray(localTeams)) {
            const existingIds = new Set(combinedProjects.map((p) => p.id));
            for (const lt of localTeams) {
              if (lt && lt.id && !existingIds.has(lt.id)) {
                combinedProjects.unshift(lt);
              }
            }
          }
        } catch {}
      }

      setTacklingProjects(combinedProjects);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load problem statement.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const loadSolutions = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingSolutions(true);
      const url = user?.id
        ? `/api/problems/solutions?problem_id=${id}&viewer_id=${user.id}`
        : `/api/problems/solutions?problem_id=${id}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && Array.isArray(data.solutions)) {
        setSolutions(data.solutions);

        // Check if current user has applied
        if (user) {
          const mySol = data.solutions.find((s: ProblemSolution) => s && s.author_id === user.id);
          if (mySol) {
            setHasApplied(true);
            setMyAppliedDetails({ teamName: mySol.team_name, title: mySol.title });
          }
        }
      }
    } catch (e) {
      console.warn('Notice loading solutions:', e);
    } finally {
      setIsLoadingSolutions(false);
    }
  }, [id, user]);

  const loadResults = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingResult(true);
      const res = await fetch(`/api/problems/results?problem_id=${id}`);
      const data = await res.json();
      if (res.ok && data.result) {
        const r: ProblemResultRecord = data.result;
        setProblemResult(r);
        setWinnerTeamName(r.winner_team_name || '');
        setWinnerSolutionTitle(r.winner_solution_title || '');
        setWinnerOverview(r.winner_overview || '');
        setWinnerRepoUrl(r.repo_url || '');
        setWinnerDemoUrl(r.demo_url || '');
        setWinnerVideoUrl(r.video_url || '');
        setWinnerRemarks(r.mentor_remarks || '');
        if (r.award_title) setWinnerAwardTitle(r.award_title);
      }
    } catch (e) {
      console.warn('Notice loading results:', e);
    } finally {
      setIsLoadingResult(false);
    }
  }, [id]);

  useEffect(() => {
    async function loadUserProjects() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('projects')
          .select('id, title, current_team_size, desired_team_size, problem_statement_id')
          .eq('owner_id', user.id);
        if (data) setMyProjects(data as any);
      } catch (e) {}
    }
    loadUserProjects();
  }, [user]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const localFlag = localStorage.getItem(`tf_user_applied_${id}_${user.id}`);
      const localData = localStorage.getItem(`linkora_applied_solution_${id}_${user.id}`);
      if (localFlag === 'true' || localData) {
        setHasApplied(true);
        if (localData) {
          try {
            setMyAppliedDetails(JSON.parse(localData));
          } catch {}
        }
      }
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
    loadSolutions();
    loadResults();
  }, [loadData, loadSolutions, loadResults]);

  const isAuthor = Boolean(user && user.id === problem?.author_id);
  const isExpired = problem?.deadline ? new Date(problem.deadline) < new Date() : false;
  const isResultsLive = Boolean(problemResult?.is_live);

  // Student Privacy / Answer Isolation:
  // Faculty author sees all submissions; students ONLY see their own team's submission
  const visibleSolutions = useMemo(() => {
    if (!Array.isArray(solutions)) return [];
    if (isAuthor) {
      return solutions;
    }
    if (!user) {
      return [];
    }
    return solutions.filter((s) => s && s.author_id === user.id);
  }, [solutions, isAuthor, user]);

  // Link Sharing Handlers
  const getProblemUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/problems/${id}`;
    }
    return `https://linkora-link.online/problems/${id}`;
  };

  const handleCopyLink = () => {
    const url = getProblemUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setActionSuccess('Problem statement link copied! Share this link with your students.');
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const url = getProblemUrl();
    const title = problem?.title || 'Faculty Problem Statement';
    const text = `🎓 *Faculty Problem Statement*\n\n*${title}*\n\nReview the problem specifications and directly apply your team's answer on Linkora:\n${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  };

  // Toggle Live Results
  const handleToggleLive = async () => {
    if (!id || !problem) return;
    setIsTogglingLive(true);
    setActionSuccess(null);
    try {
      const newLiveState = !isResultsLive;
      const res = await fetch('/api/problems/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: id,
          is_live: newLiveState,
          winner_team_name: winnerTeamName || problemResult?.winner_team_name || 'Winning Team',
          winner_solution_title: winnerSolutionTitle || problemResult?.winner_solution_title || '',
          winner_overview: winnerOverview || problemResult?.winner_overview || '',
          repo_url: winnerRepoUrl || problemResult?.repo_url || '',
          demo_url: winnerDemoUrl || problemResult?.demo_url || '',
          video_url: winnerVideoUrl || problemResult?.video_url || '',
          mentor_remarks: winnerRemarks || problemResult?.mentor_remarks || '',
          award_title: winnerAwardTitle || problemResult?.award_title || '1st Place • Faculty Research Excellence Award',
          author_id: user?.id,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData?.error || 'Failed to update live status.');
      }

      setProblemResult(resData.result);
      setActionSuccess(
        newLiveState
          ? '📢 Results are now LIVE for all students! Students will now see the 1 official Result Winner segment.'
          : 'Results have been reverted to private faculty draft mode.'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error toggling live status.');
    } finally {
      setIsTogglingLive(false);
    }
  };

  // Save Winner Details
  const handleSaveWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSavingWinner(true);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/problems/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: id,
          is_live: problemResult?.is_live ?? false,
          winner_team_name: winnerTeamName.trim(),
          winner_solution_title: winnerSolutionTitle.trim(),
          winner_overview: winnerOverview.trim(),
          repo_url: winnerRepoUrl.trim(),
          demo_url: winnerDemoUrl.trim(),
          video_url: winnerVideoUrl.trim(),
          mentor_remarks: winnerRemarks.trim(),
          award_title: winnerAwardTitle.trim(),
          author_id: user?.id,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData?.error || 'Failed to save winner.');
      }

      setProblemResult(resData.result);
      setActionSuccess('🏆 Result Winner updated! You can now tap "Tap Live / Publish" to reveal to students.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving winner.');
    } finally {
      setIsSavingWinner(false);
    }
  };

  const handleSelectSolutionAsWinner = (sol: ProblemSolution) => {
    setWinnerTeamName(sol.team_name || '');
    setWinnerSolutionTitle(sol.title || '');
    setWinnerOverview(sol.solution_writeup || '');
    setWinnerRepoUrl(sol.repo_url || '');
    setWinnerDemoUrl(sol.demo_url || '');
    setWinnerVideoUrl(sol.video_url || '');
    if (sol.mentor_feedback) {
      setWinnerRemarks(sol.mentor_feedback);
    }
    setActionSuccess(`Loaded deliverables from team "${sol.team_name}". Review details below and click Save Winner or Tap Live!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-200 font-mono">Loading problem statement...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Problem Statement Not Found</h2>
          <p className="text-sm text-slate-200 mb-6">
            {error || 'This problem statement may have been removed or is currently unpublished.'}
          </p>
          <Link href="/problems">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Problem Statements
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const userExistingTeam = user
    ? tacklingProjects.find(
        (p) => p.owner_id === user.id || (p.owner as any)?.user_id === user.id
      )
    : null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-slate-100">
      {/* Top Navigation & Share Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Statements</span>
        </Link>

        {/* Prominent Direct Link Sharing & Form Team Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isAuthor && (
            userExistingTeam ? (
              <Link href={`/projects/${userExistingTeam.id}`}>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-brand-500/15 border-brand-500/30 text-brand-700 dark:text-brand-300 hover:bg-brand-500/25 font-bold text-xs"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />}
                  title="You already have 1 team formed for this problem (1 team limit per student)"
                >
                  Your Squad ({userExistingTeam.title})
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!user) openAuthModal();
                  else setIsTeamModalOpen(true);
                }}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                leftIcon={<Users className="w-3.5 h-3.5" />}
              >
                Form a Student Team
              </Button>
            )
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="bg-white dark:bg-charcoal-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-700 text-xs font-semibold shadow-xs"
            leftIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-brand-500" />}
          >
            {isCopied ? 'Link Copied!' : 'Copy Student Invite Link'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleShareWhatsApp}
            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold shadow-xs"
            leftIcon={<MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          >
            WhatsApp Share
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-slate-300 hover:text-white text-xs font-semibold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header Container */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/80 p-6 sm:p-8 mb-8 backdrop-blur-sm shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="category">{problem.category}</Badge>
            <Badge variant="difficulty" difficulty={problem.difficulty} />
            {problem.status === 'Draft' && (
              <Badge variant="default" className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
                Draft (Private)
              </Badge>
            )}
            {isResultsLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Results Live</span>
              </span>
            )}
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-3">
            {isAuthor ? (
              <>
                <Link href={`/problems/${problem.id}/edit`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Edit3 className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
                    className="bg-white dark:bg-charcoal-800 text-slate-800 dark:text-white border border-slate-300 dark:border-charcoal-700 shadow-xs hover:bg-slate-50 dark:hover:bg-charcoal-700 font-semibold"
                  >
                    Edit Problem
                  </Button>
                </Link>
                <a href="#faculty-results-section">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                    leftIcon={<Trophy className="w-4 h-4" />}
                  >
                    Results &amp; Winner
                  </Button>
                </a>
              </>
            ) : hasApplied ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold opacity-90 cursor-default px-4"
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                >
                  Applied
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  if (!user) openAuthModal();
                  else setIsSolutionModalOpen(true);
                }}
              >
                Apply the Answer
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-4 leading-snug">
          {problem.title}
        </h1>

        {/* Faculty Author & Metadata Bar */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-charcoal-800 text-sm text-slate-200">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={problem.author?.display_name || 'Faculty Member'}
              src={problem.author?.avatar_url}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{problem.author?.display_name || 'Faculty Mentor'}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Faculty
                </span>
              </div>
              <p className="text-xs text-brand-300 font-semibold flex items-center gap-1 mt-0.5">
                <Building className="w-3 h-3 text-brand-400" />
                <span>{problem.author?.college || (problem as any).college || 'Academic Institution'}</span>
              </p>
            </div>
          </div>

          {/* Expected Team Size */}
          <div className="flex items-center gap-1.5 text-xs text-brand-200 bg-brand-500/15 px-3 py-1.5 rounded-xl border border-brand-500/30 font-medium">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span>
              Expected Team Size: <strong className="text-white font-bold">{problem.team_size || '2 – 4 Students'}</strong>
            </span>
          </div>

          {problem.deadline && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-slate-300 font-medium">Deadline: </span>
                <span
                  className={
                    isExpired
                      ? 'text-red-400 font-bold'
                      : 'text-amber-300 font-bold'
                  }
                >
                  {new Date(problem.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {isExpired && ' (Expired)'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Posted {new Date(problem.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Description & Required Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left: Detailed Specification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/60 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-emerald-400" />
              <span>Problem Specification &amp; Objectives</span>
            </h2>
            <div className="text-slate-100 text-sm whitespace-pre-wrap leading-relaxed font-normal">
              {problem.description}
            </div>
          </div>
        </div>

        {/* Right: Technical Requirements & Direct Apply Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/60 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {problem.required_skills?.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="bg-charcoal-800 text-slate-100 border-charcoal-700 font-semibold"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Students applying answers to this challenge should implement their solution leveraging these competencies.
            </p>
          </div>

          {/* Apply the Answer CTA Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/25 via-charcoal-900/80 to-charcoal-900 p-6 shadow-md">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Submit Solution Deliverable</span>
            </h3>
            <p className="text-xs text-slate-200 mb-5 leading-relaxed font-normal">
              Directly submit your team name, detailed overview solution, GitHub repository, and live demo link. No prior application approval needed.
            </p>

            {isAuthor ? (
              <div className="p-3.5 rounded-xl bg-charcoal-800/90 border border-charcoal-700 text-xs text-center text-slate-200 font-medium">
                You are the faculty author of this problem statement.
              </div>
            ) : hasApplied ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Your Submission Status:</span>
                  <Badge variant="status" status="Completed" className="font-bold">
                    Applied
                  </Badge>
                </div>
                {myAppliedDetails?.teamName && (
                  <p className="text-xs text-emerald-300 font-semibold">
                    Team: {myAppliedDetails.teamName}
                  </p>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="w-full bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-bold opacity-90 cursor-default mt-2"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  Applied
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={() => {
                    if (!user) openAuthModal();
                    else setIsSolutionModalOpen(true);
                  }}
                >
                  Apply the Answer
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-charcoal-700 text-slate-200 hover:text-white hover:bg-charcoal-800 font-semibold"
                  leftIcon={<Users className="w-3.5 h-3.5 text-brand-400" />}
                  onClick={() => {
                    if (!user) openAuthModal();
                    else setIsTeamModalOpen(true);
                  }}
                >
                  Form a Student Team
                </Button>
              </div>
            )}
          </div>

          {/* Quick Share Link Box */}
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Direct Problem Link</span>
              </span>
              <button
                onClick={handleCopyLink}
                className="text-[11px] text-brand-300 hover:text-white font-semibold underline"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="p-2 rounded-xl bg-charcoal-850 border border-charcoal-750 font-mono text-[11px] text-slate-300 truncate select-all">
              {getProblemUrl()}
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Author Section: Results Control & Crown Winner */}
      {isAuthor && (
        <div id="faculty-results-section" className="pt-8 border-t border-charcoal-800 mb-12">
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-charcoal-900/90 to-charcoal-900 p-6 sm:p-8 space-y-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1 font-bold">
                  <Crown className="w-4 h-4" />
                  <span>Faculty Control Panel</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>Results &amp; Winner Declaration</span>
                </h2>
                <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                  Select the winning team from submitted answers or enter winner credentials. When you tap <strong>Live</strong>, the challenge results become public and all other segments are replaced by the <strong>Result Winner</strong> segment for students.
                </p>
              </div>

              {/* Tap Live Button */}
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isTogglingLive}
                  onClick={handleToggleLive}
                  className={
                    isResultsLive
                      ? 'bg-amber-600 hover:bg-amber-500 text-white font-extrabold shadow-lg px-5'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-lg px-5'
                  }
                  leftIcon={isResultsLive ? <EyeOff className="w-4 h-4" /> : <Radio className="w-4 h-4 text-white animate-pulse" />}
                >
                  {isResultsLive ? '📢 Live Active • Revert to Draft' : '📢 Tap Live / Publish Results'}
                </Button>
              </div>
            </div>

            {/* Winner Setup Form */}
            <form onSubmit={handleSaveWinner} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Result Winner Details</span>
                </h3>
                {solutions.length > 0 && (
                  <span className="text-[11px] text-slate-300">
                    💡 Tip: Click &quot;Crown as Winner&quot; in the answers section below to auto-fill this form.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    Winner Team Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={winnerTeamName}
                    onChange={(e) => setWinnerTeamName(e.target.value)}
                    placeholder="e.g. NextGen Builders"
                    required
                    className="w-full px-3.5 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block">
                    Award / Honor Title
                  </label>
                  <input
                    type="text"
                    value={winnerAwardTitle}
                    onChange={(e) => setWinnerAwardTitle(e.target.value)}
                    placeholder="1st Place • Faculty Research Excellence Award"
                    className="w-full px-3.5 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  Winning Solution Title
                </label>
                <input
                  type="text"
                  value={winnerSolutionTitle}
                  onChange={(e) => setWinnerSolutionTitle(e.target.value)}
                  placeholder="e.g. CampusRoute: Automated Telemetry & Dispatch System"
                  className="w-full px-3.5 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  Winning Solution Overview &amp; Highlights <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={winnerOverview}
                  onChange={(e) => setWinnerOverview(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe why this team won, key architecture highlights, and breakthrough deliverables..."
                  className="w-full px-3.5 py-2.5 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5 text-slate-300" />
                    <span>Winner GitHub Link</span>
                  </label>
                  <input
                    type="url"
                    value={winnerRepoUrl}
                    onChange={(e) => setWinnerRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Winner Live Demo Link</span>
                  </label>
                  <input
                    type="url"
                    value={winnerDemoUrl}
                    onChange={(e) => setWinnerDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-pink-400" />
                    <span>Winner Video Link</span>
                  </label>
                  <input
                    type="url"
                    value={winnerVideoUrl}
                    onChange={(e) => setWinnerVideoUrl(e.target.value)}
                    placeholder="https://loom.com/... or YouTube"
                    className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  Faculty Commendation &amp; Mentor Remarks
                </label>
                <textarea
                  value={winnerRemarks}
                  onChange={(e) => setWinnerRemarks(e.target.value)}
                  rows={3}
                  placeholder="Official comments from the professor commendating the winning students..."
                  className="w-full px-3.5 py-2.5 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSavingWinner}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5"
                >
                  Save Winner Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          CONDITIONAL DISPLAY OF BOTTOM SEGMENTS:
          - If isResultsLive === true (and !isAuthor):
              SHOW ONLY 1 SEGMENT: "Result Winner"
          - If isResultsLive === false (or isAuthor):
              SHOW TWO SEGMENTS:
                1. "Submitted Problem Answers"
                2. "Student Teams Tackling This Challenge"
         ============================================================ */}

      {isResultsLive && (
        /* SEGMENT: RESULT WINNER */
        <div id="result-winner-segment" className="pt-8 border-t border-charcoal-800 mb-12">
          <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/30 via-charcoal-900 to-charcoal-900 p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Trophy className="w-56 h-56 text-amber-400" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Official Challenge Winner Declared</span>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                {problemResult?.award_title || '1st Place • Faculty Research Excellence Award'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {problemResult?.winner_team_name || 'Champion Student Team'}
              </h2>
              {problemResult?.winner_solution_title && (
                <p className="text-base font-semibold text-slate-200 mt-1">
                  Deliverable: <span className="text-white font-bold">{problemResult.winner_solution_title}</span>
                </p>
              )}
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {problemResult?.demo_url && (
                <a
                  href={problemResult.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Launch Live Demo</span>
                </a>
              )}
              {problemResult?.repo_url && (
                <a
                  href={problemResult.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-charcoal-800 hover:bg-charcoal-750 text-white border border-charcoal-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View Source Code</span>
                </a>
              )}
              {problemResult?.video_url && (
                <a
                  href={problemResult.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span>Watch Video Pitch</span>
                </a>
              )}
            </div>

            {/* Winning Overview */}
            {problemResult?.winner_overview && (
              <div className="p-5 rounded-2xl bg-charcoal-850/80 border border-charcoal-750 text-xs text-slate-100 whitespace-pre-wrap leading-relaxed">
                <p className="font-bold text-amber-300 mb-2 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                  <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Winning Solution Overview</span>
                </p>
                {problemResult.winner_overview}
              </div>
            )}

            {/* Faculty Commendation Remarks */}
            {problemResult?.mentor_remarks && (
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-100 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Supervising Faculty Commendation:</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap italic pl-2 border-l-2 border-indigo-500/40">
                  &ldquo;{problemResult.mentor_remarks}&rdquo;
                </p>
                <p className="text-[11px] text-indigo-300/80 pt-1">
                  — {problem.author?.display_name || 'Faculty Mentor'}, {problem.author?.college || (problem as any).college || 'Department'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* When results are NOT live OR when user is the faculty author:
          SHOW THE TWO REGULAR SEGMENTS:
          1. Submitted Problem Answers (Student Privacy: students only see their own answer; faculty sees all)
          2. Student Teams Tackling This Challenge
      */}
      {(!isResultsLive || isAuthor) && (
        <>
          {/* SEGMENT 1: Submitted Problem Answers */}
          <div id="solutions-section" className="pt-8 border-t border-slate-200 dark:border-charcoal-800 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Student Deliverables &amp; Answers</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {isAuthor ? (
                    <span>Submitted Problem Answers ({solutions.length})</span>
                  ) : visibleSolutions.length > 0 ? (
                    <span>Your Team&apos;s Submitted Answer</span>
                  ) : (
                    <span>Student Deliverable Submission</span>
                  )}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed font-medium">
                  {isAuthor
                    ? 'Faculty Review Mode: Inspect all student prototypes, code repositories, and solution write-ups.'
                    : visibleSolutions.length > 0
                    ? '🔒 Academic Integrity Mode: Your submission is private to your squad and the supervising faculty member. Other students cannot view your code or answer.'
                    : 'Academic Integrity Mode: Student deliverables are private between each squad and the professor. Apply your answer below to submit your deliverables.'}
                </p>
              </div>

              {!hasApplied && !isAuthor && (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  leftIcon={<Send className="w-3.5 h-3.5 text-white" />}
                  onClick={() => {
                    if (!user) openAuthModal();
                    else setIsSolutionModalOpen(true);
                  }}
                >
                  Apply the Answer
                </Button>
              )}
            </div>

            {isLoadingSolutions ? (
              <div className="py-12 text-center text-xs text-slate-300 font-mono">Loading deliverables...</div>
            ) : isAuthor ? (
              /* Faculty Author View: All Solutions (Crash-Proofed) */
              solutions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-charcoal-750 p-8 text-center bg-charcoal-900/30">
                  <FileCode2 className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white mb-1">
                    No problem answers submitted yet.
                  </p>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    When students apply their answers, their deliverables, repositories, and demo URLs will appear here for your evaluation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {solutions.map((sol) => (
                    <div
                      key={sol.id}
                      className="p-6 rounded-2xl border border-charcoal-750 bg-charcoal-900/70 hover:border-charcoal-600 transition-all space-y-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-white">{sol.title || 'Solution Deliverable'}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                              Deliverable Applied
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap font-medium">
                            <span>
                              Team: <strong className="text-white font-bold">{sol.team_name || 'Student Team'}</strong>
                            </span>
                            <span>•</span>
                            <span>Lead: {sol.author?.display_name || 'Student Lead'}</span>
                            <span>•</span>
                            <span>Submitted {sol.created_at ? new Date(sol.created_at).toLocaleDateString() : 'Recently'}</span>
                          </p>
                        </div>

                        {/* Links and Faculty Crown action */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {sol.repo_url && (
                            <a
                              href={sol.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-800 hover:bg-charcoal-750 text-slate-100 border border-charcoal-700 transition-colors"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>Source Code</span>
                            </a>
                          )}
                          {sol.demo_url && (
                            <a
                              href={sol.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {sol.video_url && (
                            <a
                              href={sol.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5 text-pink-400" />
                              <span>Video Demo</span>
                            </a>
                          )}
                          {isAuthor && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 font-bold"
                              leftIcon={<Crown className="w-3.5 h-3.5 text-amber-400" />}
                              onClick={() => handleSelectSolutionAsWinner(sol)}
                            >
                              Crown as Winner
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Solution Writeup */}
                      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap font-mono">
                        {sol.solution_writeup || 'No write-up provided.'}
                      </div>

                      {/* Mentor Feedback (if present) */}
                      {sol.mentor_feedback && (
                        <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200">
                          <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>Faculty Mentor Evaluation:</span>
                          </div>
                          <p className="whitespace-pre-wrap">{sol.mentor_feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Student View: ONLY their own team's solution */
              visibleSolutions.length > 0 ? (
                <div className="space-y-4">
                  {visibleSolutions.map((sol) => (
                    <div
                      key={sol.id}
                      className="p-6 rounded-2xl border border-emerald-500/40 bg-charcoal-900/80 shadow-md space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-base font-bold text-white">{sol.title || 'Solution Deliverable'}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                              ✓ Your Team&apos;s Answer Applied
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap font-medium">
                            <span>
                              Team: <strong className="text-white font-bold">{sol.team_name || 'Your Squad'}</strong>
                            </span>
                            <span>•</span>
                            <span>Submitted {sol.created_at ? new Date(sol.created_at).toLocaleDateString() : 'Recently'}</span>
                          </p>
                        </div>

                        {/* Action Links */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {sol.repo_url && (
                            <a
                              href={sol.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-charcoal-800 hover:bg-charcoal-750 text-slate-100 border border-charcoal-700 transition-colors"
                            >
                              <Github className="w-3.5 h-3.5" />
                              <span>Source Code</span>
                            </a>
                          )}
                          {sol.demo_url && (
                            <a
                              href={sol.demo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors"
                            >
                              <Globe className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Live Demo</span>
                            </a>
                          )}
                          {sol.video_url && (
                            <a
                              href={sol.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 transition-colors"
                            >
                              <Video className="w-3.5 h-3.5 text-pink-400" />
                              <span>Video Demo</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Solution Writeup */}
                      <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-100 leading-relaxed whitespace-pre-wrap font-mono">
                        {sol.solution_writeup || 'No write-up provided.'}
                      </div>

                      {/* Mentor Feedback (if present) */}
                      {sol.mentor_feedback && (
                        <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-200">
                          <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1">
                            <GraduationCap className="w-4 h-4" />
                            <span>Faculty Mentor Evaluation:</span>
                          </div>
                          <p className="whitespace-pre-wrap">{sol.mentor_feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Student has not applied yet: Privacy lock card */
                <div className="rounded-2xl border border-charcoal-750 p-8 text-center bg-charcoal-900/40 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-charcoal-800 border border-charcoal-750 flex items-center justify-center mx-auto text-slate-400">
                    <ShieldCheck className="w-6 h-6 text-brand-400" />
                  </div>
                  <h4 className="text-base font-bold text-white">Private Faculty Review Active</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Student answer deliverables are strictly private between each squad and the supervising professor. Apply your team&apos;s answer to post your prototype and source code.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                      onClick={() => {
                        if (!user) openAuthModal();
                        else setIsSolutionModalOpen(true);
                      }}
                    >
                      Apply the Answer
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* SEGMENT 2: Student Teams Tackling This Challenge */}
          <div id="student-teams-section" className="pt-8 border-t border-slate-200 dark:border-charcoal-800 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <span>Student Teams Tackling This Challenge</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
                  Active collegiate squads and student engineering teams building solutions for this challenge.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-charcoal-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-charcoal-700">
                  {tacklingProjects.length} {tacklingProjects.length === 1 ? 'Team Squad' : 'Team Squads'}
                </span>
                {!isAuthor && (
                  userExistingTeam ? (
                    <Link href={`/projects/${userExistingTeam.id}`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-brand-500/15 border-brand-500/30 text-brand-700 dark:text-brand-300 hover:bg-brand-500/25 font-bold text-xs"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />}
                        title="You have already formed 1 team for this challenge (1 team limit per student)"
                      >
                        Your Squad ({userExistingTeam.title})
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
                      leftIcon={<Users className="w-3.5 h-3.5" />}
                      onClick={() => {
                        if (!user) openAuthModal();
                        else setIsTeamModalOpen(true);
                      }}
                    >
                      Form a Student Team
                    </Button>
                  )
                )}
              </div>
            </div>

            {tacklingProjects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-charcoal-750 p-8 text-center bg-charcoal-900/30">
                <Users className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-white mb-1">
                  No registered student teams yet.
                </p>
                <p className="text-xs text-slate-300 mb-4 max-w-md mx-auto leading-relaxed">
                  Form your squad specifically for this faculty challenge. You can optionally post it to Explore Projects to recruit more teammates!
                </p>
                {!isAuthor && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-brand-500/30 text-brand-300 hover:bg-brand-500/10 font-bold"
                    leftIcon={<Users className="w-4 h-4" />}
                    onClick={() => {
                      if (!user) openAuthModal();
                      else setIsTeamModalOpen(true);
                    }}
                  >
                    Form a Student Team
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tacklingProjects.map((p) => {
                  const isMySquad = Boolean(user && user.id === p.owner_id);
                  const isRecruitingOnExplore = p.status === 'Recruiting';

                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-2xl border transition-all shadow-sm ${
                        isMySquad
                          ? 'border-brand-500/40 bg-brand-950/20'
                          : 'border-charcoal-750 bg-charcoal-900/60 hover:border-charcoal-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/projects/${p.id}`}
                            className="font-bold text-white hover:text-brand-300 transition-colors text-sm line-clamp-1"
                          >
                            {p.title}
                          </Link>
                          {isMySquad && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                              Your Squad
                            </span>
                          )}
                          {isRecruitingOnExplore && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              Explore Recruiting
                            </span>
                          )}
                        </div>
                        <Badge variant="status" status={p.status} />
                      </div>

                      <p className="text-xs text-slate-200 line-clamp-2 mb-4 leading-relaxed font-normal">
                        {p.summary}
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-charcoal-800">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={p.owner?.display_name || 'Owner'}
                            src={p.owner?.avatar_url}
                            size="sm"
                          />
                          <span className="text-white font-semibold truncate max-w-[120px]">
                            {p.owner?.display_name || 'Team Lead'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                            <Users className="w-3.5 h-3.5 text-brand-400" />
                            <span>
                              {p.current_team_size || 1}/{p.desired_team_size || 4} members
                            </span>
                          </div>
                          <Link
                            href={`/projects/${p.id}/workspace`}
                            className="text-xs font-bold text-brand-300 hover:text-white inline-flex items-center gap-1"
                          >
                            <span>Workspace</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Form a Student Team Modal (Inside the Problem) */}
      <ProblemTeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        problemId={problem.id}
        problemTitle={problem.title}
        problemCategory={problem.category}
        problemDifficulty={problem.difficulty}
        requiredSkills={problem.required_skills}
        expectedTeamSize={problem.team_size}
        onSuccess={(createdTeam) => {
          setTacklingProjects((prev) => [createdTeam, ...prev]);
          setActionSuccess(`Team "${createdTeam.title}" formed for this challenge!`);
        }}
      />

      {/* Apply the Answer Modal */}
      <ProblemSolutionModal
        isOpen={isSolutionModalOpen}
        onClose={() => setIsSolutionModalOpen(false)}
        problemId={problem.id}
        problemTitle={problem.title}
        myProjects={myProjects}
        onSuccess={() => {
          setHasApplied(true);
          loadSolutions();
          setActionSuccess('Deliverables submitted! Your team has applied the answer.');
        }}
      />
    </div>
  );
}
