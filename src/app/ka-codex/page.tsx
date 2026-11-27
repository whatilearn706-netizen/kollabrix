'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChevronDown, X } from 'lucide-react';
import { KA_CODEX_BOOKS, type CodingBook } from '@/data/kaCodexBooks';
import { KaCodexWebGLHero } from '@/components/brands/KaCodexWebGLHero';
import { KaCodexSpotlightStage } from '@/components/brands/KaCodexSpotlightStage';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';

export default function KaCodexBrandPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showIndexOverlay, setShowIndexOverlay] = useState(false);
  const [heroPaused, setHeroPaused] = useState(false);

  const totalBooks = KA_CODEX_BOOKS.length;
  const activeBook = KA_CODEX_BOOKS[activeIndex] || KA_CODEX_BOOKS[0];

  const openInKaResources = useCallback(
    (book?: CodingBook) => {
      const target = book
        ? `/resources?section=books&book=${encodeURIComponent(book.id)}`
        : '/resources?section=books';
      router.push(target);
    },
    [router]
  );

  // Pause Three.js hero loop cleanly once scrolled down past hero (saves laptop battery/GPU)
  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 1.15;
      setHeroPaused(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Optional keyboard navigation across ticks inside hero
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showIndexOverlay) return;
      if (e.key === 'ArrowRight') {
        setActiveIndex((p) => (p + 1) % totalBooks);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((p) => (p - 1 + totalBooks) % totalBooks);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showIndexOverlay, totalBooks]);

  const progressPct = Math.round(((activeIndex + 1) / totalBooks) * 100);

  return (
    <div className="min-h-screen w-full bg-[#121110] text-[#F4F3EF] overflow-x-hidden font-sans selection:bg-[#F4F3EF] selection:text-[#121110]">
      {/* ===================================================================== */}
      {/* SECTION 1: FULL-VIEWPORT THREE.JS CODING BOOKS IN FLIGHT (pin.it/5AwPsERe4) */}
      {/* ===================================================================== */}
      <section className="relative w-full h-screen min-h-[660px] bg-[#121110] overflow-hidden select-none">
        {/* Subtle Top-Left Warm Volumetric Spotlight Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 24% 18%, rgba(255,244,230,0.05) 0%, transparent 65%)',
          }}
        />

        {/* Full-Viewport 3D Three.js WebGL Coding Books + Curved Code Spreads (Tap -> /resources) */}
        <KaCodexWebGLHero
          books={KA_CODEX_BOOKS}
          activeIndex={activeIndex}
          paused={heroPaused || showIndexOverlay}
          onSelectBook={(book) => openInKaResources(book)}
        />

        {/* Floating Transparent Header (Dark Theme Only) */}
        <header className="relative z-30 w-full px-5 sm:px-9 pt-6 sm:pt-7 flex items-start justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5">
            <KaBrandEmblem />
            <div>
              <h2 className="text-sm sm:text-base font-semibold tracking-tight text-[#F4F3EF]">
                KΛ FOLIO
              </h2>
              <p className="text-[11px] sm:text-xs text-[#8C867E] mt-0.5">
                Programming &amp; engineering books &middot;{' '}
                <Link href="/" className="text-[#D6D1C7] hover:text-white underline underline-offset-2">
                  Built by Kollabrix
                </Link>
              </p>
            </div>
          </div>

          <nav aria-label="KΛ FOLIO navigation" className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowIndexOverlay(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#1C1A17]/85 hover:bg-[#282521] border border-white/[0.14] backdrop-blur-xl text-xs font-medium text-[#F4F3EF] inline-flex items-baseline gap-1 cursor-pointer transition-all"
            >
              <span>Index</span>
              <sup className="text-[9px] font-mono text-[#8C867E]">{totalBooks}</sup>
            </button>
          </nav>
        </header>

        {/* Right-Edge 12-Tick Book Flight Selector Rail */}
        <aside
          aria-label="Volume selector rail"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-2.5"
        >
          {KA_CODEX_BOOKS.map((book, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={book.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                title={`${String(book.index).padStart(2, '0')} — ${book.title}`}
                aria-label={`Focus ${book.title}`}
                className="group py-0.5 pl-4 cursor-pointer flex items-center gap-2 focus:outline-none"
              >
                <span
                  className={`text-[9px] font-mono transition-opacity hidden md:inline ${
                    active ? 'opacity-90 text-[#F4F3EF]' : 'opacity-0 group-hover:opacity-70 text-[#8C867E]'
                  }`}
                >
                  {book.shortTitle}
                </span>
                <span
                  className={`block h-px transition-all duration-300 ${
                    active
                      ? 'w-5 bg-[#F4F3EF] shadow-[0_0_8px_rgba(244,243,239,0.75)]'
                      : 'w-2.5 bg-[#F4F3EF]/30 group-hover:w-4 group-hover:bg-[#F4F3EF]/65'
                  }`}
                />
              </button>
            );
          })}
        </aside>

        {/* Bottom-Left Hero Copy & Scroll Prompt */}
        <div className="absolute inset-x-0 bottom-0 z-30 px-5 sm:px-9 pb-6 sm:pb-7 flex flex-col items-start gap-3 pointer-events-none">
          <Link
            href={`/resources?section=books&book=${encodeURIComponent(activeBook.id)}`}
            className="pointer-events-auto inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1C1A17]/90 hover:bg-[#2A2622] border border-white/[0.14] backdrop-blur-xl text-xs transition-all group"
          >
            <span
              style={{ backgroundColor: activeBook.accentHex }}
              className="w-2 h-2 rounded-full shrink-0"
            />
            <span className="font-mono text-[10px] text-[#A8A196]">
              VOL. {String(activeBook.index).padStart(2, '0')}
            </span>
            <span className="font-medium text-[#F4F3EF] truncate max-w-[200px] sm:max-w-xs">
              {activeBook.title}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#A8A196] group-hover:text-white transition-colors" />
          </Link>

          <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl sm:text-6xl md:text-[70px] font-semibold tracking-[-0.035em] leading-[1.02] text-[#F4F3EF]">
                Twelve books, in flight.
              </h1>
              <p className="text-xs sm:text-sm text-[#8C867E] mt-2">
                Algorithms, distributed systems, architecture and clean code &middot; Tap any 3D book to enter KΛ Resources
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

          {/* Full-Width Progress Rule */}
          <div className="w-full pt-1">
            <div className="w-full h-px bg-white/[0.12] relative overflow-hidden">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-[#F4F3EF]/75 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SECTION 2: FLYING BEST BOOK -> OPENS LEFT + YOUTUBE & BEST TOPICS RIGHT */}
      {/* ===================================================================== */}
      <KaCodexSpotlightStage />

      {/* ===================================================================== */}
      {/* DARK EDITORIAL LUXURY FOOTER                                          */}
      {/* ===================================================================== */}
      <footer className="relative z-20 w-full bg-[#090807] border-t border-white/[0.08] overflow-hidden pt-16 sm:pt-20 pb-8 px-5 sm:px-9 lg:px-14">
        {/* Subtle Warm Editorial Rim Glow from Top Spine */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[min(860px,95%)] h-44"
          style={{
            background:
              'radial-gradient(ellipse 65% 85% at 50% 0%, rgba(244,243,239,0.075) 0%, transparent 72%)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto space-y-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
            {/* Brand Monograph */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className="font-semibold tracking-tight text-lg text-[#F4F3EF]">
                  KΛ FOLIO
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-white/[0.06] border border-white/15 text-[#D6D1C7]">
                  DARK EDITION
                </span>
              </div>

              <p className="text-sm text-[#9A938A] leading-relaxed max-w-md">
                A curated dark-edition folio of foundational programming volumes, systems design
                blueprints, and engineering masterclasses—deeply connected with your Kollabrix
                learning workspace.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link
                  href="/resources?section=books"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F4F3EF] hover:bg-white text-[#121110] font-mono text-xs font-semibold transition-all shadow-sm"
                >
                  <span>Explore KΛ Folio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/ka-ai"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.11] border border-white/12 text-[#E5E0D7] font-mono text-xs transition-all"
                >
                  <span>Open KΛ ΛI</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Featured Track Links */}
            <div className="md:col-span-4 space-y-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6E6962]">
                ESSENTIAL TRACKS
              </p>
              <div className="grid grid-cols-1 gap-2">
                {KA_CODEX_BOOKS.slice(0, 4).map((b) => (
                  <Link
                    key={b.id}
                    href={`/resources?section=books&book=${encodeURIComponent(b.id)}`}
                    className="group flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-medium text-[#E5E0D7] group-hover:text-white truncate">
                        {b.shortTitle} &middot; {b.category}
                      </p>
                      <p className="font-mono text-[10px] text-[#7D776F] truncate">{b.author}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#7D776F] group-hover:text-[#F4F3EF] shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Ecosystem Navigation */}
            <div className="md:col-span-3 space-y-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6E6962]">
                KOLLΛBRIX ECOSYSTEM
              </p>
              <ul className="space-y-2.5 text-xs font-mono">
                <li>
                  <button
                    type="button"
                    onClick={() => setShowIndexOverlay(true)}
                    className="inline-flex items-center gap-1.5 text-[#B8B1A6] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Browse Full Index (12)</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </li>
                <li>
                  <Link
                    href="/resources"
                    className="inline-flex items-center gap-1.5 text-[#B8B1A6] hover:text-white transition-colors"
                  >
                    <span>KΛ Learning Resources</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ka-ai"
                    className="inline-flex items-center gap-1.5 text-[#B8B1A6] hover:text-white transition-colors"
                  >
                    <span>KΛ ΛI Engineering Copilot</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-[#B8B1A6] hover:text-white transition-colors"
                  >
                    <span>Return to Kollabrix</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Monumental Architectural Watermark */}
          <div className="pt-4 border-t border-white/[0.06] select-none overflow-hidden">
            <div className="text-[clamp(2.8rem,11vw,8.5rem)] font-semibold tracking-[-0.04em] leading-none text-center text-transparent bg-clip-text bg-gradient-to-b from-white/[0.11] via-white/[0.045] to-transparent">
              KΛ FOLIO
            </div>
          </div>

          {/* Legal Colophon Bar */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#6E6962]">
            <span>&copy; 2026 KΛ FOLIO &bull; Built by Kollabrix</span>
            <span className="tracking-wider uppercase text-[10px]">
              12 VOLUMES &middot; DARK EDITORIAL ARCHIVE
            </span>
          </div>
        </div>
      </footer>

      {/* Index 12 Dark Drawer Overlay (clicking any book redirects to /resources) */}
      {showIndexOverlay && (
        <div className="fixed inset-0 z-[9990] bg-[#0B0A09]/95 backdrop-blur-2xl overflow-y-auto p-5 sm:p-10">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8C867E]">
                  KΛ FOLIO ARCHIVE
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#F4F3EF] mt-1">
                  All {totalBooks} Programming Volumes
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/resources"
                  className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-mono text-[#E5E0D7]"
                >
                  Open KΛ Resources
                </Link>
                <button
                  type="button"
                  onClick={() => setShowIndexOverlay(false)}
                  aria-label="Close index"
                  className="w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {KA_CODEX_BOOKS.map((book) => (
                <Link
                  key={book.id}
                  href={`/resources?section=books&book=${encodeURIComponent(book.id)}`}
                  onClick={() => setShowIndexOverlay(false)}
                  className="group text-left rounded-2xl bg-[#161513] hover:bg-[#1E1C19] border border-white/[0.09] hover:border-white/25 p-4 flex items-start gap-4 transition-all"
                >
                  <div className="w-16 aspect-[2/3] rounded-md overflow-hidden border border-white/15 shrink-0 bg-[#1F1D1A] relative">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867E]">
                      <span>VOL. {String(book.index).padStart(2, '0')}</span>
                      <span>{book.category}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#F4F3EF] group-hover:text-white leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#8C867E]">
                      {book.author} &bull; {book.year}
                    </p>
                    <p className="text-xs text-[#B7B0A5] line-clamp-2 pt-0.5">
                      {book.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
