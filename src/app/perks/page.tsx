'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, Lock, ArrowRight, Sparkles, Compass } from 'lucide-react';
import { PerksVault } from '@/components/perks/PerksVault';
import { useAuth } from '@/components/auth/AuthProvider';
import { MasterControlConfig, DEFAULT_MASTER_CONTROL_CONFIG } from '@/types/masterControl';

export default function PerksPage() {
  const { user, profile } = useAuth();
  const [config, setConfig] = useState<MasterControlConfig>(DEFAULT_MASTER_CONTROL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin =
    profile?.role === 'admin' ||
    user?.email?.toLowerCase().includes('whatilearn706') ||
    user?.email?.toLowerCase().includes('admin');

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/master-control');
        if (res.ok) {
          const data = await res.json();
          if (data?.config) {
            setConfig(data.config);
          }
        }
      } catch (e) {
        console.warn('Failed to load perks config:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const isLive = config.studentTools?.perksVault ?? true;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If feature is disabled by admin in Master Control and visitor is not an Admin
  if (!isLive && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Kollabrix Campus Vault
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Student Perks Vault Coming Soon
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our campus ambassadors are currently negotiating exclusive collegiate grants and cloud credits. This vault will be unveiled soon.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-md hover:bg-black dark:hover:bg-slate-100 transition-all w-full"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Active Projects Meanwhile</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <PerksVault isAdminPreview={!isLive && isAdmin} />;
}
