'use client';

import { useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { isFacultyUser } from '@/lib/auth/faculty';

/**
 * Universal Verification Gate Hook
 * 
 * Enforces the global Collegiate Verification Rule:
 * - Unverified students have read-only Overview access across the entire website.
 * - Any interactive participation (Hackathon registration, Teammate invite, Project apply/create, Arena entry)
 *   strictly requires collegiate verification (Path B Physical ID Card + Face ID).
 * - Verified faculty members and administrators are universally exempt and retain full privileges.
 */
export function useVerificationGate() {
  const { user, profile } = useAuth();

  const isFaculty = isFacultyUser(user, profile);

  // Check verification across Supabase profiles, user metadata, and local fallback
  const isVerifiedStudent = Boolean(
    profile?.college_verified ||
    (profile as any)?.student_verified ||
    user?.user_metadata?.college_verified === true ||
    (typeof window !== 'undefined' && localStorage.getItem('linkora_college_verified') === 'true')
  );

  const canParticipate = isFaculty || isVerifiedStudent;

  const openVerificationModal = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kollabrix:open-profile-modal', {
          detail: { step: 4 },
        })
      );
    }
  }, []);

  const requireVerification = useCallback(
    (actionCallback?: () => void): boolean => {
      if (canParticipate) {
        if (actionCallback) actionCallback();
        return true;
      }

      // Unverified student attempting an action: open verification directly
      openVerificationModal();
      return false;
    },
    [canParticipate, openVerificationModal]
  );

  return {
    isVerified: canParticipate,
    isVerifiedStudent,
    isFaculty,
    canParticipate,
    requireVerification,
    openVerificationModal,
  };
}
