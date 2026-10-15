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
        <div className="border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 border border-violet-200 text-xs font-bold text-violet-800 uppercase tracking-wider mb-2">
            <PlusCircle className="w-3.5 h-3.5 text-violet-600" />
            <span>Collegiate Project Proposal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Start a <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">New Project</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Publish your project concept to the college community. Describe your technical architecture, specify the roles you need, and recruit passionate student builders.
          </p>
        </div>

        {/* Quick Mentor Portal Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-pink-50/60 border-2 border-indigo-200/90 text-xs font-medium text-indigo-950 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-sm block">Are you a faculty mentor or professor?</span>
              <span className="text-slate-600 text-xs">Post official problem statements and supervise student teams directly in the <strong>Mentor Portal</strong>.</span>
            </div>
          </div>
          <a
            href="/teacher/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0 transition-colors self-start sm:self-auto shadow-sm"
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
