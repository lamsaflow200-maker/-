/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Invitation,
  RsvpResponse,
  InvitationThemeConfig,
  EventType,
  InvitationSection,
  SectionType,
  GalleryItem,
  InvitationVideo,
  MusicTrack,
  InvitationStatus,
} from './database';
import { TemplateConfig } from './template';

export interface PublicInvitationViewModel {
  id: string;
  slug: string;
  templateId: string;
  eventType: EventType;
  title: string;
  status: InvitationStatus;
  coverImageUrl?: string;
  hostWhatsapp?: string;
  eventDate?: string;
  eventTime?: string;
  timezone?: string;
  venueName?: string;
  venueAddress?: string;
  googleMapsUrl?: string;
  expiresAt?: string;
  content: {
    hostNames: string;
    celebrantNames: string;
    firstCelebrantName?: string;
    secondCelebrantName?: string;
    eventTitle: string;
    invitationText: string;
    dateIso: string;
    hijriDate?: string;
    timeText: string;
    venueName: string;
    venueCity: string;
    venueAddress?: string;
    googleMapsUrl?: string;
    dressCode?: string;
    additionalNotes?: string;
  };
  theme: InvitationThemeConfig;
  settings: {
    allowRsvp: boolean;
    rsvpDeadline?: string;
    maxPartySize?: number;
    enableMusic: boolean;
    enableGallery: boolean;
    enableCountdown: boolean;
    enableGuestMessages: boolean;
    showQrCode: boolean;
  };
  sections: InvitationSection[];
  gallery: GalleryItem[];
  videos: InvitationVideo[];
  music: MusicTrack | null;
}

export interface InvitationTemplateProps {
  invitation: PublicInvitationViewModel;
  isPreview?: boolean;
  onRsvpSubmit?: (data: {
    guestName: string;
    phone?: string;
    attendanceStatus: 'attending' | 'declined' | 'tentative';
    partySize: number;
    notesOrWishes?: string;
  }) => Promise<boolean>;
  onTrackAction?: (actionName: string) => void;
}

export interface TemplateDefinition {
  id: string;
  slug?: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: EventType | 'universal';
  thumbnailUrl: string;
  previewImageUrl?: string;
  version: string;
  config?: TemplateConfig;
  defaultTheme: InvitationThemeConfig;
  supportedFeatures: {
    gallery: boolean;
    music: boolean;
    rsvp: boolean;
    video: boolean;
    countdown: boolean;
    map: boolean;
  };
  component?: React.ComponentType<InvitationTemplateProps>;
}

export interface TemplateStylePreset {
  fontFamilyArabic: string;
  fontFamilyLatin: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  cardBg: string;
  borderColor: string;
  ornamentColor: string;
  buttonRadius: string;
  cardRadius: string;
}
