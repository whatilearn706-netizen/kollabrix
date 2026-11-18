/**
 * Collegiate & Campus-Scale High-Capacity Rate Limiter
 * Designed for 1500+ Concurrent Students on Shared Campus Wi-Fi NATs
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic garbage collection every 5 minutes to prevent memory leaks under heavy load
if (typeof setInterval !== 'undefined') {
  const gcTimer = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now - entry.windowStart > 120000 && entry.blockedUntil < now) {
        store.delete(key);
      }
    });
  }, 5 * 60 * 1000);
  if (gcTimer.unref) gcTimer.unref();
}

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
 * Collegiate & Campus-Scale Rate Limiter (Supports 1500+ Concurrent Students):
 * - If `userId` is present, rate-limits strictly per individual user (`user:<userId>`), allowing
 *   thousands of students to work simultaneously from the same campus Wi-Fi NAT.
 * - If no `userId` is present, falls back to `campus_ip:<ip>` with a high collegiate threshold
 *   (default 10,000 req/min) so lab machines or shared NAT IPs are never falsely blocked.
 */
export function checkUserOrCampusRateLimit(
  userId: string | null | undefined,
  ip: string,
  userMaxRequests: number,
  userWindowMs: number,
  campusMaxRequests: number = 10000,
  campusWindowMs: number = 60 * 1000
): { allowed: boolean; retryAfterMs?: number } {
  const cleanUser = userId ? String(userId).trim() : '';
  if (cleanUser && cleanUser !== 'unknown' && cleanUser !== 'null' && cleanUser !== 'undefined') {
    return checkIpRateLimit(`user:${cleanUser}`, userMaxRequests, userWindowMs);
  }
  return checkIpRateLimit(`campus_ip:${ip || 'unknown'}`, campusMaxRequests, campusWindowMs);
}

/** 
 * Extract authoritative client IP behind Cloudflare and Nginx reverse proxy.
 * Cloudflare's `cf-connecting-ip` is prioritized because it is guaranteed and
 * authenticated by Cloudflare's global edge network.
 */
export function getClientIp(request: Request): string {
  const headers = (request as any).headers as Headers;
  return (
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}
