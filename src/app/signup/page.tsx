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
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-subtle group-hover:shadow-glow-sm transition-all">
              <Layers className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Student Account
          </h1>
          <p className="text-xs text-slate-400">
            Join the student collaboration network. Propose ideas, discover teammates, and build real projects.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 sm:p-8 shadow-elevated">
          <SignupForm redirectUrl="/profile/setup" />
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-400 hover:text-brand-300">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
