'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, Sparkles, Terminal, Code2, Users, Trophy } from 'lucide-react';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/resources')) {
    return null;
  }

  const { theme, isDark } = useSiteTheme();
  const isFooterDark = pathname === '/' || isDark;

  return (
    <footer
      style={{
        backgroundColor:
          theme.footerBgColor ||
          (isFooterDark ? '#090B10' : '#f8fafc'),
        borderColor: theme.footerBorderColor || (isFooterDark ? 'rgba(255, 255, 255, 0.08)' : theme.borderColor),
        color: isFooterDark ? '#94A3B8' : theme.bodyTextColor,
      }}
      className="w-full border-t py-12 text-sm transition-all"
    >
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16">
        <div
          style={{ borderColor: isFooterDark ? 'rgba(255, 255, 255, 0.08)' : theme.borderColor }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b"
        >
          {/* Brand Info */}
          <div className="space-y-3.5 md:col-span-1">
            <Link href="/" className="inline-block focus-visible:outline-none">
              <BrandLogo
                size="sm"
                wordmarkColor={isFooterDark ? 'light' : 'dark'}
                title="Kollabrix"
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
              style={{ color: isFooterDark ? '#F1F5F9' : theme.headingColor }}
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
                <Link href="/leaderboard" className="hover:opacity-100 transition-opacity font-medium">
                  Campus Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/deadlines" className="hover:opacity-100 transition-opacity font-medium">
                  Deadlines Radar
                </Link>
              </li>
              <li>
                <Link href="/hackathons" className="hover:opacity-100 transition-opacity font-medium">
                  {theme.hackathonsTitle || 'College Hackathons'}
                </Link>
              </li>
              <li>
                <Link href="/spark" className="hover:opacity-100 transition-opacity font-medium">
                  AI Spark Studio
                </Link>
              </li>
              <li>
                <a
                  href="mailto:whatilearn706@gmail.com?subject=Kollabrix%20Community%20Feedback"
                  className="hover:opacity-100 transition-opacity font-medium text-violet-400 cursor-pointer text-left inline-block"
                >
                  💬 Community Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Student & Faculty Pathways */}
          <div className="space-y-2.5">
            <h4
              style={{ color: isFooterDark ? '#F1F5F9' : theme.headingColor }}
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
            </ul>
          </div>

          {/* Technical Architecture */}
          <div className="space-y-2.5">
            <h4
              style={{ color: isFooterDark ? '#F1F5F9' : theme.headingColor }}
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
          <p>© {new Date().getFullYear()} {theme.siteTitle || 'Kollabrix'} Collegiate Innovation Network. All rights reserved.</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
