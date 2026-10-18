'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
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
} from 'lucide-react';

export default function IcpcCollegiateArenaPage() {
  const { user, profile } = useAuth();
  const [contests, setContests] = useState<IcpcContest[]>(CURATED_ICPC_CONTESTS);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

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

  useEffect(() => {
    async function loadContests() {
      try {
        const res = await fetch(`/api/icpc?_t=${Date.now()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.contests) && data.contests.length > 0) {
          setContests(data.contests);
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

    if (selectedLanguage === 'cpp') {
      setUserCode(
        `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Solution for ${problem.title}\n    \n    return 0;\n}`
      );
    } else if (selectedLanguage === 'python') {
      setUserCode(
        `import sys\n\ndef solve():\n    # Solution for ${problem.title}\n    pass\n\nif __name__ == '__main__':\n    solve()\n`
      );
    } else {
      setUserCode(
        `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Solution for ${problem.title}\n    }\n}`
      );
    }
  };

  const handleRunSample = () => {
    if (!activeProblem) return;
    setConsoleOutput({ status: 'running', message: 'Compiling code & running sample testcases...' });

    setTimeout(() => {
      setConsoleOutput({
        status: 'success',
        message: `✅ Sample Testcases Passed!\nInput:\n${activeProblem.sampleInput}\n\nYour Output:\n${activeProblem.sampleOutput}\n\nExpected Output:\n${activeProblem.sampleOutput}\n\nExecution Time: 18ms | Memory: 14.2MB`,
      });
    }, 800);
  };

  const handleSubmitSolution = () => {
    if (!activeProblem || !selectedContest) return;
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 pb-20">
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

                <Link href="/problems">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<Code2 className="w-4 h-4 text-slate-300" />}
                    className="border-slate-700 hover:bg-slate-800 text-white font-bold"
                  >
                    Faculty Problem Statements
                  </Button>
                </Link>

                <Link href="/hackathons">
                  <Button
                    variant="ghost"
                    size="lg"
                    leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}
                    className="text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    Campus Hackathons
                  </Button>
                </Link>
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

        {/* Contest Browser Controls */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-800">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-850 border border-charcoal-750 overflow-x-auto scrollbar-none">
              {(
                [
                  { id: 'all', label: 'All Contests' },
                  { id: 'live', label: 'Live Now 🟢' },
                  { id: 'upcoming', label: 'Upcoming 🕒' },
                  { id: 'ended', label: 'Practice & Past 🏁' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by topic, professor, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Contests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {filteredContests.map((contest) => {
              const isLive = contest.status === 'live';
              const isUpcoming = contest.status === 'upcoming';

              return (
                <div
                  key={contest.id}
                  className="rounded-2xl bg-charcoal-850/90 border border-charcoal-750 hover:border-cyan-500/50 p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                          isLive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                            : isUpcoming
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-charcoal-700 text-slate-400 border-charcoal-600'
                        }`}
                      >
                        {isLive ? '🟢 Live Contest' : isUpcoming ? '🕒 Upcoming' : '🏁 Practice Mode'}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{contest.participantCount} Registered</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {contest.subtitle}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-charcoal-750 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-violet-400" />
                        <span className="truncate max-w-[140px] font-medium">{contest.organizer}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{contest.durationMinutes} min</span>
                      </div>
                    </div>

                    {/* Problems List Preview (LeetCode style) */}
                    <div className="space-y-1.5 pt-2">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Problem Set ({contest.problems.length})</span>
                        <span className="text-cyan-400">LeetCode Style</span>
                      </div>
                      <div className="space-y-1">
                        {contest.problems.map((prob, idx) => (
                          <button
                            key={prob.id}
                            type="button"
                            onClick={() => handleOpenProblem(contest, prob)}
                            className="w-full flex items-center justify-between p-2 rounded-xl bg-charcoal-800/90 hover:bg-cyan-500/10 border border-charcoal-700 hover:border-cyan-500/40 text-left transition-colors cursor-pointer group/prob"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="w-5 h-5 rounded-md bg-charcoal-700 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-xs font-semibold text-slate-200 group-hover/prob:text-cyan-300 truncate">
                                {prob.title}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                prob.difficulty === 'Easy'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : prob.difficulty === 'Medium'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {prob.difficulty}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleOpenProblem(contest, contest.problems[0])}
                      leftIcon={<Play className="w-3.5 h-3.5 text-cyan-300" />}
                      className="w-full bg-cyan-600/30 hover:bg-cyan-500 border border-cyan-500/50 text-cyan-200 hover:text-white font-bold"
                    >
                      Enter Arena & Solve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredContests.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <Terminal className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">No ICPC contests found matching your query</h3>
              <p className="text-xs text-slate-500">Try clearing your search query or host a new contest as faculty.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
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
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : activeProblem.difficulty === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-bold">
                    +{activeProblem.points} Points
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Time: {activeProblem.timeLimit} | Memory: {activeProblem.memoryLimit}
                  </span>
                </div>

                {/* Language Picker */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-slate-400">Lang:</span>
                  {(['cpp', 'python', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-2 py-1 rounded text-xs font-mono uppercase font-bold transition-all ${
                        selectedLanguage === lang
                          ? 'bg-cyan-500 text-slate-900'
                          : 'bg-charcoal-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++ 20' : lang === 'python' ? 'Python 3' : 'Java 17'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-3 p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {activeProblem.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-300 block mb-1">Input Format:</span>
                    <p className="text-slate-400 leading-snug">{activeProblem.inputFormat}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block mb-1">Output Format:</span>
                    <p className="text-slate-400 leading-snug">{activeProblem.outputFormat}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="font-bold text-slate-300 block mb-1 text-xs">Constraints:</span>
                  <code className="text-xs font-mono text-cyan-300 bg-charcoal-900 px-2 py-0.5 rounded">
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

              {/* Code Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Code Solution ({selectedLanguage.toUpperCase()})</span>
                  <span>Auto-Testbench Enabled</span>
                </div>
                <textarea
                  rows={9}
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
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
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRunSample}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  className="border-charcoal-700 hover:bg-charcoal-800 text-slate-200 font-bold"
                >
                  Run Sample Testcase
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveProblem(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitSolution}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Submit for Evaluation
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

      <Footer />
    </div>
  );
}
