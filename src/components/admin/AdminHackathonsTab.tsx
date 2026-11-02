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
  RotateCcw,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface AdminHackathonsTabProps {
  authToken?: string;
  adminEmail?: string;
}

export function AdminHackathonsTab({ authToken, adminEmail }: AdminHackathonsTabProps) {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [deletedHackathons, setDeletedHackathons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sponsored Hackathon Modal State
  const [isSponsoredModalOpen, setIsSponsoredModalOpen] = useState(false);
  const [isSubmittingSponsored, setIsSubmittingSponsored] = useState(false);
  const [sponsoredForm, setSponsoredForm] = useState({
    company_name: '',
    title: '',
    tagline: '',
    glow_color: 'gold' as 'gold' | 'cyan' | 'purple' | 'emerald',
    prize_pool: '₹5,00,000 Cash Pool + Cloud Credits',
    recruitment_perks: 'Direct Fast-Track PPIs for Top 3 Squads, 1:1 Tech Mentorship, Verified Certificate',
    mode: 'Online',
    registration_deadline: '',
    results_date: '',
    themes: 'Generative AI, Cloud Systems, Enterprise Architecture',
    banner_url: '',
  });

  const handleCreateSponsoredHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsoredForm.company_name.trim() || !sponsoredForm.title.trim()) {
      setStatusMessage({ type: 'error', text: 'Please provide company name and hackathon title.' });
      return;
    }

    try {
      setIsSubmittingSponsored(true);
      setStatusMessage(null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'create_sponsored',
          company_name: sponsoredForm.company_name,
          title: sponsoredForm.title,
          description: sponsoredForm.tagline,
          mode: sponsoredForm.mode,
          prize_pool: sponsoredForm.prize_pool,
          recruitment_perks: sponsoredForm.recruitment_perks,
          glow_color: sponsoredForm.glow_color,
          registration_deadline: sponsoredForm.registration_deadline || undefined,
          results_date: sponsoredForm.results_date || undefined,
          themes: sponsoredForm.themes.split(',').map((s) => s.trim()).filter(Boolean),
          banner_url: sponsoredForm.banner_url || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create sponsored hackathon.');
      }

      setStatusMessage({
        type: 'success',
        text: `✨ Success! ${sponsoredForm.company_name} Sponsored Hackathon "${sponsoredForm.title}" is now LIVE with priority glowing spotlight and synchronized to Deadlines radar.`,
      });
      setIsSponsoredModalOpen(false);
      setSponsoredForm({
        company_name: '',
        title: '',
        tagline: '',
        glow_color: 'gold',
        prize_pool: '₹5,00,000 Cash Pool + Cloud Credits',
        recruitment_perks: 'Direct Fast-Track PPIs for Top 3 Squads, 1:1 Tech Mentorship, Verified Certificate',
        mode: 'Online',
        registration_deadline: '',
        results_date: '',
        themes: 'Generative AI, Cloud Systems, Enterprise Architecture',
        banner_url: '',
      });
      await loadHackathons();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error creating sponsored hackathon.' });
    } finally {
      setIsSubmittingSponsored(false);
    }
  };

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
        setDeletedHackathons(data.deletedHackathons || []);

        // Also clean up any deleted hackathons from this admin browser's localStorage
        if (typeof window !== 'undefined' && Array.isArray(data.deletedIds)) {
          try {
            const deletedSet = new Set(data.deletedIds.map((id: string) => id.toLowerCase()));
            const rawLocal = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
            const surviving = rawLocal.filter((h: any) => {
              const isDel =
                (h.id && deletedSet.has(h.id.toLowerCase())) ||
                (h.join_code && deletedSet.has(h.join_code.toLowerCase()));
              return !isDel;
            });
            if (surviving.length !== rawLocal.length) {
              localStorage.setItem('teamforge_created_hackathons', JSON.stringify(surviving));
            }
          } catch {}
        }
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
        body: JSON.stringify({
          hackathonId: deleteTarget.id,
          joinCode: deleteTarget.join_code,
          title: deleteTarget.title,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to delete hackathon.' });
        return;
      }

      // Purge immediately from browser localStorage as well
      if (typeof window !== 'undefined') {
        try {
          const rawLocal = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const surviving = rawLocal.filter((h: any) => {
            const idMatch = (h.id || '').toLowerCase() === (deleteTarget.id || '').toLowerCase();
            const codeMatch =
              h.join_code && deleteTarget.join_code
                ? h.join_code.toLowerCase() === deleteTarget.join_code.toLowerCase()
                : false;
            const titleMatch =
              h.title && deleteTarget.title
                ? h.title.trim().toLowerCase() === deleteTarget.title.trim().toLowerCase()
                : false;
            return !idMatch && !codeMatch && !titleMatch;
          });
          localStorage.setItem('teamforge_created_hackathons', JSON.stringify(surviving));

          // Also record in client-side teamforge_deleted_hackathons registry
          const existingDeleted: string[] = JSON.parse(localStorage.getItem('teamforge_deleted_hackathons') || '[]');
          const toAdd = [
            deleteTarget.id.toLowerCase(),
            deleteTarget.title.trim().toLowerCase(),
            ...(deleteTarget.join_code ? [deleteTarget.join_code.toLowerCase()] : []),
            ...(data.deletedIds || []).map((d: string) => d.toLowerCase()),
          ];
          const newDeleted = Array.from(new Set([...existingDeleted, ...toAdd]));
          localStorage.setItem('teamforge_deleted_hackathons', JSON.stringify(newDeleted));

          // Broadcast deletion event to all open tabs and pages
          window.dispatchEvent(
            new CustomEvent('teamforge_hackathon_deleted', {
              detail: { id: deleteTarget.id, title: deleteTarget.title },
            })
          );
        } catch {}
      }

      setStatusMessage({
        type: 'success',
        text: `Hackathon "${deleteTarget.title}" was permanently deleted and suppressed across the entire platform.`,
      });
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

  const handleRestoreHackathon = async (hackathonId: string, title?: string) => {
    try {
      setIsRestoringId(hackathonId);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'restore', hackathonId, title }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to restore hackathon.' });
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          const existingDeleted: string[] = JSON.parse(localStorage.getItem('teamforge_deleted_hackathons') || '[]');
          const cleanId = hackathonId.toLowerCase();
          const cleanTitle = (title || '').trim().toLowerCase();
          const updated = existingDeleted.filter(
            (id) => id.toLowerCase() !== cleanId && (cleanTitle ? id.toLowerCase() !== cleanTitle : true)
          );
          localStorage.setItem('teamforge_deleted_hackathons', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('teamforge_hackathon_restored', { detail: { id: hackathonId } }));
        } catch {}
      }

      setStatusMessage({
        type: 'success',
        text: `Hackathon "${title || hackathonId}" was restored and is now visible across the website again.`,
      });
      await loadHackathons();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error restoring hackathon.',
      });
    } finally {
      setIsRestoringId(null);
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
            Manage all platform hackathons. Deleting an event authoritatively cascades across the database, purges local cache, and records an immutable tombstone so it vanishes everywhere on the website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsSponsoredModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black shadow-lg shadow-amber-500/20 border border-amber-400/40"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-200" />}
          >
            🏢 Host Big Company Sponsored Hackathon
          </Button>
          <Link href="/hackathons/new">
            <Button variant="secondary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Create Standard Hackathon
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

      {/* Main Active Hackathons Table Container */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Active Platform Hackathons</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-400">
                {hackathons.length} Live
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
            <p>No active hackathons matching &quot;{searchTerm}&quot; found.</p>
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
                        href={item.join_code ? `/h/${item.join_code}` : `/hackathons/${item.id}`}
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

      {/* Deleted / Suppressed Hackathons (Trash & Restore Registry) */}
      {deletedHackathons.length > 0 && (
        <div className="rounded-2xl bg-charcoal-900 border border-red-500/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Deleted Hackathons (Suppressed Site-Wide)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                {deletedHackathons.length} Suppressed
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Guaranteed hidden from directory, homepage &amp; workspace</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal-750 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-2 px-3">Title &amp; Organizer</th>
                  <th className="py-2 px-3">ID / Passcode</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {deletedHackathons.map((item) => (
                  <tr key={item.id} className="hover:bg-charcoal-850/40 text-slate-400">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-slate-300 line-through">{item.title}</p>
                        <p className="text-[11px] text-slate-500">{item.organizer}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      <span>{item.id}</span>
                      {item.join_code && <span className="block text-amber-500/70">Code: {item.join_code}</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreHackathon(item.id, item.title)}
                        isLoading={isRestoringId === item.id}
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                        className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                      >
                        Restore Hackathon
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Hackathon Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Hackathon"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">
                  Are you sure you want to delete &quot;{deleteTarget.title}&quot;?
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  This action permanently suppresses this hackathon across the entire website (directory, homepage, teacher portal, direct URL links, and local browser cache).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Organizer:</span>
                <span className="font-bold text-white">{deleteTarget.organizer || 'Campus Organizer'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Passcode / ID:</span>
                <span className="font-mono text-amber-300">{deleteTarget.join_code || deleteTarget.id}</span>
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

      {/* Host Big Company Sponsored Hackathon Modal */}
      {isSponsoredModalOpen && (
        <Modal
          isOpen={isSponsoredModalOpen}
          onClose={() => setIsSponsoredModalOpen(false)}
          title="🏢 Host Enterprise / Big Company Sponsored Hackathon"
        >
          <form onSubmit={handleCreateSponsoredHackathon} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Enterprise Spotlight Placement</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                When top tech companies hire Kollabrix to host hackathons, this will publish their competition with an animated priority aura, enterprise company badge, direct fast-track recruitment perks, and auto-sync with the collegiate deadlines radar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Amazon, Atlassian, NVIDIA"
                  value={sponsoredForm.company_name}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Priority Glowing Spotlight Aura
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['gold', 'cyan', 'purple', 'emerald'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSponsoredForm({ ...sponsoredForm, glow_color: color })}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold capitalize border transition-all ${
                        sponsoredForm.glow_color === color
                          ? color === 'gold'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                            : color === 'cyan'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                            : color === 'purple'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : 'bg-charcoal-800 text-slate-400 border-charcoal-700 hover:border-slate-500'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Hackathon Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google Cloud Apex GenAI Collegiate Hackathon 2026"
                value={sponsoredForm.title}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Challenge Overview &amp; Problem Focus
              </label>
              <textarea
                rows={2}
                placeholder="Describe what college students must build and the corporate vision..."
                value={sponsoredForm.tagline}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Prize Pool &amp; Grants
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹5,00,000 + ₹2,00,000 Cloud Credits"
                  value={sponsoredForm.prize_pool}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, prize_pool: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Competition Mode
                </label>
                <select
                  value={sponsoredForm.mode}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, mode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Online">Online / Global Virtual</option>
                  <option value="In-Person">In-Person Campus Hub</option>
                  <option value="Hybrid">Hybrid Sprint</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Direct Corporate Recruitment &amp; Hiring Perks
              </label>
              <input
                type="text"
                placeholder="e.g. Fast-track PPI interview for top 3 teams, 1:1 Director mentorship"
                value={sponsoredForm.recruitment_perks}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, recruitment_perks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Comma-separated hiring advantages that will be prominently showcased to attract top campus coders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  value={sponsoredForm.registration_deadline}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, registration_deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Result Announcement Date
                </label>
                <input
                  type="datetime-local"
                  value={sponsoredForm.results_date}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, results_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Themes &amp; Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Generative AI, Cloud Systems, Enterprise Architecture"
                value={sponsoredForm.themes}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, themes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Custom Sponsor Banner Image URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or company brand asset"
                value={sponsoredForm.banner_url}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, banner_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-750">
              <Button variant="ghost" type="button" onClick={() => setIsSponsoredModalOpen(false)} disabled={isSubmittingSponsored}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmittingSponsored}
                className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold"
                leftIcon={<Sparkles className="w-4 h-4 text-amber-200" />}
              >
                Launch Sponsored Hackathon
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
