'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Trash2,
  Edit2,
  Check,
  RefreshCw,
  Search,
  Building2,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { CollegeLeaderboardItem, DEFAULT_LEADERBOARD_COLLEGES } from '@/types/communityFeatures';

interface AdminLeaderboardTabProps {
  authToken?: string;
}

export function AdminLeaderboardTab({ authToken }: AdminLeaderboardTabProps) {
  const [colleges, setColleges] = useState<CollegeLeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<'iit_nit' | 'bits_iiit' | 'state_pvt'>('iit_nit');
  const [points, setPoints] = useState(2500);
  const [projectsCount, setProjectsCount] = useState(20);
  const [hackathonWins, setHackathonWins] = useState(3);
  const [activeBuilders, setActiveBuilders] = useState(100);
  const [badge, setBadge] = useState('🔥 Fast Emerging Hub');

  const fetchColleges = async () => {
    setIsLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.colleges && Array.isArray(data.colleges)) {
        setColleges(data.colleges);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortCode) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch('/api/leaderboard', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          shortCode,
          city,
          category,
          points: Number(points),
          projectsCount: Number(projectsCount),
          hackathonWins: Number(hackathonWins),
          activeBuilders: Number(activeBuilders),
          badge,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add college');

      if (data.colleges) setColleges(data.colleges);
      setIsAddModalOpen(false);
      setName('');
      setShortCode('');
      setCity('');
      setActionSuccess('College successfully added to Leaderboard!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteCollege = async (id: string, collegeName: string) => {
    if (!confirm(`Are you sure you want to remove "${collegeName}" from the Leaderboard?`)) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch(`/api/leaderboard?id=${id}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      if (data.colleges) setColleges(data.colleges);
      else setColleges((prev) => prev.filter((c) => c.id !== id));

      setActionSuccess(`Removed ${collegeName} from Leaderboard.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleUpdatePoints = async (id: string, newPoints: number) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
      if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

      const res = await fetch('/api/leaderboard', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, points: newPoints }),
      });

      const data = await res.json();
      if (data.colleges) setColleges(data.colleges);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filteredColleges = colleges.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Inter-College Leaderboard Management</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {colleges.length} Campuses
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Add new colleges, modify sprint points and badges, or remove institutions from the national public leaderboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchColleges}
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
            <span>Add New College</span>
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

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter colleges by name or city..."
          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Colleges Table */}
      <div className="overflow-x-auto rounded-2xl border border-charcoal-800 bg-charcoal-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-charcoal-800/80 text-slate-400 font-mono uppercase text-[10px] border-b border-charcoal-700">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">College Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Points</th>
              <th className="py-3 px-4">Projects</th>
              <th className="py-3 px-4">Wins</th>
              <th className="py-3 px-4">Builders</th>
              <th className="py-3 px-4">Badge</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-800 text-slate-300">
            {filteredColleges.map((c) => (
              <tr key={c.id} className="hover:bg-charcoal-800/50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-amber-400">
                  #{c.rank}
                </td>
                <td className="py-3 px-4">
                  <div className="font-bold text-white">{c.shortCode}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                    {c.name} ({c.city})
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-charcoal-800 text-slate-300 border border-charcoal-700">
                    {c.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-white">
                  <input
                    type="number"
                    defaultValue={c.points}
                    onBlur={(e) => handleUpdatePoints(c.id, Number(e.target.value))}
                    className="w-20 px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700 text-white font-mono text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </td>
                <td className="py-3 px-4 font-mono">{c.projectsCount}</td>
                <td className="py-3 px-4 font-mono text-emerald-400">{c.hackathonWins}</td>
                <td className="py-3 px-4 font-mono text-violet-400">{c.activeBuilders}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {c.badge}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteCollege(c.id, c.shortCode)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Delete college"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add College */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-charcoal-900 border border-charcoal-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Add College to Leaderboard</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCollege} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Full College / University Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Indian Institute of Science Bangalore"
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Short Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    placeholder="e.g. IISc Bangalore"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="iit_nit">IITs & NITs</option>
                    <option value="bits_iiit">BITS & IIITs</option>
                    <option value="state_pvt">State & Private Universities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sprint Points</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Projects</label>
                  <input
                    type="number"
                    value={projectsCount}
                    onChange={(e) => setProjectsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hackathon Wins</label>
                  <input
                    type="number"
                    value={hackathonWins}
                    onChange={(e) => setHackathonWins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Builders</label>
                  <input
                    type="number"
                    value={activeBuilders}
                    onChange={(e) => setActiveBuilders(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Special Badge</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. 🌟 Top Research Hub"
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
                  Add to Leaderboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
