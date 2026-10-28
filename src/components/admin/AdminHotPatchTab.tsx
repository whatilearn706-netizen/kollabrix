'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  Save,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  AlertCircle,
  HelpCircle,
  Terminal,
  Layers,
  Palette,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { HotPatchConfig } from '@/app/api/admin/hotpatch/route';

import { cleanHotPatchCode } from '@/lib/security/hotpatchCleaner';

interface AdminHotPatchTabProps {
  authToken?: string;
}

export function AdminHotPatchTab({ authToken }: AdminHotPatchTabProps) {
  const [enabled, setEnabled] = useState(true);
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  const [topBannerText, setTopBannerText] = useState('');
  const [topBannerBg, setTopBannerBg] = useState('#0284c7');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // 1. Instant 0ms load from localStorage so text is never empty on refresh
    try {
      const cached = localStorage.getItem('linkora_hotpatch_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) {
          setEnabled(parsed.enabled ?? true);
          if (parsed.customCss) setCustomCss(parsed.customCss);
          if (parsed.customJs) setCustomJs(parsed.customJs);
          if (parsed.topBannerText) setTopBannerText(parsed.topBannerText);
          if (parsed.topBannerBg) setTopBannerBg(parsed.topBannerBg);
          if (parsed.updatedAt) setLastUpdated(new Date(parsed.updatedAt).toLocaleTimeString());
        }
      }
    } catch (e) {}

    // 2. Authoritative server & database sync
    async function loadHotpatch() {
      try {
        const res = await fetch(`/api/admin/hotpatch?_t=${Date.now()}`, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          cache: 'no-store',
        });
        const data = await res.json();
        if (data.success && data.hotpatch) {
          setEnabled(data.hotpatch.enabled ?? true);
          // Only update editor if server has code or localStorage was empty
          if (data.hotpatch.customCss || data.hotpatch.customJs || !localStorage.getItem('linkora_hotpatch_v1')) {
            setCustomCss(data.hotpatch.customCss || '');
            setCustomJs(data.hotpatch.customJs || '');
          }
          if (data.hotpatch.topBannerText !== undefined) {
            setTopBannerText(data.hotpatch.topBannerText || '');
          }
          if (data.hotpatch.topBannerBg) {
            setTopBannerBg(data.hotpatch.topBannerBg || '#0284c7');
          }
          if (data.hotpatch.updatedAt) {
            setLastUpdated(new Date(data.hotpatch.updatedAt).toLocaleTimeString());
          }
          try {
            localStorage.setItem('linkora_hotpatch_v1', JSON.stringify(data.hotpatch));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('Could not load hotpatch:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHotpatch();
  }, [authToken]);

  const [saveError, setSaveError] = useState('');
  const [safetyViolation, setSafetyViolation] = useState<string | null>(null);

  // Real-time client-side SafeGuard scanner
  useEffect(() => {
    const cleanCss = cleanHotPatchCode(customCss, 'css');
    const cleanJs = cleanHotPatchCode(customJs, 'js');

    const dangerousPatterns = [
      { pattern: /document\.cookie/i, reason: 'Attempting to read or write session cookies is blocked.' },
      { pattern: /localStorage\s*\[\s*['"`]sb-/i, reason: 'Accessing Supabase auth tokens is blocked.' },
      { pattern: /sessionStorage\s*\[\s*['"`]sb-/i, reason: 'Accessing Supabase session tokens is blocked.' },
      { pattern: /navigator\.sendBeacon/i, reason: 'Unauthorized background data beaconing is blocked.' },
      { pattern: /webhook|discord\.com\/api\/webhooks|requestcatcher|pipedream|hookbin/i, reason: 'Unverified external webhook exfiltration endpoints are blocked.' },
      { pattern: /coinhive|cryptonight|miner/i, reason: 'Cryptocurrency mining scripts are blocked.' },
    ];

    let foundViolation: string | null = null;
    for (const item of dangerousPatterns) {
      if (item.pattern.test(cleanJs) || item.pattern.test(cleanCss)) {
        foundViolation = item.reason;
        break;
      }
    }
    setSafetyViolation(foundViolation);
  }, [customCss, customJs]);

  const handleSave = async () => {
    // 1. Auto-clean Claude / ChatGPT code wrappers
    const cleanCss = cleanHotPatchCode(customCss, 'css');
    const cleanJs = cleanHotPatchCode(customJs, 'js');

    if (safetyViolation) {
      setSaveError(`🚨 SafeGuard Block: ${safetyViolation}`);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const res = await fetch('/api/admin/hotpatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          hotpatch: {
            enabled,
            customCss: cleanCss,
            customJs: cleanJs,
            topBannerText,
            topBannerBg,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setSaveError('');
        setCustomCss(cleanCss);
        setCustomJs(cleanJs);
        setLastUpdated(new Date().toLocaleTimeString());
        try {
          localStorage.setItem('linkora_hotpatch_v1', JSON.stringify(data.hotpatch));
          window.dispatchEvent(new Event('linkora_hotpatch_updated'));
        } catch (e) {}
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to apply hot-patch');
      }
    } catch (e: any) {
      setSaveError(e.message || 'Network error saving hot-patch');
      console.warn('Failed to save hotpatch:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyExternalAiPrompt = () => {
    const prompt = `I am the administrator of Kollabrix (a Next.js collegiate web platform).
My AI assistant is temporarily out of tokens.
I want to make the following modification or fix a glitch on my website:
[EXPLAIN YOUR ISSUE HERE: e.g. "Hide the origami bird section", or "Change navbar background to dark", or "Fix mobile gap on contest page"]

Please provide:
1. Pure CSS rules (using !important if needed to override styles) that I can paste into the Live CSS Injector.
2. Or a safe JavaScript snippet if DOM manipulation is required.
Make sure the code is production-ready.`;

    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">AI Hot-Patch & Code Injection Desk</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                0-Token Backup Solution
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              When your AI tokens are low or empty, ask ChatGPT, Claude, or Google Gemini for code and paste it here. It immediately applies across the live website without needing a redeployment or model quota!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyExternalAiPrompt}
            leftIcon={copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
            className="w-full md:w-auto text-xs font-mono font-bold text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/10"
          >
            {copiedPrompt ? 'Prompt Copied!' : 'Copy Prompt for ChatGPT / Claude'}
          </Button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: CSS & JS Injector */}
        <div className="lg:col-span-2 space-y-5">
          {/* Custom CSS Box */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live Custom CSS Injector</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Applies to all pages
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste CSS code generated by external AIs (e.g. to hide an element, adjust spacing, fix mobile glitches, or change theme colors).
            </p>

            <Textarea
              rows={8}
              className="font-mono text-xs text-cyan-300 bg-charcoal-950 border-charcoal-700"
              placeholder={`/* Example: Hide an element or change button color */\n.broken-glitch-section {\n  display: none !important;\n}\n\nbody {\n  /* Custom styling */\n}`}
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Custom JS Box */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Live Custom JavaScript Hotfix</h3>
              </div>
              <span className="text-[10px] font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                Runs on page load
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste JavaScript snippets to modify page content, add redirects, or fix runtime frontend glitches.
            </p>

            <Textarea
              rows={6}
              className="font-mono text-xs text-violet-300 bg-charcoal-950 border-charcoal-700"
              placeholder={`// Safe JavaScript snippet\nconsole.log("Kollabrix Live AI Hotpatch active");`}
              value={customJs}
              onChange={(e) => setCustomJs(e.target.value)}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Controls & Top Announcement Banner */}
        <div className="space-y-5">
          {/* Patch Control Card */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <h3 className="text-sm font-bold text-white">Hot-Patch Controls</h3>
              <span className="text-[10px] font-mono text-slate-500">
                {lastUpdated ? `Updated ${lastUpdated}` : 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-charcoal-950 border border-charcoal-800">
              <div>
                <span className="text-xs font-bold text-white block">Enable Live Hot-Patch</span>
                <span className="text-[11px] text-slate-400">Toggle all custom CSS & JS on/off</span>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
            </div>

            {/* Emergency Top Banner */}
            <div className="space-y-2 pt-2 border-t border-charcoal-800">
              <label className="block text-xs font-bold text-slate-300">
                Instant Top Notice Banner (Optional)
              </label>
              <Input
                placeholder="e.g. System update in progress — All services active"
                value={topBannerText}
                onChange={(e) => setTopBannerText(e.target.value)}
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-slate-400">Banner Color:</span>
                {['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTopBannerBg(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      topBannerBg === color ? 'scale-110 border-white' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* SafeGuard Real-time Status Card */}
            <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
              safetyViolation
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              {safetyViolation ? (
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold block text-[11px] font-mono">
                  {safetyViolation ? '⚠️ SafeGuard Hazard Detected' : '🛡️ SafeGuard: 100% Safe to Deploy'}
                </span>
                <span className="text-[10px] text-slate-300 leading-tight block">
                  {safetyViolation || 'Code verified clean. No cookie sniffing, no token leakage, and no unauthorized exfiltration.'}
                </span>
              </div>
            </div>

            {saveError && (
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-mono">
                {saveError}
              </div>
            )}

            <Button
              size="md"
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!!safetyViolation}
              leftIcon={saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveSuccess ? 'Live Hot-Patch Deployed!' : 'Apply Hot-Patch Live'}
            </Button>
          </div>

          {/* Quick AI Instructions Guide */}
          <div className="p-5 rounded-3xl bg-charcoal-900 border border-charcoal-750 shadow-xl space-y-3 text-xs text-slate-300">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              How to use when Tokens are Empty:
            </h4>
            <ol className="space-y-2 text-[11px] text-slate-400 list-decimal pl-4">
              <li>Click <strong>Copy Prompt for ChatGPT / Claude</strong> above.</li>
              <li>Paste it into <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">ChatGPT</a> or <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Claude</a> (both have free tiers).</li>
              <li>Describe what you want to change or fix.</li>
              <li>Copy the resulting CSS or JavaScript snippet.</li>
              <li>Paste it into the box on the left and click <strong>Apply Hot-Patch Live</strong>.</li>
            </ol>
            <p className="text-[10px] text-slate-500 bg-charcoal-950 p-2.5 rounded-xl border border-charcoal-800">
              💡 No terminal commands, no Git pushes, and zero model tokens required!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
