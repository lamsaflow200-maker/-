/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mnasbati (منسباتي) — Central Design System Tokens
 * "دعوتك... بأسلوب يليق بمناسبتك"
 */

export const BRAND = {
  nameAr: 'منسباتي',
  nameEn: 'Mnasbati',
  taglineAr: 'دعوتك... بأسلوب يليق بمناسبتك',
  taglineEn: 'Your invitation... crafted with the elegance your celebration deserves',
} as const;

export const COLORS = {
  // Primary brand: Deep Burgundy / Wine
  primary: {
    DEFAULT: '#5A1020',
    hover: '#460C18',
    active: '#380913',
    light: '#78192E',
    soft: '#F6ECF0',
    border: '#E3C8D0',
  },
  // Secondary luxury: Champagne Gold
  secondary: {
    DEFAULT: '#C9A45C',
    hover: '#B89249',
    active: '#9F7C36',
    light: '#E0C58A',
    soft: '#F9F5EC',
    border: '#E8D8B6',
  },
  // Surfaces & Backgrounds
  background: {
    DEFAULT: '#FAF7F2', // Warm Ivory
    surface: '#FFFFFF', // Crisp Surface
    subtle: '#F4ECE4',  // Subtle tint
    dark: '#171316',    // Dark inverse surface
  },
  // Text & Typography
  text: {
    DEFAULT: '#171316', // Dark text (High contrast WCAG AA)
    secondary: '#6F6668', // Secondary muted text
    light: '#9A8F92',     // Teritary / subtle label text
    inverse: '#FAF7F2',   // Light text on dark/burgundy backgrounds
  },
  // Borders & Dividers
  border: {
    DEFAULT: '#E8DED8', // Soft border
    subtle: '#F1E9E4',
    dark: '#C8BAB2',
    gold: '#E0C58A',
    burgundy: '#C298A3',
  },
  // Functional & Semantic States
  status: {
    success: {
      DEFAULT: '#218739',
      soft: '#EDF7EE',
      border: '#BFE4C6',
      text: '#175E27',
    },
    error: {
      DEFAULT: '#B42318',
      soft: '#FEECEB',
      border: '#F8B6B2',
      text: '#912018',
    },
    warning: {
      DEFAULT: '#B7791F',
      soft: '#FEF6E7',
      border: '#F7DBA7',
      text: '#8B5B16',
    },
    info: {
      DEFAULT: '#2867A6',
      soft: '#EBF3FA',
      border: '#B8D5ED',
      text: '#1D4D7D',
    },
    neutral: {
      DEFAULT: '#6F6668',
      soft: '#F0EAE6',
      border: '#E0D4CE',
      text: '#453E40',
    },
  },
} as const;

/**
 * Status token helper mapping application states to semantic colors
 */
export const STATUS_MAP = {
  // Invitation Lifecycle
  draft: {
    labelAr: 'مسودة',
    labelEn: 'Draft',
    bg: COLORS.status.neutral.soft,
    text: COLORS.status.neutral.text,
    border: COLORS.status.neutral.border,
  },
  active: {
    labelAr: 'نشطة',
    labelEn: 'Active',
    bg: COLORS.status.success.soft,
    text: COLORS.status.success.text,
    border: COLORS.status.success.border,
  },
  paused: {
    labelAr: 'متوقفة',
    labelEn: 'Paused',
    bg: COLORS.status.warning.soft,
    text: COLORS.status.warning.text,
    border: COLORS.status.warning.border,
  },
  expired: {
    labelAr: 'منتهية',
    labelEn: 'Expired',
    bg: COLORS.status.error.soft,
    text: COLORS.status.error.text,
    border: COLORS.status.error.border,
  },
  // RSVP Attendance
  attending: {
    labelAr: 'مؤكد الحضور',
    labelEn: 'Confirmed RSVP',
    bg: COLORS.status.success.soft,
    text: COLORS.status.success.text,
    border: COLORS.status.success.border,
  },
  declined: {
    labelAr: 'معتذر',
    labelEn: 'Declined RSVP',
    bg: COLORS.status.error.soft,
    text: COLORS.status.error.text,
    border: COLORS.status.error.border,
  },
  pending: {
    labelAr: 'في انتظار الرد',
    labelEn: 'Pending RSVP',
    bg: COLORS.secondary.soft,
    text: COLORS.secondary.active,
    border: COLORS.secondary.border,
  },
} as const;

/**
 * Typography Tokens & Hierarchy
 */
export const TYPOGRAPHY = {
  fonts: {
    arabicHeading: `'Amiri', 'Noto Kufi Arabic', serif`,
    arabicBody: `'Noto Kufi Arabic', 'Noto Sans Arabic', 'Tajawal', sans-serif`,
    latinHeading: `'Cinzel', 'Playfair Display', serif`,
    latinBody: `'Inter', 'Plus Jakarta Sans', sans-serif`,
    mono: `'JetBrains Mono', 'IBM Plex Mono', monospace`,
  },
  scale: {
    display: 'text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight',
    h1: 'text-2xl sm:text-3xl font-serif font-bold tracking-tight',
    h2: 'text-xl sm:text-2xl font-serif font-semibold',
    h3: 'text-lg sm:text-xl font-serif font-medium',
    body: 'text-sm sm:text-base leading-relaxed',
    small: 'text-xs sm:text-sm leading-normal',
    caption: 'text-xs leading-tight text-[#6F6668]',
    button: 'text-xs sm:text-sm font-medium tracking-wide',
    label: 'text-xs font-medium text-[#171316] mb-1.5 block',
  },
} as const;

/**
 * Motion System Tokens
 */
export const MOTION = {
  duration: {
    micro: '120ms',
    fast: '200ms',
    normal: '320ms',
    slow: '500ms',
    cinematic: '800ms',
  },
  easing: {
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    cinematic: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const;

/**
 * Invitation Visual CSS Variables (Tokens to be inherited or overridden by templates)
 */
export const INVITATION_CSS_VARIABLES = {
  primary: '--invitation-primary',
  secondary: '--invitation-secondary',
  background: '--invitation-background',
  text: '--invitation-text',
  accent: '--invitation-accent',
  border: '--invitation-border',
  shadow: '--invitation-shadow',
  radius: '--invitation-radius',
  fontHeading: '--invitation-font-heading',
  fontBody: '--invitation-font-body',
  animationSpeed: '--invitation-animation-speed',
} as const;
