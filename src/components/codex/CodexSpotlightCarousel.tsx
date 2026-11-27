'use client';

import React, { useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Code2,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  CodexBookVolume,
  CodexLanguageTrack,
  CodexPatternVolume,
} from '@/data/codexCatalog';
import { KA_CODEX_BOOKS } from '@/data/kaCodexBooks';
import { KaMonographCover } from '@/components/brands/KaMonographCover';

export type CodexVolume = CodexLanguageTrack | CodexBookVolume | CodexPatternVolume;

interface CodexSpotlightCarouselProps {
  sectionLabel: string;
  headline: string;
  headlineAccent: string;
  volumes: CodexVolume[];
  activeIndex: number;
  onChangeIndex: (nextIndex: number) => void;
  onOpenVolume: (volume: CodexVolume) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  continueNote?: string | null;
  onResumeContinue?: () => void;
  topicFilterBar?: React.ReactNode;
}

function getVolumeMetaPill(v: CodexVolume): string {
  if (v.kind === 'track') return v.lessonsCount;
  if (v.kind === 'book') return `${v.pagesCount} Pages · ${v.chapters.length} Chapters`;
  return `${v.timeComplexity} · ${v.sheetTag}`;
}

function getVolumeMonogram(v: CodexVolume): string {
  if (v.kind === 'track') {
    if (v.name === 'Java') return 'J21';
    if (v.name === 'C++') return 'C++';
    if (v.name === 'Python') return 'PY';
    if (v.name.includes('TypeScript')) return 'TS';
    return 'DSA';
  }
  if (v.kind === 'book') return v.languageTag.slice(0, 4).toUpperCase();
  return 'OA';
}

export function CodexSpotlightCarousel({
  sectionLabel,
  headline,
  headlineAccent,
  volumes,
  activeIndex,
  onChangeIndex,
  onOpenVolume,
  savedIds,
  onToggleSave,
  continueNote,
  onResumeContinue,
  topicFilterBar,
}: CodexSpotlightCarouselProps) {
  const safeIndex = volumes.length > 0 ? Math.min(activeIndex, volumes.length - 1) : 0;
  const active = volumes[safeIndex];

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (volumes.length <= 1) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        onChangeIndex((safeIndex + 1) % volumes.length);
      } else if (e.key === 'ArrowLeft') {
        onChangeIndex((safeIndex - 1 + volumes.length) % volumes.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [safeIndex, volumes.length, onChangeIndex]);

  if (!active) return null;

  const isSaved = savedIds.includes(active.id);

  // Build visible window of covers centered around safeIndex (-2, -1, 0, +1, +2)
  const offsets = volumes.length >= 5 ? [-2, -1, 0, 1, 2] : volumes.length >= 3 ? [-1, 0, 1] : volumes.map((_, i) => i - safeIndex);

  const handlePrev = () => onChangeIndex((safeIndex - 1 + volumes.length) % volumes.length);
  const handleNext = () => onChangeIndex((safeIndex + 1) % volumes.length);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-[calc(100vh-88px)] px-5 sm:px-10 lg:px-14 pt-4 pb-6 relative z-10 select-none">
      {/* Top Split Editorial Header Row (Matches Reference Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start pt-2">
        {/* Top-Left Editorial Headline & Primary CTA */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>{sectionLabel}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl xl:text-[54px] font-serif tracking-tight leading-[1.05] text-white">
            {headline}
            <br />
            <span className="italic font-normal text-zinc-400">{headlineAccent}</span>
          </h1>

          {topicFilterBar}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenVolume(active)}
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#FAF8F5] text-[#07090E] font-semibold text-sm shadow-[0_12px_40px_rgba(255,255,255,0.16)] hover:bg-sky-100 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
            >
              {active.kind === 'track' ? (
                <Play className="w-3.5 h-3.5 fill-slate-950" />
              ) : active.kind === 'book' ? (
                <BookOpen className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{active.ctaLabel}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(active.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-full border text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                isSaved
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-200'
                  : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Bookmark to Saved'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {continueNote && onResumeContinue && (
              <button
                type="button"
                onClick={onResumeContinue}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-200 hover:bg-sky-500/20 text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span className="truncate max-w-[210px]">{continueNote}</span>
              </button>
            )}
          </div>
        </div>

        {/* Top-Right Active Volume Spotlight Bio */}
        <div className="lg:col-span-6 lg:pl-10 xl:pl-16 flex flex-col justify-start space-y-3 border-l border-white/[0.07] lg:border-l pl-4 lg:pt-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
                {active.edition}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {active.spotlightAuthor}
              </h2>
              <p className={`text-xs font-mono mt-0.5 ${active.accentColor}`}>{active.spotlightRole}</p>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-zinc-300 whitespace-nowrap">
              {getVolumeMetaPill(active)}
            </span>
          </div>

          <p className="text-sm sm:text-[15px] font-medium text-[#E2E8F0] leading-[1.7] max-w-xl">
            {active.spotlightBio}
          </p>
        </div>
      </div>

      {/* Center 3D Tactile Volume Showcase Carousel */}
      <div className="relative my-6 sm:my-8 flex items-center justify-center min-h-[340px] sm:min-h-[400px]">
        {/* Ambient Studio Spotlight Behind Active Volume */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[440px] h-[300px] sm:h-[380px] rounded-full bg-sky-500/[0.09] blur-[95px] pointer-events-none"
        />

        <div className="flex items-end justify-center gap-4 sm:gap-7 lg:gap-9 w-full overflow-hidden py-4 px-2">
          {offsets.map((offset) => {
            const idx = (safeIndex + offset + volumes.length) % volumes.length;
            const item = volumes[idx];
            const isCenter = offset === 0;
            const isNear = Math.abs(offset) === 1;

            // Hide outer (-2 / +2) items on smaller screens for clean breathing room
            const visibilityClass =
              Math.abs(offset) >= 2
                ? 'hidden xl:flex'
                : isNear
                  ? 'hidden sm:flex'
                  : 'flex';

            const matchedMonograph =
              item.kind === 'book'
                ? KA_CODEX_BOOKS.find((b) => b.id === item.id)
                : undefined;

            const scaleClass = matchedMonograph
              ? isCenter
                ? 'w-[225px] sm:w-[260px] aspect-[2/3] z-20 -translate-y-2 shadow-[0_35px_75px_-15px_rgba(0,0,0,0.92)]'
                : isNear
                  ? 'w-[165px] sm:w-[190px] aspect-[2/3] z-10 opacity-80 hover:opacity-100 hover:-translate-y-1 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.85)]'
                  : 'w-[138px] aspect-[2/3] z-0 opacity-50 hover:opacity-80 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.75)]'
              : isCenter
                ? 'w-[225px] sm:w-[260px] h-[315px] sm:h-[365px] z-20 -translate-y-2 shadow-[0_35px_75px_-15px_rgba(0,0,0,0.9)]'
                : isNear
                  ? 'w-[165px] sm:w-[190px] h-[240px] sm:h-[275px] z-10 opacity-75 hover:opacity-95 hover:-translate-y-1 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.8)]'
                  : 'w-[140px] h-[205px] z-0 opacity-45 hover:opacity-75 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.75)]';

            if (matchedMonograph) {
              return (
                <button
                  key={`${item.id}-${offset}`}
                  type="button"
                  onClick={() => (isCenter ? onOpenVolume(item) : onChangeIndex(idx))}
                  className={`${visibilityClass} ${scaleClass} group relative flex-col text-left rounded-[8px] border border-white/25 bg-[#11100E] transition-all duration-500 ease-out cursor-pointer shrink-0 overflow-hidden`}
                >
                  <div className="w-full h-full group-hover:scale-[1.02] transition-transform duration-300">
                    <KaMonographCover
                      book={matchedMonograph}
                      size={isCenter ? 'lg' : 'md'}
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/10 via-transparent to-black/35"
                  />
                  {isCenter && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-x-3 bottom-3 z-20 px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-white/25 flex items-center justify-between text-[11px] font-mono text-white">
                      <span>Click to Read Volume</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            }

            return (
              <button
                key={`${item.id}-${offset}`}
                type="button"
                onClick={() => (isCenter ? onOpenVolume(item) : onChangeIndex(idx))}
                className={`${visibilityClass} ${scaleClass} group relative flex-col justify-between text-left rounded-r-2xl rounded-l-[5px] bg-gradient-to-br ${item.coverGradient} border border-white/15 transition-all duration-500 ease-out cursor-pointer shrink-0 overflow-hidden`}
              >
                {/* 3D Book Spine Binding Strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-3 sm:w-3.5 ${item.spineColor} opacity-90 shadow-[inset_-2px_0_6px_rgba(0,0,0,0.5)]`}
                />
                {/* Vertical book crease highlight */}
                <div className="absolute left-3 sm:left-3.5 top-0 bottom-0 w-px bg-white/25" />

                {/* Subtle Studio Rim Gloss */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-white/[0.08] pointer-events-none" />

                {/* Cover Header */}
                <div className="relative z-10 pl-6 pr-4 pt-5 flex items-center justify-between gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-300/80 truncate">
                    {item.edition}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/45 border border-white/15 ${item.accentColor}`}
                  >
                    {item.badgeText}
                  </span>
                </div>

                {/* Cover Centerpiece Emblem / Title */}
                <div className="relative z-10 pl-6 pr-5 my-auto space-y-2.5">
                  <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.08] border border-white/20 backdrop-blur-md">
                    {item.kind === 'track' ? (
                      <Code2 className={`w-5 h-5 ${item.accentColor}`} />
                    ) : item.kind === 'book' ? (
                      <BookOpen className={`w-5 h-5 ${item.accentColor}`} />
                    ) : (
                      <Zap className={`w-5 h-5 ${item.accentColor}`} />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#CBD5E1]">
                      KΛ FOLIO · {getVolumeMonogram(item)}
                    </p>
                    <h3
                      className={`font-bold text-white leading-tight mt-1 ${
                        isCenter ? 'text-xl sm:text-[23px]' : 'text-base sm:text-lg'
                      }`}
                    >
                      {item.title}
                    </h3>
                    {isCenter && (
                      <p className="text-xs sm:text-[13px] font-medium text-[#DCE3EE] leading-relaxed mt-1.5 line-clamp-2">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cover Footer + 3D Page Thickness Illusion */}
                <div className="relative z-10 pl-6 pr-4 pb-4 pt-2 border-t border-white/15 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-[#E2E8F0] truncate">
                    {isCenter ? 'Click to Open →' : item.badgeText}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-[#CBD5E1]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Subtle bottom page-stack rim */}
                <div className="absolute bottom-0 left-3.5 right-1 h-1 bg-gradient-to-r from-zinc-300/35 via-zinc-100/20 to-zinc-400/25 rounded-br-xl" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Editorial Footer Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>KΛ FOLIO</span>
          </span>
          <span className="hidden sm:inline">
            Learn the Craft. Read the Volumes. Solve the Arena.
          </span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span className="text-xs font-mono text-zinc-400 tracking-widest">
            <strong className="text-white">{String(safeIndex + 1).padStart(2, '0')}</strong>
            {' / '}
            {String(volumes.length).padStart(2, '0')}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous volume"
              className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] hover:bg-[#FAF8F5] text-zinc-200 hover:text-[#07090E] flex items-center justify-center transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next volume"
              className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.03] hover:bg-[#FAF8F5] text-zinc-200 hover:text-[#07090E] flex items-center justify-center transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
