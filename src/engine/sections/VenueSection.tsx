/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { EventLocationSection } from './EventLocationSection';

interface VenueSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
  locale?: string;
  onTrackAction?: (actionName: string) => void;
}

export const VenueSection: React.FC<VenueSectionProps> = (props) => {
  return <EventLocationSection {...props} />;
};

export { EventLocationSection };
