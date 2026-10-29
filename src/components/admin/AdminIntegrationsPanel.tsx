'use client';

import React, { useState, useEffect } from 'react';
import { Mail, BarChart3, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

export function AdminIntegrationsPanel() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/integrations-status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn('Failed to fetch integration status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/admin/integrations-status?testEmail=${encodeURIComponent(testEmailInput.trim())}`);
      const json = await res.json();
      setTestResult(json.testEmailDelivery || { success: false, error: 'Unknown response' });
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-6">
      <div className="border-b border-charcoal-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block mb-2">
            CORE INTEGRATIONS
          </span>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Production API Keys & Delivery Status</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time verification of Resend transactional email delivery, PostHog product telemetry, and collegiate background workers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStatus}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 text-xs font-mono font-bold border border-charcoal-700 transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. RESEND TRANSACTIONAL EMAIL */}
        <div className="p-5 rounded-2xl bg-charcoal-950/70 border border-charcoal-800/80 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Resend Email Engine</h4>
                <p className="text-[11px] text-slate-400 font-mono">RESEND_API_KEY</p>
              </div>
            </div>

            {data?.resend?.status === 'connected' ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ONLINE
              </span>
            ) : data?.resend?.configured ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
                VERIFYING
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                PENDING VERCEL
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {data?.resend?.message || (isLoading ? 'Checking Resend server connectivity...' : 'Key status check pending')}
          </p>

          {data?.resend?.maskedKey && (
            <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Active Key:</span>
              <span className="text-amber-400 font-bold">{data.resend.maskedKey}</span>
            </div>
          )}

          {/* Test Email Form */}
          <form onSubmit={handleSendTestEmail} className="pt-2 border-t border-charcoal-800/80 space-y-2">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Send Live Test Delivery
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="your.email@college.edu"
                className="flex-1 px-3 py-2 rounded-xl bg-charcoal-900 border border-charcoal-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                disabled={isSendingTest || !testEmailInput.trim()}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Test</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-mono border ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {testResult.success
                  ? `✓ Delivery verified! Resend Message ID: ${testResult.messageId || 'Success'}`
                  : `✗ Failed: ${testResult.error || 'Check Resend key'}`}
              </div>
            )}
          </form>
        </div>

        {/* 2. POSTHOG PRODUCT ANALYTICS */}
        <div className="p-5 rounded-2xl bg-charcoal-950/70 border border-charcoal-800/80 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">PostHog Analytics</h4>
                <p className="text-[11px] text-slate-400 font-mono">NEXT_PUBLIC_POSTHOG_KEY</p>
              </div>
            </div>

            {data?.posthog?.configured ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ACTIVE
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                PENDING VERCEL
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {data?.posthog?.message || (isLoading ? 'Checking PostHog configuration...' : 'Config check pending')}
          </p>

          {data?.posthog?.maskedKey ? (
            <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Project Key:</span>
                <span className="text-indigo-400 font-bold">{data.posthog.maskedKey}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Ingest Host:</span>
                <span>{data.posthog.host || 'https://us.i.posthog.com'}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
              <p className="font-bold">Next Steps on Vercel:</p>
              <p className="text-[11px] text-indigo-200/80">
                Add <code className="bg-indigo-950/60 px-1 py-0.5 rounded text-indigo-300">NEXT_PUBLIC_POSTHOG_KEY</code> in Vercel → Project Settings → Environment Variables.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-charcoal-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Session Recording & Heatmaps:</span>
            <span className="text-slate-300 font-bold">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
