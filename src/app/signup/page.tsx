'use client';

import React from 'react';
import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Layers } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all">
              <Layers className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Create <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent">Student Account</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Join the student collaboration network. Propose ideas, discover teammates, and build real projects.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <SignupForm redirectUrl="/profile/setup" />
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs sm:text-sm text-slate-600 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-violet-600 hover:text-violet-700 underline underline-offset-2">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
