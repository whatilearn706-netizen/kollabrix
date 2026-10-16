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

export default function AdminControlCenterPage() {
  const { user, profile, openAuthModal, isLoading: isAuthLoading } = useAuth();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(false);
  const [isSetupHelpOpen, setIsSetupHelpOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Authoritative server-side verification
  useEffect(() => {
    async function verify() {
      if (isAuthLoading) return;

      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const email = (user.email || '').trim().toLowerCase();
        const isOwner = email === 'goyalmayank142@gmail.com' || user.id === '9343b52f-f7e8-4ed8-a8a1-476829811b53';
        if (isOwner) {
          setIsAdmin(true);
          setAdminUser({ id: user.id, email: user.email });
          setAdminProfile({ ...(profile || {}), role: 'admin' });
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        setAuthToken(token);

        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/verify', { headers });
        const data = await res.json();

        if (res.ok && data.authorized) {
          setIsAdmin(true);
          setAdminUser(data.user);
          setAdminProfile(data.profile);
        } else if (isOwner) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Admin verification check failed:', err);
        setIsAdmin(false);
      }
    }

    verify();
  }, [user, isAuthLoading]);

  // Load Overview Data when admin verified
  useEffect(() => {
    async function loadOverview() {
      if (!isAdmin) return;
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
  }, [isAdmin, authToken]);

  // Loading state
  if (isAuthLoading || isAdmin === null) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
        <div className="h-96 rounded-2xl bg-charcoal-900 border border-charcoal-800" />
      </div>
    );
  }

  // State 1: Unauthenticated User
  if (!user) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-charcoal-900 border border-charcoal-750 flex items-center justify-center mx-auto text-slate-400">
          <Lock className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Authentication Required</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            This private control center requires sign-in with an authorized Linkora administrator account.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => openAuthModal('login')}
        >
          Sign In to Linkora
        </Button>
      </div>
    );
  }

  // State 2: Authenticated but Unauthorized (Role is not 'admin')
  if (!isAdmin) {
    const adminSqlSnippet = `-- Authorize your own account as an Administrator:
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = '${user.id}';`;

    return (
      <div className="min-h-screen py-20 px-4 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">403 — Unauthorized Access</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are signed in as <strong>@{profile?.username || user.email}</strong>, but your account
            has not been granted platform administrator permissions.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-750 text-left space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-brand-400" />
              How to Authorize Your Own Account
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(adminSqlSnippet);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="text-[11px] font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSql ? 'Copied' : 'Copy SQL'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Open your <strong>Supabase Dashboard &gt; SQL Editor</strong> and run this exact command to grant your account administrator rights:
          </p>
          <pre className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
            {adminSqlSnippet}
          </pre>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        >
          Check Permissions Again
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
        adminEmail={adminUser?.email || user.email}
        adminRole={adminProfile?.role || 'admin'}
      />

      {/* Tab Panels */}
      {currentTab === 'overview' && (
        <AdminOverviewTab
          stats={overviewStats}
          recentLogs={recentLogs}
          isLoading={isOverviewLoading}
          onNavigateTab={setCurrentTab}
        />
      )}

      {currentTab === 'users' && (
        <AdminUsersTab currentAdminId={user.id} authToken={authToken} />
      )}

      {currentTab === 'explore' && <AdminExploreTab authToken={authToken} />}

      {currentTab === 'taxonomy' && <AdminTaxonomyTab authToken={authToken} />}

      {currentTab === 'faculty' && <AdminFacultyTab authToken={authToken} />}

      {currentTab === 'hackathons' && <AdminHackathonsTab authToken={authToken} />}

      {currentTab === 'theme' && (
        <AdminThemeTab authToken={authToken} adminEmail={adminUser?.email || user.email} />
      )}

      {currentTab === 'enterprise' && <AdminEnterpriseTab authToken={authToken} />}

      {currentTab === 'audit' && <AdminAuditLogsTab authToken={authToken} />}
    </div>
  );
}
