'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Send, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { TeamRole } from '@/types/database';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  desiredRoles?: string[];
  onSuccess?: () => void;
}

const ALL_ROLES: TeamRole[] = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Researcher',
  'Contributor',
];

export function ApplyModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  desiredRoles = [],
  onSuccess,
}: ApplyModalProps) {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [proposedRole, setProposedRole] = useState<string>(
    desiredRoles.length > 0 ? desiredRoles[0] : 'Contributor'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const roleOptions = Array.from(
    new Set([...desiredRoles, ...ALL_ROLES])
  ).map((role) => ({
    value: role,
    label: desiredRoles.includes(role) ? `${role} (Requested by project)` : role,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to submit an application.');
      return;
    }

    if (message.trim().length < 10) {
      setError('Please provide at least 10 characters explaining your interest and skills.');
      return;
    }

    if (message.trim().length > 1000) {
      setError('Your application message cannot exceed 1000 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Double check for duplicate pending application
      const { data: existingApp, error: checkError } = await supabase
        .from('project_applications')
        .select('id, status')
        .eq('project_id', projectId)
        .eq('applicant_id', user.id)
        .eq('status', 'Pending')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        // Continue or report
      }

      if (existingApp) {
        setError('You already have a pending application for this project.');
        setIsSubmitting(false);
        return;
      }

      // 2. Insert new application
      const { error: insertError } = await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,
          applicant_id: user.id,
          application_message: message.trim(),
          proposed_role: proposedRole,
          status: 'Pending',
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You already have an active pending application for this project.');
        } else {
          setError(insertError.message || 'Failed to submit application. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Apply to Join Team</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Applying for <strong className="text-slate-200">{projectTitle}</strong>
          </p>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Application Submitted!</h3>
            <p className="text-xs text-slate-300">
              The project owner has been notified. You can track your status in My Applications.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Select
              label="Proposed Role"
              options={roleOptions}
              value={proposedRole}
              onChange={(e) => setProposedRole(e.target.value)}
              helperText="Select the role that best matches your skills and interests."
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Application Pitch & Relevant Skills <span className="text-red-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {message.length} / 1000
                </span>
              </div>
              <Textarea
                placeholder="Explain why you want to collaborate on this project, what relevant experience or coursework you have, and what you hope to build..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minimum 10 characters. Highlight coursework, past projects, or tools from your profile.
              </p>
            </div>

            {profile && profile.skills && profile.skills.length > 0 && (
              <div className="p-3 rounded-lg bg-charcoal-850/80 border border-charcoal-750 text-xs">
                <p className="text-slate-400 mb-1.5 font-medium">Your Profile Skills attached:</p>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
