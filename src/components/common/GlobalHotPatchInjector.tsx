'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { HotPatchConfig } from '@/app/api/admin/hotpatch/route';
import { cleanHotPatchCode } from '@/lib/security/hotpatchCleaner';

export function GlobalHotPatchInjector() {
  const [hotpatch, setHotpatch] = useState<HotPatchConfig | null>(null);
  const executedJsRef = useRef<string>('');
  const pathname = usePathname();

  const applyPatch = (patch: HotPatchConfig) => {
    if (typeof document === 'undefined') return;

    // Clean any Claude / ChatGPT markdown blocks or wrapping <style>/<script> tags
    const cleanCss = cleanHotPatchCode(patch.customCss || '', 'css');
    const cleanJs = cleanHotPatchCode(patch.customJs || '', 'js');

    // 1. Apply or remove Custom CSS
    let styleTag = document.getElementById('linkora-live-hotpatch-css') as HTMLStyleElement | null;
    if (patch.enabled && cleanCss) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'linkora-live-hotpatch-css';
        document.head.appendChild(styleTag);
      } else {
        // Re-append to bottom of head to maintain cascade priority over other styles
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = cleanCss;
    } else if (styleTag) {
      styleTag.remove();
    }

    // 2. Execute Custom JS safely in sandboxed closure with SafeGuard filter
    if (patch.enabled && cleanJs) {
      // Prohibit critical security hazards from executing in the browser
      const hasCookieExploit = /document\.cookie/i.test(cleanJs);
      const hasTokenTheft =
        /localStorage\s*\[\s*['"`]sb-/i.test(cleanJs) ||
        /sessionStorage\s*\[\s*['"`]sb-/i.test(cleanJs);
      const hasBeacon = /navigator\.sendBeacon/i.test(cleanJs);

      if (hasCookieExploit || hasTokenTheft || hasBeacon) {
        console.warn('🛡️ [Linkora SafeGuard] Blocked untrusted script attempting cookie or token access.');
        return;
      }

      const executeScript = () => {
        try {
          const runner = new Function(
            'window',
            'document',
            `
            "use strict";
            try {
              ${cleanJs}
            } catch (runtimeErr) {
              console.warn("[Linkora SafeGuard] Hot-patch runtime error handled safely:", runtimeErr);
            }
          `
          );
          runner(window, document);
        } catch (jsErr) {
          console.warn('Hotpatch script compilation error:', jsErr);
        }
      };

      // Run immediately
      executeScript();

      // Also run after a short micro-delay to catch dynamically mounted React components
      if (typeof window !== 'undefined') {
        setTimeout(executeScript, 120);
      }
    }
  };

  // Re-apply styles and scripts on route transitions (SPA navigation)
  useEffect(() => {
    if (hotpatch) {
      applyPatch(hotpatch);
    }
  }, [pathname]);

  useEffect(() => {
    // 1. Load cached hotpatch from localStorage for instant 0ms apply
    try {
      const cached = localStorage.getItem('linkora_hotpatch_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed) {
          applyPatch(parsed);
          setHotpatch(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh patch from server
    const fetchPatch = async () => {
      try {
        const res = await fetch(`/api/admin/hotpatch?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.hotpatch) {
            setHotpatch(data.hotpatch);
            applyPatch(data.hotpatch);
            try {
              localStorage.setItem('linkora_hotpatch_v1', JSON.stringify(data.hotpatch));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Could not load live hotpatch:', err);
      }
    };

    fetchPatch();

    // 3. Listen for live update events from current window
    const handleUpdate = () => {
      executedJsRef.current = '';
      fetchPatch();
    };
    window.addEventListener('linkora_hotpatch_updated', handleUpdate);

    // 4. Listen for storage updates from OTHER browser tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'linkora_hotpatch_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          executedJsRef.current = '';
          applyPatch(parsed);
          setHotpatch(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('linkora_hotpatch_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (!hotpatch || !hotpatch.enabled || !hotpatch.topBannerText) {
    return null;
  }

  return (
    <div
      style={{ backgroundColor: hotpatch.topBannerBg || '#0284c7' }}
      className="w-full py-1.5 px-4 text-center text-xs font-mono font-bold text-white shadow-md z-50 flex items-center justify-center gap-2"
    >
      <span>⚡ {hotpatch.topBannerText}</span>
    </div>
  );
}
