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
} from 'lucide-react';
import { SparkTemplateItem, DEFAULT_SPARK_TEMPLATES } from '@/types/communityFeatures';

interface AdminSparkTabProps {
  authToken?: string;
}

export function AdminSparkTab({ authToken }: AdminSparkTabProps) {
  const [templates, setTemplates] = useState<SparkTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Form states
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('AI / Machine Learning');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [prompt, setPrompt] = useState('');
  const [technologies, setTechnologies] = useState('Next.js 14, TypeScript, FastAPI, PostgreSQL');
  const [roles, setRoles] = useState('Fullstack Lead, ML Engineer, UI/UX Designer');
  const [featured, setFeatured] = useState(true);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/spark/templates');
      const data = await res.json();
      if (data.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !prompt) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

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
      if (!res.ok) throw new Error(data.error || 'Failed to add template');

      if (data.templates) setTemplates(data.templates);
      setIsAddModalOpen(false);
      setTitle('');
      setTagline('');
      setPrompt('');
      setActionSuccess('AI Spark Template published successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteTemplate = async (id: string, templateTitle: string) => {
    if (!confirm(`Are you sure you want to delete template "${templateTitle}"?`)) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch(`/api/spark/templates?id=${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      if (data.templates) setTemplates(data.templates);
      else setTemplates((prev) => prev.filter((t) => t.id !== id));

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>AI Spark Blueprint Templates</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {templates.length} Curated Ideas
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Manage project blueprints and inspiration prompts that students can explore and synthesize in the AI Spark Studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchTemplates}
            className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs border border-charcoal-700 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Blueprint Template</span>
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

      {/* Search Bar */}
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

      {/* Templates Grid */}
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
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title="Delete template"
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

      {/* Modal: Add Template */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Add AI Spark Template</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Campus Delivery Drone"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Last-mile automated intra-campus package delivery"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. IoT / Robotics"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Full Synthesis Prompt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Detailed prompt that feeds into the AI synthesis engine..."
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="ROS 2, PX4, FastAPI, Next.js, PostgreSQL"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Roles Needed (comma separated)
                </label>
                <input
                  type="text"
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="Robotics Lead, Vision Specialist, Fullstack Dev"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Add Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
