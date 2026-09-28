/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { InvitationShare } from '../../components/public/InvitationShare';

interface ShareSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  onTrackAction?: (actionName: string) => void;
}

export const ShareSection: React.FC<ShareSectionProps> = ({
  invitation,
  style,
  onTrackAction,
}) => {
  return (
    <InvitationShare
      slug={invitation.slug}
      title={invitation.title}
      celebrantNames={invitation.content.celebrantNames}
      hostNames={invitation.content.hostNames}
      shortText={invitation.content.invitationText}
      position="bottom"
      primaryColor={style.primaryColor}
      accentColor={style.accentColor}
      borderRadius={style.cardRadius}
      onTrackAction={onTrackAction}
    />
  );
};
