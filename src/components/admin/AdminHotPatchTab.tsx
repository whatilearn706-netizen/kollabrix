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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { HotPatchConfig } from '@/app/api/admin/hotpatch/route';

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
    async function loadHotpatch() {
      try {
        const res = await fetch('/api/admin/hotpatch');
        const data = await res.json();
        if (data.success && data.hotpatch) {
          setEnabled(data.hotpatch.enabled ?? true);
          setCustomCss(data.hotpatch.customCss || '');
          setCustomJs(data.hotpatch.customJs || '');
          setTopBannerText(data.hotpatch.topBannerText || '');
          setTopBannerBg(data.hotpatch.topBannerBg || '#0284c7');
          if (data.hotpatch.updatedAt) {
            setLastUpdated(new Date(data.hotpatch.updatedAt).toLocaleTimeString());
          }
        }
      } catch (err) {
        console.warn('Could not load hotpatch:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHotpatch();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/hotpatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotpatch: {
            enabled,
            customCss,
            customJs,
            topBannerText,
            topBannerBg,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setLastUpdated(new Date().toLocaleTimeString());
        try {
          localStorage.setItem('linkora_hotpatch_v1', JSON.stringify(data.hotpatch));
          window.dispatchEvent(new Event('linkora_hotpatch_updated'));
        } catch (e) {}
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.warn('Failed to save hotpatch:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyExternalAiPrompt = () => {
    const prompt = `I am the administrator of Linkora (a Next.js collegiate web platform).
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
              placeholder={`// Safe JavaScript snippet\nconsole.log("Linkora Live AI Hotpatch active");`}
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

            <Button
              size="md"
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs"
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
