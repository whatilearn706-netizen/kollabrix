'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { LightRays } from '@/components/ui/light-rays';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

export function GlobalLightRays() {
  const pathname = usePathname();
  const { isDark } = useSiteTheme();

  if (pathname?.startsWith('/ka-ai') || pathname?.startsWith('/ka-codex')) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      <LightRays
        count={8}
        speed={14}
        blur={36}
        length="100vh"
        color={isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.16)'}
        opacity={0.65}
      />
    </div>
  );
}
