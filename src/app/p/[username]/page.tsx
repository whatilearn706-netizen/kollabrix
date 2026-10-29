'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Check,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { HolographicPassportCard } from '@/components/passport/HolographicPassportCard';
import { DeveloperPassport, SAMPLE_MAYANK_PASSPORT } from '@/types/flightRecorder';

export default function PublicPassportVerificationPage() {
  const params = useParams();
  const username = (params?.username as string) || 'developer';

  const [passport, setPassport] = useState<DeveloperPassport>(SAMPLE_MAYANK_PASSPORT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPassport() {
      try {
        const res = await fetch(`/api/flight-recorder/passport?username=${encodeURIComponent(username)}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.passport) {
          setPassport(data.passport);
        }
      } catch (err) {
        console.warn('Public passport fetch note:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPassport();
  }, [username]);

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KOLLABRIX NETWORK</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              VERIFIED FLIGHT RECORD
            </span>
          </div>
        </div>

        {/* Hero title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COLLEGIATE PROOF-OF-CARRY PASSPORT</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {passport.displayName}'s Engineering Attestation
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Cryptographically sealed by Kollabrix Flight Recorder &bull; {passport.seasonYear}
          </p>
        </div>

        {/* Center: The 3D Card */}
        <div className="flex flex-col items-center justify-center py-2">
          <HolographicPassportCard passport={passport} interactive={true} compact={false} />
        </div>

        {/* Verification Footnote */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Tamper Authenticity Guaranteed</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            This card is tied to real Git commit telemetry and confidential peer attestations during collegiate hackathon sprints on Kollabrix.
          </p>
        </div>

      </div>

      <div className="text-center pt-8 text-[11px] font-mono text-slate-500">
        Kollabrix Collegiate Network &bull; Deployed at kollabrix.in
      </div>
    </div>
  );
}
