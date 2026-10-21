'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Play,
  Code2,
  GraduationCap,
  Layers,
  Search,
  CheckCircle2,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
  Compass,
  Trophy,
  Zap,
  Terminal,
  FileCode,
  HelpCircle,
  FileText,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResourceLanguage, ResourceTrack, LANGUAGE_META } from '@/types/resources';
import { LanguageCurriculum } from '@/types/curriculum';
import { DEFAULT_CURRICULA } from '@/data/defaultCurriculum';
import { StepLearningWorkspace } from '@/components/resources/StepLearningWorkspace';

export default function ResourcesPage() {
  // Track: 'beginner' | 'learning'
  const [selectedTrack, setSelectedTrack] = useState<ResourceTrack>('beginner');
  // Selected Curriculum ID (e.g. 'java-beginner') - when non-null, shows the step-by-step workspace
  const [activeCurriculumId, setActiveCurriculumId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const savedTrack = localStorage.getItem('linkora_resource_track') as ResourceTrack | null;
      if (savedTrack === 'beginner' || savedTrack === 'learning') {
        setSelectedTrack(savedTrack);
      }
      const savedCurriculum = localStorage.getItem('linkora_active_curriculum');
      if (savedCurriculum && DEFAULT_CURRICULA[savedCurriculum]) {
        setActiveCurriculumId(savedCurriculum);
      }
    } catch {}
  }, []);

  const handleSelectTrack = (track: ResourceTrack) => {
    setSelectedTrack(track);
    setActiveCurriculumId(null);
    try {
      localStorage.setItem('linkora_resource_track', track);
      localStorage.removeItem('linkora_active_curriculum');
    } catch {}
  };

  const handleBeginCurriculum = (curriculumId: string) => {
    setActiveCurriculumId(curriculumId);
    try {
      localStorage.setItem('linkora_active_curriculum', curriculumId);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanguages = () => {
    setActiveCurriculumId(null);
    try {
      localStorage.removeItem('linkora_active_curriculum');
    } catch {}
  };

  // Get active curriculum object if open
  const activeCurriculum = activeCurriculumId ? DEFAULT_CURRICULA[activeCurriculumId] : null;

  // Curricula available under selected track
  const availableCurricula = useMemo(() => {
    return Object.values(DEFAULT_CURRICULA).filter((c) => {
      if (c.track !== selectedTrack) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.language.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedTrack, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Background Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* If a curriculum is active, render the full Step-by-Step Workspace! */}
        {activeCurriculum ? (
          <StepLearningWorkspace
            curriculum={activeCurriculum}
            onBack={handleBackToLanguages}
            onTrackChange={() => setActiveCurriculumId(null)}
          />
        ) : (
          /* Overview / Selection Screen matching handwritten diagram */
          <div className="space-y-8">
            {/* Top Badge & Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Linkora Collegiate Learning Hub</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                Learn Step-by-Step to Become a{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                  Fully Developed Coder
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Structured topic-by-topic modules with study notes, video tutorials, practice problems, and an online in-browser compiler for every language.
              </p>
            </div>

            {/* Level Selector: Beginner vs Learning (Directly from User Diagram) */}
            <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center shadow-xl backdrop-blur-md">
              <button
                onClick={() => handleSelectTrack('beginner')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedTrack === 'beginner'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">🐣</span>
                <div className="text-left">
                  <div className="font-bold">Beginner</div>
                  <div className="text-[10px] opacity-80 font-normal hidden sm:block">
                    Start from zero • Step-by-step
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectTrack('learning')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedTrack === 'learning'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">🚀</span>
                <div className="text-left">
                  <div className="font-bold">Learning</div>
                  <div className="text-[10px] opacity-80 font-normal hidden sm:block">
                    Upskilling • Advanced roadmaps
                  </div>
                </div>
              </button>
            </div>

            {/* Search Bar & Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto pt-2">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search languages (Java, C++, Python, Web Dev)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Active Track:</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-bold text-white uppercase tracking-wider">
                  {selectedTrack}
                </span>
                <span>({availableCurricula.length} Languages)</span>
              </div>
            </div>

            {/* Language Cards Grid with the prominent [Begin] button */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {availableCurricula.map((curr) => {
                const storageKey = `linkora_progress_${curr.id}`;
                let completedCount = 0;
                try {
                  const saved = localStorage.getItem(storageKey);
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) completedCount = parsed.length;
                  }
                } catch {}

                return (
                  <div
                    key={curr.id}
                    className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 group-hover:scale-110 transition-transform">
                            {curr.icon}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {curr.title}
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">
                              {curr.compilerDisplayName}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${curr.badgeBg}`}
                        >
                          {curr.track}
                        </span>
                      </div>

                      {/* Tagline & Description */}
                      <p className="text-xs text-indigo-400 font-medium mb-2">{curr.tagline}</p>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                        {curr.description}
                      </p>

                      {/* 4 Feature Pills from Diagram */}
                      <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Study Notes</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <Play className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>Video per Topic</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Practice Tests</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Live Compiler</span>
                        </div>
                      </div>

                      {/* Steps Checklist Preview */}
                      <div className="space-y-1.5 mb-5">
                        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                          Curriculum Roadmap ({curr.stepsCount} Steps):
                        </div>
                        <div className="space-y-1">
                          {curr.steps.slice(0, 3).map((st) => (
                            <div
                              key={st.stepNumber}
                              className="text-xs text-slate-400 flex items-center gap-2 truncate"
                            >
                              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center shrink-0">
                                {st.stepNumber}
                              </span>
                              <span className="truncate">{st.title}</span>
                            </div>
                          ))}
                          {curr.stepsCount > 3 && (
                            <div className="text-[11px] text-slate-500 font-mono pl-6">
                              + {curr.stepsCount - 3} more advanced steps
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prominent [Begin] Button directly matching Diagram! */}
                    <div className="pt-4 border-t border-slate-800/80">
                      <Button
                        onClick={() => handleBeginCurriculum(curr.id)}
                        className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Begin {curr.title.split(' ')[0]} Course</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
