'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Project, ProjectCategory, ProjectDifficulty, ProjectStatus } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export interface ProjectFormProps {
  initialData?: Project;
  isEditing?: boolean;
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

const DIFFICULTIES: ProjectDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
const STATUSES: ProjectStatus[] = ['Recruiting', 'In Progress', 'Completed'];

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [description, setDescription] = useState(
    initialData?.description ||
      `### Problem Statement\nWhat challenge or inefficiency are you solving?\n\n### Proposed Solution\nHow does this project address it, and what are the key features?\n\n### Tech Stack & Architecture\nWhat technologies and tools are being used?\n\n### Who We Need\nWhat roles and expertise are you looking for?`
  );
  const [category, setCategory] = useState<ProjectCategory>(
    initialData?.category || 'Web Development'
  );
  const [difficulty, setDifficulty] = useState<ProjectDifficulty>(
    initialData?.difficulty || 'Intermediate'
  );
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status || 'Recruiting');
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || []);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(
    initialData?.required_skills || []
  );
  const [desiredRoles, setDesiredRoles] = useState<string[]>(initialData?.desired_roles || []);
  const [currentTeamSize, setCurrentTeamSize] = useState<number>(
    initialData?.current_team_size || 1
  );
  const [desiredTeamSize, setDesiredTeamSize] = useState<number>(
    initialData?.desired_team_size || 4
  );
  const [repositoryUrl, setRepositoryUrl] = useState(initialData?.repository_url || '');
  const [demoUrl, setDemoUrl] = useState(initialData?.demo_url || '');
  const [applicationDeadline, setApplicationDeadline] = useState(
    initialData?.application_deadline || ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('You must be logged in to create or edit a project.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError(
        'Supabase is not yet configured. Please set your Supabase environment variables in .env.local to save projects to the database.'
      );
      return;
    }

    // Validation
    if (title.trim().length < 3 || title.trim().length > 120) {
      setError('Project title must be between 3 and 120 characters.');
      return;
    }

    if (summary.trim().length < 10 || summary.trim().length > 280) {
      setError('Summary must be between 10 and 280 characters.');
      return;
    }

    if (!description.trim() || description.trim().length < 20) {
      setError('Please provide a detailed description and problem statement.');
      return;
    }

    if (desiredTeamSize < currentTeamSize) {
      setError('Desired team size cannot be smaller than current team size.');
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        category,
        difficulty,
        status,
        technologies,
        required_skills: requiredSkills,
        desired_roles: desiredRoles,
        current_team_size: currentTeamSize,
        desired_team_size: desiredTeamSize,
        repository_url: repositoryUrl.trim() || null,
        demo_url: demoUrl.trim() || null,
        application_deadline: applicationDeadline || null,
        owner_id: user.id, // Strictly derived from the authenticated session
      };

      if (isEditing && initialData?.id) {
        // Update existing project
        const { error: updateError } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', initialData.id)
          .eq('owner_id', user.id); // Guarded by session user

        if (updateError) {
          setError(updateError.message);
          return;
        }

        setSuccess('Project successfully updated!');
        setTimeout(() => {
          router.push(`/projects/${initialData.id}`);
          router.refresh();
        }, 800);
      } else {
        // Insert new project
        const { data: created, error: insertError } = await supabase
          .from('projects')
          .insert(payload)
          .select('id')
          .single();

        if (insertError) {
          setError(insertError.message);
          return;
        }

        setSuccess('Project published successfully!');
        setTimeout(() => {
          router.push(`/projects/${created.id}`);
          router.refresh();
        }, 800);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Section 1: Overview */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Project Overview</h2>
          <p className="text-xs text-slate-400">
            Provide a clear, engaging title and concise summary to hook potential student collaborators.
          </p>
        </div>

        <Input
          label="Project Title"
          required
          placeholder="e.g. CampusPulse: Real-Time Shuttle & Event Tracker"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          helperText={`${title.length}/120 characters`}
        />

        <Textarea
          label="Short Summary"
          required
          rows={3}
          placeholder="A 2-3 sentence overview of what your project does and why it matters."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          helperText={`${summary.length}/280 characters`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as ProjectCategory)}
            options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          />

          <Select
            label="Difficulty Level"
            required
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ProjectDifficulty)}
            options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
          />

          <Select
            label="Recruitment Status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>

      {/* Section 2: Detailed Problem & Solution */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Detailed Problem & Proposed Solution</h2>
          <p className="text-xs text-slate-400">
            Explain the technical details, architecture, roadmap, and what you aim to build together. Markdown is supported.
          </p>
        </div>

        <Textarea
          rows={10}
          label="Detailed Description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Section 3: Tech Stack & Teammate Requirements */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-6">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">Tech Stack & Collaborator Needs</h2>
          <p className="text-xs text-slate-400">
            Specify the technologies used and the specific roles/skills you are looking for in new team members.
          </p>
        </div>

        <TagInput
          label="Technologies & Tools Used"
          placeholder="e.g. React, Next.js, FastAPI, PostgreSQL..."
          tags={technologies}
          onChange={setTechnologies}
          suggestions={['Next.js', 'React', 'Python', 'FastAPI', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Docker']}
        />

        <TagInput
          label="Required Skills for Teammates"
          placeholder="e.g. Frontend Development, Computer Vision, UI/UX..."
          tags={requiredSkills}
          onChange={setRequiredSkills}
          suggestions={['Frontend Development', 'Backend API', 'UI/UX Design', 'PyTorch', 'Data Science', 'Mobile Dev']}
        />

        <TagInput
          label="Desired Roles"
          placeholder="e.g. Frontend Developer, Designer, Project Lead..."
          tags={desiredRoles}
          onChange={setDesiredRoles}
          suggestions={['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'Machine Learning Engineer']}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Input
            label="Current Team Size"
            type="number"
            min={1}
            max={20}
            required
            value={currentTeamSize}
            onChange={(e) => setCurrentTeamSize(parseInt(e.target.value) || 1)}
            helperText="Number of people currently working on this (including you)."
          />

          <Input
            label="Desired Total Team Size"
            type="number"
            min={currentTeamSize}
            max={20}
            required
            value={desiredTeamSize}
            onChange={(e) => setDesiredTeamSize(parseInt(e.target.value) || 4)}
            helperText="Total target number of members needed."
          />
        </div>
      </div>

      {/* Section 4: External Links & Timeline */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5">
        <div className="border-b border-charcoal-800 pb-3">
          <h2 className="text-base font-semibold text-white">External Links & Application Window (Optional)</h2>
          <p className="text-xs text-slate-400">
            Connect your project GitHub repository, live demo URL, or set a target cutoff date.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="GitHub Repository URL"
            type="url"
            placeholder="https://github.com/org/repo"
            value={repositoryUrl}
            onChange={(e) => setRepositoryUrl(e.target.value)}
          />

          <Input
            label="Live Demo / Prototype URL"
            type="url"
            placeholder="https://demo.example.com"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-1/2">
          <Input
            label="Target Application Deadline"
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
          />
        </div>
      </div>

      {/* Submission Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          {isEditing ? 'Save Changes' : 'Publish Project Idea'}
        </Button>
      </div>
    </form>
  );
}
