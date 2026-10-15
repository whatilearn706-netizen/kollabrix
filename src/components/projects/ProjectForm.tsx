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
  const isVerifiedTeacher = Boolean(
    (profile?.role === 'teacher' || profile?.faculty_verified) &&
      (!profile?.birth_year || profile?.birth_year <= 2003)
  );
  const [creatorRole, setCreatorRole] = useState<'student' | 'teacher'>(() =>
    isVerifiedTeacher ? 'teacher' : 'student'
  );
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

  React.useEffect(() => {
    if (isVerifiedTeacher) {
      setCreatorRole('teacher');
    }
  }, [isVerifiedTeacher]);

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

  const handleSelectTeacherRole = () => {
    setIsMentorModalOpen(true);
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
        let createdProblemId: string | null = null;

        if (creatorRole === 'teacher') {
          // 1. Create entry in Teacher section (problem_statements)
          try {
            const { data: createdProb, error: probErr } = await supabase
              .from('problem_statements')
              .insert({
                author_id: user.id,
                title: title.trim(),
                description: description.trim(),
                category,
                difficulty,
                required_skills: requiredSkills.length > 0 ? requiredSkills : ['Technical Leadership'],
                deadline: applicationDeadline || null,
                status: 'Published',
              })
              .select('id')
              .single();

            if (!probErr && createdProb) {
              createdProblemId = createdProb.id;
              payload.problem_statement_id = createdProb.id;
            }
          } catch (e) {
            console.warn('Teacher section problem creation notice:', e);
          }
        }

        const { data: created, error: insertError } = await supabase
          .from('projects')
          .insert(payload)
          .select('id')
          .single();

        if (insertError) {
          setError(insertError.message);
          return;
        }

        if (creatorRole === 'teacher') {
          setSuccess('Faculty Challenge & Project published successfully to the Teacher Section!');
          setTimeout(() => {
            if (createdProblemId) {
              router.push(`/problems/${createdProblemId}`);
            } else {
              router.push('/teacher/dashboard');
            }
            router.refresh();
          }, 800);
        } else {
          setSuccess('Project published successfully!');
          setTimeout(() => {
            router.push(`/projects/${created.id}`);
            router.refresh();
          }, 800);
        }
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

      {/* Creator Track Selector (New Project only) */}
      {!isEditing && (
        <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4">
          <div className="border-b border-charcoal-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Project Creator Track</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-medium">
                  Role Identification
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Are you creating this project as a Student or as a Teacher / Mentor / Professor?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Track */}
            <button
              type="button"
              onClick={() => setCreatorRole('student')}
              className={`p-4 rounded-xl border text-left transition-all ${
                creatorRole === 'student'
                  ? 'border-brand-500 bg-brand-500/10 text-white shadow-lg shadow-brand-500/5'
                  : 'border-charcoal-750 bg-charcoal-850/60 text-slate-400 hover:border-charcoal-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Student / Maker</h4>
                  <span className="text-[10px] text-brand-300">Undergraduate / Graduate</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build a semester project, form a student team, and recruit peers across campus departments.
              </p>
            </button>

            {/* Teacher / Mentor / Professor Track */}
            <button
              type="button"
              onClick={handleSelectTeacherRole}
              className={`p-4 rounded-xl border text-left transition-all ${
                creatorRole === 'teacher'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/5'
                  : 'border-charcoal-750 bg-charcoal-850/60 text-slate-400 hover:border-charcoal-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Teacher / Mentor / Professor</h4>
                    <span className="text-[10px] text-indigo-300">
                      {profile?.birth_year && profile.birth_year > 2003
                        ? `❌ Student Only (Born ${profile.birth_year})`
                        : profile?.role === 'teacher' && profile?.faculty_verified && profile?.birth_year && profile.birth_year <= 2003
                        ? '✓ Verified Faculty'
                        : 'Requires Aadhaar Card (Born ≤ 2003)'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Go to Mentor Portal &rarr;
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lead a faculty-supervised capstone or research initiative. Click to open the Mentor Portal prompt.
              </p>
            </button>
          </div>

          {creatorRole === 'teacher' && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Authenticated as <strong>Verified Faculty Member</strong>. This project will carry the official Faculty Mentor badge.
                </span>
              </div>
            </div>
          )}
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
        <div className="pt-2 border-t border-charcoal-800">
          <label className="block text-sm font-medium text-slate-200 mb-1.5">
            Faculty Problem Statement Reference (Optional)
          </label>
          <Select
            value={problemStatementId}
            onChange={(e) => setProblemStatementId(e.target.value)}
            options={[
              { value: '', label: 'None (Independent student-initiated project)' },
              ...problemStatements.map((ps) => ({
                value: ps.id,
                label: `[${ps.category}] ${ps.title}`,
              })),
            ]}
          />
          <p className="text-xs text-slate-400 mt-1">
            Linking your project to a faculty problem statement allows the authoring professor to monitor milestones and provide academic mentoring.
          </p>
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
          leftIcon={creatorRole === 'teacher' ? <GraduationCap className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          className={creatorRole === 'teacher' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : ''}
        >
          {isEditing
            ? 'Save Changes'
            : creatorRole === 'teacher'
            ? 'Publish to Teacher Section'
            : 'Publish Student Project'}
        </Button>
      </div>

      {/* Go to Mentor Portal Popup */}
      <Modal
        isOpen={isMentorModalOpen}
        onClose={() => setIsMentorModalOpen(false)}
        title="Go to Mentor Portal"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1">
          {profile?.birth_year && profile.birth_year > 2003 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <span>Student Account (Born {profile.birth_year})</span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  Your verification records confirm your birth year is <strong>{profile.birth_year}</strong> (Age: {2026 - profile.birth_year} years). Institutional faculty rules strictly require birth year &le; 2003. You are creating this project as a Student.
                </p>
                <p className="text-xs text-slate-300">
                  You can explore published faculty challenges in the Mentor Portal, or proceed proposing this project as a Student.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  onClick={() => {
                    setIsMentorModalOpen(false);
                    router.push('/teacher/dashboard');
                  }}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                >
                  Go to Mentor Portal
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    setCreatorRole('student');
                    setIsMentorModalOpen(false);
                  }}
                >
                  Continue as Student
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-200">
                <GraduationCap className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-white">Looking for the Mentor Portal?</p>
                  <p className="text-slate-300 leading-relaxed">
                    Faculty members, mentors, and professors manage official problem statements, review student capstones, and post feedback directly inside the <strong>Mentor Portal</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-charcoal-800/80 border border-charcoal-700/80 space-y-2 text-xs text-slate-300">
                <p className="font-medium text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Mentor Portal Features:</span>
                </p>
                <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                  <li>Post official College Problem Statements for student teams</li>
                  <li>Monitor student milestone submissions & evidence</li>
                  <li>Provide faculty mentoring notes & capstone guidance</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 text-sm shadow-lg shadow-indigo-600/20"
                  onClick={() => {
                    setIsMentorModalOpen(false);
                    router.push('/teacher/dashboard');
                  }}
                  leftIcon={<GraduationCap className="w-5 h-5 text-indigo-200" />}
                >
                  Go to Mentor Portal
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-charcoal-800" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">or continue on this form</span>
                  <div className="flex-1 h-px bg-charcoal-800" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:flex-1 text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
                    onClick={() => {
                      setIsMentorModalOpen(false);
                      if (isVerifiedTeacher) {
                        setCreatorRole('teacher');
                      } else {
                        setIsFacultyModalOpen(true);
                      }
                    }}
                    leftIcon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
                  >
                    {isVerifiedTeacher ? 'Publish Here as Faculty' : 'Verify Faculty ID First'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full sm:flex-1 text-xs text-slate-400 hover:text-white"
                    onClick={() => {
                      setCreatorRole('student');
                      setIsMentorModalOpen(false);
                    }}
                  >
                    Keep as Student Project
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Faculty Age & Document Verification Modal */}
      <FacultyVerificationModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        onSuccess={() => {
          setCreatorRole('teacher');
        }}
        onContinueAsStudent={() => {
          setCreatorRole('student');
        }}
      />
    </form>
  );
}
