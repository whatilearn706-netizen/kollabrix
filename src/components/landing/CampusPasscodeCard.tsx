'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CampusPasscodeCard() {
  const router = useRouter();
  const [quickPasscode, setQuickPasscode] = useState('');

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasscode.trim()) return;
    const clean = quickPasscode
      .replace(/.*\/h\//, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();
    if (clean) {
      router.push(`/h/${clean}`);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-200/80 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Collegiate Portal Access</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Department Challenges &amp; Private Hackathons
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal">
            Have a passcode from your professor, club lead, or hackathon organizer? Enter it to access private problem statements.
          </p>
        </div>

        {/* Passcode Quick Entry Card */}
        <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Enter Event or Passcode
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold uppercase">
                Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Direct access to whitelisted collegiate problem statements and team formation.
            </p>
          </div>

          <form onSubmit={handleQuickJoin} className="flex items-center gap-2 flex-1 sm:max-w-sm">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickPasscode}
                onChange={(e) => setQuickPasscode(e.target.value)}
                placeholder="e.g. col-apex26"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-slate-900 dark:focus:border-white/30 transition-colors shadow-2xs"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white shrink-0 font-bold py-2.5 px-5 shadow-2xs rounded-xl"
            >
              Unlock
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
