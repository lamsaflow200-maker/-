/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TemplateStylePreset } from '../../types/engine';
import { Calendar, Clock, MapPin, Sparkles, Compass } from 'lucide-react';
import { TemplateCornerAccents } from '../decorations/TemplateDecorations';

export type EventCardType = 'date' | 'time' | 'location';
export type EventLayoutVariant =
  | 'centered'
  | 'vertical'
  | 'horizontal'
  | 'editorial'
  | 'framed'
  | 'minimal'
  | 'ornamental';

export interface EventInfoCardProps {
  type: EventCardType;
  title: string;
  subtitle: string;
  extra?: string;
  templateId?: string;
  layoutVariant?: EventLayoutVariant;
  style: TemplateStylePreset;
  action?: React.ReactNode;
  isDark?: boolean;
}

/**
 * Returns template-appropriate icon for each card type
 */
function getTemplateIcon(type: EventCardType, templateId = 'royal-gold') {
  const norm = templateId.toLowerCase();
  if (type === 'date') {
    return <Calendar className="w-5 h-5" />;
  }
  if (type === 'time') {
    return <Clock className="w-5 h-5" />;
  }
  // location
  if (norm.includes('royal') || norm.includes('moroccan')) {
    return <Compass className="w-5 h-5" />;
  }
  return <MapPin className="w-5 h-5" />;
}

export const EventInfoCard: React.FC<EventInfoCardProps> = ({
  type,
  title,
  subtitle,
  extra,
  templateId = 'royal-gold',
  layoutVariant = 'centered',
  style,
  action,
  isDark = false,
}) => {
  const normTpl = templateId.toLowerCase();

  // Custom template styling nuances
  const isRoyal = normTpl.includes('royal-gold');
  const isPearl = normTpl.includes('elegant-pearl');
  const isMoroccan = normTpl.includes('moroccan-palace');
  const isBlackLuxury = normTpl.includes('black-luxury');
  const isFloral = normTpl.includes('floral-romance');
  const isSapphire = normTpl.includes('sapphire-night');
  const isRose = normTpl.includes('rose-romance');
  const isEmerald = normTpl.includes('emerald-royal');
  const isMinimal = normTpl.includes('minimal-white') || normTpl.includes('royal-minimalist');
  const isSunset = normTpl.includes('golden-sunset');

  const icon = getTemplateIcon(type, templateId);

  // 1. MINIMAL LAYOUT
  if (layoutVariant === 'minimal' || isMinimal) {
    return (
      <div
        className="p-5 sm:p-6 text-center space-y-2 border-b sm:border-b-0 sm:border-r last:border-none transition duration-300"
        style={{ borderColor: `${style.borderColor}40` }}
      >
        <div
          className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-1"
          style={{ color: style.accentColor }}
        >
          {icon}
        </div>
        <span className="text-[11px] uppercase tracking-widest block font-mono text-[#8E8B94]">
          {title}
        </span>
        <p className="text-sm sm:text-base font-serif font-bold" style={{ color: style.textColor }}>
          {subtitle}
        </p>
        {extra && (
          <span className="text-[11px] block opacity-80" style={{ color: style.accentColor }}>
            {extra}
          </span>
        )}
        {action && <div className="pt-2">{action}</div>}
      </div>
    );
  }

  // 2. HORIZONTAL LAYOUT
  if (layoutVariant === 'horizontal') {
    return (
      <div
        className="p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 text-right transition-transform hover:scale-[1.01]"
        style={{
          backgroundColor: isDark ? '#141418' : `${style.backgroundColor}EE`,
          borderColor: style.borderColor,
          borderRadius: style.cardRadius,
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              borderColor: `${style.accentColor}60`,
              backgroundColor: `${style.accentColor}15`,
              color: style.accentColor,
            }}
          >
            {icon}
          </div>
          <div>
            <span className="text-[11px] text-[#8E8B94] block font-mono">{title}</span>
            <p className="text-xs sm:text-sm font-serif font-bold" style={{ color: style.textColor }}>
              {subtitle}
            </p>
            {extra && (
              <span className="text-[10px] block mt-0.5" style={{ color: style.accentColor }}>
                {extra}
              </span>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  // 3. EDITORIAL LAYOUT
  if (layoutVariant === 'editorial' || isBlackLuxury || isRose) {
    return (
      <div
        className="p-5 sm:p-6 rounded-none border-l-2 text-right space-y-2 relative transition duration-300"
        style={{
          borderLeftColor: style.accentColor,
          backgroundColor: isDark ? '#0F0F14' : `${style.cardBg}99`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.accentColor }} />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A8F92]">
            {title}
          </span>
        </div>
        <p className="text-sm sm:text-base font-serif font-bold tracking-wide" style={{ color: style.textColor }}>
          {subtitle}
        </p>
        {extra && (
          <span className="text-[11px] font-serif block opacity-75" style={{ color: style.accentColor }}>
            {extra}
          </span>
        )}
        {action && <div className="pt-2">{action}</div>}
      </div>
    );
  }

  // 4. FRAMED / ROYAL LUXURY LAYOUT
  if (layoutVariant === 'framed' || isRoyal || isEmerald) {
    return (
      <div
        className="relative p-5 sm:p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center space-y-2 shadow-lg transition-transform hover:scale-[1.02]"
        style={{
          backgroundColor: isDark ? '#121216' : '#FFFFFF',
          borderColor: `${style.accentColor}60`,
          borderRadius: style.cardRadius,
          boxShadow: `0 4px 20px ${style.accentColor}18`,
        }}
      >
        <TemplateCornerAccents color={style.accentColor} size={14} style="royal" />
        <div
          className="w-11 h-11 rounded-full border flex items-center justify-center mb-0.5 shadow-sm"
          style={{
            borderColor: style.accentColor,
            color: style.accentColor,
            backgroundColor: `${style.accentColor}18`,
          }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-mono text-[#8E8B94]">{title}</span>
        <p className="text-xs sm:text-sm font-bold font-serif px-2 leading-relaxed" style={{ color: style.textColor }}>
          {subtitle}
        </p>
        {extra && (
          <span className="text-[11px] font-serif font-medium" style={{ color: style.accentColor }}>
            {extra}
          </span>
        )}
        {action && <div className="pt-1.5 w-full">{action}</div>}
      </div>
    );
  }

  // 5. ORNAMENTAL / MOROCCAN LAYOUT
  if (layoutVariant === 'ornamental' || isMoroccan) {
    return (
      <div
        className="relative p-5 sm:p-6 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 shadow-md transition-transform hover:scale-[1.02]"
        style={{
          backgroundColor: isDark ? '#0C1322' : '#FBF7F0',
          borderColor: `${style.accentColor}70`,
          borderRadius: style.cardRadius,
        }}
      >
        <TemplateCornerAccents color={style.accentColor} size={14} style="moroccan" />
        <div
          className="w-11 h-11 rounded-xl border flex items-center justify-center mb-0.5"
          style={{
            borderColor: style.accentColor,
            color: style.accentColor,
            backgroundColor: `${style.accentColor}20`,
          }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-mono tracking-wider text-[#A09A98]">{title}</span>
        <p className="text-xs sm:text-sm font-bold font-serif px-2" style={{ color: style.textColor }}>
          {subtitle}
        </p>
        {extra && (
          <span className="text-[11px] font-serif" style={{ color: style.accentColor }}>
            {extra}
          </span>
        )}
        {action && <div className="pt-1.5 w-full">{action}</div>}
      </div>
    );
  }

  // 6. DEFAULT / CENTERED (Elegant Pearl, Floral Romance, Golden Sunset, etc.)
  return (
    <div
      className="p-5 sm:p-6 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition-transform hover:scale-[1.02] shadow-2xs"
      style={{
        backgroundColor: isDark ? '#15151A' : `${style.backgroundColor}B3`,
        borderColor: style.borderColor,
        borderRadius: style.cardRadius,
      }}
    >
      <div
        className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
        style={{
          borderColor: style.accentColor,
          color: style.accentColor,
          backgroundColor: `${style.accentColor}18`,
        }}
      >
        {icon}
      </div>
      <span className="text-[11px] text-[#8E8B94]">{title}</span>
      <p className="text-xs sm:text-sm font-bold font-serif px-1 leading-relaxed" style={{ color: style.textColor }}>
        {subtitle}
      </p>
      {extra && (
        <span className="text-[11px] font-serif" style={{ color: style.accentColor }}>
          {extra}
        </span>
      )}
      {action && <div className="pt-1.5 w-full">{action}</div>}
    </div>
  );
};
