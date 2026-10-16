'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteThemeConfig, DEFAULT_SITE_THEME, AVAILABLE_FONTS } from '@/types/theme';

interface SiteThemeContextValue {
  theme: SiteThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<SiteThemeConfig>>;
  refreshTheme: () => Promise<void>;
  isLoading: boolean;
}

const SiteThemeContext = createContext<SiteThemeContextValue>({
  theme: DEFAULT_SITE_THEME,
  setTheme: () => {},
  refreshTheme: async () => {},
  isLoading: true,
});

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<SiteThemeConfig>(DEFAULT_SITE_THEME);
  const [isLoading, setIsLoading] = useState(true);

  const applyThemeToDocument = useCallback((currentTheme: SiteThemeConfig) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply CSS Variables
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

    // Dynamic Google Fonts Loader
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
  }, []);

  const refreshTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/theme');
      const data = await res.json();
      if (data.theme) {
        setTheme(data.theme);
        applyThemeToDocument(data.theme);
      }
    } catch (err) {
      console.warn('Could not load site theme:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeToDocument]);

  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, applyThemeToDocument]);

  return (
    <SiteThemeContext.Provider value={{ theme, setTheme, refreshTheme, isLoading }}>
      {/* Optional Global Announcement Banner */}
      {theme.announcementBannerActive && theme.announcementBannerText && (
        <div
          style={{
            backgroundColor: theme.brandColor,
            color: '#ffffff',
          }}
          className="px-4 py-2 text-center text-xs font-bold tracking-wide transition-all z-50 sticky top-0"
        >
          <span>{theme.announcementBannerText}</span>
        </div>
      )}
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  return useContext(SiteThemeContext);
}
