'use client';

import React, { useState, useRef } from 'react';
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
  Palette,
  Server,
  FolderKanban,
  StickyNote,
  Sparkles,
  Crown,
  Terminal,
  Code2,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type AdminTab =
  | 'overview'
  | 'master'
  | 'id_verifications'
  | 'feedback'
  | 'leaderboard'
  | 'deadlines'
  | 'spark'
  | 'restricted'
  | 'security'
  | 'hotpatch'
  | 'intent'
  | 'notes'
  | 'users'
  | 'content'
  | 'faculty'
  | 'hackathons'
  | 'icpc'
  | 'theme'
  | 'enterprise'
  | 'explore'
  | 'taxonomy'
  | 'audit';

interface AdminHeaderProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminEmail?: string;
  adminRole?: string;
}

type TabCategory = 'all' | 'master' | 'code' | 'campus' | 'security' | 'settings';

export function AdminHeader({
  currentTab,
  onSelectTab,
  adminEmail,
  adminRole = 'admin',
}: AdminHeaderProps) {
  const [selectedCategory, setSelectedCategory] = useState<TabCategory>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: { id: AdminTab; label: string; icon: any; category: TabCategory }[] = [
    { id: 'master', label: '👑 ALL 6 MASTER CONTROLS', icon: Crown, category: 'master' },
    { id: 'id_verifications', label: '🎓 Student ID Verifications', icon: GraduationCap, category: 'campus' },
    { id: 'hotpatch', label: '🤖 AI Hot-Patch & Code Desk', icon: Code2, category: 'code' },
    { id: 'spark', label: '✨ AI Spark Templates', icon: Sparkles, category: 'code' },
    { id: 'deadlines', label: '⏳ Deadlines Radar', icon: Clock, category: 'campus' },
    { id: 'icpc', label: '⚡ ICPC Arena', icon: Terminal, category: 'campus' },
    { id: 'security', label: '🛡️ WhatsApp Watchdog & Security', icon: ShieldAlert, category: 'security' },
    { id: 'feedback', label: '💬 User Feedback Desk', icon: MessageSquare, category: 'campus' },
    { id: 'leaderboard', label: '🏆 Campus Leaderboard', icon: Trophy, category: 'campus' },
    { id: 'intent', label: '🎯 Intent & Showcase', icon: Sparkles, category: 'master' },
    { id: 'faculty', label: '🔑 Faculty Passcodes', icon: KeyRound, category: 'security' },
    { id: 'hackathons', label: '🏆 Hackathons', icon: Trophy, category: 'campus' },
    { id: 'content', label: '📁 Projects & Problems', icon: FolderKanban, category: 'campus' },
    { id: 'users', label: '👥 User & Team Moderation', icon: Users, category: 'security' },
    { id: 'restricted', label: '🚫 Restricted Mode', icon: ShieldAlert, category: 'code' },
    { id: 'overview', label: '📊 System Overview', icon: Activity, category: 'master' },
    { id: 'notes', label: '📝 Admin Notes & Ideas', icon: StickyNote, category: 'settings' },
    { id: 'theme', label: '🎨 Design & Colors', icon: Palette, category: 'settings' },
    { id: 'enterprise', label: '🏢 Enterprise Setup', icon: Server, category: 'settings' },
    { id: 'explore', label: '🧭 Explore & Featured', icon: Compass, category: 'settings' },
    { id: 'taxonomy', label: '⚙️ Taxonomy & Scoring', icon: Sliders, category: 'settings' },
    { id: 'audit', label: '📜 Audit Logs', icon: FileText, category: 'security' },
  ];

  const categories: { id: TabCategory; label: string }[] = [
    { id: 'all', label: '⚡ All Tabs (22)' },
    { id: 'master', label: '👑 Master & Live' },
    { id: 'code', label: '🤖 Code & HotPatch' },
    { id: 'campus', label: '🏆 Campus & Contests' },
    { id: 'security', label: '🛡️ Security & Access' },
    { id: 'settings', label: '⚙️ Settings & System' },
  ];

  const filteredTabs = selectedCategory === 'all'
    ? tabs
    : tabs.filter((t) => t.category === selectedCategory || t.id === currentTab);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Identity Bar */}
      <div className="rounded-2xl border border-charcoal-750 bg-gradient-to-r from-charcoal-900 via-charcoal-900/95 to-charcoal-950 p-5 md:p-6 shadow-elevated transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-subtle">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Linkora Admin Control Center
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Owner Access
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-charcoal-800 border border-charcoal-700 text-slate-300">
                  {adminEmail || 'goyalmayank142@gmail.com'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative platform moderation, hot-patch deployment desk, directory configuration, and tamper-resistant settings.
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

        {/* Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-charcoal-800/60 scrollbar-none">
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold tracking-tight whitespace-nowrap transition-all ${
                  isCatActive
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-800/50 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Tab Navigation with Smooth Scroll */}
        <div className="relative mt-3">
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth scrollbar-none"
          >
            {filteredTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              const isMaster = tab.id === 'master';

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 select-none ${
                    isActive
                      ? isMaster
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-charcoal-950 font-black shadow-lg ring-2 ring-amber-400 scale-[1.02]'
                        : 'bg-brand-600 text-white shadow-md scale-[1.02]'
                      : isMaster
                      ? 'text-amber-300 bg-amber-500/15 border border-amber-500/50 hover:bg-amber-500/25 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-800/80 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive && isMaster
                        ? 'text-charcoal-950'
                        : isActive
                        ? 'text-white'
                        : isMaster
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{tab.label}</span>
                  {isMaster && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
