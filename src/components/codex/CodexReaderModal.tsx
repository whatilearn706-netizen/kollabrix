'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Code2,
  ExternalLink,
  HelpCircle,
  Play,
  Sparkles,
  Swords,
  Terminal,
  X,
  Zap,
} from 'lucide-react';
import type { CodexBookVolume, CodexPatternVolume } from '@/data/codexCatalog';
import { KaMonographCover } from '@/components/brands/KaMonographCover';
import { KA_CODEX_BOOKS } from '@/data/kaCodexBooks';

interface CodexReaderModalProps {
  volume: CodexBookVolume | CodexPatternVolume;
  isSaved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}

export function CodexReaderModal({
  volume,
  isSaved,
  onToggleSave,
  onClose,
}: CodexReaderModalProps) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [patternLang, setPatternLang] = useState<'python' | 'cpp' | 'java'>('python');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [revealedFlashcard, setRevealedFlashcard] = useState<number | null>(null);

  const matchedBook =
    volume.kind === 'book'
      ? KA_CODEX_BOOKS.find(
          (b) =>
            b.id === volume.id ||
            b.title.toLowerCase() === volume.title.toLowerCase() ||
            b.isbn === (volume as CodexBookVolume).spotlightRole?.split('ISBN ')?.[1]?.trim()
        )
      : null;

  const runCode = async (
    language: 'python' | 'cpp' | 'java' | 'typescript',
    sourceCode: string
  ) => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch('/api/icpc/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, language, stdin: '' }),
      });
      const data = await res.json();
      setOutput(
        data.stdout?.trim() ||
          data.stderr ||
          data.compileOutput ||
          data.error ||
          'Executed cleanly.'
      );
    } catch {
      setOutput('Sandbox runner unavailable right now.');
    } finally {
      setRunning(false);
    }
  };

  if (volume.kind === 'book') {
    const chapter = volume.chapters[chapterIndex] || volume.chapters[0];
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="relative w-full max-w-5xl rounded-3xl bg-[#0B101B] border border-white/[0.16] shadow-[0_35px_120px_rgba(0,0,0,0.92)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
          <div className="px-5 sm:px-7 py-4 border-b border-white/[0.1] bg-[#0F1625] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/15 flex items-center justify-center">
                <BookOpen className={`w-5 h-5 ${volume.accentColor}`} />
              </div>
              <div>
                <p className="text-[11px] font-mono font-medium uppercase tracking-[0.18em] text-[#CBD5E1]">
                  {volume.edition} · {volume.pagesCount} Pages · KΛ Synthesis
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {volume.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleSave}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium cursor-pointer transition-colors ${
                  isSaved
                    ? 'bg-amber-400/20 border-amber-400/45 text-amber-200'
                    : 'bg-[#172033] border-white/20 text-[#E2E8F0] hover:text-white hover:border-white/35'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
                <span>{isSaved ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close reader"
                className="w-9 h-9 rounded-full bg-[#172033] border border-white/20 text-[#E2E8F0] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
            {/* Chapter Table of Contents & Matched Monograph Cover */}
            <aside className="md:col-span-4 border-b md:border-b-0 md:border-r border-white/[0.1] p-4 sm:p-5 space-y-3 bg-[#090D16]">
              {matchedBook && (
                <div className="flex flex-col items-center p-3.5 mb-2 bg-[#0E1524] rounded-2xl border border-white/[0.12] shadow-xl text-center">
                  <div className="transform hover:scale-105 transition-transform duration-300 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]">
                    <KaMonographCover book={matchedBook} size="sm" />
                  </div>
                  <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-sky-300 mt-2.5">
                    KΛ FOLIO · {matchedBook.category}
                  </p>
                  <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">
                    {matchedBook.shortTitle || matchedBook.title}
                  </p>
                </div>
              )}

              <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.18em] text-sky-300 px-1 mb-2">
                Volume Chapters ({volume.chapters.length})
              </p>
              <div className="space-y-2">
                {volume.chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChapterIndex(idx);
                      setOutput(null);
                      setRevealedFlashcard(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      chapterIndex === idx
                        ? 'bg-sky-500/15 border-sky-400/50 text-white shadow-sm'
                        : 'bg-[#101727] border-white/[0.09] text-[#DCE3EE] hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <p className={`text-[11px] font-mono font-medium uppercase ${chapterIndex === idx ? 'text-sky-300' : 'text-[#9FB0C8]'}`}>
                      Chapter {idx + 1} · {ch.readTime}
                    </p>
                    <p className="text-sm font-semibold mt-1 leading-snug">{ch.title}</p>
                  </button>
                ))}
              </div>
            </aside>

            {/* Editorial Chapter Content */}
            <article className="md:col-span-8 p-5 sm:p-8 space-y-6 bg-[#0C121F]">
              {chapter && (
                <>
                  <div>
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-300">
                      Chapter {chapterIndex + 1} of {volume.chapters.length} · {chapter.readTime}
                    </span>
                    <h3 className="text-2xl sm:text-[28px] font-bold tracking-tight text-white mt-1.5 leading-snug">
                      {chapter.title}
                    </h3>
                    <p className="text-[15px] sm:text-base font-medium text-[#EBF0F7] leading-[1.78] mt-3.5">
                      {chapter.overview}
                    </p>
                  </div>

                  {/* Field Rules & Takeaways */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-sky-300">
                      Field Rules &amp; Takeaways
                    </p>
                    <ul className="space-y-2.5">
                      {chapter.keyRules.map((rule) => (
                        <li
                          key={rule}
                          className="text-sm sm:text-[15px] font-medium text-[#F1F5F9] bg-[#121A2C] border border-white/[0.12] rounded-xl px-4 py-3.5 leading-[1.68] flex gap-3"
                        >
                          <span className="text-sky-300 font-bold shrink-0">→</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hackathon & Production Secret */}
                  {chapter.hackathonUse && (
                    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-[#16120C] to-[#0D1322] p-4 sm:p-5 space-y-2">
                      <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-semibold uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Hackathon &amp; Production Weapon</span>
                      </div>
                      <p className="text-sm font-medium text-[#FEF3C7] leading-relaxed">
                        {chapter.hackathonUse}
                      </p>
                    </div>
                  )}

                  {/* Placement & FAANG Interview Flashcards */}
                  {chapter.interviewFlashcards && chapter.interviewFlashcards.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-sky-300 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                          <span>Placement &amp; FAANG Interview Prep</span>
                        </p>
                        <span className="text-[11px] font-mono text-zinc-400">Tap to reveal answer</span>
                      </div>
                      <div className="space-y-2.5">
                        {chapter.interviewFlashcards.map((qa, qIdx) => {
                          const isOpen = revealedFlashcard === qIdx;
                          return (
                            <div
                              key={qa.q}
                              className="rounded-2xl border border-white/[0.12] bg-[#111827] overflow-hidden transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => setRevealedFlashcard(isOpen ? null : qIdx)}
                                className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.04]"
                              >
                                <span className="text-sm font-semibold text-white">
                                  {qIdx + 1}. {qa.q}
                                </span>
                                {isOpen ? (
                                  <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                                )}
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4 pt-1 text-sm font-medium text-[#CBD5E1] bg-[#0A0F1A] border-t border-white/[0.08] leading-relaxed">
                                  <span className="text-emerald-400 font-mono text-xs font-bold mr-2">IDEAL ANSWER:</span>
                                  {qa.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Interactive Code Implementation Sandbox */}
                  {chapter.code && (
                    <div className="rounded-2xl border border-white/10 bg-[#05070C] overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-white/[0.08] flex items-center justify-between bg-[#080D17]">
                        <span className="text-xs font-mono text-zinc-300 flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-sky-400" />
                          {chapter.code.title}
                        </span>
                        <button
                          type="button"
                          disabled={running}
                          onClick={() => runCode(chapter.code!.language, chapter.code!.snippet)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/35 text-emerald-300 text-[11px] font-mono font-semibold cursor-pointer transition-colors"
                        >
                          <Play className="w-3 h-3 fill-emerald-300" />
                          <span>{running ? 'Running...' : 'Run in Sandbox'}</span>
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed">
                        <code>{chapter.code.snippet}</code>
                      </pre>
                      {output && (
                        <div className="px-4 py-3 border-t border-white/[0.08] bg-black/75 font-mono text-xs text-emerald-300 flex items-start gap-2 whitespace-pre-wrap">
                          <Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <span>{output}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bridges to KΛ AI and Battle Arena */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/ka-ai?prompt=${encodeURIComponent(`Explain the core architectural rules from "${volume.title}" Chapter "${chapter.title}" and show how to implement them in a production Next.js/Postgres hackathon project.`)}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/40 text-violet-200 text-xs font-mono font-medium transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      <span>Ask KΛ AI About This Volume</span>
                    </Link>
                    <Link
                      href="/arena"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/35 border border-sky-500/40 text-sky-200 text-xs font-mono font-medium transition-colors"
                    >
                      <Swords className="w-3.5 h-3.5 text-sky-400" />
                      <span>Duel in 1v1 Battle Arena</span>
                    </Link>
                  </div>
                </>
              )}
            </article>
          </div>
        </div>
      </div>
    );
  }

  // Problem Solving Playbook Reader
  const codeForLang = volume.templates[patternLang];
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#090C14] border border-white/12 shadow-[0_35px_120px_rgba(0,0,0,0.92)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="px-5 sm:px-7 py-4 border-b border-white/[0.08] bg-[#0B0F19] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
              <Zap className={`w-5 h-5 ${volume.accentColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                {volume.edition} · Time {volume.timeComplexity} · Space {volume.spaceComplexity}
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-white">{volume.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono cursor-pointer ${
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
              aria-label="Close playbook"
              className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-sky-300">
                When To Spot This Pattern
              </p>
              <ul className="space-y-2">
                {volume.whenToSpot.map((clue) => (
                  <li
                    key={clue}
                    className="text-xs sm:text-sm text-zinc-200 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3.5 py-2.5 flex gap-2"
                  >
                    <span className="text-sky-400 font-bold">✓</span>
                    <span>{clue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Common OA Pitfalls</span>
              </p>
              <ul className="space-y-2">
                {volume.pitfalls.map((pitfall) => (
                  <li
                    key={pitfall}
                    className="text-xs text-amber-100/90 bg-amber-500/[0.07] border border-amber-400/20 rounded-xl px-3.5 py-2.5"
                  >
                    {pitfall}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                Drill Problems
              </p>
              <div className="space-y-2">
                {volume.practiceProblems.map((prob) => (
                  <div
                    key={prob.title}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{prob.title}</p>
                      <p className="text-[11px] text-zinc-400">{prob.hint}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-sky-300">
                      {prob.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#05070C] overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 bg-white/[0.02]">
                <div className="inline-flex items-center gap-1 p-0.5 rounded-full bg-black/60 border border-white/10">
                  {(['python', 'cpp', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setPatternLang(lang);
                        setOutput(null);
                      }}
                      className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase cursor-pointer ${
                        patternLang === lang
                          ? 'bg-[#FAF8F5] text-[#07090E] font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lang === 'cpp' ? 'C++' : lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={running}
                  onClick={() => runCode(patternLang, codeForLang)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 text-[11px] font-mono font-semibold cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  <span>{running ? 'Running...' : 'Test in Sandbox'}</span>
                </button>
              </div>

              <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed max-h-[340px]">
                <code>{codeForLang}</code>
              </pre>

              {output && (
                <div className="px-4 py-3 border-t border-white/[0.08] bg-black/60 font-mono text-xs text-emerald-300 flex items-start gap-2 whitespace-pre-wrap">
                  <Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{output}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/icpc"
                className="py-3 px-4 rounded-2xl bg-[#FAF8F5] text-[#07090E] font-semibold text-sm hover:bg-sky-100 flex items-center justify-center gap-2 transition-all"
              >
                <Code2 className="w-4 h-4" />
                <span>Solve in Practice IDE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/arena"
                className="py-3 px-4 rounded-2xl bg-white/[0.06] border border-white/15 hover:border-white/30 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Swords className="w-4 h-4 text-amber-300" />
                <span>Test in 1v1 Battle Arena</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
