'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  FileCode2,
  Trash2,
  Search,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Users,
  Building2,
  Sparkles,
  Filter,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProjectCategory, ProjectDifficulty } from '@/types/database';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';

interface AdminContentTabProps {
  authToken?: string;
}

const CATEGORIES: (ProjectCategory | 'All')[] = [
  'All',
  'Web Development',
  'AI/ML',
  'Mobile Apps',
  'Developer Tools',
  'Social Impact',
  'IoT/Hardware',
  'Other',
];

export function AdminContentTab({ authToken }: AdminContentTabProps) {
  const [subTab, setSubTab] = useState<'projects' | 'problems'>('projects');

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategory, setProjectCategory] = useState<ProjectCategory | 'All'>('All');

  // Problems State
  const [problems, setProblems] = useState<any[]>([]);
  const [isProblemsLoading, setIsProblemsLoading] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemCategory, setProblemCategory] = useState<ProjectCategory | 'All'>('All');

  // Delete Action Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'project' | 'problem';
    id: string;
    title: string;
    authorName?: string;
  } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Projects
  const loadProjects = async () => {
    setIsProjectsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/projects', { headers });
      const data = await res.json();
      if (res.ok && data?.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn('Error loading admin projects:', err);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Load Problems
  const loadProblems = async () => {
    setIsProblemsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/problems', { headers });
      const data = await res.json();
      if (res.ok && data?.problems) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.warn('Error loading admin faculty problems:', err);
    } finally {
      setIsProblemsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadProblems();
  }, [authToken]);

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setActionNotice(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const endpoint = deleteTarget.type === 'project' ? '/api/admin/projects' : '/api/admin/problems';
      const body =
        deleteTarget.type === 'project'
          ? { projectId: deleteTarget.id, title: deleteTarget.title, reason: deleteReason }
          : { problemId: deleteTarget.id, title: deleteTarget.title, reason: deleteReason };

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to delete ${deleteTarget.type}.`);
      }

      // Optimistic removal from state
      if (deleteTarget.type === 'project') {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      } else {
        setProblems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      }

      setActionNotice({
        type: 'success',
        message: `Successfully deleted "${deleteTarget.title}". It has been permanently removed across the entire platform.`,
      });

      setDeleteTarget(null);
      setDeleteReason('');
    } catch (err: unknown) {
      setActionNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error executing deletion.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (projectCategory !== 'All' && p.category !== projectCategory) return false;
      if (projectSearch.trim()) {
        const q = projectSearch.toLowerCase().trim();
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q) || p.summary?.toLowerCase().includes(q);
        const ownerMatch =
          p.owner?.display_name?.toLowerCase().includes(q) ||
          p.owner?.username?.toLowerCase().includes(q) ||
          p.owner?.college?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !ownerMatch) return false;
      }
      return true;
    });
  }, [projects, projectSearch, projectCategory]);

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (problemCategory !== 'All' && p.category !== problemCategory) return false;
      if (problemSearch.trim()) {
        const q = problemSearch.toLowerCase().trim();
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const authorMatch =
          p.author?.display_name?.toLowerCase().includes(q) ||
          p.author?.college?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !authorMatch) return false;
      }
      return true;
    });
  }, [problems, problemSearch, problemCategory]);

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white font-medium text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'projects'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Student & Team Projects</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-charcoal-950/60 border border-charcoal-700 font-mono">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('problems')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'problems'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <FileCode2 className="w-4 h-4 text-amber-400" />
            <span>Faculty Problem Statements</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-charcoal-950/60 border border-charcoal-700 font-mono">
              {problems.length}
            </span>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (subTab === 'projects') loadProjects();
            else loadProblems();
          }}
          isLoading={subTab === 'projects' ? isProjectsLoading : isProblemsLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PROJECTS MODERATION */}
      {/* ========================================================================= */}
      {subTab === 'projects' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-charcoal-800 bg-charcoal-900/40">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search projects by title, keywords, or creator (@username / college)..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div>
              <select
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project List */}
          {isProjectsLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
              Loading projects across the platform...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-charcoal-800 bg-charcoal-900/20 text-slate-500 text-xs">
              No projects found matching the filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-300">
                        {proj.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                        {proj.difficulty}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
                        {proj.status || 'Recruiting'}
                      </span>
                      {proj.is_demo && (
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                          Curated Demo
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {proj.summary || proj.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={proj.owner?.display_name || 'Owner'}
                          src={proj.owner?.avatar_url}
                          size="sm"
                        />
                        <span className="text-slate-300 font-medium">
                          {proj.owner?.display_name || 'Student Lead'}
                        </span>
                        {proj.owner?.college && (
                          <span className="text-slate-500 flex items-center gap-1">
                            • <VerifiedCollegeBadge college={proj.owner.college} isVerified={proj.owner.college_verified} size="xs" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {proj.members_count || proj.current_team_size || 1} / {proj.desired_team_size || 4} members
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <Link href={`/projects/${proj.id}`} target="_blank">
                      <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Project
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'project',
                          id: proj.id,
                          title: proj.title,
                          authorName: proj.owner?.display_name || 'Student Creator',
                        })
                      }
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete Project
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FACULTY PROBLEM STATEMENTS MODERATION */}
      {/* ========================================================================= */}
      {subTab === 'problems' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-charcoal-800 bg-charcoal-900/40">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search problem statements by title, keywords, or faculty name / college..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div>
              <select
                value={problemCategory}
                onChange={(e) => setProblemCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problems List */}
          {isProblemsLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
              Loading faculty problem statements...
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-charcoal-800 bg-charcoal-900/20 text-slate-500 text-xs">
              No faculty problem statements found matching the filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredProblems.map((prob) => (
                <div
                  key={prob.id}
                  className="p-5 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 hover:border-charcoal-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        {prob.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-charcoal-800 px-2 py-0.5 rounded border border-charcoal-700">
                        {prob.difficulty}
                      </span>
                      <span className="text-[10px] text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded font-medium">
                        {prob.status || 'Published'}
                      </span>
                      {prob.is_demo && (
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                          Curated Demo
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{prob.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                        {prob.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={prob.author?.display_name || 'Faculty'}
                          src={prob.author?.avatar_url}
                          size="sm"
                        />
                        <span className="text-slate-300 font-medium">
                          {prob.author?.display_name || 'Faculty Mentor'}
                        </span>
                        {prob.author?.college && (
                          <span className="text-slate-500 flex items-center gap-1">
                            • <VerifiedCollegeBadge college={prob.author.college} isVerified={prob.author.college_verified} size="xs" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{prob.applications_count || 0} student applications</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <Link href={`/problems/${prob.id}`} target="_blank">
                      <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Problem
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'problem',
                          id: prob.id,
                          title: prob.title,
                          authorName: prob.author?.display_name || 'Faculty Member',
                        })
                      }
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete Problem
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setDeleteReason('');
          }
        }}
        title={`Confirm Administrative Deletion`}
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Permanent Content Deletion Warning</span>
            </div>
            <p className="leading-relaxed">
              You are about to permanently delete{' '}
              <strong className="text-white">&ldquo;{deleteTarget?.title}&rdquo;</strong>{' '}
              {deleteTarget?.authorName ? `by ${deleteTarget.authorName}` : ''}.
            </p>
            <p className="text-[11px] text-red-300/80">
              {deleteTarget?.type === 'project'
                ? 'All associated team memberships, milestones, discussions, tasks, and applications will be permanently purged across the entire platform.'
                : 'All student applications for this problem statement will be removed and any linked projects will be unlinked.'}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Reason for Administrative Deletion (Optional / Audit Record)
            </label>
            <Input
              placeholder="e.g. Violation of academic guidelines, spam content, author request..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteReason('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={confirmDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
