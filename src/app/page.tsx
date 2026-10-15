'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { OrigamiBirdSculpture } from '@/components/canvas/OrigamiBirdSculpture';
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
  Zap,
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
          HERO: BALANCED SPLIT STAGE (HEADLINE + 3D LINKORA ORIGAMI BIRD)
         ========================================================================= */}
      <section className="relative pt-8 pb-14 md:pt-14 md:pb-20 overflow-hidden border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            {/* Left Column: Brand, Editorial Headline & Primary Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-mono font-bold tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Linkora • Student Collaboration Network</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.06]">
                Build something bigger, together.
              </h1>

              <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-xl">
                Find your people, turn ideas into projects, and build a portfolio that proves what you can do.
              </p>

              {/* Direct Primary & Secondary Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/explore">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-slate-900 hover:bg-black text-white font-bold px-7 py-3.5 rounded-2xl shadow-sm border-0"
                    leftIcon={<Compass className="w-4 h-4" />}
                  >
                    Explore Projects
                  </Button>
                </Link>

                <Link href="/teammates">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold px-7 py-3.5 rounded-2xl bg-white shadow-2xs"
                    leftIcon={<Users className="w-4 h-4 text-slate-700" />}
                  >
                    Find Teammates
                  </Button>
                </Link>
              </div>

              {/* High-signal Trust Chips */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified GitHub Proof</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>College Hackathons</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Faculty Mentorship</span>
                </div>
              </div>
            </div>

            {/* Right Column: Signature 3D Linkora Origami Bird */}
            <div className="lg:col-span-5 flex items-center justify-center relative">
              <OrigamiBirdSculpture />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          AUTH BANNER (FOR SIGNED-IN STUDENTS / EDUCATORS)
         ========================================================================= */}
      {user && (
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

          <IntentConsole sampleProjects={featuredProjects} />
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WORKFLOW (FROM CONCEPT TO PROOF)
         ========================================================================= */}
      <section className="py-16 md:py-24 relative bg-[#fafbfc] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>02 • ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              From raw concept to verified career proof in three collegiate stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stage 1: Connect */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-300">
                    01
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-2xs">
                    <Users className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  Connect
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Discover peers across campus whose tech stacks complement yours. Filter by languages, commit hours, and preferred roles to recruit a balanced squad.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    React.js
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    FastAPI
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    UI/UX
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

            {/* Stage 2: Build */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-300">
                    02
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shadow-2xs">
                    <Kanban className="w-5 h-5 text-blue-700" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  Build
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Collaborate in dedicated team workspaces with sprint kanbans, real-time discussions, and private collegiate hackathon problem statement tracks.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    Sprint Kanban
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    Team Chat
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
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

            {/* Stage 3: Verify */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black font-mono text-slate-300">
                    03
                  </span>
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-center shadow-2xs">
                    <ShieldCheck className="w-5 h-5 text-rose-700" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                  Verify
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Link GitHub pull requests and commit hashes directly to completed tasks. Earn faculty reviews and export tamper-resistant proof of work.
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    GitHub PRs
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
                    Unit Tests
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs">
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
          SECTION 3: SHOWCASE (LIVE ACTIVE PROJECTS & HACKATHONS)
         ========================================================================= */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header with Segmented Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>03 • CAMPUS ACTIVITY</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Showcase
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-xl font-normal">
                Explore active projects recruiting collaborators, or enter upcoming university competitions.
              </p>
            </div>

            {/* Segmented Switcher */}
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowcaseTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  showcaseTab === 'projects'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Projects</span>
              </button>

              <button
                type="button"
                onClick={() => setShowcaseTab('hackathons')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  showcaseTab === 'hackathons'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Hackathons</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PROJECTS */}
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
                    Browse All Projects
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
                  <div
                    key={hackathon.id}
                    className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-400 transition-all duration-200 shadow-2xs hover:shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 font-bold flex items-center gap-1">
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

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {hackathon.description || 'Collegiate hackathon competition track.'}
                      </p>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-500">Prize Pool:</span>
                        <span className="text-slate-900 font-black font-mono text-sm px-2 py-0.5 rounded-lg bg-white border border-slate-200">
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
                          className="w-full justify-center text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-2xs rounded-xl"
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
          SECTION 4: COMPETE (CAMPUS PASSCODE & PRIVATE CHALLENGES)
         ========================================================================= */}
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

      {/* =========================================================================
          SECTION 5: BEGIN (CLOSING CALL TO ACTION)
         ========================================================================= */}
      <section className="py-20 md:py-28 relative text-center bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-16 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>05 • JOIN LINKORA</span>
            </div>

            <h2 className="text-3xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Begin
            </h2>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed font-normal">
              Stop coding in isolation. Find your squad, build production software, and prove your engineering caliber today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/explore">
                <Button
                  variant="secondary"
                  size="lg"
                  className="font-bold px-8 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-sm border-none"
                  leftIcon={<Compass className="w-4 h-4 text-slate-900" />}
                >
                  Explore Projects
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
                  Join Linkora Free
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
