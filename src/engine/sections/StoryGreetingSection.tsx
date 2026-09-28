/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { Heart, Sparkles } from 'lucide-react';
import { TemplateCornerAccents, TemplateSectionDivider } from '../decorations/TemplateDecorations';

interface StoryGreetingSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
}

export const StoryGreetingSection: React.FC<StoryGreetingSectionProps> = ({
  invitation,
  style,
  config,
}) => {
  const { content } = invitation;

  if (!content.invitationText && !content.hostNames) {
    return null;
  }

  const isDoubleBorder = config?.borders?.borderStyle === 'double';
  const cornerStyle =
    config?.borders?.framePattern === 'royal-corners'
      ? 'royal'
      : config?.borders?.framePattern === 'moroccan-arch'
      ? 'moroccan'
      : config?.borders?.framePattern === 'floral-flourish'
      ? 'floral'
      : 'clean';

  return (
    <section className="w-full max-w-xl mx-auto px-4 py-4 text-center select-none motion-fade-in">
      <div
        className={`relative p-6 sm:p-10 rounded-2xl border shadow-md overflow-hidden backdrop-blur-xs ${
          isDoubleBorder ? 'border-2' : ''
        }`}
        style={{
          backgroundColor: style.cardBg,
          borderColor: style.borderColor,
          borderRadius: style.cardRadius,
          boxShadow: config?.shadows?.cardShadow,
        }}
      >
        <TemplateCornerAccents color={style.accentColor} size={20} style={cornerStyle} />

        <div className="space-y-4 relative z-10">
          <div
            className="w-9 h-9 rounded-full border mx-auto flex items-center justify-center shadow-xs"
            style={{
              borderColor: style.accentColor,
              backgroundColor: `${style.accentColor}18`,
              color: style.accentColor,
            }}
          >
            <Heart className="w-4 h-4 fill-current" />
          </div>

          <h3
            className="text-base sm:text-xl font-serif font-bold"
            style={{ color: style.primaryColor }}
          >
            {content.eventTitle || 'فرحتنا تكتمل بحضوركم'}
          </h3>

          {config && <TemplateSectionDivider config={config} accentColor={style.accentColor} />}

          <p
            className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-serif px-2 sm:px-4"
            style={{ color: style.textColor, lineHeight: '2' }}
          >
            {content.invitationText ||
              'تتشرف عائلاتنا بدعوتكم الكريمة لمشاركتنا أبهى لحظات العمر، حضوركم شرف لنا ويزيد مناسبتنا بهجة وسروراً.'}
          </p>

          {content.dressCode && (
            <div
              className="mt-4 pt-4 border-t text-xs font-serif flex items-center justify-center gap-2"
              style={{ borderColor: style.borderColor, color: style.accentColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="font-bold">قواعد اللباس: </span>
              <span>{content.dressCode}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
