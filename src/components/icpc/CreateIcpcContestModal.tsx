'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import {
  Terminal,
  Plus,
  Trash2,
  Code2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Award,
  Copy,
  Check,
  BookOpen,
  Lock,
  Layers,
} from 'lucide-react';
import { IcpcContest, IcpcProblem, ProblemDifficulty, ContestType } from '@/types/icpc';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';

interface CreateIcpcContestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (contest: IcpcContest) => void;
  organizerName?: string;
  collegeName?: string;
}

interface ProblemDraft {
  title: string;
  difficulty: ProblemDifficulty;
  points: number;
  timeLimit: string;
  memoryLimit: string;
  tags: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
  solutionCode: string;
  solutionExplanation: string;
  solutionLanguage: 'cpp' | 'python' | 'java';
}

const DEFAULT_PROBLEM_DRAFT: ProblemDraft = {
  title: '',
  difficulty: 'Medium',
  points: 250,
  timeLimit: '1.0s',
  memoryLimit: '256MB',
  tags: 'Arrays, Dynamic Programming',
  description: '',
  inputFormat: 'First line contains integer N.',
  outputFormat: 'Print the computed answer.',
  constraints: '1 <= N <= 10^5',
  sampleInput: '4\n1 2 3 4',
  sampleOutput: '10',
  explanation: 'Sum of the array is 10.',
  solutionCode: '',
  solutionExplanation: '',
  solutionLanguage: 'cpp',
};

export function CreateIcpcContestModal({
  isOpen,
  onClose,
  onCreated,
  organizerName = 'Faculty Mentor',
  collegeName = 'Collegiate Network',
}: CreateIcpcContestModalProps) {
  const { user, profile } = useAuth();
  const [contestType, setContestType] = useState<ContestType>('contest');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [visibility, setVisibility] = useState<'public' | 'passcode'>('public');
  const [passcode, setPasscode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [rulesText, setRulesText] = useState(
    '1. Standard LeetCode / ICPC time limits apply.\n2. Submissions evaluated against hidden testbench.\n3. Verified college proof badge awarded.'
  );

  const [problems, setProblems] = useState<ProblemDraft[]>([
    {
      title: 'Optimal Two-Pointer Interval Merge',
      difficulty: 'Easy',
      points: 100,
      timeLimit: '1.0s',
      memoryLimit: '256MB',
      tags: 'Two Pointers, Greedy',
      description: 'Given N intervals, merge all overlapping intervals and return the minimum contiguous segments.',
      inputFormat: 'First line: N. Following N lines contain interval [start, end].',
      outputFormat: 'Merged interval list length.',
      constraints: '1 <= N <= 10^5, 0 <= start <= end <= 10^9',
      sampleInput: '4\n1 3\n2 6\n8 10\n15 18',
      sampleOutput: '3',
      explanation: 'Intervals [1,3] and [2,6] merge into [1,6].',
      solutionCode: `#include <vector>
#include <algorithm>
using namespace std;

// Sort by start interval and merge linearly in O(N log N)
int mergeIntervalsCount(vector<pair<int, int>>& intervals) {
    if (intervals.empty()) return 0;
    sort(intervals.begin(), intervals.end());
    int count = 1;
    int curEnd = intervals[0].second;
    for (size_t i = 1; i < intervals.size(); ++i) {
        if (intervals[i].first <= curEnd) {
            curEnd = max(curEnd, intervals[i].second);
        } else {
            count++;
            curEnd = intervals[i].second;
        }
    }
    return count;
}`,
      solutionExplanation: 'Sort all intervals by their start coordinate in O(N log N). Iterate through and maintain the current interval horizon. Whenever an interval begins after current horizon, emit a new disjoint segment. Time Complexity: O(N log N), Space: O(1).',
      solutionLanguage: 'cpp',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCopyInviteLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://linkora-link.online';
    const code = passcode.trim() || 'ICPC2026';
    const url = `${origin}/icpc?passcode=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleAddProblem = () => {
    setProblems((prev) => [
      ...prev,
      {
        ...DEFAULT_PROBLEM_DRAFT,
        title: `Problem ${String.fromCharCode(65 + prev.length)}`,
      },
    ]);
  };

  const handleRemoveProblem = (idx: number) => {
    if (problems.length <= 1) return;
    setProblems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProblemChange = (idx: number, field: keyof ProblemDraft, value: any) => {
    setProblems((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a contest title.');
      return;
    }

    if (problems.some((p) => !p.title.trim() || !p.description.trim())) {
      setErrorMsg('All problems must have a title and problem statement.');
      return;
    }

    setIsSubmitting(true);

    try {
      const rules = rulesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      const formattedProblems = problems.map((p) => ({
        title: p.title.trim(),
        difficulty: p.difficulty,
        points: Number(p.points) || 100,
        timeLimit: p.timeLimit,
        memoryLimit: p.memoryLimit,
        tags: p.tags.split(',').map((t) => t.trim()).filter(Boolean),
        description: p.description.trim(),
        inputFormat: p.inputFormat.trim(),
        outputFormat: p.outputFormat.trim(),
        constraints: p.constraints.trim(),
        sampleInput: p.sampleInput.trim(),
        sampleOutput: p.sampleOutput.trim(),
        explanation: p.explanation.trim() || undefined,
        solutionCode: p.solutionCode.trim() || undefined,
        solutionExplanation: p.solutionExplanation.trim() || undefined,
        solutionLanguage: p.solutionLanguage || 'cpp',
      }));

      let token: string | null = null;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        token = sessionData?.session?.access_token || null;
      } catch (e) {}

      const reqHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
      if (user?.id) reqHeaders['x-user-id'] = user.id;

      const res = await fetch('/api/icpc', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          title,
          subtitle,
          contestType,
          durationMinutes,
          visibility,
          passcode: visibility === 'passcode' ? passcode : undefined,
          rules,
          problems: formattedProblems,
          organizer: organizerName || profile?.display_name || user?.user_metadata?.display_name || 'Verified Faculty Mentor',
          college: collegeName || (profile as any)?.college || 'Partner Collegiate Network',
          creatorId: user?.id,
          userRole: profile?.role,
          facultyVerified: profile?.faculty_verified || Boolean(profile?.college) || profile?.role === 'teacher' || profile?.role === 'admin',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          contestType === 'practice'
            ? '🎉 Practice Problem Round published to Practice & Past!'
            : '🎉 Live ICPC Contest published live for students!'
        );
        if (onCreated && data.contest) {
          onCreated(data.contest);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Failed to upload contest.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error uploading contest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload ICPC Contest / Practice Round" maxWidth="3xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {/* Banner Intro */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 border border-cyan-500/30 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Faculty ICPC Algorithmic Desk
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Design and upload competitive programming contests and practice problem sets. Upload official solutions and algorithmic editorials that reveal automatically after the contest timeline ends.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Contest Category / Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select Destination & Mode *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setContestType('contest')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                contestType === 'contest'
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm'
                  : 'bg-slate-50 dark:bg-charcoal-800/60 border-slate-200 dark:border-charcoal-700 hover:border-slate-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                  contestType === 'contest' ? 'border-cyan-400 bg-cyan-500' : 'border-slate-400'
                }`}
              >
                {contestType === 'contest' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Live ICPC Contest</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live / Upcoming
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Timed competition with live leaderboard. Solutions remain <strong>strictly locked</strong> until the contest timer expires.
                </p>
              </div>
            </div>

            <div
              onClick={() => setContestType('practice')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                contestType === 'practice'
                  ? 'bg-indigo-500/15 border-indigo-500/50 shadow-sm'
                  : 'bg-slate-50 dark:bg-charcoal-800/60 border-slate-200 dark:border-charcoal-700 hover:border-slate-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                  contestType === 'practice' ? 'border-indigo-400 bg-indigo-500' : 'border-slate-400'
                }`}
              >
                {contestType === 'practice' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Practice Round</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Practice & Past
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Self-paced problem set for interview prep. Official solutions and editorials are readily accessible to learners.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contest Metadata */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Contest Overview
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                {contestType === 'practice' ? 'Practice Set Title *' : 'Contest Title *'}
              </label>
              <Input
                placeholder={contestType === 'practice' ? 'e.g., Dynamic Programming Masterclass' : 'e.g., ICPC Regional Speedrun #4'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Subtitle / Theme
              </label>
              <Input
                placeholder="e.g., Algorithmic Sprint • Speed & Precision"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Duration (Minutes)
              </label>
              <Input
                type="number"
                min={30}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Access Visibility
              </label>
              <Select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                options={[
                  { value: 'public', label: 'Public (All Campus Students - No Link Needed)' },
                  { value: 'passcode', label: 'Private (Classroom Passcode & Link)' },
                ]}
              />
            </div>
            {visibility === 'passcode' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Classroom Passcode
                </label>
                <Input
                  placeholder="e.g., ICPC2026"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* If Private Contest: Show Direct Room Link with 1-Click Copy */}
          {visibility === 'passcode' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Private Classroom Room Link
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyInviteLink}
                  leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                  className="h-7 text-xs font-mono border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                >
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </Button>
              </div>
              <p className="text-[11px] font-mono text-slate-300 truncate bg-charcoal-900/60 p-2 rounded-xl border border-charcoal-700/50">
                {typeof window !== 'undefined' ? `${window.location.origin}/icpc?passcode=${encodeURIComponent(passcode.trim() || 'ICPC2026')}` : '/icpc?passcode=...'}
              </p>
              <p className="text-[10px] text-amber-400/80">
                Only students with this link or passcode will be able to enter and solve this contest.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
              Contest Rules & Instructions (One per line)
            </label>
            <Textarea
              rows={3}
              value={rulesText}
              onChange={(e) => setRulesText(e.target.value)}
            />
          </div>
        </div>

        {/* LeetCode-style Problem Builder */}
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Problems (LeetCode Style) • {problems.length} Problem{problems.length > 1 ? 's' : ''}
              </h4>
              <p className="text-[11px] text-slate-400">
                Define statements, constraints, testcases, and faculty official solutions.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddProblem}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-cyan-500 border-cyan-500/40 hover:bg-cyan-500/10"
            >
              Add Problem
            </Button>
          </div>

          <div className="space-y-4">
            {problems.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-3 relative"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-mono font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Problem {idx + 1}
                    </span>
                  </div>
                  {problems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProblem(idx)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Remove Problem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Problem Title *
                    </label>
                    <Input
                      placeholder="e.g., Matrix Path Minimum Energy"
                      value={p.title}
                      onChange={(e) => handleProblemChange(idx, 'title', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Difficulty & Points
                    </label>
                    <div className="flex gap-2">
                      <Select
                        value={p.difficulty}
                        onChange={(e) => handleProblemChange(idx, 'difficulty', e.target.value)}
                        options={[
                          { value: 'Easy', label: 'Easy (100 pts)' },
                          { value: 'Medium', label: 'Medium (250 pts)' },
                          { value: 'Hard', label: 'Hard (500 pts)' },
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Time Limit
                    </label>
                    <Input
                      placeholder="1.0s"
                      value={p.timeLimit}
                      onChange={(e) => handleProblemChange(idx, 'timeLimit', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Memory Limit
                    </label>
                    <Input
                      placeholder="256MB"
                      value={p.memoryLimit}
                      onChange={(e) => handleProblemChange(idx, 'memoryLimit', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Algorithm Tags
                    </label>
                    <Input
                      placeholder="e.g. DP, Graphs, Binary Search"
                      value={p.tags}
                      onChange={(e) => handleProblemChange(idx, 'tags', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Problem Statement (Markdown supported) *
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Describe the task, algorithms involved, and goal..."
                    value={p.description}
                    onChange={(e) => handleProblemChange(idx, 'description', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Input Format
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. First line contains N..."
                      value={p.inputFormat}
                      onChange={(e) => handleProblemChange(idx, 'inputFormat', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Output Format
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Print single integer..."
                      value={p.outputFormat}
                      onChange={(e) => handleProblemChange(idx, 'outputFormat', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Constraints
                  </label>
                  <Input
                    placeholder="e.g. 1 <= N <= 10^5, -10^9 <= A[i] <= 10^9"
                    value={p.constraints}
                    onChange={(e) => handleProblemChange(idx, 'constraints', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 font-sans">
                      Sample Input *
                    </label>
                    <Textarea
                      rows={2}
                      className="font-mono text-xs"
                      value={p.sampleInput}
                      onChange={(e) => handleProblemChange(idx, 'sampleInput', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 font-sans">
                      Sample Output *
                    </label>
                    <Textarea
                      rows={2}
                      className="font-mono text-xs"
                      value={p.sampleOutput}
                      onChange={(e) => handleProblemChange(idx, 'sampleOutput', e.target.value)}
                    />
                  </div>
                </div>

                {/* Faculty Solution & Editorial Section */}
                <div className="p-3.5 rounded-2xl bg-cyan-500/5 dark:bg-charcoal-900 border border-cyan-500/20 space-y-3 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        💡 Official Faculty Solution & Editorial
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      {contestType === 'practice' ? 'Unlocked immediately in Practice' : 'Unlocks automatically after contest'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 font-sans">
                        Solution Language
                      </label>
                      <Select
                        value={p.solutionLanguage}
                        onChange={(e) => handleProblemChange(idx, 'solutionLanguage', e.target.value)}
                        options={[
                          { value: 'cpp', label: 'C++ (Fast I/O)' },
                          { value: 'python', label: 'Python 3' },
                          { value: 'java', label: 'Java' },
                        ]}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 font-sans">
                        Editorial Explanation / Algorithmic Approach
                      </label>
                      <Input
                        placeholder="e.g. Optimal O(N log N) interval sweep with prefix min..."
                        value={p.solutionExplanation}
                        onChange={(e) => handleProblemChange(idx, 'solutionExplanation', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1 font-sans">
                      Optimal Reference Code (Teacher's Solution)
                    </label>
                    <Textarea
                      rows={5}
                      className="font-mono text-xs text-cyan-300 bg-charcoal-950"
                      placeholder={`// Provide the official reference code in ${p.solutionLanguage.toUpperCase()}...\n// This solution is displayed to students after the contest ends.`}
                      value={p.solutionCode}
                      onChange={(e) => handleProblemChange(idx, 'solutionCode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-charcoal-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4 text-cyan-300" />}
            className="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold"
          >
            {contestType === 'practice' ? 'Publish Practice Round' : 'Publish Live ICPC Contest'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
