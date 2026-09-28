/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { getOpeningPreset } from './presets';
import { OpeningScreen } from './OpeningScreen';
import { PublicInvitationViewModel } from '../../types/engine';

interface OpeningEngineProps {
  invitation: PublicInvitationViewModel;
  templateId?: string;
  isOpen: boolean;
  onOpenComplete: () => void;
  onUserInteraction?: () => void;
  isPreview?: boolean;
}

export const OpeningEngine: React.FC<OpeningEngineProps> = ({
  invitation,
  templateId,
  isOpen,
  onOpenComplete,
  onUserInteraction,
  isPreview = false,
}) => {
  // If already opened, don't render the opening screen
  if (isOpen) return null;

  // Resolve template preset with fallback support
  const preset = useMemo(() => {
    return getOpeningPreset(templateId || invitation.theme?.primary_color);
  }, [templateId, invitation.theme]);

  return (
    <OpeningScreen
      preset={preset}
      title={invitation.title}
      eventType={invitation.eventType}
      hostNames={invitation.content.hostNames}
      celebrantNames={
        invitation.content.celebrantNames ||
        invitation.content.firstCelebrantName ||
        invitation.title
      }
      eventDate={invitation.eventDate || invitation.content.dateIso}
      venueName={invitation.venueName || invitation.content.venueName}
      onOpenComplete={onOpenComplete}
      onUserInteraction={onUserInteraction}
      isPreview={isPreview}
    />
  );
};
