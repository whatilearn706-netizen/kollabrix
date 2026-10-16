'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Users,
  Calendar,
  Lock,
  Globe,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface AdminHackathonsTabProps {
  authToken?: string;
  adminEmail?: string;
}

export function AdminHackathonsTab({ authToken, adminEmail }: AdminHackathonsTabProps) {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadHackathons = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/hackathons', { headers });
      const data = await res.json();
      if (res.ok && data.success) {
        setHackathons(data.hackathons || []);
      }
    } catch (err) {
      console.warn('Error loading hackathons for admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const handleDeleteHackathon = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/hackathons', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ hackathonId: deleteTarget.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to delete hackathon.' });
        return;
      }

      setStatusMessage({ type: 'success', text: `Hackathon "${deleteTarget.title}" was permanently deleted.` });
      setDeleteTarget(null);
      await loadHackathons();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error executing hackathon deletion.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = hackathons.filter(
    (h) =>
      h.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.organizer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Hackathon Operations &amp; Moderation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage all collegiate and institutional hackathons. Authoritatively delete unauthorized, duplicate, or expired events across the platform.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/hackathons/new">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Create Hackathon
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHackathons}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Hackathons Table Container */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>All Platform Hackathons</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-400">
                {hackathons.length} Total
              </span>
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, organizer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-charcoal-750 rounded-xl space-y-2">
            <Trophy className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No hackathons matching &quot;{searchTerm}&quot; found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2.5 px-3">Hackathon Title &amp; Organizer</th>
                  <th className="py-2.5 px-3">Mode &amp; Type</th>
                  <th className="py-2.5 px-3">Dates</th>
                  <th className="py-2.5 px-3">Roster</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-850/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div>
                        <p className="font-bold text-white text-sm">{item.title}</p>
                        <p className="text-[11px] text-slate-400">by {item.organizer || 'Campus Organizer'}</p>
                        {item.join_code && (
                          <span className="inline-block mt-1 font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            Passcode: {item.join_code}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-charcoal-800 border border-charcoal-700 text-slate-300">
                          {item.mode}
                        </span>
                        <div>
                          {item.access_type === 'private' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
                              <Lock className="w-3 h-3" /> Private Event
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                              <Globe className="w-3 h-3" /> Public
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {item.start_date
                            ? new Date(item.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'TBD'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs font-mono text-slate-300">
                        <Users className="w-3.5 h-3.5 text-brand-400" />
                        <span>{item.participants_count || 0} enrolled</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {item.status || 'Published'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                      {/* View Link */}
                      <Link
                        href={item.join_code ? `/h/${item.join_code}` : `/hackathons`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white border border-charcoal-700 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </Link>

                      {/* Delete Hackathon Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition-colors"
                        title="Delete Hackathon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Hackathon Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Hackathon"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">
                  Are you sure you want to delete &quot;{deleteTarget.title}&quot;?
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  This action is irreversible. All team rosters, participant registrations, project submissions, and security passcodes associated with this hackathon will be permanently removed.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Organizer:</span>
                <span className="font-bold text-white">{deleteTarget.organizer || 'Campus Organizer'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Participants Registered:</span>
                <span className="font-bold text-amber-300 font-mono">{deleteTarget.participants_count || 0}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Admin Audit:</span>
                <span className="text-slate-300">Action will be logged under {adminEmail || 'admin'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteHackathon}
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Hackathon Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
