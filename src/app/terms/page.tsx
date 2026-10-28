'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';
import { Shield, ArrowLeft, FileText, CheckCircle2, Lock, Scale, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TermsOfServicePage() {
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
            <Scale className="w-3.5 h-3.5 text-violet-500" />
            <span>Legal Agreement</span>
          </div>
        </div>

        {/* Title Header */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: October 16, 2026 • Effective for all collegiate builders, creators, and faculty mentors.
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-mono font-bold">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, registering for, or using the <strong>Kollabrix</strong> collegiate collaboration platform (&quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-mono font-bold">2</span>
              <span>Collegiate Eligibility &amp; Account Responsibility</span>
            </h2>
            <p>
              Kollabrix is specifically engineered for tertiary education students, collegiate engineering teams, faculty members, and academic researchers.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>You must provide accurate, current, and verifiable information during email authentication and profile onboarding.</li>
              <li>You are solely responsible for all activities that occur under your user session and workspace credentials.</li>
              <li>Sharing faculty passcodes or unauthorized administrative credentials is strictly prohibited and results in immediate access revocation.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-mono font-bold">3</span>
              <span>Intellectual Property &amp; Project Ownership</span>
            </h2>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Student &amp; Creator Ownership Guarantee</span>
              </p>
              <p>
                Kollabrix claims <strong>no ownership rights</strong> over the software code, UI designs, system architectures, research documents, or proprietary assets created by student teams within project workspaces or hackathon submissions.
              </p>
            </div>
            <p>
              All intellectual property developed by you or your squad remains entirely yours, subject only to open-source licenses or institutional intellectual property agreements executed by your university or project collaborators.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-mono font-bold">4</span>
              <span>Code of Conduct &amp; Academic Integrity</span>
            </h2>
            <p>
              As a collaborative engineering platform, we enforce zero-tolerance policies regarding misconduct, harassment, and academic dishonesty:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Plagiarism:</strong> Submitting third-party open-source code or other teams&apos; project deliverables without proper attribution in hackathons or milestone evaluations will lead to immediate disqualification.</li>
              <li><strong>Inclusive Collaboration:</strong> All team members must communicate respectfully in project discussions and squad applications regardless of race, gender, nationality, or skill level.</li>
              <li><strong>Platform Security:</strong> Tampering with API endpoints, automated scraping of student profiles, or attempting privilege escalation will result in permanent database suspension.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-mono font-bold">5</span>
              <span>Collegiate Hackathons &amp; Competition Rules</span>
            </h2>
            <p>
              Participation in campus or national hackathons hosted via Kollabrix is subject to event-specific rules, evaluation rubrics, and deadlines established by verified faculty organizers.
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Private campus hackathons require a valid departmental join code issued by designated collegiate organizers.</li>
              <li>Final decision of faculty evaluation panels regarding judging scores, prizes, and certificates is binding.</li>
              <li>Organizers reserve the right to archive or remove submissions that breach technical guidelines.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-mono font-bold">6</span>
              <span>Limitation of Liability &amp; Disclaimers</span>
            </h2>
            <p>
              The Platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. Kollabrix and its contributing engineering team shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the platform.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact &amp; Governance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If you have questions regarding these Terms or wish to report a violation, email{' '}
              <a href="mailto:whatilearn706@gmail.com" className="text-violet-600 dark:text-violet-400 underline font-medium">
                whatilearn706@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
