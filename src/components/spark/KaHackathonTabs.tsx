'use client';

import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  Download,
  AlertTriangle,
  Sparkles,
  FileText,
  Database,
  Mic,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowRight,
  KeyRound,
  Eye,
} from 'lucide-react';
import { KaArchitectureDiagram } from './KaArchitectureDiagram';
import { downloadScreeningPptx, ScreeningDeck } from '@/lib/spark/pptxExport';

export function ScreeningDeckView({ deck }: { deck: ScreeningDeck & { juryObjectionShield?: string } }) {
  const [downloading, setDownloading] = useState(false);
  const [copiedNotes, setCopiedNotes] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/50 border border-amber-400/30">
        <div>
          <div className="text-xs font-bold text-white">{deck.deckTitle}</div>
          <div className="text-[11px] text-zinc-400">
            {deck.hackathonName} · Shortlist Forecast:{' '}
            <strong className="text-emerald-300">{deck.shortlistScoreForecast}/100</strong>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const allNotes = (deck.slides || [])
                .map((s) => `Slide ${s.slideNumber} (${s.title}):\n${s.speakerNotes}`)
                .join('\n\n');
              navigator.clipboard.writeText(allNotes);
              setCopiedNotes(true);
              setTimeout(() => setCopiedNotes(false), 2000);
            }}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer"
          >
            {copiedNotes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedNotes ? 'Notes Copied' : 'Copy Notes'}</span>
          </button>
          <button
            type="button"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                await downloadScreeningPptx(deck);
              } finally {
                setDownloading(false);
              }
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download .pptx Deck'}</span>
          </button>
        </div>
      </div>

      {deck.juryObjectionShield && (
        <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-200">
          <strong className="text-violet-300">Screening Jury Shield:</strong> {deck.juryObjectionShield}
        </div>
      )}

      <KaArchitectureDiagram
        nodes={deck.architectureNodes}
        edges={deck.architectureEdges}
        mermaidCode={deck.mermaidCode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(deck.slides || []).map((s: any) => (
          <div key={s.slideNumber} className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 uppercase">
              <span>Slide {s.slideNumber}</span>
              <span>{s.type}</span>
            </div>
            <h5 className="text-sm font-bold text-white">{s.title}</h5>
            <p className="text-xs text-amber-300 font-medium">{s.headline}</p>
            {s.recommendedVisual && (
              <div className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                Visual: {s.recommendedVisual}
              </div>
            )}
            <ul className="space-y-1 text-xs text-zinc-300 list-disc pl-4">
              {(s.bullets || []).map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            {s.speakerNotes && (
              <div className="p-2.5 rounded-xl bg-white/[0.04] text-[11px] text-zinc-400">
                <strong className="text-zinc-200">Speaker Notes:</strong> {s.speakerNotes}
              </div>
            )}
            {s.redFlagFix?.weakClaim && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] space-y-1">
                <div className="text-rose-300 line-through">Weak: {s.redFlagFix.weakClaim}</div>
                <div className="text-emerald-300 font-medium">Shortlisted Fix: {s.redFlagFix.improvedClaim}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProblemAnalyzerView({
  analysis,
  onUseWinner,
}: {
  analysis: any;
  onUseWinner?: (winnerSummaryText: string) => void;
}) {
  const options = Array.isArray(analysis?.options) ? analysis.options : [];
  const winnerOpt = options[analysis?.winnerIndex ?? 0];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Recommended Pick: {winnerOpt?.label || 'Option 1'}</span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">{analysis?.winnerSummary}</p>
        </div>
        {onUseWinner && winnerOpt && (
          <button
            type="button"
            onClick={() =>
              onUseWinner(
                `${winnerOpt.title}\n\nDifferentiator: ${winnerOpt.unfairTechnicalEdge || ''}\nMVP Scope Cut List: ${(winnerOpt.cutList || []).join('; ')}`
              )
            }
            className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Build PPT Deck From Winner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {Array.isArray(analysis?.sprintSchedule36h) && analysis.sprintSchedule36h.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {analysis.sprintSchedule36h.map((phase: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-black/55 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono text-cyan-300 font-bold">{phase.window}</div>
              <div className="text-xs font-bold text-white">{phase.focus}</div>
              <div className="text-[11px] text-zinc-400">{phase.deliverable}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {options.map((opt: any, idx: number) => {
          const isWinner = idx === analysis?.winnerIndex;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-3 ${
                isWinner ? 'bg-[#0d1614] border-emerald-400/50' : 'bg-black/50 border-white/10'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold text-white">
                  {opt.label}: {opt.title}
                </div>
                {isWinner && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 text-[10px] font-black">
                    BEST ODDS TO WIN
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {[
                  { k: 'Uniqueness', v: opt.scores?.crowdSaturation },
                  { k: '36h Build', v: opt.scores?.buildability36h },
                  { k: 'Demo Wow', v: opt.scores?.demoWowFactor },
                  { k: 'Low Risk', v: opt.scores?.riskSafety },
                ].map((m) => (
                  <div key={m.k} className="p-2 rounded-xl bg-black/50 border border-white/10">
                    <div className="text-[10px] text-zinc-400">{m.k}</div>
                    <div className="text-sm font-black text-white">{m.v ?? '-'}/10</div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-300">{opt.verdict}</p>

              {Array.isArray(opt.cutList) && opt.cutList.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs space-y-1">
                  <div className="font-bold text-rose-300">What NOT to Build (Cut List):</div>
                  <ul className="list-disc pl-4 text-zinc-300 space-y-0.5">
                    {opt.cutList.map((c: string, ci: number) => (
                      <li key={ci}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {opt.unfairTechnicalEdge && (
                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl">
                  <strong>Unfair Edge 95% Miss:</strong> {opt.unfairTechnicalEdge}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DemoQaView({
  demoQa,
  repoScanned,
  liveDemoStatus,
}: {
  demoQa: any;
  repoScanned: any;
  liveDemoStatus?: any;
}) {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [revealedQs, setRevealedQs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setElapsedSec((prev) => {
        if (prev >= 120) {
          setRunning(false);
          return 120;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const segments = Array.isArray(demoQa?.scriptSegments) ? demoQa.scriptSegments : [];
  let accum = 0;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-black/55 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live 2:00 Pitch Rehearsal Timer</span>
          </div>
          {repoScanned && (
            <div className="text-[11px] text-emerald-300 font-mono">
              Grounded in {repoScanned.repoName} ({repoScanned.sha || 'HEAD'})
            </div>
          )}
          {liveDemoStatus && (
            <div
              className={`text-[11px] font-mono ${
                liveDemoStatus.reachable ? 'text-cyan-300' : 'text-rose-300'
              }`}
            >
              Live Demo: {liveDemoStatus.reachable ? `200 OK · ${liveDemoStatus.latencyMs}ms (${liveDemoStatus.detectedFramework})` : `Failed (${liveDemoStatus.statusCode || 'Unreachable'})`}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-black text-amber-300 w-16 text-center">
            {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => setRunning(!running)}
            className="px-3 py-1.5 rounded-lg bg-cyan-400 text-zinc-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{running ? 'Pause' : 'Start 2m'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setElapsedSec(0);
            }}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          <span>2-Minute Timestamped Demo Choreography</span>
        </div>
        {segments.map((seg: any, i: number) => {
          const dur = Number(seg.durationSec) || Math.round(120 / Math.max(1, segments.length));
          const isCurrent = running && elapsedSec >= accum && elapsedSec < accum + dur;
          accum += dur;
          return (
            <div
              key={i}
              className={`p-3.5 rounded-xl border space-y-1 transition-all ${
                isCurrent ? 'bg-cyan-500/15 border-cyan-400' : 'bg-black/55 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span>{seg.section}</span>
                <span className="font-mono">{seg.timeRange}</span>
              </div>
              <p className="text-xs text-white leading-relaxed">&ldquo;{seg.spokenLine}&rdquo;</p>
              <p className="text-[11px] text-zinc-400">Screen: {seg.screenAction}</p>
            </div>
          );
        })}
      </div>

      {demoQa?.chatgptWrapperRebuttal && (
        <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-xs text-violet-100 space-y-1">
          <div className="font-bold text-violet-300">&ldquo;Why is this not just a ChatGPT wrapper?&rdquo; Rebuttal:</div>
          <p>{demoQa.chatgptWrapperRebuttal}</p>
        </div>
      )}

      {demoQa?.crashFallbackTip && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>10s Live Crash Backup:</strong> {demoQa.crashFallbackTip}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>5 Brutal Judge Questions (Rehearsal Mode — Click to Reveal Answer)</span>
        </div>
        {(demoQa?.toughQuestions || []).map((q: any, i: number) => {
          const open = revealedQs[i] ?? true;
          return (
            <div key={i} className="p-3.5 rounded-xl bg-black/55 border border-white/10 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold text-rose-300">Q{i + 1}: {q.question}</div>
                <button
                  type="button"
                  onClick={() => setRevealedQs((p) => ({ ...p, [i]: !open }))}
                  className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>{open ? 'Hide' : 'Reveal'}</span>
                </button>
              </div>
              <div className="text-[11px] text-zinc-400 italic">{q.whyJudgesAskIt}</div>
              {open && (
                <div className="text-xs text-emerald-200 leading-relaxed pt-1">
                  <strong>Say this:</strong> {q.winningAnswer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RepoPackView({
  pack,
  repoScanned,
  liveDemoStatus,
}: {
  pack: any;
  repoScanned: any;
  liveDemoStatus?: any;
}) {
  const [copiedKey, setCopiedKey] = useState('');
  const copy = (k: string, val: string) => {
    navigator.clipboard.writeText(val || '');
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(''), 2000);
  };
  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {(repoScanned || liveDemoStatus) && (
        <div className="flex flex-wrap gap-3 text-[11px] font-mono">
          {repoScanned && (
            <span className="text-emerald-300">
              Matched to GitHub {repoScanned.repoName} ({repoScanned.sha || 'HEAD'})
            </span>
          )}
          {liveDemoStatus && (
            <span className={liveDemoStatus.reachable ? 'text-cyan-300' : 'text-rose-300'}>
              Live Demo: {liveDemoStatus.reachable ? `200 OK · ${liveDemoStatus.latencyMs}ms` : `Failed (${liveDemoStatus.statusCode || 'Unreachable'})`}
            </span>
          )}
        </div>
      )}

      <KaArchitectureDiagram
        nodes={pack?.architectureNodes}
        edges={pack?.architectureEdges}
        mermaidCode={pack?.mermaidCode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>README.md</span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => copy('readme', pack?.readmeMarkdown)}
                className="text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'readme' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={() => downloadFile('README.md', pack?.readmeMarkdown)}
                className="text-[11px] px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>.md</span>
              </button>
            </div>
          </div>
          <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto bg-[#07090e] p-3 rounded-xl">
            {pack?.readmeMarkdown}
          </pre>
        </div>

        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>schema.sql</span>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => copy('sql', pack?.schemaSql)}
                className="text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
              <button
                type="button"
                onClick={() => downloadFile('schema.sql', pack?.schemaSql)}
                className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>.sql</span>
              </button>
            </div>
          </div>
          <pre className="text-[11px] text-emerald-200 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto bg-[#07090e] p-3 rounded-xl">
            {pack?.schemaSql}
          </pre>
        </div>
      </div>

      {pack?.envExample && (
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>.env.example</span>
            </span>
            <button
              type="button"
              onClick={() => copy('env', pack.envExample)}
              className="text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'env' ? 'Copied' : 'Copy .env'}</span>
            </button>
          </div>
          <pre className="text-[11px] text-amber-200 font-mono whitespace-pre-wrap bg-[#07090e] p-3 rounded-xl">
            {pack.envExample}
          </pre>
        </div>
      )}

      {Array.isArray(pack?.apiEndpoints) && pack.apiEndpoints.length > 0 && (
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="text-xs font-bold text-white">API Endpoints Contract</div>
          <div className="space-y-1.5">
            {pack.apiEndpoints.map((ep: any, i: number) => (
              <div key={i} className="flex flex-wrap items-center gap-2 text-xs font-mono bg-[#07090e] px-3 py-2 rounded-lg">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">{ep.method}</span>
                <span className="text-white">{ep.path}</span>
                <span className="text-zinc-400 font-sans">— {ep.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
