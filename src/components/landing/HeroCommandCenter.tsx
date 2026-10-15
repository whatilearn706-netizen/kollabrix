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
  Star,
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
          CONTROL DOCK TABS — 4 VIBRANT PLATFORM PILLARS
         ========================================================================= */}
      <div className="flex items-center justify-center">
        <div className="p-1.5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-lg flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-violet-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Active Projects</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-white/20">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('matching')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'matching'
                ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teammate Matchmaker</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hackathons')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'hackathons'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Campus Hackathons</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proof')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'proof'
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Career Proof</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC CONSOLE WINDOW — COLORFUL, VIBRANT, EYE-CATCHING
         ========================================================================= */}
      <div className="rounded-3xl bg-white/95 border-2 border-slate-200/90 shadow-2xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl text-slate-900">
        {/* Subtle Ambient Glow Behind Card */}
        <div
          className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
            activeTab === 'hackathons'
              ? 'bg-amber-300/30'
              : activeTab === 'matching'
              ? 'bg-pink-300/30'
              : activeTab === 'proof'
              ? 'bg-emerald-300/30'
              : 'bg-violet-300/30'
          }`}
        />

        {/* Window Chrome Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="ml-2 font-mono text-[11px] text-slate-500 hidden sm:inline">
              teamforge.campus/console/
              <strong className="text-violet-700 font-bold">{activeTab}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-[11px] font-mono font-bold text-emerald-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-violet-700 font-bold block">
                  Collegiate Project Match
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Student Initiatives Seeking Collaborators
                </h3>
              </div>
              <Link href="/explore">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 hover:border-violet-400 font-bold text-slate-700 hover:text-violet-700"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  View All in Directory
                </Button>
              </Link>
            </div>

            {/* Live Highlighted Project Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50 border-2 border-violet-100 space-y-4 hover:border-violet-300 transition-all shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-violet-100 text-violet-800 border border-violet-200">
                    {sampleProject.category}
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {sampleProject.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    Capacity: <strong className="text-violet-700">{sampleProject.current_team_size} / {sampleProject.desired_team_size} Joined</strong>
                  </span>
                </div>
              </div>

              <div>
                <Link
                  href={`/projects/${sampleProject.id}`}
                  className="text-base sm:text-xl font-black text-slate-900 hover:text-violet-600 transition-colors block"
                >
                  {sampleProject.title}
                </Link>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {sampleProject.summary}
                </p>
              </div>

              {/* Required Skills & Open Roles */}
              <div className="pt-3 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block">
                    Tech Stack Needed:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleProject.required_skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 shadow-sm"
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
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-5 py-2 shadow-md shadow-violet-500/20"
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-600 font-bold block">
                  Skill-Weighted Match Algorithm
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Transparent Student Compatibility Scoring
                </h3>
              </div>
              <Link href="/teammates">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 hover:border-pink-400 font-bold text-slate-700 hover:text-pink-600"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Find All Teammates
                </Button>
              </Link>
            </div>

            {/* Candidate Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-50/70 via-white to-pink-50/50 border-2 border-pink-100 space-y-4 hover:border-pink-300 transition-all shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name="Kavya Patel" size="lg" className="ring-2 ring-pink-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-base sm:text-lg">Kavya Patel</h4>
                      <span className="text-xs text-pink-600 font-mono font-bold">@kavya_builds</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      B.Tech Computer Science &middot; 3rd Year
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">Government Engineering College</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs flex items-center gap-1.5 font-mono shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>94% Complementary</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setInvitedCandidate(!invitedCandidate)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                      invitedCandidate
                        ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                        : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-pink-500/25'
                    }`}
                  >
                    {invitedCandidate ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Invited to Squad!</span>
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
              <div className="p-3.5 rounded-xl bg-white border border-pink-100 space-y-2 text-xs shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-fuchsia-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-fuchsia-500" />
                  Why this candidate is recommended:
                </span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded-md bg-pink-50 text-pink-800 font-semibold border border-pink-200">
                    Matches 3 open project skills: React, TypeScript, Leaflet
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-violet-50 text-violet-800 font-semibold border border-violet-200">
                    Preferred Role: Frontend Architect
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 font-semibold border border-amber-200">
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
                  Collegiate Competition Tracks
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  University Hackathons &amp; Private Challenges
                </h3>
              </div>
              <Link href="/hackathons">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 hover:border-amber-400 font-bold text-slate-700 hover:text-amber-700"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Browse All Events
                </Button>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-rose-50/50 border-2 border-amber-200 space-y-4 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Private College Event
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-600">
                      Format: {sampleHackathon.mode}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900">
                    {sampleHackathon.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Organized by <strong className="text-slate-900">{sampleHackathon.organizer}</strong> &middot; Prize Pool:{' '}
                    <strong className="text-amber-900 font-mono font-black text-sm px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                      {sampleHackathon.prize_pool}
                    </strong>
                  </p>
                </div>

                {/* Instant Passcode Input */}
                <form
                  onSubmit={handleQuickJoin}
                  className="flex items-center gap-2 w-full lg:w-auto shrink-0"
                >
                  <div className="relative flex-1 lg:w-48">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Passcode (e.g. col-apex26)"
                      value={quickPasscode}
                      onChange={(e) => setQuickPasscode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-xs font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold py-2.5 px-4 shadow-md shadow-orange-500/25"
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  >
                    Enter Passcode
                  </Button>
                </form>
              </div>

              {passcodeError && (
                <div className="p-2.5 rounded-lg bg-red-100 border border-red-300 text-xs font-semibold text-red-800">
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
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold block">
                  Tamper-Resistant Career Evidence
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Turn Completed Tasks Into Verifiable Deliverables
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Anchored to GitHub PRs &amp; Supabase
              </span>
            </div>

            {/* Simulated Verified Evidence Record */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-100 space-y-3 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Lead Task
                  </span>
                  <span className="text-xs text-indigo-700 font-mono font-bold">
                    EcoRoute AI &middot; Sprint 3
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Commit #92f1a8c &middot; 48 Unit Tests Passed
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Live Spatial Routing &amp; Dijkstra Graph Optimization Engine
              </h4>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-100 text-xs space-y-1.5 text-slate-700 shadow-sm">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-bold">Deliverable Evidence:</span>
                  <span className="text-indigo-600 font-mono font-bold inline-flex items-center gap-1">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>PR #24: spatial-telemetry-index</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 italic">
                  &ldquo;Refactored PostGIS geospatial queries to reduce route calculation latency from 450ms to 42ms for student shuttles.&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                <span>Faculty Review: Verified by Prof. H. Mehta (Computer Engineering Dept)</span>
                <span className="text-emerald-700 font-bold">Recorded on Student Portfolio</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
