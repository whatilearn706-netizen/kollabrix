/**
 * Kollabrix Enterprise Network Resilience Engine
 * Provides silent auto-retry with exponential backoff & jitter for network drops,
 * transient gateway timeouts (502/503/504), and college Wi-Fi NAT blips.
 */

export interface ResilientFetchOptions extends RequestInit {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  retryOnStatusCodes?: number[];
  fetchFn?: typeof fetch;
}

const DEFAULT_RETRYABLE_STATUSES = [408, 429, 502, 503, 504];

/**
 * Executes a fetch request with automatic retries on transient network failures.
 */
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: ResilientFetchOptions,
  customFetch?: typeof fetch
): Promise<Response> {
  const maxRetries = init?.maxRetries ?? 3;
  const initialDelayMs = init?.initialDelayMs ?? 350;
  const maxDelayMs = init?.maxDelayMs ?? 3000;
  const retryableStatuses = init?.retryOnStatusCodes ?? DEFAULT_RETRYABLE_STATUSES;
  
  // Use passed custom fetch (e.g. native originalFetch) to prevent circular recursion
  const nativeFetch = customFetch || init?.fetchFn || (typeof window !== 'undefined' && (window as any).__kollabrix_native_fetch ? (window as any).__kollabrix_native_fetch : fetch);

  let attempt = 0;

  while (true) {
    try {
      // Check if aborted prior to dispatch
      if (init?.signal?.aborted) {
        throw new DOMException('Request was aborted by caller', 'AbortError');
      }

      const response = await nativeFetch(input, init);

      // If status is transient server overload (502/503/504), attempt retry
      if (retryableStatuses.includes(response.status) && attempt < maxRetries) {
        attempt++;
        const jitter = Math.floor(Math.random() * 150);
        const delay = Math.min(initialDelayMs * Math.pow(2, attempt - 1) + jitter, maxDelayMs);

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, delay);
          if (init?.signal) {
            init.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new DOMException('Request was aborted during retry wait', 'AbortError'));
            }, { once: true });
          }
        });

        continue;
      }

      return response;
    } catch (err: any) {
      // If caller intentionally aborted, do not retry
      if (err?.name === 'AbortError') {
        throw err;
      }

      attempt++;

      // If we exceeded max retries, propagate error
      if (attempt > maxRetries) {
        throw err;
      }

      // Calculate exponential backoff with jitter
      const jitter = Math.floor(Math.random() * 200);
      const delay = Math.min(initialDelayMs * Math.pow(2, attempt - 1) + jitter, maxDelayMs);

      // Wait before next attempt
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, delay);
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Request was aborted during network error backoff', 'AbortError'));
          }, { once: true });
        }
      });
    }
  }
}

/**
 * Attaches client-side network resilience to global window.fetch.
 * Strictly targets /api/ endpoints so Next.js internal router navigation is never intercepted.
 */
export function initializeClientNetworkResilience(): () => void {
  if (typeof window === 'undefined') return () => {};

  if ((window as any).__kollabrix_resilience_active) {
    return () => {};
  }

  const originalFetch = window.fetch.bind(window);
  (window as any).__kollabrix_native_fetch = originalFetch;
  (window as any).__kollabrix_resilience_active = true;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString =
      typeof input === 'string'
        ? input
        : input instanceof URL
        ? input.toString()
        : (input as Request)?.url || '';

    // Strictly intercept /api/ requests (forms, verification, database operations)
    // Never intercept Next.js RSC chunks, static files, or router navigation
    const isApiRequest =
      urlString.startsWith('/api/') ||
      urlString.includes('/api/') ||
      urlString.includes('/auth/v1/');

    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    return resilientFetch(
      input,
      {
        ...init,
        maxRetries: 2, // 2 quick silent background retries on Wi-Fi drops
        initialDelayMs: 300,
      },
      originalFetch // Explicitly pass native un-monkey-patched fetch
    );
  };

  return () => {
    window.fetch = originalFetch;
    delete (window as any).__kollabrix_native_fetch;
    delete (window as any).__kollabrix_resilience_active;
  };
}
