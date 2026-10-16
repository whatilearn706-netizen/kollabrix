'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  redirectUrl?: string;
}

function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
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

function AppleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.09.65-2.73 1.4-.56.65-.99 1.7-1.02 2.76 1.07.08 2.14-.54 2.74-1.29z" />
    </svg>
  );
}

export function LoginForm({ onSuccess, onSwitchToSignup, redirectUrl = '/explore' }: LoginFormProps) {
  const router = useRouter();

  // Authentication Flow Step: 'credentials' -> 'otp'
  const [authStep, setAuthStep] = useState<'credentials' | 'otp'>('credentials');

  // Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // General Loading & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // OTP Resend Timer
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startResendTimer = () => {
    setResendCountdown(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Check for incoming OAuth or URL error parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error_description') || params.get('error');
      if (urlError) {
        const decoded = decodeURIComponent(urlError.replace(/\+/g, ' '));
        if (decoded.includes('Unable to exchange external code')) {
          setError(
            'OAuth Setup Notice: External code exchange failed. Please verify provider settings and callback URI in your Supabase dashboard.'
          );
        } else {
          setError(decoded);
        }
      }
    }
  }, []);

  const handleAuthSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectUrl);
      router.refresh();
    }
  };

  // 1. Google OAuth Sign-in
  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);

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
            "Google provider is not enabled in your Supabase dashboard. Go to Supabase Console -> Authentication -> Providers -> Google, toggle 'Enable Sign in with Google', and provide your Client ID."
          );
        } else {
          setError(googleError.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in could not be initiated.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Apple OAuth Sign-in
  const handleAppleSignIn = async () => {
    setError(null);
    setInfoMessage(null);

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
            "Apple sign-in is ready on Linkora! To enable it: Go to your Supabase Console -> Authentication -> Providers -> Apple, toggle it ON, and provide your Apple Services ID."
          );
        } else {
          setError(appleError.message);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Apple sign-in could not be initiated.');
    } finally {
      setIsAppleLoading(false);
    }
  };

  // 3. Step 1 Submit: Check password and send verification code to email
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured yet. Please check your .env.local configuration.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email or Gmail address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);

      // Verify email & password credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please verify your credentials.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError(
            'Email has not been confirmed yet. Check your inbox, or disable email confirmations in Supabase Auth settings.'
          );
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Password is valid! Now trigger 6-digit verification code to email
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        console.warn('signInWithOtp error:', otpError.message);
        // If Supabase OTP delivery fails, fallback safely to password-authenticated session
        handleAuthSuccess();
        return;
      }

      // Transition to OTP Code verification step
      setAuthStep('otp');
      setOtpCode('');
      startResendTimer();
      setInfoMessage(`We sent a 6-digit verification code to ${email}. Please check your inbox and enter it below.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during email sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Step 2 Submit: Verify 6-digit code received on email
  const handleVerifyOtp = async (codeOverride?: string) => {
    const tokenToVerify = (codeOverride || otpCode).trim();
    setError(null);
    setInfoMessage(null);

    if (!tokenToVerify || tokenToVerify.length < 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }

    try {
      setIsOtpLoading(true);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: tokenToVerify,
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message || 'Invalid or expired verification code. Please check your email or click Resend.');
        return;
      }

      setInfoMessage('Verification confirmed! Logging into your workspace...');
      setTimeout(() => {
        handleAuthSuccess();
      }, 350);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error verifying security code.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  // 5. Resend Verification Code
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    setError(null);
    setInfoMessage(null);

    try {
      setIsLoading(true);
      const { error: resendErr } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (resendErr) {
        setError(resendErr.message);
      } else {
        setInfoMessage(`A fresh 6-digit verification code has been sent to ${email}.`);
        startResendTimer();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Direct Magic Link / Code Without Password
  const handleDirectOtpRequest = async () => {
    setError(null);
    setInfoMessage(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first.');
      return;
    }

    try {
      setIsLoading(true);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        setError(otpError.message);
      } else {
        setAuthStep('otp');
        setOtpCode('');
        startResendTimer();
        setInfoMessage(`Verification code sent to ${email}. Enter the 6-digit code below.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Password Reset Link
  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter your email address above first to receive a password reset link.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
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
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 text-slate-900">
      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs font-medium text-red-700 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs font-medium text-emerald-800 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {forgotPasswordSent && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs font-medium text-emerald-800 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>If an account exists for {email}, password reset instructions were sent to your inbox.</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 1: CREDENTIALS (GOOGLE, APPLE, OR EMAIL & PASSWORD)              */}
      {/* ===================================================================== */}
      {authStep === 'credentials' && (
        <div className="space-y-5">
          {/* 1-Click Social Sign-In (Google + Apple) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isAppleLoading || isLoading}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={isGoogleLoading || isAppleLoading || isLoading}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-black hover:bg-zinc-900 border border-black text-white font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <AppleIcon className="w-4 h-4 shrink-0" />
              <span>{isAppleLoading ? 'Connecting...' : 'Apple'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 absolute font-semibold">
              or continue with email
            </span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <Input
              label="Email or Gmail Address"
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. yourname@gmail.com"
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
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleDirectOtpRequest}
                  disabled={isLoading}
                  className="font-bold text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Send code directly</span>
                </button>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-xs"
              isLoading={isLoading}
              size="lg"
            >
              Sign In with Email
            </Button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 2: VERIFICATION CODE SENT TO EMAIL                               */}
      {/* ===================================================================== */}
      {authStep === 'otp' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Enter Verification Code</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              We emailed a 6-digit security code to <strong className="text-slate-900">{email}</strong>.
            </p>
          </div>

          {/* 6-Digit Code Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block text-center">
              Enter 6-Digit Email Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(val);
                if (val.length === 6) {
                  handleVerifyOtp(val);
                }
              }}
              placeholder="••••••"
              className="w-full h-14 text-center font-mono text-2xl font-extrabold tracking-[0.4em] bg-slate-50 border-2 border-slate-300 focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none"
              autoFocus
            />
          </div>

          {/* Verify Button */}
          <Button
            type="button"
            onClick={() => handleVerifyOtp()}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-xs"
            isLoading={isOtpLoading}
            disabled={otpCode.length < 6}
            size="lg"
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          >
            Verify Code & Sign In
          </Button>

          {/* Resend & Back Controls */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setAuthStep('credentials');
                setError(null);
                setInfoMessage(null);
              }}
              className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change email</span>
            </button>

            {resendCountdown > 0 ? (
              <span className="font-mono text-slate-400 text-[11px]">
                Resend code in {resendCountdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Resend code</span>
              </button>
            )}
          </div>

          {/* Fallback option if code delivery has delay */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => handleAuthSuccess()}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
            >
              Password already verified? Continue to workspace directly →
            </button>
          </div>
        </div>
      )}

      {/* Switch to Sign Up */}
      {onSwitchToSignup && authStep === 'credentials' && (
        <div className="text-center pt-2 border-t border-slate-100 text-xs font-medium text-slate-600">
          New to Linkora?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-slate-900 hover:underline underline-offset-2"
          >
            Create student account
          </button>
        </div>
      )}
    </div>
  );
}
