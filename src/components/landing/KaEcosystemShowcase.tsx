'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen, CheckCircle2, Code2, Cpu, Layers, Sparkles } from 'lucide-react';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';

const FOLIO_MINI_BOOKS = [
  { code: 'VOL 01', title: 'DDIA', accent: 'from-rose-500/35 to-rose-950/80 border-rose-400/35', rot: '-rotate-6 translate-y-2' },
  { code: 'VOL 02', title: 'Clean Code', accent: 'from-sky-500/35 to-slate-900/90 border-sky-400/35', rot: '-rotate-2 -translate-y-1' },
  { code: 'VOL 04', title: 'CLRS', accent: 'from-amber-500/35 to-stone-900/90 border-amber-400/40', rot: 'rotate-2 -translate-y-2' },
  { code: 'VOL 12', title: 'MIT SICP', accent: 'from-violet-500/35 to-slate-950/90 border-violet-400/35', rot: 'rotate-6 translate-y-2' },
];

/**
 * Kollabrix Homepage Showcase Section for KΛ ΛI & KΛ FOLIO:
 * Placed directly beneath the Explore / Active Projects ribbon so visitors
 * immediately discover both standalone KΛ products built by Kollabrix.
 */
export function KaEcosystemShowcase() {
  return (
    <section
      id="ka-ecosystem"
      className="relative w-full bg-[#020306] border-t border-white/[0.06] py-20 sm:py-24 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* Subtle Architectural Blueprint Grid + Dual Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 35%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 w-[420px] h-[320px] rounded-full bg-sky-500/[0.08] blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 w-[420px] h-[320px] rounded-full bg-amber-500/[0.08] blur-[110px]"
      />

      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto space-y-3.5"
        >
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/12 backdrop-blur-xl">
            <KaBrandEmblem className="w-5 h-3" />
            <span className="h-3 w-px bg-white/15" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-300">
              KΛ DIVISION &middot; BUILT BY KOLLABRIX
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.08] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Two dedicated engines.{' '}
            <span className="text-sky-300">Built for your edge.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Beyond teams and arena duels, we crafted <strong className="text-zinc-200 font-medium">KΛ ΛI</strong> and{' '}
            <strong className="text-zinc-200 font-medium">KΛ FOLIO</strong>—two standalone dark-luxury
            products synced directly with your Kollabrix account.
          </p>
        </motion.div>

        {/* Interactive Dual Flagship Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: KΛ ΛI */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-[28px] bg-gradient-to-b from-[#081024] via-[#060914] to-[#04060D] border border-white/10 hover:border-sky-400/40 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.85)] transition-colors"
          >
            {/* Horizon Ice-Blue Rim Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[360px] h-[220px] rounded-full bg-sky-500/20 blur-[80px] group-hover:bg-sky-400/30 transition-colors duration-500"
            />

            <div className="relative z-10 space-y-5">
              {/* Card Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2.5">
                  <KaBrandEmblem />
                  <span className="font-semibold text-base tracking-tight text-white">KΛ ΛI</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-[10px] font-mono font-bold text-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span>KΛ-1 · KΛ-PRO</span>
                </span>
              </div>

              {/* Creative Visual Preview: Holographic Core + Prompt Pills */}
              <div className="relative h-44 rounded-2xl bg-[#040814]/90 border border-white/[0.08] overflow-hidden flex items-center justify-center p-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(56,189,248,0.22),transparent_65%)]"
                />
                {/* Orbital Ring */}
                <div className="relative w-24 h-24 rounded-full border border-sky-300/30 flex items-center justify-center shadow-[0_0_45px_rgba(56,189,248,0.35)] group-hover:scale-105 transition-transform duration-500">
                  <div className="w-16 h-16 rounded-full border border-dashed border-sky-200/45 animate-spin [animation-duration:18s] flex items-center justify-center" />
                  <div className="absolute w-9 h-9 rounded-full bg-gradient-to-b from-sky-300 to-blue-600 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.85)]">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Floating Prompt Chips */}
                <div className="absolute left-3 top-3 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-mono text-sky-200 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-sky-400" />
                  <span>Audit Repo</span>
                </div>
                <div className="absolute right-3 bottom-3 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-cyan-300" />
                  <span>Run Sandbox</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  Build Smarter, Faster, Better.
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Your engineering &amp; hackathon copilot—run Python/C++/JS in live sandbox,
                  architect full-stack systems, and crack DSA rounds in seconds.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Live Code Sandbox &amp; Judge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Hackathon MVP Blueprints</span>
                </li>
              </ul>
            </div>

            {/* Dual CTA Actions */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.08]">
              <Link
                href="/spark"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-sky-50 text-slate-950 font-semibold text-xs transition-all shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
              >
                <span>Launch KΛ ΛI Workspace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/ka-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.11] border border-white/15 text-slate-200 hover:text-white font-mono text-xs transition-all"
              >
                <span>Explore KΛ ΛI Site</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* CARD 2: KΛ FOLIO */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="group relative rounded-[28px] bg-gradient-to-b from-[#17130E] via-[#0E0C0A] to-[#080706] border border-white/10 hover:border-amber-400/40 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.85)] transition-colors"
          >
            {/* Warm Editorial Amber Rim Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[360px] h-[220px] rounded-full bg-amber-500/15 blur-[80px] group-hover:bg-amber-400/25 transition-colors duration-500"
            />

            <div className="relative z-10 space-y-5">
              {/* Card Top Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2.5">
                  <KaBrandEmblem />
                  <span className="font-semibold text-base tracking-tight text-[#F4F3EF]">
                    KΛ FOLIO
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-200">
                  <BookOpen className="w-3 h-3 text-amber-300" />
                  <span>12 VOLUMES · DARK</span>
                </span>
              </div>

              {/* Creative Visual Preview: Fanned 3D Book Spine Cards */}
              <div className="relative h-44 rounded-2xl bg-[#0B0A08]/90 border border-white/[0.08] overflow-hidden flex items-center justify-center px-4">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(245,158,11,0.16),transparent_65%)]"
                />
                <div className="relative flex items-center justify-center -space-x-3 group-hover:space-x-1 transition-all duration-500">
                  {FOLIO_MINI_BOOKS.map((book) => (
                    <div
                      key={book.code}
                      className={`w-20 h-28 rounded-xl bg-gradient-to-b ${book.accent} border p-2.5 flex flex-col justify-between shadow-[0_14px_30px_rgba(0,0,0,0.85)] transform ${book.rot} group-hover:rotate-0 group-hover:translate-y-0 transition-all duration-500`}
                    >
                      <span className="text-[8px] font-mono text-zinc-300">{book.code}</span>
                      <div>
                        <p className="text-[11px] font-serif font-bold text-white leading-tight">
                          {book.title}
                        </p>
                        <div className="mt-1 h-px w-6 bg-white/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#F4F3EF] tracking-tight">
                  Twelve iconic volumes, in flight.
                </h3>
                <p className="text-xs sm:text-sm text-[#A8A196] leading-relaxed">
                  Read foundational computer science classics by topic—from DDIA &amp; CLRS to Clean
                  Architecture—paired with curated video lectures &amp; OA playbooks.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#D6D1C7]">
                <li className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>12 Topic-Filtered Books</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Interactive Chapter Reader</span>
                </li>
              </ul>
            </div>

            {/* Dual CTA Actions */}
            <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.08]">
              <Link
                href="/resources?section=books"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F4F3EF] hover:bg-white text-[#121110] font-semibold text-xs transition-all shadow-[0_8px_24px_rgba(244,243,239,0.14)]"
              >
                <span>Open 12-Book Shelf</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/ka-codex"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.11] border border-white/15 text-[#E5E0D7] hover:text-white font-mono text-xs transition-all"
              >
                <span>Explore KΛ FOLIO Site</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
