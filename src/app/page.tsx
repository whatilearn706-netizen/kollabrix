'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { ProblemShowcaseCard } from '@/components/problems/ProblemShowcaseCard';
import { HeroProductPreview } from '@/components/landing/HeroProductPreview';
import { CollegiateWorkflow } from '@/components/landing/CollegiateWorkflow';
import { VerifiedProofAndSpotlights } from '@/components/landing/VerifiedProofAndSpotlights';
import { CampusPasscodeCard } from '@/components/landing/CampusPasscodeCard';
import { CampusPulseHub } from '@/components/landing/CampusPulseHub';
import { CampusOpportunityTicker } from '@/components/landing/CampusOpportunityTicker';
import { CustomAdminSpotlightSection } from '@/components/landing/CustomAdminSpotlightSection';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { DEMO_PROBLEMS } from '@/data/mockProblems';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Project, Hackathon, ProblemStatement } from '@/types/database';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { isFacultyUser } from '@/lib/auth/faculty';
import {
  Compass,
  Users,
  Trophy,
  PlusCircle,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  Lightbulb,
} from 'lucide-react';
import {
  HomepageIntentConfig,
  HomepageShowcaseConfig,
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  DEFAULT_HOMEPAGE_SHOWCASE_CONFIG,
} from '@/types/homepageConfig';
import {
  HomepageSectionToggles,
  MasterControlConfig,
  DEFAULT_MASTER_CONTROL_CONFIG,
} from '@/types/masterControl';

const PortalsSideRail = dynamic(
  () => import('@/components/home/PortalsSideRail').then((m) => m.PortalsSideRail),
  { ssr: false }
);

const ProjectSparkGeneratorModal = dynamic(
  () => import('@/components/ai/ProjectSparkGeneratorModal').then((m) => m.ProjectSparkGeneratorModal),
  { ssr: false }
);

/**
 * High-performance 120fps Top Scroll Progress Beam
 * Updates native DOM transform directly via requestAnimationFrame without triggering React re-renders.
 */
function TopScrollProgressBeam() {
  const beamRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      if (beamRef.current) {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalScroll > 0 ? Math.min(Math.max(window.scrollY / totalScroll, 0), 1) : 0;
        beamRef.current.style.transform = `scaleX(${progress})`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={beamRef}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-600 via-indigo-500 to-pink-500 z-50 pointer-events-none origin-left shadow-[0_0_12px_rgba(139,92,246,0.5)]"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}

export default function HomePage() {
  const { user, profile, openAuthModal } = useAuth();
  const { theme, isDark } = useSiteTheme();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>(DEMO_PROJECTS.slice(0, 3));
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>(CURATED_HACKATHONS.slice(0, 3));
  const [featuredProblems, setFeaturedProblems] = useState<ProblemStatement[]>(DEMO_PROBLEMS.slice(0, 3));
  const [, setIsLoadingData] = useState(true);
  const [showcaseTab, setShowcaseTab] = useState<'projects' | 'hackathons' | 'problems'>('projects');
  const [oauthErrorNotice, setOauthErrorNotice] = useState<string | null>(null);
  const [isSparkModalOpen, setIsSparkModalOpen] = useState(false);
  const [, setIntentConfig] = useState<HomepageIntentConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const localI = localStorage.getItem('linkora_intent_config_v1');
        if (localI) return JSON.parse(localI);
      } catch {}
    }
    return DEFAULT_HOMEPAGE_INTENT_CONFIG;
  });
  const [, setShowcaseConfig] = useState<HomepageShowcaseConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const localS = localStorage.getItem('linkora_showcase_config_v1');
        if (localS) return JSON.parse(localS);
      } catch {}
    }
    return DEFAULT_HOMEPAGE_SHOWCASE_CONFIG;
  });
  const [sectionsConfig, setSectionsConfig] = useState<HomepageSectionToggles>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedM = localStorage.getItem('linkora_master_control_v1');
        if (cachedM) {
          const parsed = JSON.parse(cachedM);
          if (parsed?.sections) return { ...DEFAULT_MASTER_CONTROL_CONFIG.sections, ...parsed.sections };
        }
      } catch {}
    }
    return DEFAULT_MASTER_CONTROL_CONFIG.sections;
  });
  const [masterConfig, setMasterConfig] = useState<MasterControlConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedM = localStorage.getItem('linkora_master_control_v1');
        if (cachedM) {
          const parsed = JSON.parse(cachedM);
          if (parsed) return { ...DEFAULT_MASTER_CONTROL_CONFIG, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_MASTER_CONTROL_CONFIG;
  });
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
        let liveIntent = DEFAULT_HOMEPAGE_INTENT_CONFIG;
        let liveShowcase = DEFAULT_HOMEPAGE_SHOWCASE_CONFIG;

        try {
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

        try {
          let currentM = DEFAULT_MASTER_CONTROL_CONFIG;
          const cachedM = localStorage.getItem('linkora_master_control_v1');
          if (cachedM) {
            try {
              currentM = JSON.parse(cachedM);
              if (currentM?.sections) setSectionsConfig(currentM.sections);
              setMasterConfig(currentM);
            } catch {}
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
              } catch {}
            } else if (cachedM && currentM) {
              if (currentM.sections) setSectionsConfig(currentM.sections);
              setMasterConfig(currentM);
            }
          }
        } catch {}

        setIntentConfig(liveIntent);
        setShowcaseConfig(liveShowcase);

        // 1. Check deleted projects tombstone and verified users from platform_settings
        const deletedSet = new Set<string>();
        const verifiedUserSet = new Set<string>();
        if (isSupabaseConfigured()) {
          try {
            const { data: sRows } = await supabase
              .from('platform_settings')
              .select('key, value')
              .in('key', ['deleted_projects', 'linkedin_college_verifications', 'site_master_control_config']);

            if (Array.isArray(sRows)) {
              for (const row of sRows) {
                if (row.key === 'deleted_projects' && row.value) {
                  const raw = row.value;
                  const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
                  const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
                  [...ids, ...titles].forEach((s: string) => {
                    if (s) deletedSet.add(s.trim().toLowerCase());
                  });
                } else if (row.key === 'site_master_control_config' && row.value?.deletedProjects) {
                  const raw = row.value.deletedProjects;
                  const ids: string[] = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
                  const titles: string[] = Array.isArray(raw.deletedTitles) ? raw.deletedTitles : [];
                  [...ids, ...titles].forEach((s: string) => {
                    if (s) deletedSet.add(s.trim().toLowerCase());
                  });
                } else if (row.key === 'linkedin_college_verifications' && Array.isArray(row.value)) {
                  row.value.forEach((v: { userId?: string; username?: string }) => {
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
      } catch {}
    };
    window.addEventListener('linkora_master_control_updated', handleMasterUpdate);
    return () => {
      window.removeEventListener('linkora_master_control_updated', handleMasterUpdate);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.bodyTextColor,
      }}
      className="flex flex-col w-full overflow-hidden transition-colors duration-200"
    >
      {/* Dynamic Ambient Top Scroll Beam (GPU Accelerated 120fps) */}
      <TopScrollProgressBeam />

      {/* Real-time Campus Opportunity Ticker */}
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
          1. SIMPLER FIRST SCREEN: PRODUCT-FIRST HERO WITH CLEAR VALUE & 2 CTAS
         ========================================================================= */}
      {sectionsConfig.hero && (
        <section className="relative pt-8 pb-14 md:pt-16 md:pb-20 overflow-hidden border-b border-slate-200/80 dark:border-white/10">
          {/* Subtle Ambient Glow Lighting */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-violet-600/15 via-indigo-600/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-gradient-to-bl from-pink-500/10 via-rose-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Clear Headline, Crisp Explanation, Exactly 2 Main Actions */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Clean, Restrained Identity Badge */}
                <div
                  style={{ borderRadius: theme.borderRadius }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 backdrop-blur-md bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold tracking-wider uppercase shadow-2xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <span>{theme.heroBadgeText || 'Linkora • Student Collaboration Network'}</span>
                </div>

                <h1
                  style={{
                    color: theme.headingColor,
                    fontFamily: `var(--site-font-heading, "${theme.headingFont}")`,
                    letterSpacing: theme.letterSpacing,
                    fontWeight: theme.headingWeight,
                  }}
                  className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.06]"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500">
                    Build something real,
                  </span>{' '}
                  <span>together.</span>
                </h1>

                <p
                  style={{
                    color: theme.bodyTextColor,
                    fontFamily: `var(--site-font-body, "${theme.bodyFont}")`,
                  }}
                  className="text-base sm:text-lg leading-relaxed font-normal max-w-2xl text-slate-600 dark:text-slate-300"
                >
                  {theme.heroSubheadline ||
                    'The student collaboration network. Connect with university builders, assemble hackathon dream squads, and turn ideas into verified software.'}
                </p>

                {/* Exactly 2 Main Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="/explore">
                    <Button
                      variant="primary"
                      size="lg"
                      style={{
                        backgroundColor: theme.brandColor,
                        borderRadius: theme.borderRadius,
                      }}
                      className="hover:opacity-90 text-white font-bold px-7 py-3.5 shadow-sm border-0 transition-all active:scale-[0.98]"
                      leftIcon={<Compass className="w-4 h-4" />}
                    >
                      Find a project
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
                        Find teammates
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Transparent Micro-Proof Strip */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>250+ Squads Formed</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-500 shrink-0" />
                    <span>94% Algorithmic Match</span>
                  </div>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Verified GitHub Proof</span>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Signal Interactive Product Preview (Replaces Origami Bird) */}
              <div className="lg:col-span-6 w-full flex items-center justify-center">
                <HeroProductPreview />
              </div>
            </div>
          </div>

          {/* Portals Side Rail for Fast Direct Navigation */}
          <PortalsSideRail />
        </section>
      )}

      {/* Custom Admin Spotlight / Announcement Section */}
      {(sectionsConfig.customSection || masterConfig.customSection?.enabled) &&
        masterConfig.customSection &&
        (masterConfig.customSection.position || 'below_hero') === 'below_hero' && (
          <CustomAdminSpotlightSection config={masterConfig.customSection} />
        )}

      {/* =========================================================================
          AUTH BANNER (FOR SIGNED-IN STUDENTS / EDUCATORS)
         ========================================================================= */}
      {mounted && user && (
        <section className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] py-4">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Welcome back, {profile?.display_name || user.email?.split('@')[0]}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
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
          2. FEATURED OPPORTUNITIES SHOWCASE (PRIMARY VALUE DESTINATION)
             Clean, segmented tabs: Projects, Hackathons, Problem Statements
         ========================================================================= */}
      {sectionsConfig.showcase && (
        <section className="py-16 md:py-24 relative overflow-hidden bg-white dark:bg-transparent border-b border-slate-200/80 dark:border-white/10">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-10 relative z-10">
            {/* Header with Segmented Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Active Campus Opportunities</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {sectionsConfig.showcaseTitle || 'Explore What’s Building'}
                </h2>
                <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl font-normal">
                  {sectionsConfig.showcaseSubtitle ||
                    'Join student projects recruiting collaborators, or enter upcoming university competitions.'}
                </p>
              </div>

              {/* Segmented Tab Switcher */}
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
                  <span>Problem Statements</span>
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
          </div>
        </section>
      )}

      {/* =========================================================================
          3. HOW IT WORKS: THE COLLEGIATE JOURNEY (MATCH -> SQUAD -> SHIP)
         ========================================================================= */}
      {sectionsConfig.workflow && (
        <CollegiateWorkflow
          title={sectionsConfig.workflowTitle}
          subtitle={sectionsConfig.workflowSubtitle}
        />
      )}

      {/* =========================================================================
          4. CAMPUS INNOVATION HUB (SECONDARY FEATURES ORGANIZED IN ONE PLACE)
             Modules: National Leaderboard, AI Dream Team / Spark, Live Deadlines
         ========================================================================= */}
      {sectionsConfig.campusPulse !== false && (
        <CampusPulseHub
          sections={sectionsConfig}
          projects={featuredProjects}
          user={user}
        />
      )}

      {/* =========================================================================
          5. SPECIFIC PROOF & REAL STUDENT TESTIMONIALS (BUILDING TRUST)
         ========================================================================= */}
      <VerifiedProofAndSpotlights />

      {/* =========================================================================
          6. DEPARTMENT PASSCODE UNLOCK & PRIVATE HACKATHONS
         ========================================================================= */}
      {sectionsConfig.hackathons && <CampusPasscodeCard />}

      {/* =========================================================================
          7. VERIFIED COLLEGIATE PARTNER NETWORK
         ========================================================================= */}
      {sectionsConfig.colleges !== false && masterConfig.colleges && masterConfig.colleges.length > 0 && (
        <section className="py-16 md:py-20 bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-violet-600 dark:text-violet-400 font-bold mb-1">
                  <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  <span>Campus Partner Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Partner Universities &amp; Whitelisted Campuses
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                  Collegiate communities with authorized builder chapters, automated campus domain verification, and institutional hackathons.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs self-start md:self-auto">
                {masterConfig.colleges.length} Verified Institutions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {masterConfig.colleges.map((col) => (
                <div
                  key={col.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:shadow-md transition-all duration-200 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-700 dark:text-violet-300 font-black text-sm shrink-0">
                      {col.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                      Whitelisted
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{col.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{col.city || 'India'}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-violet-600 dark:text-violet-400">@{col.domain}</span>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Partner since {col.partnerSince}</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
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
          8. STUDENT HALL OF FAME & HONORS BADGES
         ========================================================================= */}
      {sectionsConfig.badges !== false && masterConfig.badges && masterConfig.badges.length > 0 && (
        <section className="py-16 md:py-20 bg-white dark:bg-transparent border-b border-slate-200/80 dark:border-white/10">
          <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold mb-1">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Collegiate Honors &amp; Achievements</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Student Hall of Fame &amp; Citations
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                  Celebrating outstanding collegiate engineers, open-source innovators, and hackathon champions recognized across campuses.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs self-start md:self-auto">
                {masterConfig.badges.length} Honors Conferred
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {masterConfig.badges.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 hover:border-amber-400/80 hover:shadow-lg transition-all duration-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-300">
                        {b.badgeTitle}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(b.awardedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      &ldquo;{b.reason}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {b.username.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">@{b.username}</span>
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

      {/* =========================================================================
          9. CLOSING CALL TO ACTION
         ========================================================================= */}
      {sectionsConfig.ctaBanner && (
        <section className="py-20 md:py-28 relative text-center bg-white dark:bg-transparent overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-10 sm:p-16 rounded-3xl bg-slate-900 text-white dark:bg-slate-950 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Join Linkora Free</span>
                </div>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight w-full text-center">
                Ready to build something real?
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
                    Find a project
                  </Button>
                </Link>

                <Link href="/teammates">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="font-bold px-8 py-3.5 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 bg-slate-800/80 hover:border-slate-500 shadow-sm transition-all"
                    leftIcon={<Users className="w-4 h-4 text-white" />}
                  >
                    Find teammates
                  </Button>
                </Link>
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
