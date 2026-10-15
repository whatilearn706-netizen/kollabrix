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
      title={authModalView === 'login' ? 'Welcome back to Linkora' : 'Join Linkora'}
      description={
        authModalView === 'login'
          ? 'Log in to publish project ideas, assemble your team, and customize your student profile.'
          : 'Create your student account to discover collaborators and build standout projects.'
      }
      maxWidth="md"
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
