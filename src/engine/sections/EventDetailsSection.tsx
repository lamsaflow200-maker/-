/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import {
  formatEventDate,
  formatEventTime,
  getEventTypeLabel,
  isValidDateString,
} from '../../utils/datetime';
import { EventInfoCard, EventLayoutVariant } from '../details/EventInfoCard';
import { TemplateCornerAccents } from '../decorations/TemplateDecorations';

interface EventDetailsSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
  locale?: string;
}

/**
 * Determines layout variant based on template ID or config
 */
function resolveLayoutVariant(templateId = 'royal-gold'): EventLayoutVariant {
  const norm = templateId.toLowerCase();
  if (norm.includes('black-luxury') || norm.includes('rose-romance')) return 'editorial';
  if (norm.includes('royal-gold') || norm.includes('emerald-royal') || norm.includes('sapphire-night')) {
    return 'framed';
  }
  if (norm.includes('moroccan-palace')) return 'ornamental';
  if (norm.includes('minimal-white') || norm.includes('royal-minimalist')) return 'minimal';
  return 'centered';
}

export const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({
  invitation,
  style,
  config,
  locale = 'ar-MA',
}) => {
  const { content, timezone: rawTimezone, templateId, eventType } = invitation;

  const dateValue = content?.dateIso || invitation.eventDate;
  const timeValue = content?.timeText || invitation.eventTime;
  const venueName = content?.venueName || invitation.venueName;
  const venueAddress = content?.venueAddress || invitation.venueAddress;
  const venueCity = content?.venueCity;
  const timezone = rawTimezone || invitation.timezone || 'Africa/Casablanca';

  // If no date, time, and venue, hide section gracefully
  if (!dateValue && !timeValue && !venueName) return null;

  // Title with fallback based on event_type
  const fallbackTypeLabel = getEventTypeLabel(eventType || 'wedding', locale);
  const displayTitle = content?.eventTitle || invitation.title || fallbackTypeLabel;
  const eventTypeLabel = getEventTypeLabel(eventType || 'wedding', locale);

  const isDark =
    style.backgroundColor === '#0E0E11' ||
    style.backgroundColor === '#08080A' ||
    style.backgroundColor === '#0A1128' ||
    style.backgroundColor === '#050B14' ||
    style.backgroundColor === '#06100B';

  const isDoubleBorder = config?.borders?.borderStyle === 'double';
  const cornerStyle =
    config?.borders?.framePattern === 'royal-corners'
      ? 'royal'
      : config?.borders?.framePattern === 'moroccan-arch'
      ? 'moroccan'
      : config?.borders?.framePattern === 'floral-flourish'
      ? 'floral'
      : 'clean';

  const layoutVariant = resolveLayoutVariant(templateId);

  // Professional Intl Date formatting
  const formattedDate = dateValue ? formatEventDate(dateValue, locale) : '';
  const formattedTime = timeValue ? formatEventTime(timeValue, locale) : '';

  // Formatted location subtitle
  const locationSubtitle = venueName
    ? venueCity
      ? `${venueName} — ${venueCity}`
      : venueName
    : venueAddress || '';

  const locationExtra = venueAddress && venueName ? venueAddress : undefined;

  return (
    <section
      aria-label="تفاصيل وموعد المناسبة"
      className="w-full max-w-xl mx-auto px-4 py-4 select-none motion-fade-in"
    >
      <div
        className={`relative p-6 sm:p-8 rounded-2xl border shadow-md space-y-6 ${
          isDoubleBorder ? 'border-2' : ''
        }`}
        style={{
          backgroundColor: style.cardBg,
          borderColor: style.borderColor,
          borderRadius: style.cardRadius,
          boxShadow: config?.shadows?.cardShadow,
        }}
      >
        {/* Subtle Decorative Corners */}
        <TemplateCornerAccents color={style.accentColor} size={18} style={cornerStyle} />

        {/* Section Header with Event Type & Title */}
        <div className="text-center space-y-2">
          {eventTypeLabel && (
            <div className="inline-block">
              <span
                className="text-[11px] font-bold px-3.5 py-1 rounded-full border shadow-2xs tracking-wider"
                style={{
                  borderColor: `${style.accentColor}50`,
                  backgroundColor: `${style.accentColor}12`,
                  color: style.accentColor,
                }}
              >
                {eventTypeLabel}
              </span>
            </div>
          )}

          <h3
            className="text-base sm:text-lg font-serif font-bold tracking-wide"
            style={{ color: style.primaryColor }}
          >
            {displayTitle}
          </h3>

          <p className="text-xs text-[#8E8B94]">
            يسعدنا تشريفكم ومشاركتنا هذه المناسبة الكريمة
          </p>
        </div>

        {/* Dynamic Cards Grid according to Layout Variant */}
        <div
          className={
            layoutVariant === 'horizontal' || layoutVariant === 'editorial'
              ? 'space-y-3'
              : layoutVariant === 'minimal'
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-0 border rounded-xl overflow-hidden'
              : 'grid grid-cols-1 sm:grid-cols-2 gap-4'
          }
          style={
            layoutVariant === 'minimal'
              ? { borderColor: `${style.borderColor}40`, backgroundColor: `${style.backgroundColor}80` }
              : undefined
          }
        >
          {/* Date Card */}
          {dateValue && (
            <EventInfoCard
              type="date"
              title="التاريخ الميلادي"
              subtitle={formattedDate || dateValue}
              extra={content?.hijriDate}
              templateId={templateId}
              layoutVariant={layoutVariant}
              style={style}
              isDark={isDark}
            />
          )}

          {/* Time Card */}
          {timeValue && (
            <EventInfoCard
              type="time"
              title="توقيت الحفل"
              subtitle={formattedTime || timeValue}
              extra={`${timezone} (توقيت محلي)`}
              templateId={templateId}
              layoutVariant={layoutVariant}
              style={style}
              isDark={isDark}
            />
          )}

          {/* Location Card if venue is present and no dedicated venue card in this section */}
          {venueName && !dateValue && !timeValue && (
            <EventInfoCard
              type="location"
              title="مكان المناسبة"
              subtitle={locationSubtitle}
              extra={locationExtra}
              templateId={templateId}
              layoutVariant={layoutVariant}
              style={style}
              isDark={isDark}
            />
          )}
        </div>
      </div>
    </section>
  );
};
