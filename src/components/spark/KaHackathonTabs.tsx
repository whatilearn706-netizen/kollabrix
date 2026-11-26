'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { KaArchitectureDiagram } from './KaArchitectureDiagram';
import { downloadScreeningPptx, ScreeningDeck } from '@/lib/spark/pptxExport';

export function ScreeningDeckView({ deck }: { deck: ScreeningDeck }) {
  const [downloading, setDownloading] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-black/50 border border-amber-400/30">
        <div>
          <div className="text-xs font-bold text-white">{deck.deckTitle}</div>
          <div className="text-[11px] text-zinc-400">
            {deck.hackathonName} · Forecast Shortlist Confidence:{' '}
            <strong className="text-emerald-300">{deck.shortlistScoreForecast}/100</strong>
          </div>
        </div>
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
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-60"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Exporting...' : 'Download .pptx Deck'}</span>
        </button>
      </div>

      <KaArchitectureDiagram
        nodes={deck.architectureNodes}
        edges={deck.architectureEdges}
        mermaidCode={deck.mermaidCode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(deck.slides || []).map((s) => (
          <div key={s.slideNumber} className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 uppercase">
              <span>Slide {s.slideNumber}</span>
              <span>{s.type}</span>
            </div>
            <h5 className="text-sm font-bold text-white">{s.title}</h5>
            <p className="text-xs text-amber-300 font-medium">{s.headline}</p>
            <ul className="space-y-1 text-xs text-zinc-300 list-disc pl-4">
              {(s.bullets || []).map((b, i) => (
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

export function ProblemAnalyzerView({ analysis }: { analysis: any }) {
  const options = Array.isArray(analysis?.options) ? analysis.options : [];
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 space-y-1">
        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Recommended Pick: {options[analysis?.winnerIndex ?? 0]?.label || 'Option 1'}</span>
        </div>
        <p className="text-xs text-zinc-200 leading-relaxed">{analysis?.winnerSummary}</p>
      </div>

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

export function DemoQaView({ demoQa, repoScanned }: { demoQa: any; repoScanned: any }) {
  return (
    <div className="space-y-4">
      {repoScanned && (
        <div className="text-[11px] text-emerald-300 font-mono">
          Grounded in GitHub repo {repoScanned.repoName} ({repoScanned.sha || 'HEAD'})
        </div>
      )}

      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-cyan-400" />
          <span>2-Minute Timestamped Demo Choreography</span>
        </div>
        {(demoQa?.scriptSegments || []).map((seg: any, i: number) => (
          <div key={i} className="p-3.5 rounded-xl bg-black/55 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span>{seg.section}</span>
              <span className="font-mono">{seg.timeRange}</span>
            </div>
            <p className="text-xs text-white leading-relaxed">&ldquo;{seg.spokenLine}&rdquo;</p>
            <p className="text-[11px] text-zinc-400">Screen: {seg.screenAction}</p>
          </div>
        ))}
      </div>

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
          <span>5 Brutal Judge Questions &amp; Sharp Answers</span>
        </div>
        {(demoQa?.toughQuestions || []).map((q: any, i: number) => (
          <div key={i} className="p-3.5 rounded-xl bg-black/55 border border-white/10 space-y-1.5">
            <div className="text-xs font-bold text-rose-300">Q{i + 1}: {q.question}</div>
            <div className="text-[11px] text-zinc-400 italic">{q.whyJudgesAskIt}</div>
            <div className="text-xs text-emerald-200 leading-relaxed">
              <strong>Say this:</strong> {q.winningAnswer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RepoPackView({ pack, repoScanned }: { pack: any; repoScanned: any }) {
  const [copiedKey, setCopiedKey] = useState('');
  const copy = (k: string, val: string) => {
    navigator.clipboard.writeText(val || '');
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="space-y-4">
      {repoScanned && (
        <div className="text-[11px] text-emerald-300 font-mono">
          Matched to live GitHub repo {repoScanned.repoName} ({repoScanned.sha || 'HEAD'})
        </div>
      )}

      <KaArchitectureDiagram
        nodes={pack?.architectureNodes}
        edges={pack?.architectureEdges}
        mermaidCode={pack?.mermaidCode}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>README.md</span>
            </span>
            <button
              type="button"
              onClick={() => copy('readme', pack?.readmeMarkdown)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'readme' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'readme' ? 'Copied' : 'Copy README'}</span>
            </button>
          </div>
          <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto bg-[#07090e] p-3 rounded-xl">
            {pack?.readmeMarkdown}
          </pre>
        </div>

        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>schema.sql</span>
            </span>
            <button
              type="button"
              onClick={() => copy('sql', pack?.schemaSql)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'sql' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'sql' ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="text-[11px] text-emerald-200 font-mono whitespace-pre-wrap max-h-56 overflow-y-auto bg-[#07090e] p-3 rounded-xl">
            {pack?.schemaSql}
          </pre>
        </div>
      </div>

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
