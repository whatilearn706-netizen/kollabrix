'use client';

import React, { useState, useEffect } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Tag,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  AlertCircle,
  Edit2,
  X,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface AdminNote {
  id: string;
  title: string;
  content: string;
  category: 'Feature Idea' | 'Improvement' | 'Bug / Fix' | 'Campus / Meeting' | 'Placement';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_NOTES: AdminNote[] = [
  {
    id: 'note-project-of-the-week',
    title: 'Add "Project of the Week" Spotlight with Student Voting',
    content:
      'Re-implement the Project of the Week spotlight card on the homepage once the student upvoting, automated weekly reset, and squad accolade metrics are ready for production.',
    category: 'Feature Idea',
    priority: 'high',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-ceo-pitch',
    title: 'Pitch Linkora to College CEO / Director',
    content:
      'Send the executive briefing and interactive 60-second walkthrough at linkora-edu.vercel.app/pitch to college leadership for a zero-cost departmental pilot.',
    category: 'Campus / Meeting',
    priority: 'high',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-resume-generator',
    title: '1-Click STAR Method Resume Bullet Generator',
    content:
      'Add a modal on completed projects that auto-formats the student squad member\'s contribution into 3 Harvard STAR-framework resume bullets for placement interviews.',
    category: 'Placement',
    priority: 'medium',
    status: 'todo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'linkora_admin_notes_v1';

export function AdminNotesTab({ authToken }: { authToken?: string }) {
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<AdminNote['category']>('Feature Idea');
  const [formPriority, setFormPriority] = useState<AdminNote['priority']>('medium');

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      }
      // If none, initialize with default starter notes
      setNotes(DEFAULT_NOTES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTES));
    } catch {
      setNotes(DEFAULT_NOTES);
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = (updated: AdminNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save admin notes to localStorage', e);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('Feature Idea');
    setFormPriority('medium');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: AdminNote) => {
    setEditingNoteId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category);
    setFormPriority(note.priority);
    setIsModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingNoteId) {
      // Update existing
      const updated = notes.map((n) =>
        n.id === editingNoteId
          ? {
              ...n,
              title: formTitle.trim(),
              content: formContent.trim(),
              category: formCategory,
              priority: formPriority,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      saveNotes(updated);
    } else {
      // Create new
      const newNote: AdminNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        priority: formPriority,
        status: 'todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNotes([newNote, ...notes]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updated = notes.filter((n) => n.id !== id);
      saveNotes(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = notes.map((n) => {
      if (n.id === id) {
        const nextStatus: AdminNote['status'] =
          n.status === 'completed' ? 'todo' : 'completed';
        return {
          ...n,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });
    saveNotes(updated);
  };

  const handleCopyAllNotes = () => {
    const formatted = notes
      .map(
        (n, i) =>
          `${i + 1}. [${n.status.toUpperCase()}] ${n.title} (${n.category} - ${n.priority} priority)\n   ${n.content}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkora-admin-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || n.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' || n.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const todoCount = notes.filter((n) => n.status !== 'completed').length;
  const completedCount = notes.filter((n) => n.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Actions */}
      <div className="p-6 rounded-2xl bg-charcoal-900 border border-charcoal-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-400" />
            <span>Admin Notes & Feature Backlog</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Keep track of ideas, upcoming features, campus feedback, and things you want to add to Linkora later.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold"
          >
            Add New Note
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAllNotes}
            leftIcon={copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            className="border-charcoal-700 text-slate-300 hover:bg-charcoal-800"
          >
            {copiedAll ? 'Copied!' : 'Copy All'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            leftIcon={<Download className="w-4 h-4 text-slate-400" />}
            className="border-charcoal-700 text-slate-300 hover:bg-charcoal-800"
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Stats & Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes or ideas..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Category Filter */}
        <div className="md:col-span-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Categories ({notes.length})</option>
            <option value="Feature Idea">Feature Idea</option>
            <option value="Improvement">Improvement</option>
            <option value="Bug / Fix">Bug / Fix</option>
            <option value="Campus / Meeting">Campus / Meeting</option>
            <option value="Placement">Placement</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Pending To-Do ({todoCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <StickyNote className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Notes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No notes match your current search query.'
              : 'You have no saved notes in this category yet. Click "Add New Note" to jot down your next idea!'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isDone = note.status === 'completed';
            return (
              <div
                key={note.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group ${
                  isDone
                    ? 'bg-charcoal-900/40 border-charcoal-800 opacity-70'
                    : 'bg-charcoal-900 border-charcoal-750 hover:border-charcoal-600 hover:shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Category & Priority Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        note.category === 'Feature Idea'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : note.category === 'Campus / Meeting'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : note.category === 'Placement'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : note.category === 'Bug / Fix'
                          ? 'bg-red-500/10 text-red-300 border-red-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {note.category}
                    </span>

                    {note.priority === 'high' && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                        High Priority
                      </span>
                    )}
                  </div>

                  {/* Title & Checkbox */}
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleToggleStatus(note.id)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
                      title={isDone ? 'Mark as to-do' : 'Mark as completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    <h3
                      className={`text-sm font-bold text-white leading-snug ${
                        isDone ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {note.title}
                    </h3>
                  </div>

                  {/* Content */}
                  <p
                    className={`text-xs text-slate-300 leading-relaxed whitespace-pre-wrap ${
                      isDone ? 'line-through text-slate-500' : ''
                    }`}
                  >
                    {note.content}
                  </p>
                </div>

                {/* Footer with timestamp and actions */}
                <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-charcoal-800 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-elevated space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-400" />
                <span>{editingNoteId ? 'Edit Admin Note' : 'Add New Admin Note'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Add 'Project of the Week' voting system"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Feature Idea">Feature Idea</option>
                    <option value="Improvement">Improvement</option>
                    <option value="Bug / Fix">Bug / Fix</option>
                    <option value="Campus / Meeting">Campus / Meeting</option>
                    <option value="Placement">Placement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Details & Description
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Describe the feature, requirements, or steps to take when you implement this later..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold"
                >
                  {editingNoteId ? 'Update Note' : 'Save Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
