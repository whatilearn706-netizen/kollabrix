'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  Play,
  Terminal,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Search,
  CheckCircle2,
  Code2,
  Layers,
  Zap,
  ArrowRight,
  ShieldCheck,
  Laptop,
} from 'lucide-react';
import { LanguageCurriculum } from '@/types/curriculum';
import { ResourceTrack } from '@/types/resources';
import { Button } from '@/components/ui/Button';

interface CircularSkillsShowcaseProps {
  skills: LanguageCurriculum[];
  selectedTrack: ResourceTrack;
  onSelectSkill: (curriculumId: string) => void;
  onSwitchTrack: (newTrack: ResourceTrack) => void;
  onBackToLevelSelect: () => void;
}

export function CircularSkillsShowcase({
  skills,
  selectedTrack,
  onSelectSkill,
  onSwitchTrack,
  onBackToLevelSelect,
}: CircularSkillsShowcaseProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAdjustingScroll = useRef(false);

  // Filter skills based on search query
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;
    const q = searchQuery.toLowerCase();
    return skills.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q)
    );
  }, [skills, searchQuery]);

  // Triplicate skills list for seamless circular infinite scroll
  // If list is small (e.g. <= 3), replicate 4x so there's always ample height to loop smoothly
  const repeatCount = filteredSkills.length <= 2 ? 4 : 3;
  const loopItems = useMemo(() => {
    if (filteredSkills.length === 0) return [];
    let items: Array<{ item: LanguageCurriculum; loopKey: string }> = [];
    for (let r = 0; r < repeatCount; r++) {
      items = items.concat(
        filteredSkills.map((s, idx) => ({
          item: s,
          loopKey: `${s.id}-rep-${r}-${idx}`,
        }))
      );
    }
    return items;
  }, [filteredSkills, repeatCount]);

  // Initialize scroll position in the center batch so user can scroll both up and down immediately
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || filteredSkills.length === 0) return;

    const timer = setTimeout(() => {
      const singleSetHeight = el.scrollHeight / repeatCount;
      el.scrollTop = singleSetHeight;
    }, 50);

    return () => clearTimeout(timer);
  }, [filteredSkills.length, repeatCount]);

  // Continuous Circular Infinite Loop logic
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || isAdjustingScroll.current || filteredSkills.length === 0) return;

    const totalHeight = el.scrollHeight;
    const singleSetHeight = totalHeight / repeatCount;
    const currentScroll = el.scrollTop;

    // If scrolled past 2 sets, jump back to 1 set (seamless circular wrap)
    if (currentScroll >= singleSetHeight * (repeatCount - 1) - 20) {
      isAdjustingScroll.current = true;
      el.scrollTop = currentScroll - singleSetHeight;
      setTimeout(() => {
        isAdjustingScroll.current = false;
      }, 20);
    }
    // If scrolled up past the first set, jump forward to 1 set
    else if (currentScroll <= 20) {
      isAdjustingScroll.current = true;
      el.scrollTop = currentScroll + singleSetHeight;
      setTimeout(() => {
        isAdjustingScroll.current = false;
      }, 20);
    }
  };

  // Isolate wheel scrolling: rolling the wheel over the right side scrolls ONLY this container, not the whole window!
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent parent window from scrolling while cursor is inside this circular container
      e.preventDefault();
      e.stopPropagation();
      el.scrollTop += e.deltaY;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Nudge Up / Down buttons
  const scrollByAmount = (direction: 'up' | 'down') => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = direction === 'down' ? 240 : -240;
    el.scrollBy({ top: delta, behavior: 'smooth' });
  };

  const isBeginner = selectedTrack === 'beginner';

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Switch Level Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/80 px-5 py-3 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLevelSelect}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>All Learning Tracks</span>
          </button>
          <span className="text-slate-600">/</span>
          <div className="flex items-center gap-2">
            <span className="text-base">{isBeginner ? '🐣' : '🚀'}</span>
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              {isBeginner ? 'Beginner Path' : 'Active Learner Path'}
            </span>
          </div>
        </div>

        {/* Quick Toggle to Other Level */}
        <button
          onClick={() => onSwitchTrack(isBeginner ? 'learning' : 'beginner')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 text-xs font-mono transition-colors flex items-center gap-2"
        >
          <span>Switch to {isBeginner ? 'Active Learner Track (Advanced)' : 'Beginner Track (Basics)'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* THE HERO PURPLE RECTANGLE (Inspired by Image 1: Dribbble Podcast App UI Kit) */}
      <div className="relative rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-[#4f3ff0] via-[#3b2ad9] to-[#2517a8] border border-white/20 shadow-2xl shadow-indigo-950/70 overflow-hidden text-white">
        {/* Ambient Glow Orbs inside container */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-400/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px] relative z-10">
          {/* ==================================================== */}
          {/* LEFT SIDE: Brand, Typography, Checklist & Track Info */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 space-y-8 bg-indigo-950/20 backdrop-blur-[2px]">
            <div className="space-y-6">
              {/* White Pill Badge matching Image 1 */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-indigo-900 text-xs font-extrabold tracking-wide shadow-md">
                <span className="text-base">{isBeginner ? '🔑' : '⚡'}</span>
                <span>{isBeginner ? "Beginner's UI Kit" : "Engineer's Tech Studio"}</span>
              </div>

              {/* Bold Hero Typography matching Image 1 */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08] text-white">
                  {isBeginner ? (
                    <>
                      Beginner&apos;s
                      <br />
                      <span className="text-amber-300">Coding Kit</span>
                    </>
                  ) : (
                    <>
                      Active Learner&apos;s
                      <br />
                      <span className="text-cyan-300">Skill Studio</span>
                    </>
                  )}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100/90 font-medium pt-2 leading-relaxed">
                  {isBeginner
                    ? 'Start from ground zero. Guided lectures, real-time code sandboxes, and auto-checked practice problems to become a confident developer.'
                    : 'Master production frameworks, high-throughput backend services, graph algorithms, and technical placement challenges.'}
                </p>
              </div>

              {/* Bullet Features Checklist matching Image 1 */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-50 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span>Structured Zero-to-Hero Steps</span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-50 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span>High-Yield Video Lectures per Step</span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-50 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span>Instant In-Browser Code Sandboxes</span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-50 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span>Auto-Checked Practice Challenges</span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-50 font-medium">
                  <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span>Collegiate Milestone Progression</span>
                </div>
              </div>
            </div>

            {/* Bottom Compatibility Pill matching Image 1 ("Compatible With [Figma]") */}
            <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-indigo-200">
              <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10 w-fit">
                <Laptop className="w-3.5 h-3.5 text-cyan-300" />
                <span>Compatible With GCC • OpenJDK • CPython • Node.js</span>
              </div>
              <span className="text-[10px] opacity-75">
                {skills.length} Active Courses Ready
              </span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* RIGHT SIDE: Infinite Circular Scrolling Skills Showcase */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 p-5 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-slate-950/20 backdrop-blur-[1px]">
            {/* Header with Search and Circular Scroll Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-200">
                  Select Skill / Language
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                  Circular Scroll ↻
                </span>
              </div>

              {/* Search input + up/down arrows */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter skills..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                </div>

                {/* Circular Nudge Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => scrollByAmount('up')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                    title="Scroll Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollByAmount('down')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                    title="Scroll Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Circular Scrollable Viewport (Right Side Only Scrolls, NOT Whole Page!) */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="relative my-4 h-[490px] sm:h-[530px] overflow-y-auto pr-1.5 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent overscroll-contain select-none"
              style={{
                overscrollBehavior: 'contain',
              }}
            >
              {loopItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <Search className="w-8 h-8 text-white/50" />
                  <p className="text-sm font-semibold text-white">No skills match &quot;{searchQuery}&quot;</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-amber-300 underline font-mono"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                  {loopItems.map(({ item: curr, loopKey }) => {
                    return (
                      <div
                        key={loopKey}
                        onClick={() => onSelectSkill(curr.id)}
                        className="group relative bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-[24px] p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-white/40 dark:border-slate-800 flex flex-col justify-between cursor-pointer"
                      >
                        <div>
                          {/* Card Top: Icon + Title + Track Badge */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                {curr.icon}
                              </span>
                              <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {curr.title}
                                </h3>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                  {curr.compilerDisplayName}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${curr.badgeBg}`}
                            >
                              {curr.track}
                            </span>
                          </div>

                          {/* Tagline & Description */}
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1.5 line-clamp-1">
                            {curr.tagline}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                            {curr.description}
                          </p>

                          {/* 4 Feature Pills in Exact Order: Video -> Practice -> Study -> Compiler */}
                          <div className="grid grid-cols-2 gap-1.5 my-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                              <Play className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="truncate">1. Video</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                              <HelpCircle className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">2. Practice</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                              <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                              <span className="truncate">3. Study</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/70 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                              <Terminal className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">4. Compiler</span>
                            </div>
                          </div>

                          {/* Syllabus Summary */}
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
                            <span>Syllabus ({curr.stepsCount} Steps)</span>
                            <span>{curr.estimatedTotalHours}</span>
                          </div>
                        </div>

                        {/* Card CTA Button */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-transform"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Begin Course</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Subtle Scroll Helper Notice */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-indigo-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Continuous Circular Scroll (Loops seamlessly)
              </span>
              <span className="hidden sm:inline">Use mouse wheel or drag</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
