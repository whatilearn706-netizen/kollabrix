'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { Modal } from '@/components/ui/Modal';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthModal() {
  const { authModalOpen, authModalView, closeAuthModal, openAuthModal } = useAuth();

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuthModal}
      title={authModalView === 'login' ? 'Welcome back to Kollabrix' : 'Join Kollabrix'}
      description={
        authModalView === 'login'
          ? 'Log in to enter the battle arena, assemble your squad, and build verified engineering proof-of-work.'
          : 'Create your collegiate account to enter the battle arena and compete in live 1v1 duels.'
      }
      maxWidth="md"
      zIndex="z-[99999]"
    >
      {authModalView === 'login' ? (
        <LoginForm
          onSuccess={closeAuthModal}
          onSwitchToSignup={() => openAuthModal('signup')}
        />
      ) : (
        <SignupForm
          onSuccess={closeAuthModal}
          onSwitchToLogin={() => openAuthModal('login')}
        />
      )}
    </Modal>
  );
}
