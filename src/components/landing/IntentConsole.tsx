'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, Profile } from '@/types/database';
import {
  HomepageIntentConfig,
  DEFAULT_HOMEPAGE_INTENT_CONFIG,
  IntentCandidate,
  IntentProjectSlot,
} from '@/types/homepageConfig';
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
  config?: HomepageIntentConfig;
}

export function IntentConsole({
  sampleProjects = [],
  sampleProfiles = [],
  config,
}: IntentConsoleProps) {
  const router = useRouter();
  const [activeIntent, setActiveIntent] = useState<'recruit' | 'join' | 'hackathon'>('recruit');
  const [selectedRole, setSelectedRole] = useState<'all' | 'ai' | 'frontend' | 'design'>('all');
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [intentConfig, setIntentConfig] = useState<HomepageIntentConfig>(
    config || DEFAULT_HOMEPAGE_INTENT_CONFIG
  );

  useEffect(() => {
    if (config) {
      setIntentConfig(config);
      return;
    }

    // Try reading from localStorage or live API
    try {
      const local = localStorage.getItem('linkora_intent_config_v1');
      if (local) {
        setIntentConfig(JSON.parse(local));
      }
    } catch {
      // fallback
    }

    // Async fetch to sync with platform_settings
    fetch('/api/homepage-config', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.intentConfig) {
          setIntentConfig(data.intentConfig);
          try {
            localStorage.setItem('linkora_intent_config_v1', JSON.stringify(data.intentConfig));
          } catch {}
        }
      })
      .catch(() => {});
  }, [config]);

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

  const candidates = Array.isArray(intentConfig?.candidates)
    ? intentConfig.candidates
    : DEFAULT_HOMEPAGE_INTENT_CONFIG.candidates;
  const projectSlots = Array.isArray(intentConfig?.projectSlots)
    ? intentConfig.projectSlots
    : DEFAULT_HOMEPAGE_INTENT_CONFIG.projectSlots;

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
        {/* MODE 1: RECRUIT TEAMMATES (I HAVE AN IDEA & NEED TEAMMATES) */}
        {/* ========================================================================= */}
        {activeIntent === 'recruit' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {intentConfig.mode1Headline || 'Assemble your campus dream team in minutes.'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  {intentConfig.mode1Subheadline ||
                    'Publish your project concept, set needed skill criteria, and invite students with verified GitHub and course profiles.'}
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

            {/* Live Teammate Candidate Cards (Admin Controlled) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {candidates.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-sm font-bold text-slate-700">No candidates currently listed.</p>
                  <p className="text-xs text-slate-500 mt-1">Check back soon or explore all student builders in the directory.</p>
                </div>
              ) : (
                candidates
                  .filter((cand) => selectedRole === 'all' || cand.type === selectedRole)
                  .map((cand) => (
                  <div
                    key={cand.id || cand.name}
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
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate">{cand.name}</h4>
                          <p className="text-xs font-semibold text-slate-600 truncate">{cand.role}</p>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium truncate">{cand.college}</p>

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
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: JOIN ACTIVE STUDENT TEAMS (I HAVE SKILLS & WANT TO JOIN) */}
        {/* ========================================================================= */}
        {activeIntent === 'join' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {intentConfig.mode2Headline || 'Join ambitious projects that need your exact skills.'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  {intentConfig.mode2Subheadline ||
                    'Don\'t build side projects alone. Jump into real student teams with active roadmaps, Kanban boards, and faculty problem statements.'}
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

            {/* Live Recruiting Project Slots (Admin Controlled) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {projectSlots.length === 0 ? (
                <div className="col-span-full p-8 text-center rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-sm font-bold text-slate-700">No open project roles currently listed.</p>
                  <p className="text-xs text-slate-500 mt-1">Explore all projects seeking teammates in the project directory.</p>
                </div>
              ) : (
                projectSlots.map((proj) => (
                  <div
                    key={proj.id || proj.title}
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
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: CAMPUS HACKATHON PASSCODE ENTRY */}
        {/* ========================================================================= */}
        {activeIntent === 'hackathon' && (
          <div className="space-y-6 max-w-xl mx-auto py-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Enter Private Hackathon Passcode
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Join your university&apos;s internal collegiate hackathon, view private problem statements, and claim your team slot.
              </p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. col-apex26 or mit-spring26"
                  className="w-full pl-4 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors shadow-2xs text-center"
                  required
                />
              </div>

              {passcodeError && (
                <p className="text-xs text-rose-600 font-medium">{passcodeError}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-sm"
              >
                Access Department Track
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
