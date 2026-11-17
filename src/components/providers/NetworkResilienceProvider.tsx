'use client';

import { useEffect } from 'react';
import { initializeClientNetworkResilience } from '@/lib/network/resilientFetch';

/**
 * Mounts global network resilience on the client.
 * Catches transient Wi-Fi packet drops and silently retries internal API calls.
 */
export function NetworkResilienceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = initializeClientNetworkResilience();
    return cleanup;
  }, []);

  return <>{children}</>;
}
