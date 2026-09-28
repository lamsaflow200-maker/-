/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OpeningPreset } from './types';

interface EnvelopeBackProps {
  preset: OpeningPreset;
}

export const EnvelopeBack: React.FC<EnvelopeBackProps> = ({ preset }) => {
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
      style={{
        backgroundColor: preset.envelopeInnerColor,
        border: `1.5px solid ${preset.envelopeBorderColor}66`,
        boxShadow: preset.envelopeShadow,
      }}
    >
      {/* Interior Lining Pattern / Vignette */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${preset.envelopeColor} 0%, ${preset.envelopeInnerColor} 100%)`,
        }}
      />

      {/* Top Interior Incline Shadow (creates depth underneath the flap) */}
      <div
        className="absolute top-0 left-0 right-0 h-28 pointer-events-none opacity-50"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)',
        }}
      />

      {/* Bottom Corner Accent Lines */}
      <div
        className="absolute bottom-2 left-3 right-3 h-px opacity-30"
        style={{
          backgroundColor: preset.envelopeBorderColor,
        }}
      />
    </div>
  );
};
