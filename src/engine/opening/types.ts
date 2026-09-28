/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OpeningPhase =
  | 'closed'
  | 'opening-seal'
  | 'opening-flap'
  | 'revealing-card'
  | 'transitioning'
  | 'completed';

export type SealType =
  | 'royal-crest'
  | 'pearl-embossed'
  | 'moroccan-star'
  | 'black-obsidian'
  | 'floral-botanical'
  | 'sapphire-gem'
  | 'rose-monogram'
  | 'emerald-seal'
  | 'minimal-mark'
  | 'golden-sun';

export interface OpeningPreset {
  templateId: string;
  name: string;
  nameAr: string;

  // Envelope styling
  envelopeColor: string;
  envelopeFlapColor: string;
  envelopeInnerColor: string;
  envelopeBorderColor: string;
  envelopeAccentColor: string;
  envelopeShadow: string;

  // Seal styling
  sealType: SealType;
  sealBg: string;
  sealBorder: string;
  sealTextColor: string;
  sealShadow: string;
  sealEmblemText?: string;

  // Card reveal styling
  cardBg: string;
  cardBorder: string;
  cardTextColor: string;
  cardAccentColor: string;
  cardShadow: string;

  // Screen atmosphere & background
  screenBg: string;
  atmosphereOverlay?: string;
  glowColor: string;

  // Typography
  fontHeading: string;
  fontBody: string;

  // Prompt CTA button style
  buttonStyle: {
    bg: string;
    text: string;
    border: string;
    hoverBg: string;
  };
}
