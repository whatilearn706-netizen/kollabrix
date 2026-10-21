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
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResourceLanguage, ResourceTrack, LANGUAGE_META } from '@/types/resources';
import { LanguageCurriculum } from '@/types/curriculum';
import { DEFAULT_CURRICULA } from '@/data/defaultCurriculum';
import { StepLearningWorkspace } from '@/components/resources/StepLearningWorkspace';

export default function ResourcesPage() {
  // Whether the user has chosen their level: null = first visit/unselected, 'beginner' | 'learning' = level selected
  const [selectedTrack, setSelectedTrack] = useState<ResourceTrack | null>(null);
  // Selected Curriculum ID (e.g. 'java-beginner') - when non-null, shows the step-by-step workspace
  const [activeCurriculumId, setActiveCurriculumId] = useState<string | null>(null);
  const [curriculaMap, setCurriculaMap] = useState<Record<string, LanguageCurriculum>>(DEFAULT_CURRICULA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved track preference and fetch dynamic curricula from Supabase
  useEffect(() => {
    try {
      const savedTrack = localStorage.getItem('linkora_resource_track') as ResourceTrack | null;
      if (savedTrack === 'beginner' || savedTrack === 'learning') {
        setSelectedTrack(savedTrack);
      }
      const savedCurriculum = localStorage.getItem('linkora_active_curriculum');
      if (savedCurriculum) {
        setActiveCurriculumId(savedCurriculum);
      }
    } catch {}

    // Fetch dynamic curricula from API
    async function loadCurricula() {
      try {
        const res = await fetch('/api/curriculum');
        const data = await res.json();
        if (data.success && data.curricula && Object.keys(data.curricula).length > 0) {
          setCurriculaMap(data.curricula);
        }
      } catch (e) {
        console.warn('Using default curricula fallback:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCurricula();
  }, []);

  const handleSelectTrack = (track: ResourceTrack) => {
    setSelectedTrack(track);
    setActiveCurriculumId(null);
    try {
      localStorage.setItem('linkora_resource_track', track);
      localStorage.removeItem('linkora_active_curriculum');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchLevel = () => {
    setSelectedTrack(null);
    setActiveCurriculumId(null);
    try {
      localStorage.removeItem('linkora_resource_track');
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
  const activeCurriculum = activeCurriculumId ? curriculaMap[activeCurriculumId] : null;

  // Curricula available under selected track
  const availableCurricula = useMemo(() => {
    if (!selectedTrack) return [];
    return Object.values(curriculaMap).filter((c) => {
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
  }, [curriculaMap, selectedTrack, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Background Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* VIEW 1: Active Step Learning Workspace */}
        {activeCurriculum ? (
          <StepLearningWorkspace
            curriculum={activeCurriculum}
            onBack={handleBackToLanguages}
            onTrackChange={handleSwitchLevel}
          />
        ) : selectedTrack === null ? (
          /* VIEW 2: First Gate Screen - User ONLY sees Beginner and Learning! */
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 max-w-3xl mx-auto py-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Linkora Collegiate Learning Hub</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Where are you in your{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                  Coding Journey?
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Choose your track below to unlock your personalized, step-by-step curriculum with lectures, practice questions, study notes, and our live online compiler.
              </p>
            </div>

            {/* Beginner vs Learning Big Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl pt-4">
              {/* Beginner Card */}
              <button
                onClick={() => handleSelectTrack('beginner')}
                className="group relative bg-slate-900/80 hover:bg-slate-900 border-2 border-slate-800 hover:border-emerald-500/60 rounded-3xl p-8 text-left transition-all duration-300 shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🐣
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Absolute Beginner
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                        START HERE
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      Zero coding experience needed. Learn syntax from scratch, understand how computers run programs, build confidence step-by-step, and write your first lines of code.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400 font-mono">
                  <span>Enter Beginner Track</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>

              {/* Learning / Upskilling Card */}
              <button
                onClick={() => handleSelectTrack('learning')}
                className="group relative bg-slate-900/80 hover:bg-slate-900 border-2 border-slate-800 hover:border-indigo-500/60 rounded-3xl p-8 text-left transition-all duration-300 shadow-xl hover:shadow-indigo-500/15 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                        Active Learner
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 font-semibold border border-indigo-500/30">
                        UPSKILLING
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2">
                      Already know basic syntax? Master production frameworks (Spring Boot, Next.js), competitive programming algorithms, graph traversals, and placement interviews.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 font-mono">
                  <span>Enter Learning Track</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 3: Level chosen! Notice Beginner/Learning big buttons DISAPPEARED! */
          <div className="space-y-8">
            {/* Top Bar with Clean Track Indicator & Switch Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {selectedTrack === 'beginner' ? '🐣' : '🚀'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">Active Track:</span>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      {selectedTrack === 'beginner' ? 'Beginner Path' : 'Active Learning Path'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {selectedTrack === 'beginner'
                      ? 'Step-by-step foundation to become a fully developed coder'
                      : 'Advanced algorithms, microservices & production frameworks'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwitchLevel}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch Level ({selectedTrack === 'beginner' ? 'Go to Learning' : 'Go to Beginner'})</span>
                </button>
              </div>
            </div>

            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Select Your Programming Language
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Tap <strong>Begin</strong> on any language to open its dedicated step-by-step workspace with lectures, practice questions, notes, and the live compiler.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search languages (Java, C++, Python, Web Dev)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Language Cards Grid */}
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

                      {/* 4 Feature Pills in Exact Order: Video -> Practice -> Study -> Compiler */}
                      <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <Play className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>1. Video per Topic</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>2. Practice Tests</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>3. Study Material</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>4. Live Compiler</span>
                        </div>
                      </div>

                      {/* Steps Roadmap Preview */}
                      <div className="space-y-1.5 mb-5">
                        <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                          Syllabus ({curr.stepsCount} Steps • {curr.estimatedTotalHours}):
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
                              + {curr.stepsCount - 3} more steps
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
