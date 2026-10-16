'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '../layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProjectMilestone, ProjectTask, MilestoneStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import {
  Milestone as MilestoneIcon,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  CheckSquare,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

const MILESTONE_STATUSES: MilestoneStatus[] = ['Upcoming', 'In Progress', 'Completed'];

interface MilestoneWithStats extends ProjectMilestone {
  tasks: ProjectTask[];
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}

export default function WorkspaceMilestonesPage() {
  const { user } = useAuth();
  const { project, isLead } = useWorkspace();

  const [milestones, setMilestones] = useState<MilestoneWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<MilestoneStatus>('Upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const FIX_MILESTONES_RLS_SQL = `-- Fix project_milestones Row Level Security (RLS) Policies
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members can view milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads can create milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Workspace members can create milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads can update milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Workspace members can update milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads can delete milestones" ON public.project_milestones;
DROP POLICY IF EXISTS "Leads or creators can delete milestones" ON public.project_milestones;

CREATE POLICY "Workspace members can view milestones"
    ON public.project_milestones FOR SELECT
    TO authenticated, anon
    USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_milestones.project_id));

CREATE POLICY "Workspace members can create milestones"
    ON public.project_milestones FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_milestones.project_id AND p.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid())
        OR auth.uid() = created_by
    );

CREATE POLICY "Workspace members can update milestones"
    ON public.project_milestones FOR UPDATE
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_milestones.project_id AND p.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid())
        OR auth.uid() = created_by
    );

CREATE POLICY "Leads or creators can delete milestones"
    ON public.project_milestones FOR DELETE
    TO authenticated
    USING (
        auth.uid() = created_by
        OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_milestones.project_id AND p.owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid() AND pm.role IN ('Project Lead', 'Lead', 'Admin', 'Owner'))
    );

NOTIFY pgrst, 'reload schema';`;

  const loadMilestonesData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch milestones
      const { data: milestonesData, error: msError } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', project.id)
        .order('target_date', { ascending: true });

      if (msError || !milestonesData) {
        setIsLoading(false);
        return;
      }

      // 2. Fetch all project tasks to derive actual progress atomically
      const { data: tasksData } = await supabase
        .from('project_tasks')
        .select('id, milestone_id, title, status, priority, due_date')
        .eq('project_id', project.id);

      const allTasks = (tasksData as ProjectTask[]) || [];

      // Calculate derived statistics for each milestone
      const enriched: MilestoneWithStats[] = (milestonesData as ProjectMilestone[]).map((ms) => {
        const linkedTasks = allTasks.filter((t) => t.milestone_id === ms.id);
        const total = linkedTasks.length;
        const completed = linkedTasks.filter((t) => t.status === 'Completed').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : ms.status === 'Completed' ? 100 : 0;

        return {
          ...ms,
          tasks: linkedTasks,
          totalTasks: total,
          completedTasks: completed,
          progressPercent: progress,
        };
      });

      setMilestones(enriched);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadMilestonesData();
  }, [loadMilestonesData]);

  const handleOpenCreate = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setTargetDate('');
    setStatus('Upcoming');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ms: ProjectMilestone) => {
    setEditingMilestone(ms);
    setTitle(ms.title);
    setDescription(ms.description || '');
    setTargetDate(ms.target_date);
    setStatus(ms.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isLead) return;

    if (title.trim().length < 3) {
      setFormError('Milestone title must be at least 3 characters.');
      return;
    }

    if (!targetDate) {
      setFormError('Target completion date is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        project_id: project.id,
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate,
        status,
      };

      if (editingMilestone) {
        const { error } = await supabase
          .from('project_milestones')
          .update(payload)
          .eq('id', editingMilestone.id);

        if (error) {
          setFormError(error.message || 'Could not update milestone.');
          setIsSubmitting(false);
          return;
        }
      } else {
        const { error } = await supabase
          .from('project_milestones')
          .insert({
            ...payload,
            created_by: user.id,
          });

        if (error) {
          // Attempt atomic RPC fallback if direct insert hits RLS restriction
          let rpcSuccess = false;
          try {
            const { data: rpcRes, error: rpcErr } = await supabase.rpc('create_project_milestone', {
              p_project_id: project.id,
              p_title: title.trim(),
              p_target_date: targetDate,
              p_description: description.trim() || null,
              p_status: status,
            });
            if (!rpcErr && rpcRes && rpcRes.success) {
              rpcSuccess = true;
            }
          } catch {}

          if (!rpcSuccess) {
            setFormError(error.message || 'Could not create milestone.');
            setIsSubmitting(false);
            return;
          }
        }
      }

      setIsModalOpen(false);
      await loadMilestonesData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!isLead) return;
    const confirm = window.confirm(
      'Are you sure you want to delete this milestone? Associated tasks will remain but become unlinked.'
    );
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', id);

      if (error) {
        alert(error.message || 'Failed to delete milestone.');
      } else {
        await loadMilestonesData();
      }
    } catch {
      alert('Error deleting milestone.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MilestoneIcon className="w-5 h-5 text-brand-400" />
            <span>Project Milestones & Deadlines</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track key target dates, release goals, and derived task completion percentages.
          </p>
        </div>

        {isLead && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Milestone
          </Button>
        )}
      </div>

      {/* Milestones List */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading milestones...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="p-12 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-4">
          <MilestoneIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Milestones Defined</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Break your project roadmap into key milestones to organize sprints and track verifiable delivery goals.
          </p>
          {isLead && (
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              Define First Milestone
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((ms) => {
            const isOverdue = ms.target_date < today && ms.status !== 'Completed';

            return (
              <div
                key={ms.id}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-4 hover:border-charcoal-700 transition-all"
              >
                {/* Header: Title, Status, Actions */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">{ms.title}</h3>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          ms.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : ms.status === 'In Progress'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {ms.status}
                      </span>
                      {isOverdue && (
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                          Overdue
                        </span>
                      )}
                    </div>

                    {ms.description && (
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                        {ms.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs flex items-center gap-1 font-mono ${
                        isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Target: {ms.target_date}
                    </span>

                    {isLead && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(ms)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
                          title="Edit Milestone"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(ms.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Derived Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-charcoal-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
                      <span>
                        Derived Task Completion:{' '}
                        <strong className="text-slate-200">
                          {ms.completedTasks} / {ms.totalTasks} tasks
                        </strong>
                      </span>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {ms.progressPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ms.progressPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-brand-600 to-indigo-500'
                      }`}
                      style={{ width: `${ms.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Associated Tasks Pills */}
                {ms.tasks.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {ms.tasks.map((t) => (
                      <span
                        key={t.id}
                        className={`text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 line-through'
                            : 'bg-charcoal-850 text-slate-300 border-charcoal-750'
                        }`}
                      >
                        {t.status === 'Completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {t.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MilestoneIcon className="w-5 h-5 text-brand-400" />
              <span>{editingMilestone ? 'Edit Milestone' : 'Create Milestone'}</span>
            </h2>

            {formError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{formError}</span>
                </div>

                {formError.toLowerCase().includes('row-level security') && (
                  <div className="mt-2 pt-2 border-t border-red-500/20 text-[11px] text-slate-300 space-y-2">
                    <p className="font-semibold text-amber-300">
                      ⚡ Database Notice: Table &quot;project_milestones&quot; requires updated RLS policies in Supabase.
                    </p>
                    <p className="text-slate-400">
                      Copy the SQL migration below and run it in your Supabase SQL Editor:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(FIX_MILESTONES_RLS_SQL);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-white font-mono text-[11px] font-bold border border-charcoal-700 transition-colors"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied SQL Migration!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-brand-400" />
                          <span>Copy SQL Migration</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveMilestone} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Milestone Title <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. MVP Alpha Demo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Description & Deliverable Scope
                </label>
                <Textarea
                  placeholder="Key features and deliverables that signify completion of this milestone..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Target Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-xs text-white focus:outline-none"
                    required
                  />
                </div>

                <Select
                  label="Status"
                  options={MILESTONE_STATUSES.map((s) => ({ value: s, label: s }))}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  {editingMilestone ? 'Save Changes' : 'Create Milestone'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
