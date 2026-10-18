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
} from 'lucide-react';
import { IcpcContest, IcpcProblem, ProblemDifficulty } from '@/types/icpc';

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
};

export function CreateIcpcContestModal({
  isOpen,
  onClose,
  onCreated,
  organizerName = 'Faculty Mentor',
  collegeName = 'Collegiate Network',
}: CreateIcpcContestModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [visibility, setVisibility] = useState<'public' | 'passcode'>('public');
  const [passcode, setPasscode] = useState('');
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
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
      }));

      const res = await fetch('/api/icpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          durationMinutes,
          visibility,
          passcode,
          rules,
          problems: formattedProblems,
          organizer: organizerName,
          college: collegeName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('🎉 ICPC Contest published live for students!');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Upload ICPC Contest (LeetCode-Style)" maxWidth="3xl">
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
              Design and upload competitive programming contests for students. Add LeetCode-style problem descriptions, time & memory limits, and sample testcases.
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

        {/* Contest Metadata */}
        <div className="space-y-4">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Contest Overview
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Contest Title *
              </label>
              <Input
                placeholder="e.g., ICPC Regional Speedrun #4"
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
                  { value: 'public', label: 'Public (All Campus Students)' },
                  { value: 'passcode', label: 'Passcode Protected (Classroom Only)' },
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
                Define statements, constraints, and testcases for students to solve.
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
            Publish ICPC Contest Live
          </Button>
        </div>
      </form>
    </Modal>
  );
}
