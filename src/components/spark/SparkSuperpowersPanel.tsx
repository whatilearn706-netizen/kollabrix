'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Rocket,
  Gavel,
  FileCode2,
  Check,
  Copy,
  Download,
  ExternalLink,
  Share2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export interface SparkChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  engine?: string;
  attachmentNames?: string[];
  actions?: Array<{ label: string; href: string; kind: 'arena' | 'icpc' | 'teammates' | 'workspace' }>;
}

interface MatchedBuilder {
  user_id: string;
  username?: string;
  display_name: string;
  avatar_url?: string;
  college: string;
  skills: string[];
  preferred_roles: string[];
  matchedSkills: string[];
  matchScore: number;
}

interface JudgeAudit {
  totalScore: number;
  judgeVerdict: string;
  breakdown: Array<{ criterion: string; score: number; maxScore: number; feedback: string }>;
  top3Fixes: string[];
}

interface StarterFile {
  path: string;
  content: string;
}

interface Props {
  blueprint: any;
  track: string;
  sessionId: string | null;
  messages: SparkChatMessage[];
  onMessagesChange: (next: SparkChatMessage[]) => void;
  userCollege?: string;
  onShareSession: () => void;
  shareCopied: boolean;
  onRequireUpgrade?: (reason: string) => void;
}

/**
 * Interactive KΛ ΛI Hackathon Superpowers Panel:
 * 1. Live Campus Squad Match & 1-Click Workspace + Kanban Launch
 * 2. Hackathon Judge Simulator (with GitHub Repo Audit)
 * 3. 1-Click Starter Code & Architecture Export
 */
export function SparkSuperpowersPanel({
  blueprint,
  track,
  sessionId,
  userCollege,
  onShareSession,
  shareCopied,
  onRequireUpgrade,
}: Props) {
  const router = useRouter();

  // Squad Match & Launch Workspace state
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<MatchedBuilder[] | null>(null);
  const [selectedInvites, setSelectedInvites] = useState<string[]>([]);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');

  // Hackathon Judge state
  const [showJudge, setShowJudge] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [pitchText, setPitchText] = useState('');
  const [judging, setJudging] = useState(false);
  const [audit, setAudit] = useState<JudgeAudit | null>(null);
  const [judgeError, setJudgeError] = useState('');

  // Starter Export state
  const [exporting, setExporting] = useState(false);
  const [starterFiles, setStarterFiles] = useState<StarterFile[] | null>(null);
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);

  const handleFindSquad = async () => {
    setMatching(true);
    setLaunchError('');
    try {
      const res = await fetch('/api/spark/squad-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'match',
          requiredSkills: blueprint.technologies || [],
          desiredRoles: blueprint.desired_roles || [],
          userCollege: userCollege || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade?.(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) to match teammates.');
        }
        setLaunchError(data?.error || 'Could not scan campus teammates right now.');
        return;
      }
      if (data?.success && Array.isArray(data.matches)) {
        setMatches(data.matches);
        setSelectedInvites(data.matches.slice(0, 2).map((m: MatchedBuilder) => m.user_id));
      }
    } catch {
      setLaunchError('Could not scan campus teammates right now.');
    } finally {
      setMatching(false);
    }
  };

  const handleLaunchWorkspace = async () => {
    setLaunching(true);
    setLaunchError('');
    try {
      const res = await fetch('/api/spark/squad-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'launch_workspace',
          blueprint,
          invitedUserIds: selectedInvites,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.workspaceUrl) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade?.(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) to launch a workspace.');
        }
        setLaunchError(data?.error || 'Please sign in and complete your profile to launch a workspace.');
        return;
      }
      router.push(data.workspaceUrl);
    } catch {
      setLaunchError('Failed to create workspace. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  const handleRunJudge = async () => {
    setJudging(true);
    setJudgeError('');
    try {
      const res = await fetch('/api/spark/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, pitchText, track, blueprint }),
      });
      const data = await res.json();
      if (!res.ok || !data?.audit) {
        if (res.status === 401 || res.status === 402 || data?.upgradeRequired) {
          onRequireUpgrade?.(data?.error || 'Unlock Hackathon Pass (₹49 / 7 days) for AI Judge Audits.');
        }
        setJudgeError(data?.error || 'Audit failed.');
        return;
      }
      setAudit(data.audit);
    } catch {
      setJudgeError('Could not reach Judge Simulator.');
    } finally {
      setJudging(false);
    }
  };

  const handleExportStarter = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/spark/starter-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint }),
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.files)) {
        setStarterFiles(data.files);
        setActiveFileIdx(0);
      }
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadStarterScript = () => {
    if (!starterFiles || starterFiles.length === 0) return;
    const scriptLines = [
      '#!/usr/bin/env bash',
      `# Kollabrix KΛ ΛI Starter Setup for: ${blueprint.title}`,
      'set -e',
      ...starterFiles.flatMap((f) => {
        const dir = f.path.includes('/') ? f.path.split('/').slice(0, -1).join('/') : '';
        const cmds = [];
        if (dir) cmds.push(`mkdir -p "${dir}"`);
        cmds.push(`cat << 'KOLLABRIX_EOF' > "${f.path}"\n${f.content}\nKOLLABRIX_EOF`);
        return cmds;
      }),
      'echo "✅ Starter repository files created!"',
    ].join('\n\n');

    const blob = new Blob([scriptLines], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(blueprint.title || 'spark-starter').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-setup.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-white/10">
      {/* Superpowers Action Strip */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleFindSquad}
          disabled={matching}
          className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {matching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
          <span>Find My Squad Now</span>
        </button>

        <button
          type="button"
          onClick={handleLaunchWorkspace}
          disabled={launching}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-zinc-950 text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
        >
          {launching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
          <span>Launch Workspace + Kanban</span>
        </button>

        <button
          type="button"
          onClick={() => setShowJudge(!showJudge)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            showJudge
              ? 'bg-violet-500/25 border-violet-400/50 text-violet-200'
              : 'bg-white/5 hover:bg-white/10 border-white/15 text-zinc-200'
          }`}
        >
          <Gavel className="w-3.5 h-3.5 text-violet-400" />
          <span>Judge My Project</span>
        </button>

        <button
          type="button"
          onClick={handleExportStarter}
          disabled={exporting}
          className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCode2 className="w-3.5 h-3.5" />}
          <span>Export Starter Code</span>
        </button>

        {sessionId && (
          <button
            type="button"
            onClick={onShareSession}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{shareCopied ? 'Thread Link Copied' : 'Share Spark Thread'}</span>
          </button>
        )}
      </div>

      {launchError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{launchError}</span>
        </div>
      )}

      {/* 1. Live Campus Squad Match Results */}
      {matches && (
        <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Matched Campus Builders ({matches.length} found)</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Select teammates below — clicking &ldquo;Launch Workspace + Kanban&rdquo; sends them instant squad invites.
              </p>
            </div>
          </div>

          {matches.length === 0 ? (
            <p className="text-xs text-zinc-400">No active student profiles matched yet. Launch your workspace to open public applications!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matches.map((m) => {
                const isSelected = selectedInvites.includes(m.user_id);
                return (
                  <div
                    key={m.user_id}
                    onClick={() =>
                      setSelectedInvites((prev) =>
                        isSelected ? prev.filter((id) => id !== m.user_id) : [...prev, m.user_id]
                      )
                    }
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50'
                        : 'bg-[#090C12] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{m.display_name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {m.matchScore}% match
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{m.college}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(m.matchedSkills.length > 0 ? m.matchedSkills : m.skills.slice(0, 3)).map((sk) => (
                          <span key={sk} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 accent-emerald-500"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Hackathon Judge Simulator */}
      {showJudge && (
        <div className="p-5 rounded-2xl bg-black/60 border border-violet-500/35 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Gavel className="w-4 h-4 text-violet-400" />
                <span>Hackathon Judge Simulator ({track.toUpperCase()} Rubric)</span>
              </h4>
              <p className="text-xs text-zinc-400">
                Paste your public GitHub repo URL or pitch draft to get a 100-point audit + top 3 fixes before judging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/your-hackathon-repo"
              className="px-3.5 py-2.5 rounded-xl bg-[#090C12] border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-400"
            />
            <input
              type="text"
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Optional: extra demo notes or target metrics..."
              className="px-3.5 py-2.5 rounded-xl bg-[#090C12] border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-400"
            />
          </div>

          <button
            type="button"
            onClick={handleRunJudge}
            disabled={judging}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {judging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gavel className="w-3.5 h-3.5" />}
            <span>{judging ? 'Auditing Repo & Rubric...' : 'Run Judge Audit'}</span>
          </button>

          {judgeError && <p className="text-xs text-rose-400">{judgeError}</p>}

          {audit && (
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-mono text-violet-300 uppercase">Projected Judge Score</span>
                  <div className="text-2xl font-black text-white">{audit.totalScore} / 100</div>
                </div>
                <p className="text-xs text-zinc-300 max-w-xl">{audit.judgeVerdict}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {audit.breakdown.map((b) => (
                  <div key={b.criterion} className="p-3 rounded-xl bg-[#090C12] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{b.criterion}</span>
                      <span className="text-violet-300">{b.score}/{b.maxScore}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">{b.feedback}</p>
                  </div>
                ))}
              </div>
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="text-xs font-bold text-amber-300">Top 3 Fixes Before Submission:</div>
                <ul className="space-y-1 text-xs text-zinc-200 list-disc pl-4">
                  {audit.top3Fixes.map((fix, idx) => (
                    <li key={idx}>{fix}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Starter Code & Architecture Export */}
      {starterFiles && starterFiles.length > 0 && (
        <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-400" />
              <span>Generated Starter Repository ({starterFiles.length} files)</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(starterFiles[activeFileIdx]?.content || '');
                  setCopiedFile(true);
                  setTimeout(() => setCopiedFile(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-zinc-200 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFile ? 'Copied' : 'Copy File'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadStarterScript}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Setup Script (.sh)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {starterFiles.map((f, idx) => (
              <button
                key={f.path}
                type="button"
                onClick={() => setActiveFileIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                  activeFileIdx === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-[#090C12] text-zinc-400 border border-white/10 hover:text-white'
                }`}
              >
                {f.path}
              </button>
            ))}
          </div>

          <pre className="p-4 rounded-xl bg-[#05070B] border border-white/10 text-xs font-mono text-cyan-100 overflow-x-auto max-h-72 leading-relaxed">
            {starterFiles[activeFileIdx]?.content}
          </pre>
        </div>
      )}
    </div>
  );
}
