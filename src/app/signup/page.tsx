'use client';

import React from 'react';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-block group mb-1">
            <BrandLogo size="lg" wordmarkColor="dark" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Join Linkora
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Create your account with Google, phone number, or email to start collaborating.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <SignupForm redirectUrl="/profile/setup" />
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs sm:text-sm text-slate-600 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-slate-900 hover:underline underline-offset-2">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
