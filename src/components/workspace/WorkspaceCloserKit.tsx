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
  RefreshCw,
  Cpu,
  Smartphone,
  Radio,
  Coins,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Award,
  Terminal,
} from 'lucide-react';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceCloserKitProps {
  project: Project;
  members: ProjectMember[];
  currentUserId?: string;
}

export type ArchitectureType = 'saas' | 'ai' | 'iot' | 'mobile' | 'web3';

export function WorkspaceCloserKit({ project, members, currentUserId }: WorkspaceCloserKitProps) {
  const [activeTab, setActiveTab] = useState<'readme' | 'pitch' | 'architecture'>('readme');

  // Detect domain automatically from project properties
  const projectText = `${project.title} ${project.description || ''} ${project.category} ${(project.required_skills || []).join(' ')}`.toLowerCase();
  const isAiDomain = /ai|ml|learning|neural|vision|llm|nlp|gpt|opencv|model|predict|detection/i.test(projectText);
  const isIotDomain = /iot|hardware|sensor|arduino|esp32|drone|embedded|robot|raspberry/i.test(projectText);
  const isWeb3Domain = /crypto|blockchain|solidity|nft|dao|web3|smart contract|token/i.test(projectText);
  const isMobileDomain = /mobile|react native|flutter|expo|ios|android|swift|kotlin/i.test(projectText);

  const initialArch: ArchitectureType = isAiDomain ? 'ai' : isIotDomain ? 'iot' : isWeb3Domain ? 'web3' : isMobileDomain ? 'mobile' : 'saas';

  // =========================================================================
  // 1. README STATE & AI GENERATOR
  // =========================================================================
  const [readmePreviewMode, setReadmePreviewMode] = useState<'preview' | 'raw'>('preview');
  const [copiedReadme, setCopiedReadme] = useState(false);
  const [customTagline, setCustomTagline] = useState(
    project.description || 'A next-generation collegiate engineering solution built on Linkora.'
  );
  const [installCommand, setInstallCommand] = useState('npm install && npm run dev');
  const [licenseType, setLicenseType] = useState('MIT License');
  const [isGeneratingReadme, setIsGeneratingReadme] = useState(false);
  const [aiGeneratedReadme, setAiGeneratedReadme] = useState<string | null>(null);

  // Default baseline README
  const skillsBadges = (project.required_skills || ['TypeScript', 'React', 'Next.js', 'Supabase', 'TailwindCSS'])
    .map((skill) => `\`${skill}\``)
    .join(' • ');

  const contributorList =
    members.length > 0
      ? members.map((m) => `- **${m.profile?.display_name || m.profile?.username || 'Builder'}** (@${m.profile?.username || 'colleague'}) — *${m.role}*`).join('\n')
      : `- **Project Lead** — *Lead Engineer*`;

  const fallbackReadme = `# ${project.title}

> ${customTagline}

[![Collegiate Verified on Linkora](https://img.shields.io/badge/Linkora-Collegiate%20Verified%20Project-6366f1?style=for-the-badge&logo=shield)](https://linkora-link.online/projects/${project.id})
[![License: ${licenseType}](https://img.shields.io/badge/License-${encodeURIComponent(licenseType)}-emerald?style=for-the-badge)](LICENSE)
[![Category: ${project.category}](https://img.shields.io/badge/Category-${encodeURIComponent(project.category)}-amber?style=for-the-badge)](https://linkora-link.online)

---

## 📖 Table of Contents
- [📌 The Problem](#-the-problem)
- [💡 Proposed Solution](#-proposed-solution)
- [🏗 System Architecture](#-system-architecture)
- [⚡ Core Features](#-core-features)
- [🛠 Tech Stack Matrix](#-tech-stack-matrix)
- [🚀 Quick Start & Local Setup](#-quick-start--local-setup)
- [👥 Collegiate Contributors](#-collegiate-contributors)
- [📜 License](#-license)

---

## 📌 The Problem
In modern collegiate and developer ecosystems, fragmented tools and delayed synchronization create major development bottlenecks. Teams juggle across 4-5 disconnected tools, losing time and losing track of verifiable proof of work.

## 💡 Proposed Solution
**${project.title}** solves this friction through an integrated, high-speed engineering platform. By combining real-time synchronization, edge acceleration, and tamper-proof verification, collaborators execute seamlessly from prototype to production.

---

## 🏗 System Architecture

\`\`\`
Client Tier (Next.js 14 App Router)
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

\`\`\`bash
git clone ${project.repository_url || `https://github.com/linkora-campus/${project.id.slice(0, 8)}`}
cd ${project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}
${installCommand}
\`\`\`

---

## 👥 Collegiate Contributors

${contributorList}

---

## 📜 License
Distributed under the **${licenseType}**. Built with pride for collegiate hackathons on Linkora.
`;

  const activeReadme = aiGeneratedReadme || fallbackReadme;

  const handleGenerateAiReadme = async () => {
    setIsGeneratingReadme(true);
    try {
      const res = await fetch('/api/ai/closer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'readme',
          project: {
            id: project.id,
            title: project.title,
            description: customTagline,
            category: project.category,
            required_skills: project.required_skills,
            repository_url: project.repository_url,
            demo_url: project.demo_url,
          },
          members,
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        setAiGeneratedReadme(data.content);
        try {
          recordDailyStreakActivity({
            type: 'WORKSPACE_ACTIVITY',
            note: `Generated authentic GitHub-grade README with AI for ${project.title}`,
            title: project.title,
            userId: currentUserId,
          });
        } catch {}
      }
    } catch (err) {
      console.error('Failed to generate AI README:', err);
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(activeReadme);
    setCopiedReadme(true);
    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Copied README for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}
    setTimeout(() => setCopiedReadme(false), 2200);
  };

  const handleDownloadReadme = () => {
    const element = document.createElement('a');
    const file = new Blob([activeReadme], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // =========================================================================
  // 2. PITCH DECK STATE & DYNAMIC SCRIPT MODES
  // =========================================================================
  const [pitchMode, setPitchMode] = useState<'hackathon' | 'investor' | 'campus'>('hackathon');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Default initial slides for Hackathon mode
  const defaultHackathonSlides = [
    {
      number: 1,
      title: 'The Hook & Collegiate Problem',
      timing: '0:00 - 0:25 (25s)',
      focus: 'Quantify student chaos and friction in the domain',
      script: `Judges, think about the last time you tried to ship a high-stakes engineering project with a student team. The tools are scattered, communication breaks down at 2 AM, and half the code never gets verified. In ${project.category}, this chaos kills great ideas. That is why we built ${project.title}. We turn scattered student friction into a unified, high-speed execution machine.`,
      keyPoints: [
        `Quantify friction: teams waste 40% of their build time lost between scattered tools.`,
        `Emotionally connect with student hackathon reality.`,
        `State our core thesis: ${project.title} as the unified engineering command center.`,
      ],
    },
    {
      number: 2,
      title: 'The Architectural Solution',
      timing: '0:25 - 0:50 (25s)',
      focus: 'Demonstrate technical credibility & engineering choices',
      script: `Instead of another superficial prototype, we engineered a production architecture powered by ${project.required_skills?.slice(0, 3).join(', ') || 'Next.js 14, Supabase, and real-time WebSockets'}. We prioritized sub-50ms latency, zero-lag peer collaboration, and cryptographic credential verification so every milestone is verifiably attributed.`,
      keyPoints: [
        `Highlight architectural choices: sub-50ms latency, RLS, zero state collisions.`,
        `Mention specific tech: ${project.required_skills?.join(' • ') || 'Next.js 14, Supabase'}.`,
        `Differentiate from toy student projects.`,
      ],
    },
    {
      number: 3,
      title: 'The Live Demo Magic Moment',
      timing: '0:50 - 1:20 (30s)',
      focus: 'Trigger the core user action live on screen',
      script: `Let me show you how it works in real life. In less than three clicks, any collaborator boots the workspace, embeds live Figma prototypes without frame-blocking, and reviews teammate viewpoints in real time. Notice how the state syncs instantly across all devices. This is the difference between a school assignment and a production engineering product.`,
      keyPoints: [
        `Show the core workflow: 3 clicks from zero to live sync.`,
        `Point to the screen: prove real-time responsiveness.`,
        `Demonstrate resilience: unblocked previews & instant audio mesh.`,
      ],
    },
    {
      number: 4,
      title: 'Scalability, Moat & Verification',
      timing: '1:20 - 1:45 (25s)',
      focus: 'Explain how this expands beyond 1 college to 50+ campuses',
      script: `We didn't just build for this 24-hour hackathon. Our multi-tenant architecture is designed to scale across university campuses. With Linkora's cryptographic credential protocol, every student who contributes receives tamper-proof proof of work that recruiters can verify with one click on LinkedIn. That is our retention flywheel.`,
      keyPoints: [
        `Multi-campus scalability across 50+ universities.`,
        `Cryptographic proof-of-work: tamper-proof recruiter credentials.`,
        `Incentive flywheel: students return to protect their streak.`,
      ],
    },
    {
      number: 5,
      title: 'The Dream Team & The Ask',
      timing: '1:45 - 2:00 (15s)',
      focus: 'High-energy close & open for judge Q&A',
      script: `Our squad consists of dedicated engineers and designers across frontend, backend, and system design. We have shipped the code, passed all verifications, and are ready to scale. We are ${project.title}, and we would love to answer your questions. Thank you!`,
      keyPoints: [
        `Introduce the multidisciplinary squad members and roles.`,
        `Closing call to action: "We invite you to test our live demo."`,
        `Stand tall, pause, and open for judge grilling.`,
      ],
    },
  ];

  const defaultInvestorSlides = [
    {
      number: 1,
      title: 'The Collegiate Market Opportunity',
      timing: '0:00 - 0:35 (35s)',
      focus: 'Market size & unmet need',
      script: `Over 20 million university engineers graduate every year worldwide, yet 78% lack verified proof-of-work to show top tech recruiters. Traditional portfolios are static and unverified. In ${project.category}, ${project.title} bridges this multi-billion dollar recruiting gap.`,
      keyPoints: [`TAM: 20M+ university STEM students.`, `Problem: Static resumes fail recruiter checks.`, `Solution: Verifiable collaborative deliverables.`],
    },
    {
      number: 2,
      title: 'The Product & Moat',
      timing: '0:35 - 1:15 (40s)',
      focus: 'Why our tech wins',
      script: `We replace disconnected WhatsApp groups and fragmented Notion docs with an all-in-one execution hub: live Figma prototyping, peer audio huddles, and automated closer kits. Our cryptographic signature protocol anchors student proof of work permanently.`,
      keyPoints: [`Consolidates 5 fragmented tools.`, `Proprietary proxy engine & WebRTC audio mesh.`, `Tamper-proof credential moat.`],
    },
    {
      number: 3,
      title: 'Business Model & Unit Economics',
      timing: '1:15 - 1:55 (40s)',
      focus: 'Monetization and B2B university clubs',
      script: `Our business model operates on a campus freemium flywheel: free for student hackathons, with premium team workspace tiers and B2B university career center integrations at $15/seat/year.`,
      keyPoints: [`Freemium viral growth across student clubs.`, `B2B Career Center licensing.`, `Recruiter talent sourcing pipeline.`],
    },
    {
      number: 4,
      title: 'Traction & Viral Flywheel',
      timing: '1:55 - 2:30 (35s)',
      focus: 'Daily streak retention metrics',
      script: `Our Daily Streak system creates compounding habit loops. Users who publish a project return daily to collaborate in the workspace, generating authentic network effects across entire university departments.`,
      keyPoints: [`Compounding daily streak engagement.`, `Peer referral invitations.`, `LinkedIn credential viral loop.`],
    },
    {
      number: 5,
      title: 'The Team & Growth Ask',
      timing: '2:30 - 3:00 (30s)',
      focus: 'Capital ask and roadmap',
      script: `We are seeking strategic mentors, campus hackathon partnerships, and angel support to expand to 50 engineering colleges this year. Join us in shaping how the next generation of engineers build.`,
      keyPoints: [`50 campus roadmap for 2026.`, `Mentorship & institutional pilots.`, `Confident investor close.`],
    },
  ];

  const defaultCampusSlides = [
    {
      number: 1,
      title: 'Campus Elevator Hook',
      timing: '0:00 - 0:15 (15s)',
      focus: 'Instant connection with fellow students',
      script: `Tired of chasing teammates on WhatsApp at 2 AM before a deadline? We built ${project.title} so student builders can stop arguing over broken links and start shipping winning projects together.`,
      keyPoints: [`Kill WhatsApp chaos.`, `One link for the entire project.`],
    },
    {
      number: 2,
      title: 'The 3 Superpowers',
      timing: '0:15 - 0:40 (25s)',
      focus: 'Fastest value delivery',
      script: `Inside, you get 1-click in-browser voice huddles without installing Discord, universal unblocked Figma and web previews, and AI that writes your hackathon README and 2-minute pitch deck in 30 seconds.`,
      keyPoints: [`Browser audio huddle.`, `Unblocked Figma & web previews.`, `AI pitch & README generator.`],
    },
    {
      number: 3,
      title: 'Start Your Build Streak Today',
      timing: '0:40 - 1:00 (20s)',
      focus: 'Immediate viral CTA',
      script: `Try our live demo right now on your phone or laptop. Start your project, claim your first day build streak, and let's ship something great together!`,
      keyPoints: [`Scan QR or open demo link.`, `Ignite Day 1 build streak.`],
    },
  ];

  const [activeSlides, setActiveSlides] = useState(defaultHackathonSlides);

  // Default Judge Defense Q&A
  const [judgeDefenses, setJudgeDefenses] = useState([
    {
      q: `Why wouldn't students just use Discord or WhatsApp instead of ${project.title}?`,
      a: `Discord requires account creation, app installs, and server setup which creates immense friction during a 24h hostel hackathon. WhatsApp loses links and files under hundreds of messages with zero version control. ${project.title} is 1-click in the browser, unblocks any website or Figma prototype directly, and issues cryptographically verified certificates that neither WhatsApp nor Discord can ever provide.`,
    },
    {
      q: `How do you handle website iframe blocking (X-Frame-Options / CSP)?`,
      a: `We engineered a universal proxy at /api/proxy-preview that fetches the target URL server-side, strips restrictive X-Frame-Options and Content-Security-Policy headers, injects base tag resolution for relative assets, and neutralizes frame-busting scripts with an inline window.top override shim.`,
    },
    {
      q: `What happens if team members are behind college firewall or symmetric NAT for audio?`,
      a: `Our WebRTC audio mesh connects through multiple STUN relays (Google, Cloudflare, and Twilio) with an internal candidate queue buffer that eliminates race conditions during peer connection negotiation. Incoming streams are also routed directly to the Web Audio destination to bypass browser autoplay blocks.`,
    },
    {
      q: `How do you keep students coming back to the platform after the hackathon ends?`,
      a: `Through our Daily Build Streak engine and Verified Proof-of-Work portfolio. Day 0 requires starting a project, Day 1 requires publishing it, and subsequent days increment through active workspace collaboration. Students protect their streak to showcase verified commitment to recruiters on LinkedIn.`,
    },
    {
      q: `How does your team plan to scale this to other universities?`,
      a: `Our database schema is built with multi-tenant row-level security and campus isolation. We deploy campus hackathon instances with zero setup, enabling university clubs to run private hostel hackathons with automated leaderboards and certificate generation.`,
    },
  ]);

  // Mode switcher handler
  const handleSwitchPitchMode = (mode: 'hackathon' | 'investor' | 'campus') => {
    setPitchMode(mode);
    setCurrentSlideIndex(0);
    setIsTimerRunning(false);
    if (mode === 'hackathon') {
      setActiveSlides(defaultHackathonSlides);
      setTimerSeconds(120);
    } else if (mode === 'investor') {
      setActiveSlides(defaultInvestorSlides);
      setTimerSeconds(180);
    } else {
      setActiveSlides(defaultCampusSlides);
      setTimerSeconds(60);
    }
  };

  // Generate Custom AI Pitch Script
  const handleGenerateAiPitch = async () => {
    setIsGeneratingPitch(true);
    try {
      const res = await fetch('/api/ai/closer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pitch',
          project: {
            id: project.id,
            title: project.title,
            description: customTagline,
            category: project.category,
            required_skills: project.required_skills,
          },
          members,
          pitchMode,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.slides)) {
        setActiveSlides(data.slides);
        if (Array.isArray(data.judgeDefenses)) {
          setJudgeDefenses(data.judgeDefenses);
        }
        try {
          recordDailyStreakActivity({
            type: 'WORKSPACE_ACTIVITY',
            note: `Generated customized ${pitchMode.toUpperCase()} pitch script with AI for ${project.title}`,
            title: project.title,
            userId: currentUserId,
          });
        } catch {}
      }
    } catch (err) {
      console.error('Failed to generate AI pitch:', err);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Timer logic
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
    setTimerSeconds(pitchMode === 'hackathon' ? 120 : pitchMode === 'investor' ? 180 : 60);
  };

  const fullPitchScript = activeSlides
    .map(
      (s) =>
        `### SLIDE ${s.number}: ${s.title.toUpperCase()} (${s.timing})\n\n**Presenter Script:**\n"${s.script}"\n\n**Key Delivery Points:**\n${s.keyPoints.map((k) => `- ${k}`).join('\n')}\n`
    )
    .join('\n---\n\n');

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(fullPitchScript);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2200);
  };

  // =========================================================================
  // 3. MULTI-DISCIPLINARY ARCHITECTURE STACKS
  // =========================================================================
  const [selectedArchType, setSelectedArchType] = useState<ArchitectureType>(initialArch);
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  const ARCHITECTURE_CONFIGS: Record<ArchitectureType, {
    label: string;
    icon: any;
    badge: string;
    description: string;
    layers: Array<{ layer: number; name: string; tech: string; role: string }>;
    mermaid: string;
  }> = {
    saas: {
      label: 'Web & Full-Stack SaaS',
      icon: Layers,
      badge: 'Next.js 14 + Supabase',
      description: 'Zero-latency edge rendering, Server Components, and real-time PostgreSQL replication.',
      layers: [
        { layer: 1, name: 'Client Presentation', tech: 'Next.js 14 App Router, TailwindCSS, React Server Components', role: 'Sub-second initial paint, optimistic updates, zero layout shift' },
        { layer: 2, name: 'Edge API & Middleware', tech: 'Vercel Edge Functions, Next.js Route Handlers, JWT Gatekeeper', role: 'Sub-50ms edge validation, CORS proxying, rate-limiting' },
        { layer: 3, name: 'Database & Realtime', tech: 'Supabase PostgreSQL, Postgres Realtime Changefeed, RLS Policies', role: 'Multi-tenant isolation, real-time presence broadcast' },
        { layer: 4, name: 'Trust & Verification', tech: 'Linkora Cryptographic Credential Protocol, SVG Proof Signatures', role: 'Verifiable proof of work and recruiter LinkedIn badge export' },
      ],
      mermaid: `graph TD
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
  CertEngine --> LinkedIn`,
    },
    ai: {
      label: 'AI & Machine Learning',
      icon: Cpu,
      badge: 'FastAPI + PyTorch + pgvector',
      description: 'Sub-100ms streaming inference, vector embeddings, and LLM agent orchestration.',
      layers: [
        { layer: 1, name: 'Interactive UI Tier', tech: 'Next.js 14 Streaming Chat UI, Audio WebRTC Mesh', role: 'Low-latency token streaming, voice command input' },
        { layer: 2, name: 'Inference Orchestration', tech: 'Python FastAPI, LangChain / LlamaIndex, Edge Router', role: 'Prompt engineering, token optimization, async task dispatch' },
        { layer: 3, name: 'Model & Vector Embedding Store', tech: 'PyTorch / HuggingFace Models, pgvector / Supabase Vector', role: 'Semantic indexing, cosine similarity retrieval, context memory' },
        { layer: 4, name: 'Evaluation & Verifiable Output', tech: 'Automated Fact-Checking, Linkora Proof Protocol', role: 'Hallucination guardrails and cryptographically anchored outputs' },
      ],
      mermaid: `graph TD
  subgraph Interface ["Client Tier"]
    ChatUI["Streaming UI (Next.js 14)"]
    Voice["WebRTC Audio Stream"]
  end

  subgraph Gateway ["Inference Gateway"]
    FastAPI["FastAPI Orchestrator"]
    Agent["LangChain / LlamaIndex Agent"]
  end

  subgraph Engine ["ML Engine & Vectors"]
    PyTorch["PyTorch / Model Runner"]
    VectorDB[("pgvector Embeddings")]
  end

  subgraph Persistence ["Application State"]
    SupabaseDB[("PostgreSQL Metadata")]
    Proof["Linkora Verified Hash"]
  end

  ChatUI --> FastAPI
  Voice --> FastAPI
  FastAPI --> Agent
  Agent --> PyTorch
  Agent --> VectorDB
  Agent --> SupabaseDB
  SupabaseDB --> Proof`,
    },
    iot: {
      label: 'IoT & Hardware Systems',
      icon: Radio,
      badge: 'ESP32 + MQTT + InfluxDB',
      description: 'Telemetry ingestion, sensor buses, time-series aggregation, and mission control dashboards.',
      layers: [
        { layer: 1, name: 'Physical Hardware & Sensors', tech: 'ESP32 / Arduino / Raspberry Pi, GPIO Sensor Bus', role: 'Real-world data capture (temperature, GPS, telemetry, motion)' },
        { layer: 2, name: 'Telemetry Broker & Ingestion', tech: 'MQTT Broker (Mosquitto / EMQX), WebSockets Gateway', role: 'Ultra-lightweight packet publishing over low-bandwidth cellular/WiFi' },
        { layer: 3, name: 'Time-Series & Telemetry Store', tech: 'Supabase PostgreSQL / InfluxDB, Aggregated Rollups', role: 'Sub-millisecond time-series writes and metric windowing' },
        { layer: 4, name: 'Real-Time Mission Dashboard', tech: 'Next.js Canvas, SVG Gauges, Alert Threshold Webhooks', role: 'Live hardware control, emergency kill-switches, and audit log' },
      ],
      mermaid: `graph TD
  subgraph Hardware ["Hardware Edge"]
    Sensors["Sensors & Actuators"]
    MCU["ESP32 / Microcontroller"]
  end

  subgraph Ingestion ["Telemetry Bridge"]
    MQTT["MQTT Broker / Gateway"]
    WS["WebSocket Ingestion Relay"]
  end

  subgraph Storage ["Time-Series Data"]
    TSDB[("Time-Series DB / Supabase")]
    Analytics["Anomaly Detection Worker"]
  end

  subgraph Dashboard ["Operator View"]
    WebUI["Mission Control Dashboard"]
    Alerts["Real-Time Alert Dispatch"]
  end

  Sensors --> MCU
  MCU --> MQTT
  MQTT --> WS
  WS --> TSDB
  TSDB --> Analytics
  TSDB --> WebUI
  Analytics --> Alerts`,
    },
    mobile: {
      label: 'Mobile & Offline-First',
      icon: Smartphone,
      badge: 'React Native / Flutter + SQLite',
      description: '60fps native feel, local SQLite offline cache, and background delta synchronization.',
      layers: [
        { layer: 1, name: 'Mobile Client Shell', tech: 'React Native (Expo) / Flutter, Gesture Handler', role: '60fps native feel, background sync, push notification receipt' },
        { layer: 2, name: 'Offline Storage & Replicache', tech: 'SQLite / WatermelonDB, CRDT Conflict-Free State', role: 'Full functionality without WiFi, auto-sync upon reconnection' },
        { layer: 3, name: 'Backend API & Sync Bridge', tech: 'Node.js Edge Handlers, GraphQL / REST Endpoints', role: 'Delta synchronization, session security, media asset uploads' },
        { layer: 4, name: 'Database & Realtime Channel', tech: 'Supabase PostgreSQL, S3 Asset Buckets, Row-Level Security', role: 'Persistent cloud source-of-truth and multi-device state mirror' },
      ],
      mermaid: `graph TD
  subgraph Mobile ["Mobile Device"]
    AppUI["React Native / Flutter Shell"]
    OfflineDB[("Local SQLite / WatermelonDB")]
  end

  subgraph SyncEngine ["Sync Bridge"]
    SyncWorker["CRDT Delta Synchronizer"]
    APIGateway["Edge API Gateway"]
  end

  subgraph CloudCore ["Cloud Services"]
    CloudDB[("PostgreSQL Central DB")]
    Push["Expo Push Notification Service"]
  end

  AppUI <--> OfflineDB
  OfflineDB <--> SyncWorker
  SyncWorker --> APIGateway
  APIGateway <--> CloudDB
  CloudDB --> Push
  Push --> AppUI`,
    },
    web3: {
      label: 'Web3 & Smart Contracts',
      icon: Coins,
      badge: 'Solidity + EVM + IPFS',
      description: 'On-chain execution, non-custodial wallets, IPFS decentralized storage, and subgraph indexing.',
      layers: [
        { layer: 1, name: 'DApp Client Interface', tech: 'Next.js 14, Wagmi, RainbowKit, Viem', role: 'Non-custodial wallet connection, gas fee estimation, signing UI' },
        { layer: 2, name: 'Smart Contract Protocol', tech: 'Solidity EVM Contracts, Hardhat / Foundry, OpenZeppelin', role: 'Deterministic on-chain state, automated escrow, tokenomics' },
        { layer: 3, name: 'Decentralized Storage', tech: 'IPFS / Filecoin, Arweave, Decentralized Graph Indexing', role: 'Censorship-resistant project assets and immutable commit logs' },
        { layer: 4, name: 'Off-Chain Indexer & Verifier', tech: 'The Graph Subgraphs, Linkora Proof Oracle, Supabase Cache', role: 'High-speed querying of on-chain events without RPC throttling' },
      ],
      mermaid: `graph TD
  subgraph ClientDApp ["Client DApp"]
    Web3UI["Next.js DApp UI"]
    Wallet["Web3 Wallet (MetaMask / Phantom)"]
  end

  subgraph OnChain ["Smart Contract Layer"]
    EVM["Solidity Smart Contracts"]
    Escrow["On-Chain Escrow Protocol"]
  end

  subgraph DecentralizedStore ["Immutable Storage"]
    IPFS["IPFS Content Hash Store"]
  end

  subgraph Indexer ["Index & Oracle"]
    TheGraph["The Graph Subgraph Indexer"]
    LinkoraOracle["Linkora Verification Oracle"]
  end

  Web3UI --> Wallet
  Wallet --> EVM
  EVM --> Escrow
  Web3UI --> IPFS
  EVM --> TheGraph
  TheGraph --> Web3UI
  Escrow --> LinkoraOracle`,
    },
  };

  const currentArchConfig = ARCHITECTURE_CONFIGS[selectedArchType];

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(currentArchConfig.mermaid);
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
            1-Click tools to convert raw code into winning hackathon deliverables: authentic GitHub README with shields badges, dynamic timed pitch scripts, and stack-adaptive system architecture.
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
            <span>Pitch Deck ({pitchMode})</span>
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
            <span>Architecture ({currentArchConfig.label})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: AI README GENERATOR (AUTHENTIC GITHUB LOOK & REAL AI)
         ========================================================================= */}
      {activeTab === 'readme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-violet-400" />
                  <span>README Customization</span>
                </h3>
                {aiGeneratedReadme && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    ✨ AI Enhanced
                  </span>
                )}
              </div>

              {/* Real AI Generation Button */}
              <Button
                onClick={handleGenerateAiReadme}
                disabled={isGeneratingReadme}
                variant="primary"
                size="sm"
                className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold shadow-md"
                leftIcon={
                  isGeneratingReadme ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  )
                }
              >
                {isGeneratingReadme ? 'Generating GitHub README...' : '✨ Generate Authentic AI README'}
              </Button>

              <div className="space-y-3 text-xs pt-1">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Project Tagline / Pitch
                  </label>
                  <textarea
                    rows={2}
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
                Teammates are credited in the GitHub README table with their exact role and GitHub handle.
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
                  GitHub Formatted Preview
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

            <div className="p-6 rounded-2xl bg-charcoal-950 border border-charcoal-800 max-h-[640px] overflow-y-auto font-sans shadow-inner">
              {readmePreviewMode === 'raw' ? (
                <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                  {activeReadme}
                </pre>
              ) : (
                <div className="space-y-6 text-slate-200 text-xs sm:text-sm leading-relaxed">
                  {/* GitHub Style Header */}
                  <div className="border-b border-charcoal-800 pb-5">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>{project.title}</span>
                    </h1>
                    <p className="text-slate-300 italic mt-2 text-sm leading-relaxed">
                      {customTagline}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        Linkora Verified
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                        {licenseType}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                        {project.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                        Next.js 14
                      </span>
                    </div>
                  </div>

                  {/* Overview */}
                  <div>
                    <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      <span>🚀 Overview</span>
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                      {project.description ||
                        'A high-performance engineering initiative built for collegiate hackathons and production impact.'}
                    </p>
                  </div>

                  {/* Architecture & Tech Stack */}
                  <div>
                    <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      <span>🛠️ Architecture & Tech Stack</span>
                    </h2>
                    <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs text-slate-300 overflow-x-auto">
                      <pre className="whitespace-pre">
{currentArchConfig.mermaid}
                      </pre>
                    </div>
                  </div>

                  {/* Getting Started */}
                  <div>
                    <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      <span>⚡ Getting Started</span>
                    </h2>
                    <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs text-emerald-400">
                      <code>{installCommand}</code>
                    </div>
                  </div>

                  {/* Contributors Table */}
                  <div>
                    <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                      <span>👥 Collegiate Contributors</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {members.map((m) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-xs flex items-center justify-center">
                              {(m.profile?.display_name || m.profile?.username || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-white text-xs">
                              {m.profile?.display_name || m.profile?.username || 'Colleague'}
                            </span>
                          </div>
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
          TAB 2: DYNAMIC PITCH DECK & SCRIPT (HACKATHON, INVESTOR, CAMPUS MODES)
         ========================================================================= */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          {/* Pitch Mode Switcher Bar */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Pitch Mode:
              </span>
              <div className="flex items-center gap-1 bg-charcoal-950 p-1 rounded-xl border border-charcoal-800 text-xs">
                <button
                  onClick={() => handleSwitchPitchMode('hackathon')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    pitchMode === 'hackathon'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🏆 2-Min Hackathon Demo
                </button>
                <button
                  onClick={() => handleSwitchPitchMode('investor')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    pitchMode === 'investor'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💼 3-Min Investor Pitch
                </button>
                <button
                  onClick={() => handleSwitchPitchMode('campus')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    pitchMode === 'campus'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ 1-Min Campus Elevator
                </button>
              </div>
            </div>

            <Button
              onClick={handleGenerateAiPitch}
              disabled={isGeneratingPitch}
              size="sm"
              variant="primary"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold"
              leftIcon={
                isGeneratingPitch ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )
              }
            >
              {isGeneratingPitch ? 'Generating Custom Pitch...' : `✨ Generate Custom ${pitchMode.toUpperCase()} Script`}
            </Button>
          </div>

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
                  {pitchMode === 'hackathon' ? '2-Minute Hackathon Demo Rehearsal' : pitchMode === 'investor' ? '3-Minute Investor Pitch Rehearsal' : '1-Minute Elevator Pitch Rehearsal'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isTimerRunning
                    ? '⏱️ Speech timer running! Speak clearly and time your live cues.'
                    : 'Hit Start to begin your timed rehearsal run.'}
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

          {/* Slides Nav Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {activeSlides.map((slide, idx) => (
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
          {activeSlides[currentSlideIndex] && (
            <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-800 pb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-violet-400 uppercase tracking-widest">
                    Slide {activeSlides[currentSlideIndex].number} of {activeSlides.length} • {activeSlides[currentSlideIndex].timing}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {activeSlides[currentSlideIndex].title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-charcoal-800 text-slate-300 border border-charcoal-700">
                    Focus: {activeSlides[currentSlideIndex].focus || 'Key Takeaway'}
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
                  "{activeSlides[currentSlideIndex].script}"
                </div>
              </div>

              {/* Delivery Guidance Points */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Key Slide Visuals & Delivery Tips
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeSlides[currentSlideIndex].keyPoints.map((point, kIdx) => (
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
          )}

          {/* Hackathon Judge Defense Q&A Section */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  🛡️ Hackathon Judge Defense Q&A (Top 5 Tough Questions & How to Answer)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Prepared for Judges Grilling
              </span>
            </div>

            <div className="space-y-3">
              {judgeDefenses.map((qa, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 shrink-0">
                      Q{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-white">
                      {qa.q}
                    </h4>
                  </div>
                  <div className="flex items-start gap-2 pl-8">
                    <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                      Answer:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {qa.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MULTI-DISCIPLINARY ARCHITECTURE STACKS (ADAPTABLE TO ANY DOMAIN)
         ========================================================================= */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Architecture Stack Selector */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                Select Architecture Stack for Your Project:
              </span>
              <span className="text-[11px] font-mono text-violet-300">
                Auto-Detected: {initialArch.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {(Object.keys(ARCHITECTURE_CONFIGS) as ArchitectureType[]).map((archKey) => {
                const item = ARCHITECTURE_CONFIGS[archKey];
                const Icon = item.icon;
                const isSelected = selectedArchType === archKey;

                return (
                  <button
                    key={archKey}
                    onClick={() => setSelectedArchType(archKey)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500 text-white ring-2 ring-violet-500/30'
                        : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:text-white hover:bg-charcoal-850'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-violet-300' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold text-white line-clamp-1">{item.label}</div>
                    <div className="text-[10px] font-mono text-slate-400 line-clamp-1 mt-0.5">{item.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-violet-400" />
                    <span>{currentArchConfig.label} Blueprint</span>
                  </h3>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                    {currentArchConfig.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {currentArchConfig.description}
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

            {/* 4 Interactive Architecture Layers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {currentArchConfig.layers.map((l) => (
                <div
                  key={l.layer}
                  className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="text-violet-400 font-bold">LAYER {l.layer}</span>
                    <span className="uppercase text-[10px]">{l.name.split(' ')[0]}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{l.name}</h4>
                  <p className="text-xs font-mono text-violet-300 bg-charcoal-900 p-1.5 rounded border border-charcoal-800">
                    {l.tech}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    {l.role}
                  </p>
                </div>
              ))}
            </div>

            {/* Mermaid Code Snippet Box */}
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Mermaid Architecture Code (Paste into GitHub README or Notion)</span>
                <span className="text-[11px] text-slate-500">Syntax: graph TD</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-3 bg-charcoal-900 rounded-lg whitespace-pre">
                {currentArchConfig.mermaid}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
