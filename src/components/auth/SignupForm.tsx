'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectUrl?: string;
  hideHeader?: boolean;
}

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GitHubIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function SignupForm({
  onSuccess,
  onSwitchToLogin,
  redirectUrl = '/explore',
  hideHeader = false,
}: SignupFormProps) {
  const router = useRouter();

  // General States
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Google 1-Click Sign-up
  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase credentials are not configured yet in .env.local.');
      return;
    }

    const canonicalOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://kollabrix.in';

    try {
      setIsGoogleLoading(true);
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${canonicalOrigin}/auth/callback?next=${redirectUrl}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (googleError) {
        if (
          googleError.message.includes('provider is not enabled') ||
          googleError.message.includes('Unsupported provider')
        ) {
          setError(
            'Google provider is not enabled in your Supabase project. Go to Supabase Console -> Authentication -> Providers -> Google to toggle it ON.'
          );
        } else {
          setError(googleError.message);
        }
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Google sign-up could not be initiated.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. GitHub 1-Click Sign-up
  const handleGitHubSignUp = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase credentials are not configured yet in .env.local.');
      return;
    }

    const canonicalOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://kollabrix.in';

    try {
      setIsGitHubLoading(true);
      const { data, error: githubError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${canonicalOrigin}/auth/callback?next=${redirectUrl}`,
          skipBrowserRedirect: true,
        },
      });

      if (githubError) {
        setError(githubError.message);
        return;
      }

      if (data?.url) {
        const res = await fetch(data.url).catch(() => null);
        if (res && !res.ok) {
          const errJson = await res.json().catch(() => null);
          if (
            errJson?.msg?.includes('provider is not enabled') ||
            errJson?.error_code === 'validation_failed'
          ) {
            setError(
              'GitHub sign-in is not enabled in your Supabase project yet. Please use "Continue with Google" for instant 1-click access!'
            );
            return;
          }
        }
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'GitHub sign-up could not be initiated.'
      );
    } finally {
      setIsGitHubLoading(false);
    }
  };

  const isAnyLoading = isGoogleLoading || isGitHubLoading;

  return (
    <div className="w-full space-y-6 text-white select-none">
      {/* Clean In-Card Header */}
      {!hideHeader && (
        <div className="text-left pb-1">
          <h2 className="text-2xl font-black text-white tracking-tight font-heading">
            Create an account
          </h2>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-2.5 text-xs font-medium text-rose-300 leading-relaxed animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs font-medium text-emerald-300 leading-relaxed animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1-Click Fast OAuth Actions with distinct 'or' divider and non-congested spacing */}
      <div className="space-y-4 pt-1">
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isAnyLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#121722] hover:bg-[#1a2130] border border-white/10 hover:border-white/20 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer group"
        >
          <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:scale-105 transition-transform" />
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
        </button>

        {/* Distinct 'or' divider with comfortable breathing room */}
        <div className="relative flex items-center justify-center py-1">
          <div className="w-full border-t border-white/[0.08]" />
          <span className="absolute bg-[#0c1017] px-3.5 text-[11px] font-mono uppercase text-slate-500 tracking-wider">
            or
          </span>
        </div>

        <button
          type="button"
          onClick={handleGitHubSignUp}
          disabled={isAnyLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#121722] hover:bg-[#1a2130] border border-white/10 hover:border-white/20 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer group"
        >
          <GitHubIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-slate-200 group-hover:scale-105 transition-transform" />
          <span>{isGitHubLoading ? 'Connecting to GitHub...' : 'Sign up with GitHub'}</span>
        </button>
      </div>

      {/* Footer Navigation */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col items-center gap-3 text-center">
        <div className="text-xs text-slate-400">
          Already have an account?{' '}
          {onSwitchToLogin ? (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4 cursor-pointer"
            >
              Log in
            </button>
          ) : (
            <a
              href="/login"
              className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
            >
              Log in
            </a>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Collegiate Verified</span>
          </span>
          <span>•</span>
          <span>Free Forever</span>
        </div>
      </div>
    </div>
  );
}
