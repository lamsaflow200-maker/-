/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { InvitationCountdown } from '../countdown/InvitationCountdown';
import { isValidDateString } from '../../utils/datetime';
import { TemplateCornerAccents } from '../decorations/TemplateDecorations';

interface CountdownSectionProps {
  invitation: PublicInvitationViewModel;
  style?: Partial<TemplateStylePreset>;
  config?: TemplateConfig;
  locale?: string;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  invitation,
  style = {},
  config,
  locale = 'ar-MA',
}) => {
  const { content, settings, templateId } = invitation;

  if (settings.enableCountdown === false) return null;

  const targetDateStr = content.dateIso || invitation.eventDate;
  if (!targetDateStr) return null;

  // Validate date format to prevent crashing on invalid data (Requirement 34)
  if (!isValidDateString(targetDateStr)) {
    return null;
  }

  const cardBg = style.cardBg || '#FFFFFF';
  const borderColor = style.borderColor || '#E8DED8';
  const cardRadius = style.cardRadius || '1rem';
  const accentColor = style.accentColor || '#C9A45C';
  const primaryColor = style.primaryColor || '#5A1020';
  const backgroundColor = style.backgroundColor || '#FAF7F2';

  const isDark =
    backgroundColor === '#0E0E11' ||
    backgroundColor === '#08080A' ||
    backgroundColor === '#0A1128' ||
    backgroundColor === '#050B14' ||
    backgroundColor === '#06100B';

  const isDoubleBorder = config?.borders?.borderStyle === 'double';
  const cornerStyle =
    config?.borders?.framePattern === 'royal-corners'
      ? 'royal'
      : config?.borders?.framePattern === 'moroccan-arch'
      ? 'moroccan'
      : config?.borders?.framePattern === 'floral-flourish'
      ? 'floral'
      : 'clean';

  const isEn = locale.startsWith('en');
  const isFr = locale.startsWith('fr');

  return (
    <section
      aria-label="العد التنازلي للمناسبة"
      className="w-full max-w-xl mx-auto px-4 py-4 select-none motion-fade-in text-center"
    >
      <div
        className={`relative p-6 sm:p-8 rounded-2xl border shadow-md space-y-5 ${
          isDoubleBorder ? 'border-2' : ''
        }`}
        style={{
          backgroundColor: cardBg,
          borderColor: borderColor,
          borderRadius: cardRadius,
          boxShadow: config?.shadows?.cardShadow,
        }}
      >
        <TemplateCornerAccents color={accentColor} size={18} style={cornerStyle} />

        <div className="space-y-1">
          <span
            className="text-[11px] font-mono tracking-widest uppercase block"
            style={{ color: accentColor }}
          >
            {isEn ? 'Event Countdown' : isFr ? 'Compte à Rebours' : 'العد التنازلي للحدث'}
          </span>
          <h3
            className="text-base sm:text-lg font-serif font-bold"
            style={{ color: primaryColor }}
          >
            {isEn
              ? 'Counting down the moments'
              : isFr
              ? 'Nous attendons ce moment avec impatience'
              : 'ننتظر لقاءكم بشوق وفرح بعد'}
          </h3>
        </div>

        {/* Real-time High Performance Countdown Component */}
        <InvitationCountdown
          dateIso={targetDateStr}
          timeStr={content.timeText || invitation.eventTime}
          timezone={invitation.timezone}
          templateId={templateId}
          style={style}
          config={config}
          locale={locale}
        />
      </div>
    </section>
  );
};
