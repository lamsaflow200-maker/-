/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Security & Input Sanitization Suite for Mnasbati Platform.
 * Implements Requirements 5, 6, 7, 8, 11, 14, 18, 64 of Prompt 19:
 * - XSS Prevention & Text Sanitization
 * - Safe URL Protocol Verification
 * - Slug Reserved Words Protection
 * - RSVP Input Boundary Checking
 * - Safe JSON Parsing
 */

/**
 * Reserved system route slugs that can never be claimed by an invitation
 */
export const RESERVED_SLUGS = new Set<string>([
  'admin',
  'api',
  'auth',
  'login',
  'logout',
  'dashboard',
  'invitations',
  'customers',
  'guests',
  'templates',
  'settings',
  'analytics',
  'qr',
  'i',
  'assets',
  'static',
  'public',
  'media',
  'webhook',
  'webhooks',
  'null',
  'undefined',
  'true',
  'false',
]);

/**
 * Checks if a slug is a reserved system path
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return true;
  const clean = slug.trim().toLowerCase();
  return RESERVED_SLUGS.has(clean);
}

/**
 * Sanitizes plain user text inputs:
 * - Strips HTML tags, script fragments, and malformed tags
 * - Eliminates javascript: or dangerous pseudo-protocols
 * - Truncates to max length
 */
export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';

  let sanitized = input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers e.g. onerror=, onclick=
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Strictly verifies whether a URL is safe for redirection or linking.
 * Allows ONLY valid https: or http: schemes.
 * Rejects javascript:, data:, file:, vbscript:, malformed schemes.
 */
export function isSafeUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    // Relative safe URLs like /i/sara-ahmed
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
      return true;
    }
    return false;
  }
}

/**
 * Validates Google Maps URLs to prevent malicious links.
 */
export function isValidGoogleMapsUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    const isGoogleMapsHost =
      hostname === 'maps.google.com' ||
      hostname === 'www.google.com' ||
      hostname === 'goo.gl' ||
      hostname === 'maps.app.goo.gl' ||
      hostname.endsWith('.google.com') ||
      hostname.endsWith('.google.ma');

    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      isGoogleMapsHost
    );
  } catch {
    return false;
  }
}

/**
 * Enforces business boundaries on RSVP party size.
 * Rejects unrealistic numbers (e.g. 999999) or negative values.
 */
export function validateRsvpGuestCount(count: unknown, maxAllowed: number = 20): number {
  const num = typeof count === 'number' ? count : parseInt(String(count || 1), 10);
  if (isNaN(num) || num < 1) return 1;
  if (num > maxAllowed) return maxAllowed;
  return Math.floor(num);
}

/**
 * Safe JSON parser with fallback to prevent unhandled JSON.parse crashes.
 */
export function safeJsonParse<T>(jsonStr: unknown, fallback: T): T {
  if (typeof jsonStr !== 'string' || !jsonStr.trim()) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

/**
 * Formats a user-facing safe error message without leaking DB tables, column names, or stack traces.
 */
export function getSafeErrorMessage(error: unknown, fallbackAr: string = 'حدث خطأ أثناء تنفيذ العملية. يرجى المحاولة مرة أخرى.'): string {
  if (!error) return fallbackAr;

  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  // If the error message leaks DB or internal system info, mask it:
  if (
    lower.includes('supabase') ||
    lower.includes('postgres') ||
    lower.includes('relation') ||
    lower.includes('table') ||
    lower.includes('column') ||
    lower.includes('syntax') ||
    lower.includes('select') ||
    lower.includes('foreign key') ||
    lower.includes('rls') ||
    lower.includes('policy') ||
    lower.includes('jwt') ||
    lower.includes('token')
  ) {
    return fallbackAr;
  }

  // If it's already an Arabic friendly message, return it
  if (/[\u0600-\u06FF]/.test(rawMessage)) {
    return rawMessage;
  }

  return fallbackAr;
}
