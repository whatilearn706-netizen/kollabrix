'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SiteThemeConfig, DEFAULT_SITE_THEME, AVAILABLE_FONTS } from '@/types/theme';

interface SiteThemeContextValue {
  theme: SiteThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<SiteThemeConfig>>;
  refreshTheme: () => Promise<void>;
  toggleTheme: () => void;
  isLoading: boolean;
  isDark: boolean;
}

const SiteThemeContext = createContext<SiteThemeContextValue>({
  theme: DEFAULT_SITE_THEME,
  setTheme: () => {},
  refreshTheme: async () => {},
  toggleTheme: () => {},
  isLoading: true,
  isDark: false,
});

/**
 * Helper to determine if a hex color or rgb string is perceptually dark
 */
export function isColorDark(colorStr?: string): boolean {
  if (!colorStr) return false;
  const hex = colorStr.replace('#', '').trim();
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
  return false;
}

export function sanitizeTheme(t: SiteThemeConfig): SiteThemeConfig {
  const isBgDark = isColorDark(t.backgroundColor);
  const darkBg = isBgDark ? t.backgroundColor : '#090B10';
  const darkSurface = isColorDark(t.surfaceColor) ? t.surfaceColor : '#12151F';
  const darkBorder = isColorDark(t.borderColor) ? t.borderColor : '#1E2433';
  const darkHeading = !isColorDark(t.headingColor) ? t.headingColor : '#F8FAFC';
  const darkBodyText = !isColorDark(t.bodyTextColor) ? t.bodyTextColor : '#CBD5E1';
  const darkMutedText = !isColorDark(t.mutedTextColor) ? t.mutedTextColor : '#94A3B8';

  return {
    ...t,
    backgroundColor: darkBg,
    surfaceColor: darkSurface,
    borderColor: darkBorder,
    headingColor: darkHeading,
    bodyTextColor: darkBodyText,
    mutedTextColor: darkMutedText,
    navbarStyle: 'dark',
    cardShadow: t.cardShadow === 'none' ? 'none' : 'glow',
    siteTitle: (!t.siteTitle || t.siteTitle.trim() === 'Linkora') ? 'Kollabrix' : t.siteTitle.replace(/Linkora/g, 'Kollabrix'),
    heroBadgeText: t.heroBadgeText ? t.heroBadgeText.replace(/Linkora/g, 'Kollabrix') : 'Kollabrix • Collegiate Innovation & Hackathon Network',
    announcementBannerText: t.announcementBannerText ? t.announcementBannerText.replace(/Linkora/g, 'Kollabrix') : t.announcementBannerText,
  };
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteThemeConfig>(() => sanitizeTheme(DEFAULT_SITE_THEME));
  const [isLoading, setIsLoading] = useState(true);

  // Permanently Dark Mode across all pages and components
  const isDark = true;

  const applyThemeToDocument = useCallback((currentTheme: SiteThemeConfig) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // 1. Force permanent dark theme classes & attributes
    root.classList.add('site-theme-dark');
    root.classList.add('dark');
    root.classList.remove('site-theme-light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';

    try {
      localStorage.setItem('linkora_user_theme_mode', 'dark');
    } catch (e) {}

    // 2. Apply CSS Variables
    root.style.setProperty('--site-bg', currentTheme.backgroundColor);
    root.style.setProperty('--site-surface', currentTheme.surfaceColor);
    root.style.setProperty('--site-border', currentTheme.borderColor);
    root.style.setProperty('--site-brand', currentTheme.brandColor);
    root.style.setProperty('--site-brand-hover', currentTheme.brandHoverColor);
    root.style.setProperty('--site-accent', currentTheme.accentColor);
    root.style.setProperty('--site-heading', currentTheme.headingColor);
    root.style.setProperty('--site-text', currentTheme.bodyTextColor);
    root.style.setProperty('--site-text-muted', currentTheme.mutedTextColor);
    root.style.setProperty('--site-font-heading', `"${currentTheme.headingFont}", sans-serif`);
    root.style.setProperty('--site-font-body', `"${currentTheme.bodyFont}", sans-serif`);
    root.style.setProperty('--site-radius', currentTheme.borderRadius);
    root.style.setProperty('--site-heading-weight', currentTheme.headingWeight || '900');
    root.style.setProperty('--site-letter-spacing', currentTheme.letterSpacing || '-0.03em');

    // 3. Dynamic Google Fonts Loader
    const fontObj = AVAILABLE_FONTS.find((f) => f.id === currentTheme.headingFont);
    if (fontObj && fontObj.id !== 'Inter') {
      const linkId = 'dynamic-google-font-heading';
      let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement('link');
        linkEl.id = linkId;
        linkEl.rel = 'stylesheet';
        document.head.appendChild(linkEl);
      }
      linkEl.href = `https://fonts.googleapis.com/css2?family=${fontObj.googleFont}&display=swap`;
    }

    // 4. Inject Dynamic Global CSS Overrides Tag
    const styleId = 'dynamic-site-theme-overrides';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    const shadowCss =
      currentTheme.cardShadow === 'glow'
        ? `0 0 25px -5px ${currentTheme.brandColor}33, 0 8px 16px -4px rgba(0,0,0,0.4)`
        : currentTheme.cardShadow === 'elevated'
        ? '0 12px 30px -10px rgba(0,0,0,0.15)'
        : currentTheme.cardShadow === 'none'
        ? 'none'
        : '0 2px 8px -2px rgba(0,0,0,0.06)';

    styleEl.innerHTML = `
      body, html {
        background-color: var(--site-bg) !important;
        color: var(--site-text) !important;
        font-family: var(--site-font-body) !important;
      }

      h1:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white),
      h2:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white),
      h3:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white),
      h4:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white),
      h5:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white),
      h6:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white),
      .font-heading:not(.text-transparent):not(.begin-colorful):not(.text-white):not(.site-heading-white) {
        font-family: var(--site-font-heading) !important;
        font-weight: var(--site-heading-weight) !important;
        letter-spacing: var(--site-letter-spacing) !important;
        color: var(--site-heading) !important;
      }

      /* Explicit White Headings inside Dark Cards & Hero Sections */
      .text-white,
      .site-heading-white,
      .site-theme-dark .dark\:text-white,
      .bg-charcoal-900 h1,
      .bg-charcoal-900 h2,
      .bg-charcoal-900 h3,
      .bg-charcoal-950 h1,
      .bg-slate-900 h1,
      .bg-black h1 {
        color: #ffffff !important;
      }

      .begin-colorful {
        background: linear-gradient(
          90deg,
          #D97706 0%,
          #EA580C 25%,
          #C2410C 50%,
          #B45309 75%,
          #F59E0B 100%
        ) !important;
        background-size: 100% 100% !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        background-clip: text !important;
        color: transparent !important;
        display: inline-block !important;
      }

      /* Site Card Class */
      .site-card,
      [data-site-card] {
        background-color: var(--site-surface) !important;
        border-color: var(--site-border) !important;
        border-radius: var(--site-radius) !important;
        box-shadow: ${shadowCss};
      }

      /* Primary Buttons */
      .site-btn-primary,
      button.btn-primary {
        background-color: var(--site-brand) !important;
        color: #ffffff !important;
        border-radius: var(--site-radius) !important;
      }
      .site-btn-primary:hover,
      button.btn-primary:hover {
        background-color: var(--site-brand-hover) !important;
      }

      /* Brand Highlights */
      .site-brand-text {
        color: var(--site-brand) !important;
      }
      .site-brand-bg {
        background-color: var(--site-brand) !important;
      }
      .site-accent-text {
        color: var(--site-accent) !important;
      }

      /* Global Warm Color Palette Harmonization Across Components */
      .bg-indigo-600,
      .bg-violet-600 {
        background-color: var(--site-brand) !important;
      }
      .hover\\:bg-indigo-500:hover,
      .hover\\:bg-indigo-700:hover,
      .hover\\:bg-violet-500:hover,
      .hover\\:bg-violet-700:hover {
        background-color: var(--site-brand-hover) !important;
      }
      .text-indigo-600,
      .text-violet-600 {
        color: var(--site-brand) !important;
      }
      .border-indigo-500,
      .border-violet-500,
      .border-indigo-600,
      .border-violet-600 {
        border-color: var(--site-brand) !important;
      }

      /* Dark Theme Global Warm Adaptations Across All Pages */
      .site-theme-dark .bg-white {
        background-color: var(--site-surface) !important;
        color: var(--site-text) !important;
        border-color: var(--site-border) !important;
      }
      .site-theme-dark .bg-slate-50,
      .site-theme-dark .bg-slate-100 {
        background-color: rgba(255, 255, 255, 0.05) !important;
        border-color: var(--site-border) !important;
      }
      .site-theme-dark .text-slate-900,
      .site-theme-dark .text-slate-800 {
        color: var(--site-heading) !important;
      }
      .site-theme-dark .text-slate-700,
      .site-theme-dark .text-slate-600 {
        color: var(--site-text) !important;
      }
      .site-theme-dark .text-slate-500,
      .site-theme-dark .text-slate-400 {
        color: var(--site-text-muted) !important;
      }
      .site-theme-dark .border-slate-200,
      .site-theme-dark .border-slate-300,
      .site-theme-dark .border-slate-200\\/90 {
        border-color: var(--site-border) !important;
      }

      /* Custom CSS Injection by Admin */
      ${currentTheme.customCss || ''}
    `;
  }, []);

  const refreshTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/theme');
      const data = await res.json();
      const activeTheme = data.theme || DEFAULT_SITE_THEME;
      const sanitized = sanitizeTheme(activeTheme);
      setTheme(sanitized);
      applyThemeToDocument(sanitized);
    } catch (err) {
      console.warn('Could not load site theme:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeToDocument]);

  const toggleTheme = useCallback(() => {
    // Permanent Dark Mode: maintain obsidian dark palette
    const darkTheme = sanitizeTheme(DEFAULT_SITE_THEME);
    setTheme(darkTheme);
    applyThemeToDocument(darkTheme);
  }, [applyThemeToDocument]);

  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, applyThemeToDocument]);

  return (
    <SiteThemeContext.Provider value={{ theme, setTheme, refreshTheme, toggleTheme, isLoading, isDark }}>
      {/* Global Announcement Banner */}
      {theme.announcementBannerActive && theme.announcementBannerText && (
        <div
          style={{
            backgroundColor: theme.announcementBannerBg || theme.brandColor,
            color: theme.announcementBannerTextColor || '#ffffff',
          }}
          className="px-4 py-2 text-center text-xs font-bold tracking-wide transition-all z-50 sticky top-0 shadow-xs"
        >
          {theme.announcementBannerLink ? (
            <Link
              href={theme.announcementBannerLink}
              className="hover:underline flex items-center justify-center gap-1.5"
            >
              <span>{theme.announcementBannerText}</span>
              <span className="opacity-80">→</span>
            </Link>
          ) : (
            <span>{theme.announcementBannerText}</span>
          )}
        </div>
      )}
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}
