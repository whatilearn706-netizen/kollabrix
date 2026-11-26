'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  Code2,
  ExternalLink,
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

const LEVEL_TABS: Array<{ id: CodexLevel; label: string; badge: string }> = [
  { id: 'beginner', label: 'Beginner', badge: 'Start Here' },
  { id: 'intermediate', label: 'Intermediate', badge: 'Core DSA' },
  { id: 'pro', label: 'Placement / Pro', badge: 'Interview' },
];

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

  const levelLessons = useMemo(
    () => track.lessons.filter((l) => l.level === selectedLevel),
    [track.lessons, selectedLevel]
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    () => track.lessons.find((l) => l.level === 'beginner')?.id || track.lessons[0]?.id || ''
  );

  const activeLesson = useMemo(() => {
    return (
      levelLessons.find((l) => l.id === selectedLessonId) ||
      levelLessons[0] ||
      track.lessons[0]
    );
  }, [levelLessons, selectedLessonId, track.lessons]);

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
      if (data.stdout) {
        setRunOutput(data.stdout.trim());
      } else if (data.stderr || data.compileOutput || data.error) {
        setRunOutput(data.stderr || data.compileOutput || data.error);
      } else {
        setRunOutput('Executed successfully (no stdout).');
      }
    } catch {
      setRunOutput('Unable to reach sandbox runner right now.');
    } finally {
      setRunning(false);
    }
  };

  const completedInTrack = track.lessons.filter((l) => completedLessons.includes(l.id)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl rounded-3xl bg-[#090C14] border border-white/12 shadow-[0_35px_120px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Modal Header + Level Pills */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-mono font-bold ${track.accentColor}`}>
              {track.badgeText}
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {track.title}
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                {completedInTrack} / {track.lessons.length} lessons completed
              </p>
            </div>
          </div>

          {/* Beginner | Intermediate | Placement/Pro Pill Bar */}
          <div className="inline-flex items-center p-1 rounded-full bg-black/50 border border-white/10">
            {LEVEL_TABS.map((tab) => {
              const active = selectedLevel === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleLevelChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#FAF8F5] text-[#07090E] shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
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
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-200'
                  : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close track modal"
              className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12">
          {/* Left Video + Lesson Syllabus Column */}
          <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-white/[0.08]">
            {activeLesson && (
              <>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
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
                    <p className="text-[11px] font-mono uppercase tracking-wider text-sky-300">
                      {activeLesson.instructor} · {activeLesson.duration}
                    </p>
                    <h3 className="text-xl font-bold text-white mt-0.5">{activeLesson.title}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleLessonComplete(activeLesson.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      completedLessons.includes(activeLesson.id)
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                        : 'bg-white/[0.04] border-white/12 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {completedLessons.includes(activeLesson.id) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span>
                      {completedLessons.includes(activeLesson.id) ? 'Completed' : 'Mark Complete'}
                    </span>
                  </button>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">{activeLesson.summary}</p>
              </>
            )}

            {/* Syllabus Selector for Selected Level */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                {selectedLevel} Modules
              </p>
              <div className="space-y-2">
                {levelLessons.map((lesson, idx) => {
                  const isCurrent = activeLesson?.id === lesson.id;
                  const done = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setRunOutput(null);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isCurrent
                          ? 'bg-white/[0.08] border-sky-400/40 text-white'
                          : 'bg-white/[0.02] border-white/[0.07] text-zinc-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-mono text-zinc-300 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{lesson.title}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {lesson.instructor} · {lesson.duration}
                          </p>
                        </div>
                      </div>
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Readable Notes + Runnable Sandbox Code Column */}
          <div className="lg:col-span-5 p-5 sm:p-6 space-y-5 bg-[#070A10]">
            {activeLesson && (
              <>
                <div className="space-y-2.5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                    Readable Study Notes
                  </p>
                  <ul className="space-y-2">
                    {activeLesson.keyTakeaways.map((point) => (
                      <li
                        key={point}
                        className="text-xs sm:text-sm text-zinc-200 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3.5 py-2.5 leading-relaxed flex gap-2.5"
                      >
                        <span className="text-sky-400 font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#05070C] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                      <Code2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>{activeLesson.codeSnippet.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunSnippet}
                      disabled={running}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-mono font-semibold cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3 fill-emerald-300" />
                      <span>{running ? 'Running...' : 'Run in Sandbox'}</span>
                    </button>
                  </div>

                  <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                    <code>{activeLesson.codeSnippet.code}</code>
                  </pre>

                  {runOutput && (
                    <div className="px-4 py-3 border-t border-white/[0.08] bg-black/60 font-mono text-xs text-emerald-300 whitespace-pre-wrap flex items-start gap-2">
                      <Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                      <span>{runOutput}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Launch Deep Step Workspace + Practice Shortcuts */}
            <div className="pt-2 space-y-2.5">
              {onLaunchFullWorkspace && track.curriculumKeys[selectedLevel] && (
                <button
                  type="button"
                  onClick={() => onLaunchFullWorkspace(selectedLevel)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] text-[#07090E] font-semibold text-sm hover:bg-sky-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Open Full Interactive Step Workspace</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/icpc"
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-200 flex items-center justify-center gap-1.5"
                >
                  <span>Practice IDE</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
                <Link
                  href="/arena"
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-200 flex items-center justify-center gap-1.5"
                >
                  <span>1v1 Arena</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
