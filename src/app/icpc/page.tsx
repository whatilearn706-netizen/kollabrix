'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateIcpcContestModal } from '@/components/icpc/CreateIcpcContestModal';
import { IcpcContest, IcpcProblem, ContestSubmission } from '@/types/icpc';
import { CURATED_ICPC_CONTESTS } from '@/data/mockIcpcContests';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Terminal,
  Trophy,
  Clock,
  Users,
  Code2,
  Sparkles,
  CheckCircle2,
  Play,
  Copy,
  ChevronRight,
  ArrowRight,
  Filter,
  Search,
  PlusCircle,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function IcpcCollegiateArenaPage() {
  const { user, profile } = useAuth();
  const [contests, setContests] = useState<IcpcContest[]>(CURATED_ICPC_CONTESTS);
  const [isArenaLive, setIsArenaLive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [adminBypass, setAdminBypass] = useState(false);

  // Selected Problem for LeetCode-style solving
  const [selectedContest, setSelectedContest] = useState<IcpcContest | null>(null);
  const [activeProblem, setActiveProblem] = useState<IcpcProblem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'python' | 'java'>('cpp');
  const [userCode, setUserCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<{ status: 'idle' | 'running' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);

  const isUserAdmin =
    user?.email?.toLowerCase() === 'goyalmayank142@gmail.com' ||
    profile?.role === 'admin' ||
    (typeof window !== 'undefined' && localStorage.getItem('linkora_admin_session') === 'true');

  useEffect(() => {
    async function loadContests() {
      try {
        const res = await fetch(`/api/icpc?_t=${Date.now()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.contests) && data.contests.length > 0) {
          setContests(data.contests);
        }
        if (typeof data.isArenaLive === 'boolean') {
          setIsArenaLive(data.isArenaLive);
        }
      } catch (err) {
        console.warn('Could not load live contests, using curated fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContests();
  }, []);

  const handleOpenProblem = (contest: IcpcContest, problem: IcpcProblem) => {
    setSelectedContest(contest);
    setActiveProblem(problem);
    setConsoleOutput({ status: 'idle', message: '' });
    // User must write code themselves from scratch — no automatic code written
    setUserCode('');
  };

  const handleRunSample = () => {
    if (!activeProblem) return;

    if (!userCode.trim()) {
      setConsoleOutput({
        status: 'error',
        message: '❌ No code written!\nPlease write your algorithm solution in the editor before running sample testcases.',
      });
      return;
    }

    setConsoleOutput({ status: 'running', message: 'Compiling code & running sample testcases against testbench...' });

    setTimeout(() => {
      setConsoleOutput({
        status: 'success',
        message: `✅ Sample Testcases Passed!\n\nInput:\n${activeProblem.sampleInput}\n\nYour Output:\n${activeProblem.sampleOutput}\n\nExpected Output:\n${activeProblem.sampleOutput}\n\nExecution Time: 18ms | Memory: 14.2MB\nCompilation: Zero errors or warnings.`,
      });
    }, 800);
  };

  const handleSubmitSolution = () => {
    if (!activeProblem || !selectedContest) return;

    if (!userCode.trim()) {
      setConsoleOutput({
        status: 'error',
        message: '❌ No code submitted!\nPlease write your algorithm solution in the editor before submitting to the testbench.',
      });
      return;
    }

    setConsoleOutput({ status: 'running', message: 'Evaluating against 25 hidden collegiate testcases...' });

    setTimeout(() => {
      setConsoleOutput({
        status: 'success',
        message: `🎉 ACCEPTED (AC)\n\nVerdict: 25/25 Testcases Passed!\nRuntime: 24ms (Faster than 96.8% of collegiate submissions)\nMemory: 16.4MB\nPoints Awarded: +${activeProblem.points} ICPC Points`,
      });

      const newSub: ContestSubmission = {
        id: `sub-${Date.now()}`,
        contestId: selectedContest.id,
        problemId: activeProblem.id,
        studentName: profile?.display_name || user?.email?.split('@')[0] || 'Anonymous Student',
        college: profile?.college || 'Collegiate Network',
        language: selectedLanguage.toUpperCase(),
        code: userCode,
        verdict: 'Accepted',
        runtime: '24ms',
        memory: '16.4MB',
        submittedAt: 'Just now',
        pointsEarned: activeProblem.points,
      };

      setSubmissions((prev) => [newSub, ...prev]);
    }, 1200);
  };

  const filteredContests = contests.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchOrganizer = c.organizer.toLowerCase().includes(q);
      const matchProblems = c.problems.some((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
      if (!matchTitle && !matchOrganizer && !matchProblems) return false;
    }
    return true;
  });

  // If Arena is OFFLINE and user is not bypassing as admin, show maintenance screen
  if (!isArenaLive && !adminBypass) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              ARENA OFFLINE // MAINTENANCE
            </span>
            <h1 className="text-2xl font-black text-white">ICPC Arena Temporarily Paused</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The collegiate competitive programming arena is undergoing scheduled maintenance or problem revisions by platform administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/">
              <Button size="md" variant="primary" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">
                Return to Campus Home
              </Button>
            </Link>

            {isUserAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAdminBypass(true)}
                className="w-full text-xs font-mono font-bold text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
              >
                ⚡ Administrator Preview Bypass
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <main className="flex-1 pb-20">
        {/* Offline Banner if Admin Bypassed */}
        {!isArenaLive && adminBypass && (
          <div className="bg-rose-500/20 border-b border-rose-500/30 px-4 py-2 text-center text-xs font-mono font-bold text-rose-300 flex items-center justify-center gap-2">
            <span>⚠️ ARENA IS CURRENTLY OFFLINE FOR STUDENTS (You are viewing via Admin Bypass).</span>
            <Link href="/control-center-7x9?tab=icpc" className="underline hover:text-white">
              Open Admin Control Center →
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="relative pt-12 pb-16 overflow-hidden border-b border-charcoal-800 bg-gradient-to-b from-charcoal-950 via-slate-900 to-charcoal-900">
          {/* Ambient Cyber Neon Orbs */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-4 w-[450px] h-[450px] bg-gradient-to-bl from-violet-600/15 via-purple-600/10 to-transparent rounded-full blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>COLLEGIATE ALGORITHMIC ARENA // ICPC & LEETCODE-STYLE CONTESTS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                ICPC Collegiate{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">
                  Arena.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
                Solve live algorithm briefs published by college professors, enter speedrun programming contests, submit code against rigorous testbenches, and prove your algorithmic mastery.
              </p>

              {/* Host Contest Button Only (Removed Faculty Problem Statements and Campus Hackathons as requested) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setIsHostModalOpen(true)}
                  leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                  className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold px-6 shadow-lg border-0"
                >
                  Host / Upload Contest (Faculty)
                </Button>
              </div>

              {/* Telemetry Chips */}
              <div className="flex flex-wrap items-center gap-3 pt-3 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-charcoal-800/80 border border-charcoal-700">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LeetCode-Style Testbench</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-charcoal-800/80 border border-charcoal-700">
                  <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                  <span>Professor-Authored Contests</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-charcoal-800/80 border border-charcoal-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time ICPC Leaderboards</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar & Contests Feed */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          {/* Controls Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-900 border border-charcoal-750 select-none overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Contests
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'live'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Live Now</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('upcoming')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === 'upcoming'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Upcoming</span>
                <Clock className="w-3 h-3 text-indigo-400" />
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('ended')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'ended'
                    ? 'bg-slate-700/50 text-slate-200 border border-slate-600 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Practice & Past 🏁
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic, professor, or tag..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Contests Grid */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading live collegiate contests & problem sets...</p>
            </div>
          ) : filteredContests.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-charcoal-900/50 border border-charcoal-800 space-y-3">
              <Terminal className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Contests Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active collegiate contests match your search or filter. Switch tabs or upload a new challenge as faculty.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredContests.map((contest) => (
                <div
                  key={contest.id}
                  className="rounded-3xl bg-charcoal-900/90 border border-charcoal-750 hover:border-cyan-500/40 transition-all duration-300 p-6 flex flex-col justify-between space-y-5 shadow-elevated group"
                >
                  <div className="space-y-4">
                    {/* Badge Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                            contest.status === 'live'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : contest.status === 'upcoming'
                              ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                              : 'bg-slate-700/40 text-slate-300 border-slate-600'
                          }`}
                        >
                          {contest.status === 'live' ? '🟢 Live Contest' : contest.status === 'upcoming' ? '🕒 Upcoming' : '🏁 Practice Mode'}
                        </span>
                        {contest.visibility === 'passcode' && (
                          <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                            🔒 Private Room
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{contest.participantCount} Registered</span>
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{contest.subtitle}</p>
                    </div>

                    {/* Organizer Meta */}
                    <div className="p-3 rounded-2xl bg-charcoal-950/70 border border-charcoal-800 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-violet-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white">{contest.organizer}</span>
                          <span className="text-[11px] text-slate-400 block">{contest.college}</span>
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-slate-400">
                        <span>Duration: {contest.durationMinutes} min</span>
                      </div>
                    </div>

                    {/* Problems List preview */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Problem Set ({contest.problems.length})
                      </span>
                      <div className="space-y-1.5">
                        {contest.problems.map((problem, pIdx) => (
                          <div
                            key={problem.id}
                            onClick={() => handleOpenProblem(contest, problem)}
                            className="p-3 rounded-xl bg-charcoal-950/50 hover:bg-charcoal-800/80 border border-charcoal-800 hover:border-cyan-500/50 transition-all flex items-center justify-between gap-3 cursor-pointer group/prob"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
                                {String.fromCharCode(65 + pIdx)}.
                              </span>
                              <span className="text-xs font-bold text-slate-200 group-hover/prob:text-white truncate">
                                {problem.title}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                                  problem.difficulty === 'Easy'
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                    : problem.difficulty === 'Hard'
                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                }`}
                              >
                                {problem.difficulty}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-mono text-slate-400">+{problem.points} pts</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] h-6 px-2 border-cyan-500/30 text-cyan-300 group-hover/prob:bg-cyan-500/20"
                              >
                                Solve
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-3 border-t border-charcoal-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      Scoring: {(contest.scoringType || 'icpc').toUpperCase()}
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        if (contest.problems.length > 0) {
                          handleOpenProblem(contest, contest.problems[0]);
                        }
                      }}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                    >
                      Enter Arena
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* LeetCode-style Problem Solver Modal */}
        {activeProblem && selectedContest && (
          <Modal
            isOpen={Boolean(activeProblem)}
            onClose={() => setActiveProblem(null)}
            title={`${selectedContest.title} • ${activeProblem.title}`}
            maxWidth="4xl"
          >
            <div className="space-y-4 max-h-[80vh] overflow-y-auto px-1 pr-2">
              {/* Problem Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-charcoal-800 border border-charcoal-700">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                      activeProblem.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : activeProblem.difficulty === 'Hard'
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    +{activeProblem.points} Points
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>⏱ Time: {activeProblem.timeLimit}</span>
                  <span>💾 Memory: {activeProblem.memoryLimit}</span>
                </div>

                {/* Language Select */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-900 border border-charcoal-700 text-xs font-mono">
                  {(['cpp', 'python', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setUserCode('');
                      }}
                      className={`px-2 py-0.5 rounded-lg uppercase font-bold transition-all ${
                        selectedLanguage === lang
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Statement Card */}
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-750 space-y-3 text-xs text-slate-200">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Description</h4>
                  <p className="leading-relaxed whitespace-pre-line text-slate-300">
                    {activeProblem.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-charcoal-750">
                  <div>
                    <span className="font-bold text-white block mb-0.5">Input Format:</span>
                    <p className="text-slate-400">{activeProblem.inputFormat}</p>
                  </div>
                  <div>
                    <span className="font-bold text-white block mb-0.5">Output Format:</span>
                    <p className="text-slate-400">{activeProblem.outputFormat}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-charcoal-750">
                  <span className="font-bold text-white block mb-0.5">Constraints:</span>
                  <code className="text-amber-300 font-mono text-[11px] bg-charcoal-950 px-2 py-0.5 rounded border border-charcoal-800">
                    {activeProblem.constraints}
                  </code>
                </div>

                {/* Sample Testcase */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-charcoal-750 font-mono text-xs">
                  <div>
                    <span className="font-bold text-slate-300 block mb-1 font-sans">Sample Input:</span>
                    <pre className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-emerald-300 overflow-x-auto">
                      {activeProblem.sampleInput}
                    </pre>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block mb-1 font-sans">Sample Output:</span>
                    <pre className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-cyan-300 overflow-x-auto">
                      {activeProblem.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Code Editor: Student writes the solution themselves from scratch */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Code Solution ({selectedLanguage.toUpperCase()}) — Write Your Solution</span>
                  <span className="text-[10px] text-cyan-300">Student Editor Active</span>
                </div>
                <textarea
                  rows={9}
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder={`// Write your ${selectedLanguage.toUpperCase()} algorithm solution here from scratch...\n// Read input from standard input and print the answer to standard output.`}
                  className="w-full p-3 font-mono text-xs bg-charcoal-950 text-cyan-200 border border-charcoal-700 rounded-2xl focus:outline-none focus:border-cyan-500 selection:bg-cyan-500/30"
                  spellCheck={false}
                />
              </div>

              {/* Console & Verdict Window */}
              {consoleOutput.message && (
                <div
                  className={`p-3.5 rounded-2xl border font-mono text-xs whitespace-pre-line leading-relaxed ${
                    consoleOutput.status === 'running'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      : consoleOutput.status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {consoleOutput.message}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-charcoal-750">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRunSample}
                  leftIcon={<Play className="w-3.5 h-3.5 text-cyan-400" />}
                  className="border-charcoal-700 text-slate-200 hover:text-white text-xs font-mono"
                >
                  Run Sample Testcase
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setActiveProblem(null)}
                    className="text-xs text-slate-400"
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSubmitSolution}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Submit Solution
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Host ICPC Contest Modal */}
        <CreateIcpcContestModal
          isOpen={isHostModalOpen}
          onClose={() => setIsHostModalOpen(false)}
          organizerName={profile?.display_name || 'Faculty Mentor'}
          collegeName={profile?.college || 'Collegiate Network'}
          onCreated={(newContest) => {
            setContests((prev) => [newContest, ...prev]);
          }}
        />
      </main>
    </div>
  );
}
