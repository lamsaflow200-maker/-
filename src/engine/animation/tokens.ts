/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Motion Tokens for Mnasbati Invitation Animation Engine.
 * Centralized, luxury-calibrated timing and easing curves.
 */

export interface MotionDurationTokens {
  /** Micro-interactions: button hover, icon movement, small scale, opacity (100–180ms) */
  micro: number;
  /** Fast: quick responsive user feedback (180–300ms) */
  fast: number;
  /** Normal: standard section and card entrance (300–500ms) */
  normal: number;
  /** Slow: prominent elements, hero reveals, typography (500–800ms) */
  slow: number;
  /** Cinematic: large emotional transitions, envelope opening, page reveals (800–1400ms) */
  cinematic: number;
}

export const MOTION_DURATIONS: MotionDurationTokens = {
  micro: 150,
  fast: 240,
  normal: 420,
  slow: 650,
  cinematic: 950,
};

export interface MotionEasingTokens {
  /** Standard clean cubic curve for utility elements */
  easeStandard: string;
  /** Ultra-smooth curve for editorial surfaces and typography */
  easeSmooth: string;
  /** Luxury curve for Royal Gold, Black Luxury and high-end cards */
  easeLuxury: string;
  /** Cinematic slow-decelerating curve for major reveals */
  easeCinematic: string;
  /** Soft organic spring for playful floral or pearl designs */
  easeSpringSoft: string;
  /** Decelerated exit for responsive taps */
  easeOut: string;
  /** Symmetrical transition curve */
  easeInOut: string;
}

export const MOTION_EASINGS: MotionEasingTokens = {
  easeStandard: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
  easeSmooth: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  easeLuxury: 'cubic-bezier(0.16, 1.0, 0.3, 1.0)',
  easeCinematic: 'cubic-bezier(0.19, 1.0, 0.22, 1.0)',
  easeSpringSoft: 'cubic-bezier(0.34, 1.4, 0.64, 1.0)',
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
};

/** Convert milliseconds to CSS duration string */
export const toDurationCss = (ms: number): string => `${ms}ms`;

/** Motion token bundle */
export const MOTION_TOKENS = {
  durations: MOTION_DURATIONS,
  easings: MOTION_EASINGS,
  toCss: toDurationCss,
};
