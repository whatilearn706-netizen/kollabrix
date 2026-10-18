'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Users,
  Code2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Flame,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateIcpcContestModal } from '@/components/icpc/CreateIcpcContestModal';
import { IcpcContest, IcpcProblem } from '@/types/icpc';

interface AdminIcpcTabProps {
  authToken?: string;
}

export function AdminIcpcTab({ authToken }: AdminIcpcTabProps) {
  const [contests, setContests] = useState<IcpcContest[]>([]);
  const [isArenaLive, setIsArenaLive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTogglingLive, setIsTogglingLive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedContests, setExpandedContests] = useState<Record<string, boolean>>({});
  const [deleteTargetProblem, setDeleteTargetProblem] = useState<{ contestId: string; problem: IcpcProblem } | null>(null);
  const [deleteTargetContest, setDeleteTargetContest] = useState<IcpcContest | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isClearAllOpen, setIsClearAllOpen] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/icpc?includeEmpty=true&_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.contests)) {
        setContests(data.contests);
        if (typeof data.isArenaLive === 'boolean') {
          setIsArenaLive(data.isArenaLive);
        }
        // Expand all contests by default for easy inspection
        const initExpanded: Record<string, boolean> = {};
        data.contests.forEach((c: IcpcContest) => {
          initExpanded[c.id] = true;
        });
        setExpandedContests(initExpanded);
      }
    } catch (err: any) {
      console.error('Error loading ICPC contests for admin:', err);
      setStatusMessage({ type: 'error', text: 'Failed to load ICPC contests.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleLive = async () => {
    setIsTogglingLive(true);
    const newStatus = !isArenaLive;
    try {
      const res = await fetch('/api/icpc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArenaLive: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsArenaLive(newStatus);
        setStatusMessage({
          type: 'success',
          text: newStatus
            ? '🟢 ICPC Collegiate Arena is now LIVE for all students!'
            : '🔴 ICPC Collegiate Arena is now OFFLINE (Maintenance Mode).',
        });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update arena status.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error updating arena status.' });
    } finally {
      setIsTogglingLive(false);
    }
  };

  const handleDeleteProblem = async () => {
    if (!deleteTargetProblem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/icpc?problemId=${deleteTargetProblem.problem.id}&contestId=${deleteTargetProblem.contestId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Problem "${deleteTargetProblem.problem.title}" removed from arena successfully!`,
        });
        setContests((prev) =>
          prev.map((c) => {
            if (c.id === deleteTargetProblem.contestId) {
              return {
                ...c,
                problems: c.problems.filter((p) => p.id !== deleteTargetProblem.problem.id),
              };
            }
            return c;
          })
        );
        setDeleteTargetProblem(null);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to remove problem.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error removing problem.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteContest = async () => {
    if (!deleteTargetContest) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/icpc?contestId=${deleteTargetContest.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Contest "${deleteTargetContest.title}" removed from arena successfully!`,
        });
        setContests((prev) => prev.filter((c) => c.id !== deleteTargetContest.id));
        setDeleteTargetContest(null);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to remove contest.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error removing contest.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/icpc?clearAll=true', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: 'All contests and problems cleared from ICPC arena!',
        });
        setContests([]);
        setIsClearAllOpen(false);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to clear arena.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error clearing arena.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/icpc?resetDefaults=true', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: 'Default curated ICPC contests restored successfully!',
        });
        setIsResetOpen(false);
        await loadData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to reset contests.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error resetting contests.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedContests((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalProblems = contests.reduce((acc, c) => acc + (c.problems?.length || 0), 0);
  const totalParticipants = contests.reduce((acc, c) => acc + (c.participantCount || 0), 0);

  const filteredContests = contests.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.organizer.toLowerCase().includes(q) ||
      (c.college || '').toLowerCase().includes(q) ||
      c.problems.some((p) => p.title.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">ICPC Collegiate Arena Governance</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Full control over collegiate competitive programming contests. Toggle the arena live status, inspect testbenches, and remove unwanted problem statements with 1-click authoritativeness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link href="/icpc" target="_blank">
            <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Live Arena
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsResetOpen(true)}
            className="border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 text-xs font-bold"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Restore Curated Contests
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsClearAllOpen(true)}
            className="border-rose-500/40 text-rose-300 hover:bg-rose-500/15 text-xs font-bold"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Arena (Wipe All)
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            Upload Contest
          </Button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* MASTER TOGGLE: LIVE VS OFFLINE */}
      <div className="p-5 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${isArenaLive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'}`}>
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">ICPC Arena Access Status:</span>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${isArenaLive ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/25 border-rose-500/40 text-rose-300'}`}>
                  {isArenaLive ? '🟢 LIVE (Accessible to all students)' : '🔴 OFFLINE / PAUSED (Maintenance Mode)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isArenaLive
                  ? 'Students can freely view all contests, run code simulations, and submit solutions against the testbench.'
                  : 'Student traffic is paused with an official Linkora Maintenance notice. Admins can still preview.'}
              </p>
            </div>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={handleToggleLive}
            isLoading={isTogglingLive}
            className={`font-black text-xs px-5 py-2.5 rounded-xl shrink-0 ${
              isArenaLive
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isArenaLive ? 'Switch Arena to OFFLINE' : 'Switch Arena to LIVE'}
          </Button>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Total Contests</span>
          <div className="text-2xl font-black text-white mt-1">{contests.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Problems</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{totalProblems}</div>
        </div>
        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Collegiate Registrants</span>
          <div className="text-2xl font-black text-violet-400 mt-1">{totalParticipants}</div>
        </div>
        <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Arena Status</span>
          <div className={`text-sm font-black mt-2 ${isArenaLive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isArenaLive ? '🟢 Live On Campus' : '🔴 Maintenance'}
          </div>
        </div>
      </div>

      {/* Search Bar & Refresh */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contests, problems, or professors..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={loadData}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-charcoal-700 text-slate-300 hover:text-white text-xs font-bold"
        >
          Refresh Data
        </Button>
      </div>

      {/* Contests & Problems List */}
      <div className="space-y-4">
        {filteredContests.length === 0 ? (
          <div className="p-10 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center text-slate-400 space-y-3">
            <Terminal className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm">No contests or problems matched your search criteria.</p>
          </div>
        ) : (
          filteredContests.map((contest) => {
            const isExpanded = expandedContests[contest.id] ?? true;
            return (
              <div key={contest.id} className="rounded-3xl bg-charcoal-900 border border-charcoal-800 overflow-hidden shadow-elevated">
                {/* Contest Header */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal-800/80 bg-charcoal-950/50">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          contest.status === 'live'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : contest.status === 'upcoming'
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {contest.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-charcoal-800 border border-charcoal-700">
                        {contest.problems.length} Problem{contest.problems.length === 1 ? '' : 's'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        👥 {contest.participantCount} Students
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white">{contest.title}</h3>
                    <p className="text-xs text-slate-400">
                      Organized by <span className="font-semibold text-slate-200">{contest.organizer}</span> • {contest.college}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(contest.id)}
                      className="text-xs text-slate-400 hover:text-white"
                      leftIcon={isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    >
                      {isExpanded ? 'Collapse Problems' : 'View Problems'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTargetContest(contest)}
                      className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                      leftIcon={<Trash2 className="w-3 h-3" />}
                    >
                      Delete Contest
                    </Button>
                  </div>
                </div>

                {/* Problems List in this Contest */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-3 bg-charcoal-900/60">
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Problems in Contest ({contest.problems.length})</span>
                      <span className="text-[10px] text-slate-500 font-normal">Click &ldquo;Remove Problem&rdquo; to delete immediately from arena</span>
                    </div>

                    {contest.problems.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-charcoal-950/60 border border-charcoal-800 text-center text-xs text-slate-500">
                        All problems in this contest have been removed.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {contest.problems.map((problem) => (
                          <div
                            key={problem.id}
                            className="p-3.5 rounded-2xl bg-charcoal-950 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                    problem.difficulty === 'Easy'
                                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                      : problem.difficulty === 'Hard'
                                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                  }`}
                                >
                                  {problem.difficulty}
                                </span>
                                <span className="text-[10px] font-mono text-cyan-300 font-bold">
                                  +{problem.points} Pts
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  ⏱ {problem.timeLimit} • 💾 {problem.memoryLimit}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-white">{problem.title}</h4>
                              <p className="text-xs text-slate-400 line-clamp-1">{problem.description}</p>

                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {problem.tags.map((tag) => (
                                  <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-charcoal-800 text-slate-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* REMOVE PROBLEM BUTTON */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteTargetProblem({ contestId: contest.id, problem })}
                              className="text-rose-400 border-rose-500/40 hover:bg-rose-500/15 text-xs font-bold shrink-0 self-start sm:self-center"
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                              Remove Problem
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Problem Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetProblem)}
        onClose={() => setDeleteTargetProblem(null)}
        title="Remove Problem from ICPC Arena"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs leading-relaxed space-y-1.5">
            <p className="font-bold text-white text-sm">
              Are you sure you want to remove &ldquo;{deleteTargetProblem?.problem.title}&rdquo;?
            </p>
            <p>
              This will immediately delete the problem and its testcases from the ICPC Collegiate Arena for all students.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setDeleteTargetProblem(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleDeleteProblem}
              isLoading={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Contest Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetContest)}
        onClose={() => setDeleteTargetContest(null)}
        title="Delete ICPC Contest"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs leading-relaxed space-y-1.5">
            <p className="font-bold text-white text-sm">
              Delete contest &ldquo;{deleteTargetContest?.title}&rdquo;?
            </p>
            <p>This will permanently remove the entire contest and all its associated problems from the arena.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setDeleteTargetContest(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleDeleteContest}
              isLoading={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Contest
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        title="Clear Entire ICPC Arena"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs leading-relaxed space-y-1.5">
            <p className="font-bold text-white text-sm">
              Are you sure you want to remove ALL contests and problems from the arena?
            </p>
            <p>
              This will wipe all active contests from the student feed immediately. You can restore default contests at any time.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setIsClearAllOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleClearAll}
              isLoading={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Wipe All Contests
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Defaults Confirmation Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Restore Default Curated ICPC Contests"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs leading-relaxed space-y-1.5">
            <p className="font-bold text-white text-sm">
              Restore default curated contests?
            </p>
            <p>
              This will un-delete and restore the standard curated collegiate contests and their testcases.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setIsResetOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleResetDefaults}
              isLoading={isDeleting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Confirm Restore
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Contest Modal */}
      <CreateIcpcContestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        organizerName="Linkora Master Admin"
        collegeName="Linkora Collegiate Platform"
        onCreated={() => {
          setIsCreateOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
