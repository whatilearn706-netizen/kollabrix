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
  Code2,
  Palette,
  Flame,
  Star,
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
            setActiveHackathons(CURATED_HACKATHONS.slice(0, 3));
          }
        } else {
          setFeaturedProjects(DEMO_PROJECTS.slice(0, 3));
          setActiveHackathons(CURATED_HACKATHONS.slice(0, 3));
        }
      } catch (err) {
        console.warn('Error loading live homepage data:', err);
        setFeaturedProjects(DEMO_PROJECTS.slice(0, 3));
        setActiveHackathons(CURATED_HACKATHONS.slice(0, 3));
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
          SECTION 01: THE DARK SECTION (HIGH-TECH ENGINEERING COMMAND CONSOLE)
         ========================================================================= */}
      <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 overflow-hidden bg-hero-radial border-b border-charcoal-800/80">
        {/* Subtle Background Grid Accent */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-2 pb-10">
            {/* Dark Section Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              <span>SECTION 01 &middot; DARK COMMAND CONSOLE</span>
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
              The high-tech platform where college students assemble by skills, launch semester projects,
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

          {/* Interactive Hero Command Center (4 Live Interactive Tabs) */}
          <div className="mt-2">
            <HeroCommandCenter
              featuredProjects={featuredProjects}
              activeHackathons={activeHackathons}
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          AUTH-ADAPTIVE BANNER (FOR SIGNED-IN STUDENTS / EDUCATORS)
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
          TRANSITION BRIDGE: DARK COMMAND CONSOLE ⇄ COLORFUL CAMPUS HUB
         ========================================================================= */}
      <div className="relative z-20 -my-5 flex justify-center px-4 pointer-events-none">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white text-slate-900 border-2 border-slate-200 shadow-xl shadow-indigo-500/10 text-xs font-bold tracking-wide pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 animate-pulse" />
          <span>Dark Command Terminal &darr; Colorful Campus Experience</span>
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white text-[10px] uppercase font-mono shadow-sm">
            Interactive Dual Canvas
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 02: THE LIGHT & COLORFUL SECTION (ATTRACTIVE, VIBRANT, EYE-CATCHING)
         ========================================================================= */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-white via-slate-50 to-indigo-50/20 text-slate-900 overflow-hidden border-b border-slate-200">
        {/* Ambient Vibrant Colored Auras for Maximum Visual Magnetism */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-300/35 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
          {/* Header of Section 2: Light & Colorful */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 text-white text-xs font-bold shadow-md shadow-pink-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>SECTION 02 &middot; THE COLORFUL CAMPUS HUB</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Where student builders turn ideas into{' '}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                color, code &amp; momentum
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Collegiate energy at its brightest. Connect across departments, ship semester sprint milestones,
              and win private hackathons with verified proof.
            </p>
          </div>

          {/* 3-STEP BUILDER JOURNEY — WITH VIBRANT, ATTRACTIVE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {/* Step 1: Assemble by Skills (Violet & Royal Indigo) */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-50/90 via-white to-indigo-50/60 border-2 border-violet-100 hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/15 transition-all duration-300 group flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    01
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-violet-700 transition-colors">
                  Assemble by Skills
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Discover peers across campus whose tech stacks complement yours. Filter by languages,
                  commit hours, and preferred roles to recruit a balanced squad.
                </p>

                {/* Colorful Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-violet-100 text-violet-800 font-semibold text-xs border border-violet-200">
                    React.js
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 font-semibold text-xs border border-indigo-200">
                    FastAPI
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-pink-100 text-pink-800 font-semibold text-xs border border-pink-200">
                    UI/UX Design
                  </span>
                </div>
              </div>

              <Link
                href="/teammates"
                className="inline-flex items-center text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors pt-2 group-hover:translate-x-1 duration-150"
              >
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Step 2: Sprint in Workspaces (Sunset Coral & Warm Amber) */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 border-2 border-rose-100 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-500/15 transition-all duration-300 group flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-rose-600" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">
                    02
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                    <Kanban className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-rose-700 transition-colors">
                  Sprint in Workspaces
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Collaborate in dedicated team workspaces with sprint kanbans, real-time discussions,
                  and private collegiate hackathon problem statement tracks.
                </p>

                {/* Colorful Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200">
                    Sprint Kanban
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-orange-100 text-orange-900 font-semibold text-xs border border-orange-200">
                    Team Chat
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-900 font-semibold text-xs border border-rose-200">
                    Milestones
                  </span>
                </div>
              </div>

              <Link
                href="/hackathons"
                className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors pt-2 group-hover:translate-x-1 duration-150"
              >
                <span>Browse Competitions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>

            {/* Step 3: Verify Career Proof (Lush Mint & Emerald) */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-2 border-emerald-100 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-300 group flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-600" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    03
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Verify Career Proof
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Link GitHub pull requests and commit hashes directly to completed tasks. Earn faculty reviews
                  and export tamper-resistant proof of work to your portfolio.
                </p>

                {/* Colorful Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-semibold text-xs border border-emerald-200">
                    GitHub PR #24
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 font-semibold text-xs border border-teal-200">
                    48 Unit Tests
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-100 text-cyan-900 font-semibold text-xs border border-cyan-200">
                    Faculty Verified
                  </span>
                </div>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors pt-2 group-hover:translate-x-1 duration-150"
              >
                <span>Explore Live Projects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* =====================================================================
              CAMPUS PULSE — VIBRANT LIVE SHOWCASE (PROJECTS & HACKATHONS TABBED)
             ===================================================================== */}
          <div className="space-y-10 pt-6">
            {/* Header with Segmented Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-violet-700 font-bold mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Campus Pulse</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Live Collegiate Activity
                </h3>
                <p className="mt-1 text-sm text-slate-600 max-w-xl">
                  Explore active projects recruiting collaborators, or enter upcoming university competitions.
                </p>
              </div>

              {/* Segmented Switcher on Light Canvas */}
              <div className="p-1.5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowcaseTab('projects')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    showcaseTab === 'projects'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Featured Projects</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowcaseTab('hackathons')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    showcaseTab === 'hackathons'
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-rose-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Campus Hackathons</span>
                </button>
              </div>
            </div>

            {/* TAB 1: FEATURED PROJECTS (COLORFUL LIGHT CARDS) */}
            {showcaseTab === 'projects' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} variant="light" />
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <Link href="/explore">
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-violet-500/20"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Browse All Projects in Directory
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: CAMPUS HACKATHONS WITH SUNSET GRADIENT PASSCODE FORM */}
            {showcaseTab === 'hackathons' && (
              <div className="space-y-8 animate-fadeIn">
                {/* Passcode Quick Entry Card with Attractive Sunset Colors */}
                <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 border-2 border-amber-200/90 shadow-xl shadow-amber-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Private Collegiate Access</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      Have a College Join Code or Passcode?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      Enter your university passcode to unlock problem statements, register your team, and access rubric judging.
                    </p>
                  </div>

                  <form onSubmit={handleQuickJoin} className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <div className="relative flex-1 md:w-64">
                      <KeyRound className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={quickPasscode}
                        onChange={(e) => setQuickPasscode(e.target.value)}
                        placeholder="Passcode (e.g. col-apex26)"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-white border-2 border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shrink-0 font-bold py-3 px-6 shadow-md shadow-rose-500/25"
                    >
                      Enter Event
                    </Button>
                  </form>
                </div>

                {/* Hackathons Cards Grid (Colorful Light Styling) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeHackathons.map((hackathon) => (
                    <div
                      key={hackathon.id}
                      className="p-6 rounded-3xl bg-white border-2 border-slate-100 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between space-y-4 relative overflow-hidden"
                    >
                      {/* Top Accent Stripe */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500" />

                      <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>{hackathon.access_type === 'private' ? 'Private College' : 'Open Track'}</span>
                          </span>
                          <span className="text-xs font-mono font-semibold text-slate-500">
                            {hackathon.mode}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
                          {hackathon.title}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {hackathon.description || 'Collegiate hackathon competition track.'}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Prize Pool:</span>
                          <span className="text-amber-800 font-black font-mono text-sm px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                            {hackathon.prize_pool || '₹1,50,000'}
                          </span>
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
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-sm"
                          >
                            View Details &amp; Register
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-center">
                  <Link href="/hackathons">
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-orange-500/20"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Browse All Hackathons
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL FOCUSED LAUNCHPAD (HIGH-IMPACT CLOSURE)
         ========================================================================= */}
      <section className="py-20 md:py-28 relative text-center bg-midnight-950 overflow-hidden">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 bg-hero-radial opacity-50 pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white text-xs font-mono font-semibold shadow-sm">
            <span>Ready to Build Something Unforgettable?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Stop coding alone.{' '}
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              Start building together.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your student profile in seconds, explore active college projects, or launch your own semester idea today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/explore">
              <Button
                variant="primary"
                size="lg"
                className="font-bold px-8 shadow-glow-sm hover:shadow-glow-md bg-gradient-to-r from-indigo-600 via-brand-600 to-violet-600"
                leftIcon={<Compass className="w-4 h-4" />}
              >
                Explore Active Projects
              </Button>
            </Link>

            {user ? (
              <Link href="/projects/new">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-bold px-8 border-charcoal-700 hover:border-indigo-400 text-white"
                  leftIcon={<PlusCircle className="w-4 h-4 text-indigo-400" />}
                >
                  Start a Project
                </Button>
              </Link>
            ) : (
              <Button
                variant="secondary"
                size="lg"
                className="font-bold px-8 border-charcoal-700 hover:border-pink-500/40 text-white"
                onClick={() => openAuthModal('signup')}
                leftIcon={<Users className="w-4 h-4 text-pink-400" />}
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
