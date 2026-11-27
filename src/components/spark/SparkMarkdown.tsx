'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Play, Loader2, Terminal, ArrowUpRight, Wand2, ShieldCheck } from 'lucide-react';

const RUNNABLE_LANG_MAP: Record<string, string> = {
  python: 'python',
  py: 'python',
  python3: 'python',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  java: 'java',
};

function CodeBlockCard({ lang, code }: { lang: string; code: string }) {
  const [displayedCode, setDisplayedCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [healing, setHealing] = useState(false);
  const [runResult, setRunResult] = useState<{ ok: boolean; output: string; time?: string } | null>(null);
  const [healLog, setHealLog] = useState<{
    verified: boolean;
    healed: boolean;
    attempts: Array<{ attempt: number; status: string; passed: boolean; fixNote?: string }>;
  } | null>(null);

  const normalizedLang = (lang || 'text').toLowerCase().trim();
  const judgeLang = RUNNABLE_LANG_MAP[normalizedLang];

  const handleRun = async () => {
    if (!judgeLang || running || healing) return;
    setRunning(true);
    setRunResult(null);
    setHealLog(null);
    try {
      const res = await fetch('/api/icpc/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: displayedCode,
          language: judgeLang,
          stdin: '',
        }),
      });
      const data = await res.json();
      const out = data.stdout || data.compileOutput || data.stderr || data.error || '(no output)';
      setRunResult({
        ok: data.status === 'Accepted' || (Boolean(data.stdout) && !data.stderr && !data.compileOutput),
        output: out.trim(),
        time: data.time,
      });
    } catch {
      setRunResult({ ok: false, output: 'Could not connect to sandbox compiler.' });
    } finally {
      setRunning(false);
    }
  };

  const handleAutoHeal = async () => {
    if (!judgeLang || healing || running) return;
    setHealing(true);
    setHealLog(null);
    try {
      const res = await fetch('/api/spark/auto-heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: displayedCode,
          language: judgeLang,
        }),
      });
      const data = await res.json();
      if (data?.finalCode) {
        setDisplayedCode(data.finalCode);
      }
      const out = data.stdout || data.stderr || data.error || '(no output)';
      setRunResult({
        ok: Boolean(data.verified),
        output: String(out).trim(),
        time: data.time,
      });
      if (Array.isArray(data?.attempts)) {
        setHealLog({
          verified: Boolean(data.verified),
          healed: Boolean(data.healed),
          attempts: data.attempts,
        });
      }
    } catch {
      setRunResult({ ok: false, output: 'Auto-heal verification failed to connect.' });
    } finally {
      setHealing(false);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/12 bg-[#05080F] shadow-md">
      {/* Mac-style code header */}
      <div className="px-3.5 py-2 bg-[#0B101B] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider ml-1">
            {normalizedLang || 'code'}
          </span>
          {healLog?.verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-[10px] font-bold text-emerald-300">
              <ShieldCheck className="w-3 h-3" />
              <span>{healLog.healed ? 'Auto-Fixed & Verified' : 'Verified in Judge0'}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {judgeLang && (
            <>
              <button
                type="button"
                onClick={handleRun}
                disabled={running || healing}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
              >
                {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                <span>{running ? 'Running...' : 'Run'}</span>
              </button>
              <button
                type="button"
                onClick={handleAutoHeal}
                disabled={healing || running}
                title="Run in Judge0 & auto-fix any errors with KΛ AI"
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
              >
                {healing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                <span>{healing ? 'Verifying & Fixing...' : runResult && !runResult.ok ? 'Auto-Fix Error' : 'Verify & Auto-Fix'}</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(displayedCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            }}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <pre className="p-3.5 text-xs font-mono text-cyan-100 overflow-x-auto leading-relaxed">
        <code>{displayedCode}</code>
      </pre>

      {/* Auto-Heal Trail */}
      {healLog && healLog.attempts.length > 0 && (
        <div className="px-3.5 py-2 border-t border-white/10 bg-[#0A0E17] space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Judge0 Auto-Verify Trail
          </div>
          <div className="flex flex-wrap gap-1.5">
            {healLog.attempts.map((a) => (
              <span
                key={a.attempt}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  a.passed
                    ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/35 text-rose-300'
                }`}
              >
                #{a.attempt}: {a.status}
                {a.fixNote ? ` → ${a.fixNote}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Compiler Output */}
      {runResult && (
        <div
          className={`px-3.5 py-2.5 border-t text-xs font-mono whitespace-pre-wrap ${
            runResult.ok
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-75 mb-1">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>Sandbox Output</span>
            </span>
            {runResult.time && <span>{runResult.time}</span>}
          </div>
          {runResult.output}
        </div>
      )}
    </div>
  );
}

function renderInlineFormatting(text: string, depth = 0): React.ReactNode[] {
  // Clean single-$ math delimiters like $O(n \log n)$ into clean readable text
  const cleaned =
    depth === 0
      ? text.replace(/\$([^$\n]{1,60})\$/g, (_, inner) =>
          inner
            .replace(/\\log/g, 'log')
            .replace(/\\cdot/g, '·')
            .replace(/\\times/g, '×')
            .replace(/\\le/g, '≤')
            .replace(/\\ge/g, '≥')
        )
      : text;

  // Split markdown links [text](url), inline code (`...`), and bold (**...**)
  const tokens = cleaned.split(/(\[[^\]\n]+\]\([^)\s]+\)|`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith('[') && tok.includes('](') && tok.endsWith(')')) {
      const m = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const label = m[1];
        const href = m[2];
        const isInternal = href.startsWith('/');
        if (isInternal) {
          return (
            <Link
              key={i}
              href={href}
              className="inline-flex items-center gap-0.5 text-amber-300 hover:text-amber-200 underline decoration-amber-400/40 underline-offset-2 font-medium transition-colors"
            >
              <span>{label}</span>
              <ArrowUpRight className="w-3 h-3 inline shrink-0" />
            </Link>
          );
        }
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-cyan-300 hover:text-cyan-200 underline decoration-cyan-400/40 underline-offset-2 font-medium transition-colors"
          >
            <span>{label}</span>
            <ArrowUpRight className="w-3 h-3 inline shrink-0" />
          </a>
        );
      }
    }
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 border border-white/10 font-mono text-[12px] text-cyan-200"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length >= 4) {
      return (
        <strong key={i} className="font-bold text-white">
          {depth < 2 ? renderInlineFormatting(tok.slice(2, -2), depth + 1) : tok.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{tok}</React.Fragment>;
  });
}

function TextSegment({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trimEnd();
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (/^[-*_]{3,}$/.test(trimmed)) {
          return <hr key={idx} className="border-white/10 my-2.5" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-white pt-2">
              {renderInlineFormatting(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-extrabold text-white pt-2">
              {renderInlineFormatting(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-lg font-black text-white pt-2">
              {renderInlineFormatting(trimmed.slice(2))}
            </h1>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="pl-3 border-l-2 border-amber-400/60 text-zinc-300 italic text-[13px]"
            >
              {renderInlineFormatting(trimmed.slice(2))}
            </blockquote>
          );
        }
        // Nested / indented bullet
        if (/^\s{2,}[-*]\s+/.test(line)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-6 text-zinc-300">
              <span className="text-zinc-500 font-bold mt-0.5">◦</span>
              <span className="flex-1">{renderInlineFormatting(trimmed.replace(/^[-*]\s+/, ''))}</span>
            </div>
          );
        }
        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-amber-400 font-bold mt-0.5">•</span>
              <span className="flex-1">{renderInlineFormatting(trimmed.replace(/^[-*]\s+/, ''))}</span>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+\.)\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-cyan-400 font-mono font-bold text-xs mt-0.5">{numMatch[1]}</span>
                <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }
        }
        return <p key={idx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

/**
 * Clean Markdown & Runnable Code Block renderer for AI Spark messages.
 */
export function SparkMarkdown({ content }: { content: string }) {
  // Split fenced code blocks ```lang\n...\n```
  const parts = content.split(/(```[\w+-]*\n[\s\S]*?```)/g);

  return (
    <div className="text-[13.5px] leading-relaxed text-zinc-200 space-y-1">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstNewline = part.indexOf('\n');
          const lang = firstNewline > 3 ? part.slice(3, firstNewline).trim() : 'text';
          const code = firstNewline >= 0 ? part.slice(firstNewline + 1, -3).replace(/\n$/, '') : '';
          return <CodeBlockCard key={idx} lang={lang} code={code} />;
        }
        return <TextSegment key={idx} text={part} />;
      })}
    </div>
  );
}
