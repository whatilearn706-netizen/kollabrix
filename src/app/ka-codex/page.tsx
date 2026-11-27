'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';
import { KA_CODEX_BOOKS } from '@/data/kaCodexBooks';
import { KaFolioScrollWalkHero } from '@/components/brands/KaFolioScrollWalkHero';
import { KaCodexSpotlightStage } from '@/components/brands/KaCodexSpotlightStage';
import { getKollabrixHomeUrl } from '@/lib/kaBrandDomains';

export default function KaCodexBrandPage() {
  const [showIndexOverlay, setShowIndexOverlay] = useState(false);

  const totalBooks = KA_CODEX_BOOKS.length;

  return (
    <div className="min-h-screen w-full bg-[#121110] text-[#F4F3EF] overflow-x-clip font-sans selection:bg-[#F4F3EF] selection:text-[#121110]">
      {/* ===================================================================== */}
      {/* SECTION 1: SCROLL-DRIVEN 12 CODING BOOKS WALK (pin.it/4WRF4Nmlx)      */}
      {/* ===================================================================== */}
      <KaFolioScrollWalkHero
        books={KA_CODEX_BOOKS}
        onOpenIndex={() => setShowIndexOverlay(true)}
      />

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
                    href={getKollabrixHomeUrl()}
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
