'use client';

import React, { useRef, useState, useMemo } from 'react';
import {
  Play,
  ChevronRight,
  RotateCcw,
  Search,
  CheckCircle2,
  ArrowRight,
  Clock,
  Layers,
  Sparkles,
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

  const isBeginner = selectedTrack === 'beginner';

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Switch Level Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/70 backdrop-blur-md border border-slate-800/80 px-5 py-3 rounded-2xl shadow-lg">
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
          className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 border border-slate-700 text-xs font-mono transition-colors flex items-center gap-2"
        >
          <span>Switch to {isBeginner ? 'Active Learner Track (Advanced)' : 'Beginner Track (Basics)'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* THE HERO PURPLE RECTANGLE (Clean, Minimal, Spacious UI Kit) */}
      <div className="relative rounded-[32px] sm:rounded-[36px] bg-gradient-to-br from-[#4f3ff0] via-[#3b2ad9] to-[#2517a8] border border-white/20 shadow-2xl shadow-indigo-950/70 overflow-hidden text-white">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-cyan-400/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] relative z-10">
          {/* ==================================================== */}
          {/* LEFT SIDE: Brand, Minimal Typography & Key Highlights */}
          {/* ==================================================== */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center space-y-8">
            {/* White Pill Badge matching Image 1 */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-indigo-900 text-xs font-black tracking-wide shadow-md w-fit">
              <span className="text-base">{isBeginner ? '🔑' : '⚡'}</span>
              <span>{isBeginner ? "Beginner's UI Kit" : "Engineer's Tech Studio"}</span>
            </div>

            {/* Bold Hero Typography matching Image 1 */}
            <div className="space-y-3">
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
              <p className="text-xs sm:text-sm text-indigo-100/90 font-medium leading-relaxed max-w-md pt-1">
                {isBeginner
                  ? 'Start from ground zero. Guided lectures, real-time code sandboxes, and auto-checked practice problems to become a confident developer.'
                  : 'Master production frameworks, high-throughput backend services, graph algorithms, and technical placement challenges.'}
              </p>
            </div>

            {/* Clean, Spacious Bullet Features Checklist */}
            <div className="space-y-3.5 pt-2">
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

          {/* ==================================================== */}
          {/* RIGHT SIDE: Minimal, Spacious Skills Showcase */}
          {/* ==================================================== */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-start relative overflow-hidden">
            {/* Header: Clean title + search input without dividing line */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 mb-3">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-200">
                Select Skill / Language ({filteredSkills.length})
              </span>

              {/* Minimal Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Scrollable Viewport without scrollbar line */}
            <div
              ref={scrollRef}
              className="relative h-[480px] sm:h-[520px] overflow-y-auto pr-1 overscroll-contain scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredSkills.length === 0 ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6 pt-1">
                  {filteredSkills.map((curr) => {
                    return (
                      <div
                        key={curr.id}
                        onClick={() => onSelectSkill(curr.id)}
                        className="group relative bg-white/95 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-[26px] p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/30 dark:border-slate-800 flex flex-col justify-between cursor-pointer"
                      >
                        <div className="space-y-4">
                          {/* Card Top: Icon + Title + Track Badge */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 group-hover:scale-110 transition-transform">
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

                          {/* Tagline & Description - Clean & Spacious */}
                          <div className="space-y-1.5">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold line-clamp-1">
                              {curr.tagline}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {curr.description}
                            </p>
                          </div>

                          {/* Minimal Specs Pill: Steps & Hours */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-indigo-500" />
                              {curr.stepsCount} Milestone Steps
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              {curr.estimatedTotalHours}
                            </span>
                          </div>
                        </div>

                        {/* Card CTA Button */}
                        <div className="pt-4 mt-2">
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-transform"
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
          </div>
        </div>
      </div>
    </div>
  );
}
