'use client';

import React, { useMemo, useState } from 'react';
import {
  Bug,
  Code2,
  Globe,
  Layers,
  Play,
  Plus,
  RotateCw,
  Save,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { ArenaCategory, DuelQuestion } from '@/types/arenaDuel';
import { buildWebPreviewDoc } from '@/components/arena/arenaHelpers';

interface AdminQuestionStudioProps {
  questions: DuelQuestion[];
  isLoading: boolean;
  authHeaders: () => Promise<Record<string, string>>;
  onRefresh: () => Promise<void>;
  onTestQuestion: (q: DuelQuestion) => void;
  onStatus: (msg: { text: string; type: 'success' | 'error' }) => void;
}

type StudioMode = 'algorithms' | 'bug_hunt' | 'web_dev';

/**
 * Obsidian Titanium Question Studio matching the 4-stage KΛ ARENA architecture:
 * Supports 1v1 Quick Blitz (Py/C++/Java), 60s Bug Hunt (Web UI Bug or Code Bug), and Web Pixel Clash.
 */
export function AdminQuestionStudio({
  questions,
  isLoading,
  authHeaders,
  onRefresh,
  onTestQuestion,
  onStatus,
}: AdminQuestionStudioProps) {
  const [filterMode, setFilterMode] = useState<ArenaCategory | 'all'>('all');
  const [filterStack, setFilterStack] = useState<'all' | 'python' | 'cpp' | 'java' | 'web'>('all');
  const [filterDiff, setFilterDiff] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [filterDur, setFilterDur] = useState<'all' | '60' | '180' | '300' | '600'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 24;

  const [showComposer, setShowComposer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Composer form fields aligned to our redesigned Arena
  const [mode, setMode] = useState<StudioMode>('bug_hunt');
  const [bugKind, setBugKind] = useState<'web' | 'logic'>('web');
  const [codeLang, setCodeLang] = useState<'python' | 'cpp' | 'java'>('python');
  const [webStack, setWebStack] = useState<string[]>(['html', 'css']);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [duration, setDuration] = useState<number>(300);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Code fields
  const [starterCode, setStarterCode] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string; description: string; isHidden?: boolean }>>([
    { input: '', expectedOutput: '', description: 'Case 1', isHidden: false },
  ]);

  // Web / Web Bug fields
  const [starterHtml, setStarterHtml] = useState('<div class="card">\n  <h2>Fix Title</h2>\n  <button id="btn">Submit</button>\n</div>');
  const [starterCss, setStarterCss] = useState('.card { background: #1e293b; color: #fff; padding: 20px; border-radius: 12px; }\n#btn { background: #3b82f6; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; }');
  const [starterJs, setStarterJs] = useState('');
  const [targetHtml, setTargetHtml] = useState('<div class="card">\n  <h2>Target Title</h2>\n  <button id="btn">Submit</button>\n</div>');
  const [targetCss, setTargetCss] = useState('.card { background: #1e293b; color: #fff; padding: 20px; border-radius: 12px; }\n#btn { background: #3b82f6; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; }');
  const [targetJs, setTargetJs] = useState('');

  const isWebAuthoring = mode === 'web_dev' || (mode === 'bug_hunt' && bugKind === 'web');

  const previewStarterDoc = useMemo(() => buildWebPreviewDoc(starterHtml, starterCss, starterJs), [starterHtml, starterCss, starterJs]);
  const previewTargetDoc = useMemo(() => buildWebPreviewDoc(targetHtml, targetCss, targetJs), [targetHtml, targetCss, targetJs]);

  const filtered = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();
    return questions.filter((q) => {
      if (filterMode !== 'all' && q.arena !== filterMode) return false;
      if (filterDiff !== 'all' && (q.difficulty || 'medium').toLowerCase() !== filterDiff) return false;
      if (filterDur !== 'all' && String(q.timeLimitSeconds || 300) !== filterDur) return false;
      if (filterStack !== 'all') {
        const qTags = (q.tags || []).map((t) => t.toLowerCase());
        const isWebQ = q.arena === 'web_dev' || q.bugDomain === 'web' || Boolean(q.targetComponentHtml);
        if (filterStack === 'web') {
          if (!isWebQ) return false;
        } else if (filterStack === 'cpp') {
          if (!(qTags.includes('cpp') || qTags.includes('c++') || Boolean(q.starterCpp))) return false;
        } else if (filterStack === 'python') {
          if (!(qTags.includes('python') || Boolean(q.starterPython))) return false;
        } else if (filterStack === 'java') {
          if (!(qTags.includes('java') || Boolean(q.starterJava))) return false;
        }
      }
      if (qLower) {
        const hay = `${q.title} ${q.description} ${(q.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(qLower)) return false;
      }
      return true;
    });
  }, [questions, filterMode, filterStack, filterDiff, filterDur, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const toggleWebTag = (tag: string) => {
    if (tag === 'html') return;
    setWebStack((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onStatus({ text: 'Please enter a challenge title.', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const effectiveWebTags = webStack.includes('html') ? webStack : ['html', ...webStack];
      const payload: DuelQuestion = isWebAuthoring
        ? {
            id: `q-${Date.now()}`,
            arena: mode,
            bugDomain: mode === 'bug_hunt' ? 'web' : undefined,
            title: title.trim(),
            description: description.trim(),
            tags: mode === 'bug_hunt' ? ['bug_web', ...effectiveWebTags] : effectiveWebTags,
            difficulty,
            timeLimitSeconds: mode === 'bug_hunt' ? 60 : duration,
            targetPreviewTitle: title.trim(),
            targetComponentHtml: targetHtml,
            targetComponentCss: effectiveWebTags.includes('css') ? targetCss : '',
            targetComponentJs: effectiveWebTags.includes('javascript') ? targetJs : '',
            starterHtml,
            starterCss: effectiveWebTags.includes('css') ? starterCss : '',
            starterJs: effectiveWebTags.includes('javascript') ? starterJs : '',
            testCases: [
              { input: 'htmlWordsAndStructure', expectedOutput: 'true', description: 'HTML Structure & Word Alignment' },
              ...(effectiveWebTags.includes('css') ? [{ input: 'cssCoordinatesAndLayout', expectedOutput: 'true', description: 'CSS Spatial Coordinates & Layout' }] : []),
              ...(effectiveWebTags.includes('javascript') ? [{ input: 'jsInteractiveBehavior', expectedOutput: 'true', description: 'JavaScript DOM Behavior' }] : []),
            ],
          }
        : {
            id: `q-${Date.now()}`,
            arena: mode,
            bugDomain: mode === 'bug_hunt' ? 'logic' : undefined,
            title: title.trim(),
            description: description.trim(),
            tags: mode === 'bug_hunt' ? ['bug_logic', codeLang] : [codeLang],
            difficulty,
            timeLimitSeconds: mode === 'bug_hunt' ? 60 : duration,
            codeWithBug: mode === 'bug_hunt' ? starterCode : undefined,
            starterPython: codeLang === 'python' ? starterCode : '',
            starterCpp: codeLang === 'cpp' ? starterCode : '',
            starterJava: codeLang === 'java' ? starterCode : '',
            sampleInput: sampleInput || testCases[0]?.input || '',
            sampleOutput: sampleOutput || testCases[0]?.expectedOutput || '',
            testCases: testCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim()),
          };

      const headers = await authHeaders();
      const res = await fetch('/api/arena/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d?.error || 'Failed to save question');

      onStatus({ text: `Saved "${payload.title}" to KΛ ARENA.`, type: 'success' });
      setTitle('');
      setDescription('');
      setShowComposer(false);
      await onRefresh();
    } catch (err: any) {
      onStatus({ text: err.message || 'Unable to save question.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      const headers = await authHeaders();
      await fetch(`/api/arena/questions?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers });
      onStatus({ text: 'Removed question from KΛ ARENA.', type: 'success' });
      await onRefresh();
    } catch {}
  };

  const handleClearAll = async () => {
    if (!confirm('Remove ALL KΛ ARENA questions permanently?')) return;
    setIsClearing(true);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/arena/questions?all=true', { method: 'DELETE', headers });
      if (res.ok) {
        onStatus({ text: 'All KΛ ARENA questions cleared.', type: 'success' });
        await onRefresh();
      }
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Clean Filter & Actions Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0E17] border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Challenge Bank ({questions.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Questions created here feed directly into 1v1 Quick Blitz, 60s Bug Hunt, Web Pixel Clash, and Custom rooms.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <button
                type="button"
                disabled={isClearing}
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-950/80 border border-red-500/35 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearing ? 'Clearing...' : 'Clear All Questions'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowComposer((v) => !v)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer"
            >
              {showComposer ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showComposer ? 'Close Studio' : '+ Add Question'}</span>
            </button>
          </div>
        </div>

        {/* Aligned Filters + Search & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Mode</span>
            <div className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
              {([
                { id: 'all', label: 'All' },
                { id: 'algorithms', label: 'Blitz' },
                { id: 'bug_hunt', label: '60s Bug' },
                { id: 'web_dev', label: 'Web' },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setFilterMode(m.id); setPage(1); }}
                  className={`flex-1 py-1 px-1.5 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                    filterMode === m.id ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Stack</span>
            <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
              {(['all', 'python', 'cpp', 'java', 'web'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setFilterStack(st); setPage(1); }}
                  className={`flex-1 py-1 px-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                    filterStack === st ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All' : st === 'cpp' ? 'C++' : st === 'python' ? 'Py' : st === 'java' ? 'Java' : 'Web'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Difficulty</span>
            <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
              {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => { setFilterDiff(d); setPage(1); }}
                  className={`flex-1 py-1 px-1 rounded-lg font-mono text-[10px] font-bold capitalize cursor-pointer ${
                    filterDiff === d ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Duration</span>
            <div className="inline-flex gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10 w-full">
              {([
                { id: 'all', label: 'All' },
                { id: '60', label: '60s' },
                { id: '180', label: '3m' },
                { id: '300', label: '5m' },
                { id: '600', label: '10m' },
              ] as const).map((du) => (
                <button
                  key={du.id}
                  type="button"
                  onClick={() => { setFilterDur(du.id); setPage(1); }}
                  className={`flex-1 py-1 px-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                    filterDur === du.id ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {du.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Search ({filtered.length})</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search title or tag..."
              className="w-full px-3 py-1.5 rounded-xl bg-[#05080F] border border-white/10 font-mono text-[11px] text-white outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Redesigned + Add Question Studio */}
      {showComposer && (
        <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-[#0A0E17] border border-white/20 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <h4 className="font-mono text-sm font-black text-white uppercase tracking-wider">Create KΛ ARENA Challenge</h4>
            {mode === 'bug_hunt' && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 font-mono text-[10px] font-bold text-red-300">
                ⏱ Locked to 60s Bug Hunt Sprint
              </span>
            )}
          </div>

          {/* Mode + Domain + Difficulty + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Combat Mode</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                {([
                  { id: 'algorithms', label: 'Blitz', icon: Zap },
                  { id: 'bug_hunt', label: 'Bug Hunt', icon: Bug },
                  { id: 'web_dev', label: 'Web', icon: Globe },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                      mode === m.id ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'bug_hunt' && (
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Bug Type</label>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                  {(['web', 'logic'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setBugKind(k)}
                      className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold uppercase cursor-pointer ${
                        bugKind === k ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {k === 'web' ? 'Web UI' : 'Code Bug'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                {isWebAuthoring ? 'Web Stack' : 'Language'}
              </label>
              {isWebAuthoring ? (
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                  {(['html', 'css', 'javascript'] as const).map((t) => {
                    const active = t === 'html' || webStack.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleWebTag(t)}
                        className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold uppercase cursor-pointer ${
                          active ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t === 'javascript' ? 'JS' : t}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                  {(['python', 'cpp', 'java'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setCodeLang(l)}
                      className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                        codeLang === l ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {l === 'cpp' ? 'C++' : l === 'python' ? 'Py' : 'Java'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Difficulty</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold capitalize cursor-pointer ${
                      difficulty === d ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {mode !== 'bug_hunt' && (
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Duration</label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#05080F] border border-white/10">
                  {[
                    { s: 180, l: '3m' },
                    { s: 300, l: '5m' },
                    { s: 600, l: '10m' },
                  ].map((d) => (
                    <button
                      key={d.s}
                      type="button"
                      onClick={() => setDuration(d.s)}
                      className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold cursor-pointer ${
                        duration === d.s ? 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title & Brief */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === 'bug_hunt' ? 'e.g. Fix Broken Flex Navbar Spacing' : 'Challenge Title'}
              className="px-3.5 py-2.5 rounded-xl bg-[#05080F] border border-white/15 text-xs font-mono text-white outline-none focus:border-white/40"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={mode === 'bug_hunt' ? 'Symptom + exact bug to fix...' : 'Clear objective & requirements...'}
              className="px-3.5 py-2.5 rounded-xl bg-[#05080F] border border-white/15 text-xs font-mono text-white outline-none focus:border-white/40"
            />
          </div>

          {isWebAuthoring ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Starter (or Buggy) Web Code */}
              <div className="p-3.5 rounded-2xl bg-[#05080F] border border-white/10 space-y-2.5">
                <div className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                  {mode === 'bug_hunt' ? 'Broken Starter Code (What User Sees)' : 'Starter Template'}
                </div>
                <textarea
                  rows={4}
                  value={starterHtml}
                  onChange={(e) => setStarterHtml(e.target.value)}
                  placeholder="Starter HTML"
                  className="w-full p-2.5 rounded-lg bg-[#0A0E17] border border-white/10 font-mono text-[11px] text-slate-100 outline-none"
                />
                {webStack.includes('css') && (
                  <textarea
                    rows={3}
                    value={starterCss}
                    onChange={(e) => setStarterCss(e.target.value)}
                    placeholder="Starter CSS"
                    className="w-full p-2.5 rounded-lg bg-[#0A0E17] border border-white/10 font-mono text-[11px] text-slate-100 outline-none"
                  />
                )}
                {webStack.includes('javascript') && (
                  <textarea
                    rows={3}
                    value={starterJs}
                    onChange={(e) => setStarterJs(e.target.value)}
                    placeholder="Starter JS"
                    className="w-full p-2.5 rounded-lg bg-[#0A0E17] border border-white/10 font-mono text-[11px] text-slate-100 outline-none"
                  />
                )}
                <iframe title="Starter Preview" srcDoc={previewStarterDoc} className="w-full h-32 rounded-xl border border-white/10" sandbox="allow-scripts" />
              </div>

              {/* Target Fixed Blueprint + Live Preview */}
              <div className="p-3.5 rounded-2xl bg-[#05080F] border border-emerald-500/25 space-y-2.5">
                <div className="text-[11px] font-mono font-bold text-emerald-300 uppercase">
                  Target Fixed Blueprint (Match Goal)
                </div>
                <textarea
                  rows={4}
                  value={targetHtml}
                  onChange={(e) => setTargetHtml(e.target.value)}
                  placeholder="Target HTML"
                  className="w-full p-2.5 rounded-lg bg-[#0A0E17] border border-white/10 font-mono text-[11px] text-slate-100 outline-none"
                />
                {webStack.includes('css') && (
                  <textarea
                    rows={3}
                    value={targetCss}
                    onChange={(e) => setTargetCss(e.target.value)}
                    placeholder="Target CSS"
                    className="w-full p-2.5 rounded-lg bg-[#0A0E17] border border-white/10 font-mono text-[11px] text-slate-100 outline-none"
                  />
                )}
                {webStack.includes('javascript') && (
                  <textarea
                    rows={3}
                    value={targetJs}
                    onChange={(e) => setTargetJs(e.target.value)}
                    placeholder="Target JS"
                    className="w-full p-2.5 rounded-lg bg-[#0A0E17] border border-white/10 font-mono text-[11px] text-slate-100 outline-none"
                  />
                )}
                <iframe title="Target Preview" srcDoc={previewTargetDoc} className="w-full h-32 rounded-xl border border-emerald-500/30" sandbox="allow-scripts" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={6}
                value={starterCode}
                onChange={(e) => setStarterCode(e.target.value)}
                placeholder={mode === 'bug_hunt' ? 'Paste working code WITH clear # BUG / // BUG lines for the player to fix...' : 'Starter boilerplate for player...'}
                className="w-full p-3 rounded-xl bg-[#05080F] border border-white/15 font-mono text-xs text-slate-100 outline-none"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={sampleInput}
                  onChange={(e) => setSampleInput(e.target.value)}
                  placeholder="Sample Stdin (e.g. 5)"
                  className="px-3 py-2 rounded-xl bg-[#05080F] border border-white/15 font-mono text-xs text-white outline-none"
                />
                <input
                  type="text"
                  value={sampleOutput}
                  onChange={(e) => setSampleOutput(e.target.value)}
                  placeholder="Expected Stdout (e.g. 120)"
                  className="px-3 py-2 rounded-xl bg-[#05080F] border border-white/15 font-mono text-xs text-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span>Compiler Test Cases</span>
                  <button
                    type="button"
                    onClick={() => setTestCases((p) => [...p, { input: '', expectedOutput: '', description: `Case ${p.length + 1}` }])}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/15 text-[11px] cursor-pointer"
                  >
                    + Add Case
                  </button>
                </div>
                {testCases.map((tc, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      value={tc.input}
                      onChange={(e) => setTestCases((p) => p.map((x, i) => (i === idx ? { ...x, input: e.target.value } : x)))}
                      placeholder="Stdin"
                      className="sm:col-span-5 px-3 py-1.5 rounded-lg bg-[#05080F] border border-white/10 font-mono text-xs text-white"
                    />
                    <input
                      type="text"
                      value={tc.expectedOutput}
                      onChange={(e) => setTestCases((p) => p.map((x, i) => (i === idx ? { ...x, expectedOutput: e.target.value } : x)))}
                      placeholder="Expected Output"
                      className="sm:col-span-5 px-3 py-1.5 rounded-lg bg-[#05080F] border border-white/10 font-mono text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setTestCases((p) => p.filter((_, i) => i !== idx))}
                      className="sm:col-span-2 py-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 font-mono text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-100 via-white to-slate-200 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Challenge to KΛ ARENA'}</span>
          </button>
        </form>
      )}

      {/* Saved Questions List or Clean Empty State */}
      {isLoading ? (
        <div className="p-10 rounded-2xl bg-[#0A0E17] border border-white/10 text-center font-mono text-xs text-slate-400">
          Loading KΛ ARENA questions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#0A0E17] border border-white/10 text-center space-y-3">
          <Layers className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="font-sans font-bold text-white text-sm">
            {questions.length === 0 ? 'KΛ ARENA Question Bank Is Empty' : 'No Questions Match Current Filter'}
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong className="text-white">+ Add Question</strong> above to add fresh challenges for 1v1 Quick Blitz, 60s Bug Hunt, Web Pixel Clash, or Custom rooms.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginated.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-[#0A0E17] border border-white/10 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/15 font-mono text-[10px] font-bold text-slate-200 uppercase">
                      {q.arena === 'bug_hunt' ? '60s Bug Hunt' : q.arena === 'web_dev' ? 'Web Clash' : 'Quick Blitz'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">
                      {q.difficulty} &bull; {`${Math.round((q.timeLimitSeconds || 300) / 60)}m`}
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-white line-clamp-1">{q.title}</h5>
                  <p className="text-xs text-slate-400 line-clamp-2">{q.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div className="flex flex-wrap gap-1">
                    {(q.tags || []).slice(0, 4).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#05080F] border border-white/10 font-mono text-[10px] text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onTestQuestion(q)}
                      className="px-2.5 py-1 rounded-lg bg-white text-slate-950 font-mono text-[10px] font-black inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Test</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOne(q.id)}
                      title="Delete question"
                      className="p-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0A0E17] border border-white/10 font-mono text-xs text-slate-300">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/15 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>
              <span>
                Page {safePage} of {totalPages} ({filtered.length} matching)
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/15 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
