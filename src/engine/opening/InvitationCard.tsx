/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OpeningPreset, OpeningPhase } from './types';
import { Sparkles, Calendar, Heart } from 'lucide-react';

interface InvitationCardProps {
  preset: OpeningPreset;
  phase: OpeningPhase;
  title: string;
  eventType?: string;
  hostNames?: string;
  celebrantNames?: string;
  eventDate?: string;
  venueName?: string;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  preset,
  phase,
  title,
  eventType,
  hostNames,
  celebrantNames,
  eventDate,
}) => {
  const isRevealed =
    phase === 'revealing-card' ||
    phase === 'transitioning' ||
    phase === 'completed';

  const isTransitioning = phase === 'transitioning' || phase === 'completed';

  // Format event date nicely if available
  const formattedDate = eventDate ? (() => {
    try {
      const d = new Date(eventDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      // fallback to raw
    }
    return eventDate;
  })() : null;

  return (
    <div
      className="absolute left-4 right-4 rounded-xl p-5 sm:p-6 text-center select-none flex flex-col items-center justify-between"
      style={{
        top: '18px',
        bottom: '18px',
        backgroundColor: preset.cardBg,
        border: preset.cardBorder,
        color: preset.cardTextColor,
        boxShadow: isRevealed ? preset.cardShadow : 'none',
        zIndex: isRevealed ? 40 : 15,
        transformStyle: 'preserve-3d',
        transition:
          'transform 750ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 600ms ease, z-index 100ms 200ms',
        transform: isTransitioning
          ? 'translateY(-110px) translateZ(60px) scale(1.08)'
          : isRevealed
          ? 'translateY(-85px) translateZ(40px) scale(1)'
          : 'translateY(0px) translateZ(0px) scale(0.96)',
        opacity: isTransitioning ? 0.95 : 1,
      }}
      dir="rtl"
    >
      {/* Top Subtle Border / Crest Decor */}
      <div className="flex items-center justify-center gap-2 w-full pt-1">
        <div
          className="h-px w-10 sm:w-16 opacity-40"
          style={{ backgroundColor: preset.cardAccentColor }}
        />
        <div
          className="w-2 h-2 rotate-45"
          style={{ backgroundColor: preset.cardAccentColor }}
        />
        <div
          className="h-px w-10 sm:w-16 opacity-40"
          style={{ backgroundColor: preset.cardAccentColor }}
        />
      </div>

      {/* Card Content Summary (as requested in Prompt 12: Event type, Host names, Date) */}
      <div className="my-auto py-2 px-1 max-w-full">
        {/* Event Type / Subtitle */}
        <p
          className="text-[11px] sm:text-xs tracking-wider mb-1 font-serif uppercase opacity-80"
          style={{ color: preset.cardAccentColor }}
        >
          {eventType ? `دعوة ${eventType}` : 'دعوة خاصة ومميزة'}
        </p>

        {/* Primary Celebrants / Title */}
        <h2
          className="text-base sm:text-lg font-bold font-serif mb-1 leading-snug line-clamp-2"
          style={{
            color: preset.cardTextColor,
            fontFamily: preset.fontHeading,
          }}
        >
          {celebrantNames || title}
        </h2>

        {/* Host Names if separate */}
        {hostNames && hostNames !== celebrantNames && (
          <p
            className="text-[11px] sm:text-xs opacity-85 font-serif line-clamp-1 mb-2"
            style={{ color: preset.cardTextColor }}
          >
            {hostNames}
          </p>
        )}

        {/* Date / Time */}
        {formattedDate && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-medium mt-1"
            style={{
              backgroundColor: `${preset.cardAccentColor}14`,
              color: preset.cardAccentColor,
              border: `1px solid ${preset.cardAccentColor}28`,
            }}
          >
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="w-full pb-1">
        <p
          className="text-[10px] font-serif opacity-60 tracking-wider flex items-center justify-center gap-1.5"
          style={{ color: preset.cardTextColor }}
        >
          <span>يسعدنا ويشرفنا حضوركم</span>
          <Sparkles className="w-2.5 h-2.5 opacity-70" />
        </p>
      </div>
    </div>
  );
};
