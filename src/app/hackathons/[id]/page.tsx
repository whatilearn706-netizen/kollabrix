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
import { normalizeHackathonDeadlines } from '@/lib/hackathons/hackathonStatus';
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
} from 'lucide-react';

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
    try {
      const sess = sessionStorage.getItem(`linkora_hack_${clean}`);
      if (sess) return JSON.parse(sess);
    } catch {}
    try {
      const catalog = JSON.parse(localStorage.getItem('linkora_hackathons_catalog') || '[]');
      const match = catalog.find((h: any) => h.id === clean || h.join_code === clean);
      if (match) return match;
    } catch {}
    try {
      const localHacks = JSON.parse(localStorage.getItem('teamforge_created_hackathons') || '[]');
      const match = localHacks.find((h: any) => h.id === clean || h.join_code === clean);
      if (match) return match;
    } catch {}
    const curated = CURATED_HACKATHONS.find(
      (ch) => ch.id === clean || ch.join_code === clean || ch.id.toLowerCase() === clean.toLowerCase()
    );
    if (curated) return curated as Hackathon;
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
              description: currentHack.description.replace(/\n\n<!-- HACKATHON_META:[\s\S]*?-->/g, '').trim(),
            };
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

  // Profile-based Eligibility Evaluation
  const eligibilityEvaluation = useMemo(() => {
    const rawCrit = (hackathon?.eligibility || '').toLowerCase().trim();
    if (!rawCrit || rawCrit === 'all college students' || rawCrit === 'open to all' || rawCrit === 'all students') {
      return { isEligible: true, reason: null };
    }

    if (!user) {
      return { isEligible: true, reason: 'Sign in to confirm registration eligibility.' };
    }

    // 1. Check Verified Student requirement
    const requiresVerification = rawCrit.includes('verified') || rawCrit.includes('collegiate verification');
    if (requiresVerification) {
      const isVerified = Boolean(
        profile?.college_verified ||
        profile?.faculty_verified ||
        (profile as any)?.student_verified ||
        (profile as any)?.id_verified
      );
      if (!isVerified) {
        return {
          isEligible: false,
          reason: 'This hackathon requires a verified student profile. Verify your college status in Profile settings or College Hub.',
        };
      }
    }

    // 2. Check Year restrictions
    const userYear = (profile?.academic_year || '').toLowerCase();
    const isFirstYearReq = (rawCrit.includes('1st year') || rawCrit.includes('first year')) && !rawCrit.includes('1st to 4th') && !rawCrit.includes('1st to 3rd') && !rawCrit.includes('all');
    if (isFirstYearReq) {
      const isFirst = userYear.includes('1') || userYear.includes('first') || userYear.includes('freshman');
      if (!isFirst && profile?.academic_year) {
        return {
          isEligible: false,
          reason: `Restricted to 1st year students only (Your profile: ${profile.academic_year}).`,
        };
      }
    }

    const isSecondYearReq = (rawCrit.includes('2nd year') || rawCrit.includes('second year')) && !rawCrit.includes('to');
    if (isSecondYearReq) {
      const isSecond = userYear.includes('2') || userYear.includes('second') || userYear.includes('sophomore');
      if (!isSecond && profile?.academic_year) {
        return {
          isEligible: false,
          reason: `Restricted to 2nd year students only (Your profile: ${profile.academic_year}).`,
        };
      }
    }

    const isThirdYearReq = (rawCrit.includes('3rd year') || rawCrit.includes('third year')) && !rawCrit.includes('to');
    if (isThirdYearReq) {
      const isThird = userYear.includes('3') || userYear.includes('third') || userYear.includes('junior');
      if (!isThird && profile?.academic_year) {
        return {
          isEligible: false,
          reason: `Restricted to 3rd year students only (Your profile: ${profile.academic_year}).`,
        };
      }
    }

    const isFourthYearReq = (rawCrit.includes('4th year') || rawCrit.includes('fourth year')) && !rawCrit.includes('to');
    if (isFourthYearReq) {
      const isFourth = userYear.includes('4') || userYear.includes('fourth') || userYear.includes('senior');
      if (!isFourth && profile?.academic_year) {
        return {
          isEligible: false,
          reason: `Restricted to 4th year students only (Your profile: ${profile.academic_year}).`,
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
  }, [hackathon?.eligibility, profile, user]);

  // Deadline countdown calculations
  const countdown = useMemo(() => {
    if (!hackathon) return { days: 0, hours: 0, isClosed: false, isUrgent: false };
    const deadline = new Date(hackathon.registration_deadline).getTime();
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, isClosed: true, isUrgent: false };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const isUrgent = days <= 7;

    return { days, hours, isClosed: false, isUrgent };
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

    if (!eligibilityEvaluation.isEligible) {
      alert(`Cannot register: ${eligibilityEvaluation.reason || 'You do not meet the eligibility criteria for this hackathon.'}`);
      return;
    }

    // If private hackathon with join code, route to join code page
    if (hackathon.access_type === 'private' && hackathon.join_code) {
      router.push(`/h/${hackathon.join_code}`);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden border border-charcoal-750 bg-[#070914] shadow-2xl relative">
          {hackathon.banner_url ? (
            <img
              src={hackathon.banner_url}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
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
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNSTOP-STYLE INSTITUTIONAL HEADER & METADATA GRID                        */}
      {/* ========================================================================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: Event Details, Badges & Tabs */}
          <div className="lg:col-span-2 space-y-6">
            
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
                      className="w-full h-full object-cover rounded-xl"
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
                    {hackathon.end_date
                      ? new Date(hackathon.end_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'TBA'}
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
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Registration Deadline</h4>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">
                          {new Date(hackathon.registration_deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
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
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Hackathon Opening Ceremony & Sprint Start</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                          {new Date(hackathon.start_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
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
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">Deliverable Submission Deadline</h4>
                        <span className="text-[10px] font-mono text-purple-400 font-semibold">
                          {hackathon.end_date
                            ? new Date(hackathon.end_date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Sprint Finale'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Submit repository link, architecture demo video, and interactive prototype for jury review.
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
          <div className="space-y-4 lg:sticky lg:top-24">
            
            {/* Main Action Box Container with Relative Positioning for Protruding Pill */}
            <div className="relative pt-3">
              
              {/* Floating Pill on Top-Left of Card (Unstop Signature Match) */}
              <div className="absolute top-0 left-5 z-20 px-3.5 py-1 rounded-full bg-black text-white text-[11px] font-mono font-black border border-charcoal-700 shadow-xl flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{countdown.isClosed ? 'Registration Closed' : `${countdown.days} Days Left`}</span>
              </div>

              {/* Floating Registered Counter on Top-Right (Red Marked Item - Real Database Count) */}
              <div className="absolute top-0 right-5 z-20 px-3 py-1 rounded-full bg-charcoal-950 text-cyan-300 text-[11px] font-mono font-bold border border-charcoal-750 shadow-xl flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{registeredCount} Registered</span>
              </div>

              <div className="p-6 sm:p-7 rounded-3xl bg-charcoal-900/95 border border-charcoal-750 shadow-2xl space-y-5 pt-7">
                
                {/* Eligibility Status Header */}
                {eligibilityEvaluation.isEligible ? (
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
                          Hackathon officially begins on {new Date(hackathon.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Workspace unlocks at launch!
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
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer active:scale-[0.98]'
                      }`}
                    >
                      {isRegistering ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : countdown.isClosed ? (
                        <span>Registration Closed</span>
                      ) : !eligibilityEvaluation.isEligible ? (
                        <span>Not Eligible to Register</span>
                      ) : (
                        <span>Register</span>
                      )}
                    </button>
                  )}
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
                </div>

                {hackathon.website_url && (
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
