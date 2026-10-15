'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  redirectUrl?: string;
}

export function LoginForm({ onSuccess, onSwitchToSignup, redirectUrl = '/explore' }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError(
        'Supabase is not yet configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file to enable real authentication.'
      );
      return;
    }

    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const normalizedEmail = email.trim().includes('@')
        ? email.trim()
        : `${email.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@teamforge.local`;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please verify your credentials and try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in, or disable email confirmations in your Supabase Auth settings.');
        } else {
          setError(signInError.message);
        }
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address above first to receive a password reset link.');
      return;
    }
    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured yet. Set up your environment variables first.');
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings/profile`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setForgotPasswordSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send reset password email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {error && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {forgotPasswordSent && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>If an account exists for {email}, a password reset link has been dispatched to your inbox.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Student ID or Email"
          type="text"
          required
          placeholder="e.g. alex or alex@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <div className="flex justify-end pt-0.5">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isResetting}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              {isResetting ? 'Sending link...' : 'Forgot password?'}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg">
          Log In to TeamForge
        </Button>
      </form>

      {onSwitchToSignup && (
        <div className="text-center pt-2 border-t border-charcoal-800 text-xs text-slate-400">
          New to TeamForge?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-brand-400 hover:text-brand-300 transition-colors"
          >
            Create student account
          </button>
        </div>
      )}
    </div>
  );
}
