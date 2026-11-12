'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  X,
  Users,
  Sparkles,
  Globe,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Layers,
  GraduationCap,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface ProblemTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle: string;
  problemCategory?: string;
  problemDifficulty?: string;
  requiredSkills?: string[];
  expectedTeamSize?: string | null;
  isApplyingAnswerFlow?: boolean;
  onSuccess?: (createdTeam: any) => void;
  onContinueToApplyAnswer?: (createdTeam: any) => void;
}

const COMMON_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'AI / ML Engineer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Mobile App Developer',
  'DevOps / Cloud',
  'Research Analyst',
];

function parseTeamSizeRange(expected?: string | null): { min: number; max: number } {
  if (!expected) return { min: 2, max: 4 };
  const numbers = (expected.match(/\d+/g) || []).map(Number);
  if (numbers.length >= 2) {
    return { min: Math.min(numbers[0], numbers[1]), max: Math.max(numbers[0], numbers[1]) };
  } else if (numbers.length === 1) {
    return { min: 1, max: numbers[0] };
  }
  return { min: 2, max: 4 };
}

export function ProblemTeamModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  problemCategory = 'Web Development',
  problemDifficulty = 'Intermediate',
  requiredSkills = [],
  expectedTeamSize,
  isApplyingAnswerFlow = false,
  onSuccess,
  onContinueToApplyAnswer,
}: ProblemTeamModalProps) {
  const { user, profile, openAuthModal } = useAuth();

  const teamRange = React.useMemo(() => parseTeamSizeRange(expectedTeamSize), [expectedTeamSize]);
  const allowedSizes = React.useMemo(() => {
    const list: number[] = [];
    for (let s = teamRange.min; s <= teamRange.max; s++) {
      list.push(s);
    }
    return list.length > 0 ? list : [2, 3, 4];
  }, [teamRange]);

  const [teamName, setTeamName] = useState('');
  const [concept, setConcept] = useState('');
  const [targetTeamSize, setTargetTeamSize] = useState<number>(() => teamRange.max);

  React.useEffect(() => {
    setTargetTeamSize((prev) => Math.min(Math.max(prev, teamRange.min), teamRange.max));
  }, [teamRange]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Frontend Developer', 'Backend Developer']);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [postToExplore, setPostToExplore] = useState(false);
  const [recruitmentHeadline, setRecruitmentHeadline] = useState('');
  const [commsLink, setCommsLink] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [existingSquad, setExistingSquad] = useState<any>(null);

  if (!isOpen) return null;

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleAddCustomRole = () => {
    if (customRoleInput.trim() && !selectedRoles.includes(customRoleInput.trim())) {
      setSelectedRoles((prev) => [...prev, customRoleInput.trim()]);
      setCustomRoleInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!teamName.trim() || teamName.trim().length < 2) {
      setError('Please provide a team name (at least 2 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Enforce 1 team per student limit for faculty problem statements
    if (isSupabaseConfigured()) {
      try {
        const { data: existingUserTeams } = await supabase
          .from('projects')
          .select('id, title')
          .eq('problem_statement_id', problemId)
          .eq('owner_id', user.id);

        if (existingUserTeams && existingUserTeams.length > 0) {
          setExistingSquad(existingUserTeams[0]);
          setError(`You have already formed a squad ("${existingUserTeams[0].title}") for this problem statement. Each student is limited to 1 team per challenge.`);
          setIsSubmitting(false);
          return;
        }
      } catch (checkErr) {
        console.warn('Notice checking existing teams:', checkErr);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const localTeams = JSON.parse(localStorage.getItem(`tf_problem_teams_${problemId}`) || '[]');
        const owned = localTeams.find((t: any) => t && (t.owner_id === user.id || t.owner?.user_id === user.id));
        if (owned) {
          setExistingSquad(owned);
          setError(`You have already formed a squad ("${owned.title}") for this problem statement. Each student is limited to 1 team per challenge.`);
          setIsSubmitting(false);
          return;
        }
      } catch {}
    }

    try {
      const summaryText =
        concept.trim() ||
        (postToExplore && recruitmentHeadline.trim()) ||
        `Student squad tackling faculty challenge: ${problemTitle}`;

      const descriptionText = `### Squad Mission & Approach\n${
        concept.trim() || 'Building a comprehensive solution deliverable for this faculty challenge.'
      }\n\n### Faculty Problem Statement\nThis team is directly tackling: **${problemTitle}**.\n\n### Looking For Team Members\n${
        selectedRoles.map((r) => `- **${r}**`).join('\n') || '- Passionate student builders'
      }${commsLink.trim() ? `\n\n### Team Communication\n${commsLink.trim()}` : ''}`;

      const projectPayload: any = {
        title: `${teamName.trim()}`,
        summary: concept.trim() || `Student squad tackling faculty challenge: ${problemTitle}`,
        description: descriptionText,
        category: problemCategory,
        difficulty: problemDifficulty,
        status: 'In Progress',
        technologies: requiredSkills.length > 0 ? requiredSkills : ['Full Stack'],
        required_skills: requiredSkills.length > 0 ? requiredSkills : ['Software Engineering'],
        desired_roles: selectedRoles.length > 0 ? selectedRoles : ['Developer'],
        current_team_size: 1,
        desired_team_size: targetTeamSize,
        problem_statement_id: problemId,
        owner_id: user.id,
      };

      let finalProject = null;

      try {
        let token: string | null = null;
        if (isSupabaseConfigured()) {
          try {
            const { data: sess } = await supabase.auth.getSession();
            token = sess?.session?.access_token || null;
          } catch {}
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/problems/team', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            problemId,
            problemTitle,
            teamName: teamName.trim(),
            concept: concept.trim(),
            category: problemCategory,
            difficulty: problemDifficulty,
            desiredTeamSize: targetTeamSize,
            selectedRoles,
            technologies: requiredSkills,
            commsLink: commsLink.trim(),
            postToExplore: false,
            userId: user.id,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success && data.project) {
          finalProject = data.project;
        } else {
          throw new Error(data.error || 'Server could not register student squad.');
        }
      } catch (srvErr: any) {
        console.warn('Server problem team creation fallback note:', srvErr.message);

        // Fallback to local memory / client project object
        finalProject = {
          id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...projectPayload,
          created_at: new Date().toISOString(),
          owner: {
            user_id: user.id,
            display_name: profile?.display_name || user?.user_metadata?.full_name || 'Team Lead',
            avatar_url: profile?.avatar_url,
          },
        };
      }

      // Save to localStorage for instant synchronization on this problem
      if (typeof window !== 'undefined' && finalProject) {
        const key = `tf_problem_teams_${problemId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.unshift(finalProject);
        localStorage.setItem(key, JSON.stringify(existing));
      }

      setCreatedProject(finalProject);
      if (onSuccess) onSuccess(finalProject);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating student team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-left space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-charcoal-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-brand-400 mb-1 font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>
                {isApplyingAnswerFlow
                  ? 'Step 1 of 2 • Squad Formation Required'
                  : 'Collegiate Challenge Squad'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isApplyingAnswerFlow ? 'Form Team to Apply Answer' : 'Form a Student Team'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
              {isApplyingAnswerFlow
                ? 'Challenge answer submissions require a registered student team. Register your squad below to proceed.'
                : `Challenge: ${problemTitle}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdProject ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Team Registered!</h3>
              <p className="text-xs text-slate-200 max-w-md mx-auto leading-relaxed mt-1 font-normal">
                Your squad <strong className="text-brand-300 font-bold">{createdProject.title}</strong> has been formed for this faculty challenge.
                <span className="block mt-1 text-slate-300 font-medium">
                  Scoped specifically to this faculty problem challenge (isolated from general Explore projects).
                </span>
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              {isApplyingAnswerFlow && onContinueToApplyAnswer ? (
                <Button
                  variant="primary"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 shadow-md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    onClose();
                    onContinueToApplyAnswer(createdProject);
                  }}
                >
                  Proceed to Apply Answer Now →
                </Button>
              ) : (
                <>
                  <Link href={`/projects/${createdProject.id}/workspace`}>
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold px-6"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Open Team Workspace
                    </Button>
                  </Link>
                  {onContinueToApplyAnswer && (
                    <Button
                      variant="secondary"
                      className="w-full sm:w-auto bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 font-bold text-xs"
                      onClick={() => {
                        onClose();
                        onContinueToApplyAnswer(createdProject);
                      }}
                    >
                      Apply Answer With This Team →
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="outline"
                className="w-full sm:w-auto border-charcoal-700 text-slate-200 hover:text-white hover:bg-charcoal-800"
                onClick={onClose}
              >
                Back to Challenge
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {existingSquad && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Existing Registered Squad: <strong>{existingSquad.title}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">1 Team Limit</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  You are already the registered leader of <strong>&ldquo;{existingSquad.title}&rdquo;</strong> for this problem statement. You can proceed directly to apply your team&apos;s answer now.
                </p>
                {onContinueToApplyAnswer && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onClose();
                      onContinueToApplyAnswer(existingSquad);
                    }}
                  >
                    Proceed to Apply Answer with &ldquo;{existingSquad.title}&rdquo; →
                  </Button>
                )}
              </div>
            )}
            {error && !existingSquad && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Team Name & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  Team Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Algorithmic Titans"
                  required
                  className="bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  Target Squad Size
                </label>
                <select
                  value={targetTeamSize}
                  onChange={(e) => setTargetTeamSize(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-charcoal-850 border border-charcoal-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500 font-semibold"
                >
                  {allowedSizes.map((size) => {
                    let label = `${size} Members`;
                    if (size === 1) label = '1 Member (Solo Contender)';
                    else if (size === 2) label = '2 Members (Pair / Duo)';
                    else if (size === 3) label = '3 Members (Trio)';
                    else if (size === 4) label = '4 Members (Squad)';
                    else if (size === 5) label = '5 Members (Extended)';
                    else if (size === 6) label = '6 Members (Full Team)';
                    return (
                      <option key={size} value={size}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Proposed Solution Concept */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white block">
                Proposed Solution Concept / Approach <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <Textarea
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={3}
                placeholder="Briefly outline how your team plans to solve this challenge (e.g. Next.js dashboard, edge telemetry pipeline, custom deep learning model)..."
                className="text-xs bg-charcoal-850 border-charcoal-700 text-slate-100 placeholder-slate-400 leading-relaxed font-mono"
              />
            </div>

            {/* Roles Needed in Squad */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white block">
                Roles Looking For in this Squad
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleToggleRole(role)}
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-all font-medium ${
                        isSelected
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 font-bold'
                          : 'bg-charcoal-850 text-slate-300 border-charcoal-750 hover:border-charcoal-600'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {role}
                    </button>
                  );
                })}
              </div>

              {/* Custom Role Input */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  type="text"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="Add custom role (e.g. Drone Hardware Engineer)..."
                  className="text-xs bg-charcoal-850 border-charcoal-700 text-white placeholder-slate-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRole();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddCustomRole}
                  className="shrink-0 text-xs"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Scoped directly to faculty problem */}
            <div className="p-3.5 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-1">
              <div className="flex items-center gap-2 text-brand-400">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white">
                  Scoped Exclusively to Faculty Problem Challenge
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                This squad is registered directly under this faculty challenge and will be reviewed by the faculty mentor. It is kept private to this competition and will not appear in the general Explore page.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-charcoal-800">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Users className="w-3.5 h-3.5" />}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 shadow-md"
              >
                Form Student Team
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
