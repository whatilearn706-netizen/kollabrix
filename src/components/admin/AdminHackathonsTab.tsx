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
  Shield,
  Users,
  Calendar,
  Lock,
  Globe,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Building2,
  Building,
  Award,
  Zap,
  Briefcase,
  Play,
  Palette,
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
    company_name: 'Kollabrix Innovation Ecosystem',
    company_logo: 'https://kollabrix.in/icon.png',
    sponsor_website_url: 'https://kollabrix.in',
    sponsor_tier: 'Official Title Sponsor',
    brand_color: '#F59E0B',
    title: 'Collegiate FastTrack Sprint: Winter 2026',
    tagline: 'Build. Innovate. Grow. — 6-Hour High-Velocity Engineering Sprint',
    description: '6-hour rapid engineering sprint: Prototyping viable digital infrastructure, campus productivity utilities, and intelligent tools with direct faculty review and cash grants.',
    rules: '1. All code and designs must be created during the official 6-hour hackathon window.\n2. Projects must address one of the released problem statement tracks.\n3. Public GitHub repository with full commit history is required.\n4. Plagiarism leads to immediate disqualification.',
    eligibility: 'Open to undergraduate and postgraduate students enrolled in accredited tertiary institutions. Inter-disciplinary teams encouraged.',
    mode: 'Online',
    location: 'Decentralized Campus Cloud / Virtual Submissions',
    start_date: '2026-11-21T21:00',
    end_date: '2026-11-22T03:00',
    registration_deadline: '2026-11-21T20:30',
    submission_deadline: '2026-11-22T03:00',
    submission_cutoff: '22 Nov 2026 • 03:00 am',
    result_announcement: '22 Nov 2026 • 06:00 pm',
    min_team_size: 1,
    max_team_size: 2,
    team_size_label: '1 - 2 Builders',
    prize_pool: '₹1,000 Equity-Free Winner Grant (Instant UPI Settlement)',
    hashtags: '#CampusSystemsInfrastructure, #AppliedAI, #DeveloperTooling, #OpenConsumerWeb',
    about_sponsor_headline: 'The Collegiate Innovation Network.',
    about_sponsor_description: 'Kollabrix unites high-caliber student engineers, faculty researchers, and industry networks into an unstoppable collegiate build arena.',
    benefit_1: '₹1,000 Direct Equity-Free Winner Grant',
    benefit_2: 'Verified Certificate of Merit',
    benefit_3: 'Faculty Jury Review & Critique',
    benefit_4: 'Permanent Proof-of-Work Portfolio',
    gift_callout_text: 'Endowed by Kollabrix Builders Fund: Instant UPI Winner Grant',
    guidelines_url: 'https://kollabrix.in',
    priority_rank: 10,
    banner_url: 'https://kollabrix.in/brand/kollabrix-holographic-banner.jpg',
    enable_recruiter_qr_pass: false,
  });

  const handleOpenCreateSponsored = () => {
    setEditingHackathonId(null);
    setSponsoredForm({
      company_name: 'Kollabrix Innovation Ecosystem',
      company_logo: 'https://kollabrix.in/icon.png',
      sponsor_website_url: 'https://kollabrix.in',
      sponsor_tier: 'Official Title Sponsor',
      brand_color: '#F59E0B',
      title: 'Collegiate FastTrack Sprint: Winter 2026',
      tagline: 'Build. Innovate. Grow. — 6-Hour High-Velocity Engineering Sprint',
      description: '6-hour rapid engineering sprint: Prototyping viable digital infrastructure, campus productivity utilities, and intelligent tools with direct faculty review and cash grants.',
      rules: '1. All code and designs must be created during the official 6-hour hackathon window.\n2. Projects must address one of the released problem statement tracks.\n3. Public GitHub repository with full commit history is required.\n4. Plagiarism leads to immediate disqualification.',
      eligibility: 'Open to undergraduate and postgraduate students enrolled in accredited tertiary institutions. Inter-disciplinary teams encouraged.',
      mode: 'Online',
      location: 'Decentralized Campus Cloud / Virtual Submissions',
      start_date: '2026-11-21T21:00',
      end_date: '2026-11-22T03:00',
      registration_deadline: '2026-11-21T20:30',
      submission_deadline: '2026-11-22T03:00',
      submission_cutoff: '22 Nov 2026 • 03:00 am',
      result_announcement: '22 Nov 2026 • 06:00 pm',
      min_team_size: 1,
      max_team_size: 2,
      team_size_label: '1 - 2 Builders',
      prize_pool: '₹1,000 Equity-Free Winner Grant (Instant UPI Settlement)',
      hashtags: '#CampusSystemsInfrastructure, #AppliedAI, #DeveloperTooling, #OpenConsumerWeb',
      about_sponsor_headline: 'The Collegiate Innovation Network.',
      about_sponsor_description: 'Kollabrix unites high-caliber student engineers, faculty researchers, and industry networks into an unstoppable collegiate build arena.',
      benefit_1: '₹1,000 Direct Equity-Free Winner Grant',
      benefit_2: 'Verified Certificate of Merit',
      benefit_3: 'Faculty Jury Review & Critique',
      benefit_4: 'Permanent Proof-of-Work Portfolio',
      gift_callout_text: 'Endowed by Kollabrix Builders Fund: Instant UPI Winner Grant',
      guidelines_url: 'https://kollabrix.in',
      priority_rank: 10,
      banner_url: 'https://kollabrix.in/brand/kollabrix-holographic-banner.jpg',
      enable_recruiter_qr_pass: false,
    });
    setIsSponsoredModalOpen(true);
  };

  const handleOpenEditTheme = (item: any) => {
    const meta = extractSponsoredMeta(item);
    setEditingHackathonId(item.id);
    const benefits = meta.eventBenefits || [];
    let cleanDesc = item.description || '';
    if (cleanDesc.includes('<!-- HACKATHON_META:')) {
      cleanDesc = cleanDesc.split('<!-- HACKATHON_META:')[0].trim();
    }

    setSponsoredForm({
      company_name: meta.companyName || item.organizer || '',
      company_logo: meta.sponsorLogoUrl || item.company_logo || item.logo_url || '',
      sponsor_website_url: meta.sponsorWebsiteUrl || '',
      sponsor_tier: meta.sponsorTier || 'Official Title Sponsor',
      brand_color: meta.brandColor || '#F59E0B',
      title: item.title || '',
      tagline: meta.tagline || 'Build. Innovate. Grow. —',
      description: cleanDesc || meta.tagline || item.title || '',
      rules: item.rules || '1. All code and designs must be created during the official hackathon window.\n2. Projects must address one of the released problem statements.\n3. Public GitHub repository with full commit history is required.\n4. Plagiarism leads to immediate disqualification.',
      eligibility: item.eligibility || 'Open to all college students & engineering developers.',
      mode: item.mode || 'Online',
      location: item.location || 'Decentralized Campus Cloud / Virtual Submissions',
      start_date: item.start_date ? item.start_date.slice(0, 16) : '',
      end_date: item.end_date ? item.end_date.slice(0, 16) : '',
      registration_deadline: item.registration_deadline ? item.registration_deadline.slice(0, 16) : '',
      submission_deadline: item.submission_deadline ? item.submission_deadline.slice(0, 16) : '',
      submission_cutoff: meta.submissionCutoff || '22 Nov 2026 • 03:00 am',
      result_announcement: meta.resultAnnouncement || '22 Nov 2026 • 06:00 pm',
      min_team_size: item.min_team_size || 1,
      max_team_size: item.max_team_size || 4,
      team_size_label: `${item.min_team_size || 1} - ${item.max_team_size || 4} Builders`,
      prize_pool: item.prize_pool || '₹1,000 Equity-Free Winner Grant',
      hashtags: Array.isArray(item.themes) ? item.themes.map((t: string) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(', ') : '#CampusSystemsInfrastructure, #AppliedAI',
      about_sponsor_headline: meta.aboutSponsorHeadline || "The Collegiate Innovation Network.",
      about_sponsor_description: meta.aboutSponsorDescription || `${meta.companyName || 'Kollabrix'} empowers developers, students and innovators to build for what's next.`,
      benefit_1: benefits[0] || '₹1,000 Direct Equity-Free Winner Grant',
      benefit_2: benefits[1] || 'Verified Certificate of Merit',
      benefit_3: benefits[2] || 'Faculty Jury Review & Critique',
      benefit_4: benefits[3] || 'Permanent Proof-of-Work Portfolio',
      gift_callout_text: meta.giftCalloutText || `Sponsored by ${meta.companyName || 'Kollabrix'}: Direct Winner Grant!`,
      guidelines_url: meta.guidelinesUrl || '',
      priority_rank: meta.priorityRank || 10,
      banner_url: item.banner_url || '',
      enable_recruiter_qr_pass: Boolean(meta.enableRecruiterQrPass || false),
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
          sponsor_website_url: sponsoredForm.sponsor_website_url,
          sponsor_tier: sponsoredForm.sponsor_tier,
          brand_color: sponsoredForm.brand_color,
          title: sponsoredForm.title,
          tagline: sponsoredForm.tagline,
          description: sponsoredForm.description || sponsoredForm.tagline,
          rules: sponsoredForm.rules,
          eligibility: sponsoredForm.eligibility,
          mode: sponsoredForm.mode,
          location: sponsoredForm.location,
          start_date: sponsoredForm.start_date || undefined,
          end_date: sponsoredForm.end_date || undefined,
          registration_deadline: sponsoredForm.registration_deadline || undefined,
          submission_deadline: sponsoredForm.submission_deadline || undefined,
          submission_cutoff: sponsoredForm.submission_cutoff,
          result_announcement: sponsoredForm.result_announcement,
          min_team_size: sponsoredForm.min_team_size,
          max_team_size: sponsoredForm.max_team_size,
          prize_pool: sponsoredForm.prize_pool,
          themes: sponsoredForm.hashtags.split(',').map((s) => s.replace('#', '').trim()).filter(Boolean),
          about_sponsor_headline: sponsoredForm.about_sponsor_headline,
          about_sponsor_description: sponsoredForm.about_sponsor_description,
          event_benefits: [
            sponsoredForm.benefit_1,
            sponsoredForm.benefit_2,
            sponsoredForm.benefit_3,
            sponsoredForm.benefit_4,
          ].filter(Boolean),
          gift_callout_text: sponsoredForm.gift_callout_text,
          guidelines_url: sponsoredForm.guidelines_url,
          priority_rank: sponsoredForm.priority_rank,
          banner_url: sponsoredForm.banner_url || undefined,
          enable_recruiter_qr_pass: Boolean(sponsoredForm.enable_recruiter_qr_pass),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save sponsored hackathon.');
      }

      setStatusMessage({
        type: 'success',
        text: isEdit
          ? `✨ Sponsored Hackathon "${sponsoredForm.title}" updated live!`
          : `✨ Success! ${sponsoredForm.company_name} Sponsored Hackathon "${sponsoredForm.title}" is now LIVE with priority placement and custom theme!`,
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
          maxWidth="5xl"
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

            {/* 3D Wave Keynote Sponsor Studio */}
            <div className="space-y-4">
              
              {/* SECTION 1: SPONSOR IDENTITY & BRAND LIGHTING */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>1. Sponsor Identity &amp; 3D Light Wave Accent</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">Step 1 of 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Company / Sponsor Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kollabrix, Google Cloud, Razorpay"
                      value={sponsoredForm.company_name}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, company_name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-300">
                        Sponsor / Brand Logo URL
                      </label>
                      <button
                        type="button"
                        onClick={() => setSponsoredForm({ ...sponsoredForm, company_logo: 'https://kollabrix.in/icon.png' })}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-mono underline cursor-pointer"
                      >
                        ⚡ Use Kollabrix Logo
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://kollabrix.in/icon.png"
                        value={sponsoredForm.company_logo}
                        onChange={(e) => setSponsoredForm({ ...sponsoredForm, company_logo: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                      />
                      {sponsoredForm.company_logo && (
                        <div className="w-8 h-8 rounded-lg bg-white/10 p-1 border border-white/20 shrink-0 flex items-center justify-center">
                          <img src={sponsoredForm.company_logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-charcoal-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Sponsor Website / Portal URL (&quot;Learn More ↗&quot;)
                    </label>
                    <input
                      type="url"
                      placeholder="https://kollabrix.in"
                      value={sponsoredForm.sponsor_website_url}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, sponsor_website_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      3D Light Wave Accent Glow
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {[
                          { name: 'Kollabrix Amber', color: '#F59E0B' },
                          { name: 'Electric Cyan', color: '#00E5FF' },
                          { name: 'Google Blue', color: '#3B82F6' },
                          { name: 'Solana Purple', color: '#A855F7' },
                          { name: 'Crimson Red', color: '#EF4444' },
                          { name: 'Emerald', color: '#10B981' },
                        ].map((c) => (
                          <button
                            type="button"
                            key={c.color}
                            onClick={() => setSponsoredForm({ ...sponsoredForm, brand_color: c.color })}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              sponsoredForm.brand_color === c.color ? 'scale-110 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <input
                        type="text"
                        value={sponsoredForm.brand_color}
                        onChange={(e) => setSponsoredForm({ ...sponsoredForm, brand_color: e.target.value })}
                        className="w-20 px-2 py-1 rounded-lg bg-charcoal-900 border border-charcoal-750 text-[11px] font-mono text-center text-white"
                        placeholder="#F59E0B"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: EVENT HEADLINE, LOGISTICS & MEDIA (NORMAL HOST FOUNDATION) */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Event Headline, Overview &amp; 16:9 Banner</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">Step 2 of 5</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Hackathon Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Collegiate FastTrack Sprint: Winter 2026"
                      value={sponsoredForm.title}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Event Mission / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Build. Innovate. Grow. — 6-Hour High-Velocity Sprint"
                      value={sponsoredForm.tagline}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, tagline: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Event Overview &amp; Problem Scope
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the collegiate objectives, challenges, and target builder tracks..."
                    value={sponsoredForm.description}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-1 border-t border-charcoal-800 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <label className="text-[11px] font-bold text-slate-300">
                      Event Banner Image URL (16:9 Recommended)
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSponsoredForm({ ...sponsoredForm, banner_url: 'https://kollabrix.in/brand/kollabrix-holographic-banner.jpg' })}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                      >
                        ⚡ 3D Holographic
                      </button>
                      <button
                        type="button"
                        onClick={() => setSponsoredForm({ ...sponsoredForm, banner_url: 'https://kollabrix.in/brand/kollabrix-seamless-hackathon-banner.jpg' })}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25"
                      >
                        ⚡ Seamless
                      </button>
                      <button
                        type="button"
                        onClick={() => setSponsoredForm({ ...sponsoredForm, banner_url: 'https://kollabrix.in/brand/hero-cyber-grid.jpg' })}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25"
                      >
                        ⚡ Cyber Grid
                      </button>
                    </div>
                  </div>
                  <input
                    type="url"
                    placeholder="https://kollabrix.in/brand/kollabrix-holographic-banner.jpg"
                    value={sponsoredForm.banner_url}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, banner_url: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                  {sponsoredForm.banner_url && (
                    <div className="mt-2 relative w-full h-32 rounded-xl overflow-hidden border border-charcoal-700 bg-black">
                      <img
                        src={sponsoredForm.banner_url}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/75 text-[9px] font-mono text-slate-300 border border-white/10">
                        16:9 Banner Preview
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-charcoal-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Venue &amp; Mode
                    </label>
                    <select
                      value={sponsoredForm.mode}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, mode: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    >
                      <option value="Online">Online / Virtual</option>
                      <option value="In-Person">In-Person (Campus)</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Total Prize &amp; Grants Pool
                    </label>
                    <input
                      type="text"
                      placeholder="₹1,000 Equity-Free Winner Grant"
                      value={sponsoredForm.prize_pool}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, prize_pool: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Team Size (Min - Max)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={sponsoredForm.min_team_size}
                        onChange={(e) => {
                          const minVal = parseInt(e.target.value) || 1;
                          setSponsoredForm({
                            ...sponsoredForm,
                            min_team_size: minVal,
                            team_size_label: `${minVal} - ${sponsoredForm.max_team_size} Builders`,
                          });
                        }}
                        className="w-16 px-2 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono text-center"
                      />
                      <span className="text-slate-400 text-xs">to</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={sponsoredForm.max_team_size}
                        onChange={(e) => {
                          const maxVal = parseInt(e.target.value) || 4;
                          setSponsoredForm({
                            ...sponsoredForm,
                            max_team_size: maxVal,
                            team_size_label: `${sponsoredForm.min_team_size} - ${maxVal} Builders`,
                          });
                        }}
                        className="w-16 px-2 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono text-center"
                      />
                      <span className="text-slate-400 text-[11px]">Builders</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 border-t border-charcoal-800">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Themes / Tracks (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Campus Systems, Applied AI, Developer Tooling, Open Consumer Web"
                    value={sponsoredForm.hashtags}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, hashtags: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-cyan-300 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* SECTION 3: OFFICIAL DATES & TIMELINE */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>3. Official Timeline &amp; Deadlines</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-400">Step 3 of 5</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Event Start Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={sponsoredForm.start_date}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, start_date: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Event End Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={sponsoredForm.end_date}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, end_date: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-charcoal-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      value={sponsoredForm.registration_deadline}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, registration_deadline: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-[11px] text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Submission Cut-off Label
                    </label>
                    <input
                      type="text"
                      placeholder="22 Nov 2026 • 03:00 am"
                      value={sponsoredForm.submission_cutoff}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, submission_cutoff: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-[11px] text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Result Announcement Label
                    </label>
                    <input
                      type="text"
                      placeholder="22 Nov 2026 • 06:00 pm"
                      value={sponsoredForm.result_announcement}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, result_announcement: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-[11px] text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: RULES & ELIGIBILITY */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Rules &amp; Student Eligibility</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Step 4 of 5</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Student Eligibility Requirements
                  </label>
                  <input
                    type="text"
                    placeholder="Open to undergraduate and postgraduate students enrolled in accredited tertiary institutions."
                    value={sponsoredForm.eligibility}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, eligibility: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Official Competition Rules (Numbered List)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="1. All code and designs must be created during the official hackathon window..."
                    value={sponsoredForm.rules}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, rules: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-slate-200 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* SECTION 5: "ABOUT THE SPONSOR" & "EVENT BENEFITS" CARDS */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-700/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-charcoal-750 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>5. Hero Banner &quot;About Sponsor&quot; &amp; &quot;Event Benefits&quot; Cards</span>
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">Step 5 of 5</span>
                </div>

                {/* About Sponsor Card Inputs */}
                <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-300 block">
                    Middle Card: &quot;About the Sponsor&quot;
                  </span>
                  <input
                    type="text"
                    placeholder="Headline: e.g. The Collegiate Innovation Network."
                    value={sponsoredForm.about_sponsor_headline}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, about_sponsor_headline: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-750 text-xs text-white font-bold"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description: e.g. Kollabrix unites high-caliber student engineers, faculty researchers..."
                    value={sponsoredForm.about_sponsor_description}
                    onChange={(e) => setSponsoredForm({ ...sponsoredForm, about_sponsor_description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-750 text-xs text-slate-200"
                  />
                </div>

                {/* Event Benefits Card Inputs (4 Checkmarks) */}
                <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-750 space-y-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-300 block">
                    Right Card: 4 &quot;Event Benefits&quot; Bullet Checkmarks
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Benefit 1: ₹1,000 Direct Equity-Free Winner Grant"
                      value={sponsoredForm.benefit_1}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, benefit_1: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-750 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Benefit 2: Verified Certificate of Merit"
                      value={sponsoredForm.benefit_2}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, benefit_2: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-750 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Benefit 3: Faculty Jury Review & Critique"
                      value={sponsoredForm.benefit_3}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, benefit_3: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-750 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Benefit 4: Permanent Proof-of-Work Portfolio"
                      value={sponsoredForm.benefit_4}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, benefit_4: e.target.value })}
                      className="px-2.5 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-750 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-charcoal-800">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Sidebar Gift Callout Card Text
                    </label>
                    <input
                      type="text"
                      placeholder="Endowed by Kollabrix Builders Fund: Instant UPI Winner Grant"
                      value={sponsoredForm.gift_callout_text}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, gift_callout_text: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Official Guidelines URL (&quot;Official Guidelines &amp; Portal ↗&quot;)
                    </label>
                    <input
                      type="url"
                      placeholder="https://kollabrix.in"
                      value={sponsoredForm.guidelines_url}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, guidelines_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                {/* Candidate Pass QR Code Toggle (Disabled by default) */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-charcoal-750">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      Candidate Recruiter QR Pass (Sidebar)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Uncheck to hide the QR verification pass widget from this hackathon (Clean view)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sponsoredForm.enable_recruiter_qr_pass}
                      onChange={(e) => setSponsoredForm({ ...sponsoredForm, enable_recruiter_qr_pass: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-charcoal-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* LIVE 3-ZONE 3D WAVE HERO BANNER PREVIEW */}
              <div className="p-4 rounded-2xl bg-[#050811] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: sponsoredForm.brand_color }}>
                    <Sparkles className="w-3.5 h-3.5" /> Live 3D Wave Keynote Banner Preview
                  </span>
                  <span>Responsive Desktop / Mobile</span>
                </div>

                <div
                  className="p-5 rounded-2xl border relative overflow-hidden space-y-4"
                  style={{
                    backgroundColor: '#050811',
                    borderColor: `${sponsoredForm.brand_color}50`,
                    boxShadow: `0 0 35px -10px ${sponsoredForm.brand_color}30`,
                  }}
                >
                  {/* Subtle Wave Lighting Mockup */}
                  <div
                    className="absolute -bottom-10 inset-x-0 h-28 blur-xl opacity-35 pointer-events-none"
                    style={{ backgroundColor: sponsoredForm.brand_color }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                    {/* Left preview */}
                    <div className="space-y-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border inline-block"
                        style={{
                          color: sponsoredForm.brand_color,
                          borderColor: `${sponsoredForm.brand_color}60`,
                          backgroundColor: `${sponsoredForm.brand_color}15`,
                        }}
                      >
                        ⭐ Sponsored Event
                      </span>
                      <h4 className="text-xs font-black text-white line-clamp-1">{sponsoredForm.title || 'Event Title'}</h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                        <span>Powered by</span>
                        {sponsoredForm.company_logo && (
                          <img src={sponsoredForm.company_logo} alt="Logo" className="h-3.5 w-auto object-contain max-w-[80px]" />
                        )}
                        <strong className="text-white">{sponsoredForm.company_name}</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{sponsoredForm.tagline}</p>
                    </div>

                    {/* Middle preview */}
                    <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold">About the Sponsor</span>
                      <div className="flex items-center gap-1.5">
                        {sponsoredForm.company_logo && (
                          <div className="w-5 h-5 rounded bg-white/10 p-0.5 shrink-0 flex items-center justify-center">
                            <img src={sponsoredForm.company_logo} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-white">{sponsoredForm.company_name}</span>
                      </div>
                      <p className="text-[9px] text-slate-300 line-clamp-2">{sponsoredForm.about_sponsor_description}</p>
                    </div>

                    {/* Right preview */}
                    <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 block font-bold">Event Benefits</span>
                      <div className="space-y-0.5 text-[9px] text-slate-200">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{sponsoredForm.benefit_1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{sponsoredForm.benefit_2}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
