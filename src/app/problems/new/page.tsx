'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProjectCategory, ProjectDifficulty, ProblemStatementStatus } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/Button';
import {
  FileCode2,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Lock,
  KeyRound,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { FacultyVerificationModal } from '@/components/auth/FacultyVerificationModal';

const CATEGORIES: ProjectCategory[] = [
  'Web Development',
  'AI/ML',
  'Mobile Apps',
  'Developer Tools',
  'Social Impact',
  'IoT/Hardware',
  'Other',
];

const DIFFICULTIES: ProjectDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES: { value: ProblemStatementStatus; label: string }[] = [
  { value: 'Published', label: 'Published (Visible in college directory for student teams)' },
  { value: 'Draft', label: 'Draft (Saved privately, invisible to students)' },
];

export default function NewProblemStatementPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, openAuthModal } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(
    `### Overview & Context\nDescribe the background and importance of this problem statement.\n\n### Problem Description & Requirements\nWhat specific challenge must student teams solve? What are the key deliverables?\n\n### Suggested Architecture & Stack\nWhat technologies, frameworks, or datasets should students consider?\n\n### Deliverables & Evaluation Criteria\nHow will the project outcome be evaluated at the end of the term?`
  );
  const [category, setCategory] = useState<ProjectCategory>('Web Development');
  const [difficulty, setDifficulty] = useState<ProjectDifficulty>('Intermediate');
  const [status, setStatus] = useState<ProblemStatementStatus>('Published');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['TypeScript', 'React']);
  const [deadline, setDeadline] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Faculty verification state for non-teacher users
  const [facultyCode, setFacultyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const [isDocVerifyOpen, setIsDocVerifyOpen] = useState(false);

  const isTeacher =
    profile?.role === 'teacher' ||
    profile?.role === 'admin' ||
    Boolean(profile?.faculty_verified) ||
    (typeof window !== 'undefined' && localStorage.getItem('teamforge_verified_faculty') === 'true');

  const handleVerifyFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    setVerifySuccess(null);

    if (!facultyCode.trim()) {
      setVerifyError('Please enter an institutional faculty code.');
      return;
    }

    try {
      setIsVerifying(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/faculty/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ code: facultyCode.trim(), userId: user?.id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('teamforge_verified_faculty', 'true');
        }
        setVerifySuccess(data.message || 'Faculty status verified! Unlocking authoring portal...');
        await refreshProfile();
      } else {
        setVerifyError(data?.error || 'Invalid faculty code. Please verify with your campus administrator.');
      }
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : 'Error verifying faculty code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!isTeacher) {
      setError('Faculty verification is required to author and post problem statements.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Database is not configured. Please ensure your Supabase variables are set.');
      return;
    }

    // Validation
    if (title.trim().length < 5 || title.trim().length > 120) {
      setError('Problem statement title must be between 5 and 120 characters.');
      return;
    }

    if (description.trim().length < 30) {
      setError('Detailed description must be at least 30 characters.');
      return;
    }

    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill or technology.');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        author_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        required_skills: requiredSkills,
        difficulty,
        deadline: deadline || null,
        status,
      };

      const { data, error: insertError } = await supabase
        .from('problem_statements')
        .insert(payload)
        .select('id')
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (data?.id) {
        router.push(`/problems/${data.id}`);
      } else {
        router.push('/problems');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish problem statement.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Statements</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-brand-400 mb-2">
          <GraduationCap className="w-4 h-4" />
          <span>Faculty & Mentor Portal</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Post a Problem Statement
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Define a real-world technical, algorithmic, or societal challenge for college student
          engineering teams to propose and execute as semester projects.
        </p>
      </div>

      {/* Role Gate: If not teacher */}
      {!user ? (
        <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/60 p-8 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center mx-auto mb-4 text-brand-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Sign In Required</h2>
          <p className="text-sm text-slate-400 mb-6">
            You must be signed in with a verified faculty account to author and post problem statements.
          </p>
          <Button onClick={() => openAuthModal('login')} variant="primary">
            Sign In / Register
          </Button>
        </div>
      ) : !isTeacher ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Faculty Authorization Required</h2>
              <p className="text-xs text-amber-400/90">Institutional Verification</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Posting problem statements is restricted to verified university faculty, department
            heads, and academic mentors. Enter your college faculty verification code to unlock
            educator access.
          </p>

          <form onSubmit={handleVerifyFaculty} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Institutional Faculty Access Code
              </label>
              <Input
                type="text"
                value={facultyCode}
                onChange={(e) => setFacultyCode(e.target.value)}
                placeholder="e.g. FAC-2026-XXXX"
                className="bg-charcoal-900/90 border-charcoal-700 font-mono uppercase"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the official institutional passcode generated by your platform administrator (Format: <code className="text-brand-300 font-mono">FAC-XXXX-XXXX</code>).
              </p>
            </div>

            {verifyError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifySuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{verifySuccess}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isVerifying}
              leftIcon={<GraduationCap className="w-4 h-4" />}
            >
              Verify Faculty Code
            </Button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-charcoal-750"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase">Or verify by DigiLocker</span>
            <div className="flex-grow border-t border-charcoal-750"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
            onClick={() => setIsDocVerifyOpen(true)}
            leftIcon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
          >
            🇮🇳 Verify with DigiLocker (Aadhaar / Class 12th Marksheet)
          </Button>

          <FacultyVerificationModal
            isOpen={isDocVerifyOpen}
            onClose={() => setIsDocVerifyOpen(false)}
            onSuccess={async () => {
              await refreshProfile();
            }}
          />
        </div>
      ) : (
        /* Authoring Form for verified faculty */
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-2xl border border-charcoal-800 bg-charcoal-900/40 p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-charcoal-800 pb-3">
              <FileCode2 className="w-4 h-4 text-brand-400" />
              <span>Problem Statement Details</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Problem Title <span className="text-red-400">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Campus Transit Optimization Engine"
                maxLength={120}
                required
              />
              <span className="text-xs text-slate-500 mt-1 block">
                {title.length}/120 characters. Make it descriptive and action-oriented.
              </span>
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Difficulty Level <span className="text-red-400">*</span>
                </label>
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as ProjectDifficulty)}
                  options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                />
              </div>
            </div>

            {/* Deadline & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Proposal Deadline (Optional)
                </label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="text-slate-300"
                />
                <span className="text-xs text-slate-500 mt-1 block">
                  Last date for student teams to submit proposals or select this challenge.
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1.5">
                  Publication Status <span className="text-red-400">*</span>
                </label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProblemStatementStatus)}
                  options={STATUSES}
                />
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Required Technical Skills & Tools <span className="text-red-400">*</span>
              </label>
              <TagInput
                tags={requiredSkills}
                onChange={setRequiredSkills}
                placeholder="Type a skill and press Enter (e.g. PyTorch, Next.js, Docker)"
              />
              <span className="text-xs text-slate-500 mt-1 block">
                Helps students match their technical strengths with this challenge.
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Detailed Problem Specification <span className="text-red-400">*</span>
              </label>
              <Textarea
                rows={12}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a comprehensive explanation of the challenge, deliverables, and requirements..."
                required
              />
              <span className="text-xs text-slate-500 mt-1 block">
                Markdown formatting is supported. Clearly detail what successful completion looks like.
              </span>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-charcoal-800">
            <Link href="/problems">
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Send className="w-4 h-4" />}
            >
              {status === 'Published' ? 'Publish Problem Statement' : 'Save as Draft'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
