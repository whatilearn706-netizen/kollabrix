'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Lightbulb,
  Play,
  Terminal,
} from 'lucide-react';
import type { LearningStep, PracticeQuestion, TopicVideo } from '@/types/curriculum';

interface VideoStageProps {
  currentStep: LearningStep;
  stepVideos: TopicVideo[];
  activeVideo: TopicVideo | null;
  selectedVideoId: string;
  onSelectVideo: (id: string) => void;
  activeStepIndex: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onFinishCourse: () => void;
  onGoToNotes: () => void;
}

/**
 * Focused single-stage video lecture view matching Kollabrix's dark editorial studio theme.
 */
export function VideoStage({
  currentStep,
  stepVideos,
  activeVideo,
  selectedVideoId,
  onSelectVideo,
  activeStepIndex,
  totalSteps,
  onPrevStep,
  onNextStep,
  onFinishCourse,
  onGoToNotes,
}: VideoStageProps) {
  return (
    <div className="space-y-6">
      {/* Compact Video Switcher Chips when multiple videos exist */}
      {stepVideos.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mr-1">
            Playlist ({stepVideos.length})
          </span>
          {stepVideos.map((vid, idx) => {
            const vidKey = vid.id || `v-${idx}`;
            const active = vidKey === selectedVideoId;
            return (
              <button
                key={vidKey}
                type="button"
                onClick={() => onSelectVideo(vidKey)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-2 border ${
                  active
                    ? 'bg-[#FAF8F5] text-[#07090E] border-white font-semibold shadow-sm'
                    : 'bg-white/[0.03] text-zinc-300 border-white/10 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>0{idx + 1}</span>
                <span className="truncate max-w-[200px]">{vid.title}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Cinema Video Player Frame */}
      <div className="rounded-3xl border border-white/10 bg-[#05070B] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.85)]">
        <div className="relative w-full aspect-video bg-black">
          {activeVideo?.youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
              title={activeVideo.title || currentStep.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-xs">
              Video unavailable for this step. Switch to Notes or Sandbox.
            </div>
          )}
        </div>

        {/* Minimal Sub-Player Caption Bar */}
        <div className="px-5 sm:px-7 py-4 bg-[#0A0E17] border-t border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-sky-300">
              {activeVideo?.instructor || 'KΛ Folio'} {activeVideo?.duration ? `· ${activeVideo.duration}` : ''}
            </p>
            <h3 className="text-sm sm:text-base font-semibold text-white truncate">
              {activeVideo?.title || currentStep.title}
            </h3>
            {activeVideo?.notes && (
              <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">{activeVideo.notes}</p>
            )}
          </div>

          {activeVideo?.videoUrl && (
            <a
              href={activeVideo.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-[11px] font-mono text-zinc-300 hover:text-white w-fit shrink-0 transition-colors"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Serene Step Flow Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onPrevStep}
          disabled={activeStepIndex === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onGoToNotes}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-xs font-mono text-zinc-200 hover:text-white cursor-pointer transition-all"
          >
            <span>Read Key Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {activeStepIndex === totalSteps - 1 ? (
            <button
              type="button"
              onClick={onFinishCourse}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5] text-[#07090E] hover:bg-sky-100 text-xs font-semibold cursor-pointer shadow-[0_10px_30px_rgba(255,255,255,0.14)] transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Finish Track</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onNextStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5] text-[#07090E] hover:bg-sky-100 text-xs font-semibold cursor-pointer shadow-[0_10px_30px_rgba(255,255,255,0.14)] transition-all"
            >
              <span>Complete &amp; Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StudyStageProps {
  currentStep: LearningStep;
  onOpenInSandbox: (code: string) => void;
  onGoToPractice: () => void;
}

/**
 * Calm editorial study guide view with generous spacing and minimal clutter.
 */
export function StudyStage({
  currentStep,
  onOpenInSandbox,
  onGoToPractice,
}: StudyStageProps) {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Editorial Overview */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/90 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-sky-300">
            Concept Overview · {currentStep.topic}
          </span>
          {currentStep.studyMaterial.officialDocUrl && (
            <a
              href={currentStep.studyMaterial.officialDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              <span>Official Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
          {currentStep.studyMaterial.overview}
        </p>
      </div>

      {/* Numbered Core Takeaways */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-sky-300" />
          <span>Core Rules &amp; Takeaways</span>
        </h3>
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A0E17]/70 divide-y divide-white/[0.06] overflow-hidden">
          {currentStep.studyMaterial.keyPoints.map((pt, i) => (
            <div key={i} className="px-5 py-4 flex items-start gap-4 text-sm text-zinc-200 leading-relaxed">
              <span className="text-xs font-mono text-sky-300 pt-0.5 shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Code Walkthrough */}
      {currentStep.studyMaterial.codeExamples && currentStep.studyMaterial.codeExamples.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-sky-300" />
            <span>Code Walkthrough</span>
          </h3>
          {currentStep.studyMaterial.codeExamples.map((ex, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-[#05070C] overflow-hidden shadow-xl"
            >
              <div className="px-5 py-3 bg-[#0B0F18] border-b border-white/[0.07] flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-200">{ex.title}</span>
                <button
                  type="button"
                  onClick={() => onOpenInSandbox(ex.code)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] text-[#07090E] hover:bg-sky-100 text-[11px] font-semibold cursor-pointer transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Try in Sandbox</span>
                </button>
              </div>
              <pre className="p-5 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
                <code>{ex.code}</code>
              </pre>
              {ex.explanation && (
                <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06] text-xs text-zinc-400">
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Cheatsheet */}
      {currentStep.studyMaterial.cheatsheet && currentStep.studyMaterial.cheatsheet.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-2.5">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            Quick Syntax Cheatsheet
          </p>
          <ul className="space-y-1.5 text-xs sm:text-sm font-mono text-slate-300">
            {currentStep.studyMaterial.cheatsheet.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-sky-300">—</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onGoToPractice}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5] text-[#07090E] hover:bg-sky-100 text-xs font-semibold cursor-pointer shadow-[0_10px_30px_rgba(255,255,255,0.14)] transition-all"
        >
          <span>Practice {currentStep.practiceQuestions.length} Challenges</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

interface PracticeStageProps {
  questions: PracticeQuestion[];
  onSolveQuestion: (q: PracticeQuestion) => void;
}

/**
 * Decluttered practice challenge list with hints & expected output hidden by default until clicked.
 */
export function PracticeStage({ questions, onSolveQuestion }: PracticeStageProps) {
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});
  const [openOutputs, setOpenOutputs] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenHints({});
    setOpenOutputs({});
  }, [questions]);

  return (
    <div className="space-y-4 max-w-4xl">
      {questions.map((q, idx) => {
        const hintVisible = Boolean(openHints[q.id]);
        const outputVisible = Boolean(openOutputs[q.id]);
        return (
          <div
            key={q.id}
            className="rounded-3xl border border-white/[0.09] bg-[#0A0E17]/90 overflow-hidden transition-colors hover:border-white/20"
          >
            <div className="p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-white">{q.title}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/[0.05] border border-white/10 text-sky-300">
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                    {q.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {q.hints && q.hints.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenHints((prev) => ({ ...prev, [q.id]: !hintVisible }))}
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-full border text-[11px] font-mono cursor-pointer transition-all ${
                      hintVisible
                        ? 'bg-sky-400/15 border-sky-400/40 text-sky-200'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/25 text-zinc-300'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 text-amber-300" />
                    <span>{hintVisible ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setOpenOutputs((prev) => ({ ...prev, [q.id]: !outputVisible }))}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10 hover:border-white/25 text-[11px] font-mono text-zinc-300 cursor-pointer transition-all"
                >
                  <span>{outputVisible ? 'Hide Output' : 'Expected Output'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${outputVisible ? 'rotate-180' : ''}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => onSolveQuestion(q)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] text-[#07090E] hover:bg-sky-100 text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Solve</span>
                </button>
              </div>
            </div>

            {(hintVisible || outputVisible) && (
              <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#07090E]/70">
                {outputVisible && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.07] font-mono text-xs">
                    <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5">
                      Expected Output
                    </div>
                    <pre className="text-emerald-300 whitespace-pre-wrap">{q.expectedOutput}</pre>
                  </div>
                )}
                {hintVisible && q.hints && q.hints.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.07] font-mono text-xs">
                    <div className="text-sky-300 text-[10px] uppercase tracking-wider mb-1.5">
                      Hints
                    </div>
                    <ul className="space-y-1 text-zinc-300">
                      {q.hints.map((hint, hi) => (
                        <li key={hi} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-sky-400 mt-0.5 shrink-0" />
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
