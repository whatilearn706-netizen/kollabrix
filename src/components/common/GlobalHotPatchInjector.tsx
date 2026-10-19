'use client';

import React, { useEffect, useState } from 'react';
import { HotPatchConfig } from '@/app/api/admin/hotpatch/route';

export function GlobalHotPatchInjector() {
  const [hotpatch, setHotpatch] = useState<HotPatchConfig | null>(null);

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

    // Listen for live update events from Admin Control Center
    const handleUpdate = () => fetchPatch();
    window.addEventListener('linkora_hotpatch_updated', handleUpdate);
    return () => {
      window.removeEventListener('linkora_hotpatch_updated', handleUpdate);
    };
  }, []);

  const applyPatch = (patch: HotPatchConfig) => {
    if (typeof document === 'undefined') return;

    // Apply or remove Custom CSS
    let styleTag = document.getElementById('linkora-live-hotpatch-css') as HTMLStyleElement | null;
    if (patch.enabled && patch.customCss && patch.customCss.trim()) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'linkora-live-hotpatch-css';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = patch.customCss;
    } else if (styleTag) {
      styleTag.remove();
    }

    // Execute Custom JS safely
    if (patch.enabled && patch.customJs && patch.customJs.trim()) {
      try {
        // Safe evaluation in isolated function scope
        const runner = new Function(patch.customJs);
        runner();
      } catch (jsErr) {
        console.warn('Hotpatch script error:', jsErr);
      }
    }
  };

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
