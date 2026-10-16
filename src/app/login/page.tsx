'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-block group mb-1">
            <BrandLogo size="lg" wordmarkColor="dark" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Log in to Linkora
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            Sign in with Google or GitHub for instant, 100% free access.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <LoginForm redirectUrl="/explore" />
        </div>
      </div>
    </div>
  );
}
