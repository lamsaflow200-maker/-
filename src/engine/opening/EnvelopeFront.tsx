/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OpeningPreset } from './types';

interface EnvelopeFrontProps {
  preset: OpeningPreset;
}

export const EnvelopeFront: React.FC<EnvelopeFrontProps> = ({ preset }) => {
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-30">
      {/* 
        Envelope Front Pocket Geometry
        We render the folded side and bottom triangles using clean SVGs with realistic drop shadows
      */}
      <svg
        className="w-full h-full absolute inset-0"
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="envelopeFrontShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="-4" stdDeviation="6" floodOpacity="0.35" />
          </filter>
          <linearGradient id="frontGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={preset.envelopeFlapColor} />
            <stop offset="100%" stopColor={preset.envelopeColor} />
          </linearGradient>
        </defs>

        {/* Left Fold Flap */}
        <polygon
          points="0,0 200,135 0,260"
          fill={preset.envelopeColor}
          stroke={preset.envelopeBorderColor}
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Right Fold Flap */}
        <polygon
          points="400,0 200,135 400,260"
          fill={preset.envelopeColor}
          stroke={preset.envelopeBorderColor}
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Bottom Fold Flap with upward shadow */}
        <polygon
          points="0,260 200,120 400,260"
          fill="url(#frontGradient)"
          stroke={preset.envelopeBorderColor}
          strokeWidth="1.2"
          strokeOpacity="0.85"
          filter="url(#envelopeFrontShadow)"
        />

        {/* Subtle Decorative Center Seam Gold / Accent Line */}
        <line
          x1="200"
          y1="120"
          x2="200"
          y2="260"
          stroke={preset.envelopeBorderColor}
          strokeWidth="0.6"
          strokeOpacity="0.5"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Perimeter Gold/Accent Framing for Royal & Luxury Themes */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: `1.5px solid ${preset.envelopeBorderColor}`,
          opacity: 0.85,
        }}
      />
    </div>
  );
};
