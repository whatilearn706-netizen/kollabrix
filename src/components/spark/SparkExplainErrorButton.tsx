'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface SparkExplainErrorButtonProps {
  code: string;
  language: string;
  problemTitle: string;
  problemDescription?: string;
  verdict: string;
  errorOutput: string;
  stdin?: string;
  expectedOutput?: string;
  yourOutput?: string;
}

/**
 * Reusable "Ask Spark AI Why This Failed" Socratic Tutor button + hint card
 * embedded inside the Practice IDE (/icpc) and KΛ ARENA (/arena) error drawers.
 */
export function SparkExplainErrorButton({
  code,
  language,
  problemTitle,
  problemDescription,
  verdict,
  errorOutput,
  stdin,
  expectedOutput,
  yourOutput,
}: SparkExplainErrorButtonProps) {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    rootCause: string;
    hint: string;
    complexityTip: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleExplain = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/spark/explain-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemTitle,
          problemDescription,
          verdict,
          errorOutput,
          stdin,
          expectedOutput,
          yourOutput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.explanation) {
        setErrorMsg(data?.error || 'Could not analyze error right now.');
        return;
      }
      setExplanation(data.explanation);
    } catch {
      setErrorMsg('Network error contacting KΛ ΛI Tutor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2 space-y-2">
      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all cursor-pointer disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        <span>{loading ? 'KΛ ΛI Analyzing...' : 'Ask KΛ ΛI Why This Failed'}</span>
      </button>

      {errorMsg && <div className="text-[11px] text-rose-400">{errorMsg}</div>}

      {explanation && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-slate-200 space-y-1.5 font-sans">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KΛ ΛI Coach Hint</span>
          </div>
          <div>
            <strong className="text-white">Why it failed:</strong> {explanation.rootCause}
          </div>
          <div>
            <strong className="text-emerald-300">Hint:</strong> {explanation.hint}
          </div>
          <div className="text-slate-300">
            <strong className="text-cyan-300">Edge-Case / Complexity:</strong> {explanation.complexityTip}
          </div>
        </div>
      )}
    </div>
  );
}
