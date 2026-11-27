'use client';

import React, { useState, useEffect } from 'react';
import { Brain, X, Loader2, Check, Swords, Sparkles } from 'lucide-react';

interface BuilderMemoryModalProps {
  open: boolean;
  onClose: () => void;
  user: any;
  onSaved?: () => void;
}

export function KaBuilderMemoryModal({ open, onClose, user, onSaved }: BuilderMemoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [stackInput, setStackInput] = useState('');
  const [weakInput, setWeakInput] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [notes, setNotes] = useState('');
  const [arenaStats, setArenaStats] = useState<any>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    setLoading(true);
    setErrorMsg('');
    fetch('/api/spark/memory', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.memory) {
          setStackInput(Array.isArray(d.memory.preferredStack) ? d.memory.preferredStack.join(', ') : '');
          setWeakInput(Array.isArray(d.memory.weakTopics) ? d.memory.weakTopics.join(', ') : '');
          setTargetGoal(d.memory.targetGoal || '');
          setExperienceLevel(d.memory.experienceLevel || 'intermediate');
          setNotes(d.memory.notes || '');
        }
        if (d?.arenaStats) {
          setArenaStats(d.arenaStats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, user?.id]);

  if (!open) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || saving) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/spark/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredStack: stackInput.split(',').map((s) => s.trim()).filter(Boolean),
          weakTopics: weakInput.split(',').map((s) => s.trim()).filter(Boolean),
          targetGoal,
          experienceLevel,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || 'Could not save Builder Memory.');
        return;
      }
      setSavedToast(true);
      onSaved?.();
      setTimeout(() => {
        setSavedToast(false);
        onClose();
      }, 900);
    } catch {
      setErrorMsg('Network error saving Builder Memory.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9995] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-[#0D1018] border border-white/15 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-black text-white">Personal Builder Memory</h3>
              <p className="text-[11px] text-zinc-400">
                KΛ ΛI adapts code examples, DSA coaching &amp; stack automatically to you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!user?.id ? (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300 text-center space-y-2">
            <p>Sign in to save your tech stack, weak DSA topics, and sync live Battle Arena ELO with KΛ ΛI.</p>
          </div>
        ) : loading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading Builder Memory &amp; Arena Telemetry...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3.5">
            {arenaStats && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-200">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <span>Synced Battle Arena Stats</span>
                </span>
                <span className="font-mono font-bold text-white">
                  {arenaStats.elo} ELO ({arenaStats.tier}) · {arenaStats.wins}W / {arenaStats.losses}L
                </span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Preferred Tech Stack (comma-separated)</label>
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                placeholder="e.g. Next.js, TypeScript, Python, Java, PostgreSQL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Weak DSA / Engineering Topics</label>
              <input
                type="text"
                value={weakInput}
                onChange={(e) => setWeakInput(e.target.value)}
                placeholder="e.g. Dynamic Programming, Graphs, Segment Trees, SQL Joins"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Current Target / Goal</label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. SIH 2026 Winner / Amazon SDE-1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-300">Coding Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="beginner">Beginner (Step-by-step)</option>
                  <option value="intermediate">Intermediate (Concise + Intuition)</option>
                  <option value="advanced">Advanced (Production &amp; Optimal O(n))</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Extra Context Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Prefer C++ for DSA rounds, TypeScript for web projects"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : savedToast ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{savedToast ? 'Saved!' : saving ? 'Saving...' : 'Save Builder Memory'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
