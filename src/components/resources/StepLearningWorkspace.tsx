'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  Code2,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  Terminal,
  X,
} from 'lucide-react';
import type { CodexLanguageTrack, CodexLevel } from '@/data/codexCatalog';
import type { LanguageCurriculum, LearningStep, PracticeQuestion, TopicVideo } from '@/types/curriculum';
import { InteractiveCompiler } from './InteractiveCompiler';
import { PracticeStage, StudyStage, VideoStage } from './WorkspaceStages';

interface StepLearningWorkspaceProps {
  curriculum: LanguageCurriculum;
  onBack: () => void;
  onTrackChange?: () => void;
  track?: CodexLanguageTrack | null;
  activeLevel?: CodexLevel;
  onSwitchLevel?: (level: CodexLevel) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

type FocusTab = 'video' | 'study' | 'practice' | 'compiler';

/**
 * Unified Kollabrix Folio Interactive Step Studio.
 * Single-focus stage architecture eliminates modal hopping and cognitive overload.
 */
export function StepLearningWorkspace({
  curriculum,
  onBack,
  track,
  activeLevel = 'beginner',
  onSwitchLevel,
  isSaved = false,
  onToggleSave,
}: StepLearningWorkspaceProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<FocusTab>('video');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [compilerCode, setCompilerCode] = useState<string>('');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [showSyllabusDrawer, setShowSyllabusDrawer] = useState<boolean>(false);
  const [transitioning, setTransitioning] = useState<boolean>(false);

  const currentStep: LearningStep = curriculum.steps[activeStepIndex] || curriculum.steps[0];
  const storageKey = `linkora_progress_${curriculum.id}`;

  const stepVideos: TopicVideo[] = useMemo(() => {
    if (!currentStep) return [];
    if (currentStep.videos && currentStep.videos.length > 0) return currentStep.videos;
    if (currentStep.video) {
      return [
        {
          ...currentStep.video,
          id: currentStep.video.id || 'v-primary',
          type: currentStep.video.type || 'Primary Lecture',
        },
      ];
    }
    return [];
  }, [currentStep]);

  useEffect(() => {
    if (stepVideos.length > 0) {
      setSelectedVideoId(stepVideos[0].id || 'v-primary');
    }
  }, [activeStepIndex, stepVideos]);

  const activeVideo: TopicVideo | null =
    stepVideos.find((v) => (v.id || 'v-primary') === selectedVideoId) || stepVideos[0] || null;

  useEffect(() => {
    setActiveStepIndex(0);
    setActiveTab('video');
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompletedSteps(parsed);
      } else {
        setCompletedSteps([]);
      }
    } catch {
      setCompletedSteps([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (currentStep) {
      setCompilerCode(currentStep.compilerStarterCode);
      setActiveQuestion(null);
    }
  }, [activeStepIndex, currentStep]);

  const toggleStepCompleted = (stepNum: number) => {
    const updated = completedSteps.includes(stepNum)
      ? completedSteps.filter((s) => s !== stepNum)
      : [...completedSteps, stepNum];
    setCompletedSteps(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  const navigateStep = (nextIdx: number, markCurrentDone = false) => {
    if (nextIdx < 0 || nextIdx >= curriculum.steps.length) return;
    if (markCurrentDone && currentStep && !completedSteps.includes(currentStep.stepNumber)) {
      toggleStepCompleted(currentStep.stepNumber);
    }
    setTransitioning(true);
    setTimeout(() => {
      setActiveStepIndex(nextIdx);
      setShowSyllabusDrawer(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTransitioning(false);
    }, 150);
  };

  const handleLoadQuestionToCompiler = (q: PracticeQuestion) => {
    setActiveQuestion(q);
    setCompilerCode(q.starterCode);
    setActiveTab('compiler');
  };

  const isCurrentDone = currentStep ? completedSteps.includes(currentStep.stepNumber) : false;
  const progressPercent = Math.round((completedSteps.length / curriculum.steps.length) * 100);
  const canSwitchIntermediate = Boolean(track?.curriculumKeys?.intermediate);

  const focusTabs: Array<{ id: FocusTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'video', label: '01 · Watch', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'study', label: '02 · Notes', icon: <BookOpen className="w-3.5 h-3.5" /> },
    {
      id: 'practice',
      label: '03 · Practice',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      badge: String(currentStep.practiceQuestions.length),
    },
    { id: 'compiler', label: '04 · Sandbox', icon: <Terminal className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-white relative overflow-x-hidden flex flex-col">
      {/* Subtle Ambient Obsidian Studio Backdrop matching KOLLΛBRIX FOLIO */}
      <div
        aria-hidden="true"
        className="fixed inset-y-0 right-0 w-full lg:w-1/2 bg-[#0B0F18] pointer-events-none z-0 border-l border-white/[0.03]"
      />
      <div
        aria-hidden="true"
        className="fixed top-[-160px] left-1/2 -translate-x-1/2 w-[720px] h-[320px] rounded-full bg-sky-500/[0.05] blur-[130px] pointer-events-none z-0"
      />

      {/* Minimal Sticky Studio Top Strip */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 lg:px-12 bg-[#07090E]/85 backdrop-blur-xl border-b border-white/[0.07] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Folio</span>
          </button>

          <span className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-300 truncate hidden lg:inline">
            {track ? track.title : curriculum.title}
          </span>

          {track && onSwitchLevel && canSwitchIntermediate && (
            <div className="inline-flex items-center p-0.5 rounded-full bg-white/[0.04] border border-white/10 shrink-0">
              {(['beginner', 'intermediate'] as CodexLevel[]).map((lvl) => {
                const isLvlActive =
                  lvl === 'beginner' ? activeLevel === 'beginner' : activeLevel !== 'beginner';
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSwitchLevel(lvl)}
                    className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                      isLvlActive
                        ? 'bg-[#FAF8F5] text-[#07090E] font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl === 'beginner' ? 'Beginner' : 'Core & Pro'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer ${
                isSaved
                  ? 'bg-sky-400/15 border-sky-400/35 text-sky-200'
                  : 'bg-white/[0.03] border-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-sky-300 text-sky-300' : ''}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSyllabusDrawer(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-200 cursor-pointer transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-sky-300" />
            <span>Roadmap</span>
            <span className="text-zinc-400">
              {completedSteps.length}/{curriculum.steps.length}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2 pl-2">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-300 to-white rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-zinc-400">{progressPercent}%</span>
          </div>
        </div>
      </header>

      {/* Main Breathable Single-Focus Canvas */}
      <main
        className={`relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 pt-7 pb-20 space-y-7 transition-opacity duration-200 ${
          transitioning ? 'opacity-40' : 'opacity-100'
        }`}
      >
        {/* Clean Horizontal Step Selector Pill Rail */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {curriculum.steps.map((st, idx) => {
            const isCur = idx === activeStepIndex;
            const isDone = completedSteps.includes(st.stepNumber);
            return (
              <button
                key={st.stepNumber}
                type="button"
                onClick={() => idx !== activeStepIndex && navigateStep(idx)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isCur
                    ? 'bg-[#FAF8F5] text-[#07090E] border-white font-semibold shadow-sm'
                    : isDone
                      ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/15'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <span>{isDone && !isCur ? '✓' : String(st.stepNumber).padStart(2, '0')}</span>
                <span className="max-w-[170px] truncate">{st.title}</span>
              </button>
            );
          })}
        </div>

        {/* Open Airy Step Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>
                Step {String(currentStep.stepNumber).padStart(2, '0')} of{' '}
                {String(curriculum.steps.length).padStart(2, '0')}
              </span>
              <span>·</span>
              <span>{currentStep.estimatedTime}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-semibold tracking-tight text-white leading-tight">
              {currentStep.title}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">{currentStep.summary}</p>
          </div>

          <button
            type="button"
            onClick={() => toggleStepCompleted(currentStep.stepNumber)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono border transition-all cursor-pointer shrink-0 w-fit ${
              isCurrentDone
                ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300'
                : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isCurrentDone ? 'Completed' : 'Mark Complete'}</span>
          </button>
        </div>

        {/* Calm 4-Mode Focus Switcher (One view at a time — Zero Brain Fog) */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#0A0E17] border border-white/[0.08]">
            {focusTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FAF8F5] text-[#07090E] font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        active ? 'bg-black/10 text-[#07090E]' : 'bg-white/10 text-zinc-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <Link href="/icpc" className="hover:text-zinc-200 transition-colors inline-flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              <span>Practice IDE</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
            <span>·</span>
            <Link href="/arena" className="hover:text-zinc-200 transition-colors inline-flex items-center gap-1">
              <span>1v1 Arena</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Active Focus Stage */}
        <section>
          {activeTab === 'video' && (
            <VideoStage
              currentStep={currentStep}
              stepVideos={stepVideos}
              activeVideo={activeVideo}
              selectedVideoId={selectedVideoId}
              onSelectVideo={setSelectedVideoId}
              activeStepIndex={activeStepIndex}
              totalSteps={curriculum.steps.length}
              onPrevStep={() => navigateStep(activeStepIndex - 1)}
              onNextStep={() => navigateStep(activeStepIndex + 1, true)}
              onFinishCourse={() => {
                if (!isCurrentDone) toggleStepCompleted(currentStep.stepNumber);
                onBack();
              }}
              onGoToNotes={() => setActiveTab('study')}
            />
          )}

          {activeTab === 'study' && (
            <StudyStage
              currentStep={currentStep}
              onOpenInSandbox={(code) => {
                setActiveQuestion(null);
                setCompilerCode(code);
                setActiveTab('compiler');
              }}
              onGoToPractice={() => setActiveTab('practice')}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeStage
              questions={currentStep.practiceQuestions}
              onSolveQuestion={handleLoadQuestionToCompiler}
            />
          )}

          {activeTab === 'compiler' && (
            <div className="space-y-4">
              {activeQuestion && (
                <div className="px-5 py-3.5 rounded-2xl bg-[#0A0E17] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-300">
                      Solving Challenge · {activeQuestion.difficulty}
                    </span>
                    <p className="text-sm font-semibold text-white truncate">{activeQuestion.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuestion(null);
                      setCompilerCode(currentStep.compilerStarterCode);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Starter</span>
                  </button>
                </div>
              )}

              <InteractiveCompiler
                language={curriculum.compilerLanguage}
                compilerDisplayName={curriculum.compilerDisplayName}
                initialCode={compilerCode}
                expectedOutput={activeQuestion?.expectedOutput}
                initialStdin={activeQuestion?.stdin}
                onCodeChange={(c) => setCompilerCode(c)}
              />
            </div>
          )}
        </section>
      </main>

      {/* Clean Slide-Over Roadmap Drawer */}
      {showSyllabusDrawer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md h-full bg-[#090C14] border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-sky-300">
                    Track Roadmap · {curriculum.estimatedTotalHours}
                  </p>
                  <h2 className="text-xl font-serif font-semibold text-white mt-1">
                    {curriculum.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyllabusDrawer(false)}
                  aria-label="Close roadmap"
                  className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {curriculum.steps.map((st, idx) => {
                  const isCur = idx === activeStepIndex;
                  const isDone = completedSteps.includes(st.stepNumber);
                  return (
                    <button
                      key={st.stepNumber}
                      type="button"
                      onClick={() => navigateStep(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isCur
                          ? 'bg-white/[0.08] border-white/30 text-white'
                          : 'bg-white/[0.02] border-white/[0.07] text-zinc-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35'
                            : isCur
                              ? 'bg-[#FAF8F5] text-[#07090E] font-bold'
                              : 'bg-white/[0.06] text-zinc-400'
                        }`}
                      >
                        {isDone ? '✓' : st.stepNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{st.title}</p>
                        <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                          {st.estimatedTime} · {st.practiceQuestions.length} challenges
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] text-xs font-mono text-zinc-500">
              {completedSteps.length} of {curriculum.steps.length} steps completed ({progressPercent}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
