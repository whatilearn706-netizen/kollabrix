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
  Layers,
  Zap,
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
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'colors' | 'typography' | 'shapes' | 'copy'>('presets');
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
      text: `Applied preset "${preset.name}". Click "Save Theme Changes" to publish across the website.`,
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

      setFeedback({ type: 'success', text: 'Theme, colors, fonts, and design updated successfully across Linkora!' });
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
    if (!confirm('Are you sure you want to reset all colors, fonts, and copy back to factory defaults?')) return;

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
            <span>Theme, Colors, Typography &amp; Design Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Customize every visual element on Linkora in real time: page background tones, brand primary colors, font families, corner roundness, and hero headline copy.
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
          { id: 'copy', label: 'Site Copy & Headlines', icon: Sliders },
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
                <span className="text-[11px] text-slate-400">Click any preset to preview</span>
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
                        Select
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
                <span>Colors &amp; Canvas Atmosphere</span>
              </h3>

              <div className="space-y-4">
                {/* Brand Primary Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Brand Primary Color</label>
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
                    {/* Quick Swatches */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['#6366F1', '#8B5CF6', '#10B981', '#EC4899', '#F59E0B', '#0F172A', '#06B6D4'].map((c) => (
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
                    <label className="text-xs font-semibold text-slate-300">Accent Color</label>
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#14B8A6'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('accentColor', c)}
                          style={{ backgroundColor: c }}
                          className="w-6 h-6 rounded-lg border border-slate-700/60 hover:scale-110 transition-transform"
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Background Canvas Color */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Page Background Color</label>
                    <span className="text-[11px] font-mono text-slate-400">{theme.backgroundColor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : '#fafbfc'}
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
                        { label: 'Clean Light', color: '#fafbfc' },
                        { label: 'Pure White', color: '#ffffff' },
                        { label: 'Obsidian Dark', color: '#090B10' },
                        { label: 'Midnight Deep', color: '#0B0E17' },
                        { label: 'Slate Gray', color: '#0F172A' },
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

                {/* Heading Color & Body Text Color */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Heading Text Color</label>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Body Text Color</label>
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
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY */}
          {activeSubTab === 'typography' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-400" />
                <span>Typography &amp; Font Studio</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Heading Font Family</label>
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
                <span>Shapes &amp; Corner Rounding</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Border Radius (Corners)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
              </div>
            </div>
          )}

          {/* TAB 5: COPY & HEADLINES */}
          {activeSubTab === 'copy' && (
            <div className="rounded-2xl bg-charcoal-900 border border-charcoal-750 p-6 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Site Copy, Headlines &amp; CTA Buttons</span>
              </h3>

              <div className="space-y-4">
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Main Hero Headline</label>
                  <Input
                    type="text"
                    value={theme.heroHeadline}
                    onChange={(e) => updateField('heroHeadline', e.target.value)}
                    className="bg-charcoal-800 border-charcoal-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={theme.heroSubheadline}
                    onChange={(e) => updateField('heroSubheadline', e.target.value)}
                    className="w-full bg-charcoal-800 border border-charcoal-700 text-white rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Primary CTA Button</label>
                    <Input
                      type="text"
                      value={theme.primaryCtaText}
                      onChange={(e) => updateField('primaryCtaText', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Secondary CTA Button</label>
                    <Input
                      type="text"
                      value={theme.secondaryCtaText}
                      onChange={(e) => updateField('secondaryCtaText', e.target.value)}
                      className="bg-charcoal-800 border-charcoal-700 text-xs"
                    />
                  </div>
                </div>

                {/* Announcement Banner */}
                <div className="pt-2 border-t border-charcoal-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Global Announcement Banner</label>
                    <button
                      type="button"
                      onClick={() => updateField('announcementBannerActive', !theme.announcementBannerActive)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        theme.announcementBannerActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-charcoal-800 text-slate-500 border border-charcoal-700'
                      }`}
                    >
                      {theme.announcementBannerActive ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={theme.announcementBannerText || ''}
                    onChange={(e) => updateField('announcementBannerText', e.target.value)}
                    placeholder="e.g. 🚀 Welcome to Fall 2026 Hackathon Season! Register your team today."
                    className="bg-charcoal-800 border-charcoal-700 text-xs"
                  />
                </div>
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

          {/* Interactive Card simulating HomePage */}
          <div
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: theme.borderColor,
              borderRadius: theme.borderRadius,
            }}
            className="p-6 border shadow-elevated space-y-5 transition-all duration-200 overflow-hidden relative"
          >
            {/* Preview Banner if active */}
            {theme.announcementBannerActive && theme.announcementBannerText && (
              <div
                style={{ backgroundColor: theme.brandColor }}
                className="py-1 px-3 -mt-6 -mx-6 mb-4 text-[10px] font-bold text-white text-center"
              >
                {theme.announcementBannerText}
              </div>
            )}

            {/* Simulated Pill Badge */}
            <div
              style={{ borderRadius: theme.borderRadius }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200/90 text-slate-700 text-[10px] font-mono font-bold"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{theme.heroBadgeText || 'Linkora • Student Collaboration'}</span>
            </div>

            {/* Headline */}
            <h2
              style={{
                color: theme.headingColor,
                fontFamily: theme.headingFont,
                fontWeight: theme.headingWeight,
                letterSpacing: theme.letterSpacing,
              }}
              className="text-2xl font-black leading-tight"
            >
              {theme.heroHeadline || 'Build something bigger, together.'}
            </h2>

            {/* Subheadline */}
            <p
              style={{
                color: theme.bodyTextColor,
                fontFamily: theme.bodyFont,
              }}
              className="text-xs leading-relaxed"
            >
              {theme.heroSubheadline || 'Find your people, turn ideas into projects, and build a portfolio that proves what you can do.'}
            </p>

            {/* Simulated Action Buttons */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                style={{
                  backgroundColor: theme.brandColor,
                  borderRadius: theme.borderRadius,
                }}
                className="px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90 transition-opacity"
              >
                {theme.primaryCtaText || 'Explore Projects'}
              </button>

              <button
                type="button"
                style={{
                  borderRadius: theme.borderRadius,
                }}
                className="px-4 py-2 text-xs font-bold text-slate-800 border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
              >
                {theme.secondaryCtaText || 'Find Teammates'}
              </button>
            </div>

            {/* Simulated Trust Chips */}
            <div className="pt-2 flex items-center gap-3 text-[10px] text-slate-500 flex-wrap border-t border-slate-200/60">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Verified Proof
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                <Zap className="w-3 h-3" />
                Hackathons
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-750 text-[11px] text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Instant Full-Site Synchronization
            </p>
            <p className="leading-relaxed">
              When you click <strong>&quot;Save Theme Changes&quot;</strong>, the CSS variables and copy will be permanently persisted to the database and updated across all visitor screens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
