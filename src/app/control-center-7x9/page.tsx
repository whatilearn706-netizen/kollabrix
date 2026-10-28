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
import { AdminIcpcTab } from '@/components/admin/AdminIcpcTab';
import { AdminSecurityWatchdogTab } from '@/components/admin/AdminSecurityWatchdogTab';
import { AdminHotPatchTab } from '@/components/admin/AdminHotPatchTab';
import { AdminFeedbackTab } from '@/components/admin/AdminFeedbackTab';
import { AdminLeaderboardTab } from '@/components/admin/AdminLeaderboardTab';
import { AdminDeadlinesTab } from '@/components/admin/AdminDeadlinesTab';
import { AdminSparkTab } from '@/components/admin/AdminSparkTab';
import { AdminResourcesTab } from '@/components/admin/AdminResourcesTab';

export default function AdminControlCenterPage() {
  const { user, profile, openAuthModal, isLoading: isAuthLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('linkora_cc_auth_v7');
      if (stored === 'true') return true;
    }
    return null;
  });
  const [authToken, setAuthToken] = useState<string | undefined>();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<AdminTab>('master');
  const [masterSubTab, setMasterSubTab] = useState<'all' | 'templates' | 'restricted' | 'workspace' | 'banner' | 'sections' | 'colleges' | 'badges' | 'ceo' | 'maintenance'>('all');
  const [visitedTabs, setVisitedTabs] = useState<Set<AdminTab>>(() => new Set<AdminTab>(['master']));
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isSetupHelpOpen, setIsSetupHelpOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Track visited tabs so tab transitions are 0ms instant without remounting lag
  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(currentTab)) return prev;
      const next = new Set(prev);
      next.add(currentTab);
      return next;
    });
  }, [currentTab]);

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

  // Grant admin UI access only after server-side session verification.
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (isAuthLoading) return;

      if (!user) {
        setIsAdmin(false);
        setAdminUser(null);
        setAdminProfile(null);
        setAuthToken(undefined);
        try { sessionStorage.removeItem('linkora_cc_auth_v7'); } catch {}
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        if (cancelled) return;

        if (!token) {
          setIsAdmin(false);
          setAuthToken(undefined);
          try { sessionStorage.removeItem('linkora_cc_auth_v7'); } catch {}
          return;
        }

        setAuthToken(token);

        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        const result = await res.json();

        if (cancelled) return;

        if (res.ok && result.authorized === true) {
          setIsAdmin(true);
          setAdminUser(result.user);
          setAdminProfile(result.profile);
          try { sessionStorage.setItem('linkora_cc_auth_v7', 'true'); } catch {}
        } else {
          setIsAdmin(false);
          setAdminUser(null);
          setAdminProfile(null);
          try { sessionStorage.removeItem('linkora_cc_auth_v7'); } catch {}
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setAdminUser(null);
          setAdminProfile(null);
          try { sessionStorage.removeItem('linkora_cc_auth_v7'); } catch {}
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading]);

  // Load Overview Data when overview tab is opened
  useEffect(() => {
    async function loadOverview() {
      if (!isAdmin || currentTab !== 'overview' || overviewStats) return;
      setIsOverviewLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

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
  }, [isAdmin, authToken, currentTab, overviewStats]);

  // Loading state (sleek skeleton without jarring layout shifts)
  if (isAdmin === null || (isAuthLoading && !isAdmin)) {
    return (
      <div className="min-h-screen py-10 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
        <div className="h-96 rounded-2xl bg-charcoal-900/60 border border-charcoal-800" />
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
            Private platform governance suite. Sign in with your authorized administrator account.
          </p>
        </div>

        {user ? (
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-2">
            <p className="text-sm text-slate-200">Administrator access has not been verified for this account ({user.email}).</p>
            <p className="text-xs text-slate-400">Sign in with your authorized platform-owner account and try again.</p>
          </div>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-charcoal-950"
            onClick={() => openAuthModal('login')}
          >
            Sign In with Platform Owner Account
          </Button>
        )}
      </div>
    );
  }


  const unlockSql = `-- Kollabrix Admin Master Control Database Unlock
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
DROP POLICY IF EXISTS "Public can view safe platform settings" ON public.platform_settings;
CREATE POLICY "Public can view safe platform settings" ON public.platform_settings FOR SELECT USING (
    key IN ('explore_config', 'theme_config', 'homepage_config', 'restricted_words', 'deadlines_config', 'community_problem_statements', 'spark_templates_v1', 'linkora_leaderboard_v1', 'site_master_control_config')
    OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can insert platform settings" ON public.platform_settings;
CREATE POLICY "Admins can insert platform settings" ON public.platform_settings FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update platform settings" ON public.platform_settings;
CREATE POLICY "Admins can update platform settings" ON public.platform_settings FOR UPDATE USING (public.is_admin(auth.uid()));`;

  // State 3: Authorized Administrator! Render the Admin Control Center
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Admin Header with Tab Navigation */}
      <AdminHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        adminEmail={adminUser?.email || user?.email || 'Platform Owner'}
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
                ? `Authorized as ${adminUser?.email || user?.email || 'Platform Owner'}. All changes save directly to Supabase PostgreSQL database.`
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

      {/* Smooth, Instant Tab Panels (Keeps visited tabs mounted for 0ms transitions without remounting) */}
      {visitedTabs.has('overview') && (
        <div className={currentTab === 'overview' ? 'block' : 'hidden'}>
          <AdminOverviewTab
            stats={overviewStats}
            recentLogs={recentLogs}
            isLoading={isOverviewLoading}
            onNavigateTab={setCurrentTab}
            onNavigateMasterSubTab={setMasterSubTab}
          />
        </div>
      )}

      {visitedTabs.has('master') && (
        <div className={currentTab === 'master' ? 'block' : 'hidden'}>
          <AdminMasterControlTab authToken={authToken} initialSubTab={masterSubTab} onNavigateTab={setCurrentTab} />
        </div>
      )}

      {visitedTabs.has('feedback') && (
        <div className={currentTab === 'feedback' ? 'block' : 'hidden'}>
          <AdminFeedbackTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('leaderboard') && (
        <div className={currentTab === 'leaderboard' ? 'block' : 'hidden'}>
          <AdminLeaderboardTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('deadlines') && (
        <div className={currentTab === 'deadlines' ? 'block' : 'hidden'}>
          <AdminDeadlinesTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('spark') && (
        <div className={currentTab === 'spark' ? 'block' : 'hidden'}>
          <AdminSparkTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('restricted') && (
        <div className={currentTab === 'restricted' ? 'block' : 'hidden'}>
          <AdminRestrictedWordsTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('security') && (
        <div className={currentTab === 'security' ? 'block' : 'hidden'}>
          <AdminSecurityWatchdogTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('hotpatch') && (
        <div className={currentTab === 'hotpatch' ? 'block' : 'hidden'}>
          <AdminHotPatchTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('intent') && (
        <div className={currentTab === 'intent' ? 'block' : 'hidden'}>
          <AdminIntentShowcaseTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('notes') && (
        <div className={currentTab === 'notes' ? 'block' : 'hidden'}>
          <AdminNotesTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('id_verifications') && (
        <div className={currentTab === 'id_verifications' ? 'block' : 'hidden'}>
          <AdminUsersTab
            currentAdminId={adminUser?.id || user?.id || ''}
            authToken={authToken}
            defaultSubTab="id_verifications"
          />
        </div>
      )}

      {visitedTabs.has('resources') && (
        <div className={currentTab === 'resources' ? 'block' : 'hidden'}>
          <AdminResourcesTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('users') && (
        <div className={currentTab === 'users' ? 'block' : 'hidden'}>
          <AdminUsersTab currentAdminId={adminUser?.id || user?.id || ''} authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('content') && (
        <div className={currentTab === 'content' ? 'block' : 'hidden'}>
          <AdminContentTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('explore') && (
        <div className={currentTab === 'explore' ? 'block' : 'hidden'}>
          <AdminExploreTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('taxonomy') && (
        <div className={currentTab === 'taxonomy' ? 'block' : 'hidden'}>
          <AdminTaxonomyTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('faculty') && (
        <div className={currentTab === 'faculty' ? 'block' : 'hidden'}>
          <AdminFacultyTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('hackathons') && (
        <div className={currentTab === 'hackathons' ? 'block' : 'hidden'}>
          <AdminHackathonsTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('icpc') && (
        <div className={currentTab === 'icpc' ? 'block' : 'hidden'}>
          <AdminIcpcTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('theme') && (
        <div className={currentTab === 'theme' ? 'block' : 'hidden'}>
          <AdminThemeTab authToken={authToken} adminEmail={adminUser?.email || user?.email || 'Platform Owner'} />
        </div>
      )}

      {visitedTabs.has('enterprise') && (
        <div className={currentTab === 'enterprise' ? 'block' : 'hidden'}>
          <AdminEnterpriseTab authToken={authToken} />
        </div>
      )}

      {visitedTabs.has('audit') && (
        <div className={currentTab === 'audit' ? 'block' : 'hidden'}>
          <AdminAuditLogsTab authToken={authToken} />
        </div>
      )}

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
