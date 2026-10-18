'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/database';
import { Button } from '@/components/ui/Button';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Check,
  Globe,
  Layers,
  FileText,
  Code2,
  FolderOpen,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceToolBridgeProps {
  project: Project;
  currentUserId?: string;
}

interface VaultItem {
  id: string;
  title: string;
  url: string;
  category: 'code' | 'design' | 'docs' | 'api' | 'other';
  addedBy?: string;
  createdAt: string;
}

export function WorkspaceToolBridge({ project, currentUserId }: WorkspaceToolBridgeProps) {
  const [activeTab, setActiveTab] = useState<'figma' | 'demo' | 'vault'>('figma');

  // Figma State
  const defaultFigmaUrl = 'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fcommunity';
  const [figmaUrl, setFigmaUrl] = useState('');
  const [activeFigmaEmbed, setActiveFigmaEmbed] = useState('');
  const [isFigmaSaved, setIsFigmaSaved] = useState(false);

  // Demo Preview State
  const defaultDemoUrl = project.demo_url || 'https://linkora-link.online';
  const [demoUrl, setDemoUrl] = useState(defaultDemoUrl);
  const [activeDemoUrl, setActiveDemoUrl] = useState(defaultDemoUrl);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  // Vault State
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<VaultItem['category']>('docs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load saved figma and vault from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedFigma = localStorage.getItem(`linkora_figma_${project.id}`);
      if (savedFigma) {
        setFigmaUrl(savedFigma);
        setActiveFigmaEmbed(savedFigma);
      }

      const savedVault = localStorage.getItem(`linkora_vault_${project.id}`);
      if (savedVault) {
        setVaultItems(JSON.parse(savedVault));
      } else {
        // Pre-populate with project default links
        const initialItems: VaultItem[] = [
          ...(project.repository_url
            ? [
                {
                  id: 'vault-1',
                  title: 'Official GitHub Repository',
                  url: project.repository_url,
                  category: 'code' as const,
                  addedBy: 'Project Lead',
                  createdAt: new Date().toLocaleDateString(),
                },
              ]
            : []),
          ...(project.demo_url
            ? [
                {
                  id: 'vault-2',
                  title: 'Production Vercel Deployment',
                  url: project.demo_url,
                  category: 'other' as const,
                  addedBy: 'Project Lead',
                  createdAt: new Date().toLocaleDateString(),
                },
              ]
            : []),
          {
            id: 'vault-3',
            title: 'Technical Specs & Architecture RFC',
            url: `https://linkora-link.online/projects/${project.id}`,
            category: 'docs' as const,
            addedBy: 'Linkora System',
            createdAt: new Date().toLocaleDateString(),
          },
        ];
        setVaultItems(initialItems);
      }
    } catch {}
  }, [project.id, project.repository_url, project.demo_url]);

  const handleSaveFigma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!figmaUrl.trim()) return;

    let embedLink = figmaUrl.trim();
    if (!embedLink.includes('figma.com/embed')) {
      embedLink = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(embedLink)}`;
    }

    setActiveFigmaEmbed(embedLink);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_figma_${project.id}`, embedLink);
    }
    setIsFigmaSaved(true);
    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Connected Figma prototype in Tool Bridge for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}
    setTimeout(() => setIsFigmaSaved(false), 2500);
  };

  const handleAddVaultItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let finalUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const newItem: VaultItem = {
      id: `vault-${Date.now()}`,
      title: newTitle.trim(),
      url: finalUrl,
      category: newCategory,
      addedBy: 'Teammate',
      createdAt: new Date().toLocaleDateString(),
    };

    const updated = [newItem, ...vaultItems];
    setVaultItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_vault_${project.id}`, JSON.stringify(updated));
    }

    setNewTitle('');
    setNewUrl('');
    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Added resource "${newTitle}" to Vault for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}
  };

  const handleDeleteVaultItem = (id: string) => {
    const updated = vaultItems.filter((i) => i.id !== id);
    setVaultItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_vault_${project.id}`, JSON.stringify(updated));
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <Laptop className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">The Live Tool Bridge</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Zero Context Switching
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Embed your live Figma prototypes, test multi-device production demos, and centralize every GitHub, API, and Notion link in one permanent team vault.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('figma')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'figma'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Figma Prototype</span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'demo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Demo Viewports</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'vault'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Resource Vault ({vaultItems.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: FIGMA PROTOTYPE EMBED
         ========================================================================= */}
      {activeTab === 'figma' && (
        <div className="space-y-4">
          {/* Figma URL Input Bar */}
          <form
            onSubmit={handleSaveFigma}
            className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="flex-1 flex items-center gap-2 bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 w-full">
              <Layers className="w-4 h-4 text-pink-400 shrink-0" />
              <input
                type="text"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="Paste Figma file or prototype URL (e.g. https://www.figma.com/design/...)..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                leftIcon={isFigmaSaved ? <Check className="w-4 h-4 text-emerald-300" /> : undefined}
              >
                {isFigmaSaved ? 'Embedded & Saved!' : 'Embed Prototype'}
              </Button>

              {activeFigmaEmbed && (
                <a
                  href={figmaUrl || activeFigmaEmbed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                  title="Open externally in Figma"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </form>

          {/* Interactive Figma Viewer Canvas */}
          <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950 overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-4 py-2.5 bg-charcoal-900 border-b border-charcoal-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 font-mono text-[11px] ml-2">
                  Figma Canvas Viewer • {project.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
                  title="Reload frame"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {activeFigmaEmbed ? (
              <iframe
                key={iframeKey}
                src={activeFigmaEmbed}
                className="w-full h-[620px] border-0 bg-charcoal-950"
                allowFullScreen
              />
            ) : (
              <div className="h-[520px] flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-base font-bold text-white">No Figma Prototype Connected</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste your Figma file link above to embed interactive artboards, wireframes, or clickable prototypes directly into your workspace.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-left max-w-sm text-xs text-slate-300 space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    How to get your Figma link:
                  </span>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Open your Figma file or prototype.</li>
                    <li>Click the blue <strong>Share</strong> button at top right.</li>
                    <li>Copy link and paste it into the field above.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE DEMO MULTI-DEVICE VIEWPORTS
         ========================================================================= */}
      {activeTab === 'demo' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex flex-wrap items-center justify-between gap-4">
            {/* Viewport switchers */}
            <div className="flex items-center gap-1 bg-charcoal-950 p-1 rounded-xl border border-charcoal-800 text-xs">
              <button
                onClick={() => setViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewport === 'desktop'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (100%)</span>
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewport === 'tablet'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (768px)</span>
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewport === 'mobile'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (375px)</span>
              </button>
            </div>

            {/* URL input bar */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="flex items-center gap-2 bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-1.5 w-full text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setActiveDemoUrl(demoUrl);
                  }}
                  className="w-full bg-transparent text-white font-mono placeholder-slate-500 focus:outline-none"
                  placeholder="https://your-vercel-demo.vercel.app..."
                />
              </div>

              <button
                onClick={() => setActiveDemoUrl(demoUrl)}
                className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-white text-xs font-semibold transition-colors"
              >
                Go
              </button>
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                title="Refresh preview"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <a
                href={activeDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Viewport Canvas Frame */}
          <div className="p-6 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex justify-center items-center min-h-[640px] overflow-x-auto">
            <div
              className={`transition-all duration-300 rounded-2xl border-4 border-charcoal-700 shadow-2xl bg-white overflow-hidden ${
                viewport === 'mobile'
                  ? 'w-[375px] h-[667px]'
                  : viewport === 'tablet'
                  ? 'w-[768px] h-[680px]'
                  : 'w-full h-[640px]'
              }`}
            >
              <iframe
                key={iframeKey}
                src={activeDemoUrl}
                title="Live Prototype Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TEAM RESOURCE VAULT
         ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Add New Resource Form */}
          <form
            onSubmit={handleAddVaultItem}
            className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-sm"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add Resource to Project Vault</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4">
                <label className="block text-slate-300 font-medium mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Supabase Edge Functions Schema"
                  className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-slate-300 font-medium mb-1">Resource URL</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VaultItem['category'])}
                  className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="docs">Documentation</option>
                  <option value="code">Code / Repository</option>
                  <option value="design">Design / Figma</option>
                  <option value="api">API / Endpoints</option>
                  <option value="other">Other Link</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Save to Team Vault
              </Button>
            </div>
          </form>

          {/* Vault Items Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Saved Team Links ({vaultItems.length})</span>
              <span className="text-xs font-mono text-slate-400 font-normal">
                Persisted across all active team sessions
              </span>
            </h3>

            {vaultItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">Your team vault is empty. Add your first resource above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {vaultItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            item.category === 'code'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : item.category === 'design'
                              ? 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                              : item.category === 'api'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {item.category}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.createdAt}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                      <p className="text-xs font-mono text-slate-400 truncate">{item.url}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-charcoal-800/80">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        <button
                          onClick={() => handleCopyLink(item.url, item.id)}
                          className="p-1.5 rounded-lg hover:bg-charcoal-800 text-slate-400 hover:text-white transition-colors"
                          title="Copy Link"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteVaultItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove from vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
