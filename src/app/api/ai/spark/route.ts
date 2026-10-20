import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';
import { SparkModelSettings } from '@/app/api/spark/settings/route';

export const runtime = 'nodejs';

export interface SparkScorecard {
  innovation: number;
  feasibility: number;
  judgeAppeal: number;
  overall: number;
  critique: string;
}

export interface SparkElevatorPitch {
  problem: string;
  solution: string;
  unfairAdvantage: string;
}

export interface SparkTechStackCategorized {
  frontend: string[];
  backend: string[];
  database: string[];
  aiOrCloud: string[];
}

export interface SparkSkillGapAnalysis {
  userSkillsFound: string[];
  missingRolesToRecruit: string[];
  coveredRoles: string[];
  analysis: string;
}

export interface SparkBlueprintResponse {
  title: string;
  tagline: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  scores: SparkScorecard;
  winningTwist: string;
  elevatorPitch: SparkElevatorPitch;
  techStackByCategory: SparkTechStackCategorized;
  technologies: string[];
  desired_roles: string[];
  rolesBreakdown: {
    role: string;
    skills: string[];
    focus: string;
    isCoveredByUser?: boolean;
  }[];
  skillGaps?: SparkSkillGapAnalysis;
  resumeBullets: string[];
  milestones: {
    title: string;
    duration: string;
    deliverables: string;
  }[];
  hackathonTrack?: string;
  engine: string;
  matchedBlueprint?: string;
  matchScore?: number;
}

function toTitleCase(str: string): string {
  return str
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function extractCleanTerms(raw: string): string {
  return raw
    .replace(/[^\w\s]/gi, '')
    .replace(/\b(a|an|the|app|for|with|in|to|and|of|using|i|want|build|make|create|like|system|platform)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Compute skill gap between user provided skills and project roles
function computeSkillGaps(
  userSkillsInput: string | string[] | undefined,
  rolesBreakdown: { role: string; skills: string[]; focus: string; isCoveredByUser?: boolean }[]
): SparkSkillGapAnalysis | undefined {
  if (!userSkillsInput) return undefined;

  const rawUserSkills = Array.isArray(userSkillsInput)
    ? userSkillsInput
    : userSkillsInput.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

  if (rawUserSkills.length === 0) return undefined;

  const userSkillsJoined = rawUserSkills.join(' ').toLowerCase();

  const covered: string[] = [];
  const missing: string[] = [];

  rolesBreakdown.forEach((r) => {
    const roleMatches = r.skills.some((sk) => userSkillsJoined.includes(sk.toLowerCase())) ||
      userSkillsJoined.includes(r.role.toLowerCase().replace(/lead|specialist|engineer|designer/g, '').trim());

    if (roleMatches) {
      r.isCoveredByUser = true;
      covered.push(r.role);
    } else {
      r.isCoveredByUser = false;
      missing.push(r.role);
    }
  });

  const analysis = covered.length > 0
    ? `You have skills aligned with ${covered.join(' & ')}. You urgently need to recruit ${missing.length > 0 ? missing.join(' and ') : 'collaborators'} to complete your squad on Linkora.`
    : `Your skills provide a strong foundation. Recruit ${missing.join(', ')} on Linkora to assemble a complementary hackathon squad.`;

  return {
    userSkillsFound: rawUserSkills,
    coveredRoles: covered,
    missingRolesToRecruit: missing,
    analysis,
  };
}

/**
 * Intelligent Dynamic Synthesis Engine v2 (Option 5 Full Blueprint)
 */
function synthesizeDynamicBlueprint(
  prompt: string,
  track?: string,
  userSkillsInput?: string | string[]
): SparkBlueprintResponse {
  const p = prompt.toLowerCase().trim();
  const rawTerms = extractCleanTerms(p);
  const coreSubject = toTitleCase(rawTerms.slice(0, 35)) || 'Next-Gen Campus Innovation';

  // Domain detection
  const isAgri = /crop|farm|agri|plant|soil|field|harvest|seed|irrigation|pest|leaf/i.test(p);
  const isHealth = /health|medic|doctor|patient|clinic|hospital|disease|diagnos|mental|heart|ecg|therapy|bio/i.test(p);
  const isFinance = /pay|money|fintech|bank|bill|split|expense|wallet|invest|loan|budget|upi|credit/i.test(p);
  const isWeb3 = /blockchain|crypto|solidity|nft|dao|web3|decentral|smart contract|token|wallet/i.test(p);
  const isIoT = /iot|arduino|hardware|sensor|robot|raspberry|esp32|microcontroller|drone|firmware|embedded/i.test(p);
  const isAI = /ai|ml|learning|vision|model|nlp|llm|detect|neural|opencv|yolo|predict|speech|audio|agent/i.test(p);
  const isEdu = /campus|college|student|tutor|exam|quiz|learn|study|syllabus|hostel|attendance|canteen|class/i.test(p);
  const isDelivery = /food|deliver|order|restaurant|cart|grocery|e-commerce|store|shop|tracking|driver/i.test(p);
  const isSecurity = /security|cyber|hack|auth|encrypt|phish|vulnerab|penetrat|privacy|firewall|network/i.test(p);
  const isGreen = /green|solar|waste|recycle|energy|carbon|water|pollution|climate|ev|electric vehicle/i.test(p);

  let category = 'Web Development';
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
  let title = `${coreSubject}: Autonomous Real-Time Hub`;
  let tagline = `Solving collegiate and real-world ${coreSubject.toLowerCase()} challenges through modern reactive engineering.`;
  let summary = `Architected as a multi-tier collaborative platform, ${coreSubject} unifies real-time event streams with intelligent processing to eliminate manual bottlenecks for campus communities.`;

  let innovationScore = 88;
  let feasibilityScore = 92;
  let judgeAppealScore = 90;
  let critique = `Strong practical relevance with high weekend demonstrability. Differentiator lies in low-latency event synchronization.`;

  let winningTwist = `P2P dynamic routing combined with localized offline caching, reducing cloud infrastructure cost to near zero while guaranteeing sub-50ms responsiveness.`;
  let elevatorPitch: SparkElevatorPitch = {
    problem: `Students and university operators currently rely on fragmented, slow manual tools to handle ${coreSubject.toLowerCase()}.`,
    solution: `A unified platform with reactive state sync, verified cryptographic audit trails, and automated workflow dispatch.`,
    unfairAdvantage: `Zero friction onboarding, instant peer-to-peer collaboration, and native integration into collegiate workspaces.`,
  };

  let techStackByCategory: SparkTechStackCategorized = {
    frontend: ['Next.js 14', 'TypeScript', 'TailwindCSS', 'Zustand'],
    backend: ['Node.js / Express', 'WebSockets', 'tRPC'],
    database: ['PostgreSQL (Supabase)', 'Redis Pub/Sub'],
    aiOrCloud: ['Vercel Edge', 'Docker', 'RESTful APIs'],
  };

  let rolesBreakdown = [
    {
      role: 'Full-Stack Lead Engineer',
      skills: ['Next.js 14', 'TypeScript', 'TailwindCSS', 'State Management'],
      focus: `Lead responsive multi-view layout, reactive client state, and component architecture.`,
    },
    {
      role: 'Backend & Data Specialist',
      skills: ['PostgreSQL', 'FastAPI / Node.js', 'Redis', 'JWT Auth'],
      focus: `Implement normalized relational data structures, secure endpoints, and real-time pub/sub bus.`,
    },
    {
      role: 'Product & UI/UX Designer',
      skills: ['Figma', 'Design Systems', 'Micro-Interactions', 'User Testing'],
      focus: `Craft high-fidelity interactive wireframes, component design tokens, and smooth user flow journeys.`,
    },
  ];

  let resumeBullets = [
    `Architected multi-tier reactive web platform using Next.js 14 and PostgreSQL, handling concurrent user events with sub-80ms response times.`,
    `Engineered real-time pub/sub synchronization pipeline utilizing Redis and WebSockets, cutting state latency by 45%.`,
    `Designed component design system with 25+ reusable accessible widgets, maintaining 98%+ Lighthouse performance score.`,
  ];

  if (isAgri) {
    category = 'IoT/Hardware';
    difficulty = 'Advanced';
    title = `${coreSubject}: Precision Agro-Telemetry & Autonomous Edge Diagnostics`;
    tagline = `Transforming field monitoring with real-time sensor fusion and lightweight on-device vision.`;
    summary = `Combines localized ESP32 telemetry nodes with edge-quantized computer vision to detect crop distress markers and optimize irrigation before yield degradation occurs.`;
    innovationScore = 94;
    feasibilityScore = 86;
    judgeAppealScore = 95;
    critique = `Exceptional social impact for Smart India Hackathon and national contests. Demonstrating edge ML inference live guarantees high judge scoring.`;
    winningTwist = `Edge-quantized YOLOv8 model running directly in-browser via WebAssembly / ONNX, enabling zero-internet offline disease detection in remote rural farmlands.`;
    elevatorPitch = {
      problem: `Smallholder farmers lose up to 35% of crop yields due to late disease detection and irregular irrigation telemetry.`,
      solution: `Affordable solar-powered IoT micro-stations combined with an instant offline-first web diagnosis scanner.`,
      unfairAdvantage: `Requires zero expensive cloud GPU subscriptions — all inference runs directly on the user's smartphone.`,
    };
    techStackByCategory = {
      frontend: ['Next.js 14', 'TailwindCSS', 'WebAssembly (WASM)', 'PWA Offline'],
      backend: ['FastAPI (Python)', 'MQTT Broker', 'WebSockets'],
      database: ['PostgreSQL / TimescaleDB', 'Supabase Storage'],
      aiOrCloud: ['YOLOv8 Edge', 'ONNX Runtime Web', 'OpenCV'],
    };
    rolesBreakdown = [
      {
        role: 'Edge ML & Computer Vision Engineer',
        skills: ['PyTorch', 'YOLOv8', 'ONNX Runtime', 'Python'],
        focus: `Quantize and fine-tune lightweight leaf disease detection models for sub-200ms browser WASM inference.`,
      },
      {
        role: 'Embedded IoT & Firmware Developer',
        skills: ['ESP32', 'C++', 'MicroPython', 'MQTT / LoRa'],
        focus: `Program low-power telemetry nodes, calibrate soil/humidity sensors, and manage sleep cycles.`,
      },
      {
        role: 'Full-Stack Dashboard Architect',
        skills: ['Next.js', 'TypeScript', 'TailwindCSS', 'Recharts'],
        focus: `Build interactive geospatial telemetry maps, moisture trend visualizers, and offline PWA service workers.`,
      },
    ];
    resumeBullets = [
      `Developed edge-quantized YOLOv8 plant pathology model deployed via ONNX WebAssembly, achieving 94.2% diagnostic accuracy offline.`,
      `Engineered low-power MQTT telemetry ingest pipeline connecting 10+ ESP32 sensor clusters with sub-second dashboard refreshes.`,
      `Built offline-first progressive web application (PWA) with client-side IndexedDB caching and geospatial heatmaps.`,
    ];
  } else if (isHealth) {
    category = 'AI/ML';
    difficulty = 'Advanced';
    title = `${coreSubject}: Clinical Diagnostics Copilot & Triage Radar`;
    tagline = `Accelerating outpatient triage, medical report interpretation, and patient tracking.`;
    summary = `Bridges complex medical lab records and clinical vitals into structured actionable summaries with privacy-preserving localized embeddings.`;
    innovationScore = 92;
    feasibilityScore = 87;
    judgeAppealScore = 96;
    critique = `High commercial and healthcare relevance. Focus on patient privacy and hallucination guards to impress judges.`;
    winningTwist = `Strict local differential privacy layer with self-verifying citation highlights in lab reports, preventing AI hallucinations.`;
    elevatorPitch = {
      problem: `Doctors spend 40% of their clinic time navigating dense historical lab reports and unstructured test notes.`,
      solution: `An intelligent clinical copilot that highlights abnormal biomarkers and charts longitudinal patient trends in seconds.`,
      unfairAdvantage: `Deterministic citation anchors linking every recommendation directly to verified lab values.`,
    };
    techStackByCategory = {
      frontend: ['Next.js 14', 'React Flow', 'TailwindCSS', 'Lucide'],
      backend: ['FastAPI (Python)', 'LangChain / LlamaIndex', 'Node.js'],
      database: ['PostgreSQL (pgvector)', 'Redis Cache'],
      aiOrCloud: ['HuggingFace Transformers', 'Ollama / Local LLM', 'Docker'],
    };
    rolesBreakdown = [
      {
        role: 'Lead Healthcare AI / NLP Engineer',
        skills: ['LangChain', 'pgvector', 'PyTorch', 'Prompt Guardrails'],
        focus: `Implement robust biomarker extraction pipelines and fine-tune RAG retrieval with hallucination guards.`,
      },
      {
        role: 'Full-Stack Clinical Systems Lead',
        skills: ['Next.js 14', 'TypeScript', 'FastAPI', 'PostgreSQL'],
        focus: `Architect HIPAA-aligned data encryption, role-based clinician access control, and PDF extraction endpoints.`,
      },
      {
        role: 'Medical Informatics UI/UX Designer',
        skills: ['Figma', 'Accessible Design', 'Data Visualization', 'Healthcare UX'],
        focus: `Design high-density visual vitals dashboards and clear patient risk level indicators.`,
      },
    ];
    resumeBullets = [
      `Engineered privacy-preserving clinical RAG pipeline using pgvector and FastAPI, parsing 50-page medical PDFs in under 1.8 seconds.`,
      `Designed deterministic citation verification system reducing LLM hallucination rate in medical biomarker extraction to <1.2%.`,
      `Implemented end-to-end AES-256 field-level encrypted patient database architecture with strict role-based access control (RBAC).`,
    ];
  } else if (isAI) {
    category = 'AI/ML';
    difficulty = 'Advanced';
    title = `${coreSubject}: Multi-Agent Autonomous Workflow Orchestrator`;
    tagline = `Empowering campus builders with autonomous agentic problem decomposition and tool calling.`;
    summary = `Leverages specialized cooperative autonomous agents to break down complex multi-step objectives into verifiable parallel code execution streams.`;
    innovationScore = 96;
    feasibilityScore = 89;
    judgeAppealScore = 97;
    critique = `At the cutting-edge of 2026 tech trends. Agentic workflows with human-in-the-loop controls score exceptionally high with tech juries.`;
    winningTwist = `Deterministic human-in-the-loop checkpointing with rollback capabilities, allowing agents to execute complex shell/API workflows safely.`;
    elevatorPitch = {
      problem: `Traditional chat LLMs hallucinate on multi-step workflows and lack real execution sandbox capabilities.`,
      solution: `A coordinated multi-agent runtime where specialized agents write, verify, and execute code within isolated containers.`,
      unfairAdvantage: `Instant parallel task decomposition with visual tree-of-thought progress tracking.`,
    };
    techStackByCategory = {
      frontend: ['Next.js 14', 'React Flow', 'TailwindCSS', 'Zustand'],
      backend: ['FastAPI', 'Python 3.12', 'LangGraph / AutoGen'],
      database: ['PostgreSQL (Supabase)', 'Qdrant / Milvus (Vector)'],
      aiOrCloud: ['Gemini 1.5 Flash', 'Groq / Llama 3', 'Docker Sandboxes'],
    };
    rolesBreakdown = [
      {
        role: 'Agentic Systems & LLM Architect',
        skills: ['LangGraph', 'Python', 'Tool Calling', 'Vector DBs'],
        focus: `Design agent orchestration graphs, memory persistence layers, and deterministic tool schemas.`,
      },
      {
        role: 'Full-Stack Runtime Engineer',
        skills: ['Next.js 14', 'TypeScript', 'FastAPI', 'WebSockets'],
        focus: `Construct reactive agent tree-of-thought canvas and stream token-by-token agent reasoning.`,
      },
      {
        role: 'Cloud Sandbox & DevOps Specialist',
        skills: ['Docker', 'Firecracker', 'Linux Security', 'AWS/GCP'],
        focus: `Provision ephemeral execution environments to run agent-generated code safely without host risk.`,
      },
    ];
    resumeBullets = [
      `Architected multi-agent autonomous system using LangGraph and FastAPI, executing 15-step engineering workflows with 96% task completion.`,
      `Developed reactive DAG visualization canvas with React Flow and WebSockets, rendering live agent reasoning trees with <40ms update latency.`,
      `Integrated secure ephemeral Docker sandbox runtime executing untrusted code with resource quotas and automated rollback mechanisms.`,
    ];
  }

  // Combine technologies into flat list
  const technologies = [
    ...techStackByCategory.frontend,
    ...techStackByCategory.backend,
    ...techStackByCategory.database,
    ...techStackByCategory.aiOrCloud,
  ];

  const desired_roles = rolesBreakdown.map((r) => r.role);
  const skillGaps = computeSkillGaps(userSkillsInput, rolesBreakdown);

  const milestones = [
    {
      title: 'Phase 1: Architecture & Foundation Contracts',
      duration: 'Week 1',
      deliverables: `Setup core repository, database schema models, and base UI scaffolds for ${coreSubject}.`,
    },
    {
      title: 'Phase 2: Core Engine & Domain Logic',
      duration: 'Week 2',
      deliverables: `Develop core business logic, API routes, and state persistence with automated test cases.`,
    },
    {
      title: 'Phase 3: Integration, Telemetry & Security',
      duration: 'Week 3',
      deliverables: `Wire end-to-end user flows, add error boundaries, and benchmark response latencies.`,
    },
    {
      title: 'Phase 4: Production Deployment & Pitch Demo',
      duration: 'Week 4',
      deliverables: `Ship public deployment, generate README badges, and prepare live demo showcase for hackathon judges.`,
    },
  ];

  return {
    title,
    tagline,
    category,
    difficulty,
    summary,
    scores: {
      innovation: innovationScore,
      feasibility: feasibilityScore,
      judgeAppeal: judgeAppealScore,
      overall: Math.round((innovationScore * 0.35 + feasibilityScore * 0.3 + judgeAppealScore * 0.35)),
      critique,
    },
    winningTwist,
    elevatorPitch,
    techStackByCategory,
    technologies,
    desired_roles,
    rolesBreakdown,
    skillGaps,
    resumeBullets,
    milestones,
    hackathonTrack: track || 'Open Innovation Track',
    engine: 'Linkora Neural Architecture Engine v2',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = (body.prompt || '').trim();
    const track = (body.track || '').trim();
    const userSkills = body.userSkills;

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: 'Please enter a project idea or concept to spark.' }, { status: 400 });
    }

    // Check master spark settings for admin overrides
    const sparkSettings = await getMasterControlSubkey<SparkModelSettings>('sparkSettings', {
      engine: 'auto',
      geminiApiKey: '',
      openaiApiKey: '',
      temperature: 0.7,
      customSystemPrompt: '',
    });

    const geminiKey = sparkSettings.geminiApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = sparkSettings.openaiApiKey || process.env.OPENAI_API_KEY;
    const preferredEngine = sparkSettings.engine || 'auto';

    let blueprint: SparkBlueprintResponse | null = null;

    // 1. If Gemini is available and preferred/auto
    if (geminiKey && (preferredEngine === 'auto' || preferredEngine === 'gemini')) {
      try {
        const sysPrompt = `You are a Principal Software Architect and Hackathon Grand Prize Judge.
A student gave you their raw project idea: "${prompt}".
${track ? `Target Hackathon Track: "${track}".` : ''}
${userSkills ? `Student's Existing Skills: "${Array.isArray(userSkills) ? userSkills.join(', ') : userSkills}".` : ''}
${sparkSettings.customSystemPrompt ? `Additional Admin Instructions: ${sparkSettings.customSystemPrompt}` : ''}

Generate an authentic, highly tailored engineering blueprint strictly matching their exact concept. Do NOT give generic boilerplate answers. Tailor every field specifically to their concept.

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Creative, punchy, professional title based on their idea",
  "tagline": "A single compelling sentence describing the value proposition",
  "category": "Web Development" | "AI/ML" | "Mobile Apps" | "Developer Tools" | "Social Impact" | "IoT/Hardware" | "FinTech" | "Cybersecurity",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "summary": "2-3 detailed sentences explaining technical architecture, problem solved, and end user outcome for their exact idea.",
  "scores": {
    "innovation": number between 75 and 98,
    "feasibility": number between 75 and 98,
    "judgeAppeal": number between 75 and 98,
    "overall": number between 75 and 98,
    "critique": "1-2 sentences explaining why this scores high with hackathon judges and what will make it win."
  },
  "winningTwist": "A specific killer feature or unfair architectural advantage that elevates this from a generic clone into a hackathon winner.",
  "elevatorPitch": {
    "problem": "The acute pain point students/users face.",
    "solution": "How this software directly solves it with engineering innovation.",
    "unfairAdvantage": "Why this team or architecture will succeed over competitors."
  },
  "techStackByCategory": {
    "frontend": ["3 modern frontend tools, e.g. Next.js 14, TailwindCSS, Zustand"],
    "backend": ["3 modern backend tools, e.g. FastAPI, Node.js, WebSockets"],
    "database": ["2 modern database tools, e.g. PostgreSQL, Redis"],
    "aiOrCloud": ["2 modern AI/Cloud tools, e.g. Gemini API, Docker, Vercel"]
  },
  "rolesBreakdown": [
    {
      "role": "Specific role name, e.g. Full-Stack Lead Engineer",
      "skills": ["3-4 relevant technical skills"],
      "focus": "One clear sentence on their primary technical contribution to this idea."
    },
    {
      "role": "Specific role name, e.g. Backend & Systems Specialist",
      "skills": ["3-4 relevant technical skills"],
      "focus": "One clear sentence on their primary technical contribution to this idea."
    },
    {
      "role": "Specific role name, e.g. UI/UX & Product Designer",
      "skills": ["3-4 relevant technical skills"],
      "focus": "One clear sentence on their primary technical contribution to this idea."
    }
  ],
  "resumeBullets": [
    "ATS-friendly resume bullet point highlighting technical achievement with metrics",
    "Second ATS bullet point highlighting architecture/performance impact",
    "Third ATS bullet point highlighting database/cloud/security design"
  ],
  "milestones": [
    { "title": "Phase 1: Architecture & Foundation", "duration": "Week 1", "deliverables": "Deliverables for week 1" },
    { "title": "Phase 2: Core Feature Implementation", "duration": "Week 2", "deliverables": "Deliverables for week 2" },
    { "title": "Phase 3: Integration & Testing", "duration": "Week 3", "deliverables": "Deliverables for week 3" },
    { "title": "Phase 4: Deployment & Pitch Demo", "duration": "Week 4", "deliverables": "Deliverables for week 4" }
  ]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: sysPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: sparkSettings.temperature || 0.7,
              },
            }),
          }
        );

        if (res.ok) {
          const aiJson = await res.json();
          const text = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const flatTech = [
              ...(parsed.techStackByCategory?.frontend || []),
              ...(parsed.techStackByCategory?.backend || []),
              ...(parsed.techStackByCategory?.database || []),
              ...(parsed.techStackByCategory?.aiOrCloud || []),
            ];

            const roles = (parsed.rolesBreakdown || []).map((r: any) => r.role);
            const skillGaps = computeSkillGaps(userSkills, parsed.rolesBreakdown || []);

            blueprint = {
              ...parsed,
              technologies: flatTech.length > 0 ? flatTech : ['Next.js 14', 'TypeScript', 'TailwindCSS', 'PostgreSQL'],
              desired_roles: roles.length > 0 ? roles : ['Full-Stack Lead', 'Backend Specialist', 'UI/UX Designer'],
              skillGaps,
              hackathonTrack: track || 'Open Innovation Track',
              engine: 'Google Gemini 1.5 Flash',
            };
          }
        }
      } catch (err) {
        console.warn('Gemini spark call warning:', err);
      }
    }

    // 2. If OpenAI is available and preferred/auto
    if (!blueprint && openaiKey && (preferredEngine === 'auto' || preferredEngine === 'openai')) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an elite hackathon judge and principal software architect. Generate comprehensive project blueprint JSON conforming strictly to the requested schema.',
              },
              {
                role: 'user',
                content: `Idea: "${prompt}". Track: "${track || 'General'}". User skills: "${userSkills || 'Not specified'}".`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: sparkSettings.temperature || 0.7,
          }),
        });

        if (res.ok) {
          const aiJson = await res.json();
          const content = aiJson.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const flatTech = [
              ...(parsed.techStackByCategory?.frontend || []),
              ...(parsed.techStackByCategory?.backend || []),
              ...(parsed.techStackByCategory?.database || []),
              ...(parsed.techStackByCategory?.aiOrCloud || []),
            ];

            const roles = (parsed.rolesBreakdown || []).map((r: any) => r.role);
            const skillGaps = computeSkillGaps(userSkills, parsed.rolesBreakdown || []);

            blueprint = {
              ...parsed,
              technologies: flatTech.length > 0 ? flatTech : ['Next.js 14', 'TypeScript', 'TailwindCSS', 'PostgreSQL'],
              desired_roles: roles.length > 0 ? roles : ['Full-Stack Lead', 'Backend Specialist', 'UI/UX Designer'],
              skillGaps,
              hackathonTrack: track || 'Open Innovation Track',
              engine: 'OpenAI GPT-4o-mini',
            };
          }
        }
      } catch (err) {
        console.warn('OpenAI spark call warning:', err);
      }
    }

    // 3. Dynamic Contextual Neural Synthesis Engine (Runs reliably anywhere without API keys)
    if (!blueprint) {
      blueprint = synthesizeDynamicBlueprint(prompt, track, userSkills);
    }

    return NextResponse.json({
      success: true,
      blueprint,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate project blueprint.' },
      { status: 500 }
    );
  }
}
