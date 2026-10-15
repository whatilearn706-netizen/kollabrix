'use client';

import React from 'react';
import Link from 'next/link';
import { ProtectedPageGuard } from '@/components/auth/ProtectedPageGuard';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Settings, User, ArrowLeft, ExternalLink } from 'lucide-react';

export default function SettingsProfilePage() {
  const { profile, user } = useAuth();

  return (
    <ProtectedPageGuard
      actionTitle="Sign In to Edit Profile"
      actionDescription="You must be signed in to edit your profile settings."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-400 uppercase tracking-wider mb-2">
              <Settings className="w-4 h-4" />
              <span>Student Account Settings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Edit Your Profile & Skills
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Manage your display name, college affiliations, and technical tags seen by collaborators.
            </p>
          </div>

          {profile?.username && (
            <Link href={`/profile/${profile.username}`}>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View Public Profile
              </Button>
            </Link>
          )}
        </div>

        <ProfileForm initialProfile={profile} isOnboarding={false} />
      </div>
    </ProtectedPageGuard>
  );
}
