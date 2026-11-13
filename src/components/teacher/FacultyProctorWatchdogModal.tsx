'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldAlert,
  Video,
  Monitor,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Users,
  Smartphone,
  Eye,
  AlertOctagon,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import {
  IcpcContest,
  ActiveProctorSession,
  ProctorIncident,
  ProctorLiveStats,
  ProctorViolationType,
  ContestSubmission,
} from '@/types/icpc';

interface FacultyProctorWatchdogModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyContests: IcpcContest[];
  initialContestId?: string | null;
}

/**
 * FacultyProctorWatchdogModal gives faculty instructors full real-time
 * video, screen share, and anti-cheat monitoring over their hosted labs.
 */
export function FacultyProctorWatchdogModal({
  isOpen,
  onClose,
  facultyContests,
  initialContestId,
}: FacultyProctorWatchdogModalProps) {
  const [selectedContestId, setSelectedContestId] = useState<string>('all');
  const [activeSessions, setActiveSessions] = useState<ActiveProctorSession[]>([]);
  const [incidents, setIncidents] = useState<ProctorIncident[]>([]);
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [stats, setStats] = useState<ProctorLiveStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [subView, setSubView] = useState<'live_monitors' | 'incidents_log' | 'verified_submissions'>('live_monitors');

  // Theater Mode (High-res stream)
  const [theaterSession, setTheaterSession] = useState<ActiveProctorSession | null>(null);
  const [theaterFeedback, setTheaterFeedback] = useState<{ type: 'caution' | 'demolish'; message: string } | null>(null);
  const theaterVideoRef = useRef<HTMLVideoElement | null>(null);
  const theaterPcRef = useRef<RTCPeerConnection | null>(null);
  const [isWebRtcConnected, setIsWebRtcConnected] = useState<boolean>(false);
  const [isWebRtcConnecting, setIsWebRtcConnecting] = useState<boolean>(false);
  const [isWebRtcVideoActive, setIsWebRtcVideoActive] = useState<boolean>(false);

  // Caution & Demolish actions
  const [cautionTarget, setCautionTarget] = useState<ActiveProctorSession | null>(null);
  const [cautionText, setCautionText] = useState<string>('');
  const [isCautioning, setIsCautioning] = useState<boolean>(false);

  const [demolishTarget, setDemolishTarget] = useState<ActiveProctorSession | null>(null);
  const [demolishReason, setDemolishReason] = useState<string>('');
  const [isDemolishing, setIsDemolishing] = useState<boolean>(false);

  // Sync initialContestId
  useEffect(() => {
    if (initialContestId) {
      setSelectedContestId(initialContestId);
    } else {
      setSelectedContestId('all');
    }
  }, [initialContestId]);

  // Set of contest IDs and titles owned by this faculty
  const facultyContestIds = useRef(new Set<string>());
  const facultyContestTitles = useRef(new Set<string>());

  useEffect(() => {
    facultyContestIds.current = new Set(facultyContests.map((c) => c.id.toLowerCase()));
    facultyContestTitles.current = new Set(facultyContests.map((c) => (c.title || '').trim().toLowerCase()));
  }, [facultyContests]);

  /**
   * Load live proctor telemetry from API
   */
  const loadProctorData = useCallback(async () => {
    try {
      const res = await fetch('/api/icpc/proctor', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success) return;

      const rawSessions: ActiveProctorSession[] = data.activeSessions || [];
      const rawIncidents: ProctorIncident[] = data.incidents || [];
      const rawSubmissions: ContestSubmission[] = data.submissions || [];

      // Filter to sessions, incidents, and verified submissions associated with this faculty's contests
      const mySessions = rawSessions.filter((s) => {
        if (!s) return false;
        const cId = (s.contestId || '').toLowerCase();
        const cTitle = (s.contestTitle || '').trim().toLowerCase();

        // If faculty has no contests loaded yet, show sessions as fallback
        if (facultyContestIds.current.size === 0) return true;

        return facultyContestIds.current.has(cId) || facultyContestTitles.current.has(cTitle);
      });

      const myIncidents = rawIncidents.filter((inc) => {
        if (!inc) return false;
        const cId = (inc.contestId || '').toLowerCase();
        const cTitle = (inc.contestTitle || '').trim().toLowerCase();

        if (facultyContestIds.current.size === 0) return true;

        return facultyContestIds.current.has(cId) || facultyContestTitles.current.has(cTitle);
      });

      const mySubmissions = rawSubmissions.filter((sub) => {
        if (!sub) return false;
        const cId = (sub.contestId || '').toLowerCase();
        const cTitle = (sub.contestTitle || '').trim().toLowerCase();

        if (facultyContestIds.current.size === 0) return true;

        return facultyContestIds.current.has(cId) || facultyContestTitles.current.has(cTitle);
      });

      setActiveSessions(mySessions);
      setIncidents(myIncidents);
      setSubmissions(mySubmissions);
      if (data.stats) {
        setStats({
          ...data.stats,
          activeSessions: mySessions.length,
          totalViolations: myIncidents.length,
        });
      }
    } catch (err) {
      console.warn('Failed to fetch faculty proctor telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling loop
  useEffect(() => {
    if (!isOpen) return;
    loadProctorData();

    if (!autoRefresh) return;
    const interval = setInterval(loadProctorData, theaterSession ? 2000 : 4000);
    return () => clearInterval(interval);
  }, [isOpen, autoRefresh, loadProctorData, theaterSession]);

  /**
   * Send realtime WebSocket broadcast to student
   */
  const sendRealtimeCommand = useCallback((studentId: string, event: 'admin-caution' | 'admin-demolish', payload: any) => {
    try {
      const ch = supabase.channel(`icpc-proctor-${studentId}`, { config: { broadcast: { self: false } } });
      const doSend = () => {
        ch.send({ type: 'broadcast', event, payload }).catch(() => {});
      };

      if ((ch as any).state === 'joined') {
        doSend();
      } else {
        ch.subscribe((status) => {
          if (status === 'SUBSCRIBED') doSend();
        });
      }
    } catch (e) {
      console.warn('Broadcast command error:', e);
    }
  }, []);

  /**
   * Handle issuing a caution alert to a contestant
   */
  const handleSendCaution = async () => {
    if (!cautionTarget) return;
    setIsCautioning(true);
    const msg = cautionText.trim() || 'Keep your attention focused strictly on the contest problem and editor.';

    sendRealtimeCommand(cautionTarget.studentId, 'admin-caution', { message: msg });

    try {
      await fetch('/api/icpc/proctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'caution',
          studentId: cautionTarget.studentId,
          message: msg,
        }),
      });
      await loadProctorData();
    } catch (e) {
      console.warn('Caution error:', e);
    } finally {
      setIsCautioning(false);
      setCautionTarget(null);
      setCautionText('');
    }
  };

  /**
   * Handle demolishing a contestant's session for cheating
   */
  const handleDemolish = async () => {
    if (!demolishTarget) return;
    setIsDemolishing(true);
    const reason = demolishReason.trim() || 'Session demolished and contestant disqualified by faculty instructor.';

    sendRealtimeCommand(demolishTarget.studentId, 'admin-demolish', { reason });

    try {
      await fetch('/api/icpc/proctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'demolish',
          studentId: demolishTarget.studentId,
          reason,
        }),
      });
      await loadProctorData();
    } catch (e) {
      console.warn('Demolish error:', e);
    } finally {
      setIsDemolishing(false);
      setDemolishTarget(null);
      setDemolishReason('');
      if (theaterSession?.studentId === demolishTarget.studentId) {
        setTheaterSession(null);
      }
    }
  };

  /**
   * WebRTC & Realtime Stream Consumer for Theater Mode
   */
  useEffect(() => {
    if (!theaterSession?.studentId) return;
    const studentId = theaterSession.studentId;
    let isMounted = true;
    let channel: any = null;

    setIsWebRtcConnected(false);
    setIsWebRtcConnecting(true);
    setIsWebRtcVideoActive(false);

    try {
      channel = supabase.channel(`icpc-proctor-${studentId}`, {
        config: { broadcast: { self: false } },
      });

      // Listen for screen frames broadcast by student laptop
      channel.on('broadcast', { event: 'screen_frame' }, (msg: any) => {
        const { snapshot, connected } = msg?.payload || {};
        if (!isMounted) return;
        setTheaterSession((prev) => {
          if (!prev || prev.studentId !== studentId) return prev;
          return {
            ...prev,
            screenConnected: connected ?? true,
            screenSnapshot: snapshot || prev.screenSnapshot,
          };
        });
      });

      // Listen for side camera frames broadcast by mobile phone
      channel.on('broadcast', { event: 'sidecam_frame' }, (msg: any) => {
        const { snapshot, connected } = msg?.payload || {};
        if (!isMounted) return;
        setTheaterSession((prev) => {
          if (!prev || prev.studentId !== studentId) return prev;
          return {
            ...prev,
            sideCameraConnected: connected ?? true,
            sideCameraSnapshot: snapshot || prev.sideCameraSnapshot,
          };
        });
      });

      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED' && channel && isMounted) {
          channel.send({
            type: 'broadcast',
            event: 'webrtc-request-stream',
            payload: { requestedAt: Date.now() },
          }).catch(() => {});
        }
      });
    } catch (err) {
      console.warn('Theater setup error:', err);
    }

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
      if (theaterPcRef.current) {
        theaterPcRef.current.close();
        theaterPcRef.current = null;
      }
    };
  }, [theaterSession?.studentId]);

  // Filter sessions by selected contest dropdown & search query
  const filteredSessions = activeSessions.filter((s) => {
    if (selectedContestId !== 'all') {
      const matchId = s.contestId === selectedContestId;
      const targetContest = facultyContests.find((c) => c.id === selectedContestId);
      const matchTitle = targetContest && s.contestTitle?.toLowerCase() === targetContest.title.toLowerCase();
      if (!matchId && !matchTitle) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.studentName?.toLowerCase().includes(q);
      const matchEmail = s.studentEmail?.toLowerCase().includes(q);
      const matchCollege = s.college?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCollege) return false;
    }

    return true;
  });

  const filteredIncidents = incidents.filter((inc) => {
    if (selectedContestId !== 'all') {
      const matchId = inc.contestId === selectedContestId;
      const targetContest = facultyContests.find((c) => c.id === selectedContestId);
      const matchTitle = targetContest && inc.contestTitle?.toLowerCase() === targetContest.title.toLowerCase();
      if (!matchId && !matchTitle) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inc.studentName?.toLowerCase().includes(q);
      const matchCollege = inc.college?.toLowerCase().includes(q);
      if (!matchName && !matchCollege) return false;
    }

    return true;
  });

  const filteredSubmissions = submissions.filter((sub) => {
    if (selectedContestId !== 'all') {
      const matchId = (sub.contestId || '').toLowerCase() === selectedContestId.toLowerCase();
      const targetContest = facultyContests.find((c) => c.id === selectedContestId);
      const matchTitle = targetContest && (sub.contestTitle || '').toLowerCase() === targetContest.title.toLowerCase();
      if (!matchId && !matchTitle) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (sub.studentName || '').toLowerCase().includes(q);
      const matchEmail = (sub.studentEmail || '').toLowerCase().includes(q);
      const matchCollege = (sub.college || '').toLowerCase().includes(q);
      const matchProblem = (sub.problemTitle || '').toLowerCase().includes(q);
      const matchContest = (sub.contestTitle || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCollege && !matchProblem && !matchContest) return false;
    }

    return true;
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="🛡️ Faculty Live Proctor & Anti-Cheat Watchdog"
        maxWidth="5xl"
      >
        <div className="space-y-5">
          {/* Top Control Bar: Contest Selector + Search + Live Refresh */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-750">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">SELECT FACULTY LAB / CONTEST</label>
                <select
                  value={selectedContestId}
                  onChange={(e) => setSelectedContestId(e.target.value)}
                  className="bg-charcoal-800 border border-charcoal-700 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All My Hosted Labs ({facultyContests.length})</option>
                  {facultyContests.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher: Live Monitors vs Incidents vs Solved Students */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">VIEW MODE</label>
                <div className="flex items-center bg-charcoal-800 rounded-xl p-0.5 border border-charcoal-700">
                  <button
                    type="button"
                    onClick={() => setSubView('live_monitors')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      subView === 'live_monitors'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Live Screens ({filteredSessions.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView('incidents_log')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      subView === 'incidents_log'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Incidents ({filteredIncidents.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubView('verified_submissions')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      subView === 'verified_submissions'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Solved Students ({filteredSubmissions.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Tools: Search & Live Sync */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-charcoal-800 border border-charcoal-700 text-xs text-white rounded-xl pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
                  autoRefresh
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                    : 'bg-charcoal-800 text-slate-400 border-charcoal-700 hover:text-white'
                }`}
                title="Toggle real-time auto sync"
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{autoRefresh ? 'Live (3s)' : 'Paused'}</span>
              </button>

              <button
                type="button"
                onClick={loadProctorData}
                disabled={isLoading}
                className="p-1.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-slate-300 hover:text-white hover:border-cyan-500 transition-colors"
                title="Refresh now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Active In Arena</div>
              <div className="text-xl font-extrabold text-cyan-400 mt-0.5 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>{filteredSessions.length}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Verified Solves</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{filteredSubmissions.length}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Violations</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{filteredIncidents.length}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Screen / Tab Exits</div>
              <div className="text-xl font-extrabold text-rose-400 mt-0.5 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-rose-400" />
                <span>
                  {filteredIncidents.filter((i) => i.violationType === 'FULLSCREEN_EXIT' || i.violationType === 'TAB_SWITCH').length}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Flagged Students</div>
              <div className="text-xl font-extrabold text-indigo-400 mt-0.5 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span>{new Set(filteredIncidents.map((i) => i.studentId)).size}</span>
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: LIVE MONITORS GRID */}
          {subView === 'live_monitors' && (
            <div>
              {filteredSessions.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-charcoal-900/60 border border-charcoal-750 space-y-3">
                  <Monitor className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">No Contestants Active Right Now</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Students will appear here in real time as soon as they tap &quot;Enter Arena&quot; and share their camera &amp; screen.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[58vh] overflow-y-auto pr-1">
                  {filteredSessions.map((session) => (
                    <div
                      key={session.studentId}
                      className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3"
                    >
                      {/* Card Header: Student Info & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{session.studentName}</span>
                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                                session.status === 'demolished'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : session.status === 'cautioned'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {session.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {session.college || session.studentEmail || 'Student'} • {session.contestTitle}
                          </div>
                        </div>

                        {/* Warning Count Pill */}
                        <div
                          className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                            session.warningCount > 0
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          ⚠️ {session.warningCount} / 10
                        </div>
                      </div>

                      {/* Dual Preview Feed: Left (Screen Share), Right (Camera / Side Cam) */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Screen Share Preview */}
                        <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-charcoal-700 flex items-center justify-center">
                          {session.screenSnapshot ? (
                            <img
                              src={session.screenSnapshot}
                              alt="Contestant Screen"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-[10px] text-slate-500 font-mono text-center p-2">
                              Screen Stream Active
                            </div>
                          )}
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-white flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping" />
                            <span>SCREEN</span>
                          </div>
                        </div>

                        {/* Side Cam / Front Cam Preview */}
                        <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-charcoal-700 flex items-center justify-center">
                          {session.sideCameraSnapshot ? (
                            <img
                              src={session.sideCameraSnapshot}
                              alt="Side Camera Desk"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-[10px] text-slate-500 font-mono text-center p-2">
                              {session.sideCameraConnected ? 'Side Cam Online' : 'Front Cam Active'}
                            </div>
                          )}
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-white flex items-center gap-1">
                            <span
                              className={`w-1 h-1 rounded-full ${
                                session.sideCameraConnected ? 'bg-emerald-400' : 'bg-cyan-400'
                              }`}
                            />
                            <span>{session.sideCameraConnected ? 'SIDE CAM' : 'CAMERA'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: Theater Stream, Caution, Demolish */}
                      <div className="flex items-center gap-2 pt-2 border-t border-charcoal-750">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setTheaterSession(session)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-cyan-300" />}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                        >
                          Live Theater Stream
                        </Button>

                        <button
                          type="button"
                          onClick={() => {
                            setCautionTarget(session);
                            setCautionText('Proctor Warning: Academic integrity caution issued by faculty proctor.');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-bold transition-colors"
                          title="Send caution warning"
                        >
                          ⚠️ Caution
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDemolishTarget(session);
                            setDemolishReason('Contest forcefully demolished and contestant disqualified for cheating by faculty instructor.');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold transition-colors"
                          title="Demolish contest attempt"
                        >
                          🛑 Demolish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: INCIDENTS LOG */}
          {subView === 'incidents_log' && (
            <div className="space-y-3">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-2xl bg-charcoal-900/60 border border-charcoal-750 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-200">Zero Anti-Cheat Violations</h4>
                  <p className="text-xs text-slate-400">All participating students are adhering strictly to contest integrity guidelines.</p>
                </div>
              ) : (
                <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
                  {filteredIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`p-2 rounded-lg ${
                            inc.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{inc.studentName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-800 border border-charcoal-700 text-slate-300">
                              {inc.violationType}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{inc.details}</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] text-amber-400 font-bold mt-0.5 font-mono">
                          Warning #{inc.warningCount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: VERIFIED SOLVED STUDENTS REPORT */}
          {subView === 'verified_submissions' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Faculty Verified Roster:</strong> Only students who entered the arena and submitted an <strong>Accepted (Correct Answer)</strong> solution appear in this report.
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 shrink-0">
                  {filteredSubmissions.length} Verified Solves
                </span>
              </div>

              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-charcoal-900/60 border border-charcoal-750 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">No Verified Solves Recorded Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Students who enter this contest and submit genuine correct code passing all evaluation testcases will automatically have their names and submissions logged here for faculty records.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                  {filteredSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                          {sub.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{sub.studentName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                              Accepted (AC)
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            {sub.college || 'Collegiate Student'} • Problem: <span className="text-cyan-300 font-semibold">{sub.problemTitle || sub.problemId}</span> ({sub.contestTitle || 'Contest'})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                        <div className="px-2 py-1 rounded-lg bg-charcoal-800 border border-charcoal-700 text-[11px]">
                          Lang: <span className="text-indigo-300 font-bold">{sub.language}</span>
                        </div>
                        <div className="px-2 py-1 rounded-lg bg-charcoal-800 border border-charcoal-700 text-[11px]">
                          Runtime: <span className="text-emerald-300 font-bold">{sub.runtime}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* 60FPS High-Definition Live Theater Modal */}
      <Modal
        isOpen={Boolean(theaterSession)}
        onClose={() => setTheaterSession(null)}
        title={theaterSession ? `📺 Live Contestant Stream • ${theaterSession.studentName}` : 'Live Contestant Stream'}
        maxWidth="5xl"
      >
        {theaterSession && (
          <div className="space-y-4">
            {/* Theater Header Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-charcoal-900 border border-charcoal-750">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time Stream Active</span>
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {theaterSession.contestTitle}
                  {theaterSession.problemTitle ? ` • ${theaterSession.problemTitle}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  ⚠️ {theaterSession.warningCount} / 10 Warnings
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase">
                  {theaterSession.status}
                </span>
              </div>
            </div>

            {/* Dual Video Stream: Screen (Left), Side Camera (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Screen Stream */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-charcoal-750 flex items-center justify-center">
                {theaterSession.screenSnapshot ? (
                  <img
                    src={theaterSession.screenSnapshot}
                    alt="Contestant Screen Stream"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400 mx-auto" />
                    <div className="text-xs font-bold text-white">Connecting Screen Feed...</div>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 border border-white/10 text-[9px] font-mono text-white flex items-center gap-1.5 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-bold">CONTESTANT SCREEN</span>
                </div>
              </div>

              {/* Side Camera / Front Camera */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-charcoal-750 flex items-center justify-center">
                {theaterSession.sideCameraSnapshot ? (
                  <img
                    src={theaterSession.sideCameraSnapshot}
                    alt="Side Camera Desk Feed"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500 space-y-2">
                    <Smartphone className="w-6 h-6 text-cyan-400/60 mx-auto animate-pulse" />
                    <div className="text-xs font-mono font-bold text-slate-400">
                      {theaterSession.sideCameraConnected ? 'Side Camera Transmitting' : 'Camera Online'}
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 border border-white/10 text-[9px] font-mono text-white flex items-center gap-1.5 z-10">
                  <span className={`w-1.5 h-1.5 rounded-full ${theaterSession.sideCameraConnected ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                  <span className="font-bold">SIDE CAM (DESK &amp; LAP)</span>
                </div>
              </div>
            </div>

            {/* Instant Action Bar */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-charcoal-900 border border-charcoal-750">
              <div className="text-xs text-slate-400 font-mono">
                Contestant: <span className="text-white font-bold">{theaterSession.studentName}</span> ({theaterSession.college || 'College Student'})
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCautionTarget(theaterSession);
                    setCautionText('Proctor Warning: Academic integrity caution issued by faculty proctor.');
                  }}
                  leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-bold"
                >
                  Issue Caution Alert
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDemolishTarget(theaterSession);
                    setDemolishReason('Contest forcefully demolished and contestant disqualified for cheating by faculty instructor.');
                  }}
                  leftIcon={<AlertOctagon className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Demolish Contest
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheaterSession(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close Stream
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Caution Prompt Modal */}
      <Modal
        isOpen={Boolean(cautionTarget)}
        onClose={() => setCautionTarget(null)}
        title={`⚠️ Issue Caution Alert • ${cautionTarget?.studentName || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            This message will appear immediately over the student&apos;s code editor in the arena with an audio alert.
          </p>

          <textarea
            value={cautionText}
            onChange={(e) => setCautionText(e.target.value)}
            placeholder="Type caution message..."
            rows={3}
            className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCautionTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendCaution}
              isLoading={isCautioning}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
            >
              Send Caution
            </Button>
          </div>
        </div>
      </Modal>

      {/* Demolish Confirmation Modal */}
      <Modal
        isOpen={Boolean(demolishTarget)}
        onClose={() => setDemolishTarget(null)}
        title={`🛑 Demolish Contest • ${demolishTarget?.studentName || ''}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-300">
            Are you sure you want to demolish this contest session? The student will be immediately disqualified and expelled from the arena.
          </p>

          <textarea
            value={demolishReason}
            onChange={(e) => setDemolishReason(e.target.value)}
            placeholder="Reason for disqualification..."
            rows={2}
            className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDemolishTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDemolish}
              isLoading={isDemolishing}
              className="text-xs font-bold"
            >
              Confirm Disqualification
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
