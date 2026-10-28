'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Check,
  Ban,
  Sparkles,
  Tag,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  checkRestrictedWords,
  DEFAULT_RESTRICTED_WORDS,
  DEFAULT_RESTRICTED_CATEGORIES,
} from '@/lib/moderation/restrictedWords';

interface AdminRestrictedWordsTabProps {
  authToken?: string;
}

export function AdminRestrictedWordsTab({ authToken }: AdminRestrictedWordsTabProps) {
  const [restrictedWords, setRestrictedWords] = useState<string[]>(DEFAULT_RESTRICTED_WORDS);
  const [customWords, setCustomWords] = useState<string[]>([]);
  const [isModerationEnabled, setIsModerationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  const [wordSearch, setWordSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [testInput, setTestInput] = useState('This project is a scam and an exam leak');
  const [isSavingWord, setIsSavingWord] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Restricted Words from API
  const loadWords = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', { headers });
      const data = await res.json();
      if (res.ok && data) {
        if (Array.isArray(data.words)) setRestrictedWords(data.words);
        if (Array.isArray(data.customWords)) setCustomWords(data.customWords);
        if (typeof data.enabled === 'boolean') setIsModerationEnabled(data.enabled);
      }
    } catch (err) {
      console.warn('Error loading restricted words:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, [authToken]);

  // Add Word Handler
  const handleAddWord = async () => {
    if (!newWordInput.trim()) return;
    setIsSavingWord(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'add', word: newWordInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestrictedWords(data.words);
        setCustomWords(data.customWords || []);
        setNewWordInput('');
        setActionNotice({ type: 'success', message: data.message });
        try {
          localStorage.setItem('linkora_restricted_words_v1', JSON.stringify(data.words));
          window.dispatchEvent(new CustomEvent('linkora-restricted-words-updated', { detail: data.words }));
        } catch (e) {}
      } else {
        throw new Error(data.error || 'Failed to add word');
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error adding word' });
    } finally {
      setIsSavingWord(false);
    }
  };

  // Remove Word Handler
  const handleRemoveWord = async (wordToRemove: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'remove', word: wordToRemove }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestrictedWords(data.words);
        setCustomWords(data.customWords || []);
        setActionNotice({ type: 'success', message: data.message });
        try {
          localStorage.setItem('linkora_restricted_words_v1', JSON.stringify(data.words));
          window.dispatchEvent(new CustomEvent('linkora-restricted-words-updated', { detail: data.words }));
        } catch (e) {}
      } else {
        throw new Error(data.error || 'Failed to remove word');
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error removing word' });
    }
  };

  // Toggle Moderation Handler
  const handleToggleModeration = async () => {
    const nextState = !isModerationEnabled;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'toggle', enabled: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsModerationEnabled(data.enabled);
        setActionNotice({ type: 'success', message: data.message });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error toggling moderation' });
    }
  };

  // Reset to Defaults Handler
  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset all restricted words to platform defaults?')) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/admin/restricted-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRestrictedWords(data.words);
        setCustomWords([]);
        setIsModerationEnabled(true);
        setActionNotice({ type: 'success', message: data.message });
        try {
          localStorage.setItem('linkora_restricted_words_v1', JSON.stringify(data.words));
          window.dispatchEvent(new CustomEvent('linkora-restricted-words-updated', { detail: data.words }));
        } catch (e) {}
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', message: err.message || 'Error resetting words' });
    }
  };

  // Filter words by category and search
  const filteredWords = useMemo(() => {
    let list = restrictedWords;
    if (selectedCategory === 'custom') {
      list = customWords;
    } else if (selectedCategory !== 'all' && DEFAULT_RESTRICTED_CATEGORIES[selectedCategory]) {
      const catWords = new Set(DEFAULT_RESTRICTED_CATEGORIES[selectedCategory].words.map((w) => w.toLowerCase()));
      list = list.filter((w) => catWords.has(w.toLowerCase()));
    }

    if (wordSearch.trim()) {
      const q = wordSearch.toLowerCase().trim();
      list = list.filter((w) => w.toLowerCase().includes(q));
    }
    return list;
  }, [restrictedWords, customWords, selectedCategory, wordSearch]);

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs border ${
            actionNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white font-medium text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Status & Header Control */}
      <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isModerationEnabled
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 ring-4 ring-red-500/10'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-white">Restricted Mode & Prohibited Words</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isModerationEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isModerationEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isModerationEnabled ? 'Restricted Mode: ACTIVE' : 'Restricted Mode: PAUSED'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Universal platform-wide content safety. Automatically prevents students and users from writing profanity, scam keywords, slurs, and academic leaks anywhere on the website.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <Button
              variant={isModerationEnabled ? 'outline' : 'primary'}
              size="sm"
              onClick={handleToggleModeration}
              leftIcon={
                isModerationEnabled ? (
                  <Ban className="w-4 h-4 text-amber-400" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-400" />
                )
              }
            >
              {isModerationEnabled ? 'Pause Restricted Mode' : 'Activate Restricted Mode'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset Defaults
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadWords}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-charcoal-800">
          <div className="p-3.5 rounded-xl bg-charcoal-950/60 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Total Prohibited Words</span>
            <span className="text-xl font-black text-white font-mono">{restrictedWords.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-charcoal-950/60 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Custom Added Terms</span>
            <span className="text-xl font-black text-purple-400 font-mono">{customWords.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-charcoal-950/60 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Platform Coverage</span>
            <span className="text-xl font-black text-emerald-400 font-mono">100% Inputs</span>
          </div>
          <div className="p-3.5 rounded-xl bg-charcoal-950/60 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Enforcement Action</span>
            <span className="text-xl font-black text-red-400 font-mono">Auto-Block</span>
          </div>
        </div>
      </div>

      {/* Add New Prohibited Words */}
      <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Add New Prohibited Term or Phrase</h3>
        </div>
        <p className="text-xs text-slate-400">
          Enter a prohibited term or multiple comma-separated terms (e.g.{' '}
          <code className="text-slate-300">fake certificate, exam proxy, hackathon bot</code>). Terms are automatically
          matched with safe word boundaries and leetspeak normalization across every input and form on the platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Input
            placeholder="e.g. scammer, fake college, buy project, hackathon cheat"
            value={newWordInput}
            onChange={(e) => setNewWordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddWord();
              }
            }}
            className="flex-1 text-xs"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddWord}
            isLoading={isSavingWord}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Prohibited Term
          </Button>
        </div>
      </div>

      {/* Interactive Live Testing Playground */}
      <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">Test Restricted Mode in Real-Time</h3>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            Live Interactive Simulator
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Type or paste any text into this box. You will see how Kollabrix instantaneously detects prohibited terms, warns the user, and sanitizes the output.
        </p>
        <Input
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Type anything here to test the live filter..."
          className="text-xs"
        />

        {(() => {
          const testRes = checkRestrictedWords(testInput, restrictedWords);
          return (
            <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Detection Result:</span>
                {testRes.hasRestricted ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Restricted Word Detected ({testRes.matchedWords.length})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clean Academic Content Allowed</span>
                  </span>
                )}
              </div>

              {testRes.hasRestricted && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Blocked words:</span>
                  {testRes.matchedWords.map((w) => (
                    <span
                      key={w}
                      className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-red-900/60 border border-red-600/50 text-red-200"
                    >
                      &quot;{w}&quot;
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-1 text-xs">
                <span className="text-slate-400 block mb-1">Sanitized Clean Output (What is saved):</span>
                <span className="text-emerald-300 font-mono font-medium bg-charcoal-900 px-3 py-1.5 rounded-lg border border-charcoal-800 block">
                  &quot;{testRes.cleanText}&quot;
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Prohibited Words Directory */}
      <div className="p-6 rounded-2xl border border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white">Active Prohibited Words Directory</h3>
            <span className="text-xs text-slate-500 font-mono">({filteredWords.length} terms shown)</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search terms..."
              value={wordSearch}
              onChange={(e) => setWordSearch(e.target.value)}
              className="pl-8 text-xs py-1.5"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-charcoal-800/60 text-slate-400 hover:text-white'
            }`}
          >
            All Categories ({restrictedWords.length})
          </button>
          <button
            onClick={() => setSelectedCategory('custom')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'custom'
                ? 'bg-purple-600 text-white'
                : 'bg-charcoal-800/60 text-slate-400 hover:text-white'
            }`}
          >
            Custom Added ({customWords.length})
          </button>
          {Object.entries(DEFAULT_RESTRICTED_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === key
                  ? 'bg-brand-600 text-white'
                  : 'bg-charcoal-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name} ({cat.words.length})
            </button>
          ))}
        </div>

        {/* Word Chips */}
        <div className="flex flex-wrap gap-2 max-h-[380px] overflow-y-auto p-3 rounded-xl bg-charcoal-950/40 border border-charcoal-800/80">
          {filteredWords.length === 0 ? (
            <div className="w-full py-8 text-center text-slate-500 text-xs">
              No restricted terms found matching your query.
            </div>
          ) : (
            filteredWords.map((w) => {
              const isCustom = customWords.includes(w);
              return (
                <span
                  key={w}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    isCustom
                      ? 'bg-purple-900/40 border border-purple-500/50 text-purple-200'
                      : 'bg-charcoal-800/70 border border-charcoal-700 text-slate-300'
                  }`}
                >
                  <span>{w}</span>
                  {isCustom && (
                    <span className="text-[9px] font-bold text-purple-300 bg-purple-950/80 px-1 rounded uppercase">
                      custom
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveWord(w)}
                    title={`Remove "${w}" from restricted words`}
                    className="text-slate-400 hover:text-red-400 p-0.5 rounded transition-colors ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Information & Integrity Guarantee Card */}
      <div className="p-4 rounded-xl border border-charcoal-800 bg-charcoal-900/40 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">How Kollabrix Restricted Mode Works:</p>
          <p>
            When a student or applicant writes or pastes text anywhere on Kollabrix (project title, description, team pitch, comments, profile bio, search), the platform interceptor evaluates each word. If a prohibited term is found, Kollabrix immediately strips the word, triggers an on-screen warning, and blocks form submission.
          </p>
          <p className="text-slate-500">
            Safe word-boundary matching ensures words like &quot;assignment&quot;, &quot;passport&quot;, &quot;classic&quot;, and &quot;developer&quot; are never accidentally blocked.
          </p>
        </div>
      </div>
    </div>
  );
}
