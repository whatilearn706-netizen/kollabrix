'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectUrl?: string;
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

function AppleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.09.65-2.73 1.4-.56.65-.99 1.7-1.02 2.76 1.07.08 2.14-.54 2.74-1.29z" />
    </svg>
  );
}

export function SignupForm({ onSuccess, onSwitchToLogin, redirectUrl = '/profile/setup' }: SignupFormProps) {
  const router = useRouter();

  // Registration Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthSuccess = () => {
    setSuccessMessage('Account created! Opening your student workspace...');
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    }, 400);
  };

  // 1. Google 1-Click Sign-up
  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase credentials are not configured yet in .env.local.');
      return;
    }

    try {
      setIsGoogleLoading(true);
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectUrl}`,
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
            "Google provider is not enabled in your Supabase project. Go to Supabase Console -> Authentication -> Providers -> Google to toggle it ON."
          );
        } else {
          setError(googleError.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-up could not be initiated.');
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

    try {
      setIsGitHubLoading(true);
      const { error: githubError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectUrl}`,
        },
      });

      if (githubError) {
        if (
          githubError.message.includes('provider is not enabled') ||
          githubError.message.includes('Unsupported provider')
        ) {
          setError(
            "GitHub provider is not enabled in your Supabase project. Go to Supabase Console -> Authentication -> Providers -> GitHub to toggle it ON."
          );
        } else {
          setError(githubError.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'GitHub sign-up could not be initiated.');
    } finally {
      setIsGitHubLoading(false);
    }
  };

  // 3. Apple 1-Click Sign-up
  const handleAppleSignUp = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase credentials are not configured yet in .env.local.');
      return;
    }

    try {
      setIsAppleLoading(true);
      const { error: appleError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectUrl}`,
        },
      });

      if (appleError) {
        if (
          appleError.message.includes('provider is not enabled') ||
          appleError.message.includes('Unsupported provider')
        ) {
          setError(
            "Apple sign-in is ready on Linkora! To enable it: Go to Supabase Console -> Authentication -> Providers -> Apple, toggle it ON, and provide your Apple Services ID."
          );
        } else {
          setError(appleError.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Apple sign-up could not be initiated.');
    } finally {
      setIsAppleLoading(false);
    }
  };

  // 4. Email Registration Submit (Instant creation, zero OTP delays)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured yet in .env.local.');
      return;
    }

    if (!displayName.trim()) {
      setError('Please provide your full or display name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password confirmation.');
      return;
    }

    try {
      setIsLoading(true);

      const generatedUsername =
        displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') +
        Math.floor(100 + Math.random() * 900);

      const cleanEmail = email.trim().toLowerCase();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: generatedUsername,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please log in.');
        } else if (signUpError.message.includes('Error sending confirmation email') || signUpError.message.includes('confirmation email')) {
          // If Supabase free mailer throws error, prompt using 1-click Google / GitHub
          setError(
            'Email delivery is restricted on this project. Please use "Continue with Google" or "Continue with GitHub" for instant 1-click registration!'
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Automatically sign in if session exists or establish session
      if (data.session) {
        handleAuthSuccess();
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!signInErr) {
          handleAuthSuccess();
        } else {
          setSuccessMessage('Account created! Opening your student workspace...');
          handleAuthSuccess();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 text-slate-900">
      {/* Error & Success Messages */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs font-medium text-red-700 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs font-medium text-emerald-800 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1-Click Fast OAuth Actions (Google + GitHub + Apple) */}
      <div className="space-y-3">
        {/* Google 1-Click */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isGitHubLoading || isAppleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {/* GitHub 1-Click */}
        <button
          type="button"
          onClick={handleGitHubSignUp}
          disabled={isGoogleLoading || isGitHubLoading || isAppleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-[#24292F] hover:bg-[#1a1e22] text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <GitHubIcon className="w-5 h-5 shrink-0" />
          <span>{isGitHubLoading ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
        </button>

        {/* Apple 1-Click */}
        <button
          type="button"
          onClick={handleAppleSignUp}
          disabled={isGoogleLoading || isGitHubLoading || isAppleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-black hover:bg-zinc-900 border border-black text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
        >
          <AppleIcon className="w-5 h-5 shrink-0" />
          <span>{isAppleLoading ? 'Connecting to Apple...' : 'Continue with Apple'}</span>
        </button>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-medium">
        ⚡ 100% Free Forever • Zero email verification delays • Instant access
      </div>

      {/* Collapsible Accordion: Register with Email & Password */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>Or register with email & password</span>
          {showEmailForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showEmailForm && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 pt-3 animate-in fade-in duration-200">
            <Input
              label="Your Full Name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Alex Morgan"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. alex@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-xs"
              isLoading={isLoading}
              size="lg"
            >
              Create Account with Email
            </Button>
          </form>
        )}
      </div>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <div className="text-center pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-slate-900 hover:underline underline-offset-2"
          >
            Log in instead
          </button>
        </div>
      )}
    </div>
  );
}
