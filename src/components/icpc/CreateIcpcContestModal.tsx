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
  GraduationCap,
} from 'lucide-react';
import { IcpcContest, IcpcProblem, ProblemDifficulty, ContestType, ContestCategory } from '@/types/icpc';
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
  const [category, setCategory] = useState<ContestCategory>('placement');
  const [companyTag, setCompanyTag] = useState('Amazon');
  const [customCompanyInput, setCustomCompanyInput] = useState('');
  const [targetCollege, setTargetCollege] = useState(collegeName || (profile as any)?.college || '');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(90);

  // Authoritative Date + Time scheduling helpers for live ICPC contests
  function createLocalDate(dateStr: string, hour12Str: string, minStr: string, period: 'AM' | 'PM'): Date {
    const parts = (dateStr || '').split('-').map(Number);
    const year = parts[0] || new Date().getFullYear();
    const month = (parts[1] || 1) - 1;
    const day = parts[2] || new Date().getDate();
    let h = parseInt(hour12Str, 10) || 12;
    const m = parseInt(minStr, 10) || 0;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return new Date(year, month, day, h, m, 0, 0);
  }

  function getFieldDefaults(offsetMinutes: number) {
    const d = new Date(Date.now() + offsetMinutes * 60000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    let h = d.getHours();
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    const hourStr = String(h).padStart(2, '0');
    const rawM = d.getMinutes();
    const roundedM = Math.round(rawM / 5) * 5 % 60;
    const minStr = String(roundedM).padStart(2, '0');
    return { dateStr, hourStr, minStr, period };
  }

  const [startDate, setStartDate] = useState(() => getFieldDefaults(15).dateStr);
  const [startHour, setStartHour] = useState(() => getFieldDefaults(15).hourStr);
  const [startMinute, setStartMinute] = useState(() => getFieldDefaults(15).minStr);
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>(() => getFieldDefaults(15).period);

  const [endDate, setEndDate] = useState(() => getFieldDefaults(135).dateStr);
  const [endHour, setEndHour] = useState(() => getFieldDefaults(135).hourStr);
  const [endMinute, setEndMinute] = useState(() => getFieldDefaults(135).minStr);
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(() => getFieldDefaults(135).period);

  const startObj = createLocalDate(startDate, startHour, startMinute, startPeriod);
  const endObj = createLocalDate(endDate, endHour, endMinute, endPeriod);

  const calculatedDuration = (() => {
    try {
      const s = startObj.getTime();
      const e = endObj.getTime();
      if (!isNaN(s) && !isNaN(e) && e > s) {
        return Math.max(15, Math.round((e - s) / 60000));
      }
    } catch (e) {}
    return durationMinutes || 90;
  })();

  const handleApplyQuickDuration = (minutes: number) => {
    const sDate = createLocalDate(startDate, startHour, startMinute, startPeriod);
    const newEnd = new Date(sDate.getTime() + minutes * 60000);
    const year = newEnd.getFullYear();
    const month = String(newEnd.getMonth() + 1).padStart(2, '0');
    const day = String(newEnd.getDate()).padStart(2, '0');
    setEndDate(`${year}-${month}-${day}`);
    let h = newEnd.getHours();
    const p: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    setEndHour(String(h).padStart(2, '0'));
    setEndMinute(String(newEnd.getMinutes()).padStart(2, '0'));
    setEndPeriod(p);
  };

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
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kollabrix.in';
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

    if (category === 'faculty' && !targetCollege.trim()) {
      setErrorMsg('Please specify the College Name for this Faculty Private Lab so only students from that college can enter.');
      return;
    }

    if (contestType === 'contest') {
      const sEpoch = startObj.getTime();
      const eEpoch = endObj.getTime();
      if (isNaN(sEpoch) || isNaN(eEpoch) || eEpoch <= sEpoch) {
        setErrorMsg('Please enter valid Live Contest Start and End times (End must be after Start).');
        return;
      }
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

      const finalCompany = category === 'placement' ? (customCompanyInput.trim() || companyTag || 'Company') : undefined;
      const finalCollege = (category === 'faculty' ? targetCollege.trim() : (targetCollege.trim() || collegeName || (profile as any)?.college)) || 'Partner Collegiate Network';

      const res = await fetch('/api/icpc', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          title,
          subtitle,
          contestType,
          category,
          companyTag: finalCompany,
          durationMinutes: calculatedDuration,
          startTime: contestType === 'contest' ? startObj.toISOString() : new Date().toISOString(),
          endTime: contestType === 'contest' ? endObj.toISOString() : new Date().toISOString(),
          visibility,
          passcode: visibility === 'passcode' ? passcode : undefined,
          rules,
          problems: formattedProblems,
          organizer: organizerName || profile?.display_name || user?.user_metadata?.display_name || 'Verified Faculty Mentor',
          college: finalCollege,
          creatorId: user?.id,
          userRole: profile?.role,
          facultyVerified: profile?.faculty_verified || Boolean(profile?.college) || profile?.role === 'teacher',
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
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Arena Category & Target Track *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => {
                  setCategory('placement');
                  setVisibility('public');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                  category === 'placement'
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-charcoal-800/60 border-slate-200 dark:border-charcoal-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <span>🏢 Placement OA Practice</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Amazon, TCS, Infosys hiring round simulations.</p>
              </div>

              <div
                onClick={() => {
                  setCategory('faculty');
                  setVisibility('passcode');
                  if (!passcode) setPasscode('LAB2026');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                  category === 'faculty'
                    ? 'bg-violet-500/15 border-violet-500/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-charcoal-800/60 border-slate-200 dark:border-charcoal-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <span>🎓 Faculty Private Lab</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Classroom assessment with passcode & anti-cheat.</p>
              </div>

              <div
                onClick={() => {
                  setCategory('icpc');
                  setVisibility('public');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                  category === 'icpc'
                    ? 'bg-cyan-500/15 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-charcoal-800/60 border-slate-200 dark:border-charcoal-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <span>⚡ ICPC & Collegiate</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Official algorithmic speedrun championship.</p>
              </div>
            </div>

            {category === 'placement' && (
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Company Target Brand
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Amazon', 'TCS', 'Infosys', 'Google', 'Microsoft', 'Cognizant', 'Flipkart'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCompanyTag(c);
                        setCustomCompanyInput('');
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        companyTag === c && !customCompanyInput
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">Or other company:</span>
                  <input
                    type="text"
                    value={customCompanyInput}
                    onChange={(e) => {
                      setCustomCompanyInput(e.target.value);
                      if (e.target.value) setCompanyTag(e.target.value);
                    }}
                    placeholder="e.g. Atlassian, Adobe, Oracle, Accenture..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono transition-colors"
                  />
                </div>
              </div>
            )}

            {category === 'faculty' && (
              <div className="pt-2 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
                  <label className="text-xs font-bold text-purple-200">
                    Target College / Institution (Only students of this College can enter) *
                  </label>
                </div>
                <Input
                  placeholder="e.g., Apex Institute of Technology, VIT, SRM, DTU..."
                  value={targetCollege}
                  onChange={(e) => setTargetCollege(e.target.value)}
                  required
                />
                <p className="text-[11px] text-purple-300/80 leading-relaxed font-mono">
                  🔒 Campus-Gated Private Arena: Only students registered under this exact college name will see and be permitted to enter this private lab test.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Mode *
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

          {/* Live Contest Date + Time Window (Only for Live ICPC Contests) */}
          {contestType === 'contest' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Live Contest Schedule (Start Date &amp; Time → End Date &amp; Time) *
                  </h5>
                </div>
                {/* Quick Duration Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-400">Quick Duration:</span>
                  {[
                    { label: '+1h', mins: 60 },
                    { label: '+1.5h', mins: 90 },
                    { label: '+2h', mins: 120 },
                    { label: '+3h', mins: 180 },
                  ].map((btn) => (
                    <button
                      key={btn.mins}
                      type="button"
                      onClick={() => handleApplyQuickDuration(btn.mins)}
                      className="px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 transition-colors cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date & Time */}
                <div className="p-3 rounded-xl bg-charcoal-900/90 border border-charcoal-750 space-y-2.5">
                  <label className="block text-xs font-bold text-cyan-300">
                    🟢 Live From (Start Date &amp; Time) *
                  </label>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Select Date:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Set Exact Time:</span>
                      <div className="flex items-center gap-1.5">
                        {/* Hour */}
                        <select
                          value={startHour}
                          onChange={(e) => setStartHour(e.target.value)}
                          className="flex-1 px-2.5 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                        <span className="text-white font-bold font-mono">:</span>
                        {/* Minute */}
                        <select
                          value={startMinute}
                          onChange={(e) => setStartMinute(e.target.value)}
                          className="flex-1 px-2.5 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        {/* AM/PM Toggle */}
                        <div className="flex rounded-xl bg-charcoal-950 border border-charcoal-700 p-0.5 select-none">
                          <button
                            type="button"
                            onClick={() => setStartPeriod('AM')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                              startPeriod === 'AM'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setStartPeriod('PM')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                              startPeriod === 'PM'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="p-3 rounded-xl bg-charcoal-900/90 border border-charcoal-750 space-y-2.5">
                  <label className="block text-xs font-bold text-amber-300">
                    🏁 Live Until (End Date &amp; Time) *
                  </label>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Select Date:</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block mb-1">Set Exact Time:</span>
                      <div className="flex items-center gap-1.5">
                        {/* Hour */}
                        <select
                          value={endHour}
                          onChange={(e) => setEndHour(e.target.value)}
                          className="flex-1 px-2.5 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                        <span className="text-white font-bold font-mono">:</span>
                        {/* Minute */}
                        <select
                          value={endMinute}
                          onChange={(e) => setEndMinute(e.target.value)}
                          className="flex-1 px-2.5 py-2 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs text-white font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        {/* AM/PM Toggle */}
                        <div className="flex rounded-xl bg-charcoal-950 border border-charcoal-700 p-0.5 select-none">
                          <button
                            type="button"
                            onClick={() => setEndPeriod('AM')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                              endPeriod === 'AM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => setEndPeriod('PM')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                              endPeriod === 'PM'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status summary banner */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-cyan-500/20 flex-wrap gap-2">
                <span>
                  ⏱️ Calculated Contest Duration: <strong className="text-cyan-300">{calculatedDuration} minutes</strong>
                </span>
                <span className="text-cyan-400/90 font-bold">
                  {startObj.getTime() > Date.now()
                    ? '🕒 Will appear as Upcoming'
                    : endObj.getTime() < Date.now()
                    ? '🏁 Will appear as Ended'
                    : '🟢 Will appear Live Now'}
                </span>
              </div>
            </div>
          )}

          {/* Access Visibility and Classroom Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
