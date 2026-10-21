'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Trash2,
  Edit2,
  ExternalLink,
  Play,
  Save,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  User,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { LearningResource, ResourceLanguage, ResourceTrack, LANGUAGE_META } from '@/types/resources';
import { DEFAULT_CAMPUS_RESOURCES } from '@/data/defaultResources';

interface AdminResourcesTabProps {
  authToken?: string;
}

export function AdminResourcesTab({ authToken }: AdminResourcesTabProps) {
  const [resources, setResources] = useState<LearningResource[]>(DEFAULT_CAMPUS_RESOURCES);
  const [isLoading, setIsLoading] = useState(true);
  const [filterLang, setFilterLang] = useState<string>('all');
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<LearningResource> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Video preview inside modal
  const [previewVideoId, setPreviewVideoId] = useState<string>('');

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      if (data.success && Array.isArray(data.resources)) {
        setResources(data.resources);
      }
    } catch (e) {
      console.warn('Failed to fetch admin resources:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const extractYoutubeId = (urlOrId: string): string => {
    if (!urlOrId) return '';
    const clean = urlOrId.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) {
      return clean;
    }
    if (clean.includes('youtu.be/')) {
      return clean.split('youtu.be/')[1].split('?')[0].split('&')[0];
    }
    if (clean.includes('watch?v=') || clean.includes('&v=')) {
      return clean.split('v=')[1].split('&')[0];
    }
    if (clean.includes('embed/')) {
      return clean.split('embed/')[1].split('?')[0];
    }
    return clean;
  };

  const handleOpenAdd = () => {
    setEditingResource({
      title: '',
      description: '',
      language: 'java',
      track: 'beginner',
      topic: '',
      videoUrl: '',
      youtubeId: '',
      duration: '45m',
      instructor: '',
      docUrl: '',
      practiceUrl: '',
    });
    setPreviewVideoId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: LearningResource) => {
    setEditingResource({ ...res });
    setPreviewVideoId(res.youtubeId || extractYoutubeId(res.videoUrl || ''));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource?.title || !editingResource?.topic) {
      setActionError('Please provide at least a title and topic for this learning resource.');
      return;
    }

    setIsSaving(true);
    setActionError(null);
    setActionSuccess(null);

    const extractedId = extractYoutubeId(editingResource.youtubeId || editingResource.videoUrl || '');

    const payload: Partial<LearningResource> = {
      ...editingResource,
      youtubeId: extractedId,
      videoUrl: editingResource.videoUrl || (extractedId ? `https://www.youtube.com/watch?v=${extractedId}` : ''),
    };

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', resource: payload }),
      });
      const data = await res.json();
      if (data.success && data.resources) {
        setResources(data.resources);
        setIsModalOpen(false);
        setActionSuccess(`Saved resource: "${payload.title}" successfully!`);
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.error || 'Failed to save resource.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error communicating with resources API.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the student learning hub?`)) return;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });
      const data = await res.json();
      if (data.success && data.resources) {
        setResources(data.resources);
        setActionSuccess(`Deleted "${title}".`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e: any) {
      setActionError(e.message || 'Could not delete resource.');
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Reset all campus learning resources back to Linkora curated defaults? Custom items will be overwritten.')) return;

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      const data = await res.json();
      if (data.success && data.resources) {
        setResources(data.resources);
        setActionSuccess('Restored all curated learning modules.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e: any) {
      setActionError(e.message || 'Could not reset resources.');
    }
  };

  const filtered = resources.filter((r) => {
    if (filterLang !== 'all' && r.language !== filterLang) return false;
    if (filterTrack !== 'all' && r.track !== filterTrack && r.track !== 'both') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.topic.toLowerCase().includes(q) ||
        r.instructor?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-black text-white">
              Collegiate Learning Resources Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Manage beginner and active learner study roadmaps, curated YouTube video masterclasses, cheat sheets, and problem sets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchResources}
            className="border-charcoal-700 text-slate-300 hover:text-white text-xs font-bold"
            leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleResetDefaults}
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold"
          >
            Reset Defaults
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenAdd}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          >
            Add New Resource
          </Button>

          <a
            href="/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-xs font-bold text-slate-300 border border-charcoal-700 hover:text-white transition-all shadow-xs"
          >
            <span>Preview Hub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, topic, or instructor..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Languages &amp; Domains</option>
          <option value="java">☕ Java</option>
          <option value="cpp">⚡ C++</option>
          <option value="python">🐍 Python</option>
          <option value="web_dev">🌐 Web Development</option>
          <option value="dsa">🧠 DSA &amp; Algorithms</option>
          <option value="app_dev">📱 App &amp; DevOps</option>
        </select>

        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Student Tracks</option>
          <option value="beginner">🌱 Beginner Only</option>
          <option value="learning">🚀 Active Learner Only</option>
          <option value="both">Both Tracks</option>
        </select>
      </div>

      {/* Resources Table */}
      <div className="rounded-3xl bg-charcoal-900 border border-charcoal-800 overflow-hidden shadow-md">
        <div className="p-4 border-b border-charcoal-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white font-bold">{filtered.length}</strong> of{' '}
            <strong className="text-white font-bold">{resources.length}</strong> resources
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal-950/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-charcoal-800">
              <tr>
                <th className="p-4">Language</th>
                <th className="p-4">Track</th>
                <th className="p-4">Module / Topic</th>
                <th className="p-4">Title &amp; Instructor</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Video Link</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-charcoal-800/40 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{LANGUAGE_META[item.language]?.icon}</span>
                      <span>{LANGUAGE_META[item.language]?.label || item.language}</span>
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                        item.track === 'beginner'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : item.track === 'learning'
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}
                    >
                      {item.track}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-300 whitespace-nowrap">
                    {item.topic}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white max-w-xs truncate" title={item.title}>
                      {item.title}
                    </div>
                    {item.instructor && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-violet-400" />
                        <span>{item.instructor}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                    {item.duration || 'N/A'}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {item.youtubeId || item.videoUrl ? (
                      <a
                        href={item.videoUrl || `https://www.youtube.com/watch?v=${item.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-bold"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Watch</span>
                      </a>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-violet-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Resource Modal */}
      {isModalOpen && editingResource && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingResource.id ? 'Edit Learning Resource' : 'Add New Learning Resource'}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Language / Domain *
                </label>
                <select
                  value={editingResource.language || 'java'}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, language: e.target.value as ResourceLanguage })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="java">☕ Java</option>
                  <option value="cpp">⚡ C++</option>
                  <option value="python">🐍 Python</option>
                  <option value="web_dev">🌐 Web Development</option>
                  <option value="dsa">🧠 DSA &amp; Algorithms</option>
                  <option value="app_dev">📱 App &amp; DevOps</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Track / Target Student Level *
                </label>
                <select
                  value={editingResource.track || 'beginner'}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, track: e.target.value as ResourceTrack })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="beginner">🌱 Absolute Beginner (Zero to Basics)</option>
                  <option value="learning">🚀 Active Learner (In-Depth / Placement)</option>
                  <option value="both">Both Tracks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Module / Topic Name * (e.g. Object Oriented Programming (OOP))
              </label>
              <Input
                value={editingResource.topic || ''}
                onChange={(e) => setEditingResource({ ...editingResource, topic: e.target.value })}
                placeholder="e.g. Collections Framework & Generics"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Resource Title *
              </label>
              <Input
                value={editingResource.title || ''}
                onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                placeholder="e.g. Java Collections Framework Deep Dive"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                YouTube Video URL or 11-digit Video ID
              </label>
              <Input
                value={editingResource.videoUrl || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingResource({ ...editingResource, videoUrl: val });
                  const id = extractYoutubeId(val);
                  setPreviewVideoId(id);
                }}
                placeholder="e.g. https://www.youtube.com/watch?v=9ogflbf_Uzg or 9ogflbf_Uzg"
              />
            </div>

            {/* Live Video Preview Box */}
            {previewVideoId && (
              <div className="p-3 rounded-2xl bg-black border border-charcoal-700 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-violet-400" />
                  <span>Video Preview (ID: {previewVideoId})</span>
                </span>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${previewVideoId}`}
                    title="Preview"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Instructor / Channel Name
                </label>
                <Input
                  value={editingResource.instructor || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, instructor: e.target.value })}
                  placeholder="e.g. Kunal Kushwaha"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Estimated Duration
                </label>
                <Input
                  value={editingResource.duration || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, duration: e.target.value })}
                  placeholder="e.g. 2h 30m or Full Course"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Description &amp; Key Concepts
              </label>
              <Textarea
                rows={3}
                value={editingResource.description || ''}
                onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                placeholder="Brief summary of what the student will learn in this module..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official Docs / Cheat Sheet Link
                </label>
                <Input
                  value={editingResource.docUrl || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, docUrl: e.target.value })}
                  placeholder="https://docs.oracle.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Practice / GitHub Code Link
                </label>
                <Input
                  value={editingResource.practiceUrl || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, practiceUrl: e.target.value })}
                  placeholder="https://leetcode.com/... or https://github.com/..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-700">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-bold border-charcoal-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Resource
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
