/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TemplateConfig } from '../types/template';

/**
 * 01 — Royal Gold
 * Black + Gold luxury: Deep obsidian, radiant 24K gold borders, imperial royal monogram.
 */
export const ROYAL_GOLD_CONFIG: TemplateConfig = {
  colors: {
    primary: '#D4AF37', // 24K Royal Gold
    secondary: '#EAC775',
    background: '#0E0E11', // Deep Obsidian Black
    surface: '#16161C', // Rich Dark Surface
    cardBg: '#181820',
    text: '#F5F5F7',
    mutedText: '#A19EA8',
    accent: '#D4AF37',
    border: '#3A3222',
    button: '#D4AF37',
    buttonText: '#0E0E11',
    badgeBg: '#2A2415',
    badgeText: '#EAC775',
    glow: 'rgba(212, 175, 55, 0.25)',
    divider: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'monumental',
    calligraphyStyle: 'thuluth',
    letterSpacing: '0.05em',
    lineHeight: '1.8',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.5rem',
    cardPadding: '2rem',
    elementGap: '1.25rem',
  },
  borders: {
    cardRadius: '1rem',
    buttonRadius: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'double',
    framePattern: 'royal-corners',
  },
  shadows: {
    cardShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.15)',
    glowEffect: '0 0 25px rgba(212, 175, 55, 0.3)',
    elevation: 'deep',
  },
  backgrounds: {
    type: 'texture',
    primaryGradient: 'radial-gradient(ellipse at 50% 15%, rgba(212, 175, 55, 0.12) 0%, #0E0E11 75%)',
    patternType: 'subtle-grain',
    patternOpacity: 0.15,
    overlayOpacity: 0.85,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'royal-crest',
    dividerOrnament: 'royal-shield',
    watermarkPattern: 'geometric-star',
    accentBadgeStyle: 'royal-banner',
  },
  buttons: {
    primaryBg: '#D4AF37',
    primaryText: '#0E0E11',
    primaryBorder: '#EAC775',
    primaryShadow: '0 4px 14px rgba(212, 175, 55, 0.35)',
    secondaryBg: 'transparent',
    secondaryText: '#D4AF37',
    secondaryBorder: '#D4AF37',
    radius: '0.75rem',
    style: 'luxury-gradient',
  },
  cards: {
    background: '#16161C',
    border: '#2E2718',
    radius: '1rem',
    shadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'royal-monogram',
    badgeStyle: 'royal-banner',
    showBismillah: true,
    bismillahStyle: 'calligraphy',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'royal-shield',
    badgeStyle: 'frame',
    cardStyle: 'double-frame',
  },
  animations: {
    preset: 'royal-reveal',
    duration: 1000,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

/**
 * 02 — Elegant Pearl
 * Pearl White + Soft Gold: Iridescent warm ivory, soft champagne gold, refined understated luxury.
 */
export const ELEGANT_PEARL_CONFIG: TemplateConfig = {
  colors: {
    primary: '#5A1020', // Burgundy Wine
    secondary: '#8C3B4D',
    background: '#FAF9F6', // Luminous Pearl
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#1F1B1D',
    mutedText: '#6E6669',
    accent: '#C9A45C', // Soft Champagne Gold
    border: '#E8DFD5',
    button: '#5A1020',
    buttonText: '#FAF9F6',
    badgeBg: '#F5EFEB',
    badgeText: '#5A1020',
    glow: 'rgba(201, 164, 92, 0.2)',
    divider: 'linear-gradient(90deg, transparent, #C9A45C, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'classic',
    calligraphyStyle: 'naskh',
    letterSpacing: '0.03em',
    lineHeight: '1.75',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.25rem',
    cardPadding: '1.75rem',
    elementGap: '1rem',
  },
  borders: {
    cardRadius: '1.25rem',
    buttonRadius: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'gold-embossed',
  },
  shadows: {
    cardShadow: '0 8px 30px rgba(90, 16, 32, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
    glowEffect: '0 0 20px rgba(201, 164, 92, 0.25)',
    elevation: 'subtle',
  },
  backgrounds: {
    type: 'mesh',
    primaryGradient: 'linear-gradient(180deg, #FAF9F6 0%, #F5EFEB 100%)',
    patternType: 'none',
    patternOpacity: 0.05,
    overlayOpacity: 0.9,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'pearl-bead',
    dividerOrnament: 'pearl-bead',
    watermarkPattern: 'arabesque',
    accentBadgeStyle: 'metallic-pill',
  },
  buttons: {
    primaryBg: '#5A1020',
    primaryText: '#FAF9F6',
    primaryBorder: '#8C3B4D',
    primaryShadow: '0 4px 16px rgba(90, 16, 32, 0.2)',
    secondaryBg: '#FFFFFF',
    secondaryText: '#5A1020',
    secondaryBorder: '#E8DFD5',
    radius: '0.75rem',
    style: 'soft-pill',
  },
  cards: {
    background: '#FFFFFF',
    border: '#E8DFD5',
    radius: '1.25rem',
    shadow: '0 6px 24px rgba(90, 16, 32, 0.04)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'pearl-embossed',
    badgeStyle: 'metallic-pill',
    showBismillah: true,
    bismillahStyle: 'classic',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'centered-flourish',
    badgeStyle: 'pill',
    cardStyle: 'embossed',
  },
  animations: {
    preset: 'luxury-fade',
    duration: 900,
    easing: 'ease-out',
  },
};

/**
 * 03 — Moroccan Palace
 * Modern Moroccan luxury with Moroccan decorative inspiration: Archways, zellij motif, rich majorelle & brass.
 */
export const MOROCCAN_PALACE_CONFIG: TemplateConfig = {
  colors: {
    primary: '#152C4D', // Royal Majorelle Navy
    secondary: '#1F3F6D',
    background: '#FDFBF7', // Moroccan Tadelakt Warm Ivory
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#17202A',
    mutedText: '#5D6D7E',
    accent: '#C5A059', // Antique Moroccan Brass
    border: '#E3D7C4',
    button: '#152C4D',
    buttonText: '#FDFBF7',
    badgeBg: '#F3ECE0',
    badgeText: '#152C4D',
    glow: 'rgba(197, 160, 89, 0.25)',
    divider: 'linear-gradient(90deg, transparent, #C5A059, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'classic',
    calligraphyStyle: 'diwani',
    letterSpacing: '0.04em',
    lineHeight: '1.8',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.5rem',
    cardPadding: '2rem',
    elementGap: '1.25rem',
  },
  borders: {
    cardRadius: '1.25rem',
    buttonRadius: '0.75rem',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    framePattern: 'moroccan-arch',
  },
  shadows: {
    cardShadow: '0 10px 32px rgba(21, 44, 77, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
    glowEffect: '0 0 24px rgba(197, 160, 89, 0.3)',
    elevation: 'deep',
  },
  backgrounds: {
    type: 'pattern',
    primaryGradient: 'linear-gradient(180deg, #FDFBF7 0%, #F5EEE2 100%)',
    patternType: 'moroccan-zellij',
    patternOpacity: 0.08,
    overlayOpacity: 0.92,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'moroccan-arch',
    dividerOrnament: 'moroccan-arch',
    watermarkPattern: 'moroccan-zellij',
    accentBadgeStyle: 'moroccan-tag',
  },
  buttons: {
    primaryBg: '#152C4D',
    primaryText: '#FDFBF7',
    primaryBorder: '#C5A059',
    primaryShadow: '0 4px 16px rgba(21, 44, 77, 0.25)',
    secondaryBg: '#FFFFFF',
    secondaryText: '#152C4D',
    secondaryBorder: '#C5A059',
    radius: '0.75rem',
    style: 'bordered',
  },
  cards: {
    background: '#FFFFFF',
    border: '#E3D7C4',
    radius: '1.25rem',
    shadow: '0 8px 28px rgba(21, 44, 77, 0.06)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'arch-frame',
    badgeStyle: 'moroccan-tag',
    showBismillah: true,
    bismillahStyle: 'calligraphy',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'arch-title',
    badgeStyle: 'frame',
    cardStyle: 'double-frame',
  },
  animations: {
    preset: 'royal-reveal',
    duration: 1050,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

/**
 * 04 — Black Luxury
 * Dark cinematic black + gold: Mood lighting, ultra-deep dark surfaces, sharp gold leaf details.
 */
export const BLACK_LUXURY_CONFIG: TemplateConfig = {
  colors: {
    primary: '#F3C64F', // Radiant Gold Leaf
    secondary: '#FFDF78',
    background: '#08080A', // Pure Midnight Pitch
    surface: '#121215',
    cardBg: '#151518',
    text: '#EDEDF2',
    mutedText: '#8D8C96',
    accent: '#F3C64F',
    border: '#28272E',
    button: '#F3C64F',
    buttonText: '#08080A',
    badgeBg: '#1F1B12',
    badgeText: '#F3C64F',
    glow: 'rgba(243, 198, 79, 0.3)',
    divider: 'linear-gradient(90deg, transparent, #F3C64F, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'monumental',
    calligraphyStyle: 'thuluth',
    letterSpacing: '0.06em',
    lineHeight: '1.8',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'full',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.75rem',
    cardPadding: '2rem',
    elementGap: '1.25rem',
  },
  borders: {
    cardRadius: '1rem',
    buttonRadius: '0.5rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'clean-line',
  },
  shadows: {
    cardShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(243, 198, 79, 0.1)',
    glowEffect: '0 0 30px rgba(243, 198, 79, 0.35)',
    elevation: 'deep',
  },
  backgrounds: {
    type: 'gradient',
    primaryGradient: 'radial-gradient(circle at 50% 20%, rgba(243, 198, 79, 0.09) 0%, #08080A 70%)',
    patternType: 'subtle-grain',
    patternOpacity: 0.1,
    overlayOpacity: 0.95,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'geometric-star',
    dividerOrnament: 'geometric-star',
    watermarkPattern: 'geometric-stars',
    accentBadgeStyle: 'metallic-pill',
  },
  buttons: {
    primaryBg: '#F3C64F',
    primaryText: '#08080A',
    primaryBorder: '#FFDF78',
    primaryShadow: '0 4px 20px rgba(243, 198, 79, 0.4)',
    secondaryBg: '#121215',
    secondaryText: '#F3C64F',
    secondaryBorder: '#28272E',
    radius: '0.5rem',
    style: 'luxury-gradient',
  },
  cards: {
    background: '#121215',
    border: '#28272E',
    radius: '1rem',
    shadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'cinematic-fullscreen',
    badgeStyle: 'metallic-pill',
    showBismillah: true,
    bismillahStyle: 'calligraphy',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'royal-shield',
    badgeStyle: 'frame',
    cardStyle: 'bordered',
  },
  animations: {
    preset: 'cinematic-rise',
    duration: 1100,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

/**
 * 05 — Floral Romance
 * Elegant floral romantic style: Delicate rose petals, soft ivory, poetic botanical touches.
 */
export const FLORAL_ROMANCE_CONFIG: TemplateConfig = {
  colors: {
    primary: '#7A3847', // Vintage Berry Rose
    secondary: '#A8576A',
    background: '#FCF8F7', // Soft Petal Blush Cream
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#221A1D',
    mutedText: '#77696E',
    accent: '#C89382', // Warm Rose Gold
    border: '#F0E2DE',
    button: '#7A3847',
    buttonText: '#FCF8F7',
    badgeBg: '#F8ECE9',
    badgeText: '#7A3847',
    glow: 'rgba(200, 147, 130, 0.25)',
    divider: 'linear-gradient(90deg, transparent, #C89382, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'classic',
    calligraphyStyle: 'diwani',
    letterSpacing: '0.02em',
    lineHeight: '1.75',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.25rem',
    cardPadding: '1.75rem',
    elementGap: '1rem',
  },
  borders: {
    cardRadius: '1.5rem',
    buttonRadius: '9999px', // Soft Pill
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'floral-flourish',
  },
  shadows: {
    cardShadow: '0 8px 32px rgba(122, 56, 71, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)',
    glowEffect: '0 0 22px rgba(200, 147, 130, 0.25)',
    elevation: 'subtle',
  },
  backgrounds: {
    type: 'mesh',
    primaryGradient: 'linear-gradient(180deg, #FCF8F7 0%, #F8EFEF 100%)',
    patternType: 'floral',
    patternOpacity: 0.06,
    overlayOpacity: 0.94,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'floral-botanical',
    dividerOrnament: 'floral-botanical',
    watermarkPattern: 'floral',
    accentBadgeStyle: 'metallic-pill',
  },
  buttons: {
    primaryBg: '#7A3847',
    primaryText: '#FCF8F7',
    primaryBorder: '#A8576A',
    primaryShadow: '0 4px 16px rgba(122, 56, 71, 0.25)',
    secondaryBg: '#FFFFFF',
    secondaryText: '#7A3847',
    secondaryBorder: '#F0E2DE',
    radius: '9999px',
    style: 'soft-pill',
  },
  cards: {
    background: '#FFFFFF',
    border: '#F0E2DE',
    radius: '1.5rem',
    shadow: '0 6px 24px rgba(122, 56, 71, 0.04)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'floral-wreath',
    badgeStyle: 'metallic-pill',
    showBismillah: true,
    bismillahStyle: 'classic',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'centered-flourish',
    badgeStyle: 'pill',
    cardStyle: 'embossed',
  },
  animations: {
    preset: 'delicate-bloom',
    duration: 950,
    easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
};

/**
 * 06 — Sapphire Night
 * Deep blue + silver luxury: Midnight starry navy, icy platinum silver accents, celestial grandeur.
 */
export const SAPPHIRE_NIGHT_CONFIG: TemplateConfig = {
  colors: {
    primary: '#4A90E2', // Brilliant Sapphire Blue
    secondary: '#7CB5EC',
    background: '#0A1128', // Deep Celestial Midnight
    surface: '#101B3D',
    cardBg: '#132047',
    text: '#F0F4FC',
    mutedText: '#93A4C7',
    accent: '#D0DEEE', // Starlight Silver
    border: '#213361',
    button: '#4A90E2',
    buttonText: '#FFFFFF',
    badgeBg: '#182752',
    badgeText: '#D0DEEE',
    glow: 'rgba(74, 144, 226, 0.3)',
    divider: 'linear-gradient(90deg, transparent, #D0DEEE, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'modern',
    calligraphyStyle: 'kufi',
    letterSpacing: '0.04em',
    lineHeight: '1.8',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.5rem',
    cardPadding: '2rem',
    elementGap: '1.25rem',
  },
  borders: {
    cardRadius: '1.25rem',
    buttonRadius: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'geometric',
  },
  shadows: {
    cardShadow: '0 14px 38px rgba(0, 0, 0, 0.6), 0 0 22px rgba(74, 144, 226, 0.15)',
    glowEffect: '0 0 28px rgba(74, 144, 226, 0.35)',
    elevation: 'deep',
  },
  backgrounds: {
    type: 'gradient',
    primaryGradient: 'radial-gradient(circle at 50% 15%, rgba(74, 144, 226, 0.15) 0%, #0A1128 75%)',
    patternType: 'geometric-stars',
    patternOpacity: 0.12,
    overlayOpacity: 0.9,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'celestial-stars',
    dividerOrnament: 'celestial-stars',
    watermarkPattern: 'geometric-stars',
    accentBadgeStyle: 'metallic-pill',
  },
  buttons: {
    primaryBg: '#4A90E2',
    primaryText: '#FFFFFF',
    primaryBorder: '#7CB5EC',
    primaryShadow: '0 4px 18px rgba(74, 144, 226, 0.35)',
    secondaryBg: '#101B3D',
    secondaryText: '#D0DEEE',
    secondaryBorder: '#213361',
    radius: '0.75rem',
    style: 'luxury-gradient',
  },
  cards: {
    background: '#101B3D',
    border: '#213361',
    radius: '1.25rem',
    shadow: '0 10px 32px rgba(0, 0, 0, 0.5)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'celestial-night',
    badgeStyle: 'metallic-pill',
    showBismillah: true,
    bismillahStyle: 'calligraphy',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'arch-title',
    badgeStyle: 'underline',
    cardStyle: 'bordered',
  },
  animations: {
    preset: 'luxury-fade',
    duration: 1000,
    easing: 'ease-out',
  },
};

/**
 * 07 — Rose Romance
 * Rose tones + gold: Warm romantic rose, champagne gold accents, tender celebratory light.
 */
export const ROSE_ROMANCE_CONFIG: TemplateConfig = {
  colors: {
    primary: '#A04354', // Regal Mauve Rose
    secondary: '#C66D7D',
    background: '#FAF5F3', // Warm Powder Rose Cream
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#24191C',
    mutedText: '#7B676C',
    accent: '#D4AF37', // Warm Polished Gold
    border: '#ECDCD8',
    button: '#A04354',
    buttonText: '#FAF5F3',
    badgeBg: '#F5E7E4',
    badgeText: '#A04354',
    glow: 'rgba(212, 175, 55, 0.22)',
    divider: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'classic',
    calligraphyStyle: 'diwani',
    letterSpacing: '0.03em',
    lineHeight: '1.8',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.25rem',
    cardPadding: '1.85rem',
    elementGap: '1rem',
  },
  borders: {
    cardRadius: '1.25rem',
    buttonRadius: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'royal-corners',
  },
  shadows: {
    cardShadow: '0 8px 30px rgba(160, 67, 84, 0.06), 0 1px 3px rgba(0, 0, 0, 0.03)',
    glowEffect: '0 0 22px rgba(212, 175, 55, 0.25)',
    elevation: 'subtle',
  },
  backgrounds: {
    type: 'gradient',
    primaryGradient: 'linear-gradient(180deg, #FAF5F3 0%, #F3EAE7 100%)',
    patternType: 'floral',
    patternOpacity: 0.05,
    overlayOpacity: 0.95,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'floral-botanical',
    dividerOrnament: 'floral-botanical',
    watermarkPattern: 'floral',
    accentBadgeStyle: 'metallic-pill',
  },
  buttons: {
    primaryBg: '#A04354',
    primaryText: '#FAF5F3',
    primaryBorder: '#C66D7D',
    primaryShadow: '0 4px 16px rgba(160, 67, 84, 0.25)',
    secondaryBg: '#FFFFFF',
    secondaryText: '#A04354',
    secondaryBorder: '#ECDCD8',
    radius: '0.75rem',
    style: 'soft-pill',
  },
  cards: {
    background: '#FFFFFF',
    border: '#ECDCD8',
    radius: '1.25rem',
    shadow: '0 6px 24px rgba(160, 67, 84, 0.05)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'split-crest',
    badgeStyle: 'subtle-gold',
    showBismillah: true,
    bismillahStyle: 'classic',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'centered-flourish',
    badgeStyle: 'pill',
    cardStyle: 'double-frame',
  },
  animations: {
    preset: 'delicate-bloom',
    duration: 900,
    easing: 'ease-out',
  },
};

/**
 * 08 — Emerald Royal
 * Emerald + gold royal style: Deep imperial emerald, golden crests, majestic palace grandeur.
 */
export const EMERALD_ROYAL_CONFIG: TemplateConfig = {
  colors: {
    primary: '#0D422C', // Imperial Emerald
    secondary: '#166243',
    background: '#051A10', // Deep Imperial Green
    surface: '#0A2B1D',
    cardBg: '#0D3524',
    text: '#F5EFE6',
    mutedText: '#A2C4B1',
    accent: '#D4AF37', // 24K Royal Gold
    border: '#D4AF37',
    button: '#D4AF37',
    buttonText: '#051A10',
    badgeBg: '#0A2B1D',
    badgeText: '#D4AF37',
    glow: 'rgba(212, 175, 55, 0.28)',
    divider: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'monumental',
    calligraphyStyle: 'thuluth',
    letterSpacing: '0.04em',
    lineHeight: '1.8',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.5rem',
    cardPadding: '2rem',
    elementGap: '1.25rem',
  },
  borders: {
    cardRadius: '1.25rem',
    buttonRadius: '0.75rem',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    framePattern: 'royal-corners',
  },
  shadows: {
    cardShadow: '0 12px 34px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)',
    glowEffect: '0 0 25px rgba(212, 175, 55, 0.3)',
    elevation: 'deep',
  },
  backgrounds: {
    type: 'gradient',
    primaryGradient: 'radial-gradient(circle at 50% 15%, #0B3D26 0%, #051A10 80%)',
    patternType: 'geometric-stars',
    patternOpacity: 0.07,
    overlayOpacity: 0.93,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'royal-crest',
    dividerOrnament: 'royal-shield',
    watermarkPattern: 'geometric-stars',
    accentBadgeStyle: 'royal-banner',
  },
  buttons: {
    primaryBg: '#D4AF37',
    primaryText: '#051A10',
    primaryBorder: '#FFF2C6',
    primaryShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
    secondaryBg: '#0A2B1D',
    secondaryText: '#D4AF37',
    secondaryBorder: '#D4AF37',
    radius: '0.75rem',
    style: 'bordered',
  },
  cards: {
    background: '#0A2B1D',
    border: '#D4AF37',
    radius: '1.25rem',
    shadow: '0 8px 28px rgba(0, 0, 0, 0.5)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'royal-monogram',
    badgeStyle: 'royal-banner',
    showBismillah: true,
    bismillahStyle: 'calligraphy',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'royal-shield',
    badgeStyle: 'frame',
    cardStyle: 'double-frame',
  },
  animations: {
    preset: 'royal-reveal',
    duration: 1050,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

/**
 * 09 — Minimal White
 * Minimal premium white design: Pure gallery white, hairline accents, understated luxury, generous space.
 */
export const MINIMAL_WHITE_CONFIG: TemplateConfig = {
  colors: {
    primary: '#171717', // Matte Charcoal Black
    secondary: '#404040',
    background: '#FAFAFA', // Pure Minimal Gallery White
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#171717',
    mutedText: '#737373',
    accent: '#A38F78', // Warm Minimalist Brass
    border: '#EAEAEA',
    button: '#171717',
    buttonText: '#FFFFFF',
    badgeBg: '#F4F4F5',
    badgeText: '#171717',
    glow: 'rgba(163, 143, 120, 0.15)',
    divider: 'linear-gradient(90deg, transparent, #E5E5E5, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'minimal',
    calligraphyStyle: 'modern',
    letterSpacing: '0.02em',
    lineHeight: '1.7',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'compact',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2rem',
    cardPadding: '1.75rem',
    elementGap: '1rem',
  },
  borders: {
    cardRadius: '0.75rem',
    buttonRadius: '0.5rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'clean-line',
  },
  shadows: {
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    glowEffect: 'none',
    elevation: 'none',
  },
  backgrounds: {
    type: 'solid',
    patternType: 'none',
    patternOpacity: 0,
    overlayOpacity: 1,
  },
  decorations: {
    showTopOrnament: false,
    showSectionDividers: true,
    ornamentStyle: 'minimal-dash',
    dividerOrnament: 'minimal-dash',
    watermarkPattern: 'none',
    accentBadgeStyle: 'minimal-tag',
  },
  buttons: {
    primaryBg: '#171717',
    primaryText: '#FFFFFF',
    primaryBorder: '#171717',
    primaryShadow: 'none',
    secondaryBg: '#FFFFFF',
    secondaryText: '#171717',
    secondaryBorder: '#E5E5E5',
    radius: '0.5rem',
    style: 'solid',
  },
  cards: {
    background: '#FFFFFF',
    border: '#EAEAEA',
    radius: '0.75rem',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    backdropBlur: false,
    innerBorder: false,
  },
  hero: {
    composition: 'minimal-centered',
    badgeStyle: 'minimal-tag',
    showBismillah: true,
    bismillahStyle: 'minimal',
    showFloatingCountdownBadge: false,
  },
  sections: {
    headerStyle: 'minimal-serif',
    badgeStyle: 'dot',
    cardStyle: 'flat',
  },
  animations: {
    preset: 'minimal-glide',
    duration: 700,
    easing: 'ease-out',
  },
};

/**
 * 10 — Golden Sunset
 * Warm gold + sunset-inspired tones: Amber twilight, desert glow, celebratory radiant warmth.
 */
export const GOLDEN_SUNSET_CONFIG: TemplateConfig = {
  colors: {
    primary: '#B85D19', // Radiant Sunset Terracotta
    secondary: '#DB7D38',
    background: '#FDF7F2', // Warm Sunset Glow Ivory
    surface: '#FFFFFF',
    cardBg: '#FFFFFF',
    text: '#291811',
    mutedText: '#7D6155',
    accent: '#E59F3D', // Warm Radiant Amber Gold
    border: '#F0DBCB',
    button: '#B85D19',
    buttonText: '#FFFFFF',
    badgeBg: '#FCEFE4',
    badgeText: '#B85D19',
    glow: 'rgba(229, 159, 61, 0.3)',
    divider: 'linear-gradient(90deg, transparent, #E59F3D, transparent)',
  },
  typography: {
    fontFamilyArabic: 'Amiri, serif',
    fontFamilyLatin: 'Cinzel, serif',
    headingScale: 'classic',
    calligraphyStyle: 'thuluth',
    letterSpacing: '0.03em',
    lineHeight: '1.75',
  },
  layout: {
    containerMaxWidth: 'md',
    contentPadding: '1.5rem',
    heroHeight: 'tall',
    alignment: 'center',
    direction: 'rtl',
  },
  spacing: {
    sectionGap: '2.25rem',
    cardPadding: '1.85rem',
    elementGap: '1rem',
  },
  borders: {
    cardRadius: '1.25rem',
    buttonRadius: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    framePattern: 'gold-embossed',
  },
  shadows: {
    cardShadow: '0 10px 32px rgba(184, 93, 25, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
    glowEffect: '0 0 24px rgba(229, 159, 61, 0.35)',
    elevation: 'subtle',
  },
  backgrounds: {
    type: 'gradient',
    primaryGradient: 'linear-gradient(180deg, #FDF7F2 0%, #F9ECE0 100%)',
    patternType: 'arabesque',
    patternOpacity: 0.06,
    overlayOpacity: 0.94,
  },
  decorations: {
    showTopOrnament: true,
    showSectionDividers: true,
    ornamentStyle: 'sunburst',
    dividerOrnament: 'sunburst',
    watermarkPattern: 'arabesque',
    accentBadgeStyle: 'subtle-gold',
  },
  buttons: {
    primaryBg: '#B85D19',
    primaryText: '#FFFFFF',
    primaryBorder: '#DB7D38',
    primaryShadow: '0 4px 18px rgba(184, 93, 25, 0.3)',
    secondaryBg: '#FFFFFF',
    secondaryText: '#B85D19',
    secondaryBorder: '#F0DBCB',
    radius: '0.75rem',
    style: 'luxury-gradient',
  },
  cards: {
    background: '#FFFFFF',
    border: '#F0DBCB',
    radius: '1.25rem',
    shadow: '0 8px 26px rgba(184, 93, 25, 0.06)',
    backdropBlur: true,
    innerBorder: true,
  },
  hero: {
    composition: 'sunset-radiance',
    badgeStyle: 'subtle-gold',
    showBismillah: true,
    bismillahStyle: 'classic',
    showFloatingCountdownBadge: true,
  },
  sections: {
    headerStyle: 'arch-title',
    badgeStyle: 'frame',
    cardStyle: 'double-frame',
  },
  animations: {
    preset: 'luxury-fade',
    duration: 950,
    easing: 'ease-out',
  },
};

/**
 * Map of all 10 official template configurations indexed by stable slug.
 */
export const OFFICIAL_TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'royal-gold': ROYAL_GOLD_CONFIG,
  'elegant-pearl': ELEGANT_PEARL_CONFIG,
  'moroccan-palace': MOROCCAN_PALACE_CONFIG,
  'black-luxury': BLACK_LUXURY_CONFIG,
  'floral-romance': FLORAL_ROMANCE_CONFIG,
  'sapphire-night': SAPPHIRE_NIGHT_CONFIG,
  'rose-romance': ROSE_ROMANCE_CONFIG,
  'emerald-royal': EMERALD_ROYAL_CONFIG,
  'minimal-white': MINIMAL_WHITE_CONFIG,
  'golden-sunset': GOLDEN_SUNSET_CONFIG,
};
