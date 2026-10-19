'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { IntentConsole } from '@/components/landing/IntentConsole';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Project, Hackathon, ProblemStatement } from '@/types/database';
import {
  Compass,
  Users,
  Trophy,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Lock,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Layers,
  Kanban,
  CheckCircle2,
  KeyRound,
  Zap,
  AlertCircle,
  Award,
  Lightbulb,
  Flame,
  Radio,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { OpportunityCategoryBar } from '@/components/landing/OpportunityCategoryBar';
import { CampusOpportunityTicker } from '@/components/landing/CampusOpportunityTicker';
import { UnstopHeroSearchBar } from '@/components/landing/UnstopHeroSearchBar';
import { UnstopDomainGrid } from '@/components/landing/UnstopDomainGrid';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { ProblemShowcaseCard } from '@/components/problems/ProblemShowcaseCard';
import { CustomAdminSpotlightSection } from '@/components/landing/CustomAdminSpotlightSection';
import { DEMO_PROBLEMS } from '@/data/mockProblems';
import { isFacultyUser } from '@/lib/auth/faculty';

import { CollegiatePortalsRadar } from '@/components/home/CollegiatePortalsRadar';

const OrigamiBirdSculpture = dynamic(
  () => import('@/components/canvas/OrigamiBirdSculpture').then((m) => m.OrigamiBirdSculpture),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] flex items-center justify-center select-none pointer-events-none">
        <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-emerald-500/15 via-[#b54568]/20 to-transparent blur-3xl opacity-75 animate-pulse" />
      </div>
    ),
  }
);

const PortalsSideRail = dynamic(
  () => import('@/components/home/PortalsSideRail').then((m) => m.PortalsSideRail),
  { ssr: false }
);

const ProjectSparkGeneratorModal = dynamic(
  () => import('@/components/ai/ProjectSparkGeneratorModal').then((m) => m.ProjectSparkGeneratorModal),
  { ssr: false }
);

import {
  HomepageIntentConfig,
  HomepageShowcaseConfig,
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
} from '@/types/homepageConfig';
import { CampusPulseHub } from '@/components/landing/CampusPulseHub';
import {
  HomepageSectionToggles,
  MasterControlConfig,
  DEFAULT_MASTER_CONTROL_CONFIG,
} from '@/types/masterControl';

export default function HomePage() {
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();
  const { theme, isDark } = useSiteTheme();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>(DEMO_PROJECTS.slice(0, 3));
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>(CURATED_HACKATHONS.slice(0, 3));
  const [featuredProblems, setFeaturedProblems] = useState<ProblemStatement[]>(DEMO_PROBLEMS.slice(0, 3));
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showcaseTab, setShowcaseTab] = useState<'projects' | 'hackathons' | 'problems'>('projects');
  const [quickPasscode, setQuickPasscode] = useState('');
  const [oauthErrorNotice, setOauthErrorNotice] = useState<string | null>(null);
  const [isSparkModalOpen, setIsSparkModalOpen] = useState(false);
  const [intentConfig, setIntentConfig] = useState<HomepageIntentConfig>(DEFAULT_HOMEPAGE_INTENT_CONFIG);
  const [showcaseConfig, setShowcaseConfig] = useState<HomepageShowcaseConfig>(DEFAULT_HOMEPAGE_SHOWCASE_CONFIG);
  const [sectionsConfig, setSectionsConfig] = useState<HomepageSectionToggles>(DEFAULT_MASTER_CONTROL_CONFIG.sections);
  const [masterConfig, setMasterConfig] = useState<MasterControlConfig>(DEFAULT_MASTER_CONTROL_CONFIG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Catch incoming OAuth or URL authentication errors
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error_description') || params.get('error');
      if (urlError) {
        const decoded = decodeURIComponent(urlError.replace(/\+/g, ' '));
        if (decoded.includes('Unable to exchange external code')) {
          setOauthErrorNotice(
            'Google OAuth Configuration Notice: Supabase was unable to exchange the authorization code with Google. This happens when the Google Client Secret in Supabase is incorrect, or the Authorized redirect URI in Google Cloud Console is not set to "https://bmiwmlfraaridbekuily.supabase.co/auth/v1/callback".'
          );
        } else {
          setOauthErrorNotice(decoded);
        }
      }
    }
  }, []);

  const isTeacher = isFacultyUser(user, profile);

  // Load real projects and hackathons from Supabase (with demo fallback)
  useEffect(() => {
    async function loadLiveData() {
      setIsLoadingData(true);
      try {
        // Load Live Homepage Admin Config (Intent + Showcase)
        let liveIntent = DEFAULT_HOMEPAGE_INTENT_CONFIG;
        let liveShowcase = DEFAULT_HOMEPAGE_SHOWCASE_CONFIG;

        try {
          // Check local cache first for instant reactivity
          const localI = localStorage.getItem('linkora_intent_config_v1');
          if (localI) liveIntent = JSON.parse(localI);
          const localS = localStorage.getItem('linkora_showcase_config_v1');
          if (localS) liveShowcase = JSON.parse(localS);

          const cfgRes = await fetch(`/api/homepage-config?_t=${Date.now()}`, { cache: 'no-store' });
          const cfgData = await cfgRes.json();
          if (cfgRes.ok && cfgData) {
            if (cfgData.intentConfig) {
              liveIntent = cfgData.intentConfig;
              localStorage.setItem('linkora_intent_config_v1', JSON.stringify(liveIntent));
            }
            if (cfgData.showcaseConfig) {
              liveShowcase = cfgData.showcaseConfig;
              localStorage.setItem('linkora_showcase_config_v1', JSON.stringify(liveShowcase));
            }
          }
        } catch {}

        // Load Live Master Control Config (Sections toggles & titles)
        try {
          let currentM = DEFAULT_MASTER_CONTROL_CONFIG;
          const cachedM = localStorage.getItem('linkora_master_control_v1');
          if (cachedM) {
            try {
              currentM = JSON.parse(cachedM);
              if (currentM?.sections) setSectionsConfig(currentM.sections);
              setMasterConfig(currentM);
            } catch (e) {}
          }

          const mRes = await fetch(`/api/master-control?_t=${Date.now()}`, { cache: 'no-store' });
          const mData = await mRes.json();
          if (mRes.ok && mData?.config) {
            const isCustomized = JSON.stringify(mData.config) !== JSON.stringify(DEFAULT_MASTER_CONTROL_CONFIG);
            if (mData.fromDb || isCustomized || !cachedM) {
              if (mData.config.sections) setSectionsConfig(mData.config.sections);
              setMasterConfig(mData.config);
              try {
                localStorage.setItem('linkora_master_control_v1', JSON.stringify(mData.config));
              } catch (e) {}
            } else if (cachedM && currentM) {
              if (currentM.sections) setSectionsConfig(currentM.sections);
              setMasterConfig(currentM);
            }
          }
        } catch (e) {}

        setIntentConfig(liveIntent);
        setShowcaseConfig(liveShowcase);

        // 1. Check deleted projects tombstone and verified users from platform_settings
        let deletedSet = new Set<string>();
        const verifiedUserSet = new Set<string>();
        if (isSupabaseConfigured()) {
          try {
            const { data: sRows } = await supabase
              .from('platform_settings')
              .select('key, value')
              .in('key', ['deleted_projects', 'linkedin_college_verifications']);

            if (Array.isArray(sRows)) {
              for (const row of sRows) {
                if (row.key === 'deleted_projects' && row.value) {
                  const raw = row.value;
                  const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
                  const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
                  deletedSet = new Set([...ids, ...titles].map((s: string) => (s || '').trim().toLowerCase()));
                } else if (row.key === 'linkedin_college_verifications' && Array.isArray(row.value)) {
                  row.value.forEach((v: any) => {
                    if (v.userId) verifiedUserSet.add(v.userId);
                    if (v.username) verifiedUserSet.add(v.username.toLowerCase().trim());
                  });
                }
              }
            }
          } catch {}
        }

        // Fetch all active or featured projects
        let poolProjects: Project[] = [];
        if (isSupabaseConfigured()) {
          const { data: projs } = await supabase
            .from('projects')
            .select(`
              *,
              owner:profiles!projects_owner_id_fkey(
                user_id,
                display_name,
                username,
                avatar_url,
                college,
                course
              )
            `)
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(30);

          if (projs && projs.length > 0) {
            poolProjects = (projs as Project[]).map((proj) => {
              const isOwnerVerified =
                (proj.owner?.user_id && verifiedUserSet.has(proj.owner.user_id)) ||
                (proj.owner?.username && verifiedUserSet.has(proj.owner.username.toLowerCase().trim())) ||
                (proj.owner_id && verifiedUserSet.has(proj.owner_id));
              if (proj.owner) {
                return { ...proj, owner: { ...proj.owner, college_verified: Boolean(isOwnerVerified) } };
              }
              return proj;
            });
          }
        }

        // Combine pool with DEMO_PROJECTS, strictly excluding any deleted projects
        const poolMap = new Map<string, Project>();
        for (const dp of DEMO_PROJECTS) {
          if (!deletedSet.has((dp.id || '').toLowerCase()) && !deletedSet.has((dp.title || '').trim().toLowerCase())) {
            poolMap.set(dp.id, dp);
          }
        }
        for (const pp of poolProjects) {
          if (!deletedSet.has((pp.id || '').toLowerCase()) && !deletedSet.has((pp.title || '').trim().toLowerCase())) {
            poolMap.set(pp.id, pp);
          }
        }

        // Select exact showcase projects configured by Admin
        if (Array.isArray(liveShowcase.selectedProjectIds)) {
          const curated: Project[] = [];
          for (const pid of liveShowcase.selectedProjectIds) {
            const found = poolMap.get(pid);
            if (found && !deletedSet.has((found.id || '').toLowerCase()) && !deletedSet.has((found.title || '').trim().toLowerCase())) {
              curated.push(found);
            }
          }
          setFeaturedProjects(curated);
        } else {
          setFeaturedProjects(poolProjects.slice(0, 3).length > 0 ? poolProjects.slice(0, 3) : Array.from(poolMap.values()).slice(0, 3));
        }

        // Fetch live published hackathons
        try {
          const hRes = await fetch(`/api/hackathons?_t=${Date.now()}`, { cache: 'no-store' });
          const hData = await hRes.json();
          if (hRes.ok && hData.success && Array.isArray(hData.hackathons) && hData.hackathons.length > 0) {
            setActiveHackathons(hData.hackathons.slice(0, 3));
          } else {
            setActiveHackathons(CURATED_HACKATHONS.slice(0, 3));
          }
        } catch {
          setActiveHackathons(CURATED_HACKATHONS.slice(0, 3));
        }

        // Fetch live problem statements
        try {
          if (isSupabaseConfigured()) {
            const { data: pRows } = await supabase
              .from('problem_statements')
              .select(`
                *,
                author:profiles!problem_statements_author_id_fkey(
                  user_id,
                  display_name,
                  username,
                  avatar_url,
                  college,
                  course
                )
              `)
              .order('created_at', { ascending: false })
              .limit(3);
            if (pRows && pRows.length > 0) {
              setFeaturedProblems(pRows as ProblemStatement[]);
            } else {
              setFeaturedProblems(DEMO_PROBLEMS.slice(0, 3));
            }
          }
        } catch {
          setFeaturedProblems(DEMO_PROBLEMS.slice(0, 3));
        }
      } catch (err) {
        console.warn('Error loading live homepage data:', err);
        setFeaturedProjects(DEMO_PROJECTS.slice(0, 3));
        setActiveHackathons(CURATED_HACKATHONS.slice(0, 3));
        setFeaturedProblems(DEMO_PROBLEMS.slice(0, 3));
      } finally {
        setIsLoadingData(false);
      }
    }

    loadLiveData();

    const handleMasterUpdate = () => {
      try {
        const cachedM = localStorage.getItem('linkora_master_control_v1');
        if (cachedM) {
          const parsed = JSON.parse(cachedM);
          if (parsed?.sections) setSectionsConfig(parsed.sections);
          setMasterConfig(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('linkora_master_control_updated', handleMasterUpdate);
    return () => {
      window.removeEventListener('linkora_master_control_updated', handleMasterUpdate);
    };
  }, []);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasscode.trim()) return;
    const clean = quickPasscode
      .replace(/.*\/h\//, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();
    if (clean) {
      router.push(`/h/${clean}`);
    }
  };

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.bodyTextColor,
      }}
      className="flex flex-col w-full overflow-hidden transition-colors duration-200"
    >
      {/* Real-time Campus Opportunity Ticker (Unstop-Inspired) */}
      {sectionsConfig.campusTicker !== false && <CampusOpportunityTicker />}

      {/* OAuth Notice Banner */}
      {oauthErrorNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs font-medium text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5 max-w-4xl">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{oauthErrorNotice}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
            >
              Sign In with Email / Phone
            </button>
            <button
              onClick={() => setOauthErrorNotice(null)}
              className="text-amber-800 hover:text-black font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          HERO: BALANCED SPLIT STAGE (HEADLINE + 3D LINKORA ORIGAMI BIRD)
         ========================================================================= */}
      {sectionsConfig.hero && (
        <section className="relative pt-8 pb-14 md:pt-16 md:pb-24 overflow-hidden">
          {/* Ambient Cinematic Mesh Lighting Orbs */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 right-4 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500/15 via-rose-500/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              {/* Left Column: Brand, Editorial Headline & Primary Actions */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Glassmorphic Badge with Neon Radar Pulse */}
                <div
                  style={{ borderRadius: theme.borderRadius }}
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 backdrop-blur-md bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold tracking-wider uppercase shadow-2xs"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{theme.heroBadgeText || 'Linkora • Student Collaboration Network'}</span>
                </div>

                <h1
                  style={{
                    color: theme.headingColor,
                    fontFamily: `var(--site-font-heading, "${theme.headingFont}")`,
                    letterSpacing: theme.letterSpacing,
                    fontWeight: theme.headingWeight,
                  }}
                  className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.06]"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500">
                    Linkora.
                  </span>{' '}
                  <span>
                    {theme.heroHeadline ? (
                      theme.heroHeadline.toLowerCase().startsWith('linkora')
                        ? theme.heroHeadline.replace(/^linkora[:.]?\s*/i, '')
                        : theme.heroHeadline
                    ) : (
                      'Build something bigger, together.'
                    )}
                  </span>
                </h1>

                <p
                  style={{
                    color: theme.bodyTextColor,
                    fontFamily: `var(--site-font-body, "${theme.bodyFont}")`,
                  }}
                  className="text-base sm:text-xl leading-relaxed font-normal max-w-xl opacity-90"
                >
                  {theme.heroSubheadline || 'Find your people, turn ideas into projects, and build a portfolio that proves what you can do.'}
                </p>

                {/* Unstop-Style Interactive Global Search Console */}
                {sectionsConfig.heroSearch !== false && <UnstopHeroSearchBar />}

                {/* Direct Primary & Secondary Action CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/explore">
                    <Button
                      variant="primary"
                      size="lg"
                      style={{
                        backgroundColor: theme.brandColor,
                        borderRadius: theme.borderRadius,
                      }}
                      className="hover:opacity-90 text-white font-bold px-7 py-3.5 shadow-md border-0 transition-all active:scale-[0.98]"
                      leftIcon={<Compass className="w-4 h-4" />}
                    >
                      {theme.primaryCtaText || 'Explore Projects'}
                    </Button>
                  </Link>

                  <Link href="/teammates">
                    <Button
                      variant="outline"
                      size="lg"
                      style={{
                        borderRadius: theme.borderRadius,
                        color: isDark ? '#ffffff' : '#0f172a',
                      }}
                      className="border border-slate-300 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold px-7 py-3.5 bg-white dark:bg-white/5 shadow-2xs transition-all active:scale-[0.98]"
                      leftIcon={<Users className="w-4 h-4" style={{ color: isDark ? '#ffffff' : '#0f172a' }} />}
                    >
                      <span className="text-slate-900 dark:text-white font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                        {theme.secondaryCtaText || 'Find Teammates'}
                      </span>
                    </Button>
                  </Link>

                  <button
                    onClick={() => setIsSparkModalOpen(true)}
                    style={{ borderRadius: theme.borderRadius }}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 font-bold text-sm hover:border-amber-500/50 hover:bg-amber-500/20 transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>AI Spark Generator</span>
                  </button>
                </div>

                {/* Floating Live Telemetry Chips */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/spark"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                    <span><strong className="font-bold text-slate-900 dark:text-white">AI Spark</strong> Studio</span>
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-violet-500 fill-violet-500/20" />
                    <span><strong className="font-bold text-slate-900 dark:text-white">National</strong> Leaderboard</span>
                  </Link>
                  <Link
                    href="/deadlines"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs hover:scale-105 transition-transform duration-200 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                    <span><strong className="font-bold text-slate-900 dark:text-white">Live</strong> Deadlines</span>
                  </Link>
                </div>

                {/* High-signal Trust Chips */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Verified GitHub Proof</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>College Hackathons</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Faculty Mentorship</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.openLinkoraFeedback) {
                        window.openLinkoraFeedback();
                      } else if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('open-linkora-feedback'));
                      }
                    }}
                    className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 hover:underline font-bold cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-violet-500 shrink-0" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Signature 3D Linkora Origami Bird (Exactly as originally before additions) */}
              {sectionsConfig.origamiBird !== false && (
                <div className="lg:col-span-5 flex items-center justify-center relative min-h-[360px] sm:min-h-[400px] lg:min-h-[440px] overflow-hidden">
                  <OrigamiBirdSculpture />
                </div>
              )}
            </div>
          </div>

          {/* Fixed Portals Side Rail (Fixed on screen, website scrolls normally) */}
          <PortalsSideRail />
          <div className="glow-divider mt-12" />
        </section>
      )}

      {/* Collegiate Innovation Portals Radar (Hackathons, Problems & Faculty Portal) */}
      {sectionsConfig.collegiateRadar !== false && <CollegiatePortalsRadar />}

      {/* 5-Domain Category Explorer Grid (Unstop-Inspired) */}
      {sectionsConfig.domainGrid !== false && (
        <UnstopDomainGrid
          title={sectionsConfig.domainGridTitle}
          subtitle={sectionsConfig.domainGridSubtitle}
        />
      )}

      {/* Opportunity Category Navigation Rail (Unstop-Inspired) */}
      {sectionsConfig.categoryRails !== false && <OpportunityCategoryBar />}

      {/* Custom Admin Spotlight / Announcement Section ("Add whatever you want to the website") - Position: below_hero */}
      {(sectionsConfig.customSection || masterConfig.customSection?.enabled) &&
        masterConfig.customSection &&
        (masterConfig.customSection.position || 'below_hero') === 'below_hero' && (
          <CustomAdminSpotlightSection config={masterConfig.customSection} />
        )}

      {/* =========================================================================
          AUTH BANNER (FOR SIGNED-IN STUDENTS / EDUCATORS)
         ========================================================================= */}
      {mounted && user && (
        <section className="border-b border-slate-200/80 bg-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Welcome back, {profile?.display_name || user.email?.split('@')[0]}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {isTeacher
                      ? 'Educator Workspace: Manage campus challenges, problem statements, and student reviews.'
                      : 'Jump directly back into your sprint workboards, applications, or team matching.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {isTeacher ? (
                  <>
                    <Link href="/teacher/dashboard">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-slate-900 hover:bg-black text-white font-bold"
                        leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                      >
                        Mentor Dashboard
                      </Button>
                    </Link>
                    <Link href="/hackathons">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-800 font-bold hover:bg-white"
                        leftIcon={<Trophy className="w-3.5 h-3.5 text-slate-700" />}
                      >
                        Host Hackathon
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/my-projects">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-slate-900 hover:bg-black text-white font-bold"
                        leftIcon={<Briefcase className="w-3.5 h-3.5" />}
                      >
                        My Projects
                      </Button>
                    </Link>
                    <Link href="/projects/new">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-800 font-bold hover:bg-white"
                        leftIcon={<PlusCircle className="w-3.5 h-3.5 text-slate-700" />}
                      >
                        + New Project
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 1: INTENT (INTERACTIVE BUILDER CONSOLE)
         ========================================================================= */}
      {sectionsConfig.intent && (
        <section className="py-16 md:py-20 relative bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>01 • LINKORA CONSOLE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Intent
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Choose your goal to instantly match with builders, open project slots, or campus competitions.
              </p>
            </div>

            <IntentConsole sampleProjects={featuredProjects} config={intentConfig} />
          </div>
          <div className="glow-divider mt-16" />
        </section>
      )}

      {/* =========================================================================
          SECTION 2: WORKFLOW (FROM CONCEPT TO PROOF)
         ========================================================================= */}
      {sectionsConfig.workflow && (
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Subtle Ambient Glow Orb */}
          <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>02 • ARCHITECTURE</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {sectionsConfig.workflowTitle || 'Collegiate Journey'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                {sectionsConfig.workflowSubtitle || 'From raw concept to verified career proof in four collegiate stages.'}
              </p>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stage 1: Match */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 card-hover-lift flex flex-col justify-between space-y-5 group relative overflow-hidden shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-emerald-400 transition-colors duration-200">
                    01
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-emerald-100 transition-all duration-200">
                    <Users className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors duration-200">
                  Match
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Find peers across campuses whose tech stacks match yours. Filter by languages, commit hours, and target hackathons.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    React
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    FastAPI
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    PyTorch
                  </span>
                </div>
              </div>

              <Link
                href="/teammates"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group/link"
              >
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
              </Link>
            </div>

            {/* Stage 2: Squad Up */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 card-hover-lift flex flex-col justify-between space-y-5 group relative overflow-hidden shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-blue-400 transition-colors duration-200">
                    02
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-200">
                    <Kanban className="w-5 h-5 text-blue-700" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors duration-200">
                  Squad Up
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Lock your team capacity and assign clear responsibilities (Frontend, Backend, AI, Design) with 1-click approvals.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    Role Lock
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    1-Click Apply
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    Milestones
                  </span>
                </div>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group/link"
              >
                <span>Browse Squads</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
              </Link>
            </div>

            {/* Stage 3: Real-Time Workspace */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 card-hover-lift flex flex-col justify-between space-y-5 group relative overflow-hidden shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-pink-400 transition-colors duration-200">
                    03
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 text-pink-800 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-pink-100 transition-all duration-200">
                    <Layers className="w-5 h-5 text-pink-700" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-pink-700 transition-colors duration-200">
                  Build Live
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  No more dead WhatsApp groups. Collaborate in Universal Canvas (Figma/Canva live), Voice Huddle, and AI Closer Kit.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    Live Canvas
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    Audio Huddle
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    AI Pitch Kit
                  </span>
                </div>
              </div>

              <Link
                href="/workspace/demo"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group/link"
              >
                <span>Try Live Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
              </Link>
            </div>

            {/* Stage 4: Prove & Win */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/90 card-hover-lift flex flex-col justify-between space-y-5 group relative overflow-hidden shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-slate-300 group-hover:text-amber-400 transition-colors duration-200">
                    04
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-2xs group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-200">
                    <ShieldCheck className="w-5 h-5 text-amber-700" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-700 transition-colors duration-200">
                  Prove &amp; Win
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Export cryptographically signed Proof-of-Work credentials, link GitHub PRs, and showcase citations in the Hall of Fame.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    Signed Certs
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    GitHub Proof
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[10px]">
                    Hall of Fame
                  </span>
                </div>
              </div>

              <Link
                href="/hackathons"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group/link"
              >
                <span>Browse Competitions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform duration-200 group-hover/link:translate-x-1.5" />
              </Link>
            </div>
          </div>
          <div className="glow-divider mt-16" />
        </div>
      </section>
      )}

      {/* =========================================================================
          SECTION: LINKORA CAMPUS INNOVATION HUB (1 UNIFIED SECTION)
          Modules 1, 2, 3: College Leaderboard, AI Dream Team, Live Campus Pulse
         ========================================================================= */}
      {sectionsConfig.campusPulse !== false && (
        <CampusPulseHub
          sections={sectionsConfig}
          projects={featuredProjects}
          user={user}
        />
      )}

      {/* Custom Admin Spotlight / Announcement Section ("Add whatever you want to the website") - Position: above_showcase */}
      {(sectionsConfig.customSection || masterConfig.customSection?.enabled) &&
        masterConfig.customSection &&
        masterConfig.customSection.position === 'above_showcase' && (
          <CustomAdminSpotlightSection config={masterConfig.customSection} />
        )}

      {/* =========================================================================
          SECTION 3: SHOWCASE (LIVE ACTIVE PROJECTS & HACKATHONS)
         ========================================================================= */}
      {sectionsConfig.showcase && (
        <section className="py-16 md:py-24 relative overflow-hidden">
          {/* Subtle Ambient Glow Orb */}
          <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
            {/* Header with Segmented Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>03 • CAMPUS ACTIVITY</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {sectionsConfig.showcaseTitle || 'Showcase'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
                  {sectionsConfig.showcaseSubtitle || 'Explore active projects recruiting collaborators, or enter upcoming university competitions.'}
                </p>
              </div>

            {/* Segmented Switcher */}
            <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setShowcaseTab('projects')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  showcaseTab === 'projects'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Collegiate Projects</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-white/10 font-mono">
                  {featuredProjects.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowcaseTab('hackathons')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  showcaseTab === 'hackathons'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Hackathons</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                  {activeHackathons.length} Live
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowcaseTab('problems')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  showcaseTab === 'problems'
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <span>Problem Briefs</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
                  {featuredProblems.length}
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: PROJECTS */}
          {showcaseTab === 'projects' && (
            <div className="space-y-8 animate-fadeIn">
              {featuredProjects.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-slate-50 border border-slate-200/80 max-w-lg mx-auto">
                  <p className="text-base font-bold text-slate-800">No projects currently featured.</p>
                  <p className="text-xs text-slate-500 mt-1">Explore all collegiate projects recruiting collaborators across campus.</p>
                  <div className="pt-4">
                    <Link href="/explore">
                      <Button variant="primary" size="sm" className="bg-slate-900 text-white font-bold">
                        Browse Project Directory
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} variant="light" />
                  ))}
                </div>
              )}

              <div className="pt-2 text-center">
                <Link href="/explore">
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-slate-900 hover:bg-black text-white font-bold px-7 py-3 rounded-2xl shadow-sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Browse All Collegiate Projects
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: HACKATHONS */}
          {showcaseTab === 'hackathons' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeHackathons.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link href="/hackathons">
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-slate-900 hover:bg-black text-white font-bold px-7 py-3 rounded-2xl shadow-sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Browse All Competitions &amp; Hackathons
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: PROBLEM STATEMENTS */}
          {showcaseTab === 'problems' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProblems.map((problem) => (
                  <ProblemShowcaseCard key={problem.id} problem={problem} />
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link href="/problems">
                  <Button
                    variant="primary"
                    size="md"
                    className="bg-slate-900 hover:bg-black text-white font-bold px-7 py-3 rounded-2xl shadow-sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Browse All Campus Problem Briefs
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <div className="glow-divider mt-16" />
        </div>
      </section>
      )}

      {/* =========================================================================
          SECTION: VERIFIED COLLEGIATE PARTNER NETWORK (MODULE 3)
         ========================================================================= */}
      {(sectionsConfig.colleges !== false) && masterConfig.colleges && masterConfig.colleges.length > 0 && (
        <section className="py-16 md:py-20 bg-slate-50/60 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-brand-600 font-bold mb-1">
                  <GraduationCap className="w-4 h-4 text-brand-600" />
                  <span>Campus Partner Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Partner Universities & Whitelisted Campuses
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Collegiate communities with authorized builder chapters, automated campus domain verification, and institutional hackathons.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
                {masterConfig.colleges.length} Verified Institutions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {masterConfig.colleges.map((col) => (
                <div
                  key={col.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-md transition-all duration-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-black text-sm shrink-0">
                      {col.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Whitelisted
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{col.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{col.city || 'India'}</span>
                      <span>•</span>
                      <span className="font-mono text-brand-600">@{col.domain}</span>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Partner since {col.partnerSince}</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 4: COMPETE (CAMPUS PASSCODE & PRIVATE CHALLENGES)
         ========================================================================= */}
      {sectionsConfig.hackathons && (
        <section className="py-16 md:py-24 bg-[#fafbfc] border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-rose-600 font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>04 • UNIVERSITY PORTAL</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Compete
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-normal">
                Enter your department passcode to unlock private hackathon guidelines and form teams.
              </p>
            </div>

            {/* Passcode Quick Entry Card */}
            <div className="max-w-3xl mx-auto p-7 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900">Department Challenge Passcode</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-bold uppercase">
                    Encrypted
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  Announced by your faculty or hackathon leads? Enter the event code below.
                </p>
              </div>

              <form onSubmit={handleQuickJoin} className="flex items-center gap-2 flex-1 sm:max-w-sm">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickPasscode}
                    onChange={(e) => setQuickPasscode(e.target.value)}
                    placeholder="e.g. col-apex26"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors shadow-2xs"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="bg-slate-900 hover:bg-black text-white shrink-0 font-bold py-2.5 px-5 shadow-2xs rounded-xl"
                >
                  Unlock
                </Button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION: STUDENT HALL OF FAME & HONORS BADGES (MODULE 4)
         ========================================================================= */}
      {(sectionsConfig.badges !== false) && masterConfig.badges && masterConfig.badges.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-600 font-bold mb-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Collegiate Honors & Achievements</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Student Hall of Fame & Citations
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  Celebrating outstanding collegiate engineers, open-source innovators, and hackathon champions recognized across campuses.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
                {masterConfig.badges.length} Honors Conferred
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {masterConfig.badges.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-gradient-to-br from-white to-slate-50/70 border border-slate-200/90 hover:border-amber-400/80 hover:shadow-lg transition-all duration-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-900">
                        {b.badgeTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(b.awardedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      &ldquo;{b.reason}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {b.username.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900">@{b.username}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                      by {b.awardedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom Admin Spotlight / Announcement Section ("Add whatever you want to the website") - Position: above_footer */}
      {(sectionsConfig.customSection || masterConfig.customSection?.enabled) &&
        masterConfig.customSection &&
        masterConfig.customSection.position === 'above_footer' && (
          <CustomAdminSpotlightSection config={masterConfig.customSection} />
        )}


      {/* =========================================================================
          SECTION 5: BEGIN (CLOSING CALL TO ACTION)
         ========================================================================= */}
      {sectionsConfig.ctaBanner && (
        <section className="py-20 md:py-28 relative text-center bg-white overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-10 sm:p-16 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>05 • JOIN LINKORA</span>
                </div>
              </div>

              <h2 className="text-4xl sm:text-7xl font-black tracking-tight leading-tight w-full text-center">
                <span className="begin-colorful">Begin</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
                Stop coding in isolation. Find your squad, build production software, and prove your engineering caliber today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link href="/explore">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="font-bold px-8 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-sm border-none transition-all"
                    leftIcon={<Compass className="w-4 h-4 text-slate-900" />}
                  >
                    Explore Projects
                  </Button>
                </Link>

                {!mounted ? (
                  <div className="w-40 h-12 rounded-2xl bg-slate-800 animate-pulse border border-slate-700" />
                ) : user ? (
                  <Link href="/projects/new">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="font-bold px-8 py-3.5 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 bg-slate-800/80 hover:border-slate-500 shadow-sm transition-all"
                      leftIcon={<PlusCircle className="w-4 h-4 text-white" />}
                    >
                      Start a Project
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    size="lg"
                    className="font-bold px-8 py-3.5 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 bg-slate-800/80 hover:border-slate-500 shadow-sm transition-all"
                    onClick={() => openAuthModal('signup')}
                    leftIcon={<Users className="w-4 h-4 text-white" />}
                  >
                    Join Linkora Free
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Linkora Spark: AI Blueprint & Squad Generator Modal */}
      <ProjectSparkGeneratorModal
        isOpen={isSparkModalOpen}
        onClose={() => setIsSparkModalOpen(false)}
      />
    </div>
  );
}
