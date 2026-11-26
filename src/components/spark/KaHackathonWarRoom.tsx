'use client';

import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Target,
  Mic,
  FileCode2,
  Gavel,
  RefreshCw,
  Share2,
  Check,
  Loader2,
  Trophy,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  ScreeningDeckView,
  ProblemAnalyzerView,
  DemoQaView,
  RepoPackView,
} from './KaHackathonTabs';

type WarRoomTab = 'ppt_deck' | 'pick_ps' | 'demo_qa' | 'repo_pack' | 'judge_share';

interface Props {
  user: any;
  blueprint?: any;
  sessionId: string | null;
  onSessionId: (id: string) => void;
  onRequireUpgrade: (reason: string) => void;
}

export function KaHackathonWarRoom({
  user,
  blueprint,
  sessionId,
  onSessionId,
  onRequireUpgrade,
}: Props) {
  const [activeTab, setActiveTab] = useState<WarRoomTab>('ppt_deck');
  const [hackathons, setHackathons] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [psInput, setPsInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Saved deliverables
  const [deck, setDeck] = useState<any>(blueprint?.warRoom?.deck || null);
  const [psAnalysis, setPsAnalysis] = useState<any>(blueprint?.warRoom?.psAnalysis || null);
  const [demoQa, setDemoQa] = useState<any>(blueprint?.warRoom?.demoQa || null);
  const [repoPack, setRepoPack] = useState<any>(blueprint?.warRoom?.repoPack || null);
  const [repoMeta, setRepoMeta] = useState<any>(blueprint?.warRoom?.repoMeta || null);

  // Judge Re-Audit loop + Share Squad state
  const [audit, setAudit] = useState<any>(blueprint?.warRoom?.audit || null);
  const [prevScore, setPrevScore] = useState<number | null>(blueprint?.warRoom?.prevScore ?? null);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    fetch('/api/hackathons')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = Array.isArray(d?.hackathons) ? d.hackathons : [];
        setHackathons(list.slice(0, 10).map((h: any) => ({ id: h.id, title: h.title })));
      })
      .catch(() => {});
  }, []);

  const runKit = async (action: 'ppt_deck' | 'pick_ps' | 'demo_qa' | 'repo_pack') => {
    setErrorMsg('');
    setLoading(true);
    try {
      const selH = hackathons.find((h) => h.id === selectedHackathonId);
      const res = await fetch('/api/spark/hackathon-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          hackathonId: selectedHackathonId,
          hackathonTitle: selH?.title || '',
          problemStatement: notesInput || blueprint?.summary || '',
          statements: psInput,
          repoUrl,
          pitchNotes: notesInput,
          blueprint,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) to run Sprint Kit tools.');
        }
        setErrorMsg(data?.error || 'Request failed.');
        return;
      }

      if (data.repoScanned) setRepoMeta(data.repoScanned);
      if (action === 'ppt_deck' && data.deck) setDeck(data.deck);
      if (action === 'pick_ps' && data.analysis) setPsAnalysis(data.analysis);
      if (action === 'demo_qa' && data.demoQa) setDemoQa(data.demoQa);
      if (action === 'repo_pack' && data.pack) setRepoPack(data.pack);
    } catch {
      setErrorMsg('Network error running Hackathon Sprint tool.');
    } finally {
      setLoading(false);
    }
  };

  const runJudgeAudit = async (isReaudit = false) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const previous = isReaudit && audit?.totalScore ? Number(audit.totalScore) : null;
      const res = await fetch('/api/spark/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          pitchText: notesInput,
          blueprint,
          previousScore: previous ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) to run Judge Audits.');
        }
        setErrorMsg(data?.error || 'Judge audit failed.');
        return;
      }
      if (previous !== null) setPrevScore(previous);
      setScoreDelta(typeof data.scoreDelta === 'number' ? data.scoreDelta : null);
      if (data.repoScanned) setRepoMeta(data.repoScanned);
      setAudit(data.audit);
    } catch {
      setErrorMsg('Network error running Judge Audit.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWarRoom = async () => {
    if (!user?.id) {
      onRequireUpgrade('Sign in to save & share this Sprint War-Room with up to 3 squad teammates.');
      return;
    }
    setSharing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/spark/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId || undefined,
          title: deck?.deckTitle || blueprint?.title || 'Hackathon Sprint War-Room',
          prompt: notesInput || blueprint?.summary || 'Hackathon Sprint Pass War-Room',
          track: 'hackathon',
          blueprint: {
            ...(blueprint || { title: deck?.deckTitle || 'Hackathon Sprint War-Room', summary: notesInput }),
            warRoom: { repoUrl, audit, prevScore, deck, psAnalysis, demoQa, repoPack, repoMeta },
          },
          messages: [],
        }),
      });
      const data = await res.json();
      if (data?.success && data?.session?.id) {
        onSessionId(data.session.id);
        const link = `${window.location.origin}/spark?session=${data.session.id}`;
        setShareUrl(link);
        navigator.clipboard?.writeText(link);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 3000);
      } else {
        setErrorMsg(data?.error || 'Could not create shared War-Room link.');
      }
    } catch {
      setErrorMsg('Failed to share War-Room.');
    } finally {
      setSharing(false);
    }
  };

  const tabs: Array<{ id: WarRoomTab; label: string; icon: React.ComponentType<any> }> = [
    { id: 'ppt_deck', label: 'Screening PPT Deck', icon: Presentation },
    { id: 'pick_ps', label: 'Pick Winning PS', icon: Target },
    { id: 'demo_qa', label: '2-Min Demo & Q&A', icon: Mic },
    { id: 'repo_pack', label: 'README + Schema', icon: FileCode2 },
    { id: 'judge_share', label: 'Judge Re-Audit & Share', icon: Gavel },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1018] border border-cyan-500/25 space-y-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
            <Trophy className="w-3.5 h-3.5" />
            <span>Hackathon Sprint Pass Toolkit · KΛ-Pro</span>
          </div>
          <h3 className="text-lg font-black text-white">Submission-Ready Assets &amp; Repo War-Room</h3>
        </div>
        <button
          type="button"
          onClick={handleShareWarRoom}
          disabled={sharing}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
        >
          {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
          <span>{sharing ? 'Saving...' : copiedShare ? 'War-Room Link Copied!' : 'Share with Squad (3 Teammates)'}</span>
        </button>
      </div>

      {shareUrl && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200 font-mono truncate">
          Shared Squad Link: {shareUrl}
        </div>
      )}

      {/* Shared Context Bar: Target Hackathon + GitHub Repo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={selectedHackathonId}
          onChange={(e) => setSelectedHackathonId(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="">Target Hackathon (Optional — Live from Kollabrix)</option>
          {hackathons.map((h) => (
            <option key={h.id} value={h.id}>
              {h.title}
            </option>
          ))}
        </select>

        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="GitHub Repo URL (e.g. https://github.com/user/project)"
          className="px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* 5 Tool Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                setErrorMsg('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                active
                  ? 'bg-cyan-400 text-zinc-950 border-cyan-300'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Tab Form & Output */}
      {activeTab === 'pick_ps' ? (
        <div className="space-y-4">
          <textarea
            rows={4}
            value={psInput}
            onChange={(e) => setPsInput(e.target.value)}
            placeholder="Paste 2 or 3 problem statements from the hackathon (numbered 1, 2, 3) to rank & find the cut list..."
            className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => runKit('pick_ps')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-zinc-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{loading ? 'Analyzing Competition & Scope...' : 'Rank & Pick Best Problem Statement'}</span>
          </button>
          {psAnalysis && <ProblemAnalyzerView analysis={psAnalysis} />}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            rows={3}
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder={
              activeTab === 'ppt_deck'
                ? 'Paste your problem statement or hackathon project idea (auto-uses your Blueprint above if generated)...'
                : 'Add pitch highlights, target track, or recent fixes pushed to GitHub...'
            }
            className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
          />

          <div className="flex flex-wrap gap-2">
            {activeTab === 'judge_share' ? (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => runJudgeAudit(false)}
                  className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gavel className="w-3.5 h-3.5" />}
                  <span>{loading ? 'Scoring Repo & Pitch...' : 'Run Strict Judge Audit'}</span>
                </button>
                {audit && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => runJudgeAudit(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-Audit After Fixes</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => runKit(activeTab)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-cyan-400 text-zinc-950 text-xs font-extrabold flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>
                  {loading
                    ? 'Generating Finished Asset...'
                    : activeTab === 'ppt_deck'
                    ? 'Generate 7-Slide Screening Deck (.pptx)'
                    : activeTab === 'demo_qa'
                    ? 'Scan Repo & Build 2-Min Demo + Tough Q&A'
                    : 'Scan Repo & Generate README + Architecture + SQL'}
                </span>
              </button>
            )}
          </div>

          {activeTab === 'ppt_deck' && deck && <ScreeningDeckView deck={deck} />}
          {activeTab === 'demo_qa' && demoQa && <DemoQaView demoQa={demoQa} repoScanned={repoMeta} />}
          {activeTab === 'repo_pack' && repoPack && <RepoPackView pack={repoPack} repoScanned={repoMeta} />}
          {activeTab === 'judge_share' && audit && (
            <div className="p-5 rounded-2xl bg-black/60 border border-violet-500/35 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-white">Live Judge Score Meter</div>
                  {repoMeta && (
                    <div className="text-[11px] text-emerald-300 font-mono">
                      Scanned {repoMeta.repoName} ({repoMeta.sha || 'HEAD'})
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {scoreDelta !== null && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        scoreDelta >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts since last audit
                    </span>
                  )}
                  <div className="text-2xl font-black text-amber-300">{audit.totalScore}/100</div>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{audit.judgeVerdict}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(audit.breakdown || []).map((b: any) => (
                  <div key={b.criterion} className="p-3 rounded-xl bg-[#090C12] border border-white/10 space-y-1">
                    <div className="flex justify-between text-xs font-bold text-white">
                      <span>{b.criterion}</span>
                      <span className="text-violet-300">
                        {b.score}/{b.maxScore}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{b.feedback}</p>
                  </div>
                ))}
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-300">Top 3 Fixes Before Submission</div>
                <ul className="list-disc pl-4 text-xs text-zinc-200 space-y-1">
                  {(audit.top3Fixes || []).map((fix: string, i: number) => (
                    <li key={i}>{fix}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
