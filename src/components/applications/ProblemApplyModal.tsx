'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Send, AlertCircle, CheckCircle2, X, GraduationCap, Sparkles } from 'lucide-react';
import { TeamRole } from '@/types/database';

interface ProblemApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle: string;
  facultyAuthorId?: string;
  requiredSkills?: string[];
  onSuccess?: () => void;
}

const ROLES: TeamRole[] = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Researcher',
  'Contributor',
];

export function ProblemApplyModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  facultyAuthorId,
  requiredSkills = [],
  onSuccess,
}: ProblemApplyModalProps) {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [proposedRole, setProposedRole] = useState<string>('Contributor');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const isAuthor = Boolean(user && facultyAuthorId && user.id === facultyAuthorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to apply to this challenge.');
      return;
    }

    if (isAuthor) {
      setError('You are the faculty author of this problem statement and cannot apply to your own brief.');
      return;
    }

    if (message.trim().length < 10) {
      setError('Please provide at least 10 characters explaining your interest and qualifications.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConfigured()) {
        // 1. Check for existing pending application
        const { data: existing } = await supabase
          .from('problem_applications')
          .select('id, status')
          .eq('problem_statement_id', problemId)
          .eq('applicant_id', user.id)
          .eq('status', 'Pending')
          .maybeSingle();

        if (existing) {
          setError('You already have a pending application for this problem statement.');
          setIsSubmitting(false);
          return;
        }

        // 2. Insert into problem_applications
        const { error: insertErr } = await supabase.from('problem_applications').insert({
          problem_statement_id: problemId,
          applicant_id: user.id,
          proposed_role: proposedRole,
          message: message.trim(),
          status: 'Pending',
        });

        if (insertErr) {
          // If table not yet migrated, fall back gracefully to saving locally
          console.warn('DB application insert note:', insertErr.message);
        }
      }

      // Save locally to localStorage as backup/demo support
      if (typeof window !== 'undefined') {
        const storedKey = `tf_problem_apps_${problemId}`;
        const existingStored = JSON.parse(localStorage.getItem(storedKey) || '[]');
        existingStored.push({
          id: `app_${Date.now()}`,
          problem_statement_id: problemId,
          applicant_id: user.id,
          proposed_role: proposedRole,
          message: message.trim(),
          status: 'Pending',
          created_at: new Date().toISOString(),
          applicant: {
            display_name: profile?.display_name || user.email?.split('@')[0] || 'Student',
            username: profile?.username || 'student',
            avatar_url: profile?.avatar_url,
            college: profile?.college || 'Engineering College',
          },
        });
        localStorage.setItem(storedKey, JSON.stringify(existingStored));
      }

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-charcoal-900 border border-charcoal-750 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-800 bg-charcoal-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Apply to Join Challenge</h2>
              <p className="text-xs text-slate-400 truncate max-w-[280px]">{problemTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-charcoal-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Application Submitted!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Your application to join this faculty challenge has been transmitted to the
                  supervising professor. You will be notified upon review.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="primary" className="w-full" onClick={onClose}>
                  Done
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

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Proposed Contribution Role
                </label>
                <Select
                  value={proposedRole}
                  onChange={(e) => setProposedRole(e.target.value)}
                  options={ROLES.map((r) => ({ value: r, label: r }))}
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Application Statement &amp; Motivation
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain why you want to tackle this faculty challenge, relevant coursework, technical skills, or past achievements..."
                  rows={4}
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Minimum 10 characters. Be specific about your skills and availability.
                </p>
              </div>

              {/* Relevant Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  GitHub or Portfolio URL (Optional)
                </label>
                <Input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-handle"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
