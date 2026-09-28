/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file datetime.ts
 * Timezone-aware date/time parsing, formatting, and Google Maps URL validation.
 * Supports multi-locale (ar-MA, en-US, fr-FR, es-ES, de-DE, ber).
 */

import { EventType } from '../types/database';

export interface EventTypeTranslation {
  ar: string;
  en: string;
  fr: string;
  es: string;
  de: string;
  ber: string; // Amazigh / Tifinagh
  icon: string;
}

export const EVENT_TYPE_LABELS: Record<string, EventTypeTranslation> = {
  wedding: {
    ar: 'حفل زفاف',
    en: 'Wedding',
    fr: 'Mariage',
    es: 'Boda',
    de: 'Hochzeit',
    ber: 'ⵜⴰⵎⵖⵔⴰ (Tamghra)',
    icon: '💍',
  },
  engagement: {
    ar: 'حفل خطوبة',
    en: 'Engagement',
    fr: 'Fiançailles',
    es: 'Compromiso',
    de: 'Verlobung',
    ber: 'ⵜⵓⵔⴰⴳⵜ (Touragt)',
    icon: '✨',
  },
  aqiqah: {
    ar: 'عقيقة ومولود مبارك',
    en: 'Aqiqah',
    fr: 'Aqiqah',
    es: 'Aqiqah',
    de: 'Aqiqah',
    ber: 'ⵜⴰⵎⵙⵙⵉⵔⵜ (Tamssirt)',
    icon: '👶',
  },
  birthday: {
    ar: 'عيد ميلاد',
    en: 'Birthday',
    fr: 'Anniversaire',
    es: 'Cumpleaños',
    de: 'Geburtstag',
    ber: 'ⵓⵙⴽⴰⵏ ⵏ ⵜⵍⴰⵍⵉⵜ',
    icon: '🎂',
  },
  graduation: {
    ar: 'حفل تخرج',
    en: 'Graduation',
    fr: 'Remise des diplômes',
    es: 'Graduación',
    de: 'Abschlussfeier',
    ber: 'ⴰⵙⵙⵓⴼⵖ (Assoufgh)',
    icon: '🎓',
  },
  anniversary: {
    ar: 'ذكرى سنوية',
    en: 'Anniversary',
    fr: 'Anniversaire de mariage',
    es: 'Aniversario',
    de: 'Jahrestag',
    ber: 'ⴰⴽⵜⵜⴰⵢ ⴰⵙⴳⴳⵯⴰⵙⴰⵏ',
    icon: '🥂',
  },
  family_event: {
    ar: 'مناسبة عائلية',
    en: 'Family Event',
    fr: 'Fête de famille',
    es: 'Evento familiar',
    de: 'Familienfeier',
    ber: 'ⵜⴰⵎⵙⵎⵓⵏⵜ ⵜⴰⵡⴰⵛⵓⵍⵜ',
    icon: '🏡',
  },
  family: {
    ar: 'مناسبة عائلية',
    en: 'Family Event',
    fr: 'Fête de famille',
    es: 'Evento familiar',
    de: 'Familienfeier',
    ber: 'ⵜⴰⵎⵙⵎⵓⵏⵜ ⵜⴰⵡⴰⵛⵓⵍⵜ',
    icon: '🏡',
  },
  private_event: {
    ar: 'مناسبة خاصة',
    en: 'Private Event',
    fr: 'Événement privé',
    es: 'Evento privado',
    de: 'Private Feier',
    ber: 'ⵜⴰⵎⵙⵎⵓⵏⵜ ⵜⵓⵙⵍⵉⴳⵜ',
    icon: '👑',
  },
  private: {
    ar: 'مناسبة خاصة',
    en: 'Private Event',
    fr: 'Événement privé',
    es: 'Evento privado',
    de: 'Private Feier',
    ber: 'ⵜⴰⵎⵙⵎⵓⵏⵜ ⵜⵓⵙⵍⵉⴳⵜ',
    icon: '👑',
  },
  other: {
    ar: 'أخرى',
    en: 'Other',
    fr: 'Autre',
    es: 'Otro',
    de: 'Sonstiges',
    ber: 'ⵡⴰⵢⵢⴰⴹ (Wayyad)',
    icon: '💌',
  },
};

/**
 * Validates whether a date string is a valid ISO date (YYYY-MM-DD)
 */
export function isValidDateString(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return false;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dateObj = new Date(y, m - 1, d);
  return (
    dateObj.getFullYear() === y &&
    dateObj.getMonth() === m - 1 &&
    dateObj.getDate() === d
  );
}

/**
 * Formats event time into a clean, localized format
 * Example: "19:30" -> "الساعة 19:30" (ar) or "19:30" (fr) or "7:30 PM" (en)
 */
export function formatEventTime(timeStr?: string, locale = 'ar-MA', force24h = true): string {
  if (!timeStr || !timeStr.trim()) return '';
  const { hours, minutes } = extractTimeComponents(timeStr);
  const pad = (n: number) => String(n).padStart(2, '0');

  const cleanTime = `${pad(hours)}:${pad(minutes)}`;

  if (locale.startsWith('ar')) {
    return `الساعة ${cleanTime}`;
  }

  if (locale.startsWith('fr') || locale.startsWith('de') || force24h) {
    return cleanTime;
  }

  // 12-hour format for English / Spanish if preferred
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${pad(minutes)} ${period}`;
}

/**
 * Validates Google Maps URL to protect against XSS or malformed protocols.
 */
export function isValidGoogleMapsUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Must start with http:// or https://
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Block dangerous patterns
    if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts hour and minute from various time strings:
 * e.g. "20:00", "8:00 PM", "ابتداءً من الساعة 20:30", "في تمام السابعة مساءً"
 */
export function extractTimeComponents(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 20, minutes: 0 }; // default evening 8:00 PM

  const clean = timeStr.trim();

  // Match 24h or 12h formats like "19:30" or "8:30 PM" or "08:30"
  const match24 = clean.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    let h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);

    const isPM = /pm|مساءً|م/i.test(clean) && !/am|صباحاً|ص/i.test(clean);
    const isAM = /am|صباحاً|ص/i.test(clean);

    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;

    return { hours: Math.min(23, Math.max(0, h)), minutes: Math.min(59, Math.max(0, m)) };
  }

  // Look for single hour e.g. "8 مساءً"
  const matchHourOnly = clean.match(/(\d{1,2})/);
  if (matchHourOnly) {
    let h = parseInt(matchHourOnly[1], 10);
    const isPM = /pm|مساءً|م/i.test(clean);
    if (isPM && h < 12) h += 12;
    return { hours: Math.min(23, Math.max(0, h)), minutes: 0 };
  }

  return { hours: 20, minutes: 0 };
}

/**
 * Calculates the exact UTC timestamp for an event in a specific timezone
 * without machine timezone distortion.
 * Default timezone: Africa/Casablanca (GMT+1 in summer, GMT+0 during Ramadan).
 */
export function getEventTargetTimestamp(
  dateIso?: string,
  timeStr?: string,
  timezone = 'Africa/Casablanca'
): number | null {
  if (!dateIso) return null;

  // Validate YYYY-MM-DD
  const dateMatch = dateIso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!dateMatch) return null;

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10);
  const day = parseInt(dateMatch[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const { hours, minutes } = extractTimeComponents(timeStr);

  try {
    // Construct ISO string for specified time
    const pad = (n: number) => String(n).padStart(2, '0');
    const localIsoString = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;

    // Accurate timezone calculation using Intl.DateTimeFormat
    // Format a known UTC test point in the target timezone to find offset
    const testDate = new Date(`${localIsoString}Z`);
    if (isNaN(testDate.getTime())) return null;

    // Use formatToParts with timeZone to resolve the exact local time in that timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(testDate);
    const partMap: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== 'literal') {
        partMap[p.type] = parseInt(p.value, 10);
      }
    }

    // Difference between UTC and target timezone
    const targetInTz = Date.UTC(
      partMap.year,
      partMap.month - 1,
      partMap.day,
      partMap.hour,
      partMap.minute,
      partMap.second
    );
    const offsetMs = targetInTz - testDate.getTime();

    // The actual UTC timestamp when it will be that local time in that timezone
    const desiredLocalUtc = Date.UTC(year, month - 1, day, hours, minutes, 0);
    return desiredLocalUtc - offsetMs;
  } catch {
    // Fallback: standard local date
    const fallback = new Date(`${dateIso}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    return isNaN(fallback.getTime()) ? null : fallback.getTime();
  }
}

/**
 * Formats event date according to specified locale.
 * Supported locales: ar-MA, en-US, fr-FR, es-ES, de-DE.
 */
export function formatEventDate(dateIso?: string, locale = 'ar-MA'): string {
  if (!dateIso) return '';

  try {
    const parts = dateIso.split('-');
    if (parts.length < 3) return dateIso;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dObj = new Date(y, m, d);

    if (isNaN(dObj.getTime())) return dateIso;

    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dObj);
  } catch {
    return dateIso;
  }
}

/**
 * Returns localized title for event type.
 */
export function getEventTypeLabel(eventType: EventType | string = 'wedding', locale = 'ar'): string {
  const norm = eventType.toLowerCase();
  const entry = EVENT_TYPE_LABELS[norm] || EVENT_TYPE_LABELS.other;
  if (locale.startsWith('en')) return entry.en;
  if (locale.startsWith('fr')) return entry.fr;
  if (locale.startsWith('es')) return entry.es;
  if (locale.startsWith('de')) return entry.de;
  if (locale.startsWith('ber') || locale.startsWith('zgh')) return entry.ber;
  return entry.ar;
}

/**
 * Generates Schema.org Event JSON-LD structure for SEO and rich snippets.
 */
export function generateEventStructuredData(options: {
  title: string;
  description?: string;
  eventType?: string;
  startDateIso?: string;
  endDateIso?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  googleMapsUrl?: string;
  imageUrl?: string;
  url?: string;
}): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: options.title,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  };

  if (options.description) schema.description = options.description;
  if (options.startDateIso) schema.startDate = options.startDateIso;
  if (options.endDateIso) schema.endDate = options.endDateIso;
  if (options.imageUrl) schema.image = [options.imageUrl];
  if (options.url) schema.url = options.url;

  if (options.venueName || options.venueAddress || options.venueCity) {
    schema.location = {
      '@type': 'Place',
      name: options.venueName || options.venueCity || 'مكان الحفل',
      address: {
        '@type': 'PostalAddress',
        streetAddress: options.venueAddress || '',
        addressLocality: options.venueCity || '',
        addressCountry: 'MA',
      },
    };
    if (options.googleMapsUrl && isValidGoogleMapsUrl(options.googleMapsUrl)) {
      schema.location.hasMap = options.googleMapsUrl;
    }
  }

  return schema;
}
