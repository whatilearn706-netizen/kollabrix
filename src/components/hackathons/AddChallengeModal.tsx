'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { HackathonChallenge, ProjectDifficulty, ProjectCategory } from '@/types/database';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

interface AddChallengeModalProps {
  hackathonId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (challenge: HackathonChallenge) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'Web Development',
  'AI/ML',
  'Mobile Apps',
  'Developer Tools',
  'Social Impact',
  'IoT/Hardware',
  'Other',
];

export function AddChallengeModal({
  hackathonId,
  isOpen,
  onClose,
  onSuccess,
}: AddChallengeModalProps) {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Web Development');
  const [difficulty, setDifficulty] = useState<ProjectDifficulty>('Intermediate');
  const [deliverablesInput, setDeliverablesInput] = useState('Functional Web App, Working Demo, GitHub Repo, Architecture Diagram');
  const [skillsInput, setSkillsInput] = useState('React, Next.js, Node.js, PostgreSQL');
  const [criteria, setCriteria] = useState('');
  const [resourcesInput, setResourcesInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in to add a challenge.');
      return;
    }

    if (!title.trim() || !problemDescription.trim()) {
      setError('Title and problem description are required.');
      return;
    }

    setIsLoading(true);

    try {
      const deliverables = deliverablesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const requiredSkills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const resources = resourcesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        hackathon_id: hackathonId,
        creator_id: user.id,
        title: title.trim(),
        problem_description: problemDescription.trim(),
        context: context.trim() || null,
        category,
        difficulty,
        expected_deliverables: deliverables,
        required_skills: requiredSkills,
        evaluation_criteria: criteria.trim() || null,
        resource_urls: resources,
        status: 'Published',
      };

      if (isSupabaseConfigured()) {
        const { data, error: insertError } = await supabase
          .from('hackathon_challenges')
          .insert(payload)
          .select('*')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        onSuccess(data as HackathonChallenge);
      } else {
        // Fallback
        const mock: HackathonChallenge = {
          id: `chal-${Date.now()}`,
          hackathon_id: hackathonId,
          creator_id: user.id,
          title: title.trim(),
          problem_description: problemDescription.trim(),
          context: context.trim() || undefined,
          expected_deliverables: deliverables,
          required_skills: requiredSkills,
          difficulty,
          category,
          evaluation_criteria: criteria.trim() || undefined,
          resource_urls: resources,
          status: 'Published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSuccess(mock);
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error adding challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Hackathon Challenge Statement"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Challenge / Problem Title *
          </label>
          <Input
            placeholder="e.g. AI-Powered Campus Transit & Shuttle Optimization"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Category / Domain Track
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProjectCategory)}
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Difficulty
            </label>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ProjectDifficulty)}
              options={[
                { value: 'Beginner', label: 'Beginner' },
                { value: 'Intermediate', label: 'Intermediate' },
                { value: 'Advanced', label: 'Advanced' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Problem Description & Scope *
          </label>
          <Textarea
            rows={4}
            placeholder="State the core pain point, target users, and why solving this matters..."
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Context & Constraints (Optional)
          </label>
          <Textarea
            rows={2}
            placeholder="Technical constraints, API limits, or real-world environment factors..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Expected Deliverables (comma separated)
          </label>
          <Input
            value={deliverablesInput}
            onChange={(e) => setDeliverablesInput(e.target.value)}
            placeholder="e.g. Working Prototype, Video Demo, Clean Documentation"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Recommended Skills & Technologies (comma separated)
          </label>
          <Input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. Python, PyTorch, Next.js, FastAPI"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Evaluation & Scoring Criteria
          </label>
          <Input
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            placeholder="e.g. Feasibility, UX polish, latency benchmarks"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} leftIcon={<PlusCircle className="w-4 h-4" />}>
            Publish Challenge
          </Button>
        </div>
      </form>
    </Modal>
  );
}
