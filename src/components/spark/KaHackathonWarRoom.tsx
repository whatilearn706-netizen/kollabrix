'use client';

import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Target,
  Mic,
  FileCode2,
  Gavel,
  RefreshCw,
  Loader2,
  Trophy,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Globe,
  Link2,
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
  onEntitlementsUpdate?: (entitlements: any) => void;
}

export function KaHackathonWarRoom({
  blueprint,
  onRequireUpgrade,
  onEntitlementsUpdate,
}: Props) {
  const [activeTab, setActiveTab] = useState<WarRoomTab>('ppt_deck');
  const [hackathons, setHackathons] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [hackathonUrl, setHackathonUrl] = useState('');
  const [useExternalHackathonUrl, setUseExternalHackathonUrl] = useState(false);

  const [repoUrl, setRepoUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [psInput, setPsInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  // Saved deliverables
  const [deck, setDeck] = useState<any>(blueprint?.warRoom?.deck || null);
  const [psAnalysis, setPsAnalysis] = useState<any>(blueprint?.warRoom?.psAnalysis || null);
  const [demoQa, setDemoQa] = useState<any>(blueprint?.warRoom?.demoQa || null);
  const [repoPack, setRepoPack] = useState<any>(blueprint?.warRoom?.repoPack || null);
  const [repoMeta, setRepoMeta] = useState<any>(blueprint?.warRoom?.repoMeta || null);
  const [liveDemoStatus, setLiveDemoStatus] = useState<any>(blueprint?.warRoom?.liveDemoStatus || null);

  // Judge Re-Audit loop state
  const [audit, setAudit] = useState<any>(blueprint?.warRoom?.audit || null);
  const [scoreHistory, setScoreHistory] = useState<number[]>(
    Array.isArray(blueprint?.warRoom?.scoreHistory) ? blueprint.warRoom.scoreHistory : []
  );
  const [lastAuditSha, setLastAuditSha] = useState<string>(blueprint?.warRoom?.lastAuditSha || '');
  const [lastAuditDemoUrl, setLastAuditDemoUrl] = useState<string>(blueprint?.warRoom?.lastAuditDemoUrl || '');
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/hackathons')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = Array.isArray(d?.hackathons) ? d.hackathons : [];
        setHackathons(list.slice(0, 12).map((h: any) => ({ id: h.id, title: h.title })));
      })
      .catch(() => {});
  }, []);

  const runKit = async (action: 'ppt_deck' | 'pick_ps' | 'demo_qa' | 'repo_pack') => {
    setErrorMsg('');
    setNoticeMsg('');
    setLoading(true);
    try {
      const selH = hackathons.find((h) => h.id === selectedHackathonId);
      const res = await fetch('/api/spark/hackathon-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          hackathonId: useExternalHackathonUrl ? '' : selectedHackathonId,
          hackathonTitle: useExternalHackathonUrl ? '' : selH?.title || '',
          hackathonUrl: useExternalHackathonUrl ? hackathonUrl : '',
          problemStatement: notesInput || blueprint?.summary || '',
          statements: psInput,
          repoUrl: action === 'pick_ps' ? '' : repoUrl,
          liveDemoUrl: action === 'demo_qa' || action === 'repo_pack' ? liveDemoUrl : '',
          pitchNotes: notesInput,
          blueprint,
        }),
      });
      const data = await res.json();
      if (data?.entitlements) onEntitlementsUpdate?.(data.entitlements);
      if (!res.ok) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) to run Sprint Kit tools.');
        }
        setErrorMsg(data?.error || 'Request failed.');
        return;
      }

      if (data.repoScanned) setRepoMeta(data.repoScanned);
      if (data.liveDemoStatus !== undefined) setLiveDemoStatus(data.liveDemoStatus);
      if (action === 'ppt_deck' && data.deck) setDeck(data.deck);
      if (action === 'pick_ps' && data.analysis) setPsAnalysis(data.analysis);
      if (action === 'demo_qa' && data.demoQa) setDemoQa(data.demoQa);
      if (action === 'repo_pack' && data.pack) setRepoPack(data.pack);
    } catch {
      setErrorMsg('Network error running Hackathon Sprint tool. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const runJudgeAudit = async (isReaudit = false) => {
    setErrorMsg('');
    setNoticeMsg('');
    setLoading(true);
    try {
      const selH = hackathons.find((h) => h.id === selectedHackathonId);
      const previous = isReaudit && audit?.totalScore ? Number(audit.totalScore) : null;
      const res = await fetch('/api/spark/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          liveDemoUrl,
          pitchText: notesInput,
          hackathonId: useExternalHackathonUrl ? '' : selectedHackathonId,
          hackathonTitle: useExternalHackathonUrl ? '' : selH?.title || '',
          hackathonUrl: useExternalHackathonUrl ? hackathonUrl : '',
          blueprint,
          previousScore: previous ?? undefined,
          previousCommitSha: isReaudit ? lastAuditSha : '',
          previousLiveDemoUrl: isReaudit ? lastAuditDemoUrl : '',
          isReaudit,
        }),
      });
      const data = await res.json();
      if (data?.entitlements) onEntitlementsUpdate?.(data.entitlements);

      if (data?.unchanged) {
        if (data.repoScanned) setRepoMeta(data.repoScanned);
        if (data.liveDemoStatus !== undefined) setLiveDemoStatus(data.liveDemoStatus);
        setNoticeMsg(data.error || 'No new commits or live demo updates detected since last audit.');
        return;
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) to run Judge Audits.');
        }
        setErrorMsg(data?.error || 'Judge audit failed.');
        return;
      }

      setScoreDelta(typeof data.scoreDelta === 'number' ? data.scoreDelta : null);
      if (data.repoScanned) {
        setRepoMeta(data.repoScanned);
        if (data.repoScanned.sha) setLastAuditSha(data.repoScanned.sha);
      }
      if (data.liveDemoStatus !== undefined) {
        setLiveDemoStatus(data.liveDemoStatus);
      }
      setLastAuditDemoUrl(liveDemoUrl.trim());
      if (data.audit?.totalScore !== undefined) {
        setScoreHistory((prev) => [...prev, Number(data.audit.totalScore)].slice(-6));
      }
      setAudit(data.audit);
    } catch {
      setErrorMsg('Network error running Judge Audit. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: Array<{ id: WarRoomTab; label: string; icon: React.ComponentType<any> }> = [
    { id: 'ppt_deck', label: 'Screening PPT Deck', icon: Presentation },
    { id: 'pick_ps', label: 'Pick Winning PS', icon: Target },
    { id: 'demo_qa', label: '2-Min Demo & Q&A', icon: Mic },
    { id: 'repo_pack', label: 'README + Schema', icon: FileCode2 },
    { id: 'judge_share', label: 'Judge Re-Audit', icon: Gavel },
  ];

  const signals = repoMeta?.signals;
  const needsLiveDemoInput = activeTab === 'demo_qa' || activeTab === 'repo_pack' || activeTab === 'judge_share';

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1018] border border-cyan-500/25 space-y-5 shadow-2xl">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hackathon Sprint Pass Toolkit · KΛ-Pro</span>
        </div>
        <h3 className="text-lg font-black text-white">Submission-Ready Assets &amp; Repo War-Room</h3>
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
                setNoticeMsg('');
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

      {/* Context Inputs — hidden on Pick Winning PS (Image 2), tailored per active tab */}
      {activeTab !== 'pick_ps' && (
        <div className="space-y-2.5 p-3.5 rounded-2xl bg-black/40 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Target Hackathon (Kollabrix Picker OR External Hackathon URL) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
                <span className="font-semibold uppercase tracking-wider">1. Link Hackathon</span>
                <button
                  type="button"
                  onClick={() => setUseExternalHackathonUrl(!useExternalHackathonUrl)}
                  className="text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3 h-3" />
                  <span>{useExternalHackathonUrl ? 'Pick from Kollabrix' : 'Paste Hackathon Link'}</span>
                </button>
              </div>
              {useExternalHackathonUrl ? (
                <input
                  type="url"
                  value={hackathonUrl}
                  onChange={(e) => setHackathonUrl(e.target.value)}
                  placeholder="Hackathon URL or Name (e.g. https://devfolio.co/... or SIH 2026)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
                />
              ) : (
                <select
                  value={selectedHackathonId}
                  onChange={(e) => setSelectedHackathonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Target Hackathon (Optional — Live from Kollabrix)</option>
                  {hackathons.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. GitHub Repo / Profile URL */}
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400 px-1 font-semibold uppercase tracking-wider">
                2. GitHub Repo or Profile URL
              </div>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/project (or profile link)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* 3. Live Demo URL (Required/Shown for 2-Min Demo & Q&A, README + Schema, Judge Re-Audit) */}
          {needsLiveDemoInput && (
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-400 px-1 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                <span>3. Live Deployed Demo URL (Vercel / Netlify / Render / Custom Link)</span>
              </div>
              <input
                type="url"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://your-project-demo.vercel.app (Gemini 4 Hydrogen inspects live routes & UI)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-emerald-500/25 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          )}
        </div>
      )}

      {noticeMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/35 text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{noticeMsg}</span>
        </div>
      )}

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
            placeholder="Paste 2 or 3 problem statements from your hackathon (numbered 1, 2, 3) to score & get the 36-hour cut list..."
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
          {psAnalysis && (
            <ProblemAnalyzerView
              analysis={psAnalysis}
              onUseWinner={(winnerText) => {
                setNotesInput(winnerText);
                setActiveTab('ppt_deck');
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            rows={3}
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            placeholder={
              activeTab === 'ppt_deck'
                ? 'Paste your problem statement or hackathon project description (auto-reads linked hackathon + GitHub codebase)...'
                : 'Add pitch highlights, target track, or recent fixes pushed to GitHub / Live Demo...'
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
                  <span>{loading ? 'Auditing Repo, Live Demo & Rubric...' : 'Run Strict Judge Audit'}</span>
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
                    ? 'Inspecting Code & Building Asset...'
                    : activeTab === 'ppt_deck'
                    ? 'Generate Bespoke 7-Slide Deck (.pptx)'
                    : activeTab === 'demo_qa'
                    ? 'Scan Repo & Live Demo → 2-Min Script + Q&A'
                    : 'Scan Repo & Live Demo → README + Schema'}
                </span>
              </button>
            )}
          </div>

          {activeTab === 'ppt_deck' && deck && <ScreeningDeckView deck={deck} />}
          {activeTab === 'demo_qa' && demoQa && (
            <DemoQaView demoQa={demoQa} repoScanned={repoMeta} liveDemoStatus={liveDemoStatus} />
          )}
          {activeTab === 'repo_pack' && repoPack && (
            <RepoPackView pack={repoPack} repoScanned={repoMeta} liveDemoStatus={liveDemoStatus} />
          )}
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
                  {scoreDelta !== null && scoreDelta !== 0 && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        scoreDelta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} pts since last audit
                    </span>
                  )}
                  <div className="text-2xl font-black text-amber-300">{audit.totalScore}/100</div>
                </div>
              </div>

              {(signals || liveDemoStatus) && (
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {liveDemoStatus && (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                        liveDemoStatus.reachable
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {liveDemoStatus.reachable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>
                        Live Demo: {liveDemoStatus.reachable ? `200 OK · ${liveDemoStatus.latencyMs}ms` : `Failed (${liveDemoStatus.statusCode || 'Unreachable'})`}
                      </span>
                    </span>
                  )}
                  {signals &&
                    [
                      { label: 'Backend API', ok: signals.hasBackendApi },
                      { label: 'Real Database', ok: signals.hasDatabase },
                      { label: 'AI / Agent SDK', ok: signals.hasAiIntegration },
                      { label: 'Tests', ok: signals.hasTests },
                    ].map((sig) => (
                      <span
                        key={sig.label}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                          sig.ok
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        {sig.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{sig.label}</span>
                      </span>
                    ))}
                </div>
              )}

              {scoreHistory.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                  <span className="text-zinc-500">Audit Progress:</span>
                  {scoreHistory.map((sc, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-md border ${
                        idx === scoreHistory.length - 1
                          ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 font-bold'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      #{idx + 1}: {sc}
                    </span>
                  ))}
                </div>
              )}

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
