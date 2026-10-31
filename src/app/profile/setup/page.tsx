'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { MandatoryOnboardingModal } from '@/components/profile/MandatoryOnboardingModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { Sparkles } from 'lucide-react';

export default function ProfileSetupPage() {
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    const hasCollege = Boolean(profile?.college && profile.college.trim().length > 0);
    const hasSkills = Boolean(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0);
    const hasUsername = Boolean(profile?.username && profile.username.trim().length > 0);

    if (hasCollege && hasSkills && hasUsername) {
      router.replace('/explore');
    }
  }, [user, profile, isLoading, router]);

  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Complete Profile"
      actionDescription="Please log in to customize your collegiate builder identity."
    >
      <div className="min-h-[85vh] flex items-center justify-center relative px-4">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Floating Modal Forced Open on this route */}
        <MandatoryOnboardingModal forceOpen={true} />
      </div>
    </ProtectedPageGuard>
  );
}
