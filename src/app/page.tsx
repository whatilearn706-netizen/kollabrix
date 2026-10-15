'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { HeroSculpture } from '@/components/canvas/HeroSculpture';
import { IntentConsole } from '@/components/landing/IntentConsole';
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
  ShieldCheck,
  Layers,
  Kanban,
  CheckCircle2,
  KeyRound,
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
    <div className="flex flex-col w-full overflow-hidden bg-[#fafbfc] text-slate-900">
      {/* =========================================================================
          1. EDITORIAL 3D HERO: CREATIVE STUDIO EXPERIENCE
         ========================================================================= */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-2 pb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>TeamForge • Collegiate Innovation Studio</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.08] max-w-4xl mx-auto">
              Build something bigger, together.
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Find your people, turn ideas into projects, and build a portfolio that proves what you can do.
            </p>

            {/* Clear Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link href="/explore">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3.5 rounded-2xl shadow-md border-0"
                  leftIcon={<Compass className="w-4 h-4" />}
                >
                  Explore Projects
                </Button>
              </Link>

              <Link href="/teammates">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 hover:bg-slate-100 text-slate-800 font-bold px-8 py-3.5 rounded-2xl bg-white shadow-xs"
                  leftIcon={<Users className="w-4 h-4 text-slate-700" />}
                >
                  Find Teammates
                </Button>
              </Link>
            </div>
          </div>

          {/* Signature 3D Ribbon Sculpture (Vibrant, Tactile & Smooth) */}
          <div className="relative my-2 sm:my-4 flex items-center justify-center">
            <HeroSculpture />
          </div>

          {/* THE WEBSITE AS AN ANSWER: INTERACTIVE BUILDER CONSOLE */}
          <div className="mt-8">
            <IntentConsole sampleProjects={featuredProjects} />
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. AUTH-ADAPTIVE BANNER (FOR SIGNED-IN STUDENTS / EDUCATORS)
         ========================================================================= */}
      {user && (
        <section className="border-b border-slate-200/80 bg-white py-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Welcome back, {profile?.display_name || user.email?.split('@')[0]}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
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
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-slate-900 hover:bg-black text-white font-bold"
                        leftIcon={<GraduationCap className="w-4 h-4" />}
                      >
                        Mentor Dashboard
                      </Button>
                    </Link>
                    <Link href="/hackathons">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-800 font-bold hover:bg-white"
                        leftIcon={<Trophy className="w-4 h-4 text-slate-700" />}
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
                        leftIcon={<Briefcase className="w-4 h-4" />}
                      >
                        My Projects
                      </Button>
                    </Link>
                    <Link href="/projects/new">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-300 text-slate-800 font-bold hover:bg-white"
                        leftIcon={<PlusCircle className="w-4 h-4 text-slate-700" />}
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
          3. HOW IT WORKS — THE 3-STEP BUILDER CYCLE
         ========================================================================= */}
      <section className="py-20 md:py-24 relative bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>THE BUILDER CYCLE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              From concept to verified proof in 3 steps
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              Designed specifically for college students, semester teams, and university hackathons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-400">
                    01
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Assemble by Skills
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Discover peers across campus whose tech stacks complement yours. Filter by languages,
                  commit hours, and preferred roles to recruit a balanced squad.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    React.js
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    FastAPI
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    UI/UX Design
                  </span>
                </div>
              </div>

              <Link
                href="/teammates"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group"
              >
                <span>Find Teammates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-400">
                    02
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shadow-xs">
                    <Kanban className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Sprint in Workspaces
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Collaborate in dedicated team workspaces with sprint kanbans, real-time discussions,
                  and private collegiate hackathon problem statement tracks.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    Sprint Kanban
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    Team Chat
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    Milestones
                  </span>
                </div>
              </div>

              <Link
                href="/hackathons"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group"
              >
                <span>Browse Competitions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-400">
                    03
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Verify Career Proof
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Link GitHub pull requests and commit hashes directly to completed tasks. Earn faculty reviews
                  and export tamper-resistant proof of work to your portfolio.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    GitHub PR #24
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    48 Unit Tests
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-bold text-xs">
                    Faculty Review
                  </span>
                </div>
              </div>

              <Link
                href="/explore"
                className="inline-flex items-center text-xs font-bold text-slate-900 hover:text-black transition-colors pt-2 group"
              >
                <span>Explore Live Projects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. CAMPUS PULSE — REAL LIVE SHOWCASE (PROJECTS & HACKATHONS)
         ========================================================================= */}
      <section className="py-20 md:py-24 bg-[#fafbfc] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header with Segmented Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-600 font-bold mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Campus Pulse</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Live Collegiate Activity
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-xl font-medium">
                Explore active projects recruiting collaborators, or enter upcoming university competitions.
              </p>
            </div>

            {/* Segmented Switcher */}
            <div className="p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowcaseTab('projects')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  showcaseTab === 'projects'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Campus Hackathons</span>
              </button>
            </div>
          </div>

          {/* TAB 1: FEATURED PROJECTS */}
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
                    className="bg-slate-900 hover:bg-black text-white font-bold px-7 py-3 rounded-2xl shadow-sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Browse All Projects in Directory
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: CAMPUS HACKATHONS WITH PASSCODE FORM */}
          {showcaseTab === 'hackathons' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Passcode Quick Entry Card */}
              <div className="p-7 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold">
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    <span>Private Collegiate Access</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Have a College Join Code or Passcode?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Enter your university passcode to unlock problem statements, register your team, and access rubric judging.
                  </p>
                </div>

                <form onSubmit={handleQuickJoin} className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <div className="relative flex-1 md:w-64">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={quickPasscode}
                      onChange={(e) => setQuickPasscode(e.target.value)}
                      placeholder="Passcode (e.g. col-apex26)"
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors shadow-xs"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-slate-900 hover:bg-black text-white shrink-0 font-bold py-3 px-6 shadow-sm rounded-2xl"
                  >
                    Enter Event
                  </Button>
                </form>
              </div>

              {/* Hackathons Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeHackathons.map((hackathon) => (
                  <div
                    key={hackathon.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-xl flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-600" />
                          <span>{hackathon.access_type === 'private' ? 'Private College' : 'Open Track'}</span>
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {hackathon.mode}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1">
                        {hackathon.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {hackathon.description || 'Collegiate hackathon competition track.'}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500">Prize Pool:</span>
                        <span className="text-slate-900 font-black font-mono text-sm px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
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
                          className="w-full justify-center text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs rounded-xl"
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
                    className="bg-slate-900 hover:bg-black text-white font-bold px-7 py-3 rounded-2xl shadow-sm"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Browse All Hackathons
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          5. CLOSING STUDIO LAUNCHPAD: CONFIDENT & ARCHITECTURAL
         ========================================================================= */}
      <section className="py-20 md:py-24 relative text-center bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-16 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TeamForge Innovation Network</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Stop coding in isolation. <br />
              <span className="text-slate-300">Find your squad today.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-normal">
              Create your student profile in seconds, explore active college projects, or launch your own semester idea today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/explore">
                <Button
                  variant="secondary"
                  size="lg"
                  className="font-bold px-8 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-sm border-none"
                  leftIcon={<Compass className="w-4 h-4 text-slate-900" />}
                >
                  Explore Active Projects
                </Button>
              </Link>

              {user ? (
                <Link href="/projects/new">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-bold px-8 py-3.5 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                    leftIcon={<PlusCircle className="w-4 h-4 text-white" />}
                  >
                    Start a Project
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="font-bold px-8 py-3.5 rounded-2xl border border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                  onClick={() => openAuthModal('signup')}
                  leftIcon={<Users className="w-4 h-4 text-white" />}
                >
                  Join TeamForge Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
