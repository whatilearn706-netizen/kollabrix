'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Zap,
  Bot,
  Copy,
  Check,
  ArrowRight,
  Layers,
  Code2,
  Users,
  Calendar,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Trophy,
  Target,
  FileText,
  Briefcase,
  Lightbulb,
  Share2,
  ExternalLink,
  ShieldAlert,
  Flame,
  Award,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SparkBlueprintResponse } from '@/app/api/ai/spark/route';

const HACKATHON_TRACKS = [
  { id: 'open', label: '⚡ Open Brainstorm', promptPrefix: '' },
  { id: 'sih', label: '🏆 Smart India Hackathon (SIH 2026)', promptPrefix: 'Smart India Hackathon track: ' },
  { id: 'google', label: '🌍 Google Solution Challenge (SDGs)', promptPrefix: 'Google Solution Challenge SDG track: ' },
  { id: 'web3', label: '🔗 Web3 & Decentralized (ETHIndia)', promptPrefix: 'Web3 decentralized dApp for ' },
  { id: 'campus', label: '🏫 Campus Life & Student Utilities', promptPrefix: 'Campus student utility: ' },
  { id: 'agents', label: '🤖 Agentic AI & Autonomous Copilots', promptPrefix: 'Agentic AI tool: ' },
];

const QUICK_INSPIRATIONS = [
  'Hostel Midnight Food Delivery & Peer Cart Pool',
  'Autonomous Drone Delivery for Campuses',
  'AI Attendance with Anti-Spoof Face Liveness',
  'Smart AgriTech Pest Diagnosis via Edge WASM',
  'Micro-Grants DAO for Student Open-Source',
  'Real-Time College Carpool & Ride Share Radar',
  'AI Lecture Audio to Anki Flashcards & Summary',
  'Campus EV Micro-Mobility & Battery Station Swapper',
  'Decentralized Degree & Certificate Verifier on Polygon',
  'Lab Equipment Slot Booking & Sensor Telemetry',
  'Peer-to-Peer Campus Textbook & Gadget Exchange',
  'ProctorGuard: Browser Sandbox with Eye-Gaze Tracking',
];

const THINKING_STEPS = [
  'Analyzing problem statement & domain ontology...',
  'Benchmarking novelty against 100+ hackathon rubrics...',
  'Architecting multi-tier tech stack & database models...',
  'Calculating team skill gaps & recruiting profiles...',
  'Synthesizing winning elevator pitch & resume proof-of-work...',
];

export default function SparkStudioPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('open');
  const [userSkills, setUserSkills] = useState<string>('');
  const [showSkillInput, setShowSkillInput] = useState<boolean>(false);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [thinkingIndex, setThinkingIndex] = useState<number>(0);
  const [blueprint, setBlueprint] = useState<SparkBlueprintResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Step ticker during generation
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setThinkingIndex(0);
      interval = setInterval(() => {
        setThinkingIndex((prev) => (prev < THINKING_STEPS.length - 1 ? prev + 1 : prev));
      }, 750);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (customPrompt?: string) => {
    const textToRun = (customPrompt || prompt).trim();
    if (!textToRun || textToRun.length < 5) {
      setErrorMsg('Please describe what you want to build (at least 5 characters).');
      return;
    }

    // Client-side quick validation against random keystrokes / gibberish
    const words = textToRun.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      setErrorMsg(
        "Please enter a complete project concept with at least 2–3 words (e.g. 'AI attendance with face liveness' or 'Hostel midnight cart pooling'). A single random word cannot be architected into an engineering blueprint."
      );
      return;
    }

    if (/(.)\1{3,}/.test(textToRun)) {
      setErrorMsg('Your prompt contains repetitive test characters. Please describe a genuine project concept.');
      return;
    }

    const mashPatterns = [/asdf/i, /hjkl/i, /qwer/i, /zxcv/i, /12345/i, /blabla/i, /test123/i];
    if (mashPatterns.some((rx) => rx.test(textToRun)) && words.length <= 3) {
      setErrorMsg('Please enter a meaningful project concept. The prompt looks like random keyboard typing.');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);
    setBlueprint(null);

    const trackObj = HACKATHON_TRACKS.find((t) => t.id === selectedTrack);

    try {
      const res = await fetch('/api/ai/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToRun,
          track: trackObj && trackObj.id !== 'open' ? trackObj.label : undefined,
          userSkills: userSkills.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize blueprint');
      }

      setBlueprint(data.blueprint);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while generating the blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyBlueprintMarkdown = () => {
    if (!blueprint) return;
    const scores = blueprint.scores;
    const md = `# ${blueprint.title}
*${blueprint.tagline}*

**Category:** ${blueprint.category} | **Difficulty:** ${blueprint.difficulty} | **Track:** ${blueprint.hackathonTrack || 'Open'}
**AI Engine:** ${blueprint.engine}

---

## 🏆 Hackathon Judging Scorecard
- **Overall Hackathon Readiness:** ${Math.round(scores?.overall || 85)}/100
- **🛠️ Technical Depth & Architecture:** ${scores?.technicalComplexity ?? 85}/100
- **💡 Novelty & Differentiation:** ${scores?.novelty ?? 85}/100
- **⏱️ 48-Hour Weekend Feasibility:** ${scores?.feasibility ?? 85}/100
- **🎯 Real-World Problem Impact:** ${scores?.impact ?? 85}/100
- *Judge Critique:* ${scores?.critique || 'High competitive appeal.'}

## ⚡ The Winning Twist
${blueprint.winningTwist}

## 🎤 30-Second Elevator Pitch
- **Problem:** ${blueprint.elevatorPitch?.problem}
- **Solution:** ${blueprint.elevatorPitch?.solution}
- **Unfair Advantage:** ${blueprint.elevatorPitch?.unfairAdvantage}

## 🛠️ Recommended Tech Stack
${blueprint.technologies.map((t) => `- ${t}`).join('\n')}

## 👥 Squad Roles Needed
${blueprint.rolesBreakdown
  .map(
    (r) =>
      `### ${r.role} ${r.isCoveredByUser ? '(Covered by You)' : '(Recruit on Kollabrix)'}
- **Skills:** ${r.skills.join(', ')}
- **Focus:** ${r.focus}`
  )
  .join('\n\n')}

## 💼 Placement & Resume Bullet Points
${blueprint.resumeBullets?.map((b) => `- ${b}`).join('\n')}

## 📅 Roadmap & Milestones
${blueprint.milestones
  .map((m, i) => `${i + 1}. **${m.title}** (${m.duration})\n   - *Deliverables:* ${m.deliverables}`)
  .join('\n\n')}

---
*Synthesized by Kollabrix AI Spark Studio (https://kollabrix.com/spark)*
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyElevatorPitchOnly = () => {
    if (!blueprint?.elevatorPitch) return;
    const pitch = `Problem: ${blueprint.elevatorPitch.problem}\nSolution: ${blueprint.elevatorPitch.solution}\nUnfair Advantage: ${blueprint.elevatorPitch.unfairAdvantage}`;
    navigator.clipboard.writeText(pitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleConvertToProject = () => {
    if (!blueprint) return;
    try {
      sessionStorage.setItem(
        'linkora_prefill_project',
        JSON.stringify({
          title: blueprint.title,
          tagline: blueprint.tagline,
          description: `${blueprint.summary}\n\nWinning Angle: ${blueprint.winningTwist}`,
          category: blueprint.category,
          technologies: blueprint.technologies,
          roles: blueprint.desired_roles,
        })
      );
    } catch (e) {}

    router.push('/projects/new?spark=true');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI SPARK • HACKATHON &amp; SQUAD STUDIO</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Turn Rough Ideas into Winning Squads
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Give us any project prompt or hackathon theme. Our synthesis engine generates an actionable architecture, winning judge angle, teammate gap analysis, and ATS-ready resume proof-of-work.
          </p>
        </div>

        {/* Input Console */}
        <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-6 sm:p-8 shadow-sm space-y-5">
          {/* Track Selector Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Competition Track / Objective:
            </label>
            <div className="flex flex-wrap gap-2">
              {HACKATHON_TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrack(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    selectedTrack === t.id
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-charcoal-700 hover:border-amber-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Idea Prompt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                What do you want to build?
              </label>
              <button
                type="button"
                onClick={() => setShowSkillInput(!showSkillInput)}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{showSkillInput ? 'Hide Skills' : '+ Audit My Squad Gap'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Build an autonomous drone dispatch system for large campuses that delivers lab equipment and library books..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-y"
            />
          </div>

          {/* Optional Squad Gap Input */}
          {showSkillInput && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Your Current Skills (AI will calculate missing team roles):</span>
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400">Optional</span>
              </div>
              <input
                type="text"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                placeholder="e.g. React, Tailwind, Next.js (or: Python, PyTorch)"
                className="w-full px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-white dark:bg-charcoal-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          {/* Quick Inspiration Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Popular Inspirations:
            </span>
            <div className="flex flex-wrap gap-2">
              {QUICK_INSPIRATIONS.map((insp) => (
                <button
                  key={insp}
                  type="button"
                  onClick={() => {
                    setPrompt(insp);
                    handleGenerate(insp);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-charcoal-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-charcoal-700 transition-all cursor-pointer"
                >
                  ⚡ {insp}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{THINKING_STEPS[thinkingIndex]}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Engineering Blueprint &amp; Squad Spec</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Blueprint View */}
        {blueprint && (
          <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-amber-500/30 p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Top Bar: Badges & Title */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-charcoal-800 pb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    {blueprint.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400">
                    Difficulty: {blueprint.difficulty}
                  </span>
                  {blueprint.hackathonTrack && (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400">
                      {blueprint.hackathonTrack}
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{blueprint.engine}</span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {blueprint.title}
                </h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {blueprint.tagline}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={copyBlueprintMarkdown}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 hover:bg-slate-100 dark:hover:bg-charcoal-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleConvertToProject}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>Launch Live Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scorecard Matrix */}
            {blueprint.scores && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      Official Hackathon Judging Rubric &amp; Readiness
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-2xs">
                    {Math.round(blueprint.scores.overall)}/100 Overall Score
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* 1. Technical Complexity */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <span>🛠️ Tech Depth</span>
                      </span>
                      <span className="font-extrabold text-blue-600 dark:text-blue-400">
                        {blueprint.scores.technicalComplexity ?? 80}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-charcoal-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                        style={{ width: `${blueprint.scores.technicalComplexity ?? 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      Multi-tier architecture, telemetry &amp; non-trivial data pipelines.
                    </p>
                  </div>

                  {/* 2. Novelty & Differentiation */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <span>💡 Novelty</span>
                      </span>
                      <span className="font-extrabold text-amber-600 dark:text-amber-400">
                        {blueprint.scores.novelty ?? 80}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-charcoal-700 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${blueprint.scores.novelty ?? 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      Unfair differentiator versus standard clones &amp; competitors.
                    </p>
                  </div>

                  {/* 3. 48h Weekend Feasibility */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <span>⏱️ 48h Feasibility</span>
                      </span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {blueprint.scores.feasibility ?? 80}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-charcoal-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${blueprint.scores.feasibility ?? 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      Realistic scope for a student squad to demo a working MVP.
                    </p>
                  </div>

                  {/* 4. Real-World Impact */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <span>🎯 Problem Impact</span>
                      </span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        {blueprint.scores.impact ?? 80}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-charcoal-700 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-700"
                        style={{ width: `${blueprint.scores.impact ?? 80}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      Severity of campus, healthcare, or societal bottleneck addressed.
                    </p>
                  </div>
                </div>

                {blueprint.scores.critique && (
                  <div className="p-3 rounded-xl bg-white/70 dark:bg-charcoal-800/80 border border-amber-500/30 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <span>💡 Principal Judge Critique &amp; Strategy:</span>
                    </div>
                    <p className="italic leading-relaxed">
                      "{blueprint.scores.critique}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* The Winning Twist */}
            {blueprint.winningTwist && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    The Winning Twist • Unfair Differentiator
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {blueprint.winningTwist}
                </p>
              </div>
            )}

            {/* 30-Second Elevator Pitch */}
            {blueprint.elevatorPitch && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span>01 • 30-Second Hackathon Elevator Pitch</span>
                  </h3>
                  <button
                    type="button"
                    onClick={copyElevatorPitchOnly}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPitch ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPitch ? 'Copied Pitch!' : 'Copy Pitch'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">The Problem</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {blueprint.elevatorPitch.problem}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">The Solution</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {blueprint.elevatorPitch.solution}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Unfair Advantage</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {blueprint.elevatorPitch.unfairAdvantage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Tech Stack (Categorized) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-violet-500" />
                <span>02 • Architecture &amp; Categorized Tech Stack</span>
              </h3>

              {blueprint.techStackByCategory ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Frontend Tier</span>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.techStackByCategory.frontend.map((t) => (
                        <span key={t} className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-slate-800 dark:text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-2">
                    <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">Backend &amp; API</span>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.techStackByCategory.backend.map((t) => (
                        <span key={t} className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-slate-800 dark:text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Database &amp; Cache</span>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.techStackByCategory.database.map((t) => (
                        <span key={t} className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-slate-800 dark:text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-2">
                    <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">AI, APIs &amp; Cloud</span>
                    <div className="flex flex-wrap gap-1.5">
                      {blueprint.techStackByCategory.aiOrCloud.map((t) => (
                        <span key={t} className="px-2 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-slate-800 dark:text-slate-200">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {blueprint.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-800 dark:text-slate-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Squad Role Breakdown & Skill Gaps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>03 • Squad Assembly &amp; Role Breakdown</span>
                </h3>
                <Link
                  href="/teammates"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Explore Matchmaker</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {blueprint.skillGaps && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{blueprint.skillGaps.analysis}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {blueprint.rolesBreakdown.map((r, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-charcoal-800/80 border border-slate-200 dark:border-charcoal-700 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          Role #{i + 1}
                        </span>
                        {r.isCoveredByUser ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30">
                            Covered by You
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                            Recruit Needed
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.role}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {r.focus}
                      </p>

                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          Key Skills:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {r.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/teammates?query=${encodeURIComponent(r.role)}`}
                      className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-charcoal-700 hover:bg-emerald-600 hover:text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Find {r.role.split(' ')[0]} Peers</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume & ATS Bullet Points */}
            {blueprint.resumeBullets && blueprint.resumeBullets.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-cyan-500" />
                  <span>04 • Placement Proof-of-Work &amp; ATS Resume Bullets</span>
                </h3>

                <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-800/40 space-y-2">
                  <p className="text-xs font-semibold text-cyan-900 dark:text-cyan-300">
                    Paste these verified technical bullets onto your resume or LinkedIn once built:
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {blueprint.resumeBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-600 font-bold">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Milestones Roadmap */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span>05 • 4-Phase Sprint Roadmap</span>
              </h3>
              <div className="space-y-2.5">
                {blueprint.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-500 font-bold text-xs flex items-center justify-center shrink-0">
                        P{i + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {m.deliverables}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300 shrink-0 self-start sm:self-center">
                      {m.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Launch Banner */}
            <div className="pt-4 border-t border-slate-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ready to turn this blueprint into reality?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Publish this project on Kollabrix so students across 38+ universities can apply to join your squad.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConvertToProject}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Recruit Squad for this Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
