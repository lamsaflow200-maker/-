/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { InvitationRSVP } from '../rsvp/InvitationRSVP';

export interface RsvpFoundationSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
  onRsvpSubmit?: (data: {
    guestName: string;
    phone?: string;
    attendanceStatus: 'attending' | 'declined' | 'tentative';
    partySize: number;
    notesOrWishes?: string;
  }) => Promise<boolean>;
  onTrackAction?: (actionName: string) => void;
}

export const RsvpFoundationSection: React.FC<RsvpFoundationSectionProps> = ({
  invitation,
  style,
  config,
  onRsvpSubmit,
  onTrackAction,
}) => {
  return (
    <InvitationRSVP
      invitation={invitation}
      style={style}
      config={config}
      onRsvpSubmit={onRsvpSubmit as any}
      onTrackAction={onTrackAction}
    />
  );
};

export { InvitationRSVP };
