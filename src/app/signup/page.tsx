'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { SignupForm } from '@/components/auth/SignupForm';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function SignupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/my-projects');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-block group mb-1">
            <BrandLogo size="lg" wordmarkColor="dark" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Join Kollabrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Create your account with Google, LinkedIn, or GitHub to start collaborating.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <SignupForm redirectUrl="/explore" />
        </div>
      </div>
    </div>
  );
}
