/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Moroccan phone number normalization, validation, and formatting utility for Mnasbati.
 * Handles Moroccan mobile (06, 07), fixed lines (05), and international prefixes (+212, 00212).
 */

/**
 * Strips all non-digit characters except leading '+'
 */
export function extractDigits(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Checks if a string is a valid Moroccan phone number.
 * Moroccan numbers have 9 digits after country code 212, starting with 5, 6, 7, or 8.
 * Examples of valid inputs:
 *  - 0661234567
 *  - 0770123456
 *  - 0522123456
 *  - +212661234567
 *  - +212 661-234567
 *  - 00212661234567
 *  - 661234567
 */
export function isValidMoroccanPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');

  // If starts with 212 or 00212
  if (digits.startsWith('00212') && digits.length === 14) {
    const national = digits.slice(5);
    return /^[5678]\d{8}$/.test(national);
  }
  if (digits.startsWith('212') && digits.length === 12) {
    const national = digits.slice(3);
    return /^[5678]\d{8}$/.test(national);
  }
  // Local with leading 0 (e.g. 0661234567)
  if (digits.startsWith('0') && digits.length === 10) {
    const national = digits.slice(1);
    return /^[5678]\d{8}$/.test(national);
  }
  // 9 digits without leading 0
  if (digits.length === 9) {
    return /^[5678]\d{8}$/.test(digits);
  }

  return false;
}

/**
 * Normalizes any valid Moroccan phone into standard international display format:
 * e.g., "+212 661-234567"
 * If input cannot be parsed as a standard Moroccan phone, returns the cleaned trimmed string.
 */
export function normalizeMoroccanPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  let national = '';
  if (digits.startsWith('00212') && digits.length >= 14) {
    national = digits.slice(5, 14);
  } else if (digits.startsWith('212') && digits.length >= 12) {
    national = digits.slice(3, 12);
  } else if (digits.startsWith('0') && digits.length >= 10) {
    national = digits.slice(1, 10);
  } else if (digits.length === 9) {
    national = digits;
  }

  if (national && national.length === 9 && /^[5678]/.test(national)) {
    const prefix = national.slice(0, 3);
    const suffix = national.slice(3);
    return `+212 ${prefix}-${suffix}`;
  }

  // Fallback: trimmed string
  return phone.trim();
}

/**
 * Normalizes phone into pure E.164-compatible numerical string for indexing & duplicate comparison:
 * e.g., "212661234567"
 */
export function getPhoneComparableKey(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('00212')) {
    return digits.slice(2);
  }
  if (digits.startsWith('212')) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `212${digits.slice(1)}`;
  }
  if (digits.length === 9 && /^[5678]/.test(digits)) {
    return `212${digits}`;
  }

  return digits;
}

/**
 * Compares two phone strings regardless of whitespace, dashes, or international prefix formats.
 */
export function isSamePhoneNumber(phoneA: string, phoneB: string): boolean {
  const keyA = getPhoneComparableKey(phoneA);
  const keyB = getPhoneComparableKey(phoneB);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
}

/**
 * Standard list of Moroccan cities for auto-complete and standardized filtering.
 */
export const MOROCCAN_CITIES: readonly string[] = [
  'الدار البيضاء',
  'الرباط',
  'مراكش',
  'فاس',
  'طنجة',
  'أكادير',
  'مكناس',
  'وجدة',
  'القنيطرة',
  'تطوان',
  'العيون',
  'الجديدة',
  'آسفي',
  'بني ملال',
  'المحمدية',
  'خريبكة',
  'الناظور',
  'تازة',
  'سطات',
  'برشيد',
  'الصويرة',
  'العرائش',
  'ورزازات',
  'تارودانت',
  'الداخلة',
  'الحسيمة',
  'كلميم',
  'إفران',
  'سلا',
  'تمارة',
];

/**
 * Validates whether a phone number is a valid WhatsApp mobile number.
 * Specifically checks Moroccan mobile numbers (06, 07, +2126, +2127) or international numbers.
 */
export function isValidWhatsAppNumber(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return false;

  // Moroccan mobile detection (6 or 7)
  if (digits.startsWith('00212') && digits.length === 14) {
    return /^[67]\d{8}$/.test(digits.slice(5));
  }
  if (digits.startsWith('212') && digits.length === 12) {
    return /^[67]\d{8}$/.test(digits.slice(3));
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return /^[67]\d{8}$/.test(digits.slice(1));
  }
  if (digits.length === 9) {
    return /^[67]\d{8}$/.test(digits);
  }

  // Non-Moroccan international numbers: minimum 8 digits, maximum 15 digits (ITU-T E.164)
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Normalizes any Moroccan or international phone number into a unified E.164 international
 * format suitable for WhatsApp storage and communication:
 * e.g. "0661234567" -> "+212661234567"
 *      "+212 770 123 456" -> "+212770123456"
 *      "2126XXXXXXXX" -> "+2126XXXXXXXX"
 */
export function normalizeWhatsAppNumber(phone?: string | null): string {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  let national = '';
  if (digits.startsWith('00212') && digits.length >= 14) {
    national = digits.slice(5, 14);
  } else if (digits.startsWith('212') && digits.length >= 12) {
    national = digits.slice(3, 12);
  } else if (digits.startsWith('0') && digits.length >= 10) {
    national = digits.slice(1, 10);
  } else if (digits.length === 9 && /^[5678]/.test(digits)) {
    national = digits;
  }

  if (national && national.length === 9) {
    return `+212${national}`;
  }

  // International format fallback
  if (digits.length >= 8) {
    return `+${digits}`;
  }

  return phone.trim();
}

/**
 * Returns pure digits in E.164 format without '+' or spaces for official wa.me URLs.
 * e.g. "+212661234567" -> "212661234567"
 */
export function getWhatsAppDigits(phone?: string | null): string {
  if (!phone) return '';
  const normalized = normalizeWhatsAppNumber(phone);
  return normalized.replace(/\D/g, '');
}

/**
 * Builds official safe WhatsApp direct chat URL using wa.me mechanism.
 * Never uses suspicious redirectors or intermediate landing pages.
 */
export function buildWhatsAppChatUrl(phone: string, prefilledMessage?: string): string {
  const digits = getWhatsAppDigits(phone);
  if (!digits) return '';

  const baseUrl = `https://wa.me/${digits}`;
  if (!prefilledMessage || !prefilledMessage.trim()) {
    return baseUrl;
  }

  return `${baseUrl}?text=${encodeURIComponent(prefilledMessage.trim())}`;
}

/**
 * Builds official safe WhatsApp Share URL for public sharing of invitations.
 * Intentionally separated from host_whatsapp contact URL.
 */
export function buildWhatsAppShareUrl(shareText: string, invitationUrl?: string): string {
  const fullText = invitationUrl
    ? `${shareText.trim()}\n\n${invitationUrl.trim()}`
    : shareText.trim();

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
}

