'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProblemStatement, Project, ProblemApplication } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProblemApplyModal } from '@/components/applications/ProblemApplyModal';
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
  XCircle,
  AlertCircle,
  ExternalLink,
  Send,
  UserCheck,
  UserX,
  ShieldCheck,
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
  const [applications, setApplications] = useState<ProblemApplication[]>([]);
  const [userApplication, setUserApplication] = useState<ProblemApplication | null>(null);

  const [isLoading, setIsLoading] = useState(() => !Boolean(demoMatch));
  const [error, setError] = useState<string | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

      // Load problem statement from DB
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
        // Check platform_settings for community problem statements
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

      // Load student projects that reference this problem statement
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
          owner:profiles!projects_owner_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('problem_statement_id', id)
        .order('created_at', { ascending: false });

      if (!projError && projData) {
        setTacklingProjects(projData as unknown as Project[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load problem statement.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load applications for this problem statement
  const loadApplications = useCallback(async () => {
    if (!id) return;
    let apps: ProblemApplication[] = [];

    try {
      const res = await fetch(`/api/problems/applications?problem_id=${id}`);
      const resData = await res.json();
      if (res.ok && resData.success && Array.isArray(resData.applications)) {
        apps = resData.applications;
      }
    } catch (e) {
      console.warn('Notice loading applications from API:', e);
    }

    // Merge with local storage apps backup
    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem(`tf_problem_apps_${id}`) || '[]');
      const existingIds = new Set(apps.map((a) => a.id));
      for (const item of local) {
        if (!existingIds.has(item.id)) {
          apps.push(item);
        }
      }
    }

    setApplications(apps);

    if (user) {
      const myApp = apps.find(
        (a) => a.applicant_id === user.id && (a.status === 'Pending' || a.status === 'Accepted')
      );
      setUserApplication(myApp || null);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
    loadApplications();
  }, [loadData, loadApplications]);

  const handleWithdrawApplication = async () => {
    if (!userApplication) return;
    setIsWithdrawing(true);
    setActionSuccess(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/problems/applications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ application_id: userApplication.id, status: 'Withdrawn' }),
      });

      // Update localStorage
      if (typeof window !== 'undefined') {
        const key = `tf_problem_apps_${id}`;
        const local = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = local.map((a: any) =>
          a.id === userApplication.id ? { ...a, status: 'Withdrawn' } : a
        );
        localStorage.setItem(key, JSON.stringify(updated));
      }

      setUserApplication(null);
      setApplications((prev) =>
        prev.map((a) => (a.id === userApplication.id ? { ...a, status: 'Withdrawn' } : a))
      );
      setActionSuccess('Your application has been withdrawn.');
    } catch {
      setError('Failed to withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleReviewApplicant = async (appId: string, newStatus: 'Accepted' | 'Rejected') => {
    setActionSuccess(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/problems/applications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ application_id: appId, status: newStatus }),
      });

      if (typeof window !== 'undefined') {
        const key = `tf_problem_apps_${id}`;
        const local = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = local.map((a: any) =>
          a.id === appId ? { ...a, status: newStatus } : a
        );
        localStorage.setItem(key, JSON.stringify(updated));
      }

      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setActionSuccess(`Applicant status updated to ${newStatus}.`);
    } catch {
      setError('Failed to update applicant status.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading problem statement...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Problem Statement Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
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

  const isAuthor = user?.id === problem.author_id;
  const isExpired = problem.deadline ? new Date(problem.deadline) < new Date() : false;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Statements</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header Container */}
      <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/60 p-6 sm:p-8 mb-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="category">{problem.category}</Badge>
            <Badge variant="difficulty" difficulty={problem.difficulty} />
            {problem.status === 'Draft' && (
              <Badge variant="default" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                Draft (Private)
              </Badge>
            )}
            {problem.status === 'Archived' && (
              <Badge variant="default" className="bg-slate-700/50 text-slate-400 border-slate-600">
                Archived
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isAuthor ? (
              <>
                <Link href={`/problems/${problem.id}/edit`}>
                  <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-4 h-4" />}>
                    Edit Problem
                  </Button>
                </Link>
                <a href="#applicants-section">
                  <Button variant="secondary" size="sm" leftIcon={<Users className="w-4 h-4" />}>
                    Applicants ({applications.length})
                  </Button>
                </a>
              </>
            ) : userApplication ? (
              <div className="flex items-center gap-2">
                <Badge
                  variant="status"
                  status={
                    userApplication.status === 'Accepted'
                      ? 'Completed'
                      : userApplication.status === 'Pending'
                      ? 'In Progress'
                      : 'Recruiting'
                  }
                  className="px-3 py-1.5 text-xs font-semibold"
                >
                  Application {userApplication.status}
                </Badge>
                {userApplication.status === 'Pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                    isLoading={isWithdrawing}
                    onClick={handleWithdrawApplication}
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setIsApplyModalOpen(true);
                  }
                }}
              >
                Apply to Join
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
          {problem.title}
        </h1>

        {/* Faculty Author & Metadata Bar */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-charcoal-800/80 text-sm text-slate-300">
          <div className="flex items-center gap-2.5">
            <Avatar
              name={problem.author?.display_name || 'Faculty Member'}
              src={problem.author?.avatar_url}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-1.5 font-medium text-white">
                <span>{problem.author?.display_name || 'Faculty Mentor'}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  Faculty Mentor
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {problem.author?.college || 'Academic Institution'}
                {problem.author?.course ? ` • ${problem.author.course}` : ''}
              </p>
            </div>
          </div>

          {problem.deadline && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-400">Application Deadline: </span>
                <span
                  className={
                    isExpired
                      ? 'text-red-400 font-medium'
                      : 'text-slate-200 font-medium'
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

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
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
          <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/40 p-6 sm:p-8">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-brand-400" />
              <span>Problem Specification &amp; Objectives</span>
            </h2>
            <div className="prose prose-invert prose-slate max-w-none text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
              {problem.description}
            </div>
          </div>
        </div>

        {/* Right: Technical Requirements & Apply Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/40 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {problem.required_skills?.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="bg-charcoal-800 text-slate-200 border-charcoal-700 hover:border-brand-500/40"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Students applying to join this challenge should have proficiency or enthusiasm in
              these core competencies.
            </p>
          </div>

          {/* Join Challenge CTA Box */}
          <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-950/30 to-charcoal-900/60 p-6">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Join this Research Challenge</span>
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Work directly with the supervising faculty mentor and student engineers. Submit your
              application to contribute your skills to this institutional initiative.
            </p>

            {isAuthor ? (
              <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700 text-xs text-center text-slate-300">
                <span>You are the author of this problem statement.</span>
              </div>
            ) : userApplication ? (
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Application Status:</span>
                  <Badge
                    variant="status"
                    status={
                      userApplication.status === 'Accepted'
                        ? 'Completed'
                        : userApplication.status === 'Pending'
                        ? 'In Progress'
                        : 'Recruiting'
                    }
                  >
                    {userApplication.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Proposed Role:</span>
                  <span className="font-semibold text-white">{userApplication.proposed_role}</span>
                </div>
                {userApplication.status === 'Pending' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-400 hover:text-red-300 text-xs mt-1"
                    isLoading={isWithdrawing}
                    onClick={handleWithdrawApplication}
                  >
                    Withdraw Application
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setIsApplyModalOpen(true);
                  }
                }}
              >
                Apply to Join
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Faculty Author Section: Student Applicants Management */}
      {isAuthor && (
        <div id="applicants-section" className="pt-8 border-t border-charcoal-800 mb-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Student Applicants for this Challenge</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Review, accept, or decline student applications submitted to this faculty problem statement.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-charcoal-800 p-8 text-center bg-charcoal-900/20">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300 mb-1">
                No student applications received yet.
              </p>
              <p className="text-xs text-slate-500">
                When students apply to join this problem statement, their submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-xl border border-charcoal-800 bg-charcoal-900/50 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={app.applicant?.display_name || 'Applicant'}
                        src={app.applicant?.avatar_url}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {app.applicant?.display_name || 'Student Candidate'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/20">
                            {app.proposed_role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {app.applicant?.college || 'Engineering Student'}
                          {app.applicant?.course ? ` • ${app.applicant.course}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="status"
                        status={
                          app.status === 'Accepted'
                            ? 'Completed'
                            : app.status === 'Pending'
                            ? 'In Progress'
                            : 'Recruiting'
                        }
                      >
                        {app.status}
                      </Badge>

                      {app.status === 'Pending' && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-xs px-3"
                            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                            onClick={() => handleReviewApplicant(app.id, 'Accepted')}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs px-3"
                            leftIcon={<UserX className="w-3.5 h-3.5" />}
                            onClick={() => handleReviewApplicant(app.id, 'Rejected')}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-charcoal-850/80 border border-charcoal-800 text-xs text-slate-300 leading-relaxed">
                    <p className="font-medium text-slate-400 mb-1 text-[11px]">Application Statement:</p>
                    <p className="whitespace-pre-wrap">{app.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Linked Student Projects Section */}
      <div className="pt-8 border-t border-charcoal-800">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <span>Student Teams Tackling This Challenge</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active student projects collaborating on this faculty challenge.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-charcoal-800 text-slate-300 border border-charcoal-700">
            {tacklingProjects.length} {tacklingProjects.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {tacklingProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-charcoal-800 p-8 text-center bg-charcoal-900/20">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-300 mb-1">
              No student teams tackling this challenge yet.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Apply to join this faculty challenge and collaborate with the supervising professor.
            </p>
            {!isAuthor && !userApplication && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={() => {
                  if (!user) {
                    openAuthModal();
                  } else {
                    setIsApplyModalOpen(true);
                  }
                }}
              >
                Apply to Join
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tacklingProjects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="group block p-5 rounded-xl border border-charcoal-800 hover:border-brand-500/40 bg-charcoal-900/50 hover:bg-charcoal-850/70 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <Badge variant="status" status={p.status} />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{p.summary}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-charcoal-800/80">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={p.owner?.display_name || 'Owner'}
                      src={p.owner?.avatar_url}
                      size="sm"
                    />
                    <span className="text-slate-300 truncate max-w-[120px]">
                      {p.owner?.display_name || 'Team Lead'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {p.current_team_size}/{p.desired_team_size} members
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Apply to Join Modal */}
      <ProblemApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        problemId={problem.id}
        problemTitle={problem.title}
        facultyAuthorId={problem.author_id}
        requiredSkills={problem.required_skills}
        onSuccess={() => {
          loadApplications();
        }}
      />
    </div>
  );
}
