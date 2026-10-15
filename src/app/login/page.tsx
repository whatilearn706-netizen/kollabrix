'use client';

import React from 'react';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { Layers } from 'lucide-react';

export default function LoginPage() {
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
            Log in to TeamForge
          </h1>
          <p className="text-xs text-slate-400">
            Welcome back! Connect with your collegiate team and explore new projects.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750/80 p-6 sm:p-8 shadow-elevated">
          <LoginForm redirectUrl="/explore" />
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have a student account yet?{' '}
          <Link href="/signup" className="font-semibold text-brand-400 hover:text-brand-300">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
