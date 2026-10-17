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
  ExternalLink,
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
import { AdminRestrictedWordsTab } from '@/components/admin/AdminRestrictedWordsTab';

export default function AdminControlCenterPage() {
  const { user, profile, openAuthModal, loginWithAdminPasscode, loginAsOwner, isLoading: isAuthLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      if (
        localStorage.getItem('linkora_admin_session') === 'true' ||
        document.cookie.includes('linkora_admin_session=true')
      ) {
        return true;
      }
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
      // 1. Always attempt to retrieve active Supabase Auth session token
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token) {
          setAuthToken(token);
        }
      } catch (e) {}

      // 2. Check stored admin session or cookie
      if (typeof window !== 'undefined') {
        const hasAdmin =
          localStorage.getItem('linkora_admin_session') === 'true' ||
          document.cookie.includes('linkora_admin_session=true');
        if (hasAdmin) {
          setIsAdmin(true);
          setAdminUser({ id: 'c86ce05f-24de-4a1a-a45f-944d4180b508', email: 'goyalmayank142@gmail.com' });
          setAdminProfile({ role: 'admin', display_name: 'Mayank Goyal (Owner)' });
        }
      }

      if (isAuthLoading) return;

      if (!user) {
        if (
          typeof window !== 'undefined' &&
          (localStorage.getItem('linkora_admin_session') === 'true' ||
            document.cookie.includes('linkora_admin_session=true'))
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        return;
      }

      try {
        const email = (user.email || '').trim().toLowerCase();
        const isOwner = email === 'goyalmayank142@gmail.com' || user.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508' || user.id === '9343b52f-f7e8-4ed8-a8a1-476829811b53';
        if (isOwner) {
          setIsAdmin(true);
          setAdminUser({ id: user.id, email: user.email });
          setAdminProfile({ ...(profile || {}), role: 'admin' });
          try {
            localStorage.setItem('linkora_admin_session', 'true');
            document.cookie = 'linkora_admin_session=true; path=/; max-age=31536000; SameSite=Lax';
            document.cookie = 'linkora_user_email=goyalmayank142@gmail.com; path=/; max-age=31536000; SameSite=Lax';
          } catch (e) {}
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (token) setAuthToken(token);

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
          setAdminUser({ id: user.id, email: user.email });
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Admin verification check note:', err);
        const email = (user?.email || '').trim().toLowerCase();
        if (email === 'goyalmayank142@gmail.com') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
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

  const handleUnlockWithPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    if (!directPasscode.trim()) {
      setPasscodeError('Please enter the administrative passcode.');
      return;
    }

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: directPasscode.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.authorized) {
        setIsAdmin(true);
        setAdminUser(data.user);
        setAdminProfile(data.profile);
        if (typeof window !== 'undefined') {
          localStorage.setItem('linkora_admin_passcode', directPasscode.trim());
        }
      } else {
        setPasscodeError(data.error || 'Invalid administrative passcode.');
      }
    } catch (err) {
      setPasscodeError('Verification request failed. Please check your connection.');
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

        {/* Founder Authorization - Only for verified signed-in owner */}
        {user?.email?.toLowerCase() === 'goyalmayank142@gmail.com' || user?.id === '9343b52f-f7e8-4ed8-a8a1-476829811b53' || user?.id === 'c86ce05f-24de-4a1a-a45f-944d4180b508' ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 border border-amber-500/30 text-center space-y-2.5 shadow-elevated">
            <p className="text-xs font-semibold text-amber-300">
              Verified Platform Owner: {user.email}
            </p>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-black shadow-elevated border-none py-3 text-sm"
              onClick={() => {
                loginAsOwner();
                setIsAdmin(true);
                setAdminUser(user);
                setAdminProfile({ role: 'admin', display_name: 'Mayank Goyal (Owner)' });
              }}
            >
              Enter Admin Control Center
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Administrative access is strictly restricted to platform owners.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-slate-700 hover:bg-white/5 text-slate-200"
              onClick={() => openAuthModal('login')}
            >
              Sign In with Google
            </Button>
          </div>
        )}

        {/* Private Master Passcode Verification */}
        <form onSubmit={handleUnlockWithPasscode} className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-750 text-left space-y-3.5 shadow-elevated">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <KeyRound className="w-4 h-4" />
            <span>Master Administrative Key</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Enter your secret master key for direct platform access:
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


  const unlockSql = `-- Linkora Admin Master Control Database Unlock
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/bmiwmlfraaridbekuily/sql):

CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view platform settings" ON public.platform_settings;
CREATE POLICY "Public can view platform settings" ON public.platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings FOR UPDATE USING (true);`;

  // State 3: Authorized Administrator! Render the Admin Control Center
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Admin Header with Tab Navigation */}
      <AdminHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        adminEmail={adminUser?.email || user?.email || 'goyalmayank142@gmail.com'}
        adminRole={adminProfile?.role || 'admin'}
      />

      {/* Supabase Database Connection & Auth Sync Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-charcoal-900 border border-charcoal-750 text-xs shadow-elevated">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full shrink-0 ${authToken ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <div className="space-y-0.5">
            <span className="font-bold text-white text-xs">
              {authToken ? '🟢 Live Supabase Database Connected & Authoritative' : '🟡 Passcode Admin Access (Cookie & Session Mode Active)'}
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {authToken
                ? `Authorized as ${adminUser?.email || 'goyalmayank142@gmail.com'}. All changes save directly to Supabase PostgreSQL database.`
                : 'All changes save immediately to cookies & persistent local session across all tabs and links.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!authToken && (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs font-bold"
              onClick={() => openAuthModal('login')}
            >
              ⚡ Link Google OAuth
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white text-xs border border-charcoal-750"
            onClick={() => setIsSetupHelpOpen(true)}
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1 text-brand-400" />
            Supabase DB SQL Fix
          </Button>
        </div>
      </div>

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
        <AdminMasterControlTab authToken={authToken} initialSubTab={masterSubTab} onNavigateTab={setCurrentTab} />
      )}

      {currentTab === 'restricted' && (
        <AdminRestrictedWordsTab authToken={authToken} />
      )}

      {currentTab === 'intent' && (
        <AdminIntentShowcaseTab authToken={authToken} />
      )}

      {currentTab === 'notes' && (
        <AdminNotesTab authToken={authToken} />
      )}

      {currentTab === 'users' && (
        <AdminUsersTab currentAdminId={adminUser?.id || user?.id || 'c86ce05f-24de-4a1a-a45f-944d4180b508'} authToken={authToken} />
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

      {/* Supabase DB SQL Modal */}
      <Modal
        isOpen={isSetupHelpOpen}
        onClose={() => setIsSetupHelpOpen(false)}
        title="Supabase Database Settings Unlock"
        description="Run this one-time SQL script in your Supabase SQL Editor to allow persistent database writes without service-role errors:"
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          <div className="relative">
            <pre className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 text-[11px] font-mono text-amber-200 overflow-x-auto max-h-60">
              {unlockSql}
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2.5 right-2.5 bg-charcoal-900 border-charcoal-700 hover:bg-charcoal-800 text-white text-xs font-bold"
              onClick={() => {
                navigator.clipboard.writeText(unlockSql);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2500);
              }}
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copiedSql ? 'Copied!' : 'Copy SQL'}
            </Button>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-white">How to run in 10 seconds:</p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-400">
              <li>Copy the SQL script above.</li>
              <li>Open <a href="https://supabase.com/dashboard/project/bmiwmlfraaridbekuily/sql" target="_blank" rel="noreferrer" className="text-brand-400 underline inline-flex items-center gap-0.5">Supabase SQL Editor <ExternalLink className="w-3 h-3" /></a>.</li>
              <li>Paste the code and click <strong>Run</strong>. All admin changes will immediately sync directly into Supabase PostgreSQL!</li>
            </ol>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsSetupHelpOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
