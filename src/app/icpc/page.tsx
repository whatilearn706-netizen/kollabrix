'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateIcpcContestModal } from '@/components/icpc/CreateIcpcContestModal';
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
  AlertTriangle,
  ExternalLink,
  Lock,
  Flame,
  Zap,
  Target,
  BookOpen,
  Check,
  Award,
  ShieldAlert,
  ChevronLeft,
  Maximize2,
  Monitor,
  Camera,
} from 'lucide-react';
import { IcpcContest, IcpcProblem, ContestSubmission, StudentIcpcProgress } from '@/types/icpc';
import { IcpcProctorGuard, checkSuspiciousPaste } from '@/components/icpc/IcpcProctorGuard';
import { AntiPhotoWatermarkGuard } from '@/components/icpc/AntiPhotoWatermarkGuard';

function getDefaultStarter(lang: 'cpp' | 'python' | 'java'): string {
  if (lang === 'cpp') {
    return `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    \n    return 0;\n}`;
  }
  if (lang === 'java') {
    return `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n        \n    }\n}`;
  }
  return `import sys\n\n# Write your solution here\n`;
}

function getCleanStarter(problem: IcpcProblem | null, lang: 'cpp' | 'python' | 'java'): string {
  const code = problem?.starterCode?.[lang];
  if (code && !code.includes('TODO:') && !code.includes('cin >> a[i]') && !code.includes('cin >> n >> m') && !code.includes('coins')) {
    return code;
  }
  return getDefaultStarter(lang);
}

const WEEKLY_LEADERBOARD = [
  { rank: 1, name: 'mayankgoyal335', points: 640, streak: 12, accuracy: 98, college: 'Apex Institute of Tech', avatar: '👑' },
  { rank: 2, name: 'arjun_sharma', points: 510, streak: 9, accuracy: 94, college: 'SRM University', avatar: '🥈' },
  { rank: 3, name: 'priya_patel', points: 460, streak: 7, accuracy: 91, college: 'VIT Vellore', avatar: '🥉' },
  { rank: 4, name: 'rohit_kumar', points: 390, streak: 5, accuracy: 89, college: 'DTU Delhi', avatar: '⚡' },
  { rank: 5, name: 'sneha_rao', points: 340, streak: 4, accuracy: 86, college: 'BMS College of Engg', avatar: '🎯' },
];

const OVERALL_LEADERBOARD = [
  { rank: 1, name: 'mayankgoyal335', points: 2840, streak: 12, accuracy: 98, college: 'Apex Institute of Tech', avatar: '👑' },
  { rank: 2, name: 'vikas_coder', points: 2410, streak: 18, accuracy: 96, college: 'IIT Roorkee Network', avatar: '🥈' },
  { rank: 3, name: 'arjun_sharma', points: 2120, streak: 9, accuracy: 94, college: 'SRM University', avatar: '🥉' },
  { rank: 4, name: 'dev_ansh', points: 1890, streak: 14, accuracy: 92, college: 'BITS Pilani', avatar: '⚡' },
  { rank: 5, name: 'priya_patel', points: 1650, streak: 7, accuracy: 91, college: 'VIT Vellore', avatar: '🎯' },
];

export default function IcpcCollegiateArenaPage() {
  const { user, profile } = useAuth();
  const [contests, setContests] = useState<IcpcContest[]>([]);
  const [isArenaLive, setIsArenaLive] = useState<boolean>(true);
  const [isLeaderboardLive, setIsLeaderboardLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<'placement' | 'faculty' | 'icpc'>('placement');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'all-time'>('weekly');
  const [passcodeModalContest, setPasscodeModalContest] = useState<IcpcContest | null>(null);
  const [upcomingLockedContest, setUpcomingLockedContest] = useState<IcpcContest | null>(null);
  const [questionPreview, setQuestionPreview] = useState<{
    contest: IcpcContest;
    problem: IcpcProblem;
  } | null>(null);

  function formatContestSchedule(iso?: string) {
    if (!iso) return 'Scheduled Soon';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Scheduled Soon';
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return 'Scheduled Soon';
    }
  }

  function getTimeUntilContest(iso?: string) {
    if (!iso) return '';
    try {
      const diffMs = new Date(iso).getTime() - Date.now();
      if (diffMs <= 0) return 'Starting now';
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const mins = totalMinutes % 60;
      if (days > 0) return `Starts in ${days}d ${hours}h`;
      if (hours > 0) return `Starts in ${hours}h ${mins}m`;
      return `Starts in ${mins}m`;
    } catch (e) {
      return '';
    }
  }
  const [pendingProblem, setPendingProblem] = useState<IcpcProblem | null>(null);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [unlockedContests, setUnlockedContests] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isFacultyNoticeOpen, setIsFacultyNoticeOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Student ICPC Streak and Points progress
  const [progress, setProgress] = useState<StudentIcpcProgress>({
    streak: 1,
    lastSolvedDate: undefined,
    totalPoints: 350,
    solvedProblemIds: [],
  });

  // Selected Problem for LeetCode-style solving
  const [selectedContest, setSelectedContest] = useState<IcpcContest | null>(null);
  const [activeProblem, setActiveProblem] = useState<IcpcProblem | null>(null);
  const [solverTab, setSolverTab] = useState<'editor' | 'solution'>('editor');
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'python' | 'java'>('cpp');
  const [userCode, setUserCode] = useState('');
  const [codeDrafts, setCodeDrafts] = useState<Record<string, string>>({});
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [copiedContestId, setCopiedContestId] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<{ status: 'idle' | 'running' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [nextQuestionPrompt, setNextQuestionPrompt] = useState<{
    show: boolean;
    currentTitle: string;
    nextLetter: string;
    nextProblem: IcpcProblem;
    secondsLeft: number;
  } | null>(null);
  const [contestCompletionModal, setContestCompletionModal] = useState<{
    isOpen: boolean;
    contestTitle: string;
    totalSolved: number;
    totalPoints: number;
  } | null>(null);
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);

  const userRole = (profile?.role as string) || '';
  const isFacultyUser =
    userRole === 'teacher' ||
    userRole === 'faculty' ||
    userRole === 'professor' ||
    userRole === 'coordinator';

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('linkora_icpc_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.streak === 'number') {
          setProgress(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // Countdown timer to automatically advance to the next problem upon correct answer
  useEffect(() => {
    if (!nextQuestionPrompt || nextQuestionPrompt.secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      if (nextQuestionPrompt.secondsLeft === 1) {
        const target = nextQuestionPrompt.nextProblem;
        setNextQuestionPrompt(null);
        switchProblem(target);
      } else {
        setNextQuestionPrompt((prev) =>
          prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [nextQuestionPrompt]);

  // ICPC Exam Immersion Mode: hide global nav, banners, quick dock, lock page scroll
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (activeProblem) {
      document.documentElement.classList.add('icpc-exam-mode');
      document.body.classList.add('icpc-exam-mode');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('linkora_exam_mode', { detail: { active: true } }));

      return () => {
        document.documentElement.classList.remove('icpc-exam-mode');
        document.body.classList.remove('icpc-exam-mode');
        document.body.style.overflow = originalOverflow;
        window.dispatchEvent(new CustomEvent('linkora_exam_mode', { detail: { active: false } }));
      };
    } else {
      document.documentElement.classList.remove('icpc-exam-mode');
      document.body.classList.remove('icpc-exam-mode');
      window.dispatchEvent(new CustomEvent('linkora_exam_mode', { detail: { active: false } }));
    }
  }, [activeProblem]);

  useEffect(() => {
    async function loadContests() {
      try {
        const res = await fetch(`/api/icpc?_t=${Date.now()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.contests)) {
          setContests(data.contests);
        }
        if (typeof data.isArenaLive === 'boolean') {
          setIsArenaLive(data.isArenaLive);
        }
        if (typeof data.isLeaderboardLive === 'boolean') {
          setIsLeaderboardLive(data.isLeaderboardLive);
        }
      } catch (err) {
        console.warn('Could not load live contests:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContests();
  }, []);

  const handleHostContestClick = () => {
    if (isFacultyUser) {
      setIsHostModalOpen(true);
    } else {
      setIsFacultyNoticeOpen(true);
    }
  };

  const handleCopyRoomLink = (contest: IcpcContest) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kollabrix.in';
    const code = contest.passcode || '';
    const url = `${origin}/icpc?passcode=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedContestId(contest.id);
    setTimeout(() => setCopiedContestId(null), 2200);
  };

  const handleCopySolutionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const switchProblem = (newProblem: IcpcProblem) => {
    if (activeProblem) {
      const currentKey = `${activeProblem.id}_${selectedLanguage}`;
      setCodeDrafts((prev) => ({ ...prev, [currentKey]: userCode }));
    }

    const allowed = (newProblem.allowedLanguages && newProblem.allowedLanguages.length > 0)
      ? newProblem.allowedLanguages
      : (['cpp', 'python', 'java'] as ('cpp' | 'python' | 'java')[]);
    const nextLang = allowed.includes(selectedLanguage) ? selectedLanguage : allowed[0];
    if (nextLang !== selectedLanguage) {
      setSelectedLanguage(nextLang);
    }

    setActiveProblem(newProblem);
    setSolverTab('editor');
    setConsoleOutput({ status: 'idle', message: '' });
    setNextQuestionPrompt(null);

    const targetKey = `${newProblem.id}_${nextLang}`;
    const existingDraft = codeDrafts[targetKey];
    if (existingDraft !== undefined) {
      setUserCode(existingDraft);
    } else {
      const starter = getCleanStarter(newProblem, nextLang);
      setUserCode(starter);
    }
  };

  const handleSelectLanguage = (lang: 'cpp' | 'python' | 'java') => {
    if (!activeProblem) return;
    const currentKey = `${activeProblem.id}_${selectedLanguage}`;
    setCodeDrafts((prev) => ({ ...prev, [currentKey]: userCode }));

    setSelectedLanguage(lang);
    const targetKey = `${activeProblem.id}_${lang}`;
    const existingDraft = codeDrafts[targetKey];
    if (existingDraft !== undefined) {
      setUserCode(existingDraft);
    } else {
      const starter = getCleanStarter(activeProblem, lang);
      setUserCode(starter);
    }
  };

  const handleInitiateArena = (contest: IcpcContest, problem?: IcpcProblem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const isUpcoming =
      contest.status === 'upcoming' ||
      (contest.contestType !== 'practice' &&
        contest.startTime &&
        new Date() < new Date(contest.startTime));
    if (isUpcoming) {
      const uRole = (profile?.role || '').toLowerCase();
      const isCreatorOrAdmin =
        uRole === 'admin' ||
        (user?.id && (contest.creatorId === user.id || contest.authorId === user.id));
      if (!isCreatorOrAdmin) {
        setUpcomingLockedContest(contest);
        return;
      }
    }
    if (contest.visibility === 'passcode' && !unlockedContests[contest.id]) {
      setPasscodeModalContest(contest);
      setPendingProblem(problem || contest.problems[0] || null);
      setEnteredPasscode('');
      setPasscodeError('');
      return;
    }

    const targetProblem =
      problem ||
      contest.problems.find((p) => !progress.solvedProblemIds.includes(p.id)) ||
      contest.problems[0];

    if (!targetProblem) return;
    setQuestionPreview({ contest, problem: targetProblem });
  };

  const handleOpenProblem = (contest: IcpcContest, problem: IcpcProblem) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const isUpcoming = contest.status === 'upcoming' || (contest.contestType !== 'practice' && contest.startTime && new Date() < new Date(contest.startTime));
    if (isUpcoming) {
      const uRole = (profile?.role || '').toLowerCase();
      const isCreatorOrAdmin = uRole === 'admin' || (user?.id && (contest.creatorId === user.id || contest.authorId === user.id));
      if (!isCreatorOrAdmin) {
        setUpcomingLockedContest(contest);
        return;
      }
    }
    if (contest.visibility === 'passcode' && !unlockedContests[contest.id]) {
      setPasscodeModalContest(contest);
      setPendingProblem(problem);
      setEnteredPasscode('');
      setPasscodeError('');
      return;
    }
    try {
      if (typeof document !== 'undefined' && !document.fullscreenElement) {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
    } catch (e) {}
    setSelectedContest(contest);
    setActiveProblem(problem);
    setSolverTab('editor');
    setConsoleOutput({ status: 'idle', message: '' });
    setNextQuestionPrompt(null);

    const allowed = (problem.allowedLanguages && problem.allowedLanguages.length > 0)
      ? problem.allowedLanguages
      : (['cpp', 'python', 'java'] as ('cpp' | 'python' | 'java')[]);
    const nextLang = allowed.includes(selectedLanguage) ? selectedLanguage : allowed[0];
    if (nextLang !== selectedLanguage) {
      setSelectedLanguage(nextLang);
    }

    const targetKey = `${problem.id}_${nextLang}`;
    const existingDraft = codeDrafts[targetKey];
    if (existingDraft !== undefined) {
      setUserCode(existingDraft);
    } else {
      const starter = getCleanStarter(problem, nextLang);
      setUserCode(starter);
    }
  };

  const handleUnlockPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcodeModalContest) return;

    const expected = passcodeModalContest.passcode?.trim().toUpperCase();
    const actual = enteredPasscode.trim().toUpperCase();

    if (expected && actual !== expected) {
      setPasscodeError(`Invalid room passcode. Check with your professor (Demo code: ${passcodeModalContest.passcode || 'LAB2026'}).`);
      return;
    }

    const studentCollege = ((profile as any)?.college || (user as any)?.user_metadata?.college || '').trim().toLowerCase();
    const contestCollege = (passcodeModalContest.college || '').trim().toLowerCase();
    const uRole = (profile?.role || '').toLowerCase();
    const isAdminOrFaculty = uRole === 'admin' || uRole === 'teacher' || uRole === 'faculty' || uRole === 'professor' || isFacultyUser;

    if (!isAdminOrFaculty && contestCollege && contestCollege !== 'partner collegiate network' && contestCollege !== 'all campuses') {
      if (studentCollege && !studentCollege.includes(contestCollege) && !contestCollege.includes(studentCollege)) {
        setPasscodeError(`🔒 College Restriction: This lab is exclusively restricted to students of "${passcodeModalContest.college}". Your profile is registered under "${(profile as any)?.college}".`);
        return;
      }
    }

    const contestToOpen = passcodeModalContest;
    const problemToOpen = pendingProblem || contestToOpen.problems[0];

    setUnlockedContests((prev) => ({ ...prev, [contestToOpen.id]: true }));
    setPasscodeModalContest(null);
    setPendingProblem(null);
    setEnteredPasscode('');
    setPasscodeError('');

    if (problemToOpen) {
      setQuestionPreview({ contest: contestToOpen, problem: problemToOpen });
    }
  };

  const handleRunSample = async () => {
    if (!activeProblem) return;

    if (!userCode.trim()) {
      setConsoleOutput({
        status: 'error',
        message: '❌ No code written!\nPlease write your algorithm solution in the editor before running sample testcases.',
      });
      return;
    }

    setConsoleOutput({ status: 'running', message: `Compiling ${selectedLanguage.toUpperCase()} and executing against sample testcase...` });

    try {
      const res = await fetch('/api/icpc/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: userCode,
          language: selectedLanguage,
          stdin: activeProblem.sampleInput || '',
          expectedOutput: activeProblem.sampleOutput || '',
          cpuTimeLimit: activeProblem.timeLimit ? parseFloat(activeProblem.timeLimit) || 2 : 2,
          memoryLimitMb: activeProblem.memoryLimit ? parseInt(activeProblem.memoryLimit) || 256 : 256,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setConsoleOutput({
          status: 'error',
          message: `❌ Execution Failed\n\n${result.error || 'Server error occurred while executing code.'}`,
        });
        return;
      }

      if (result.status === 'Accepted' && result.passed === true) {
        setConsoleOutput({
          status: 'success',
          message: `✅ Sample Testcase Passed!\n\nStandard Input:\n${activeProblem.sampleInput}\n\nYour Output:\n${result.stdout || '(no output)'}\n\nExpected Output:\n${activeProblem.sampleOutput}\n\nCompiler / VM: ${result.compilerOutput ? '\n' + result.compilerOutput + '\n' : 'Zero warnings.'}\nExecution Time: ${result.time} | Memory: ${result.memory}`,
        });
      } else {
        let details = '';
        if (result.status === 'Compilation Error' && (result.compile_output || result.compileOutput || result.stderr)) {
          details = `Compilation Diagnostics:\n${result.compile_output || result.compileOutput || result.stderr}`;
        } else if (result.status === 'Runtime Error' && (result.stderr || result.message)) {
          details = `Runtime Error / Exception:\n${result.stderr || result.message}`;
        } else {
          details = `Standard Input:\n${activeProblem.sampleInput}\n\nYour Output:\n${result.stdout || '(no output)'}\n\nExpected Output:\n${activeProblem.sampleOutput}`;
        }

        setConsoleOutput({
          status: 'error',
          message: `❌ Verdict: ${result.status || 'Wrong Answer'} (${result.statusDescription || 'Outputs did not match'})\n\n${details}\n\nExecution Time: ${result.time || 'N/A'} | Memory: ${result.memory || 'N/A'}`,
        });
      }
    } catch (err: any) {
      setConsoleOutput({
        status: 'error',
        message: `❌ Network Error: Could not connect to judge execution server.\n${err.message || ''}`,
      });
    }
  };

  const handleSubmitSolution = async () => {
    if (!activeProblem || !selectedContest) return;

    if (!userCode.trim()) {
      setConsoleOutput({
        status: 'error',
        message: '❌ No code submitted!\nPlease write your algorithm solution in the editor before submitting to the testbench.',
      });
      return;
    }

    const testCases = (activeProblem.testCases && activeProblem.testCases.length > 0)
      ? activeProblem.testCases
      : [{ input: activeProblem.sampleInput, output: activeProblem.sampleOutput, isHidden: false }];

    setConsoleOutput({ status: 'running', message: `Compiling ${selectedLanguage.toUpperCase()} & evaluating against ${testCases.length} collegiate testcases...` });

    try {
      let passedCount = 0;
      let maxTime = '0.00s';
      let maxMemory = '0 KB';
      let failedResult: any = null;
      let failedCaseIndex = -1;

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const res = await fetch('/api/icpc/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCode: userCode,
            language: selectedLanguage,
            stdin: tc.input,
            expectedOutput: tc.output,
            cpuTimeLimit: activeProblem.timeLimit ? parseFloat(activeProblem.timeLimit) || 2 : 2,
            memoryLimitMb: activeProblem.memoryLimit ? parseInt(activeProblem.memoryLimit) || 256 : 256,
          }),
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          failedResult = { status: 'Judge Error', statusDescription: result.error || 'Server error' };
          failedCaseIndex = i + 1;
          break;
        }

        if (result.time && result.time > maxTime) maxTime = result.time;
        if (result.memory && result.memory > maxMemory) maxMemory = result.memory;

        if (result.status === 'Accepted' && result.passed === true) {
          passedCount++;
        } else {
          failedResult = result;
          failedCaseIndex = i + 1;
          break;
        }
      }

      if (passedCount === testCases.length) {
        // Automatic Points and Streak Credit
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const isAlreadySolved = progress.solvedProblemIds.includes(activeProblem.id);

        let newStreak = progress.streak;
        if (progress.lastSolvedDate === yesterday) {
          newStreak = progress.streak + 1;
        } else if (progress.lastSolvedDate === today) {
          newStreak = progress.streak;
        } else {
          newStreak = 1;
        }

        const pointsToAdd = isAlreadySolved ? 0 : activeProblem.points;
        const newTotalPoints = progress.totalPoints + pointsToAdd;
        const updatedSolved = isAlreadySolved
          ? progress.solvedProblemIds
          : [...progress.solvedProblemIds, activeProblem.id];

        const updatedProgress: StudentIcpcProgress = {
          streak: newStreak,
          lastSolvedDate: today,
          totalPoints: newTotalPoints,
          solvedProblemIds: updatedSolved,
        };

        setProgress(updatedProgress);
        try {
          localStorage.setItem('linkora_icpc_progress', JSON.stringify(updatedProgress));
        } catch (e) {}

        setConsoleOutput({
          status: 'success',
          message: `🎉 ACCEPTED (AC)\n\nVerdict: All ${testCases.length}/${testCases.length} Testcases Passed!\nLanguage: ${selectedLanguage.toUpperCase()} (Genuine Compiler Execution)\nPeak Runtime: ${maxTime}\nPeak Memory: ${maxMemory}\n\n⚡ Points Credited: +${pointsToAdd} ICPC Points (Total: ${newTotalPoints} pts)\n🔥 Daily Streak: ${newStreak} Day${newStreak > 1 ? 's' : ''} Active!\n${isAlreadySolved ? 'ℹ️ Problem previously solved — streak maintained.' : '🌟 First-time solve bonus credited to your collegiate rank!'}`,
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
          runtime: maxTime,
          memory: maxMemory,
          submittedAt: 'Just now',
          pointsEarned: pointsToAdd,
        };

        setSubmissions((prev) => [newSub, ...prev]);

        // Auto-advance logic: If all questions in contest are answered, celebrate completion!
        // Otherwise, advance to the next question in the contest (e.g. A -> B).
        const contestProblems = selectedContest.problems;
        const currentProblemIndex = contestProblems.findIndex((p) => p.id === activeProblem.id);
        const hasNextProblem = currentProblemIndex >= 0 && currentProblemIndex + 1 < contestProblems.length;
        const nextProblem = hasNextProblem ? contestProblems[currentProblemIndex + 1] : null;
        const allContestProblemsSolved = contestProblems.every((p) => updatedSolved.includes(p.id));

        if (allContestProblemsSolved) {
          setNextQuestionPrompt(null);
          setContestCompletionModal({
            isOpen: true,
            contestTitle: selectedContest.title,
            totalSolved: contestProblems.length,
            totalPoints: newTotalPoints,
          });
        } else if (nextProblem) {
          const nextLetter = String.fromCharCode(65 + currentProblemIndex + 1);
          setNextQuestionPrompt({
            show: true,
            currentTitle: activeProblem.title,
            nextLetter,
            nextProblem,
            secondsLeft: 3,
          });
        }
      } else {
        setNextQuestionPrompt(null);
        const tc = testCases[failedCaseIndex - 1];
        let details = '';
        if (failedResult.status === 'Compilation Error' && (failedResult.compile_output || failedResult.compileOutput || failedResult.stderr)) {
          details = `Compilation Diagnostics:\n${failedResult.compile_output || failedResult.compileOutput || failedResult.stderr}`;
        } else if (failedResult.status === 'Runtime Error' && (failedResult.stderr || failedResult.message)) {
          details = `Runtime Error on Testcase #${failedCaseIndex}:\n${failedResult.stderr || failedResult.message}`;
        } else {
          if (tc.isHidden) {
            details = `Failed on Hidden Testcase #${failedCaseIndex}.\n(Hidden testcase details are veiled to preserve competitive integrity)`;
          } else {
            details = `Failed on Testcase #${failedCaseIndex}:\nInput:\n${tc.input}\n\nYour Output:\n${failedResult.stdout || '(no output)'}\n\nExpected Output:\n${tc.output}`;
          }
        }

        setConsoleOutput({
          status: 'error',
          message: `❌ Verdict: ${failedResult.status || 'Wrong Answer'} on Testcase ${failedCaseIndex}/${testCases.length}\n${failedResult.statusDescription ? '(' + failedResult.statusDescription + ')\n' : ''}\n${details}\n\nTime: ${failedResult.time || 'N/A'} | Memory: ${failedResult.memory || 'N/A'}`,
        });

        const newSub: ContestSubmission = {
          id: `sub-${Date.now()}`,
          contestId: selectedContest.id,
          problemId: activeProblem.id,
          studentName: profile?.display_name || user?.email?.split('@')[0] || 'Anonymous Student',
          college: profile?.college || 'Collegiate Network',
          language: selectedLanguage.toUpperCase(),
          code: userCode,
          verdict: failedResult.status === 'Compilation Error' ? 'Compilation Error' : (failedResult.status === 'Time Limit Exceeded' ? 'Time Limit Exceeded' : (failedResult.status === 'Runtime Error' ? 'Runtime Error' : 'Wrong Answer')),
          runtime: failedResult.time || 'N/A',
          memory: failedResult.memory || 'N/A',
          submittedAt: 'Just now',
          pointsEarned: 0,
        };

        setSubmissions((prev) => [newSub, ...prev]);
      }
    } catch (err: any) {
      setConsoleOutput({
        status: 'error',
        message: `❌ Testbench Evaluation Error: Could not connect to judge execution server.\n${err.message || ''}`,
      });
    }
  };

  const filteredContests = contests.filter((c) => {
    // 🎓 College Isolation Gate for Faculty Private Labs
    const isFacultyLab = c.category === 'faculty' || c.visibility === 'passcode';
    if (isFacultyLab && c.college && c.college !== 'Partner Collegiate Network' && c.college !== 'All Campuses') {
      const uRole = (profile?.role || '').toLowerCase();
      const isAdminOrFaculty = uRole === 'admin' || uRole === 'teacher' || uRole === 'faculty' || uRole === 'professor' || isFacultyUser;
      const isUnlocked = unlockedContests[c.id];

      if (!isAdminOrFaculty && !isUnlocked) {
        if (!user) {
          // Unauthenticated visitors do not see private college labs
          return false;
        }
        const studentCollege = ((profile as any)?.college || (user as any)?.user_metadata?.college || '').trim().toLowerCase();
        const contestCollege = c.college.trim().toLowerCase();

        // If student has no college registered or it doesn't match the contest college, hide it
        if (!studentCollege || (!studentCollege.includes(contestCollege) && !contestCollege.includes(studentCollege))) {
          return false;
        }
      }
    }

    const cat = c.category || (c.companyTag ? 'placement' : c.visibility === 'passcode' ? 'faculty' : 'icpc');
    if (cat !== selectedTrack) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchOrganizer = c.organizer.toLowerCase().includes(q);
      const matchCompany = (c.companyTag || '').toLowerCase().includes(q);
      const matchProblems = c.problems.some((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
      if (!matchTitle && !matchOrganizer && !matchCompany && !matchProblems) return false;
    }
    return true;
  });

  // If Arena is OFFLINE, show maintenance screen
  if (!isArenaLive) {
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
            <h1 className="text-2xl font-black text-white">Competitive Practice Temporarily Paused</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The collegiate competitive programming arena is undergoing scheduled maintenance or problem revisions.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/">
              <Button size="md" variant="primary" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs">
                Return to Campus Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <main className="flex-1 pb-20">

        {/* Minimal Hero Section */}
        <section className="relative pt-10 pb-12 overflow-hidden border-b border-charcoal-800/80 bg-gradient-to-b from-charcoal-950 via-slate-900 to-charcoal-900">
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Clean Title, Intro & Host CTA */}
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                  <span>COMPETITIVE PRACTICE</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Competitive{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">
                    Practice.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal max-w-xl">
                  Solve company placement OA challenges, take faculty lab assessments with anti-cheat, and sharpen your algorithmic skills.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleHostContestClick}
                    leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
                    className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md border-0 text-xs"
                  >
                    Host Faculty Lab
                  </Button>
                </div>
              </div>

              {/* Right Column: Sleek, Minimal Student Stats Card */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-charcoal-900/80 border border-charcoal-750 backdrop-blur-md shadow-xl self-start lg:self-auto">
                {/* Streak */}
                <div className="flex items-center gap-3 pr-5 border-r border-charcoal-750">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shadow-sm">
                    🔥
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-400">Streak</div>
                    <div className="text-base font-black text-white">
                      {progress.streak} <span className="text-xs font-medium text-amber-400">day{progress.streak > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="pr-5 border-r border-charcoal-750">
                  <div className="text-xs font-mono text-slate-400">Arena Points</div>
                  <div className="text-base font-black text-amber-300 font-mono">
                    {progress.totalPoints} <span className="text-[10px] text-slate-400 font-sans">pts</span>
                  </div>
                </div>

                {/* Solved */}
                <div>
                  <div className="text-xs font-mono text-slate-400">Solved</div>
                  <div className="text-base font-black text-emerald-400 font-mono">
                    {progress.solvedProblemIds.length} <span className="text-[10px] text-slate-400 font-sans">probs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Champions Leaderboard Section (Controlled via Admin Control Center Toggle) */}
        {isLeaderboardLive && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-fadeIn">
            <div className="rounded-3xl bg-charcoal-900/90 border border-charcoal-750 p-5 sm:p-7 shadow-elevated relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">Campus Champions Leaderboard</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        LIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Top placement contenders &amp; competitive coders ranked by problem solves and streak
                    </p>
                  </div>
                </div>

                {/* Weekly vs Overall Tab Switcher */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setLeaderboardTab('weekly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      leaderboardTab === 'weekly'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Weekly (Resets Mon)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaderboardTab('all-time')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      leaderboardTab === 'all-time'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>All-Time Overall</span>
                  </button>
                </div>
              </div>

              {/* Leaderboard Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
                {(leaderboardTab === 'weekly' ? WEEKLY_LEADERBOARD : OVERALL_LEADERBOARD).map((champ) => {
                  const isGold = champ.rank === 1;
                  const isSilver = champ.rank === 2;
                  const isBronze = champ.rank === 3;
                  return (
                    <div
                      key={champ.name}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isGold
                          ? 'bg-gradient-to-b from-amber-500/15 to-charcoal-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : isSilver
                          ? 'bg-gradient-to-b from-slate-400/10 to-charcoal-950 border-slate-400/30'
                          : isBronze
                          ? 'bg-gradient-to-b from-amber-700/10 to-charcoal-950 border-amber-700/30'
                          : 'bg-charcoal-950/70 border-charcoal-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                            isGold
                              ? 'bg-amber-400 text-charcoal-950'
                              : isSilver
                              ? 'bg-slate-300 text-charcoal-950'
                              : isBronze
                              ? 'bg-amber-700 text-white'
                              : 'bg-charcoal-800 text-slate-300'
                          }`}
                        >
                          #{champ.rank}
                        </span>
                        <span className="text-base">{champ.avatar}</span>
                      </div>
                      <div className="font-bold text-white text-xs truncate" title={champ.name}>
                        {champ.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mb-2" title={champ.college}>
                        {champ.college}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-charcoal-800/80">
                        <span className="text-amber-300 font-bold">{champ.points} pts</span>
                        <span className="text-orange-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" />
                          <span>{champ.streak}d</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current User Standing Banner */}
              <div className="mt-4 p-3 rounded-2xl bg-charcoal-950/80 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-xs">
                    #1
                  </div>
                  <div>
                    <span className="font-bold text-white">Your Standing: </span>
                    <span className="text-cyan-300 font-mono font-bold">
                      {profile?.display_name || user?.email?.split('@')[0] || 'You'} ({progress.totalPoints} pts • 🔥 {progress.streak}d streak)
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓ Daily streak active</span>
                  <span>•</span>
                  <span>Solve questions below to increase your rank</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filter Bar & Contests Feed */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          {/* Controls Header: Category Track Tabs on Left & Search Bar on Right */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Track Selector */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-charcoal-900 border border-charcoal-750 overflow-x-auto select-none scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedTrack('placement')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTrack === 'placement'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏢 Company Placement</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200">
                  {contests.filter((c) => c.category === 'placement' || Boolean(c.companyTag)).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrack('faculty')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTrack === 'faculty'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🎓 Faculty Labs</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200">
                  {contests.filter((c) => c.category === 'faculty' || c.visibility === 'passcode').length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrack('icpc')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTrack === 'icpc'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚡ Speedrun Contests</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200">
                  {contests.filter((c) => c.category === 'icpc' || (!c.category && !c.companyTag && c.visibility !== 'passcode')).length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company (Amazon, TCS), topic, or professor..."
                className="w-full pl-10 pr-8 py-2.5 rounded-2xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
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
            <div className="relative rounded-3xl border border-charcoal-800 bg-charcoal-950/40 p-2 sm:p-4 shadow-xs overflow-hidden">
              {/* Blur Curtains for Upper & Lower Margins */}
              <div className="scroll-blur-curtain-top" />
              <div className="scroll-blur-curtain-bottom" />

              {/* Contests Viewport with Blur-to-Focus Mask */}
              <div className="tech-scroll-viewport blur-focus-scroll px-1 py-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredContests.map((contest, idx) => {
                    const isUpcoming = contest.status === 'upcoming' || (contest.contestType !== 'practice' && contest.startTime && new Date() < new Date(contest.startTime));

                    return (
                    <div
                      key={contest.id}
                      className="blur-to-focus-card h-full"
                      style={{ animationDelay: `${Math.min(idx * 35, 350)}ms` }}
                    >
                      <div className="h-full rounded-3xl bg-charcoal-900/90 border border-charcoal-750 hover:border-cyan-500/40 transition-all duration-300 p-6 flex flex-col justify-between space-y-5 shadow-elevated group">
                        <div className="space-y-4">
                          {/* Badge Row */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Category Track Badge */}
                              {contest.category === 'placement' || contest.companyTag ? (
                                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                                  <span>🏢 {contest.companyTag || 'Placement'}</span>
                                </span>
                              ) : contest.category === 'faculty' || contest.visibility === 'passcode' ? (
                                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider flex items-center gap-1">
                                  <span>🎓 Faculty Lab</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1">
                                  <span>⚡ ICPC &amp; Speedrun</span>
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                                  contest.status === 'live'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : isUpcoming
                                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                                    : 'bg-slate-700/40 text-slate-300 border-slate-600'
                                }`}
                              >
                                {contest.status === 'live' ? '🟢 Live Contest' : isUpcoming ? '🕒 Upcoming' : '🏁 Practice Mode'}
                              </span>
                              {contest.visibility === 'passcode' && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-purple-400" />
                                    <span>Private Room</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyRoomLink(contest);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 hover:bg-purple-500/35 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 transition-colors cursor-pointer shadow-xs"
                                    title="Copy Direct Classroom Invite Link"
                                  >
                                    {copiedContestId === contest.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-emerald-300">Link Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Copy Room Link</span>
                                      </>
                                    )}
                                  </button>
                                </div>
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

                    {/* Upcoming Contest Countdown Banner */}
                    {isUpcoming && contest.startTime && (
                      <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs font-mono text-indigo-300">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          <span>Opens: {formatContestSchedule(contest.startTime)}</span>
                        </span>
                        <span className="text-[11px] text-indigo-300/90 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-md">
                          {getTimeUntilContest(contest.startTime)}
                        </span>
                      </div>
                    )}

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
                            onClick={() => {
                              if (isUpcoming) {
                                setUpcomingLockedContest(contest);
                                return;
                              }
                              handleInitiateArena(contest, problem);
                            }}
                            className={`p-3 rounded-xl bg-charcoal-950/50 border border-charcoal-800 transition-all flex items-center justify-between gap-3 ${
                              isUpcoming
                                ? 'cursor-not-allowed opacity-80'
                                : 'hover:bg-charcoal-800/80 hover:border-cyan-500/50 cursor-pointer group/prob'
                            }`}
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
                              {progress.solvedProblemIds.includes(problem.id) ? (
                                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold select-none">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Solved</span>
                                </div>
                              ) : isUpcoming ? (
                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold select-none">
                                  <Lock className="w-2.5 h-2.5 text-indigo-400" />
                                  <span>Locked</span>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInitiateArena(contest, problem);
                                  }}
                                  className="text-[10px] h-6 px-2 border-cyan-500/30 text-cyan-300 group-hover/prob:bg-cyan-500/20"
                                >
                                  Solve
                                </Button>
                              )}
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
                    {(() => {
                      const isContestFullySolved =
                        contest.problems.length > 0 &&
                        contest.problems.every((p) => progress.solvedProblemIds.includes(p.id));
                      const solvedCount = contest.problems.filter((p) =>
                        progress.solvedProblemIds.includes(p.id)
                      ).length;

                      if (isUpcoming) {
                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUpcomingLockedContest(contest)}
                            className="bg-indigo-950/40 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/40 font-mono text-xs cursor-pointer shadow-xs"
                            leftIcon={<Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
                          >
                            <span>Opens {formatContestSchedule(contest.startTime)}</span>
                          </Button>
                        );
                      }

                      return (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            handleInitiateArena(contest);
                          }}
                          rightIcon={
                            !user ? (
                              <Lock className="w-3.5 h-3.5 text-cyan-200" />
                            ) : contest.visibility === 'passcode' && !unlockedContests[contest.id] ? (
                              <Lock className="w-3.5 h-3.5 text-purple-200" />
                            ) : isContestFullySolved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                            ) : (
                              <ArrowRight className="w-3.5 h-3.5" />
                            )
                          }
                          className={
                            !user
                              ? 'bg-charcoal-800 text-slate-300 font-bold text-xs'
                              : contest.visibility === 'passcode' && !unlockedContests[contest.id]
                              ? 'bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs'
                              : isContestFullySolved
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs'
                          }
                        >
                          {!user
                            ? 'Log In to Enter Arena'
                            : contest.visibility === 'passcode' && !unlockedContests[contest.id]
                            ? 'Enter with Passcode'
                            : isContestFullySolved
                            ? `✓ Submitted (${solvedCount}/${contest.problems.length}) • Review Arena`
                            : solvedCount > 0
                            ? `Enter Arena (${solvedCount}/${contest.problems.length} Done)`
                            : 'Enter Arena'}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
        </section>

        {/* LeetCode-style Problem Solver Modal with Recruiter-Grade Proctoring */}
        {mounted && Boolean(user) && activeProblem && selectedContest && typeof document !== 'undefined' && createPortal(
          <div id="icpc-exam-proctor-portal" className="fixed inset-0 z-[99999] bg-charcoal-950 overflow-hidden">
            <IcpcProctorGuard
              contestId={selectedContest.id}
              contestTitle={selectedContest.title}
              problemId={activeProblem.id}
              problemTitle={activeProblem.title}
              studentId={user?.id || 'anon'}
              studentName={profile?.display_name || user?.user_metadata?.display_name || 'Contestant'}
              studentEmail={user?.email}
              college={(profile as any)?.college || 'Collegiate Builder'}
              isActive={Boolean(activeProblem)}
              onCloseArena={() => {
                if (typeof document !== 'undefined' && document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
                setActiveProblem(null);
              }}
            >
              <div className="fixed inset-0 z-0 bg-charcoal-950 flex flex-col text-white w-full h-[100dvh] max-h-[100dvh] overflow-hidden animate-in fade-in duration-150 select-none">
              {/* Top Navigation Bar (56px) */}
              <header className="h-14 shrink-0 px-4 bg-charcoal-900 border-b border-charcoal-800 flex items-center justify-between gap-3 select-none">
                {/* Left: Exit Arena, Contest Title, and Problem Switcher */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof document !== 'undefined' && document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {});
                      }
                      setActiveProblem(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-charcoal-700 hover:border-rose-500/40 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
                    title="Exit Arena & Restore Standard Window"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Exit Arena</span>
                  </button>

                  <div className="h-5 w-[1px] bg-charcoal-750 shrink-0" />

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-xs">
                      {selectedContest.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0">
                      Competitive Practice
                    </span>
                  </div>

                  {/* Problem selector tabs [A], [B], [C] */}
                  <div className="hidden md:flex items-center gap-1 shrink-0 ml-2">
                    {selectedContest.problems.map((prob, idx) => {
                      const isCurr = prob.id === activeProblem.id;
                      const isSolved = progress.solvedProblemIds.includes(prob.id);
                      return (
                        <button
                          key={prob.id}
                          type="button"
                          onClick={() => switchProblem(prob)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isCurr
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
                              : isSolved
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400'
                              : 'bg-charcoal-800/80 text-slate-400 hover:text-white border border-charcoal-700'
                          }`}
                          title={`Problem ${String.fromCharCode(65 + idx)}: ${prob.title} ${isSolved ? '(Solved)' : ''}`}
                        >
                          {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{String.fromCharCode(65 + idx)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Middle: Live Proctor, Full-Screen & Siri Status */}
                <div className="hidden lg:flex items-center gap-2 shrink-0 text-xs font-mono">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-800 border border-charcoal-700 text-slate-300">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px]">Full-Screen Locked</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-800 border border-cyan-500/30 text-cyan-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px]">AI Proctor Guard Live</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 transition-colors"
                    title="Dual-Feed Proctoring: Entire Screen Share is actively monitored"
                  >
                    <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold">Screen Share Live</span>
                  </div>
                </div>

                {/* Right: Problem Meta info */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      activeProblem.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : activeProblem.difficulty === 'Hard'
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {activeProblem.difficulty}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    +{activeProblem.points} pts
                  </span>
                </div>
              </header>

              {/* Main 2-Column Split Arena View */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 select-text">
                {/* LEFT COLUMN: Problem Statement & Editorial */}
                <div className="w-full lg:w-1/2 h-full flex flex-col border-r border-charcoal-800 bg-charcoal-950 overflow-hidden min-h-0">
                  {/* Left Tab Strip */}
                  <div className="h-11 shrink-0 px-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-900/60 select-none">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSolverTab('editor')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          solverTab === 'editor'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Problem Statement</span>
                      </button>

                      {selectedContest.contestType !== 'practice' && (activeProblem.solutionCode || activeProblem.solutionExplanation || activeProblem.isSolutionLocked) && (
                        <button
                          type="button"
                          onClick={() => setSolverTab('solution')}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            solverTab === 'solution'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span>💡 Official Editorial</span>
                          {(() => {
                            const isContestEnded = selectedContest.endTime ? new Date() >= new Date(selectedContest.endTime) : false;
                            const isSolutionLocked = !isContestEnded;
                            return isSolutionLocked ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Unlocked
                              </span>
                            );
                          })()}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>⏱ {activeProblem.timeLimit}</span>
                      <span>💾 {activeProblem.memoryLimit}</span>
                    </div>
                  </div>

                  {/* Left Column Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-5 text-slate-200 relative">
                    <AntiPhotoWatermarkGuard
                      studentName={profile?.display_name || user?.user_metadata?.full_name || 'Contestant'}
                      studentEmail={user?.email || ''}
                      studentCollege={(profile as any)?.college || (user as any)?.user_metadata?.college || ''}
                      contestId={selectedContest?.id || ''}
                      className="min-h-full space-y-5"
                    >
                    {solverTab === 'editor' ? (
                      <>
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2">{activeProblem.title}</h2>
                          <div className="leading-relaxed whitespace-pre-line text-sm text-slate-300">
                            {activeProblem.description}
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-charcoal-800">
                          <div>
                            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Input Format</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{activeProblem.inputFormat}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Output Format</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{activeProblem.outputFormat}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-charcoal-800">
                          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Constraints</h4>
                          <code className="inline-block text-amber-300 font-mono text-xs bg-charcoal-900 px-2.5 py-1 rounded-lg border border-charcoal-800">
                            {activeProblem.constraints}
                          </code>
                        </div>

                        {/* Sample Testcase */}
                        <div className="space-y-3 pt-3 border-t border-charcoal-800 font-mono text-xs">
                          <div>
                            <span className="font-bold text-slate-300 block mb-1 font-sans">Sample Input:</span>
                            <pre className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-emerald-300 overflow-x-auto leading-relaxed">
                              {activeProblem.sampleInput}
                            </pre>
                          </div>
                          <div>
                            <span className="font-bold text-slate-300 block mb-1 font-sans">Sample Output:</span>
                            <pre className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-cyan-300 overflow-x-auto leading-relaxed">
                              {activeProblem.sampleOutput}
                            </pre>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Tab 2: Editorial */
                      (() => {
                        const isContestEnded = selectedContest.endTime ? new Date() >= new Date(selectedContest.endTime) : false;
                        const isSolutionLocked = !isContestEnded;

                        if (isSolutionLocked) {
                          const minutesLeft = Math.max(0, Math.round((new Date(selectedContest.endTime).getTime() - Date.now()) / 60000));
                          return (
                            <div className="p-8 rounded-3xl bg-charcoal-900 border border-charcoal-750 text-center space-y-4 my-auto">
                              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
                                <Lock className="w-8 h-8" />
                              </div>
                              <div className="max-w-md mx-auto space-y-2">
                                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ICPC INTEGRITY LOCK // LIVE CONTEST
                                </span>
                                <h3 className="text-xl font-bold text-white">
                                  Official Editorial & Solution Locked
                                </h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                  This contest is actively in session. To preserve academic fairness and prevent code sharing during the competition, the professor's official solution and editorial unlock automatically when the contest ends.
                                </p>
                                <div className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-xs font-mono text-cyan-300">
                                  ⏱ Countdown: ~{minutesLeft} min remaining (Ends {new Date(selectedContest.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSolverTab('editor')}
                                  leftIcon={<Code2 className="w-3.5 h-3.5 text-cyan-400" />}
                                  className="text-xs font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
                                >
                                  Return to Problem Statement
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                                  <span className="text-xs font-bold text-white">
                                    Verified Faculty Editorial • {selectedContest.organizer}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1">
                                  Official algorithmic explanation and optimal reference code authored by faculty for post-contest study and interview mastery.
                                </p>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                Editorial Unlocked
                              </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-750 space-y-2">
                              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                                Algorithmic Approach & Complexity
                              </h4>
                              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                                {activeProblem.solutionExplanation || activeProblem.explanation || 'Optimal mathematical and dynamic programming approach with minimal state transitions.'}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                                <span>Official Solution Code ({activeProblem.solutionLanguage?.toUpperCase() || 'C++'})</span>
                                {activeProblem.solutionCode && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopySolutionCode(activeProblem.solutionCode || '')}
                                    className="inline-flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white transition-colors cursor-pointer"
                                  >
                                    {copiedSolution ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-300">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Solution</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                              <pre className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-700 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed max-h-[350px]">
                                {activeProblem.solutionCode || '// The faculty mentor has not uploaded reference solution code for this problem yet.'}
                              </pre>
                            </div>
                          </div>
                        );
                      })()
                    )}
                    </AntiPhotoWatermarkGuard>
                  </div>
                </div>

                {/* RIGHT COLUMN: Code Editor & Testbench */}
                {(() => {
                  const allowedLanguages = (activeProblem.allowedLanguages && activeProblem.allowedLanguages.length > 0)
                    ? activeProblem.allowedLanguages
                    : (['cpp', 'python', 'java'] as ('cpp' | 'python' | 'java')[]);

                  const isContestTimeEnded = selectedContest.contestType !== 'practice' && Boolean(selectedContest.endTime) && new Date() >= new Date(selectedContest.endTime);
                  const isAllContestProblemsSolved = selectedContest.problems.length > 0 && selectedContest.problems.every((p) => progress.solvedProblemIds.includes(p.id));
                  const isArenaReadOnly = isContestTimeEnded || isAllContestProblemsSolved;

                  return (
                    <div className="w-full lg:w-1/2 h-full flex flex-col bg-charcoal-900/40 overflow-hidden min-h-0">
                      {/* Editor Toolbar (h-11) */}
                      <div className="h-11 shrink-0 px-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-900 select-none gap-2">
                        {/* Language switcher depending on allowed languages */}
                        <div className="flex items-center gap-1.5">
                          {allowedLanguages.map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => handleSelectLanguage(lang)}
                              className={`px-2.5 py-1 rounded-lg uppercase text-xs font-mono font-bold transition-all cursor-pointer ${
                                selectedLanguage === lang
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                                  : 'text-slate-400 hover:text-white border border-transparent'
                              }`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>

                        {/* Action buttons (Run & Submit) right in the Editor Toolbar */}
                        <div className="flex items-center gap-2">
                          <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mr-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Anti-Cheat</span>
                          </div>

                          <button
                            type="button"
                            disabled={isArenaReadOnly}
                            onClick={handleRunSample}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all shadow-xs ${
                              isArenaReadOnly
                                ? 'bg-charcoal-800 text-slate-500 border-charcoal-700 cursor-not-allowed'
                                : 'bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 hover:text-white border-charcoal-700 cursor-pointer active:scale-95'
                            }`}
                            title={isArenaReadOnly ? 'Assessment has concluded (Read-only mode)' : 'Run sample testcase and compile code'}
                          >
                            <Play className={`w-3.5 h-3.5 ${isArenaReadOnly ? 'text-slate-500 fill-slate-500/20' : 'text-cyan-400 fill-cyan-400/20'}`} />
                            <span>Run</span>
                          </button>

                          <button
                            type="button"
                            disabled={isArenaReadOnly}
                            onClick={handleSubmitSolution}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all shadow-sm ${
                              isArenaReadOnly
                                ? 'bg-charcoal-800 text-slate-500 border-charcoal-700 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 cursor-pointer active:scale-95'
                            }`}
                            title={isArenaReadOnly ? 'All problems submitted or contest time ended (Read-only mode)' : 'Submit code against all testcases'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isArenaReadOnly ? 'text-slate-500' : 'text-emerald-200'}`} />
                            <span>{isArenaReadOnly ? 'Submitted (Read-Only)' : 'Submit'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Next Question Auto-Advance Toast / Banner */}
                      {nextQuestionPrompt && (
                        <div className="px-4 py-2.5 bg-emerald-950/90 border-b border-emerald-500/40 flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200 backdrop-blur-sm select-none">
                          <div className="flex items-center gap-2 text-emerald-300 font-mono">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              <strong>Correct! Solution Accepted!</strong> Advancing to Problem {nextQuestionPrompt.nextLetter} in {nextQuestionPrompt.secondsLeft}s...
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => switchProblem(nextQuestionPrompt.nextProblem)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            >
                              <span>Problem {nextQuestionPrompt.nextLetter} Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setNextQuestionPrompt(null)}
                              className="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
                            >
                              Stay Here
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Read-Only Status Banner when submissions are locked */}
                      {isArenaReadOnly && (
                        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300 font-mono select-none">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              {isContestTimeEnded
                                ? '⏰ Contest Time Ended — Submissions are closed. Editor is in read-only mode.'
                                : '🏆 Assessment Completed — All questions submitted! Editor is in read-only review mode.'}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                            Read Only Mode
                          </span>
                        </div>
                      )}

                      {/* Full-Height Code Editor Area */}
                      <div className="flex-1 relative min-h-0 bg-charcoal-950 flex flex-col">
                        <textarea
                          value={userCode}
                          readOnly={isArenaReadOnly}
                          disabled={isArenaReadOnly}
                          onChange={(e) => {
                            if (isArenaReadOnly) return;
                            const val = e.target.value;
                            setUserCode(val);
                            if (activeProblem) {
                              const k = `${activeProblem.id}_${selectedLanguage}`;
                              setCodeDrafts((prev) => ({ ...prev, [k]: val }));
                            }
                          }}
                      onKeyDown={(e) => {
                        // Anti-Cheat: Intercept keyboard paste (Cmd+V / Ctrl+V)
                        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
                          e.preventDefault();
                          const reason = 'Proctoring Alert: Keyboard paste (Cmd/Ctrl + V) blocked. Copy-pasting code into the compiler is disabled in competitive practice. Code must be typed directly.';
                          if (selectedContest && activeProblem) {
                            fetch('/api/icpc/proctor', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                studentId: user?.id || 'anon',
                                studentName: profile?.display_name || user?.user_metadata?.display_name || 'Contestant',
                                studentEmail: user?.email,
                                college: (profile as any)?.college || 'Collegiate Builder',
                                contestId: selectedContest.id,
                                contestTitle: selectedContest.title,
                                problemId: activeProblem.id,
                                problemTitle: activeProblem.title,
                                violationType: 'SUSPICIOUS_PASTE',
                                details: reason,
                                severity: 'high',
                              }),
                            }).catch(() => {});
                          }
                          setPasteWarning(reason);
                          return;
                        }

                        // Allow tab key indentation inside code editor
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const target = e.currentTarget;
                          const start = target.selectionStart;
                          const end = target.selectionEnd;
                          const val = target.value;
                          const newVal = val.substring(0, start) + '    ' + val.substring(end);
                          setUserCode(newVal);
                          if (activeProblem) {
                            const k = `${activeProblem.id}_${selectedLanguage}`;
                            setCodeDrafts((prev) => ({ ...prev, [k]: newVal }));
                          }
                          requestAnimationFrame(() => {
                            target.selectionStart = target.selectionEnd = start + 4;
                          });
                        }
                      }}
                      onPaste={(e) => {
                        // Anti-Cheat: Strictly block external paste into compiler
                        e.preventDefault();
                        const pasted = e.clipboardData?.getData('text') || '';
                        const check = checkSuspiciousPaste(pasted);
                        const reason = check.isSuspicious
                          ? check.reason
                          : `Proctoring Alert: External code paste blocked (${pasted.length || 'clipboard'} characters). Copy-pasting into the competitive compiler is disabled. Code must be typed directly.`;

                        if (selectedContest && activeProblem) {
                          fetch('/api/icpc/proctor', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              studentId: user?.id || 'anon',
                              studentName: profile?.display_name || user?.user_metadata?.display_name || 'Contestant',
                              studentEmail: user?.email,
                              college: (profile as any)?.college || 'Collegiate Builder',
                              contestId: selectedContest.id,
                              contestTitle: selectedContest.title,
                              problemId: activeProblem.id,
                              problemTitle: activeProblem.title,
                              violationType: 'SUSPICIOUS_PASTE',
                              details: reason,
                              severity: 'high',
                            }),
                          }).catch(() => {});
                        }
                        setPasteWarning(reason);
                      }}
                      placeholder={
                        isArenaReadOnly
                          ? 'Submissions closed for this contest session.'
                          : selectedLanguage === 'python'
                          ? `# Write your Python 3 solution here...\n# Read from sys.stdin and print to sys.stdout\nimport sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`
                          : selectedLanguage === 'java'
                          ? `// Write your Java solution here...\n// Class must be named Main\nimport java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}`
                          : `// Write your C++ solution here...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    return 0;\n}`
                      }
                      className="w-full flex-1 p-4 font-mono text-xs text-cyan-200 bg-transparent border-none resize-none focus:outline-none selection:bg-cyan-500/30 leading-relaxed"
                      spellCheck={false}
                    />

                    {/* Console Output Drawer */}
                    {consoleOutput.message && (
                      <div className="max-h-48 overflow-y-auto shrink-0 border-t border-charcoal-800 p-3 bg-charcoal-900/95 font-mono text-xs whitespace-pre-line leading-relaxed">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-charcoal-800 text-[10px] text-slate-400">
                          <span>Testbench Console Output</span>
                          <button
                            type="button"
                            onClick={() => setConsoleOutput({ status: 'idle', message: '' })}
                            className="text-slate-400 hover:text-white"
                          >
                            Clear
                          </button>
                        </div>
                        <div
                          className={
                            consoleOutput.status === 'running'
                              ? 'text-indigo-300'
                              : consoleOutput.status === 'success'
                              ? 'text-emerald-300'
                              : 'text-rose-300'
                          }
                        >
                          {consoleOutput.message}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column Footer (h-14) */}
                  <footer className="h-14 shrink-0 px-4 border-t border-charcoal-800 bg-charcoal-900 flex items-center justify-between select-none">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isArenaReadOnly}
                      onClick={handleRunSample}
                      leftIcon={<Play className={`w-3.5 h-3.5 ${isArenaReadOnly ? 'text-slate-500' : 'text-cyan-400'}`} />}
                      className={`border-charcoal-700 text-xs font-mono ${isArenaReadOnly ? 'text-slate-500 cursor-not-allowed opacity-50' : 'text-slate-200 hover:text-white'}`}
                    >
                      Run Sample Testcase
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={isArenaReadOnly}
                        onClick={handleSubmitSolution}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        className={`font-bold text-xs shadow-md ${isArenaReadOnly ? 'bg-charcoal-800 text-slate-500 border border-charcoal-700 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                      >
                        {isArenaReadOnly ? 'Contest Concluded (Read-Only)' : 'Submit Solution'}
                      </Button>
                    </div>
                  </footer>
                </div>
              );
            })()}
              </div>
            </div>
          </IcpcProctorGuard>
        </div>,
        document.body
      )}

        {/* Host ICPC Contest Modal */}
        <CreateIcpcContestModal
          isOpen={isHostModalOpen}
          onClose={() => setIsHostModalOpen(false)}
          organizerName={profile?.display_name || 'Faculty Mentor'}
          collegeName={profile?.college || 'Collegiate Network'}
          isFacultyMode={true}
          onCreated={(newContest) => {
            setContests((prev) => [newContest, ...prev]);
          }}
        />

        {/* Faculty Restriction Notice Modal */}
        <Modal
          isOpen={isFacultyNoticeOpen}
          onClose={() => setIsFacultyNoticeOpen(false)}
          title="Faculty ICPC Desk Access"
          maxWidth="md"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400 shadow-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                FACULTY ONLY // VERIFICATION REQUIRED
              </span>
              <h3 className="text-base font-bold text-white">
                Faculty & Professor Authorization Required
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hosting ICPC contests and creating problem sets is strictly restricted to verified university professors, faculty advisors, and campus contest coordinators.
              </p>
              <div className="p-3 rounded-xl bg-charcoal-950 text-left text-xs font-mono text-slate-400 border border-charcoal-800 space-y-1">
                <p className="text-slate-300 font-bold">How to get Faculty Access:</p>
                <p>1. Switch your role to "Faculty" in your Profile settings.</p>
                <p>2. Or contact your university campus coordinator to receive the verified educator badge.</p>
              </div>
            </div>
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsFacultyNoticeOpen(false)}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
              >
                Understood
              </Button>
            </div>
          </div>
        </Modal>

        {/* Contest Completion Celebration Modal (All questions answered) */}
        <Modal
          isOpen={contestCompletionModal?.isOpen || false}
          onClose={() => setContestCompletionModal(null)}
          title="Contest Completed"
          maxWidth="md"
        >
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-md">
              <Award className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% CONTEST COMPLETE
              </span>
              <h3 className="text-xl font-bold text-white">
                Magnificent! All Problems Solved!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                You successfully solved all {contestCompletionModal?.totalSolved} questions in &quot;{contestCompletionModal?.contestTitle}&quot; with full testcase passes!
              </p>
            </div>

            {/* Solved Problems checklist */}
            {selectedContest && (
              <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2 text-left">
                <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Solved Problem Set:
                </p>
                <div className="space-y-1.5">
                  {selectedContest.problems.map((p, idx) => (
                    <div key={p.id} className="flex items-center justify-between text-xs font-mono py-1 px-2.5 rounded-lg bg-charcoal-900/80 border border-charcoal-800">
                      <span className="text-slate-200 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate max-w-[240px]">Problem {String.fromCharCode(65 + idx)}: {p.title.split(': ')[1] || p.title}</span>
                      </span>
                      <span className="text-cyan-400 font-bold shrink-0">+{p.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setContestCompletionModal(null)}
                className="w-full text-xs font-mono border-charcoal-700 text-slate-300 hover:text-white"
              >
                Review My Solutions
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setContestCompletionModal(null);
                  setActiveProblem(null);
                  setSelectedContest(null);
                  try {
                    if (typeof document !== 'undefined' && document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    }
                  } catch (e) {}
                }}
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Exit Arena
              </Button>
            </div>
          </div>
        </Modal>

        {/* Suspicious External Paste Warning Modal (Restores & Guarantees Full-Screen on OK) */}
        {pasteWarning && (
          <div className="fixed inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
            <div className="max-w-md w-full bg-charcoal-900 border-2 border-amber-500 rounded-3xl p-6 space-y-4 shadow-2xl shadow-amber-500/25 text-center animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Proctoring Alert: External Code Paste Blocked</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono bg-charcoal-950 p-3 rounded-xl border border-charcoal-800 whitespace-pre-line">
                  {pasteWarning}
                </p>
                <p className="text-[11px] text-slate-400 pt-1 leading-snug">
                  This incident has been logged for proctor review. Tapping OK will automatically return you to full-screen mode to resume your contest.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-amber-500/30 cursor-pointer"
                onClick={async () => {
                  setPasteWarning(null);
                  try {
                    if (typeof document !== 'undefined' && !document.fullscreenElement) {
                      const el = document.documentElement;
                      if (el.requestFullscreen) {
                        await el.requestFullscreen();
                      } else if ((el as any).webkitRequestFullscreen) {
                        await (el as any).webkitRequestFullscreen();
                      }
                    }
                  } catch (err) {
                    console.warn('Failed to restore fullscreen after paste warning:', err);
                  }
                }}
              >
                OK (Return to Full-Screen Arena)
              </Button>
            </div>
          </div>
        )}

        {/* Student Account Required Modal */}
        <Modal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Account Required"
          maxWidth="md"
        >
          <div className="space-y-5 text-center p-2">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white">Log In to Enter Arena</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                You must be logged in with your student account to enter live ICPC contests, run proctored submissions, and rank on the collegiate leaderboard.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" className="w-full">
                <Button
                  variant="primary"
                  className="w-full justify-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-600/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Log In / Create Account
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="w-full justify-center border-charcoal-700 text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        {/* Passcode Unlock Modal for Private Faculty Assessments */}
        <Modal
          isOpen={Boolean(passcodeModalContest)}
          onClose={() => {
            setPasscodeModalContest(null);
            setPendingProblem(null);
            setEnteredPasscode('');
            setPasscodeError('');
          }}
          title="Classroom Lab Passcode Required"
          maxWidth="md"
        >
          {passcodeModalContest && (
            <form onSubmit={handleUnlockPasscode} className="p-3 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-white">{passcodeModalContest.title}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Authored by <span className="text-white font-semibold">{passcodeModalContest.organizer}</span> ({passcodeModalContest.college}).
                  This private assessment is protected by live Anti-Cheat Proctoring.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Anti-Cheat Mode:</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Active Telemetry Watchdog</span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Demo Classroom Code:</span>
                  <button
                    type="button"
                    onClick={() => setEnteredPasscode(passcodeModalContest.passcode || 'LAB2026')}
                    className="font-mono text-cyan-300 font-bold hover:underline cursor-pointer"
                  >
                    Click to insert &quot;{passcodeModalContest.passcode || 'LAB2026'}&quot;
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 block">
                  ENTER ROOM PASSCODE
                </label>
                <input
                  type="text"
                  value={enteredPasscode}
                  onChange={(e) => {
                    setEnteredPasscode(e.target.value.toUpperCase());
                    setPasscodeError('');
                  }}
                  placeholder="e.g. LAB2026"
                  className="w-full px-4 py-3 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-cyan-400"
                  autoFocus
                />
                {passcodeError && (
                  <p className="text-xs text-rose-400 font-mono flex items-center gap-1 pt-1 justify-center">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{passcodeError}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasscodeModalContest(null);
                    setPendingProblem(null);
                    setEnteredPasscode('');
                    setPasscodeError('');
                  }}
                  className="border-charcoal-700 text-slate-300 hover:text-white text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Unlock &amp; Start Lab
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Upcoming Contest Locked Schedule Dialog */}
        <Modal
          isOpen={Boolean(upcomingLockedContest)}
          onClose={() => setUpcomingLockedContest(null)}
          title="Contest Has Not Started Yet"
          maxWidth="md"
        >
          {upcomingLockedContest && (
            <div className="p-4 space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-md">
                <Clock className="w-7 h-7 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">{upcomingLockedContest.title}</h3>
                <p className="text-xs text-slate-400">
                  {upcomingLockedContest.subtitle}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 text-left space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Scheduled Start:</span>
                  <span className="text-indigo-300 font-bold">
                    {formatContestSchedule(upcomingLockedContest.startTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Scheduled End:</span>
                  <span className="text-slate-300">
                    {formatContestSchedule(upcomingLockedContest.endTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-cyan-300 font-bold">
                    {upcomingLockedContest.durationMinutes} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-charcoal-800">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    <span>⏳</span>
                    <span>{getTimeUntilContest(upcomingLockedContest.startTime) || 'Upcoming'}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                🔒 Problems and code execution testbenches will unlock automatically when this contest starts. Please return when the scheduled time arrives!
              </p>

              <Button
                type="button"
                variant="primary"
                onClick={() => setUpcomingLockedContest(null)}
                className="w-full font-bold text-xs py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Understood, I&apos;ll Return When Live
              </Button>
            </div>
          )}
        </Modal>

        {/* Question & Assessment Details Preview Modal (Dual-Lens Entry Gate) */}
        <Modal
          isOpen={Boolean(questionPreview)}
          onClose={() => setQuestionPreview(null)}
          title="Collegiate Assessment Brief"
          maxWidth="2xl"
        >
          {questionPreview && (
            <div className="p-2 sm:p-4 space-y-5 text-left">
              {/* Contest Context Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    {questionPreview.contest.title}
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    Organized by {questionPreview.contest.organizer} • {questionPreview.contest.college}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                    ⏱ {questionPreview.contest.durationMinutes} Mins
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
                    {(questionPreview.contest.scoringType || 'icpc').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Problem Switcher Tabs (if contest has multiple problems) */}
              {questionPreview.contest.problems.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    Problem Set ({questionPreview.contest.problems.length} Problems):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {questionPreview.contest.problems.map((prob, idx) => {
                      const isSelected = prob.id === questionPreview.problem.id;
                      const isProbSolved = progress.solvedProblemIds.includes(prob.id);
                      return (
                        <button
                          key={prob.id}
                          type="button"
                          onClick={() => setQuestionPreview({ contest: questionPreview.contest, problem: prob })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400'
                              : isProbSolved
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-charcoal-800 text-slate-300 border border-charcoal-700 hover:text-white hover:bg-charcoal-750'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + idx)}. {prob.title}</span>
                          {isProbSolved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="text-[10px] opacity-75">+{prob.points}pts</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Problem Header & Badges */}
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {questionPreview.problem.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        questionPreview.problem.difficulty === 'Easy'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : questionPreview.problem.difficulty === 'Hard'
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {questionPreview.problem.difficulty}
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                      +{questionPreview.problem.points} ICPC Points
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1 border-t border-charcoal-800/80">
                  <span>⏱ CPU Limit: <strong className="text-white">{questionPreview.problem.timeLimit || '2.0s'}</strong></span>
                  <span>💾 Memory Limit: <strong className="text-white">{questionPreview.problem.memoryLimit || '256MB'}</strong></span>
                  <span>💻 Allowed: <strong className="text-cyan-300 font-bold uppercase">{((questionPreview.problem.allowedLanguages && questionPreview.problem.allowedLanguages.length > 0) ? questionPreview.problem.allowedLanguages : ['cpp', 'python', 'java']).join(', ')}</strong></span>
                  {questionPreview.problem.tags && questionPreview.problem.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {questionPreview.problem.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-charcoal-950 text-slate-300 border border-charcoal-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                <div className="pt-2 text-xs text-slate-200 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-1">
                  {questionPreview.problem.description}
                </div>

                {/* Input / Output Format */}
                {(questionPreview.problem.inputFormat || questionPreview.problem.outputFormat) && (
                  <div className="space-y-2 pt-2 border-t border-charcoal-800/60 text-xs">
                    {questionPreview.problem.inputFormat && (
                      <div>
                        <strong className="text-slate-400 font-mono text-[11px] block">Input Format:</strong>
                        <p className="text-slate-300 font-mono text-[11px] whitespace-pre-line">{questionPreview.problem.inputFormat}</p>
                      </div>
                    )}
                    {questionPreview.problem.outputFormat && (
                      <div>
                        <strong className="text-slate-400 font-mono text-[11px] block">Output Format:</strong>
                        <p className="text-slate-300 font-mono text-[11px] whitespace-pre-line">{questionPreview.problem.outputFormat}</p>
                      </div>
                    )}
                    {questionPreview.problem.constraints && (
                      <div>
                        <strong className="text-slate-400 font-mono text-[11px] block">Constraints:</strong>
                        <p className="text-slate-300 font-mono text-[11px] whitespace-pre-line">{questionPreview.problem.constraints}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sample I/O */}
                {(questionPreview.problem.sampleInput || questionPreview.problem.sampleOutput) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {questionPreview.problem.sampleInput && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Sample Input:</span>
                        <pre className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                          {questionPreview.problem.sampleInput}
                        </pre>
                      </div>
                    )}
                    {questionPreview.problem.sampleOutput && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Sample Output:</span>
                        <pre className="p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                          {questionPreview.problem.sampleOutput}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dual-Lens Proctoring Gate Notice */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Dual-Lens Proctoring Gate</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      Anti-Cheat Active
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tapping <strong className="text-cyan-300">&quot;Enter Arena&quot;</strong> will engage full-screen examination mode and prompt you to grant <strong>Webcam</strong> access and <strong>Entire Screen Share</strong> before you can write code.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestionPreview(null)}
                  className="border-charcoal-700 text-slate-300 hover:text-white text-xs px-4"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const { contest, problem } = questionPreview;
                    setQuestionPreview(null);
                    handleOpenProblem(contest, problem);
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-xs px-5 shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Enter Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
