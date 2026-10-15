import crypto from 'crypto';

/**
 * Strong salted password hashing using Node.js crypto.scryptSync
 */
export function hashHackathonPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Constant-time verification of candidate password against stored salt and hash
 */
export function verifyHackathonPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const bufA = Buffer.from(candidateHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');

    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

/**
 * Generate a non-guessable, URL-safe join code for private college hackathons
 */
export function generateJoinCode(): string {
  // e.g. "hack-7a2f9c"
  const rand = crypto.randomBytes(4).toString('hex');
  return `col-${rand}`;
}

/**
 * Server-side Abuse & Rate Limiting Tracker
 * Max 5 failed attempts per IP/User per 5 minutes
 */
interface AttemptRecord {
  count: number;
  blockedUntil: number;
}

const failedAttemptsMap = new Map<string, AttemptRecord>();

export function checkRateLimit(key: string): { allowed: boolean; remainingWaitMs?: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil > now) {
    return { allowed: false, remainingWaitMs: record.blockedUntil - now };
  }

  // Cooldown passed
  if (record.blockedUntil <= now && record.count >= 5) {
    failedAttemptsMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(key) || { count: 0, blockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    record.blockedUntil = now + 5 * 60 * 1000; // 5 minute lock
  }

  failedAttemptsMap.set(key, record);
}

export function resetFailedAttempts(key: string): void {
  failedAttemptsMap.delete(key);
}
