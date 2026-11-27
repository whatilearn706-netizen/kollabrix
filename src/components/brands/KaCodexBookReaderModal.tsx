'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Copy, X } from 'lucide-react';
import type { CodingBook } from '@/data/kaCodexBooks';
import { KaMonographCover } from '@/components/brands/KaMonographCover';

interface KaCodexBookReaderModalProps {
  book: CodingBook;
  onClose: () => void;
  onSelectNextBook: () => void;
}

/**
 * Physical 3D Open Hardcover Notebook Reader (Dark Edition):
 * Mimics a real open architectural hardcover coding notebook with binding cover lip,
 * stacked page edges, bookmark ribbon, central 3D curved spine shadow, and flipping page turn.
 */
export function KaCodexBookReaderModal({
  book,
  onClose,
  onSelectNextBook,
}: KaCodexBookReaderModalProps) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [flipKey, setFlipKey] = useState(0);
  const [flipDir, setFlipDir] = useState<1 | -1>(1);
  const [copied, setCopied] = useState(false);

  const chapter = book.chapters[chapterIdx] || book.chapters[0];

  const turnToChapter = (nextIdx: number) => {
    if (nextIdx === chapterIdx || nextIdx < 0 || nextIdx >= book.chapters.length) return;
    setFlipDir(nextIdx > chapterIdx ? 1 : -1);
    setFlipKey((k) => k + 1);
    setChapterIdx(nextIdx);
  };

  const copyCode = () => {
    if (!chapter.codeSnippet) return;
    try {
      navigator.clipboard.writeText(chapter.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const leftPageNum = chapterIdx * 2 + 2;
  const rightPageNum = chapterIdx * 2 + 3;

  return (
    <div
      style={{ perspective: '1600px' }}
      className="fixed inset-0 z-[9995] bg-[#090807]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Floating Top Minimal Controls above the Open Notebook */}
      <div className="w-full max-w-5xl flex items-center justify-between gap-4 mb-3 px-1">
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#A8A196]">
          <span>VOL. {String(book.index).padStart(2, '0')}</span>
          <span>&bull;</span>
          <span className="text-[#F4F3EF] truncate max-w-[200px] sm:max-w-md">{book.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectNextBook}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1C1A17] hover:bg-[#282420] border border-white/15 text-[11px] font-mono text-[#E5E0D7] cursor-pointer transition-colors"
          >
            <span>Next Volume</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notebook"
            className="w-8 h-8 rounded-full bg-[#1C1A17] hover:bg-[#282420] border border-white/15 flex items-center justify-center text-[#E5E0D7] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* REAL 3D OPEN HARDCOVER NOTEBOOK CONTAINER */}
      <motion.div
        initial={{ scale: 0.78, rotateX: 14, opacity: 0 }}
        animate={{ scale: 1, rotateX: 2, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 190, damping: 22 }}
        className="relative w-full max-w-5xl"
      >
        {/* Outer Hardcover Leather/Cloth Binding Rim */}
        <div
          style={{
            background: `linear-gradient(160deg, ${book.spineColor} 0%, #141210 55%, ${book.spineColor} 100%)`,
          }}
          className="relative rounded-[18px] p-2 sm:p-3.5 shadow-[0_45px_120px_rgba(0,0,0,0.96),0_12px_32px_rgba(0,0,0,0.85)] border border-white/15"
        >
          {/* Hanging Woven Silk Bookmark Ribbon */}
          <div
            aria-hidden="true"
            style={{ backgroundColor: book.accentHex }}
            className="hidden sm:block absolute left-1/2 -translate-x-1/2 -bottom-6 w-3.5 h-9 rounded-b-sm shadow-lg opacity-90 z-0"
          >
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[5px] border-b-[#090807] absolute bottom-0 left-0" />
          </div>

          {/* Stacked Multi-Page Thickness Rim (Left, Right & Bottom Paper Edges) */}
          <div className="relative rounded-[10px] bg-[#2D2A25] p-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {/* Inner Two-Page Open Spread */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 rounded-[8px] overflow-hidden bg-[#191714] border border-white/[0.07]">
              {/* Realistic Center 3D Binding Gutter Shadow & Spine Crease */}
              <div
                aria-hidden="true"
                className="hidden md:block pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 z-20"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.52) 42%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.56) 58%, rgba(0,0,0,0) 100%)',
                }}
              />
              <div
                aria-hidden="true"
                className="hidden md:block pointer-events-none absolute inset-y-0 left-1/2 w-px bg-black/90 z-20"
              />

              {/* Subtle 3D Page-Flip Overlay Sheet on Chapter Turn */}
              <AnimatePresence mode="popLayout">
                {flipKey > 0 && (
                  <motion.div
                    key={flipKey}
                    initial={{ rotateY: flipDir > 0 ? 0 : -175, opacity: 0.7 }}
                    animate={{ rotateY: flipDir > 0 ? -175 : 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      transformOrigin: 'left center',
                      backfaceVisibility: 'hidden',
                    }}
                    className="hidden md:block pointer-events-none absolute inset-y-0 left-1/2 right-0 bg-gradient-to-l from-[#24211C] to-[#171512] border-l border-white/10 z-30 shadow-2xl"
                  />
                )}
              </AnimatePresence>

              {/* LEFT NOTEBOOK PAGE: Book Plate, Jacket & Chapter Index */}
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
                  backgroundSize: '100% 28px',
                }}
                className="relative p-6 sm:p-9 md:pr-12 border-b md:border-b-0 border-white/[0.06] flex flex-col justify-between gap-6 min-h-[420px] sm:min-h-[500px]"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-[#8C867E]">
                    <span>{book.category}</span>
                    <span>ISBN {book.isbn}</span>
                  </div>

                  {/* Book Plate with Cover & Editorial Metadata */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div
                      style={{ borderColor: `${book.accentHex}60` }}
                      className="relative w-24 sm:w-28 aspect-[2/3] rounded-[5px] overflow-hidden border shadow-[0_14px_30px_rgba(0,0,0,0.85)] shrink-0 bg-[#11100E]"
                    >
                      <KaMonographCover book={book} size="sm" />
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#FAF9F6] leading-snug">
                        {book.title}
                      </h2>
                      <p className="text-xs font-mono text-[#D6D1C7]">
                        Synthesis &bull; {book.author} &bull; {book.year}
                      </p>
                      <p className="text-sm text-[#E5E0D7] leading-relaxed pt-1">
                        {book.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Current Spread Narrative */}
                  <div className="pt-3 border-t border-white/[0.1] space-y-2.5">
                    <span
                      style={{ color: book.accentHex }}
                      className="font-mono text-xs font-semibold uppercase tracking-[0.2em]"
                    >
                      Chapter {chapter.number}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                      {chapter.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-[#E8E4DC] leading-[1.75]">
                      {chapter.summary}
                    </p>
                  </div>
                </div>

                {/* Notebook Left Margin Bottom: Chapters + Folio Number */}
                <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {book.chapters.map((ch, idx) => (
                      <button
                        key={ch.number}
                        type="button"
                        onClick={() => turnToChapter(idx)}
                        className={`px-2.5 py-1 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                          idx === chapterIdx
                            ? 'bg-[#F4F3EF] text-[#141311] font-bold'
                            : 'bg-white/[0.05] hover:bg-white/[0.1] text-[#A8A196]'
                        }`}
                      >
                        Ch. {ch.number}
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-[#6E6962]">p. 0{leftPageNum}</span>
                </div>
              </div>

              {/* RIGHT NOTEBOOK PAGE: Takeaways, Annotated Code & Turn-Page Controls */}
              <div
                style={{
                  backgroundImage:
                    'linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
                  backgroundSize: '100% 28px',
                }}
                className="relative p-6 sm:p-9 md:pl-12 bg-[#171512] flex flex-col justify-between gap-6 min-h-[420px] sm:min-h-[500px]"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-[#8C867E]">
                    <span>Field Notes &amp; Implementation</span>
                    <span>
                      Spread {chapterIdx + 1} / {book.chapters.length}
                    </span>
                  </div>

                  {/* Key Notebook Annotations */}
                  <div className="rounded-xl bg-[#11100E]/90 border border-white/[0.08] p-4 space-y-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9A9389]">
                      Core Engineering Takeaways
                    </p>
                    <ul className="space-y-2">
                      {chapter.takeaways.map((pt) => (
                        <li
                          key={pt}
                          className="text-xs sm:text-sm text-[#E5E0D7] flex items-start gap-2.5 leading-relaxed"
                        >
                          <span
                            style={{ backgroundColor: book.accentHex }}
                            className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Syntax Code Block Inside Notebook */}
                  {chapter.codeSnippet ? (
                    <div className="rounded-xl bg-[#0D0C0B] border border-white/[0.09] overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.07] bg-[#131210]">
                        <span className="font-mono text-[10px] text-[#A8A196]">
                          {chapter.codeTitle || 'Code Example'}
                        </span>
                        <button
                          type="button"
                          onClick={copyCode}
                          className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D6D1C7] hover:text-white cursor-pointer"
                        >
                          {copied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 text-[11px] sm:text-xs font-mono text-emerald-200/90 overflow-x-auto leading-relaxed">
                        {chapter.codeSnippet}
                      </pre>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-[#11100E]/70 border border-dashed border-white/[0.08] p-4 text-xs font-mono text-[#8C867E]">
                      Architecture &amp; design principles spread &bull; {book.pages} total pages in hardcover volume.
                    </div>
                  )}
                </div>

                {/* Notebook Right Margin Bottom: Turn Page + Folio Number */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={chapterIdx === 0}
                      onClick={() => turnToChapter(chapterIdx - 1)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 text-[11px] font-mono text-[#E5E0D7] cursor-pointer disabled:cursor-default"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Prev Page</span>
                    </button>

                    <button
                      type="button"
                      disabled={chapterIdx >= book.chapters.length - 1}
                      onClick={() => turnToChapter(chapterIdx + 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F4F3EF] hover:bg-white disabled:opacity-30 text-[11px] font-mono font-semibold text-[#141311] cursor-pointer disabled:cursor-default"
                    >
                      <span>Turn Page</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono text-[10px] text-[#6E6962]">p. 0{rightPageNum}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
