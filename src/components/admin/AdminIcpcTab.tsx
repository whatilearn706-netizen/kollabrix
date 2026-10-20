'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Smartphone,
  Maximize2,
  ShieldAlert,
  UserX,
  UserCheck,
  ShieldOff,
  AlertTriangle,
  Clock,
  Calendar,
  Monitor,
  Video,
  Send,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CreateIcpcContestModal } from '@/components/icpc/CreateIcpcContestModal';
import { IcpcContest, IcpcProblem, ProctorIncident, ProctorLiveStats, ProctorViolationType, ActiveProctorSession } from '@/types/icpc';

interface AdminIcpcTabProps {
  authToken?: string;
}

export function AdminIcpcTab({ authToken }: AdminIcpcTabProps) {
  const [icpcAdminView, setIcpcAdminView] = useState<'contests' | 'proctor'>('contests');
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

  // Proctoring Watchdog State
  const [proctorIncidents, setProctorIncidents] = useState<ProctorIncident[]>([]);
  const [proctorStats, setProctorStats] = useState<ProctorLiveStats>({
    activeSessions: 0,
    totalViolations: 0,
    phoneViolations: 0,
    screenViolations: 0,
    gazeViolations: 0,
    pasteViolations: 0,
    flaggedStudentsCount: 0,
  });
  const [isProctorLoading, setIsProctorLoading] = useState<boolean>(false);
  const [proctorSearchQuery, setProctorSearchQuery] = useState<string>('');
  const [proctorFilterViolation, setProctorFilterViolation] = useState<'all' | ProctorViolationType>('all');
  const [autoRefreshProctor, setAutoRefreshProctor] = useState<boolean>(true);

  // Live Monitor Grid & External Meeting State
  const [proctorSubView, setProctorSubView] = useState<'live_monitors' | 'incidents_log'>('live_monitors');
  const [activeSessions, setActiveSessions] = useState<ActiveProctorSession[]>([]);
  const [proctorMeetingUrl, setProctorMeetingUrl] = useState<string>('');
  const [meetingUrlInput, setMeetingUrlInput] = useState<string>('');
  const [isSavingMeetingUrl, setIsSavingMeetingUrl] = useState<boolean>(false);
  const [cautionTargetSession, setCautionTargetSession] = useState<ActiveProctorSession | null>(null);
  const [cautionMessageText, setCautionMessageText] = useState<string>('Keep your attention focused strictly on the contest problem and editor.');
  const [isSendingCaution, setIsSendingCaution] = useState<boolean>(false);
  const [demolishTargetSession, setDemolishTargetSession] = useState<ActiveProctorSession | null>(null);
  const [demolishReasonText, setDemolishReasonText] = useState<string>('Academic integrity violation detected by proctor. Session forcefully terminated.');
  const [isDemolishing, setIsDemolishing] = useState<boolean>(false);
  const [expandedScreenImage, setExpandedScreenImage] = useState<{ src: string; title: string } | null>(null);

  // Suspension Modal State
  const [suspendingIncident, setSuspendingIncident] = useState<ProctorIncident | null>(null);
  const [isSuspending, setIsSuspending] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/icpc?includeEmpty=true&_t=${Date.now()}`, { headers });
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
  }, [authToken]);

  const handleToggleLive = async () => {
    setIsTogglingLive(true);
    const newStatus = !isArenaLive;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/icpc', {
        method: 'PATCH',
        headers,
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
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/icpc?problemId=${deleteTargetProblem.problem.id}&contestId=${deleteTargetProblem.contestId}`, {
        method: 'DELETE',
        headers,
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
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/icpc?contestId=${deleteTargetContest.id}`, {
        method: 'DELETE',
        headers,
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
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/icpc?clearAll=true', {
        method: 'DELETE',
        headers,
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
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/icpc?resetDefaults=true', {
        method: 'DELETE',
        headers,
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

  // Proctoring telemetry functions
  const loadProctorData = useCallback(async () => {
    setIsProctorLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/icpc/proctor?_t=${Date.now()}`, { headers });
      const data = await res.json();
      if (data.success) {
        setProctorIncidents(data.incidents || []);
        if (data.stats) setProctorStats(data.stats);
        if (Array.isArray(data.activeSessions)) setActiveSessions(data.activeSessions);
        if (typeof data.proctorMeetingUrl === 'string') {
          setProctorMeetingUrl(data.proctorMeetingUrl);
          setMeetingUrlInput((prev) => prev || data.proctorMeetingUrl);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch proctor data:', err);
    } finally {
      setIsProctorLoading(false);
    }
  }, [authToken]);

  const handleSendCaution = async () => {
    if (!cautionTargetSession) return;
    setIsSendingCaution(true);
    try {
      const res = await fetch('/api/icpc/proctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'caution',
          studentId: cautionTargetSession.studentId,
          message: cautionMessageText.trim() || 'Keep your attention focused strictly on the contest problem and editor.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Caution alert sent to ${cautionTargetSession.studentName}!`,
        });
        setCautionTargetSession(null);
        await loadProctorData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to deliver caution.' });
    } finally {
      setIsSendingCaution(false);
    }
  };

  const handleExecuteDemolish = async () => {
    if (!demolishTargetSession) return;
    setIsDemolishing(true);
    try {
      const res = await fetch('/api/icpc/proctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'demolish',
          studentId: demolishTargetSession.studentId,
          reason: demolishReasonText.trim() || 'Session forcefully demolished and contestant disqualified by faculty administrator.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Session demolished and ${demolishTargetSession.studentName} disqualified from contest!`,
        });
        setDemolishTargetSession(null);
        await loadProctorData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to demolish session.' });
    } finally {
      setIsDemolishing(false);
    }
  };

  const handleSaveMeetingUrl = async () => {
    setIsSavingMeetingUrl(true);
    try {
      const res = await fetch('/api/icpc/proctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_meeting_url',
          meetingUrl: meetingUrlInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProctorMeetingUrl(data.meetingUrl);
        setStatusMessage({
          type: 'success',
          text: 'External proctor meeting URL updated successfully!',
        });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to save meeting URL.' });
    } finally {
      setIsSavingMeetingUrl(false);
    }
  };

  useEffect(() => {
    loadProctorData();
    if (!autoRefreshProctor) return;
    const interval = setInterval(() => {
      loadProctorData();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadProctorData, autoRefreshProctor]);

  const handleExecuteSuspend = async () => {
    if (!suspendingIncident) return;
    setIsSuspending(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'suspend',
          targetUserId: suspendingIncident.studentId,
          reason:
            suspendReason.trim() ||
            `ICPC Anti-Cheat Proctoring Violation: ${suspendingIncident.violationType} (${suspendingIncident.details})`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Account "${suspendingIncident.studentName}" has been successfully suspended platform-wide.`,
        });
        setSuspendingIncident(null);
        setSuspendReason('');
        await loadProctorData();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Failed to suspend student account.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error suspending student account.',
      });
    } finally {
      setIsSuspending(false);
    }
  };

  const handleDismissIncident = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`/api/icpc/proctor?id=${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProctorIncidents((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {}
  };

  const handleClearAllProctorLogs = async () => {
    if (!confirm('Are you sure you want to clear all logged proctoring alerts?')) return;
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/icpc/proctor?all=true', {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProctorIncidents([]);
        setProctorStats({
          activeSessions: 0,
          totalViolations: 0,
          phoneViolations: 0,
          screenViolations: 0,
          gazeViolations: 0,
          pasteViolations: 0,
          flaggedStudentsCount: 0,
        });
        setStatusMessage({
          type: 'success',
          text: 'All ICPC proctoring violation logs cleared successfully.',
        });
      }
    } catch {}
  };

  const filteredProctorIncidents = proctorIncidents.filter((inc) => {
    const matchSearch =
      !proctorSearchQuery.trim() ||
      inc.studentName.toLowerCase().includes(proctorSearchQuery.toLowerCase()) ||
      (inc.studentEmail && inc.studentEmail.toLowerCase().includes(proctorSearchQuery.toLowerCase())) ||
      (inc.college && inc.college.toLowerCase().includes(proctorSearchQuery.toLowerCase())) ||
      inc.contestTitle.toLowerCase().includes(proctorSearchQuery.toLowerCase()) ||
      (inc.problemTitle && inc.problemTitle.toLowerCase().includes(proctorSearchQuery.toLowerCase()));

    const matchType =
      proctorFilterViolation === 'all' || inc.violationType === proctorFilterViolation;

    return matchSearch && matchType;
  });

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

      {/* Sub-Navigation: Contests vs Anti-Cheat Live Proctor Watchdog */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-2 text-xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setIcpcAdminView('contests')}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            icpcAdminView === 'contests'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-850 border border-transparent'
          }`}
        >
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span>Contests &amp; Problems ({contests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIcpcAdminView('proctor');
            loadProctorData();
          }}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            icpcAdminView === 'proctor'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-charcoal-850 border border-transparent'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>🛡️ Anti-Cheat &amp; Live Proctor Watchdog</span>
          {proctorStats.totalViolations > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-600 text-white font-bold animate-pulse">
              {proctorStats.totalViolations} Alerts
            </span>
          )}
        </button>
      </div>

      {icpcAdminView === 'contests' && (
        <div className="space-y-6">
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
    </div>
  )}

      {/* ========================================================================= */}
      {/* VIEW 2: ANTI-CHEAT & LIVE PROCTOR WATCHDOG */}
      {/* ========================================================================= */}
      {icpcAdminView === 'proctor' && (
        <div className="space-y-6">
          {/* Proctor Telemetry Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Total Incidents</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{proctorStats.totalViolations}</div>
            </div>
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-cyan-500/30 bg-cyan-500/5">
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider block">🖥️ Active Monitors</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">{activeSessions.length}</div>
            </div>
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-rose-500/30 bg-rose-500/5">
              <span className="text-[11px] font-mono text-rose-300 uppercase tracking-wider block">📱 Phone Caught</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{proctorStats.phoneViolations}</div>
            </div>
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-amber-500/30 bg-amber-500/5">
              <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider block">🔀 App / Overlay</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{proctorStats.screenViolations}</div>
            </div>
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-yellow-500/30 bg-yellow-500/5">
              <span className="text-[11px] font-mono text-yellow-300 uppercase tracking-wider block">👀 Gaze Deviation</span>
              <div className="text-2xl font-black text-yellow-400 mt-1">{proctorStats.gazeViolations}</div>
            </div>
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">👤 Flagged Students</span>
              <div className="text-2xl font-black text-white mt-1">{proctorStats.flaggedStudentsCount}</div>
            </div>
          </div>

          {/* External Proctor Meeting App Connector */}
          <div className="p-4 sm:p-5 rounded-2xl bg-charcoal-900 border border-cyan-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider font-mono">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>External Proctor Meeting App (Google Meet / Zoom / Discord / Teams)</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                  For mass proctoring (50+ to 100+ students), set a live conference call URL. All contestants will see this link on entering the arena so faculty can view all shared screens simultaneously in Google Meet or Zoom while Linkora automates cautions, blackouts, and terminations.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="url"
                  value={meetingUrlInput}
                  onChange={(e) => setMeetingUrlInput(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abc"
                  className="w-full sm:w-64 px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveMeetingUrl}
                  isLoading={isSavingMeetingUrl}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shrink-0 cursor-pointer"
                >
                  Save Call URL
                </Button>
                {proctorMeetingUrl && (
                  <a
                    href={proctorMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <span>Open Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Sub-View Switcher Pills */}
          <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
            <button
              type="button"
              onClick={() => setProctorSubView('live_monitors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                proctorSubView === 'live_monitors'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-white bg-charcoal-900 border border-charcoal-800'
              }`}
            >
              <Monitor className="w-4 h-4 text-cyan-400" />
              <span>Live Contestant Monitors</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] font-mono font-bold text-cyan-300">
                {activeSessions.length} Active
              </span>
            </button>

            <button
              type="button"
              onClick={() => setProctorSubView('incidents_log')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                proctorSubView === 'incidents_log'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                  : 'text-slate-400 hover:text-white bg-charcoal-900 border border-charcoal-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Incident Security History</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[10px] font-mono font-bold text-rose-300">
                {proctorIncidents.length}
              </span>
            </button>
          </div>

          {/* SUB-VIEW 1: LIVE CONTESTANT MONITORS GRID */}
          {proctorSubView === 'live_monitors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Real-Time Monitor Feeds (Auto-synced every 5 seconds):</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeSessions.length} Active Screen Shares</span>
                </span>
              </div>

              {activeSessions.length === 0 ? (
                <div className="p-12 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Active Contestant Screens Right Now</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    When contestants enter the ICPC contest arena and share their screen, their monitor captures will stream live here. You will be able to issue warnings (Caution) or demolish sessions in real-time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeSessions.map((session) => (
                    <div
                      key={session.studentId}
                      className="rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between overflow-hidden shadow-xl"
                    >
                      {/* Card Header */}
                      <div className="p-3.5 border-b border-charcoal-800 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{session.studentName}</h4>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                              session.status === 'demolished'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : session.warningCount > 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {session.status === 'demolished'
                              ? '🛑 Demolished'
                              : session.warningCount > 0
                              ? `⚠️ ${session.warningCount} / 10 Warns`
                              : '🟢 Live Shared'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {session.college || session.studentId} • {session.contestTitle}
                        </div>
                        {session.problemTitle && (
                          <div className="text-[10px] text-cyan-300 font-mono truncate">
                            Problem: {session.problemTitle}
                          </div>
                        )}
                      </div>

                      {/* Monitor Snapshot Feed */}
                      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
                        {session.screenSnapshot ? (
                          <>
                            <img
                              src={session.screenSnapshot}
                              alt={`${session.studentName} monitor`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                              onClick={() =>
                                setExpandedScreenImage({
                                  src: session.screenSnapshot!,
                                  title: `${session.studentName} — Live Screen Capture`,
                                })
                              }
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedScreenImage({
                                  src: session.screenSnapshot!,
                                  title: `${session.studentName} — Live Screen Capture`,
                                })
                              }
                              className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur text-[10px] font-mono text-slate-300 hover:text-white border border-charcoal-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Zoom Screen</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-500 text-xs font-mono p-4 text-center">
                            <Monitor className="w-6 h-6 animate-pulse text-cyan-400" />
                            <span>Monitor Connected</span>
                            <span className="text-[10px] text-slate-600">Capturing initial frame...</span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Controls */}
                      <div className="p-3 bg-charcoal-950/70 border-t border-charcoal-800 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCautionTargetSession(session);
                            setCautionMessageText('Keep your eyes strictly focused on the contest problem and editor.');
                          }}
                          disabled={session.status === 'demolished'}
                          className="flex-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/15 text-[11px] font-bold h-8 cursor-pointer"
                          leftIcon={<AlertTriangle className="w-3 h-3 text-amber-400" />}
                        >
                          Give Caution
                        </Button>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setDemolishTargetSession(session);
                            setDemolishReasonText('Academic integrity violation detected by proctor. Session forcefully terminated.');
                          }}
                          disabled={session.status === 'demolished'}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold h-8 cursor-pointer"
                          leftIcon={<AlertOctagon className="w-3 h-3 text-white" />}
                        >
                          Demolish
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: INCIDENTS SECURITY HISTORY LOG */}
          {proctorSubView === 'incidents_log' && (
            <div className="space-y-4">
              {/* Controls & Filter Bar */}
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={proctorSearchQuery}
                      onChange={(e) => setProctorSearchQuery(e.target.value)}
                      placeholder="Search by student username, college, contest..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAutoRefreshProctor(!autoRefreshProctor)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
                        autoRefreshProctor
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-charcoal-950 border-charcoal-800 text-slate-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${autoRefreshProctor ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{autoRefreshProctor ? 'Live Sync (5s)' : 'Paused'}</span>
                    </button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadProctorData}
                      isLoading={isProctorLoading}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                      className="border-charcoal-750 text-slate-300 text-xs font-bold"
                    >
                      Refresh
                    </Button>

                    {proctorIncidents.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearAllProctorLogs}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 text-xs font-bold"
                      >
                        Clear All Logs
                      </Button>
                    )}
                  </div>
                </div>

                {/* Violation Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-charcoal-800/80 text-xs">
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 uppercase">Filter:</span>
                  {[
                    { id: 'all', label: 'All Incidents' },
                    { id: 'SCREEN_SHARE_STOPPED', label: '🛑 Screen Share Terminated' },
                    { id: 'TAB_SWITCH', label: '🔀 App / Tab Switch' },
                    { id: 'PHONE_DETECTED', label: '📱 Phone Detected' },
                    { id: 'FULLSCREEN_EXIT', label: '🖥️ Screen Exited' },
                    { id: 'GAZE_DEVIATION', label: '👀 Gaze Deviation' },
                    { id: 'SUSPICIOUS_PASTE', label: '📋 AI Paste' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => setProctorFilterViolation(chip.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        proctorFilterViolation === chip.id
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                          : 'text-slate-400 hover:text-white bg-charcoal-950 border border-charcoal-800'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incidents Stream */}
              <div className="space-y-3">
                {filteredProctorIncidents.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">No Proctoring Incidents Found</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All active and recent ICPC arena contestant sessions are operating within verified academic standards. Violations will appear here live in real-time.
                    </p>
                  </div>
                ) : (
                  filteredProctorIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-4 sm:p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-charcoal-950 border border-charcoal-750 flex items-center justify-center text-rose-400 font-bold shrink-0">
                            {inc.violationType === 'SCREEN_SHARE_STOPPED' ? (
                              <Maximize2 className="w-4 h-4 text-rose-400 animate-pulse" />
                            ) : inc.violationType === 'SIRI_ATTEMPT' ? (
                              <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                            ) : inc.violationType === 'PHONE_DETECTED' ? (
                              <Smartphone className="w-4 h-4 text-rose-400" />
                            ) : inc.violationType === 'FULLSCREEN_EXIT' ? (
                              <Maximize2 className="w-4 h-4 text-amber-400" />
                            ) : inc.violationType === 'TAB_SWITCH' ? (
                              <ExternalLink className="w-4 h-4 text-orange-400" />
                            ) : inc.violationType === 'GAZE_DEVIATION' ? (
                              <Eye className="w-4 h-4 text-yellow-400" />
                            ) : (
                              <Code2 className="w-4 h-4 text-purple-400" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white">{inc.studentName}</h4>
                              <span className="text-[10px] font-mono text-slate-400">
                                ({inc.studentId})
                              </span>
                              {inc.college && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-300 font-medium">
                                  {inc.college}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">
                              Contest: <strong className="text-slate-200">{inc.contestTitle}</strong>
                              {inc.problemTitle ? ` • Problem: ${inc.problemTitle}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                              inc.violationType === 'SCREEN_SHARE_STOPPED' || inc.violationType === 'SIRI_ATTEMPT' || inc.violationType === 'PHONE_DETECTED'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : inc.violationType === 'FULLSCREEN_EXIT'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : inc.violationType === 'TAB_SWITCH'
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                : inc.violationType === 'GAZE_DEVIATION'
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            }`}
                          >
                            {inc.violationType.replace('_', ' ')}
                          </span>

                          <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                            Warning #{inc.warningCount} / 10
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 bg-charcoal-950 p-3 rounded-xl border border-charcoal-800/80 font-mono">
                        {inc.details}
                      </p>

                      {/* Render Screen Snapshot Evidence if captured */}
                      {inc.screenSnapshot && (
                        <div className="rounded-xl overflow-hidden border border-charcoal-750 bg-black max-w-md">
                          <div className="px-3 py-1.5 bg-charcoal-950 border-b border-charcoal-800 text-[10px] font-mono font-bold text-rose-300 flex items-center justify-between">
                            <span>📸 Contestant Monitor Capture</span>
                            <span className="text-[9px] text-slate-400">Click to expand</span>
                          </div>
                          <img
                            src={inc.screenSnapshot}
                            alt="Incident Monitor Capture"
                            className="w-full h-auto object-cover max-h-52 cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() =>
                              setExpandedScreenImage({
                                src: inc.screenSnapshot!,
                                title: `${inc.studentName} — Violation Capture (${inc.violationType})`,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="pt-2 border-t border-charcoal-800 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(inc.timestamp).toLocaleString()}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismissIncident(inc.id)}
                            className="text-slate-400 hover:text-white text-xs h-7"
                          >
                            Dismiss
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              setSuspendingIncident(inc);
                              setSuspendReason(
                                `ICPC Contest Anti-Cheat Proctoring Violation: ${inc.violationType} (${inc.details})`
                              );
                            }}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-7"
                            leftIcon={<UserX className="w-3.5 h-3.5" />}
                          >
                            Suspend Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Suspend Account Confirmation Modal */}
      <Modal
        isOpen={Boolean(suspendingIncident)}
        onClose={() => setSuspendingIncident(null)}
        title="Suspend Student Account • Anti-Cheat Enforcement"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Confirm Platform Suspension</span>
            </div>
            <p>
              You are about to suspend <strong>{suspendingIncident?.studentName}</strong> (ID: {suspendingIncident?.studentId}) due to suspicious proctoring violations in contest: <em>{suspendingIncident?.contestTitle}</em>.
            </p>
            <p className="text-[11px] text-rose-300">
              • The student will be immediately locked out of active ICPC contests and workspace sprints.
              • Their account status will be set to Suspended platform-wide.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Official Suspension Reason
            </label>
            <textarea
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="State the anti-cheat proctoring infraction..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSuspendingIncident(null)}
              disabled={isSuspending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleExecuteSuspend}
              isLoading={isSuspending}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              leftIcon={<UserX className="w-3.5 h-3.5" />}
            >
              Confirm Platform Suspension
            </Button>
          </div>
        </div>
      </Modal>

      {/* Give Caution Modal */}
      <Modal
        isOpen={Boolean(cautionTargetSession)}
        onClose={() => setCautionTargetSession(null)}
        title={`Issue Live Caution • ${cautionTargetSession?.studentName}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Broadcast Immediate Caution Alert</span>
            </div>
            <p>
              Sending this caution will pop up a high-priority warning directly on <strong>{cautionTargetSession?.studentName}&apos;s</strong> screen inside the arena with an audio alert.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Caution Message to Contestant
            </label>
            <textarea
              rows={3}
              value={cautionMessageText}
              onChange={(e) => setCautionMessageText(e.target.value)}
              placeholder="e.g. Keep your attention focused on the code editor. Do not switch screens or look away."
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCautionTargetSession(null)}
              disabled={isSendingCaution}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSendCaution}
              isLoading={isSendingCaution}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Deliver Caution to Screen
            </Button>
          </div>
        </div>
      </Modal>

      {/* Demolish / Disqualify Confirmation Modal */}
      <Modal
        isOpen={Boolean(demolishTargetSession)}
        onClose={() => setDemolishTargetSession(null)}
        title={`Demolish Contest • ${demolishTargetSession?.studentName}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Force Demolish Contest Session</span>
            </div>
            <p>
              Are you sure you want to <strong>demolish</strong> the contest attempt of <strong>{demolishTargetSession?.studentName}</strong>?
            </p>
            <p className="text-[11px] text-rose-300">
              • The student&apos;s contest arena will be permanently locked with an unclosable Disqualification overlay.
              • Their session and code submissions will be halted immediately.
              • A critical security incident will be logged in academic records.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Official Demolish / Disqualification Reason
            </label>
            <textarea
              rows={3}
              value={demolishReasonText}
              onChange={(e) => setDemolishReasonText(e.target.value)}
              placeholder="State the academic integrity infraction..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDemolishTargetSession(null)}
              disabled={isDemolishing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleExecuteDemolish}
              isLoading={isDemolishing}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
            >
              Confirm Demolish &amp; Disqualify
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full-Screen Monitor Image Zoom Modal */}
      <Modal
        isOpen={Boolean(expandedScreenImage)}
        onClose={() => setExpandedScreenImage(null)}
        title={expandedScreenImage?.title || 'Contestant Screen Capture'}
        maxWidth="4xl"
      >
        <div className="space-y-3">
          {expandedScreenImage && (
            <div className="rounded-2xl overflow-hidden border border-charcoal-750 bg-black">
              <img
                src={expandedScreenImage.src}
                alt={expandedScreenImage.title}
                className="w-full h-auto object-contain max-h-[75vh]"
              />
            </div>
          )}
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpandedScreenImage(null)}
              className="text-xs font-mono"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
