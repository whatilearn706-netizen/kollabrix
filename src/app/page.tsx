'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ComposedHeroPreview } from '@/components/landing/ComposedHeroPreview';
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
  Bot,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const { user, profile, openAuthModal } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [activeHackathons, setActiveHackathons] = useState<Hackathon[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
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
    window.location.href = `/h/${clean}`;
  };

  return (
    <div className="flex flex-col w-full overflow-hidden bg-midnight-950">
      {/* =========================================================================
          1. HERO SECTION — FOCUSED, MEMORABLE, UNCLUTTERED
         ========================================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-charcoal-800/70 overflow-hidden bg-hero-radial">
        {/* Subtle Background Grid Accent */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Clear Message & Dominant Actions */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Collegiate Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Collegiate Collaboration &amp; Hackathon Workspace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Big ideas don’t happen{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-brand-300 to-violet-400">
                  alone.
                </span>
              </h1>

              {/* Plain-Language Supporting Message */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Find your team. Build something real. Show the world what you can do.
                Connect with campus peers by skills, launch semester projects, and compete in verified college hackathons.
              </p>

              {/* Exactly Two Dominant Primary Calls to Action */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto font-semibold px-6"
                    leftIcon={<Compass className="w-4 h-4" />}
                  >
                    Explore Projects
                  </Button>
                </Link>

                <Link href="/teammates" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto font-semibold px-6 border-charcoal-700 hover:border-indigo-500/40"
                    leftIcon={<Users className="w-4 h-4 text-indigo-400" />}
                  >
                    Find Teammates
                  </Button>
                </Link>
              </div>

              {/* Minimal Trust Indicator */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono">
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

            {/* Right Column: Interactive Authentic Collaboration Preview */}
            <div className="lg:col-span-6">
              <ComposedHeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. AUTH-ADAPTIVE STATE MODULE (FOR SIGNED-IN STUDENTS / EDUCATORS)
         ========================================================================= */}
      {user && (
        <section className="border-b border-charcoal-800/70 bg-midnight-900/80 py-6">
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
          3. MAIN STUDENT PATHWAYS — 4 SIMPLE CHOICES
         ========================================================================= */}
      <section className="py-16 md:py-20 border-b border-charcoal-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Four paths to build your collegiate journey
            </h2>
            <p className="text-sm text-slate-400">
              No complex setup required. Choose what you want to accomplish today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Path 1: Explore Projects */}
            <Link
              href="/explore"
              className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-indigo-500/50 hover:bg-charcoal-850/80 transition-all shadow-subtle hover:shadow-card group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                  Explore Projects
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Browse student-founded repositories across AI, web, mobile, and dev tools actively looking for collaborators.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                <span>Browse projects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Path 2: Find Teammates */}
            <Link
              href="/teammates"
              className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-indigo-500/50 hover:bg-charcoal-850/80 transition-all shadow-subtle hover:shadow-card group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-violet-300 transition-colors">
                  Find Teammates
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discover student engineers whose technical skills, preferred roles, and availability complement your own.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                <span>Match teammates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Path 3: Join a Hackathon */}
            <Link
              href="/hackathons"
              className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-amber-500/50 hover:bg-charcoal-850/80 transition-all shadow-subtle hover:shadow-card group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                  Join a Hackathon
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter private college hackathons with a passcode, register a team, solve problem statements, and submit code.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                <span>View competitions</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Path 4: Launch a Project */}
            <Link
              href="/projects/new"
              className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/90 hover:border-emerald-500/50 hover:bg-charcoal-850/80 transition-all shadow-subtle hover:shadow-card group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                  Start a Project
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Post an engineering challenge or app vision. Define open team roles and recruit fellow students to build with you.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <span>Create project</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. LIVE ACTIVE PROJECTS (FETCHED FROM SUPABASE WITH CLEAN CARDS)
         ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-charcoal-800/70 bg-charcoal-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Active Student Collaborations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Featured Projects Recruiting Teammates
              </h2>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                Real student engineering teams actively building software. Apply with your skills to join.
              </p>
            </div>

            <Link href="/explore">
              <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse All Projects
              </Button>
            </Link>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CAMPUS HACKATHONS & QUICK PASSCODE ENTRY
         ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-charcoal-800/70 bg-gradient-to-b from-charcoal-950 via-charcoal-900/40 to-charcoal-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-midnight-900/90 border border-charcoal-750/90 shadow-elevated relative overflow-hidden">
            {/* Ambient amber glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Info */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private Campus Hackathons</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Have a College Join Code or Passcode?
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Authorized faculty create private collegiate competitions protected by server-side salted access passwords.
                  Enter your invite code to immediately access problem statements, team formation, and rubric judging.
                </p>

                {/* Quick Passcode Form */}
                <form onSubmit={handleQuickJoin} className="flex items-center gap-2 max-w-md pt-2">
                  <input
                    type="text"
                    value={quickPasscode}
                    onChange={(e) => setQuickPasscode(e.target.value)}
                    placeholder="Enter join code (e.g. col-apex26)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-charcoal-950 border border-charcoal-700 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 font-semibold"
                  >
                    Enter Event
                  </Button>
                </form>
              </div>

              {/* Right Quick Summary Row */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-4 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Private &amp; Salted Passcode</span>
                    <span className="font-mono text-amber-400 text-[11px]">Server Verified</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    No public links. Access passwords are authenticated server-side before problem statements unlock.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-charcoal-950/80 border border-charcoal-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Team Cap Enforcement</span>
                    <span className="font-mono text-indigo-400 text-[11px]">2–4 Members</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Students can join exactly 1 team per hackathon, ensuring clean rubric scoring and podium awards.
                  </p>
                </div>

                <div className="pt-1">
                  <Link href="/hackathons">
                    <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                      Browse Open Competitions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. VERIFIED CONTRIBUTION PROOF (HOW TEAMFORGE BUILDS STUDENT CAREERS)
         ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-charcoal-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tamper-Resistant Engineering Proof</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Turn Completed Tasks Into Verified Proof
            </h2>
            <p className="text-sm text-slate-400">
              Anyone can claim skills on a resume. TeamForge anchors your technical contributions to verifiable database deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">GitHub &amp; PR Links</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Attach pull requests and commit hashes directly to completed tasks. Real technical proof verified by project leads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Faculty Milestone Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                College professors evaluate capstones and research challenges, providing official feedback logged on student records.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-900/90 border border-charcoal-750/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center text-brand-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">AI Sprint Roadmapping</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn raw project ideas into structured milestones, prioritized sprints, and assigned team roles with the AI Planner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FINAL FOCUSED CALL TO ACTION
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
