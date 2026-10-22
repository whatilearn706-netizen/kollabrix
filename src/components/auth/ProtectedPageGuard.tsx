'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowRight, Compass, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export interface ProtectedPageGuardProps {
  children: React.ReactNode;
  actionTitle?: string;
  actionDescription?: string;
}

export function ProtectedPageGuard({
  children,
  actionTitle = 'Authentication Required',
  actionDescription = 'Please log in or create a student account to access this page.',
}: ProtectedPageGuardProps) {
  const { user, profile, isLoading, openAuthModal } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Verifying student session...</p>
      </div>
    );
  }

  // Account Suspension Check
  if (user && profile?.is_suspended) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-amber-500/40 text-center space-y-5 shadow-elevated">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Account Suspended</h2>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Your account has been suspended. Protected collaborative actions are locked.
          </p>
          {profile.suspension_reason && (
            <p className="mt-3 p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 text-amber-300 text-xs font-mono">
              Notice: {profile.suspension_reason}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Link href="/explore">
            <Button variant="outline" size="sm">
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-charcoal-900 border border-charcoal-750/80 text-center space-y-5 shadow-elevated">
        <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">{actionTitle}</h2>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {actionDescription}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => openAuthModal('login')}
          >
            Log In
          </Button>

          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => openAuthModal('signup')}
          >
            Create Account
          </Button>
        </div>

        <div className="pt-3 border-t border-charcoal-800">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-brand-400" />
            <span>Browse public projects instead</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
