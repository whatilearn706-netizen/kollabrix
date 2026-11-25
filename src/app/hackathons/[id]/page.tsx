'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Hackathon } from '@/types/database';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { normalizeHackathonDeadlines, getHackathonTimelineEndDate } from '@/lib/hackathons/hackathonStatus';
import { Button } from '@/components/ui/Button';
import {
  Trophy,
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Users,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Layers,
  Award,
  Zap,
  HelpCircle,
  Code2,
  Send,
  UserPlus,
  GraduationCap,
  Globe,
  Heart,
  RefreshCw,
  Building2,
  Briefcase,
  Play,
  Flame,
  Terminal,
  Headphones,
  Mail,
  ChevronRight,
} from 'lucide-react';
import QRCode from 'qrcode';
import { extractSponsoredMeta, CustomTimelineStage } from '@/lib/hackathons/sponsoredMeta';
import { openProfileEditModal } from '@/components/profile/modal/ProfileEditModal';
import { HackathonDetailRightRail } from '@/components/hackathons/HackathonDetailRightRail';

/**
 * Formats date and time in a crisp, localized, 12-hour format with AM/PM
 * e.g. "10 Nov 2026 • 10:50 PM"
 */
function formatEventDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'TBA';
  const dateFormatted = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateFormatted} • ${timeFormatted}`;
}
function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function parseCustomOrIsoDate(dateStr?: string | null): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();

  // Handle DD/MM/YYYY or DD-MM-YYYY formats with optional time:
  // e.g. "26/11/2026 11:59 PM" or "02/12/2026 6:00 PM" or "26/11/2026, 11:59 PM"
  const ddmmyyyyMatch = trimmed.match(
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:(?:\s+|[•,at\s]+)(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([APap][Mm]))?)?/
  );

  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    let hour = ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0;
    const min = ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0;
    const sec = ddmmyyyyMatch[6] ? parseInt(ddmmyyyyMatch[6], 10) : 0;
    const ampm = ddmmyyyyMatch[7] ? ddmmyyyyMatch[7].toUpperCase() : null;

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    const d = new Date(year, month, day, hour, min, sec);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }

  // Try standard ISO/RFC parsing
  const isoDate = new Date(trimmed);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  return null;
}

function formatMilestoneDate(dateStr?: string | null): string {
  if (!dateStr || !dateStr.trim()) return 'TBA';
  const trimmed = dateStr.trim();
  const parsed = parseCustomOrIsoDate(trimmed);
  if (parsed) {
    const dateFormatted = parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = parsed.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateFormatted} • ${timeFormatted}`;
  }
  return trimmed;
}

const milestoneColorClasses = [
  {
    orb: 'bg-cyan-500/15 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]',
    badge: 'text-cyan-300 bg-cyan-950/80 border-cyan-800/80',
    cardBorder: 'border-cyan-900/30 hover:border-cyan-500/50',
    accentText: 'text-cyan-400',
  },
  {
    orb: 'bg-purple-500/15 border-2 border-purple-400 text-purple-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]',
    badge: 'text-purple-300 bg-purple-950/80 border-purple-800/80',
    cardBorder: 'border-purple-900/30 hover:border-purple-500/50',
    accentText: 'text-purple-400',
  },
  {
    orb: 'bg-amber-500/15 border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
    badge: 'text-amber-300 bg-amber-950/80 border-amber-800/80',
    cardBorder: 'border-amber-900/30 hover:border-amber-500/50',
    accentText: 'text-amber-400',
  },
  {
    orb: 'bg-emerald-500/15 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
    badge: 'text-emerald-300 bg-emerald-950/80 border-emerald-800/80',
    cardBorder: 'border-emerald-900/30 hover:border-emerald-500/50',
    accentText: 'text-emerald-400',
  },
  {
    orb: 'bg-rose-500/15 border-2 border-rose-400 text-rose-300 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]',
    badge: 'text-rose-300 bg-rose-950/80 border-rose-800/80',
    cardBorder: 'border-rose-900/30 hover:border-rose-500/50',
    accentText: 'text-rose-400',
  },
  {
    orb: 'bg-blue-500/15 border-2 border-blue-400 text-blue-300 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]',
    badge: 'text-blue-300 bg-blue-950/80 border-blue-800/80',
    cardBorder: 'border-blue-900/30 hover:border-blue-500/50',
    accentText: 'text-blue-400',
  },
];


export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();
  const { theme, isDark } = useSiteTheme();
  const hackathonId = (params?.id as string) || '';

  // Synchronous Cache Lookup for Instant 0ms Rendering
  const getCachedHackathon = (id: string): Hackathon | null => {
    if (!id || typeof window === 'undefined') return null;
    const clean = id.trim();
    let hack: any = null;
    try {
      const sess = sessionStorage.getItem(`linkora_hack_${clean}`);
      if (sess) hack = JSON.parse(sess);
    } catch {}
    if (!hack) {
      try {
        const catalog = JSON.parse(localStorage.getItem('linkora_hackathons_catalog') || '[]');
        const match = catalog.find((h: any) => h.id === clean || h.join_code === clean);
        if (match) hack = match;
      } catch {}
    }
    if (!hack) {
      try {
        const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
        const match = localHacks.find((h: any) => h.id === clean || h.join_code === clean);
        if (match) hack = match;
      } catch {}
    }
    if (!hack) {
      const curated = CURATED_HACKATHONS.find(
        (ch) => ch.id === clean || ch.join_code === clean || ch.id.toLowerCase() === clean.toLowerCase()
      );
      if (curated) hack = curated;
    }
    if (hack) {
      if (hack.description?.includes('<!-- HACKATHON_META:')) {
        try {
          const metaMatch = hack.description.match(/<!-- HACKATHON_META:([\s\S]*?)-->/);
          if (metaMatch && metaMatch[1]) {
            const meta = JSON.parse(metaMatch[1]);
            hack = {
              ...hack,
              submission_deadline: hack.submission_deadline || meta.submission_deadline || hack.submissionDeadline || null,
              results_date: hack.results_date || meta.results_date || hack.resultsDate || null,
              contact_info: hack.contact_info || meta.contact_info || (hack as any).contactInfo || null,
              allowed_college: hack.allowed_college || meta.allowed_college || (hack as any).allowedCollege || null,
              allowed_roll_start: (hack as any).allowed_roll_start || meta.allowed_roll_start || null,
              allowed_roll_end: (hack as any).allowed_roll_end || meta.allowed_roll_end || null,
              about_sponsor_headline: meta.about_sponsor_headline || (hack as any).about_sponsor_headline,
              about_sponsor_description: meta.about_sponsor_description || (hack as any).about_sponsor_description,
              event_benefits: meta.event_benefits || (hack as any).event_benefits,
              gift_callout_text: meta.gift_callout_text || (hack as any).gift_callout_text,
              guidelines_url: meta.guidelines_url || (hack as any).guidelines_url,
              sponsor_website_url: meta.sponsor_website_url || (hack as any).sponsor_website_url,
              submission_cutoff: meta.submission_cutoff || (hack as any).submission_cutoff,
              result_announcement: meta.result_announcement || (hack as any).result_announcement,
              custom_timeline: meta.custom_timeline || meta.customTimeline || (hack as any).custom_timeline,
              customTimeline: meta.custom_timeline || meta.customTimeline || (hack as any).customTimeline,
              rawDescription: hack.description,
              enable_recruiter_qr_pass: Boolean(meta.enable_recruiter_qr_pass ?? meta.enableRecruiterQrPass ?? (hack as any).enable_recruiter_qr_pass ?? (hack as any).enableRecruiterQrPass),
              enableRecruiterQrPass: Boolean(meta.enable_recruiter_qr_pass ?? meta.enableRecruiterQrPass ?? (hack as any).enable_recruiter_qr_pass ?? (hack as any).enableRecruiterQrPass),
              tagline: meta.tagline || (hack as any).tagline,
              custom_cta_text: meta.custom_cta_text || (hack as any).custom_cta_text,
            };
          }
        } catch {}
      }
      return normalizeHackathonDeadlines(hack) as Hackathon;
    }
    return null;
  };

  const initialCached = useMemo(() => getCachedHackathon(hackathonId), [hackathonId]);
  const [hackathon, setHackathon] = useState<Hackathon | null>(() => initialCached);
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialCached);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [registeredCount, setRegisteredCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'themes' | 'schedule' | 'rules'>('overview');
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && hackathon?.id) {
      QRCode.toDataURL(window.location.href, {
        width: 256,
        margin: 1,
        color: { dark: '#0A0D16', light: '#ffffff' },
      })
        .then((url) => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [hackathon?.id]);

  // Load Hackathon details with maximum resilience & 0ms perceived latency
  const loadHackathon = useCallback(async () => {
    if (!hackathonId) return;
    const cleanId = hackathonId.trim();

    // If no initial cache found, set loading; otherwise let cached data render smoothly
    if (!hackathon) {
      setIsLoading(true);
    }
    setError(null);

    try {
      let currentHack: Hackathon | null = null;
      const isParamUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

      // Fast Direct Single Query from Supabase (40ms)
      if (isSupabaseConfigured()) {
        try {
          const query = isParamUUID
            ? supabase.from('hackathons').select('*').eq('id', cleanId).maybeSingle()
            : supabase.from('hackathons').select('*').eq('join_code', cleanId).maybeSingle();

          const { data: hackData } = await query;
          if (hackData) currentHack = hackData as Hackathon;
        } catch (err) {
          console.warn('Direct fetch from Supabase:', err);
        }

        if (!currentHack && !isParamUUID) {
          try {
            const { data: byUrl } = await supabase
              .from('hackathons')
              .select('*')
              .ilike('website_url', `%/h/${cleanId}%`)
              .limit(1)
              .maybeSingle();
            if (byUrl) currentHack = byUrl as Hackathon;
          } catch {}

          if (!currentHack) {
            try {
              const { data: byDesc } = await supabase
                .from('hackathons')
                .select('*')
                .ilike('description', `%"join_code":"${cleanId}"%`)
                .limit(1)
                .maybeSingle();
              if (byDesc) currentHack = byDesc as Hackathon;
            } catch {}
          }
        }
      }

      // Check LocalStorage created hackathons
      if (!currentHack && typeof window !== 'undefined') {
        try {
          const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const match = localHacks.find((h: any) => h.id === cleanId || h.join_code === cleanId);
          if (match) currentHack = match;
        } catch {}
      }

      // Fallback to CURATED_HACKATHONS
      if (!currentHack) {
        const curated = CURATED_HACKATHONS.find(
          (ch) => ch.id === cleanId || ch.join_code === cleanId || ch.id.toLowerCase() === cleanId.toLowerCase()
        );
        if (curated) currentHack = curated as Hackathon;
      }

      // Fallback: Query /api/hackathons endpoint
      if (!currentHack) {
        try {
          const res = await fetch('/api/hackathons');
          const data = await res.json();
          if (res.ok && data.success && Array.isArray(data.hackathons)) {
            const found = data.hackathons.find(
              (h: any) =>
                h.id === cleanId ||
                h.join_code === cleanId ||
                (h.id && h.id.toLowerCase() === cleanId.toLowerCase()) ||
                (h.join_code && h.join_code.toLowerCase() === cleanId.toLowerCase())
            );
            if (found) currentHack = found as Hackathon;
          }
        } catch {}
      }

      if (!currentHack) {
        setError('Hackathon not found. It may have expired or been removed.');
        setIsLoading(false);
        return;
      }

      // Strip metadata comments if present
      if (currentHack.description?.includes('<!-- HACKATHON_META:')) {
        try {
          const metaMatch = currentHack.description.match(/<!-- HACKATHON_META:([\s\S]*?)-->/);
          if (metaMatch && metaMatch[1]) {
            const meta = JSON.parse(metaMatch[1]);
            currentHack = {
              ...currentHack,
              min_team_size: meta.min_team_size || currentHack.min_team_size || 1,
              max_team_size: meta.max_team_size || currentHack.max_team_size || 4,
              access_type: meta.access_type || currentHack.access_type || 'public',
              join_code: meta.join_code || currentHack.join_code,
              logo_url: meta.logo_url || currentHack.logo_url || currentHack.company_logo || meta.sponsor_logo_url,
              company_logo: meta.logo_url || currentHack.logo_url || currentHack.company_logo || meta.sponsor_logo_url,
              eligibility: meta.eligibility || currentHack.eligibility,
              banner_url: meta.banner_url || currentHack.banner_url,
              contact_info: currentHack.contact_info || meta.contact_info || (currentHack as any).contactInfo || null,
              allowed_college: currentHack.allowed_college || meta.allowed_college || (currentHack as any).allowedCollege || null,
              allowed_roll_start: (currentHack as any).allowed_roll_start || meta.allowed_roll_start || null,
              allowed_roll_end: (currentHack as any).allowed_roll_end || meta.allowed_roll_end || null,
              website_url: meta.external_website_url || meta.website_url || currentHack.website_url || (currentHack as any).websiteUrl || null,
              is_sponsored: meta.is_sponsored ?? currentHack.is_sponsored,
              is_enterprise: meta.is_enterprise ?? currentHack.is_enterprise,
              company_name: meta.company_name || currentHack.company_name,
              glow_color: meta.glow_color || currentHack.glow_color,
              priority_rank: meta.priority_rank || currentHack.priority_rank,
              recruitment_perks: meta.recruitment_perks || currentHack.recruitment_perks,
              hiring_roles: meta.hiring_roles || currentHack.hiring_roles,
              submission_deadline: currentHack.submission_deadline || meta.submission_deadline || (currentHack as any).submissionDeadline || null,
              results_date: currentHack.results_date || meta.results_date || (currentHack as any).resultsDate || null,
              about_sponsor_headline: meta.about_sponsor_headline || (currentHack as any).about_sponsor_headline,
              about_sponsor_description: meta.about_sponsor_description || (currentHack as any).about_sponsor_description,
              event_benefits: meta.event_benefits || (currentHack as any).event_benefits,
              gift_callout_text: meta.gift_callout_text || (currentHack as any).gift_callout_text,
              guidelines_url: meta.guidelines_url || (currentHack as any).guidelines_url,
              sponsor_website_url: meta.sponsor_website_url || (currentHack as any).sponsor_website_url,
              submission_cutoff: meta.submission_cutoff || (currentHack as any).submission_cutoff,
              result_announcement: meta.result_announcement || (currentHack as any).result_announcement,
              custom_timeline: meta.custom_timeline || meta.customTimeline || (currentHack as any).custom_timeline,
              customTimeline: meta.custom_timeline || meta.customTimeline || (currentHack as any).customTimeline,
              tracks: meta.tracks || currentHack.tracks,
              rawDescription: currentHack.description,
              enable_recruiter_qr_pass: Boolean(meta.enable_recruiter_qr_pass ?? meta.enableRecruiterQrPass ?? (currentHack as any).enable_recruiter_qr_pass ?? (currentHack as any).enableRecruiterQrPass),
              enableRecruiterQrPass: Boolean(meta.enable_recruiter_qr_pass ?? meta.enableRecruiterQrPass ?? (currentHack as any).enable_recruiter_qr_pass ?? (currentHack as any).enableRecruiterQrPass),
              tagline: meta.tagline || currentHack.tagline,
              custom_cta_text: meta.custom_cta_text || (currentHack as any).custom_cta_text,
              registration_url: meta.registration_url || meta.external_registration_url || (currentHack as any).registration_url || null,
              external_registration_url: meta.registration_url || meta.external_registration_url || (currentHack as any).external_registration_url || null,
              is_external_registration: Boolean(meta.is_external_registration || meta.registration_url || meta.external_registration_url || (currentHack as any).is_external_registration),
              description: currentHack.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim(),
            };
          }
        } catch {}
      }

      if (!currentHack) {
        setIsLoading(false);
        return;
      }

      if (!currentHack.submission_deadline && (currentHack as any).submissionDeadline) {
        currentHack.submission_deadline = (currentHack as any).submissionDeadline;
      }
      if (!currentHack.results_date && (currentHack as any).resultsDate) {
        currentHack.results_date = (currentHack as any).resultsDate;
      }

      if (typeof window !== 'undefined' && (!currentHack.results_date || !currentHack.submission_deadline)) {
        try {
          const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
          const localMatch = localHacks.find(
            (h: any) => h.id === currentHack?.id || (currentHack?.join_code && h.join_code === currentHack?.join_code)
          );
          if (localMatch) {
            if (!currentHack.results_date && (localMatch.results_date || localMatch.resultsDate)) {
              currentHack.results_date = localMatch.results_date || localMatch.resultsDate;
            }
            if (!currentHack.submission_deadline && (localMatch.submission_deadline || localMatch.submissionDeadline)) {
              currentHack.submission_deadline = localMatch.submission_deadline || localMatch.submissionDeadline;
            }
          }
        } catch {}
      }

      currentHack = normalizeHackathonDeadlines(currentHack);
      setHackathon(currentHack);
      setIsLoading(false); // UNBLOCK IMMEDIATELY

      // Cache locally for instantaneous returns
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`linkora_hack_${cleanId}`, JSON.stringify(currentHack));
        } catch {}
      }

      // Fetch Real Count of Registered Participants asynchronously in background
      if (isSupabaseConfigured() && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentHack.id)) {
        supabase
          .from('hackathon_participants')
          .select('*', { count: 'exact', head: true })
          .eq('hackathon_id', currentHack.id)
          .then(
            ({ count }) => {
              if (typeof count === 'number') {
                setRegisteredCount(count);
              } else if (currentHack?.participants_count) {
                setRegisteredCount(currentHack.participants_count);
              }
            },
            () => {
              if (currentHack?.participants_count) setRegisteredCount(currentHack.participants_count);
            }
          );
      } else {
        setRegisteredCount(currentHack.participants_count || 0);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading hackathon');
      setIsLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    loadHackathon();
  }, [loadHackathon]);

  // Decoupled Background Enrollment & Saved Status
  useEffect(() => {
    if (!hackathon?.id) return;

    if (typeof window !== 'undefined') {
      try {
        const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
        if (
          enrolled.includes(hackathon.id) ||
          (hackathon.join_code && enrolled.includes(hackathon.join_code))
        ) {
          setIsEnrolled(true);
        }

        const saved = JSON.parse(localStorage.getItem('teamforge_saved_hackathons') || '[]');
        if (saved.includes(hackathon.id)) {
          setIsSaved(true);
        }
      } catch {}
    }

    if (user && isSupabaseConfigured() && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hackathon.id)) {
      supabase
        .from('hackathon_participants')
        .select('id')
        .eq('hackathon_id', hackathon.id)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(
          ({ data }) => {
            if (data) setIsEnrolled(true);
          },
          () => {}
        );
    }
  }, [user?.id, hackathon?.id, hackathon?.join_code]);

  // Hackathon Sprint Start Status
  const isStarted = useMemo(() => {
    if (!hackathon?.start_date) return false;
    return new Date(hackathon.start_date).getTime() <= Date.now();
  }, [hackathon?.start_date]);

  // Sponsored & Corporate Metadata
  const sponsoredMeta = useMemo(() => {
    return extractSponsoredMeta(hackathon);
  }, [hackathon]);

  // Dynamic Timeline Stages with Fallback Defaults
  const timelineStages: CustomTimelineStage[] = useMemo(() => {
    if (Array.isArray(sponsoredMeta.customTimeline) && sponsoredMeta.customTimeline.length > 0) {
      return sponsoredMeta.customTimeline;
    }
    if (Array.isArray((hackathon as any)?.custom_timeline) && (hackathon as any).custom_timeline.length > 0) {
      return (hackathon as any).custom_timeline;
    }
    if (Array.isArray((hackathon as any)?.customTimeline) && (hackathon as any).customTimeline.length > 0) {
      return (hackathon as any).customTimeline;
    }
    return [
      {
        title: 'Registration Deadline',
        date: hackathon?.registration_deadline ? formatEventDateTime(hackathon.registration_deadline) : '',
        description: 'All builders must register and finalize squad rosters before this deadline.',
      },
      {
        title: 'Hackathon Opening Ceremony & Sprint Start',
        date: hackathon?.start_date ? formatEventDateTime(hackathon.start_date) : '',
        description: 'Hacking commences! Access workspace boards, mentor sprint huddles, and challenge briefs.',
      },
      {
        title: 'Deliverable Submission Deadline',
        date: hackathon?.submission_deadline
          ? formatEventDateTime(hackathon.submission_deadline)
          : (hackathon as any)?.submissionDeadline
          ? formatEventDateTime((hackathon as any).submissionDeadline)
          : hackathon?.end_date
          ? formatEventDateTime(hackathon.end_date)
          : 'Sprint Finale',
        description: 'Submit repository link, architecture demo video, and interactive prototype for jury review.',
      },
      {
        title: 'Result Declared & Winners Announced',
        date: hackathon?.results_date
          ? formatEventDateTime(hackathon.results_date)
          : (hackathon as any)?.resultsDate
          ? formatEventDateTime((hackathon as any).resultsDate)
          : hackathon?.end_date
          ? formatEventDateTime(hackathon.end_date)
          : 'To Be Announced',
        description: 'Official faculty jury evaluations complete, final collegiate rankings published, and certificates released.',
      },
    ];
  }, [sponsoredMeta.customTimeline, hackathon]);

  // External Registration Detection: When registration occurs on an external portal (Unstop, Devfolio, Google Forms, official site)
  const externalRegistrationUrl = useMemo(() => {
    if (!hackathon) return null;
    return (
      hackathon.registration_url ||
      (hackathon as any).external_registration_url ||
      sponsoredMeta.registrationUrl ||
      sponsoredMeta.externalRegistrationUrl ||
      ((hackathon as any).is_external_registration && hackathon.website_url && !hackathon.website_url.includes('/h/') ? hackathon.website_url : null) ||
      (hackathon.website_url && !hackathon.website_url.includes('/h/') && (hackathon.website_url.startsWith('http://') || hackathon.website_url.startsWith('https://')) && (sponsoredMeta.customCtaText?.toLowerCase().includes('official') || sponsoredMeta.customCtaText?.toLowerCase().includes('register on')) ? hackathon.website_url : null)
    );
  }, [hackathon, sponsoredMeta]);

  const isExternalRegistration = useMemo(() => {
    if (!hackathon) return false;
    return Boolean(
      externalRegistrationUrl ||
      sponsoredMeta.isExternalRegistration ||
      (hackathon as any).is_external_registration
    );
  }, [hackathon, externalRegistrationUrl, sponsoredMeta]);

  const heroBanner = hackathon?.banner_url || sponsoredMeta.bannerUrl;
  const eventLogo = hackathon?.logo_url || hackathon?.company_logo || sponsoredMeta.sponsorLogoUrl;

  // Dynamic Social Proof Counter (Solves cold start exclusively for this specific FastTrack sprint; all other hackathons start cleanly at 0)
  const displayRegisteredCount = useMemo(() => {
    const isTargetSprint = hackathon?.id === '9892b319-0efa-4743-9411-afd6652ce3b5';
    const baseCount = isTargetSprint ? 23 : 0;
    if (registeredCount <= 0) return baseCount;
    return baseCount > 0 ? (baseCount + registeredCount - 1) : registeredCount;
  }, [registeredCount, hackathon?.id]);

  // Profile-based Eligibility Evaluation
  const eligibilityEvaluation = useMemo(() => {
    // If the student is ALREADY registered / enrolled in this hackathon, they are 100% eligible & confirmed!
    if (isEnrolled) {
      return { isEligible: true, reason: null };
    }

    const rawCrit = (hackathon?.eligibility || '').toLowerCase().trim();
    const allowedCollege = (hackathon?.allowed_college || '').trim().toLowerCase();

    if (!user) {
      return { isEligible: true, reason: 'Sign in to confirm registration eligibility.' };
    }

    // Hydrate verification & collegiate credentials from all available synchronous caches
    const localProfile = typeof window !== 'undefined' ? (() => {
      try {
        return JSON.parse(localStorage.getItem('linkora_auth_profile') || '{}');
      } catch {
        return {};
      }
    })() : {};

    const localVerified = typeof window !== 'undefined' && (
      localStorage.getItem('linkora_college_verified') === 'true' ||
      (user?.id && localStorage.getItem(`linkora_college_verified_${user.id}`) === 'true')
    );

    const isVerified = Boolean(
      profile?.college_verified ||
      profile?.faculty_verified ||
      (profile as any)?.student_verified ||
      (profile as any)?.id_verified ||
      user?.user_metadata?.college_verified ||
      user?.user_metadata?.faculty_verified ||
      localProfile?.college_verified ||
      localVerified
    );

    const activeCollege = (
      profile?.college ||
      localProfile?.college ||
      (user?.user_metadata as any)?.college ||
      ''
    ).trim();

    const activeYear = (
      profile?.academic_year ||
      localProfile?.academic_year ||
      (user?.user_metadata as any)?.academic_year ||
      ''
    ).trim().toLowerCase();

    // 0. Check Specific College Restriction (Only allowed college can join!)
    if (allowedCollege && allowedCollege !== 'all' && allowedCollege !== 'all colleges' && allowedCollege !== 'open to all') {
      const studentColLower = activeCollege.toLowerCase();
      const isSvyasaAllowed = allowedCollege.includes('svyasa') || allowedCollege.includes('s-vyasa');
      const isSvyasaStudent = studentColLower.includes('svyasa') || studentColLower.includes('s-vyasa');

      const matches = isSvyasaAllowed
        ? isSvyasaStudent
        : (studentColLower.includes(allowedCollege) || allowedCollege.includes(studentColLower));

      if (!matches) {
        return {
          isEligible: false,
          reason: `Restricted to students of ${hackathon?.allowed_college}. (Your verified college: ${activeCollege || 'Unverified'}).`,
        };
      }

      // Silent Roll Number Range Gate (Faculty Cohort / Batch Restriction)
      const rollStart = ((hackathon as any)?.allowed_roll_start || '').toString().trim().toUpperCase();
      const rollEnd = ((hackathon as any)?.allowed_roll_end || '').toString().trim().toUpperCase();

      if (rollStart || rollEnd) {
        const studentRoll = (
          profile?.student_roll_no ||
          (profile as any)?.roll_number ||
          (profile as any)?.studentRollNo ||
          localProfile?.student_roll_no ||
          (user?.user_metadata as any)?.student_roll_no ||
          (user?.user_metadata as any)?.rollNumber ||
          (typeof window !== 'undefined' ? localStorage.getItem('linkora_verified_roll_no') || '' : '')
        ).toString().trim().toUpperCase();

        if (studentRoll) {
          const isRollInRange = (r: string, s: string, e: string): boolean => {
            const rNum = parseInt(r.replace(/\D/g, ''), 10);
            const sNum = s ? parseInt(s.replace(/\D/g, ''), 10) : NaN;
            const eNum = e ? parseInt(e.replace(/\D/g, ''), 10) : NaN;

            if (!isNaN(rNum) && (!s || !isNaN(sNum)) && (!e || !isNaN(eNum))) {
              if (!isNaN(sNum) && rNum < sNum) return false;
              if (!isNaN(eNum) && rNum > eNum) return false;
              return true;
            }

            if (s && r < s) return false;
            if (e && r > e) return false;
            return true;
          };

          if (!isRollInRange(studentRoll, rollStart, rollEnd)) {
            return {
              isEligible: false,
              reason: 'Registration is restricted to the specific student cohort designated by the faculty coordinator.',
            };
          }
        }
      }
    }

    // Also check if raw criteria specifies S-VYASA exclusive
    if (rawCrit.includes('s-vyasa') || rawCrit.includes('svyasa')) {
      const studentColLower = activeCollege.toLowerCase();
      if (!studentColLower.includes('s-vyasa') && !studentColLower.includes('svyasa')) {
        return {
          isEligible: false,
          reason: `Restricted to S-VYASA University students only. (Your verified college: ${activeCollege || 'Unverified'}).`,
        };
      }
    }

    // 1. Check Verified Student requirement
    const requiresVerification = rawCrit.includes('verified') || rawCrit.includes('collegiate verification');
    if (requiresVerification) {
      if (!isVerified) {
        return {
          isEligible: false,
          reason: 'This hackathon requires a verified student profile. Verify your college status in Profile settings or College Hub.',
        };
      }
    }

    // 2. Check Year restrictions
    const isFirstYearReq = (rawCrit.includes('1st year') || rawCrit.includes('first year')) && !rawCrit.includes('1st to 4th') && !rawCrit.includes('1st to 3rd') && !rawCrit.includes('all');
    if (isFirstYearReq) {
      const isFirst = activeYear.includes('1') || activeYear.includes('first') || activeYear.includes('freshman');
      if (!isFirst && activeYear) {
        return {
          isEligible: false,
          reason: `Restricted to 1st year students only (Your profile: ${profile?.academic_year || localProfile?.academic_year || 'Not specified'}).`,
        };
      }
    }

    const isSecondYearReq = (rawCrit.includes('2nd year') || rawCrit.includes('second year')) && !rawCrit.includes('to');
    if (isSecondYearReq) {
      const isSecond = activeYear.includes('2') || activeYear.includes('second') || activeYear.includes('sophomore');
      if (!isSecond && activeYear) {
        return {
          isEligible: false,
          reason: `Restricted to 2nd year students only (Your profile: ${profile?.academic_year || localProfile?.academic_year || 'Not specified'}).`,
        };
      }
    }

    const isThirdYearReq = (rawCrit.includes('3rd year') || rawCrit.includes('third year')) && !rawCrit.includes('to');
    if (isThirdYearReq) {
      const isThird = activeYear.includes('3') || activeYear.includes('third') || activeYear.includes('junior');
      if (!isThird && activeYear) {
        return {
          isEligible: false,
          reason: `Restricted to 3rd year students only (Your profile: ${profile?.academic_year || localProfile?.academic_year || 'Not specified'}).`,
        };
      }
    }

    const isFourthYearReq = (rawCrit.includes('4th year') || rawCrit.includes('fourth year')) && !rawCrit.includes('to');
    if (isFourthYearReq) {
      const isFourth = activeYear.includes('4') || activeYear.includes('fourth') || activeYear.includes('senior');
      if (!isFourth && activeYear) {
        return {
          isEligible: false,
          reason: `Restricted to 4th year students only (Your profile: ${profile?.academic_year || localProfile?.academic_year || 'Not specified'}).`,
        };
      }
    }

    // 3. Faculty / Teacher restriction for student competitions
    if (rawCrit.includes('student') && (profile?.role === 'teacher' || profile?.faculty_verified)) {
      return {
        isEligible: false,
        reason: 'This hackathon is open to students only. Faculty members may participate as mentors or judges.',
      };
    }

    return { isEligible: true, reason: null };
  }, [hackathon?.eligibility, hackathon?.allowed_college, profile, user, isEnrolled]);

  // Deadline countdown calculations
  const countdown = useMemo(() => {
    if (!hackathon) return { days: 0, hours: 0, minutes: 0, formatted: '', isClosed: false, isUrgent: false };
    const deadline = new Date(hackathon.registration_deadline).getTime();
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, formatted: 'Registration Closed', isClosed: true, isUrgent: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const isUrgent = days <= 7;

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours}h left`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m left`;
    } else {
      formatted = `${Math.max(1, minutes)}m left`;
    }

    return { days, hours, minutes, formatted, isClosed: false, isUrgent };
  }, [hackathon]);

  // Handle Share / Copy Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Toggle Save
  const handleToggleSave = () => {
    if (!hackathon) return;
    try {
      const saved = JSON.parse(localStorage.getItem('teamforge_saved_hackathons') || '[]');
      let updated: string[];
      if (saved.includes(hackathon.id)) {
        updated = saved.filter((id: string) => id !== hackathon.id);
        setIsSaved(false);
      } else {
        updated = [...saved, hackathon.id];
        setIsSaved(true);
      }
      localStorage.setItem('teamforge_saved_hackathons', JSON.stringify(updated));
    } catch {}
  };

  // Handle Register / Join Hackathon
  const handleRegister = async () => {
    if (!user) {
      if (openAuthModal) {
        openAuthModal('signup');
      } else {
        router.push(`/signup?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }

    if (!hackathon) return;

    // Global Verification Gate: Students must be verified to register for hackathons
    const isVerifiedUser = Boolean(
      profile?.college_verified ||
      (profile as any)?.student_verified ||
      user?.user_metadata?.college_verified ||
      profile?.role === 'teacher' ||
      profile?.role === 'admin' ||
      Boolean((profile as any)?.faculty_verified)
    );

    if (!isVerifiedUser) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kollabrix:open-profile-modal', {
            detail: { step: 4 },
          })
        );
      }
      return;
    }

    if (!eligibilityEvaluation.isEligible) {
      alert(`Cannot register: ${eligibilityEvaluation.reason || 'You do not meet the eligibility criteria for this hackathon.'}`);
      return;
    }

    // If private hackathon with join code, validate passcode inline without bouncing user
    if (hackathon.access_type === 'private') {
      if (!passcode.trim()) {
        setPasscodeError('Please enter the event passcode to register.');
        return;
      }

      setIsRegistering(true);
      setPasscodeError(null);

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const res = await fetch('/api/hackathons/join', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            joinCode: hackathon.join_code,
            password: passcode.trim(),
            userId: user.id,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setPasscodeError(data.error || 'Invalid event passcode. Please check with your college coordinator.');
          setIsRegistering(false);
          return;
        }

        // Enrollment verified!
        const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
        if (!enrolled.includes(hackathon.id)) enrolled.push(hackathon.id);
        if (hackathon.join_code && !enrolled.includes(hackathon.join_code)) enrolled.push(hackathon.join_code);
        localStorage.setItem('teamforge_enrolled_hackathons', JSON.stringify(enrolled));

        if (isSupabaseConfigured() && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hackathon.id)) {
          try {
            await supabase.from('hackathon_participants').upsert(
              { hackathon_id: hackathon.id, user_id: user.id, role: 'Participant' },
              { onConflict: 'hackathon_id,user_id' }
            );
          } catch {}
        }

        setIsEnrolled(true);
        setRegisteredCount((prev) => prev + 1);
        if (isStarted) {
          router.push(`/hackathons/${hackathon.id}/workspace`);
        }
      } catch (err: any) {
        setPasscodeError(err.message || 'Error validating passcode.');
      } finally {
        setIsRegistering(false);
      }
      return;
    }

    setIsRegistering(true);
    try {
      // 1. Record enrollment in localStorage for instantaneous access
      const enrolled = JSON.parse(localStorage.getItem('teamforge_enrolled_hackathons') || '[]');
      if (!enrolled.includes(hackathon.id)) {
        enrolled.push(hackathon.id);
      }
      if (hackathon.join_code && !enrolled.includes(hackathon.join_code)) {
        enrolled.push(hackathon.join_code);
      }
      localStorage.setItem('teamforge_enrolled_hackathons', JSON.stringify(enrolled));

      // 2. Insert into Supabase hackathon_participants if available
      if (isSupabaseConfigured() && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hackathon.id)) {
        try {
          await supabase.from('hackathon_participants').upsert(
            {
              hackathon_id: hackathon.id,
              user_id: user.id,
              role: 'Participant',
            },
            { onConflict: 'hackathon_id,user_id' }
          );
        } catch (dbErr) {
          console.warn('Participant DB upsert warning:', dbErr);
        }
      }

      setIsEnrolled(true);
      setRegisteredCount((prev) => prev + 1);
      // If hackathon is already active, navigate to workspace; otherwise remain registered until start date
      if (isStarted) {
        router.push(`/hackathons/${hackathon.id}/workspace`);
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsRegistering(false);
    }
  };

  // Other curated hackathons to explore
  const relatedHackathons = useMemo(() => {
    if (!hackathon) return [];
    return CURATED_HACKATHONS.filter((h) => h.id !== hackathon.id).slice(0, 3);
  }, [hackathon]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4 px-4 py-24">
        <div className="w-9 h-9 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Loading Hackathon Details...
        </p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#090C12] border border-white/10 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-zinc-200 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Hackathon Not Found</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {error || 'The requested hackathon could not be found or has concluded.'}
            </p>
          </div>
          <div className="pt-2">
            <Link href="/hackathons">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Explore Active Hackathons
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const timelineEndDate = getHackathonTimelineEndDate(hackathon);
  const timelineRangeText = `${formatShortDate(hackathon.start_date)} – ${
    timelineEndDate
      ? new Date(timelineEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : 'TBA'
  }`;

  return (
    <div className="min-h-screen bg-black text-white pb-24 relative overflow-x-clip">
      {/* Ambient Obsidian Top-Left Silver Rim Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.065),_transparent_58%)]" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 space-y-6">
        {/* Top Minimalist Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/hackathons"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Hackathons</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200 truncate max-w-[220px] sm:max-w-[380px]">
              {hackathon.title}
            </span>
          </Link>

          <div className="flex items-center gap-2 text-zinc-400">
            {hackathon.website_url && !hackathon.website_url.includes('/h/') && (
              <a
                href={
                  /^https?:\/\//i.test(hackathon.website_url.trim())
                    ? hackathon.website_url.trim()
                    : `https://${hackathon.website_url.trim()}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#090C12] border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white transition-all"
                title="Official Event Website"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleToggleSave}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-white text-zinc-950 border-white'
                  : 'bg-[#090C12] border-white/10 text-zinc-300 hover:text-white hover:border-white/25'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Hackathon'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-full bg-[#090C12] border border-white/10 hover:border-white/25 text-zinc-300 hover:text-white transition-all cursor-pointer"
              title="Share Link"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Main 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT 8 COLUMNS: Unboxed Obsidian Editorial Header + Metric Strip + Underline Tabs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Editorial Title Block (no container-inside-container border clutter) */}
            <div className="space-y-4">
              {/* Status Chips & Hashtags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-mono font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                    hackathon.mode === 'Online'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-[#090C12] text-zinc-200 border-white/15'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hackathon.mode === 'Online'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-zinc-300'
                    }`}
                  />
                  <span>
                    {hackathon.mode === 'In-Person'
                      ? `In-Person${hackathon.location ? ` · ${hackathon.location}` : ''}`
                      : 'Online Virtual'}
                  </span>
                </span>

                {hackathon.is_verified && (
                  <span className="text-[11px] font-mono font-medium px-3 py-1 rounded-full bg-[#090C12] text-zinc-200 border border-white/15 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Verified Collegiate</span>
                  </span>
                )}

                {sponsoredMeta.isSponsored && (
                  <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-white/10 text-zinc-100 border border-white/20 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Sponsored · {sponsoredMeta.companyName || 'Partner'}</span>
                  </span>
                )}

                {hackathon.themes &&
                  hackathon.themes.slice(0, 3).map((th) => (
                    <span
                      key={th}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#090C12] text-zinc-400 border border-white/10"
                    >
                      #{th}
                    </span>
                  ))}
              </div>

              {/* Headline & Prominent Partner/Organizer Emblem Row */}
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.12] bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                    {hackathon.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-400">
                    Organized by{' '}
                    <strong className="text-zinc-100 font-semibold">
                      {hackathon.organizer}
                    </strong>
                  </p>
                </div>

                {eventLogo && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#090C12] border border-white/15 p-2 shrink-0 flex items-center justify-center shadow-[0_14px_34px_-10px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.04]">
                    <img
                      src={eventLogo}
                      alt={hackathon.organizer || hackathon.title}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Unified 4-Cell Hairline Metric Strip (Replaces duplicated 4-box grid) */}
              <div className="rounded-2xl bg-[#090C12] border border-white/12 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 overflow-hidden shadow-lg">
                <div className="px-4 py-3.5 text-center sm:text-left">
                  <div className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                    {hackathon.prize_pool ||
                      (sponsoredMeta.isSponsored
                        ? `₹1,50,000 + ${sponsoredMeta.companyName || 'Partner'} Credits`
                        : '₹50,000 + Incubation')}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 mt-1">
                    Prize Pool
                  </div>
                </div>

                <div className="px-4 py-3.5 text-center sm:text-left">
                  <div className="text-sm sm:text-base font-black text-white tracking-tight">
                    {hackathon.min_team_size || 1}–{hackathon.max_team_size || 4} Builders
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 mt-1">
                    Squad Size
                  </div>
                </div>

                <div className="px-4 py-3.5 text-center sm:text-left">
                  <div className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                    {timelineRangeText}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 mt-1">
                    Timeline
                  </div>
                </div>

                <div className="px-4 py-3.5 text-center sm:text-left">
                  <div className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                    {hackathon.themes && hackathon.themes.length > 0
                      ? `${hackathon.themes.length} Track${hackathon.themes.length > 1 ? 's' : ''}`
                      : hackathon.location || 'Virtual Hub'}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-400 mt-1">
                    {hackathon.themes && hackathon.themes.length > 0 ? 'Tracks' : 'Format'}
                  </div>
                </div>
              </div>
            </div>

            {/* Linear-Style Underline Navigation Tabs */}
            <div className="flex items-center gap-6 border-b border-white/10 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('themes')}
                className={`pb-3 text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'themes'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                Themes &amp; Tracks ({hackathon.themes?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`pb-3 text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                Schedule &amp; Milestones
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                className={`pb-3 text-xs sm:text-sm whitespace-nowrap transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === 'rules'
                    ? 'border-white text-white font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                Rules &amp; Eligibility
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Scannable 2-Column Eligibility & Access Highlight Card */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[#090C12] border border-white/10 space-y-5 shadow-xl">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Eligibility &amp; Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      Review access requirements and competition rules before assembling your squad.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {hackathon.allowed_college
                            ? `Exclusive · ${hackathon.allowed_college}`
                            : 'Open Collegiate & Builder Access'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                        {hackathon.eligibility ||
                          'Undergraduate & Postgraduate Students across Engineering & Technology. Cross-disciplinary collaboration encouraged.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-1.5">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                        <span>
                          Team Size: {hackathon.min_team_size || 1}–{hackathon.max_team_size || 4} Members ·{' '}
                          {hackathon.mode}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Collaborate within your campus or find vetted developers, designers, and AI engineers directly on Kollabrix.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Competition Brief */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[#090C12] border border-white/10 space-y-4 shadow-xl">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    About {hackathon.title}
                  </h3>
                  <div className="text-xs sm:text-[14px] text-zinc-300 font-normal leading-relaxed whitespace-pre-line space-y-3">
                    <p>{hackathon.description}</p>
                  </div>

                  {hackathon.themes && hackathon.themes.length > 0 && (
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
                      {hackathon.themes.map((th) => (
                        <span
                          key={th}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-black/55 text-zinc-300 border border-white/10"
                        >
                          #{th}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Partner Benefits Strip (if sponsored) */}
                {sponsoredMeta.isSponsored && (
                  <div className="p-6 sm:p-7 rounded-3xl bg-[#090C12] border border-white/12 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          Partner Benefits
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {sponsoredMeta.companyName || hackathon.organizer} Perks &amp; Rewards
                        </h4>
                      </div>
                      {sponsoredMeta.sponsorWebsiteUrl && (
                        <a
                          href={
                            /^https?:\/\//i.test(sponsoredMeta.sponsorWebsiteUrl)
                              ? sponsoredMeta.sponsorWebsiteUrl
                              : `https://${sponsoredMeta.sponsorWebsiteUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white inline-flex items-center gap-1.5"
                        >
                          <span>Partner Portal</span>
                          <ExternalLink className="w-3 h-3 text-zinc-300" />
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
                      {(
                        sponsoredMeta.eventBenefits || [
                          `Exclusive ${sponsoredMeta.companyName || 'Partner'} Credits`,
                          'Verified Certificate of Merit',
                          'Portfolio Showcase on Kollabrix',
                          'Direct Jury & Mentor Review',
                        ]
                      )
                        .slice(0, 4)
                        .map((b, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-black/45 border border-white/10"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{b}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Team Matchmaking Banner */}
                <div className="p-6 rounded-3xl bg-[#090C12] border border-white/12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Users className="w-4 h-4 text-zinc-200" />
                      <span>Assemble Your Squad on Kollabrix</span>
                    </div>
                    <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                      Looking for a frontend designer, ML engineer, or systems architect for {hackathon.title}? Match with vetted builders now.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link href={`/teammates?hackathon=${encodeURIComponent(hackathon.title)}`}>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-gradient-to-b from-white to-zinc-200 text-zinc-950 font-bold text-xs border border-white/60 hover:opacity-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Find Teammates</span>
                      </button>
                    </Link>
                    <Link href="/projects/new">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-black/60 hover:bg-white/[0.08] border border-white/15 text-zinc-200 font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Post Squad</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#090C12] border border-white/10 space-y-5 shadow-xl">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-200" />
                    <span>Official Tracks &amp; Innovation Themes</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Projects submitted must address one or more of these competition tracks.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(hackathon.themes && hackathon.themes.length > 0
                    ? hackathon.themes
                    : ['Open Innovation', 'AI & Automation', 'Collegiate Web']
                  ).map((th, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/55 border border-white/10 hover:border-white/25 flex items-start gap-3 transition-all"
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-zinc-200 shrink-0 mt-0.5">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{th}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Build and ship high-impact engineering deliverables in this track.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#090C12] border border-white/10 space-y-6 shadow-xl">
                <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-200" />
                      <span>Official Timeline &amp; Milestones</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Submission cut-offs, mentor checkpoints, and finale evaluations by stage.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-zinc-200 bg-white/[0.06] border border-white/15 px-3 py-1 rounded-xl">
                    {timelineStages.length} Stages
                  </span>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-4 sm:before:left-5 before:w-px before:bg-white/15">
                  {timelineStages.map((stage, idx) => {
                    const parsedDate = parseCustomOrIsoDate(stage.date);
                    const formattedDate = formatMilestoneDate(stage.date);
                    const isPassed = parsedDate ? parsedDate.getTime() < Date.now() : false;
                    const isNextUpcoming =
                      !isPassed &&
                      (idx === 0 ||
                        (parseCustomOrIsoDate(timelineStages[idx - 1]?.date)?.getTime() || 0) <
                          Date.now());

                    return (
                      <div key={idx} className="relative flex items-start gap-4 sm:gap-5">
                        <div className="relative shrink-0">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black z-10 border ${
                              isNextUpcoming
                                ? 'bg-white text-zinc-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                : isPassed
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-black text-zinc-300 border-white/15'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </div>

                        <div className="flex-1 p-4 sm:p-5 rounded-2xl bg-black/55 border border-white/10 space-y-2.5">
                          <div className="flex items-center justify-between gap-2.5 flex-wrap border-b border-white/10 pb-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/10">
                                Stage {idx + 1}
                              </span>
                              {isPassed && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Concluded</span>
                                </span>
                              )}
                              {isNextUpcoming && (
                                <span className="text-[10px] font-mono text-zinc-950 bg-white px-2.5 py-0.5 rounded-full font-bold">
                                  Active Stage
                                </span>
                              )}
                              {!isPassed && !isNextUpcoming && (
                                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-full">
                                  Upcoming
                                </span>
                              )}
                            </div>

                            {formattedDate && (
                              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-200 bg-[#090C12] px-3 py-1 rounded-xl border border-white/10">
                                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span>{formattedDate}</span>
                              </div>
                            )}
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                            {stage.title}
                          </h4>

                          {stage.description && (
                            <p className="text-xs sm:text-[13px] text-zinc-400 font-normal leading-relaxed">
                              {stage.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="p-6 sm:p-7 rounded-3xl bg-[#090C12] border border-white/10 space-y-5 shadow-xl">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Rules &amp; Eligibility Requirements</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Compliance criteria required for verified collegiate submission.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs text-zinc-300">
                  <div className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-1.5">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-zinc-300" />
                      <span>Eligibility</span>
                    </h4>
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                      {hackathon.eligibility ||
                        'Open to all enrolled university and college students with valid institutional credentials.'}
                    </p>
                  </div>

                  {hackathon.allowed_college && (
                    <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/25 space-y-1.5">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-zinc-200" />
                        <span>Allowed Collegiate Institution</span>
                      </h4>
                      <p className="text-white font-extrabold text-sm">
                        {hackathon.allowed_college}
                      </p>
                      <p className="text-zinc-300 leading-relaxed">
                        Institutional Access Locked: Only verified students from {hackathon.allowed_college} are eligible to participate.
                      </p>
                    </div>
                  )}

                  {hackathon.contact_info && (
                    <div className="p-4 rounded-2xl bg-black/55 border border-white/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-zinc-300" />
                          <span>Faculty Help Desk &amp; Organizer Contact</span>
                        </h4>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 bg-white/[0.06] px-2 py-0.5 rounded border border-white/15">
                          Support Active
                        </span>
                      </div>
                      <a
                        href={
                          hackathon.contact_info.includes('@')
                            ? `mailto:${hackathon.contact_info}`
                            : `tel:${hackathon.contact_info}`
                        }
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#090C12] hover:bg-white/[0.08] text-zinc-200 border border-white/15 font-mono text-xs font-semibold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{hackathon.contact_info}</span>
                      </a>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-1.5">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-zinc-300" />
                      <span>Code Originality &amp; Plagiarism Policy</span>
                    </h4>
                    <p className="text-zinc-300 leading-relaxed">
                      All core project code must be developed during the hackathon period. Public APIs and open-source libraries are permitted if documented cleanly.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/55 border border-white/10 space-y-1.5">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-300" />
                      <span>Team Composition</span>
                    </h4>
                    <p className="text-zinc-300 leading-relaxed">
                      Teams must consist of {hackathon.min_team_size || 1} to {hackathon.max_team_size || 4} verified builders.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 4 COLUMNS: Sticky Uncropped 16:9 Cinema Poster + Registration Dock */}
          <HackathonDetailRightRail
            hackathon={hackathon}
            heroBanner={heroBanner}
            sponsoredMeta={sponsoredMeta}
            countdown={countdown}
            eligibilityEvaluation={eligibilityEvaluation}
            isEnrolled={isEnrolled}
            isStarted={isStarted}
            isRegistering={isRegistering}
            isExternalRegistration={isExternalRegistration}
            externalRegistrationUrl={externalRegistrationUrl}
            displayRegisteredCount={displayRegisteredCount}
            passcode={passcode}
            setPasscode={setPasscode}
            passcodeError={passcodeError}
            setPasscodeError={setPasscodeError}
            copiedLink={copiedLink}
            qrCodeUrl={qrCodeUrl}
            onRegister={handleRegister}
            onCopyLink={handleCopyLink}
            formatEventDateTime={formatEventDateTime}
            formatShortDate={formatShortDate}
          />
        </div>

        {/* More Upcoming Hackathons */}
        {relatedHackathons.length > 0 && (
          <div className="pt-14 space-y-5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  More Upcoming Hackathons
                </h3>
                <p className="text-xs text-zinc-400">
                  Explore other high-caliber national and collegiate challenges.
                </p>
              </div>
              <Link
                href="/hackathons"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedHackathons.map((h) => (
                <Link
                  key={h.id}
                  href={`/hackathons/${h.id}`}
                  className="p-5 rounded-2xl bg-[#090C12] border border-white/10 hover:border-white/25 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span
                      className={
                        h.mode === 'Online'
                          ? 'text-emerald-400 font-semibold'
                          : 'text-zinc-300 font-semibold'
                      }
                    >
                      {h.mode}
                    </span>
                    <span className="text-zinc-400 truncate max-w-[140px]">
                      {h.organizer}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                    {h.title}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {h.description}
                  </p>
                  <div className="pt-2.5 flex items-center justify-between text-xs border-t border-white/10 text-zinc-300">
                    <span className="font-mono text-zinc-100 font-bold truncate max-w-[160px]">
                      {h.prize_pool || 'Prizes'}
                    </span>
                    <span className="text-[11px] text-zinc-400 group-hover:text-white flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
