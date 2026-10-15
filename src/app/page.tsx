'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { HeroCommandCenter } from '@/components/landing/HeroCommandCenter';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { CURATED_HACKATHONS } from '@/data/mockHackathons';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Project, Hackathon } from '@/types/database';
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
  GitPullRequest,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Layers,
  Kanban,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, profile, openAuthModal } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showcaseTab, setShowcaseTab] = useState<'projects' | 'hackathons'>('projects');
  const [quickPasscode, setQuickPasscode] = useState('');

  const isTeacher =
    (profile?.role === 'teacher' || profile?.role === 'admin') &&
    (!profile?.birth_year || profile?.birth_year <= 2003);

  // Load real projects and hackathons from Supabase (with demo fallback)
  useEffect(() => {
    async function loadLiveData() {
      setIsLoadingData(true);
      try {
        if (isSupabaseConfigured()) {
          // 1. Fetch featured or recent active projects
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
            .limit(3);

          if (projs && projs.length > 0) {
            setFeaturedProjects(projs as Project[]);
          } else {
            setFeaturedProjects(DEMO_PROJECTS.slice(0, 3));
          }

          // 2. Fetch live published hackathons
          const { data: hacks } = await supabase
            .from('hackathons')
            .select('*')
            .in('status', ['published', 'ongoing', 'registration_open'])
            .order('created_at', { ascending: false })
            .limit(3);

          if (hacks && hacks.length > 0) {
            setActiveHackathons(hacks as Hackathon[]);
          } else {
            setActiveHackathons(CURATED_HACKATHONS.slice(0, 2));
          }
        } else {
          setFeaturedProjects(DEMO_PROJECTS.slice(0, 3));
          setActiveHackathons(CURATED_HACKATHONS.slice(0, 2));
        }
      } catch (err) {
        console.warn('Error loading live homepage data:', err);
        setFeaturedProjects(DEMO_PROJECTS.slice(0, 3));
        setActiveHackathons(CURATED_HACKATHONS.slice(0, 2));
      } finally {
        setIsLoadingData(false);
      }
    }

    loadLiveData();
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
    <div className="flex flex-col w-full overflow-hidden bg-midnight-950">
      {/* =========================================================================
          1. HERO SECTION & INTERACTIVE COMMAND CENTER (UNCLUTTERED, INSTANT UNDERSTANDING)
         ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 border-b border-charcoal-800/70 overflow-hidden bg-hero-radial">
        {/* Subtle Background Grid Accent */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-2 pb-10">
            {/* Collegiate Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Collegiate Collaboration &amp; Hackathon Workspace</span>
            </div>

            {/* Main Punchy Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
              Find your squad.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-brand-300 to-violet-400">
                Build real projects.
              </span>
            </h1>

            {/* Plain-Language Supporting Message */}
            <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              The platform where college students assemble by skills, launch semester projects,
              compete in private hackathons, and verify deliverables on GitHub.
            </p>

            {/* Two Dominant Primary Calls to Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/explore">
                <Button
                  variant="primary"
                  size="lg"
                  className="font-semibold px-7 shadow-glow-sm hover:shadow-glow-md"
                  leftIcon={<Compass className="w-4 h-4" />}
                >
                  Explore Projects
                </Button>
              </Link>

              <Link href="/teammates">
                <Button
                  variant="secondary"
                  size="lg"
                  className="font-semibold px-7 border-charcoal-700 hover:border-indigo-500/40"
                  leftIcon={<Users className="w-4 h-4 text-indigo-400" />}
                >
                  Find Teammates
                </Button>
              </Link>
            </div>

            {/* Minimal Trust Indicator */}
            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Skill-Weighted Matching
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                GitHub Task Evidence
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Private Campus Passcodes
              </span>
            </div>
          </div>

          {/* Interactive Hero Command Center (Instantly Demonstrates Platform Pillars) */}
          <div className="mt-2">
            <HeroCommandCenter
              featuredProjects={featuredProjects}
              activeHackathons={activeHackathons}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. AUTH-ADAPTIVE BANNER (FOR SIGNED-IN STUDENTS / EDUCATORS)
         ========================================================================= */}
      {user && (
        <section className="border-b border-charcoal-800/70 bg-midnight-900/80 py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-charcoal-900/90 border border-charcoal-750">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Welcome back, {profile?.display_name || user.email?.split('@')[0]}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isTeacher
                      ? 'Educator Access: Manage campus hackathons, student problem statements, and reviews.'
                      : 'Jump directly back into your sprint workboards, applications, or team matching.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                {isTeacher ? (
                  <>
                    <Link href="/teacher/dashboard">
                      <Button variant="primary" size="sm" leftIcon={<GraduationCap className="w-4 h-4" />}>
                        Mentor Dashboard
                      </Button>
                    </Link>
                    <Link href="/hackathons">
                      <Button variant="outline" size="sm" leftIcon={<Trophy className="w-4 h-4 text-amber-400" />}>
                        Host Hackathon
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/my-projects">
                      <Button variant="primary" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
                        My Projects
                      </Button>
                    </Link>
                    <Link href="/projects/new">
                      <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-4 h-4 text-indigo-400" />}>
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
          3. HOW IT WORKS — THE 3-STEP COLLEGIATE BUILDER CYCLE
         ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-charcoal-800/70 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>The Builder Cycle</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              From idea to verified career proof in 3 steps
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Built specifically for college students, semester teams, and university hackathons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1: Match */}
            <div className="p-7 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-indigo-500/50 transition-all shadow-subtle group flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-indigo-400/60 group-hover:text-indigo-400 transition-colors">
                    01
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Assemble by Skills
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Discover peers across campus whose tech stacks complement yours. Filter by languages,
                  commit hours, and preferred roles to recruit a balanced squad.
                </p>
              </div>

              <Link
                href="/teammates"
                className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-2"
              >
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Step 2: Sprint */}
            <div className="p-7 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-amber-500/50 transition-all shadow-subtle group flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-amber-400/60 group-hover:text-amber-400 transition-colors">
                    02
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Kanban className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  Sprint in Workspaces
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Collaborate in dedicated team workspaces with sprint kanbans, real-time discussions,
                  and private collegiate hackathon problem statement tracks.
                </p>
              </div>

              <Link
                href="/hackathons"
                className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors pt-2"
              >
                <span>Browse Competitions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Step 3: Prove */}
            <div className="p-7 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-emerald-500/50 transition-all shadow-subtle group flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
                    03
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Verify Career Proof
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Link GitHub pull requests and commit hashes directly to completed tasks. Earn faculty reviews
                  and export tamper-resistant proof of work to your portfolio.
                </p>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pt-2"
              >
                <span>Explore Live Projects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CAMPUS PULSE — UNIFIED SHOWCASE (PROJECTS & HACKATHONS TABBED)
         ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-charcoal-800/70 bg-charcoal-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header with Segmented Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Campus Pulse</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Live Collegiate Activity
              </h2>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Explore active projects recruiting collaborators, or enter upcoming university competitions.
              </p>
            </div>

            {/* Segmented Switcher */}
            <div className="p-1 rounded-xl bg-midnight-900 border border-charcoal-750 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowcaseTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  showcaseTab === 'projects'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Featured Projects</span>
              </button>

              <button
                type="button"
                onClick={() => setShowcaseTab('hackathons')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  showcaseTab === 'hackathons'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Campus Hackathons</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FEATURED PROJECTS */}
          {showcaseTab === 'projects' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link href="/explore">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Browse All Projects in Directory
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPUS HACKATHONS WITH PASSCODE FORM */}
          {showcaseTab === 'hackathons' && (
            <div className="space-y-6">
              {/* Passcode Quick Entry Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-midnight-900/90 border border-amber-500/30 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private Collegiate Access</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Have a College Join Code or Passcode?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Enter your university passcode to unlock problem statements, create your team, and access rubric judging.
                  </p>
                </div>

                <form onSubmit={handleQuickJoin} className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <div className="relative flex-1 md:w-64">
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={quickPasscode}
                      onChange={(e) => setQuickPasscode(e.target.value)}
                      placeholder="Passcode (e.g. col-apex26)"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-midnight-950 border border-charcoal-700 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 font-semibold"
                  >
                    Enter
                  </Button>
                </form>
              </div>

              {/* Hackathons Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeHackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-amber-500/40 transition-all shadow-subtle flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>{hackathon.access_type === 'private' ? 'Private' : 'Open'}</span>
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {hackathon.mode}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white line-clamp-1">
                        {hackathon.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {hackathon.description || 'Collegiate hackathon competition track.'}
                      </p>

                      <div className="pt-2 border-t border-charcoal-800 text-xs text-slate-300">
                        Prize Pool: <strong className="text-amber-300 font-mono">{hackathon.prize_pool || 'TBA'}</strong>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        href={
                          hackathon.join_code
                            ? `/h/${hackathon.join_code}`
                            : `/hackathons/${hackathon.id}`
                        }
                      >
                        <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                          View Details &amp; Register
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <Link href="/hackathons">
                  <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Browse All Hackathons
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. FINAL FOCUSED CALL TO ACTION
         ========================================================================= */}
      <section className="py-20 md:py-28 relative text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono">
            <span>Ready to Build</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Stop coding alone. Start building with a team.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your student profile in seconds, explore active college projects, or launch your own semester idea today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/explore">
              <Button variant="primary" size="lg" className="font-semibold px-6" leftIcon={<Compass className="w-4 h-4" />}>
                Explore Active Projects
              </Button>
            </Link>

            {user ? (
              <Link href="/projects/new">
                <Button variant="outline" size="lg" className="font-semibold px-6" leftIcon={<PlusCircle className="w-4 h-4 text-indigo-400" />}>
                  Start a Project
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                className="font-semibold px-6 border-charcoal-700"
                onClick={() => openAuthModal('signup')}
                leftIcon={<Users className="w-4 h-4 text-indigo-400" />}
              >
                Join TeamForge Free
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
