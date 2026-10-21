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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LanguageCurriculum, LearningStep, PracticeQuestion } from '@/types/curriculum';
import { InteractiveCompiler } from './InteractiveCompiler';

interface StepLearningWorkspaceProps {
  curriculum: LanguageCurriculum;
  onBack: () => void;
  onTrackChange?: () => void;
}

export function StepLearningWorkspace({ curriculum, onBack }: StepLearningWorkspaceProps) {
  // Current active step index (0-indexed)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  // Active inner tab: 'study' | 'video' | 'practice' | 'compiler'
  const [activeTab, setActiveTab] = useState<'study' | 'video' | 'practice' | 'compiler'>('study');
  // Completed step numbers stored in state and localStorage
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  // Practice question currently loaded into compiler
  const [activeQuestion, setActiveQuestion] = useState<PracticeQuestion | null>(null);
  const [compilerCode, setCompilerCode] = useState<string>('');

  const currentStep: LearningStep = curriculum.steps[activeStepIndex] || curriculum.steps[0];
  const storageKey = `linkora_progress_${curriculum.id}`;

  // Load progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompletedSteps(parsed);
      }
    } catch {}
  }, [storageKey]);

  // Sync compiler code when active step changes
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

  const handleNextStep = () => {
    // Automatically mark current step as completed if not already
    if (!completedSteps.includes(currentStep.stepNumber)) {
      toggleStepCompleted(currentStep.stepNumber);
    }
    if (activeStepIndex < curriculum.steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
      <div className="bg-slate-900/70 border border-slate-800 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
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
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${curriculum.badgeBg}`}>
                    {curriculum.track}
                  </span>
                </h1>
                <p className="text-xs text-slate-400">{curriculum.tagline}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-xl">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-mono">Progress:</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {completedSteps.length}/{curriculum.steps.length} Steps ({progressPercent}%)
              </div>
            </div>
            <div className="w-24 sm:w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {curriculum.steps.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isDone = completedSteps.includes(step.stepNumber);
              return (
                <button
                  key={step.stepNumber}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-500/30'
                      : isDone
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                  )}
                  <span>
                    Step {step.stepNumber}: {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Step Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span>STEP {currentStep.stepNumber} OF {curriculum.steps.length}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              {currentStep.estimatedTime}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">{currentStep.title}</h2>
          <p className="text-sm text-slate-300 max-w-3xl">{currentStep.summary}</p>
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
                Completed
              </>
            ) : (
              'Mark as Done'
            )}
          </Button>
        </div>
      </div>

      {/* Main 4 Modular Tabs: Study Material | Videos | Practice Questions | Compiler */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'study'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Study Material</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'video'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>2. Video Lecture</span>
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
          <span>3. Practice Questions ({currentStep.practiceQuestions.length})</span>
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

      {/* Tab 1: Study Material */}
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

      {/* Tab 2: Video Lecture */}
      {activeTab === 'video' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
                <span>LECTURE FOR STEP {currentStep.stepNumber}</span>
                <span>•</span>
                <span>Instructor: {currentStep.video.instructor}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{currentStep.video.title}</h3>
            </div>
            <a
              href={currentStep.video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-mono px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 w-fit"
            >
              Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 16:9 YouTube Video Embed Player */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentStep.video.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
              title={currentStep.video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {currentStep.video.notes && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300">
              <span className="font-semibold text-amber-400">Instructor Timestamp Guide: </span>
              {currentStep.video.notes}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Practice Questions */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              Practice Questions for Step {currentStep.stepNumber}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Test your skills immediately. Click &quot;Solve in Compiler&quot; to load starter code directly into our online sandbox!
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

      {/* Tab 4: Interactive Compiler */}
      {activeTab === 'compiler' && (
        <div className="space-y-4">
          {activeQuestion && (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs font-mono text-indigo-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Currently Solving: <strong className="text-white">{activeQuestion.title}</strong></span>
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

      {/* Bottom Step Actions (Previous / Mark Done / Next Step) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={activeStepIndex === 0}
          className="w-full sm:w-auto text-xs px-5 py-2.5 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous Step
        </Button>

        <div className="flex items-center gap-2">
          {activeStepIndex === curriculum.steps.length - 1 ? (
            <Button
              onClick={() => {
                if (!completedSteps.includes(currentStep.stepNumber)) {
                  toggleStepCompleted(currentStep.stepNumber);
                }
                alert('🏆 Congratulations! You completed all steps in this curriculum! You are now a fully developed coder in this stack.');
              }}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20"
            >
              <Award className="w-4 h-4 mr-1.5" />
              Complete Course & Claim Badge 🏆
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5"
            >
              <span>Next Step: Step {activeStepIndex + 2}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
