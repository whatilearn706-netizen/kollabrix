'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectMember } from '@/types/database';
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
  Lock,
  Sparkles,
  Info,
  Palette,
  Video,
  FileText,
  Boxes,
  Code2,
  Share2,
  CheckCircle2,
  RefreshCw,
  Sliders,
  MessageSquare,
  ThumbsUp,
  Rocket,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Headphones,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { recordDailyStreakActivity } from '@/components/gamification/DailyStreakHub';

interface WorkspaceToolBridgeProps {
  project: Project;
  currentUserId?: string;
}

export type SupportedToolType =
  | 'figma'
  | 'canva'
  | 'miro'
  | 'excalidraw'
  | 'loom'
  | 'spline'
  | 'googledocs'
  | 'codepen'
  | 'custom';

export interface CanvasViewpoint {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  type: 'proposal' | 'critique' | 'approved' | 'issue';
  title: string;
  comment: string;
  proposedUrl?: string;
  timestamp: string;
  reactions: {
    agree: number;
    ship: number;
    question: number;
  };
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
  const [activeTab, setActiveTab] = useState<'canvas' | 'demo' | 'vault'>('canvas');

  // Universal Canvas Embedder State
  const [selectedTool, setSelectedTool] = useState<SupportedToolType>('figma');
  const [inputUrl, setInputUrl] = useState('');
  const [activeEmbedUrl, setActiveEmbedUrl] = useState('');
  const [isSavingTool, setIsSavingTool] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [canvasProxy, setCanvasProxy] = useState(true);

  // Collaborative Viewpoints & Design Review State
  const [viewpoints, setViewpoints] = useState<CanvasViewpoint[]>([]);
  const [newViewpointType, setNewViewpointType] = useState<CanvasViewpoint['type']>('proposal');
  const [newViewpointTitle, setNewViewpointTitle] = useState('');
  const [newViewpointComment, setNewViewpointComment] = useState('');
  const [newProposedUrl, setNewProposedUrl] = useState('');
  const [isSubmittingViewpoint, setIsSubmittingViewpoint] = useState(false);
  const [showViewpointForm, setShowViewpointForm] = useState(false);

  // Live Demo Preview State
  const initialDemoUrl = project.demo_url || 'https://linkora-link.online';
  const [demoInputUrl, setDemoInputUrl] = useState(initialDemoUrl);
  const [activeDemoUrl, setActiveDemoUrl] = useState(initialDemoUrl);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [useProxy, setUseProxy] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Vault State
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<VaultItem['category']>('docs');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tool Definitions
  const TOOL_OPTIONS: { id: SupportedToolType; label: string; icon: any; placeholder: string; color: string }[] = [
    {
      id: 'figma',
      label: 'Figma',
      icon: Layers,
      placeholder: 'https://www.figma.com/design/... or figma.com/proto/...',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 'canva',
      label: 'Canva',
      icon: Palette,
      placeholder: 'https://www.canva.com/design/.../view?embed',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'miro',
      label: 'Miro Board',
      icon: Sliders,
      placeholder: 'https://miro.com/app/board/...',
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    },
    {
      id: 'excalidraw',
      label: 'Excalidraw',
      icon: Code2,
      placeholder: 'https://excalidraw.com/#room=...',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    },
    {
      id: 'loom',
      label: 'Loom Video',
      icon: Video,
      placeholder: 'https://www.loom.com/share/...',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'spline',
      label: 'Spline 3D',
      icon: Boxes,
      placeholder: 'https://my.spline.design/...',
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    },
    {
      id: 'googledocs',
      label: 'Google Docs / Slides',
      icon: FileText,
      placeholder: 'https://docs.google.com/presentation/d/.../pub?start=false',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      id: 'custom',
      label: 'Custom Web Embed',
      icon: Globe,
      placeholder: 'https://your-custom-prototype.app...',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  // Smart URL parser: transforms share URLs into iframe-friendly embeds
  const parseEmbedUrl = (rawUrl: string, tool: SupportedToolType, proxy: boolean = true): string => {
    let clean = rawUrl.trim();
    if (!clean) return '';
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }

    try {
      if (clean.includes('figma.com')) {
        if (!clean.includes('figma.com/embed')) {
          return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(clean)}`;
        }
        return clean;
      }

      // Loom share URL conversion
      if (clean.includes('loom.com/share/')) {
        return clean.replace('loom.com/share/', 'loom.com/embed/');
      }

      // YouTube Walkthrough Demo video conversion
      if (clean.includes('youtube.com/watch') || clean.includes('youtu.be/')) {
        let videoId = '';
        if (clean.includes('v=')) {
          videoId = clean.split('v=')[1]?.split('&')[0];
        } else if (clean.includes('youtu.be/')) {
          videoId = clean.split('youtu.be/')[1]?.split('?')[0];
        }
        if (videoId) {
          return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`;
        }
      }

      // Miro Live Embed
      if (clean.includes('miro.com/app/board/')) {
        if (!clean.includes('/live-embed/')) {
          return clean.replace('/app/board/', '/app/live-embed/');
        }
        return clean;
      }

      // CodePen Embed
      if (clean.includes('codepen.io') && clean.includes('/pen/')) {
        return clean.replace('/pen/', '/embed/');
      }

      if (clean.includes('canva.com')) {
        if (!clean.includes('embed')) {
          return clean.includes('?') ? `${clean}&embed` : `${clean}?embed`;
        }
        return clean;
      }

      if (clean.includes('docs.google.com') && clean.includes('/edit')) {
        return clean.replace(/\/edit.*$/, '/preview');
      }

      // If user enabled proxy, or if custom tool, or for any general website/prototype:
      // Route through proxy so X-Frame-Options is stripped and preview works for all websites!
      if (proxy || tool === 'custom' || (!clean.includes('figma.com') && !clean.includes('canva.com') && !clean.includes('miro.com') && !clean.includes('loom.com'))) {
        return `/api/proxy-preview?url=${encodeURIComponent(clean)}`;
      }
    } catch {}

    return clean;
  };

  // Load saved state from Supabase API or localStorage on mount
  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaceData() {
      // 1. Try fetching from Supabase real-time workspace endpoint
      try {
        const res = await fetch(`/api/workspace/data?projectId=${project.id}`);
        const result = await res.json();

        if (isMounted && result?.data) {
          if (result.data.activeEmbedUrl) {
            setActiveEmbedUrl(result.data.activeEmbedUrl);
            setInputUrl(result.data.inputUrl || result.data.activeEmbedUrl);
            if (result.data.selectedTool) setSelectedTool(result.data.selectedTool);
          }
          if (result.data.demoUrl) {
            setDemoInputUrl(result.data.demoUrl);
            setActiveDemoUrl(result.data.demoUrl);
          }
          if (Array.isArray(result.data.viewpoints) && result.data.viewpoints.length > 0) {
            setViewpoints(result.data.viewpoints);
          }
          if (Array.isArray(result.data.vaultItems) && result.data.vaultItems.length > 0) {
            setVaultItems(result.data.vaultItems);
            return;
          }
        }
      } catch (e) {}

      // 2. Fallback to localStorage
      if (typeof window !== 'undefined' && isMounted) {
        try {
          const localTool = localStorage.getItem(`linkora_tool_${project.id}`);
          if (localTool) {
            const parsed = JSON.parse(localTool);
            setSelectedTool(parsed.tool || 'figma');
            setInputUrl(parsed.inputUrl || '');
            setActiveEmbedUrl(parsed.embedUrl || '');
          }

          const localVault = localStorage.getItem(`linkora_vault_${project.id}`);
          if (localVault) {
            setVaultItems(JSON.parse(localVault));
            return;
          }
        } catch {}

        // Default initial viewpoints from project lead
        setViewpoints((prev) => {
          if (prev.length > 0) return prev;
          return [
            {
              id: 'vp-1',
              authorId: project.owner_id,
              authorName: project.owner?.display_name || project.owner?.username || 'Project Lead',
              authorRole: 'Project Lead',
              type: 'proposal',
              title: 'Initial High-Fidelity Prototype',
              comment: 'Uploaded the primary wireframe & interactive prototype. Teammates, please review the UI contrast, mobile layout, and primary CTA. Feel free to propose alternative layouts or paste updated links below!',
              timestamp: 'Today at 02:30 AM',
              reactions: { agree: 5, ship: 4, question: 1 },
            },
          ];
        });

        // Default vault items from project
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
                  title: 'Production Deployment',
                  url: project.demo_url,
                  category: 'other' as const,
                  addedBy: 'Project Lead',
                  createdAt: new Date().toLocaleDateString(),
                },
              ]
            : []),
          {
            id: 'vault-3',
            title: 'Technical Specs & Architecture Spec',
            url: `https://linkora-link.online/projects/${project.id}`,
            category: 'docs' as const,
            addedBy: 'Linkora System',
            createdAt: new Date().toLocaleDateString(),
          },
        ];
        setVaultItems(initialItems);
      }
    }

    loadWorkspaceData();

    // 3. Subscribe to Realtime WebSocket channel for instant synchronization across teammates
    const channel = supabase.channel(`workspace-tools-${project.id}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'tool-embed-update' }, (payload: any) => {
        if (payload?.payload?.embedUrl && isMounted) {
          setActiveEmbedUrl(payload.payload.embedUrl);
          if (payload.payload.inputUrl) setInputUrl(payload.payload.inputUrl);
          if (payload.payload.tool) setSelectedTool(payload.payload.tool);
        }
      })
      .on('broadcast', { event: 'canvas-viewpoint-update' }, (payload: any) => {
        if (Array.isArray(payload?.payload?.viewpoints) && isMounted) {
          setViewpoints(payload.payload.viewpoints);
        }
      })
      .on('broadcast', { event: 'vault-update' }, (payload: any) => {
        if (Array.isArray(payload?.payload?.vaultItems) && isMounted) {
          setVaultItems(payload.payload.vaultItems);
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [project.id, project.repository_url, project.demo_url, project.owner_id, project.owner]);

  // Save Canvas Tool Embed to Supabase & Broadcast to Teammates
  const handleSaveToolEmbed = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsSavingTool(true);
    const parsed = parseEmbedUrl(inputUrl, selectedTool, canvasProxy);
    setActiveEmbedUrl(parsed);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `linkora_tool_${project.id}`,
        JSON.stringify({ tool: selectedTool, inputUrl, embedUrl: parsed })
      );
    }

    // Persist to Supabase DB in real time
    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            selectedTool,
            inputUrl,
            activeEmbedUrl: parsed,
            demoUrl: activeDemoUrl,
            vaultItems,
            viewpoints,
          },
        }),
      });

      // Broadcast to other active teammates
      const channel = supabase.channel(`workspace-tools-${project.id}`);
      channel.send({
        type: 'broadcast',
        event: 'tool-embed-update',
        payload: { tool: selectedTool, inputUrl, embedUrl: parsed },
      });
    } catch (err) {
      console.warn('Realtime tool sync error:', err);
    }

    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Connected ${selectedTool.toUpperCase()} prototype in Tool Bridge for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}

    setIsSavingTool(false);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  // Submit new Viewpoint / Proposed Change to Team
  const handleSubmitViewpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewpointComment.trim()) return;

    setIsSubmittingViewpoint(true);
    const newPost: CanvasViewpoint = {
      id: `vp-${Date.now()}`,
      authorId: currentUserId || 'current-user',
      authorName: project.owner?.display_name || 'Teammate',
      authorRole: 'Team Member',
      type: newViewpointType,
      title: newViewpointTitle.trim() || (newViewpointType === 'proposal' ? 'Proposed Change' : 'Design Viewpoint'),
      comment: newViewpointComment.trim(),
      proposedUrl: newProposedUrl.trim() || undefined,
      timestamp: 'Just now',
      reactions: { agree: 1, ship: 0, question: 0 },
    };

    const updated = [newPost, ...viewpoints];
    setViewpoints(updated);

    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            selectedTool,
            inputUrl,
            activeEmbedUrl,
            demoUrl: activeDemoUrl,
            vaultItems,
            viewpoints: updated,
          },
        }),
      });

      const channel = supabase.channel(`workspace-tools-${project.id}`);
      channel.send({
        type: 'broadcast',
        event: 'canvas-viewpoint-update',
        payload: { viewpoints: updated },
      });
    } catch {}

    try {
      recordDailyStreakActivity({
        type: 'WORKSPACE_ACTIVITY',
        note: `Proposed design changes & viewpoints for ${project.title}`,
        title: project.title,
        userId: currentUserId,
      });
    } catch {}

    setNewViewpointTitle('');
    setNewViewpointComment('');
    setNewProposedUrl('');
    setIsSubmittingViewpoint(false);
    setShowViewpointForm(false);
  };

  // 1-Click apply proposed URL to Canvas
  const handleApplyProposedUrl = (url: string) => {
    setInputUrl(url);
    const parsed = parseEmbedUrl(url, selectedTool, canvasProxy);
    setActiveEmbedUrl(parsed);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `linkora_tool_${project.id}`,
        JSON.stringify({ tool: selectedTool, inputUrl: url, embedUrl: parsed })
      );
    }

    const channel = supabase.channel(`workspace-tools-${project.id}`);
    channel.send({
      type: 'broadcast',
      event: 'tool-embed-update',
      payload: { embedUrl: parsed, inputUrl: url, tool: selectedTool },
    });
  };

  // React to Viewpoint
  const handleViewpointReaction = async (viewpointId: string, reactionType: 'agree' | 'ship' | 'question') => {
    const updated = viewpoints.map((vp) => {
      if (vp.id === viewpointId) {
        return {
          ...vp,
          reactions: {
            ...vp.reactions,
            [reactionType]: ((vp.reactions && vp.reactions[reactionType]) || 0) + 1,
          },
        };
      }
      return vp;
    });
    setViewpoints(updated);

    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            selectedTool,
            inputUrl,
            activeEmbedUrl,
            demoUrl: activeDemoUrl,
            vaultItems,
            viewpoints: updated,
          },
        }),
      });

      const channel = supabase.channel(`workspace-tools-${project.id}`);
      channel.send({
        type: 'broadcast',
        event: 'canvas-viewpoint-update',
        payload: { viewpoints: updated },
      });
    } catch {}
  };

  // Add new Vault item
  const handleAddVaultItem = async (e: React.FormEvent) => {
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

    // Persist to Supabase
    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            selectedTool,
            inputUrl,
            activeEmbedUrl,
            demoUrl: activeDemoUrl,
            vaultItems: updated,
          },
        }),
      });

      const channel = supabase.channel(`workspace-tools-${project.id}`);
      channel.send({
        type: 'broadcast',
        event: 'vault-update',
        payload: { vaultItems: updated },
      });
    } catch {}

    setNewTitle('');
    setNewUrl('');
  };

  const handleDeleteVaultItem = async (id: string) => {
    const updated = vaultItems.filter((i) => i.id !== id);
    setVaultItems(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`linkora_vault_${project.id}`, JSON.stringify(updated));
    }

    try {
      await fetch('/api/workspace/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          data: {
            selectedTool,
            inputUrl,
            activeEmbedUrl,
            demoUrl: activeDemoUrl,
            vaultItems: updated,
          },
        }),
      });
    } catch {}
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Compute live demo frame source (Direct frame vs Universal Proxy)
  const computeDemoFrameSrc = () => {
    if (!activeDemoUrl) return '';
    if (!useProxy) return activeDemoUrl;
    // Route through safe proxy to strip X-Frame-Options & CSP headers so ANY URL works!
    return `/api/proxy-preview?url=${encodeURIComponent(activeDemoUrl)}`;
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
            <h2 className="text-xl font-bold text-white tracking-tight">The Universal Tool Bridge</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Embed <strong>any design tool</strong> (Figma, Canva, Miro, Excalidraw, Loom, Spline, Docs), preview <strong>any live web deployment</strong> with our universal proxy, and sync team links across everyone's screen in real time.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-charcoal-950 border border-charcoal-800">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'canvas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-charcoal-850'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Universal Canvas</span>
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
            <Layers className="w-3.5 h-3.5" />
            <span>Resource Vault ({vaultItems.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: UNIVERSAL DESIGN & CANVAS EMBEDDER (FIGMA, CANVA, MIRO, EXCALIDRAW, LOOM, SPLINE)
         ========================================================================= */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          {/* Tool Selector Chips */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Select Prototyping / Canvas Tool:
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                🟢 Live Synced to Team Database
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setSelectedTool(tool.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? `${tool.color} ring-2 ring-blue-500/40 text-white shadow-sm font-bold`
                        : 'bg-charcoal-800/80 border-charcoal-700/80 text-slate-300 hover:text-white hover:bg-charcoal-750'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleSaveToolEmbed} className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <div className="flex-1 flex items-center gap-2 bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 w-full">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={
                    TOOL_OPTIONS.find((t) => t.id === selectedTool)?.placeholder ||
                    'Paste share URL or embed link...'
                  }
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSavingTool}
                  className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                  leftIcon={
                    isSavingTool ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isSavedNotice ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )
                  }
                >
                  {isSavedNotice ? 'Synced to Team!' : 'Embed & Sync to Team'}
                </Button>

                {activeEmbedUrl && (
                  <a
                    href={inputUrl || activeEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white transition-colors"
                    title="Open externally in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </form>
          </div>

          {/* Interactive Canvas Viewer */}
          <div className="rounded-2xl border border-charcoal-800 bg-charcoal-950 overflow-hidden shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-charcoal-900 border-b border-charcoal-800 text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 font-mono text-[11px] ml-2">
                  {TOOL_OPTIONS.find((t) => t.id === selectedTool)?.label || 'Universal Canvas'} • {project.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Proxy Bypass Toggle */}
                <button
                  onClick={() => {
                    const next = !canvasProxy;
                    setCanvasProxy(next);
                    if (inputUrl) {
                      setActiveEmbedUrl(parseEmbedUrl(inputUrl, selectedTool, next));
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border transition-all ${
                    canvasProxy
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-charcoal-800 text-slate-400 border-charcoal-700 hover:text-white'
                  }`}
                  title="Universal proxy strips X-Frame-Options and Content-Security-Policy headers so ANY site or custom frame can be embedded safely"
                >
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Universal Proxy: {canvasProxy ? 'ON (Unblocked)' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
                  title="Reload canvas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {activeEmbedUrl && (
                  <a
                    href={inputUrl || activeEmbedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
                    title="Open externally in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {activeEmbedUrl ? (
              <iframe
                key={iframeKey}
                src={activeEmbedUrl}
                title={`${selectedTool} prototype canvas`}
                className="w-full h-[640px] border-0 bg-charcoal-950"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-presentation allow-pointer-lock"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            ) : (
              <div className="h-[540px] flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Palette className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-base font-bold text-white">No Prototype or Canvas Connected Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Choose your tool above (Figma, Canva, Miro, Excalidraw, Loom, Spline, or Custom) and paste the link to collaborate with your team without leaving the workspace.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 text-left max-w-sm text-xs text-slate-300 space-y-1.5">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    Automatic Embed Formatting:
                  </span>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                    <li>Paste standard Figma links — auto-converts to embed frames.</li>
                    <li>Loom videos automatically convert to responsive video players.</li>
                    <li>Canva & Miro boards embed with real-time zooming & panning.</li>
                    <li>Any generic website works via our Universal Proxy engine!</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              TEAM VIEWPOINTS & CHANGE PROPOSALS REVIEW WAR ROOM DOCK
             ========================================================================= */}
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-5 shadow-elevated">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                    <MessageSquare className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Teammate Viewpoints & Change Proposals
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                    {viewpoints.length} {viewpoints.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Review the prototype, suggest alternate revisions or links, and switch the active canvas with 1 click so the entire team stays aligned.
                </p>
              </div>

              <Button
                onClick={() => setShowViewpointForm(!showViewpointForm)}
                size="sm"
                variant={showViewpointForm ? 'outline' : 'primary'}
                className={!showViewpointForm ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                leftIcon={showViewpointForm ? <RotateCcw className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              >
                {showViewpointForm ? 'Close Proposal Form' : 'Propose Revision / Link'}
              </Button>
            </div>

            {/* Proposal Form */}
            {showViewpointForm && (
              <form
                onSubmit={handleSubmitViewpoint}
                className="p-5 rounded-2xl bg-charcoal-950 border border-blue-500/30 space-y-4 animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Submit a Design Proposal or Teammate Viewpoint
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Broadcasts to all teammates instantly
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Viewpoint Type
                    </label>
                    <select
                      value={newViewpointType}
                      onChange={(e) => setNewViewpointType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="proposal">💡 Feature / Layout Proposal</option>
                      <option value="critique">🎨 Design Critique & Feedback</option>
                      <option value="approved">✅ Sign-Off & Approved</option>
                      <option value="issue">⚠️ UX Issue / Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1">
                      Proposal Title
                    </label>
                    <input
                      type="text"
                      value={newViewpointTitle}
                      onChange={(e) => setNewViewpointTitle(e.target.value)}
                      placeholder="e.g. Modernized navigation hero with quick CTA"
                      className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Alternate Prototype URL <span className="text-slate-500">(Optional — Figma, Canva, Staging URL)</span>
                  </label>
                  <input
                    type="text"
                    value={newProposedUrl}
                    onChange={(e) => setNewProposedUrl(e.target.value)}
                    placeholder="https://www.figma.com/design/... or your branch demo"
                    className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    If provided, teammates will see a <strong>"⚡ Switch Canvas to this Version"</strong> button to immediately view your changes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1">
                    Rationale & Detailed Feedback *
                  </label>
                  <textarea
                    rows={3}
                    value={newViewpointComment}
                    onChange={(e) => setNewViewpointComment(e.target.value)}
                    placeholder="Explain what changes were made, why it improves user conversion, and what teammates should inspect..."
                    required
                    className="w-full p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowViewpointForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmittingViewpoint || !newViewpointComment.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    leftIcon={isSubmittingViewpoint ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  >
                    {isSubmittingViewpoint ? 'Publishing...' : 'Publish Viewpoint to Team'}
                  </Button>
                </div>
              </form>
            )}

            {/* Viewpoints Feed */}
            <div className="space-y-3">
              {viewpoints.length === 0 ? (
                <div className="p-8 rounded-xl bg-charcoal-950/60 border border-charcoal-800 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No viewpoints or design proposals yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Click "Propose Revision / Link" above to share your perspective with your team!
                  </p>
                </div>
              ) : (
                viewpoints.map((vp) => {
                  const typeBadge = {
                    proposal: { label: '💡 Feature Proposal', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
                    critique: { label: '🎨 Design Critique', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
                    approved: { label: '✅ Approved & Signed Off', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                    issue: { label: '⚠️ Issue / Bug', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
                  }[vp.type] || { label: 'Review', color: 'bg-charcoal-800 text-slate-300 border-charcoal-700' };

                  return (
                    <div
                      key={vp.id}
                      className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 hover:border-charcoal-700 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center">
                            {vp.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              {vp.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {vp.authorRole} • {vp.timestamp}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-100">{vp.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {vp.comment}
                        </p>
                      </div>

                      {/* If the viewpoint includes an alternate proposed URL */}
                      {vp.proposedUrl && (
                        <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
                            <div className="truncate text-xs font-mono text-blue-300">
                              {vp.proposedUrl}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              onClick={() => handleApplyProposedUrl(vp.proposedUrl!)}
                              size="sm"
                              variant="primary"
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs whitespace-nowrap"
                              leftIcon={<Rocket className="w-3.5 h-3.5" />}
                            >
                              ⚡ Switch Canvas to this Version
                            </Button>

                            <a
                              href={vp.proposedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white"
                              title="Open link in new window"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Team Reaction Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-charcoal-850">
                        <button
                          onClick={() => handleViewpointReaction(vp.id, 'agree')}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-300 hover:text-white hover:bg-charcoal-850 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3 text-blue-400" />
                          <span>Agree ({vp.reactions?.agree || 0})</span>
                        </button>

                        <button
                          onClick={() => handleViewpointReaction(vp.id, 'ship')}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-300 hover:text-white hover:bg-charcoal-850 transition-colors"
                        >
                          <Rocket className="w-3 h-3 text-emerald-400" />
                          <span>Ship It ({vp.reactions?.ship || 0})</span>
                        </button>

                        <button
                          onClick={() => handleViewpointReaction(vp.id, 'question')}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-300 hover:text-white hover:bg-charcoal-850 transition-colors"
                        >
                          <HelpCircle className="w-3 h-3 text-amber-400" />
                          <span>Questions ({vp.reactions?.question || 0})</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LIVE DEMO VIEWPORT (UNIVERSAL PROXY ENGINE: WORKS FOR ALL WEBSITES)
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

            {/* URL input bar & Proxy Switcher */}
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="flex items-center gap-2 bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-1.5 w-full text-xs">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={demoInputUrl}
                  onChange={(e) => setDemoInputUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setActiveDemoUrl(demoInputUrl);
                  }}
                  className="w-full bg-transparent text-white font-mono placeholder-slate-500 focus:outline-none"
                  placeholder="https://any-site-or-deployment.com..."
                />
              </div>

              <button
                onClick={() => setActiveDemoUrl(demoInputUrl)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
              >
                Load
              </button>

              <button
                onClick={() => setUseProxy(!useProxy)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-colors shrink-0 ${
                  useProxy
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-charcoal-800 border-charcoal-700 text-slate-400'
                }`}
                title="Universal Proxy bypasses X-Frame-Options headers so ANY website embeds seamlessly."
              >
                {useProxy ? '🛡️ Universal Proxy: ON' : 'Direct Frame'}
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
          <div className="p-6 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex justify-center items-center min-h-[660px] overflow-x-auto">
            <div
              className={`transition-all duration-300 rounded-2xl border-4 border-charcoal-700 shadow-2xl bg-white overflow-hidden ${
                viewport === 'mobile'
                  ? 'w-[375px] h-[667px]'
                  : viewport === 'tablet'
                  ? 'w-[768px] h-[720px]'
                  : 'w-full h-[660px]'
              }`}
            >
              <iframe
                key={iframeKey}
                src={computeDemoFrameSrc()}
                title="Live Prototype Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-presentation allow-pointer-lock"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TEAM RESOURCE VAULT (REAL-TIME DB SYNC)
         ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Add New Resource Form */}
          <form
            onSubmit={handleAddVaultItem}
            className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add Resource to Project Vault</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                🟢 Saved in Real-Time to Supabase
              </span>
            </div>

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
                Persisted in Supabase & synchronized across all active team sessions
              </span>
            </h3>

            {vaultItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-500 mx-auto" />
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
