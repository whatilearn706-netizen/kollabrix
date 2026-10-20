'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProjectMember } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';

export type SprintTaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';
export type SprintTaskPriority = 'Low' | 'Medium' | 'High';

export interface SprintTask {
  id: string;
  title: string;
  description?: string;
  status: SprintTaskStatus;
  priority: SprintTaskPriority;
  assignee_id?: string;
  assignee_name?: string;
  assignee_avatar?: string | null;
  due_time?: string;
  created_at: string;
}

interface HackathonSprintTasksProps {
  projectId: string;
  members: ProjectMember[];
  isClosed?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}

const STATUS_COLUMNS: { id: SprintTaskStatus; label: string; accent: string; badgeBg: string }[] = [
  { id: 'To Do', label: 'To Do', accent: 'border-slate-700 bg-slate-900/40', badgeBg: 'bg-slate-800 text-slate-300' },
  { id: 'In Progress', label: 'In Progress', accent: 'border-amber-500/30 bg-amber-500/5', badgeBg: 'bg-amber-500/20 text-amber-300' },
  { id: 'In Review', label: 'In Review', accent: 'border-violet-500/30 bg-violet-500/5', badgeBg: 'bg-violet-500/20 text-violet-300' },
  { id: 'Completed', label: 'Completed', accent: 'border-emerald-500/30 bg-emerald-500/5', badgeBg: 'bg-emerald-500/20 text-emerald-300' },
];

export function HackathonSprintTasks({
  projectId,
  members,
  isClosed = false,
  currentUserId,
  currentUserName,
}: HackathonSprintTasksProps) {
  const [tasks, setTasks] = useState<SprintTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | SprintTaskPriority>('All');

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SprintTaskPriority>('Medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueTime, setDueTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Persistence Key
  const storageKey = `teamforge_hackathon_tasks_${projectId}`;
  const channelRef = useRef<any>(null);

  // Load Initial Tasks
  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setIsLoading(true);
      try {
        // 1. Try fetching from /api/workspace/data
        const res = await fetch(`/api/workspace/data?projectId=${projectId}`);
        const json = await res.json();
        if (isMounted && json?.data?.sprint_tasks && Array.isArray(json.data.sprint_tasks)) {
          setTasks(json.data.sprint_tasks);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not load sprint tasks from api:', err);
      }

      // 2. Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(storageKey);
          if (cached && isMounted) {
            setTasks(JSON.parse(cached));
          } else if (isMounted) {
            // Seed sample tasks for initial sprint setup
            const initialSeed: SprintTask[] = [
              {
                id: 'task-seed-1',
                title: 'Review Problem Statement & Outline Architecture',
                description: 'Pick challenge track and define tech stack for the project deliverable.',
                status: 'Completed',
                priority: 'High',
                assignee_name: currentUserName || 'Team Lead',
                due_time: 'Sprint Start',
                created_at: new Date().toISOString(),
              },
              {
                id: 'task-seed-2',
                title: 'Build Core MVP & API Endpoints',
                description: 'Implement main feature logic and wire frontend to backend.',
                status: 'In Progress',
                priority: 'High',
                assignee_name: currentUserName || 'Full-Stack Dev',
                due_time: 'Mid-Sprint',
                created_at: new Date().toISOString(),
              },
              {
                id: 'task-seed-3',
                title: 'Record 2-Minute Demo Video & Test Live Preview',
                description: 'Capture walkthrough of working features for jury evaluation.',
                status: 'To Do',
                priority: 'Medium',
                assignee_name: 'Squad Teammate',
                due_time: 'Final Hour',
                created_at: new Date().toISOString(),
              },
            ];
            setTasks(initialSeed);
            localStorage.setItem(storageKey, JSON.stringify(initialSeed));
          }
        } catch {}
      }
      if (isMounted) setIsLoading(false);
    }

    loadTasks();

    // Setup Supabase Realtime Channel for Live Teammate Syncing
    try {
      const channel = supabase.channel(`hackathon-tasks-${projectId}`);
      channel
        .on('broadcast', { event: 'tasks_updated' }, (payload) => {
          if (payload?.tasks && Array.isArray(payload.tasks)) {
            setTasks(payload.tasks);
            try {
              localStorage.setItem(storageKey, JSON.stringify(payload.tasks));
            } catch {}
          }
        })
        .subscribe();
      channelRef.current = channel;
    } catch (e) {}

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [projectId, storageKey, currentUserName]);

  // Sync to backend and broadcast to teammates
  const persistTasks = async (updatedList: SprintTask[]) => {
    setTasks(updatedList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
      } catch {}
    }

    // Broadcast via Realtime channel
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'tasks_updated',
          tasks: updatedList,
        });
      } catch {}
    }

    // Persist to server api
    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          data: { sprint_tasks: updatedList },
        }),
      });
    } catch (err) {
      console.warn('Failed to persist tasks to /api/workspace/data:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isClosed) return;

    setIsSaving(true);
    const assignedMember = members.find((m) => m.user_id === assigneeId);

    const newTask: SprintTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'To Do',
      priority,
      assignee_id: assigneeId || undefined,
      assignee_name: assignedMember?.profile?.display_name || currentUserName || 'Unassigned',
      assignee_avatar: assignedMember?.profile?.avatar_url || null,
      due_time: dueTime.trim() || 'Sprint Sprint',
      created_at: new Date().toISOString(),
    };

    const nextList = [newTask, ...tasks];
    await persistTasks(nextList);

    // Reset Form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setAssigneeId('');
    setDueTime('');
    setIsSaving(false);
    setIsAddModalOpen(false);
  };

  const handleStatusChange = async (taskId: string, newStatus: SprintTaskStatus) => {
    if (isClosed) return;
    const nextList = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    await persistTasks(nextList);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isClosed) return;
    const nextList = tasks.filter((t) => t.id !== taskId);
    await persistTasks(nextList);
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.assignee_name && t.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  // Statistics
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Sprint Header & Progress Metric */}
      <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-400" />
                <span>Sprint Kanban & Execution Board</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Coordinate team deliverables, divide problem modules, and track progress before the deadline.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!isClosed ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold w-full sm:w-auto"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Sprint Task
              </Button>
            ) : (
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Sprint Closed</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-charcoal-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Sprint Completion: <strong className="text-white">{completedCount} of {tasks.length} tasks done</strong>
            </span>
            <span className="font-mono font-bold text-amber-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sprint tasks or teammates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] font-mono">Priority:</span>
            {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  priorityFilter === p
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-white bg-charcoal-950 border border-charcoal-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading sprint board...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`p-3.5 rounded-2xl border ${col.accent} flex flex-col justify-between min-h-[420px] transition-all`}
              >
                <div className="space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${col.badgeBg}`}>
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks in Column */}
                  <div className="space-y-2.5">
                    {colTasks.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-500 font-mono border border-dashed border-charcoal-800 rounded-xl p-3">
                        No tasks in {col.label}
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750/90 hover:border-amber-500/40 transition-all space-y-2.5 shadow-xs group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${
                                task.priority === 'High'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : task.priority === 'Medium'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {task.priority} Priority
                            </span>

                            {!isClosed && (
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                            {task.description && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-slate-300">
                              <User className="w-3 h-3 text-amber-400" />
                              <span className="truncate max-w-[100px]">{task.assignee_name || 'Squad'}</span>
                            </span>

                            {task.due_time && (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                                <Clock className="w-3 h-3 text-slate-500" />
                                {task.due_time}
                              </span>
                            )}
                          </div>

                          {/* Quick Status Advancers */}
                          {!isClosed && (
                            <div className="pt-1.5 flex items-center justify-between gap-1 border-t border-charcoal-850">
                              {col.id !== 'To Do' && (
                                <button
                                  onClick={() => {
                                    const prevStatus: Record<SprintTaskStatus, SprintTaskStatus> = {
                                      'To Do': 'To Do',
                                      'In Progress': 'To Do',
                                      'In Review': 'In Progress',
                                      Completed: 'In Review',
                                    };
                                    handleStatusChange(task.id, prevStatus[col.id]);
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 p-1 rounded-md hover:bg-charcoal-800 transition-colors"
                                  title="Move backwards"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                  <span>Back</span>
                                </button>
                              )}

                              <div className="flex-1" />

                              {col.id !== 'Completed' && (
                                <button
                                  onClick={() => {
                                    const nextStatus: Record<SprintTaskStatus, SprintTaskStatus> = {
                                      'To Do': 'In Progress',
                                      'In Progress': 'In Review',
                                      'In Review': 'Completed',
                                      Completed: 'Completed',
                                    };
                                    handleStatusChange(task.id, nextStatus[col.id]);
                                  }}
                                  className="text-[10px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-0.5 p-1 rounded-md hover:bg-amber-500/10 transition-colors"
                                  title="Move to next stage"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Add Quick Card Button */}
                {!isClosed && col.id === 'To Do' && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full mt-3 py-2 rounded-xl border border-dashed border-charcoal-700 hover:border-amber-500/50 text-slate-400 hover:text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Sprint Task Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Hackathon Sprint Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Wireframe Supabase auth, train sentiment model..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description / Spec</label>
            <textarea
              rows={3}
              placeholder="Key requirements, API endpoints, or deliverable details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SprintTaskPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="High">🔥 High Priority</option>
                <option value="Medium">⚡ Medium Priority</option>
                <option value="Low">💤 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assign Teammate</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Unassigned (Squad)</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.profile?.display_name || 'Teammate'} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Timeline / Milestone</label>
            <input
              type="text"
              placeholder="e.g. Hour 2, Before Demo, Tonight"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold"
            >
              Add to Board
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
