'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectUrl?: string;
}

export function SignupForm({ onSuccess, onSwitchToLogin, redirectUrl = '/profile/setup' }: SignupFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!isSupabaseConfigured()) {
      setError(
        'Supabase is not yet configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file to enable registration.'
      );
      return;
    }

    if (!displayName.trim()) {
      setError('Please provide your full or display name.');
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

      const normalizedEmail = email.trim().includes('@')
        ? email.trim()
        : `${email.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@teamforge.local`;

      const generatedUsername =
        displayName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') +
        Math.floor(100 + Math.random() * 900);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: displayName.trim(),
            username: generatedUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile/setup`,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('Email signups are disabled') || signUpError.message.includes('disabled')) {
          setError(
            "Email Signups are currently turned OFF in your Supabase dashboard. Please go to Authentication -> Providers -> Email and turn 'Enable Email provider' ON."
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Check if session was immediately created, or auto sign in
      let activeSession = data.session;
      if (!activeSession && data.user) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        activeSession = signInData.session;
      }

      if (activeSession) {
        setSuccessMessage('Account created successfully! Taking you to profile setup...');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(redirectUrl);
            router.refresh();
          }
        }, 800);
      } else {
        setSuccessMessage(
          `Account registered. Please verify your email or log in with your credentials.`
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Name"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. Alex Morgan"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Student ID or Email"
          type="text"
          required
          placeholder="e.g. alex or alex@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          helperText="You can use any unique Student ID or your email."
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

        <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg">
          Create Student Account
        </Button>
      </form>

      {onSwitchToLogin && (
        <div className="text-center pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-violet-600 hover:text-violet-700 transition-colors underline underline-offset-2"
          >
            Log in instead
          </button>
        </div>
      )}
    </div>
  );
}
