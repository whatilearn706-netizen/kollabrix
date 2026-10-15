'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, Hackathon, Profile } from '@/types/database';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  Compass,
  Users,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  KeyRound,
  GitPullRequest,
  Kanban,
  UserPlus,
  Send,
  ExternalLink,
  Code2,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';

interface HeroCommandCenterProps {
  featuredProjects: Project[];
  activeHackathons: Hackathon[];
}

export function HeroCommandCenter({
  featuredProjects,
  activeHackathons,
}: HeroCommandCenterProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'matching' | 'hackathons' | 'proof'>('projects');

  // Simulated invitation state for interactive teammate card
  const [invitedCandidate, setInvitedCandidate] = useState(false);

  // Quick Passcode state
  const [quickPasscode, setQuickPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    if (!quickPasscode.trim()) {
      setPasscodeError('Please enter a join code.');
      return;
    }
    const clean = quickPasscode
      .replace(/.*\/h\//, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();
    if (!clean) {
      setPasscodeError('Invalid join code format.');
      return;
    }
    router.push(`/h/${clean}`);
  };

  const sampleProject = featuredProjects[0] || {
    id: 'sample-p1',
    title: 'EcoRoute AI — Smart Campus Transit Planner',
    summary: 'Building a spatial routing engine that calculates real-time bus arrivals across campus.',
    category: 'AI/ML',
    difficulty: 'Intermediate',
    status: 'Recruiting',
    current_team_size: 2,
    desired_team_size: 4,
    required_skills: ['React', 'TypeScript', 'Python', 'Leaflet'],
    desired_roles: ['Frontend Lead', 'FastAPI Engineer'],
    owner: {
      display_name: 'Aarav Sharma',
      username: 'aarav_dev',
      avatar_url: null,
      college: 'MIT Tech Hub',
    },
  };

  const sampleHackathon = activeHackathons[0] || {
    id: 'sample-h1',
    title: 'Apex 2026 Inter-College Hackathon',
    organizer: 'National Technical University',
    mode: 'Hybrid',
    prize_pool: '₹1,50,000',
    start_date: '2026-11-15T09:00:00Z',
    registration_deadline: '2026-11-10T23:59:59Z',
    access_type: 'private',
    join_code: 'col-apex26',
    themes: ['AI/ML', 'CleanTech', 'FinTech'],
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* =========================================================================
          CONTROL DOCK TABS — 4 CLEAR, INSTANT PLATFORM PILLARS
         ========================================================================= */}
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-2xl bg-midnight-900/90 border border-midnight-750/80 backdrop-blur-xl shadow-card flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-indigo-600 to-brand-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Active Projects</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/15">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matching')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'matching'
                ? 'bg-gradient-to-r from-indigo-600 to-brand-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teammate Matchmaker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hackathons')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'hackathons'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Campus Hackathons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proof')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'proof'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow-sm'
                : 'text-slate-400 hover:text-white hover:bg-midnight-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Career Proof</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC CONSOLE WINDOW — VISUALLY DEMONSTRATES PURPOSE WITH ZERO FLUFF
         ========================================================================= */}
      <div className="rounded-3xl bg-midnight-900/95 border border-midnight-750/90 shadow-2xl p-5 sm:p-7 relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle Ambient Glow Behind Card */}
        <div
          className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            activeTab === 'hackathons'
              ? 'bg-amber-500/10'
              : activeTab === 'proof'
              ? 'bg-emerald-500/10'
              : 'bg-indigo-500/15'
          }`}
        />

        {/* Window Chrome Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-midnight-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
              teamforge.campus/console/
              <strong className="text-white font-medium">{activeTab}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Campus Network
            </span>
          </div>
        </div>

        {/* =======================================================================
            TAB 1: LIVE PROJECTS DISCOVERY
           ======================================================================= */}
        {activeTab === 'projects' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-semibold block">
                  Collegiate Project Match
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Student Initiatives Seeking Collaborators
                </h3>
              </div>
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-midnight-700 hover:text-white"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View All in Directory
                </Button>
              </Link>
            </div>

            {/* Live Highlighted Project Card */}
            <div className="p-5 rounded-2xl bg-midnight-950/80 border border-midnight-750/90 space-y-4 hover:border-brand-500/40 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                    {sampleProject.category}
                  </span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-midnight-800 text-slate-300 border border-midnight-700">
                    {sampleProject.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-xs font-mono text-slate-300">
                    Capacity: <strong className="text-white">{sampleProject.current_team_size} / {sampleProject.desired_team_size}</strong>
                  </span>
                </div>
              </div>

              <div>
                <Link
                  href={`/projects/${sampleProject.id}`}
                  className="text-base sm:text-lg font-bold text-white hover:text-brand-300 transition-colors block"
                >
                  {sampleProject.title}
                </Link>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {sampleProject.summary}
                </p>
              </div>

              {/* Required Skills & Open Roles */}
              <div className="pt-3 border-t border-midnight-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                    Tech Stack Needed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleProject.required_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded bg-midnight-850 text-slate-200 border border-midnight-750"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/projects/${sampleProject.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      className="font-semibold px-4"
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Apply to Join
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 2: SMART TEAMMATE MATCHING
           ======================================================================= */}
        {activeTab === 'matching' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                  Skill-Weighted Match Algorithm
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Transparent Student Compatibility Scoring
                </h3>
              </div>
              <Link href="/teammates">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-midnight-700 hover:text-white"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Find All Teammates
                </Button>
              </Link>
            </div>

            {/* Candidate Card */}
            <div className="p-5 rounded-2xl bg-midnight-950/80 border border-midnight-750/90 space-y-4 hover:border-brand-500/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name="Kavya Patel" size="lg" className="ring-2 ring-midnight-750" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">Kavya Patel</h4>
                      <span className="text-xs text-slate-400 font-mono">@kavya_builds</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      B.Tech Computer Science &middot; 3rd Year
                    </p>
                    <p className="text-[11px] text-slate-500">Government Engineering College</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>94% Complementary</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setInvitedCandidate(!invitedCandidate)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      invitedCandidate
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                    }`}
                  >
                    {invitedCandidate ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Invited!</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Invite to Squad</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Explainability Matrix */}
              <div className="p-3 rounded-xl bg-midnight-900 border border-midnight-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  Why this candidate is recommended:
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-midnight-850 text-slate-200 border border-midnight-750">
                    Matches 3 open project skills: React, TypeScript, Leaflet
                  </span>
                  <span className="px-2 py-0.5 rounded bg-midnight-850 text-slate-200 border border-midnight-750">
                    Preferred Role: Frontend Architect
                  </span>
                  <span className="px-2 py-0.5 rounded bg-midnight-850 text-slate-200 border border-midnight-750">
                    Schedule: 15 hrs/week active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 3: CAMPUS HACKATHONS WITH PASSCODE UNLOCK
           ======================================================================= */}
        {activeTab === 'hackathons' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold block">
                  Collegiate Competition Tracks
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  University Hackathons &amp; Private Challenges
                </h3>
              </div>
              <Link href="/hackathons">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-midnight-700 hover:text-white"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Browse All Events
                </Button>
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-midnight-950/80 border border-amber-500/30 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Private College Event
                    </span>
                    <span className="text-[11px] font-mono text-slate-300">
                      Format: {sampleHackathon.mode}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {sampleHackathon.title}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Organized by <strong className="text-slate-200">{sampleHackathon.organizer}</strong> &middot; Prize Pool: <strong className="text-amber-300 font-mono">{sampleHackathon.prize_pool}</strong>
                  </p>
                </div>

                {/* Instant Passcode Input */}
                <form
                  onSubmit={handleQuickJoin}
                  className="flex items-center gap-2 w-full lg:w-auto shrink-0"
                >
                  <div className="relative flex-1 lg:w-48">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Passcode (e.g. col-apex26)"
                      value={quickPasscode}
                      onChange={(e) => setQuickPasscode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-midnight-900 border border-midnight-700 text-xs font-mono uppercase text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2 px-3.5"
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  >
                    Enter Passcode
                  </Button>
                </form>
              </div>

              {passcodeError && (
                <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                  {passcodeError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 4: VERIFIED CAREER PROOF
           ======================================================================= */}
        {activeTab === 'proof' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
                  Tamper-Resistant Career Evidence
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Turn Completed Tasks Into Verifiable Deliverables
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Anchored to GitHub PRs &amp; Supabase
              </span>
            </div>

            {/* Simulated Verified Evidence Record */}
            <div className="p-5 rounded-2xl bg-midnight-950/80 border border-midnight-750/90 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Lead Task
                  </span>
                  <span className="text-xs text-indigo-300 font-mono">
                    EcoRoute AI &middot; Sprint 3
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Commit #92f1a8c &middot; 48 Unit Tests Passed
                </span>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-white">
                Live Spatial Routing &amp; Dijkstra Graph Optimization Engine
              </h4>

              <div className="p-3 rounded-xl bg-midnight-900 border border-midnight-800 text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Deliverable Evidence:</span>
                  <span className="text-indigo-400 font-mono inline-flex items-center gap-1">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>PR #24: spatial-telemetry-index</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  &ldquo;Refactored PostGIS geospatial queries to reduce route calculation latency from 450ms to 42ms for student shuttles.&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Faculty Review: Verified by Prof. H. Mehta (Computer Engineering Dept)</span>
                <span className="text-emerald-400 font-medium">Recorded on Student Portfolio</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
