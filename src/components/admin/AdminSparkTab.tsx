'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Zap,
  Code2,
  Users,
  Cpu,
  Key,
  Sliders,
  Play,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Database,
  Trophy,
  Scale,
} from 'lucide-react';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';

interface AdminSparkTabProps {
  authToken?: string;
}

export interface SparkScoringWeights {
  technical: number;
  novelty: number;
  feasibility: number;
  impact: number;
}

interface SparkModelSettings {
  engine: 'auto' | 'gemini' | 'openai' | 'neural';
  geminiApiKey: string;
  openaiApiKey: string;
  hasCustomGeminiKey: boolean;
  hasCustomOpenAiKey: boolean;
  hasEnvGemini: boolean;
  hasEnvOpenAI: boolean;
  temperature: number;
  customSystemPrompt: string;
  scoringWeights?: SparkScoringWeights;
  lastUpdated?: string | null;
}

export function AdminSparkTab({ authToken }: AdminSparkTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'engine' | 'blueprints'>('engine');

  // Templates state
  const [templates, setTemplates] = useState<SparkTemplateItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_spark_admin_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return DEFAULT_SPARK_TEMPLATES;
  });
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Model Engine Settings state
  const [modelSettings, setModelSettings] = useState<SparkModelSettings>({
    engine: 'auto',
    geminiApiKey: '',
    openaiApiKey: '',
    hasCustomGeminiKey: false,
    hasCustomOpenAiKey: false,
    hasEnvGemini: false,
    hasEnvOpenAI: false,
    temperature: 0.7,
    customSystemPrompt: '',
    scoringWeights: {
      technical: 30,
      novelty: 25,
      feasibility: 25,
      impact: 20,
    },
    lastUpdated: null,
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [showGeminiKey, setShowGeminiKey] = useState<boolean>(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState<boolean>(false);

  // Playground / Sandbox state
  const [testPrompt, setTestPrompt] = useState<string>('Autonomous campus drone delivery for library books and lab gear');
  const [testTrack, setTestTrack] = useState<string>('Smart India Hackathon (SIH 2026)');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatencyMs, setTestLatencyMs] = useState<number | null>(null);

  // Blueprint Add Form states
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('AI / Machine Learning');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [prompt, setPrompt] = useState('');
  const [technologies, setTechnologies] = useState('Next.js 14, TypeScript, FastAPI, PostgreSQL');
  const [roles, setRoles] = useState('Fullstack Lead, ML Engineer, UI/UX Designer');
  const [featured, setFeatured] = useState(true);

  // Fetch Settings
  const fetchSettings = async () => {
    setIsLoadingSettings(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/spark/settings', { headers });
      const data = await res.json();
      if (data.success && data.settings) {
        setModelSettings({
          ...data.settings,
          scoringWeights: data.settings.scoringWeights || {
            technical: 30,
            novelty: 25,
            feasibility: 25,
            impact: 20,
          },
        });
      }
    } catch (err: any) {
      console.warn('Could not fetch spark settings:', err);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setActionError('');
    setActionSuccess('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/spark/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          engine: modelSettings.engine,
          geminiApiKey: modelSettings.geminiApiKey,
          openaiApiKey: modelSettings.openaiApiKey,
          temperature: modelSettings.temperature,
          customSystemPrompt: modelSettings.customSystemPrompt,
          scoringWeights: modelSettings.scoringWeights,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      if (data.settings) {
        setModelSettings({
          ...data.settings,
          scoringWeights: data.settings.scoringWeights || {
            technical: 30,
            novelty: 25,
            feasibility: 25,
            impact: 20,
          },
        });
      }
      setActionSuccess('AI Spark Model Settings & Scoring Formula updated successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Run Playground Test
  const handleRunTest = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    setTestLatencyMs(null);
    setActionError('');

    const startTime = Date.now();
    try {
      const res = await fetch('/api/ai/spark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt.trim(),
          track: testTrack,
          userSkills: 'React, Tailwind, Next.js',
        }),
      });

      const data = await res.json();
      const elapsed = Date.now() - startTime;
      setTestLatencyMs(elapsed);

      if (!res.ok) throw new Error(data.error || 'Test inference failed');
      setTestResult(data.blueprint);
    } catch (err: any) {
      setActionError(`Test failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Fetch Blueprints
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    setActionError('');
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/spark/templates', { headers });
      const data = await res.json();
      if (data.templates && Array.isArray(data.templates) && data.templates.length > 0) {
        setTemplates(data.templates);
        try { localStorage.setItem('linkora_spark_admin_cache', JSON.stringify(data.templates)); } catch {}
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
  }, [authToken]);

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !prompt) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/spark/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          tagline,
          category,
          difficulty,
          prompt,
          technologies: technologies.split(',').map((t) => t.trim()).filter(Boolean),
          roles: roles.split(',').map((r) => r.trim()).filter(Boolean),
          featured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add blueprint');

      if (data.templates) {
        setTemplates(data.templates);
        try { localStorage.setItem('linkora_spark_admin_cache', JSON.stringify(data.templates)); } catch {}
      }
      setIsAddModalOpen(false);
      setTitle('');
      setTagline('');
      setPrompt('');
      setActionSuccess('Curated Reference Blueprint published successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteTemplate = async (id: string, templateTitle: string) => {
    if (!confirm(`Are you sure you want to delete blueprint "${templateTitle}"?`)) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`/api/spark/templates?id=${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      if (data.templates) {
        setTemplates(data.templates);
        try { localStorage.setItem('linkora_spark_admin_cache', JSON.stringify(data.templates)); } catch {}
      } else {
        setTemplates((prev) => {
          const updated = prev.filter((t) => t.id !== id);
          try { localStorage.setItem('linkora_spark_admin_cache', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

      setActionSuccess(`Removed ${templateTitle}.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentWeights: SparkScoringWeights = modelSettings.scoringWeights || {
    technical: 30,
    novelty: 25,
    feasibility: 25,
    impact: 20,
  };

  const totalWeights =
    (currentWeights.technical || 0) +
    (currentWeights.novelty || 0) +
    (currentWeights.feasibility || 0) +
    (currentWeights.impact || 0);

  const updateWeight = (key: keyof SparkScoringWeights, val: number) => {
    setModelSettings({
      ...modelSettings,
      scoringWeights: {
        ...currentWeights,
        [key]: Math.max(0, Math.min(100, val)),
      },
    });
  };

  const applyPreset = (preset: SparkScoringWeights) => {
    setModelSettings({
      ...modelSettings,
      scoringWeights: preset,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Spark Model &amp; Studio Command</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Real AI Engine
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Configure real AI model inference (Gemini, OpenAI, or Neural Engine), test prompts in the live sandbox, and manage secret ground-truth blueprints.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-charcoal-800 border border-charcoal-700">
          <button
            type="button"
            onClick={() => setActiveSubTab('engine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'engine'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model &amp; Sandbox</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('blueprints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'blueprints'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Reference Knowledge ({templates.length})</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 1: AI MODEL ENGINE SETTINGS & LIVE SANDBOX
         ========================================================================= */}
      {activeSubTab === 'engine' && (
        <div className="space-y-6">
          {/* Model Engine Configuration */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Real AI Model Parameters</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select which model powers student blueprint generation. Custom keys are stored securely in Supabase.
                </p>
              </div>

              {modelSettings.lastUpdated && (
                <span className="text-[10px] text-slate-500 font-mono">
                  Updated: {new Date(modelSettings.lastUpdated).toLocaleDateString()}
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Engine Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Active AI Synthesis Engine:
                  </label>
                  <select
                    value={modelSettings.engine}
                    onChange={(e) => setModelSettings({ ...modelSettings, engine: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="auto">Auto Intelligent Hybrid (Gemini 1.5 → OpenAI → Neural Fallback)</option>
                    <option value="gemini">Google Gemini 1.5 Flash (Recommended - Fastest & High Depth)</option>
                    <option value="openai">OpenAI GPT-4o-mini</option>
                    <option value="neural">Linkora Built-in Synthesis Neural Engine v2 (Zero External Keys)</option>
                  </select>
                </div>

                {/* Temperature Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Creativity &amp; Temperature:
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {modelSettings.temperature} ({modelSettings.temperature <= 0.4 ? 'Strict Architecture' : modelSettings.temperature <= 0.7 ? 'Balanced' : 'Highly Innovative'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={modelSettings.temperature}
                    onChange={(e) => setModelSettings({ ...modelSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* API Keys Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {/* Google Gemini Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Google Gemini API Key:</span>
                    </label>
                    {modelSettings.hasEnvGemini ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Env Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Optional override</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={modelSettings.geminiApiKey}
                      onChange={(e) => setModelSettings({ ...modelSettings, geminiApiKey: e.target.value })}
                      placeholder={modelSettings.hasEnvGemini ? 'Configured via GEMINI_API_KEY env' : 'AIzaSy...'}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* OpenAI Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-violet-400" />
                      <span>OpenAI API Key:</span>
                    </label>
                    {modelSettings.hasEnvOpenAI ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Env Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Optional override</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showOpenAiKey ? 'text' : 'password'}
                      value={modelSettings.openaiApiKey}
                      onChange={(e) => setModelSettings({ ...modelSettings, openaiApiKey: e.target.value })}
                      placeholder={modelSettings.hasEnvOpenAI ? 'Configured via OPENAI_API_KEY env' : 'sk-proj-...'}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showOpenAiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom System Prompt Directive */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Custom System Prompt Directive (Optional):
                </label>
                <textarea
                  rows={2}
                  value={modelSettings.customSystemPrompt}
                  onChange={(e) => setModelSettings({ ...modelSettings, customSystemPrompt: e.target.value })}
                  placeholder="e.g. Prioritize Smart India Hackathon themes and Indian campus engineering patterns. Ensure tech stacks are modern (Next.js 14, FastAPI, Supabase)."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Official Hackathon Scoring Formula & Weights (Admin Confidential) */}
              <div className="p-5 rounded-2xl bg-charcoal-800/80 border border-charcoal-700 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal-700 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white">
                        Official Hackathon Scoring Formula &amp; Weights
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        Admin Only • Hidden from Public Users
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Configure the exact mathematical weights used to compute overall hackathon readiness scores. Normal users on the website see the calibrated scores without seeing the internal formula or percentage weights.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                        totalWeights === 100
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      Sum: {totalWeights}% {totalWeights === 100 ? '✓ Balanced' : '⚠️ Adjust to 100%'}
                    </span>
                  </div>
                </div>

                {/* 4 Weight Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Technical Depth */}
                  <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>🛠️ Tech Depth</span>
                      <span className="font-mono text-blue-400 font-extrabold">{currentWeights.technical}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70"
                      step="5"
                      value={currentWeights.technical}
                      onChange={(e) => updateWeight('technical', Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Architecture depth, telemetry &amp; non-trivial data pipelines.
                    </p>
                  </div>

                  {/* Novelty */}
                  <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>💡 Novelty &amp; Twist</span>
                      <span className="font-mono text-amber-400 font-extrabold">{currentWeights.novelty}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70"
                      step="5"
                      value={currentWeights.novelty}
                      onChange={(e) => updateWeight('novelty', Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Unfair advantage and differentiation over competitors.
                    </p>
                  </div>

                  {/* 48h Feasibility */}
                  <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>⏱️ 48h Feasibility</span>
                      <span className="font-mono text-emerald-400 font-extrabold">{currentWeights.feasibility}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70"
                      step="5"
                      value={currentWeights.feasibility}
                      onChange={(e) => updateWeight('feasibility', Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Realistic scope for a student squad to demo a working MVP.
                    </p>
                  </div>

                  {/* Real-World Impact */}
                  <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>🎯 Problem Impact</span>
                      <span className="font-mono text-rose-400 font-extrabold">{currentWeights.impact}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="70"
                      step="5"
                      value={currentWeights.impact}
                      onChange={(e) => updateWeight('impact', Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Urgency &amp; severity of the problem solved.
                    </p>
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Presets:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset({ technical: 30, novelty: 25, feasibility: 25, impact: 20 })}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      Default Balanced (30/25/25/20)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset({ technical: 40, novelty: 20, feasibility: 20, impact: 20 })}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      Tech Heavy (40/20/20/20)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset({ technical: 20, novelty: 40, feasibility: 20, impact: 20 })}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      Novelty Heavy (20/40/20/20)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset({ technical: 25, novelty: 20, feasibility: 20, impact: 35 })}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 border border-charcoal-700 text-[11px] font-bold text-slate-300 transition-all cursor-pointer"
                    >
                      Impact Heavy (25/20/20/35)
                    </button>
                  </div>
                </div>

                {/* Mathematical Formula Preview for Admin */}
                <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-700/60 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                  <span>
                    Formula: ({currentWeights.technical}% × Tech) + ({currentWeights.novelty}% × Novelty) + ({currentWeights.feasibility}% × Feas) + ({currentWeights.impact}% × Impact)
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Admin Confidential</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Parameters...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Save AI Model Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live AI Inference Sandbox */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Live Model Inference Sandbox</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test prompt generation live with your active model engine and measure inference speed in real time.
                </p>
              </div>

              {testLatencyMs !== null && (
                <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{testLatencyMs}ms Latency</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Test Prompt:
                  </label>
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="e.g. AI-powered real-time attendance monitor with spoof prevention..."
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Track:
                  </label>
                  <select
                    value={testTrack}
                    onChange={(e) => setTestTrack(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Smart India Hackathon (SIH 2026)">Smart India Hackathon (SIH 2026)</option>
                    <option value="Google Solution Challenge">Google Solution Challenge</option>
                    <option value="Web3 & Blockchain">Web3 &amp; Blockchain</option>
                    <option value="Campus Life & Utilities">Campus Life &amp; Utilities</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting || !testPrompt.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Model Inference...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Execute Model Test</span>
                  </>
                )}
              </button>

              {/* Sandbox Output Preview */}
              {testResult && (
                <div className="p-5 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-charcoal-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500">Engine Used:</span>
                      <div className="text-xs font-bold text-emerald-400">{testResult.engine}</div>
                    </div>
                    {testResult.scores && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-500">Scorecard:</span>
                        <div className="text-xs font-bold text-amber-400">{testResult.scores.overall}/100 Overall</div>
                        <div className="text-[10px] text-slate-400">
                          Tech: {testResult.scores.technicalComplexity}% • Nov: {testResult.scores.novelty}% • Feas: {testResult.scores.feasibility}% • Imp: {testResult.scores.impact}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{testResult.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{testResult.tagline}</p>
                  </div>

                  {testResult.winningTwist && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                      <strong>Winning Twist:</strong> {testResult.winningTwist}
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1">
                      {(testResult.technologies || []).map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 rounded bg-charcoal-800 text-[10px] text-slate-300 border border-charcoal-700">
                          {tech}
                        </span>
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
          SUB-TAB 2: SECRET REFERENCE GROUND-TRUTH BLUEPRINTS
         ========================================================================= */}
      {activeSubTab === 'blueprints' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="block text-amber-200">Secret Knowledge Ground-Truth Blueprints:</strong>
              These blueprints are stored in Supabase as reference ground truth for AI Spark. When a student enters an idea prompt, AI Spark dynamically matches the most relevant blueprint to ground its answers, while keeping the repository hidden from public scrapers.
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blueprints by title or prompt..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchTemplates}
                className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs border border-charcoal-700 transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Blueprint</span>
              </button>
            </div>
          </div>

          {/* Blueprints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3 hover:border-charcoal-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/20">
                      {tpl.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-800 text-slate-400 border border-charcoal-700">
                      {tpl.difficulty}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                    title="Delete blueprint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white">{tpl.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{tpl.tagline || tpl.prompt}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {tpl.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-800 text-slate-300 border border-charcoal-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Blueprint Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Ground-Truth Reference Blueprint</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTemplate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Campus Delivery Drones"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Next-Gen peer cart pool for late night hostel orders"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                  >
                    <option value="AI / Machine Learning">AI / Machine Learning</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="IoT / Hardware">IoT / Hardware</option>
                    <option value="FinTech & Web3">FinTech &amp; Web3</option>
                    <option value="Social Impact">Social Impact</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold uppercase">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase">Matching Idea Prompt / Trigger</label>
                <textarea
                  rows={2}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. drone delivery, autonomous delivery quadcopter for university campuses"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase">Recommended Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold uppercase">Recommended Roles (comma separated)</label>
                <input
                  type="text"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Save Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
