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
  onSuccess?: (createdTeam: any) => void;
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

export function ProblemTeamModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
  problemCategory = 'Web Development',
  problemDifficulty = 'Intermediate',
  requiredSkills = [],
  expectedTeamSize,
  onSuccess,
}: ProblemTeamModalProps) {
  const { user, profile, openAuthModal } = useAuth();

  const [teamName, setTeamName] = useState('');
  const [concept, setConcept] = useState('');
  const [targetTeamSize, setTargetTeamSize] = useState<number>(() => {
    if (expectedTeamSize) {
      const match = expectedTeamSize.match(/\d+/);
      if (match) return Math.min(Math.max(parseInt(match[0], 10), 2), 6);
    }
    return 4;
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Frontend Developer', 'Backend Developer']);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [postToExplore, setPostToExplore] = useState(false);
  const [recruitmentHeadline, setRecruitmentHeadline] = useState('');
  const [commsLink, setCommsLink] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<any>(null);

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
        summary: summaryText,
        description: descriptionText,
        category: problemCategory,
        difficulty: problemDifficulty,
        status: postToExplore ? 'Recruiting' : 'In Progress',
        technologies: requiredSkills.length > 0 ? requiredSkills : ['Full Stack'],
        required_skills: requiredSkills.length > 0 ? requiredSkills : ['Software Engineering'],
        desired_roles: selectedRoles.length > 0 ? selectedRoles : ['Developer'],
        current_team_size: 1,
        desired_team_size: targetTeamSize,
        problem_statement_id: problemId,
        owner_id: user.id,
      };

      let finalProject = null;

      if (isSupabaseConfigured()) {
        // Ensure user profile exists
        try {
          await supabase.from('profiles').upsert(
            {
              user_id: user.id,
              display_name: profile?.display_name || user?.user_metadata?.full_name || 'Student Builder',
              username: profile?.username || `user_${user.id.slice(0, 8)}`,
              role: profile?.role || 'student',
            },
            { onConflict: 'user_id' }
          );
        } catch {}

        const { data: dbProj, error: dbErr } = await supabase
          .from('projects')
          .insert(projectPayload)
          .select(`
            *,
            owner:profiles!projects_owner_id_fkey(
              user_id,
              display_name,
              username,
              avatar_url,
              college
            )
          `)
          .single();

        if (dbErr) {
          console.warn('Notice writing project to DB:', dbErr.message);
          // Fallback to local memory / client project object
          finalProject = {
            id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...projectPayload,
            created_at: new Date().toISOString(),
            owner: {
              user_id: user.id,
              display_name: profile?.display_name || 'Team Lead',
              avatar_url: profile?.avatar_url,
            },
          };
        } else {
          finalProject = dbProj;
          // Add owner as accepted team lead in project_members
          try {
            await supabase.from('project_members').insert({
              project_id: dbProj.id,
              user_id: user.id,
              role: 'Team Lead',
              status: 'Accepted',
            });
          } catch {}
        }
      } else {
        // Demo mode
        finalProject = {
          id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...projectPayload,
          created_at: new Date().toISOString(),
          owner: {
            user_id: user.id,
            display_name: profile?.display_name || 'Team Lead',
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
              <span>Collegiate Challenge Squad</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Form a Student Team</h2>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
              Challenge: <strong className="text-brand-300">{problemTitle}</strong>
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
                {postToExplore ? (
                  <span className="block mt-1 text-emerald-300 font-semibold">
                    ✓ Also published to Explore Projects so other students can discover and join your squad.
                  </span>
                ) : (
                  <span className="block mt-1 text-slate-300 font-medium">
                    Scoped specifically to this faculty problem challenge.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/projects/${createdProject.id}/workspace`}>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold px-6"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Open Team Workspace
                </Button>
              </Link>
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
            {error && (
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
                  <option value={2}>2 Members (Pair)</option>
                  <option value={3}>3 Members (Trio)</option>
                  <option value={4}>4 Members (Squad)</option>
                  <option value={5}>5 Members (Extended)</option>
                  <option value={6}>6 Members (Full Team)</option>
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

            {/* SPECIAL USER OPTION: Post this in Explore Project */}
            <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3">
              <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setPostToExplore(!postToExplore)}>
                <div className="flex items-start gap-2.5">
                  <Globe className={`w-4 h-4 mt-0.5 shrink-0 ${postToExplore ? 'text-brand-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Post this student team to Explore Projects
                    </span>
                    <span className="text-[11px] text-slate-300 block leading-relaxed mt-0.5">
                      Enable this if you want other Linkora students browsing Explore &amp; Teammates to discover your squad and apply to join. If unchecked, your team stays exclusively within this faculty challenge.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={postToExplore}
                  onChange={(e) => setPostToExplore(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-charcoal-800 border-charcoal-600 shrink-0 cursor-pointer"
                />
              </div>

              {/* Expandable recruitment fields when checked */}
              {postToExplore && (
                <div className="pt-3 border-t border-charcoal-750/80 space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-brand-300 block">
                      Public Recruitment Pitch (Optional)
                    </label>
                    <Input
                      type="text"
                      value={recruitmentHeadline}
                      onChange={(e) => setRecruitmentHeadline(e.target.value)}
                      placeholder="e.g. Looking for 1 frontend dev to tackle Professor Sharma's challenge with us!"
                      className="text-xs bg-charcoal-800 border-charcoal-700 text-white placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Discord / WhatsApp Squad Invite Link (Optional)
                    </label>
                    <Input
                      type="url"
                      value={commsLink}
                      onChange={(e) => setCommsLink(e.target.value)}
                      placeholder="https://discord.gg/... or WhatsApp group link"
                      className="text-xs bg-charcoal-800 border-charcoal-700 text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}
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
