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
  Sliders,
  ExternalLink,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';

interface SparkBlueprint {
  title: string;
  tagline: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  technologies: string[];
  desired_roles: string[];
  rolesBreakdown: {
    role: string;
    skills: string[];
    focus: string;
  }[];
  milestones: {
    title: string;
    duration: string;
    deliverables: string;
  }[];
  engine?: string;
}

const QUICK_INSPIRATIONS = [
  'Autonomous Drone Delivery for Campuses',
  'Hostel Midnight Food Delivery & Peer Cart Pool',
  'AI Attendance with Anti-Spoof Face Liveness',
  'Micro-Grants DAO for Student Open-Source',
  'Real-Time College Ride Share & Carpool Radar',
];

export default function SparkStudioPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [blueprint, setBlueprint] = useState<SparkBlueprint | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [templates, setTemplates] = useState<SparkTemplateItem[]>(DEFAULT_SPARK_TEMPLATES);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);

  // Fetch curated templates
  useEffect(() => {
    async function loadTemplates() {
      setIsLoadingTemplates(true);
      try {
        const res = await fetch('/api/spark/templates');
        const data = await res.json();
        if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      } catch (e) {
        console.warn('Error loading spark templates:', e);
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    loadTemplates();
  }, []);

  const handleGenerate = async (inputPrompt?: string) => {
    const textToRun = inputPrompt || prompt;
    if (!textToRun || textToRun.trim().length < 3) {
      setErrorMsg('Please enter an idea or project concept (at least 3 characters).');
      return;
    }

    setErrorMsg('');
    setIsGenerating(true);
    setBlueprint(null);

    try {
      const res = await fetch('/api/ai/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToRun }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize blueprint');
      }

      setBlueprint(data.blueprint || data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while generating the blueprint.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyBlueprintMarkdown = () => {
    if (!blueprint) return;
    const md = `# ${blueprint.title}
*${blueprint.tagline}*

**Category:** ${blueprint.category} | **Difficulty:** ${blueprint.difficulty}

## 🎯 Executive Summary
${blueprint.summary}

## 🛠️ Recommended Tech Stack
${blueprint.technologies.map((t) => `- ${t}`).join('\n')}

## 👥 Teammates & Roles Needed
${blueprint.rolesBreakdown
  .map(
    (r) =>
      `### ${r.role}\n- **Skills Required:** ${r.skills.join(', ')}\n- **Key Responsibilities:** ${r.focus}`
  )
  .join('\n\n')}

## 📅 Roadmap & Milestones
${blueprint.milestones
  .map((m, i) => `${i + 1}. **${m.title}** (${m.duration})\n   - *Deliverables:* ${m.deliverables}`)
  .join('\n\n')}

---
*Synthesized by Linkora AI Spark Studio (https://linkora.in/spark)*
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConvertToProject = () => {
    if (!blueprint) return;
    // Store in sessionStorage so /projects/new can pre-fill
    try {
      sessionStorage.setItem(
        'linkora_prefill_project',
        JSON.stringify({
          title: blueprint.title,
          tagline: blueprint.tagline,
          description: blueprint.summary,
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI SPARK PROJECT STUDIO</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Turn Rough Ideas into Real Squads
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Give us any project prompt or hackathon theme. Our synthesis engine generates an actionable architecture blueprint, role breakdown, and milestone roadmap.
          </p>
        </div>

        {/* Input Console */}
        <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              What do you want to build?
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build an autonomous drone dispatch system for large campuses that delivers lab equipment and library books..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-y"
              />
            </div>
          </div>

          {/* Quick Inspiration Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Quick Inspiration Prompts:
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
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-charcoal-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-charcoal-700 transition-all cursor-pointer"
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
                <span>Synthesizing Architecture & Roles...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Generate Engineering Blueprint</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Blueprint View */}
        {blueprint && (
          <div className="rounded-3xl bg-white dark:bg-charcoal-900 border border-amber-500/30 p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-charcoal-800 pb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    {blueprint.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400">
                    Difficulty: {blueprint.difficulty}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    ⚡ AI Synthesized
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 hover:bg-slate-100 dark:hover:bg-charcoal-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
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
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Launch Live Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>01 • Executive Architecture Summary</span>
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-charcoal-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-charcoal-700/60">
                {blueprint.summary}
              </p>
            </div>

            {/* Section 2: Recommended Tech Stack */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-violet-500" />
                <span>02 • Recommended Tech Stack</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {blueprint.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 text-slate-800 dark:text-slate-200 shadow-2xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Section 3: Teammates & Roles Needed */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>03 • Squad Role Breakdown & Skill Criteria</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {blueprint.rolesBreakdown.map((r, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/80 border border-slate-200 dark:border-charcoal-700 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 font-mono text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {r.role}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {r.focus}
                    </p>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {r.skills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 text-slate-700 dark:text-slate-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Execution Milestones */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-500" />
                <span>04 • 4-Phase Execution Roadmap</span>
              </h3>
              <div className="space-y-2.5">
                {blueprint.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-500 font-mono text-xs font-bold flex items-center justify-center shrink-0">
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
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-200 dark:bg-charcoal-700 text-slate-700 dark:text-slate-300 shrink-0 self-start sm:self-center">
                      {m.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Curated Templates & Blueprints Section */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Featured Collegiate Blueprints
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Curated and vetted project ideas ready for collegiate team recruitment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 hover:border-amber-500/40 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {tpl.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {tpl.difficulty}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {tpl.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {tpl.tagline || tpl.prompt}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-charcoal-800 text-slate-600 dark:text-slate-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(tpl.prompt);
                    handleGenerate(tpl.prompt);
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className="w-full pt-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Load & Synthesize Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
