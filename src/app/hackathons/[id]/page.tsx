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
  Headphones,
  Mail,
} from 'lucide-react';
import { extractSponsoredMeta } from '@/lib/hackathons/sponsoredMeta';
import { openProfileEditModal } from '@/components/profile/modal/ProfileEditModal';

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
          const res = await fetch(`/api/hackathons?_t=${Date.now()}`, { cache: 'no-store' });
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
              logo_url: meta.logo_url || currentHack.logo_url || currentHack.company_logo,
              company_logo: meta.logo_url || currentHack.logo_url || currentHack.company_logo,
              eligibility: meta.eligibility || currentHack.eligibility,
              banner_url: meta.banner_url || currentHack.banner_url,
              contact_info: currentHack.contact_info || meta.contact_info || (currentHack as any).contactInfo || null,
              allowed_college: currentHack.allowed_college || meta.allowed_college || (currentHack as any).allowedCollege || null,
              is_sponsored: meta.is_sponsored ?? currentHack.is_sponsored,
              is_enterprise: meta.is_enterprise ?? currentHack.is_enterprise,
              company_name: meta.company_name || currentHack.company_name,
              glow_color: meta.glow_color || currentHack.glow_color,
              priority_rank: meta.priority_rank || currentHack.priority_rank,
              recruitment_perks: meta.recruitment_perks || currentHack.recruitment_perks,
              hiring_roles: meta.hiring_roles || currentHack.hiring_roles,
              submission_deadline: currentHack.submission_deadline || meta.submission_deadline || (currentHack as any).submissionDeadline || null,
              results_date: currentHack.results_date || meta.results_date || (currentHack as any).resultsDate || null,
              description: currentHack.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim(),
            };
          }
        } catch {}
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
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4 px-4 py-24">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
          Loading Hackathon Protocol & Details...
        </p>
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-24">
        <div className="w-full max-w-md p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Hackathon Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
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

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Top Floating Navigation */}
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 pt-5 pb-3 flex items-center justify-between">
        <Link
          href="/hackathons"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-900/90 border border-charcoal-700 text-xs font-semibold text-slate-300 hover:text-white hover:border-charcoal-600 transition-all shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Hackathons</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`p-2 rounded-full border transition-all ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-charcoal-900/90 border-charcoal-700 text-slate-300 hover:text-white hover:border-charcoal-600'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Hackathon'}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <button
            onClick={handleCopyLink}
            className="p-2 rounded-full bg-charcoal-900/90 border border-charcoal-700 text-slate-300 hover:text-white hover:border-charcoal-600 transition-all"
            title="Share Link"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNSTOP-STYLE STANDALONE BILLBOARD BANNER CARD (Zero Text Overlap)         */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div className={`w-full rounded-3xl overflow-hidden border bg-[#060813] shadow-2xl relative ${
          sponsoredMeta.isSponsored ? `${sponsoredMeta.theme.cardBorder} ${sponsoredMeta.theme.cardGlow}` : 'border-charcoal-750'
        }`}>
          {hackathon.banner_url ? (
            <div className="relative w-full h-56 sm:h-72 md:h-88 lg:h-[360px] xl:h-[400px] 2xl:h-[440px] overflow-hidden">
              <img
                src={hackathon.banner_url}
                alt={hackathon.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060813]/40 via-transparent to-black/10 pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-violet-600/10 to-transparent" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
              <div className="relative z-10 space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Collegiate Hackathon Series &bull; 2026
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-wider uppercase font-mono drop-shadow-md">
                  {hackathon.title}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Organized by {hackathon.organizer}
                </p>
              </div>
            </div>
          )}

          {/* Floating Brand Emblem & Partner Pill on Top of Banner for Sponsored Events */}
          {sponsoredMeta.isSponsored && (
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/20 shadow-2xl pointer-events-auto">
                {sponsoredMeta.sponsorLogoUrl ? (
                  <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
                    <img
                      src={sponsoredMeta.sponsorLogoUrl}
                      alt={sponsoredMeta.companyName || 'Sponsor'}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
                    <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
                      Official Title Sponsor
                    </span>
                  </div>
                  <span className="text-xs font-black text-white drop-shadow-sm">
                    {sponsoredMeta.companyName || hackathon.organizer}
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/30 text-amber-200 border border-amber-400/50 backdrop-blur-md shadow-lg pointer-events-auto">
                ⭐ Priority Spotlight #{sponsoredMeta.priorityRank}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNSTOP-STYLE INSTITUTIONAL HEADER & METADATA GRID                        */}
      {/* ========================================================================= */}
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS: Event Details, Badges & Tabs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Bespoke Corporate & Enterprise Sponsored Showcase (Full Brand Immersion) */}
            {sponsoredMeta.isSponsored && (
              <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${sponsoredMeta.theme.heroGradient} border-2 ${sponsoredMeta.theme.cardBorder} shadow-2xl space-y-5 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header Row: Sponsor Title & Fast-Track Badge */}
                <div className="flex items-center justify-between gap-3 flex-wrap relative z-10 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
                      <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-black uppercase tracking-widest text-amber-300 block">
                        Enterprise Hiring &amp; Innovation Challenge
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        Hosted by {sponsoredMeta.companyName || hackathon.organizer}
                      </h3>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Corporate Partner</span>
                  </span>
                </div>

                {/* Sponsor Brand Tagline */}
                {sponsoredMeta.tagline && (
                  <div className="relative z-10 text-sm sm:text-base font-semibold text-white/95 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/10">
                    &ldquo;{sponsoredMeta.tagline}&rdquo;
                  </div>
                )}

                {/* Fast-Track Hiring & Compensation Hub */}
                {(sponsoredMeta.hiringRoles || sponsoredMeta.hiringPackage) && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 space-y-2 relative z-10">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Direct Fast-Track Recruitment Guarantee</span>
                      </span>
                      {sponsoredMeta.hiringPackage && (
                        <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-400/40">
                          💼 {sponsoredMeta.hiringPackage}
                        </span>
                      )}
                    </div>
                    {sponsoredMeta.hiringRoles && (
                      <p className="text-xs sm:text-sm text-slate-200 font-medium">
                        Targeting Roles: <strong className="text-white font-bold">{sponsoredMeta.hiringRoles}</strong>
                      </p>
                    )}
                    <p className="text-[11px] text-amber-200/80 leading-relaxed">
                      🌟 Top finalist squads bypass preliminary ATS screening and unlock direct technical interview rounds with senior engineering leaders.
                    </p>
                  </div>
                )}

                {/* 4-Pillar Executive Perks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 relative z-10 pt-1">
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Cash Prize Escrow</span>
                      <p className="text-xs font-black text-amber-300 truncate">{hackathon.prize_pool || 'Competitive Pool'}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Career Fast-Track</span>
                      <p className="text-xs font-black text-cyan-300 truncate">Direct PPI &amp; Interviews</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Executive Mentorship</span>
                      <p className="text-xs font-black text-purple-300 truncate">1:1 Architecture Reviews</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Sponsor Credits &amp; Perx</span>
                      <p className="text-xs font-black text-emerald-300 truncate">Cloud Grants &amp; Hardware</p>
                    </div>
                  </div>
                </div>

                {/* Additional Specific Recruitment Perks */}
                {sponsoredMeta.recruitmentPerks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-white/10 relative z-10">
                    {sponsoredMeta.recruitmentPerks.map((perk, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-black/40 border border-white/15 text-xs font-mono text-amber-200 font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{perk}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Sponsor Promotional Teaser Video (Embedded Player if provided) */}
                {sponsoredMeta.promoVideoUrl && (
                  <div className="pt-2 relative z-10 space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span>Official Sponsor Teaser &amp; Kickoff Briefing</span>
                    </span>
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                      <iframe
                        src={
                          sponsoredMeta.promoVideoUrl.includes('watch?v=')
                            ? sponsoredMeta.promoVideoUrl.replace('watch?v=', 'embed/')
                            : sponsoredMeta.promoVideoUrl
                        }
                        title={`${sponsoredMeta.companyName} Teaser`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Header Block with Title & College Emblem */}
            <div className="p-6 rounded-3xl bg-charcoal-900/90 border border-charcoal-800 space-y-4 shadow-xl">
              {/* Header Status Row with Offline/Online and Unstop Action Icons */}
              <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      hackathon.mode === 'Online'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : hackathon.mode === 'In-Person'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${hackathon.mode === 'Online' ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
                    <span>{hackathon.mode === 'In-Person' ? '📍 Offline' : '🌐 Online Virtual'}</span>
                  </span>

                  {hackathon.is_verified && (
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Verified Collegiate</span>
                    </span>
                  )}
                </div>

                {/* Unstop-Style Action Icons (Globe, Calendar, Bookmark, Share) */}
                <div className="flex items-center gap-2 text-slate-400">
                  {hackathon.website_url && (
                    <a
                      href={hackathon.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-800 text-slate-300 hover:text-white transition-all"
                      title="Event Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  <div
                    className="p-2 rounded-xl bg-charcoal-950 border border-charcoal-800 text-slate-300 transition-all cursor-default"
                    title={`Schedule: ${new Date(hackathon.start_date).toLocaleDateString()}`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <button
                    onClick={handleToggleSave}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-charcoal-950 border-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-800'
                    }`}
                    title={isSaved ? 'Saved' : 'Save Hackathon'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl bg-charcoal-950 hover:bg-charcoal-800 border border-charcoal-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Share Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Title & Square Logo Row (Brown Marked Item Parity) */}
              <div className="flex items-start justify-between gap-4 pt-1">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    {hackathon.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
                    <span className="text-slate-400">Organized by</span>
                    <strong className="text-cyan-400 font-bold">{hackathon.organizer}</strong>
                  </p>
                </div>

                {/* Event / College Logo Badge (Brown Marked Item) */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-charcoal-950 border border-charcoal-750 p-1.5 shrink-0 overflow-hidden shadow-lg flex items-center justify-center">
                  {hackathon.logo_url || hackathon.company_logo ? (
                    <img
                      src={hackathon.logo_url || hackathon.company_logo || ''}
                      alt={hackathon.organizer || hackathon.title}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : hackathon.banner_url ? (
                    <img
                      src={hackathon.banner_url}
                      alt={hackathon.title}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gradient-to-br from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-inner">
                      {hackathon.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Unstop Location & Team Size Rows */}
              <div className="space-y-2 pt-2 border-t border-charcoal-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-charcoal-950 border border-charcoal-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-slate-400">Location: </span>
                    <strong className="text-white font-semibold">{hackathon.location || 'Campus Innovation Lab, CS Department'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-charcoal-950 border border-charcoal-800 flex items-center justify-center text-cyan-400 shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-slate-400">Team Size: </span>
                    <strong className="text-white font-semibold">
                      {hackathon.min_team_size === 1 && hackathon.max_team_size === 1
                        ? 'Individual Participation'
                        : `${hackathon.min_team_size || 1} – ${hackathon.max_team_size || 4} Builders`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Unstop-Style Metadata Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-charcoal-800">
                <div className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    📍 Venue / Mode
                  </span>
                  <span className="text-xs font-bold text-slate-200 block truncate">
                    {hackathon.location || 'Campus Tech Lab'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    👥 Team Size
                  </span>
                  <span className="text-xs font-bold text-slate-200 block truncate">
                    {hackathon.min_team_size || 1} – {hackathon.max_team_size || 4} Builders
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    📅 Schedule
                  </span>
                  <span className="text-xs font-bold text-slate-200 block truncate">
                    {new Date(hackathon.start_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    –{' '}
                    {(() => {
                      const finalDate = getHackathonTimelineEndDate(hackathon);
                      return finalDate
                        ? new Date(finalDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'TBA';
                    })()}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                    🏆 Total Prize Pool
                  </span>
                  <span className="text-xs font-bold text-amber-300 block truncate">
                    {hackathon.prize_pool || '₹50,000 + Mentorship'}
                  </span>
                </div>
              </div>

              {/* Category Pills */}
              {hackathon.themes && hackathon.themes.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {hackathon.themes.slice(0, 5).map((theme) => (
                    <span
                      key={theme}
                      className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-charcoal-950 text-slate-300 border border-charcoal-800"
                    >
                      #{theme}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-charcoal-800 pb-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('themes')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'themes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Themes & Tracks ({hackathon.themes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Schedule & Milestones
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rules & Eligibility
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Unstop-Style Eligibility Section */}
                <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-2 shadow-xl">
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-white">
                    <span className="w-1.5 h-5 bg-cyan-400 rounded-full" />
                    <span>Eligibility</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {hackathon.eligibility || 'Undergraduate & Postgraduate Students (Engineering / CS / Technology). Inter-college teams permitted.'}
                  </p>
                </div>

                <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-base sm:text-lg font-black text-white">
                    <span className="w-1.5 h-5 bg-cyan-400 rounded-full" />
                    <span>All that you need to know about {hackathon.title}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-3">
                    <p>{hackathon.description}</p>
                  </div>
                </div>

                {/* Team Formation Highlight */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/60 to-charcoal-900 border border-violet-800/40 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2.5 text-violet-300">
                    <Users className="w-5 h-5 text-violet-400" />
                    <h4 className="text-sm font-bold text-white">Assemble Your Dream Team on Kollabrix</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Looking for a frontend designer, smart-contract developer, or AI engineer to team up with for {hackathon.title}? Connect with vetted collegiate builders on our matchmaking roster.
                  </p>
                  <div className="pt-1 flex items-center gap-3">
                    <Link href={`/teammates?hackathon=${encodeURIComponent(hackathon.title)}`}>
                      <Button variant="secondary" size="sm" leftIcon={<UserPlus className="w-4 h-4 text-violet-400" />}>
                        Find Teammates
                      </Button>
                    </Link>
                    <Link href="/projects/new">
                      <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
                        Post Squad Request
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-brand-400" />
                      <span>Official Tracks & Innovation Themes</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Projects submitted must address one or more of the following challenge themes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(hackathon.themes || ['Open Innovation', 'AI & Automation', 'Collegiate Web']).map(
                      (theme, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 flex items-start gap-3 hover:border-charcoal-700 transition-all"
                        >
                          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{theme}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Solve critical problems and ship high-impact collegiate solutions in this track.
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <span>Official Timeline & Milestones</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Stay aligned with key submission cut-offs, mentor reviews, and jury evaluations.
                  </p>
                </div>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-charcoal-800">
                  {/* Step 1: Registration Deadline */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-brand-500 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      1
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white">Registration Deadline</h4>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {formatEventDateTime(hackathon.registration_deadline)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        All builders must register and finalize squad rosters before this deadline.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Hackathon Kickoff */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      2
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white">Hackathon Opening Ceremony & Sprint Start</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {formatEventDateTime(hackathon.start_date)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Hacking commences! Access workspace boards, mentor sprint huddles, and challenge briefs.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Project Submissions */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-purple-500 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      3
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white">Deliverable Submission Deadline</h4>
                        <span className="text-[10px] font-mono text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          {hackathon.submission_deadline
                            ? formatEventDateTime(hackathon.submission_deadline)
                            : (hackathon as any).submissionDeadline
                            ? formatEventDateTime((hackathon as any).submissionDeadline)
                            : hackathon.end_date
                            ? formatEventDateTime(hackathon.end_date)
                            : 'Sprint Finale'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Submit repository link, architecture demo video, and interactive prototype for jury review.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Result Declared & Winners Announced */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-charcoal-900 border-2 border-amber-500 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm shadow-amber-500/20">
                      4
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Result Declared &amp; Winners Announced</span>
                        </h4>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {hackathon.results_date
                            ? formatEventDateTime(hackathon.results_date)
                            : (hackathon as any).resultsDate
                            ? formatEventDateTime((hackathon as any).resultsDate)
                            : hackathon.end_date
                            ? formatEventDateTime(hackathon.end_date)
                            : 'To Be Announced'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Official faculty jury evaluations complete, final collegiate rankings published, and certificates released.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Rules & Eligibility Requirements</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Compliance criteria required for official collegiate credential verification.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Eligibility</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      {hackathon.eligibility || 'Open to all enrolled university and college students with valid institutional credentials.'}
                    </p>
                  </div>

                  {/* Allowed College Restriction Banner */}
                  {hackathon.allowed_college && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                      <h4 className="font-bold text-amber-300 flex items-center gap-2 text-xs">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                        <span>Allowed Collegiate Institution</span>
                      </h4>
                      <p className="text-white font-bold text-xs">
                        {hackathon.allowed_college}
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        Institutional Access Locked: Only enrolled and verified students from {hackathon.allowed_college} are eligible to participate and submit deliverables.
                      </p>
                    </div>
                  )}

                  {/* Help Desk & Faculty Support Banner */}
                  {hackathon.contact_info && (
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white flex items-center gap-2 text-xs">
                          <Headphones className="w-4 h-4 text-cyan-400" />
                          <span>Faculty Help Desk &amp; Organizer Contact</span>
                        </h4>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          Support Active
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs">
                        If you face any issue during registration, card verification, or team building, reach out directly to the faculty coordinator:
                      </p>
                      <div className="pt-1">
                        <a
                          href={hackathon.contact_info.includes('@') ? `mailto:${hackathon.contact_info}` : `tel:${hackathon.contact_info}`}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-mono text-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{hackathon.contact_info}</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-brand-400" />
                      <span>Code Originality & Plagiarism Policy</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      All core project code must be developed during the hackathon period. Pre-existing libraries and public APIs are permitted provided they are documented in your README and architecture breakdown.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-violet-400" />
                      <span>Team Composition</span>
                    </h4>
                    <p className="text-slate-400 leading-relaxed">
                      Teams must consist of {hackathon.min_team_size || 1} to {hackathon.max_team_size || 4} verified students. Cross-disciplinary teams (engineers + product designers) are strongly encouraged.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Unstop-Style Sticky Action Card */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            
            {/* Main Action Box Container with Relative Positioning for Protruding Pill */}
            <div className="relative pt-3">
              
              {/* Floating Pill on Top-Left of Card (Unstop Signature Match) */}
              <div className="absolute top-0 left-5 z-20 px-3.5 py-1 rounded-full bg-black text-white text-[11px] font-mono font-black border border-charcoal-700 shadow-xl flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{countdown.isClosed ? 'Registration Closed' : countdown.formatted}</span>
              </div>

              {/* Floating Registered Counter on Top-Right (Red Marked Item - Real Database Count) */}
              <div className="absolute top-0 right-5 z-20 px-3 py-1 rounded-full bg-charcoal-950 text-cyan-300 text-[11px] font-mono font-bold border border-charcoal-750 shadow-xl flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{registeredCount} Registered</span>
              </div>

              <div className="p-6 sm:p-7 rounded-3xl bg-charcoal-900/95 border border-charcoal-750 shadow-2xl space-y-5 pt-7">
                
                {/* Eligibility Status Header */}
                {isEnrolled ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs pt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Registered &amp; Confirmed Participant</span>
                  </div>
                ) : eligibilityEvaluation.isEligible ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs pt-1">
                    <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                    <span>You&apos;re eligible</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>You are not eligible</span>
                    </div>
                    <p className="text-[11px] text-rose-200/80 leading-relaxed pl-5">
                      {eligibilityEvaluation.reason}
                    </p>
                    {eligibilityEvaluation.reason?.includes('verified') && (
                      <div className="pt-2 pl-5">
                        <button
                          type="button"
                          onClick={() => openProfileEditModal(4)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Verify with Apple Face ID (30s)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Private Passcode Input for campus events */}
                {hackathon.access_type === 'private' && !isEnrolled && eligibilityEvaluation.isEligible && (
                  <div className="p-3.5 rounded-2xl bg-charcoal-950 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-300 font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Private Event Passcode</span>
                      </span>
                      <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-semibold">
                        Required
                      </span>
                    </div>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setPasscodeError(null);
                      }}
                      placeholder="Enter event passcode"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    {passcodeError && (
                      <p className="text-[11px] text-rose-400 font-medium">{passcodeError}</p>
                    )}
                  </div>
                )}

                {/* Primary Action Button */}
                <div className="pt-1">
                  {isEnrolled ? (
                    isStarted ? (
                      <Link href={`/hackathons/${hackathon.id}/workspace`} className="block">
                        <button className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]">
                          <span>Enter Hackathon</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full py-3.5 px-6 rounded-2xl bg-charcoal-800 border border-charcoal-700 text-slate-300 font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-not-allowed select-none">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Registered • Workspace Opens at Start Date</span>
                        </div>
                        <p className="text-[11px] text-center text-slate-400 font-medium leading-relaxed">
                          Hackathon officially begins on {formatEventDateTime(hackathon.start_date)}. Workspace unlocks at launch!
                        </p>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering || countdown.isClosed || !eligibilityEvaluation.isEligible}
                      className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
                        countdown.isClosed || !eligibilityEvaluation.isEligible
                          ? 'bg-charcoal-800 text-slate-500 border border-charcoal-700 cursor-not-allowed shadow-none'
                          : sponsoredMeta.isSponsored
                          ? `bg-gradient-to-r ${sponsoredMeta.theme.buttonGradient} shadow-lg ring-1 ring-white/20 cursor-pointer active:scale-[0.98]`
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      {isRegistering ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : countdown.isClosed ? (
                        <span>Registration Closed</span>
                      ) : !eligibilityEvaluation.isEligible ? (
                        <span>Not Eligible to Register</span>
                      ) : hackathon.access_type === 'private' ? (
                        <span>Enter Passcode &amp; Register</span>
                      ) : sponsoredMeta.isSponsored ? (
                        <span>{sponsoredMeta.customCtaText || 'Apply & Register Squad'}</span>
                      ) : (
                        <span>Register</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Registration Closes Indicator Card (Blue Marked Area in Image 3) */}
                <div className="p-3.5 rounded-2xl bg-charcoal-950/90 border border-charcoal-800 hover:border-charcoal-700 transition-all flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${countdown.isClosed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                        Registration Closes
                      </span>
                      <span className="text-xs font-bold text-white font-mono block truncate">
                        {formatEventDateTime(hackathon.registration_deadline)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                    countdown.isClosed
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {countdown.isClosed ? 'Closed' : countdown.formatted}
                  </span>
                </div>

                {/* Unstop Social Proof Registration Counter (Real Registered Count) */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium pt-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>
                    Registered:{' '}
                    <strong className="text-white font-mono font-bold">
                      {registeredCount}
                    </strong>
                  </span>
                </div>

                {/* Prize Pool & Timeline Mini Summary */}
                <div className="p-3.5 rounded-2xl bg-charcoal-950 border border-charcoal-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Prize Pool</span>
                    <strong className="text-amber-400 font-bold">{hackathon.prize_pool || '₹50,000 + Incubation'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Team Size</span>
                    <strong className="text-white font-bold">{hackathon.min_team_size || 1} - {hackathon.max_team_size || 4} Builders</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-charcoal-850 pt-2">
                    <span className="text-slate-400">Submission Cut-off</span>
                    <strong className="text-amber-300 font-bold font-mono">
                      {formatEventDateTime(hackathon.submission_deadline || (hackathon as any).submissionDeadline || hackathon.end_date)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-charcoal-850 pt-2">
                    <span className="text-slate-400">Result Announcement</span>
                    <strong className="text-emerald-300 font-bold font-mono">
                      {formatEventDateTime(hackathon.results_date || (hackathon as any).resultsDate || hackathon.end_date)}
                    </strong>
                  </div>
                </div>

                {hackathon.website_url && !hackathon.website_url.includes('/h/') && (
                  <a
                    href={hackathon.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block pt-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-center text-xs"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Official Guidelines &amp; Portal
                    </Button>
                  </a>
                )}

                {/* Verified Trust Guarantees */}
                <div className="pt-3 border-t border-charcoal-800 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verified Collegiate Credentials &amp; Proof of Work</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Real-Time Team Workspace &amp; Closer Pitch Deck Kit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Jury Evaluation &amp; Digital Certificate on Completion</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unstop-Style "Share with Friends" Card (Exact Match) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-charcoal-900 border border-blue-500/30 flex items-center justify-between gap-3 shadow-lg">
              <div>
                <div className="text-xs font-black text-white">Share with Friends</div>
                <div className="text-[10px] text-slate-400">Invite classmates &amp; teammates</div>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Refer now'}</span>
              </button>
            </div>

            {/* Faculty Help Desk & Support Contact Card */}
            {hackathon.contact_info && (
              <div className="p-4 rounded-2xl bg-charcoal-900/95 border border-cyan-500/30 space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Help Desk &amp; Support</span>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    Coordinator
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Have questions or need assistance during the event? Contact the faculty desk:
                </p>
                <a
                  href={hackathon.contact_info.includes('@') ? `mailto:${hackathon.contact_info}` : `tel:${hackathon.contact_info}`}
                  className="flex items-center gap-2 text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-charcoal-950 px-3 py-2.5 rounded-xl border border-charcoal-800 break-all transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{hackathon.contact_info}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* More Curated Hackathons Section */}
        {relatedHackathons.length > 0 && (
          <div className="pt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">More Upcoming Hackathons</h3>
                <p className="text-xs text-slate-400">
                  Explore other high-caliber national and collegiate challenges.
                </p>
              </div>
              <Link href="/hackathons">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedHackathons.map((h) => (
                <Link
                  key={h.id}
                  href={`/hackathons/${h.id}`}
                  className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">{h.mode}</span>
                    <span className="text-slate-400 truncate max-w-[120px]">{h.organizer}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {h.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {h.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-charcoal-800 text-slate-300">
                    <span className="font-mono text-amber-400 font-bold truncate max-w-[140px]">
                      {h.prize_pool || 'Prizes'}
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-white flex items-center gap-1">
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
