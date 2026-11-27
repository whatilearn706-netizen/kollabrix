'use client';

import React from 'react';
import type { CodingBook } from '@/data/kaCodexBooks';
import { getMonographSpec } from '@/lib/codex/monographArt';

interface KaMonographCoverProps {
  book: CodingBook;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Custom KΛ FOLIO Edition dark obsidian hardcover monograph cover.
 * Replaces third-party copyrighted publisher book jackets with 100% original
 * foil-stamped KΛ FOLIO artwork, generative geometric SVG diagrams, and fair-use attribution.
 */
export function KaMonographCover({
  book,
  size = 'lg',
  className = '',
}: KaMonographCoverProps) {
  const spec = getMonographSpec(book);
  const volNum = String(book.index).padStart(2, '0');

  const isMicro = size === 'xs' || size === 'sm';

  return (
    <div
      style={{
        background: `radial-gradient(circle at 60% 28%, ${book.accentHex}29 0%, ${book.spineColor}22 42%, #0B0A09 100%)`,
      }}
      className={`relative w-full h-full overflow-hidden select-none bg-[#11100E] text-[#F4F3EF] flex flex-col justify-between ${className}`}
    >
      {/* Subtle architectural blueprint micro-grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: isMicro ? '10px 10px' : '18px 18px',
        }}
      />

      {/* Tactile hardcover spine groove & metallic hinge on left edge */}
      <div
        aria-hidden="true"
        style={{
          background: `linear-gradient(90deg, ${book.spineColor} 0%, #0E0D0B 72%, rgba(255,255,255,0.16) 100%)`,
        }}
        className={`pointer-events-none absolute inset-y-0 left-0 z-10 border-r border-black/80 ${
          isMicro ? 'w-1.5' : 'w-3 sm:w-3.5'
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 z-10 w-px bg-white/20 ${
          isMicro ? 'left-1.5' : 'left-3 sm:left-3.5'
        }`}
      />

      {/* Top accent foil stripe */}
      <div
        aria-hidden="true"
        style={{ backgroundColor: book.accentHex }}
        className="absolute top-0 inset-x-0 h-[3px] z-20 opacity-90"
      />

      {/* Top Metadata Bar */}
      <div
        className={`relative z-10 flex items-center justify-between gap-1 ${
          size === 'xs'
            ? 'pl-2.5 pr-1.5 pt-2 text-[6px]'
            : size === 'sm'
              ? 'pl-3 pr-2 pt-2.5 text-[7px]'
              : size === 'md'
                ? 'pl-5 pr-3 pt-3.5 text-[9px]'
                : 'pl-6 sm:pl-7 pr-4 pt-4 sm:pt-5 text-[10px]'
        } font-mono uppercase tracking-[0.16em]`}
      >
        <span style={{ color: book.accentHex }} className="font-bold truncate">
          {isMicro ? `KΛ · ${volNum}` : `KΛ FOLIO · ${spec.seriesCode}`}
        </span>
        {!isMicro && (
          <span className="text-[#C7C1B7] font-semibold shrink-0">VOL. {volNum}</span>
        )}
      </div>

      {/* Generative SVG Engineering Diagram Plate */}
      <div
        className={`relative z-10 flex-1 flex items-center justify-center ${
          size === 'xs'
            ? 'pl-2.5 pr-1.5 py-0.5'
            : size === 'sm'
              ? 'pl-3 pr-2 py-1'
              : size === 'md'
                ? 'pl-5 pr-3 py-1.5'
                : 'pl-6 sm:pl-7 pr-4 py-2'
        }`}
      >
        <div
          className={`w-full h-full flex flex-col items-center justify-center rounded-lg border border-white/[0.08] bg-black/35 ${
            isMicro ? 'p-1' : 'p-2 sm:p-3'
          }`}
        >
          <svg
            viewBox="0 0 160 120"
            style={{ color: book.accentHex }}
            className="w-full h-full max-h-[118px] drop-shadow-[0_0_12px_rgba(255,255,255,0.12)]"
            dangerouslySetInnerHTML={{ __html: spec.svgPaths }}
          />
          {!isMicro && size !== 'md' && (
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-[#B7B0A5] mt-1 truncate max-w-full">
              {spec.conceptTag}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Title + Fair-Use Synthesis Attribution */}
      <div
        className={`relative z-10 border-t border-white/[0.1] bg-gradient-to-t from-black/75 via-black/40 to-transparent ${
          size === 'xs'
            ? 'pl-2.5 pr-1.5 pb-2 pt-1.5 space-y-0.5'
            : size === 'sm'
              ? 'pl-3 pr-2 pb-2.5 pt-1.5 space-y-0.5'
              : size === 'md'
                ? 'pl-5 pr-3 pb-3 pt-2 space-y-1'
                : 'pl-6 sm:pl-7 pr-4 pb-4 pt-2.5 space-y-1.5'
        }`}
      >
        <p
          className={`font-bold text-[#F8F7F4] tracking-tight leading-[1.16] line-clamp-3 ${
            size === 'xs'
              ? 'text-[8px]'
              : size === 'sm'
                ? 'text-[10px]'
                : size === 'md'
                  ? 'text-xs'
                  : 'text-sm sm:text-[17px]'
          }`}
        >
          {size === 'xs' ? book.shortTitle : book.title}
        </p>

        {!isMicro && (
          <div className="space-y-0.5">
            <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.14em] text-[#C7C1B7] truncate">
              SYNTHESIS · {book.author}
            </p>
            {size === 'lg' && (
              <div className="flex items-center justify-between text-[8px] font-mono text-[#8C867E] pt-0.5">
                <span>{spec.editionLabel}</span>
                <span>{book.pages}P</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
