'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProblemStatement, ProjectCategory, ProjectDifficulty } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import {
  FileCode2,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Layers,
  CheckCircle2,
  Clock,
  BookOpen,
  Lock,
  Lightbulb,
  Building,
} from 'lucide-react';

import { DEMO_PROBLEMS } from '@/data/mockProblems';
import { isFacultyUser } from '@/lib/auth/faculty';

const CATEGORIES: (ProjectCategory | 'All')[] = [
  'All',
  'Web Development',
  'AI/ML',
  'Mobile Apps',
  'Developer Tools',
  'Social Impact',
  'IoT/Hardware',
  'Other',
];

const DIFFICULTIES: (ProjectDifficulty | 'All')[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ProblemStatementsPage() {
  const { user, profile, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const [problems, setProblems] = useState<ProblemStatement[]>(() => DEMO_PROBLEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ProjectDifficulty | 'All'>('All');
  const [selectedCollege, setSelectedCollege] = useState<string>('All Colleges');
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [userSolutions, setUserSolutions] = useState<any[]>([]);

  const isTeacher = isFacultyUser(user, profile);

  const loadProblems = useCallback(async () => {
    setIsLoading(true);
    if (!isSupabaseConfigured()) {
      setProblems(DEMO_PROBLEMS);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false });

      let list: ProblemStatement[] = [];
      if (!error && data && data.length > 0) {
        list = data as unknown as ProblemStatement[];
      }

      // Also merge community and faculty problem statements stored in platform_settings
      try {
        const { data: commRow } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'community_problem_statements')
          .maybeSingle();

        if (commRow?.value && Array.isArray(commRow.value)) {
          const commList = commRow.value as ProblemStatement[];
          const existingDbIds = new Set(list.map((p) => p.id));
          for (const commProb of commList) {
            if (commProb && commProb.id && !existingDbIds.has(commProb.id)) {
              list.unshift(commProb);
            }
          }
        }
      } catch {}

      const existingIds = new Set(list.map((p) => p.id));
      for (const demo of DEMO_PROBLEMS) {
        if (!existingIds.has(demo.id)) {
          list.push(demo);
        }
      }

      // Check deleted problems tombstone
      let deletedSet = new Set<string>();
      try {
        const { data: sRow } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'deleted_problems')
          .maybeSingle();

        if (sRow?.value) {
          const raw = sRow.value;
          const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
          const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
          deletedSet = new Set([...ids, ...titles].map((s: string) => s.trim().toLowerCase()));
        }
      } catch {}

      if (deletedSet.size > 0) {
        list = list.filter(
          (p) =>
            !deletedSet.has((p.id || '').toLowerCase()) &&
            !deletedSet.has((p.title || '').trim().toLowerCase())
        );
      }

      setProblems(list);
    } catch {
      setProblems(DEMO_PROBLEMS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  useEffect(() => {
    async function loadUserAppsAndSolutions() {
      if (!user?.id) {
        setUserApplications([]);
        setUserSolutions([]);
        return;
      }
      try {
        const [appRes, solRes] = await Promise.allSettled([
          fetch(`/api/problems/applications?applicant_id=${user.id}`).then((r) => r.json()),
          fetch(`/api/problems/solutions?author_id=${user.id}`).then((r) => r.json()),
        ]);

        if (appRes.status === 'fulfilled' && appRes.value?.success && Array.isArray(appRes.value.applications)) {
          setUserApplications(appRes.value.applications);
        }

        if (solRes.status === 'fulfilled' && solRes.value?.success && Array.isArray(solRes.value.solutions)) {
          setUserSolutions(solRes.value.solutions);
        }
      } catch (e) {
        console.warn('Could not fetch user applications or solutions:', e);
      }
    }
    loadUserAppsAndSolutions();
  }, [user?.id]);

  // Dynamically compute unique college names from active faculty problems
  const availableColleges = useMemo(() => {
    const colleges = new Set<string>();
    problems.forEach((p) => {
      const col = p.author?.college || (p as any).college;
      if (col && typeof col === 'string' && col.trim()) {
        colleges.add(col.trim());
      }
    });
    return ['All Colleges', ...Array.from(colleges).sort()];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      // Filter out drafts if not author
      if (p.status !== 'Published' && p.author_id !== user?.id) {
        return false;
      }

      const collegeName = (p.author?.college || (p as any).college || '').trim();

      const matchesSearch =
        !searchTerm.trim() ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.required_skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.author?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const matchesCollege =
        selectedCollege === 'All Colleges' ||
        collegeName.toLowerCase() === selectedCollege.trim().toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty && matchesCollege;
    });
  }, [problems, searchTerm, selectedCategory, selectedDifficulty, selectedCollege, user?.id]);

  // Loading skeleton while checking session
  if (isAuthLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
        <div className="h-64 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
      </div>
    );
  }

  // Not visible on first view for public visitors - Require login to view Faculty Problems
  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-6 text-amber-500 shadow-lg shadow-amber-500/5">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider mb-2 font-bold">
          <GraduationCap className="w-4 h-4" />
          <span>Members Exclusive</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
          Faculty Problem Statements
        </h1>
        <p className="text-sm text-slate-200 mb-8 leading-relaxed font-normal">
          Curated academic problem statements and research challenges proposed by college faculty mentors are available exclusively to registered Linkora students. Sign in to browse challenges and apply answers.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto shadow-md font-bold"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Sign In to View Problems
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-auto text-white border-charcoal-700 hover:bg-charcoal-800"
          >
            Create Student Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-charcoal-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider mb-2">
            {isTeacher ? (
              <>
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300 font-bold">Faculty Problem Statements</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-300 font-bold">Collegiate Challenges</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {isTeacher ? 'Faculty Problem Statements' : 'Collegiate Problems & Challenges'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
            {isTeacher
              ? 'Author, supervise, and evaluate collegiate problem statements and institutional research challenges.'
              : 'Real-world challenges and academic problem statements proposed by college faculty mentors. Select your college, build a solution, and apply your answer directly.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isTeacher && (
            <Link href="/problems/new">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="bg-brand-600 hover:bg-brand-500 font-bold"
              >
                Post Problem Statement
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar: 4 Columns (Search, Category, Difficulty, College) */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search challenges, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>

          {/* 2. Category */}
          <Select
            options={CATEGORIES.map((c) => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ProjectCategory | 'All')}
            className="bg-charcoal-850 border-charcoal-700 text-white text-xs"
          />

          {/* 3. Difficulty */}
          <Select
            options={DIFFICULTIES.map((d) => ({ value: d, label: d === 'All' ? 'All Difficulties' : d }))}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as ProjectDifficulty | 'All')}
            className="bg-charcoal-850 border-charcoal-700 text-white text-xs"
          />

          {/* 4. College Name (Auto-populated from faculty problems) */}
          <Select
            options={availableColleges.map((col) => ({ value: col, label: col }))}
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="bg-charcoal-850 border-charcoal-700 text-white text-xs font-medium"
          />
        </div>
      </div>

      {/* Scrollable Container with Blur-to-Focus Stack */}
      <div className="relative rounded-3xl border border-slate-200/90 dark:border-charcoal-800 bg-slate-50/50 dark:bg-charcoal-900/40 p-2 sm:p-4 shadow-xs overflow-hidden">
        {/* Blur Curtains for Upper & Lower Margins */}
        <div className="scroll-blur-curtain-top" />
        <div className="scroll-blur-curtain-bottom" />

        {/* Problems Viewport with Blur-to-Focus Mask */}
        <div className="tech-scroll-viewport blur-focus-scroll px-1 py-3">
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-mono">Loading problem statements...</p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-800 p-12 text-center space-y-4 my-6 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-charcoal-800 flex items-center justify-center mx-auto text-slate-300">
                <FileCode2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Problem Statements Found</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {searchTerm || selectedCategory !== 'All' || selectedDifficulty !== 'All' || selectedCollege !== 'All Colleges'
                  ? 'No challenges match your active filters. Try resetting the college or category filters.'
                  : 'Faculty mentors have not posted any problem statements yet. Check back soon for collegiate challenges.'}
              </p>
              {isTeacher && (
                <Link href="/problems/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Post the First Problem Statement
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProblems.map((problem, idx) => {
                const isAuthor = Boolean(user && user.id === problem.author_id);
                const authorName = problem.author?.display_name || 'Faculty Mentor';
                const collegeName = problem.author?.college || (problem as any).college || 'Collegiate Faculty';
                
                // Check if user has applied either via application or solution
                const hasApplied = Boolean(
                  user && (
                    userApplications.some(
                      (a) => (a.problem_statement_id || '').toLowerCase() === (problem.id || '').toLowerCase()
                    ) ||
                    userSolutions.some(
                      (s) => (s.problem_id || '').toLowerCase() === (problem.id || '').toLowerCase()
                    ) ||
                    (typeof window !== 'undefined' && (
                      localStorage.getItem(`tf_user_applied_${problem.id}_${user.id}`) === 'true' ||
                      localStorage.getItem(`linkora_problem_app_${problem.id}_${user.id}`) !== null ||
                      localStorage.getItem(`linkora_applied_solution_${problem.id}_${user.id}`) !== null
                    ))
                  )
                );

                return (
                  <div
                    key={problem.id}
                    className="blur-to-focus-card rounded-2xl bg-charcoal-900 border border-charcoal-750 hover:border-charcoal-600 p-6 flex flex-col justify-between gap-6 transition-all shadow-md group"
                    style={{ animationDelay: `${Math.min(idx * 40, 360)}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="category">{problem.category}</Badge>
                          <Badge variant="difficulty" difficulty={problem.difficulty} />
                        </div>
                        {problem.status !== 'Published' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {problem.status}
                          </span>
                        )}
                      </div>

                      <div>
                        <Link
                          href={`/problems/${problem.id}`}
                          className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug"
                        >
                          {problem.title}
                        </Link>
                        <p className="mt-2 text-xs text-slate-200 line-clamp-3 leading-relaxed font-normal">
                          {problem.description}
                        </p>
                      </div>

                      {/* Required Skills Tags */}
                      {problem.required_skills && problem.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {problem.required_skills.slice(0, 4).map((skill, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-slate-100 border border-charcoal-700 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {problem.required_skills.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{problem.required_skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-charcoal-800 space-y-4">
                      {/* Faculty Author & College Info */}
                      <div className="flex items-center justify-between text-xs text-slate-300 gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar
                            name={authorName}
                            src={problem.author?.avatar_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{authorName}</p>
                            <p className="text-[11px] text-brand-300 font-medium truncate flex items-center gap-1">
                              <Building className="w-3 h-3 text-brand-400 shrink-0" />
                              <span>{collegeName}</span>
                            </p>
                          </div>
                        </div>

                        {problem.deadline && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>Due {problem.deadline}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <Link href={`/problems/${problem.id}`}>
                          <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            View Details
                          </Button>
                        </Link>

                        {isAuthor ? (
                          <Link href={`/problems/${problem.id}/edit`}>
                            <Button variant="secondary" size="sm" className="bg-charcoal-800 hover:bg-charcoal-700 text-white border-charcoal-700 font-semibold">
                              Edit Problem
                            </Button>
                          </Link>
                        ) : hasApplied ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            className="bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold opacity-90 cursor-default"
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          >
                            Applied
                          </Button>
                        ) : (
                          <Link href={`/problems/${problem.id}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-brand-600 hover:bg-brand-500 text-white font-bold"
                              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                            >
                              Apply the Answer
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
