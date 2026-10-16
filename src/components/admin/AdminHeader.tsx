'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Compass,
  Sliders,
  FileText,
  Activity,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Lock,
  KeyRound,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type AdminTab =
  | 'overview'
  | 'users'
  | 'faculty'
  | 'hackathons'
  | 'explore'
  | 'taxonomy'
  | 'audit';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminEmail?: string;
  adminRole?: string;
}

export function AdminHeader({
  currentTab,
  onSelectTab,
  adminEmail,
  adminRole = 'admin',
}: AdminHeaderProps) {
  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: Activity },
    { id: 'users' as AdminTab, label: 'User & Team Moderation', icon: Users },
    { id: 'faculty' as AdminTab, label: 'Faculty Passcodes', icon: KeyRound },
    { id: 'hackathons' as AdminTab, label: 'Hackathons', icon: Trophy },
    { id: 'explore' as AdminTab, label: 'Explore & Featured', icon: Compass },
    { id: 'taxonomy' as AdminTab, label: 'Taxonomy & Match Scoring', icon: Sliders },
    { id: 'audit' as AdminTab, label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Identity Bar */}
      <div className="rounded-2xl border border-charcoal-750 bg-gradient-to-r from-charcoal-900 via-charcoal-900/95 to-charcoal-950 p-6 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-subtle">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Linkora Admin Control Center
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-red-500/15 border border-red-500/30 text-red-300">
                  <Lock className="w-3 h-3" />
                  Private Governance
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-charcoal-800 border border-charcoal-700 text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Admin: {adminEmail || 'Authorized Administrator'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Authoritative platform moderation, dynamic directory configuration, skills taxonomy, and tamper-resistant audit logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/explore">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Public Platform
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-6 border-t border-charcoal-800/80 mt-6 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
