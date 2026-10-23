'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Gift,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Cloud,
  Code2,
  Globe,
  Palette,
  Check,
  ChevronRight,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { STUDENT_PERKS } from '@/data/studentPerks';
import { StudentPerk, PerkCategory } from '@/types/perks';
import { Button } from '@/components/ui/Button';
import { ResourcesSubNav } from '@/components/resources/ResourcesSubNav';

export function PerksVault({ isAdminPreview = false }: { isAdminPreview?: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PerkCategory>('all');
  const [claimedPerkIds, setClaimedPerkIds] = useState<Set<string>>(() => new Set());
  const [activeModalPerk, setActiveModalPerk] = useState<StudentPerk | null>(null);

  // Load claimed perks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('linkora_claimed_perks');
      if (stored) {
        setClaimedPerkIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  // Toggle claimed status
  const toggleClaimed = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClaimedPerkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('linkora_claimed_perks', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Filtered perks
  const filteredPerks = useMemo(() => {
    return STUDENT_PERKS.filter((perk) => {
      const matchesCategory =
        selectedCategory === 'all' || perk.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        perk.title.toLowerCase().includes(q) ||
        perk.provider.toLowerCase().includes(q) ||
        perk.shortDescription.toLowerCase().includes(q) ||
        perk.highlights.some((h) => h.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  // Total claimed value calculation
  const totalValueClaimed = useMemo(() => {
    return STUDENT_PERKS.filter((p) => claimedPerkIds.has(p.id)).reduce(
      (sum, p) => sum + p.valueNumeric,
      0
    );
  }, [claimedPerkIds]);

  const categories: { id: PerkCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'All Perks (8)', icon: Sparkles },
    { id: 'cloud', label: 'Cloud & Database', icon: Cloud },
    { id: 'devtools', label: 'IDEs & Dev Tools', icon: Code2 },
    { id: 'domains', label: 'Free Domains & SSL', icon: Globe },
    { id: 'design', label: 'Design & Productivity', icon: Palette },
  ];

  return (
    <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 py-8 space-y-10">
      {/* Top Resources Sub-Navigation Hub */}
      <ResourcesSubNav />

      {/* Admin Preview Notice */}
      {isAdminPreview && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>ADMIN PREVIEW MODE — This module is currently set to HIDDEN in Master Control.</span>
          </div>
          <span className="font-bold uppercase tracking-wider text-[10px]">Unpublished Draft</span>
        </div>
      )}

      {/* Hero Stage with Stats Pill */}
      <div className="space-y-6 text-center max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
          <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Verified Student Privileges • 100% Free with College ID</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Campus Student Perks & <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Free Credits Vault</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Over $14,000+ in enterprise developer tools, free cloud credits, AI subscriptions, and custom portfolio domains reserved exclusively for collegiate builders.
        </p>

        {/* Claimed Tracker Card */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-charcoal-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Your Unlocked Student Value
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  ${totalValueClaimed.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  / $4,500+ direct + $10K pack value
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                {claimedPerkIds.size} of {STUDENT_PERKS.length} Claimed
              </span>
              <div className="w-24 sm:w-32 h-2.5 rounded-full bg-slate-100 dark:bg-charcoal-800 overflow-hidden border border-slate-200/80 dark:border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (claimedPerkIds.size / STUDENT_PERKS.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student perks by provider (AWS, GitHub, JetBrains, Figma)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-charcoal-900/90 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-white/80 dark:bg-charcoal-900/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPerks.map((perk) => {
          const isClaimed = claimedPerkIds.has(perk.id);

          return (
            <div
              key={perk.id}
              className={`p-6 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-5 relative group overflow-hidden ${
                isClaimed
                  ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs'
                  : 'bg-white/85 dark:bg-charcoal-900/85 backdrop-blur-md border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 hover:shadow-lg'
              }`}
            >
              {/* Top Meta Bar */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {perk.provider}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {perk.value}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {perk.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {perk.shortDescription}
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-white/5 text-xs">
                {perk.highlights.slice(0, 3).map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{h}</span>
                  </div>
                ))}
              </div>

              {/* Requirements & Action Buttons */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono">Verification: {perk.difficulty.toUpperCase()}</span>
                  <button
                    type="button"
                    onClick={(e) => toggleClaimed(perk.id, e)}
                    className={`inline-flex items-center gap-1.5 font-bold font-mono text-xs transition-colors ${
                      isClaimed
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isClaimed ? 'stroke-[3]' : 'opacity-60'}`} />
                    <span>{isClaimed ? 'Claimed' : 'Mark Claimed'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveModalPerk(perk)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white text-xs font-bold transition-colors text-center"
                  >
                    Claim Guide
                  </button>

                  <a
                    href={perk.claimUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>Claim Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Guide Modal */}
      {activeModalPerk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModalPerk(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {activeModalPerk.provider} • {activeModalPerk.value}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                How to Claim: {activeModalPerk.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {activeModalPerk.shortDescription}
              </p>
            </div>

            {/* Prerequisites */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200/80 dark:border-white/5 space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Prerequisites & Eligibility
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {activeModalPerk.requirements}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Step-by-Step Walkthrough</h4>
              <div className="space-y-3">
                {activeModalPerk.stepByStepGuide.map((step) => (
                  <div key={step.step} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div className="space-y-1 text-xs">
                      <h5 className="font-bold text-slate-900 dark:text-white">{step.title}</h5>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro-Tips */}
            {activeModalPerk.proTips.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Campus Pro-Tips to Prevent Verification Rejection</span>
                </div>
                <ul className="text-xs text-amber-900/90 dark:text-amber-200/90 space-y-1 pl-5 list-disc">
                  {activeModalPerk.proTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => toggleClaimed(activeModalPerk.id)}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                  claimedPerkIds.has(activeModalPerk.id)
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{claimedPerkIds.has(activeModalPerk.id) ? 'Claimed ($' + activeModalPerk.valueNumeric + ')' : 'Mark as Claimed'}</span>
              </button>

              <a
                href={activeModalPerk.claimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Open Official Claim Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
