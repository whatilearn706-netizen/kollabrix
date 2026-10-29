'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  Award,
  Layers,
  Check,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Lock,
  Eye,
  Sliders,
  Save,
  Globe,
  Radio,
} from 'lucide-react';
import { HolographicPassportCard } from '@/components/passport/HolographicPassportCard';
import {
  FlightRecorderConfig,
  DEFAULT_FLIGHT_RECORDER_CONFIG,
  DeveloperPassport,
  SAMPLE_MAYANK_PASSPORT,
} from '@/types/flightRecorder';

interface AdminFlightRecorderTabProps {
  authToken?: string;
}

export function AdminFlightRecorderTab({ authToken }: AdminFlightRecorderTabProps) {
  const [config, setConfig] = useState<FlightRecorderConfig>(DEFAULT_FLIGHT_RECORDER_CONFIG);
  const [passport, setPassport] = useState<DeveloperPassport>(SAMPLE_MAYANK_PASSPORT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current config and passport
  const fetchFlightData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [resConfig, resPass] = await Promise.all([
        fetch('/api/flight-recorder/config', { cache: 'no-store' }),
        fetch('/api/flight-recorder/passport', { cache: 'no-store' }),
      ]);

      const dataConfig = await resConfig.json();
      if (dataConfig.config) {
        setConfig(dataConfig.config);
      }

      const dataPass = await resPass.json();
      if (dataPass.passport) {
        setPassport(dataPass.passport);
      }
    } catch (err: any) {
      console.warn('Flight recorder fetch note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightData();
  }, []);

  // Toggle Live vs Draft
  const handleToggleLive = async () => {
    const nextState = !config.is_live;
    setIsSaving(true);
    setErrorMsg('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/flight-recorder/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({ is_live: nextState }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update live status');

      setConfig((prev) => ({ ...prev, is_live: nextState }));
      setSuccessMsg(
        nextState
          ? '🚀 Feature is now LIVE across Kollabrix for all students!'
          : '🔒 Feature switched to STAGING / DRAFT mode (Hidden from public users).'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const [resConfig, resPass] = await Promise.all([
        fetch('/api/flight-recorder/config', {
          method: 'POST',
          headers,
          body: JSON.stringify(config),
        }),
        fetch('/api/flight-recorder/passport', {
          method: 'POST',
          headers,
          body: JSON.stringify(passport),
        }),
      ]);

      if (!resConfig.ok || !resPass.ok) {
        throw new Error('Failed to save settings or passport');
      }

      setSuccessMsg('All Flight Recorder telemetry & settings saved to master config!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Hero Banner & Master Switch */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-charcoal-900 via-charcoal-950 to-slate-900 border border-charcoal-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-rose-400">
              FEATURE LABORATORY & CONTROL
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Flight Recorder & Holographic Developer Passports
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Autonomous hackathon telemetry recorder and 3D "Proof-of-Carry" holographic cards. Control whether this feature is active for public students or kept in internal staging.
          </p>
        </div>

        {/* Big Live / Draft Toggle Control */}
        <div className="p-4 rounded-2xl bg-charcoal-900/90 border border-charcoal-700/80 backdrop-blur-md flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              PUBLIC STATUS
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase flex items-center gap-1.5 ${
                config.is_live
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  config.is_live ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              {config.is_live ? 'LIVE ACROSS SITE' : 'STAGING / DRAFT'}
            </span>
          </div>

          <button
            onClick={handleToggleLive}
            disabled={isSaving}
            className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              config.is_live
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
            }`}
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{config.is_live ? 'Switch to STAGING (Hide from Public)' : 'SWITCH LIVE (Activate on Kollabrix)'}</span>
          </button>

          <p className="text-[10px] text-slate-500 text-center font-mono">
            {config.is_live
              ? 'Currently visible to all collegiate users and profiles.'
              : 'Only accessible in Admin Control Center and Flight Lab.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive 3D Card Sandbox + Live Telemetry Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Real Interactive 3D Card Preview */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-charcoal-900/60 border border-charcoal-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-charcoal-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Live 3D Hardware Render
            </span>
            <span className="text-[10px] font-mono text-rose-400">Drag cursor to tilt &bull; Click to flip</span>
          </div>

          <HolographicPassportCard passport={passport} interactive={true} compact={false} />
        </div>

        {/* Right: Live Telemetry Sandbox Editor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-rose-400" />
                Live Telemetry Sandbox Editor
              </h3>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Telemetry</span>
              </button>
            </div>

            {/* Student Profile Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={passport.displayName}
                  onChange={(e) => setPassport({ ...passport, displayName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
                  Tier Badge Tag
                </label>
                <input
                  type="text"
                  value={passport.tierBadge}
                  onChange={(e) => setPassport({ ...passport, tierBadge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-amber-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
                  Engineering Role Title
                </label>
                <input
                  type="text"
                  value={passport.roleTitle}
                  onChange={(e) => setPassport({ ...passport, roleTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 font-bold mb-1">
                  College Institute
                </label>
                <input
                  type="text"
                  value={passport.college}
                  onChange={(e) => setPassport({ ...passport, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Sliders: Scores */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Clutch Rating (Pressure Delivery)
                  </span>
                  <span className="text-rose-400 font-black text-sm">{passport.clutchFactor}/100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={passport.clutchFactor}
                  onChange={(e) => setPassport({ ...passport, clutchFactor: Number(e.target.value) })}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> Zero-Ghost Reliability
                  </span>
                  <span className="text-emerald-400 font-black text-sm">{passport.peerReliability}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={passport.peerReliability}
                  onChange={(e) => setPassport({ ...passport, peerReliability: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" /> Code Craft (Merge Conflict Free)
                  </span>
                  <span className="text-cyan-400 font-black text-sm">{passport.codeCraft}/100</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={passport.codeCraft}
                  onChange={(e) => setPassport({ ...passport, codeCraft: Number(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> ICPC Proctored Accuracy
                  </span>
                  <span className="text-amber-400 font-black text-sm">{passport.icpcAccuracy}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="0.1"
                  value={passport.icpcAccuracy}
                  onChange={(e) => setPassport({ ...passport, icpcAccuracy: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Code Breakdown Percentages */}
            <div className="pt-3 border-t border-charcoal-800 space-y-3">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Architecture Distribution (%)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">
                    Backend & APIs
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passport.telemetry.backendPercent}
                    onChange={(e) =>
                      setPassport({
                        ...passport,
                        telemetry: { ...passport.telemetry, backendPercent: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                    Realtime / Telemetry
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passport.telemetry.realtimeOrTelemetryPercent}
                    onChange={(e) =>
                      setPassport({
                        ...passport,
                        telemetry: {
                          ...passport.telemetry,
                          realtimeOrTelemetryPercent: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1">
                    Front-End UI
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passport.telemetry.frontendPercent}
                    onChange={(e) =>
                      setPassport({
                        ...passport,
                        telemetry: { ...passport.telemetry, frontendPercent: Number(e.target.value) },
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Rollout Settings */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Integration Touchpoints
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_in_workspace}
                  onChange={(e) => setConfig({ ...config, show_in_workspace: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span className="text-slate-200 font-medium">Show Flight HUD in Hackathon Workspaces</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.show_in_profiles}
                  onChange={(e) => setConfig({ ...config, show_in_profiles: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span className="text-slate-200 font-medium">Render 3D Passports on Student Profiles</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.require_peer_attestations}
                  onChange={(e) =>
                    setConfig({ ...config, require_peer_attestations: e.target.checked })
                  }
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span className="text-slate-200 font-medium">Enforce Blind Peer Review Before Mint</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.allow_public_sharing}
                  onChange={(e) => setConfig({ ...config, allow_public_sharing: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-rose-500"
                />
                <span className="text-slate-200 font-medium">Enable Instagram & LinkedIn Export</span>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
