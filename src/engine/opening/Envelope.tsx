/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OpeningPreset, OpeningPhase } from './types';
import { EnvelopeBack } from './EnvelopeBack';
import { EnvelopeFront } from './EnvelopeFront';
import { EnvelopeFlap } from './EnvelopeFlap';
import { InvitationCard } from './InvitationCard';

interface EnvelopeProps {
  preset: OpeningPreset;
  phase: OpeningPhase;
  title: string;
  eventType?: string;
  hostNames?: string;
  celebrantNames?: string;
  eventDate?: string;
  venueName?: string;
  onOpen: () => void;
}

export const Envelope: React.FC<EnvelopeProps> = ({
  preset,
  phase,
  title,
  eventType,
  hostNames,
  celebrantNames,
  eventDate,
  venueName,
  onOpen,
}) => {
  const isTransitioning = phase === 'transitioning' || phase === 'completed';

  return (
    <div
      className="relative mx-auto select-none"
      style={{
        perspective: '1200px',
        width: 'min(90vw, 420px)',
        height: '260px',
      }}
    >
      {/* 3D Envelope Container with Subtle Resting Angle */}
      <div
        className="relative w-full h-full cursor-pointer transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isTransitioning
            ? 'scale(1.1) translateY(20px)'
            : 'scale(1) rotateX(4deg)',
        }}
        onClick={onOpen}
      >
        {/* Layer 1: Back of Envelope (Interior lining) */}
        <EnvelopeBack preset={preset} />

        {/* Layer 2: Invitation Card inside */}
        <InvitationCard
          preset={preset}
          phase={phase}
          title={title}
          eventType={eventType}
          hostNames={hostNames}
          celebrantNames={celebrantNames}
          eventDate={eventDate}
          venueName={venueName}
        />

        {/* Layer 3: Front Pocket of Envelope */}
        <EnvelopeFront preset={preset} />

        {/* Layer 4: Top Flap + Seal */}
        <EnvelopeFlap preset={preset} phase={phase} onSealClick={onOpen} />
      </div>
    </div>
  );
};
