'use client';

import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Circle,
  Code2,
  Layers,
  Play,
  Terminal,
  X,
} from 'lucide-react';
import type { CodexLanguageTrack, CodexLevel } from '@/data/codexCatalog';

interface CodexTrackModalProps {
  track: CodexLanguageTrack;
  completedLessons: string[];
  onToggleLessonComplete: (lessonId: string) => void;
  isSaved: boolean;
  onToggleSave: () => void;
  onLaunchFullWorkspace?: (level: CodexLevel) => void;
  onClose: () => void;
}

const LEVEL_TABS: Array<{ id: CodexLevel; label: string }> = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'pro', label: 'Placement / Pro' },
];

/**
 * Clean tabbed fallback modal when a track is viewed outside a curriculum workspace.
 */
export function CodexTrackModal({
  track,
  completedLessons,
  onToggleLessonComplete,
  isSaved,
  onToggleSave,
  onLaunchFullWorkspace,
  onClose,
}: CodexTrackModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<CodexLevel>('beginner');
  const [focusTab, setFocusTab] = useState<'video' | 'notes' | 'code'>('video');

  const levelLessons = useMemo(
    () => track.lessons.filter((l) => l.level === selectedLevel),
    [track.lessons, selectedLevel]
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    () => track.lessons.find((l) => l.level === 'beginner')?.id || track.lessons[0]?.id || ''
  );

  const activeLesson = useMemo(
    () =>
      levelLessons.find((l) => l.id === selectedLessonId) ||
      levelLessons[0] ||
      track.lessons[0],
    [levelLessons, selectedLessonId, track.lessons]
  );

  const [running, setRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);

  const handleLevelChange = (level: CodexLevel) => {
    setSelectedLevel(level);
    const first = track.lessons.find((l) => l.level === level);
    if (first) setSelectedLessonId(first.id);
    setRunOutput(null);
  };

  const handleRunSnippet = async () => {
    if (!activeLesson) return;
    if (activeLesson.codeSnippet.language === 'typescript') {
      setRunOutput('TypeScript / Next.js snippets run inside Practice IDE or KΛ ΛI Workspace.');
      return;
    }
    setRunning(true);
    setRunOutput(null);
    try {
      const res = await fetch('/api/icpc/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: activeLesson.codeSnippet.code,
          language: activeLesson.codeSnippet.language,
          stdin: '',
        }),
      });
      const data = await res.json();
      setRunOutput(
        data.stdout?.trim() ||
          data.stderr ||
          data.compileOutput ||
          data.error ||
          'Executed successfully (no stdout).'
      );
    } catch {
      setRunOutput('Unable to reach sandbox runner right now.');
    } finally {
      setRunning(false);
    }
  };

  const completedInTrack = track.lessons.filter((l) => completedLessons.includes(l.id)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#080B12] border border-white/10 shadow-[0_35px_120px_rgba(0,0,0,0.92)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Clean Minimal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-[#0B0F18]">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sky-300">
              {track.badgeText} · {completedInTrack}/{track.lessons.length} done
            </p>
            <h2 className="text-lg sm:text-xl font-serif font-semibold text-white">
              {track.title}
            </h2>
          </div>

          <div className="inline-flex items-center p-0.5 rounded-full bg-black/40 border border-white/10">
            {LEVEL_TABS.map((tab) => {
              const active = selectedLevel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleLevelChange(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    active ? 'bg-[#FAF8F5] text-[#07090E] font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono cursor-pointer transition-all ${
                isSaved
                  ? 'bg-sky-400/15 border-sky-400/35 text-sky-200'
                  : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-sky-300 text-sky-300' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close track modal"
              className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Focused Single-Pane Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Focus Mode Tabs + Module Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[#0C101A] border border-white/[0.08]">
              {[
                { id: 'video' as const, label: '01 · Watch', icon: <Play className="w-3.5 h-3.5" /> },
                { id: 'notes' as const, label: '02 · Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: 'code' as const, label: '03 · Sandbox', icon: <Code2 className="w-3.5 h-3.5" /> },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFocusTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all ${
                    focusTab === t.id
                      ? 'bg-[#FAF8F5] text-[#07090E] font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {onLaunchFullWorkspace && track.curriculumKeys[selectedLevel] && (
              <button
                type="button"
                onClick={() => onLaunchFullWorkspace(selectedLevel)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/15 hover:bg-white/[0.12] text-xs font-mono text-white cursor-pointer transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-sky-300" />
                <span>Step Workspace</span>
              </button>
            )}
          </div>

          {activeLesson && focusTab === 'video' && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeLesson.youtubeId}?rel=0&modestbranding=1`}
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-mono text-sky-300">
                    {activeLesson.instructor} · {activeLesson.duration}
                  </p>
                  <h3 className="text-lg font-serif font-semibold text-white">{activeLesson.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{activeLesson.summary}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleLessonComplete(activeLesson.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono border cursor-pointer ${
                    completedLessons.includes(activeLesson.id)
                      ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300'
                      : 'bg-white/[0.04] border-white/12 text-zinc-300'
                  }`}
                >
                  {completedLessons.includes(activeLesson.id) ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  <span>{completedLessons.includes(activeLesson.id) ? 'Done' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          )}

          {activeLesson && focusTab === 'notes' && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0B0F18] divide-y divide-white/[0.06]">
              {activeLesson.keyTakeaways.map((point, idx) => (
                <div key={point} className="p-4 flex items-start gap-3 text-sm text-zinc-200 leading-relaxed">
                  <span className="text-xs font-mono text-sky-300 shrink-0 pt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{point}</span>
                </div>
              ))}
            </div>
          )}

          {activeLesson && focusTab === 'code' && (
            <div className="rounded-2xl border border-white/10 bg-[#05070C] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0F18]">
                <span className="text-xs font-mono text-zinc-300">{activeLesson.codeSnippet.label}</span>
                <button
                  type="button"
                  onClick={handleRunSnippet}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] text-[#07090E] text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{running ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                <code>{activeLesson.codeSnippet.code}</code>
              </pre>
              {runOutput && (
                <div className="px-4 py-3 border-t border-white/[0.08] bg-black/60 font-mono text-xs text-emerald-300 whitespace-pre-wrap flex items-start gap-2">
                  <Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                  <span>{runOutput}</span>
                </div>
              )}
            </div>
          )}

          {/* Clean Module Pills */}
          {levelLessons.length > 1 && (
            <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-2">
              {levelLessons.map((lesson, idx) => {
                const isCurrent = activeLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setRunOutput(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono border cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
                    }`}
                  >
                    0{idx + 1} · {lesson.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
