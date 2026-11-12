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
import { Modal } from '@/components/ui/Modal';
import { AlertCircle, CheckCircle2, Save, ArrowLeft, Users, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { FacultyVerificationModal } from '@/components/auth/FacultyVerificationModal';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';
import { invalidatePageCache } from '@/lib/cache/pageDataCache';

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

function generateUUID(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch {}
    }
    if (typeof crypto.getRandomValues === 'function') {
      try {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
          .join('')
          .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
      } catch {}
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ProjectForm({ initialData, isEditing = false }: ProjectFormProps) {
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();

  const [formCategories, setFormCategories] = useState<string[]>(CATEGORIES);

  React.useEffect(() => {
    async function loadDynamicCategories() {
      try {
        const res = await fetch('/api/explore/config');
        const data = await res.json();
        if (data?.config?.categories) {
          const active = data.config.categories
            .filter((c: any) => c.isActive)
            .map((c: any) => c.name);
          if (active.length > 0) {
            setFormCategories(active);
          }
        }
      } catch {}
    }
    loadDynamicCategories();
  }, []);

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
  const [documentationUrl, setDocumentationUrl] = useState(initialData?.documentation_url || '');
  const [problemStatementId, setProblemStatementId] = useState(
    initialData?.problem_statement_id || ''
  );
  const [applicationDeadline, setApplicationDeadline] = useState(
    initialData?.application_deadline || ''
  );
  const [problemStatements, setProblemStatements] = useState<
    Array<{ id: string; title: string; category: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-prefill form if launched from Kollabrix Spark AI Generator
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !initialData) {
      try {
        const stored = sessionStorage.getItem('prefill_project_blueprint');
        if (stored) {
          const bp = JSON.parse(stored);
          if (bp.title) setTitle(bp.title);
          if (bp.summary || bp.tagline) setSummary(bp.summary || bp.tagline);
          if (bp.category) {
            setCategory(bp.category as ProjectCategory);
          }
          if (bp.difficulty) setDifficulty(bp.difficulty as ProjectDifficulty);
          if (Array.isArray(bp.technologies) && bp.technologies.length > 0) {
            setTechnologies(bp.technologies);
          }
          if (Array.isArray(bp.desired_roles) && bp.desired_roles.length > 0) {
            setDesiredRoles(bp.desired_roles);
          }
          if (Array.isArray(bp.rolesBreakdown) && bp.rolesBreakdown.length > 0) {
            const allSkills = Array.from(new Set(bp.rolesBreakdown.flatMap((r: any) => r.skills || []))) as string[];
            if (allSkills.length > 0) setRequiredSkills(allSkills);
          }
          // Build structured initial markdown description
          const sections = [
            `### Project Overview\n${bp.summary || bp.tagline || ''}\n`,
            Array.isArray(bp.technologies) && bp.technologies.length > 0
              ? `### Tech Stack & Architecture\n${bp.technologies.map((t: string) => `- **${t}**`).join('\n')}\n`
              : '',
            Array.isArray(bp.rolesBreakdown) && bp.rolesBreakdown.length > 0
              ? `### Desired Squad Roles\n${bp.rolesBreakdown.map((r: any) => `- **${r.role}**: ${r.focus}`).join('\n')}\n`
              : '',
            Array.isArray(bp.milestones) && bp.milestones.length > 0
              ? `### Sprint Roadmap & Milestones\n${bp.milestones.map((m: any) => `- **${m.duration} (${m.title})**: ${m.deliverables}`).join('\n')}`
              : '',
          ].filter(Boolean);
          if (sections.length > 0) {
            setDescription(sections.join('\n'));
          }
          sessionStorage.removeItem('prefill_project_blueprint');
        }
      } catch (e) {
        console.warn('Failed to parse prefill project blueprint:', e);
      }
    }
  }, [initialData]);

  // Read URL query params on mount for pre-selected problem statement and fetch active statements
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('problem_id');
      if (pid && !initialData?.problem_statement_id) {
        setProblemStatementId(pid);
      }
    }

    async function loadProblemStatements() {
      if (!isSupabaseConfigured()) return;
      try {
        const { data } = await supabase
          .from('problem_statements')
          .select('id, title, category')
          .eq('status', 'Published')
          .order('created_at', { ascending: false });

        if (data) {
          setProblemStatements(data);
        }
      } catch {
        // Fallback gracefully
      }
    }

    loadProblemStatements();
  }, [initialData?.problem_statement_id]);

  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

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

    if (repositoryUrl && !validateUrl(repositoryUrl)) {
      setError('Please provide a valid GitHub repository URL (e.g. https://github.com/org/repo).');
      return;
    }

    if (demoUrl && !validateUrl(demoUrl)) {
      setError('Please provide a valid Live Demo URL (e.g. https://demo.example.com).');
      return;
    }

    if (documentationUrl && !validateUrl(documentationUrl)) {
      setError('Please provide a valid Documentation URL (e.g. https://docs.example.com).');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Establish verified session with Supabase
      let activeUserId = user?.id;
      let activeSession: any = null;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        activeSession = sessionData?.session;
      } catch {}

      if (!activeSession) {
        // Try restoring from cached session
        try {
          const cachedSession = localStorage.getItem('linkora_auth_session');
          if (cachedSession) {
            const parsed = JSON.parse(cachedSession);
            if (parsed?.access_token && parsed?.refresh_token) {
              const { data: restored } = await supabase.auth.setSession({
                access_token: parsed.access_token,
                refresh_token: parsed.refresh_token,
              });
              activeSession = restored?.session;
            }
          }
        } catch {}
      }

      if (activeSession?.user?.id) {
        activeUserId = activeSession.user.id;
      }

      // Check if user is authenticated with Supabase Auth
      if (!activeUserId) {
        setError('Authentication required: Please sign in with Google, LinkedIn, or GitHub to publish your project.');
        openAuthModal('login');
        setIsLoading(false);
        return;
      }

      // 2. Ensure profile row exists in public.profiles to satisfy foreign key (owner_id -> profiles.user_id)
      try {
        await supabase.from('profiles').upsert(
          {
            user_id: activeUserId,
            display_name: profile?.display_name || user?.user_metadata?.full_name || 'Student Builder',
            username: profile?.username || `user_${activeUserId.slice(0, 8)}`,
            skills: profile?.skills || technologies || ['Web Development'],
            interests: profile?.interests || ['Campus Innovation'],
            preferred_roles: profile?.preferred_roles || desiredRoles || ['Project Lead'],
          },
          { onConflict: 'user_id' }
        );
      } catch (profErr) {
        console.warn('Profile ensure notice:', profErr);
      }

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
        documentation_url: documentationUrl.trim() || null,
        problem_statement_id: problemStatementId || null,
        application_deadline: applicationDeadline || null,
        owner_id: activeUserId, // Strictly guaranteed to match active session UID
      };

      if (isEditing && initialData?.id) {
        // Update existing project
        const { error: updateError } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', initialData.id)
          .eq('owner_id', activeUserId); // Guarded by session user

        if (updateError) {
          setError(updateError.message);
          return;
        }

        setSuccess('Project successfully updated!');
        invalidatePageCache();
        setTimeout(() => {
          router.push(`/projects/${initialData.id}`);
          router.refresh();
        }, 800);
      } else {
        // Insert new project
        invalidatePageCache();

        const newProjectId = generateUUID();
        const insertPayload = {
          ...payload,
          id: newProjectId,
        };

        const { data: created, error: insertError } = await supabase
          .from('projects')
          .insert(insertPayload)
          .select('id')
          .single();

        if (insertError) {
          if (insertError.code === '42501' || insertError.message?.toLowerCase().includes('row-level security')) {
            setError('Authentication session needs verification: Please sign in with Google, LinkedIn, or GitHub to publish your project.');
            openAuthModal('login');
          } else {
            setError(insertError.message);
          }
          return;
        }

        invalidatePageCache();

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
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900">Project Overview</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
            options={formCategories.map((cat) => ({ value: cat, label: cat }))}
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
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900">Detailed Problem & Proposed Solution</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900">Tech Stack & Collaborator Needs</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
      <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-900">External Links & Application Window (Optional)</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Documentation URL (Optional)"
            type="url"
            placeholder="https://docs.example.com or Notion/Wiki"
            value={documentationUrl}
            onChange={(e) => setDocumentationUrl(e.target.value)}
            helperText="Link to project architecture docs, Notion board, or GitBook."
          />

          <Input
            label="Target Application Deadline"
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
          />
        </div>

        {/* Problem Statement Selection */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>College Problem Statement / Challenge Tackled</span>
            <span className="text-xs font-normal text-slate-400">Optional</span>
          </label>
          <Select
            value={problemStatementId}
            onChange={(e) => setProblemStatementId(e.target.value)}
            options={[
              { value: '', label: '-- None (Independent Student Project / Open Innovation) --' },
              ...problemStatements.map((ps) => ({
                value: ps.id,
                label: `[${ps.category}] ${ps.title}`,
              })),
            ]}
          />
          <p className="text-xs text-slate-500 mt-1">
            Optional: Linking your team project to a faculty challenge statement allows supervising mentors to evaluate deliverables and review progress.
          </p>
        </div>
      </div>

      {/* Submission Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
          className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-black shadow-md border-0"
        >
          {isEditing ? 'Save Changes' : 'Publish Student Project'}
        </Button>
      </div>
    </form>
  );
}
