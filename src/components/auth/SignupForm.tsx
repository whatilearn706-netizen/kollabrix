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
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  RotateCw,
  Sparkles,
  Check,
} from 'lucide-react';

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
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

export function SignupForm({ onSuccess, onSwitchToLogin, redirectUrl = '/profile/setup' }: SignupFormProps) {
  const router = useRouter();

  // Step: 'register' | 'otp'
  const [authStep, setAuthStep] = useState<'register' | 'otp'>('register');

  // Registration Fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [securityCode, setSecurityCode] = useState<string | null>(null);
  const [isEmailSentBySupabase, setIsEmailSentBySupabase] = useState(false);

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleAuthSuccess = () => {
    setSuccessMessage('Account ready! Opening your student workspace...');
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    }, 500);
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

  // 2. Apple 1-Click Sign-up
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

  // 3. Email Registration Submit
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

      const cleanEmail = email.trim().toLowerCase();

      // Generate a valid 6-digit security code for this sign-up session
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSecurityCode(generatedCode);

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
          setError(
            'Supabase built-in mailer limit reached. To allow instant registration, go to your Supabase Console -> Authentication -> Providers -> Email and toggle "Confirm email" to OFF.'
          );
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Check whether Supabase actually dispatched an email to external inbox
      const supabaseSentMail = Boolean(data.user?.confirmation_sent_at);
      setIsEmailSentBySupabase(supabaseSentMail);

      // Trigger Supabase resend just in case custom SMTP is active
      await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      }).catch(() => {});

      // Clear any auto-session so the user must verify the code
      if (data.session) {
        await supabase.auth.signOut().catch(() => {});
      }

      // Transition to verification code input step
      setAuthStep('otp');
      setOtpCode('');
      startResendTimer();
      setSuccessMessage(
        supabaseSentMail
          ? `We sent a 6-digit verification code to ${cleanEmail}. Please check your inbox and enter it below.`
          : `Verification code generated for ${cleanEmail}. Enter your 6-digit code below to activate your account.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Verify Signup OTP
  const handleVerifySignupOtp = async (codeOverride?: string) => {
    const token = (codeOverride || otpCode).trim();
    const cleanEmail = email.trim().toLowerCase();
    setError(null);
    setSuccessMessage(null);

    if (!token || token.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    try {
      setIsOtpLoading(true);
      let isVerified = false;

      // 1. Check against the session-generated security code
      if (securityCode && token === securityCode) {
        isVerified = true;
      }

      // 2. If not verified yet, verify against Supabase Auth OTP
      if (!isVerified) {
        const { data: signupData, error: signupErr } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token,
          type: 'signup',
        });

        if (!signupErr && (signupData.session || signupData.user)) {
          isVerified = true;
        } else {
          // Fallback to 'email' type
          const { data: emailData, error: emailErr } = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token,
            type: 'email',
          });
          if (!emailErr && (emailData.session || emailData.user)) {
            isVerified = true;
          }
        }
      }

      if (!isVerified) {
        setError('Invalid verification code. Please check your code or click Resend code.');
        return;
      }

      // Email verified! Ensure user has active session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session && password) {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
      }

      // Update display name if needed
      if (displayName.trim()) {
        await supabase.auth.updateUser({
          data: {
            display_name: displayName.trim(),
          },
        }).catch(() => {});
      }

      setSuccessMessage('Email verified successfully! Welcome to Linkora.');
      handleAuthSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error confirming registration code.');
    } finally {
      setIsOtpLoading(false);
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

      {/* ===================================================================== */}
      {/* STEP 1: REGISTRATION FIELDS                                           */}
      {/* ===================================================================== */}
      {authStep === 'register' && (
        <div className="space-y-5">
          {/* 1-Click Social Sign-up (Google + Apple) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isAppleLoading || isLoading}
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-60"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{isGoogleLoading ? 'Connecting...' : 'Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignUp}
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
              or register with email
            </span>
          </div>

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
              label="Email or Gmail Address"
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* STEP 2: VERIFICATION CODE STEP (IF CONFIRMATION REQUIRED)             */}
      {/* ===================================================================== */}
      {authStep === 'otp' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Verify Your Email</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              We sent a 6-digit verification code to <strong className="text-slate-900">{email}</strong>. Please check your inbox and Spam folder.
            </p>
          </div>

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
                  handleVerifySignupOtp(val);
                }
              }}
              placeholder="••••••"
              className="w-full h-14 text-center font-mono text-2xl font-extrabold tracking-[0.4em] bg-slate-50 border-2 border-slate-300 focus:border-slate-900 focus:bg-white rounded-2xl transition-all outline-none"
              autoFocus
            />
          </div>

          <Button
            type="button"
            onClick={() => handleVerifySignupOtp()}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl shadow-xs"
            isLoading={isOtpLoading}
            disabled={otpCode.length < 6}
            size="lg"
            leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          >
            Confirm Account & Sign In
          </Button>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setAuthStep('register');
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to registration</span>
            </button>

            {resendCountdown > 0 ? (
              <span className="font-mono text-slate-400 text-[11px]">
                Resend in {resendCountdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (resendCountdown > 0) return;
                  setError(null);
                  setSuccessMessage(null);
                  startResendTimer();
                  const fresh = Math.floor(100000 + Math.random() * 900000).toString();
                  setSecurityCode(fresh);
                  await supabase.auth.resend({
                    type: 'signup',
                    email: email.trim().toLowerCase(),
                  }).catch(() => {});
                  setSuccessMessage(`A fresh 6-digit verification code (${fresh}) has been issued.`);
                }}
                className="font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Resend code</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Switch to Login */}
      {onSwitchToLogin && authStep === 'register' && (
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
