'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWorkspace } from '../layout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ProjectTask, ProjectMilestone, TaskStatus, TaskPriority } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Avatar } from '@/components/ui/Avatar';
import {
  CheckSquare,
  PlusCircle,
  Search,
  Filter,
  Columns,
  List as ListIcon,
  Calendar,
  AlertCircle,
  Clock,
  User,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
  Milestone as MilestoneIcon,
  CheckCircle2,
} from 'lucide-react';

const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'In Review', 'Completed'];
const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

export default function WorkspaceTasksPage() {
  const { user } = useAuth();
  const { project, members, isLead } = useWorkspace();

  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View state
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('Medium');
  const [taskAssigneeId, setTaskAssigneeId] = useState<string>('');
  const [taskMilestoneId, setTaskMilestoneId] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEvidenceUrl, setTaskEvidenceUrl] = useState('');
  const [taskEvidenceNote, setTaskEvidenceNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadTasksAndMilestones = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch tasks with assignee and milestone relations
      const { data: tasksData, error: taskError } = await supabase
        .from('project_tasks')
        .select(`
          *,
          assignee:profiles!project_tasks_assignee_id_fkey(
            user_id,
            display_name,
            username,
            avatar_url
          ),
          creator:profiles!project_tasks_creator_id_fkey(
            user_id,
            display_name,
            username
          ),
          milestone:project_milestones!project_tasks_milestone_id_fkey(
            id,
            title
          )
        `)
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (!taskError && tasksData) {
        setTasks(tasksData as unknown as ProjectTask[]);
      }

      // 2. Fetch milestones for association
      const { data: mileData } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', project.id)
        .order('target_date', { ascending: true });

      if (mileData) {
        setMilestones(mileData as ProjectMilestone[]);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    loadTasksAndMilestones();

    // Supabase Realtime subscription for tasks
    const channel = supabase
      .channel(`project-tasks-${project.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_tasks',
          filter: `project_id=eq.${project.id}`,
        },
        () => {
          loadTasksAndMilestones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, loadTasksAndMilestones]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskStatus('To Do');
    setTaskPriority('Medium');
    setTaskAssigneeId('');
    setTaskMilestoneId('');
    setTaskDueDate('');
    setTaskEvidenceUrl('');
    setTaskEvidenceNote('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: ProjectTask) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskStatus(task.status);
    setTaskPriority(task.priority);
    setTaskAssigneeId(task.assignee_id || '');
    setTaskMilestoneId(task.milestone_id || '');
    setTaskDueDate(task.due_date || '');
    setTaskEvidenceUrl(task.evidence_url || '');
    setTaskEvidenceNote(task.evidence_note || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (taskTitle.trim().length < 3) {
      setFormError('Task title must be at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        project_id: project.id,
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        status: taskStatus,
        priority: taskPriority,
        assignee_id: taskAssigneeId || null,
        milestone_id: taskMilestoneId || null,
        due_date: taskDueDate || null,
        evidence_url: taskEvidenceUrl.trim() || null,
        evidence_note: taskEvidenceNote.trim() || null,
      };

      if (editingTask) {
        // Update task
        const { error } = await supabase
          .from('project_tasks')
          .update(payload)
          .eq('id', editingTask.id);

        if (error) {
          if (error.code === '42501') {
            setFormError(
              'Permission check failed: Please execute the latest migration in your Supabase SQL Editor.'
            );
          } else {
            setFormError(error.message || 'Could not update task.');
          }
          setIsSubmitting(false);
          return;
        }
      } else {
        // Create task
        const { error } = await supabase.from('project_tasks').insert({
          ...payload,
          creator_id: user.id,
        });

        if (error) {
          if (error.code === '42501') {
            setFormError(
              'Permission check failed: Please execute the latest migration in your Supabase SQL Editor.'
            );
          } else {
            setFormError(error.message || 'Could not create task.');
          }
          setIsSubmitting(false);
          return;
        }
      }

      setIsModalOpen(false);
      await loadTasksAndMilestones();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error saving task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      const existingTask = tasks.find((t) => t.id === taskId);
      if (!existingTask) return;

      // Try atomic RPC first
      const { data: rpcData, error: rpcErr } = await supabase.rpc('save_project_task', {
        p_project_id: project.id,
        p_title: existingTask.title,
        p_description: existingTask.description || null,
        p_status: newStatus,
        p_priority: existingTask.priority,
        p_assignee_id: existingTask.assignee_id || null,
        p_milestone_id: existingTask.milestone_id || null,
        p_due_date: existingTask.due_date || null,
        task_id: taskId,
      });

      if (rpcErr || (rpcData && !rpcData.success)) {
        // Fallback to direct update
        const { error } = await supabase
          .from('project_tasks')
          .update({ status: newStatus })
          .eq('id', taskId);

        if (error) {
          await loadTasksAndMilestones();
        }
      } else {
        await loadTasksAndMilestones();
      }
    } catch {
      await loadTasksAndMilestones();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this task?');
    if (!confirm) return;

    try {
      const { error } = await supabase.from('project_tasks').delete().eq('id', taskId);
      if (error) {
        alert(error.message || 'Failed to delete task.');
      } else {
        await loadTasksAndMilestones();
      }
    } catch {
      alert('Error deleting task.');
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== 'Completed'
  ).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'All') {
      if (filterAssignee === 'Unassigned' && t.assignee_id) return false;
      if (filterAssignee !== 'Unassigned' && t.assignee_id !== filterAssignee) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Metrics Banner */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-400" />
              <span>Workspace Tasks & Kanban</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Collaborative workboard for managing sprints, features, and teammate assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Synced
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Create Task
            </Button>
          </div>
        </div>

        {/* Progress Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-charcoal-800">
          <div className="bg-charcoal-850 p-3 rounded-xl border border-charcoal-750">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Total Tasks
            </span>
            <span className="text-xl font-extrabold text-white mt-1 block">
              {totalTasks}
            </span>
          </div>

          <div className="bg-charcoal-850 p-3 rounded-xl border border-charcoal-750">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">
              Completed
            </span>
            <span className="text-xl font-extrabold text-emerald-300 mt-1 block">
              {completedTasks} ({completionPercentage}%)
            </span>
          </div>

          <div className="bg-charcoal-850 p-3 rounded-xl border border-charcoal-750">
            <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-semibold block">
              In Progress
            </span>
            <span className="text-xl font-extrabold text-indigo-300 mt-1 block">
              {inProgressTasks}
            </span>
          </div>

          <div className="bg-charcoal-850 p-3 rounded-xl border border-charcoal-750">
            <span className="text-[11px] uppercase tracking-wider text-rose-400 font-semibold block">
              Overdue
            </span>
            <span className="text-xl font-extrabold text-rose-300 mt-1 block">
              {overdueTasks}
            </span>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-slate-300 focus:outline-none"
          >
            <option value="All">All Assignees</option>
            <option value="Unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.profile?.display_name || 'Member'}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher: Kanban vs List */}
        <div className="flex items-center gap-1 bg-charcoal-850 p-1 rounded-lg border border-charcoal-750">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-charcoal-750 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Kanban Board View"
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-charcoal-750 text-white font-medium'
                : 'text-slate-400 hover:text-white'
            }`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Task Views */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading task board...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {TASK_STATUSES.map((status) => {
            const columnTasks = filteredTasks.filter((t) => t.status === status);

            return (
              <div
                key={status}
                className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-4 space-y-3 min-h-[300px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === 'Completed'
                          ? 'bg-emerald-400'
                          : status === 'In Progress'
                          ? 'bg-indigo-400'
                          : status === 'In Review'
                          ? 'bg-amber-400'
                          : 'bg-slate-400'
                      }`}
                    />
                    {status}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-charcoal-800 text-slate-400">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Tasks */}
                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-600">
                      No tasks
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const isOverdue =
                        task.due_date &&
                        task.due_date < today &&
                        task.status !== 'Completed';

                      return (
                        <div
                          key={task.id}
                          className="rounded-xl bg-charcoal-850 border border-charcoal-750 p-4 space-y-3 hover:border-charcoal-650 transition-all shadow-subtle group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                                task.priority === 'High'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                              }`}
                            >
                              {task.priority}
                            </span>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditModal(task)}
                                className="p-1 rounded text-slate-400 hover:text-white"
                                title="Edit Task"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {(isLead || task.creator_id === user?.id) && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded text-slate-400 hover:text-red-400"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h4 className="text-sm font-semibold text-white leading-snug">
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {task.milestone && (
                            <div className="flex items-center gap-1 text-[11px] text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                              <MilestoneIcon className="w-3 h-3" />
                              <span className="truncate">{task.milestone.title}</span>
                            </div>
                          )}

                          {(task.evidence_url || task.evidence_note) && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Evidence Attached</span>
                            </div>
                          )}

                          {/* Meta footer: Due date & Assignee */}
                          <div className="pt-2 border-t border-charcoal-750 flex items-center justify-between text-xs">
                            {task.due_date ? (
                              <span
                                className={`flex items-center gap-1 text-[11px] font-medium ${
                                  isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                                }`}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                {task.due_date} {isOverdue && '⚠️'}
                              </span>
                            ) : (
                              <span />
                            )}

                            {task.assignee ? (
                              <div
                                className="flex items-center gap-1.5"
                                title={`Assigned to ${task.assignee.display_name}`}
                              >
                                <Avatar
                                  name={task.assignee.display_name || 'Member'}
                                  src={task.assignee.avatar_url}
                                  size="sm"
                                />
                                <span className="text-[11px] text-slate-300 max-w-[80px] truncate">
                                  {task.assignee.display_name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Unassigned</span>
                            )}
                          </div>

                          {/* Quick move status menu */}
                          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-charcoal-800">
                            <span>Move to:</span>
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleMoveStatus(task.id, e.target.value as TaskStatus)
                              }
                              className="bg-charcoal-800 text-slate-300 rounded px-1.5 py-0.5 border border-charcoal-700 text-[11px] focus:outline-none"
                            >
                              {TASK_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 overflow-hidden divide-y divide-charcoal-800">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No tasks match your search and filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue =
                task.due_date &&
                task.due_date < today &&
                task.status !== 'Completed';

              return (
                <div
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-charcoal-850/60 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          task.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : task.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <h4 className="text-sm font-semibold text-white truncate">
                        {task.title}
                      </h4>
                      {task.milestone && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                          {task.milestone.title}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Right meta and controls */}
                  <div className="flex items-center gap-4 text-xs shrink-0 flex-wrap">
                    {task.due_date && (
                      <span
                        className={`flex items-center gap-1 ${
                          isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {task.due_date} {isOverdue && '⚠️'}
                      </span>
                    )}

                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={task.assignee.display_name || 'Member'}
                          src={task.assignee.avatar_url}
                          size="sm"
                        />
                        <span className="text-slate-300 max-w-[90px] truncate">
                          {task.assignee.display_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}

                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleMoveStatus(task.id, e.target.value as TaskStatus)
                      }
                      className="bg-charcoal-800 text-slate-200 border border-charcoal-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {(isLead || task.creator_id === user?.id) && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-400" />
              <span>{editingTask ? 'Edit Task' : 'Create New Task'}</span>
            </h2>

            {formError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Implement user login API endpoint"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Description & Acceptance Criteria
                </label>
                <Textarea
                  placeholder="Provide context, links, or technical notes..."
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Initial Status"
                  options={TASK_STATUSES.map((s) => ({ value: s, label: s }))}
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                />

                <Select
                  label="Priority Level"
                  options={TASK_PRIORITIES.map((p) => ({ value: p, label: p }))}
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Assignee
                  </label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.profile?.display_name || 'Member'} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Milestone Link
                  </label>
                  <select
                    value={taskMilestoneId}
                    onChange={(e) => setTaskMilestoneId(e.target.value)}
                    className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value="">None (Independent task)</option>
                    {milestones.map((ms) => (
                      <option key={ms.id} value={ms.id}>
                        {ms.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-charcoal-850 border border-charcoal-750 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              {/* Contribution Evidence Fields */}
              <div className="pt-3 border-t border-charcoal-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>Contribution Evidence (Deliverable Proof)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Attach a pull request URL or deliverable note to showcase in your verified student portfolio upon task completion.
                </p>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Deliverable / PR / Commit URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://github.com/.../pull/12 or live demo"
                    value={taskEvidenceUrl}
                    onChange={(e) => setTaskEvidenceUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Contribution Description / Evidence Note
                  </label>
                  <Input
                    placeholder="e.g. Implemented JWT auth middleware with 95% unit test coverage"
                    value={taskEvidenceNote}
                    onChange={(e) => setTaskEvidenceNote(e.target.value)}
                  />
                </div>
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
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
