/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { InvitationWhatsApp } from '../../components/public/InvitationWhatsApp';

interface WhatsAppContactSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  onTrackAction?: (actionName: string) => void;
}

export const WhatsAppContactSection: React.FC<WhatsAppContactSectionProps> = ({
  invitation,
  style,
  onTrackAction,
}) => {
  return (
    <InvitationWhatsApp
      hostWhatsapp={invitation.hostWhatsapp}
      invitationTitle={invitation.title}
      celebrantNames={invitation.content.celebrantNames}
      hostNames={invitation.content.hostNames}
      invitationUrl={
        typeof window !== 'undefined'
          ? `${window.location.origin}/i/${invitation.slug}`
          : undefined
      }
      position="contact"
      borderRadius={style.cardRadius}
      onTrackAction={onTrackAction}
    />
  );
};

