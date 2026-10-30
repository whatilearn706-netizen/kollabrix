'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, KeyRound, Wrench, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MaintenanceModeConfig, DEFAULT_MASTER_CONTROL_CONFIG } from '@/types/masterControl';

export function MaintenanceModeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [maintenance, setMaintenance] = useState<MaintenanceModeConfig>(DEFAULT_MASTER_CONTROL_CONFIG.maintenance);
  const [passcodeAttempt, setPasscodeAttempt] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check session unlock state
    try {
      const storedS = sessionStorage.getItem('linkora_maintenance_unlocked');
      if (storedS === 'true') {
        setIsUnlocked(true);
      }
    } catch (e) {}

    const checkMode = async (force = false) => {
      // Check cache validity (10 minutes) unless forced by explicit update event
      if (!force && typeof window !== 'undefined') {
        try {
          const lastFetched = sessionStorage.getItem('linkora_maintenance_ts');
          if (lastFetched && Date.now() - parseInt(lastFetched, 10) < 600000) {
            return;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch('/api/master-control', {
          next: { revalidate: 300 },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.maintenance) {
            setMaintenance(data.config.maintenance);
            try {
              sessionStorage.setItem('linkora_maintenance_ts', String(Date.now()));
            } catch (e) {}
          }
        }
      } catch (e) {}
    };

    checkMode();
    const interval = setInterval(() => checkMode(false), 600000);

    const handleUpdate = () => checkMode(true);
    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  // Always allow API routes and internal control routes through
  if (pathname?.startsWith('/api/') || pathname?.includes('control-center')) {
    return <>{children}</>;
  }

  // If public mode, pass through
  if (!mounted || maintenance.mode === 'public') {
    return <>{children}</>;
  }

  // If already unlocked via passcode by student or visitor
  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const target = (maintenance.campusPasscode || 'CAMPUS2026').trim().toLowerCase();
    const entered = passcodeAttempt.trim().toLowerCase();

    const isMatch = entered && entered === target;

    if (isMatch) {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('linkora_maintenance_unlocked', 'true');
        localStorage.setItem('linkora_maintenance_unlocked', 'true');
        document.cookie = 'linkora_maintenance_unlocked=true; path=/; max-age=86400; SameSite=Lax';
      } catch (e) {}
    } else {
      setErrorMsg('Incorrect campus passcode. Please check with your campus event coordinator.');
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
              'Kollabrix is currently undergoing scheduled platform updates for college project matching.'}
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
      </div>
    </div>
  );
}
