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
  const [isPreviewingAsVisitor, setIsPreviewingAsVisitor] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if URL query has preview_maintenance flag
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('preview_maintenance') === 'true') {
        setIsPreviewingAsVisitor(true);
      }
    }

    // Check session unlock state
    try {
      const storedS = sessionStorage.getItem('linkora_maintenance_unlocked');
      if (storedS === 'true') {
        setIsUnlocked(true);
      }
    } catch (e) {}

    const checkMode = async () => {
      try {
        const res = await fetch(`/api/master-control?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.maintenance) {
            setMaintenance(data.config.maintenance);
          }
        }
      } catch (e) {}
    };

    checkMode();
    const interval = setInterval(checkMode, 60000);

    const handleUpdate = () => checkMode();
    window.addEventListener('focus', checkMode);
    window.addEventListener('visibilitychange', checkMode);
    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkMode);
      window.removeEventListener('visibilitychange', checkMode);
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  // Handler to turn off maintenance mode and restore public access
  const handleTurnOffMaintenance = async () => {
    setIsDeactivating(true);
    try {
      const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') || '' : '';
      const updatedM: MaintenanceModeConfig = { ...maintenance, mode: 'public' };
      setMaintenance(updatedM);
      setIsPreviewingAsVisitor(false);

      try {
        const cached = localStorage.getItem('linkora_master_control_v1');
        const parsed = cached ? JSON.parse(cached) : {};
        const newFull = { ...parsed, maintenance: updatedM };
        localStorage.setItem('linkora_master_control_v1', JSON.stringify(newFull));
        document.cookie = `linkora_master_control_config=${encodeURIComponent(JSON.stringify(newFull))}; path=/; max-age=31536000; SameSite=Lax`;
        window.dispatchEvent(new Event('linkora_master_control_updated'));
      } catch (e) {}

      await fetch('/api/admin/master-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-passcode': savedPasscode,
        },
        body: JSON.stringify({ config: { maintenance: updatedM } }),
      });
    } catch (e) {
      console.warn('Turn off maintenance error:', e);
    } finally {
      setIsDeactivating(false);
    }
  };

  // Always allow admin routes through so administrators are never locked out
  if (pathname?.startsWith('/control-center-7x9') || pathname?.startsWith('/admin') || pathname?.startsWith('/api/')) {
    return <>{children}</>;
  }

  // Bypass if user is logged in as an admin or platform owner
  const isOwner = user?.email?.toLowerCase() === 'goyalmayank142@gmail.com' || user?.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508';
  const isAdminUser = profile?.role === 'admin' || isOwner;

  // If public mode, pass through
  if (!mounted || maintenance.mode === 'public') {
    return <>{children}</>;
  }

  // If user is Admin and NOT testing lock screen view as visitor:
  if (isAdminUser && !isPreviewingAsVisitor) {
    return (
      <>
        {/* Floating Admin Banner showing Maintenance is Active */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-2.5 text-xs font-bold sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 shadow-elevated border-b border-red-700 animate-fadeIn">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 animate-pulse text-amber-200 shrink-0" />
            <span>
              🚨 EMERGENCY GATE ACTIVE: Linkora is currently in <strong>{maintenance.mode === 'campus_only' ? 'Campus-Only Passcode Mode' : 'Scheduled Maintenance Mode'}</strong>. Regular visitors see the lock screen. You have administrator bypass.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isDeactivating}
              onClick={handleTurnOffMaintenance}
              className="px-3 py-1 bg-white text-charcoal-950 font-black rounded-xl hover:bg-slate-100 transition-colors shadow-2xs text-xs cursor-pointer"
            >
              {isDeactivating ? 'Restoring...' : '🟢 Deactivate & Set Public'}
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewingAsVisitor(true)}
              className="px-3 py-1 bg-charcoal-900/70 text-white font-bold rounded-xl hover:bg-charcoal-900 transition-colors text-xs border border-white/20 cursor-pointer"
            >
              👁️ Test Lock Screen as Visitor
            </button>
          </div>
        </div>
        {children}
      </>
    );
  }

  // If already unlocked via passcode by student or visitor
  if (isUnlocked && !isPreviewingAsVisitor) {
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
      setIsPreviewingAsVisitor(false);
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
      {/* Exit visitor preview button for Admin */}
      {isAdminUser && isPreviewingAsVisitor && (
        <div className="absolute top-4 left-4 z-50">
          <button
            type="button"
            onClick={() => setIsPreviewingAsVisitor(false)}
            className="px-4 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-amber-300 font-bold rounded-xl text-xs border border-charcoal-700 shadow-elevated"
          >
            ← Exit Lock Screen Preview & Return to Full Site
          </button>
        </div>
      )}
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
      </div>
    </div>
  );
}
