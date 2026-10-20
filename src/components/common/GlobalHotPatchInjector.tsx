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

    // Security: never execute remotely supplied JavaScript in the public page.

  };

  // Re-apply styles and scripts on route transitions (SPA navigation)
  useEffect(() => {
    if (hotpatch) {
      applyPatch(hotpatch);
    }
  }, [pathname]);

  useEffect(() => {
    // Public display settings are fetched from the public endpoint.
    // Do not trust cached admin configuration in the public page.
    try {
      localStorage.removeItem('linkora_hotpatch_v1');
    } catch (e) {}

    // 2. Fetch fresh patch from server
    const fetchPatch = async () => {
      try {
        const res = await fetch(`/api/public/hotpatch?_t=${Date.now()}`);
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

    return () => {
      window.removeEventListener('linkora_hotpatch_updated', handleUpdate);
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
