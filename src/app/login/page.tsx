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
          <Link href="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-all">
              <Layers className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Log in to Linkora
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Welcome back! Connect with your collegiate team and explore new projects.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-white border-2 border-slate-200/90 p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />
          <LoginForm redirectUrl="/explore" />
        </div>

        {/* Switch Link */}
        <p className="text-center text-xs sm:text-sm text-slate-600 font-medium">
          Don&apos;t have a student account yet?{' '}
          <Link href="/signup" className="font-bold text-violet-600 hover:text-violet-700 underline underline-offset-2">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
