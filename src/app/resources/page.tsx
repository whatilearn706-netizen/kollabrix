'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Play,
  ExternalLink,
  Code2,
  GraduationCap,
  Layers,
  Search,
  CheckCircle2,
  ChevronRight,
  Clock,
  User,
  Filter,
  X,
  RefreshCw,
  ArrowRight,
  Compass,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LearningResource, ResourceLanguage, ResourceTrack, LANGUAGE_META } from '@/types/resources';
import { DEFAULT_CAMPUS_RESOURCES } from '@/data/defaultResources';

export default function ResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>(DEFAULT_CAMPUS_RESOURCES);
  const [isLoading, setIsLoading] = useState(true);

  // User Track state: 'beginner' | 'learning' | null (null shows track picker first)
  const [selectedTrack, setSelectedTrack] = useState<ResourceTrack | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<ResourceLanguage>('java');
  const [searchQuery, setSearchQuery] = useState('');

  // Video Player Modal state
  const [activeVideoResource, setActiveVideoResource] = useState<LearningResource | null>(null);

  // Load track from localStorage on mount
  useEffect(() => {
    try {
      const savedTrack = localStorage.getItem('linkora_learning_track') as ResourceTrack | null;
      if (savedTrack === 'beginner' || savedTrack === 'learning' || savedTrack === 'both') {
        setSelectedTrack(savedTrack);
      }
    } catch {}
  }, []);

  // Fetch updated resources from Supabase / API
  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        if (data.success && Array.isArray(data.resources) && data.resources.length > 0) {
          setResources(data.resources);
        }
      } catch (err) {
        console.warn('Could not load dynamic resources, using curated default:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchResources();
  }, []);

  const handleSelectTrack = (track: ResourceTrack) => {
    setSelectedTrack(track);
    try {
      localStorage.setItem('linkora_learning_track', track);
    } catch {}
  };

  // Filter resources based on Track, Language, and Search
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // 1. Language filter
      if (r.language !== activeLanguage) return false;

      // 2. Track filter (if track is selected)
      if (selectedTrack && selectedTrack !== 'both') {
        if (r.track !== 'both' && r.track !== selectedTrack) {
          return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = r.title.toLowerCase().includes(q);
        const descMatch = r.description.toLowerCase().includes(q);
        const topicMatch = r.topic.toLowerCase().includes(q);
        const instMatch = r.instructor?.toLowerCase().includes(q);
        const tagMatch = r.tags?.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !topicMatch && !instMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [resources, activeLanguage, selectedTrack, searchQuery]);

  const currentLangMeta = LANGUAGE_META[activeLanguage];

  // Helper to extract clean YouTube Embed URL
  const getEmbedUrl = (resource: LearningResource) => {
    if (resource.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${resource.youtubeId}?autoplay=1`;
    }
    if (resource.videoUrl) {
      let id = '';
      if (resource.videoUrl.includes('youtu.be/')) {
        id = resource.videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (resource.videoUrl.includes('v=')) {
        id = resource.videoUrl.split('v=')[1].split('&')[0];
      }
      if (id) {
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      }
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 selection:bg-violet-500 selection:text-white">
      {/* Hero Header */}
      <section className="relative pt-10 pb-12 border-b border-slate-200/80 dark:border-charcoal-800 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-charcoal-900 dark:via-charcoal-900/60 dark:to-charcoal-950 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-transparent rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[420px] h-[420px] bg-gradient-to-bl from-cyan-600/15 via-pink-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-600 dark:text-violet-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Linkora Collegiate Learning Hub</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Master Any Tech Stack{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500">
                  from Zero to Placement
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Curated collegiate roadmaps, step-by-step video tutorials, coding practice sets, and architecture guides across Java, C++, Python, Web Dev, and DSA.
              </p>
            </div>

            {/* Quick Track Switcher Pill */}
            {selectedTrack && (
              <div className="p-2 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm flex flex-col gap-2 shrink-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-2">
                  Active Learning Track:
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-charcoal-800 p-1 rounded-xl">
                  <button
                    onClick={() => handleSelectTrack('beginner')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTrack === 'beginner'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🌱 Beginner
                  </button>
                  <button
                    onClick={() => handleSelectTrack('learning')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTrack === 'learning'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    🚀 Active Learner
                  </button>
                  <button
                    onClick={() => handleSelectTrack('both')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedTrack === 'both'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Track Selection Prompt (Modal/Overlay when not chosen or user clicks reset) */}
      {!selectedTrack && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center space-y-3 mb-8">
            <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
              STEP 1: PERSONALIZE YOUR ROADMAP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Where are you in your coding journey?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Select your current level to get tailored tutorials, video playlists, and practice problems suited for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Beginner Option */}
            <div
              onClick={() => handleSelectTrack('beginner')}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-slate-200 dark:border-charcoal-800 hover:border-violet-500 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
                <span className="text-6xl">🌱</span>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-2xl">
                  🌱
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                    Zero Coding Experience
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                    Absolute Beginner
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    Just starting out in college or writing your first lines of code. You need crystal-clear basics, setup guides, zero-jargon explanations, and step-by-step videos.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-charcoal-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>JDK, Python, Compiler & VS Code setup guides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Variables, Loops, Functions & OOP from scratch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Curated friendly YouTube tutorials with no rush</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full bg-slate-900 group-hover:bg-violet-600 text-white font-bold text-xs py-2.5 transition-all shadow-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
              >
                Start as Beginner
              </Button>
            </div>

            {/* Active Learner Option */}
            <div
              onClick={() => handleSelectTrack('learning')}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-slate-200 dark:border-charcoal-800 hover:border-violet-500 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
                <span className="text-6xl">🚀</span>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-2xl">
                  🚀
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                    Knows Basics & Syntax
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                    Active Learner / Upskilling
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    You understand loops and classes. Now you want to master Data Structures & Algorithms (DSA), full-stack project architectures, frameworks, and crack campus placements.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-charcoal-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>In-depth DSA: Trees, Graphs, DP & LeetCode roadmaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>Production frameworks: Next.js, Spring Boot & FastAPI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>Real-world portfolio projects & contest speedruns</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full bg-slate-900 group-hover:bg-violet-600 text-white font-bold text-xs py-2.5 transition-all shadow-xs"
                rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />}
              >
                Start as Active Learner
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Roadmap Hub (Shown once track is chosen) */}
      {selectedTrack && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Controls: Language Pills & Search Bar */}
          <div className="space-y-4">
            {/* Language Selector Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {(Object.keys(LANGUAGE_META) as ResourceLanguage[]).map((langKey) => {
                const meta = LANGUAGE_META[langKey];
                const isActive = activeLanguage === langKey;
                return (
                  <button
                    key={langKey}
                    onClick={() => setActiveLanguage(langKey)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-charcoal-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-charcoal-800 hover:border-violet-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Language Header & Search Bar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200/90 dark:border-charcoal-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentLangMeta.icon}</span>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {currentLangMeta.label} Resource Roadmap
                  </h2>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${currentLangMeta.badgeBg}`}>
                    {selectedTrack === 'beginner' ? 'Beginner Track' : selectedTrack === 'learning' ? 'Active Learner Track' : 'All Modules'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                  {currentLangMeta.description}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${currentLangMeta.label} topics...`}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-charcoal-800/80 border border-slate-200 dark:border-charcoal-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 shadow-2xs font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTrack(null)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 hover:border-violet-400 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-violet-600 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                  title="Switch between Beginner and Active Learner"
                >
                  Change Level
                </button>
              </div>
            </div>
          </div>

          {/* Module Topics Grid */}
          {filteredResources.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 text-center space-y-3 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center mx-auto text-xl">
                📚
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Modules Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No topics match your current filter or keyword. Try resetting your search or switching tracks.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTrack('both');
                }}
                className="text-xs font-bold"
              >
                Show All {currentLangMeta.label} Topics
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredResources.map((item, idx) => (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200/90 dark:border-charcoal-800 hover:border-violet-500/50 dark:hover:border-violet-500/40 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Glowing Top Accent on Hover */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-3.5">
                    {/* Topic Badge Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-charcoal-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-charcoal-700">
                        {item.topic}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration || 'Full Course'}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Instructor & Tags */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-charcoal-800 text-xs">
                      {item.instructor && (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="w-3 h-3 text-violet-500 shrink-0" />
                          <span className="truncate">{item.instructor}</span>
                        </div>
                      )}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        item.track === 'beginner'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                      }`}>
                        {item.track === 'beginner' ? 'Beginner' : 'Intermediate'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Watch Video & Documentation */}
                  <div className="pt-3 border-t border-slate-100 dark:border-charcoal-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveVideoResource(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Watch Tutorial</span>
                    </button>

                    {item.docUrl && (
                      <a
                        href={item.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold shrink-0 flex items-center gap-1"
                        title="Official Documentation"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Docs</span>
                      </a>
                    )}

                    {item.practiceUrl && (
                      <a
                        href={item.practiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 hover:bg-slate-100 dark:hover:bg-charcoal-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold shrink-0 flex items-center gap-1"
                        title="Practice Problems / GitHub"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Practice</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Embedded YouTube Video Player Modal */}
      {activeVideoResource && (
        <Modal
          isOpen={Boolean(activeVideoResource)}
          onClose={() => setActiveVideoResource(null)}
          title={activeVideoResource.title}
          maxWidth="3xl"
        >
          <div className="space-y-4">
            {/* Embedded 16:9 Player */}
            <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden shadow-2xl border border-slate-800">
              <iframe
                src={getEmbedUrl(activeVideoResource)}
                title={activeVideoResource.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Meta & Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {LANGUAGE_META[activeVideoResource.language]?.icon}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeVideoResource.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      Module: {activeVideoResource.topic} • Instructor: {activeVideoResource.instructor || 'Campus Mentor'}
                    </p>
                  </div>
                </div>

                {activeVideoResource.videoUrl && (
                  <a
                    href={activeVideoResource.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Open in YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-charcoal-800/60 p-3 rounded-xl border border-slate-200 dark:border-charcoal-700">
                {activeVideoResource.description}
              </p>

              {/* Action Links */}
              <div className="flex items-center gap-3 pt-2">
                {activeVideoResource.docUrl && (
                  <a
                    href={activeVideoResource.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-bold hover:underline"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Official Cheatsheet &amp; Documentation</span>
                  </a>
                )}
                {activeVideoResource.practiceUrl && (
                  <a
                    href={activeVideoResource.practiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Practice Problems &amp; Source Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
