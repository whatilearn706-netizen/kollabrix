'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Compass,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RotateCcw,
  Eye,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Briefcase,
  AlertCircle,
  X,
  CheckCircle2,
  Layers,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  HomepageIntentConfig,
  HomepageShowcaseConfig,
  IntentCandidate,
  IntentProjectSlot,
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
} from '@/types/homepageConfig';
import { Project } from '@/types/database';
import { DEMO_PROJECTS } from '@/data/mockProjects';

interface AdminIntentShowcaseTabProps {
  authToken?: string;
}

export function AdminIntentShowcaseTab({ authToken }: AdminIntentShowcaseTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'intent' | 'showcase'>('intent');
  const [activeIntentMode, setActiveIntentMode] = useState<'recruit' | 'join'>('recruit');

  // Intent State
  const [intentConfig, setIntentConfig] = useState<HomepageIntentConfig>(DEFAULT_HOMEPAGE_INTENT_CONFIG);

  // Showcase State
  const [showcaseConfig, setShowcaseConfig] = useState<HomepageShowcaseConfig>(DEFAULT_HOMEPAGE_SHOWCASE_CONFIG);
  const [allProjects, setAllProjects] = useState<any[]>(DEMO_PROJECTS);

  // Status & loading
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candForm, setCandForm] = useState<Omit<IntentCandidate, 'id'>>({
    name: '',
    role: '',
    type: 'ai',
    college: '',
    skills: [],
    matchScore: 95,
    avatar: '',
  });
  const [skillsInput, setSkillsInput] = useState('');

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState<Omit<IntentProjectSlot, 'id'>>({
    title: '',
    category: 'AI / Healthcare',
    owner: '',
    neededRole: '',
    teamStatus: '2 of 4 Filled',
    tech: [],
  });
  const [techInput, setTechInput] = useState('');

  // Load config on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const res = await fetch('/api/admin/homepage-config', { headers });
        const data = await res.json();

        if (res.ok) {
          if (data.intentConfig) setIntentConfig(data.intentConfig);
          if (data.showcaseConfig) setShowcaseConfig(data.showcaseConfig);
          if (data.allProjects && Array.isArray(data.allProjects) && data.allProjects.length > 0) {
            setAllProjects(data.allProjects);
          }
        }
      } catch (err) {
        console.warn('Error loading admin homepage config:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [authToken]);

  // Save all settings
  const handleSaveAll = async (
    customIntent?: HomepageIntentConfig,
    customShowcase?: HomepageShowcaseConfig
  ) => {
    setIsSaving(true);
    setFeedback(null);
    const iCfg = customIntent || intentConfig;
    const sCfg = customShowcase || showcaseConfig;

    try {
      // 1. Save to local storage for instant browser updates
      try {
        localStorage.setItem('linkora_intent_config_v1', JSON.stringify(iCfg));
        localStorage.setItem('linkora_showcase_config_v1', JSON.stringify(sCfg));
      } catch {}

      // 2. Persist to API
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/homepage-config', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          intentConfig: iCfg,
          showcaseConfig: sCfg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration');

      setFeedback({ type: 'success', message: 'Settings saved live! Changes are now visible on the homepage.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Could not save to server. Local storage was updated.' });
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // CANDIDATE HANDLERS (MODE 1: I HAVE AN IDEA & NEED TEAMMATES)
  // =========================================================================
  const handleOpenAddCandidate = () => {
    setEditingCandidateId(null);
    setCandForm({
      name: '',
      role: '',
      type: 'ai',
      college: '',
      skills: ['React', 'FastAPI'],
      matchScore: 95,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });
    setSkillsInput('React, FastAPI');
    setIsCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (cand: IntentCandidate) => {
    setEditingCandidateId(cand.id);
    setCandForm({
      name: cand.name,
      role: cand.role,
      type: cand.type,
      college: cand.college,
      skills: cand.skills || [],
      matchScore: cand.matchScore,
      avatar: cand.avatar,
    });
    setSkillsInput((cand.skills || []).join(', '));
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candForm.name.trim()) return;

    const skillsArr = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedCandidates: IntentCandidate[] = [];
    if (editingCandidateId) {
      updatedCandidates = intentConfig.candidates.map((c) =>
        c.id === editingCandidateId
          ? { ...c, ...candForm, skills: skillsArr }
          : c
      );
    } else {
      const newCand: IntentCandidate = {
        id: `cand-${Date.now()}`,
        ...candForm,
        skills: skillsArr,
      };
      updatedCandidates = [...intentConfig.candidates, newCand];
    }

    const updatedConfig = { ...intentConfig, candidates: updatedCandidates };
    setIntentConfig(updatedConfig);
    setIsCandidateModalOpen(false);
    handleSaveAll(updatedConfig);
  };

  const handleDeleteCandidate = (id: string) => {
    const updated = {
      ...intentConfig,
      candidates: intentConfig.candidates.filter((c) => c.id !== id),
    };
    setIntentConfig(updated);
    handleSaveAll(updated);
  };

  // =========================================================================
  // PROJECT SLOT HANDLERS (MODE 2: I HAVE A SKILL & WANT TO JOIN)
  // =========================================================================
  const handleOpenAddSlot = () => {
    setEditingSlotId(null);
    setSlotForm({
      title: '',
      category: 'AI / Healthcare',
      owner: '',
      neededRole: '',
      teamStatus: '2 of 4 Filled',
      tech: ['Next.js', 'FastAPI'],
    });
    setTechInput('Next.js, FastAPI');
    setIsSlotModalOpen(true);
  };

  const handleOpenEditSlot = (slot: IntentProjectSlot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      title: slot.title,
      category: slot.category,
      owner: slot.owner,
      neededRole: slot.neededRole,
      teamStatus: slot.teamStatus,
      tech: slot.tech || [],
    });
    setTechInput((slot.tech || []).join(', '));
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.title.trim()) return;

    const techArr = techInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedSlots: IntentProjectSlot[] = [];
    if (editingSlotId) {
      updatedSlots = intentConfig.projectSlots.map((s) =>
        s.id === editingSlotId
          ? { ...s, ...slotForm, tech: techArr }
          : s
      );
    } else {
      const newSlot: IntentProjectSlot = {
        id: `slot-${Date.now()}`,
        ...slotForm,
        tech: techArr,
      };
      updatedSlots = [...intentConfig.projectSlots, newSlot];
    }

    const updatedConfig = { ...intentConfig, projectSlots: updatedSlots };
    setIntentConfig(updatedConfig);
    setIsSlotModalOpen(false);
    handleSaveAll(updatedConfig);
  };

  const handleDeleteSlot = (id: string) => {
    const updated = {
      ...intentConfig,
      projectSlots: intentConfig.projectSlots.filter((s) => s.id !== id),
    };
    setIntentConfig(updated);
    handleSaveAll(updated);
  };

  // =========================================================================
  // SHOWCASE PROJECTS HANDLERS ("IT'S ON ME WHICH PROJECT I WANT SHOW")
  // =========================================================================
  const handleToggleShowcaseProject = (projectId: string) => {
    const isSelected = showcaseConfig.selectedProjectIds.includes(projectId);
    let updatedIds: string[] = [];

    if (isSelected) {
      updatedIds = showcaseConfig.selectedProjectIds.filter((id) => id !== projectId);
    } else {
      updatedIds = [...showcaseConfig.selectedProjectIds, projectId];
    }

    const updated = {
      ...showcaseConfig,
      mode: 'curated' as const,
      selectedProjectIds: updatedIds,
    };
    setShowcaseConfig(updated);
    handleSaveAll(undefined, updated);
  };

  const handleMoveShowcaseProject = (index: number, direction: 'up' | 'down') => {
    const ids = [...showcaseConfig.selectedProjectIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;

    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    const updated = { ...showcaseConfig, selectedProjectIds: ids };
    setShowcaseConfig(updated);
    handleSaveAll(undefined, updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset Intent Console and Showcase to default configurations?')) {
      setIntentConfig(DEFAULT_HOMEPAGE_INTENT_CONFIG);
      setShowcaseConfig(DEFAULT_HOMEPAGE_SHOWCASE_CONFIG);
      handleSaveAll(DEFAULT_HOMEPAGE_INTENT_CONFIG, DEFAULT_HOMEPAGE_SHOWCASE_CONFIG);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-mono">Loading Intent Console and Showcase manager...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <span>Homepage Intent Console & Showcase Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Full administrative control over candidates (Aarav, Priya, Rohan), open project slots, and exact projects displayed in the Homepage Showcase.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            leftIcon={<RotateCcw className="w-4 h-4 text-slate-400" />}
            className="border-charcoal-700 text-slate-300 hover:bg-charcoal-800"
          >
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSaveAll()}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold"
          >
            Save Live Changes
          </Button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Switcher: Intent Console vs Showcase Manager */}
      <div className="flex items-center gap-2 border-b border-charcoal-750 pb-3">
        <button
          onClick={() => setActiveSubTab('intent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'intent'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-charcoal-850 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. Intent Console (Teammates & Skills)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('showcase')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'showcase'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-charcoal-850 text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>2. Showcase Projects ("It's on me which project I show")</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: INTENT CONSOLE MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'intent' && (
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="p-1 rounded-xl bg-charcoal-850 border border-charcoal-750 inline-flex items-center gap-1">
            <button
              onClick={() => setActiveIntentMode('recruit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeIntentMode === 'recruit'
                  ? 'bg-charcoal-750 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <span>Mode 1: "I Have an Idea & Need Teammates" ({intentConfig.candidates.length} Profiles)</span>
            </button>
            <button
              onClick={() => setActiveIntentMode('join')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeIntentMode === 'join'
                  ? 'bg-charcoal-750 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Mode 2: "I Have Skills & Want to Join" ({intentConfig.projectSlots.length} Slots)</span>
            </button>
          </div>

          {/* MODE 1: CANDIDATES MANAGEMENT (Aarav Sharma, Priya Patel, Rohan Verma, etc.) */}
          {activeIntentMode === 'recruit' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Teammate Profiles Appearing in Intent Console</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize names, roles, college, skills, avatars, and match scores.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddCandidate}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="bg-violet-600 hover:bg-violet-700 text-white font-bold"
                >
                  Add Candidate Profile
                </Button>
              </div>

              {/* Candidates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intentConfig.candidates.length === 0 ? (
                  <div className="col-span-full p-8 text-center rounded-2xl bg-charcoal-900 border border-charcoal-750">
                    <p className="text-sm font-bold text-slate-300">No Candidate Profiles Configured</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click &quot;Add Candidate Profile&quot; to configure candidate profiles for the Intent Console.
                    </p>
                  </div>
                ) : (
                  intentConfig.candidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 flex flex-col justify-between space-y-4 hover:border-charcoal-600 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {cand.matchScore}% Match
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{cand.type}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-12 h-12 rounded-full object-cover border border-charcoal-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{cand.name}</h4>
                          <p className="text-xs text-slate-300 truncate">{cand.role}</p>
                          <p className="text-[11px] text-slate-500 truncate">{cand.college}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {cand.skills.map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-charcoal-800 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditCandidate(cand)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        className="text-slate-300 hover:text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCandidate(cand.id)}
                        leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            </div>
          )}

          {/* MODE 2: PROJECT SLOTS MANAGEMENT (CampusPulse, AuraHealth, AgriVision, etc.) */}
          {activeIntentMode === 'join' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span>Open Project Slots Appearing in Intent Console</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize project titles, category, needed role, team status, and tech stack.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddSlot}
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Add Project Slot
                </Button>
              </div>

              {/* Project Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intentConfig.projectSlots.length === 0 ? (
                  <div className="col-span-full p-8 text-center rounded-2xl bg-charcoal-900 border border-charcoal-750">
                    <p className="text-sm font-bold text-slate-300">No Open Project Slots Configured</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click &quot;Add Project Slot&quot; to configure open project opportunities for Mode 2.
                    </p>
                  </div>
                ) : (
                  intentConfig.projectSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 flex flex-col justify-between space-y-4 hover:border-charcoal-600 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {slot.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{slot.teamStatus}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">{slot.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{slot.owner}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-0.5">
                          <span className="text-[10px] uppercase font-mono text-slate-500 block">NEEDED ROLE</span>
                          <span className="text-xs font-bold text-amber-300 block truncate">{slot.neededRole}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {slot.tech.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-charcoal-800 text-slate-300 border border-charcoal-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-charcoal-800 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditSlot(slot)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          className="text-slate-300 hover:text-white"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SHOWCASE PROJECTS MANAGER ("IT'S ON ME WHICH PROJECT I SHOW") */}
      {/* ========================================================================= */}
      {activeSubTab === 'showcase' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-400" />
                <span>Homepage Showcase Projects Selector</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                You decide exactly which projects appear in Section 03 (Showcase) on the homepage. Pin, unpin, and arrange order freely.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30">
                {showcaseConfig.selectedProjectIds.length} Projects Pinned to Showcase
              </span>
            </div>
          </div>

          {/* Currently Pinned Showcase Projects (Ordered) */}
          <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-750 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Order on Homepage Showcase (Appears Left to Right)</span>
            </h4>

            {showcaseConfig.selectedProjectIds.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-charcoal-700 rounded-xl">
                No projects selected. Check projects from the directory below to pin them to the homepage showcase!
              </div>
            ) : (
              <div className="space-y-2">
                {showcaseConfig.selectedProjectIds.map((projId, index) => {
                  const proj = allProjects.find((p) => p.id === projId) || DEMO_PROJECTS.find((p) => p.id === projId);
                  const title = proj?.title || `Project ID: ${projId}`;
                  const category = proj?.category || 'Project';
                  const ownerName = proj?.owner?.display_name || proj?.owner_name || 'Student Creator';

                  return (
                    <div
                      key={projId}
                      className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-750 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-charcoal-800 text-brand-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{title}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {category} · by {ownerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleMoveShowcaseProject(index, 'up')}
                          disabled={index === 0}
                          title="Move Up"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveShowcaseProject(index, 'down')}
                          disabled={index === showcaseConfig.selectedProjectIds.length - 1}
                          title="Move Down"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleShowcaseProject(projId)}
                          title="Remove from Showcase"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-charcoal-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* All Available Projects to Pick From */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>All Projects in Platform (Click to Pin or Unpin)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.map((proj) => {
                const isPinned = showcaseConfig.selectedProjectIds.includes(proj.id);
                const ownerName = proj.owner?.display_name || proj.owner_name || 'Creator';

                return (
                  <div
                    key={proj.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isPinned
                        ? 'bg-charcoal-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-charcoal-900/60 border-charcoal-750 hover:border-charcoal-600'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-charcoal-800 text-slate-300">
                          {proj.category}
                        </span>
                        {isPinned ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pinned</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Not Pinned</span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-white leading-snug line-clamp-2">{proj.title}</h5>
                      <p className="text-xs text-slate-400 line-clamp-2">{proj.summary || proj.description}</p>
                      <p className="text-[11px] text-slate-500 font-medium">by {ownerName}</p>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant={isPinned ? 'danger' : 'outline'}
                        size="sm"
                        className="w-full text-xs font-bold"
                        onClick={() => handleToggleShowcaseProject(proj.id)}
                      >
                        {isPinned ? 'Remove from Showcase' : 'Pin to Homepage Showcase'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CANDIDATE */}
      {/* ========================================================================= */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                <span>{editingCandidateId ? 'Edit Candidate Profile' : 'Add New Candidate Profile'}</span>
              </h3>
              <button onClick={() => setIsCandidateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={candForm.name}
                    onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title *</label>
                  <input
                    type="text"
                    value={candForm.role}
                    onChange={(e) => setCandForm({ ...candForm, role: e.target.value })}
                    placeholder="e.g. AI / PyTorch Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category Filter</label>
                  <select
                    value={candForm.type}
                    onChange={(e) => setCandForm({ ...candForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="ai">AI & ML Engineer</option>
                    <option value="frontend">Full-Stack / Frontend</option>
                    <option value="design">UI/UX Designer</option>
                    <option value="all">General Builder</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Match Score %</label>
                  <input
                    type="number"
                    min="50"
                    max="99"
                    value={candForm.matchScore}
                    onChange={(e) => setCandForm({ ...candForm, matchScore: parseInt(e.target.value) || 90 })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">College & Degree</label>
                <input
                  type="text"
                  value={candForm.college}
                  onChange={(e) => setCandForm({ ...candForm, college: e.target.value })}
                  placeholder="e.g. IIIT Hyderabad • B.Tech CSE"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={candForm.avatar}
                  onChange={(e) => setCandForm({ ...candForm, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="PyTorch, FastAPI, Next.js, LangChain"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCandidateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
                  Save Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PROJECT SLOT */}
      {/* ========================================================================= */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span>{editingSlotId ? 'Edit Project Slot' : 'Add New Project Slot'}</span>
              </h3>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  value={slotForm.title}
                  onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })}
                  placeholder="e.g. CampusPulse: Real-Time Transit Tracker"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={slotForm.category}
                    onChange={(e) => setSlotForm({ ...slotForm, category: e.target.value })}
                    placeholder="e.g. AI / Healthcare, Web / Mobile"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Team Status</label>
                  <input
                    type="text"
                    value={slotForm.teamStatus}
                    onChange={(e) => setSlotForm({ ...slotForm, teamStatus: e.target.value })}
                    placeholder="e.g. 2 of 4 Filled"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Owner / College</label>
                  <input
                    type="text"
                    value={slotForm.owner}
                    onChange={(e) => setSlotForm({ ...slotForm, owner: e.target.value })}
                    placeholder="e.g. Devon Vance • MIT College"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Needed Role *</label>
                  <input
                    type="text"
                    value={slotForm.neededRole}
                    onChange={(e) => setSlotForm({ ...slotForm, neededRole: e.target.value })}
                    placeholder="e.g. Lead React Native Dev"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Next.js, React Native, WebSockets"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsSlotModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
                  Save Slot
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
