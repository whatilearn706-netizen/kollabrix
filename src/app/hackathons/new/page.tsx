'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Hackathon, HackathonMode } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
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
  ArrowLeft,
  MapPin,
  GraduationCap,
  KeyRound,
  FileText,
  Award,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';

export default function NewHackathonPage() {
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();

  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState(
    profile?.display_name
      ? `${profile.display_name} (Faculty)`
      : profile?.college
      ? `${profile.college} - CS Dept`
      : 'College Department of CSE'
  );
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [mode, setMode] = useState<HackathonMode>('In-Person');
  const [location, setLocation] = useState('Campus Turing Computer Lab, Tech Block');
  const [accessType, setAccessType] = useState<'private' | 'public'>('private');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [themesInput, setThemesInput] = useState('AI/ML, Campus Life, FinTech, Sustainability, Web3');
  const [rules, setRules] = useState(
    '1. All code and designs must be created during the official hackathon timeline.\n2. Projects must address one of the released problem statements.\n3. Public or student GitHub repository with full commit history is required.\n4. Teams must consist of 2 to 4 enrolled college students.\n5. Plagiarism will lead to immediate disqualification.'
  );
  const [contactInfo, setContactInfo] = useState('');
  const [prizePool, setPrizePool] = useState('₹50,000 + Faculty Mentorship & Incubation Support');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdHackathon, setCreatedHackathon] = useState<Hackathon | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isTeacher =
    profile?.role === 'teacher' ||
    profile?.role === 'admin' ||
    Boolean(profile?.faculty_verified) ||
    (typeof window !== 'undefined' && localStorage.getItem('teamforge_verified_faculty') === 'true');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to host a college hackathon.');
      return;
    }

    if (!title.trim() || !description.trim() || !startDate || !registrationDeadline || !submissionDeadline) {
      setError('Please fill in all required fields: Event Name, Overview, Start Date, Registration Deadline, and Submission Deadline.');
      return;
    }

    if (accessType === 'private' && (!password || password.length < 4)) {
      setError('Private hackathons require an access passcode of at least 4 characters.');
      return;
    }

    if (minTeamSize < 1 || maxTeamSize < minTeamSize) {
      setError('Invalid team size configuration: Maximum team size must be greater than or equal to minimum team size.');
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
        throw new Error(resData.error || 'Failed to create college hackathon.');
      }

      // If the server was forced to simulate an ID, insert directly from authenticated browser client
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
            website_url: `https://linkora-link.online/h/${resData.joinCode}`,
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
          console.warn('Client direct fallback note:', e);
        }
      }

      setCreatedHackathon(resData.hackathon);

      // Save to localStorage for immediate cross-tab and directory availability
      if (typeof window !== 'undefined' && resData.hackathon) {
        try {
          const existing = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const filtered = existing.filter((h: any) => h.id !== resData.hackathon.id && h.join_code !== resData.hackathon.join_code);
          localStorage.setItem('teamforge_created_hackathons', JSON.stringify([resData.hackathon, ...filtered]));
        } catch {
          // ignore
        }
      }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/hackathons"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collegiate Hackathons</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-charcoal-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>College Hackathon Creation Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Host a College Hackathon
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed font-medium">
            Launch a private college hackathon, set a cryptographic salted passcode, release challenge problem statements, and conduct rubric-based evaluations for student teams.
          </p>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shrink-0">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Verified Faculty Mentor</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {createdHackathon ? (
        /* Success State View */
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-charcoal-900 border border-emerald-500/40 shadow-glow-sm space-y-8 animate-fadeIn">
          <div className="flex items-start gap-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0 text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-white">
                &quot;{createdHackathon.title}&quot; is Live &amp; Ready!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Your private college hackathon workspace has been initialized. Share this join link and passcode with your students or department groups.
              </p>
            </div>
          </div>

          <div className="p-6 bg-charcoal-950 border border-charcoal-800 rounded-2xl space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
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
                  className="flex-1 bg-charcoal-900 border border-charcoal-750 text-amber-300 font-mono text-sm px-4 py-3 rounded-xl focus:outline-none select-all"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleCopyLink}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
                  leftIcon={<Copy className="w-4 h-4" />}
                >
                  {copiedLink ? 'Copied!' : 'Copy Link'}
                </Button>
              </div>
            </div>

            {createdHackathon.access_type === 'private' && password && (
              <div className="p-4 bg-charcoal-900 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>College Student Access Passcode:</span>
                </div>
                <span className="font-mono font-bold text-base text-amber-300 bg-amber-500/15 px-3 py-1.5 rounded-lg border border-amber-500/30 tracking-wider">
                  {password}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Link href="/hackathons">
              <Button type="button" variant="outline" size="md">
                Return to Hackathons Directory
              </Button>
            </Link>
            <Link href={`/hackathons/${createdHackathon.id}/workspace`}>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold"
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                Open Host Workspace
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Host Form View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Comprehensive Form (2 Cols on lg) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Event Identity */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-charcoal-800 pb-3">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>1. Event Identity &amp; Host Department</span>
              </div>

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
                    Organizing Body / Faculty *
                  </label>
                  <Input
                    placeholder="e.g. Dept of Computer Science & Engineering"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Event Overview &amp; Goals *
                </label>
                <Textarea
                  placeholder="Describe the collegiate objectives, challenges, and target student cohort..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

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

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Competition Themes / Tracks (comma-separated)
                </label>
                <Input
                  placeholder="e.g. AI/ML, FinTech, Smart Campus, Sustainability, Web3"
                  value={themesInput}
                  onChange={(e) => setThemesInput(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Access Security & Passcode */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
                <div className="flex items-center gap-2.5 text-base font-bold text-white">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>2. Access Security &amp; Passcode</span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Private Recommended
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessType('private')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    accessType === 'private'
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-subtle'
                      : 'border-charcoal-750 bg-charcoal-950/40 text-slate-400 hover:border-charcoal-600'
                  }`}
                >
                  <Lock className={`w-5 h-5 mt-0.5 flex-shrink-0 ${accessType === 'private' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Private (Salted Passcode)</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Only students who enter your secret passcode can unlock problem statements and submit projects.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessType('public')}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    accessType === 'public'
                      ? 'border-brand-500 bg-brand-500/10 text-white shadow-subtle'
                      : 'border-charcoal-750 bg-charcoal-950/40 text-slate-400 hover:border-charcoal-600'
                  }`}
                >
                  <Globe className={`w-5 h-5 mt-0.5 flex-shrink-0 ${accessType === 'public' ? 'text-brand-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Open Public Hackathon</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Visible in directory without requiring a passcode for entry.
                    </div>
                  </div>
                </button>
              </div>

              {accessType === 'private' && (
                <div className="p-4 rounded-xl bg-charcoal-950 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Set Event Access Passcode *</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPassword(`CAMPUS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`)}
                      className="text-[10px] font-mono text-amber-400 hover:underline"
                    >
                      Generate Passcode
                    </button>
                  </div>
                  <Input
                    type="text"
                    placeholder="e.g. COL-APEX2026 or CSE-HACK"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-mono uppercase tracking-wider text-amber-200"
                    required={accessType === 'private'}
                  />
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Passwords are never stored in plaintext. They are cryptographically hashed using salted scrypt on the server.
                  </p>
                </div>
              )}
            </div>

            {/* Section 3: Format & Team Size Limits */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-charcoal-800 pb-3">
                <Users className="w-5 h-5 text-brand-400" />
                <span>3. Format, Campus Venue &amp; Team Limits</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Competition Format
                  </label>
                  <Select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as HackathonMode)}
                    options={[
                      { value: 'In-Person', label: 'In-Person (Campus Labs)' },
                      { value: 'Hybrid', label: 'Hybrid (Campus + Virtual)' },
                      { value: 'Online', label: 'Online / Remote' },
                    ]}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Campus Venue / Computer Lab
                  </label>
                  <Input
                    placeholder="e.g. Turing Lab, Building 4"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Minimum Team Size (Students)
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
                    Maximum Team Size (Students)
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
            </div>

            {/* Section 4: Timeline & Deadlines */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-charcoal-800 pb-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span>4. Timeline &amp; Deadlines</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Registration Closes *
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
                    Final Submission Due *
                  </label>
                  <Input
                    type="datetime-local"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Guidelines, Prizes & Support */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
              <div className="flex items-center gap-2.5 text-base font-bold text-white border-b border-charcoal-800 pb-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>5. Guidelines, Awards &amp; Support Contact</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Rules &amp; Code of Conduct
                </label>
                <Textarea
                  rows={4}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Prizes &amp; Mentorship Support
                  </label>
                  <Input
                    placeholder="e.g. ₹50,000 + Faculty Incubation"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Help Desk Email / Contact
                  </label>
                  <Input
                    placeholder="e.g. hackathon-help@college.edu"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                You will receive a non-guessable join link immediately upon publication.
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <Link href="/hackathons">
                  <Button type="button" variant="outline" size="md">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6"
                  leftIcon={<Trophy className="w-4 h-4" />}
                >
                  Publish College Hackathon
                </Button>
              </div>
            </div>
          </form>

          {/* Right Column: Live Preview & Host Tips (1 Col on lg) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Live Student Card Preview */}
            <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  <Eye className="w-4 h-4" />
                  <span>Student Card Preview</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Live Preview</span>
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {accessType === 'private' ? 'Private Event' : 'Public Event'}
                  </span>
                  <span className="text-xs text-slate-400">{mode}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white line-clamp-1">
                    {title.trim() || 'Untitled College Hackathon'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {description.trim() || 'Enter overview to preview how students see this challenge...'}
                  </p>
                </div>

                <div className="pt-2 border-t border-charcoal-800 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-400" />
                    {minTeamSize}–{maxTeamSize} Members
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {location || 'Campus Labs'}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold text-center">
                    Enter Passcode &amp; Join Squad
                  </div>
                </div>
              </div>
            </div>

            {/* Host Best Practices Box */}
            <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Host Best Practices</span>
              </h4>
              <ul className="space-y-2 list-disc list-inside text-slate-400 leading-relaxed">
                <li>Share the join link in your official college portal or WhatsApp groups.</li>
                <li>After publishing, release problem statements in the dedicated workspace.</li>
                <li>Students can only join 1 team per hackathon, ensuring clean squad rosters.</li>
                <li>Review deliverables and score teams across the 100-pt judging rubric.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
