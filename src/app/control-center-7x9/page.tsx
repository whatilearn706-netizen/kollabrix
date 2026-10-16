'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Code2,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminHeader, AdminTab } from '@/components/admin/AdminHeader';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminExploreTab } from '@/components/admin/AdminExploreTab';
import { AdminTaxonomyTab } from '@/components/admin/AdminTaxonomyTab';
import { AdminAuditLogsTab } from '@/components/admin/AdminAuditLogsTab';
import { AdminFacultyTab } from '@/components/admin/AdminFacultyTab';
import { AdminHackathonsTab } from '@/components/admin/AdminHackathonsTab';
import { AdminThemeTab } from '@/components/admin/AdminThemeTab';
import { AdminEnterpriseTab } from '@/components/admin/AdminEnterpriseTab';
import { AdminContentTab } from '@/components/admin/AdminContentTab';
import { AdminNotesTab } from '@/components/admin/AdminNotesTab';
import { AdminIntentShowcaseTab } from '@/components/admin/AdminIntentShowcaseTab';
import { AdminMasterControlTab } from '@/components/admin/AdminMasterControlTab';

export default function AdminControlCenterPage() {
  const { user, profile, openAuthModal, loginWithAdminPasscode, isLoading: isAuthLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('linkora_admin_session') === 'true') return true;
    }
    return null;
  });
  const [authToken, setAuthToken] = useState<string | undefined>();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<AdminTab>('master');
  const [masterSubTab, setMasterSubTab] = useState<'all' | 'banner' | 'sections' | 'colleges' | 'badges' | 'ceo' | 'maintenance'>('all');
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isSetupHelpOpen, setIsSetupHelpOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [directPasscode, setDirectPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Parse URL query params (?tab=master&sub=colleges)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab;
      const subParam = params.get('sub') as any;
      if (tabParam) setCurrentTab(tabParam);
      if (subParam) setMasterSubTab(subParam);
    }
  }, []);

  // Authoritative server-side verification with Owner Bypass
  useEffect(() => {
    async function verify() {
      // Check stored admin session
      if (typeof window !== 'undefined' && localStorage.getItem('linkora_admin_session') === 'true') {
        setIsAdmin(true);
        setAdminUser({ id: '9343b52f-f7e8-4ed8-a8a1-476829811b53', email: 'goyalmayank142@gmail.com' });
        setAdminProfile({ role: 'admin', display_name: 'Mayank Goyal (Owner)' });
      }

      if (isAuthLoading) return;

      if (!user) {
        if (typeof window !== 'undefined' && localStorage.getItem('linkora_admin_session') === 'true') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        return;
      }

      try {
        const email = (user.email || '').trim().toLowerCase();
        const isOwner = email === 'goyalmayank142@gmail.com' || user.id === '9343b52f-f7e8-4ed8-a8a1-476829811b53';
        if (isOwner) {
          setIsAdmin(true);
          setAdminUser({ id: user.id, email: user.email });
          setAdminProfile({ ...(profile || {}), role: 'admin' });
          try {
            localStorage.setItem('linkora_admin_session', 'true');
          } catch (e) {}
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        setAuthToken(token);

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
        if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

        const res = await fetch('/api/admin/verify', { headers });
        const data = await res.json();

        if (res.ok && data.authorized) {
          setIsAdmin(true);
          setAdminUser(data.user);
          setAdminProfile(data.profile);
        } else if (isOwner) {
          setIsAdmin(true);
        } else if (localStorage.getItem('linkora_admin_session') === 'true') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Admin verification check note:', err);
        const email = (user?.email || '').trim().toLowerCase();
        if (email === 'goyalmayank142@gmail.com' || localStorage.getItem('linkora_admin_session') === 'true') {
          setIsAdmin(true);
        }
      }
    }

    verify();
  }, [user, isAuthLoading, profile]);

  // Load Overview Data when admin verified
  useEffect(() => {
    async function loadOverview() {
      if (!isAdmin) return;
      setIsOverviewLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const savedPasscode = typeof window !== 'undefined' ? localStorage.getItem('linkora_admin_passcode') : null;
        if (savedPasscode) headers['x-admin-passcode'] = savedPasscode;

        const res = await fetch('/api/admin/overview', { headers });
        const data = await res.json();
        if (res.ok && data.stats) {
          setOverviewStats(data.stats);
          setRecentLogs(data.recentLogs || []);
        }
      } catch (err) {
        console.warn('Error loading overview:', err);
      } finally {
        setIsOverviewLoading(false);
      }
    }

    loadOverview();
  }, [isAdmin, authToken]);

  const handleUnlockWithPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    const clean = directPasscode.trim().toLowerCase();
    if (clean === 'admin7x9' || clean === 'linkora2026') {
      const ok = loginWithAdminPasscode(clean);
      if (ok) {
        setIsAdmin(true);
        setAdminUser({ id: '9343b52f-f7e8-4ed8-a8a1-476829811b53', email: 'goyalmayank142@gmail.com' });
        setAdminProfile({ role: 'admin', display_name: 'Mayank Goyal (Owner)' });
      }
    } else {
      setPasscodeError('Invalid administrative passcode. Please enter your secret key.');
    }
  };

  // Loading state
  if ((isAuthLoading && isAdmin === null)) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
        <div className="h-96 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
      </div>
    );
  }

  // State 1: Unauthenticated User / Locked
  if (!isAdmin) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-elevated">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Center</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Private platform governance suite. Sign in with your administrator account or enter the emergency founder passcode.
          </p>
        </div>

        {/* 1-Click Fast Unlock with Passcode */}
        <form onSubmit={handleUnlockWithPasscode} className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 text-left space-y-3.5 shadow-elevated">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <KeyRound className="w-4 h-4" />
            <span>Fast Founder Passcode Access</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Enter your secret key (e.g. <code className="bg-charcoal-950 px-1 py-0.5 rounded text-amber-300 font-mono">admin7x9</code>) for instant 1-tap god-mode access without OAuth redirects:
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter passcode..."
              value={directPasscode}
              onChange={(e) => setDirectPasscode(e.target.value)}
              className="flex-1 bg-charcoal-950 border border-charcoal-750 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            <Button type="submit" variant="primary" size="sm" className="bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold shrink-0">
              Unlock Studio
            </Button>
          </div>
          {passcodeError && (
            <p className="text-[11px] text-rose-400 font-medium">{passcodeError}</p>
          )}
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-charcoal-800" />
          <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase font-mono">Or via Google Account</span>
          <div className="flex-grow border-t border-charcoal-800" />
        </div>

        <Button
          variant="outline"
          size="md"
          className="w-full border-charcoal-700 hover:bg-charcoal-800 text-white font-bold text-xs"
          onClick={() => openAuthModal('login')}
        >
          Sign In with Google / Supabase
        </Button>
      </div>
    );
  }


  // State 3: Authorized Administrator! Render the Admin Control Center
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header with Tab Navigation */}
      <AdminHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        adminEmail={adminUser?.email || user?.email || 'goyalmayank142@gmail.com'}
        adminRole={adminProfile?.role || 'admin'}
      />

      {/* Tab Panels */}
      {currentTab === 'overview' && (
        <AdminOverviewTab
          stats={overviewStats}
          recentLogs={recentLogs}
          isLoading={isOverviewLoading}
          onNavigateTab={setCurrentTab}
          onNavigateMasterSubTab={setMasterSubTab}
        />
      )}

      {currentTab === 'master' && (
        <AdminMasterControlTab authToken={authToken} initialSubTab={masterSubTab} />
      )}

      {currentTab === 'intent' && (
        <AdminIntentShowcaseTab authToken={authToken} />
      )}

      {currentTab === 'notes' && (
        <AdminNotesTab authToken={authToken} />
      )}

      {currentTab === 'users' && (
        <AdminUsersTab currentAdminId={adminUser?.id || user?.id || '9343b52f-f7e8-4ed8-a8a1-476829811b53'} authToken={authToken} />
      )}

      {currentTab === 'content' && <AdminContentTab authToken={authToken} />}

      {currentTab === 'explore' && <AdminExploreTab authToken={authToken} />}

      {currentTab === 'taxonomy' && <AdminTaxonomyTab authToken={authToken} />}

      {currentTab === 'faculty' && <AdminFacultyTab authToken={authToken} />}

      {currentTab === 'hackathons' && <AdminHackathonsTab authToken={authToken} />}

      {currentTab === 'theme' && (
        <AdminThemeTab authToken={authToken} adminEmail={adminUser?.email || user?.email || 'goyalmayank142@gmail.com'} />
      )}

      {currentTab === 'enterprise' && <AdminEnterpriseTab authToken={authToken} />}

      {currentTab === 'audit' && <AdminAuditLogsTab authToken={authToken} />}
    </div>
  );
}
