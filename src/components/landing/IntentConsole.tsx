'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, Profile } from '@/types/database';
import {
  Users,
  Briefcase,
  Trophy,
  ArrowRight,
  Sparkles,
  Lock,
  KeyRound,
  CheckCircle2,
  Code2,
  Palette,
  Brain,
  Rocket,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface IntentConsoleProps {
  sampleProjects?: Project[];
  sampleProfiles?: Profile[];
}

export function IntentConsole({ sampleProjects = [], sampleProfiles = [] }: IntentConsoleProps) {
  const router = useRouter();
  const [activeIntent, setActiveIntent] = useState<'recruit' | 'join' | 'hackathon'>('recruit');
  const [selectedRole, setSelectedRole] = useState<'all' | 'ai' | 'frontend' | 'design'>('all');
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    const clean = passcode.trim().replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    if (!clean) {
      setPasscodeError('Please enter a valid hackathon passcode.');
      return;
    }
    router.push(`/h/${clean}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden text-slate-900 transition-all">
      {/* Console Mode Switcher Header */}
      <div className="border-b border-slate-100 bg-slate-50/70 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveIntent('recruit')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeIntent === 'recruit'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeIntent === 'recruit' ? 'text-violet-600' : 'text-slate-400'}`} />
            <span>I Have an Idea & Need Teammates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveIntent('join')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeIntent === 'join'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Briefcase className={`w-3.5 h-3.5 ${activeIntent === 'join' ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>I Have Skills & Want to Join</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveIntent('hackathon')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeIntent === 'hackathon'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Lock className={`w-3.5 h-3.5 ${activeIntent === 'hackathon' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>College Hackathon Passcode</span>
          </button>
        </div>

        <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Linkora Console</span>
        </span>
      </div>

      {/* Main Console Content Body */}
      <div className="p-6 sm:p-8">
        {/* ========================================================================= */}
        {/* MODE 1: RECRUIT TEAMMATES */}
        {/* ========================================================================= */}
        {activeIntent === 'recruit' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Assemble your campus dream team in minutes.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Publish your project concept, set needed skill criteria, and invite students with verified GitHub and course profiles.
                </p>
              </div>

              <Link href="/projects/new" className="shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-slate-900 hover:bg-black text-white font-bold shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Post Project Specs
                </Button>
              </Link>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 mr-2">Filter Available Roles:</span>
              {[
                { id: 'all', label: 'All Builders' },
                { id: 'ai', label: 'AI & ML Engineers' },
                { id: 'frontend', label: 'Full-Stack & Frontend' },
                { id: 'design', label: 'UI/UX Designers' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === role.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Live Teammate Candidate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                {
                  name: 'Aarav Sharma',
                  role: 'AI / PyTorch Engineer',
                  type: 'ai',
                  college: 'IIIT Hyderabad • B.Tech CSE',
                  skills: ['PyTorch', 'FastAPI', 'LangChain', 'PostgreSQL'],
                  matchScore: 96,
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Priya Patel',
                  role: 'Product & UI/UX Designer',
                  type: 'design',
                  college: 'BITS Pilani • Design Studio',
                  skills: ['Figma', 'User Research', 'Design Systems', 'Tailwind'],
                  matchScore: 94,
                  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Rohan Verma',
                  role: 'Full-Stack Developer',
                  type: 'frontend',
                  college: 'IIT Delhi • Electrical & CS',
                  skills: ['Next.js', 'TypeScript', 'Node.js', 'Docker'],
                  matchScore: 92,
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                },
              ]
                .filter((cand) => selectedRole === 'all' || cand.type === selectedRole)
                .map((cand, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{cand.matchScore}% Match</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">AVAILABLE</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{cand.name}</h4>
                          <p className="text-xs font-semibold text-slate-600">{cand.role}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium">{cand.college}</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {cand.skills.map((sk, sidx) => (
                          <span
                            key={sidx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-200/60">
                      <Link href="/teammates">
                        <button
                          type="button"
                          className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Invite to Your Project</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: JOIN ACTIVE STUDENT TEAMS */}
        {/* ========================================================================= */}
        {activeIntent === 'join' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Join ambitious projects that need your exact skills.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Don&apos;t build side projects alone. Jump into real student teams with active roadmaps, Kanban boards, and faculty problem statements.
                </p>
              </div>

              <Link href="/explore" className="shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-slate-900 hover:bg-black text-white font-bold shadow-sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore 40+ Projects
                </Button>
              </Link>
            </div>

            {/* Live Recruiting Project Slots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                {
                  title: 'CampusPulse: Real-Time Transit & Shuttle Tracker',
                  category: 'Web / Mobile',
                  owner: 'Devon Vance • MIT College',
                  neededRole: 'Lead React Native Dev',
                  teamStatus: '2 of 4 Filled',
                  tech: ['Next.js', 'React Native', 'WebSockets'],
                },
                {
                  title: 'AuraHealth: Clinical Note Automation for ERs',
                  category: 'AI / Healthcare',
                  owner: 'Dr. Sarah Chen & Team',
                  neededRole: 'PyTorch / NLP Specialist',
                  teamStatus: '3 of 5 Filled',
                  tech: ['Python', 'FastAPI', 'HuggingFace', 'Docker'],
                },
                {
                  title: 'AgriVision: Autonomous Drone Crop Analytics',
                  category: 'IoT / Robotics',
                  owner: 'Vikram Joshi • IIT Bombay',
                  neededRole: 'Computer Vision Engineer',
                  teamStatus: '1 of 3 Filled',
                  tech: ['YOLOv8', 'OpenCV', 'ROS2', 'C++'],
                },
              ].map((proj, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {proj.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono">
                        {proj.teamStatus}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">{proj.owner}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">
                        OPEN ROLE NEEDED
                      </span>
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {proj.neededRole}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {proj.tech.map((t, tidx) => (
                        <span
                          key={tidx}
                          className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-200/60 text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200/60">
                    <Link href="/explore">
                      <button
                        type="button"
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Apply to Open Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: COLLEGE HACKATHON PASSCODE */}
        {/* ========================================================================= */}
        {activeIntent === 'hackathon' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Enter your private university hackathon challenge.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Got an access code from your faculty department or student chapter? Enter it to unlock guidelines, team registration, and mentor office hours.
                </p>
              </div>

              <Link href="/hackathons" className="shrink-0">
                <Button
                  variant="outline"
                  size="md"
                  className="border-slate-300 hover:bg-slate-100 text-slate-800 font-bold"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Browse Public Hackathons
                </Button>
              </Link>
            </div>

            <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Department or Event Join Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. col-apex26 or /h/..."
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 shadow-xs"
                    />
                  </div>
                </div>

                {passcodeError && (
                  <p className="text-xs font-bold text-red-600">{passcodeError}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3"
                  leftIcon={<Lock className="w-4 h-4" />}
                >
                  Unlock Hackathon Portal
                </Button>
              </form>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
                <span>Active University Code:</span>
                <button
                  type="button"
                  onClick={() => setPasscode('col-apex26')}
                  className="font-mono font-bold text-slate-800 hover:text-black underline underline-offset-2"
                >
                  Try &quot;col-apex26&quot;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
