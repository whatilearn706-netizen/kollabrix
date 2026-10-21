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
import { CircularSkillsShowcase } from '@/components/resources/CircularSkillsShowcase';

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

  // Curricula available under selected track (Excludes Draft / Not Live items from student view)
  const availableCurricula = useMemo(() => {
    if (!selectedTrack) return [];
    return Object.values(curriculaMap).filter((c) => {
      if (c.track !== selectedTrack) return false;
      // Filter out Drafts (Not Live) from student hub
      if (c.isLive === false) return false;
      return true;
    });
  }, [curriculaMap, selectedTrack]);

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
          /* VIEW 3: Dribbble-inspired Purple Rectangle Hero with Continuous Circular Scrolling Skills! */
          <CircularSkillsShowcase
            skills={availableCurricula}
            selectedTrack={selectedTrack}
            onSelectSkill={handleBeginCurriculum}
            onSwitchTrack={handleSelectTrack}
            onBackToLevelSelect={handleSwitchLevel}
          />
        )}
      </div>
    </div>
  );
}
