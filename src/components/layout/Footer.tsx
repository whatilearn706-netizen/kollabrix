'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, Sparkles, Terminal, Code2, Users, Trophy } from 'lucide-react';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

export function Footer() {
  const { theme, isDark } = useSiteTheme();

  return (
    <footer
      style={{
        backgroundColor:
          theme.footerBgColor ||
          (isDark ? theme.surfaceColor || '#11141E' : '#f8fafc'),
        borderColor: theme.footerBorderColor || theme.borderColor,
        color: theme.bodyTextColor,
      }}
      className="w-full border-t py-12 text-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          style={{ borderColor: theme.borderColor }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b"
        >
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <Link href="/" className="inline-block focus-visible:outline-none">
              <BrandLogo
                size="sm"
                wordmarkColor={isDark ? 'light' : 'dark'}
                title={theme.siteTitle || 'Linkora'}
              />
            </Link>
            <p className="text-xs opacity-80 leading-relaxed">
              {theme.footerTagline ||
                'The collegiate innovation workspace connecting student makers, campus project teams, faculty mentors, and competitive hackathons.'}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-500 pt-1 font-mono font-bold">
              <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Verified Collegiate Collaboration</span>
            </div>
          </div>

          {/* Platform Destinations */}
          <div className="space-y-2.5">
            <h4
              style={{ color: theme.headingColor }}
              className="text-xs font-bold uppercase tracking-wider font-mono"
            >
              Platform
            </h4>
            <ul className="space-y-2 text-xs opacity-85">
              <li>
                <Link href="/explore" className="hover:opacity-100 transition-opacity font-medium">
                  {theme.exploreTitle || 'Explore Projects'}
                </Link>
              </li>
              <li>
                <Link href="/teammates" className="hover:opacity-100 transition-opacity font-medium">
                  {theme.teammatesTitle || 'Find Teammates'}
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:opacity-100 transition-opacity font-medium">
                  {theme.hackathonsTitle || 'College Hackathons'}
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:opacity-100 transition-opacity font-medium">
                  AI Project Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Faculty Pathways */}
          <div className="space-y-2.5">
            <h4
              style={{ color: theme.headingColor }}
              className="text-xs font-bold uppercase tracking-wider font-mono"
            >
              Workspaces
            </h4>
            <ul className="space-y-2 text-xs opacity-85">
              <li>
                <Link href="/projects/new" className="hover:opacity-100 transition-opacity font-medium">
                  Launch a Project
                </Link>
              </li>
              <li>
                <Link href="/my-projects" className="hover:opacity-100 transition-opacity font-medium">
                  Project Workboard
                </Link>
              </li>
              <li>
                <Link href="/teacher/dashboard" className="hover:opacity-100 transition-opacity font-medium">
                  Faculty Mentor Portal
                </Link>
              </li>
              <li>
                <Link href="/problems" className="hover:opacity-100 transition-opacity font-medium">
                  Faculty Problems
                </Link>
              </li>
              <li>
                <Link href="/control-center-7x9" className="hover:opacity-100 transition-opacity font-medium text-amber-500/90 hover:text-amber-400">
                  👑 Admin Control Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div className="space-y-2.5">
            <h4
              style={{ color: theme.headingColor }}
              className="text-xs font-bold uppercase tracking-wider font-mono"
            >
              Architecture
            </h4>
            <p className="text-xs opacity-80 leading-relaxed">
              Engineered with Next.js App Router, Supabase PostgreSQL, and cryptographic access control.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span
                style={{
                  backgroundColor: theme.surfaceColor,
                  borderColor: theme.borderColor,
                }}
                className="px-2 py-0.5 rounded-md border font-semibold shadow-xs"
              >
                PostgreSQL RLS
              </span>
              <span
                style={{
                  backgroundColor: theme.surfaceColor,
                  borderColor: theme.borderColor,
                }}
                className="px-2 py-0.5 rounded-md border font-semibold shadow-xs"
              >
                Multi-Tenant
              </span>
              <span
                style={{
                  backgroundColor: theme.surfaceColor,
                  borderColor: theme.borderColor,
                }}
                className="px-2 py-0.5 rounded-md border font-semibold shadow-xs"
              >
                Reactive Theme
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-70">
          <p>© {new Date().getFullYear()} {theme.siteTitle || 'Linkora'} Collegiate Innovation Network. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="hover:underline hover:opacity-100 transition-opacity">
              Terms of Service
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/privacy" className="hover:underline hover:opacity-100 transition-opacity">
              Privacy Policy
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/explore" className="hover:underline hover:opacity-100 transition-opacity">
              Directory
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/teammates" className="hover:underline hover:opacity-100 transition-opacity">
              Network
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/hackathons" className="hover:underline hover:opacity-100 transition-opacity">
              Events
            </Link>
            <span className="opacity-40">•</span>
            <Link href="/control-center-7x9" className="hover:underline hover:opacity-100 transition-opacity font-semibold text-amber-500">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
