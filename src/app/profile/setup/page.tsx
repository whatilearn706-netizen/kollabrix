'use client';

import React from 'react';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { Sparkles, UserCheck } from 'lucide-react';

export default function ProfileSetupPage() {
  const { profile } = useAuth();

  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Complete Profile"
      actionDescription="Please log in to customize your student identity and skill tags."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="border-b border-charcoal-800 pb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4" />
            <span>Welcome to Kollabrix &middot; Quick Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complete Your Student Profile
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
            Tell the community about your college, technical skills, and what kind of projects you want to build. You can update this anytime.
          </p>
        </div>

        <ProfileForm initialProfile={profile} isOnboarding={true} />
      </div>
    </ProtectedPageGuard>
  );
}
