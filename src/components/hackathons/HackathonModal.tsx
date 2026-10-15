'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Hackathon, HackathonMode } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2, Trophy, Calendar, Globe, Tag } from 'lucide-react';

interface HackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hackathon: Hackathon) => void;
}

export function HackathonModal({ isOpen, onClose, onSuccess }: HackathonModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<HackathonMode>('Online');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [eligibility, setEligibility] = useState('Open to all college students');
  const [themesInput, setThemesInput] = useState('Web, AI/ML, Open Innovation');
  const [prizePool, setPrizePool] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to submit a hackathon.');
      return;
    }

    if (!title.trim() || !organizer.trim() || !description.trim() || !registrationDeadline || !startDate || !websiteUrl) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    try {
      new URL(websiteUrl);
    } catch {
      setError('Please provide a valid website URL (e.g. https://hackathon.example.com)');
      return;
    }

    setIsLoading(true);

    try {
      const themes = themesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        organizer: organizer.trim(),
        description: description.trim(),
        mode,
        location: location.trim() || null,
        start_date: new Date(startDate).toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        registration_deadline: new Date(registrationDeadline).toISOString(),
        eligibility: eligibility.trim(),
        themes,
        prize_pool: prizePool.trim() || null,
        website_url: websiteUrl.trim(),
        creator_id: user.id,
        is_verified: true,
      };

      if (isSupabaseConfigured()) {
        const { data, error: insertError } = await supabase
          .from('hackathons')
          .insert(payload)
          .select('*')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        onSuccess(data as Hackathon);
      } else {
        // Fallback
        const mock: Hackathon = {
          ...payload,
          id: `hack-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSuccess(mock);
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish hackathon.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post Collegiate Hackathon"
      description="Add a verified collegiate hackathon or engineering challenge for student teams."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hackathon Name *"
            required
            placeholder="e.g. AI Innovation Summit 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Organizer / Host Institution *"
            required
            placeholder="e.g. ACM Student Chapter or Devfolio"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
        </div>

        <Textarea
          label="Event Overview & Problem Scope *"
          required
          rows={3}
          placeholder="Describe the hackathon objectives, format, evaluation criteria, and expected deliverables."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Event Mode *
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as HackathonMode)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Online">Online / Virtual</option>
              <option value="In-Person">In-Person (Campus)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <Input
            label="Location (City / Campus)"
            placeholder="e.g. Main Auditorium or Virtual"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Input
            label="Prize Pool"
            placeholder="e.g. ₹1,50,000 + Cloud Credits"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Registration Deadline *"
            type="datetime-local"
            required
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
          />

          <Input
            label="Start Date *"
            type="datetime-local"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="End Date"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Themes & Domains"
            placeholder="e.g. AI/ML, Web3, CleanTech, Open Innovation"
            value={themesInput}
            onChange={(e) => setThemesInput(e.target.value)}
            helperText="Comma-separated themes."
          />

          <Input
            label="Official Registration URL *"
            type="url"
            required
            placeholder="https://hackathon.example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            leftIcon={<Trophy className="w-4 h-4" />}
          >
            Publish Hackathon
          </Button>
        </div>
      </form>
    </Modal>
  );
}
