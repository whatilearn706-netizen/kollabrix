'use client';

import React from 'react';
import { ProfileEditModal, openProfileEditModal } from './modal/ProfileEditModal';

export { openProfileEditModal };

interface MandatoryOnboardingModalProps {
  forceOpen?: boolean;
}

export function MandatoryOnboardingModal({ forceOpen = false }: MandatoryOnboardingModalProps) {
  return <ProfileEditModal forceOpen={forceOpen} mode="onboarding" />;
}
