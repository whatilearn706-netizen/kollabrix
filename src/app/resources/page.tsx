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
import { ResourcesSubNav } from '@/components/resources/ResourcesSubNav';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 relative">
      {/* Cosmic Warp Hyperspace Ambient Background (Derived from Image 2 with airship cleanly removed) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url('/images/resources-cosmic-bg.jpg')` }}
        />
        {/* Warm Cosmic Vignette Overlay for Crisp Typography & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950/95" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Dedicated Standalone Resources Hub Header (Clean & Focused) */}
        <header className="flex items-center justify-between pb-4 border-b border-stone-800/80 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-sm shadow-lg shadow-amber-600/25 border border-amber-400/30 group-hover:scale-105 transition-transform">
              🚀
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                Kollabrix
              </span>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                Resources Hub
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-mono text-stone-300 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 shadow-sm"
            >
              <span>← Back to Campus</span>
            </Link>
          </div>
        </header>

        {/* Resources Hub Sub-Navigation (Roadmaps, Perks, Starter Kits) */}
        <ResourcesSubNav />

        {/* VIEW 1: Active Step Learning Workspace */}
        {activeCurriculum ? (
          <StepLearningWorkspace
            curriculum={activeCurriculum}
            onBack={handleBackToLanguages}
            onTrackChange={handleSwitchLevel}
          />
        ) : selectedTrack === null ? (
          /* VIEW 2: First Gate Screen - Absolute Beginner & Active Learner Stunning Cards */
          <div className="min-h-[72vh] flex flex-col items-center justify-center text-center space-y-10 max-w-5xl mx-auto py-10">
            {/* Header with Purpose-Driven, Understandable Language */}
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono tracking-wider uppercase backdrop-blur-md shadow-md shadow-amber-500/10">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Kollabrix Collegiate Learning Hub • Zero to Squad-Ready</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Choose Your Path to{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                  Build Real Projects
                </span>
              </h1>
              <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed font-normal">
                Kollabrix is where student developers find teammates and win hackathons. Before jumping into a squad, choose your path below to master essential skills through guided lectures, hands-on practice, concept notes, and our live online compiler.
              </p>
            </div>

            {/* Beginner vs Active Learner - Absolute Stunning Overhauled Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-2">
              {/* CARD 1: Absolute Beginner */}
              <button
                type="button"
                onClick={() => handleSelectTrack('beginner')}
                className="group relative text-left rounded-3xl p-8 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-b from-stone-900/85 via-slate-950/90 to-slate-950/95 border-2 border-stone-800/80 hover:border-amber-400/80 shadow-2xl hover:shadow-[0_0_50px_rgba(245,158,11,0.22)] hover:-translate-y-2 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Ambient Corner Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

                <div className="space-y-6 relative z-10">
                  {/* Top Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10 group-hover:scale-110 group-hover:rotate-2 transition-transform">
                      🐣
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Start From Day 0
                    </span>
                  </div>

                  {/* Title & Human-Friendly Explanation */}
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                      Absolute Beginner
                    </h3>
                    <p className="text-xs font-mono text-amber-400/90 mt-1 font-semibold">
                      Zero coding experience needed
                    </p>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mt-3">
                      Never written code before? Perfect. We teach you programming in simple, human language. Understand how computers run software, write your first lines of code in 5 minutes, and build the confidence to join your first student squad.
                    </p>
                  </div>

                  {/* Student Milestone Checklist */}
                  <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Learn logic, variables, loops & functions from scratch</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Run code immediately in your browser (no installs)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>Build small mini-projects to showcase on Kollabrix</span>
                    </div>
                  </div>

                  {/* Available Topics Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Python Basics', 'Java 101', 'Web Dev Intro', 'DSA Foundations'].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-stone-900 border border-stone-800 text-stone-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-amber-300 font-mono relative z-10">
                  <span className="flex items-center gap-1.5">
                    <span>Enter Beginner Track</span>
                    <span className="text-[10px] text-stone-400 font-normal">~15 Hours</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:translate-x-1.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* CARD 2: Active Learner */}
              <button
                type="button"
                onClick={() => handleSelectTrack('learning')}
                className="group relative text-left rounded-3xl p-8 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-b from-stone-900/85 via-slate-950/90 to-slate-950/95 border-2 border-stone-800/80 hover:border-cyan-400/80 shadow-2xl hover:shadow-[0_0_50px_rgba(6,182,212,0.22)] hover:-translate-y-2 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Ambient Corner Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all" />

                <div className="space-y-6 relative z-10">
                  {/* Top Badge & Icon Row */}
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/10 group-hover:scale-110 group-hover:-rotate-2 transition-transform">
                      🚀
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      Hackathon & Squad Ready
                    </span>
                  </div>

                  {/* Title & Human-Friendly Explanation */}
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      Active Learner
                    </h3>
                    <p className="text-xs font-mono text-cyan-400/90 mt-1 font-semibold">
                      Level up for production & hackathons
                    </p>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mt-3">
                      Already comfortable with syntax? Time to build real software. Master modern web frameworks, backend APIs, graph algorithms, and architectural patterns so you can assemble a dream team and lead winning hackathon squads.
                    </p>
                  </div>

                  {/* Student Milestone Checklist */}
                  <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs text-stone-300">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Master Next.js, FastAPI, Spring Boot & REST APIs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Crack high-frequency interview & placement algorithms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>Ship hackathon-grade MVPs and lead project squads</span>
                    </div>
                  </div>

                  {/* Available Topics Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Full-Stack Next.js', 'Spring Boot API', 'FastAPI Backends', 'Advanced DSA'].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-stone-900 border border-stone-800 text-stone-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-6 mt-6 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-cyan-300 font-mono relative z-10">
                  <span className="flex items-center gap-1.5">
                    <span>Enter Active Learner Track</span>
                    <span className="text-[10px] text-stone-400 font-normal">~35 Hours</span>
                  </span>
                  <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:translate-x-1.5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
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
