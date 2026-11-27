'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ArrowRight, Megaphone } from 'lucide-react';
import { BroadcastBannerConfig, DEFAULT_MASTER_CONTROL_CONFIG } from '@/types/masterControl';

const OBSIDIAN_BANNER_STYLE = {
  bg: 'bg-black',
  text: 'text-slate-300',
  badge: 'bg-white/[0.06] text-zinc-200 border-white/15',
  button:
    'bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 hover:text-white font-semibold border border-white/15 border-t-white/25 backdrop-blur-md transition-all',
};

const THEME_STYLES: Record<BroadcastBannerConfig['theme'], { bg: string; text: string; badge: string; button: string }> = {
  gradient: OBSIDIAN_BANNER_STYLE,
  indigo: OBSIDIAN_BANNER_STYLE,
  emerald: OBSIDIAN_BANNER_STYLE,
  amber: OBSIDIAN_BANNER_STYLE,
  rose: OBSIDIAN_BANNER_STYLE,
};

export function GlobalBroadcastBanner() {
  const pathname = usePathname();
  const [isExamMode, setIsExamMode] = useState(false);

  useEffect(() => {
    const handleExam = (e: any) => {
      setIsExamMode(Boolean(e.detail?.active));
    };
    const checkExamClass = () => {
      if (typeof document !== 'undefined') {
        setIsExamMode(document.body.classList.contains('icpc-exam-mode'));
      }
    };
    checkExamClass();
    window.addEventListener('linkora_exam_mode', handleExam);
    return () => window.removeEventListener('linkora_exam_mode', handleExam);
  }, []);

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

    // Listen for custom broadcast update event
    const handleUpdate = () => loadConfig();
    window.addEventListener('linkora_master_control_updated', handleUpdate);
    return () => {
      window.removeEventListener('linkora_master_control_updated', handleUpdate);
    };
  }, []);

  if (
    pathname?.startsWith('/resources') ||
    pathname?.startsWith('/arena') ||
    pathname?.startsWith('/icpc') ||
    pathname?.startsWith('/spark') ||
    pathname?.startsWith('/ai-spark') ||
    pathname?.startsWith('/ka-ai') ||
    pathname?.startsWith('/ka-codex') ||
    isExamMode ||
    !banner.enabled ||
    isDismissed
  ) {
    return null;
  }

  const themeStyle = THEME_STYLES[banner.theme] || THEME_STYLES.gradient;
  const bannerText = banner.text ? banner.text.replace(/Linkora/gi, 'Kollabrix') : '';
  const bannerLinkText = banner.linkText ? banner.linkText.replace(/Linkora/gi, 'Kollabrix').replace(/(\s*→|\s*->)+$/g, '').trim() : '';

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('linkora_banner_dismissed_text', banner.text);
    } catch (e) {}
  };

  return (
    <aside
      aria-label="Platform Announcement"
      className={`relative z-40 px-3 py-2 text-xs sm:text-sm font-medium transition-all ${themeStyle.bg} ${themeStyle.text}`}
    >
      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 flex items-center justify-between gap-3">
        {/* Left / Center content */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${themeStyle.badge}`}>
            <Megaphone className="w-3 h-3 shrink-0 text-slate-200" />
            Announcement
          </span>
          <span className="font-semibold text-slate-200 leading-tight">{bannerText}</span>
          {bannerLinkText && banner.linkUrl && (
            <Link
              href={banner.linkUrl}
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full font-bold text-xs transition-all ${themeStyle.button}`}
            >
              <span>{bannerLinkText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Dismiss Button */}
        {banner.dismissible && (
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
