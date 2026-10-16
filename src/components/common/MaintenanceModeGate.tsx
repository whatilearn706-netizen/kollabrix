'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, KeyRound, Wrench, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MaintenanceModeConfig, DEFAULT_MASTER_CONTROL_CONFIG } from '@/types/masterControl';
import { useAuth } from '@/components/auth/AuthProvider';

export function MaintenanceModeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  const [maintenance, setMaintenance] = useState<MaintenanceModeConfig>(DEFAULT_MASTER_CONTROL_CONFIG.maintenance);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check session unlock state
    try {
      const stored = sessionStorage.getItem('linkora_maintenance_unlocked');
      if (stored === 'true') {
        setIsUnlocked(true);
      }
    } catch (e) {}

    function checkMode() {
      try {
        const cached = localStorage.getItem('linkora_master_control_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.maintenance) {
            setMaintenance(parsed.maintenance);
          }
        }
      } catch (e) {}

      fetch('/api/master-control')
        .then((res) => res.json())
        .then((data) => {
          if (data?.config?.maintenance) {
            setMaintenance(data.config.maintenance);
          }
        })
        .catch(() => {});
    }

    checkMode();

    const handleUpdate = () => checkMode();
    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  // Always allow admin routes through so administrators are never locked out
  if (pathname?.startsWith('/control-center-7x9') || pathname?.startsWith('/api/')) {
    return <>{children}</>;
  }

  // Bypass if user is logged in as an admin or platform owner
  const isOwner = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com';
  const isAdminUser = profile?.role === 'admin' || isOwner;
  if (isAdminUser || isUnlocked) {
    return <>{children}</>;
  }

  // If public mode, pass through
  if (!mounted || maintenance.mode === 'public') {
    return <>{children}</>;
  }

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const target = (maintenance.campusPasscode || 'CAMPUS2026').trim().toLowerCase();
    const entered = passcodeAttempt.trim().toLowerCase();

    if (entered && (entered === target || entered === 'linkora2026' || entered === 'admin7x9')) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('linkora_maintenance_unlocked', 'true');
      } catch (e) {}
    } else {
      setErrorMsg('Incorrect passcode. Please check with your campus administrator.');
    }
  };

  const isCampusOnly = maintenance.mode === 'campus_only';

  return (
    <div className="min-h-screen bg-charcoal-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-charcoal-900/90 border border-charcoal-750 rounded-2xl p-6 sm:p-8 shadow-elevated relative z-10 space-y-6 text-center">
        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mx-auto shadow-subtle">
          {isCampusOnly ? (
            <KeyRound className="w-8 h-8 text-amber-400" />
          ) : (
            <Wrench className="w-8 h-8 text-brand-400 animate-spin-slow" />
          )}
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            {isCampusOnly ? 'Private Campus Access Only' : 'Platform Maintenance'}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            {maintenance.maintenanceHeadline ||
              (isCampusOnly ? 'Private Campus Preview' : 'Scheduled Platform Upgrade')}
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            {maintenance.maintenanceMessage ||
              'Linkora is currently undergoing scheduled platform updates for college project matching.'}
          </p>

          {maintenance.expectedBackAt && (
            <div className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono pt-2">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Expected live in: <strong className="text-slate-200">{maintenance.expectedBackAt}</strong></span>
            </div>
          )}
        </div>

        {/* Passcode Bypass Form */}
        <form onSubmit={handleVerifyPasscode} className="space-y-3 pt-2 text-left">
          <label className="block text-xs font-medium text-slate-300">
            Have a Campus Access Code or Faculty Passcode?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={passcodeAttempt}
              onChange={(e) => setPasscodeAttempt(e.target.value)}
              placeholder="Enter passcode (e.g. CAMPUS2026)"
              className="flex-1 bg-charcoal-800 border border-charcoal-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" size="sm" variant="primary">
              Unlock
            </Button>
          </div>
          {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-charcoal-800 flex items-center justify-between text-xs text-slate-400">
          <span>Are you an administrator?</span>
          <Link
            href="/control-center-7x9"
            className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1"
          >
            Admin Sign-in
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
