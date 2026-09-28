/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * In-Memory & LocalStorage Rate Limiting Protection.
 * Implements Requirements 13, 14, 15 of Prompt 19:
 * - Rate limiting against RSVP spam / automated floods
 * - Analytics event rate limiting
 * - Admin login attempt throttling
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private cache = new Map<string, RateLimitRecord>();

  /**
   * Evaluates if an action is within allowed threshold.
   * Uses a sliding window algorithm.
   */
  public checkLimit(
    key: string,
    maxRequests: number,
    windowSeconds: number
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const cutoff = now - windowMs;

    let record = this.cache.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.cache.set(key, record);
    }

    // Filter out old timestamps
    record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    // Record this attempt
    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: maxRequests - record.timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Resets rate limit for a specific key (e.g. after successful verified action).
   */
  public reset(key: string): void {
    this.cache.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Checks RSVP rate limit:
 * Max 5 submissions per 60 seconds per invitation/session.
 */
export function checkRsvpRateLimit(invitationId: string): { allowed: boolean; retryAfterSeconds: number } {
  const sessionKey = typeof window !== 'undefined' ? (sessionStorage.getItem('mnasbati_session_id') || 'local') : 'server';
  const key = `rsvp_${invitationId}_${sessionKey}`;
  const res = rateLimiter.checkLimit(key, 5, 60);
  return { allowed: res.allowed, retryAfterSeconds: res.retryAfterSeconds };
}

/**
 * Checks Login rate limit:
 * Max 5 failed attempts per 120 seconds.
 */
export function checkLoginRateLimit(email: string): { allowed: boolean; retryAfterSeconds: number } {
  const key = `login_${email.trim().toLowerCase()}`;
  const res = rateLimiter.checkLimit(key, 5, 120);
  return { allowed: res.allowed, retryAfterSeconds: res.retryAfterSeconds };
}
