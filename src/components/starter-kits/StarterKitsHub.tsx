'use client';

import React, { useState, useMemo } from 'react';
import {
  Zap,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Github,
  Play,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Code2,
  ArrowRight,
  ShieldCheck,
  Server,
  Cpu,
} from 'lucide-react';
import { STARTER_KITS } from '@/data/starterKits';
import { StarterKit, StarterKitCategory } from '@/types/starterKits';
import { ResourcesSubNav } from '@/components/resources/ResourcesSubNav';

export function StarterKitsHub({ isAdminPreview = false }: { isAdminPreview?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<StarterKitCategory>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeEnvModalKit, setActiveEnvModalKit] = useState<StarterKit | null>(null);

  const handleCopyCommand = (id: string, command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredKits = useMemo(() => {
    return STARTER_KITS.filter((kit) => {
      const matchesCategory =
        selectedCategory === 'all' || kit.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        kit.title.toLowerCase().includes(q) ||
        kit.tagline.toLowerCase().includes(q) ||
        kit.description.toLowerCase().includes(q) ||
        kit.techStack.some((s) => s.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const categories: { id: StarterKitCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'All Starter Kits (4)', icon: Sparkles },
    { id: 'ai-fullstack', label: 'AI & Copilots', icon: Cpu },
    { id: 'saas-mvp', label: 'Full-Stack SaaS', icon: Server },
    { id: 'python-ml', label: 'Python & ML Inference', icon: Code2 },
  ];

  return (
    <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-8 space-y-10">
      {/* Top Resources Sub-Navigation Hub */}
      <ResourcesSubNav />

      {/* Admin Preview Mode Banner */}
      {isAdminPreview && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>ADMIN PREVIEW MODE — Hackathon Starter Kits are currently set to HIDDEN in Master Control.</span>
          </div>
          <span className="font-bold uppercase tracking-wider text-[10px]">Unpublished Draft</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="space-y-6 text-center max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Launch Ready • 2-Minute Hackathon MVPs</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          1-Click Hackathon <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">Starter Kits & Boilerplates</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Skip the first 4 hours of configuration. Spin up production templates with user authentication, databases, and streaming AI already wired up.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search boilerplates (Supabase, OpenAI, Next.js, Python FastAPI)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-charcoal-900/90 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all shadow-xs"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white/80 dark:bg-charcoal-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Starter Kits Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredKits.map((kit) => (
          <div
            key={kit.id}
            className="p-6 sm:p-7 rounded-3xl bg-white/85 dark:bg-charcoal-900/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 hover:border-violet-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group"
          >
            {/* Header & Badges */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  {kit.badgeText || 'Hackathon Ready'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                  Setup: {kit.estSetupTime}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {kit.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {kit.tagline}
                </p>
              </div>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {kit.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Pre-wired Features Checklist */}
              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-white/5">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Out-of-the-Box Modules Included:
                </span>
                <div className="space-y-1.5">
                  {kit.featuresList.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLI Command Box with 1-Click Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Terminal Setup Command</span>
                  <span>1-Click Copy</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800">
                  <span className="truncate mr-2 text-amber-300 select-all">
                    {kit.cliCloneCommand}
                  </span>
                  <button
                    onClick={() => handleCopyCommand(kit.id, kit.cliCloneCommand)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shrink-0 transition-colors"
                    title="Copy command to clipboard"
                  >
                    {copiedId === kit.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => setActiveEnvModalKit(kit)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white text-xs font-bold transition-colors text-center"
              >
                Setup & Env
              </button>

              <a
                href={kit.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
              </a>

              <a
                href={kit.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs text-center flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Deploy Vercel</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Setup & Environment Variables Modal */}
      {activeEnvModalKit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveEnvModalKit(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Quick Start & Environment
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeEnvModalKit.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Follow these 3 quick steps to have your hackathon project live in 2 minutes.
              </p>
            </div>

            {/* Quick Setup Steps */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white font-mono">1. Clone & Install</span>
                <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded-lg text-slate-200 select-all">
                  {activeEnvModalKit.cliCloneCommand}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white font-mono">2. Environment Keys (.env.local)</span>
                <div className="space-y-1.5">
                  {activeEnvModalKit.envVariables.map((env) => (
                    <div key={env.key} className="p-2 rounded-lg bg-slate-100 dark:bg-charcoal-800 text-[11px] font-mono flex items-start justify-between gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{env.key}</span>
                      <span className="text-slate-500">{env.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs space-y-1">
                <span className="font-bold text-slate-900 dark:text-white font-mono">3. Start Local Dev Server</span>
                <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded-lg text-slate-200">
                  npm run dev
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <a
                href={activeEnvModalKit.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-bold text-xs transition-colors"
              >
                View Repository
              </a>
              <a
                href={activeEnvModalKit.deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Deploy to Vercel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
