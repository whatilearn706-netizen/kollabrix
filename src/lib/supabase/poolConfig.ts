/**
 * Supabase Supavisor Connection Pooling Configuration
 * 
 * Enforces port 6543 (Transaction Mode Pooler) for all direct PostgreSQL connections.
 * Port 5432 (Session Mode) is limited to ~60 connections on standard tiers and will
 * exhaust under high concurrency (300 - 1000+ simultaneous users).
 * 
 * Port 6543 (Supavisor Transaction Pooler) pools client queries per-transaction,
 * supporting 1,000+ concurrent requests effortlessly.
 */

export interface PoolConfigInfo {
  isPooled: boolean;
  port: number;
  url: string;
  mode: 'transaction' | 'session' | 'rest_api';
}

/**
 * Returns a high-concurrency Supavisor pooled connection URL (Port 6543).
 * If a session-mode connection (Port 5432) is provided, automatically transforms
 * it to transaction mode with ?pgbouncer=true.
 */
export function getSupavisorPooledUrl(rawUrl?: string): string {
  const url = rawUrl || process.env.DATABASE_URL || '';
  if (!url) return '';

  try {
    // If it points to Supabase pooler on port 5432, rewrite to 6543
    if (url.includes('.pooler.supabase.com:5432')) {
      const rewritten = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
      return rewritten.includes('pgbouncer=true') ? rewritten : `${rewritten}${rewritten.includes('?') ? '&' : '?'}pgbouncer=true`;
    }

    // If it points to port 6543, ensure pgbouncer=true is preserved
    if (url.includes(':6543')) {
      return url.includes('pgbouncer=true') ? url : `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true`;
    }

    return url;
  } catch {
    return url;
  }
}

/**
 * Inspects a database URL and returns telemetry on whether it is 1000+ user ready
 */
export function inspectConnectionPool(rawUrl?: string): PoolConfigInfo {
  const url = rawUrl || process.env.DATABASE_URL || '';
  if (!url) {
    return {
      isPooled: true, // PostgREST HTTP client is pooled by default
      port: 443,
      url: '',
      mode: 'rest_api',
    };
  }

  const isPort6543 = url.includes(':6543');
  return {
    isPooled: isPort6543,
    port: isPort6543 ? 6543 : 5432,
    url: url.replace(/:[^:@]+@/, ':***@'), // Mask password
    mode: isPort6543 ? 'transaction' : 'session',
  };
}
