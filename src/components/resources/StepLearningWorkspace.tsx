'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Play,
  HelpCircle,
  Code2,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  ExternalLink,
  Award,
  Terminal,
  FileText,
  Lightbulb,
  Check,
  RotateCcw,
  ListVideo,
  Layers,
  BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LanguageCurriculum, LearningStep, PracticeQuestion, TopicVideo } from '@/types/curriculum';
import { InteractiveCompiler } from './InteractiveCompiler';

interface StepLearningWorkspaceProps {
  curriculum: LanguageCurriculum;
  onBack: () => void;
  onTrackChange?: () => void;
}

export function StepLearningWorkspace({ curriculum, onBack }: StepLearningWorkspaceProps) {
  // Current active step index (0-indexed)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Tab order as requested in 2nd image:
  // 1. Video Lecture -> 2. Practice Questions -> 3. Study Material -> 4. Live Compiler
  const [activeTab, setActiveTab] = useState<'video' | 'practice' | 'study' | 'compiler'>('video');

  // Completed steps saved in state and localStorage
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Practice question loaded into compiler
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [compilerCode, setCompilerCode] = useState<string>('');

  // Active video within the current step (for multiple videos per topic)
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  // Dual-Door Closing & Opening Transition Animation ("Grand Double Door Portal")
  const [doorTransition, setDoorTransition] = useState<{
    active: boolean;
    state: 'closing' | 'closed' | 'opening';
    targetStepTitle?: string;
    targetStepNumber?: number;
  }>({ active: false, state: 'closing' });

  // Book page flip animation state
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  // Show full course roadmap syllabus drawer
  const [showFullSyllabus, setShowFullSyllabus] = useState<boolean>(false);

  const currentStep: LearningStep = curriculum.steps[activeStepIndex] || curriculum.steps[0];
  const storageKey = `linkora_progress_${curriculum.id}`;

  // Assemble all videos for current step (supports multiple videos + fallback)
  const stepVideos: TopicVideo[] = React.useMemo(() => {
    if (!currentStep) return [];
    if (currentStep.videos && currentStep.videos.length > 0) {
      return currentStep.videos;
    }
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

  // Set default selected video when step changes
  useEffect(() => {
    if (stepVideos.length > 0) {
      setSelectedVideoId(stepVideos[0].id || 'v-primary');
    }
  }, [activeStepIndex, stepVideos]);

  const activeVideo: TopicVideo | null =
    stepVideos.find((v) => v.id === selectedVideoId) || stepVideos[0] || null;

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompletedSteps(parsed);
      }
    } catch {}
  }, [storageKey]);

  // Sync compiler starter code when step changes
  useEffect(() => {
    if (currentStep) {
      setCompilerCode(currentStep.compilerStarterCode);
      setActiveQuestion(null);
    }
  }, [activeStepIndex, currentStep]);

  const toggleStepCompleted = (stepNum: number) => {
    let updated: number[];
    if (completedSteps.includes(stepNum)) {
      updated = completedSteps.filter((s) => s !== stepNum);
    } else {
      updated = [...completedSteps, stepNum];
    }
    setCompletedSteps(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
  };

  // Trigger dual-door closing and opening transition to advance step
  const handleNextStep = () => {
    if (activeStepIndex < curriculum.steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      const targetStep = curriculum.steps[nextIdx];
      if (!completedSteps.includes(currentStep.stepNumber)) {
        toggleStepCompleted(currentStep.stepNumber);
      }

      // Step 1: Doors slam shut from both sides
      setDoorTransition({
        active: true,
        state: 'closing',
        targetStepTitle: targetStep.title,
        targetStepNumber: targetStep.stepNumber,
      });

      // Step 2: Once doors meet in center, advance stage behind closed doors
      setTimeout(() => {
        setActiveStepIndex(nextIdx);
        window.scrollTo({ top: 120, behavior: 'instant' });
        setDoorTransition((prev) => ({ ...prev, state: 'closed' }));

        // Step 3: Doors swing open from both sides, revealing the new stage!
        setTimeout(() => {
          setDoorTransition((prev) => ({ ...prev, state: 'opening' }));

          // Step 4: Reset animation state
          setTimeout(() => {
            setDoorTransition({ active: false, state: 'closing' });
          }, 450);
        }, 120);
      }, 400);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      const prevIdx = activeStepIndex - 1;
      const targetStep = curriculum.steps[prevIdx];

      setDoorTransition({
        active: true,
        state: 'closing',
        targetStepTitle: targetStep.title,
        targetStepNumber: targetStep.stepNumber,
      });

      setTimeout(() => {
        setActiveStepIndex(prevIdx);
        window.scrollTo({ top: 120, behavior: 'instant' });
        setDoorTransition((prev) => ({ ...prev, state: 'closed' }));

        setTimeout(() => {
          setDoorTransition((prev) => ({ ...prev, state: 'opening' }));
          setTimeout(() => {
            setDoorTransition({ active: false, state: 'closing' });
          }, 450);
        }, 120);
      }, 400);
    }
  };

  const handleSelectStep = (idx: number) => {
    if (idx === activeStepIndex) return;
    const targetStep = curriculum.steps[idx];

    setDoorTransition({
      active: true,
      state: 'closing',
      targetStepTitle: targetStep.title,
      targetStepNumber: targetStep.stepNumber,
    });

    setTimeout(() => {
      setActiveStepIndex(idx);
      window.scrollTo({ top: 120, behavior: 'instant' });
      setDoorTransition((prev) => ({ ...prev, state: 'closed' }));

      setTimeout(() => {
        setDoorTransition((prev) => ({ ...prev, state: 'opening' }));
        setTimeout(() => {
          setDoorTransition({ active: false, state: 'closing' });
        }, 450);
      }, 120);
    }, 400);
  };

  const handleLoadQuestionToCompiler = (q: PracticeQuestion) => {
    setActiveQuestion(q);
    setCompilerCode(q.starterCode);
    setActiveTab('compiler');
  };

  const progressPercent = Math.round((completedSteps.length / curriculum.steps.length) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Header / Breadcrumb & Progress */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700/80 flex items-center gap-1.5 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Languages</span>
            </button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{curriculum.icon}</span>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  {curriculum.title}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${curriculum.badgeBg}`}
                  >
                    {curriculum.track}
                  </span>
                </h1>
                <p className="text-xs text-slate-400">{curriculum.tagline}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar & Syllabus Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFullSyllabus(!showFullSyllabus)}
              className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <BookMarked className="w-4 h-4 text-indigo-400" />
              <span>{showFullSyllabus ? 'Hide Syllabus' : 'Full Course Syllabus'}</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-mono">Completed:</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  {completedSteps.length}/{curriculum.steps.length} Steps ({progressPercent}%)
                </div>
              </div>
              <div className="w-20 sm:w-28 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Full Syllabus drawer if toggled */}
        {showFullSyllabus && (
          <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
              <span className="text-indigo-400 font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Course Outline ({curriculum.steps.length} Steps • {curriculum.estimatedTotalHours})
              </span>
              <span>Overview</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {curriculum.steps.map((st, i) => {
                const isCur = i === activeStepIndex;
                const isDone = completedSteps.includes(st.stepNumber);
                return (
                  <div
                    key={st.stepNumber}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                      isCur
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : isDone
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isCur
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isDone ? '✓' : st.stepNumber}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">Step {st.stepNumber}: {st.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{st.estimatedTime}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Book Container with Realistic Page Flip Animation */}
      <div
        className={`transition-all duration-350 transform ${
          isFlipping
            ? flipDirection === 'next'
              ? 'opacity-40 -rotate-1 scale-[0.98] translate-x-2'
              : 'opacity-40 rotate-1 scale-[0.98] -translate-x-2'
            : 'opacity-100 rotate-0 scale-100 translate-x-0'
        }`}
        style={{ transformOrigin: flipDirection === 'next' ? 'left center' : 'right center' }}
      >
        {/* Current Step Overview Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
              <span>STEP {currentStep.stepNumber} OF {curriculum.steps.length}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" />
                {currentStep.estimatedTime}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">{currentStep.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{currentStep.summary}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => toggleStepCompleted(currentStep.stepNumber)}
              className={`text-xs px-3.5 py-2 rounded-xl transition-all border ${
                completedSteps.includes(currentStep.stepNumber)
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {completedSteps.includes(currentStep.stepNumber) ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Step Completed
                </>
              ) : (
                'Mark Step Done'
              )}
            </Button>
          </div>
        </div>

        {/* 4 Tabs in EXACT Order Requested in 2nd Image:
            1. Video Lecture -> 2. Practice Questions -> 3. Study Material -> 4. Live Compiler */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md overflow-x-auto scrollbar-none mb-6">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'video'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>1. Video Lecture {stepVideos.length > 1 ? `(${stepVideos.length})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>2. Practice Questions ({currentStep.practiceQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'study'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Study Material</span>
          </button>

          <button
            onClick={() => setActiveTab('compiler')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'compiler'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>4. Live Compiler</span>
          </button>
        </div>

        {/* Tab 1: Video Lecture (With Multi-Video Side Playlist + Next Step Button Inside) */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
                    <span>STEP {currentStep.stepNumber} LECTURE</span>
                    {activeVideo?.instructor && <span>• Instructor: {activeVideo.instructor}</span>}
                    {activeVideo?.duration && <span>• Duration: {activeVideo.duration}</span>}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    {activeVideo?.title || currentStep.title}
                  </h3>
                </div>

                {activeVideo?.videoUrl && (
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-mono px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 w-fit shrink-0"
                  >
                    Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Main Video Player + Side Playlist (if multiple videos exist) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className={`${stepVideos.length > 1 ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-4`}>
                  {/* Embedded Video Player */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black">
                    {activeVideo?.youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
                        title={activeVideo.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        No video available for this step
                      </div>
                    )}
                  </div>

                  {/* Notes & Timestamp guide */}
                  {activeVideo?.notes && (
                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300">
                      <span className="font-semibold text-amber-400">Instructor Timestamp Guide: </span>
                      {activeVideo.notes}
                    </div>
                  )}
                </div>

                {/* Multiple Videos Side Playlist Rail */}
                {stepVideos.length > 1 && (
                  <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
                      <ListVideo className="w-4 h-4 text-rose-400" />
                      <span>Topic Playlist ({stepVideos.length} Videos)</span>
                    </div>

                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {stepVideos.map((vid, vIdx) => {
                        const isCurVid = vid.id === selectedVideoId;
                        return (
                          <button
                            key={vid.id || vIdx}
                            onClick={() => setSelectedVideoId(vid.id || `v-${vIdx}`)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 ${
                              isCurVid
                                ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-md'
                                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                isCurVid ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {vIdx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold truncate text-slate-200">
                                {vid.title}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                <span>{vid.instructor}</span>
                                {vid.duration && <span>• {vid.duration}</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* "NEXT STEP" Button specifically inside the Video Lecture tab! */}
              <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={activeStepIndex === 0}
                  className="w-full sm:w-auto text-xs px-5 py-2.5 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous Step (Step {activeStepIndex})
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {activeStepIndex === curriculum.steps.length - 1 ? (
                    <Button
                      onClick={() => {
                        if (!completedSteps.includes(currentStep.stepNumber)) {
                          toggleStepCompleted(currentStep.stepNumber);
                        }
                        alert('🏆 Congratulations! You have completed all steps in this curriculum! You are now a fully developed coder.');
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20"
                    >
                      <Award className="w-4 h-4 mr-1.5" />
                      Complete Course & Claim Badge 🏆
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextStep}
                      className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <span>Complete Lecture & Next Step: Step {activeStepIndex + 2}</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Practice Questions */}
        {activeTab === 'practice' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                Practice Questions for Step {currentStep.stepNumber}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Solve coding challenges tailored to this topic. Click &quot;Solve in Compiler&quot; to test your code in our online sandbox!
              </p>
            </div>

            {currentStep.practiceQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {q.difficulty}
                    </span>
                    <h4 className="text-base font-bold text-white">{q.title}</h4>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleLoadQuestionToCompiler(q)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 w-fit"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    Solve in Compiler
                  </Button>
                </div>

                <div className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                  {q.description}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                    <div className="text-slate-400 font-semibold mb-1">Expected Output:</div>
                    <pre className="text-emerald-400 whitespace-pre-wrap">{q.expectedOutput}</pre>
                  </div>
                  {q.hints && q.hints.length > 0 && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                      <div className="text-amber-400 font-semibold mb-1">💡 Hints:</div>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        {q.hints.map((hint, hi) => (
                          <li key={hi}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Study Material */}
        {activeTab === 'study' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Comprehensive Study Notes: {currentStep.topic}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  College-level concepts, architectural notes, and syntax foundations.
                </p>
              </div>
              {currentStep.studyMaterial.officialDocUrl && (
                <a
                  href={currentStep.studyMaterial.officialDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-mono hover:underline"
                >
                  Official Docs <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Overview */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 leading-relaxed">
              {currentStep.studyMaterial.overview}
            </div>

            {/* Key Conceptual Points */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Core Takeaways & Rules
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentStep.studyMaterial.keyPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs sm:text-sm text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      {i + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Examples */}
            {currentStep.studyMaterial.codeExamples && currentStep.studyMaterial.codeExamples.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  Code Walkthrough
                </h4>
                {currentStep.studyMaterial.codeExamples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-300">
                      <span>{ex.title}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setCompilerCode(ex.code);
                          setActiveTab('compiler');
                        }}
                        className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Try in Compiler
                      </Button>
                    </div>
                    <pre className="p-4 text-xs sm:text-sm text-emerald-200 font-mono overflow-x-auto leading-relaxed">
                      {ex.code}
                    </pre>
                    {ex.explanation && (
                      <div className="p-3 bg-slate-900/50 border-t border-slate-800/70 text-xs text-slate-400">
                        💡 {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Cheatsheet */}
            {currentStep.studyMaterial.cheatsheet && (
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 font-mono">
                  ⚡ Quick Cheatsheet Rules
                </h4>
                <ul className="space-y-1.5 text-xs text-indigo-200/90 font-mono">
                  {currentStep.studyMaterial.cheatsheet.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-indigo-400">→</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Live Compiler */}
        {activeTab === 'compiler' && (
          <div className="space-y-4">
            {activeQuestion && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs font-mono text-indigo-300">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>
                    Currently Solving: <strong className="text-white">{activeQuestion.title}</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveQuestion(null);
                    setCompilerCode(currentStep.compilerStarterCode);
                  }}
                  className="text-slate-400 hover:text-white underline"
                >
                  Reset to Step Default Code
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
      </div>

      {/* GRAND DOUBLE-DOOR CLOSING & OPENING STAGE PORTAL */}
      {doorTransition.active && (
        <div className="fixed inset-0 z-50 pointer-events-none flex overflow-hidden">
          {/* Left Door */}
          <div
            className={`w-1/2 h-full bg-slate-950 border-r-2 border-indigo-500 shadow-[10px_0_50px_rgba(99,102,241,0.5)] transition-transform duration-400 ease-in-out flex flex-col justify-center items-end pr-10 relative ${
              doorTransition.state === 'closing' || doorTransition.state === 'closed'
                ? 'translate-x-0'
                : '-translate-x-full'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 opacity-90" />
            <div className="relative space-y-6 opacity-30 select-none">
              <div className="w-56 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-indigo-400 rounded-full" />
              <div className="w-36 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-indigo-400 rounded-full" />
              <div className="w-72 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-indigo-400 rounded-full" />
            </div>
          </div>

          {/* Right Door */}
          <div
            className={`w-1/2 h-full bg-slate-950 border-l-2 border-indigo-500 shadow-[-10px_0_50px_rgba(99,102,241,0.5)] transition-transform duration-400 ease-in-out flex flex-col justify-center items-start pl-10 relative ${
              doorTransition.state === 'closing' || doorTransition.state === 'closed'
                ? 'translate-x-0'
                : 'translate-x-full'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 opacity-90" />
            <div className="relative space-y-6 opacity-30 select-none">
              <div className="w-56 h-1 bg-gradient-to-l from-transparent via-indigo-500 to-indigo-400 rounded-full" />
              <div className="w-36 h-1 bg-gradient-to-l from-transparent via-indigo-500 to-indigo-400 rounded-full" />
              <div className="w-72 h-1 bg-gradient-to-l from-transparent via-indigo-500 to-indigo-400 rounded-full" />
            </div>
          </div>

          {/* Central Emblem / Stage Lock when doors are shut */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              doorTransition.state === 'closing' || doorTransition.state === 'closed'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-90'
            }`}
          >
            <div className="p-8 rounded-3xl bg-slate-900/95 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/50 flex flex-col items-center gap-3 text-center max-w-md mx-4 backdrop-blur-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 animate-pulse">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  Stage Complete • Unlocking
                </div>
                <div className="text-xl font-extrabold text-white">
                  Step {doorTransition.targetStepNumber}: {doorTransition.targetStepTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
