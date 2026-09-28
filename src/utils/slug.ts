/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isReservedSlug } from './security';

/**
 * @file Slug generation, transliteration, and sanitization utility for Mnasbati platform.
 * Supports clean URL creation from Arabic or Latin event titles and celebrant names.
 */

const ARABIC_TRANSLITERATION_MAP: Record<string, string> = {
  'أ': 'a', 'إ': 'i', 'آ': 'a', 'ا': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
  'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
  'م': 'm', 'ن': 'n', 'ه': 'h', 'ة': 'a',
  'و': 'w', 'ي': 'y', 'ى': 'a', 'ء': '', 'ئ': 'y', 'ؤ': 'w',
};

const COMMON_WORDS_MAP: Record<string, string> = {
  'زفاف': 'wedding',
  'عرس': 'wedding',
  'خطوبة': 'engagement',
  'عقيقة': 'aqiqah',
  'تخرج': 'graduation',
  'عيد ميلاد': 'birthday',
  'حفل': 'event',
  'دعوة': 'invite',
  'و': 'and',
};

/**
 * Clean a slug string to make it URL-safe:
 * - Lowercase
 * - Only a-z, 0-9, and dashes
 * - No consecutive dashes
 * - No leading or trailing dashes
 */
export function sanitizeSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates if a string is a valid slug format and not a reserved system path.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const trimmed = slug.trim().toLowerCase();
  if (isReservedSlug(trimmed)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed) && trimmed.length >= 3 && trimmed.length <= 80;
}

/**
 * Converts Arabic or Latin names/title to an intuitive, readable Latin slug.
 * Example: "سارة وأحمد" -> "sara-and-ahmed"
 * Example: "حفل زفاف سارة وأحمد" -> "wedding-sara-and-ahmed"
 */
export function generateSlugCandidate(text: string): string {
  if (!text) return '';

  let processed = text.trim().toLowerCase();

  // Replace common Arabic words with readable English equivalents
  Object.entries(COMMON_WORDS_MAP).forEach(([ar, en]) => {
    const reg = new RegExp(`\\b${ar}\\b`, 'g');
    processed = processed.replace(reg, en);
  });

  // Transliterate remaining Arabic characters
  let transliterated = '';
  for (const char of processed) {
    if (ARABIC_TRANSLITERATION_MAP[char] !== undefined) {
      transliterated += ARABIC_TRANSLITERATION_MAP[char];
    } else {
      transliterated += char;
    }
  }

  const cleaned = sanitizeSlug(transliterated);
  return cleaned || 'invitation';
}
