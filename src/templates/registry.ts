/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Template Registry for Mnasbati platform.
 * Registers and exposes the 10 official production invitation templates.
 */

import { TemplateDefinition } from '../types/engine';
import { OFFICIAL_TEMPLATE_CONFIGS } from './configs';
import { RoyalGoldTemplate } from './RoyalGoldTemplate';
import { ElegantPearlTemplate } from './ElegantPearlTemplate';
import { MoroccanPalaceTemplate } from './MoroccanPalaceTemplate';
import { BlackLuxuryTemplate } from './BlackLuxuryTemplate';
import { FloralRomanceTemplate } from './FloralRomanceTemplate';
import { SapphireNightTemplate } from './SapphireNightTemplate';
import { RoseRomanceTemplate } from './RoseRomanceTemplate';
import { EmeraldRoyalTemplate } from './EmeraldRoyalTemplate';
import { MinimalWhiteTemplate } from './MinimalWhiteTemplate';
import { GoldenSunsetTemplate } from './GoldenSunsetTemplate';
import { ClassicEleganceTemplate } from './ClassicEleganceTemplate';
import { RoyalMinimalistTemplate } from './RoyalMinimalistTemplate';

export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition> = {
  // 01 — Royal Gold
  'royal-gold': {
    id: 'royal-gold',
    slug: 'royal-gold',
    name: 'Royal Gold',
    nameAr: 'الذهب الملكي',
    description: 'Black + Gold luxury with 24K gold accents, double ornamental borders, and royal monogram crest.',
    descriptionAr: 'تصميم ملكي فاخر يجمع بين السواد الملكي والذهب الخالص عيار 24 مع إطارات ذهبية مزدوجة ووسام ملكي فخم.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['royal-gold'],
    defaultTheme: {
      primary_color: '#D4AF37',
      accent_color: '#D4AF37',
      background_color: '#0E0E11',
      text_color: '#F5F5F7',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: RoyalGoldTemplate,
  },

  // 02 — Elegant Pearl
  'elegant-pearl': {
    id: 'elegant-pearl',
    slug: 'elegant-pearl',
    name: 'Elegant Pearl',
    nameAr: 'اللؤلؤ الأنيق',
    description: 'Pearl White + Soft Gold luxury with warm ivory hues, embossed pearl frames, and refined calligraphy.',
    descriptionAr: 'فخامة هادئة ناصعة بلون اللؤلؤ الطبيعي والعاج الدافئ مع لمسات ذهب ناعمة وإطارات لؤلؤية بارزة.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['elegant-pearl'],
    defaultTheme: {
      primary_color: '#5A1020',
      accent_color: '#C9A45C',
      background_color: '#FAF9F6',
      text_color: '#1F1B1D',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: ElegantPearlTemplate,
  },

  // 03 — Moroccan Palace
  'moroccan-palace': {
    id: 'moroccan-palace',
    slug: 'moroccan-palace',
    name: 'Moroccan Palace',
    nameAr: 'القصر المغربي',
    description: 'Modern Moroccan luxury inspired by authentic Moroccan riad arches, zellij geometries, and Majorelle navy.',
    descriptionAr: 'أصالة مغربية فاخرة مستوحاة من الأقواس المعمارية والزليج التقليدي وأزرق الماجوريل مع النحاس العتيق.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['moroccan-palace'],
    defaultTheme: {
      primary_color: '#152C4D',
      accent_color: '#C5A059',
      background_color: '#FDFBF7',
      text_color: '#17202A',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: MoroccanPalaceTemplate,
  },

  // 04 — Black Luxury
  'black-luxury': {
    id: 'black-luxury',
    slug: 'black-luxury',
    name: 'Black Luxury',
    nameAr: 'الفخامة السوداء',
    description: 'Dark cinematic black + gold with high-contrast gold foil, moody lighting, and full-bleed hero.',
    descriptionAr: 'طابع سينمائي مهيب باللون الأسود الليلي الفاحم والذهب اللامع مع إضاءة درامية وتجربة بصرية فريدة.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['black-luxury'],
    defaultTheme: {
      primary_color: '#F3C64F',
      accent_color: '#F3C64F',
      background_color: '#08080A',
      text_color: '#EDEDF2',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: BlackLuxuryTemplate,
  },

  // 05 — Floral Romance
  'floral-romance': {
    id: 'floral-romance',
    slug: 'floral-romance',
    name: 'Floral Romance',
    nameAr: 'الرومانسية الزهرية',
    description: 'Elegant floral romantic style with soft botanical ivory, vintage rose, and delicate botanical garland.',
    descriptionAr: 'طابع رومانسي حالم بألوان الزهور الهادئة وإكليل نباتي رقيق يحيط بأسماء العروسين بلمسات وردية وذهبية.',
    category: 'wedding',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['floral-romance'],
    defaultTheme: {
      primary_color: '#7A3847',
      accent_color: '#C89382',
      background_color: '#FCF8F7',
      text_color: '#221A1D',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: FloralRomanceTemplate,
  },

  // 06 — Sapphire Night
  'sapphire-night': {
    id: 'sapphire-night',
    slug: 'sapphire-night',
    name: 'Sapphire Night',
    nameAr: 'الياقوت الأزرق',
    description: 'Deep blue + silver luxury with midnight celestial navy, starlight platinum accents, and celestial grandeur.',
    descriptionAr: 'فخامة سماء الليل الصافية بزرقة الياقوت الملكي ولمعان الفضة البلاتينية مع لمسات فلكية استثنائية.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['sapphire-night'],
    defaultTheme: {
      primary_color: '#4A90E2',
      accent_color: '#D0DEEE',
      background_color: '#0A1128',
      text_color: '#F0F4FC',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: SapphireNightTemplate,
  },

  // 07 — Rose Romance
  'rose-romance': {
    id: 'rose-romance',
    slug: 'rose-romance',
    name: 'Rose Romance',
    nameAr: 'الورد الملكي',
    description: 'Regal rose tones + warm brushed gold with dual-crest composition and tender celebratory lighting.',
    descriptionAr: 'تناغم دافئ بين درجات الورد المخملي والذهب المصقول، مصمم ليبرز رومانسية المناسبة بأرقى تفاصيل الخط والزخرفة.',
    category: 'wedding',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['rose-romance'],
    defaultTheme: {
      primary_color: '#A04354',
      accent_color: '#D4AF37',
      background_color: '#FDFBF7',
      text_color: '#2C1318',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: RoseRomanceTemplate,
  },

  // 08 — Emerald Royal
  'emerald-royal': {
    id: 'emerald-royal',
    slug: 'emerald-royal',
    name: 'Emerald Royal',
    nameAr: 'الزمرد الملكي',
    description: 'Emerald + gold royal style with imperial dark green, polished gold laurels, and palace majesty.',
    descriptionAr: 'أناقة سلطانية بدرجات الأخضر الزمردي المهيب وإطارات الذهب الخالص مع تيجان الغار الملكية.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['emerald-royal'],
    defaultTheme: {
      primary_color: '#0D422C',
      accent_color: '#D4AF37',
      background_color: '#051A10',
      text_color: '#F5EFE6',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: EmeraldRoyalTemplate,
  },

  // 09 — Minimal White
  'minimal-white': {
    id: 'minimal-white',
    slug: 'minimal-white',
    name: 'Minimal White',
    nameAr: 'البياض المعاصر',
    description: 'Minimal premium white design with pure gallery white, hairline graphite accents, and generous whitespace.',
    descriptionAr: 'بساطة عصرية راقية باللون الأبيض النقي وخطوط دقيقة مع تركيز تام على جمال الطباعة والمحتوى.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['minimal-white'],
    defaultTheme: {
      primary_color: '#171717',
      accent_color: '#A38F78',
      background_color: '#FAFAF8',
      text_color: '#171717',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: false,
      countdown: true,
      map: true,
    },
    component: MinimalWhiteTemplate,
  },

  // 10 — Golden Sunset
  'golden-sunset': {
    id: 'golden-sunset',
    slug: 'golden-sunset',
    name: 'Golden Sunset',
    nameAr: 'غروب الشمس الذهبي',
    description: 'Warm gold + sunset-inspired tones with radiant amber, terracotta warmth, and festive horizon glow.',
    descriptionAr: 'دفء ألوان الغروب المغربي بتدرجات العنبر الذهبي والتراكوتا المشمسة وأجواء احتفالية مشعة بالحياة.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['golden-sunset'],
    defaultTheme: {
      primary_color: '#B85D19',
      accent_color: '#E59F3D',
      background_color: '#FDF8F3',
      text_color: '#2D150B',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: GoldenSunsetTemplate,
  },

  // Legacy Aliases for Seamless Backward Compatibility
  'classic-elegance': {
    id: 'classic-elegance',
    slug: 'classic-elegance',
    name: 'Classic Elegance',
    nameAr: 'الأصالة الذهبية',
    description: 'A timeless royal luxury design with warm gold accents and refined Arabic calligraphy styling.',
    descriptionAr: 'تصميم ملكي فاخر يجمع بين دفء الذهب وتناغم الخط العربي الأنيق، مثالي للأعراس والخطوبات.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['royal-gold'],
    defaultTheme: {
      primary_color: '#5A1020',
      accent_color: '#C9A45C',
      background_color: '#FAF7F2',
      text_color: '#171316',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: true,
      countdown: true,
      map: true,
    },
    component: ClassicEleganceTemplate,
  },

  'royal-minimalist': {
    id: 'royal-minimalist',
    slug: 'royal-minimalist',
    name: 'Royal Minimalist',
    nameAr: 'الفخامة الهادئة',
    description: 'Sleek, understated modern luxury with clean lines and subtle champagne gold highlights.',
    descriptionAr: 'تصميم معاصر بخطوط راقية نقية وخلفية عاجية دافئة مع لمسات ذهبية هادئة للمناسبات الخاصة.',
    category: 'universal',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    previewImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
    version: '1.0.0',
    config: OFFICIAL_TEMPLATE_CONFIGS['minimal-white'],
    defaultTheme: {
      primary_color: '#171717',
      accent_color: '#A38F78',
      background_color: '#FAFAFA',
      text_color: '#171717',
      font_family_arabic: 'Amiri, serif',
      font_family_latin: 'Cinzel, serif',
    },
    supportedFeatures: {
      gallery: true,
      music: true,
      rsvp: true,
      video: false,
      countdown: true,
      map: true,
    },
    component: RoyalMinimalistTemplate,
  },
};

export const DEFAULT_TEMPLATE_ID = 'royal-gold';

/**
 * List of the 10 official production templates (excluding legacy aliases)
 */
export const OFFICIAL_TEMPLATE_IDS = [
  'royal-gold',
  'elegant-pearl',
  'moroccan-palace',
  'black-luxury',
  'floral-romance',
  'sapphire-night',
  'rose-romance',
  'emerald-royal',
  'minimal-white',
  'golden-sunset',
] as const;

export function getTemplateById(id?: string): TemplateDefinition {
  if (!id) return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
  // Check exact ID or alias
  if (TEMPLATE_REGISTRY[id]) return TEMPLATE_REGISTRY[id];
  return TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID];
}

/**
 * Returns all 10 official templates for catalog and selection
 */
export function getAllOfficialTemplates(): TemplateDefinition[] {
  return OFFICIAL_TEMPLATE_IDS.map((id) => TEMPLATE_REGISTRY[id]);
}

/**
 * Returns all templates including legacy aliases
 */
export function getAllTemplates(): TemplateDefinition[] {
  return getAllOfficialTemplates();
}
