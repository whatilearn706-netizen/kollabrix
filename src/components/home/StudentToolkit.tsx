'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  ShieldCheck,
  Code2,
  BookOpen,
  GraduationCap,
  Terminal,
  Zap,
  Key,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export function StudentToolkit() {
  const { user, profile } = useAuth();
  const { theme, isDark } = useSiteTheme();

  // Modals state
  const [activeModal, setActiveModal] = useState<'synopsis' | 'portfolio' | 'viva' | null>(null);

  // --- 1. Synopsis Generator State ---
  const [synopsisTopic, setSynopsisTopic] = useState('');
  const [synopsisStack, setSynopsisStack] = useState('');
  const [isGeneratingSynopsis, setIsGeneratingSynopsis] = useState(false);
  const [synopsisResult, setSynopsisResult] = useState<any | null>(null);
  const [copiedSynopsis, setCopiedSynopsis] = useState(false);

  // --- 2. Portfolio Card State ---
  const [portfolioName, setPortfolioName] = useState(profile?.display_name || user?.user_metadata?.full_name || 'Mayank Goyal');
  const [portfolioRole, setPortfolioRole] = useState(profile?.preferred_roles?.[0] || profile?.bio || 'Full-Stack Software Engineer • Systems Lead');
  const [portfolioCollege, setPortfolioCollege] = useState(profile?.college || 'Computer Science & Engineering');
  const [portfolioProject, setPortfolioProject] = useState('Campus Collaborative Workspace');
  const [copiedPortfolioLink, setCopiedPortfolioLink] = useState(false);

  // --- 3. Viva Simulator State ---
  const [vivaTopic, setVivaTopic] = useState('');
  const [vivaStack, setVivaStack] = useState('');
  const [isGeneratingViva, setIsGeneratingViva] = useState(false);
  const [vivaResult, setVivaResult] = useState<any | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(1);
  const [copiedViva, setCopiedViva] = useState(false);

  // Quick suggestion chips
  const quickTopics = [
    'AI Crop Disease Diagnosis & Weather Advisory',
    'Collegiate Expense Ledger with UPI Deep-Links',
    'Decentralized Student Degree Verification on Web3',
    'Real-Time Autonomous Campus Shuttle & EV Tracker',
  ];

  // Handler: Generate Synopsis
  const handleGenerateSynopsis = async (topicToUse?: string) => {
    const t = topicToUse || synopsisTopic;
    if (!t.trim()) return;

    setIsGeneratingSynopsis(true);
    try {
      const res = await fetch('/api/ai/toolkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'synopsis',
          topic: t,
          techStack: synopsisStack,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSynopsisResult(data.data);
      }
    } catch (err) {
      console.error('Failed to generate synopsis:', err);
    } finally {
      setIsGeneratingSynopsis(false);
    }
  };

  // Handler: Generate Viva
  const handleGenerateViva = async (topicToUse?: string) => {
    const t = topicToUse || vivaTopic;
    if (!t.trim()) return;

    setIsGeneratingViva(true);
    try {
      const res = await fetch('/api/ai/toolkit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'viva',
          topic: t,
          techStack: vivaStack,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setVivaResult(data.data);
        setExpandedQuestionId(1);
      }
    } catch (err) {
      console.error('Failed to generate viva questions:', err);
    } finally {
      setIsGeneratingViva(false);
    }
  };

  // Copy Full Synopsis
  const handleCopySynopsis = () => {
    if (!synopsisResult) return;
    const text = `
PROJECT SYNOPSIS & SPECIFICATION (SRS)
----------------------------------------------------
TITLE: ${synopsisResult.title}
DOMAIN: ${synopsisResult.domain}

1. ABSTRACT
${synopsisResult.abstract}

2. PROBLEM STATEMENT
${synopsisResult.problemStatement}

3. PROJECT OBJECTIVES
${synopsisResult.objectives.map((o: string, i: number) => `   3.${i + 1} ${o}`).join('\n')}

4. EXISTING SYSTEM LIMITATIONS
${synopsisResult.existingSystemLimitations.map((l: string) => `   - ${l}`).join('\n')}

5. PROPOSED SYSTEM ADVANTAGES
${synopsisResult.proposedSystemAdvantages.map((a: string) => `   - ${a}`).join('\n')}

6. SYSTEM REQUIREMENTS
   Functional:
${synopsisResult.requirements.functional.map((f: string) => `     * ${f}`).join('\n')}
   Non-Functional:
${synopsisResult.requirements.nonFunctional.map((nf: string) => `     * ${nf}`).join('\n')}
   Software Specifications:
${synopsisResult.requirements.software.map((s: string) => `     * ${s}`).join('\n')}
   Hardware Specifications:
${synopsisResult.requirements.hardware.map((h: string) => `     * ${h}`).join('\n')}

7. ARCHITECTURE PIPELINE
${synopsisResult.systemArchitecture.map((arch: string) => `   - ${arch}`).join('\n')}

8. SYSTEM MODULES
${synopsisResult.modules.map((m: any) => `   * ${m.name}: ${m.description}`).join('\n')}
----------------------------------------------------
Generated via Linkora Student Toolkit (https://linkora-edu.online)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSynopsis(true);
    setTimeout(() => setCopiedSynopsis(false), 2500);
  };

  // Copy Viva
  const handleCopyViva = () => {
    if (!vivaResult) return;
    const text = `
PROJECT VIVA & DEFENSE CROSS-EXAMINATION
----------------------------------------------------
PROJECT: ${vivaResult.projectTitle}
STACK: ${vivaResult.techStack}

${vivaResult.questions.map((q: any, i: number) => `
QUESTION ${i + 1}: [${q.category} - ${q.difficulty}]
${q.question}

WHY EXAMINER ASKS IT:
${q.examinerIntent}

MUST-MENTION KEYWORDS:
${q.keyTerminology.join(', ')}

MODEL ANSWER:
${q.modelAnswer}
----------------------------------------------------
`).join('\n')}
Generated via Linkora Student Toolkit (https://linkora-edu.online)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedViva(true);
    setTimeout(() => setCopiedViva(false), 2500);
  };

  return (
    <section id="student-toolkit" className="py-12 md:py-16 relative overflow-hidden">
      {/* Background ambient subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-violet-500/5 via-pink-500/5 to-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>Student Success Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            Student Toolkit
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Purpose-built tools to get your college projects approved, showcase verified proof-of-work to recruiters, and ace your final viva defense.
          </p>
        </div>

        {/* 3-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Project Synopsis & SRS Generator */}
          <div
            onClick={() => setActiveModal('synopsis')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform duration-200">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Faculty Ready
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                1-Click Project Synopsis & SRS
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate university-approved project synopses complete with problem statement, architecture pipeline, and hardware/software specifications.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
              <span>Generate Document</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Verified Placement Portfolio Card */}
          <div
            onClick={() => setActiveModal('portfolio')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-violet-500/40 dark:hover:border-violet-500/40 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-200">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                  Resume Link
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                Proof-of-Work Portfolio Card
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Stand out in placement screening. Create a verified card highlighting your technical role, live GitHub code, and team accomplishments.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-violet-600 dark:text-violet-400">
              <span>Build Portfolio Card</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: AI Viva & External Examiner Simulator */}
          <div
            onClick={() => setActiveModal('viva')}
            className="group relative rounded-3xl p-6 sm:p-7 bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 hover:border-rose-500/40 dark:hover:border-rose-500/40 shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-200">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  Viva Defense
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                AI Project Viva Examiner
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Simulate your external college viva. Practice the 5 hardest architecture questions examiners ask, with model high-scoring answers.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>Start Viva Simulation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: PROJECT SYNOPSIS & SRS GENERATOR
         ========================================================================= */}
      <Modal
        isOpen={activeModal === 'synopsis'}
        onClose={() => setActiveModal(null)}
        title="1-Click Project Synopsis & SRS Generator"
        maxWidth="3xl"
      >
        <div className="space-y-6 text-slate-800 dark:text-slate-200">
          {!synopsisResult ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter your project topic or domain. Our intelligent engine will structure a complete, formal college synopsis ready to print and submit to your project coordinator.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Topic or Concept *
                </label>
                <input
                  type="text"
                  placeholder="e.g., AI Crop Leaf Pathology Diagnosis using Computer Vision"
                  value={synopsisTopic}
                  onChange={(e) => setSynopsisTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Preferred Tech Stack (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Python, FastAPI, Next.js, PostgreSQL, PyTorch"
                  value={synopsisStack}
                  onChange={(e) => setSynopsisStack(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Quick suggestion pills */}
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  Or pick a popular engineering domain:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickTopics.map((topic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSynopsisTopic(topic);
                        handleGenerateSynopsis(topic);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-colors text-left"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={() => handleGenerateSynopsis()}
                  disabled={!synopsisTopic.trim() || isGeneratingSynopsis}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5"
                  leftIcon={isGeneratingSynopsis ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                >
                  {isGeneratingSynopsis ? 'Synthesizing Synopsis...' : 'Generate College Synopsis'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Faculty-Approved Synopsis Draft Ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySynopsis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200 dark:border-white/10 shadow-2xs cursor-pointer"
                  >
                    {copiedSynopsis ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
                    <span>{copiedSynopsis ? 'Copied Full Document!' : 'Copy Document'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    onClick={() => setSynopsisResult(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1"
                  >
                    New Topic
                  </button>
                </div>
              </div>

              {/* Formatted College Synopsis Document */}
              <div className="max-h-[60vh] overflow-y-auto space-y-5 p-5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                    PROJECT TITLE
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {synopsisResult.title}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                    Domain: <strong className="text-slate-800 dark:text-slate-200">{synopsisResult.domain}</strong>
                  </span>
                </div>

                <hr className="border-slate-100 dark:border-white/5" />

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1.5">
                    1. Abstract
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 text-justify">
                    {synopsisResult.abstract}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1.5">
                    2. Problem Statement
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 text-justify">
                    {synopsisResult.problemStatement}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1.5">
                    3. Project Objectives
                  </h5>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                    {synopsisResult.objectives?.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <h6 className="font-bold text-red-700 dark:text-red-400 text-xs mb-1">
                      Existing System Limitations
                    </h6>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {synopsisResult.existingSystemLimitations?.map((lim: string, i: number) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                    <h6 className="font-bold text-emerald-700 dark:text-emerald-400 text-xs mb-1">
                      Proposed System Advantages
                    </h6>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      {synopsisResult.proposedSystemAdvantages?.map((adv: string, i: number) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1.5">
                    4. Technical Specifications
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                      <strong className="block text-slate-900 dark:text-white mb-1">Software Stack:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                        {synopsisResult.requirements?.software?.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                      <strong className="block text-slate-900 dark:text-white mb-1">Hardware Constraints:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                        {synopsisResult.requirements?.hardware?.map((h: string, i: number) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1.5">
                    5. System Modules Breakdown
                  </h5>
                  <div className="space-y-2">
                    {synopsisResult.modules?.map((mod: any, i: number) => (
                      <div key={i} className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                        <strong className="text-slate-900 dark:text-white text-xs block">{i + 1}. {mod.name}</strong>
                        <span className="text-xs text-slate-600 dark:text-slate-400">{mod.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 2: VERIFIED PLACEMENT PORTFOLIO CARD
         ========================================================================= */}
      <Modal
        isOpen={activeModal === 'portfolio'}
        onClose={() => setActiveModal(null)}
        title="Verified Proof-of-Work Portfolio Card"
        maxWidth="xl"
      >
        <div className="space-y-6 text-slate-800 dark:text-slate-200">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Export a verified visual card or grab your direct Linkora portfolio link to add to your Placement Resume, LinkedIn headline, or GitHub profile.
          </p>

          {/* Live Card Preview */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-violet-500/30 shadow-2xl relative overflow-hidden">
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/20 blur-2xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 blur-2xl rounded-full" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center font-extrabold text-violet-300">
                    {portfolioName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base leading-tight">{portfolioName}</h4>
                    <span className="text-xs text-slate-400">{portfolioCollege}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Maker</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-300 block mb-1">
                  Primary Role
                </span>
                <p className="text-sm font-bold text-white">
                  {portfolioRole}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Featured Project & Code
                </span>
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-white">{portfolioProject}</strong>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                    Live Demo
                  </span>
                </div>
              </div>

              {/* Verified Badges */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <span>⚡ 14+ GitHub Commits</span>
                  <span>•</span>
                  <span>🏆 Hackathon Winner</span>
                </div>
                <span className="text-[10px] font-bold text-violet-400">
                  linkora-edu.online
                </span>
              </div>
            </div>
          </div>

          {/* Quick Customizer Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
              <input
                type="text"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Technical Title / Role</label>
              <input
                type="text"
                value={portfolioRole}
                onChange={(e) => setPortfolioRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={profile?.username ? `/profile/${profile.username}` : '/settings/profile'}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              <span>Edit Full Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => {
                const url = profile?.username
                  ? `https://linkora-edu.online/profile/${profile.username}`
                  : `https://linkora-edu.online/explore`;
                navigator.clipboard.writeText(url);
                setCopiedPortfolioLink(true);
                setTimeout(() => setCopiedPortfolioLink(false), 2500);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {copiedPortfolioLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPortfolioLink ? 'Link Copied for Resume!' : 'Copy Portfolio Link'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: AI VIVA & EXTERNAL EXAMINER SIMULATOR
         ========================================================================= */}
      <Modal
        isOpen={activeModal === 'viva'}
        onClose={() => setActiveModal(null)}
        title="AI Project Viva & Defense Simulator"
        maxWidth="3xl"
      >
        <div className="space-y-6 text-slate-800 dark:text-slate-200">
          {!vivaResult ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Facing your final year project presentation or external viva? Enter your project topic and tech stack. The AI will simulate an aggressive external examiner and show you the exact questions and high-scoring answers.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Topic / Architecture *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Microservices-based Healthcare EHR System with PostgreSQL and JWT"
                  value={vivaTopic}
                  onChange={(e) => setVivaTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Technologies Used (Frameworks, Databases, Protocols)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Next.js 14, Node.js, PostgreSQL, Docker, Redis"
                  value={vivaStack}
                  onChange={(e) => setVivaStack(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={() => handleGenerateViva()}
                  disabled={!vivaTopic.trim() || isGeneratingViva}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5"
                  leftIcon={isGeneratingViva ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                >
                  {isGeneratingViva ? 'Simulating Examiner...' : 'Start Viva Defense Simulation'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {vivaResult.projectTitle}
                  </h4>
                  <span className="text-xs text-rose-700 dark:text-rose-300">
                    Persona: {vivaResult.examinerPersona}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyViva}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200 dark:border-white/10 shadow-2xs cursor-pointer"
                  >
                    {copiedViva ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />}
                    <span>{copiedViva ? 'Copied Questions!' : 'Copy All Questions'}</span>
                  </button>
                  <button
                    onClick={() => setVivaResult(null)}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white px-2 py-1"
                  >
                    New Simulation
                  </button>
                </div>
              </div>

              {/* Questions Accordion List */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {vivaResult.questions?.map((q: any) => {
                  const isExpanded = expandedQuestionId === q.id;
                  return (
                    <div
                      key={q.id}
                      className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                              Q{q.id}: {q.category}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {q.difficulty}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {q.question}
                          </h5>
                        </div>
                        <div className="p-1 rounded-lg text-slate-400 shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-slate-100 dark:border-white/5 space-y-3.5 text-xs sm:text-sm bg-slate-50/50 dark:bg-white/[0.01]">
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                            <strong className="text-amber-900 dark:text-amber-300 block mb-0.5">
                              🕵️ Why the External Examiner Asks This:
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300">
                              {q.examinerIntent}
                            </p>
                          </div>

                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                              🔑 Must-Say Keywords to Get Full Marks:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {q.keyTerminology?.map((term: string, i: number) => (
                                <span
                                  key={i}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 font-semibold"
                                >
                                  {term}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <strong className="text-emerald-800 dark:text-emerald-300 text-xs block mb-1">
                              💡 Model High-Scoring Answer:
                            </strong>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm text-justify">
                              {q.modelAnswer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
}
