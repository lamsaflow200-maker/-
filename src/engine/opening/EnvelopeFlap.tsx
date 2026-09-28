/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OpeningPreset, OpeningPhase } from './types';
import { EnvelopeSeal } from './EnvelopeSeal';

interface EnvelopeFlapProps {
  preset: OpeningPreset;
  phase: OpeningPhase;
  onSealClick: () => void;
}

export const EnvelopeFlap: React.FC<EnvelopeFlapProps> = ({
  preset,
  phase,
  onSealClick,
}) => {
  const isFlapOpen =
    phase === 'opening-flap' ||
    phase === 'revealing-card' ||
    phase === 'transitioning' ||
    phase === 'completed';

  return (
    <div
      className="absolute top-0 left-0 right-0 h-[135px] pointer-events-auto"
      style={{
        transformOrigin: 'top center',
        transformStyle: 'preserve-3d',
        transition: 'transform 700ms cubic-bezier(0.34, 1.2, 0.64, 1), z-index 100ms 350ms',
        transform: isFlapOpen ? 'rotateX(-180deg)' : 'rotateX(0deg)',
        zIndex: isFlapOpen ? 5 : 35,
      }}
    >
      {/* Front Face of Flap (pointing down when closed) */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        viewBox="0 0 400 135"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="flapShadow" x="-10%" y="0%" width="120%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.45" />
          </filter>
        </defs>

        <polygon
          points="0,0 200,135 400,0"
          fill={preset.envelopeFlapColor}
          stroke={preset.envelopeBorderColor}
          strokeWidth="1.5"
          filter={!isFlapOpen ? 'url(#flapShadow)' : undefined}
        />

        {/* Flap Gold Inner Accent Line */}
        <polyline
          points="15,4 200,126 385,4"
          fill="none"
          stroke={preset.envelopeBorderColor}
          strokeWidth="0.8"
          strokeOpacity="0.6"
          strokeDasharray="4 3"
        />
      </svg>

      {/* Seal attached to flap tip */}
      <div
        className="absolute left-1/2"
        style={{
          top: '135px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <EnvelopeSeal preset={preset} phase={phase} onClick={onSealClick} />
      </div>
    </div>
  );
};
