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
  ShieldAlert,
  Plus,
  Ban,
  Check,
  Shield,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProjectCategory, ProjectDifficulty } from '@/types/database';
import { VerifiedCollegeBadge } from '@/components/profile/VerifiedCollegeBadge';
import {
  checkRestrictedWords,
  DEFAULT_RESTRICTED_WORDS,
} from '@/lib/moderation/restrictedWords';

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
  const [subTab, setSubTab] = useState<'projects' | 'problems' | 'moderation'>('projects');

  // Restricted Words & Moderation State
  const [restrictedWords, setRestrictedWords] = useState<string[]>(DEFAULT_RESTRICTED_WORDS);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [isModerationEnabled, setIsModerationEnabled] = useState(true);
  const [isModerationLoading, setIsModerationLoading] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  const [wordSearch, setWordSearch] = useState('');
  const [testInput, setTestInput] = useState('This project is a scam and an exam leak');
  const [isSavingWord, setIsSavingWord] = useState(false);

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

  // Load Restricted Words
  const loadRestrictedWords = async () => {
    setIsModerationLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', { headers });
      const data = await res.json();
      if (res.ok && data) {
        if (Array.isArray(data.words)) setRestrictedWords(data.words);
        if (Array.isArray(data.customWords)) setCustomWords(data.customWords);
        if (typeof data.enabled === 'boolean') setIsModerationEnabled(data.enabled);
      }
    } catch (err) {
      console.warn('Error loading restricted words:', err);
    } finally {
      setIsModerationLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    loadProblems();
    loadRestrictedWords();
  }, [authToken]);

  // Add Word Handler
  const handleAddWord = async () => {
    if (!newWordInput.trim()) return;
    setIsSavingWord(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'add', word: newWordInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestrictedWords(data.words);
        setCustomWords(data.customWords || []);
        setNewWordInput('');
        setActionNotice({ type: 'success', message: data.message });
      } else {
        throw new Error(data.error || 'Failed to add word');
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error adding word' });
    } finally {
      setIsSavingWord(false);
    }
  };

  // Remove Word Handler
  const handleRemoveWord = async (wordToRemove: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'remove', word: wordToRemove }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestrictedWords(data.words);
        setCustomWords(data.customWords || []);
        setActionNotice({ type: 'success', message: data.message });
      } else {
        throw new Error(data.error || 'Failed to remove word');
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error removing word' });
    }
  };

  // Toggle Moderation Handler
  const handleToggleModeration = async () => {
    const nextState = !isModerationEnabled;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'toggle', enabled: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsModerationEnabled(data.enabled);
        setActionNotice({ type: 'success', message: data.message });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error toggling moderation' });
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset all restricted words to default?')) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestrictedWords(data.words);
        setCustomWords([]);
        setIsModerationEnabled(true);
        setActionNotice({ type: 'success', message: data.message });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error resetting words' });
    }
  };

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

          <button
            onClick={() => setSubTab('moderation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              subTab === 'moderation'
                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/30'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Restricted Words & Moderation</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-charcoal-950/60 border border-charcoal-700 font-mono">
              {restrictedWords.length}
            </span>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (subTab === 'projects') loadProjects();
            else if (subTab === 'problems') loadProblems();
            else loadRestrictedWords();
          }}
          isLoading={
            subTab === 'projects'
              ? isProjectsLoading
              : subTab === 'problems'
              ? isProblemsLoading
              : isModerationLoading
          }
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
                            • <VerifiedCollegeBadge college={proj.owner.college} isVerified={proj.owner.college_verified} userId={proj.owner?.user_id || proj.owner_id} size="xs" />
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
                            • <VerifiedCollegeBadge college={prob.author.college} isVerified={prob.author.college_verified} userId={prob.author?.user_id || prob.author_id} size="xs" />
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
      {/* VIEW 3: RESTRICTED WORDS & MODERATION */}
      {/* ========================================================================= */}
      {subTab === 'moderation' && (
        <div className="space-y-6">
          {/* Status & Control Overview */}
          <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isModerationEnabled
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Universal Restricted Words Blocker</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isModerationEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {isModerationEnabled ? 'Enforcement Active' : 'Enforcement Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Prevents abusive language, profanity, exam leaks, and fraudulent terms anywhere in the website in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleModeration}
                  leftIcon={
                    isModerationEnabled ? (
                      <Ban className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )
                  }
                >
                  {isModerationEnabled ? 'Pause Enforcement' : 'Activate Enforcement'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDefaults}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Reset Defaults
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-charcoal-950/50 border border-charcoal-800">
                <span className="text-[11px] text-slate-400 block font-medium">Total Active Terms</span>
                <span className="text-lg font-black text-white font-mono">{restrictedWords.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-950/50 border border-charcoal-800">
                <span className="text-[11px] text-slate-400 block font-medium">Custom Added Terms</span>
                <span className="text-lg font-black text-purple-400 font-mono">{customWords.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-950/50 border border-charcoal-800">
                <span className="text-[11px] text-slate-400 block font-medium">Interception Coverage</span>
                <span className="text-lg font-black text-emerald-400 font-mono">100% Inputs</span>
              </div>
              <div className="p-3 rounded-xl bg-charcoal-950/50 border border-charcoal-800">
                <span className="text-[11px] text-slate-400 block font-medium">Client Feedback</span>
                <span className="text-lg font-black text-blue-400 font-mono">Live Alert</span>
              </div>
            </div>
          </div>

          {/* Add New Prohibited Words Form */}
          <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Prohibited Term or Phrase</span>
            </h4>
            <p className="text-xs text-slate-400">
              Enter a single word or multiple comma-separated words (e.g.{' '}
              <code className="text-slate-300">fake certificate, exam proxy, hackathon bot</code>). Terms are automatically
              matched with safe word-boundaries and leetspeak normalization.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Input
                placeholder="e.g. scammer, fake college, buy project"
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWord();
                  }
                }}
                className="flex-1 text-xs"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddWord}
                isLoading={isSavingWord}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Term
              </Button>
            </div>
          </div>

          {/* Interactive Live Moderation Playground */}
          <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <h4 className="text-sm font-bold text-white">Live Engine Playground</h4>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                Instant Real-Time Test
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Type or paste any text below to test how Kollabrix intercepts and cleans prohibited words in real time.
            </p>
            <Input
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type anything here to test the live filter..."
              className="text-xs"
            />
            {(() => {
              const testRes = checkRestrictedWords(testInput, restrictedWords);
              return (
                <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Moderation Result:</span>
                    {testRes.hasRestricted ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        <span>Restricted Term Detected ({testRes.matchedWords.length})</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Clean Content Allowed</span>
                      </span>
                    )}
                  </div>
                  {testRes.hasRestricted && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400">Blocked words:</span>
                      {testRes.matchedWords.map((w) => (
                        <span
                          key={w}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-900/60 border border-red-600/50 text-red-200"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="pt-1 text-xs">
                    <span className="text-slate-400">Sanitized Output: </span>
                    <span className="text-emerald-300 font-mono font-medium bg-charcoal-900 px-2 py-1 rounded border border-charcoal-800 inline-block mt-1">
                      &quot;{testRes.cleanText}&quot;
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Active Words Directory & Chips */}
          <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <h4 className="text-sm font-bold text-white">Active Restricted Terms Directory</h4>
                <span className="text-xs text-slate-500 font-mono">({restrictedWords.length})</span>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Filter terms..."
                  value={wordSearch}
                  onChange={(e) => setWordSearch(e.target.value)}
                  className="pl-8 text-xs py-1.5"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[360px] overflow-y-auto p-2 rounded-xl bg-charcoal-950/40 border border-charcoal-800/80">
              {restrictedWords
                .filter((w) => !wordSearch.trim() || w.toLowerCase().includes(wordSearch.toLowerCase().trim()))
                .map((w) => {
                  const isCustom = customWords.includes(w);
                  return (
                    <span
                      key={w}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                        isCustom
                          ? 'bg-purple-900/40 border border-purple-500/50 text-purple-200'
                          : 'bg-charcoal-800/70 border border-charcoal-700 text-slate-300'
                      }`}
                    >
                      <span>{w}</span>
                      {isCustom && (
                        <span className="text-[9px] font-bold text-purple-300 bg-purple-950/80 px-1 rounded uppercase">
                          custom
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveWord(w)}
                        title={`Remove "${w}" from restricted words`}
                        className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors ml-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
            </div>
          </div>
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
