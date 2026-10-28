'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Shield, ArrowLeft, Lock, Eye, Database, Server, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PrivacyPolicyPage() {
  const { theme, isDark } = useSiteTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Home
            </Button>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Data Protection</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: October 16, 2026 • Dedicated to safeguarding collegiate student privacy and institutional academic records.
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              Kollabrix collects minimal, purpose-driven data required to operate collaborative project workspaces and collegiate hackathons:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Account Credentials:</strong> Institutional or personal email address used exclusively for passwordless OTP authentication. We do not store plaintext passwords.</li>
              <li><strong>Student &amp; Faculty Profiles:</strong> Display name, username, bio, technical skill tags, GitHub handle, and academic interest categories you voluntarily configure.</li>
              <li><strong>Workspace &amp; Collaboration Artifacts:</strong> Kanban task statuses, milestone targets, squad discussion threads, and hackathon project deliverables.</li>
              <li><strong>Audit &amp; Moderation Telemetry:</strong> High-privilege administrative actions, session security events, and rate-limiting metrics to protect the platform against abusive traffic.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
              <span>How We Use Your Data</span>
            </h2>
            <p>
              Your data is utilized strictly to provide, improve, and secure collegiate collaboration services:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Matching student builders with complementary teammates based on algorithmic skill-score compatibility.</li>
              <li>Facilitating faculty milestone evaluations, hackathon submissions, and mentor feedback.</li>
              <li>Delivering critical account notifications and squad application acceptance updates.</li>
              <li><strong>Never Selling Data:</strong> We do not sell, rent, monetize, or broker your personal information or student project deliverables to third-party advertisers.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <span>Security Architecture &amp; Data Storage</span>
            </h2>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-violet-500 shrink-0" />
                <span>Enterprise Cloud Architecture</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                All platform data is securely stored within dedicated cloud PostgreSQL instances managed by <strong>Supabase</strong> with Row-Level Security (RLS) policies enforcing database-level data isolation between different project teams.
              </p>
            </div>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>All network communication is strictly encrypted in transit using industry-standard <strong>TLS 1.3 / HTTPS</strong>.</li>
              <li>Database tables enforce cryptographic token verification and salted password hashes for private hackathons.</li>
              <li>Administrative endpoints are fortified with server-side role verification and tamper-resistant audit logs.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">4</span>
              <span>Student Data Rights &amp; FERPA / GDPR Alignment</span>
            </h2>
            <p>
              We honor fundamental privacy principles and university data protection standards:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Right to Access &amp; Portability:</strong> You may review and export your project contributions, bio details, and squad applications at any time from your profile settings.</li>
              <li><strong>Right to Rectification:</strong> You can edit and update your skills, role preferences, and profile details whenever needed.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Students can request permanent deletion of their account and personal metadata by submitting an erasure request to platform administration.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">5</span>
              <span>Cookies &amp; Local Browser Storage</span>
            </h2>
            <p>
              Kollabrix uses essential browser storage mechanisms (session cookies and `localStorage`) strictly to maintain your active authentication session, cache draft project submissions, and persist your preferred visual theme across page visits. We do not use intrusive cross-site tracking cookies.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Officer &amp; Inquiries</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For questions regarding our privacy practices, data deletion requests, or institutional compliance agreements, please contact our Data Governance Team at{' '}
              <a href="mailto:whatilearn706@gmail.com" className="text-emerald-600 dark:text-emerald-400 underline font-medium">
                whatilearn706@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
