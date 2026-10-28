'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ArrowRight, Megaphone } from 'lucide-react';
import { BroadcastBannerConfig, DEFAULT_MASTER_CONTROL_CONFIG } from '@/types/masterControl';

const THEME_STYLES: Record<BroadcastBannerConfig['theme'], { bg: string; text: string; badge: string; button: string }> = {
  gradient: {
    bg: 'bg-[#090B10] border-b border-white/[0.08]',
    text: 'text-slate-300',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    button: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:opacity-95 shadow-xs border border-white/10',
  },
  indigo: {
    bg: 'bg-[#090B10] border-b border-white/[0.08]',
    text: 'text-slate-300',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    button: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:opacity-95 shadow-xs border border-white/10',
  },
  emerald: {
    bg: 'bg-[#090B10] border-b border-white/[0.08]',
    text: 'text-slate-300',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    button: 'bg-emerald-600/80 text-white hover:bg-emerald-600 border border-emerald-500/30',
  },
  amber: {
    bg: 'bg-[#090B10] border-b border-white/[0.08]',
    text: 'text-slate-300',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    button: 'bg-gradient-to-r from-orange-600 to-amber-500 text-white hover:opacity-95 shadow-xs border border-white/10',
  },
  rose: {
    bg: 'bg-[#090B10] border-b border-white/[0.08]',
    text: 'text-slate-300',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    button: 'bg-rose-600/80 text-white hover:bg-rose-600 border border-rose-500/30',
  },
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
    pathname?.startsWith('/icpc') ||
    isExamMode ||
    !banner.enabled ||
    isDismissed
  ) {
    return null;
  }

  const themeStyle = THEME_STYLES[banner.theme] || THEME_STYLES.gradient;
  const bannerText = banner.text ? banner.text.replace(/Linkora/gi, 'Kollabrix') : '';
  const bannerLinkText = banner.linkText ? banner.linkText.replace(/Linkora/gi, 'Kollabrix') : '';

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
      {/* Subtle bottom ambient glow ray */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent pointer-events-none" />

      <div className="w-full max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 flex items-center justify-between gap-3">
        {/* Left / Center content */}
        <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${themeStyle.badge}`}>
            <Megaphone className="w-3 h-3 shrink-0 text-amber-400" />
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
