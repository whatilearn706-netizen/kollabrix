'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Profile, Project } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import { UserPlus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

interface InviteTeammateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Profile | null;
  matchScore?: number;
  initialProjectId?: string;
  onSuccess?: () => void;
}

export function InviteTeammateModal({
  isOpen,
  onClose,
  candidate,
  matchScore,
  initialProjectId,
  onSuccess,
}: InviteTeammateModalProps) {
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [proposedRole, setProposedRole] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  useEffect(() => {
    async function loadUserProjects() {
      if (!user || !isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .in('status', ['Recruiting', 'In Progress'])
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          setUserProjects(data);
          if (!selectedProjectId) {
            setSelectedProjectId(data[0].id);
          }
        }
      } catch (e) {
        console.warn('Error loading owned projects:', e);
      }
    }

    if (isOpen) {
      loadUserProjects();
      setSuccess(false);
      setError(null);
    }
  }, [isOpen, user, selectedProjectId]);

  // Update proposed role default when project changes
  useEffect(() => {
    const proj = userProjects.find((p) => p.id === selectedProjectId);
    if (proj && proj.desired_roles && proj.desired_roles.length > 0) {
      setProposedRole(proj.desired_roles[0]);
    } else if (candidate?.preferred_roles && candidate.preferred_roles.length > 0) {
      setProposedRole(candidate.preferred_roles[0]);
    } else {
      setProposedRole('Contributor');
    }
  }, [selectedProjectId, userProjects, candidate]);

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to invite a teammate.');
      return;
    }

    if (!selectedProjectId) {
      setError('Please select a project to invite this teammate to.');
      return;
    }

    if (!proposedRole.trim()) {
      setError('Please specify a proposed role.');
      return;
    }

    if (candidate.is_suspended || candidate.status === 'suspended') {
      setError('Cannot invite this user because their account is currently suspended.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured()) {
        // 1. Insert into project_invitations
        const { error: inviteError } = await supabase
          .from('project_invitations')
          .insert({
            project_id: selectedProjectId,
            inviter_id: user.id,
            invitee_id: candidate.user_id,
            proposed_role: proposedRole.trim(),
            message: message.trim() || null,
            match_score: matchScore || null,
            status: 'Pending',
          });

        if (inviteError) {
          // If already invited, provide helpful message
          if (inviteError.code === '23505') {
            throw new Error('An invitation has already been sent to this student for this project.');
          }

          // If the table is missing from schema cache, fall back gracefully
          const isTableMissing =
            inviteError.code === '42P01' ||
            inviteError.code === 'PGRST205' ||
            inviteError.message?.includes('project_invitations') ||
            inviteError.message?.includes('schema cache');

          if (isTableMissing) {
            console.warn('project_invitations table pending DB migration. Falling back to local storage & notification dispatch.');
            if (typeof window !== 'undefined') {
              try {
                const existing = JSON.parse(localStorage.getItem('teamforge_sent_invitations') || '[]');
                existing.push({
                  project_id: selectedProjectId,
                  inviter_id: user.id,
                  invitee_id: candidate.user_id,
                  created_at: new Date().toISOString(),
                });
                localStorage.setItem('teamforge_sent_invitations', JSON.stringify(existing));
              } catch {
                // ignore
              }
            }
          } else {
            throw new Error(inviteError.message);
          }
        }

        // 2. Insert notification for invitee
        const selectedProj = userProjects.find((p) => p.id === selectedProjectId);
        try {
          await supabase.from('notifications').insert({
            recipient_id: candidate.user_id,
            sender_id: user.id,
            type: 'application_received',
            title: 'Project Collaboration Invitation',
            message: `You were invited to join "${selectedProj?.title || 'a project'}" as a ${proposedRole.trim()}.`,
            link: `/projects/${selectedProjectId}`,
            is_read: false,
          });
        } catch {
          // Non-critical
        }
      } else {
        // Local storage fallback for unconfigured supabase
        if (typeof window !== 'undefined') {
          try {
            const existing = JSON.parse(localStorage.getItem('teamforge_sent_invitations') || '[]');
            existing.push({
              project_id: selectedProjectId,
              inviter_id: user.id,
              invitee_id: candidate.user_id,
              created_at: new Date().toISOString(),
            });
            localStorage.setItem('teamforge_sent_invitations', JSON.stringify(existing));
          } catch {
            // ignore
          }
        }
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Student to Project"
      description={`Invite ${candidate.display_name} to collaborate with your team.`}
      maxWidth="md"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Invitation Sent!</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {candidate.display_name} has received your invitation and will be notified in their Notification Center.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Candidate Profile Summary */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/80">
            <Avatar name={candidate.display_name} src={candidate.avatar_url} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white truncate">
                  {candidate.display_name}
                </span>
                {matchScore && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30 font-medium">
                    {matchScore}% Match
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate mt-0.5">
                {candidate.college ? (
                  <VerifiedCollegeBadge
                    college={candidate.college}
                    isVerified={candidate.college_verified}
                    size="xs"
                  />
                ) : (
                  candidate.course || `@${candidate.username}`
                )}
              </div>
            </div>
          </div>

          {/* Project Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Select Project <span className="text-red-400">*</span>
            </label>
            {userProjects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
              >
                {userProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-slate-400">
                You don&apos;t have any active projects yet. You can create a project first or invite peers once your project is published.
              </div>
            )}
          </div>

          {/* Proposed Role */}
          <Input
            label="Proposed Team Role"
            required
            placeholder="e.g. Frontend Developer, ML Researcher"
            value={proposedRole}
            onChange={(e) => setProposedRole(e.target.value)}
            helperText="The role you are inviting this student to fill."
          />

          {/* Personal Message */}
          <Textarea
            label="Invitation Note (Optional)"
            rows={3}
            placeholder="Hey! Saw your impressive skills in React and wanted to invite you to join our semester project..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              disabled={userProjects.length === 0}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
