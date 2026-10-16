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
import { Select } from '@/components/ui/Select';
import { FileUpload } from '@/components/ui/FileUpload';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Lock,
  Globe,
  Users,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface CreateHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (hackathon: Hackathon) => void;
}

export function CreateHackathonModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateHackathonModalProps) {
  const { user, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState(profile?.display_name ? `${profile.display_name} (Faculty)` : 'College Faculty / CS Dept');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [mode, setMode] = useState<HackathonMode>('Online');
  const [location, setLocation] = useState('');
  const [accessType, setAccessType] = useState<'private' | 'public'>('private');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [themesInput, setThemesInput] = useState('Web3, Generative AI, Campus Life, FinTech');
  const [rules, setRules] = useState('1. All code must be written during the hackathon.\n2. Projects must address one of the released problem statements.\n3. Plagiarism results in immediate disqualification.');
  const [contactInfo, setContactInfo] = useState('');
  const [prizePool, setPrizePool] = useState('Certificates & Mentorship');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdHackathon, setCreatedHackathon] = useState<Hackathon | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to create a hackathon.');
      return;
    }

    if (!title.trim() || !description.trim() || !startDate || !registrationDeadline || !submissionDeadline) {
      setError('Please fill in all required fields (Title, Description, Start Date, Registration & Submission Deadlines).');
      return;
    }

    if (accessType === 'private' && (!password || password.length < 4)) {
      setError('Private hackathons require an access password of at least 4 characters.');
      return;
    }

    if (minTeamSize < 1 || maxTeamSize < minTeamSize) {
      setError('Invalid team size configuration. Maximum team size must be greater than or equal to minimum.');
      return;
    }

    setIsLoading(true);

    try {
      const themes = themesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/hackathons/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          creatorId: user.id,
          title: title.trim(),
          organizer: organizer.trim(),
          description: description.trim(),
          mode,
          location: location.trim() || null,
          startDate,
          endDate: endDate || null,
          registrationDeadline,
          submissionDeadline,
          accessType,
          password: password.trim(),
          minTeamSize,
          maxTeamSize,
          themes,
          rules: rules.trim(),
          contactInfo: contactInfo.trim() || null,
          prizePool: prizePool.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
          bannerUrl: bannerUrl.trim() || null,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to create hackathon.');
      }

      // If the server simulated an ID, insert directly from authenticated client
      if (resData.hackathon?.id?.startsWith('hack-') && isSupabaseConfigured()) {
        try {
          const metaComment = `\n\n<!-- HACKATHON_META:${JSON.stringify({
            access_type: accessType,
            join_code: resData.joinCode,
            password_hash: resData.hackathon.password_hash,
            password_salt: resData.hackathon.password_salt,
            min_team_size: minTeamSize,
            max_team_size: maxTeamSize,
            banner_url: bannerUrl.trim() || null,
          })} -->`;

          const clientPayload = {
            creator_id: user.id,
            title: title.trim(),
            organizer: organizer.trim(),
            description: description.trim() + metaComment,
            mode,
            location: location.trim() || null,
            start_date: new Date(startDate).toISOString(),
            end_date: endDate ? new Date(endDate).toISOString() : null,
            registration_deadline: new Date(registrationDeadline).toISOString(),
            eligibility: 'Open to all college students',
            themes,
            prize_pool: prizePool.trim() || null,
            website_url: `https://linkora-edu.vercel.app/h/${resData.joinCode}`,
            banner_url: bannerUrl.trim() || null,
            is_verified: true,
          };

          const { data: clientData, error: clientErr } = await supabase
            .from('hackathons')
            .insert(clientPayload)
            .select('*')
            .single();

          if (!clientErr && clientData) {
            resData.hackathon = {
              ...resData.hackathon,
              id: clientData.id,
            };
          }
        } catch (e) {
          console.warn('Client direct fallback note in modal:', e);
        }
      }

      setCreatedHackathon(resData.hackathon);

      // Save to localStorage for immediate availability
      if (typeof window !== 'undefined' && resData.hackathon) {
        try {
          const existing = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const filtered = existing.filter((h: any) => h.id !== resData.hackathon.id && h.join_code !== resData.hackathon.join_code);
          localStorage.setItem('teamforge_created_hackathons', JSON.stringify([resData.hackathon, ...filtered]));
        } catch {
          // ignore
        }
      }

      onSuccess(resData.hackathon);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating hackathon.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdHackathon?.join_code) return;
    const url = `${window.location.origin}/h/${createdHackathon.join_code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) {
          setCreatedHackathon(null);
          onClose();
        }
      }}
      title={createdHackathon ? 'Hackathon Created Successfully!' : 'Create College Hackathon'}
      maxWidth="3xl"
    >
      {createdHackathon ? (
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-emerald-300">
                &quot;{createdHackathon.title}&quot; is ready!
              </h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Share this secure join link and passcode with your college students or class group.
              </p>
            </div>
          </div>

          <div className="p-4 bg-charcoal-900 border border-charcoal-800 rounded-xl space-y-3">
            <label className="text-xs font-medium text-slate-400 block">
              Shareable Student Join Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/h/${createdHackathon.join_code}`
                    : `/h/${createdHackathon.join_code}`
                }
                className="flex-1 bg-charcoal-950 border border-charcoal-750 text-brand-300 font-mono text-sm px-3 py-2 rounded-lg"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                leftIcon={<Copy className="w-4 h-4" />}
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>

            {createdHackathon.access_type === 'private' && password && (
              <div className="p-3 bg-charcoal-950/70 border border-charcoal-800 rounded-lg flex items-center justify-between text-xs mt-2">
                <span className="text-slate-400">Access Passcode:</span>
                <span className="font-mono font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  {password}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreatedHackathon(null);
                onClose();
              }}
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                window.location.href = `/hackathons/${createdHackathon.id}/workspace`;
              }}
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              Open Event Workspace
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Hackathon Name *
              </label>
              <Input
                placeholder="e.g. Apex 2026 Inter-College Hackathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Host / Department *
              </label>
              <Input
                placeholder="e.g. Dept of Computer Science & Engineering"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Event Overview & Purpose *
            </label>
            <Textarea
              placeholder="Describe the challenge scope, college objectives, and target participants..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Banner Upload */}
          <FileUpload
            label="Event Banner Image (Optional)"
            helperText="Drag & drop a banner image or click to browse (16:9 recommended)"
            value={bannerUrl}
            onChange={(url) => setBannerUrl(url)}
            options={{
              bucket: 'hackathon-banners',
              folder: `banners/${user?.id || 'public'}`,
            }}
          />

          {/* Access Security Settings */}
          <div className="p-4 bg-charcoal-900/80 border border-charcoal-750 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield className="w-4 h-4 text-brand-400" />
                <span>Access Security & Visibility</span>
              </div>
              <span className="text-[11px] text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full font-medium">
                Recommended for College
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setAccessType('private')}
                className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  accessType === 'private'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-charcoal-750 bg-charcoal-950/50 text-slate-400 hover:border-charcoal-600'
                }`}
              >
                <Lock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accessType === 'private' ? 'text-brand-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Private / Passcode Protected</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Only students with join link and password can view challenges and submit.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccessType('public')}
                className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  accessType === 'public'
                    ? 'border-brand-500 bg-brand-500/10 text-white'
                    : 'border-charcoal-750 bg-charcoal-950/50 text-slate-400 hover:border-charcoal-600'
                }`}
              >
                <Globe className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accessType === 'public' ? 'text-brand-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Open Public Hackathon</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Visible to all registered students without requiring a secret password.
                  </div>
                </div>
              </button>
            </div>

            {accessType === 'private' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  Access Passcode for College Students *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. CAMPUS-HACK-2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono tracking-wider"
                  required={accessType === 'private'}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Never stored as plaintext. Hashed with scrypt salt on the server.
                </p>
              </div>
            )}
          </div>

          {/* Mode & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Hackathon Mode
              </label>
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value as HackathonMode)}
                options={[
                  { value: 'Online', label: 'Online / Remote' },
                  { value: 'In-Person', label: 'In-Person (On Campus)' },
                  { value: 'Hybrid', label: 'Hybrid' },
                ]}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Campus Venue / Lab (if applicable)
              </label>
              <Input
                placeholder="e.g. Turing Lab, Building 4"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Registration Deadline *
              </label>
              <Input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Hackathon Starts *
              </label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Final Submission Deadline *
              </label>
              <Input
                type="datetime-local"
                value={submissionDeadline}
                onChange={(e) => setSubmissionDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Team Size Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Minimum Team Members
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                value={minTeamSize}
                onChange={(e) => setMinTeamSize(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Maximum Team Members
              </label>
              <Input
                type="number"
                min={minTeamSize}
                max={10}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(parseInt(e.target.value) || 4)}
              />
            </div>
          </div>

          {/* Themes / Tracks */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tracks / Categories (comma separated)
            </label>
            <Input
              placeholder="e.g. AI/ML, Web3, Smart Cities, HealthTech"
              value={themesInput}
              onChange={(e) => setThemesInput(e.target.value)}
            />
          </div>

          {/* Rules & Guidelines */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Event Rules & Submission Guidelines
            </label>
            <Textarea
              rows={3}
              placeholder="Eligibility criteria, code of conduct, original work policy..."
              value={rules}
              onChange={(e) => setRules(e.target.value)}
            />
          </div>

          {/* Prize pool & Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Prizes / Awards
              </label>
              <Input
                placeholder="e.g. ₹50,000 + Incubation Support"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Faculty Contact / Help Desk
              </label>
              <Input
                placeholder="e.g. mentor-support@college.edu"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
          </div>

          <div className="sticky -bottom-5 sm:-bottom-6 -mx-5 sm:-mx-6 p-4 sm:p-5 bg-charcoal-900/95 backdrop-blur-md border-t border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 shadow-elevated">
            <Link
              href="/hackathons/new"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Prefer full page view? Open Full Studio</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                leftIcon={<Trophy className="w-4 h-4" />}
              >
                Publish Hackathon
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
