'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/explore');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden select-none">
      {/* Ambient Silicon Valley Studio Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-block group mb-2">
            <BrandLogo size="lg" wordmarkColor="light" />
          </Link>
        </div>

        {/* Stratis UI Dark Card */}
        <div className="rounded-2xl bg-[#0c1017]/95 border border-white/[0.1] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] p-7 sm:p-9 text-white relative overflow-hidden">
          {/* Top Hairline Light Reflection */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          <LoginForm redirectUrl="/explore" />
        </div>

        {/* Global Campus Trust Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} Kollabrix • The Collegiate Developer Network</p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/explore" className="hover:text-slate-300 transition-colors">Explore Projects</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
