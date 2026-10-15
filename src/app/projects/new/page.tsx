'use client';

import React from 'react';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PlusCircle, Sparkles } from 'lucide-react';

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

        <ProjectForm />
      </div>
    </ProtectedPageGuard>
  );
}
