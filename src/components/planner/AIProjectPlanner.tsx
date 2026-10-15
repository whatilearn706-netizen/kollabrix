'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { AIPlanDraft, Project } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Milestone,
  CheckSquare,
  Users,
  Code2,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  Bot,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';

interface AIProjectPlannerProps {
  project?: Project;
  onPlanApplied?: () => void;
}

export function AIProjectPlanner({ project, onPlanApplied }: AIProjectPlannerProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Input states
  const [idea, setIdea] = useState(project?.title || '');
  const [problemStatement, setProblemStatement] = useState(
    project?.summary || project?.description?.slice(0, 200) || ''
  );
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [teamSize, setTeamSize] = useState(project?.desired_team_size || 4);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [techInput, setTechInput] = useState(
    project?.technologies?.join(', ') || 'Next.js, TypeScript, Tailwind, Supabase'
  );

  // Generation & plan states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [engineUsed, setEngineUsed] = useState<string | null>(null);
  const [plan, setPlan] = useState<AIPlanDraft | null>(null);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!idea.trim()) {
      setError('Please provide a project idea or concept.');
      return;
    }

    setIsGenerating(true);

    try {
      const technologies = techInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: idea.trim(),
          problemStatement: problemStatement.trim(),
          desiredOutcome: desiredOutcome.trim(),
          teamSize,
          durationWeeks,
          technologies,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate project plan');
      }

      setPlan(data.plan as AIPlanDraft);
      setEngineUsed(data.engine || 'Planning Engine');
      setSuccess('Actionable project plan draft generated! You can review and edit below.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error generating plan');
    } finally {
      setIsGenerating(false);
    }
  };

  // Modify task title in draft
  const handleUpdateTaskTitle = (mIdx: number, tIdx: number, newTitle: string) => {
    if (!plan) return;
    const updated = { ...plan };
    updated.milestones[mIdx].tasks[tIdx].title = newTitle;
    setPlan(updated);
  };

  // Remove task from draft
  const handleRemoveTask = (mIdx: number, tIdx: number) => {
    if (!plan) return;
    const updated = { ...plan };
    updated.milestones[mIdx].tasks.splice(tIdx, 1);
    setPlan(updated);
  };

  // Add custom task to milestone
  const handleAddTask = (mIdx: number) => {
    if (!plan) return;
    const updated = { ...plan };
    updated.milestones[mIdx].tasks.push({
      title: 'New Custom Task',
      description: 'Describe requirements for this task',
      priority: 'Medium',
      suggested_role: 'Contributor',
      acceptance_criteria: ['Completed and tested'],
    });
    setPlan(updated);
  };

  // Apply plan to Project Workspace (Create Milestones and Tasks in Supabase)
  const handleApplyToWorkspace = async () => {
    if (!plan || !project) return;
    if (!user) {
      setError('You must be signed in to apply this plan.');
      return;
    }

    setIsApplying(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSupabaseConfigured()) {
        // 1. Create each milestone and its tasks in sequence
        for (let i = 0; i < plan.milestones.length; i++) {
          const m = plan.milestones[i];
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + m.weeks_from_start * 7);

          const { data: createdMilestone, error: mError } = await supabase
            .from('project_milestones')
            .insert({
              project_id: project.id,
              title: m.title,
              description: m.description,
              target_date: targetDate.toISOString(),
              status: i === 0 ? 'In Progress' : 'Upcoming',
              created_by: user.id,
            })
            .select('id')
            .single();

          if (mError) {
            console.warn('Milestone creation note:', mError);
            continue;
          }

          if (createdMilestone && m.tasks && m.tasks.length > 0) {
            const taskInserts = m.tasks.map((t) => ({
              project_id: project.id,
              milestone_id: createdMilestone.id,
              title: t.title,
              description: `${t.description}\n\nSuggested Role: ${t.suggested_role}\nAcceptance Criteria:\n- ${t.acceptance_criteria?.join('\n- ')}`,
              priority: t.priority || 'Medium',
              status: 'To Do',
              creator_id: user.id,
            }));

            const { error: tError } = await supabase.from('project_tasks').insert(taskInserts);
            if (tError) {
              console.warn('Task insertion note:', tError);
            }
          }
        }

        // 2. Save plan record into ai_project_plans
        try {
          await supabase.from('ai_project_plans').insert({
            project_id: project.id,
            user_id: user.id,
            title: `${project.title} - Approved Roadmap`,
            prompt_inputs: { idea, problemStatement, desiredOutcome, teamSize, durationWeeks },
            plan_data: plan,
            status: 'applied',
          });
        } catch {
          // Non-critical
        }
      }

      setSuccess('Plan approved! Milestones and tasks have been created in your project workspace.');

      if (onPlanApplied) {
        onPlanApplied();
      }

      setTimeout(() => {
        router.push(`/projects/${project.id}/workspace/tasks`);
        router.refresh();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to apply plan to workspace');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-charcoal-900 to-brand-950/60 border border-indigo-500/30 p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI Project Planner</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Phase 4
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                Transform any project idea into an actionable engineering roadmap with MVP features, timeline milestones, acceptance criteria, and role-based tasks.
              </p>
            </div>
          </div>

          {engineUsed && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-charcoal-800 text-slate-300 border border-charcoal-700 font-mono shrink-0 self-start sm:self-auto">
              Engine: <strong>{engineUsed}</strong>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Input Parameters Form */}
      <form
        onSubmit={handleGeneratePlan}
        className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5"
      >
        <div className="border-b border-charcoal-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Project Scope & Inputs</h3>
            <p className="text-xs text-slate-400">
              Provide project parameters to generate a custom software engineering plan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Project Idea / Title"
            required
            placeholder="e.g. Campus Autonomous Delivery Bot or AI Study Partner"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />

          <Input
            label="Target Tech Stack & Tools"
            placeholder="e.g. Next.js, Python, PyTorch, Supabase, Tailwind"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            helperText="Comma-separated technologies and frameworks."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            label="Problem to Solve"
            rows={2}
            placeholder="What inefficiency, campus challenge, or student pain point does this address?"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />

          <Textarea
            label="Desired Outcome / Final Deliverable"
            rows={2}
            placeholder="e.g. A functional mobile app with 100+ beta testers by semester end."
            value={desiredOutcome}
            onChange={(e) => setDesiredOutcome(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Team Size: <strong className="text-white">{teamSize} Students</strong>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Solo (1)</span>
              <span>Pair (2)</span>
              <span>Medium (4)</span>
              <span>Large (8)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Available Timeline: <strong className="text-white">{durationWeeks} Weeks</strong>
            </label>
            <input
              type="range"
              min={2}
              max={16}
              step={2}
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Hackathon (2w)</span>
              <span>Midterm (6w)</span>
              <span>Semester (12w)</span>
              <span>Capstone (16w)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4 text-brand-300" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {plan ? 'Regenerate Draft Plan' : 'Generate Project Plan'}
          </Button>
        </div>
      </form>

      {/* Generated Plan Review & Edit Workspace */}
      {plan && (
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/90 p-6 space-y-6 animate-fadeIn">
          {/* Plan Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Draft Roadmap & Task Breakdown
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review, customize, and approve before syncing to your project workspace.
              </p>
            </div>

            {project ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isApplying}
                onClick={handleApplyToWorkspace}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Approve & Sync to Workspace
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Link this plan to a project to export tasks directly to Kanban.
              </span>
            )}
          </div>

          {/* Scope & Objectives */}
          <div className="p-4 rounded-xl bg-charcoal-850/70 border border-charcoal-750/70 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Project Scope:
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">{plan.scope}</p>

            <div className="pt-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Core Objectives:
              </span>
              <ul className="space-y-1">
                {plan.objectives?.map((obj, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-brand-400 font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* MVP Features & Recommended Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-charcoal-850/70 border border-charcoal-750/70 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-brand-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MVP Features:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {plan.mvp_features?.map((feat, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-500">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-charcoal-850/70 border border-charcoal-750/70 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Recommended Stack:</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {plan.recommended_stack?.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 rounded-lg bg-charcoal-800 text-slate-200 border border-charcoal-700 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggested Roles Distribution */}
          {plan.suggested_roles && plan.suggested_roles.length > 0 && (
            <div className="p-4 rounded-xl bg-charcoal-850/70 border border-charcoal-750/70 space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-400" />
                <span>Suggested Team Roles:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {plan.suggested_roles.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-charcoal-800/80 border border-charcoal-700/80 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <strong className="text-white">{r.role}</strong>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">
                        x{r.count}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{r.responsibility}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Milestones & Tasks Editor */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Milestone className="w-4 h-4 text-brand-400" />
              <span>Milestones & Actionable Tasks ({plan.milestones?.length || 0})</span>
            </h4>

            <div className="space-y-4">
              {plan.milestones?.map((milestone, mIdx) => (
                <div
                  key={mIdx}
                  className="rounded-xl bg-charcoal-850/80 border border-charcoal-750 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-800 pb-2.5">
                    <div>
                      <h5 className="text-sm font-bold text-white">{milestone.title}</h5>
                      <p className="text-xs text-slate-400">{milestone.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono shrink-0 self-start sm:self-auto">
                      Target: Week {milestone.weeks_from_start}
                    </span>
                  </div>

                  {/* Tasks under this Milestone */}
                  <div className="space-y-2">
                    {milestone.tasks?.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-charcoal-800/60 border border-charcoal-750 text-xs hover:border-charcoal-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => handleUpdateTaskTitle(mIdx, tIdx, e.target.value)}
                            className="w-full bg-transparent text-slate-200 font-medium focus:outline-none focus:text-white"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                              task.priority === 'High'
                                ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                                : task.priority === 'Medium'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {task.suggested_role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTask(mIdx, tIdx)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                            title="Remove Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddTask(mIdx)}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-medium pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task to Milestone</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action Footer */}
          {project && (
            <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Approving this plan will populate the <strong>Kanban board</strong> and <strong>Milestone tracker</strong> in your workspace.
              </span>
              <Button
                type="button"
                variant="primary"
                isLoading={isApplying}
                onClick={handleApplyToWorkspace}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Approve & Sync to Workspace
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
