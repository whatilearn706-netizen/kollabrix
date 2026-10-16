'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, X, ArrowRight, Megaphone } from 'lucide-react';
import { BroadcastBannerConfig, DEFAULT_MASTER_CONTROL_CONFIG } from '@/types/masterControl';

const THEME_STYLES: Record<BroadcastBannerConfig['theme'], { bg: string; text: string; badge: string; button: string }> = {
  gradient: {
    bg: 'bg-gradient-to-r from-violet-600 via-brand-600 to-indigo-600',
    text: 'text-white',
    badge: 'bg-white/20 text-white border-white/30',
    button: 'bg-white text-brand-700 hover:bg-slate-100',
  },
  indigo: {
    bg: 'bg-indigo-600',
    text: 'text-white',
    badge: 'bg-indigo-800/60 text-indigo-100 border-indigo-400/30',
    button: 'bg-white text-indigo-700 hover:bg-indigo-50',
  },
  emerald: {
    bg: 'bg-emerald-600',
    text: 'text-white',
    badge: 'bg-emerald-800/60 text-emerald-100 border-emerald-400/30',
    button: 'bg-white text-emerald-800 hover:bg-emerald-50',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-charcoal-950',
    badge: 'bg-amber-700/30 text-amber-950 border-amber-800/20',
    button: 'bg-charcoal-950 text-amber-300 hover:bg-charcoal-900',
  },
  rose: {
    bg: 'bg-rose-600',
    text: 'text-white',
    badge: 'bg-rose-800/60 text-rose-100 border-rose-400/30',
    button: 'bg-white text-rose-700 hover:bg-rose-50',
  },
};

export function GlobalBroadcastBanner() {
  const [banner, setBanner] = useState<BroadcastBannerConfig>(DEFAULT_MASTER_CONTROL_CONFIG.banner);
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function loadConfig() {
      // 1. Try localStorage instant cache
      try {
        const cached = localStorage.getItem('linkora_master_control_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.banner) {
            setBanner(parsed.banner);
          }
        }
      } catch (e) {
        // ignore
      }

      // 2. Fetch fresh from public API
      fetch('/api/master-control')
        .then((res) => res.json())
        .then((data) => {
          if (data?.config?.banner) {
            const hasLocalCache = !!localStorage.getItem('linkora_master_control_v1');
            const isCustom = data.fromDb || JSON.stringify(data.config.banner) !== JSON.stringify(DEFAULT_MASTER_CONTROL_CONFIG.banner);
            if (data.fromDb || isCustom || !hasLocalCache) {
              setBanner(data.config.banner);
              try {
                localStorage.setItem('linkora_master_control_v1', JSON.stringify(data.config));
              } catch (e) {}
            }
          }
        })
        .catch(() => {});
    }

    loadConfig();

    // Check if dismissed in this session for this specific text
    try {
      const dismissedHash = sessionStorage.getItem('linkora_banner_dismissed_text');
      if (dismissedHash === banner.text) {
        setIsDismissed(true);
      }
    } catch (e) {}

    // Listen for custom admin update event
    const handleUpdate = () => loadConfig();
    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  if (!mounted || !banner.enabled || isDismissed) {
    return null;
  }

  const themeStyle = THEME_STYLES[banner.theme] || THEME_STYLES.gradient;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('linkora_banner_dismissed_text', banner.text);
    } catch (e) {}
  };

  return (
    <aside
      aria-label="Platform Announcement"
      className={`relative z-40 px-3 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm ${themeStyle.bg} ${themeStyle.text}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left / Center content */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${themeStyle.badge}`}>
            <Megaphone className="w-3 h-3 shrink-0" />
            Announcement
          </span>
          <span className="font-semibold leading-tight">{banner.text}</span>
          {banner.linkText && banner.linkUrl && (
            <Link
              href={banner.linkUrl}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs transition-colors shadow-subtle ${themeStyle.button}`}
            >
              <span>{banner.linkText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Dismiss Button */}
        {banner.dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-md opacity-80 hover:opacity-100 hover:bg-black/10 transition-opacity shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
