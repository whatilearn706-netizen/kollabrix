import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CloserRequestPayload {
  action: 'readme' | 'pitch' | 'architecture';
  project: {
    id: string;
    title: string;
    description?: string;
    category: string;
    required_skills?: string[];
    repository_url?: string;
    demo_url?: string;
  };
  members?: Array<{
    role: string;
    profile?: {
      display_name?: string;
      username?: string;
    };
  }>;
  pitchMode?: 'hackathon' | 'investor' | 'campus';
  targetAudience?: 'judges' | 'investors' | 'peers';
  customTone?: 'high-energy' | 'technical' | 'conversational';
}

function detectDomain(title: string, desc: string, category: string, skills: string[]) {
  const text = `${title} ${desc} ${category} ${skills.join(' ')}`.toLowerCase();
  return {
    isAI: /ai|ml|learning|neural|vision|llm|nlp|gpt|opencv|model|predict|detection/i.test(text),
    isHealth: /health|medic|doctor|patient|disease|clinic|hospital|mental|cardio|bio/i.test(text),
    isFintech: /pay|money|fintech|bank|bill|split|wallet|crypto|loan|upi|credit|budget/i.test(text),
    isWeb3: /crypto|blockchain|solidity|nft|dao|web3|smart contract|token|wallet/i.test(text),
    isIoT: /iot|hardware|sensor|arduino|esp32|drone|embedded|robot|raspberry/i.test(text),
    isEdu: /campus|college|student|study|exam|quiz|tutor|syllabus|hostel|academic/i.test(text),
    isTransit: /transit|mobility|route|traffic|vehicle|bike|scooter|bus|commute|transport/i.test(text),
    isGreen: /green|solar|waste|energy|carbon|water|recycle|eco|sustain/i.test(text),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CloserRequestPayload = await request.json();
    const { action, project, members = [], pitchMode = 'hackathon', targetAudience = 'judges', customTone = 'high-energy' } = body;

    if (!project?.title) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }

    const domain = detectDomain(
      project.title,
      project.description || '',
      project.category || 'General',
      project.required_skills || []
    );

    // =========================================================================
    // 1. ACTION: REAL GITHUB-QUALITY README
    // =========================================================================
    if (action === 'readme') {
      const skills = project.required_skills && project.required_skills.length > 0
        ? project.required_skills
        : ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Supabase', 'PostgreSQL'];

      const sanitizedSlug = project.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const repoUrl = project.repository_url || `https://github.com/linkora-campus/${sanitizedSlug}`;
      const demoUrl = project.demo_url || `https://kollabrix.in/projects/${project.id}`;

      // Build realistic architecture diagram based on domain
      let archDiagram = '';
      if (domain.isAI) {
        archDiagram = `\`\`\`
  ┌─────────────────────────────────────────────────────────────┐
  │              Client Interface (Next.js 14 App Router)       │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ REST / WebSocket
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │         Inference Gateway & API Server (FastAPI / Node)      │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
                 ▼                              ▼
  ┌──────────────────────────────┐ ┌─────────────────────────────┐
  │ PyTorch / ONNX ML Pipeline   │ │ Supabase PostgreSQL + Vector│
  │ (Real-time Feature Extract)  │ │ (Embeddings & Session State)│
  └──────────────────────────────┘ └─────────────────────────────┘
\`\`\``;
      } else if (domain.isIoT) {
        archDiagram = `\`\`\`
  ┌────────────────────────┐         ┌────────────────────────┐
  │ Edge Hardware / Sensors│ ──────> │ MQTT / WebSocket Relay │
  │ (ESP32 / Microchip)    │         │ (Telemetry Telemetry)  │
  └────────────────────────┘         └───────────┬────────────┘
                                                 │
                                                 ▼
  ┌────────────────────────┐         ┌────────────────────────┐
  │ Real-Time User Web App │ <────── │ Time-Series Database   │
  │ (Next.js 14 Dashboard) │         │ (Supabase / InfluxDB)  │
  └────────────────────────┘         └────────────────────────┘
\`\`\``;
      } else {
        archDiagram = `\`\`\`
  ┌─────────────────────────────────────────────────────────────┐
  │          Client Tier (Next.js 14 React Server Components)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ HTTPS / Server Actions
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │            Edge API Middleware & Row-Level Security         │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
                 ▼                              ▼
  ┌──────────────────────────────┐ ┌─────────────────────────────┐
  │ Supabase PostgreSQL DB       │ │ Real-Time WebSocket Channel │
  │ (Multi-Tenant Isolated Schema)│ │ (Instant State Broadcast)   │
  └──────────────────────────────┘ └─────────────────────────────┘
\`\`\``;
      }

      const contributorsMd = members.length > 0
        ? members.map((m, idx) => `| ${idx + 1} | **${m.profile?.display_name || m.profile?.username || 'Builder'}** | \`@${m.profile?.username || 'engineer'}\` | ${m.role} |`).join('\n')
        : `| 1 | **Project Lead** | \`@lead-engineer\` | Architecture & Full-Stack |`;

      const generatedReadme = `# ${project.title}

> **${project.description || `Next-generation ${project.category} engineered for collegiate velocity and production impact.`}**

<p align="left">
  <a href="${repoUrl}"><img src="https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge" alt="License MIT" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Framework-Next.js%2014-black.svg?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Database-Supabase%20Postgres-3ecf8e.svg?style=for-the-badge&logo=supabase" alt="Supabase" /></a>
  <a href="https://kollabrix.in"><img src="https://img.shields.io/badge/Kollabrix-Collegiate%20Verified-6366f1.svg?style=for-the-badge&logo=shield" alt="Kollabrix Verified" /></a>
</p>

---

## 📖 Table of Contents
- [📌 The Problem](#-the-problem)
- [💡 Proposed Solution](#-proposed-solution)
- [🏗 System Architecture](#-system-architecture)
- [⚡ Core Features](#-core-features)
- [🛠 Tech Stack Matrix](#-tech-stack-matrix)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🚀 Quick Start & Local Setup](#-quick-start--local-setup)
- [🧪 API Reference & Endpoints](#-api-reference--endpoints)
- [👥 Collegiate Contributors](#-collegiate-contributors)
- [📜 License](#-license)

---

## 📌 The Problem
In modern campus and commercial ecosystems, fragmented tools and delayed synchronization result in significant bottlenecks. Traditional workflows force users to navigate across 4–5 disconnected services, causing high latency, dropped state, and zero verifiable contribution tracking.

## 💡 Proposed Solution
**${project.title}** solves this friction through an integrated, high-speed engineering architecture. By combining synchronous peer-to-peer data channels with edge-accelerated routing and verifiable cryptographic credentials, the platform delivers zero-latency coordination from prototype to final deployment.

---

## 🏗 System Architecture

${archDiagram}

### Architectural Highlights
- **Sub-50ms Response Times**: Leverages edge compute and cached database queries.
- **Cryptographic Row-Level Security**: Guarantees tenant isolation across all user operations.
- **State Hydration**: Instant synchronization across distributed client sessions via WebSocket broadcast.

---

## ⚡ Core Features

- 🎯 **Intelligent Execution Pipeline**: Automates high-friction workflows with domain-specific logic.
- ⚡ **Real-Time Synchronized State**: Updates reflect instantly across all connected teammates.
- 🛡️ **Enterprise Security & RLS**: Multi-tenant database policies prevent unauthorized data mutations.
- 📱 **Adaptive Viewport Engine**: Fully optimized for mobile screens (375px), tablets (768px), and 4K displays.
- 🏆 **Proof-of-Work Verification**: Cryptographically anchored project credentials suitable for resumes and LinkedIn.

---

## 🛠 Tech Stack Matrix

| Layer | Technologies |
| :--- | :--- |
| **Frontend & UI** | Next.js 14 (App Router), React 18, TailwindCSS, Lucide Icons, Framer Motion |
| **Backend & Edge** | Next.js Server Actions, Edge API Handlers, Node.js Runtime |
| **Database & Auth** | Supabase PostgreSQL, Row-Level Security (RLS), Realtime Channels |
| **Language & Tooling** | TypeScript 5.x, ESLint, Git, Vercel Edge Network |

---

## ⚙️ Environment Configuration

Create a \`.env.local\` file in the project root:

\`\`\`env
# Supabase Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_HUDDLE=true
\`\`\`

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- Node.js \`>= 18.17.0\`
- npm \`>= 9.0.0\` or pnpm

### 2. Clone the repository
\`\`\`bash
git clone ${repoUrl}.git
cd ${sanitizedSlug}
\`\`\`

### 3. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 4. Run development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

### 5. Production Build
\`\`\`bash
npm run build
npm run start
\`\`\`

---

## 🧪 API Reference & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| \`GET\` | \`/api/projects\` | Fetches active project metadata and credentials |
| \`POST\` | \`/api/workspace/data\` | Synchronizes live workspace scratchpad and standup states |
| \`GET\` | \`/api/proxy-preview?url=:target\` | Strips framing headers for live prototype sandboxing |

---

## 👥 Collegiate Contributors

| # | Name | GitHub Handle | Responsibility |
| :-: | :--- | :--- | :--- |
${contributorsMd}

---

## 📜 License
Distributed under the **MIT License**. See \`LICENSE\` for more details. Built with pride on [Kollabrix](https://kollabrix.in).
`;

      return NextResponse.json({
        success: true,
        content: generatedReadme,
        metadata: {
          title: project.title,
          repoUrl,
          demoUrl,
          category: project.category,
        },
      });
    }

    // =========================================================================
    // 2. ACTION: CUSTOMIZED 2-MINUTE PITCH GENERATOR
    // =========================================================================
    if (action === 'pitch') {
      const isJudgeMode = pitchMode === 'hackathon';
      const isInvestorMode = pitchMode === 'investor';
      const isCampusMode = pitchMode === 'campus';

      const techStackSummary = (project.required_skills && project.required_skills.length > 0)
        ? project.required_skills.slice(0, 4).join(', ')
        : 'Next.js 14, Supabase, and real-time WebSockets';

      let slides = [];

      if (isJudgeMode) {
        // 2-Minute Demo-First Hackathon Pitch
        slides = [
          {
            number: 1,
            title: 'The Hook & Collegiate Problem',
            timing: '0:00 - 0:25 (25s)',
            focus: 'Grab judges attention with high-impact friction in the domain',
            script: `Judges, picture this: in collegiate engineering, teams waste up to 40% of their build time juggling disconnected tools, losing links in WhatsApp, and debating API structures at 2 AM. In ${project.category}, this chaos kills great ideas before demo day. That is why our squad built ${project.title}. We turn scattered student friction into a unified, high-speed execution machine.`,
            keyPoints: [
              `Quantify the pain point: 40% time lost to tool chaos in ${project.category}.`,
              `Connect emotionally with student hackathon reality.`,
              `State the bold thesis: ${project.title} as the single command center.`,
            ],
          },
          {
            number: 2,
            title: 'The Architectural Solution',
            timing: '0:25 - 0:50 (25s)',
            focus: 'Demonstrate technical credibility & engineering choices',
            script: `Instead of another superficial prototype, we engineered a production architecture built on ${techStackSummary}. We chose sub-50ms edge routing, real-time peer data synchronization, and multi-tenant row-level security. This means our platform scales out of the box with zero state collisions and instant client hydration.`,
            keyPoints: [
              `Mention specific technologies: ${techStackSummary}.`,
              `Highlight non-obvious engineering: sub-50ms latency, RLS, zero state collisions.`,
              `Differentiate from toy student projects.`,
            ],
          },
          {
            number: 3,
            title: 'The Live Demo Magic Moment',
            timing: '0:50 - 1:20 (30s)',
            focus: 'Trigger the core user action live on screen',
            script: `Let me show you the live build. In three clicks, any collaborator boots the workspace, embeds live design prototypes without frame-blocking, and streams peer audio with zero third-party software. Look at this screen: state updates reflect across all devices in under 180 milliseconds. This is what modern collegiate collaboration looks like.`,
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
            script: `We didn't just build for this 24-hour hackathon. Our database architecture supports multi-campus cohorts. With Kollabrix's cryptographic credential protocol, every student who writes a line of code receives a tamper-proof certificate that recruiters can verify with one click on LinkedIn. That is our retention loop.`,
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
            script: `Our team brings together engineers across frontend, backend, and system design. We've shipped the MVP, passed end-to-end verifications, and deployed live to production. We are ${project.title}, and we're ready for your toughest questions!`,
            keyPoints: [
              `Introduce multidisciplinary squad.`,
              `State that the app is live right now in production.`,
              `Confident call to action: invite judge grilling.`,
            ],
          },
        ];
      } else if (isInvestorMode) {
        // 3-Minute Investor / Grant Pitch
        slides = [
          {
            number: 1,
            title: 'The Market Opportunity & Pain',
            timing: '0:00 - 0:40 (40s)',
            focus: 'TAM, target customer persona, and economic friction',
            script: `Every year, over 20 million STEM students enter higher education, yet 85% of collegiate projects die in Google Drive folders because there is no bridge between hackathons and enterprise hiring. ${project.title} captures this multi-million dollar talent and prototype pipeline right at the source in ${project.category}.`,
            keyPoints: [
              `20M+ STEM university student demographic.`,
              `85% abandoned project rate represents massive lost enterprise IP.`,
              `Value capture in ${project.category}.`,
            ],
          },
          {
            number: 2,
            title: 'Product Defensibility & Moat',
            timing: '0:40 - 1:20 (40s)',
            focus: 'Network effects, proprietary protocol, and user lock-in',
            script: `Our product is defensible through two powerful flywheels: proprietary proof-of-work credentials that students embed in their resumes, and real-time team workspaces that retain active project history. The more a campus builds on our stack, the higher the switching cost.`,
            keyPoints: [
              `Dual flywheel: verified credential portfolio + active team workspace.`,
              `High switching costs once a team stores their architecture vault here.`,
              `Organic viral invite coefficient through team assembly.`,
            ],
          },
          {
            number: 3,
            title: 'Live Product Demo & Traction',
            timing: '1:20 - 2:00 (40s)',
            focus: 'Working MVP, user retention, and platform activity',
            script: `Here is the platform live today. We have fully functional WebRTC audio, universal preview proxies, and automated closer kits. Our daily streak gamification ensures builders return every 24 hours to push incremental commits and review teammate proposals.`,
            keyPoints: [
              `Live production build with zero mockups.`,
              `Daily build streak gamification drives daily active usage (DAU).`,
              `Peer review loops keep teams engaged daily.`,
            ],
          },
          {
            number: 4,
            title: 'Business Model & Unit Economics',
            timing: '2:00 - 2:35 (35s)',
            focus: 'Monetization via university enterprise licenses & recruiter talent search',
            script: `We monetize through a B2B campus licensing model for university innovation cells, alongside verified recruiter talent search tiers. Universities pay for institutional hackathon analytics, while top tier tech companies pay to discover verified student builders before campus placement season.`,
            keyPoints: [
              `B2B Campus Innovation Cell SaaS tier (\$2,500 - \$10,000 / year).`,
              `Recruiter verified talent search platform.`,
              `Direct monetization of the hiring pipeline.`,
            ],
          },
          {
            number: 5,
            title: 'The Team & The Investment Ask',
            timing: '2:35 - 3:00 (25s)',
            focus: 'Funding ask, milestone roadmap, and founder execution',
            script: `We are seeking grant funding and seed partners to expand from our initial campus launch to 25 university campuses over the next two academic semesters. Join us in powering the next generation of builders. Thank you.`,
            keyPoints: [
              `Clear 2-semester roadmap to 25 partner universities.`,
              `Capital allocation: campus ambassador networks & server infrastructure.`,
              `Open for partner Q&A.`,
            ],
          },
        ];
      } else {
        // 1-Minute Campus / Expo Pitch
        slides = [
          {
            number: 1,
            title: 'The Quick Hook',
            timing: '0:00 - 0:15 (15s)',
            focus: 'Instant relatable problem',
            script: `Tired of losing your hackathon links across messy WhatsApp groups and Discord servers? We built ${project.title} so student builders can run their entire project in one tab.`,
            keyPoints: [`Instant relatable problem: scattered links.`],
          },
          {
            number: 2,
            title: 'The Feature Trio',
            timing: '0:15 - 0:40 (25s)',
            focus: 'Show the 3 best features',
            script: `Inside, you get 1-click in-browser voice with your friends, live Figma and web previews that never get blocked, and automated pitch decks that write your hackathon submission in 30 seconds.`,
            keyPoints: [`Voice huddle without Discord.`, `Universal unblocked canvas.`, `AI pitch deck.`],
          },
          {
            number: 3,
            title: 'Join the Build',
            timing: '0:40 - 1:00 (20s)',
            focus: 'Immediate action',
            script: `Try our live demo right now on your phone or laptop. Start your project, ignite your daily build streak, and let's ship something great together!`,
            keyPoints: [`Scan QR or open demo link.`, `Start daily build streak.`],
          },
        ];
      }

      // 5 Anticipated Judge Questions & Answers
      const judgeDefenses = [
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
      ];

      return NextResponse.json({
        success: true,
        pitchMode,
        targetAudience,
        customTone,
        slides,
        judgeDefenses,
      });
    }

    // =========================================================================
    // 3. ACTION: MULTI-DISCIPLINARY ARCHITECTURE GENERATOR
    // =========================================================================
    if (action === 'architecture') {
      const archType = (body as any).archType || (domain.isAI ? 'ai' : domain.isIoT ? 'iot' : domain.isWeb3 ? 'web3' : 'saas');

      const architectures: Record<string, any> = {
        saas: {
          id: 'saas',
          title: 'Full-Stack Web & Real-Time SaaS',
          badge: 'Next.js 14 + Supabase',
          layers: [
            { layer: 1, name: 'Client Presentation', tech: 'Next.js 14 App Router, TailwindCSS, React Server Components', role: 'Sub-second initial paint, optimistic updates, zero layout shift' },
            { layer: 2, name: 'Edge API & Middleware', tech: 'Vercel Edge Functions, Next.js Route Handlers, JWT Gatekeeper', role: 'Sub-50ms edge validation, CORS proxying, rate-limiting' },
            { layer: 3, name: 'Database & Realtime', tech: 'Supabase PostgreSQL, Postgres Realtime Changefeed, RLS Policies', role: 'Multi-tenant isolation, real-time presence broadcast' },
            { layer: 4, name: 'Trust & Verification', tech: 'Kollabrix Cryptographic Credential Protocol, SVG Proof Signatures', role: 'Verifiable proof of work and recruiter LinkedIn badge export' },
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
          id: 'ai',
          title: 'AI / Machine Learning & Intelligent Agent Stack',
          badge: 'FastAPI + PyTorch + pgvector',
          layers: [
            { layer: 1, name: 'User Interaction Interface', tech: 'Next.js 14 Streaming Chat UI, Audio WebRTC Mesh', role: 'Low-latency streaming responses, voice command input' },
            { layer: 2, name: 'Inference & Orchestration Gateway', tech: 'Python FastAPI, LangChain / LlamaIndex, Edge Router', role: 'Prompt engineering, token optimization, async task dispatch' },
            { layer: 3, name: 'Model & Vector Embedding Store', tech: 'PyTorch / HuggingFace Models, pgvector / Supabase Vector', role: 'Semantic indexing, cosine similarity retrieval, context memory' },
            { layer: 4, name: 'Evaluation & Verifiable Output', tech: 'Automated Fact-Checking, Kollabrix Proof Protocol', role: 'Hallucination guardrails and cryptographically anchored outputs' },
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
    Proof["Kollabrix Verified Hash"]
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
          id: 'iot',
          title: 'IoT, Hardware Telemetry & Embedded Systems',
          badge: 'ESP32 + MQTT + InfluxDB',
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
          id: 'mobile',
          title: 'Cross-Platform Mobile & Offline-First PWA',
          badge: 'React Native / Flutter + SQLite',
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
          id: 'web3',
          title: 'Web3, Smart Contracts & Decentralized Protocol',
          badge: 'Solidity + EVM + IPFS',
          layers: [
            { layer: 1, name: 'DApp Client Interface', tech: 'Next.js 14, Wagmi, RainbowKit, Viem', role: 'Non-custodial wallet connection, gas fee estimation, signing UI' },
            { layer: 2, name: 'Smart Contract Protocol', tech: 'Solidity EVM Contracts, Hardhat / Foundry, OpenZeppelin', role: 'Deterministic on-chain state, automated escrow, tokenomics' },
            { layer: 3, name: 'Decentralized Storage', tech: 'IPFS / Filecoin, Arweave, Decentralized Graph Indexing', role: 'Censorship-resistant project assets and immutable commit logs' },
            { layer: 4, name: 'Off-Chain Indexer & Verifier', tech: 'The Graph Subgraphs, Kollabrix Proof Oracle, Supabase Cache', role: 'High-speed querying of on-chain events without RPC throttling' },
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
    KollabrixOracle["Kollabrix Verification Oracle"]
  end
  Web3UI --> Wallet
  Wallet --> EVM
  EVM --> Escrow
  Web3UI --> IPFS
  EVM --> TheGraph
  TheGraph --> Web3UI
  Escrow --> KollabrixOracle`,
        },
      };

      const selected = architectures[archType] || architectures.saas;

      return NextResponse.json({
        success: true,
        archType,
        architecture: selected,
        availableTypes: Object.keys(architectures),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('AI Closer API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
