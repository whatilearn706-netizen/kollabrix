'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sparkles,
  Plus,
  Save,
  RotateCw,
  Code2,
  Layers,
  Terminal,
  Check,
  Flame,
  Clock,
  Play,
  FileCode,
  Tag,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DEFAULT_ARENA_QUESTIONS, DuelQuestion, ArenaCategory } from '@/types/arenaDuel';
import { CinematicArenaTransition } from '@/components/arena/CinematicArenaTransition';
import { FullArenaExperience } from '@/components/arena/FullArenaExperience';

interface AdminArenaTabProps {
  authToken?: string;
}

export function AdminArenaTab({ authToken }: AdminArenaTabProps) {
  const [questions, setQuestions] = useState<DuelQuestion[]>(DEFAULT_ARENA_QUESTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArena, setSelectedArena] = useState<ArenaCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Live test transition states
  const [isTestTransitionActive, setIsTestTransitionActive] = useState(false);
  const [isTestLobbyOpen, setIsTestLobbyOpen] = useState(false);

  // New question form state
  const [newTitle, setNewTitle] = useState('');
  const [newArena, setNewArena] = useState<ArenaCategory>('web_dev');
  const [newTags, setNewTags] = useState<string>('html,css');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newTimeLimit, setNewTimeLimit] = useState(300);
  const [newDesc, setNewDesc] = useState('');
  const [newStarterHtml, setNewStarterHtml] = useState('<div class="hero-banner">\n  <!-- Build your component here -->\n</div>');
  const [newStarterCss, setNewStarterCss] = useState('.hero-banner {\n  /* Add styling here */\n}');
  const [newStarterJs, setNewStarterJs] = useState('// Event listener code\n');
  const [newTargetHtml, setNewTargetHtml] = useState('<div style="background:#0f172a;padding:20px;border-radius:12px;color:#fff;">Target Preview</div>');

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/arena/questions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      }
    } catch (err) {
      console.error('Failed to load arena questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setStatusMsg({ text: 'Please provide a title for the duel question.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    const questionPayload: DuelQuestion = {
      id: `q-${Date.now()}`,
      arena: newArena,
      title: newTitle.trim(),
      description: newDesc.trim(),
      tags: newTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      difficulty: newDifficulty,
      timeLimitSeconds: Number(newTimeLimit) || 300,
      targetPreviewTitle: newTitle.trim(),
      targetComponentHtml: newTargetHtml,
      starterHtml: newStarterHtml,
      starterCss: newStarterCss,
      starterJs: newStarterJs,
      testCases: [
        { input: 'render', expectedOutput: 'valid', description: 'Semantic structure rendered' },
        { input: 'styles', expectedOutput: 'match', description: 'Visual layout & colors match target' },
        { input: 'viewport', expectedOutput: 'responsive', description: 'Responsive behavior check' },
      ],
      validationCriteria: ['Clean semantic code', 'Zero overflow', 'Visual accuracy'],
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/arena/questions', {
        method: 'POST',
        headers,
        body: JSON.stringify(questionPayload),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: 'Question published to server live question bank!', type: 'success' });
        setQuestions((prev) => [questionPayload, ...prev]);
        setIsAddingNew(false);
        setNewTitle('');
        setNewDesc('');
      } else {
        setStatusMsg({ text: data.error || 'Failed to save question', type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Network error saving question', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedArena !== 'all' && q.arena !== selectedArena) return false;
    if (selectedTag !== 'all' && !q.tags.includes(selectedTag)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-charcoal-900 border border-rose-500/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              2v2 Multiplayer Battleground & Question Engine
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Real-time code duels ("Chess.com for Developers") with live fighting laptop in navbar, voxel shatter transition, and anti-cheat Fog of War.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Test Trigger */}
          <button
            type="button"
            onClick={() => setIsTestTransitionActive(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-mono text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Voxel Shatter & Arena</span>
          </button>

          <button
            type="button"
            onClick={fetchQuestions}
            disabled={isLoading}
            className="p-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh questions"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Filter and Add Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold mr-1">Arena:</span>
          {(['all', 'web_dev', 'algorithms', 'bug_hunt'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedArena(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedArena === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-charcoal-800 text-slate-300 hover:bg-charcoal-750'
              }`}
            >
              {cat === 'all' ? 'All Arenas' : cat === 'web_dev' ? 'Web Dev' : cat === 'algorithms' ? 'DSA' : 'Bug Hunt'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAddingNew ? 'Close Form' : 'Add New Duel Question'}</span>
        </button>
      </div>

      {/* New Question Form */}
      {isAddingNew && (
        <form onSubmit={handleSaveNewQuestion} className="p-5 rounded-2xl bg-charcoal-900 border border-rose-500/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-rose-400" />
              <span>Create New Arena Duel Question</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Published directly to server</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Question Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Modern Glassmorphism Pricing Card"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Arena Category</label>
              <select
                value={newArena}
                onChange={(e) => setNewArena(e.target.value as ArenaCategory)}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="web_dev">Web Development (HTML / CSS / JS)</option>
                <option value="algorithms">Algorithms & DSA (Java / Python / C++)</option>
                <option value="bug_hunt">React Bug Hunt (State / Performance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="html,css,javascript"
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="easy">Easy (100 PTS)</option>
                <option value="medium">Medium (250 PTS)</option>
                <option value="hard">Hard (500 PTS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time Limit (Seconds)</label>
              <input
                type="number"
                value={newTimeLimit}
                onChange={(e) => setNewTimeLimit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Challenge Description & Objective</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the target UI component or logic players must build..."
              className="w-full px-3 py-2 rounded-xl bg-charcoal-950 border border-charcoal-750 text-white text-xs focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Starter Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Starter HTML</label>
              <textarea
                rows={4}
                value={newStarterHtml}
                onChange={(e) => setNewStarterHtml(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-amber-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 font-mono">Starter CSS</label>
              <textarea
                rows={4}
                value={newStarterCss}
                onChange={(e) => setNewStarterCss(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-charcoal-750 text-cyan-200 text-xs font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-semibold hover:bg-charcoal-750 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Publishing...' : 'Save & Publish Question'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>Active Questions ({filteredQuestions.length})</span>
          <span>Automatic random matchmaking based on tags</span>
        </div>

        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">{q.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-charcoal-800 border border-charcoal-700 text-slate-300">
                  {q.arena}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    q.difficulty === 'easy'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : q.difficulty === 'medium'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {q.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(q.timeLimitSeconds / 60)}m
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">{q.description}</p>
              <div className="flex items-center gap-1.5 pt-1">
                {q.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-950 border border-charcoal-750 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-1 rounded-md">
                {q.testCases?.length || 3} Test Cases
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cinematic Transition & Full Arena for Admin Live Testing */}
      <CinematicArenaTransition
        isActive={isTestTransitionActive}
        onAnimationComplete={() => {
          setIsTestTransitionActive(false);
          setIsTestLobbyOpen(true);
        }}
      />

      {isTestLobbyOpen && (
        <FullArenaExperience
          onClose={() => setIsTestLobbyOpen(false)}
          currentUser={{
            displayName: 'Admin Tester',
            username: 'admin',
          }}
        />
      )}
    </div>
  );
}