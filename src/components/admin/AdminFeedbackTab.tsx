'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Trash2,
  CheckCircle2,
  Filter,
  Search,
  RefreshCw,
  Building2,
  Mail,
  User,
  Clock,
  AlertCircle,
  HelpCircle,
  Bug,
  Lightbulb,
  Palette,
  GraduationCap,
  Terminal,
} from 'lucide-react';
import { UserFeedbackItem } from '@/types/communityFeatures';

interface AdminFeedbackTabProps {
  authToken?: string;
}

export function AdminFeedbackTab({ authToken }: AdminFeedbackTabProps) {
  const [feedbacks, setFeedbacks] = useState<UserFeedbackItem[]>([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 5.0, newCount: 0, resolvedCount: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch('/api/admin/feedback', { headers });
      const data = await res.json();
      if (data.feedbacks && Array.isArray(data.feedbacks)) {
        setFeedbacks(data.feedbacks);
        if (data.stats) setStats(data.stats);
      }
    } catch (err: any) {
      setActionError('Failed to load user feedbacks: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [authToken]);

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'reviewed' | 'resolved') => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');

      setFeedbacks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setActionSuccess(`Feedback marked as ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this feedback?')) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete feedback');

      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      setActionSuccess('Feedback deleted successfully');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      item.message.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      (item.campus && item.campus.toLowerCase().includes(query));
    return matchesStatus && matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              <span>Student & User Feedback Desk</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Review bug reports, user suggestions, and feature requests submitted through the public feedback section.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFeedbacks}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-bold border border-charcoal-700 flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
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

      {/* Stats Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="text-2xl font-black text-white">{feedbacks.length}</div>
          <div className="text-[11px] font-mono uppercase text-slate-400">Total Feedbacks</div>
        </div>
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="text-2xl font-black text-amber-400 flex items-center gap-1">
            <span>{stats.avgRating || 5.0}</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] font-mono uppercase text-slate-400">Avg Rating</div>
        </div>
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="text-2xl font-black text-rose-400">
            {feedbacks.filter((f) => f.status === 'new').length}
          </div>
          <div className="text-[11px] font-mono uppercase text-slate-400">Unreviewed (New)</div>
        </div>
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-1">
          <div className="text-2xl font-black text-emerald-400">
            {feedbacks.filter((f) => f.status === 'resolved').length}
          </div>
          <div className="text-[11px] font-mono uppercase text-slate-400">Resolved / Closed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-charcoal-800 p-1 rounded-lg border border-charcoal-700">
            {['all', 'new', 'reviewed', 'resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-xs font-semibold text-slate-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="feature">💡 Feature Requests</option>
            <option value="bug">🐛 Bug Reports</option>
            <option value="ui_ux">🎨 UI / Design</option>
            <option value="faculty">🎓 Faculty & Mentorship</option>
            <option value="icpc">⚡ ICPC & Contests</option>
            <option value="general">💬 General</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback content..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-charcoal-800 border border-charcoal-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-3">
        {filteredFeedbacks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No Feedback Found</h3>
            <p className="text-xs text-slate-500">
              No submissions match your active filter.
            </p>
          </div>
        ) : (
          filteredFeedbacks.map((item) => {
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 hover:border-charcoal-700 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        item.status === 'new'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.status === 'reviewed'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Category badge */}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-800 text-slate-300 border border-charcoal-700">
                      {item.category}
                    </span>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-charcoal-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submission date */}
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Message body */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {item.message}
                </p>

                {/* User details and Action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-400">
                    <span className="font-bold text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {item.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      {item.email}
                    </span>
                    {item.campus && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {item.campus}
                      </span>
                    )}
                    <span className="text-[10px] font-mono uppercase bg-charcoal-800 px-1.5 py-0.5 rounded">
                      {item.role}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status !== 'reviewed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'reviewed')}
                        className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-amber-300 text-[11px] font-bold border border-charcoal-700 transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}
                    {item.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(item.id, 'resolved')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
