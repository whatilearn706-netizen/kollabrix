'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Users,
  CheckCircle2,
  Calendar,
  Wand2,
  RefreshCw,
  X,
  Zap,
  Rocket,
} from 'lucide-react';

interface BlueprintResult {
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
}

const CURATED_BLUEPRINTS: Record<string, BlueprintResult> = {
  health: {
    title: 'MedScan AI: Real-Time Clinical Notes & Triage',
    tagline: 'Automating emergency room patient intakes with multilingual voice LLMs',
    category: 'AI / Healthcare',
    difficulty: 'Advanced',
    summary:
      'A low-latency speech-to-text pipeline that transcribes bedside doctor-patient dialogue into formatted FHIR-compliant electronic health records, reducing administrative physician burnout.',
    technologies: ['Next.js', 'PyTorch', 'Whisper API', 'FastAPI', 'TailwindCSS'],
    desired_roles: ['Lead ML Engineer', 'Full-Stack Developer', 'Healthcare UI/UX Designer'],
    rolesBreakdown: [
      {
        role: 'Lead ML Engineer',
        skills: ['PyTorch', 'Whisper', 'Transformers', 'FastAPI'],
        focus: 'Fine-tune medical speech recognition and structured clinical JSON extraction.',
      },
      {
        role: 'Full-Stack Developer',
        skills: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
        focus: 'Build real-time audio recording interface and doctor review dashboard.',
      },
      {
        role: 'Healthcare UI/UX Designer',
        skills: ['Figma', 'Clinical Workflows', 'Accessibility', 'Design Systems'],
        focus: 'Design high-speed, zero-distraction dark mode bedside charting interface.',
      },
    ],
    milestones: [
      {
        title: 'Phase 1: Audio Pipeline & FHIR Schema',
        duration: 'Week 1',
        deliverables: 'Streaming audio WebSocket prototype and synthetic medical test corpus.',
      },
      {
        title: 'Phase 2: LLM Clinical Extraction Engine',
        duration: 'Week 2',
        deliverables: 'FastAPI microservice extracting symptoms, medications, and ICD-10 codes.',
      },
      {
        title: 'Phase 3: Web Dashboard & Clinician Pilot Demo',
        duration: 'Week 3',
        deliverables: 'End-to-end bedside web portal with instant PDF discharge summaries.',
      },
    ],
  },
  campus: {
    title: 'CampusPulse: Real-Time Transit & Shuttle Tracker',
    tagline: 'Live crowdsourced university transit tracking with arrival prediction',
    category: 'Web / Mobile',
    difficulty: 'Intermediate',
    summary:
      'A mobile-first web app that tracks campus shuttle buses in real-time using GPS sensors, crowdsourced student pings, and machine-learning estimated arrival time models.',
    technologies: ['React Native / Next.js', 'WebSockets', 'Mapbox GL', 'Node.js', 'Redis'],
    desired_roles: ['Frontend Map Specialist', 'Backend / Geolocation Lead', 'Product Designer'],
    rolesBreakdown: [
      {
        role: 'Frontend Map Specialist',
        skills: ['Mapbox GL', 'React', 'TypeScript', 'Tailwind'],
        focus: 'Implement interactive campus map with smooth 60fps moving bus markers.',
      },
      {
        role: 'Backend Geolocation Lead',
        skills: ['Node.js', 'WebSockets', 'Redis', 'PostGIS'],
        focus: 'Process incoming GPS telemetry and compute real-time ETA predictions.',
      },
      {
        role: 'Product Designer',
        skills: ['Figma', 'Mobile UI', 'Prototyping'],
        focus: 'Design high-contrast student mobile UI with route favoriting and delay alerts.',
      },
    ],
    milestones: [
      {
        title: 'Phase 1: Interactive Campus Map & Geofencing',
        duration: 'Week 1',
        deliverables: 'Mapbox campus layer with bus stop nodes and route polylines.',
      },
      {
        title: 'Phase 2: WebSocket Driver Telemetry Stream',
        duration: 'Week 2',
        deliverables: 'Live broadcast API updating bus coordinates every 2 seconds.',
      },
      {
        title: 'Phase 3: ETA Algorithm & Student Launch',
        duration: 'Week 3',
        deliverables: 'Arrival countdown timer with route schedules and campus release.',
      },
    ],
  },
  fintech: {
    title: 'SplitCampus: Micro-Expense Pool for Student Clubs',
    tagline: 'Transparent group budget pooling and receipt verification for hackathons',
    category: 'Fintech',
    difficulty: 'Intermediate',
    summary:
      'A collegiate group budgeting platform that lets campus clubs, hackathon squads, and roommates pool money, scan itemized receipts with OCR, and settle dues seamlessly via UPI / Stripe.',
    technologies: ['Next.js', 'Supabase', 'Tesseract OCR', 'Stripe / UPI', 'TailwindCSS'],
    desired_roles: ['Full-Stack Lead', 'OCR / Computer Vision Specialist', 'Mobile UX Lead'],
    rolesBreakdown: [
      {
        role: 'Full-Stack Lead',
        skills: ['Next.js', 'PostgreSQL', 'Stripe API', 'Auth'],
        focus: 'Implement ledger balance calculation and secure multi-user transaction auditing.',
      },
      {
        role: 'OCR / Computer Vision Specialist',
        skills: ['Python', 'Tesseract OCR', 'OpenCV'],
        focus: 'Extract line items and taxes from photographed physical receipts automatically.',
      },
      {
        role: 'Mobile UX Lead',
        skills: ['Figma', 'Design Systems', 'Micro-interactions'],
        focus: 'Build frictionless 1-tap bill split flows and group expense analytics cards.',
      },
    ],
    milestones: [
      {
        title: 'Phase 1: Multi-User Ledger & Group Wallets',
        duration: 'Week 1',
        deliverables: 'Double-entry bookkeeping schema and club budget dashboard.',
      },
      {
        title: 'Phase 2: Receipt OCR Line-Item Parser',
        duration: 'Week 2',
        deliverables: 'Camera upload flow extracting individual item costs and splits.',
      },
      {
        title: 'Phase 3: Settlement Webhooks & Campus Pilot',
        duration: 'Week 3',
        deliverables: 'Direct settlement integration with instant WhatsApp payment links.',
      },
    ],
  },
  edtech: {
    title: 'CodeScribe: Interactive Algorithmic Code Tutor',
    tagline: 'Visualizing data structures and complexity bottlenecks in real-time',
    category: 'EdTech',
    difficulty: 'Intermediate',
    summary:
      'A web-based interactive compiler that steps through Python and C++ code, rendering live pointer diagrams, call stacks, and recursion trees to accelerate student computer science comprehension.',
    technologies: ['React', 'WebAssembly', 'Monaco Editor', 'D3.js', 'Python'],
    desired_roles: ['Compiler / WASM Engineer', 'Frontend Visualizer (D3.js)', 'Curriculum Designer'],
    rolesBreakdown: [
      {
        role: 'Compiler / WASM Engineer',
        skills: ['WebAssembly', 'Python AST', 'C++', 'Web Workers'],
        focus: 'Execute code in sandboxed client browser thread and emit execution trace frames.',
      },
      {
        role: 'Frontend Visualizer (D3.js)',
        skills: ['D3.js', 'React', 'SVG Animations', 'Canvas'],
        focus: 'Render animated pointer links, tree nodes, and stack frame transitions.',
      },
      {
        role: 'Curriculum Designer',
        skills: ['Data Structures', 'Technical Writing', 'Figma'],
        focus: 'Curate 30 classic algorithm challenges with progressive hints and benchmarks.',
      },
    ],
    milestones: [
      {
        title: 'Phase 1: Sandboxed Execution & AST Tracing',
        duration: 'Week 1',
        deliverables: 'Web Worker running Python code and producing step-by-step state snapshots.',
      },
      {
        title: 'Phase 2: Dynamic D3 Visualizer Canvas',
        duration: 'Week 2',
        deliverables: 'Linked list, binary tree, and 2D matrix live state animators.',
      },
      {
        title: 'Phase 3: Monaco Editor & Challenge Hub',
        duration: 'Week 3',
        deliverables: 'Full code playground with syntax highlighting and unit test verification.',
      },
    ],
  },
};

interface ProjectSparkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSparkGeneratorModal({ isOpen, onClose }: ProjectSparkGeneratorModalProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState<BlueprintResult | null>(() => CURATED_BLUEPRINTS.health);

  if (!isOpen) return null;

  const handleGenerate = (customPrompt?: string) => {
    const q = (customPrompt || prompt).toLowerCase().trim();
    setIsGenerating(true);

    setTimeout(() => {
      let chosen: BlueprintResult;
      if (q.includes('bus') || q.includes('transit') || q.includes('campus') || q.includes('map')) {
        chosen = CURATED_BLUEPRINTS.campus;
      } else if (q.includes('money') || q.includes('fintech') || q.includes('pay') || q.includes('split')) {
        chosen = CURATED_BLUEPRINTS.fintech;
      } else if (q.includes('code') || q.includes('tutor') || q.includes('learn') || q.includes('edu')) {
        chosen = CURATED_BLUEPRINTS.edtech;
      } else {
        chosen = CURATED_BLUEPRINTS.health;
      }

      setBlueprint(chosen);
      setIsGenerating(false);
    }, 600);
  };

  const handleLaunchProject = () => {
    if (!blueprint) return;
    // Store generated blueprint into sessionStorage so /projects/new can prefill
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('prefill_project_blueprint', JSON.stringify(blueprint));
    }
    onClose();
    router.push('/projects/new?from=spark');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Linkora Spark: AI Project Blueprint Generator
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase">
                  AI Beta
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Turn your raw ideas or skills into an instant project roadmap, tech stack, and ideal squad breakdown.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input Form */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. AI app for hospitals, campus shuttle tracker, split bill app..."
              className="w-full pl-4 pr-28 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Spark AI</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-slate-400 font-mono">Try ideas:</span>
            {[
              { label: '🩺 Clinical AI Notes', key: 'health' },
              { label: '🚌 Campus Shuttle Map', key: 'campus' },
              { label: '💳 Student Club Budgeting', key: 'fintech' },
              { label: '💻 Interactive Code Tutor', key: 'edtech' },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => {
                  setPrompt(chip.label);
                  handleGenerate(chip.key);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Blueprint Card */}
        {blueprint && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 animate-in fade-in duration-200">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 font-bold uppercase">
                  {blueprint.category} • {blueprint.difficulty}
                </span>
                <span className="text-xs font-mono text-slate-400">3-Week Sprint Plan</span>
              </div>
              <h4 className="text-lg font-black text-slate-900">{blueprint.title}</h4>
              <p className="text-xs font-medium text-amber-600 mt-0.5">{blueprint.tagline}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {blueprint.summary}
              </p>
            </div>

            {/* Recommended Squad Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Recommended Squad Composition ({blueprint.rolesBreakdown.length} Roles)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {blueprint.rolesBreakdown.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5"
                  >
                    <p className="text-xs font-black text-slate-900">{r.role}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                      {r.focus}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {r.skills.slice(0, 2).map((s, si) => (
                        <span
                          key={si}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Phase Sprint Roadmap */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Sprint Roadmap</span>
              </div>
              <div className="space-y-1.5">
                {blueprint.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-start gap-3 text-xs"
                  >
                    <span className="font-mono font-bold text-emerald-600 shrink-0 mt-0.5">
                      {m.duration}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{m.title}</p>
                      <p className="text-[11px] text-slate-500">{m.deliverables}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Ready to recruit teammates with this roadmap?
              </span>
              <button
                onClick={handleLaunchProject}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all active:scale-[0.98]"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch Project with this Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
