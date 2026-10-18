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

  const [title, setTitle] = useState('');
  const [teamName, setTeamName] = useState(
    profile?.display_name ? `${profile.display_name}'s Team` : 'Collegiate Team'
  );
  const [solutionWriteup, setSolutionWriteup] = useState(
    `### Executive Summary\nBriefly explain your approach and how your project directly answers the faculty problem statement.\n\n### Architecture & Technology Stack\nWhat frameworks, libraries, APIs, or data models did your team build?\n\n### Key Deliverables & Results\nWhat milestones did you accomplish? Highlight any benchmarks, test results, or live features.`
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
      setError('You must be signed in to submit a problem solution.');
      return;
    }

    if (!title.trim() || title.trim().length < 5) {
      setError('Please provide a descriptive solution title (at least 5 characters).');
      return;
    }

    if (!solutionWriteup.trim() || solutionWriteup.trim().length < 25) {
      setError('Please provide a comprehensive solution write-up (at least 25 characters).');
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
          title: title.trim(),
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

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting solution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-750 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-left space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-charcoal-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project Deliverable &amp; Problem Answer</span>
            </div>
            <h2 className="text-xl font-bold text-white">Post Problem Solution</h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              Challenge: <strong className="text-slate-200">{problemTitle}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Problem Solution Submitted!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Your team&apos;s answer and project deliverables have been submitted to the supervising faculty mentor.
              The faculty member can now review your code, inspect your live demo, and leave feedback.
            </p>
            <div className="pt-4 flex justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  setIsSuccess(false);
                }}
              >
                Close &amp; View Submissions
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Solution Title & Team Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Solution / Project Title <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CampusRoute: Automated Telemetry Bus System"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. NextGen Builders"
                  required
                />
              </div>
            </div>

            {/* Link Existing Linkora Project (Optional) */}
            {myProjects.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Attach Linkora Project Workspace (Optional)</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- No linked workspace (standalone submission) --</option>
                  {myProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.current_team_size}/{p.desired_team_size} members)
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 block">
                  Links your workspace tasks, milestones, and commits directly to this answer.
                </span>
              </div>
            )}

            {/* Code Repository & Live Demo URLs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-400" />
                  <span>GitHub Repository URL</span>
                </label>
                <Input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/team/project-repo"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live Demo / App URL</span>
                </label>
                <Input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://my-app.vercel.app"
                />
              </div>
            </div>

            {/* Video / Pitch Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-pink-400" />
                <span>Video Demo / Loom Walkthrough URL (Optional)</span>
              </label>
              <Input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or Loom"
              />
            </div>

            {/* Solution Write-up ("Problem Answer") */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Technical Write-up &amp; Problem Answer <span className="text-red-400">*</span></span>
              </label>
              <Textarea
                value={solutionWriteup}
                onChange={(e) => setSolutionWriteup(e.target.value)}
                rows={6}
                required
                className="font-mono text-xs"
                placeholder="Explain the technical solution, algorithms used, and how it answers the faculty problem..."
              />
              <span className="text-[11px] text-slate-500 block">
                Markdown supported. Explain how your team answered each requirement of the faculty statement.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-charcoal-800">
              <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
                className="bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                Submit Problem Answer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
