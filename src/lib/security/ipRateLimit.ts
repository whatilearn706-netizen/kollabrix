/**
 * Simple in-process IP-based rate limiter.
 * Suitable for Vercel serverless (per-instance), adds a meaningful friction layer
 * against casual spam without requiring Redis.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check whether a given key (IP or user id) is allowed to proceed.
 *
 * @param key          - Unique identifier (e.g. IP address or userId)
 * @param maxRequests  - Maximum requests allowed per window
 * @param windowMs     - Rolling window duration in milliseconds
 * @param blockMs      - How long to block after limit is exceeded
 */
export function checkIpRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  blockMs: number = windowMs
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  let entry = store.get(key);

  // If actively blocked, reject early
  if (entry && entry.blockedUntil > now) {
    return { allowed: false, retryAfterMs: entry.blockedUntil - now };
  }

  // Reset window if expired
  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now, blockedUntil: 0 };
  }

  entry.count += 1;

  if (entry.count > maxRequests) {
    entry.blockedUntil = now + blockMs;
    store.set(key, entry);
    return { allowed: false, retryAfterMs: blockMs };
  }

  store.set(key, entry);
  return { allowed: true };
}

/**
 * Collegiate & Campus-Scale Rate Limiter (Supports 1000+ Concurrent Students):
 * - If `userId` is present, rate-limits per individual user (`user:<userId>`), allowing
 *   hundreds or thousands of students to work simultaneously from the same campus Wi-Fi NAT.
 * - If no `userId` is present, falls back to `campus_ip:<ip>` with a high collegiate threshold
 *   (default 3000 req/min) so lab machines or shared NAT IPs are never falsely blocked.
 */
export function checkUserOrCampusRateLimit(
  userId: string | null | undefined,
  ip: string,
  userMaxRequests: number,
  userWindowMs: number,
  campusMaxRequests: number = 3000,
  campusWindowMs: number = 60 * 1000
): { allowed: boolean; retryAfterMs?: number } {
  const cleanUser = userId ? String(userId).trim() : '';
  if (cleanUser && cleanUser !== 'unknown' && cleanUser !== 'null' && cleanUser !== 'undefined') {
    return checkIpRateLimit(`user:${cleanUser}`, userMaxRequests, userWindowMs);
  }
  return checkIpRateLimit(`campus_ip:${ip || 'unknown'}`, campusMaxRequests, campusWindowMs);
}

/** Extract a best-effort client IP from a Next.js NextRequest */
export function getClientIp(request: Request): string {
  const headers = (request as any).headers as Headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
