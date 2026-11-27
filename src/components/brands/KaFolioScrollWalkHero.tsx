'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { CodingBook } from '@/data/kaCodexBooks';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';

interface KaFolioScrollWalkHeroProps {
  books: CodingBook[];
  onOpenIndex: () => void;
}

// Natural tilted resting poses on the dark architectural slab (matching pin.it/4WRF4Nmlx)
const BOOK_POSES = [
  { rot: -8, xOffset: -18 },
  { rot: 11, xOffset: 24 },
  { rot: -12, xOffset: -26 },
  { rot: 7, xOffset: 16 },
  { rot: -6, xOffset: -14 },
  { rot: 13, xOffset: 28 },
  { rot: -10, xOffset: -22 },
  { rot: 8, xOffset: 18 },
  { rot: -14, xOffset: -20 },
  { rot: 9, xOffset: 24 },
  { rot: -7, xOffset: -16 },
  { rot: 10, xOffset: 14 },
];

/**
 * Scroll-Driven Overhead "Street / Slab Walk" Hero for KΛ FOLIO (inspired by https://pin.it/4WRF4Nmlx):
 * - Sticky full-viewport camera looking down onto a dark textured concrete/obsidian path
 * - Warm overhead photographic spotlight pool + deep vignette corners
 * - All 12 curated coding books resting at natural tilted angles with realistic contact shadows
 * - Vertical scroll advances smoothly across 01/12 .. 12/12 while syncing the right-edge ruler & bottom-left HUD
 * - Clicking any book opens it in /resources?section=books&book=<id>; scrolling past 12/12 reveals Section 2 & Footer
 */
export function KaFolioScrollWalkHero({ books, onOpenIndex }: KaFolioScrollWalkHeroProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Translate the 12-book vertical path smoothly as user scrolls through the sticky track
  const totalSteps = Math.max(books.length - 1, 1);
  const trackTranslateY = useTransform(scrollYProgress, [0, 1], ['0%', `-${totalSteps * 100}%`]);
  const slabShiftY = useTransform(scrollYProgress, [0, 1], ['0px', '-720px']);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['8%', '100%']);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      const idx = Math.min(books.length - 1, Math.max(0, Math.round(v * (books.length - 1))));
      setActiveIdx(idx);
    });
    return () => unsub();
  }, [scrollYProgress, books.length]);

  const activeBook = books[activeIdx] || books[0];

  const scrollToBook = (idx: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const trackTop = window.scrollY + rect.top;
    const maxScroll = Math.max(trackRef.current.offsetHeight - window.innerHeight, 1);
    const targetY = trackTop + (idx / totalSteps) * maxScroll;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <section ref={trackRef} className="relative w-full h-[380vh] bg-[#12100E] select-none">
      {/* Sticky Full-Viewport Overhead Stage */}
      <div className="sticky top-0 w-full h-screen min-h-[640px] overflow-hidden bg-[#12100E]">
        {/* Textured Dark Architectural Slab + Expansion Seams moving subtly with scroll */}
        <motion.div
          aria-hidden="true"
          style={{ y: slabShiftY }}
          className="pointer-events-none absolute -inset-y-96 inset-x-0 opacity-35"
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: [
                'repeating-linear-gradient(180deg, transparent 0px, transparent 238px, rgba(255,255,255,0.045) 239px, rgba(0,0,0,0.45) 240px)',
                'repeating-linear-gradient(90deg, transparent 0px, transparent 318px, rgba(255,255,255,0.03) 319px, rgba(0,0,0,0.35) 320px)',
              ].join(', '),
            }}
          />
        </motion.div>

        {/* Warm Overhead Photographic Spotlight Pool + Deep Corner Vignette (pin.it/4WRF4Nmlx) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 52% 58% at 50% 47%, rgba(196,174,142,0.16) 0%, rgba(92,80,64,0.11) 38%, rgba(18,16,14,0.72) 72%, rgba(10,9,8,0.96) 100%)',
            ].join(', '),
          }}
        />

        {/* Top-Left Brand + Top-Right Index HUD */}
        <header className="absolute top-0 inset-x-0 z-30 px-5 sm:px-9 py-5 flex items-start justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <KaBrandEmblem />
            <div>
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[#F4F3EF]">
                KΛ FOLIO
              </h2>
              <p className="text-[11px] sm:text-xs text-[#9A938A] mt-0.5">
                12 coding volumes &middot;{' '}
                <Link href="/" className="text-[#E5E0D7] hover:text-white underline underline-offset-2">
                  Built by Kollabrix
                </Link>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenIndex}
            className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#1C1A17]/85 hover:bg-[#282521] border border-white/[0.14] backdrop-blur-xl text-xs font-medium text-[#F4F3EF] inline-flex items-baseline gap-1 cursor-pointer transition-all"
          >
            <span>Index</span>
            <sup className="text-[9px] font-mono text-[#9A938A]">{books.length}</sup>
          </button>
        </header>

        {/* Scroll-Translated Path of the 12 Curated Coding Books */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-[360px] sm:h-[420px]">
            <motion.div style={{ y: trackTranslateY }} className="w-full h-full">
              {books.map((book, idx) => {
                const pose = BOOK_POSES[idx % BOOK_POSES.length];
                const isFocused = idx === activeIdx;
                return (
                  <div
                    key={book.id}
                    className="w-full h-full flex items-center justify-center px-4"
                  >
                    <Link
                      href={`/resources?section=books&book=${encodeURIComponent(book.id)}`}
                      style={{
                        transform: `translateX(${pose.xOffset}px) rotate(${pose.rot}deg) scale(${
                          isFocused ? 1 : 0.88
                        })`,
                      }}
                      className={`pointer-events-auto group relative block w-[210px] sm:w-[250px] aspect-[2/3] rounded-[6px] transition-all duration-500 cursor-pointer ${
                        isFocused ? 'opacity-100' : 'opacity-65 hover:opacity-95'
                      }`}
                    >
                      {/* Realistic Directional Cast Contact Shadow on Concrete/Slab */}
                      <div
                        aria-hidden="true"
                        className="absolute -inset-2 translate-x-4 translate-y-6 rounded-xl bg-black/85 blur-xl pointer-events-none"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 translate-x-2 translate-y-3 rounded-[6px] bg-black/70 blur-sm pointer-events-none"
                      />

                      {/* Subtle 3D Book Page-Block Edge Thickness */}
                      <div
                        aria-hidden="true"
                        style={{ backgroundColor: book.spineColor }}
                        className="absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-[6px] border border-white/10"
                      />

                      {/* Real Coding Book Cover */}
                      <div className="relative w-full h-full rounded-[6px] overflow-hidden border border-white/20 bg-[#1B1917] shadow-[0_20px_50px_rgba(0,0,0,0.9)] group-hover:scale-[1.03] transition-transform duration-300">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Subtle Overhead Studio Specular Sheen */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/35"
                        />
                        {/* Hover Read Pill */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-x-3 bottom-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-between text-[10px] font-mono text-white">
                          <span>Read Volume</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Right-Edge Vertical Ruler with Active Book Tick Label */}
        <aside
          aria-label="Volume scroll ruler"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-2.5"
        >
          {books.map((book, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => scrollToBook(idx)}
                title={`${String(book.index).padStart(2, '0')} — ${book.title}`}
                className="group py-0.5 pl-4 cursor-pointer flex items-center gap-2 focus:outline-none"
              >
                <span
                  className={`text-[10px] font-mono transition-opacity hidden md:inline ${
                    active ? 'opacity-95 text-[#F4F3EF]' : 'opacity-0 group-hover:opacity-75 text-[#9A938A]'
                  }`}
                >
                  {book.shortTitle}
                </span>
                <span
                  className={`block h-px transition-all duration-300 ${
                    active
                      ? 'w-6 bg-[#F4F3EF] shadow-[0_0_8px_rgba(244,243,239,0.75)]'
                      : 'w-2.5 bg-[#F4F3EF]/30 group-hover:w-4 group-hover:bg-[#F4F3EF]/65'
                  }`}
                />
              </button>
            );
          })}
        </aside>

        {/* Bottom-Left Counter, Large Title & Metadata (matching Studio Pavé HUD) */}
        <div className="absolute inset-x-0 bottom-0 z-30 px-5 sm:px-9 pb-6 sm:pb-7 flex flex-col gap-3 pointer-events-none">
          <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#9A938A]">
                <span className="text-[#F4F3EF] font-semibold">
                  {String(activeIdx + 1).padStart(2, '0')} / {String(books.length).padStart(2, '0')}
                </span>
                <span>&middot;</span>
                <span style={{ color: activeBook.accentHex }} className="uppercase tracking-wider">
                  {activeBook.category}
                </span>
              </div>

              <Link
                href={`/resources?section=books&book=${encodeURIComponent(activeBook.id)}`}
                className="pointer-events-auto group inline-flex items-baseline gap-2.5"
              >
                <h1 className="text-3xl sm:text-5xl md:text-[54px] font-semibold tracking-[-0.035em] leading-[1.04] text-[#F4F3EF] group-hover:text-white transition-colors">
                  {activeBook.title}
                </h1>
                <ArrowUpRight className="w-5 h-5 text-[#9A938A] group-hover:text-white shrink-0 transition-colors" />
              </Link>

              <p className="text-xs sm:text-sm text-[#A8A196]">
                {activeBook.author} &middot; {activeBook.pages} pages &middot; {activeBook.year}
              </p>
            </div>

            <a
              href="#spotlight-stage"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A17]/85 hover:bg-[#282521] border border-white/15 text-xs font-mono text-[#E5E0D7] self-start sm:self-auto transition-all"
            >
              <span>Scroll for Spotlight</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>

          <div className="w-full h-px bg-white/[0.12] relative overflow-hidden">
            <motion.div style={{ width: progressWidth }} className="h-full bg-[#F4F3EF]/80" />
          </div>
        </div>
      </div>
    </section>
  );
}
