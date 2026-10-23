'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Type,
  Layout,
  Sliders,
  Sparkles,
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  Eye,
  CheckCircle2,
  Compass,
  Users,
  Trophy,
  Layers,
  Code2,
  Bell,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  SiteThemeConfig,
  DEFAULT_SITE_THEME,
  THEME_PRESETS,
  AVAILABLE_FONTS,
  ThemePreset,
} from '@/types/theme';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

interface AdminThemeTabProps {
  authToken?: string;
  adminEmail?: string;
}

export function AdminThemeTab({ authToken, adminEmail }: AdminThemeTabProps) {
  const { theme: currentGlobalTheme, refreshTheme } = useSiteTheme();
  const [theme, setThemeDraft] = useState<SiteThemeConfig>(currentGlobalTheme);
  const [activeSubTab, setActiveSubTab] = useState<
    'presets' | 'colors' | 'typography' | 'shapes' | 'layout' | 'copy' | 'customCss'
  >('presets');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentGlobalTheme) {
      setThemeDraft(currentGlobalTheme);
    }
  }, [currentGlobalTheme]);

  const updateField = <K extends keyof SiteThemeConfig>(key: K, value: SiteThemeConfig[K]) => {
    setThemeDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyPreset = (preset: ThemePreset) => {
    setThemeDraft((prev) => ({
      ...prev,
      ...preset.config,
    }));
    setFeedback({
      type: 'success',
      text: `Applied preset "${preset.name}". Click "Save Theme Changes" to propagate across the entire website.`,
    });
  };

  const handleSaveTheme = async () => {
    try {
      setIsSaving(true);
      setFeedback(null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/theme', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'save', themeConfig: theme }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.error || 'Failed to save theme configuration.' });
        return;
      }

      setFeedback({ type: 'success', text: 'Theme, colors, typography, and design updated across the entire website!' });
      await refreshTheme();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error saving theme settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('Are you sure you want to reset all website colors, fonts, shapes, and copy back to defaults?')) return;

    try {
      setIsResetting(true);
      setFeedback(null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch('/api/theme', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'reset' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', text: data.error || 'Failed to reset theme.' });
        return;
      }

      setThemeDraft(DEFAULT_SITE_THEME);
      setFeedback({ type: 'success', text: 'Theme reset to factory defaults.' });
      await refreshTheme();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error resetting theme.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <span>Full Website Design, Theme &amp; Typography Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Full-site control: customize every tiny detail from canvas tone, navbar mode, card surfaces, borders, button shapes, fonts, and headlines across all routes (/explore, /teammates, /hackathons, homepage).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            isLoading={isResetting}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs text-slate-400 hover:text-white"
          >
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTheme}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
            className="text-xs bg-brand-500 hover:bg-brand-600 font-bold"
          >
            Save Theme Changes
          </Button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[11px] underline opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-charcoal-750 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'presets', label: '1-Click Presets', icon: Sparkles },
          { id: 'colors', label: 'Colors & Canvas', icon: Palette },
          { id: 'typography', label: 'Typography & Fonts', icon: Type },
          { id: 'shapes', label: 'Shapes & Radii', icon: Layout },
          { id: 'layout', label: 'Navbar & Footer', icon: Menu },
          { id: 'copy', label: 'Page Hubs & Copy', icon: Sliders },
          { id: 'customCss', label: 'Custom CSS Studio', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-charcoal-800 text-white border border-charcoal-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Controls (7 cols) + Live Stage Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customizer Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: PRESETS */}
          {activeSubTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Choose a Curated Aesthetic Preset</span>
                </h3>
                <span className="text-[11px] text-slate-400">Instantly styles the entire site</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {THEME_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-750 hover:border-brand-500/50 cursor-pointer transition-all space-y-3 group hover:bg-charcoal-850/80"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: preset.previewBg }}
                          className="w-5 h-5 rounded-full border border-slate-600 shadow-xs"
                        />
                        <div
                          style={{ backgroundColor: preset.previewBrand }}
                          className="w-5 h-5 rounded-full shadow-xs"
                        />
                        <div
                          style={{ backgroundColor: preset.previewAccent }}
                          className="w-5 h-5 rounded-full shadow-xs"
                        />
                      </div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 group-hover:text-brand-300">
                        Apply
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-300">{preset.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{preset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COLORS */}
          {activeSubTab === 'colors' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-brand-400" />
                <span>Site-Wide Color Palette &amp; Canvas</span>
              </h3>

              <div className="space-y-4">
                {/* Background Canvas Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Overall Site Background (Canvas)</label>
                    <span className="text-[11px] font-mono text-slate-400">{theme.backgroundColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : '#FAF7F2'}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-charcoal-700 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={theme.backgroundColor}
                      onChange={(e) => updateField('backgroundColor', e.target.value)}
                      className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs w-32"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: 'Warm Ivory', color: '#FAF7F2' },
                        { label: 'Pure White', color: '#ffffff' },
                        { label: 'Warm Espresso Dark', color: '#141210' },
                        { label: 'Obsidian Dark', color: '#090B10' },
                        { label: 'Midnight Deep', color: '#070A0E' },
                      ].map((item) => (
                        <button
                          key={item.color}
                          type="button"
                          onClick={() => updateField('backgroundColor', item.color)}
                          style={{ backgroundColor: item.color }}
                          className="px-2 py-1 rounded-md text-[10px] font-mono border border-slate-700 text-slate-400 hover:text-white"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Surface Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Card &amp; Container Surface</label>
                    <span className="text-[11px] font-mono text-slate-400">{theme.surfaceColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.surfaceColor.startsWith('#') ? theme.surfaceColor : '#ffffff'}
                      onChange={(e) => updateField('surfaceColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-charcoal-700 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={theme.surfaceColor}
                      onChange={(e) => updateField('surfaceColor', e.target.value)}
                      className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs w-32"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['#ffffff', '#f8fafc', '#11141E', '#0E141B', '#141724', '#0F172A'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('surfaceColor', c)}
                          style={{ backgroundColor: c }}
                          className="w-6 h-6 rounded-lg border border-slate-700/60 hover:scale-110 transition-transform"
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Border &amp; Divider Color</label>
                    <span className="text-[11px] font-mono text-slate-400">{theme.borderColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.borderColor.startsWith('#') ? theme.borderColor : '#e2e8f0'}
                      onChange={(e) => updateField('borderColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-charcoal-700 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={theme.borderColor}
                      onChange={(e) => updateField('borderColor', e.target.value)}
                      className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs w-32"
                    />
                  </div>
                </div>

                {/* Brand Primary Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Brand Primary Action Color</label>
                    <span className="text-[11px] font-mono text-slate-400">{theme.brandColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.brandColor}
                      onChange={(e) => updateField('brandColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-charcoal-700 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={theme.brandColor}
                      onChange={(e) => updateField('brandColor', e.target.value)}
                      className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs w-32"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['#C2410C', '#EA580C', '#D97706', '#F59E0B', '#B45309', '#9A3412', '#78350F', '#1C1917'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('brandColor', c)}
                          style={{ backgroundColor: c }}
                          className="w-6 h-6 rounded-lg border border-slate-700/60 hover:scale-110 transition-transform"
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Accent Highlight Color</label>
                    <span className="text-[11px] font-mono text-slate-400">{theme.accentColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-charcoal-700 bg-transparent"
                    />
                    <Input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => updateField('accentColor', e.target.value)}
                      className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs w-32"
                    />
                  </div>
                </div>

                {/* Heading Color, Body Text Color & Muted Text Color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Heading Text</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.headingColor}
                        onChange={(e) => updateField('headingColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-charcoal-700 bg-transparent"
                      />
                      <Input
                        type="text"
                        value={theme.headingColor}
                        onChange={(e) => updateField('headingColor', e.target.value)}
                        className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Body Text</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.bodyTextColor}
                        onChange={(e) => updateField('bodyTextColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-charcoal-700 bg-transparent"
                      />
                      <Input
                        type="text"
                        value={theme.bodyTextColor}
                        onChange={(e) => updateField('bodyTextColor', e.target.value)}
                        className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Muted Subtext</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.mutedTextColor}
                        onChange={(e) => updateField('mutedTextColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-charcoal-700 bg-transparent"
                      />
                      <Input
                        type="text"
                        value={theme.mutedTextColor}
                        onChange={(e) => updateField('mutedTextColor', e.target.value)}
                        className="font-mono uppercase bg-charcoal-800 border-charcoal-700 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY */}
          {activeSubTab === 'typography' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-400" />
                <span>Site-Wide Typography &amp; Font Studio</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Heading Font Family (All H1-H6)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_FONTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateField('headingFont', f.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          theme.headingFont === f.id
                            ? 'bg-charcoal-800 border-brand-500 text-white font-bold ring-1 ring-brand-500'
                            : 'bg-charcoal-850/60 border-charcoal-750 text-slate-300 hover:border-charcoal-700'
                        }`}
                      >
                        <p className="text-sm" style={{ fontFamily: f.id }}>{f.id}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{f.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Heading Weight</label>
                    <select
                      value={theme.headingWeight}
                      onChange={(e) => updateField('headingWeight', e.target.value)}
                      className="w-full bg-charcoal-800 border border-charcoal-700 text-white rounded-xl p-2.5 text-xs font-mono"
                    >
                      <option value="600">600 — SemiBold</option>
                      <option value="700">700 — Bold</option>
                      <option value="800">800 — ExtraBold</option>
                      <option value="900">900 — Black / Ultra</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Letter Spacing</label>
                    <select
                      value={theme.letterSpacing}
                      onChange={(e) => updateField('letterSpacing', e.target.value)}
                      className="w-full bg-charcoal-800 border border-charcoal-700 text-white rounded-xl p-2.5 text-xs font-mono"
                    >
                      <option value="-0.04em">Tight (-0.04em)</option>
                      <option value="-0.02em">Normal / Subtle (-0.02em)</option>
                      <option value="0">Default (0)</option>
                      <option value="0.04em">Spacious (+0.04em)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHAPES & RADII */}
          {activeSubTab === 'shapes' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-400" />
                <span>Shapes, Corners &amp; Shadows</span>
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Card &amp; Container Corner Rounding</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { label: 'Sharp (0px)', value: '0px' },
                      { label: 'Subtle (8px)', value: '8px' },
                      { label: 'Medium (12px)', value: '12px' },
                      { label: 'Sculpted (16px)', value: '16px' },
                      { label: 'Extra (24px)', value: '24px' },
                      { label: 'Full Pill', value: '9999px' },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => updateField('borderRadius', item.value)}
                        style={{ borderRadius: item.value }}
                        className={`p-3 border text-center transition-all ${
                          theme.borderRadius === item.value
                            ? 'bg-charcoal-800 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                            : 'bg-charcoal-850/60 border-charcoal-750 text-slate-400 hover:border-charcoal-700'
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Card Shadow Depth</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'none', label: 'Flat (0)' },
                      { id: 'subtle', label: 'Subtle' },
                      { id: 'elevated', label: 'Elevated' },
                      { id: 'glow', label: 'Brand Glow' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateField('cardShadow', item.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                          theme.cardShadow === item.id
                            ? 'bg-charcoal-800 border-emerald-500 text-white font-bold'
                            : 'bg-charcoal-850/60 border-charcoal-750 text-slate-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NAVBAR & FOOTER */}
          {activeSubTab === 'layout' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Menu className="w-4 h-4 text-cyan-400" />
                <span>Site Header (Navbar) &amp; Footer Customization</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Navbar Mode / Appearance</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'auto', label: 'Auto (Follow Theme)' },
                      { id: 'dark', label: 'Obsidian Dark' },
                      { id: 'light', label: 'Crisp White' },
                      { id: 'glass', label: 'Translucent Glass' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateField('navbarStyle', item.id as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                          theme.navbarStyle === item.id
                            ? 'bg-charcoal-800 border-cyan-500 text-white font-bold'
                            : 'bg-charcoal-850/60 border-charcoal-750 text-slate-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Site Wordmark / Name</label>
                    <Input
                      type="text"
                      value={theme.siteTitle || 'Linkora'}
                      onChange={(e) => updateField('siteTitle', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Navbar CTA Button Text</label>
                    <Input
                      type="text"
                      value={theme.navbarCtaText || 'Start a Project'}
                      onChange={(e) => updateField('navbarCtaText', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Footer Tagline</label>
                  <Input
                    type="text"
                    value={theme.footerTagline}
                    onChange={(e) => updateField('footerTagline', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PAGE HUBS & COPY */}
          {activeSubTab === 'copy' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Page Hubs &amp; Section Headlines</span>
              </h3>

              {/* Homepage Hero */}
              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300">Homepage Hero</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Pill Badge</label>
                  <Input
                    type="text"
                    value={theme.heroBadgeText}
                    onChange={(e) => updateField('heroBadgeText', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Main Headline</label>
                  <Input
                    type="text"
                    value={theme.heroHeadline}
                    onChange={(e) => updateField('heroHeadline', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subheadline</label>
                  <textarea
                    rows={2}
                    value={theme.heroSubheadline}
                    onChange={(e) => updateField('heroSubheadline', e.target.value)}
                    className="w-full bg-charcoal-800 border border-charcoal-700 text-white rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              {/* Explore Projects Hub */}
              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">/explore Page Hub</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Text</label>
                    <Input
                      type="text"
                      value={theme.exploreBadgeText}
                      onChange={(e) => updateField('exploreBadgeText', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Page Title</label>
                    <Input
                      type="text"
                      value={theme.exploreTitle}
                      onChange={(e) => updateField('exploreTitle', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle</label>
                  <Input
                    type="text"
                    value={theme.exploreSubtitle}
                    onChange={(e) => updateField('exploreSubtitle', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs"
                  />
                </div>
              </div>

              {/* Find Teammates Hub */}
              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
                <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">/teammates Page Hub</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Text</label>
                    <Input
                      type="text"
                      value={theme.teammatesBadgeText}
                      onChange={(e) => updateField('teammatesBadgeText', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Page Title</label>
                    <Input
                      type="text"
                      value={theme.teammatesTitle}
                      onChange={(e) => updateField('teammatesTitle', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle</label>
                  <Input
                    type="text"
                    value={theme.teammatesSubtitle}
                    onChange={(e) => updateField('teammatesSubtitle', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs"
                  />
                </div>
              </div>

              {/* Hackathons Arena */}
              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">/hackathons Page Hub</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Text</label>
                    <Input
                      type="text"
                      value={theme.hackathonsBadgeText}
                      onChange={(e) => updateField('hackathonsBadgeText', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Page Title</label>
                    <Input
                      type="text"
                      value={theme.hackathonsTitle}
                      onChange={(e) => updateField('hackathonsTitle', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle</label>
                  <Input
                    type="text"
                    value={theme.hackathonsSubtitle}
                    onChange={(e) => updateField('hackathonsSubtitle', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs"
                  />
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="space-y-3 p-4 rounded-xl bg-charcoal-850/60 border border-charcoal-750">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Global Sticky Announcement Bar</h4>
                  <button
                    type="button"
                    onClick={() => updateField('announcementBannerActive', !theme.announcementBannerActive)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      theme.announcementBannerActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-charcoal-800 text-slate-500 border border-charcoal-700'
                    }`}
                  >
                    {theme.announcementBannerActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
                <Input
                  type="text"
                  value={theme.announcementBannerText || ''}
                  onChange={(e) => updateField('announcementBannerText', e.target.value)}
                  placeholder="e.g. 🚀 Welcome to Fall 2026 Hackathon Season! Register your team today."
                  className="bg-charcoal-800 border-charcoal-700 text-xs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Link (optional)</label>
                    <Input
                      type="text"
                      value={theme.announcementBannerLink || ''}
                      onChange={(e) => updateField('announcementBannerLink', e.target.value)}
                      placeholder="/hackathons"
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={theme.announcementBannerBg || theme.brandColor}
                        onChange={(e) => updateField('announcementBannerBg', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-charcoal-700 bg-transparent"
                      />
                      <Input
                        type="text"
                        value={theme.announcementBannerBg || theme.brandColor}
                        onChange={(e) => updateField('announcementBannerBg', e.target.value)}
                        className="bg-charcoal-800 border-charcoal-700 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CUSTOM CSS STUDIO */}
          {activeSubTab === 'customCss' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Advanced Custom CSS Injection Studio</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Want to modify any tiny detail, margin, font-size, animation, or color not covered by standard switches? Add raw CSS rules below and they will immediately inject into every page on the website.
                </p>
              </div>

              <div>
                <textarea
                  rows={10}
                  value={theme.customCss || ''}
                  onChange={(e) => updateField('customCss', e.target.value)}
                  placeholder={`/* Example custom rules: */\n.site-card { transition: transform 0.2s ease; }\n.site-card:hover { transform: translateY(-4px); }\nh1 { text-transform: uppercase; }`}
                  className="w-full bg-charcoal-950 border border-charcoal-700 text-emerald-400 font-mono rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-charcoal-800/80 border border-charcoal-700 text-[11px] text-slate-400">
                <span className="font-bold text-slate-200">Tip:</span> Use classes like <code className="text-pink-400">.site-card</code>, <code className="text-pink-400">.site-btn-primary</code>, or standard tags like <code className="text-pink-400">h1, h2, nav</code> to style any element across Linkora.
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Stage Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-brand-400" />
              Live Stage Preview
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-Time Reactive
            </span>
          </div>

          {/* Interactive Card simulating Full Website Look */}
          <div
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.borderColor,
              borderRadius: theme.borderRadius,
            }}
            className="p-6 border shadow-elevated space-y-5 transition-all duration-200 overflow-hidden relative"
          >
            {/* Mini Simulated Header */}
            <div
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.borderColor,
                borderRadius: '12px',
              }}
              className="p-3 border flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: theme.brandColor }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-[10px]"
                >
                  ▲
                </div>
                <span style={{ color: theme.headingColor }} className="text-xs font-black">
                  {theme.siteTitle || 'Linkora'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: theme.bodyTextColor }} className="text-[10px] font-semibold opacity-75">
                  Explore
                </span>
                <span style={{ color: theme.bodyTextColor }} className="text-[10px] font-semibold opacity-75">
                  Teammates
                </span>
                <div
                  style={{
                    backgroundColor: theme.brandColor,
                    borderRadius: theme.borderRadius,
                  }}
                  className="px-2.5 py-1 text-white text-[10px] font-bold"
                >
                  {theme.navbarCtaText || 'Start Project'}
                </div>
              </div>
            </div>

            {/* Hero Simulation */}
            <div className="space-y-2.5 text-center pt-2">
              <div
                style={{
                  backgroundColor: `${theme.brandColor}15`,
                  borderColor: `${theme.brandColor}35`,
                  color: theme.brandColor,
                }}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
              >
                <Sparkles className="w-3 h-3" />
                <span>{theme.heroBadgeText}</span>
              </div>

              <h3
                style={{
                  color: theme.headingColor,
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                  letterSpacing: theme.letterSpacing,
                }}
                className="text-xl sm:text-2xl leading-tight font-black"
              >
                {theme.heroHeadline}
              </h3>

              <p
                style={{ color: theme.bodyTextColor }}
                className="text-xs opacity-80 leading-relaxed max-w-sm mx-auto"
              >
                {theme.heroSubheadline}
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <div
                  style={{
                    backgroundColor: theme.brandColor,
                    borderRadius: theme.borderRadius,
                  }}
                  className="px-3.5 py-1.5 text-white text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {theme.primaryCtaText}
                </div>
                <div
                  style={{
                    backgroundColor: theme.surfaceColor,
                    borderColor: theme.borderColor,
                    color: theme.headingColor,
                    borderRadius: theme.borderRadius,
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold border cursor-pointer hover:opacity-90 transition-opacity"
                >
                  {theme.secondaryCtaText}
                </div>
              </div>
            </div>

            {/* Card Simulation (Simulates ProjectCard & TeammateCard) */}
            <div
              style={{
                backgroundColor: theme.surfaceColor,
                borderColor: theme.borderColor,
                borderRadius: theme.borderRadius,
              }}
              className="p-4 border shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    backgroundColor: `${theme.brandColor}15`,
                    color: theme.brandColor,
                    borderColor: `${theme.brandColor}30`,
                  }}
                  className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
                >
                  Active Project
                </span>
                <span className="text-[9px] font-mono text-emerald-500 font-bold">● Recruiting</span>
              </div>
              <h4 style={{ color: theme.headingColor }} className="text-xs font-black">
                Autonomous Campus Rover &amp; Drone Swarm
              </h4>
              <p style={{ color: theme.bodyTextColor }} className="text-[11px] opacity-75">
                Multi-agent robotic systems built for campus survey and hackathon competition.
              </p>
              <div className="pt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: theme.borderColor }}>
                <span style={{ color: theme.mutedTextColor }}>3/4 Teammates Joined</span>
                <span style={{ color: theme.brandColor }} className="font-bold cursor-pointer">
                  View Details →
                </span>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div
              style={{
                backgroundColor: `${theme.surfaceColor}90`,
                borderColor: theme.borderColor,
              }}
              className="p-2.5 rounded-xl border text-[10px] font-mono flex items-center justify-between"
            >
              <span style={{ color: theme.mutedTextColor }}>Font: {theme.headingFont}</span>
              <span style={{ color: theme.brandColor }} className="font-bold">
                Radius: {theme.borderRadius}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
