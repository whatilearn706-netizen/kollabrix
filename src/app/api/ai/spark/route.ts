import { NextRequest, NextResponse } from 'next/server';
import { getMasterControlSubkey } from '@/lib/admin/masterConfigStorage';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';

export const runtime = 'nodejs';

export interface SparkBlueprintResponse {
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
  engine: string;
  matchedBlueprint?: string;
  matchScore?: number;
}

// Capitalize words cleanly
function toTitleCase(str: string): string {
  return str
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Clean and extract keywords from prompt
function extractCleanTerms(raw: string): string {
  return raw
    .replace(/[^\w\s]/gi, '')
    .replace(/\b(a|an|the|app|for|with|in|to|and|of|using|i|want|build|make|create|like|system|platform)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Intelligent Dynamic Rule-Based Synthesis Engine
 * Takes any raw student idea and constructs an authentic, tailored engineering blueprint
 */
function synthesizeDynamicBlueprint(prompt: string): SparkBlueprintResponse {
  const p = prompt.toLowerCase().trim();
  const rawTerms = extractCleanTerms(p);
  const coreSubject = toTitleCase(rawTerms.slice(0, 35)) || 'Next-Gen Innovation';

  // 1. Domain Detection
  const isAgri = /crop|farm|agri|plant|soil|drone|field|harvest|seed|irrigation|pest|leaf/i.test(p);
  const isHealth = /health|medic|doctor|patient|clinic|hospital|disease|diagnos|mental|heart|ecg|therapy|bio/i.test(p);
  const isFinance = /pay|money|fintech|bank|bill|split|expense|wallet|invest|crypto|loan|budget|upi|credit/i.test(p);
  const isWeb3 = /blockchain|crypto|solidity|nft|dao|web3|decentral|smart contract|token|wallet/i.test(p);
  const isIoT = /iot|arduino|hardware|sensor|robot|raspberry|esp32|microcontroller|drone|firmware|embedded/i.test(p);
  const isAI = /ai|ml|learning|vision|model|nlp|llm|detect|neural|opencv|yolo|predict|speech|audio|gpt/i.test(p);
  const isEdu = /campus|college|student|tutor|exam|quiz|learn|study|syllabus|hostel|attendance|canteen|class/i.test(p);
  const isDelivery = /food|deliver|order|restaurant|cart|grocery|e-commerce|store|shop|tracking|driver/i.test(p);
  const isSecurity = /security|cyber|hack|auth|encrypt|phish|vulnerab|penetrat|privacy|firewall|network/i.test(p);
  const isGreen = /green|solar|waste|recycle|energy|carbon|water|pollution|climate|ev|electric vehicle/i.test(p);

  // 2. Dynamic Title & Tagline Generation
  let title = `${coreSubject}: Intelligent ${isAI ? 'AI System' : isWeb3 ? 'Protocol' : 'Platform'}`;
  let tagline = `Solving collegiate and real-world ${coreSubject.toLowerCase()} challenges through modern engineering.`;
  let category = 'Web Development';
  let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
  let techStack: string[] = ['Next.js 14', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'FastAPI'];
  let roles: string[] = ['Full-Stack Lead Engineer', 'Backend & API Specialist', 'Product & UI/UX Designer'];
  let rolesBreakdown = [
    {
      role: 'Full-Stack Lead Engineer',
      skills: ['Next.js', 'TypeScript', 'TailwindCSS', 'State Management'],
      focus: `Lead overall system architecture, implement reactive frontend views, and wire user interactions for ${coreSubject.toLowerCase()}.`,
    },
    {
      role: 'Backend & Data Specialist',
      skills: ['PostgreSQL', 'Node.js / FastAPI', 'REST/GraphQL', 'Docker'],
      focus: `Design normalized relational database models, secure API authentication endpoints, and reliable data pipelines.`,
    },
    {
      role: 'Product & UI/UX Designer',
      skills: ['Figma', 'Responsive Design', 'Wireframing', 'Design Systems'],
      focus: `Produce intuitive multi-device mockups, component tokens, and seamless user onboarding journeys.`,
    },
  ];

  if (isAgri) {
    category = 'IoT/Hardware';
    difficulty = 'Advanced';
    title = `${coreSubject} Smart AgriTech & Precision Farming Monitor`;
    tagline = 'Automating crop health diagnostics, moisture monitoring, and field telemetry';
    techStack = ['Python', 'OpenCV / YOLOv8', 'FastAPI', 'Raspberry Pi / ESP32', 'Next.js', 'TailwindCSS'];
    roles = ['Computer Vision / Edge ML Lead', 'Embedded Firmware & IoT Engineer', 'Full-Stack Dashboard Dev'];
    rolesBreakdown = [
      {
        role: 'Computer Vision / Edge ML Lead',
        skills: ['PyTorch', 'YOLOv8', 'OpenCV', 'Model Quantization'],
        focus: `Train lightweight object detection models to accurately identify anomalies, diseases, and stress markers in real time.`,
      },
      {
        role: 'Embedded Firmware & IoT Engineer',
        skills: ['C++', 'MicroPython', 'ESP32 / Pi', 'MQTT / LoRa'],
        focus: `Program hardware controllers, interface analog sensors, and manage power-efficient wireless telemetry transmission.`,
      },
      {
        role: 'Full-Stack Dashboard Dev',
        skills: ['Next.js', 'TypeScript', 'TailwindCSS', 'Recharts'],
        focus: `Construct real-time telemetry maps, sensor charts, and mobile-friendly alert dashboards for farm operators.`,
      },
    ];
  } else if (isHealth) {
    category = 'AI/ML';
    difficulty = 'Advanced';
    title = `${coreSubject} Clinical Diagnostics & Patient Support AI`;
    tagline = 'Streamlining clinical workflows, health record triage, and patient vitals monitoring';
    techStack = ['Next.js', 'FastAPI', 'PyTorch', 'PostgreSQL (Supabase)', 'WebSockets', 'TailwindCSS'];
    roles = ['Lead Medical AI Engineer', 'Full-Stack Clinical Systems Lead', 'Healthcare UI/UX Designer'];
    rolesBreakdown = [
      {
        role: 'Lead Medical AI Engineer',
        skills: ['PyTorch', 'Transformers', 'FastAPI', 'Data Privacy'],
        focus: `Fine-tune localized clinical models for rapid symptom analysis, prescription parsing, and automated triage categorization.`,
      },
      {
        role: 'Full-Stack Clinical Systems Lead',
        skills: ['TypeScript', 'Next.js', 'Supabase Auth', 'PostgreSQL'],
        focus: `Architect HIPAA/FHIR-compliant patient databases, real-time doctor dashboards, and secure access gates.`,
      },
      {
        role: 'Healthcare UI/UX Designer',
        skills: ['Figma', 'Accessible Design', 'Dark Mode Workflows', 'Design Tokens'],
        focus: `Design distraction-free clinical recording interfaces and intuitive visual patient status timelines.`,
      },
    ];
  } else if (isWeb3) {
    category = 'Developer Tools';
    difficulty = 'Advanced';
    title = `${coreSubject} Decentralized Trust & Smart Contract Protocol`;
    tagline = 'Tamper-proof verifiable consensus, on-chain governance, and transparent transactions';
    techStack = ['Solidity', 'Hardhat', 'Ethers.js / Wagmi', 'Next.js 14', 'IPFS', 'TailwindCSS'];
    roles = ['Smart Contract / Solidity Lead', 'Web3 Frontend Integration Dev', 'Security & Protocol Auditor'];
    rolesBreakdown = [
      {
        role: 'Smart Contract / Solidity Lead',
        skills: ['Solidity', 'Hardhat', 'OpenZeppelin', 'Gas Optimization'],
        focus: `Author secure, upgradeable smart contracts with automated invariant tests and strict access controls.`,
      },
      {
        role: 'Web3 Frontend Integration Dev',
        skills: ['Wagmi', 'Viem', 'Next.js', 'TypeScript'],
        focus: `Connect web interfaces to MetaMask and browser wallets, handle transaction states, and render IPFS data.`,
      },
      {
        role: 'Security & Protocol Auditor',
        skills: ['Slither', 'Unit Testing', 'Reentrancy Checks', 'Technical Docs'],
        focus: `Audit contract code for reentrancy, overflow, and logic edge cases while authoring the whitepaper and docs.`,
      },
    ];
  } else if (isFinance) {
    category = 'Web Development';
    difficulty = 'Intermediate';
    title = `${coreSubject} Smart Ledger & Real-Time Financial Split`;
    tagline = 'Automating peer-to-peer reconciliation, instant expense splitting, and budget analytics';
    techStack = ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe / UPI Gateway', 'TailwindCSS', 'Zod'];
    roles = ['FinTech Backend Architect', 'Full-Stack Frontend Engineer', 'Mobile UX Specialist'];
    rolesBreakdown = [
      {
        role: 'FinTech Backend Architect',
        skills: ['PostgreSQL', 'ACID Transactions', 'Ledger Schemas', 'Node.js'],
        focus: `Implement double-entry balance ledgers, idempotency keys, and automated settlement calculation algorithms.`,
      },
      {
        role: 'Full-Stack Frontend Engineer',
        skills: ['Next.js', 'TypeScript', 'TailwindCSS', 'PWA'],
        focus: `Build instant bill splitting, receipt OCR preview, and group balance dashboard with animated settlements.`,
      },
      {
        role: 'Mobile UX Specialist',
        skills: ['Figma', 'Micro-interactions', 'Mobile-first Layouts', 'Quick Gestures'],
        focus: `Craft high-speed 1-tap payment interactions, group expense categorizations, and visual budget graphs.`,
      },
    ];
  } else if (isIoT) {
    category = 'IoT/Hardware';
    difficulty = 'Advanced';
    title = `${coreSubject} Embedded Hardware & Autonomous Telemetry Suite`;
    tagline = 'Connecting physical microcontrollers, real-time sensor loops, and cloud dashboards';
    techStack = ['C/C++', 'ESP32 / Arduino', 'MQTT Broker', 'FastAPI', 'Next.js', 'InfluxDB / Timescale'];
    roles = ['Embedded Systems & C++ Specialist', 'IoT Cloud Infrastructure Lead', 'Hardware Dashboard Designer'];
    rolesBreakdown = [
      {
        role: 'Embedded Systems & C++ Specialist',
        skills: ['C++', 'FreeRTOS', 'I2C / SPI', 'GPIO Low-Power Modes'],
        focus: `Write fail-safe firmware loops, manage sensor sampling buffers, and handle WiFi/BLE reconnection logic.`,
      },
      {
        role: 'IoT Cloud Infrastructure Lead',
        skills: ['MQTT', 'FastAPI', 'TimescaleDB', 'Docker'],
        focus: `Build high-throughput ingestion brokers, process telemetry packets, and trigger automated threshold alerts.`,
      },
      {
        role: 'Hardware Dashboard Designer',
        skills: ['Next.js', 'TailwindCSS', 'WebSockets', 'Canvas Gauge Charts'],
        focus: `Build interactive digital twin monitors, live sensor dials, and device remote control toggles.`,
      },
    ];
  } else if (isAI) {
    category = 'AI/ML';
    difficulty = 'Intermediate';
    title = `${coreSubject} Intelligent Agent & Prediction Engine`;
    tagline = 'Empowering collegiate workflows through custom fine-tuned neural models';
    techStack = ['Python', 'FastAPI', 'Hugging Face', 'Next.js', 'TailwindCSS', 'Pinecone / Vector DB'];
    roles = ['Lead Machine Learning Engineer', 'Full-Stack AI Application Dev', 'Data & Pipeline Specialist'];
    rolesBreakdown = [
      {
        role: 'Lead Machine Learning Engineer',
        skills: ['PyTorch', 'LangChain / LlamaIndex', 'RAG Pipelines', 'FastAPI'],
        focus: `Build context-aware embeddings, semantic search indices, and fine-tune response accuracy.`,
      },
      {
        role: 'Full-Stack AI Application Dev',
        skills: ['Next.js 14', 'TypeScript', 'Streaming UI', 'TailwindCSS'],
        focus: `Construct smooth streaming responses, multi-turn chat views, and parameter adjustment sliders.`,
      },
      {
        role: 'Data & Pipeline Specialist',
        skills: ['Python', 'Pandas', 'Vector Databases', 'Data Cleaning'],
        focus: `Curate domain datasets, manage tokenization limits, and evaluate benchmark accuracy across student queries.`,
      },
    ];
  } else if (isEdu) {
    category = 'Web Development';
    difficulty = 'Intermediate';
    title = `${coreSubject} Collaborative Campus & Academic Hub`;
    tagline = 'Unifying student peer collaboration, academic resources, and campus milestones';
    techStack = ['Next.js', 'TypeScript', 'TailwindCSS', 'Supabase (PostgreSQL)', 'WebSockets'];
    roles = ['Full-Stack Product Engineer', 'Database & Realtime Lead', 'Campus UI/UX Designer'];
    rolesBreakdown = [
      {
        role: 'Full-Stack Product Engineer',
        skills: ['Next.js', 'React', 'TypeScript', 'Tailwind'],
        focus: `Implement interactive student dashboards, resource upload forms, and responsive mobile layouts.`,
      },
      {
        role: 'Database & Realtime Lead',
        skills: ['PostgreSQL', 'Supabase Realtime', 'Row Level Security', 'Cache'],
        focus: `Structure multi-department schemas, manage live notifications, and ensure strict student privacy barriers.`,
      },
      {
        role: 'Campus UI/UX Designer',
        skills: ['Figma', 'Component Libraries', 'Student User Testing', 'Light/Dark Theme'],
        focus: `Design engaging, energetic student collaboration spaces with readable typography and clean navigation.`,
      },
    ];
  } else if (isDelivery) {
    category = 'Mobile Apps';
    difficulty = 'Intermediate';
    title = `${coreSubject} Real-Time On-Demand Delivery & Logistics System`;
    tagline = 'Hyperlocal live tracking, instant menu dispatch, and order fulfillment';
    techStack = ['Next.js / React Native', 'Node.js', 'PostgreSQL', 'Google Maps API', 'Socket.io', 'TailwindCSS'];
    roles = ['Mobile & Frontend Lead', 'Real-Time Dispatch Backend Engineer', 'Product Designer'];
    rolesBreakdown = [
      {
        role: 'Mobile & Frontend Lead',
        skills: ['React Native / Next.js', 'TypeScript', 'Mapbox / Google Maps', 'State'],
        focus: `Create dynamic interactive maps with moving delivery markers, interactive carts, and order status updates.`,
      },
      {
        role: 'Real-Time Dispatch Backend Engineer',
        skills: ['Node.js', 'WebSockets', 'PostgreSQL', 'Redis Geo'],
        focus: `Implement driver geospatial radius matching, live order dispatch queues, and webhook payment callbacks.`,
      },
      {
        role: 'Product Designer',
        skills: ['Figma', 'Checkout Flow UX', 'Design Systems', 'Micro-copy'],
        focus: `Streamline checkout steps to under 3 taps and design an intuitive partner dispatch management board.`,
      },
    ];
  }

  const summary = `An end-to-end engineering solution for "${prompt.trim()}". The project addresses core user bottlenecks through a modern architectural pipeline using ${techStack.slice(0, 3).join(', ')}, establishing real-time data flows, intuitive interfaces, and verifiable performance outcomes.`;

  const milestones = [
    {
      title: 'Phase 1: Architecture, Core Schemas & Prototype',
      duration: 'Week 1',
      deliverables: `Repository initialization, database schema design, base API routes, and wireframe prototypes tailored to ${coreSubject.toLowerCase()}.`,
    },
    {
      title: 'Phase 2: Domain Business Logic & Feature Integration',
      duration: 'Week 2',
      deliverables: `Implementation of the core processing engine (${techStack[0]} + ${techStack[1]}), reactive state persistence, and responsive UI views.`,
    },
    {
      title: 'Phase 3: Testing, Optimization & Live Campus Demo',
      duration: 'Week 3',
      deliverables: `End-to-end peer testing, latency optimization, production cloud deployment, and automated demo presentation setup.`,
    },
  ];

  return {
    title,
    tagline,
    category,
    difficulty,
    summary,
    technologies: techStack,
    desired_roles: roles,
    rolesBreakdown,
    milestones,
    engine: 'Linkora Dynamic Blueprint Engine',
  };
}

function matchCuratedBlueprint(prompt: string, templates: SparkTemplateItem[]): SparkBlueprintResponse | null {
  if (!templates || templates.length === 0) return null;

  const p = prompt.toLowerCase().trim();
  const promptWords = p
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['app', 'for', 'with', 'the', 'and', 'project', 'make', 'build', 'want', 'system', 'platform'].includes(w));

  if (promptWords.length === 0) return null;

  let bestMatch: SparkTemplateItem | null = null;
  let bestScore = 0;

  for (const tpl of templates) {
    let score = 0;
    const targetText = `${tpl.title} ${tpl.tagline || ''} ${tpl.prompt || ''} ${tpl.category || ''} ${tpl.technologies.join(' ')}`.toLowerCase();

    // Check whole prompt inclusion
    if (targetText.includes(p) || p.includes(tpl.title.toLowerCase())) {
      score += 10;
    }

    // Word-by-word matching
    for (const word of promptWords) {
      if (tpl.title.toLowerCase().includes(word)) {
        score += 3.5;
      } else if (targetText.includes(word)) {
        score += 1.5;
      }
    }

    // Category match bonus
    if (tpl.category && p.includes(tpl.category.toLowerCase())) {
      score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = tpl;
    }
  }

  // Threshold check: need at least 3 points to qualify as a real match
  if (bestMatch && bestScore >= 3) {
    const rawSubject = toTitleCase(extractCleanTerms(prompt)) || bestMatch.title;
    const isDirectTitle = prompt.length >= 3 && prompt.length <= 45 && !prompt.includes('\n');
    const adaptedTitle = isDirectTitle
      ? toTitleCase(prompt)
      : `${rawSubject}: ${bestMatch.tagline || bestMatch.title}`;

    return {
      title: adaptedTitle,
      tagline: bestMatch.tagline || `Production-grade architecture foundation based on ${bestMatch.title}`,
      category: bestMatch.category || 'Web Development',
      difficulty: bestMatch.difficulty || 'Intermediate',
      summary: `Tailored engineering blueprint for "${prompt}". Synthesized and optimized using Linkora's curated "${bestMatch.title}" architectural framework, featuring enterprise-grade patterns, clean component boundaries, and high-performance data contracts.`,
      technologies: bestMatch.technologies || ['Next.js', 'TypeScript', 'TailwindCSS', 'PostgreSQL'],
      desired_roles: bestMatch.roles || ['Fullstack Lead Engineer', 'Backend Specialist', 'UI/UX Designer'],
      rolesBreakdown: (bestMatch.roles || ['Fullstack Lead Engineer', 'Backend Specialist', 'UI/UX Designer']).map((r, i) => ({
        role: r,
        skills: bestMatch!.technologies.slice(i * 2, i * 2 + 3).length > 0
          ? bestMatch!.technologies.slice(i * 2, i * 2 + 3)
          : ['TypeScript', 'Architecture', 'System Design'],
        focus: `Lead implementation of the ${r.toLowerCase()} domain for ${adaptedTitle}.`,
      })),
      milestones: [
        {
          title: 'Phase 1: Architecture & Foundation Contracts',
          duration: 'Week 1',
          deliverables: `Setup core repository, schema models, and base UI scaffolds for ${adaptedTitle}.`,
        },
        {
          title: 'Phase 2: Core Engine & Domain Logic',
          duration: 'Week 2',
          deliverables: `Develop core business logic, API routes, and state persistence with test cases.`,
        },
        {
          title: 'Phase 3: Integration, Telemetry & Security',
          duration: 'Week 3',
          deliverables: `Wire end-to-end user flows, add error boundaries, and benchmark response latencies.`,
        },
        {
          title: 'Phase 4: Production Deployment & Pitch Demo',
          duration: 'Week 4',
          deliverables: `Ship public deployment, generate README badges, and prepare live demo showcase.`,
        },
      ],
      engine: `🎯 Matched Curated Architecture: ${bestMatch.title}`,
      matchedBlueprint: bestMatch.title,
      matchScore: Math.min(99, Math.round(55 + bestScore * 7)),
    };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = (body.prompt || '').trim();

    if (!prompt) {
      return NextResponse.json({ error: 'Please enter a project idea or concept to spark.' }, { status: 400 });
    }

    // 1. Check if user prompt matches any curated blueprint in the admin's database
    const rawCurated = await getMasterControlSubkey<SparkTemplateItem[]>('sparkTemplates', DEFAULT_SPARK_TEMPLATES);
    const templatesList = Array.isArray(rawCurated) && rawCurated.length > 0 ? rawCurated : DEFAULT_SPARK_TEMPLATES;
    const curatedMatch = matchCuratedBlueprint(prompt, templatesList);
    if (curatedMatch) {
      return NextResponse.json({
        success: true,
        blueprint: curatedMatch,
      });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let blueprint: SparkBlueprintResponse | null = null;

    // 1. If Gemini is available, generate fully dynamic LLM blueprint
    if (geminiKey) {
      try {
        const sysPrompt = `You are a Principal Software Architect and Collegiate Capstone Mentor.
A student gave you their raw project idea: "${prompt}".
Generate an authentic, highly tailored engineering blueprint strictly matching their exact concept. Do NOT give generic answers. Tailor the title, technologies, roles, and milestones specifically to their prompt.

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Creative, punchy, professional title based on their idea",
  "tagline": "A single compelling sentence describing the value proposition",
  "category": "Web Development" | "AI/ML" | "Mobile Apps" | "Developer Tools" | "Social Impact" | "IoT/Hardware" | "Other",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "summary": "2-3 detailed sentences explaining technical architecture, problem solved, and end user outcome for their exact idea.",
  "technologies": ["4 to 6 specific, modern, relevant technologies/frameworks/libraries"],
  "desired_roles": ["3 specific roles needed for this project"],
  "rolesBreakdown": [
    {
      "role": "Specific role name",
      "skills": ["3-4 relevant technical skills"],
      "focus": "One clear sentence on their primary technical contribution to this idea."
    }
  ],
  "milestones": [
    {
      "title": "Phase 1: Architecture & Foundation",
      "duration": "Week 1",
      "deliverables": "Specific deliverables for their project in week 1"
    },
    {
      "title": "Phase 2: Core Implementation",
      "duration": "Week 2",
      "deliverables": "Specific deliverables for their project in week 2"
    },
    {
      "title": "Phase 3: Integration & Release",
      "duration": "Week 3",
      "deliverables": "Specific deliverables for their project in week 3"
    }
  ]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: sysPrompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const aiJson = await res.json();
          const text = aiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            blueprint = {
              ...parsed,
              engine: 'Gemini 1.5 Flash',
            };
          }
        }
      } catch (err) {
        console.warn('Gemini spark call warning:', err);
      }
    }

    // 2. If OpenAI is available and Gemini was not used
    if (!blueprint && openaiKey) {
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
                content:
                  'You are an expert college project architect. Generate a highly tailored engineering blueprint for the student idea. Return only JSON conforming to the requested schema.',
              },
              {
                role: 'user',
                content: `Generate project blueprint JSON for student idea: "${prompt}".`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (res.ok) {
          const aiJson = await res.json();
          const content = aiJson.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            blueprint = {
              ...parsed,
              engine: 'OpenAI GPT-4o-mini',
            };
          }
        }
      } catch (err) {
        console.warn('OpenAI spark call warning:', err);
      }
    }

    // 3. Dynamic contextual synthesis engine (runs reliably anywhere without external keys)
    if (!blueprint) {
      blueprint = synthesizeDynamicBlueprint(prompt);
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
