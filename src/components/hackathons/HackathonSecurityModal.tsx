'use client';

import React, { useState } from 'react';
import { Hackathon } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  KeyRound,
  ShieldAlert,
  Copy,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Award,
} from 'lucide-react';

interface HackathonSecurityModalProps {
  hackathon: Hackathon | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedHackathon: Partial<Hackathon>) => void;
}

export function HackathonSecurityModal({
  hackathon,
  isOpen,
  onClose,
  onUpdated,
}: HackathonSecurityModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [isJoinActive, setIsJoinActive] = useState<boolean>(hackathon?.is_join_active ?? true);
  const [resultsPublished, setResultsPublished] = useState<boolean>(hackathon?.results_published ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state when hackathon changes
  React.useEffect(() => {
    if (hackathon) {
      setIsJoinActive(hackathon.is_join_active ?? true);
      setResultsPublished(hackathon.results_published ?? false);
      setNewPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [hackathon]);

  if (!isOpen || !hackathon) return null;

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/h/${hackathon.join_code}`
    : `/h/${hackathon.join_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword.length < 4) {
      setError('New password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/hackathons/rotate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: hackathon.id,
          newPassword: newPassword.trim() || undefined,
          isJoinActive,
          resultsPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update access settings.');
      }

      setSuccess('Access settings updated successfully.');
      onUpdated({
        is_join_active: isJoinActive,
        results_published: resultsPublished,
      });

      setNewPassword('');
      setTimeout(() => {
        setSuccess(null);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating access settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hackathon Access & Security Control"
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-5 py-2">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Shareable Link Box */}
        <div className="p-3 bg-charcoal-900 border border-charcoal-800 rounded-xl space-y-2">
          <label className="text-xs font-medium text-slate-400 block">
            Shareable Join Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="flex-1 bg-charcoal-950 border border-charcoal-750 text-brand-300 font-mono text-xs px-2.5 py-2 rounded-lg truncate"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              {copiedLink ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Join Code: <span className="font-mono text-slate-300 font-semibold">{hackathon.join_code}</span>
          </p>
        </div>

        {/* Rotate Password */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Rotate Access Passcode
          </label>
          <Input
            type="text"
            placeholder="Leave empty to keep current password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="font-mono text-xs tracking-wider"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Entering a new passcode will immediately update the secure salt and hash. Existing members retain their access.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="space-y-3 pt-2 border-t border-charcoal-800">
          <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/60 border border-charcoal-800">
            <div>
              <div className="text-xs font-semibold text-white">Student Join Gateway</div>
              <div className="text-[11px] text-slate-400">
                {isJoinActive ? 'Students can currently join with passcode' : 'Access closed to new entrants'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsJoinActive(!isJoinActive)}
              className="text-brand-400 hover:text-brand-300"
            >
              {isJoinActive ? (
                <ToggleRight className="w-8 h-8 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-500" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/60 border border-charcoal-800">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Publish Official Results
              </div>
              <div className="text-[11px] text-slate-400">
                {resultsPublished
                  ? 'Rankings and scores are visible to all students'
                  : 'Scores and rankings remain hidden/in review'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setResultsPublished(!resultsPublished)}
              className="text-brand-400 hover:text-brand-300"
            >
              {resultsPublished ? (
                <ToggleRight className="w-8 h-8 text-amber-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
