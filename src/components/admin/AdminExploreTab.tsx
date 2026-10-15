'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Trash2,
  Check,
  X,
  Star,
  Search,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ExploreConfig, ExploreCategoryOption, Project } from '@/types/database';

interface AdminExploreTabProps {
  authToken?: string;
}

export function AdminExploreTab({ authToken }: AdminExploreTabProps) {
  const [config, setConfig] = useState<ExploreConfig | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  // New Popular Skill State
  const [newSkillName, setNewSkillName] = useState('');

  const loadExploreConfig = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/explore/config', { headers });
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
        setFeaturedProjects(data.featuredProjects || []);
      }

      // Fetch projects for featured picker
      const pRes = await fetch('/api/admin/users?limit=30', { headers });
      const pData = await pRes.json();
      if (pData.users) {
        const projs: any[] = [];
        for (const u of pData.users) {
          if (u.owned_projects) {
            for (const op of u.owned_projects) {
              projs.push({ ...op, owner_name: u.display_name });
            }
          }
        }
        setAllProjects(projs);
      }
    } catch (err) {
      console.warn('Error loading explore config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExploreConfig();
  }, []);

  const handleSaveConfig = async (updatedConfig: ExploreConfig) => {
    setIsSaving(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/explore/config', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ config: updatedConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configuration');

      setConfig(data.config);
      setMessage({ type: 'success', text: 'Explore directory settings updated live!' });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error updating explore settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatured = async (projectId: string, currentStatus: boolean) => {
    setMessage(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/explore/config', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          toggleFeaturedProjectId: projectId,
          isFeatured: !currentStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update featured project');

      setMessage({ type: 'success', text: data.message });
      await loadExploreConfig();
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error toggling featured project.',
      });
    }
  };

  // Add Category
  const handleAddCategory = () => {
    if (!config || !newCatName.trim()) return;
    const trimmed = newCatName.trim();
    if (config.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setMessage({ type: 'error', text: 'This category already exists.' });
      return;
    }
    const newCat: ExploreCategoryOption = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      isActive: true,
      order: config.categories.length + 1,
    };
    const updated = { ...config, categories: [...config.categories, newCat] };
    setConfig(updated);
    setNewCatName('');
    handleSaveConfig(updated);
  };

  // Toggle Category Active
  const handleToggleCategoryActive = (catId: string) => {
    if (!config) return;
    const updated = {
      ...config,
      categories: config.categories.map((c) => (c.id === catId ? { ...c, isActive: !c.isActive } : c)),
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  // Move Category
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const newCats = [...config.categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    const updated = {
      ...config,
      categories: newCats.map((c, i) => ({ ...c, order: i + 1 })),
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  // Add Popular Skill
  const handleAddSkill = () => {
    if (!config || !newSkillName.trim()) return;
    const trimmed = newSkillName.trim();
    if (config.popular_skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = { ...config, popular_skills: [...config.popular_skills, trimmed] };
    setConfig(updated);
    setNewSkillName('');
    handleSaveConfig(updated);
  };

  // Remove Popular Skill
  const handleRemoveSkill = (skillToRemove: string) => {
    if (!config) return;
    const updated = {
      ...config,
      popular_skills: config.popular_skills.filter((s) => s !== skillToRemove),
    };
    setConfig(updated);
    handleSaveConfig(updated);
  };

  if (isLoading || !config) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
        <div className="h-64 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* 1. Category Management */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-400" />
              Explore Project Categories
            </h2>
            <p className="text-xs text-slate-400">
              Categories dynamically power Explore filters and new project creation options without code redeployment.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-charcoal-800 px-2.5 py-1 rounded-lg">
            Active Categories: {config.categories.filter((c) => c.isActive).length} / {config.categories.length}
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-2 pt-2">
          {config.categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                cat.isActive
                  ? 'bg-charcoal-850 border-charcoal-750'
                  : 'bg-charcoal-900/60 border-charcoal-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500 text-[11px] w-6">#{idx + 1}</span>
                <span className="font-semibold text-white">{cat.name}</span>
                {!cat.isActive && (
                  <span className="text-[10px] font-mono bg-charcoal-800 text-slate-500 px-1.5 py-0.5 rounded">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={idx === 0}
                  onClick={() => handleMoveCategory(idx, 'up')}
                  className="p-1 h-7 text-slate-400 hover:text-white"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={idx === config.categories.length - 1}
                  onClick={() => handleMoveCategory(idx, 'down')}
                  className="p-1 h-7 text-slate-400 hover:text-white"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleCategoryActive(cat.id)}
                  className={`h-7 text-[11px] ${
                    cat.isActive ? 'text-amber-300 border-amber-500/30' : 'text-emerald-300 border-emerald-500/30'
                  }`}
                  leftIcon={cat.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                >
                  {cat.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category Form */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Add new project category (e.g. Cybersecurity, Blockchain)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddCategory}
            disabled={!newCatName.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add
          </Button>
        </div>
      </div>

      {/* 2. Popular Skills Filter Chips */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Explore Popular Skill Filter Chips
          </h2>
          <p className="text-xs text-slate-400">
            One-click skill chips displayed above the project feed for quick discovery.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {config.popular_skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-charcoal-800 border border-charcoal-700 text-slate-200"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-red-400 transition-colors"
                title={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Add popular skill pill (e.g. Rust, Go, GraphQL)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSkill}
            disabled={!newSkillName.trim()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Skill
          </Button>
        </div>
      </div>

      {/* 3. Featured Projects Manager */}
      <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Featured Projects ({featuredProjects.length})
            </h2>
            <p className="text-xs text-slate-400">
              Featured projects receive prominent badges and priority placement on the Explore page.
            </p>
          </div>
        </div>

        {featuredProjects.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-charcoal-850/50">
            No projects are currently featured. Mark projects below to highlight them.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {featuredProjects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-charcoal-850 border border-amber-500/30 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{p.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Category: {p.category} • {p.status}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleFeatured(p.id, true)}
                  className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-[11px]"
                >
                  Unfeature
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Search & Feature Other Projects */}
        <div className="pt-3 border-t border-charcoal-800 space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Discover & Feature Projects
          </h3>
          <Input
            placeholder="Search projects to feature..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {projectSearch.trim() && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allProjects
                .filter((p) => p.title.toLowerCase().includes(projectSearch.toLowerCase()))
                .map((p) => {
                  const isFeat = featuredProjects.some((fp) => fp.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-charcoal-850/80 border border-charcoal-750 flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">{p.title}</span>
                      <Button
                        variant={isFeat ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleFeatured(p.id, isFeat)}
                        className="text-[10px] h-7"
                      >
                        {isFeat ? 'Unfeature' : 'Feature Project'}
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
