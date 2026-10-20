'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Calendar,
  ExternalLink,
  Building2,
  Trophy,
} from 'lucide-react';
import { CampusDeadlineItem, DEFAULT_CAMPUS_DEADLINES } from '@/types/communityFeatures';

interface AdminDeadlinesTabProps {
  authToken?: string;
}

export function AdminDeadlinesTab({ authToken }: AdminDeadlinesTabProps) {
  const [deadlines, setDeadlines] = useState<CampusDeadlineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Form states
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [type, setType] = useState<'hackathon' | 'problem' | 'icpc' | 'grant' | 'event'>('hackathon');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [category, setCategory] = useState('Hackathon');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('/hackathons');
  const [prize, setPrize] = useState('');
  const [urgency, setUrgency] = useState<'urgent' | 'upcoming' | 'ongoing'>('upcoming');
  const [tags, setTags] = useState('Teams of 2-4, Cash Prize');

  const fetchDeadlines = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/deadlines');
      const data = await res.json();
      if (data.deadlines && Array.isArray(data.deadlines)) {
        setDeadlines(data.deadlines);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadlineDate) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          organizer,
          type,
          deadlineDate: new Date(deadlineDate).toISOString(),
          category,
          description,
          link,
          prize: prize || undefined,
          urgency,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add deadline');

      if (data.deadlines) setDeadlines(data.deadlines);
      setIsAddModalOpen(false);
      setTitle('');
      setOrganizer('');
      setDescription('');
      setPrize('');
      setActionSuccess('Campus deadline added to radar successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteDeadline = async (id: string, deadlineTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${deadlineTitle}" from Deadlines?`)) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`/api/deadlines?id=${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      if (data.deadlines) setDeadlines(data.deadlines);
      else setDeadlines((prev) => prev.filter((d) => d.id !== id));

      setActionSuccess(`Removed ${deadlineTitle} from Deadlines.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredDeadlines = deadlines.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              <span>Collegiate Deadline Radar Management</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {deadlines.length} Active Deadlines
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Publish upcoming hackathon cutoffs, faculty problem application windows, and ICPC contest dates shown on /deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDeadlines}
            className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs border border-charcoal-700 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Campus Deadline</span>
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
          placeholder="Filter deadlines by title or organizer..."
          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
        />
      </div>

      {/* Deadlines Table */}
      <div className="overflow-x-auto rounded-2xl border border-charcoal-800 bg-charcoal-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-charcoal-800/80 text-slate-400 font-mono uppercase text-[10px] border-b border-charcoal-700">
            <tr>
              <th className="py-3 px-4">Opportunity</th>
              <th className="py-3 px-4">Organizer</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Deadline Date</th>
              <th className="py-3 px-4">Prize / Award</th>
              <th className="py-3 px-4">Urgency</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800 text-slate-300">
            {filteredDeadlines.map((d) => (
              <tr key={d.id} className="hover:bg-charcoal-800/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-white">{d.title}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                    {d.description}
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">{d.organizer}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-800 text-slate-300 border border-charcoal-700 uppercase">
                    {d.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-white">
                  {new Date(d.deadlineDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 font-mono text-emerald-400">
                  {d.prize || '—'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      d.urgency === 'urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-charcoal-800 text-slate-400'
                    }`}
                  >
                    {d.urgency || 'upcoming'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteDeadline(d.id, d.title)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Delete deadline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Deadline */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Add Collegiate Deadline</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDeadline} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Title of Hackathon / Problem / Event *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Smart India Collegiate Hackathon 2026"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Organizer / College
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="e.g. IIT Delhi Innovation Club"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="problem">Faculty Problem</option>
                    <option value="icpc">ICPC Contest</option>
                    <option value="grant">Grant / Funding</option>
                    <option value="event">Campus Event</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Deadline Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Urgency Badge
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="urgent">Urgent (Flashing Red)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the challenge or registration details..."
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Target Link
                  </label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="/hackathons or /problems"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Prize / Stipend Highlight
                  </label>
                  <input
                    type="text"
                    value={prize}
                    onChange={(e) => setPrize(e.target.value)}
                    placeholder="e.g. ₹5,00,000 Pool"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Teams of 2-4, Cash Prize, National Rank"
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Add Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
