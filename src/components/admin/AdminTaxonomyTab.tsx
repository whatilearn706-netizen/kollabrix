'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  GitMerge,
  Plus,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  FlaskConical,
  Calculator,
  UserCheck,
  Tag,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  TaxonomyConfig,
  TaxonomySkill,
  TaxonomyRole,
  MatchScoringConfig,
  Profile,
  Project,
} from '@/types/database';

interface AdminTaxonomyTabProps {
  authToken?: string;
}

export function AdminTaxonomyTab({ authToken }: AdminTaxonomyTabProps) {
  const [subTab, setSubTab] = useState<'taxonomy' | 'weights'>('weights');

  // Taxonomy State
  const [taxonomy, setTaxonomy] = useState<TaxonomyConfig | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Frontend');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCat, setNewRoleCat] = useState('Engineering');

  // Skill Merge Modal
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [sourceSkillName, setSourceSkillName] = useState('');
  const [targetSkillId, setTargetSkillId] = useState('');

  // Match Scoring Weights State
  const [matchConfig, setMatchConfig] = useState<MatchScoringConfig | null>(null);
  const [wSkills, setWSkills] = useState(50);
  const [wRoles, setWRoles] = useState(30);
  const [wInterests, setWInterests] = useState(15);
  const [wCompleteness, setWCompleteness] = useState(5);
  const [minScore, setMinScore] = useState(20);

  // Test Sandbox State
  const [testCandidateSkills, setTestCandidateSkills] = useState('React, TypeScript, TailwindCSS');
  const [testCandidateRoles, setTestCandidateRoles] = useState('Frontend Developer');
  const [testProjectSkills, setTestProjectSkills] = useState('React, Node.js, TypeScript');
  const [testProjectRoles, setTestProjectRoles] = useState('Frontend Developer, Backend Developer');
  const [testCategory, setTestCategory] = useState('Web Development');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      // 1. Fetch Taxonomy
      const tRes = await fetch('/api/admin/taxonomy', { headers });
      const tData = await tRes.json();
      if (tRes.ok && tData.taxonomy) {
        setTaxonomy(tData.taxonomy);
      }

      // 2. Fetch Match Weights
      const mRes = await fetch('/api/admin/matching', { headers });
      const mData = await mRes.json();
      if (mRes.ok && mData.config) {
        setMatchConfig(mData.config);
        setWSkills(mData.config.weights.required_skills);
        setWRoles(mData.config.weights.desired_roles);
        setWInterests(mData.config.weights.category_interests);
        setWCompleteness(mData.config.weights.completeness_availability);
        setMinScore(mData.config.min_recommendation_score);
      }
    } catch (err) {
      console.warn('Error loading taxonomy & match config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Taxonomy
  const handleSaveTaxonomy = async (updated: TaxonomyConfig) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/taxonomy', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ taxonomy: updated }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update taxonomy');

      setTaxonomy(data.taxonomy);
      setMessage({ type: 'success', text: 'Skills & roles taxonomy updated successfully.' });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating taxonomy.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Merge Skills Execution
  const handleExecuteMerge = async () => {
    if (!sourceSkillName.trim() || !targetSkillId) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/taxonomy', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          action: 'merge_skills',
          payload: {
            sourceSkillName: sourceSkillName.trim(),
            targetSkillId,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to merge skills');

      setTaxonomy(data.taxonomy);
      setMessage({ type: 'success', text: data.message });
      setIsMergeModalOpen(false);
      setSourceSkillName('');
      setTargetSkillId('');
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error merging skills.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save Match Weights
  const handleSaveWeights = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/matching', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          weights: {
            required_skills: wSkills,
            desired_roles: wRoles,
            category_interests: wInterests,
            completeness_availability: wCompleteness,
          },
          minScore,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update match scoring config');

      setMatchConfig(data.config);
      setWSkills(data.config.weights.required_skills);
      setWRoles(data.config.weights.desired_roles);
      setWInterests(data.config.weights.category_interests);
      setWCompleteness(data.config.weights.completeness_availability);
      setMessage({ type: 'success', text: 'Teammate matching weights and formula saved!' });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating matching weights.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Run Test Sandbox Calculation
  const handleRunTest = async () => {
    setIsTesting(true);
    try {
      const dummyCandidate: Partial<Profile> = {
        user_id: 'test-cand',
        display_name: 'Test Candidate',
        username: 'test_cand',
        skills: testCandidateSkills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_roles: testCandidateRoles.split(',').map((r) => r.trim()).filter(Boolean),
        interests: [testCategory],
        is_portfolio_public: true,
        bio: 'Demonstration candidate profile for match formula verification.',
        github_url: 'https://github.com/test',
      };

      const dummyProject: Partial<Project> = {
        id: 'test-proj',
        title: 'Test Sandbox Project',
        category: testCategory as any,
        required_skills: testProjectSkills.split(',').map((s) => s.trim()).filter(Boolean),
        desired_roles: testProjectRoles.split(',').map((r) => r.trim()).filter(Boolean),
      };

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/matching', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          weights: {
            required_skills: wSkills,
            desired_roles: wRoles,
            category_interests: wInterests,
            completeness_availability: wCompleteness,
          },
          testCandidate: dummyCandidate,
          testProject: dummyProject,
        }),
      });

      const data = await res.json();
      if (data.testResult) {
        setTestResult(data.testResult);
      }
    } catch (err) {
      console.warn('Sandbox calculation error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const totalWeights = wSkills + wRoles + wInterests + wCompleteness;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
        <button
          onClick={() => setSubTab('weights')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'weights'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Match Scoring Weights & Live Sandbox</span>
        </button>

        <button
          onClick={() => setSubTab('taxonomy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'taxonomy'
              ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Skills & Roles Central Taxonomy</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUBTAB 1: MATCH SCORING WEIGHTS & SANDBOX */}
      {subTab === 'weights' && (
        <div className="space-y-6">
          {/* Weights Configuration Card */}
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  Teammate Recommendation Weights
                </h2>
                <p className="text-xs text-slate-400">
                  Configure transparent weighted factors used to recommend student teammates for active projects.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
                    totalWeights === 100
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  Sum: {totalWeights}% {totalWeights === 100 ? '✓ Normalized' : '(Will Auto-Normalize)'}
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveWeights}
                  disabled={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Formula
                </Button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Skill Overlap Weight */}
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Required Skills Overlap</span>
                  <span className="font-mono text-amber-400 font-bold">{wSkills}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={wSkills}
                  onChange={(e) => setWSkills(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-slate-500">
                  Proportion of score determined by candidate matching project technologies & required skills.
                </p>
              </div>

              {/* Role Alignment Weight */}
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Desired Role Alignment</span>
                  <span className="font-mono text-brand-400 font-bold">{wRoles}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={wRoles}
                  onChange={(e) => setWRoles(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-500"
                />
                <p className="text-[11px] text-slate-500">
                  Weight granted when candidate&apos;s preferred role matches open project roles.
                </p>
              </div>

              {/* Category / Interest Weight */}
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Category / Domain Interest</span>
                  <span className="font-mono text-emerald-400 font-bold">{wInterests}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={wInterests}
                  onChange={(e) => setWInterests(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Alignment between candidate&apos;s declared interests and project domain.
                </p>
              </div>

              {/* Profile Completeness */}
              <div className="p-4 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">Completeness & Availability</span>
                  <span className="font-mono text-purple-400 font-bold">{wCompleteness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={wCompleteness}
                  onChange={(e) => setWCompleteness(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500"
                />
                <p className="text-[11px] text-slate-500">
                  Bonus points for verified GitHub activity, collegiate info, and portfolio bio.
                </p>
              </div>
            </div>

            {/* Formula Preview Box */}
            <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs font-mono space-y-1">
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">
                Active Weighted Formula:
              </span>
              <p className="text-amber-300 font-medium">
                Score = (Skills × {wSkills}%) + (Roles × {wRoles}%) + (Interests × {wInterests}%) + (Completeness × {wCompleteness}%)
              </p>
              <p className="text-[11px] text-slate-500 italic pt-1">
                Note: Scores are transparent estimates based on declared criteria, not scientifically validated predictions.
              </p>
            </div>
          </div>

          {/* Live Test Sandbox */}
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-brand-400" />
                Live Recommendation Test Sandbox
              </h3>
              <p className="text-xs text-slate-400">
                Simulate candidate profile inputs against project requirements to test scoring responsiveness before publishing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Sample Student Candidate
                </span>
                <div>
                  <label className="block text-slate-400 mb-1">Candidate Skills (Comma-separated)</label>
                  <Input
                    value={testCandidateSkills}
                    onChange={(e) => setTestCandidateSkills(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Candidate Preferred Roles</label>
                  <Input
                    value={testCandidateRoles}
                    onChange={(e) => setTestCandidateRoles(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850 border border-charcoal-750">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  Project Requirements
                </span>
                <div>
                  <label className="block text-slate-400 mb-1">Required Skills / Tech Stack</label>
                  <Input
                    value={testProjectSkills}
                    onChange={(e) => setTestProjectSkills(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Desired Open Roles</label>
                  <Input
                    value={testProjectRoles}
                    onChange={(e) => setTestProjectRoles(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunTest}
                disabled={isTesting}
                leftIcon={<FlaskConical className="w-3.5 h-3.5" />}
              >
                Calculate Test Match
              </Button>

              {testResult && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-brand-400">
                      {testResult.match_score}% Match
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {testResult.reasons?.join(' • ') || 'General Match'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SKILLS & ROLES TAXONOMY */}
      {subTab === 'taxonomy' && taxonomy && (
        <div className="space-y-6">
          {/* Skills Management */}
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  Technical Skills Taxonomy ({taxonomy.skills.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Managed technical skills, aliases, and safe alias merges preserving existing student selections.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMergeModalOpen(true)}
                className="text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                leftIcon={<GitMerge className="w-3.5 h-3.5" />}
              >
                Merge Duplicate Skills
              </Button>
            </div>

            {/* Skills Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 max-h-96 overflow-y-auto">
              {taxonomy.skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    skill.isActive
                      ? 'bg-charcoal-850 border-charcoal-750'
                      : 'bg-charcoal-900/60 border-charcoal-800 opacity-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      {skill.name}
                      <span className="text-[10px] font-mono text-slate-400 bg-charcoal-800 px-1 rounded">
                        {skill.category}
                      </span>
                    </div>
                    {skill.aliases && skill.aliases.length > 0 && (
                      <div className="text-[10px] text-slate-500 font-mono">
                        Aliases: {skill.aliases.join(', ')}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      const updated = {
                        ...taxonomy,
                        skills: taxonomy.skills.map((s) =>
                          s.id === skill.id ? { ...s, isActive: !s.isActive } : s
                        ),
                      };
                      setTaxonomy(updated);
                      handleSaveTaxonomy(updated);
                    }}
                    className={`p-1.5 rounded-lg border text-[11px] ${
                      skill.isActive
                        ? 'border-charcoal-700 text-slate-400 hover:text-amber-300'
                        : 'border-emerald-500/30 text-emerald-400'
                    }`}
                    title={skill.isActive ? 'Deactivate skill' : 'Restore skill'}
                  >
                    {skill.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Add Skill Form */}
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="Add new skill (e.g. GraphQL, Solidity)..."
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
              <div className="w-36 shrink-0">
                <Input
                  placeholder="Category"
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value)}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={!newSkillName.trim()}
                onClick={() => {
                  const newSkill: TaxonomySkill = {
                    id: `sk-${Date.now()}`,
                    name: newSkillName.trim(),
                    category: newSkillCat.trim() || 'General',
                    isActive: true,
                    aliases: [],
                  };
                  const updated = { ...taxonomy, skills: [...taxonomy.skills, newSkill] };
                  setTaxonomy(updated);
                  setNewSkillName('');
                  handleSaveTaxonomy(updated);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Skill
              </Button>
            </div>
          </div>

          {/* Roles Management */}
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-400" />
                Collaboration Roles Taxonomy ({taxonomy.roles.length})
              </h3>
              <p className="text-xs text-slate-400">
                Official role choices students can pick in profile onboarding and team formation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {taxonomy.roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    role.isActive
                      ? 'bg-charcoal-850 border-charcoal-750'
                      : 'bg-charcoal-900/60 border-charcoal-800 opacity-50'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white">{role.name}</span>
                    <div className="text-[10px] text-slate-500">{role.category}</div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = {
                        ...taxonomy,
                        roles: taxonomy.roles.map((r) =>
                          r.id === role.id ? { ...r, isActive: !r.isActive } : r
                        ),
                      };
                      setTaxonomy(updated);
                      handleSaveTaxonomy(updated);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {role.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MERGE SKILLS MODAL */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title="Merge Duplicate Technical Skills"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Merging safely registers the source skill as an alias of the canonical target skill. Existing student profile strings are safely preserved without data loss.
          </p>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Duplicate / Source Skill to Merge (e.g. &quot;ReactJS&quot; or &quot;NodeJS&quot;)
            </label>
            <Input
              value={sourceSkillName}
              onChange={(e) => setSourceSkillName(e.target.value)}
              placeholder="Enter variant name to merge..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Canonical Target Skill
            </label>
            <select
              value={targetSkillId}
              onChange={(e) => setTargetSkillId(e.target.value)}
              className="w-full rounded-xl bg-charcoal-900 border border-charcoal-750 p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">Select target canonical skill...</option>
              {taxonomy?.skills
                .filter((s) => s.isActive)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsMergeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSaving || !sourceSkillName.trim() || !targetSkillId}
              onClick={handleExecuteMerge}
            >
              Confirm Skill Merge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
