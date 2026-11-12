'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { isFacultyUser } from '@/lib/auth/faculty';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PlusCircle } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isFacultyUser(user, profile)) {
      router.replace('/teacher/dashboard');
    }
  }, [user, profile, isLoading, router]);

  if (!isLoading && isFacultyUser(user, profile)) {
    return null;
  }

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

        <ProjectForm />
      </div>
    </ProtectedPageGuard>
  );
}
