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
  RefreshCw,
  FolderTree,
  FileCode2,
  Gavel,
  Send,
  Loader2,
  Palette,
} from 'lucide-react';
import { KaArchitectureDiagram } from './KaArchitectureDiagram';
import {
  downloadScreeningPptx,
  ExportedPptxFile,
  PptxThemePalette,
  ScreeningDeck,
  triggerNativeFormPptxDownload,
} from '@/lib/spark/pptxExport';

const THEME_LABELS: Record<PptxThemePalette, string> = {
  obsidian_amber: 'Obsidian Amber',
  medical_teal: 'Medical Teal',
  emerald_civic: 'Emerald Civic',
  violet_agentic: 'Violet Agentic',
  royal_indigo: 'Royal Indigo',
  cyber_crimson: 'Cyber Crimson',
  arctic_obsidian: 'Arctic Obsidian',
  aurora_graphite: 'Aurora Graphite',
};

export function ScreeningDeckView({
  deck,
  onRegenerate,
  regenerating = false,
  tokensUsed,
}: {
  deck: ScreeningDeck & { juryObjectionShield?: string };
  onRegenerate?: (preferredTheme?: string) => void;
  regenerating?: boolean;
  tokensUsed?: number;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [exportedFile, setExportedFile] = useState<ExportedPptxFile | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>('');

  useEffect(() => {
    setExportedFile(null);
    setDownloadError('');
  }, [deck]);

  useEffect(() => {
    return () => {
      if (exportedFile?.url) URL.revokeObjectURL(exportedFile.url);
    };
  }, [exportedFile]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/50 border border-amber-400/30">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-bold text-white">{deck.deckTitle}</div>
            {deck.themePalette && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] font-mono text-cyan-200">
                {THEME_LABELS[deck.themePalette] || deck.themePalette}
                {deck.layoutStyle ? ` · ${deck.layoutStyle.replace('_', ' ')}` : ''}
              </span>
            )}
            {tokensUsed && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                {tokensUsed} KΛ-Pro Token{tokensUsed > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-400">
            {deck.hackathonName} · Shortlist Forecast:{' '}
            <strong className="text-emerald-300">{deck.shortlistScoreForecast}/100</strong>
            {deck.deckStyleNote ? ` · ${deck.deckStyleNote}` : ''}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRegenerate && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                title="Pick PPT Theme Variation"
                className="px-2.5 py-2 rounded-xl bg-black/70 border border-white/15 text-[11px] text-zinc-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">Auto Fresh Theme</option>
                {Object.entries(THEME_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={regenerating}
                onClick={() => onRegenerate(selectedTheme || undefined)}
                className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 text-xs font-bold text-cyan-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{regenerating ? 'Redesigning...' : 'Repeat / New Design'}</span>
              </button>
            </div>
          )}
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
              setDownloadError('');
              try {
                const file = await downloadScreeningPptx(deck);
                setExportedFile(file);
              } catch (err: any) {
                setDownloadError(err?.message || 'Export failed — trying direct browser download.');
                try {
                  triggerNativeFormPptxDownload(deck);
                } catch {}
              } finally {
                setDownloading(false);
              }
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloading ? 'Exporting...' : 'Download .pptx Deck'}</span>
          </button>
        </div>
      </div>

      {(exportedFile || downloadError) && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
          {exportedFile ? (
            <>
              <span className="text-emerald-200">
                Deck ready ({Math.round(exportedFile.sizeBytes / 1024)} KB) — if Safari didn&apos;t auto-save, click Save directly:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={exportedFile.url}
                  download={exportedFile.fileName}
                  className="px-3 py-1 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold"
                >
                  Save {exportedFile.fileName}
                </a>
                <button
                  type="button"
                  onClick={() => triggerNativeFormPptxDownload(deck)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 font-semibold cursor-pointer"
                >
                  Safari Direct Download
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between w-full gap-2 text-rose-200">
              <span>{downloadError}</span>
              <button
                type="button"
                onClick={() => triggerNativeFormPptxDownload(deck)}
                className="px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold cursor-pointer shrink-0"
              >
                Force Direct Download
              </button>
            </div>
          )}
        </div>
      )}

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
              <span className="flex items-center gap-1.5">
                <Palette className="w-3 h-3" />
                <span>Slide {s.slideNumber}</span>
              </span>
              <span>{s.layoutVariant ? s.layoutVariant.replace(/_/g, ' ') : s.type}</span>
            </div>
            <h5 className="text-sm font-bold text-white">{s.title}</h5>
            <p className="text-xs text-amber-300 font-medium">{s.headline}</p>
            {s.recommendedVisual && (
              <div className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                Visual: {s.recommendedVisual}
              </div>
            )}
            {Array.isArray(s.kpis) && s.kpis.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {s.kpis.slice(0, 3).map((k: any, ki: number) => (
                  <div key={ki} className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-center">
                    <div className="text-xs font-black text-emerald-300">{k.value}</div>
                    <div className="text-[9px] text-zinc-400 truncate">{k.label}</div>
                  </div>
                ))}
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

/**
 * Interactive 3-Judge Live Q&A Roast Simulator with real answer grading.
 */
export function JuryRoastView({
  roast,
  repoScanned,
  liveDemoStatus,
  onGradeAnswer,
}: {
  roast: any;
  repoScanned?: any;
  liveDemoStatus?: any;
  onGradeAnswer: (question: string, judgeRole: string, userAnswer: string) => Promise<any>;
}) {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [answerText, setAnswerText] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradesByIdx, setGradesByIdx] = useState<Record<number, any>>({});

  const questions = Array.isArray(roast?.questions) ? roast.questions : [];
  const activeQ = questions[activeIdx];
  const activeGrade = gradesByIdx[activeIdx];

  const handleGrade = async () => {
    if (!activeQ || !answerText.trim() || grading) return;
    setGrading(true);
    try {
      const grade = await onGradeAnswer(activeQ.question, activeQ.judgeRole, answerText.trim());
      if (grade) {
        setGradesByIdx((prev) => ({ ...prev, [activeIdx]: grade }));
      }
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <Gavel className="w-4 h-4" />
            <span>Live 3-Judge Roast Panel</span>
          </div>
          {repoScanned && (
            <span className="text-[10px] font-mono text-emerald-300">
              Auditing {repoScanned.repoName} ({repoScanned.sha || 'HEAD'})
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-200 leading-relaxed">{roast?.panelSummary}</p>
        {liveDemoStatus && (
          <div className={`text-[11px] font-mono ${liveDemoStatus.reachable ? 'text-cyan-300' : 'text-rose-300'}`}>
            Live Demo Probe: {liveDemoStatus.reachable ? `200 OK · ${liveDemoStatus.latencyMs}ms` : `Unreachable (${liveDemoStatus.statusCode || 'Error'})`}
          </div>
        )}
      </div>

      {/* Question Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {questions.map((q: any, i: number) => {
          const isActive = activeIdx === i;
          const graded = gradesByIdx[i];
          return (
            <button
              key={q.id || i}
              type="button"
              onClick={() => {
                setActiveIdx(i);
                setAnswerText('');
              }}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                isActive
                  ? 'bg-rose-500/15 border-rose-400/60'
                  : 'bg-black/55 border-white/10 hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                  {q.judgeRole}
                </span>
                {graded ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                    {graded.score}/10
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">{q.judgePersona || 'Strict'}</span>
                )}
              </div>
              <div className="text-xs font-semibold text-white line-clamp-2">{q.question}</div>
            </button>
          );
        })}
      </div>

      {/* Interactive Rehearsal Box */}
      {activeQ && (
        <div className="p-4 rounded-2xl bg-black/65 border border-white/15 space-y-3">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-rose-300">
              {activeQ.judgeRole} asks you live:
            </div>
            <div className="text-sm font-bold text-white">&ldquo;{activeQ.question}&rdquo;</div>
            {activeQ.targetWeakness && (
              <div className="text-[11px] text-zinc-400">
                <strong className="text-zinc-300">Probing:</strong> {activeQ.targetWeakness}
              </div>
            )}
            {activeQ.idealHint && (
              <div className="text-[11px] text-cyan-300/90">
                <strong>Hint:</strong> {activeQ.idealHint}
              </div>
            )}
          </div>

          <textarea
            rows={3}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type how you will answer this judge out loud..."
            className="w-full p-3 rounded-xl bg-[#07090e] border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-400"
          />

          <button
            type="button"
            disabled={grading || !answerText.trim()}
            onClick={handleGrade}
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {grading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{grading ? 'Judge Grading Answer...' : 'Submit Answer to Judge (1 Token)'}</span>
          </button>

          {activeGrade && (
            <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/35 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{activeGrade.verdict}</span>
                <span className="text-lg font-black text-amber-300">{activeGrade.score}/10</span>
              </div>
              <div className="text-xs text-emerald-300">
                <strong>What Worked:</strong> {activeGrade.whatWorked}
              </div>
              <div className="text-xs text-rose-300">
                <strong>Exposed Gap:</strong> {activeGrade.exposedGap}
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-white/10 text-xs text-zinc-100">
                <strong className="text-cyan-300">Say this instead to win:</strong> &ldquo;{activeGrade.upgradedScript}&rdquo;
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 1-Click Working Starter Repo Blueprint Viewer (skip first 4 hours of hackathon boilerplate).
 */
export function StarterRepoView({ starterRepo }: { starterRepo: any }) {
  const files = Array.isArray(starterRepo?.files) ? starterRepo.files : [];
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState('');

  const activeFile = files[selectedFileIdx];

  const copy = (k: string, val: string) => {
    navigator.clipboard.writeText(val || '');
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(''), 1800);
  };

  const downloadBootstrapScript = () => {
    const chunks: string[] = [
      '#!/usr/bin/env bash',
      'set -e',
      `mkdir -p "${starterRepo.projectName || 'hackathon-starter'}" && cd "${starterRepo.projectName || 'hackathon-starter'}"`,
    ];

    const writeBlock = (filePath: string, content: string) => {
      const dir = filePath.includes('/') ? filePath.slice(0, filePath.lastIndexOf('/')) : '';
      if (dir) chunks.push(`mkdir -p "${dir}"`);
      chunks.push(`cat <<'__KA_EOF__' > "${filePath}"\n${content || ''}\n__KA_EOF__`);
    };

    if (starterRepo.envExample) writeBlock('.env.example', starterRepo.envExample);
    if (starterRepo.schemaSql) writeBlock('schema.sql', starterRepo.schemaSql);
    for (const f of files) {
      if (f?.path) writeBlock(f.path, f.code || '');
    }
    chunks.push('echo "Starter repo scaffolded! Next: npm install && npm run dev"');

    const blob = new Blob([chunks.join('\n\n')], { type: 'text/x-shellscript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${starterRepo.projectName || 'hackathon-starter'}-setup.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-white font-mono">{starterRepo.projectName}</span>
            {starterRepo.setupMinutesSaved && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-zinc-950 text-[10px] font-black">
                {starterRepo.setupMinutesSaved}
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-300">{starterRepo.stackSummary}</div>
          {starterRepo.quickStartCmd && (
            <div className="text-[11px] font-mono text-cyan-300">$ {starterRepo.quickStartCmd}</div>
          )}
        </div>

        <button
          type="button"
          onClick={downloadBootstrapScript}
          className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download 1-Command Setup (.sh)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Folder Tree */}
        <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span>Folder Structure</span>
          </div>
          <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap bg-[#07090e] p-3 rounded-xl max-h-64 overflow-y-auto">
            {starterRepo.folderTree}
          </pre>
        </div>

        {/* Interactive Starter Files */}
        <div className="md:col-span-2 p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {files.map((f: any, idx: number) => (
                <button
                  key={f.path || idx}
                  type="button"
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer border transition-all ${
                    selectedFileIdx === idx
                      ? 'bg-cyan-400 text-zinc-950 border-cyan-300 font-bold'
                      : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {f.path}
                </button>
              ))}
            </div>
            {activeFile && (
              <button
                type="button"
                onClick={() => copy(`file-${selectedFileIdx}`, activeFile.code)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === `file-${selectedFileIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === `file-${selectedFileIdx}` ? 'Copied' : 'Copy File'}</span>
              </button>
            )}
          </div>

          {activeFile && (
            <>
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeFile.purpose}</span>
              </div>
              <pre className="text-[11px] font-mono text-cyan-100 whitespace-pre-wrap bg-[#07090e] p-3.5 rounded-xl max-h-72 overflow-y-auto leading-relaxed">
                {activeFile.code}
              </pre>
            </>
          )}
        </div>
      </div>

      {(starterRepo.envExample || starterRepo.schemaSql) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {starterRepo.envExample && (
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>.env.example</span>
                </span>
                <button
                  type="button"
                  onClick={() => copy('sr-env', starterRepo.envExample)}
                  className="text-[11px] px-2 py-1 rounded bg-white/5 text-zinc-300 cursor-pointer"
                >
                  {copiedKey === 'sr-env' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-amber-200 whitespace-pre-wrap bg-[#07090e] p-3 rounded-xl">
                {starterRepo.envExample}
              </pre>
            </div>
          )}
          {starterRepo.schemaSql && (
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>schema.sql</span>
                </span>
                <button
                  type="button"
                  onClick={() => copy('sr-sql', starterRepo.schemaSql)}
                  className="text-[11px] px-2 py-1 rounded bg-white/5 text-zinc-300 cursor-pointer"
                >
                  {copiedKey === 'sr-sql' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-200 whitespace-pre-wrap bg-[#07090e] p-3 rounded-xl max-h-48 overflow-y-auto">
                {starterRepo.schemaSql}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
