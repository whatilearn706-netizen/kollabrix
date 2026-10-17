'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { isSupabaseConfigured } from '@/lib/supabase/isConfigured';
import { AlertTriangle, ChevronRight, X, ExternalLink, Key, Database } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function SetupBanner() {
  const { isConfigured } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  if (isSupabaseConfigured() || isConfigured || isDismissed) return null;

  return (
    <>
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="font-semibold text-amber-300">Supabase Setup Required for Live Auth:</strong>{' '}
              Explore mode and demo projects are active. To enable real student accounts and database publishing, configure your Supabase keys.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1 font-medium text-amber-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              Setup Guide
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-amber-400/80 hover:text-amber-200 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="Connect Supabase to Linkora"
        description="Follow these 3 simple steps to enable live database storage and authentication:"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-300 pt-1">
          <div className="p-3.5 rounded-lg bg-charcoal-850 border border-charcoal-750 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <Database className="w-4 h-4 text-brand-400" />
              <span>Step 1: Create a Supabase Project</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Visit <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-400 underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and create a new free PostgreSQL project named <code>linkora</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-charcoal-850 border border-charcoal-750 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <Key className="w-4 h-4 text-brand-400" />
              <span>Step 2: Copy API Keys into .env.local</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              In your Supabase project dashboard, navigate to <strong>Project Settings &rarr; API</strong>. Create a file named <code>.env.local</code> in the root of your project:
            </p>
            <pre className="p-2.5 rounded bg-charcoal-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-charcoal-800">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...`}
            </pre>
          </div>

          <div className="p-3.5 rounded-lg bg-charcoal-850 border border-charcoal-750 space-y-2">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <Database className="w-4 h-4 text-brand-400" />
              <span>Step 3: Run Database Migration</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Open the <strong>SQL Editor</strong> in Supabase, copy the contents of{' '}
              <code>supabase/migrations/20261015000000_phase1_init.sql</code>, and click <strong>Run</strong>.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsGuideOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
