'use client';

import React, { useState, useEffect } from 'react';
import { Project, ProjectMember } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  FileCode,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  RotateCcw,
  Presentation,
  GitBranch,
  Layers,
  ExternalLink,
  CheckCircle2,
  Share2,
  Clock,
  Volume2,
  Info,
} from 'lucide-react';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceCloserKitProps {
  project: Project;
  members: ProjectMember[];
  currentUserId?: string;
}

export function WorkspaceCloserKit({ project, members, currentUserId }: WorkspaceCloserKitProps) {
  const [activeTab, setActiveTab] = useState<'readme' | 'pitch' | 'architecture'>('readme');

  // README state
  const [readmePreviewMode, setReadmePreviewMode] = useState<'preview' | 'raw'>('preview');
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [customTagline, setCustomTagline] = useState(
    project.description || 'A next-generation collegiate engineering solution built on Linkora.'
  );
  const [installCommand, setInstallCommand] = useState('npm install && npm run dev');
  const [licenseType, setLicenseType] = useState('MIT License');

  // Pitch Deck state
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Architecture state
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  // Timer logic for 2-Minute Pitch
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(120);
  };

  // Generate Contributor list
  const contributorList =
    members.length > 0
      ? members.map((m) => `- **${m.profile?.display_name || m.profile?.username || 'Builder'}** (@${m.profile?.username || 'colleague'}) — *${m.role}*`).join('\n')
      : `- **Project Lead** — *Lead Engineer*`;

  const skillsBadges = (project.required_skills || ['TypeScript', 'React', 'Next.js', 'Supabase', 'TailwindCSS'])
    .map((skill) => `\`${skill}\``)
    .join(' • ');

  // Generated Markdown README
  const generatedReadme = `# ${project.title}

> ${customTagline}

[![Collegiate Verified on Linkora](https://img.shields.io/badge/Linkora-Collegiate%20Verified%20Project-6366f1?style=for-the-badge&logo=shield)](https://linkora-link.online/projects/${project.id})
[![License: ${licenseType}](https://img.shields.io/badge/License-${encodeURIComponent(licenseType)}-emerald?style=for-the-badge)](LICENSE)
[![Category: ${project.category}](https://img.shields.io/badge/Category-${encodeURIComponent(project.category)}-amber?style=for-the-badge)](https://linkora-link.online)

---

## 🚀 Overview

**${project.title}** is an engineering project developed by university innovators on **Linkora**. Designed to solve collegiate and real-world friction, it combines modern web technologies with clean architectural standards.

### ✨ Key Deliverables & Highlights
- **High Performance Stack**: Powered by ${skillsBadges}
- **Production Architecture**: Built for zero-latency execution, accessible state, and responsive client interfaces.
- **Peer-Reviewed Collaboration**: Engineered by a dedicated multidisciplinary campus team.
- **Verified Protocol**: Authenticated through the Linkora collegiate credential system.

---

## 🛠️ Architecture & Tech Stack

\`\`\`
Client (Next.js 14 App Router)
       │
       ▼
Edge API & Middleware (Serverless Routes)
       │
       ▼
Supabase PostgreSQL & Realtime State
\`\`\`

- **Frontend**: Next.js 14, React Server/Client Components, TailwindCSS
- **Backend & Database**: Supabase PostgreSQL, Edge Functions, Row-Level Security
- **Authentication**: Role-based access control with session persistence
- **Verification**: Linkora Cryptographic Project Signature Protocol

---

## ⚡ Getting Started

### 1. Clone the repository
\`\`\`bash
git clone ${project.repository_url || `https://github.com/linkora-campus/${project.id.slice(0, 8)}`}
cd ${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
\`\`\`

### 2. Install dependencies & run development server
\`\`\`bash
${installCommand}
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the live build in your browser.

---

## 👥 Collegiate Contributors

${contributorList}

---

## 📄 License
This project is released under the **${licenseType}**. Built with pride for collegiate hackathons and academic showcases.
`;

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(generatedReadme);
    setCopiedReadme(true);
    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Generated & copied AI README for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}
    setTimeout(() => setCopiedReadme(false), 2200);
  };

  const handleDownloadReadme = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedReadme], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 5-Slide Pitch Deck Breakdown
  const pitchSlides = [
    {
      number: 1,
      title: 'The Hook & Collegiate Problem',
      timing: '0:00 - 0:25 (25s)',
      keyPoints: [
        `Start with the everyday friction students face in "${project.category}".`,
        `Quantify the loss: "Every semester, hundreds of collegiate builders struggle with fragmented tools."`,
        `State our core thesis: "We built ${project.title} to turn chaos into high-speed execution."`,
      ],
      script: `Judges, think about the last time you tried to ship a high-stakes engineering project with a student team. The tools are scattered, communication breaks down at 2 AM, and half the code never gets verified. That is why we built ${project.title}. We are solving the exact gap that stops campus innovators from shipping production-grade work.`,
    },
    {
      number: 2,
      title: 'The Solution & Linkora Architecture',
      timing: '0:25 - 0:50 (25s)',
      keyPoints: [
        `Introduce ${project.title} as the unified solution.`,
        `Highlight the core architectural advantages: ${skillsBadges}.`,
        `Demonstrate why existing solutions fall short in speed and real-time synchronicity.`,
      ],
      script: `${project.title} provides a single, high-leverage command center. Powered by a modern stack including ${project.required_skills?.slice(0, 3).join(', ') || 'modern web technologies'}, our platform eliminates friction by connecting live prototypes, synchronized task states, and verifiable proof of work in one place.`,
    },
    {
      number: 3,
      title: 'The Live Demo & Magic Moment',
      timing: '0:50 - 1:20 (30s)',
      keyPoints: [
        `Show, don't tell: trigger the core user action live on screen.`,
        `Walk through the 3-second workflow from problem input to finished result.`,
        `Emphasize responsiveness, zero layout shift, and immediate feedback.`,
      ],
      script: `Let me show you how it works in real life. In less than three clicks, any collegiate collaborator can boot their workspace, sync their Figma designs, and trigger automated deliverables. Notice how the state syncs in real-time with zero lag. This is the difference between a school assignment and a production engineering product.`,
    },
    {
      number: 4,
      title: 'Traction, Collegiate Impact & Scalability',
      timing: '1:20 - 1:45 (25s)',
      keyPoints: [
        `Explain how this scales beyond one campus to 50+ partner universities.`,
        `Show team velocity: shipped MVP in record time with full test coverage.`,
        `Highlight collegiate credentialing: verified certificates and LinkedIn sharing.`,
      ],
      script: `We didn't just build a prototype for today's demo. Our architecture is designed to scale horizontally across campus labs and hackathon cohorts. With cryptographically verified credentials, every single student who contributes receives recruiter-grade proof of their engineering deliverables.`,
    },
    {
      number: 5,
      title: 'The Dream Team & The Ask',
      timing: '1:45 - 2:00 (15s)',
      keyPoints: [
        `Introduce the multidisciplinary squad members and roles.`,
        `Closing call to action: "We invite you to test our live demo and help us bring this to every university."`,
        `Stand tall, pause, and open for Q&A.`,
      ],
      script: `Our squad consists of dedicated engineers and designers across frontend, backend, and system design. We have shipped the code, passed all verifications, and are ready to scale. We are ${project.title}, and we would love to answer your questions. Thank you!`,
    },
  ];

  const fullPitchScript = pitchSlides
    .map(
      (s) =>
        `### SLIDE ${s.number}: ${s.title.toUpperCase()} (${s.timing})\n\n**Presenter Script:**\n"${s.script}"\n\n**Key Delivery Points:**\n${s.keyPoints.map((k) => `- ${k}`).join('\n')}\n`
    )
    .join('\n---\n\n');

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(fullPitchScript);
    setCopiedPitch(true);
    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Generated & copied 2-min pitch script for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}
    setTimeout(() => setCopiedPitch(false), 2200);
  };

  // Mermaid Architecture Code
  const mermaidCode = `graph TD
  subgraph Client ["Client Browser / Mobile PWA"]
    UI["Next.js 14 App Router UI"]
    Tailwind["TailwindCSS Design System"]
    LiveSync["Realtime WebSocket Subscriber"]
  end

  subgraph EdgeAPI ["Edge & Serverless API"]
    Routes["/api/projects /api/workspace"]
    AuthGuard["Supabase JWT & Admin Verification"]
    RateLimiter["Zero-Latency Edge Handler"]
  end

  subgraph Database ["Cloud Infrastructure (Supabase)"]
    Postgres[("PostgreSQL Database")]
    RLS["Row-Level Security Policies"]
    Storage["Asset & Deliverable Buckets"]
  end

  subgraph Verification ["Collegiate Trust Protocol"]
    CertEngine["Cryptographic Credential ID"]
    LinkedIn["1-Click Case Study Engine"]
  end

  UI --> Routes
  LiveSync <--> Postgres
  Routes --> AuthGuard
  AuthGuard --> Postgres
  Postgres --> CertEngine
  CertEngine --> LinkedIn
`;

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">The AI Closer Kit</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              Hackathon Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            1-Click tools to convert your raw code into winning hackathon deliverables: production README, 2-minute timed pitch script, and architecture diagrams.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('readme')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'readme'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>AI README</span>
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pitch'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>2-Min Pitch Deck</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System Architecture</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: AI README GENERATOR
         ========================================================================= */}
      {activeTab === 'readme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-violet-400" />
                <span>README Customization</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Project Tagline / Pitch
                  </label>
                  <textarea
                    rows={3}
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs"
                    placeholder="Brief 1-line elevator pitch..."
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Quick Start Command
                  </label>
                  <input
                    type="text"
                    value={installCommand}
                    onChange={(e) => setInstallCommand(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Open Source License
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="MIT License">MIT License (Permissive & Standard)</option>
                    <option value="Apache 2.0">Apache 2.0 (Patent & Trademark Protection)</option>
                    <option value="GNU GPLv3">GNU GPLv3 (Copyleft)</option>
                    <option value="Academic Free License">Academic Free License</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-charcoal-800 flex flex-col gap-2">
                  <Button
                    onClick={handleCopyReadme}
                    variant="primary"
                    size="sm"
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                    leftIcon={copiedReadme ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  >
                    {copiedReadme ? 'Copied to Clipboard!' : 'Copy Markdown'}
                  </Button>

                  <Button
                    onClick={handleDownloadReadme}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download README.md
                  </Button>
                </div>
              </div>
            </div>

            {/* Team Roster Summary */}
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Auto-Attributed Contributors ({members.length})</span>
              </span>
              <p className="text-slate-400 text-[11px]">
                Teammates are automatically credited in the generated README with their assigned role.
              </p>
            </div>
          </div>

          {/* Preview Column (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-charcoal-900 border border-charcoal-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setReadmePreviewMode('preview')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    readmePreviewMode === 'preview'
                      ? 'bg-charcoal-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Formatted Preview
                </button>
                <button
                  onClick={() => setReadmePreviewMode('raw')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    readmePreviewMode === 'raw'
                      ? 'bg-charcoal-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw Markdown
                </button>
              </div>

              <span className="text-xs font-mono text-slate-400">
                github.com/{project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}/README.md
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 max-h-[600px] overflow-y-auto font-sans shadow-inner">
              {readmePreviewMode === 'raw' ? (
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                  {generatedReadme}
                </pre>
              ) : (
                <div className="space-y-6 text-slate-200 text-xs sm:text-sm leading-relaxed">
                  <div className="border-b border-charcoal-800 pb-4">
                    <h1 className="text-2xl font-black text-white">{project.title}</h1>
                    <p className="text-slate-400 italic mt-1 text-xs">{customTagline}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        Linkora Verified
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        {licenseType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white mb-2">🚀 Overview</h2>
                    <p className="text-slate-300">
                      {project.description ||
                        'A modern collegiate engineering initiative developed with high architectural standards.'}
                    </p>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white mb-2">🛠️ Architecture & Tech Stack</h2>
                    <div className="p-3 rounded-xl bg-charcoal-950 font-mono text-xs text-slate-300 border border-charcoal-800">
                      {project.required_skills?.join(' • ') || 'Next.js 14 • TypeScript • TailwindCSS • Supabase'}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white mb-2">⚡ Getting Started</h2>
                    <div className="p-3 rounded-xl bg-charcoal-950 font-mono text-xs text-emerald-400 border border-charcoal-800">
                      {installCommand}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white mb-2">👥 Collegiate Contributors</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {members.map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-xl bg-charcoal-800/80 border border-charcoal-750 flex items-center justify-between"
                        >
                          <span className="font-bold text-white">
                            {m.profile?.display_name || m.profile?.username || 'Colleague'}
                          </span>
                          <span className="text-[11px] font-mono text-violet-300">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 2-MINUTE PITCH DECK & SCRIPT
         ========================================================================= */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          {/* Rehearsal Timer Bar */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-xl shadow-inner ${
                  timerSeconds <= 20
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : timerSeconds <= 50
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {formatTimer(timerSeconds)}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Hackathon 2-Minute Pitch Rehearsal
                </span>
                <span className="text-[11px] text-slate-400">
                  {isTimerRunning
                    ? '⏱️ Speech timer running! Speak clearly and watch your slide timings.'
                    : 'Hit Start to begin your 120-second rehearsal run.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                size="sm"
                variant={isTimerRunning ? 'outline' : 'primary'}
                className={!isTimerRunning ? 'bg-violet-600 hover:bg-violet-700 text-white' : ''}
                leftIcon={isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              >
                {isTimerRunning ? 'Pause Rehearsal' : 'Start Timer'}
              </Button>
              <Button
                onClick={resetTimer}
                size="sm"
                variant="ghost"
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
              <Button
                onClick={handleCopyPitch}
                size="sm"
                variant="outline"
                leftIcon={copiedPitch ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copiedPitch ? 'Copied Full Script!' : 'Copy Script'}
              </Button>
            </div>
          </div>

          {/* 5 Slides Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {pitchSlides.map((slide, idx) => (
              <button
                key={slide.number}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  currentSlideIndex === idx
                    ? 'bg-charcoal-800 border-violet-500 ring-2 ring-violet-500/30'
                    : 'bg-charcoal-900 border-charcoal-800 hover:border-charcoal-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>SLIDE 0{slide.number}</span>
                  <span className="text-violet-400">{slide.timing}</span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{slide.title}</h4>
              </button>
            ))}
          </div>

          {/* Active Slide In-Depth Presenter Card */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
                  Slide {pitchSlides[currentSlideIndex].number} of 5 • {pitchSlides[currentSlideIndex].timing}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {pitchSlides[currentSlideIndex].title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-charcoal-800 text-slate-300 border border-charcoal-700">
                  Target: {pitchSlides[currentSlideIndex].timing.split(' ')[2]}
                </span>
              </div>
            </div>

            {/* Presenter Speech Script */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-violet-400" />
                <span>Word-for-Word Presenter Script (Read Aloud)</span>
              </span>
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 text-violet-100 text-sm sm:text-base leading-relaxed italic font-serif">
                "{pitchSlides[currentSlideIndex].script}"
              </div>
            </div>

            {/* Delivery Guidance Points */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Key Slide Visuals & Delivery Tips
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {pitchSlides[currentSlideIndex].keyPoints.map((point, kIdx) => (
                  <div
                    key={kIdx}
                    className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-300 space-y-1"
                  >
                    <span className="text-[10px] font-mono text-violet-400 font-bold">
                      CUE {kIdx + 1}
                    </span>
                    <p className="leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SYSTEM ARCHITECTURE DIAGRAM
         ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-violet-400" />
                  <span>Full-Stack Engineering Blueprint</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standardized collegiate architectural diagram for judges and team alignments.
                </p>
              </div>

              <Button
                onClick={handleCopyMermaid}
                variant="outline"
                size="sm"
                leftIcon={copiedMermaid ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              >
                {copiedMermaid ? 'Copied Mermaid Code!' : 'Copy Mermaid Code'}
              </Button>
            </div>

            {/* Interactive Visual Architecture Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-indigo-400 font-bold">LAYER 1</span>
                  <span>CLIENT</span>
                </div>
                <h4 className="text-sm font-bold text-white">Next.js 14 App Router</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TailwindCSS styling, React Server & Client Components, optimistic state mutations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">LAYER 2</span>
                  <span>EDGE API</span>
                </div>
                <h4 className="text-sm font-bold text-white">Serverless & Middleware</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  JWT verification, admin permission gating, real-time rate limiting, dynamic caching.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-amber-400 font-bold">LAYER 3</span>
                  <span>DATABASE</span>
                </div>
                <h4 className="text-sm font-bold text-white">Supabase PostgreSQL</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Row-level security policies, Postgres WebSockets for instant task & standup broadcast.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-rose-400 font-bold">LAYER 4</span>
                  <span>TRUST PROTOCOL</span>
                </div>
                <h4 className="text-sm font-bold text-white">Collegiate Proof</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deterministic credential generation, verified project badges, and 1-click LinkedIn export.
                </p>
              </div>
            </div>

            {/* Mermaid Code Snippet Box */}
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Mermaid Architecture Code (Paste into GitHub README or Notion)</span>
                <span className="text-[11px] text-slate-500">Syntax: graph TD</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-2 bg-charcoal-900 rounded-lg whitespace-pre">
                {mermaidCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
