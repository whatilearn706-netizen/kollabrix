'use client';

import React from 'react';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PlusCircle, Sparkles, GraduationCap } from 'lucide-react';

export default function NewProjectPage() {
  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Publish a Project"
      actionDescription="You need an active student account to propose a project, recruit teammates, and collaborate."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="border-b border-charcoal-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">
            <PlusCircle className="w-4 h-4" />
            <span>Collegiate Project Proposal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Start a New Project
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Publish your project concept to the college community. Describe your technical architecture, specify the roles you need, and recruit passionate student builders.
          </p>
        </div>

        {/* Quick Mentor Portal Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-white">Are you a faculty mentor or professor?</span>{' '}
              <span>Post official problem statements and supervise student teams directly in the <strong>Mentor Portal</strong>.</span>
            </div>
          </div>
          <a
            href="/teacher/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-200 hover:text-white font-medium shrink-0 transition-colors self-start sm:self-auto"
          >
            <span>Go to Mentor Portal</span>
            <span>&rarr;</span>
          </a>
        </div>

        <ProjectForm />
      </div>
    </ProtectedPageGuard>
  );
}
