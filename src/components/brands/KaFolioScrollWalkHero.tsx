'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, type MotionValue, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { CodingBook } from '@/data/kaCodexBooks';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';
import { getKollabrixHomeUrl } from '@/lib/kaBrandDomains';

interface KaFolioScrollWalkHeroProps {
  books: CodingBook[];
  onOpenIndex: () => void;
}

const BOOK_REST_POSES = [
  { rot: -6, dx: -8, dy: 4, driftX: 160, driftY: -540, spinZ: -26 },
  { rot: 8, dx: 12, dy: -6, driftX: -190, driftY: -520, spinZ: 28 },
  { rot: -10, dx: -14, dy: 8, driftX: 210, driftY: -560, spinZ: -22 },
  { rot: 5, dx: 10, dy: -4, driftX: -150, driftY: -540, spinZ: 24 },
  { rot: -7, dx: -6, dy: 6, driftX: 180, driftY: -510, spinZ: -28 },
  { rot: 11, dx: 14, dy: -8, driftX: -210, driftY: -550, spinZ: 22 },
  { rot: -9, dx: -10, dy: 5, driftX: 170, driftY: -530, spinZ: -24 },
  { rot: 6, dx: 8, dy: -5, driftX: -175, driftY: -560, spinZ: 26 },
  { rot: -11, dx: -12, dy: 7, driftX: 195, driftY: -520, spinZ: -21 },
  { rot: 9, dx: 11, dy: -6, driftX: -165, driftY: -540, spinZ: 25 },
  { rot: -5, dx: -8, dy: 4, driftX: 185, driftY: -550, spinZ: -23 },
  { rot: 7, dx: 6, dy: -3, driftX: -140, driftY: -500, spinZ: 18 },
];

interface PavementBookLayerProps {
  book: CodingBook;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  isActive: boolean;
}

/**
 * Individual coding book resting on the lit street stack.
 * When its scroll window arrives, it peels up, tilts in 3D wind curl, and flies away,
 * revealing the next coding volume beneath it (adapted from Oversight "Pavement" / pin.it/2TPD4XRJC).
 */
function PavementBookLayer({
  book,
  index,
  total,
  scrollYProgress,
  isActive,
}: PavementBookLayerProps) {
  const pose = BOOK_REST_POSES[index % BOOK_REST_POSES.length];
  const segments = Math.max(total - 1, 1);
  const start = index / segments;
  const peelMid = Math.min(1, start + 0.42 / segments);
  const end = Math.min(1, (index + 0.96) / segments);
  const isLast = index === total - 1;

  // Last volume stays grounded at the bottom of the stack so the street never looks empty
  const x = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [pose.dx, pose.dx, pose.dx, pose.dx] : [pose.dx, pose.dx, pose.dx + pose.driftX * 0.28, pose.dx + pose.driftX]
  );
  const y = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [pose.dy, pose.dy, pose.dy, pose.dy] : [pose.dy, pose.dy, pose.dy - 110, pose.dy + pose.driftY]
  );
  const rotateZ = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [pose.rot, pose.rot, pose.rot, pose.rot] : [pose.rot, pose.rot, pose.rot + pose.spinZ * 0.45, pose.rot + pose.spinZ]
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [12, 12, 8, 6] : [14, 14, 34, 48]
  );
  const rotateY = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [0, 0, 0, 0] : [0, 0, pose.driftX > 0 ? -18 : 18, pose.driftX > 0 ? -32 : 32]
  );
  const scale = useTransform(
    scrollYProgress,
    [0, Math.max(0, start - 1 / segments), start, peelMid, end],
    isLast
      ? [0.92, 0.96, 1, 1, 1]
      : [Math.max(0.88, 1 - index * 0.015), 0.97, 1, 1.09, 1.18]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [1, 1, 1, 1] : [1, 1, 0.96, 0]
  );
  const shadowOpacity = useTransform(
    scrollYProgress,
    [0, start, peelMid, end],
    isLast ? [0.85, 0.9, 0.9, 0.9] : [0.85, 0.9, 0.42, 0]
  );

  return (
    <motion.div
      style={{
        x,
        y,
        rotateZ,
        rotateX,
        rotateY,
        scale,
        opacity,
        zIndex: total - index,
        transformOrigin: 'center 65%',
      }}
      className={`absolute w-[220px] sm:w-[270px] aspect-[2/3] ${
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Directional low-sun cast shadow on pavement beneath the book */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: shadowOpacity }}
        className="pointer-events-none absolute -inset-3 translate-x-5 translate-y-7 rounded-xl bg-black/90 blur-xl"
      />
      <motion.div
        aria-hidden="true"
        style={{ opacity: shadowOpacity }}
        className="pointer-events-none absolute inset-0 translate-x-2.5 translate-y-3.5 rounded-[7px] bg-black/75 blur-[5px]"
      />

      {/* Stepped stacked book paper block thickness */}
      <div
        aria-hidden="true"
        style={{ backgroundColor: book.spineColor }}
        className="absolute inset-0 translate-x-[5px] translate-y-[6px] rounded-[7px] border border-white/10"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-[2px] translate-y-[3px] rounded-[7px] bg-[#D6D1C7]/25"
      />

      {/* Clickable Real Coding Volume Cover */}
      <Link
        href={`/resources?section=books&book=${encodeURIComponent(book.id)}`}
        className="group relative block w-full h-full rounded-[7px] overflow-hidden border border-white/20 bg-[#181613] shadow-[0_24px_60px_rgba(0,0,0,0.92)] cursor-pointer"
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />

        {/* Subtle Low-Sun Specular Raking Light across Paper Cover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/15 via-transparent to-black/45"
        />

        {/* Clean Hover Read Prompt */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-x-3 bottom-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-between text-[10px] font-mono text-white">
          <span>Open in Bookshelf</span>
          <ArrowUpRight className="w-3 h-3" />
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * KΛ FOLIO Scroll-Driven "Pavement" 12-Book Stage (adapted from https://pin.it/2TPD4XRJC):
 * - Low-altitude overhead view of a textured dark asphalt street lit by warm low-sun beams
 * - All 12 coding classics stacked cleanly on the pavement; scrolling sequentially peels up & lifts each book in the wind
 * - Synchronized bottom-left title/counter (01/12 .. 12/12) + right-edge jump ruler + Index 12 drawer
 * - Scrolling past 12/12 seamlessly reveals Section 2 (Open Bound Spread + YouTube) and the Dark Footer
 */
export function KaFolioScrollWalkHero({ books, onOpenIndex }: KaFolioScrollWalkHeroProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const totalSteps = Math.max(books.length - 1, 1);
  const streetParallaxY = useTransform(scrollYProgress, [0, 1], ['0px', '-260px']);
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
    <section ref={trackRef} className="relative w-full h-[500vh] bg-[#100F0D] select-none">
      {/* Sticky Overhead Pavement Camera */}
      <div className="sticky top-0 w-full h-screen min-h-[650px] overflow-hidden bg-[#100F0D]">
        {/* Realistic Asphalt Grain + Subtle Pavement Seams & Fractures */}
        <motion.div
          aria-hidden="true"
          style={{ y: streetParallaxY }}
          className="pointer-events-none absolute -inset-y-72 inset-x-0"
        >
          <svg className="w-full h-full opacity-[0.26]" xmlns="http://www.w3.org/2000/svg">
            <filter id="paveGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#paveGrain)" />
          </svg>
          {/* Subtle Concrete Expansion Seams & Hairline Street Cracks */}
          <div
            className="absolute inset-0 opacity-45"
            style={{
              backgroundImage: [
                'repeating-linear-gradient(176deg, transparent 0px, transparent 280px, rgba(255,248,235,0.035) 281px, rgba(0,0,0,0.65) 283px)',
                'repeating-linear-gradient(88deg, transparent 0px, transparent 360px, rgba(255,248,235,0.025) 361px, rgba(0,0,0,0.5) 363px)',
              ].join(', '),
            }}
          />
        </motion.div>

        {/* Warm Low-Sun Diagonal Light Pool + Deep Street Photograph Vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 46% 52% at 49% 46%, rgba(214,191,158,0.22) 0%, rgba(112,96,76,0.14) 36%, rgba(18,16,14,0.74) 70%, rgba(9,8,7,0.97) 100%)',
              'linear-gradient(125deg, rgba(255,244,224,0.07) 0%, transparent 45%, rgba(0,0,0,0.65) 100%)',
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
              <p className="text-[11px] sm:text-xs text-[#A8A196] mt-0.5">
                12 coding classics &middot;{' '}
                <Link
                  href={getKollabrixHomeUrl()}
                  className="text-[#F4F3EF] hover:text-white underline underline-offset-2"
                >
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

        {/* Center 3D Perspective Stack of 12 Coding Books (Peels up & lifts sequentially on scroll) */}
        <div
          style={{ perspective: '1350px' }}
          className="relative z-20 w-full h-full flex items-center justify-center pointer-events-none pb-12"
        >
          {books.map((book, idx) => (
            <PavementBookLayer
              key={book.id}
              book={book}
              index={idx}
              total={books.length}
              scrollYProgress={scrollYProgress}
              isActive={idx === activeIdx}
            />
          ))}
        </div>

        {/* Right-Edge Vertical Scroll Ruler */}
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

        {/* Bottom-Left HUD: Synchronized Counter, Large Editorial Title & Metadata */}
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
                <h1 className="text-3xl sm:text-5xl md:text-[52px] font-semibold tracking-[-0.035em] leading-[1.04] text-[#F4F3EF] group-hover:text-white transition-colors">
                  {activeBook.title}
                </h1>
                <ArrowUpRight className="w-5 h-5 text-[#9A938A] group-hover:text-white shrink-0 transition-colors" />
              </Link>

              <p className="text-xs sm:text-sm text-[#A8A196]">
                {activeBook.author} &middot; {activeBook.pages} pages &middot; Scroll to peel the stack &middot; click cover to read
              </p>
            </div>

            <a
              href="#spotlight-stage"
              className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A17]/85 hover:bg-[#282521] border border-white/15 text-xs font-mono text-[#E5E0D7] self-start sm:self-auto transition-all"
            >
              <span>Spotlight</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </a>
          </div>

          <div className="w-full h-px bg-white/[0.12] relative overflow-hidden">
            <motion.div style={{ width: progressWidth }} className="h-full bg-[#F4F3EF]/85" />
          </div>
        </div>
      </div>
    </section>
  );
}
