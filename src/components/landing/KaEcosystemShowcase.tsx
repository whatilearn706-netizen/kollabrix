'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen, CheckCircle2, Code2, Cpu, Layers, Terminal } from 'lucide-react';
import { KaBrandEmblem } from '@/components/brands/KaBrandSuite';
import { KaAiParticleOrb } from '@/components/brands/KaAiParticleOrb';
import { KA_CODEX_BOOKS } from '@/data/kaCodexBooks';

const FOLIO_SHOWCASE_BOOKS = [
  { book: KA_CODEX_BOOKS[0], rot: '-rotate-8 translate-y-3', z: 'z-10' },  // DDIA
  { book: KA_CODEX_BOOKS[1], rot: '-rotate-3 translate-y-0', z: 'z-20' },  // Clean Code
  { book: KA_CODEX_BOOKS[3], rot: 'rotate-3 -translate-y-1', z: 'z-30' },  // CLRS
  { book: KA_CODEX_BOOKS[11], rot: 'rotate-8 translate-y-3', z: 'z-20' },  // MIT SICP
];

/**
 * Kollabrix Homepage Showcase Section for KΛ ΛI & KΛ FOLIO:
 * Features the live 3D Particle Orb from KΛ ΛI and real fanned book covers from KΛ FOLIO.
 */
export function KaEcosystemShowcase() {
  return (
    <section
      id="ka-ecosystem"
      className="relative w-full bg-[#020306] border-t border-white/[0.06] py-20 sm:py-24 px-5 sm:px-8 lg:px-12 overflow-hidden"
    >
      {/* Subtle Architectural Blueprint Grid + Soft Dual Rim Light */}
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
        className="pointer-events-none absolute -bottom-24 right-1/4 w-[420px] h-[320px] rounded-full bg-slate-200/[0.06] blur-[110px]"
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
            <span className="bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              Zero friction.
            </span>
          </h2>

          <p className="pt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Standalone AI studio &amp; 12 coding volumes—built for speed and synced directly with your Kollabrix account.
          </p>
        </motion.div>

        {/* Interactive Dual Flagship Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: KΛ ΛI (with live 3D Particle Acoustic Orb from /ka-ai) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-[28px] bg-gradient-to-b from-[#070E20] via-[#050914] to-[#03050B] border border-white/12 hover:border-sky-400/45 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.88)] transition-colors"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[380px] h-[220px] rounded-full bg-sky-500/20 blur-[90px] group-hover:bg-sky-400/30 transition-colors duration-500"
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

              {/* Live 3D Particle Orb Stage (from /ka-ai) */}
              <div className="relative h-48 rounded-2xl bg-[#030712]/95 border border-white/[0.09] overflow-hidden flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(56,189,248,0.22),transparent_65%)]"
                />

                <KaAiParticleOrb
                  size={172}
                  onClick={() => window.open('/spark', '_blank', 'noopener,noreferrer')}
                />

                {/* Floating Telemetry Chips */}
                <div className="pointer-events-none absolute left-3 top-3 px-2.5 py-1 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/10 text-[10px] font-mono text-sky-200 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-sky-400" />
                  <span>Audit Repo</span>
                </div>
                <div className="pointer-events-none absolute right-3 top-3 px-2.5 py-1 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-cyan-300" />
                  <span>MVP Architect</span>
                </div>
                <div className="pointer-events-none absolute right-3 bottom-3 px-2.5 py-1 rounded-lg bg-white/[0.06] backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-sky-300" />
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
                style={{ backgroundColor: '#F4F3EF', color: '#07090E' }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:opacity-95 font-semibold text-xs transition-all shadow-[0_8px_24px_rgba(244,243,239,0.18)]"
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

          {/* CARD 2: KΛ FOLIO (with Real Fanned 3D Coding Book Covers) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="group relative rounded-[28px] bg-gradient-to-b from-[#131210] via-[#0B0A09] to-[#060605] border border-white/12 hover:border-zinc-300/40 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.88)] transition-colors"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 w-[380px] h-[220px] rounded-full bg-amber-400/12 blur-[90px] group-hover:bg-amber-300/20 transition-colors duration-500"
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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[10px] font-mono font-bold text-zinc-200">
                  <BookOpen className="w-3 h-3 text-amber-300" />
                  <span>12 VOLUMES · DARK</span>
                </span>
              </div>

              {/* Real Fanned 3D Coding Book Covers */}
              <div className="relative h-48 rounded-2xl bg-[#090807]/95 border border-white/[0.09] overflow-hidden flex items-center justify-center px-4">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(244,243,239,0.11),transparent_65%)]"
                />
                <div className="relative flex items-center justify-center -space-x-3 group-hover:space-x-1.5 transition-all duration-500">
                  {FOLIO_SHOWCASE_BOOKS.map(({ book, rot, z }) => (
                    <Link
                      key={book.id}
                      href={`/resources?section=books&book=${encodeURIComponent(book.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Read ${book.title}`}
                      className={`relative ${z} w-[76px] sm:w-[84px] aspect-[2/3] rounded-md overflow-hidden border border-white/25 bg-[#181613] shadow-[0_18px_36px_rgba(0,0,0,0.92)] transform ${rot} group-hover:rotate-0 group-hover:translate-y-0 hover:!scale-110 transition-all duration-500`}
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
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
                  <Layers className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span>12 Topic-Filtered Books</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
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
                style={{ backgroundColor: '#F4F3EF', color: '#07090E' }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:opacity-95 font-semibold text-xs transition-all shadow-[0_8px_24px_rgba(244,243,239,0.18)]"
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
