'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { FeaturedDeckCardConfig, DEFAULT_FEATURED_DECK_CARDS } from '@/types/masterControl';

// 90/10 Real Coder Discipline: uniform obsidian dark glass with 10% surgical laser accents
const CARD_ACCENTS = [
  {
    laser: 'via-violet-400/80',
    glow: 'rgba(139, 92, 246, 0.16)',
    ambient: '#8b5cf6',
    dot: 'bg-violet-400',
    coordText: 'text-violet-300/90',
  },
  {
    laser: 'via-sky-400/80',
    glow: 'rgba(56, 189, 248, 0.16)',
    ambient: '#38bdf8',
    dot: 'bg-sky-400',
    coordText: 'text-sky-300/90',
  },
  {
    laser: 'via-emerald-400/80',
    glow: 'rgba(52, 211, 153, 0.16)',
    ambient: '#34d399',
    dot: 'bg-emerald-400',
    coordText: 'text-emerald-300/90',
  },
  {
    laser: 'via-cyan-400/80',
    glow: 'rgba(34, 211, 238, 0.16)',
    ambient: '#22d3ee',
    dot: 'bg-cyan-400',
    coordText: 'text-cyan-300/90',
  },
  {
    laser: 'via-amber-400/80',
    glow: 'rgba(251, 191, 36, 0.16)',
    ambient: '#fbbf24',
    dot: 'bg-amber-400',
    coordText: 'text-amber-300/90',
  },
];

const SYNTAX_DOTS = ['bg-amber-400', 'bg-sky-400', 'bg-emerald-400'];

// Exact continuous loop durations per card:
// Card 1 -> 2: 3 sec
// Card 2 -> 3: 2 sec
// Card 3 -> 4: 3 sec
// Card 4 -> 5: 3 sec
// Card 5 -> 1: 1 sec
const CARD_INTERVALS_MS = [
  3000, // 1 to 2 after 3 sec
  2000, // 2 to 3 after 2 sec
  3000, // 3 to 4 after 3 sec
  3000, // 4 to 5 after 3 sec
  1000, // 5 to 1 after 1 sec
];

export function FloatingProjectRibbon() {
  const [cards, setCards] = useState<FeaturedDeckCardConfig[]>(DEFAULT_FEATURED_DECK_CARDS);
  const [activeIndex, setActiveIndex] = useState<number>(0); // Start at Card 01
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);
  const touchStartXRef = useRef<number>(0);

  // Fetch dynamic deck configuration from Admin Master Control
  useEffect(() => {
    let isMounted = true;
    fetch('/api/master-control', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (
          isMounted &&
          data?.config?.featuredDeckCards &&
          Array.isArray(data.config.featuredDeckCards) &&
          data.config.featuredDeckCards.length === 5
        ) {
          setCards(data.config.featuredDeckCards);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const totalCards = cards.length;

  const nextCard = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const prevCard = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const goToCard = (index: number) => {
    setActiveIndex((index + totalCards) % totalCards);
  };

  // Continuous auto-rotation loop matching exact sequence:
  // 1 -> 2 (20s) -> 3 (17s) -> 4 (19s) -> 5 (22s) -> 1 (18s) continuously
  useEffect(() => {
    const duration = CARD_INTERVALS_MS[activeIndex % CARD_INTERVALS_MS.length] || 20000;
    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
    }, duration);

    return () => clearTimeout(timer);
  }, [activeIndex, totalCards]);

  // Keyboard navigation when user interacts with carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHovered) return;
      if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, nextCard, prevCard]);

  // Mouse wheel scroll to rotate 3D carousel smoothly
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 260) return;
    if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20) {
      lastWheelTimeRef.current = now;
      if (e.deltaX > 20 || e.deltaY > 20) {
        nextCard();
      } else {
        prevCard();
      }
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextCard();
      } else {
        prevCard();
      }
    }
  };

  const currentAccent = CARD_ACCENTS[activeIndex % CARD_ACCENTS.length];

  return (
    <section
      className="relative z-20 pt-12 pb-18 sm:pt-16 sm:pb-22 border-t border-b border-white/[0.06] bg-[#05070B] overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ============================================================== */}
      {/* AMBIENT SURGICAL GLOWS (Subtle 10% Ray-Traced Atmosphere) */}
      {/* ============================================================== */}
      <div
        style={{
          background: `radial-gradient(ellipse 70% 30% at 50% 0%, ${currentAccent.ambient}1F, transparent 75%)`,
        }}
        className="absolute top-0 inset-x-0 h-40 pointer-events-none transition-all duration-700 blur-2xl"
      />
      <div
        style={{
          background: `radial-gradient(ellipse 70% 30% at 50% 100%, ${currentAccent.ambient}14, transparent 75%)`,
        }}
        className="absolute bottom-0 inset-x-0 h-40 pointer-events-none transition-all duration-700 blur-2xl"
      />

      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white/[0.08] text-white border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-ping inline-block" />
              <span>Live Campus Squads</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading">
              Active Projects Building Right Now
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
              Join active collegiate teams or recruit teammates for upcoming hackathons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] text-xs sm:text-sm font-semibold text-white transition-all group self-start sm:self-auto cursor-pointer"
            >
              <span>Explore All 40+ Projects</span>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3D REVOLVING CURVED CAROUSEL (Compact Medium Footprint) */}
        {/* ============================================================== */}
        <div className="relative w-full h-[455px] sm:h-[490px] flex items-center justify-center [perspective:1400px]">
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevCard}
            aria-label="Previous Project"
            className="absolute left-2 sm:left-6 z-40 w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextCard}
            aria-label="Next Project"
            className="absolute right-2 sm:right-6 z-40 w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Stage */}
          <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
            {cards.map((card, index) => {
              // Calculate shortest circular difference from active card (-2, -1, 0, 1, 2)
              let diff = (index - activeIndex) % totalCards;
              if (diff > totalCards / 2) diff -= totalCards;
              if (diff < -totalCards / 2) diff += totalCards;

              const isCenter = diff === 0;
              const isAdjacent = Math.abs(diff) === 1;
              const isFar = Math.abs(diff) === 2;

              // Hide cards beyond 2 steps away
              if (Math.abs(diff) > 2) return null;

              // 3D Geometry calibrated to comfortable medium scale:
              let translateX = 0;
              let rotateY = 0;
              let scale = 1;
              let opacity = 1;
              let zIndex = 30;

              if (diff === -1) {
                translateX = -310;
                rotateY = 48;
                scale = 0.90;
                opacity = 0.85;
                zIndex = 20;
              } else if (diff === 1) {
                translateX = 310;
                rotateY = -48;
                scale = 0.90;
                opacity = 0.85;
                zIndex = 20;
              } else if (diff === -2) {
                translateX = -525;
                rotateY = 62;
                scale = 0.76;
                opacity = 0.35;
                zIndex = 10;
              } else if (diff === 2) {
                translateX = 525;
                rotateY = -62;
                scale = 0.76;
                opacity = 0.35;
                zIndex = 10;
              }

              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
              const slug = (card.title || 'project')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .slice(0, 18);

              return (
                <motion.div
                  key={card.id || card.number}
                  animate={{
                    x: translateX,
                    rotateY: rotateY,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 28,
                    mass: 0.8,
                  }}
                  onClick={() => {
                    if (!isCenter) {
                      goToCard(index);
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
                  }}
                  className={`group/card absolute w-[295px] sm:w-[335px] md:w-[365px] h-[415px] sm:h-[450px] rounded-[22px] overflow-hidden cursor-pointer select-none [transform-style:preserve-3d] will-change-transform ${
                    isCenter ? 'p-[2px] bg-white/20 pointer-events-auto' : 'pointer-events-auto hover:opacity-95'
                  }`}
                  style={{
                    boxShadow: isCenter
                      ? `0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 28px rgba(226, 232, 240, 0.22), 0 0 36px ${accent.glow}`
                      : '0 20px 45px -15px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {/* Animated Traveling Silver Glowing Border Line (Active Front Card Only) */}
                  {isCenter && (
                    <motion.div
                      aria-hidden="true"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-[120%] pointer-events-none z-0"
                      style={{
                        background:
                          'conic-gradient(from 0deg, transparent 0deg, transparent 245deg, rgba(148,163,184,0.35) 280deg, rgba(255,255,255,1) 318deg, rgba(226,232,240,0.95) 338deg, transparent 360deg)',
                      }}
                    />
                  )}

                  {/* 90% Obsidian / Carbon Dark Glass Substrate */}
                  <div
                    className={`relative z-10 w-full h-full p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-[#0f141e] via-[#0a0d14] to-[#07090e] text-white overflow-hidden backdrop-blur-2xl ${
                      isCenter
                        ? 'rounded-[20px]'
                        : 'rounded-[22px] border-[1.5px] border-white/[0.16] border-t-white/30'
                    }`}
                  >
                    {/* Subtle micro-grid mesh + Cursor-reactive ray-traced spotlight */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.04]"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          'radial-gradient(240px circle at var(--mx, 50%) var(--my, 30%), rgba(255,255,255,0.07), transparent 70%)',
                      }}
                    />

                    {/* 10% Surgical Accent: 1px Laser Edge on Top */}
                    <div
                      className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${accent.laser} to-transparent`}
                    />

                    {/* TOP TERMINAL HEADER BAR */}
                    <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                      <span className="text-[10px] font-mono text-slate-500 truncate">
                        ~/squads/{slug}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-white/15" />
                        <span className="w-2 h-2 rounded-full bg-white/15" />
                        <span className={`w-2 h-2 rounded-full ${accent.dot} opacity-75`} />
                      </div>
                    </div>

                    {/* ENGINEERING COORDINATE + STATUS BEACON */}
                    <div className="relative z-10 flex items-center justify-between gap-2 pt-2.5">
                      <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${accent.coordText}`}>
                        {card.number} // {card.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 bg-white/[0.04] border border-white/[0.08]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                        <span>{card.recruitingBadge}</span>
                      </span>
                    </div>

                    {/* CENTER CONTENT: Title, Institution & Terminal Spec Block */}
                    <div className="relative z-10 my-auto space-y-3 py-2 text-left">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading line-clamp-1">
                          {card.title}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                          <span className="text-slate-500">@</span>
                          <span className="line-clamp-1">{card.college}</span>
                        </p>
                      </div>

                      {/* IDE Terminal Snippet Box */}
                      <div className="p-2.5 sm:p-3 rounded-xl bg-black/50 border border-white/[0.07] font-mono text-[10.5px] sm:text-[11px] space-y-1.5 shadow-inner">
                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                          <span className="text-emerald-400 select-none">$</span>
                          <span className="text-slate-200 truncate">
                            git checkout -b squad/{slug}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed line-clamp-2 font-sans text-[11.5px]">
                          {card.description}
                        </p>
                        <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-500">
                          <span>branch: main</span>
                          <span className="text-slate-300 font-semibold">{card.teamJoined}</span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM BAR: Syntax Tech Tags & Titanium Inspect CTA */}
                    <div className="relative z-10 pt-2.5 border-t border-white/[0.07] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        {card.tags.slice(0, 2).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9.5px] font-mono bg-white/[0.04] border border-white/[0.08] text-slate-300"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                SYNTAX_DOTS[tIdx % SYNTAX_DOTS.length]
                              }`}
                            />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={card.href || `/projects/${card.id}`}
                        onClick={(e) => {
                          if (!isCenter) {
                            e.preventDefault();
                            goToCard(index);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-gradient-to-r from-slate-100 to-slate-300 text-slate-950 hover:from-white hover:to-slate-200 border border-white/40 shadow-sm transition-all duration-200 active:scale-95 shrink-0 group/btn"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Pills (01, 02, 03, 04, 05) */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {cards.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToCard(idx)}
              aria-label={`Jump to project ${c.number}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx
                  ? 'w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]'
                  : 'w-2 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
