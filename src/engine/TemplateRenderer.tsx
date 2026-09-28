/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel } from '../types/engine';
import { TemplateAdapterConfig } from './TemplateAdapter';
import { SectionType } from '../types/database';
import { HeroSection } from './sections/HeroSection';
import { StoryGreetingSection } from './sections/StoryGreetingSection';
import { EventDetailsSection } from './sections/EventDetailsSection';
import { VenueSection } from './sections/VenueSection';
import { WhatsAppContactSection } from './sections/WhatsAppContactSection';
import { CountdownSection } from './sections/CountdownSection';
import { GalleryFoundationSection } from './sections/GalleryFoundationSection';
import { VideoFoundationSection } from './sections/VideoFoundationSection';
import { RsvpFoundationSection } from './sections/RsvpFoundationSection';
import { ContactSection } from './sections/ContactSection';
import { TemplateBackgroundPatternOverlay } from './decorations/TemplateDecorations';
import { TEMPLATE_REGISTRY } from '../templates/registry';
import { SectionReveal, ParallaxLayer } from './animation';
import { InvitationWhatsApp } from '../components/public/InvitationWhatsApp';
import { InvitationShare } from '../components/public/InvitationShare';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export interface TemplateRendererProps {
  invitation: PublicInvitationViewModel;
  adapter: TemplateAdapterConfig;
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

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  invitation,
  adapter,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { style } = adapter;

  // If a dedicated bespoke template component is registered for this template ID, render it
  const templateDef = TEMPLATE_REGISTRY[adapter.id];
  if (templateDef?.component) {
    const Component = templateDef.component;
    const hasVisibleGallery =
      invitation.settings.enableGallery &&
      invitation.gallery &&
      invitation.gallery.filter((i) => i.is_visible !== false).length > 0;
    const hasVisibleVideos =
      invitation.videos &&
      invitation.videos.filter((v) => v.is_visible !== false).length > 0;

    return (
      <div className="relative w-full">
        <ErrorBoundary sectionName="قالب الدعوة الأساسي">
          <Component
            invitation={invitation}
            isPreview={isPreview}
            onRsvpSubmit={onRsvpSubmit}
            onTrackAction={onTrackAction}
          />
        </ErrorBoundary>

        {/* Dynamic Gallery & Video integration across all templates (Prompt 14 requirement) */}
        {(hasVisibleVideos || hasVisibleGallery) && (
          <div className="w-full max-w-4xl mx-auto px-4 pb-16 space-y-12">
            {hasVisibleVideos && (
              <ErrorBoundary sectionName="فيديو المناسبة" silent>
                <SectionReveal delay={80}>
                  <VideoFoundationSection
                    invitation={invitation}
                    style={style}
                    onTrackAction={onTrackAction}
                  />
                </SectionReveal>
              </ErrorBoundary>
            )}

            {hasVisibleGallery && (
              <ErrorBoundary sectionName="معرض الصور" silent>
                <SectionReveal delay={120}>
                  <GalleryFoundationSection
                    invitation={invitation}
                    style={style}
                    onTrackAction={onTrackAction}
                  />
                </SectionReveal>
              </ErrorBoundary>
            )}
          </div>
        )}

        {/* Unified Public WhatsApp & Public Share System (Prompt 17 requirements) */}
        <div className="w-full max-w-2xl mx-auto px-4 pb-16 space-y-4">
          <ErrorBoundary sectionName="واتساب والتواصل" silent>
            <SectionReveal delay={140}>
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
                position={adapter.config?.sharing?.whatsappPosition || 'contact'}
                primaryColor={style.primaryColor}
                accentColor={style.accentColor}
                borderRadius={style.cardRadius}
                onTrackAction={onTrackAction}
              />
            </SectionReveal>
          </ErrorBoundary>

          <ErrorBoundary sectionName="مشاركة الدعوة" silent>
            <SectionReveal delay={160}>
              <InvitationShare
                slug={invitation.slug}
                title={invitation.title}
                celebrantNames={invitation.content.celebrantNames}
                hostNames={invitation.content.hostNames}
                shortText={invitation.content.invitationText}
                position={adapter.config?.sharing?.sharePosition || 'bottom'}
                primaryColor={style.primaryColor}
                accentColor={style.accentColor}
                borderRadius={style.cardRadius}
                onTrackAction={onTrackAction}
              />
            </SectionReveal>
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  // Determine effective sections:
  // If custom sections exist in database and are visible, sort them by sort_order
  // Otherwise, use the adapter's default section order
  const effectiveSectionTypes: SectionType[] = React.useMemo(() => {
    if (invitation.sections && invitation.sections.length > 0) {
      const visible = invitation.sections
        .filter((s) => s.is_visible !== false)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s) => s.section_type);

      if (visible.length > 0) return visible;
    }

    return adapter.defaultSectionOrder;
  }, [invitation.sections, adapter.defaultSectionOrder]);

  const renderSection = (type: SectionType, index: number) => {
    switch (type) {
      case 'hero':
        return (
          <HeroSection
            key={`hero-${index}`}
            invitation={invitation}
            style={style}
            config={adapter.config}
          />
        );
      case 'story':
        return (
          <StoryGreetingSection
            key={`story-${index}`}
            invitation={invitation}
            style={style}
            config={adapter.config}
          />
        );
      case 'event_details':
        return (
          <EventDetailsSection
            key={`details-${index}`}
            invitation={invitation}
            style={style}
            config={adapter.config}
          />
        );
      case 'location':
        return (
          <React.Fragment key={`location-${index}`}>
            <VenueSection
              invitation={invitation}
              style={style}
              config={adapter.config}
              onTrackAction={onTrackAction}
            />
            <WhatsAppContactSection
              invitation={invitation}
              style={style}
              onTrackAction={onTrackAction}
            />
          </React.Fragment>
        );
      case 'countdown':
        return (
          <CountdownSection
            key={`countdown-${index}`}
            invitation={invitation}
            style={style}
            config={adapter.config}
          />
        );
      case 'gallery':
        return (
          <GalleryFoundationSection
            key={`gallery-${index}`}
            invitation={invitation}
            style={style}
            onTrackAction={onTrackAction}
          />
        );
      case 'video':
        return (
          <VideoFoundationSection
            key={`video-${index}`}
            invitation={invitation}
            style={style}
            onTrackAction={onTrackAction}
          />
        );
      case 'rsvp':
        return (
          <RsvpFoundationSection
            key={`rsvp-${index}`}
            invitation={invitation}
            style={style}
            config={adapter.config}
            onRsvpSubmit={onRsvpSubmit}
          />
        );
      case 'contact':
        return (
          <ContactSection
            key={`contact-${index}`}
            invitation={invitation}
            style={style}
          />
        );
      case 'custom':
        return null;
      default:
        return null;
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative transition-colors duration-300 font-sans antialiased overflow-x-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        backgroundImage: adapter.config?.backgrounds?.primaryGradient || undefined,
        color: style.textColor,
        fontFamily: style.fontFamilyArabic,
      }}
    >
      {/* Background Pattern Overlay (Zellij, Geometric stars, Floral, etc.) */}
      {adapter.config && (
        <ParallaxLayer speed={0.04} className="absolute inset-0 pointer-events-none z-0">
          <TemplateBackgroundPatternOverlay config={adapter.config} />
        </ParallaxLayer>
      )}

      {/* Decorative Top Accent Line */}
      <div
        className="w-full h-1 relative z-10"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${style.accentColor} 50%, transparent 100%)`,
        }}
      />

      {/* Render Dynamic Sections */}
      <main className="w-full max-w-2xl mx-auto space-y-4 pb-12 sm:pb-16 relative z-10">
        {effectiveSectionTypes.map((type, idx) => {
          const sectionElement = renderSection(type, idx);
          if (!sectionElement) return null;
          return (
            <SectionReveal
              key={`${type}-${idx}`}
              delay={idx === 0 ? 0 : 70}
              immediate={idx === 0}
            >
              {sectionElement}
            </SectionReveal>
          );
        })}

        {/* Public Share Foundation (Prompt 17 requirement) */}
        <SectionReveal delay={120}>
          <InvitationShare
            slug={invitation.slug}
            title={invitation.title}
            celebrantNames={invitation.content.celebrantNames}
            hostNames={invitation.content.hostNames}
            shortText={invitation.content.invitationText}
            position={adapter.config?.sharing?.sharePosition || 'bottom'}
            primaryColor={style.primaryColor}
            accentColor={style.accentColor}
            borderRadius={style.cardRadius}
            onTrackAction={onTrackAction}
          />
        </SectionReveal>
      </main>
    </div>
  );
};
