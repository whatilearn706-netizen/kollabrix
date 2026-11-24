'use client';

import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { X, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function AuthModal() {
  const { authModalOpen, authModalView, closeAuthModal, openAuthModal } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && authModalOpen) {
        closeAuthModal();
      }
    };
    if (authModalOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      {/* Dark Ambient Backdrop (Stratis UI style) */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* High-Craft Dark Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[440px] rounded-2xl bg-[#0c1017]/95 border border-white/[0.1] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-white relative overflow-hidden my-auto z-10 transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle Top Rim Highlight (Real Coder Detail) */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Ambient Radial Backlight inside card */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/10 blur-[60px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 z-20 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Mark at Top */}
        <div className="flex items-center gap-2 mb-4">
          <BrandLogo size="sm" wordmarkColor="light" />
        </div>

        {/* Forms */}
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
      </div>
    </div>
  );
}
