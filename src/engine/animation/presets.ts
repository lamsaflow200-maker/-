/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Animation Presets for Mnasbati's 10 Official Templates.
 * Each template receives a tailored animation aesthetic fitting its luxury narrative.
 */

import { MOTION_DURATIONS, MOTION_EASINGS } from './tokens';

export type SectionRevealStyle =
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'fade'
  | 'scale'
  | 'blur-to-clear'
  | 'clip-reveal'
  | 'mask-reveal';

export type TextRevealStyle = 'fade' | 'slide-up' | 'words' | 'blur' | 'mask';

export type ImageRevealStyle = 'fade' | 'scale' | 'clip' | 'mask' | 'blur-to-clear';

export interface TemplateAnimationPreset {
  id: string;
  name: string;
  nameAr: string;
  /** Primary reveal style for page sections */
  sectionReveal: SectionRevealStyle;
  /** Reveal duration for main sections (ms) */
  sectionDuration: number;
  /** Inter-element stagger delay (ms: 40–100ms) */
  staggerDelay: number;
  /** Primary easing curve */
  easing: string;
  /** Typography reveal style for titles */
  textReveal: TextRevealStyle;
  /** Image reveal style */
  imageReveal: ImageRevealStyle;
  /** Parallax intensity factor (0.00 – 0.12) */
  parallaxFactor: number;
  /** Ambient soft glow accents */
  glowAccent: boolean;
  /** Subtle accent color */
  accentGlowColor: string;
}

export const TEMPLATE_ANIMATION_PRESETS: Record<string, TemplateAnimationPreset> = {
  // 01 — Royal Gold: Royal Majestic
  'royal-gold': {
    id: 'royal-gold',
    name: 'Royal Majestic',
    nameAr: 'الفخامة الملكية المهيبة',
    sectionReveal: 'slide-up',
    sectionDuration: 700,
    staggerDelay: 80,
    easing: MOTION_EASINGS.easeLuxury,
    textReveal: 'mask',
    imageReveal: 'scale',
    parallaxFactor: 0.08,
    glowAccent: true,
    accentGlowColor: 'rgba(212, 175, 55, 0.25)',
  },

  // 02 — Elegant Pearl: Soft Editorial
  'elegant-pearl': {
    id: 'elegant-pearl',
    name: 'Soft Editorial',
    nameAr: 'اللمسة التحريرية الهادئة',
    sectionReveal: 'blur-to-clear',
    sectionDuration: 620,
    staggerDelay: 60,
    easing: MOTION_EASINGS.easeSpringSoft,
    textReveal: 'blur',
    imageReveal: 'blur-to-clear',
    parallaxFactor: 0.05,
    glowAccent: false,
    accentGlowColor: 'rgba(201, 164, 92, 0.18)',
  },

  // 03 — Moroccan Palace: Architectural Arch Reveal
  'moroccan-palace': {
    id: 'moroccan-palace',
    name: 'Architectural Arch Reveal',
    nameAr: 'الأقواس المعمارية والزليج',
    sectionReveal: 'clip-reveal',
    sectionDuration: 650,
    staggerDelay: 70,
    easing: MOTION_EASINGS.easeCinematic,
    textReveal: 'words',
    imageReveal: 'mask',
    parallaxFactor: 0.09,
    glowAccent: true,
    accentGlowColor: 'rgba(197, 160, 89, 0.22)',
  },

  // 04 — Black Luxury: Cinematic Minimal
  'black-luxury': {
    id: 'black-luxury',
    name: 'Cinematic Minimal',
    nameAr: 'الظلام السينمائي الفاخر',
    sectionReveal: 'scale',
    sectionDuration: 800,
    staggerDelay: 90,
    easing: MOTION_EASINGS.easeCinematic,
    textReveal: 'mask',
    imageReveal: 'scale',
    parallaxFactor: 0.10,
    glowAccent: true,
    accentGlowColor: 'rgba(212, 175, 55, 0.3)',
  },

  // 05 — Floral Romance: Organic Bloom
  'floral-romance': {
    id: 'floral-romance',
    name: 'Organic Bloom',
    nameAr: 'تفتح الأزهار الرومانسي',
    sectionReveal: 'scale',
    sectionDuration: 550,
    staggerDelay: 50,
    easing: MOTION_EASINGS.easeSmooth,
    textReveal: 'fade',
    imageReveal: 'blur-to-clear',
    parallaxFactor: 0.06,
    glowAccent: false,
    accentGlowColor: 'rgba(230, 165, 178, 0.22)',
  },

  // 06 — Sapphire Night: Star Dust Glow
  'sapphire-night': {
    id: 'sapphire-night',
    name: 'Star Dust Glow',
    nameAr: 'بريق الغبش والنجوم الملكية',
    sectionReveal: 'fade',
    sectionDuration: 680,
    staggerDelay: 75,
    easing: MOTION_EASINGS.easeLuxury,
    textReveal: 'words',
    imageReveal: 'fade',
    parallaxFactor: 0.11,
    glowAccent: true,
    accentGlowColor: 'rgba(88, 166, 255, 0.25)',
  },

  // 07 — Rose Romance: Romantic Flow
  'rose-romance': {
    id: 'rose-romance',
    name: 'Romantic Flow',
    nameAr: 'الانسيابية الشاعرية الراقية',
    sectionReveal: 'slide-up',
    sectionDuration: 580,
    staggerDelay: 60,
    easing: MOTION_EASINGS.easeSmooth,
    textReveal: 'words',
    imageReveal: 'scale',
    parallaxFactor: 0.07,
    glowAccent: true,
    accentGlowColor: 'rgba(217, 131, 148, 0.22)',
  },

  // 08 — Emerald Royal: Emerald Crest
  'emerald-royal': {
    id: 'emerald-royal',
    name: 'Emerald Crest',
    nameAr: 'الهيبة الزمردية المتزنة',
    sectionReveal: 'slide-up',
    sectionDuration: 640,
    staggerDelay: 70,
    easing: MOTION_EASINGS.easeLuxury,
    textReveal: 'slide-up',
    imageReveal: 'mask',
    parallaxFactor: 0.08,
    glowAccent: true,
    accentGlowColor: 'rgba(74, 222, 128, 0.2)',
  },

  // 09 — Minimal White: Quiet Modern
  'minimal-white': {
    id: 'minimal-white',
    name: 'Quiet Modern',
    nameAr: 'العصرية الهادئة النقية',
    sectionReveal: 'fade',
    sectionDuration: 380,
    staggerDelay: 45,
    easing: MOTION_EASINGS.easeStandard,
    textReveal: 'fade',
    imageReveal: 'fade',
    parallaxFactor: 0.03,
    glowAccent: false,
    accentGlowColor: 'rgba(15, 23, 42, 0.08)',
  },

  // 10 — Golden Sunset: Warm Radiance
  'golden-sunset': {
    id: 'golden-sunset',
    name: 'Warm Radiance',
    nameAr: 'الإشراقة الذهبية الدافئة',
    sectionReveal: 'slide-up',
    sectionDuration: 700,
    staggerDelay: 80,
    easing: MOTION_EASINGS.easeLuxury,
    textReveal: 'mask',
    imageReveal: 'scale',
    parallaxFactor: 0.09,
    glowAccent: true,
    accentGlowColor: 'rgba(245, 158, 11, 0.25)',
  },
};

/** Default fallback animation preset */
export const DEFAULT_ANIMATION_PRESET: TemplateAnimationPreset = {
  id: 'classic-elegance',
  name: 'Classical Elegance',
  nameAr: 'الأناقة الكلاسيكية',
  sectionReveal: 'slide-up',
  sectionDuration: MOTION_DURATIONS.normal,
  staggerDelay: 60,
  easing: MOTION_EASINGS.easeLuxury,
  textReveal: 'slide-up',
  imageReveal: 'fade',
  parallaxFactor: 0.06,
  glowAccent: true,
  accentGlowColor: 'rgba(201, 164, 92, 0.2)',
};

/**
 * Resolve the template's animation preset with smart fallback.
 */
export const getAnimationPreset = (templateId?: string): TemplateAnimationPreset => {
  if (!templateId) return DEFAULT_ANIMATION_PRESET;
  const normalizedId = templateId.toLowerCase().trim();
  return TEMPLATE_ANIMATION_PRESETS[normalizedId] || DEFAULT_ANIMATION_PRESET;
};
