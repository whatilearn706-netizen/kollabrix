'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProfileEditModal } from '@/components/profile/modal/ProfileEditModal';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SettingsProfilePage() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Edit Profile"
      actionDescription="You must be signed in to edit your collegiate profile settings."
    >
      <div className="min-h-[85vh] flex items-center justify-center relative px-4">
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Floating Modal Forced Open in Edit Mode */}
        <ProfileEditModal forceOpen={true} mode="edit" />
      </div>
    </ProtectedPageGuard>
  );
}
