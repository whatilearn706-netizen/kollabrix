'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowUpRight, BookOpen, Compass, Play, Sparkles, Youtube } from 'lucide-react';
import { KA_CODEX_BOOKS, type CodingBook } from '@/data/kaCodexBooks';

interface VideoTopicItem {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  duration: string;
  topicTag: string;
}

const FEATURED_YOUTUBE_TOPICS: VideoTopicItem[] = [
  {
    id: 'graphs-dp',
    youtubeId: 'tWVWeAqZ0WU',
    title: 'Graphs, BFS/DFS Shortest Paths & Dynamic Programming',
    channel: 'KΛ Algorithms Lab',
    duration: '46m',
    topicTag: 'Algorithms',
  },
  {
    id: 'sys-java',
    youtubeId: '9SGDpanrc8U',
    title: 'Spring Boot Backend Architecture & Virtual Concurrency',
    channel: 'KΛ Systems Core',
    duration: '44m',
    topicTag: 'Distributed Systems',
  },
  {
    id: 'py-fastapi',
    youtubeId: '7t2alSnE2-I',
    title: 'Async Python FastAPI & Structured LLM Pipelines',
    channel: 'KΛ Backend Track',
    duration: '39m',
    topicTag: 'Python & APIs',
  },
  {
    id: 'ts-nextjs',
    youtubeId: '30LWjhZzg50',
    title: 'TypeScript Type Systems, Interfaces & Production Patterns',
    channel: 'KΛ Web Studio',
    duration: '41m',
    topicTag: 'TypeScript',
  },
];

const BEST_TOPICS = [
  { label: 'Distributed Systems & LSM-Trees', meta: 'DDIA • Ch. 01–03' },
  { label: 'Graphs, BFS, Dijkstra & DP', meta: 'CLRS • Grokking' },
  { label: 'Clean SOLID & Dependency Rules', meta: 'Clean Architecture' },
  { label: 'Safe Refactoring & Code Smells', meta: 'Martin Fowler' },
  { label: 'Two Pointers, Hashing & Sliding Window', meta: 'CTCI • 189 Qs' },
  { label: 'Closures, Streams & Interpreters', meta: 'MIT SICP' },
];

/**
 * Section 2 Spotlight Stage:
 * On scroll, a featured "Best Book" flies diagonally down into the stage, shifts left & opens
 * as a 3D dark hardcover spread while YouTube masterclasses & top coding topics appear on the right.
 */
export function KaCodexSpotlightStage() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const spotlightChoices: CodingBook[] = [
    KA_CODEX_BOOKS[0], // DDIA
    KA_CODEX_BOOKS[1], // Clean Code
    KA_CODEX_BOOKS[4], // Grokking Algorithms
    KA_CODEX_BOOKS[3], // CLRS
  ];

  const [selectedSpotIdx, setSelectedSpotIdx] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<VideoTopicItem>(FEATURED_YOUTUBE_TOPICS[0]);

  const activeBook = spotlightChoices[selectedSpotIdx] || KA_CODEX_BOOKS[0];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // 1) Book flight trajectory: starts high/center tilted in flight, glides down-left and settles flat
  const flightY = useTransform(scrollYProgress, [0, 0.55, 1], [-140, -18, 0]);
  const flightX = useTransform(scrollYProgress, [0, 0.55, 1], [140, 28, 0]);
  const flightScale = useTransform(scrollYProgress, [0, 0.65, 1], [0.76, 0.96, 1]);
  const bookRotateZ = useTransform(scrollYProgress, [0, 0.6, 1], [-14, -4, 0]);

  // 2) Cover swings open (0deg closed -> -168deg open) as it lands on the left
  const coverRotateY = useTransform(scrollYProgress, [0.35, 0.85], [0, -168]);
  const coverOpacity = useTransform(scrollYProgress, [0.35, 0.78, 0.9], [1, 0.85, 0]);

  // 3) Right-side YouTube + Best Topics fades & slides in smoothly right after book settles
  const rightX = useTransform(scrollYProgress, [0.45, 1], [48, 0]);
  const rightOpacity = useTransform(scrollYProgress, [0.4, 0.92], [0, 1]);

  return (
    <section
      id="spotlight-stage"
      ref={sectionRef}
      className="relative z-20 w-full py-20 sm:py-28 px-5 sm:px-9 lg:px-14 bg-gradient-to-b from-[#121110] via-[#151412] to-[#100F0E] border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Stage Header + Spotlight Book Switcher */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-[#A8A196]">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>FEATURED FLIGHT SPREAD</span>
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#F4F3EF] mt-3">
              Open the volume. Watch &amp; practice.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {spotlightChoices.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedSpotIdx(idx)}
                className={`px-3 py-1.5 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
                  idx === selectedSpotIdx
                    ? 'bg-[#F4F3EF] text-[#141311] font-bold'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-[#A8A196] border border-white/10'
                }`}
              >
                {b.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Split Layout: Left Flying & Opening Book | Right YouTube + Best Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* LEFT: Scroll-Animated Flying Best Book -> Pin 5uxp06P57 Open Bound Notebook */}
          <div style={{ perspective: '1650px' }} className="lg:col-span-6 relative">
            <motion.div
              style={{
                x: flightX,
                y: flightY,
                scale: flightScale,
                rotateZ: bookRotateZ,
              }}
              className="relative"
            >
              {/* Soft Ambient Overhead Desk Shadow (pin.it/5uxp06P57 flat-lay silhouette) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 rounded-[28px] bg-black/70 blur-2xl opacity-90"
              />

              {/* Outer Bound Hardcover Shell (peeks slightly around rounded page block corners) */}
              <div
                style={{
                  background: `linear-gradient(155deg, ${activeBook.spineColor} 0%, #161412 48%, #0E0D0B 100%)`,
                }}
                className="relative rounded-[22px] p-[6px] sm:p-[8px] shadow-[0_34px_85px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.12)] border border-white/[0.12]"
              >
                {/* Layered Stacked Paper Edges underneath the Open Spread (left/right/bottom thickness) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[5px] sm:inset-[7px] rounded-[16px] border-x-[4px] border-b-[5px] border-[#2B2722] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-[7px] sm:inset-[9px] rounded-[14px] border-x-[2px] border-b-[3px] border-[#38332C]"
                />

                {/* Open Bound Two-Page Spread matching pin.it/5uxp06P57 curvature & center V-notches */}
                <div className="relative grid grid-cols-1 sm:grid-cols-2 rounded-[15px] overflow-hidden bg-[#181613] shadow-[inset_0_0_24px_rgba(0,0,0,0.65)]">
                  {/* Top & Bottom Center Spine V-Notches (headband / tailband indentation) */}
                  <div
                    aria-hidden="true"
                    className="hidden sm:block pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-30 w-8 h-3"
                    style={{
                      background: `linear-gradient(180deg, ${activeBook.spineColor} 0%, #090807 100%)`,
                      clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="hidden sm:block pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 z-30 w-8 h-3"
                    style={{
                      background: `linear-gradient(0deg, ${activeBook.spineColor} 0%, #090807 100%)`,
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                    }}
                  />

                  {/* Deep Central Spine Crease & Arching Inner Page Shadow (pin.it/5uxp06P57) */}
                  <div
                    aria-hidden="true"
                    className="hidden sm:block pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-14 z-10"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 22%, rgba(0,0,0,0.68) 47%, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.62) 53%, rgba(0,0,0,0.18) 78%, rgba(0,0,0,0) 100%)',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="hidden sm:block pointer-events-none absolute inset-y-3 left-1/2 -translate-x-1/2 w-px z-20 bg-white/[0.07]"
                  />

                  {/* Animated Swinging Hardcover Front Flap that swings open cleanly from the spine */}
                  <motion.div
                    style={{
                      rotateY: coverRotateY,
                      opacity: coverOpacity,
                      transformOrigin: 'left center',
                      backfaceVisibility: 'hidden',
                    }}
                    className="hidden sm:flex pointer-events-none absolute inset-y-0 left-1/2 right-0 z-30 bg-[#181614] border-l border-white/15 rounded-r-[14px] overflow-hidden shadow-2xl"
                  >
                    <img
                      src={activeBook.coverUrl}
                      alt={activeBook.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                  </motion.div>

                  {/* Left Bound Page: Curved Paper Highlight + Cover Plate + Metadata */}
                  <div
                    style={{
                      background:
                        'linear-gradient(90deg, #161411 0%, #211E1A 16%, #1D1A17 72%, #13110F 94%, #0B0A09 100%)',
                    }}
                    className="relative p-5 sm:p-6 pr-6 sm:pr-7 border-b sm:border-b-0 border-white/[0.06] flex flex-col justify-between gap-4 min-h-[360px]"
                  >
                    {/* Left Outer Page-Stack Ridges */}
                    <div
                      aria-hidden="true"
                      className="hidden sm:block pointer-events-none absolute inset-y-2 left-0 w-1.5 opacity-60"
                      style={{
                        background:
                          'repeating-linear-gradient(90deg, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 1px, transparent 1px, transparent 2px)',
                      }}
                    />

                    <div className="space-y-4 relative z-[2]">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#8C867E]">
                        <span>{activeBook.category}</span>
                        <span>VOL. {String(activeBook.index).padStart(2, '0')}</span>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <img
                          src={activeBook.coverUrl}
                          alt={activeBook.title}
                          className="w-20 aspect-[2/3] rounded object-cover border border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.75)] shrink-0 bg-[#121110]"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base text-[#F4F3EF] leading-snug">
                            {activeBook.title}
                          </h3>
                          <p className="font-mono text-[11px] text-[#A8A196] mt-1">
                            {activeBook.author}
                          </p>
                          <p className="font-mono text-[10px] text-[#6E6962] mt-0.5">
                            {activeBook.pages} pages &bull; {activeBook.year}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-[#C7C1B7] leading-relaxed">
                        {activeBook.tagline}
                      </p>
                    </div>

                    <div className="relative z-[2] pt-3 border-t border-white/[0.07] flex items-center justify-between text-[10px] font-mono text-[#6E6962]">
                      <span>KΛ CODEX SPREAD</span>
                      <span>p. 02</span>
                    </div>
                  </div>

                  {/* Right Bound Page: Arching Studio Light + Key Chapter Insight + KΛ Resources CTA */}
                  <div
                    style={{
                      background:
                        'linear-gradient(90deg, #0B0A09 0%, #13110F 7%, #1B1815 26%, #201D19 84%, #161411 100%)',
                    }}
                    className="relative p-5 sm:p-6 pl-6 sm:pl-7 flex flex-col justify-between gap-4 min-h-[360px]"
                  >
                    {/* Right Outer Page-Stack Ridges */}
                    <div
                      aria-hidden="true"
                      className="hidden sm:block pointer-events-none absolute inset-y-2 right-0 w-1.5 opacity-60"
                      style={{
                        background:
                          'repeating-linear-gradient(90deg, transparent 0px, transparent 1px, rgba(255,255,255,0.09) 1px, rgba(255,255,255,0.09) 2px)',
                      }}
                    />

                    <div className="space-y-3 relative z-[2]">
                      <span
                        style={{ color: activeBook.accentHex }}
                        className="font-mono text-[10px] uppercase tracking-[0.2em]"
                      >
                        CH. 01 &bull; {activeBook.chapters[0]?.title}
                      </span>
                      <p className="text-xs text-[#D6D1C7] leading-relaxed">
                        {activeBook.chapters[0]?.summary}
                      </p>

                      <ul className="space-y-1.5 pt-1">
                        {activeBook.chapters[0]?.takeaways.slice(0, 3).map((pt) => (
                          <li key={pt} className="text-[11px] text-[#E5E0D7] flex items-start gap-2">
                            <span
                              style={{ backgroundColor: activeBook.accentHex }}
                              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="relative z-[2] pt-3 border-t border-white/[0.07] flex items-center justify-between gap-2">
                      <Link
                        href={`/resources?book=${encodeURIComponent(activeBook.id)}`}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full bg-[#F4F3EF] hover:bg-white text-[#141311] font-mono text-[10px] font-bold transition-all shadow-md"
                      >
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span>KΛ Resources</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                      </Link>
                      <span className="font-mono text-[10px] text-[#6E6962] whitespace-nowrap shrink-0">
                        p. 03
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: YouTube Video Masterclass + Best Coding Topics */}
          <motion.div
            style={{ x: rightX, opacity: rightOpacity }}
            className="lg:col-span-6 space-y-5"
          >
            {/* Interactive YouTube Video Player */}
            <div className="rounded-2xl bg-[#181614] border border-white/[0.1] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.08] bg-[#131210]">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] text-[#F4F3EF] font-semibold">
                  <Youtube className="w-4 h-4 text-rose-400" />
                  <span>{selectedVideo.topicTag} Video Lecture</span>
                </span>
                <span className="font-mono text-[10px] text-[#8C867E]">
                  {selectedVideo.channel} &bull; {selectedVideo.duration}
                </span>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <iframe
                  key={selectedVideo.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?rel=0&modestbranding=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Switchable Video Lesson Pills */}
              <div className="p-3 bg-[#121110] border-t border-white/[0.07] grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEATURED_YOUTUBE_TOPICS.map((vid) => {
                  const active = vid.id === selectedVideo.id;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setSelectedVideo(vid)}
                      className={`text-left px-3 py-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-2.5 ${
                        active
                          ? 'bg-[#F4F3EF] text-[#141311] border-[#F4F3EF] font-semibold'
                          : 'bg-white/[0.03] hover:bg-white/[0.07] text-[#C7C1B7] border-white/[0.08]'
                      }`}
                    >
                      <Play className="w-3 h-3 shrink-0" />
                      <span className="truncate">{vid.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Best Coding Topics Grid (links straight to /resources) */}
            <div className="rounded-2xl bg-[#161513] border border-white/[0.08] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#A8A196]">
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>BEST CODING TOPICS &amp; PLAYBOOKS</span>
                </span>
                <Link
                  href="/resources"
                  className="font-mono text-[11px] text-[#E5E0D7] hover:text-white inline-flex items-center gap-1"
                >
                  <span>Explore All</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BEST_TOPICS.map((topic) => (
                  <Link
                    key={topic.label}
                    href="/resources"
                    className="group px-3.5 py-2.5 rounded-xl bg-[#11100E] hover:bg-[#1E1C19] border border-white/[0.07] hover:border-white/25 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#F4F3EF] truncate">
                        {topic.label}
                      </p>
                      <p className="font-mono text-[10px] text-[#8C867E]">{topic.meta}</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#8C867E] group-hover:text-white shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
