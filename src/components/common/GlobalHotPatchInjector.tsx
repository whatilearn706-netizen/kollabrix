'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { HotPatchConfig } from '@/app/api/admin/hotpatch/route';
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
        styleTag.textContent = cleanCss;
      } else if (styleTag.textContent !== cleanCss) {
        styleTag.textContent = cleanCss;
      }
    } else if (styleTag) {
      styleTag.remove();
    }

    // 2. Apply or remove Custom JS (Authoritative Admin HotPatch Desk)
    let scriptTag = document.getElementById('linkora-live-hotpatch-js') as HTMLScriptElement | null;
    if (patch.enabled && cleanJs) {
      // Deduplication Guard: If this exact JS is already injected and active, do not tear down
      // the DOM and re-execute. This prevents duplicate executions, flicker, and reload glitches.
      if (executedJsRef.current === cleanJs && scriptTag) {
        return;
      }

      if (scriptTag) {
        scriptTag.remove();
      }

      try {
        const newScript = document.createElement('script');
        newScript.id = 'linkora-live-hotpatch-js';
        newScript.type = 'text/javascript';
        newScript.textContent = `try { ${cleanJs} } catch (err) { console.warn("[Kollabrix HotPatch execution notice]:", err); }`;
        document.body.appendChild(newScript);
        executedJsRef.current = cleanJs;
      } catch (scriptErr) {
        console.warn('Could not inject live hotpatch JS:', scriptErr);
      }
    } else if (scriptTag) {
      scriptTag.remove();
      executedJsRef.current = '';
    }
  };

  // Re-apply styles and scripts on route transitions (SPA navigation)
  useEffect(() => {
    if (hotpatch) {
      applyPatch(hotpatch);
    }
  }, [pathname]);

  useEffect(() => {
    // 1. Instant 0ms load from localStorage so custom UI/dock renders immediately without flicker
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('linkora_hotpatch_v1');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            setHotpatch(parsed);
            applyPatch(parsed);
          }
        }
      } catch (e) {}
    }

    // 2. Fetch fresh patch from server & synchronize
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

    // 3. Listen for live update events
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
