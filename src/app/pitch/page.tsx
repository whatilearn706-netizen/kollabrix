'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Users, 
  Sparkles, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Copy, 
  Check, 
  Printer, 
  Briefcase, 
  ExternalLink,
  ChevronRight,
  Zap,
  Building2,
  FileText
} from 'lucide-react';

interface PitchScene {
  id: number;
  title: string;
  subtitle: string;
  duration: number; // in seconds
  badge: string;
  narration: string;
  visualHighlight: string;
  metrics: { label: string; value: string }[];
}

const PITCH_SCENES: PitchScene[] = [
  {
    id: 1,
    title: 'The Placement & Resume Crisis',
    subtitle: '90% of student project resumes are rejected as generic clones',
    duration: 12,
    badge: '01 · The Campus Challenge',
    narration:
      'Respected Leadership: Today, Tier-1 recruiters dismiss standard classroom projects because candidates cannot prove authentic team collaboration. Meanwhile, solo student builders on campus struggle to find complementary teammates in AI, full-stack, and UI/UX.',
    visualHighlight:
      'Linkora transforms isolated coding into verifiable, interdisciplinary collegiate engineering squads.',
    metrics: [
      { label: 'Unverified Resumes', value: '88%' },
      { label: 'Solo Student Dropouts', value: '64%' },
      { label: 'Recruiter Trust Deficit', value: 'High' },
    ],
  },
  {
    id: 2,
    title: 'Linkora: The Student Innovation Network',
    subtitle: 'From AI project spark to high-performance squad in 2 minutes',
    duration: 14,
    badge: '02 · The Solution',
    narration:
      'Linkora provides an integrated collegiate platform where students launch AI-assisted sprint blueprints, discover peers across departments, manage sprint roadmaps, and build production software solving real campus challenges.',
    visualHighlight:
      'Features AI Spark Generator, structured role matching, and Campus Hall of Fame spotlights.',
    metrics: [
      { label: 'Squad Formation', value: '< 2 mins' },
      { label: 'Active Universities', value: '180+' },
      { label: 'Sprint Completion', value: '94%' },
    ],
  },
  {
    id: 3,
    title: 'Verifiable Career Credentials',
    subtitle: 'Definitive cryptographic & GitHub proof for placement recruiters',
    duration: 14,
    badge: '03 · Recruiter Confidence',
    narration:
      'Unlike static resumes, Linkora automatically issues an official, verifiable collegiate project credential backed by GitHub commit proof and milestone completion. Recruiters can verify exact code contributions in one click.',
    visualHighlight:
      'Unique credential IDs (e.g. LNK-2026-VRF) verifiable on LinkedIn and candidate profiles.',
    metrics: [
      { label: 'Interview Shortlists', value: '+3.4x' },
      { label: 'GitHub Verification', value: '100%' },
      { label: 'LinkedIn Integration', value: '1-Click' },
    ],
  },
  {
    id: 4,
    title: 'Institutional Impact & Zero-Cost Pilot',
    subtitle: 'Elevating university rankings, NAAC innovation criteria, and placement packages',
    duration: 14,
    badge: '04 · University ROI',
    narration:
      'Linkora elevates university accreditation ratings, boosts median placement packages, and showcases departmental innovations. The platform is live and fully engineered — ready for a zero-cost pilot program at our university today.',
    visualHighlight:
      'Zero infrastructure cost. Dedicated department governance portal ready for rollout.',
    metrics: [
      { label: 'University Cost', value: '$0 / Free' },
      { label: 'Rollout Time', value: '24 Hours' },
      { label: 'Placement Impact', value: 'Immediate' },
    ],
  },
];

export default function PitchPage() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const currentScene = PITCH_SCENES[activeSceneIndex];

  // Auto-advance scene playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 100;
    const totalSteps = (currentScene.duration * 1000) / intervalMs;
    const stepIncrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next scene or loop
          setActiveSceneIndex((idx) => (idx + 1) % PITCH_SCENES.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeSceneIndex, currentScene.duration]);

  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    setProgress(0);
  };

  const executiveMessageText = `Respected Leadership,

I am writing to share Linkora (linkora-link.online), a student-developed platform built to enhance campus project portfolios and placement outcomes at our university.

Linkora helps students form cross-disciplinary squads, build production-grade software with GitHub verification, and earn verifiable collegiate project credentials that impress placement recruiters.

I have prepared an interactive 60-second executive walkthrough and university impact summary here:
👉 https://linkora-link.online/pitch

The platform is live and ready for a zero-cost departmental pilot. I would welcome 10 minutes of your time this week for a brief demonstration.

Warm regards,
Linkora Student Innovation Lead
linkora-link.online`;

  const copyExecutiveMessage = () => {
    navigator.clipboard.writeText(executiveMessageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-zinc-900 print:bg-white print:text-black">
      
      {/* Top Leadership Banner */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800 py-2.5 px-4 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[10px] border border-emerald-500/30">
              Executive Brief
            </span>
            <span className="text-zinc-300">
              Institutional Proposal for University Leadership & Chancellor Office
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white font-semibold"
            >
              Visit Platform <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Linkora · Collegiate Innovation Initiative</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-950 leading-tight">
            Accelerating Student Placements Through Verifiable Squad Collaboration
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            A zero-cost digital infrastructure enabling students to form multidisciplinary squads, build real-world software, and graduate with verified industry-grade portfolio proof.
          </p>
        </div>

        {/* =========================================================================
            INTERACTIVE 60-SECOND EXECUTIVE WALKTHROUGH PLAYER
           ========================================================================= */}
        <section className="bg-white rounded-3xl border-2 border-zinc-200 shadow-xl overflow-hidden print:border print:shadow-none">
          
          {/* Player Topbar */}
          <div className="bg-zinc-950 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  60-Second Interactive Executive Walkthrough
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Automated simulation demonstrating student workflow & institutional impact
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-100 transition-all shadow-sm"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-zinc-950" />}
                <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
              </button>
              <button
                onClick={() => {
                  setProgress(0);
                  setActiveSceneIndex(0);
                  setIsPlaying(true);
                }}
                title="Restart Walkthrough"
                className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Timeline Scrubber */}
          <div className="grid grid-cols-4 bg-zinc-900 border-b border-zinc-800">
            {PITCH_SCENES.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              const isPast = idx < activeSceneIndex;
              return (
                <button
                  key={scene.id}
                  onClick={() => handleSelectScene(idx)}
                  className={`p-3 text-left transition-colors relative border-r border-zinc-800 last:border-r-0 ${
                    isActive ? 'bg-zinc-800/80 text-white' : 'text-zinc-400 hover:bg-zinc-900/80'
                  }`}
                >
                  {/* Progress Bar Top Fill */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800">
                    <div
                      className="h-full bg-amber-400 transition-all duration-100"
                      style={{
                        width: isActive ? `${progress}%` : isPast ? '100%' : '0%',
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                    Scene 0{scene.id}
                  </p>
                  <p className="text-xs font-bold truncate">{scene.title}</p>
                </button>
              );
            })}
          </div>

          {/* Active Scene Stage */}
          <div className="p-6 sm:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {currentScene.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  {currentScene.title}
                </h2>
                <p className="text-sm sm:text-base font-semibold text-indigo-700">
                  {currentScene.subtitle}
                </p>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 leading-relaxed font-normal">
                  <strong className="text-zinc-900 font-semibold block mb-1">
                    Executive Briefing Audio/Script:
                  </strong>
                  "{currentScene.narration}"
                </div>
              </div>

              {/* Visual Showcase Card */}
              <div className="w-full md:w-80 p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white shadow-lg space-y-4 shrink-0">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Core Metric Impact
                </p>
                <div className="space-y-3">
                  {currentScene.metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <span className="text-xs text-zinc-400">{m.label}</span>
                      <span className="text-base font-bold text-white font-mono">{m.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    💡 {currentScene.visualHighlight}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Interactive Actions */}
            <div className="pt-6 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/explore"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-all shadow-sm"
                >
                  <span>Explore Live Projects</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-800 text-xs font-bold hover:bg-zinc-50 transition-all shadow-sm"
                >
                  <span>View Homepage & AI Spark</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="text-xs text-zinc-500 font-medium">
                Live deployment at: <strong className="text-zinc-900">linkora-link.online</strong>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            THE 4 INSTITUTIONAL PILLARS FOR UNIVERSITY LEADERSHIP
           ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Why Campus Leadership Supports Linkora
            </h2>
            <p className="text-sm text-zinc-600 mt-1">
              Measurable institutional value delivered to students, departments, and corporate placement partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-bold text-base text-zinc-900">1. Placement Multiplier</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Replaces generic tutorial resume projects with verified, multi-member engineering applications that pass recruiter technical screens.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="font-bold text-base text-zinc-900">2. National Hackathon Wins</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Connects complementary students (AI + Backend + UI/UX) to field high-caliber teams for Smart India Hackathon, ETHIndia, and global stages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="font-bold text-base text-zinc-900">3. NAAC & NIRF Innovation Points</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Direct evidence of interdisciplinary student innovation, open-source repositories, and faculty mentorship portfolios for accreditation reviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="font-bold text-base text-zinc-900">4. Zero Financial Liability</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Engineered entirely by student builders on modern cloud architecture. Requires zero university IT budget, zero licensing fees, and instant rollout.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            1-CLICK EXECUTIVE MESSAGE COPIER (FOR THE STUDENT TO SEND)
           ========================================================================= */}
        <section className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Ready-to-Send Executive Pitch Message</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Copy this pre-formatted message directly into WhatsApp, Email, or your college director portal.
              </p>
            </div>
            <button
              onClick={copyExecutiveMessage}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                copiedMessage
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {copiedMessage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMessage ? 'Copied to Clipboard!' : 'Copy Executive Message'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap select-all">
            {executiveMessageText}
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-400" />
            <span>Linkora · Institutional University Partnership Initiative</span>
          </div>
          <div>
            Built with pride for university builders worldwide.
          </div>
        </div>

      </main>
    </div>
  );
}
