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
  Zap,
  Briefcase,
  Play,
  Palette,
  Award,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  extractSponsoredMeta,
  SPONSOR_THEMES,
  SponsorThemePreset,
  getSponsorTheme,
} from '@/lib/hackathons/sponsoredMeta';

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
  const [isClearingDeleted, setIsClearingDeleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sponsored Hackathon Modal State
  const [isSponsoredModalOpen, setIsSponsoredModalOpen] = useState(false);
  const [editingHackathonId, setEditingHackathonId] = useState<string | null>(null);
  const [isSubmittingSponsored, setIsSubmittingSponsored] = useState(false);
  const [sponsoredForm, setSponsoredForm] = useState({
    company_name: '',
    company_logo: '',
    partner_name_2: '',
    partner_logo_2: '',
    title: '',
    tagline: '',
    theme_preset: 'custom' as SponsorThemePreset,
    primary_color: '#F59E0B',
    secondary_color: '#06B6D4',
    background_color: '#08080C',
    hero_asset_type: '3d_cloud' as '3d_cloud' | '3d_spline' | 'cyber_grid' | 'video' | 'custom_embed' | string,
    hero_asset_url: '',
    level_1_title: 'Level 1: Qualifier',
    level_1_perks: '$1,000 Cloud Credits + Sandbox Keys',
    level_2_title: 'Level 2: Finalist Hangar',
    level_2_perks: '1:1 Architecture Review with VP of Engineering',
    level_3_title: 'Level 3: Grand Laureate',
    level_3_perks: 'Direct Technical Interview Bypass (₹18-32 LPA CTC) + ₹10,00,000 Escrow',
    sandbox_endpoint: 'POST /v2/fintech/sprint/sandbox',
    starter_repo_url: 'https://github.com/kollabrix/enterprise-sprint-starter',
    candidate_pass_title: 'VERIFIED CANDIDATE ACCESS PASS',
    candidate_pass_rank: 'TIER-1 ARCHITECT',
    custom_cta_text: 'ENLIST FOR PPI TRIALS',
    live_shortlisted_count: 18,
    live_active_squads_count: 340,
    priority_rank: 10,
    hiring_roles: 'Backend Engineers, Systems Architects, Cloud Builders',
    hiring_package: '₹18-32 LPA CTC • ₹90k/mo Internship',
    prize_pool: '$25,000 USD Builder Grants Pool',
    recruitment_perks: 'Direct Fast-Track PPIs, 1:1 Architecture Reviews, $25k Grants',
    promo_video_url: '',
    mode: 'Online',
    registration_deadline: '',
    results_date: '',
    themes: 'Fintech, Cloud Architecture, Microservices',
    banner_url: '',
  });

  const handleOpenCreateSponsored = () => {
    setEditingHackathonId(null);
    setSponsoredForm({
      company_name: '',
      company_logo: '',
      partner_name_2: '',
      partner_logo_2: '',
      title: '',
      tagline: '',
      theme_preset: 'custom',
      primary_color: '#F59E0B',
      secondary_color: '#06B6D4',
      background_color: '#08080C',
      hero_asset_type: '3d_cloud',
      hero_asset_url: '',
      level_1_title: 'Level 1: Qualifier',
      level_1_perks: '$1,000 Cloud Credits + Sandbox Keys',
      level_2_title: 'Level 2: Finalist Hangar',
      level_2_perks: '1:1 Architecture Review with VP of Engineering',
      level_3_title: 'Level 3: Grand Laureate',
      level_3_perks: 'Direct Technical Interview Bypass (₹18-32 LPA CTC) + ₹10,00,000 Escrow',
      sandbox_endpoint: 'POST /v2/fintech/sprint/sandbox',
      starter_repo_url: 'https://github.com/kollabrix/enterprise-sprint-starter',
      candidate_pass_title: 'VERIFIED CANDIDATE ACCESS PASS',
      candidate_pass_rank: 'TIER-1 ARCHITECT',
      custom_cta_text: 'ENLIST FOR PPI TRIALS',
      live_shortlisted_count: 18,
      live_active_squads_count: 340,
      priority_rank: 10,
      hiring_roles: 'Backend Engineers, Systems Architects, Cloud Builders',
      hiring_package: '₹18-32 LPA CTC • ₹90k/mo Internship',
      prize_pool: '$25,000 USD Builder Grants Pool',
      recruitment_perks: 'Direct Fast-Track PPIs, 1:1 Architecture Reviews, $25k Grants',
      promo_video_url: '',
      mode: 'Online',
      registration_deadline: '',
      results_date: '',
      themes: 'Fintech, Cloud Architecture, Microservices',
      banner_url: '',
    });
    setIsSponsoredModalOpen(true);
  };

  const handleOpenEditTheme = (item: any) => {
    const meta = extractSponsoredMeta(item);
    setEditingHackathonId(item.id);
    setSponsoredForm({
      company_name: meta.companyName || item.organizer || '',
      company_logo: meta.sponsorLogoUrl || item.company_logo || '',
      partner_name_2: meta.partnerName2 || '',
      partner_logo_2: meta.partnerLogo2 || '',
      title: item.title || '',
      tagline: meta.tagline || (item.description ? item.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim() : ''),
      theme_preset: meta.themePreset || 'custom',
      primary_color: meta.customConfig?.primaryColor || '#F59E0B',
      secondary_color: meta.customConfig?.secondaryColor || '#06B6D4',
      background_color: meta.customConfig?.backgroundColor || '#08080C',
      hero_asset_type: meta.customConfig?.heroAssetType || '3d_cloud',
      hero_asset_url: meta.customConfig?.heroAssetUrl || '',
      level_1_title: meta.hiringLadder?.[0]?.title || 'Level 1: Qualifier',
      level_1_perks: meta.hiringLadder?.[0]?.perks || '$1,000 Cloud Credits + Sandbox Keys',
      level_2_title: meta.hiringLadder?.[1]?.title || 'Level 2: Finalist Hangar',
      level_2_perks: meta.hiringLadder?.[1]?.perks || '1:1 Architecture Review with VP of Engineering',
      level_3_title: meta.hiringLadder?.[2]?.title || 'Level 3: Grand Laureate',
      level_3_perks: meta.hiringLadder?.[2]?.perks || 'Direct Technical Interview Bypass (₹18-32 LPA CTC) + ₹10,00,000 Escrow',
      sandbox_endpoint: meta.developerSandbox?.endpoint || 'POST /v2/fintech/sprint/sandbox',
      starter_repo_url: meta.developerSandbox?.starterRepoUrl || 'https://github.com/kollabrix/enterprise-sprint-starter',
      candidate_pass_title: meta.candidatePassTitle || 'VERIFIED CANDIDATE ACCESS PASS',
      candidate_pass_rank: meta.candidatePassRank || 'TIER-1 ARCHITECT',
      custom_cta_text: meta.customCtaText || 'ENLIST FOR PPI TRIALS',
      live_shortlisted_count: meta.liveShortlistedCount || 18,
      live_active_squads_count: meta.liveActiveSquadsCount || 340,
      priority_rank: meta.priorityRank || 10,
      hiring_roles: meta.hiringRoles || '',
      hiring_package: meta.hiringPackage || '',
      prize_pool: item.prize_pool || '$25,000 USD Builder Grants',
      recruitment_perks: meta.recruitmentPerks.join(', ') || 'Direct Fast-Track PPIs, 1:1 Architecture Reviews, $25k Grants',
      promo_video_url: meta.promoVideoUrl || '',
      mode: item.mode || 'Online',
      registration_deadline: item.registration_deadline ? item.registration_deadline.slice(0, 16) : '',
      results_date: item.results_date ? item.results_date.slice(0, 16) : '',
      themes: Array.isArray(item.themes) ? item.themes.join(', ') : 'Fintech, Cloud Architecture, Microservices',
      banner_url: item.banner_url || '',
    });
    setIsSponsoredModalOpen(true);
  };

  const handleCreateOrUpdateSponsored = async (e: React.FormEvent) => {
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

      const isEdit = Boolean(editingHackathonId);
      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: isEdit ? 'update_sponsored_theme' : 'create_sponsored',
          hackathonId: editingHackathonId || undefined,
          company_name: sponsoredForm.company_name,
          company_logo: sponsoredForm.company_logo,
          partner_name_2: sponsoredForm.partner_name_2,
          partner_logo_2: sponsoredForm.partner_logo_2,
          theme_preset: 'custom',
          primary_color: sponsoredForm.primary_color,
          secondary_color: sponsoredForm.secondary_color,
          background_color: sponsoredForm.background_color,
          hero_asset_type: sponsoredForm.hero_asset_type,
          hero_asset_url: sponsoredForm.hero_asset_url,
          hiring_ladder: [
            { level: 1, title: sponsoredForm.level_1_title, perks: sponsoredForm.level_1_perks },
            { level: 2, title: sponsoredForm.level_2_title, perks: sponsoredForm.level_2_perks },
            { level: 3, title: sponsoredForm.level_3_title, perks: sponsoredForm.level_3_perks },
          ],
          developer_sandbox: {
            endpoint: sponsoredForm.sandbox_endpoint,
            starterRepoUrl: sponsoredForm.starter_repo_url,
            latencyMs: 130,
          },
          candidate_pass_title: sponsoredForm.candidate_pass_title,
          candidate_pass_rank: sponsoredForm.candidate_pass_rank,
          live_shortlisted_count: sponsoredForm.live_shortlisted_count,
          live_active_squads_count: sponsoredForm.live_active_squads_count,
          title: sponsoredForm.title,
          tagline: sponsoredForm.tagline,
          description: sponsoredForm.tagline,
          mode: sponsoredForm.mode,
          prize_pool: sponsoredForm.prize_pool,
          recruitment_perks: sponsoredForm.recruitment_perks,
          glow_color: 'custom',
          priority_rank: sponsoredForm.priority_rank,
          hiring_roles: sponsoredForm.hiring_roles,
          hiring_package: sponsoredForm.hiring_package,
          promo_video_url: sponsoredForm.promo_video_url,
          custom_cta_text: sponsoredForm.custom_cta_text,
          registration_deadline: sponsoredForm.registration_deadline || undefined,
          results_date: sponsoredForm.results_date || undefined,
          themes: sponsoredForm.themes.split(',').map((s) => s.trim()).filter(Boolean),
          banner_url: sponsoredForm.banner_url || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save sponsored hackathon theme.');
      }

      setStatusMessage({
        type: 'success',
        text: isEdit
          ? `✨ Bespoke theme for "${sponsoredForm.company_name}" has been updated live!`
          : `✨ Success! ${sponsoredForm.company_name} Sponsored Hackathon "${sponsoredForm.title}" is now LIVE with custom theme and enterprise architecture!`,
      });
      setIsSponsoredModalOpen(false);
      await loadHackathons();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error saving sponsored hackathon.' });
    } finally {
      setIsSubmittingSponsored(false);
    }
  };

  const handleToggleSponsored = async (target: any) => {
    try {
      setStatusMessage(null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'toggle_sponsored',
          hackathonId: target.id,
          priority_rank: 10,
          company_name: target.organizer || 'Corporate Sponsor',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle sponsored status.');
      }

      setStatusMessage({
        type: 'success',
        text: `✨ ${data.message}`,
      });
      await loadHackathons();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error updating sponsored status.' });
    }
  };

  const loadHackathons = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`/api/admin/hackathons?_t=${Date.now()}`, { headers, cache: 'no-store' });
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

  const handleClearAllDeleted = async () => {
    if (!confirm('Are you sure you want to restore all suppressed/deleted hackathons and reset the catalog?')) return;
    try {
      setIsClearingDeleted(true);
      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_deleted' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to clear deleted registry.' });
        return;
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('teamforge_deleted_hackathons');
      }
      setDeletedHackathons([]);
      setStatusMessage({ type: 'success', text: 'All suppressed hackathons have been restored to the live catalog!' });
      window.dispatchEvent(new CustomEvent('teamforge_hackathon_restored', { detail: { id: 'all' } }));
      await loadHackathons();
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error restoring hackathons.' });
    } finally {
      setIsClearingDeleted(false);
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
            onClick={handleOpenCreateSponsored}
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
                        {extractSponsoredMeta(item).isSponsored && (
                          <span className="inline-flex items-center gap-1 mt-1 font-mono text-[10px] text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                            ⚡ Sponsored ({extractSponsoredMeta(item).companyName || 'Corporate'}) • Priority #{extractSponsoredMeta(item).priorityRank}
                          </span>
                        )}
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
                      {/* Customize Brand Theme */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditTheme(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
                        title="Customize Brand Theme, Atmosphere, Logo & Perks"
                      >
                        <Palette className="w-3 h-3 text-purple-300" />
                        <span>Brand Theme</span>
                      </button>

                      {/* Toggle Corporate Sponsor */}
                      <button
                        type="button"
                        onClick={() => handleToggleSponsored(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                          extractSponsoredMeta(item).isSponsored
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-charcoal-800 text-slate-400 border-charcoal-700 hover:text-white'
                        }`}
                        title={extractSponsoredMeta(item).isSponsored ? 'Demote to Regular Collegiate' : 'Promote to Corporate Sponsored'}
                      >
                        <Zap className="w-3 h-3" />
                        <span>{extractSponsoredMeta(item).isSponsored ? 'Sponsored' : 'Make Sponsor'}</span>
                      </button>

                      {/* View Link */}
                      <Link
                        href={`/hackathons/${item.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 hover:text-white border border-charcoal-700 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-red-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Deleted Hackathons (Suppressed Site-Wide)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                {deletedHackathons.length} Suppressed
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Guaranteed hidden from directory &amp; workspace</span>
              <button
                type="button"
                onClick={handleClearAllDeleted}
                disabled={isClearingDeleted}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 transition-colors disabled:opacity-50"
              >
                {isClearingDeleted ? 'Restoring...' : 'Restore All / Reset Trash'}
              </button>
            </div>
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

      {/* Host / Configure Bespoke Corporate Sponsored Hackathon Modal */}
      {isSponsoredModalOpen && (
        <Modal
          isOpen={isSponsoredModalOpen}
          onClose={() => setIsSponsoredModalOpen(false)}
          title={
            editingHackathonId
              ? `🎨 Customize Brand Theme & Placement: ${sponsoredForm.company_name || 'Hackathon'}`
              : '🏢 Host Bespoke Corporate Sponsored Hackathon'
          }
        >
          <form onSubmit={handleCreateOrUpdateSponsored} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/30 text-xs text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bespoke Brand Placement Engine</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                Configure every sponsor&apos;s unique brand identity, visual atmosphere, hiring tracks, compensation guarantee, and video briefing. Faculty hackathons never appear here.
              </p>
            </div>

            {/* Bespoke Theme Studio (Built From Scratch - Zero Pre-baked Templates) */}
            <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-charcoal-750 pb-2.5">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Bespoke Theme &amp; Visual Studio (Build From Scratch)</span>
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Custom Brand Architecture
                </span>
              </div>

              {/* Color Pickers: Primary Accent & Secondary Glow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Primary Accent Color (Glow &amp; Action)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sponsoredForm.primary_color}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, primary_color: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-charcoal-700 bg-charcoal-900 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={sponsoredForm.primary_color}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, primary_color: e.target.value })}
                      placeholder="#F59E0B"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Secondary Accent Color (Data &amp; Badges)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sponsoredForm.secondary_color}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, secondary_color: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-charcoal-700 bg-charcoal-900 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={sponsoredForm.secondary_color}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, secondary_color: e.target.value })}
                      placeholder="#06B6D4"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Background Canvas Style & Hero Asset Engine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Background Atmosphere
                  </label>
                  {/* Quick Atmosphere Presets */}
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {[
                      { name: 'Obsidian', color: '#08080C' },
                      { name: 'Sapphire', color: '#0B1F4B' },
                      { name: 'Titanium', color: '#0F1117' },
                      { name: 'OLED Black', color: '#000000' },
                      { name: 'Cyber Emerald', color: '#031B15' },
                      { name: 'Velvet Violet', color: '#130722' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.color}
                        onClick={() => setSponsoredForm({ ...sponsoredForm, background_color: item.color })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono border flex items-center gap-1.5 transition-all ${
                          sponsoredForm.background_color?.toLowerCase() === item.color.toLowerCase()
                            ? 'border-amber-400 bg-amber-400/20 text-white font-bold'
                            : 'border-charcoal-700 bg-charcoal-900/60 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Native Color Picker & Hex Input for ANY Custom Atmosphere */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={sponsoredForm.background_color?.startsWith('#') ? sponsoredForm.background_color : '#08080C'}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, background_color: e.target.value })}
                      className="w-9 h-9 rounded-xl border border-charcoal-700 bg-charcoal-900 cursor-pointer p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={sponsoredForm.background_color}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, background_color: e.target.value })}
                      placeholder="#08080C"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Hero 3D Architecture Visual Engine
                  </label>
                  <select
                    value={sponsoredForm.hero_asset_type}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, hero_asset_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  >
                    <option value="3d_cloud">3D Holographic Cloud &amp; Volumetric Crucible</option>
                    <option value="3d_spline">Custom 3D Spline / glTF Interactive Scene</option>
                    <option value="cyber_grid">Cybernetic Perspective Data Grid</option>
                    <option value="video">High-Definition Looping Video Background</option>
                    <option value="custom_embed">Universal 3D Canvas / WebGL / Custom Embed URL</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    Choose from photorealistic 3D native engines or stream your own custom WebGL, Spline, or video assets.
                  </p>
                </div>
              </div>

              {sponsoredForm.hero_asset_type !== '3d_cloud' && (
                <div className="pt-2 border-t border-charcoal-750">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      3D Scene / Media / Custom Embed URL
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400">100% Extensible</span>
                  </div>
                  <input
                    type="url"
                    placeholder={
                      sponsoredForm.hero_asset_type === '3d_spline'
                        ? 'https://my.spline.design/scene-id...'
                        : sponsoredForm.hero_asset_type === 'video'
                        ? 'https://cdn.example.com/ambient-loop.mp4'
                        : 'https://my-custom-threejs-app.com or https://my.spline.design/...'
                    }
                    value={sponsoredForm.hero_asset_url}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, hero_asset_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono text-[11px] focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Supports Spline 3D embeds, Three.js canvases, MP4 video streams, or any responsive iframe URL. If left empty, a high-fidelity visual engine renders automatically.
                  </p>
                </div>
              )}
            </div>

            {/* Primary Sponsor & Secondary Co-Sponsor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Sponsor Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS"
                  value={sponsoredForm.company_name}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Sponsor Logo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://.../aws-logo.png"
                    value={sponsoredForm.company_logo}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, company_logo: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                  {sponsoredForm.company_logo && (
                    <div className="w-8 h-8 rounded-lg bg-white p-1 border border-white/30 shrink-0 flex items-center justify-center">
                      <img
                        src={sponsoredForm.company_logo}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dual Co-Sponsor (Partner 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded-2xl bg-charcoal-850/60 border border-charcoal-750/60">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Co-Sponsor Partner Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Razorpay"
                  value={sponsoredForm.partner_name_2}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, partner_name_2: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Co-Sponsor Partner Logo URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://.../razorpay-logo.png"
                    value={sponsoredForm.partner_logo_2}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, partner_logo_2: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono text-[11px]"
                  />
                  {sponsoredForm.partner_logo_2 && (
                    <div className="w-8 h-8 rounded-lg bg-white p-1 border border-white/30 shrink-0 flex items-center justify-center">
                      <img
                        src={sponsoredForm.partner_logo_2}
                        alt="Logo 2"
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hackathon Title & Tagline */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Hackathon Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google Solution Challenge 2026"
                value={sponsoredForm.title}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Brand Mission &amp; Promotional Tagline
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Build real-world AI & Cloud solutions for UN Global Goals with Google technologies. Direct interviews with engineering mentors."
                value={sponsoredForm.tagline}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Hiring Roles & Compensation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Hiring Roles</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI/ML, Cloud & Full-Stack Developers"
                  value={sponsoredForm.hiring_roles}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, hiring_roles: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Compensation / Stipend Guarantee
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹18-35 LPA Full-Time • ₹90k/mo Internship"
                  value={sponsoredForm.hiring_package}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, hiring_package: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Recruitment Perks & Prize Pool */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Prize Pool &amp; Escrow
                </label>
                <input
                  type="text"
                  placeholder="e.g. $100,000+ USD in bounties & track grants"
                  value={sponsoredForm.prize_pool}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, prize_pool: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Priority Rank (1 to 10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={sponsoredForm.priority_rank}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, priority_rank: parseInt(e.target.value) || 10 })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Recruitment Perks &amp; Fast-Track Advantages
              </label>
              <input
                type="text"
                placeholder="Google 1:1 Tech Mentorship, Global Incubator Fast-Track, Direct PPI Rounds"
                value={sponsoredForm.recruitment_perks}
                onChange={(e) => setSponsoredForm({ ...sponsoredForm, recruitment_perks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Executive Fast-Track Hiring Ladder (Levels 1 to 3) */}
            <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3">
              <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Executive Fast-Track Hiring Ladder (3-Level Progression)</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Direct ATS Bypass
                </span>
              </div>

              {/* Level 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Level 1 Title (e.g. Level 1: Qualifier)"
                  value={sponsoredForm.level_1_title}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, level_1_title: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Level 1 Perks (e.g. $1,000 Cloud Credits + Sandbox Keys)"
                  value={sponsoredForm.level_1_perks}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, level_1_perks: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-300"
                />
              </div>

              {/* Level 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Level 2 Title (e.g. Level 2: Finalist Hangar)"
                  value={sponsoredForm.level_2_title}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, level_2_title: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Level 2 Perks (e.g. 1:1 Architecture Review with VP of Engineering)"
                  value={sponsoredForm.level_2_perks}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, level_2_perks: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-300"
                />
              </div>

              {/* Level 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Level 3 Title (e.g. Level 3: Grand Laureate)"
                  value={sponsoredForm.level_3_title}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, level_3_title: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-amber-300 font-mono font-bold"
                />
                <input
                  type="text"
                  placeholder="Level 3 Perks (e.g. Direct Technical Interview Bypass + ₹10,00,000 Escrow)"
                  value={sponsoredForm.level_3_perks}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, level_3_perks: e.target.value })}
                  className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-300"
                />
              </div>
            </div>

            {/* Developer Sandbox & Terminal Configuration */}
            <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Developer Sandbox &amp; API Terminal Playground</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Live API Endpoint (cURL Playground)
                  </label>
                  <input
                    type="text"
                    placeholder="POST /v2/fintech/sprint/sandbox"
                    value={sponsoredForm.sandbox_endpoint}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, sandbox_endpoint: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-cyan-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    GitHub Starter Template Repository URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={sponsoredForm.starter_repo_url}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, starter_repo_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Candidate Access Pass & Live Telemetry Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Candidate Pass Title
                </label>
                <input
                  type="text"
                  value={sponsoredForm.candidate_pass_title}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, candidate_pass_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Candidate Rank Tier Badge
                </label>
                <input
                  type="text"
                  value={sponsoredForm.candidate_pass_rank}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, candidate_pass_rank: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Custom CTA Button Text
                </label>
                <input
                  type="text"
                  placeholder="ENLIST FOR PPI TRIALS"
                  value={sponsoredForm.custom_cta_text}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, custom_cta_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                />
              </div>
            </div>

            {/* Live Telemetry Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Shortlisted Candidates Count (Telemetry)
                </label>
                <input
                  type="number"
                  min="0"
                  value={sponsoredForm.live_shortlisted_count}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, live_shortlisted_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Active Squads Count in Sandbox (Telemetry)
                </label>
                <input
                  type="number"
                  min="0"
                  value={sponsoredForm.live_active_squads_count}
                  onChange={(e) => setSponsoredForm({ ...sponsoredForm, live_active_squads_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-cyan-300 font-mono"
                />
              </div>
            </div>

            {/* Live Interactive Card & Pass Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" /> Live Bespoke Brand Preview
                </span>
                <span>Priority #{sponsoredForm.priority_rank}</span>
              </div>
              <div
                className="p-5 rounded-2xl border transition-all space-y-3 shadow-xl relative overflow-hidden"
                style={{
                  backgroundColor: sponsoredForm.background_color || '#08080C',
                  borderColor: `${sponsoredForm.primary_color}60`,
                  boxShadow: `0 0 35px -8px ${sponsoredForm.primary_color}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sponsoredForm.company_logo ? (
                      <div className="w-8 h-8 rounded-lg bg-white p-1 border border-white/30 shrink-0 flex items-center justify-center">
                        <img src={sponsoredForm.company_logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${sponsoredForm.primary_color}25`, color: sponsoredForm.primary_color }}
                      >
                        ⚡
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-black text-white">{sponsoredForm.company_name || 'Brand Name'}</span>
                      {sponsoredForm.partner_name_2 && (
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">× {sponsoredForm.partner_name_2}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: sponsoredForm.primary_color,
                      borderColor: `${sponsoredForm.primary_color}60`,
                      backgroundColor: `${sponsoredForm.primary_color}15`,
                    }}
                  >
                    ⭐ Featured #{sponsoredForm.priority_rank}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">{sponsoredForm.title || 'Challenge Title'}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{sponsoredForm.tagline || 'Brand promotional mission statement...'}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span className="text-slate-400">Prize Pool: <strong className="text-white">{sponsoredForm.prize_pool}</strong></span>
                  <span className="text-emerald-400 font-bold">{sponsoredForm.hiring_package || '₹18-32 LPA'}</span>
                </div>
                <div
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-black text-center shadow-md text-black transition-all cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${sponsoredForm.primary_color} 0%, ${sponsoredForm.secondary_color} 100%)`,
                  }}
                >
                  {sponsoredForm.custom_cta_text || 'ENLIST FOR PPI TRIALS'} →
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-charcoal-750">
              <Button variant="ghost" type="button" onClick={() => setIsSponsoredModalOpen(false)} disabled={isSubmittingSponsored}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmittingSponsored}
                className="bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black shadow-lg"
                leftIcon={<Sparkles className="w-4 h-4 text-amber-200" />}
              >
                {editingHackathonId ? 'Save Brand Customization' : 'Launch Sponsored Challenge'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
