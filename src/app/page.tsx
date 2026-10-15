'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ComposedHeroPreview } from '@/components/landing/ComposedHeroPreview';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { DEMO_PROJECTS } from '@/data/mockProjects';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Compass,
  PlusCircle,
  Lightbulb,
  Users2,
  Trophy,
  ArrowRight,
  Code,
  Palette,
  Brain,
  Rocket,
  CheckCircle,
} from 'lucide-react';

export default function HomePage() {
  const { user, openAuthModal } = useAuth();

  const handleStartProject = () => {
    if (!user) {
      openAuthModal('signup');
    }
  };

  // Curated showcase projects from DEMO_PROJECTS
  const featuredProjects = DEMO_PROJECTS.slice(0, 3);

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* =========================================================================
          HERO SECTION
         ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-charcoal-800">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-xs text-brand-300 font-medium">
                <Rocket className="w-3.5 h-3.5 text-brand-400" />
                <span>College-Wide Student Project Collaboration</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Great ideas deserve <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400">great teams.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Discover projects, meet people who complement your skills, and turn your ideas into something real.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link href="/explore" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                    leftIcon={<Compass className="w-4 h-4" />}
                  >
                    Explore Projects
                  </Button>
                </Link>

                {user ? (
                  <Link href="/projects/new" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto"
                      leftIcon={<PlusCircle className="w-4 h-4 text-brand-400" />}
                    >
                      Start a Project
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={handleStartProject}
                    leftIcon={<PlusCircle className="w-4 h-4 text-brand-400" />}
                  >
                    Start a Project
                  </Button>
                )}
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                  Verified Student Profiles
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                  Cross-Discipline Matching
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                  Free & Open
                </span>
              </div>
            </div>

            {/* Right Hero Preview */}
            <div className="lg:col-span-6">
              <ComposedHeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS SECTION
         ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 border-b border-charcoal-800 bg-charcoal-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400 font-mono">
              Streamlined Workflow
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              How TeamForge Works
            </h3>
            <p className="text-sm text-slate-400">
              Three clear steps to take your academic or extracurricular concept from thought to execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-4 relative group hover:border-charcoal-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/25 flex items-center justify-center font-bold text-base">
                1
              </div>
              <h4 className="text-lg font-semibold text-white">
                Discover a project or publish an idea
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Browse student project proposals across AI/ML, web development, mobile apps, and IoT. Or publish your own vision with technical requirements and clear problem statements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-4 relative group hover:border-charcoal-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-bold text-base">
                2
              </div>
              <h4 className="text-lg font-semibold text-white">
                Find collaborators with the skills you need
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with peers whose skills complement yours. Pair front-end designers with back-end engineers, or machine learning specialists with mobile developers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 md:p-8 space-y-4 relative group hover:border-charcoal-600 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/25 flex items-center justify-center font-bold text-base">
                3
              </div>
              <h4 className="text-lg font-semibold text-white">
                Build something worth showcasing
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn your semester projects and hackathon concepts into production-grade portfolio items that stand out to tech recruiters and graduate admissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED PROJECTS (CURATED DEMO PROJECTS)
         ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 font-mono mb-2">
                <span>Featured Discoveries</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Explore Active Collaborations
              </h3>
              <p className="mt-1 text-sm text-slate-400 max-w-xl">
                A preview of collegiate initiatives looking for teammates right now. Browse the full directory to filter by stack, category, or role.
              </p>
            </div>

            <Link href="/explore">
              <Button
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Browse All Projects
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          COMMUNITY VALUE SECTION
         ========================================================================= */}
      <section className="py-20 md:py-28 border-b border-charcoal-800 bg-charcoal-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400 font-mono">
              Designed For Every Role
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Value For Every Student Maker
            </h3>
            <p className="text-sm text-slate-400">
              Whether you write code, design user flows, train models, or organize roadmaps, TeamForge bridges the gap between solitary concepts and collaborative execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1: Idea Creators */}
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3 hover:border-charcoal-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Idea Creators</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Have a breakthrough concept but missing specific engineering chops? Post your problem statement, set team requirements, and recruit the builders to bring it to life.
              </p>
            </div>

            {/* Value 2: Developers */}
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3 hover:border-charcoal-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Software Developers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tired of building generic clones? Join projects with authentic utility, integrate modern full-stack architectures, and demonstrate teamwork to engineering recruiters.
              </p>
            </div>

            {/* Value 3: Designers */}
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3 hover:border-charcoal-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">UI/UX Designers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take Figma prototypes beyond static wireframes. Collaborate with talented engineers to implement design systems and ship real applications users can touch.
              </p>
            </div>

            {/* Value 4: AI/ML Engineers */}
            <div className="rounded-xl bg-charcoal-900 border border-charcoal-750/80 p-6 space-y-3 hover:border-charcoal-600 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white">Aspiring AI/ML Engineers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Move Jupyter notebooks into deployed production apps. Team up with web engineers to build inference pipelines, vector search engines, and real-time vision systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CALL TO ACTION
         ========================================================================= */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-xs text-brand-300 font-mono">
            <span>Ready for your next project?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Stop coding alone. Start building with a team.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Create your student profile today, list your skills, and find peers ready to collaborate on meaningful college projects.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/explore">
              <Button variant="primary" size="lg" leftIcon={<Compass className="w-4 h-4" />}>
                Explore Active Projects
              </Button>
            </Link>

            {user ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="lg">
                  Complete Your Profile
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => openAuthModal('signup')}
              >
                Create Student Account
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
