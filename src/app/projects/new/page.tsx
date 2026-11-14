'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { isFacultyUser } from '@/lib/auth/faculty';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PlusCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  const isVerifiedStudent = Boolean(
    profile?.college_verified ||
    (profile as any)?.student_verified ||
    user?.user_metadata?.college_verified ||
    profile?.role === 'teacher' ||
    profile?.role === 'admin' ||
    Boolean((profile as any)?.faculty_verified)
  );

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

        {!isVerifiedStudent ? (
          <div className="p-8 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Collegiate Verification Required
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Unverified students can overview projects across Kollabrix. To propose projects and recruit peers, verify your student identity with your physical college ID card &amp; Face ID (30s).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('kollabrix:open-profile-modal', {
                      detail: { step: 4 },
                    })
                  );
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Verify Student Identity Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <ProjectForm />
        )}
      </div>
    </ProtectedPageGuard>
  );
}
