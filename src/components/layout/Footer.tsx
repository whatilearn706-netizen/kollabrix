'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, Sparkles, Terminal, Code2, Users, Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-charcoal-800/80 bg-midnight-950 text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-charcoal-800/60">
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <Link href="/" className="inline-block focus-visible:outline-none">
              <BrandLogo size="sm" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The collegiate innovation workspace connecting student makers, campus project teams, faculty mentors, and competitive hackathons.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Verified Collegiate Collaboration</span>
            </div>
          </div>

          {/* Platform Destinations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link href="/teammates" className="hover:text-white transition-colors">
                  Find Teammates
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:text-white transition-colors">
                  College Hackathons
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-white transition-colors">
                  AI Project Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Faculty Pathways */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Workspaces
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/projects/new" className="hover:text-white transition-colors">
                  Launch a Project
                </Link>
              </li>
              <li>
                <Link href="/my-projects" className="hover:text-white transition-colors">
                  Project Workboard
                </Link>
              </li>
              <li>
                <Link href="/teacher/dashboard" className="hover:text-white transition-colors">
                  Faculty Mentor Portal
                </Link>
              </li>
              <li>
                <Link href="/problems" className="hover:text-white transition-colors">
                  Academic Challenges
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
              Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered with Next.js App Router, Supabase PostgreSQL, and cryptographic access control.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-800 text-slate-400">
                PostgreSQL RLS
              </span>
              <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-800 text-slate-400">
                GitHub Webhooks
              </span>
              <span className="px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-800 text-slate-400">
                Scrypt Salting
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} TeamForge. Empowering collegiate makers to build together.</p>
          <div className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-slate-400 transition-colors">
              Project Directory
            </Link>
            <span>&middot;</span>
            <Link href="/teammates" className="hover:text-slate-400 transition-colors">
              Campus Matching
            </Link>
            <span>&middot;</span>
            <span className="text-indigo-400 font-mono text-[11px]">Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
