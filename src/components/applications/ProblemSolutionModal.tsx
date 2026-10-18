'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  X,
  FileCode2,
  Sparkles,
  Github,
  Globe,
  Video,
  AlertCircle,
  CheckCircle2,
  Layers,
  Send,
  Users,
} from 'lucide-react';
import { Project } from '@/types/database';

interface ProblemSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle: string;
  myProjects?: Project[];
  onSuccess?: () => void;
}

export function ProblemSolutionModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  myProjects = [],
  onSuccess,
}: ProblemSolutionModalProps) {
  const { user, profile } = useAuth();

  const [teamName, setTeamName] = useState('');
  const [title, setTitle] = useState('');
  const [solutionWriteup, setSolutionWriteup] = useState(
    `### Detailed Overview Solution\n\n1. Solution Architecture & Approach:\nExplain your core methodology and engineering decisions.\n\n2. Implementation Details:\nDescribe libraries, tools, pipelines, or models built.\n\n3. Key Deliverables & Results:\nDetail outcomes, performance benchmarks, and how faculty requirements are met.`
  );
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    myProjects.length > 0 ? myProjects[0].id : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to apply the answer.');
      return;
    }

    if (!teamName.trim()) {
      setError('Please provide a team name.');
      return;
    }

    const resolvedTitle = title.trim() || `${teamName.trim()} - Solution for ${problemTitle}`;

    if (!solutionWriteup.trim() || solutionWriteup.trim().length < 20) {
      setError('Please provide a detailed overview solution (at least 20 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/problems/solutions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          problem_id: problemId,
          problem_title: problemTitle,
          project_id: selectedProjectId || null,
          author_id: user.id,
          team_name: teamName.trim(),
          title: resolvedTitle,
          solution_writeup: solutionWriteup.trim(),
          repo_url: repoUrl.trim() || null,
          demo_url: demoUrl.trim() || null,
          video_url: videoUrl.trim() || null,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData?.error || 'Failed to submit problem answer.');
      }

      // Mark applied state locally for instant UI feedback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`tf_user_applied_${problemId}_${user.id}`, 'true');
        localStorage.setItem(
          `linkora_applied_solution_${problemId}_${user.id}`,
          JSON.stringify({
            teamName: teamName.trim(),
            title: resolvedTitle,
            submittedAt: new Date().toISOString(),
          })
        );
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting solution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-left space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-charcoal-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Deliverable Submission</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Apply the Answer</h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
              Challenge: <strong className="text-emerald-300">{problemTitle}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-white">Answer Applied Successfully!</h3>
            <p className="text-xs text-slate-200 max-w-md mx-auto leading-relaxed">
              Your team (<strong className="text-emerald-300">{teamName}</strong>) has directly applied the answer.
              The supervising faculty member can now review your overview, source code, and live demo.
            </p>
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6"
                onClick={() => {
                  onClose();
                  setIsSuccess(false);
                }}
              >
                Done / View Deliverables
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Team Name: placeholder _-------- */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                <span>Team Name</span>
                <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="_--------"
                required
                className="bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500 font-mono text-sm"
              />
            </div>

            {/* Solution Deliverable Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Solution Deliverable Title <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Telemetry Pipeline & Mobile Prototype"
                className="bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500"
              />
            </div>

            {/* Detailed overview solution */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Detailed Overview Solution</span>
                <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={solutionWriteup}
                onChange={(e) => setSolutionWriteup(e.target.value)}
                rows={6}
                required
                className="font-mono text-xs bg-charcoal-850 border-charcoal-700 text-slate-100 placeholder-slate-400 leading-relaxed"
                placeholder="Provide a comprehensive technical breakdown of your team's solution, architecture, algorithms used, and how it directly solves this faculty challenge..."
              />
              <span className="text-[11px] text-slate-400 block font-medium">
                Markdown supported. Outline the solution breakdown, architecture, and results achieved.
              </span>
            </div>

            {/* GitHub Link & Live Demo Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-300" />
                  <span>GitHub Link</span>
                </label>
                <Input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/team/solution-repo"
                  className="bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Demo Link</span>
                </label>
                <Input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://our-solution.vercel.app"
                  className="bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500 text-xs"
                />
              </div>
            </div>

            {/* Video Demo Option */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-pink-400" />
                <span>Video Demo Option (Loom / YouTube / Drive link)</span>
              </label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://loom.com/share/... or YouTube video link"
                className="bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500 text-xs"
              />
            </div>

            {/* Optional Attach Workspace */}
            {myProjects.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Link Existing Workspace Project (Optional)</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Standalone answer --</option>
                  {myProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.current_team_size}/{p.desired_team_size} members)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-charcoal-800">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5"
              >
                Apply the Answer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
