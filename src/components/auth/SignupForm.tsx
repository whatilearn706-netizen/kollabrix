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
} from 'lucide-react';

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectUrl?: string;
}

export function SignupForm({ onSuccess, onSwitchToLogin, redirectUrl = '/profile/setup' }: SignupFormProps) {
  const router = useRouter();

  // Registration Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthSuccess = () => {
    setSuccessMessage('Account created successfully! Preparing your Linkora workspace...');
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    }, 600);
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

  // 2. Email / Gmail Registration
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
      setError('Please provide a valid Gmail or email address.');
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

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
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
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // If user session exists immediately or confirmation needed
      if (data.session) {
        handleAuthSuccess();
      } else if (data.user && !data.session) {
        setSuccessMessage(
          `Confirmation email sent to ${email}. Check your inbox, or disable email confirmations in Supabase Auth to enable instant sign-ins.`
        );
      } else {
        handleAuthSuccess();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 text-slate-900">
      {/* 1-Click Google Sign-up */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
        <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 absolute font-semibold">
          or register with email
        </span>
      </div>

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

      {/* Registration Form */}
      <form onSubmit={handleEmailSubmit} className="space-y-4">
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
          label="Gmail or University Email"
          type="email"
          required
          autoComplete="email"
          placeholder="e.g. alex@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          helperText="Any Gmail, Google Workspace, or college email is accepted."
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
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-2xl shadow-xs"
          isLoading={isLoading}
          size="lg"
        >
          Create Account with Email
        </Button>
      </form>

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
