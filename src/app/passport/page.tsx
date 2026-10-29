'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  Layers,
  ArrowRight,
  RotateCw,
  Terminal,
  Clock,
  Flame,
  Radio,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { HolographicPassportCard } from '@/components/passport/HolographicPassportCard';
import { DeveloperPassport, FlightRecorderConfig, SAMPLE_MAYANK_PASSPORT, DEFAULT_FLIGHT_RECORDER_CONFIG } from '@/types/flightRecorder';
import { useAuth } from '@/components/auth/AuthProvider';

export default function PassportShowcasePage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<FlightRecorderConfig>(DEFAULT_FLIGHT_RECORDER_CONFIG);
  const [passport, setPassport] = useState<DeveloperPassport>(SAMPLE_MAYANK_PASSPORT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resConfig, resPass] = await Promise.all([
          fetch('/api/flight-recorder/config', { cache: 'no-store' }),
          fetch('/api/flight-recorder/passport', { cache: 'no-store' }),
        ]);

        const dataConfig = await resConfig.json();
        if (dataConfig.config) setConfig(dataConfig.config);

        const dataPass = await resPass.json();
        if (dataPass.passport) setPassport(dataPass.passport);
      } catch (err) {
        console.warn('Passport showcase load note:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isLive = Boolean(config.is_live);

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-rose-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Top Announcement Pill */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border shadow-sm transition-all bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-cyan-500/10 border-rose-500/30 text-rose-400">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>
              {isLive
                ? 'VERIFIED HACKATHON FLIGHT RECORDER &bull; LIVE ON KOLLABRIX'
                : 'FLIGHT RECORDER LAB &bull; STAGING PROTOCOL'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            The "Proof-of-Carry" Holographic Passport
          </h1>

          <p className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Autonomous hackathon sprint telemetry recorder. Cryptographically verifies who actually engineered the codebase, stepped up under 4 AM deadline pressure, and stayed 100% committed.
          </p>
        </div>

        {/* Staging Notice Banner (Only shown if is_live is false) */}
        {!isLive && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 shrink-0">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Admin Staging & Quality Calibration Active
                </h4>
                <p className="text-[11px] text-amber-300/80 mt-0.5">
                  This feature is currently configured in staging mode in the Admin Control Center. You can test the 3D physics and telemetry preview below.
                </p>
              </div>
            </div>

            <Link
              href="/control-center-7x9?tab=flight_recorder"
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-mono font-bold text-xs shrink-0 transition-colors shadow-md flex items-center gap-1.5"
            >
              <span>Admin Toggle</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Center Stage: Interactive 3D Card */}
        <div className="flex flex-col items-center justify-center py-4">
          <HolographicPassportCard passport={passport} interactive={true} compact={false} />
        </div>

        {/* Feature Explainer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-charcoal-900/80 border border-charcoal-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Clutch Rating (1-5 AM Crunch)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitors Git commit timestamps and velocity during high-stakes deadline hours. Proves you delivered the critical features when the pressure was highest.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-charcoal-900/80 border border-charcoal-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero-Ghost Peer Endorsements</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Confidential, blind teammate reviews at sprint completion. No fake recommendations or trading favors—only authentic sign-offs from peers in the trenches.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-charcoal-900/80 border border-charcoal-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Architectural Footprint</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exact telemetry on which layers you built (Backend, WebSockets, Compiler, UI). Clean, undeniable proof for tech recruiters and future hackathon squad leads.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-8 border-t border-charcoal-800/80">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs font-mono shadow-xl shadow-rose-950/50 transition-all"
          >
            <span>Explore Active Collegiate Hackathons & Projects</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
