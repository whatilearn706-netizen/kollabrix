'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProblemStatement, ProjectCategory, ProjectDifficulty, ProblemStatementStatus } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/Button';
import {
  FileCode2,
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Save,
  Trash2,
  Archive,
  Lock,
} from 'lucide-react';

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
  { value: 'Published', label: 'Published (Active and visible to students)' },
  { value: 'Draft', label: 'Draft (Saved privately, invisible to students)' },
  { value: 'Archived', label: 'Archived (Closed for new project proposals)' },
];

export default function EditProblemStatementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, profile } = useAuth();

  const [problem, setProblem] = useState<ProblemStatement | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Web Development');
  const [difficulty, setDifficulty] = useState<ProjectDifficulty>('Intermediate');
  const [status, setStatus] = useState<ProblemStatementStatus>('Published');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [deadline, setDeadline] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadProblem = useCallback(async () => {
    if (!id || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('problem_statements')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        throw new Error(fetchError?.message || 'Problem statement not found.');
      }

      const p = data as unknown as ProblemStatement;
      setProblem(p);
      setTitle(p.title);
      setDescription(p.description);
      setCategory(p.category);
      setDifficulty(p.difficulty);
      setStatus(p.status);
      setRequiredSkills(p.required_skills || []);
      setDeadline(p.deadline ? p.deadline.split('T')[0] : '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load problem statement.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !problem) return;

    if (problem.author_id !== user.id && profile?.role !== 'admin') {
      setError('You are not authorized to edit this problem statement.');
      return;
    }

    if (title.trim().length < 5 || title.trim().length > 120) {
      setError('Title must be between 5 and 120 characters.');
      return;
    }

    if (description.trim().length < 30) {
      setError('Description must be at least 30 characters.');
      return;
    }

    try {
      setIsSaving(true);
      const { error: updateError } = await supabase
        .from('problem_statements')
        .update({
          title: title.trim(),
          description: description.trim(),
          category,
          difficulty,
          status,
          required_skills: requiredSkills,
          deadline: deadline || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      router.push(`/problems/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update problem statement.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !problem) return;

    try {
      setIsDeleting(true);
      const isAdmin = (profile as any)?.role === 'admin' || user.email === 'goyalmayank142@gmail.com';

      if (isAdmin) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch('/api/admin/problems', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ problemId: id, title: problem.title }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to delete problem statement as administrator.');
        }
      } else {
        const { error: delError } = await supabase
          .from('problem_statements')
          .delete()
          .eq('id', id);

        if (delError) {
          throw new Error(delError.message);
        }
      }

      router.push('/problems');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete problem statement.');
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading problem details...</p>
      </div>
    );
  }

  const isAuthor = user?.id === problem?.author_id || profile?.role === 'admin';

  if (!isAuthor) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <Lock className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-6">
            Only the authoring faculty member or an administrator can edit this problem statement.
          </p>
          <Link href={`/problems/${id}`}>
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Problem
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href={`/problems/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Detail</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400 mb-2 font-mono">
          <GraduationCap className="w-4 h-4" />
          <span>Faculty Portal</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Edit Problem Statement
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">
          Update the problem description, requirements, status, or proposal deadline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-sm text-red-600 dark:text-red-300">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900/60 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-charcoal-800 pb-3">
            <FileCode2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Problem Statement Information</span>
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Problem Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI-Powered Campus Transit Optimization Engine"
              maxLength={120}
              required
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Difficulty Level <span className="text-red-500">*</span>
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
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Proposal Deadline (Optional)
              </label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Status <span className="text-red-500">*</span>
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
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Required Technical Skills & Tools <span className="text-red-500">*</span>
            </label>
            <TagInput
              tags={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="Add skill and press Enter"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
              Detailed Problem Specification <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={12}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Actions & Delete */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-charcoal-800">
          <div>
            {!confirmDelete ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDelete(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Problem
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-300">Confirm deletion?</span>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  Yes, Delete
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/problems/${id}`}>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
