/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventType } from './database';

export interface TemplateColorsConfig {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  border: string;
  button: string;
  buttonText: string;
  cardBg: string;
  badgeBg?: string;
  badgeText?: string;
  glow?: string;
  divider?: string;
}

export interface TemplateTypographyConfig {
  fontFamilyArabic: string;
  fontFamilyLatin: string;
  headingScale: 'classic' | 'modern' | 'monumental' | 'editorial' | 'minimal';
  calligraphyStyle: 'thuluth' | 'diwani' | 'kufi' | 'naskh' | 'modern';
  letterSpacing?: string;
  lineHeight?: string;
}

export interface TemplateLayoutConfig {
  containerMaxWidth: 'sm' | 'md' | 'lg' | 'xl';
  contentPadding: string;
  heroHeight: 'auto' | 'full' | 'tall' | 'compact';
  alignment: 'center' | 'right' | 'justified';
  direction: 'rtl' | 'ltr';
}

export interface TemplateSpacingConfig {
  sectionGap: string;
  cardPadding: string;
  elementGap: string;
}

export interface TemplateBordersConfig {
  cardRadius: string;
  buttonRadius: string;
  borderWidth: string;
  borderStyle: 'solid' | 'double' | 'groove' | 'gradient' | 'ornamental';
  framePattern?: 'moroccan-arch' | 'royal-corners' | 'clean-line' | 'floral-flourish' | 'gold-embossed' | 'geometric';
}

export interface TemplateShadowsConfig {
  cardShadow: string;
  glowEffect?: string;
  elevation: 'none' | 'subtle' | 'deep' | 'floating';
}

export interface TemplateBackgroundsConfig {
  type: 'solid' | 'gradient' | 'pattern' | 'mesh' | 'texture';
  primaryGradient?: string;
  patternType?: 'moroccan-zellij' | 'arabesque' | 'floral' | 'geometric-stars' | 'subtle-grain' | 'none';
  patternOpacity?: number;
  overlayOpacity?: number;
}

export interface TemplateDecorationsConfig {
  showTopOrnament: boolean;
  showSectionDividers: boolean;
  ornamentStyle: 'moroccan-arch' | 'royal-crest' | 'floral-botanical' | 'minimal-dash' | 'pearl-bead' | 'geometric-star' | 'sunburst' | 'celestial-stars';
  dividerOrnament?: string;
  watermarkPattern?: string;
  accentBadgeStyle?: string;
}

export interface TemplateButtonsConfig {
  primaryBg: string;
  primaryText: string;
  primaryBorder: string;
  primaryShadow?: string;
  secondaryBg: string;
  secondaryText: string;
  secondaryBorder: string;
  radius: string;
  style: 'solid' | 'luxury-gradient' | 'bordered' | 'glass' | 'soft-pill';
}

export interface TemplateCardsConfig {
  background: string;
  border: string;
  radius: string;
  shadow: string;
  backdropBlur?: boolean;
  innerBorder?: boolean;
}

export interface TemplateHeroConfig {
  composition: 'arch-frame' | 'cinematic-fullscreen' | 'pearl-embossed' | 'split-crest' | 'minimal-centered' | 'floral-wreath' | 'royal-monogram' | 'celestial-night' | 'sunset-radiance';
  badgeStyle: 'metallic-pill' | 'royal-banner' | 'moroccan-tag' | 'subtle-gold' | 'minimal-tag';
  showBismillah: boolean;
  bismillahStyle?: 'calligraphy' | 'classic' | 'minimal';
  showFloatingCountdownBadge?: boolean;
}

export interface TemplateSectionsConfig {
  headerStyle: 'arch-title' | 'centered-flourish' | 'minimal-serif' | 'royal-shield' | 'modern-clean';
  badgeStyle: 'pill' | 'frame' | 'underline' | 'dot';
  cardStyle: 'bordered' | 'embossed' | 'glass' | 'flat' | 'double-frame';
}

export interface TemplateAnimationsConfig {
  preset: 'luxury-fade' | 'royal-reveal' | 'delicate-bloom' | 'cinematic-rise' | 'minimal-glide';
  duration: number; // in milliseconds
  easing: string;
}

export interface TemplateSharingConfig {
  sharePosition?: 'bottom' | 'floating' | 'contact' | 'hero';
  shareStyle?: 'button' | 'icon' | 'card' | 'bar';
  shareVariant?: 'gold' | 'minimal' | 'luxury' | 'colored';
  whatsappPosition?: 'hero' | 'contact' | 'bottom' | 'floating';
}

/**
 * Standardized JSONB Template Configuration schema stored in templates.config
 */
export interface TemplateConfig {
  colors: TemplateColorsConfig;
  typography: TemplateTypographyConfig;
  layout: TemplateLayoutConfig;
  spacing: TemplateSpacingConfig;
  borders: TemplateBordersConfig;
  shadows: TemplateShadowsConfig;
  backgrounds: TemplateBackgroundsConfig;
  decorations: TemplateDecorationsConfig;
  buttons: TemplateButtonsConfig;
  cards: TemplateCardsConfig;
  hero: TemplateHeroConfig;
  sections: TemplateSectionsConfig;
  animations: TemplateAnimationsConfig;
  sharing?: TemplateSharingConfig;
  [key: string]: any;
}

export interface OfficialTemplateDefinition {
  id: string; // stable slug e.g. "royal-gold"
  name: string;
  slug: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: EventType | 'universal';
  previewImageUrl: string;
  thumbnailUrl: string;
  config: TemplateConfig;
  isActive: boolean;
  version: string;
  supportedFeatures: {
    gallery: boolean;
    music: boolean;
    rsvp: boolean;
    video: boolean;
    countdown: boolean;
    map: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
