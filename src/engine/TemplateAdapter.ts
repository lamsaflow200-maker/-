/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateStylePreset } from '../types/engine';
import { SectionType } from '../types/database';
import { TemplateConfig } from '../types/template';
import {
  ROYAL_GOLD_CONFIG,
  ELEGANT_PEARL_CONFIG,
  MOROCCAN_PALACE_CONFIG,
  BLACK_LUXURY_CONFIG,
  FLORAL_ROMANCE_CONFIG,
  SAPPHIRE_NIGHT_CONFIG,
  ROSE_ROMANCE_CONFIG,
  EMERALD_ROYAL_CONFIG,
  MINIMAL_WHITE_CONFIG,
  GOLDEN_SUNSET_CONFIG,
} from '../templates/configs';

export interface TemplateAdapterConfig {
  id: string;
  name: string;
  nameAr: string;
  config: TemplateConfig;
  style: TemplateStylePreset;
  defaultSectionOrder: SectionType[];
  showArabicCalligraphyOrnaments?: boolean;
  heroLayout?: 'overlay' | 'split' | 'card' | 'minimal' | 'cinematic' | 'arch';
}

function buildStylePresetFromConfig(cfg: TemplateConfig): TemplateStylePreset {
  return {
    fontFamilyArabic: cfg.typography.fontFamilyArabic,
    fontFamilyLatin: cfg.typography.fontFamilyLatin,
    primaryColor: cfg.colors.primary,
    accentColor: cfg.colors.accent,
    backgroundColor: cfg.colors.background,
    textColor: cfg.colors.text,
    cardBg: cfg.colors.cardBg || cfg.colors.surface,
    borderColor: cfg.colors.border,
    ornamentColor: cfg.colors.accent,
    buttonRadius: cfg.borders.buttonRadius,
    cardRadius: cfg.borders.cardRadius,
  };
}

/**
 * Standard complete section order for full-feature invitations
 */
const STANDARD_SECTION_ORDER: SectionType[] = [
  'hero',
  'story',
  'event_details',
  'location',
  'countdown',
  'gallery',
  'video',
  'rsvp',
  'contact',
];

/**
 * Registry of template adapter presets for all 10 official templates.
 */
export const TEMPLATE_ADAPTERS: Record<string, TemplateAdapterConfig> = {
  // 01 — Royal Gold
  'royal-gold': {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameAr: 'الذهب الملكي',
    config: ROYAL_GOLD_CONFIG,
    style: buildStylePresetFromConfig(ROYAL_GOLD_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'overlay',
  },

  // 02 — Elegant Pearl
  'elegant-pearl': {
    id: 'elegant-pearl',
    name: 'Elegant Pearl',
    nameAr: 'اللؤلؤ الأنيق',
    config: ELEGANT_PEARL_CONFIG,
    style: buildStylePresetFromConfig(ELEGANT_PEARL_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'card',
  },

  // 03 — Moroccan Palace
  'moroccan-palace': {
    id: 'moroccan-palace',
    name: 'Moroccan Palace',
    nameAr: 'القصر المغربي',
    config: MOROCCAN_PALACE_CONFIG,
    style: buildStylePresetFromConfig(MOROCCAN_PALACE_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'arch',
  },

  // 04 — Black Luxury
  'black-luxury': {
    id: 'black-luxury',
    name: 'Black Luxury',
    nameAr: 'الفخامة السوداء',
    config: BLACK_LUXURY_CONFIG,
    style: buildStylePresetFromConfig(BLACK_LUXURY_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'cinematic',
  },

  // 05 — Floral Romance
  'floral-romance': {
    id: 'floral-romance',
    name: 'Floral Romance',
    nameAr: 'الرومانسية الزهرية',
    config: FLORAL_ROMANCE_CONFIG,
    style: buildStylePresetFromConfig(FLORAL_ROMANCE_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: false,
    heroLayout: 'card',
  },

  // 06 — Sapphire Night
  'sapphire-night': {
    id: 'sapphire-night',
    name: 'Sapphire Night',
    nameAr: 'الياقوت الأزرق',
    config: SAPPHIRE_NIGHT_CONFIG,
    style: buildStylePresetFromConfig(SAPPHIRE_NIGHT_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'overlay',
  },

  // 07 — Rose Romance
  'rose-romance': {
    id: 'rose-romance',
    name: 'Rose Romance',
    nameAr: 'الورد الملكي',
    config: ROSE_ROMANCE_CONFIG,
    style: buildStylePresetFromConfig(ROSE_ROMANCE_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'split',
  },

  // 08 — Emerald Royal
  'emerald-royal': {
    id: 'emerald-royal',
    name: 'Emerald Royal',
    nameAr: 'الزمرد الملكي',
    config: EMERALD_ROYAL_CONFIG,
    style: buildStylePresetFromConfig(EMERALD_ROYAL_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'overlay',
  },

  // 09 — Minimal White
  'minimal-white': {
    id: 'minimal-white',
    name: 'Minimal White',
    nameAr: 'البياض المعاصر',
    config: MINIMAL_WHITE_CONFIG,
    style: buildStylePresetFromConfig(MINIMAL_WHITE_CONFIG),
    defaultSectionOrder: [
      'hero',
      'story',
      'event_details',
      'location',
      'countdown',
      'rsvp',
      'contact',
    ],
    showArabicCalligraphyOrnaments: false,
    heroLayout: 'minimal',
  },

  // 10 — Golden Sunset
  'golden-sunset': {
    id: 'golden-sunset',
    name: 'Golden Sunset',
    nameAr: 'غروب الشمس الذهبي',
    config: GOLDEN_SUNSET_CONFIG,
    style: buildStylePresetFromConfig(GOLDEN_SUNSET_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'overlay',
  },

  // Legacy Fallback Mappings
  'classic-elegance': {
    id: 'classic-elegance',
    name: 'Classic Elegance',
    nameAr: 'الأصالة الذهبية',
    config: ROYAL_GOLD_CONFIG,
    style: buildStylePresetFromConfig(ROYAL_GOLD_CONFIG),
    defaultSectionOrder: STANDARD_SECTION_ORDER,
    showArabicCalligraphyOrnaments: true,
    heroLayout: 'overlay',
  },

  'royal-minimalist': {
    id: 'royal-minimalist',
    name: 'Royal Minimalist',
    nameAr: 'الفخامة الهادئة',
    config: MINIMAL_WHITE_CONFIG,
    style: buildStylePresetFromConfig(MINIMAL_WHITE_CONFIG),
    defaultSectionOrder: [
      'hero',
      'story',
      'event_details',
      'location',
      'countdown',
      'rsvp',
      'contact',
    ],
    showArabicCalligraphyOrnaments: false,
    heroLayout: 'minimal',
  },
};

export const DEFAULT_ADAPTER_ID = 'royal-gold';

/**
 * Resolves a TemplateAdapter for any template ID, falling back to Royal Gold.
 * Injects any custom theme overrides while retaining the template's underlying config.
 */
export function resolveTemplateAdapter(
  templateId?: string,
  invitationOverrides?: Partial<TemplateStylePreset>
): TemplateAdapterConfig {
  const base = TEMPLATE_ADAPTERS[templateId || ''] || TEMPLATE_ADAPTERS[DEFAULT_ADAPTER_ID];

  if (!invitationOverrides) return base;

  // Filter out empty/undefined overrides
  const cleanOverrides: Partial<TemplateStylePreset> = {};
  for (const [key, value] of Object.entries(invitationOverrides)) {
    if (value && typeof value === 'string' && value.trim() !== '') {
      (cleanOverrides as any)[key] = value;
    }
  }

  return {
    ...base,
    style: {
      ...base.style,
      ...cleanOverrides,
    },
  };
}
