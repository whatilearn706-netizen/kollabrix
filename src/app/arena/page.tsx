'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { FullArenaExperience } from '@/components/arena/FullArenaExperience';

function ArenaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room') || undefined;
  const { user, profile } = useAuth();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <FullArenaExperience
      onClose={handleClose}
      initialRoomCode={roomParam}
      currentUser={{
        displayName:
          profile?.display_name ||
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split('@')[0] ||
          'CyberCoder',
        username:
          profile?.username ||
          user?.user_metadata?.username ||
          user?.email?.split('@')[0] ||
          'coder',
        avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url || undefined,
      }}
    />
  );
}

export default function ArenaPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#05070e] flex items-center justify-center font-mono text-cyan-400">
          INITIALIZING BATTLE ARENA...
        </div>
      }
    >
      <ArenaPageContent />
    </Suspense>
  );
}
