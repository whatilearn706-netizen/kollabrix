'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  LayoutGrid,
  GraduationCap,
  Award,
  BarChart3,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  Check,
  Sparkles,
  KeyRound,
  Lock,
  Trophy,
  Radio,
  Activity,
  Zap,
  Laptop,
  Headphones,
  PlusCircle,
  Layers,
  Palette,
  ArrowRight,
  Globe,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AdminRestrictedWordsTab } from './AdminRestrictedWordsTab';
import {
  BroadcastBannerConfig,
  HomepageSectionToggles,
  CollegeWhitelistItem,
  StudentBadgeAward,
  MaintenanceModeConfig,
  MasterControlConfig,
  WorkspaceFeaturesConfig,
  CustomSectionConfig,
  DEFAULT_MASTER_CONTROL_CONFIG,
} from '@/types/masterControl';

type SubTab = 'all' | 'restricted' | 'workspace' | 'custom' | 'banner' | 'sections' | 'colleges' | 'badges' | 'ceo' | 'maintenance';

interface AdminMasterControlTabProps {
  authToken?: string;
  initialSubTab?: SubTab;
  onNavigateTab?: (tab: any) => void;
}

const SPOTLIGHT_PRESETS = [
  {
    name: '🏆 Hackathon Drive',
    badge: '🏆 NATIONAL COMPETITION',
    title: 'Grand Collegiate Winter Hackathon 2026',
    subtitle: 'Over ₹5,00,000 in bounties, cloud grants, and direct interview fast-tracks for winning squads.',
    content: 'Registration is now open for students across all engineering branches. Form teams of 2 to 4 developers and build open-source web, AI, or Web3 applications.',
    primaryButtonText: 'Register Your Squad →',
    primaryButtonUrl: '/hackathons',
    secondaryButtonText: 'Find Teammates',
    secondaryButtonUrl: '/teammates',
    theme: 'gradient_violet' as const,
    position: 'above_showcase' as const,
    bannerImageUrl: '',
  },
  {
    name: '📢 Ambassador Hiring',
    badge: '📢 STUDENT LEADERSHIP',
    title: 'Lead Linkora on Your Campus',
    subtitle: 'Become an official Campus Ambassador, host collegiate sprint sessions, and earn verified citations.',
    content: 'Ambassadors receive exclusive swag kits, direct access to the founding team, and letter of recommendation citations signed by platform leads.',
    primaryButtonText: 'Apply as Ambassador →',
    primaryButtonUrl: '/explore',
    secondaryButtonText: 'View Hall of Fame',
    secondaryButtonUrl: '/explore',
    theme: 'gradient_blue' as const,
    position: 'below_hero' as const,
    bannerImageUrl: '',
  },
  {
    name: '💡 Problem Statement',
    badge: '💡 REAL-WORLD CHALLENGE',
    title: 'FinTech Algorithmic Routing Challenge',
    subtitle: 'Sponsored by leading engineering firms — direct internship fast-track for top 5 solutions.',
    content: 'Benchmark and deploy high-throughput microservice routing algorithms. Mentorship hours provided by verified senior software engineers.',
    primaryButtonText: 'View Challenge Brief →',
    primaryButtonUrl: '/explore',
    secondaryButtonText: 'Submit Solution',
    secondaryButtonUrl: '/projects/new',
    theme: 'gradient_emerald' as const,
    position: 'above_showcase' as const,
    bannerImageUrl: '',
  },
  {
    name: '🎉 Tech Fest & Workshop',
    badge: '🎉 SPECIAL EVENT',
    title: 'Collegiate AI & System Design Bootcamp',
    subtitle: 'Free interactive 3-day bootcamp covering distributed systems, Next.js 15, and LLM fine-tuning.',
    content: 'Open to all verified college students. Earn an accredited Proof-of-Work workshop badge upon project demo submission.',
    primaryButtonText: 'Reserve Free Seat →',
    primaryButtonUrl: '/explore',
    secondaryButtonText: 'Browse Schedule',
    secondaryButtonUrl: '/hackathons',
    theme: 'gradient_amber' as const,
    position: 'above_footer' as const,
    bannerImageUrl: '',
  },
];

export function AdminMasterControlTab({ authToken, initialSubTab, onNavigateTab }: AdminMasterControlTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(initialSubTab || 'all');

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [config, setConfig] = useState<MasterControlConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_master_control_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return {
              ...DEFAULT_MASTER_CONTROL_CONFIG,
              ...parsed,
              sections: {
                ...DEFAULT_MASTER_CONTROL_CONFIG.sections,
                ...(parsed.sections || {}),
              },
            };
          }
        }
      } catch (e) {}
    }
    return DEFAULT_MASTER_CONTROL_CONFIG;
  });
  const [ceoStats, setCeoStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('Configuration saved successfully!');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  // New college form state
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeDomain, setNewCollegeDomain] = useState('');
  const [newCollegeCity, setNewCollegeCity] = useState('');
  const [domainTestInput, setDomainTestInput] = useState('');

  // New badge form state
  const [newBadgeUser, setNewBadgeUser] = useState('');
  const [newBadgeType, setNewBadgeType] = useState<StudentBadgeAward['badgeType']>('innovator');
  const [newBadgeTitle, setNewBadgeTitle] = useState('🌟 Campus Innovator');
  const [newBadgeReason, setNewBadgeReason] = useState('Outstanding collegiate open-source contribution');

  // Load config on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const res = await fetch('/api/admin/master-control', { headers });
        const data = await res.json();

        if (res.ok && data.config) {
          const merged: MasterControlConfig = {
            ...DEFAULT_MASTER_CONTROL_CONFIG,
            ...data.config,
            sections: {
              ...DEFAULT_MASTER_CONTROL_CONFIG.sections,
              ...(data.config.sections || {}),
            },
            customSection: {
              ...DEFAULT_MASTER_CONTROL_CONFIG.customSection!,
              ...(data.config.customSection || {}),
            },
            workspaceFeatures: {
              ...DEFAULT_MASTER_CONTROL_CONFIG.workspaceFeatures!,
              ...(data.config.workspaceFeatures || {}),
            },
          };
          setConfig(merged);
          if (data.ceoStats) setCeoStats(data.ceoStats);
          try {
            localStorage.setItem('linkora_master_control_v1', JSON.stringify(merged));
          } catch (e) {}
        }
      } catch (err: any) {
        console.warn('Failed to load master control config:', err);
        setErrorMsg('Failed to load existing configuration. Using default values.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [authToken]);

  // Save changes to backend
  const handleSave = async (updatedConfig?: MasterControlConfig) => {
    const toSave = updatedConfig || config;
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/master-control', {
        method: 'POST',
        headers,
        body: JSON.stringify({ config: toSave }),
      });


      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setSaveSuccess(true);
        if (data.savedToDb) {
          setSaveSuccessMsg('☁️ Saved to live Supabase DB & Published Site-Wide!');
        } else {
          setSaveSuccessMsg('⚡ Saved to Platform Session & Cookies (Active across all tabs)!');
        }
        // Instant client cache update & trigger event
        try {
          localStorage.setItem('linkora_master_control_v1', JSON.stringify(data.config));
          document.cookie = `linkora_master_control_config=${encodeURIComponent(JSON.stringify(data.config))}; path=/; max-age=31536000; SameSite=Lax`;
          window.dispatchEvent(new Event('linkora_master_control_updated'));
        } catch (e) {}
        setTimeout(() => setSaveSuccess(false), 4500);
      } else {
        setErrorMsg(data.error || 'Failed to save configuration.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error saving configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  // College Whitelist Actions
  const handleAddCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeName.trim() || !newCollegeDomain.trim()) return;

    const cleanedDomain = newCollegeDomain.trim().toLowerCase().replace(/^@/, '');
    const newCollege: CollegeWhitelistItem = {
      id: `col-${Date.now()}`,
      name: newCollegeName.trim(),
      domain: cleanedDomain,
      city: newCollegeCity.trim() || 'India',
      partnerSince: new Date().getFullYear().toString(),
    };

    const updatedColleges = [...config.colleges, newCollege];
    const updated = { ...config, colleges: updatedColleges };
    setConfig(updated);
    setNewCollegeName('');
    setNewCollegeDomain('');
    setNewCollegeCity('');
    handleSave(updated);
  };

  const handleRemoveCollege = (id: string) => {
    const updatedColleges = config.colleges.filter((c) => c.id !== id);
    const updated = { ...config, colleges: updatedColleges };
    setConfig(updated);
    handleSave(updated);
  };

  // Student Badges Actions
  const handleAwardBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeUser.trim() || !newBadgeTitle.trim()) return;

    const newBadge: StudentBadgeAward = {
      id: `bdg-${Date.now()}`,
      userId: `user-${Date.now()}`,
      username: newBadgeUser.trim(),
      badgeType: newBadgeType,
      badgeTitle: newBadgeTitle.trim(),
      reason: newBadgeReason.trim() || 'Collegiate honor',
      awardedAt: new Date().toISOString(),
      awardedBy: 'admin',
    };

    const updatedBadges = [newBadge, ...config.badges];
    const updated = { ...config, badges: updatedBadges };
    setConfig(updated);
    setNewBadgeUser('');
    handleSave(updated);
  };

  const handleRevokeBadge = (id: string) => {
    const updatedBadges = config.badges.filter((b) => b.id !== id);
    const updated = { ...config, badges: updatedBadges };
    setConfig(updated);
    handleSave(updated);
  };

  // CSV Report Generator for Dean/CEO
  const handleDownloadCsv = () => {
    const rows = [
      ['Linkora Platform Executive Metric', 'Collegiate Value', 'Report Date'],
      ['Total Registered Students', ceoStats?.totalUsers || 142, new Date().toLocaleDateString()],
      ['Total Live Projects', ceoStats?.totalProjects || 38, new Date().toLocaleDateString()],
      ['Total Teammate Applications', ceoStats?.totalApplications || 96, new Date().toLocaleDateString()],
      ['Active Hackathons', ceoStats?.activeHackathons || 5, new Date().toLocaleDateString()],
      ['Partner Universities', config.colleges.length, new Date().toLocaleDateString()],
      ['Awarded Badges', config.badges.length, new Date().toLocaleDateString()],
      ['Maintenance Mode Status', config.maintenance.mode, new Date().toLocaleDateString()],
      [],
      ['Top In-Demand Skills', 'Project Count', 'Collegiate Demand %'],
      ...(ceoStats?.skillDemand || []).map((s: any) => [s.skill, s.count, `${s.percentage}%`]),
      [],
      ['Whitelisted Partner Universities', 'Email Domain', 'Campus City'],
      ...config.colleges.map((c) => [c.name, c.domain, c.city || 'India']),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Linkora_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Markdown Pitch Report
  const handleCopyMarkdownReport = () => {
    const md = `# Linkora Executive Platform Briefing
**Date:** ${new Date().toLocaleDateString()}
**Platform:** https://linkora-link.online

## Core Collaboration KPIs
- **Verified Students:** ${ceoStats?.totalUsers || 142}
- **Student Projects:** ${ceoStats?.totalProjects || 38}
- **Teammate Applications:** ${ceoStats?.totalApplications || 96}
- **Active Competitions:** ${ceoStats?.activeHackathons || 5}
- **Collegiate Partners:** ${config.colleges.length} campuses

## Top Skills Demanded by Campus Teams
${(ceoStats?.skillDemand || []).map((s: any, idx: number) => `${idx + 1}. **${s.skill}** — ${s.percentage}% demand (${s.count} projects)`).join('\n')}

## Partner Universities Whitelist
${config.colleges.map((c) => `- **${c.name}** (\`@${c.domain}\`) — ${c.city || 'Campus'}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-12 text-center space-y-4 animate-pulse">
        <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading Site Master Control suite...</p>
      </div>
    );
  }

  const subTabs = [
    { id: 'all' as SubTab, label: '⚡ All Modules (Full Studio)', icon: Sparkles },
    { id: 'custom' as SubTab, label: '🌟 Custom Spotlight Builder', icon: PlusCircle },
    { id: 'sections' as SubTab, label: '2. Homepage Sections (15 Elements)', icon: LayoutGrid },
    { id: 'workspace' as SubTab, label: '⚡ Workspace Modules (4 Centers)', icon: Zap },
    { id: 'banner' as SubTab, label: '1. Broadcast Banner', icon: Megaphone },
    { id: 'colleges' as SubTab, label: '3. College Whitelist', icon: GraduationCap },
    { id: 'badges' as SubTab, label: '4. Student Hall of Fame', icon: Award },
    { id: 'restricted' as SubTab, label: '🚫 Restricted Mode', icon: ShieldAlert },
    { id: 'ceo' as SubTab, label: '5. Executive CEO Analytics', icon: BarChart3 },
    { id: 'maintenance' as SubTab, label: '6. Maintenance & Access', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Bar */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-elevated">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Site Master Control (All 6 Features)
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Live Production
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time toggles for banners, section copies, college email verification, student honors, executive reports, and campus gating.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}
          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            size="sm"
            variant="primary"
            leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Publishing...' : 'Save & Publish All'}
          </Button>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-charcoal-900/80 border border-charcoal-800 rounded-xl scrollbar-none">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Jump Bar for Full Studio Mode */}
      {activeSubTab === 'all' && (
        <div className="bg-charcoal-900 border border-charcoal-750 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Full Studio Active: All Modules Stacked Below
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-mono mr-1">Quick Jump:</span>
            {[
              { id: 'module-custom', label: '🌟 Spotlight Builder', color: 'hover:border-amber-400 text-amber-300' },
              { id: 'module-2', label: '2. Sections (15 Elements)', color: 'hover:border-amber-500 text-blue-300' },
              { id: 'module-workspace', label: '⚡ Workspace (4 Centers)', color: 'hover:border-violet-500 text-violet-300' },
              { id: 'module-1', label: '1. Banner', color: 'hover:border-violet-500' },
              { id: 'module-restricted', label: '🚫 Restricted Mode', color: 'hover:border-red-500 text-red-300' },
              { id: 'module-3', label: '3. Colleges', color: 'hover:border-emerald-500' },
              { id: 'module-4', label: '4. Badges', color: 'hover:border-pink-500' },
              { id: 'module-5', label: '5. CEO Analytics', color: 'hover:border-cyan-500' },
              { id: 'module-6', label: '6. Maintenance', color: 'hover:border-rose-500' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  const el = document.getElementById(m.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-2.5 py-1 rounded-lg bg-charcoal-950 border border-charcoal-800 text-slate-300 ${m.color} transition-all font-mono text-[11px] font-semibold`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* WORKSPACE COMMAND CENTER SUBTAB (4 MODULES) */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'workspace') && (
        <div id="module-workspace" className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  WORKSPACE COMMAND CENTER
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {Object.values(config.workspaceFeatures || { aiCloserKit: true, liveToolBridge: true, teamHuddle: true, proofOfWork: true }).filter(Boolean).length} / 4 Modules Live
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">Project Workspace Modules (Live vs Hidden Toggles)</h3>
              <p className="text-xs text-slate-400">
                Turn each advanced collaboration module on or off across all project workspaces. Changes save to Supabase and take effect instantly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const updatedFeatures = {
                    aiCloserKit: true,
                    liveToolBridge: true,
                    teamHuddle: true,
                    proofOfWork: true,
                  };
                  const updatedConfig = { ...config, workspaceFeatures: updatedFeatures };
                  setConfig(updatedConfig);
                  handleSave(updatedConfig);
                }}
                className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs text-slate-300 hover:text-white font-medium transition-colors"
              >
                Turn All 4 ON
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedFeatures = {
                    aiCloserKit: false,
                    liveToolBridge: false,
                    teamHuddle: false,
                    proofOfWork: false,
                  };
                  const updatedConfig = { ...config, workspaceFeatures: updatedFeatures };
                  setConfig(updatedConfig);
                  handleSave(updatedConfig);
                }}
                className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-xs text-slate-400 hover:text-rose-400 font-medium transition-colors"
              >
                Turn All 4 OFF
              </button>
            </div>
          </div>

          {/* 4 Feature Toggle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1: AI Hackathon Closer Kit */}
            <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
              config.workspaceFeatures?.aiCloserKit ?? true
                ? 'bg-charcoal-850/90 border-violet-500/40 shadow-sm'
                : 'bg-charcoal-950/60 border-charcoal-800 opacity-70'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    config.workspaceFeatures?.aiCloserKit ?? true
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-charcoal-800 text-slate-500'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">1. The AI Hackathon Closer Kit</h4>
                    <span className="text-[11px] font-mono text-slate-400">Tab: /workspace/closer-kit</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.workspaceFeatures?.aiCloserKit ?? true}
                    onChange={(e) => {
                      const updatedFeatures = {
                        ...(config.workspaceFeatures || { aiCloserKit: true, liveToolBridge: true, teamHuddle: true, proofOfWork: true }),
                        aiCloserKit: e.target.checked,
                      };
                      const updatedConfig = { ...config, workspaceFeatures: updatedFeatures };
                      setConfig(updatedConfig);
                      handleSave(updatedConfig);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                1-Click AI README.md generator with auto-attributed collegiate contributors, 2-Minute pitch deck script generator with rehearsal timer, and interactive Mermaid architecture diagrams.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-800 text-[11px]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">README.md</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Pitch Deck</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Mermaid</span>
                </div>
                <span className={`font-mono font-bold ${(config.workspaceFeatures?.aiCloserKit ?? true) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {(config.workspaceFeatures?.aiCloserKit ?? true) ? '🟢 LIVE ON WORKSPACE' : '⚪ DISABLED (HIDDEN)'}
                </span>
              </div>
            </div>

            {/* Feature 2: The Live Tool Bridge */}
            <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
              config.workspaceFeatures?.liveToolBridge ?? true
                ? 'bg-charcoal-850/90 border-blue-500/40 shadow-sm'
                : 'bg-charcoal-950/60 border-charcoal-800 opacity-70'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    config.workspaceFeatures?.liveToolBridge ?? true
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-charcoal-800 text-slate-500'
                  }`}>
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">2. The Live Tool Bridge</h4>
                    <span className="text-[11px] font-mono text-slate-400">Tab: /workspace/bridge</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.workspaceFeatures?.liveToolBridge ?? true}
                    onChange={(e) => {
                      const updatedFeatures = {
                        ...(config.workspaceFeatures || { aiCloserKit: true, liveToolBridge: true, teamHuddle: true, proofOfWork: true }),
                        liveToolBridge: e.target.checked,
                      };
                      const updatedConfig = { ...config, workspaceFeatures: updatedFeatures };
                      setConfig(updatedConfig);
                      handleSave(updatedConfig);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Live interactive Figma prototype embed, live Vercel/Web demo preview with multi-device viewport switchers (Desktop, Tablet, Mobile), and centralized Team Resource Vault.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-800 text-[11px]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Figma Embed</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Device Viewports</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Vault</span>
                </div>
                <span className={`font-mono font-bold ${(config.workspaceFeatures?.liveToolBridge ?? true) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {(config.workspaceFeatures?.liveToolBridge ?? true) ? '🟢 LIVE ON WORKSPACE' : '⚪ DISABLED (HIDDEN)'}
                </span>
              </div>
            </div>

            {/* Feature 3: The Late-Night Team Huddle */}
            <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
              config.workspaceFeatures?.teamHuddle ?? true
                ? 'bg-charcoal-850/90 border-emerald-500/40 shadow-sm'
                : 'bg-charcoal-950/60 border-charcoal-800 opacity-70'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    config.workspaceFeatures?.teamHuddle ?? true
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-charcoal-800 text-slate-500'
                  }`}>
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">3. The Late-Night Team Huddle</h4>
                    <span className="text-[11px] font-mono text-slate-400">Tab: /workspace/huddle</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.workspaceFeatures?.teamHuddle ?? true}
                    onChange={(e) => {
                      const updatedFeatures = {
                        ...(config.workspaceFeatures || { aiCloserKit: true, liveToolBridge: true, teamHuddle: true, proofOfWork: true }),
                        teamHuddle: e.target.checked,
                      };
                      const updatedConfig = { ...config, workspaceFeatures: updatedFeatures };
                      setConfig(updatedConfig);
                      handleSave(updatedConfig);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Shared real-time architecture scratchpad with quick templates, Daily Standup feed with teammate reaction emojis and streak integration, plus 1-click audio huddle room with ambient focus drone.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-800 text-[11px]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Scratchpad</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Daily Standup</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Voice Huddle</span>
                </div>
                <span className={`font-mono font-bold ${(config.workspaceFeatures?.teamHuddle ?? true) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {(config.workspaceFeatures?.teamHuddle ?? true) ? '🟢 LIVE ON WORKSPACE' : '⚪ DISABLED (HIDDEN)'}
                </span>
              </div>
            </div>

            {/* Feature 4: The Proof-of-Work Finish Line */}
            <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
              config.workspaceFeatures?.proofOfWork ?? true
                ? 'bg-charcoal-850/90 border-amber-500/40 shadow-sm'
                : 'bg-charcoal-950/60 border-charcoal-800 opacity-70'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    config.workspaceFeatures?.proofOfWork ?? true
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-charcoal-800 text-slate-500'
                  }`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">4. The Proof-of-Work Finish Line</h4>
                    <span className="text-[11px] font-mono text-slate-400">Tab: /workspace/certificate</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.workspaceFeatures?.proofOfWork ?? true}
                    onChange={(e) => {
                      const updatedFeatures = {
                        ...(config.workspaceFeatures || { aiCloserKit: true, liveToolBridge: true, teamHuddle: true, proofOfWork: true }),
                        proofOfWork: e.target.checked,
                      };
                      const updatedConfig = { ...config, workspaceFeatures: updatedFeatures };
                      setConfig(updatedConfig);
                      handleSave(updatedConfig);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Cryptographically verifiable collegiate completion certificate with printable high-resolution PDF view, 1-click recruiter-grade LinkedIn Case Study generator, and GitHub README badge embed.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-charcoal-800 text-[11px]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">Certificate Studio</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">LinkedIn Post</span>
                  <span className="px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300 font-mono">GitHub Badge</span>
                </div>
                <span className={`font-mono font-bold ${(config.workspaceFeatures?.proofOfWork ?? true) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {(config.workspaceFeatures?.proofOfWork ?? true) ? '🟢 LIVE ON WORKSPACE' : '⚪ DISABLED (HIDDEN)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. BROADCAST BANNER SUBTAB */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'banner') && (
        <div id="module-1" className="space-y-6 scroll-mt-24 pt-2">
          {activeSubTab === 'all' && (
            <div className="flex items-center gap-2.5 pb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                MODULE 1 OF 6
              </span>
              <h3 className="text-base font-extrabold text-white">Global Broadcast & Announcement Banner</h3>
            </div>
          )}
          {/* Live Preview Box */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-brand-400" />

                Live Banner Preview (How students see it on the website)
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Status: {config.banner.enabled ? '🟢 Visible' : '⚪ Disabled'}
              </span>
            </div>

            <div
              className={`rounded-xl p-3 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-sm ${
                config.banner.theme === 'gradient'
                  ? 'bg-gradient-to-r from-violet-600 via-brand-600 to-indigo-600 text-white'
                  : config.banner.theme === 'indigo'
                  ? 'bg-indigo-600 text-white'
                  : config.banner.theme === 'emerald'
                  ? 'bg-emerald-600 text-white'
                  : config.banner.theme === 'amber'
                  ? 'bg-amber-500 text-charcoal-950'
                  : 'bg-rose-600 text-white'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 border border-white/30">
                  Announcement
                </span>
                <span>{config.banner.text || 'Write your announcement text below...'}</span>
                {config.banner.linkText && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-brand-700 shadow-sm">
                    {config.banner.linkText}
                  </span>
                )}
              </div>
              {config.banner.dismissible && (
                <span className="text-xs opacity-75">✕</span>
              )}
            </div>
          </div>

          {/* Banner Controls Form */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Global Broadcast Settings</h3>
                <p className="text-xs text-slate-400">Appears at the very top of every page across the platform.</p>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Enable Banner</span>
                <input
                  type="checkbox"
                  checked={config.banner.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      banner: { ...config.banner, enabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-charcoal-800 border-charcoal-700"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Announcement Message
                </label>
                <input
                  type="text"
                  value={config.banner.text}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      banner: { ...config.banner, text: e.target.value },
                    })
                  }
                  placeholder="e.g. 🚀 Spring Collegiate Hackathon is now open for registration!"
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(['gradient', 'indigo', 'emerald', 'amber', 'rose'] as const).map((th) => (
                    <button
                      key={th}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          banner: { ...config.banner, theme: th },
                        })
                      }
                      className={`p-2.5 rounded-xl text-xs font-semibold capitalize border flex items-center justify-center gap-1.5 transition-all ${
                        config.banner.theme === th
                          ? 'border-white text-white ring-2 ring-brand-500/40 bg-charcoal-800'
                          : 'border-charcoal-750 text-slate-400 hover:text-slate-200 bg-charcoal-800/60'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          th === 'gradient'
                            ? 'bg-gradient-to-r from-violet-500 to-indigo-500'
                            : th === 'indigo'
                            ? 'bg-indigo-500'
                            : th === 'emerald'
                            ? 'bg-emerald-500'
                            : th === 'amber'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <span>{th}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Button Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.banner.linkText || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        banner: { ...config.banner, linkText: e.target.value },
                      })
                    }
                    placeholder="e.g. Register Now →"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Button URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.banner.linkUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        banner: { ...config.banner, linkUrl: e.target.value },
                      })
                    }
                    placeholder="e.g. /hackathons or /explore"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Dismissible Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.banner.dismissible}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        banner: { ...config.banner, dismissible: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-charcoal-800 border-charcoal-700"
                  />
                  <span className="text-xs text-slate-300">
                    Allow students to dismiss banner during their browsing session (reappears on new text update)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. HOMEPAGE SECTIONS SUBTAB */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'sections') && (
        <div id="module-2" className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6 scroll-mt-24">
          <div className="border-b border-charcoal-800 pb-4">
            {activeSubTab === 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-2">
                MODULE 2 OF 6
              </span>
            )}
            <h3 className="text-base font-extrabold text-white">Homepage Layout & Copy Switcher</h3>
            <p className="text-xs text-slate-400">
              Toggle visibility of main homepage components and edit section headlines directly without editing code.
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Section Toggles */}
            <div className="space-y-3 bg-charcoal-850 p-4 rounded-xl border border-charcoal-750">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-750 pb-2.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Section Visibility (16 Website Elements)
                  </h4>
                  <p className="text-[11px] text-slate-400">Turn any individual component live or off instantly.</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setConfig({
                        ...config,
                        sections: {
                          ...config.sections,
                          campusTicker: true,
                          hero: true,
                          heroSearch: true,
                          origamiBird: true,
                          collegiateRadar: true,
                          domainGrid: true,
                          categoryRails: true,
                          customSection: true,
                          intent: true,
                          workflow: true,
                          campusPulse: true,
                          showcase: true,
                          colleges: true,
                          badges: true,
                          hackathons: true,
                          ctaBanner: true,
                        },
                      });
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                  >
                    All ON (16)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfig({
                        ...config,
                        sections: {
                          ...config.sections,
                          campusTicker: false,
                          hero: true,
                          heroSearch: false,
                          origamiBird: false,
                          collegiateRadar: false,
                          domainGrid: false,
                          categoryRails: false,
                          customSection: false,
                          intent: false,
                          workflow: false,
                          campusPulse: false,
                          showcase: false,
                          colleges: false,
                          badges: false,
                          hackathons: false,
                          ctaBanner: false,
                        },
                      });
                    }}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-charcoal-750 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Hero Only
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-none">
                {[
                  { key: 'campusTicker' as const, label: '1. Top Live Opportunity Ticker', tag: 'Ticker', desc: 'Floating collegiate updates strip at very top' },
                  { key: 'hero' as const, label: '2. Hero Header & Call to Action Stage', tag: 'Hero', desc: 'Main collegiate headline, subtitle & CTA buttons' },
                  { key: 'heroSearch' as const, label: '3. Unstop Opportunity Search Console', tag: 'Search', desc: 'Category filter bar & trending tags (SIH, Google)' },
                  { key: 'origamiBird' as const, label: '4. 3D Interactive Origami Bird Sculpture', tag: '3D Art', desc: 'Signature geometric bird in hero right column' },
                  { key: 'collegiateRadar' as const, label: '5. Collegiate Innovation Hubs (Portals Radar)', tag: 'Radar', desc: '3-card radar: College Hackathons, Faculty Briefs & Educator Desk' },
                  { key: 'domainGrid' as const, label: '6. 5-Domain Vibrant Explorer Cards', tag: 'Domains', desc: 'Unstop-style pastel cards: Hackathons, Squads, etc.' },
                  { key: 'categoryRails' as const, label: '7. Opportunity Category Quick-Rails', tag: 'Nav Rail', desc: 'Horizontal quick-jump category navigation chips' },
                  { key: 'customSection' as const, label: '8. Custom Website Spotlight / Announcement', tag: 'Spotlight', desc: 'Admin custom headline, banner, and CTA buttons' },
                  { key: 'intent' as const, label: '9. Intent Intelligence Console', tag: 'AI Intent', desc: '"Find me a project..." natural-language matcher' },
                  { key: 'workflow' as const, label: '10. 4-Stage Collegiate Architecture', tag: 'Workflow', desc: 'Match, Squad Up, Build, Prove & Win stages' },
                  { key: 'campusPulse' as const, label: '11. Campus Innovation Hub', tag: 'Campus Hub', desc: 'Leaderboard, AI Smart Matchmaker, Live Presence' },
                  { key: 'showcase' as const, label: '12. Opportunities Showcase (3-Tab Grid)', tag: 'Showcase', desc: 'Collegiate Projects, Hackathons, Problem Statements' },
                  { key: 'colleges' as const, label: '13. Verified Campus Partner Universities', tag: 'Partners', desc: 'Participating college network grid' },
                  { key: 'badges' as const, label: '14. Collegiate Honors & Hall of Fame', tag: 'Honors', desc: 'Verified student badges and award citations' },
                  { key: 'hackathons' as const, label: '15. Live Campus Hackathons Strip', tag: 'Contests', desc: 'Department competition passcode and portals' },
                  { key: 'ctaBanner' as const, label: '16. Bottom Join Linkora Free Banner', tag: 'Closing', desc: 'Closing call to action for students and faculty' },
                ].map(({ key, label, tag, desc }) => (
                  <label
                    key={key}
                    className="flex items-start justify-between p-2.5 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 hover:border-charcoal-600 cursor-pointer transition-colors"
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-200">{label}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-charcoal-700 text-slate-300">
                          {tag}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${config.sections[key] !== false ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {config.sections[key] !== false ? '🟢 Live' : '⚪ Off'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.sections[key] !== false}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sections: { ...config.sections, [key]: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-charcoal-900 border-charcoal-700 shrink-0 mt-0.5"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Headlines */}
            <div className="space-y-4 bg-charcoal-850 p-4 rounded-xl border border-charcoal-750">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Dynamic Section Titles & Copy
              </h4>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  5-Domain Explorer Cards Title (Unstop Grid)
                </label>
                <input
                  type="text"
                  value={config.sections.domainGridTitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, domainGridTitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  placeholder="e.g. What do you want to achieve today?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  5-Domain Explorer Cards Subtitle
                </label>
                <textarea
                  rows={2}
                  value={config.sections.domainGridSubtitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, domainGridSubtitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  placeholder="Subtitle for 5 domain explorer cards..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workflow Section Title
                </label>
                <input
                  type="text"
                  value={config.sections.workflowTitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, workflowTitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  placeholder="e.g. Workflow"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Workflow Subtitle
                </label>
                <textarea
                  rows={2}
                  value={config.sections.workflowSubtitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, workflowSubtitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  placeholder="Subtitle explaining collegiate phases..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Showcase Section Title
                </label>
                <input
                  type="text"
                  value={config.sections.showcaseTitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, showcaseTitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  placeholder="e.g. Showcase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Showcase Subtitle
                </label>
                <textarea
                  rows={2}
                  value={config.sections.showcaseSubtitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, showcaseSubtitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  placeholder="Subtitle describing recruiting projects..."
                />
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* LINKORA CAMPUS INNOVATION HUB (UNIFIED SECTION - FEATURES 1, 2, 3) */}
          {/* =============================================================== */}
          <div className="bg-charcoal-850 border border-emerald-500/40 rounded-xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-750 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Campus Innovation Hub (Unified Next-Gen Section)</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Combines Features 1, 2, and 3 into one consolidated section on the homepage without crowding or cluttering.
                </p>
              </div>

              {/* Master Hub Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer bg-charcoal-900 border border-charcoal-700 px-3 py-2 rounded-xl">
                <span className="text-xs font-semibold text-slate-200">Show Hub on Homepage</span>
                <input
                  type="checkbox"
                  checked={config.sections.campusPulse !== false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, campusPulse: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-charcoal-800 border-charcoal-700"
                />
              </label>
            </div>

            {/* Sub-Feature Controls: 1, 2, and 3 Individual Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Individual Feature Live Controls:</span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Controls what is live for normal users
                </span>
              </div>

              {/* Feature 1 */}
              <label className="flex items-start justify-between p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 cursor-pointer transition">
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Feature 1: Inter-College Leaderboard & Viral Showcase</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${config.sections.pulseLeaderboard !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-charcoal-700 text-slate-400'}`}>
                      {config.sections.pulseLeaderboard !== false ? '🟢 Live for users' : '⚪ Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Live rankings of universities, project count, hackathon medals, and viral student proof-of-work cards.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.sections.pulseLeaderboard !== false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, pulseLeaderboard: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-charcoal-900 border-charcoal-700 mt-1"
                />
              </label>

              {/* Feature 2 */}
              <label className="flex items-start justify-between p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 cursor-pointer transition">
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Feature 2: AI Dream Team Smart Matchmaker</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${config.sections.pulseAiMatchmaker !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-charcoal-700 text-slate-400'}`}>
                      {config.sections.pulseAiMatchmaker !== false ? '🟢 Live for users' : '⚪ Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Intelligent squad assembler: students describe project scope and get top 3 verified teammate matches.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.sections.pulseAiMatchmaker !== false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, pulseAiMatchmaker: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-charcoal-900 border-charcoal-700 mt-1"
                />
              </label>

              {/* Feature 3 */}
              <label className="flex items-start justify-between p-3.5 rounded-xl bg-charcoal-800 border border-charcoal-700 hover:border-charcoal-600 cursor-pointer transition">
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Feature 3: Live Campus Activity & Real-Time Presence</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${config.sections.pulseLivePresence !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-charcoal-700 text-slate-400'}`}>
                      {config.sections.pulseLivePresence !== false ? '🟢 Live for users' : '⚪ Hidden'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Real-time activity ticker, active online builder count (140+), broadcast availability, and sprint rooms.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.sections.pulseLivePresence !== false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, pulseLivePresence: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-charcoal-900 border-charcoal-700 mt-1"
                />
              </label>
            </div>

            {/* Live Status Summary Pill */}
            <div className="p-3 rounded-xl bg-charcoal-900/90 border border-charcoal-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-300 font-medium">
                Live Status for Normal Users:
              </span>
              <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
                <span className={`px-2 py-0.5 rounded-md ${config.sections.pulseLeaderboard !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-charcoal-800 text-slate-500 line-through'}`}>
                  1. Leaderboard {config.sections.pulseLeaderboard !== false ? '✓' : '✕'}
                </span>
                <span className={`px-2 py-0.5 rounded-md ${config.sections.pulseAiMatchmaker !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-charcoal-800 text-slate-500 line-through'}`}>
                  2. AI Matchmaker {config.sections.pulseAiMatchmaker !== false ? '✓' : '✕'}
                </span>
                <span className={`px-2 py-0.5 rounded-md ${config.sections.pulseLivePresence !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  3. Live Presence {config.sections.pulseLivePresence !== false ? '✓' : '✕ Hidden'}
                </span>
              </div>
            </div>

            {/* Dynamic Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hub Section Title</label>
                <input
                  type="text"
                  value={config.sections.pulseTitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, pulseTitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Campus Innovation Hub"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hub Subtitle</label>
                <input
                  type="text"
                  value={config.sections.pulseSubtitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      sections: { ...config.sections, pulseSubtitle: e.target.value },
                    })
                  }
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g. Live collegiate rankings, AI dream team matchmaking..."
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 🌟 CUSTOM WEBSITE SPOTLIGHT & ANNOUNCEMENT BUILDER */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'custom') && (
        <div id="module-custom" className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ADMIN SUPERPOWERS • SPOTLIGHT BUILDER
                </span>
                <span className={`text-xs font-mono font-bold ${(config.customSection?.enabled || config.sections.customSection) ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {(config.customSection?.enabled || config.sections.customSection) ? '🟢 LIVE ON HOMEPAGE' : '⚪ CURRENTLY HIDDEN'}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Add Whatever You Want (Custom Website Spotlight Builder)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Design custom announcements, hackathon registration spotlights, or special banners anywhere on the website without writing code.
              </p>
            </div>

            {/* Master Switch */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer bg-charcoal-850 border border-charcoal-700 hover:border-charcoal-600 px-4 py-2 rounded-xl transition-colors">
                <span className="text-xs font-bold text-slate-200">
                  {(config.customSection?.enabled || config.sections.customSection) ? 'Section is LIVE' : 'Section is Hidden'}
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(config.customSection?.enabled || config.sections.customSection)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const updated = {
                      ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                      enabled: isChecked,
                    };
                    setConfig({
                      ...config,
                      customSection: updated,
                      sections: {
                        ...config.sections,
                        customSection: isChecked,
                      },
                    });
                  }}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 bg-charcoal-900 border-charcoal-700"
                />
              </label>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2 bg-charcoal-850 p-4 rounded-xl border border-charcoal-750">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1-Click Starter Presets
              </span>
              <span className="text-[11px] text-slate-400">Click to instantly populate with tested layout</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SPOTLIGHT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                      badge: preset.badge,
                      title: preset.title,
                      subtitle: preset.subtitle,
                      content: preset.content,
                      primaryButtonText: preset.primaryButtonText,
                      primaryButtonUrl: preset.primaryButtonUrl,
                      secondaryButtonText: preset.secondaryButtonText,
                      secondaryButtonUrl: preset.secondaryButtonUrl,
                      theme: preset.theme,
                      position: preset.position,
                      bannerImageUrl: preset.bannerImageUrl,
                      enabled: true,
                    };
                    setConfig({
                      ...config,
                      customSection: updated,
                      sections: {
                        ...config.sections,
                        customSection: true,
                      },
                    });
                  }}
                  className="text-left p-3 rounded-lg bg-charcoal-800 border border-charcoal-700 hover:border-amber-500/50 hover:bg-charcoal-750 transition-all text-xs font-medium text-slate-200"
                >
                  <div className="font-bold text-white mb-0.5">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor Form & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Position and Theme Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Homepage Placement
                  </label>
                  <select
                    value={config.customSection?.position || 'above_showcase'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          position: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-brand-500"
                  >
                    <option value="below_hero">Below Hero & Domain Cards (Top Priority)</option>
                    <option value="above_showcase">Middle Stage (Above Opportunities Showcase)</option>
                    <option value="above_footer">Bottom Stage (Above Join Linkora Footer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Visual Color Theme
                  </label>
                  <select
                    value={config.customSection?.theme || 'gradient_violet'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          theme: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-brand-500"
                  >
                    <option value="gradient_violet">Violet Nebula (Indigo & Purple)</option>
                    <option value="gradient_blue">Cyan Cyber (Blue & Cyan)</option>
                    <option value="gradient_emerald">Emerald Mint (Green & Teal)</option>
                    <option value="gradient_amber">Amber Sunburst (Orange & Amber)</option>
                    <option value="slate_dark">Midnight Onyx (Dark Slate)</option>
                    <option value="clean_white">Minimalist Porcelain (Crisp White)</option>
                  </select>
                </div>
              </div>

              {/* Badge & Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Top Pill Badge
                  </label>
                  <input
                    type="text"
                    value={config.customSection?.badge || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          badge: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 🌟 SPECIAL ANNOUNCEMENT"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Main Headline / Title *
                  </label>
                  <input
                    type="text"
                    value={config.customSection?.title || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          title: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Grand Collegiate Winter Hackathon 2026"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500 font-bold"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Supporting Subtitle
                </label>
                <input
                  type="text"
                  value={config.customSection?.subtitle || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customSection: {
                        ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                        subtitle: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Over ₹5,00,000 in bounties, cloud grants, and direct interview fast-tracks."
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              {/* Detailed Content / Markdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Content / Body Description
                </label>
                <textarea
                  rows={3}
                  value={config.customSection?.content || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customSection: {
                        ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                        content: e.target.value,
                      },
                    })
                  }
                  placeholder="Detailed announcement, instructions, eligibility criteria, or registration details..."
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              {/* Buttons Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-charcoal-850 p-3.5 rounded-xl border border-charcoal-750">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Primary Button (Action 1)
                  </span>
                  <input
                    type="text"
                    value={config.customSection?.primaryButtonText || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          primaryButtonText: e.target.value,
                        },
                      })
                    }
                    placeholder="Button Text (e.g. Register Your Squad →)"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={config.customSection?.primaryButtonUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          primaryButtonUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="Link URL (e.g. /hackathons or https://...)"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Secondary Button (Action 2 - Optional)
                  </span>
                  <input
                    type="text"
                    value={config.customSection?.secondaryButtonText || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          secondaryButtonText: e.target.value,
                        },
                      })
                    }
                    placeholder="Button Text (e.g. Find Teammates)"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={config.customSection?.secondaryButtonUrl || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        customSection: {
                          ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                          secondaryButtonUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="Link URL (e.g. /teammates)"
                    className="w-full bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Optional Banner Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Right-Side Banner Image URL
                </label>
                <input
                  type="text"
                  value={config.customSection?.bannerImageUrl || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      customSection: {
                        ...(config.customSection || DEFAULT_MASTER_CONTROL_CONFIG.customSection!),
                        bannerImageUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="https://images.unsplash.com/... or direct image link (leave blank for full-width layout)"
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Right Column: Live Interactive Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-Time Visitor Preview</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Position: {config.customSection?.position || 'above_showcase'}
                </span>
              </div>

              {/* Preview Card */}
              <div className={`p-5 rounded-2xl border transition-all shadow-lg space-y-3 relative overflow-hidden ${
                config.customSection?.theme === 'gradient_blue'
                  ? 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 text-white border-blue-500/40'
                  : config.customSection?.theme === 'gradient_emerald'
                  ? 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white border-emerald-500/40'
                  : config.customSection?.theme === 'gradient_amber'
                  ? 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 text-white border-amber-500/40'
                  : config.customSection?.theme === 'clean_white'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-xl'
                  : config.customSection?.theme === 'slate_dark'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950 text-white border-violet-500/40'
              }`}>
                {/* Badge */}
                {config.customSection?.badge && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 border border-white/20">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{config.customSection.badge}</span>
                  </div>
                )}

                <h4 className="text-base font-extrabold leading-snug">
                  {config.customSection?.title || 'Your Custom Headline Here'}
                </h4>

                {config.customSection?.subtitle && (
                  <p className="text-xs opacity-90 leading-relaxed font-medium">
                    {config.customSection.subtitle}
                  </p>
                )}

                {config.customSection?.content && (
                  <p className="text-[11px] opacity-75 leading-relaxed line-clamp-3">
                    {config.customSection.content}
                  </p>
                )}

                {/* Banner Image Preview */}
                {config.customSection?.bannerImageUrl && (
                  <div className="rounded-lg overflow-hidden max-h-32 border border-white/20">
                    <img
                      src={config.customSection.bannerImageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Buttons Preview */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {config.customSection?.primaryButtonText && (
                    <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm inline-flex items-center gap-1">
                      <span>{config.customSection.primaryButtonText}</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                  {config.customSection?.secondaryButtonText && (
                    <span className="px-3 py-1.5 rounded-xl border border-white/30 text-xs font-bold">
                      {config.customSection.secondaryButtonText}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Publish Button */}
              <div className="pt-2">
                <Button
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  size="sm"
                  variant="primary"
                  className="w-full font-bold"
                  leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {isSaving ? 'Publishing Changes...' : 'Save & Publish Spotlight Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. COLLEGE WHITELIST SUBTAB */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'colleges') && (
        <div id="module-3" className="space-y-6 scroll-mt-24">
          {activeSubTab === 'all' && (
            <div className="flex items-center gap-2.5 pb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                MODULE 3 OF 6
              </span>
              <h3 className="text-base font-extrabold text-white">Campus & College Whitelist Manager</h3>
            </div>
          )}
          {/* Add College Form */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-4">
            {/* Quick Link to Student ID Verifications */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Student ID Verification Queue</h4>
                  <p className="text-xs text-slate-300">
                    Review, inspect, approve, or reject ID card photographs uploaded by students to lock their collegiate identity.
                  </p>
                </div>
              </div>
              <a
                href="/control-center-7x9?tab=id_verifications"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-colors shrink-0"
              >
                <span>Open ID Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-400" />
                Add Partner University / College Email Domain
              </h3>
              <p className="text-xs text-slate-400">
                Students signing up with matching `@domain.edu` or `@college.ac.in` automatically receive collegiate verification.
              </p>
            </div>


            <form onSubmit={handleAddCollege} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">College Name</label>
                <input
                  type="text"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  placeholder="e.g. IIT Delhi"
                  required
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Domain (no @)</label>
                <input
                  type="text"
                  value={newCollegeDomain}
                  onChange={(e) => setNewCollegeDomain(e.target.value)}
                  placeholder="e.g. iitd.ac.in"
                  required
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City / Campus</label>
                <input
                  type="text"
                  value={newCollegeCity}
                  onChange={(e) => setNewCollegeCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" size="sm" variant="primary" className="w-full" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                  Add Whitelist
                </Button>
              </div>
            </form>

            {/* Quick Domain Verification Tester */}
            <div className="pt-3 border-t border-charcoal-800/80 flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 shrink-0">Test Domain:</span>
              <input
                type="text"
                value={domainTestInput}
                onChange={(e) => setDomainTestInput(e.target.value)}
                placeholder="Type email (e.g. student@iitb.ac.in)..."
                className="bg-charcoal-800 border border-charcoal-700 rounded-lg px-2.5 py-1 text-xs text-white w-64 focus:outline-none"
              />
              {domainTestInput && (
                <div className="text-xs flex items-center gap-1 font-semibold">
                  {config.colleges.some((c) =>
                    domainTestInput.toLowerCase().endsWith(`@${c.domain.toLowerCase()}`) ||
                    domainTestInput.toLowerCase().includes(c.domain.toLowerCase())
                  ) ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Whitelisted Partner Campus!
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Not yet whitelisted
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* List of Partner Colleges */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Active Partner Universities ({config.colleges.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.colleges.map((col) => (
                <div
                  key={col.id}
                  className="bg-charcoal-850 border border-charcoal-750 rounded-xl p-4 flex items-start justify-between gap-3 hover:border-charcoal-600 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{col.name}</h4>
                    <p className="text-[11px] font-mono text-brand-400 font-semibold">
                      @{col.domain}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {col.city} • Partner since {col.partnerSince}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveCollege(col.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove college"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. STUDENT HALL OF FAME & BADGES SUBTAB */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'badges') && (
        <div id="module-4" className="space-y-6 scroll-mt-24">
          {activeSubTab === 'all' && (
            <div className="flex items-center gap-2.5 pb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                MODULE 4 OF 6
              </span>
              <h3 className="text-base font-extrabold text-white">Student "Hall of Fame" & Honors Badges</h3>
            </div>
          )}
          {/* Award Badge Form */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Award Student "Hall of Fame" Badge
              </h3>
              <p className="text-xs text-slate-400">
                Bestow verified collegiate accolades that appear with custom glowing frames on student profiles & team cards.
              </p>
            </div>


            <form onSubmit={handleAwardBadge} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Username / ID
                </label>
                <input
                  type="text"
                  value={newBadgeUser}
                  onChange={(e) => setNewBadgeUser(e.target.value)}
                  placeholder="e.g. mayank142"
                  required
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Badge Type</label>
                <select
                  value={newBadgeType}
                  onChange={(e) => {
                    const t = e.target.value as StudentBadgeAward['badgeType'];
                    setNewBadgeType(t);
                    if (t === 'innovator') setNewBadgeTitle('⚡ Campus Innovator');
                    if (t === 'hackathon_champ') setNewBadgeTitle('🚀 Hackathon Champion');
                    if (t === 'faculty_endorsed') setNewBadgeTitle('🎓 Faculty Endorsed');
                    if (t === 'lead_builder') setNewBadgeTitle('💎 Lead Project Architect');
                    if (t === 'ambassador') setNewBadgeTitle('🌐 College Ambassador');
                  }}
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-brand-500"
                >
                  <option value="innovator">Campus Innovator</option>
                  <option value="hackathon_champ">Hackathon Champion</option>
                  <option value="faculty_endorsed">Faculty Endorsed</option>
                  <option value="lead_builder">Lead Project Architect</option>
                  <option value="ambassador">College Ambassador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Badge Title</label>
                <input
                  type="text"
                  value={newBadgeTitle}
                  onChange={(e) => setNewBadgeTitle(e.target.value)}
                  placeholder="e.g. 🌟 Hackathon Champion"
                  required
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" size="sm" variant="primary" className="w-full" leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300" />}>
                  Award Badge
                </Button>
              </div>
            </form>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Citation / Reason for Award
              </label>
              <input
                type="text"
                value={newBadgeReason}
                onChange={(e) => setNewBadgeReason(e.target.value)}
                placeholder="e.g. Winner of Smart India Hackathon 2026 or Built core platform infrastructure"
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Awarded Badges List */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Awarded Hall of Fame Honors ({config.badges.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.badges.map((b) => (
                <div
                  key={b.id}
                  className="bg-charcoal-850 border border-amber-500/20 rounded-xl p-4 flex items-start justify-between gap-3 shadow-subtle hover:border-amber-500/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                        {b.badgeTitle}
                      </span>
                      <span className="text-xs font-mono text-slate-300">@{b.username}</span>
                    </div>
                    <p className="text-xs text-slate-400">{b.reason}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Awarded {new Date(b.awardedAt).toLocaleDateString()} by {b.awardedBy}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevokeBadge(b.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Revoke honor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. EXECUTIVE CEO ANALYTICS & CSV EXPORTER */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'ceo') && (
        <div id="module-5" className="space-y-6 scroll-mt-24">
          {activeSubTab === 'all' && (
            <div className="flex items-center gap-2.5 pb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                MODULE 5 OF 6
              </span>
              <h3 className="text-base font-extrabold text-white">Executive CEO Analytics & CSV Report Exporter</h3>
            </div>
          )}
          {/* Executive Header & Export Action */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Executive Dean & CEO Report Generator
              </h3>
              <p className="text-xs text-slate-400">
                Aggregate metrics on collegiate collaboration, student participation, and engineering skill demand.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyMarkdownReport}
                leftIcon={copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedReport ? 'Copied Markdown!' : 'Copy Pitch Markdown'}
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleDownloadCsv}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download CSV Report
              </Button>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Registered Students', val: ceoStats?.totalUsers || 142, icon: '👨‍🎓' },
              { label: 'Live Student Projects', val: ceoStats?.totalProjects || 38, icon: '🚀' },
              { label: 'Teammate Applications', val: ceoStats?.totalApplications || 96, icon: '🤝' },
              { label: 'Active Hackathons', val: ceoStats?.activeHackathons || 5, icon: '🏆' },
            ].map((st, i) => (
              <div key={i} className="bg-charcoal-900 border border-charcoal-800 rounded-xl p-4 space-y-1 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">{st.label}</span>
                  <span className="text-base">{st.icon}</span>
                </div>
                <div className="text-2xl font-black text-white">{st.val}</div>
              </div>
            ))}
          </div>

          {/* Skill Demand Ranking */}
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Student Technical Skill Demand (Across Campus Projects)
            </h4>

            <div className="space-y-3">
              {(ceoStats?.skillDemand || []).map((sk: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white font-semibold">{sk.skill}</span>
                    <span className="text-slate-400 font-mono">
                      {sk.count} projects ({sk.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-charcoal-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${sk.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. SITE MAINTENANCE / PRIVATE CAMPUS ACCESS SUBTAB */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'maintenance') && (
        <div id="module-6" className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6 scroll-mt-24">
          <div className="border-b border-charcoal-800 pb-4">
            {activeSubTab === 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block mb-2">
                MODULE 6 OF 6
              </span>
            )}
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Site Access & Maintenance Mode Controls
            </h3>
            <p className="text-xs text-slate-400">
              Control public access, restrict platform to passcode-verified campus students, or switch to scheduled maintenance.
            </p>
          </div>


          {/* Access Mode Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Operating Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: 'public' as const,
                  title: '🟢 Public Production',
                  desc: 'All pages accessible worldwide. Standard college collaboration mode.',
                },
                {
                  id: 'campus_only' as const,
                  title: '🟡 Campus-Only Preview',
                  desc: 'Platform requires college passcode to access. Ideal for private campus pilot.',
                },
                {
                  id: 'maintenance' as const,
                  title: '🔴 Scheduled Maintenance',
                  desc: 'Displays maintenance countdown screen. Non-admins cannot access regular pages.',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...config,
                      maintenance: { ...config.maintenance, mode: m.id },
                    };
                    setConfig(updated);
                    handleSave(updated);
                  }}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    config.maintenance.mode === m.id
                      ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                      : 'border-charcoal-750 bg-charcoal-850 hover:border-charcoal-700'
                  }`}
                >
                  <h4 className="text-xs font-bold text-white mb-1">{m.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Gating Details Form */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Campus Bypass Passcode
              </label>
              <input
                type="text"
                value={config.maintenance.campusPasscode || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maintenance: { ...config.maintenance, campusPasscode: e.target.value },
                  })
                }
                placeholder="e.g. CAMPUS2026"
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Faculty and invited students can enter this passcode to bypass the gate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Maintenance Headline
                </label>
                <input
                  type="text"
                  value={config.maintenance.maintenanceHeadline || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maintenance: { ...config.maintenance, maintenanceHeadline: e.target.value },
                    })
                  }
                  placeholder="e.g. Scheduled Campus Upgrade in Progress"
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expected Return Duration
                </label>
                <input
                  type="text"
                  value={config.maintenance.expectedBackAt || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maintenance: { ...config.maintenance, expectedBackAt: e.target.value },
                    })
                  }
                  placeholder="e.g. 30 minutes or 2:00 PM IST"
                  className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Detailed Message to Visitors
              </label>
              <textarea
                rows={3}
                value={config.maintenance.maintenanceMessage || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maintenance: { ...config.maintenance, maintenanceMessage: e.target.value },
                  })
                }
                placeholder="e.g. We are upgrading team matching servers..."
                className="w-full bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:ring-brand-500"
              />
            </div>

            {/* Live Mode Status & Instant Apply Action */}
            <div className="pt-4 border-t border-charcoal-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-charcoal-850/80 p-4 rounded-xl border border-charcoal-750">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Selected Access State:</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      config.maintenance.mode === 'public'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : config.maintenance.mode === 'campus_only'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {config.maintenance.mode === 'public'
                      ? '🟢 100% Public Access'
                      : config.maintenance.mode === 'campus_only'
                      ? '🟡 Campus Passcode Gate'
                      : '🔴 Scheduled Maintenance Lock'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {config.maintenance.mode === 'public'
                    ? 'Anyone on the internet can browse and sign in normally.'
                    : 'Visitors without passcode see the lock screen. You (platform owner) retain seamless bypass.'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href="/?preview_maintenance=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-medium rounded-xl border border-charcoal-700 transition flex items-center gap-1.5 shadow-sm"
                  title="Test what regular non-admin visitors see"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview Visitor Gate</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>⚡ Apply Access Mode Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. RESTRICTED MODE & CONTENT SAFETY SUBTAB */}
      {/* ==================================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'restricted') && (
        <div id="module-restricted" className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6 scroll-mt-24">
          <div className="border-b border-charcoal-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {activeSubTab === 'all' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40 inline-block mb-2">
                  MODULE 7 OF 7
                </span>
              )}
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Restricted Mode & Prohibited Words Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Universal content safety blocker. Automatically intercepts profanities, scams, academic leaks, and illicit terms across all inputs, forms, and pages.
              </p>
            </div>

            {onNavigateTab && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('restricted')}
                className="text-xs shrink-0"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Open Full Dedicated Tab
              </Button>
            )}
          </div>

          {/* Embedded Full Restricted Words Manager */}
          <AdminRestrictedWordsTab authToken={authToken} />
        </div>
      )}
    </div>
  );
}
