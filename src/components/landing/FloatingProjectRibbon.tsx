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

// Vibrant chromatic mesh gradients matching the Pinterest reference video
const CARD_PALETTES = [
  {
    // Card 01: Deep Electric Violet / Magenta / Indigo (matches "v2.0" video card)
    bg: 'from-[#8b5cf6] via-[#6d28d9] to-[#1e113a]',
    glow: 'rgba(168, 85, 247, 0.55)',
    ambient: '#9333ea',
    ring: '#c084fc',
    badge: 'border-violet-400/40 bg-violet-500/20 text-violet-200',
  },
  {
    // Card 02: Platinum Chrome / Cyber Opal / Sky Cyan
    bg: 'from-[#38bdf8] via-[#0284c7] to-[#0c1f38]',
    glow: 'rgba(56, 189, 248, 0.55)',
    ambient: '#0284c7',
    ring: '#7dd3fc',
    badge: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-200',
  },
  {
    // Card 03: Sun Gold / Lime Green / Emerald (matches "95th" video card)
    bg: 'from-[#eab308] via-[#16a34a] to-[#064e3b]',
    glow: 'rgba(234, 179, 8, 0.55)',
    ambient: '#16a34a',
    ring: '#fde047',
    badge: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
  },
  {
    // Card 04: Deep Royal Blue / Ice Azure (matches "25%" video card)
    bg: 'from-[#3b82f6] via-[#1d4ed8] to-[#091533]',
    glow: 'rgba(59, 130, 246, 0.55)',
    ambient: '#2563eb',
    ring: '#93c5fd',
    badge: 'border-blue-400/40 bg-blue-500/20 text-blue-200',
  },
  {
    // Card 05: Crimson Red / Blood Orange / Deep Amber (matches "720" video card)
    bg: 'from-[#ef4444] via-[#b91c1c] to-[#2d080a]',
    glow: 'rgba(239, 68, 68, 0.55)',
    ambient: '#dc2626',
    ring: '#fca5a5',
    badge: 'border-rose-400/40 bg-rose-500/20 text-rose-200',
  },
];

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

  const currentPalette = CARD_PALETTES[activeIndex % CARD_PALETTES.length];

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
      {/* AMBIENT CHROMATIC HORIZONTAL GLOWS (Matching Pinterest Video) */}
      {/* ============================================================== */}
      <div
        style={{
          background: `radial-gradient(ellipse 70% 30% at 50% 0%, ${currentPalette.ambient}33, transparent 75%)`,
        }}
        className="absolute top-0 inset-x-0 h-40 pointer-events-none transition-all duration-700 blur-2xl"
      />
      <div
        style={{
          background: `radial-gradient(ellipse 70% 30% at 50% 100%, ${currentPalette.ambient}26, transparent 75%)`,
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
        {/* 3D REVOLVING CURVED CAROUSEL (Built exactly like Pinterest ref)*/}
        {/* ============================================================== */}
        <div className="relative w-full h-[540px] sm:h-[580px] flex items-center justify-center [perspective:1400px]">
          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevCard}
            aria-label="Previous Project"
            className="absolute left-2 sm:left-6 z-40 w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={nextCard}
            aria-label="Next Project"
            className="absolute right-2 sm:right-6 z-40 w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
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

              // 3D Geometry matching the Pinterest reference video:
              // - Center card: flat facing front, scale 1.0, zIndex 30
              // - Left card (diff -1): curved outward rotateY(52deg), translateX(-340px), scale 0.88, zIndex 20
              // - Right card (diff 1): curved outward rotateY(-52deg), translateX(340px), scale 0.88, zIndex 20
              // - Far cards (diff +-2): rotateY(68deg), translateX(+-560px), scale 0.72, zIndex 10
              let translateX = 0;
              let rotateY = 0;
              let scale = 1;
              let opacity = 1;
              let zIndex = 30;

              if (diff === -1) {
                translateX = -340;
                rotateY = 52;
                scale = 0.88;
                opacity = 0.78;
                zIndex = 20;
              } else if (diff === 1) {
                translateX = 340;
                rotateY = -52;
                scale = 0.88;
                opacity = 0.78;
                zIndex = 20;
              } else if (diff === -2) {
                translateX = -560;
                rotateY = 68;
                scale = 0.72;
                opacity = 0.25;
                zIndex = 10;
              } else if (diff === 2) {
                translateX = 560;
                rotateY = -68;
                scale = 0.72;
                opacity = 0.25;
                zIndex = 10;
              }

              const palette = CARD_PALETTES[index % CARD_PALETTES.length];

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
                  className={`absolute w-[300px] sm:w-[350px] md:w-[380px] h-[480px] sm:h-[510px] rounded-[32px] overflow-hidden cursor-pointer select-none [transform-style:preserve-3d] will-change-transform ${
                    isCenter ? 'pointer-events-auto' : 'pointer-events-auto hover:opacity-95'
                  }`}
                  style={{
                    boxShadow: isCenter
                      ? `0 35px 80px -15px rgba(0, 0, 0, 0.95), 0 0 50px ${palette.glow}`
                      : '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
                  }}
                >
                  {/* Outer Card Body with Vibrant Gradient (Matching Pinterest) */}
                  <div
                    className={`relative w-full h-full p-6 sm:p-7 flex flex-col justify-between bg-gradient-to-br ${palette.bg} border border-white/20 text-white rounded-[32px] overflow-hidden backdrop-blur-2xl`}
                  >
                    {/* Chromatic Noise / Glass Refraction Overlay */}
                    <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40 mix-blend-overlay" />
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                    {/* TOP BAR: Category & Recruiting Pill */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-black/40 border border-white/20 text-white backdrop-blur-md">
                        {card.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-white bg-black/35 border border-white/15 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        {card.recruitingBadge}
                      </span>
                    </div>

                    {/* CENTER HERO: Futuristic Radial Meter Dial (Exactly like the Pinterest 95th/720 video) */}
                    <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
                      {/* Radial Tick Dial with Project Number */}
                      <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 mb-3">
                        {/* Circular Radial Ticks SVG */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                          {/* Radial dash ring */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.25)"
                            strokeWidth="4"
                            strokeDasharray="2 6"
                          />
                          {/* Vibrant Accent Arc */}
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={palette.ring}
                            strokeWidth="4"
                            strokeDasharray="240"
                            strokeDashoffset="70"
                            strokeLinecap="round"
                            className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          />
                        </svg>

                        {/* Center Metric Typography */}
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-4xl sm:text-5xl font-black font-heading text-white tracking-tighter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                            {card.number}
                          </span>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-white/80 font-semibold mt-0.5">
                            CIRCUIT
                          </span>
                        </div>
                      </div>

                      {/* Project Title & College */}
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-heading drop-shadow-md line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-white/85 mt-1 flex items-center gap-1">
                        <span>🏛️</span>
                        <span className="line-clamp-1">{card.college}</span>
                      </p>

                      {/* Description */}
                      <p className="text-xs sm:text-[13px] text-white/75 mt-2.5 max-w-[280px] line-clamp-2 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* BOTTOM BAR: Tags & Interactive CTA */}
                    <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {card.tags.slice(0, 2).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/30 border border-white/15 text-white/90"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="text-[11px] font-mono text-white/70 ml-1">
                          {card.teamJoined}
                        </span>
                      </div>

                      <Link
                        href={card.href || `/projects/${card.id}`}
                        onClick={(e) => {
                          if (!isCenter) {
                            e.preventDefault();
                            goToCard(index);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-200 active:scale-95 group/btn"
                      >
                        <span>Explore</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
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
