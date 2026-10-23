'use client';

import React from 'react';
import { LightRays } from '@/components/ui/light-rays';
import { useSiteTheme } from '@/components/theme/SiteThemeProvider';

export function GlobalLightRays() {
  const { isDark } = useSiteTheme();

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
        color={isDark ? 'rgba(251, 191, 36, 0.18)' : 'rgba(245, 158, 11, 0.22)'}
        opacity={0.65}
      />
    </div>
  );
}
