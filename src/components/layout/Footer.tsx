'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, Sparkles, Terminal, Code2, Users, Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 text-slate-600 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <Link href="/" className="inline-block focus-visible:outline-none">
              <BrandLogo size="sm" wordmarkColor="dark" />
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed">
              The collegiate innovation workspace connecting student makers, campus project teams, faculty mentors, and competitive hackathons.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 pt-1 font-mono font-bold">
              <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified Collegiate Collaboration</span>
            </div>
          </div>

          {/* Platform Destinations */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/explore" className="hover:text-violet-600 transition-colors font-medium">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link href="/teammates" className="hover:text-pink-600 transition-colors font-medium">
                  Find Teammates
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:text-amber-600 transition-colors font-medium">
                  College Hackathons
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-indigo-600 transition-colors font-medium">
                  AI Project Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Faculty Pathways */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Workspaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/projects/new" className="hover:text-violet-600 transition-colors font-medium">
                  Launch a Project
                </Link>
              </li>
              <li>
                <Link href="/my-projects" className="hover:text-indigo-600 transition-colors font-medium">
                  Project Workboard
                </Link>
              </li>
              <li>
                <Link href="/teacher/dashboard" className="hover:text-purple-600 transition-colors font-medium">
                  Faculty Mentor Portal
                </Link>
              </li>
              <li>
                <Link href="/problems" className="hover:text-pink-600 transition-colors font-medium">
                  Academic Challenges
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Architecture
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Engineered with Next.js App Router, Supabase PostgreSQL, and cryptographic access control.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-violet-800 font-semibold shadow-xs">
                PostgreSQL RLS
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-pink-800 font-semibold shadow-xs">
                GitHub Webhooks
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-amber-800 font-semibold shadow-xs">
                Scrypt Salting
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Linkora. Empowering collegiate makers to build together.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/explore" className="hover:text-violet-600 transition-colors">
              Project Directory
            </Link>
            <span>&middot;</span>
            <Link href="/teammates" className="hover:text-pink-600 transition-colors">
              Campus Matching
            </Link>
            <span>&middot;</span>
            <span className="text-violet-600 font-mono text-[11px] font-bold">Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
