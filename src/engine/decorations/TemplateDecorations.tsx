/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TemplateConfig } from '../../types/template';

interface TopOrnamentProps {
  config: TemplateConfig;
  accentColor: string;
}

export const TemplateTopOrnament: React.FC<TopOrnamentProps> = ({ config, accentColor }) => {
  const { ornamentStyle } = config.decorations;

  switch (ornamentStyle) {
    case 'moroccan-arch':
      return (
        <div className="flex flex-col items-center justify-center my-3 select-none">
          <svg width="120" height="24" viewBox="0 0 120 24" fill="none" className="opacity-90">
            <path
              d="M0 12 H40 C45 12 48 4 54 2 C58 0 62 0 66 2 C72 4 75 12 80 12 H120"
              stroke={accentColor}
              strokeWidth="1.2"
              fill="none"
            />
            {/* Moroccan 8-point Star in center */}
            <circle cx="60" cy="9" r="2.5" fill={accentColor} />
            <polygon points="60,3 62,7 66,7 63,10 64,14 60,11 56,14 57,10 54,7 58,7" fill={accentColor} opacity="0.8" />
          </svg>
        </div>
      );

    case 'royal-crest':
      return (
        <div className="flex items-center justify-center gap-3 my-3 select-none">
          <div
            className="h-px w-16 sm:w-24 opacity-70"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor})`,
            }}
          />
          <div
            className="w-7 h-7 rounded-full border flex items-center justify-center shadow-xs"
            style={{
              borderColor: accentColor,
              backgroundColor: `${accentColor}18`,
              color: accentColor,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V17H19V19Z" />
            </svg>
          </div>
          <div
            className="h-px w-16 sm:w-24 opacity-70"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, transparent)`,
            }}
          />
        </div>
      );

    case 'floral-botanical':
      return (
        <div className="flex items-center justify-center gap-2 my-3 select-none opacity-85">
          <svg width="140" height="20" viewBox="0 0 140 20" fill="none">
            <path
              d="M10 10 C35 6, 50 14, 60 10 C65 8, 70 8, 75 10 C85 14, 100 6, 130 10"
              stroke={accentColor}
              strokeWidth="1"
            />
            {/* Gentle leaves */}
            <path d="M68 6 C70 3, 74 4, 73 7 C71 8, 69 7, 68 6 Z" fill={accentColor} />
            <path d="M72 14 C70 17, 66 16, 67 13 C69 12, 71 13, 72 14 Z" fill={accentColor} />
            <circle cx="70" cy="10" r="2.5" fill={accentColor} />
          </svg>
        </div>
      );

    case 'celestial-stars':
      return (
        <div className="flex items-center justify-center gap-3 my-3 select-none">
          <span className="text-[10px] opacity-60" style={{ color: accentColor }}>✦</span>
          <div
            className="h-px w-12 sm:w-16 opacity-60"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-sm font-serif" style={{ color: accentColor }}>✧ ✦ ✧</span>
          <div
            className="h-px w-12 sm:w-16 opacity-60"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-[10px] opacity-60" style={{ color: accentColor }}>✦</span>
        </div>
      );

    case 'sunburst':
      return (
        <div className="flex items-center justify-center gap-3 my-3 select-none">
          <div
            className="h-px w-12 sm:w-20 opacity-70"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="1.5">
            <circle cx="12" cy="12" r="4" fill={`${accentColor}33`} />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <div
            className="h-px w-12 sm:w-20 opacity-70"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'pearl-bead':
      return (
        <div className="flex items-center justify-center gap-1.5 my-3 select-none">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: accentColor, backgroundColor: `${accentColor}33` }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        </div>
      );

    case 'minimal-dash':
      return (
        <div className="flex items-center justify-center gap-3 my-3 select-none opacity-40">
          <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: accentColor }} />
          <div className="h-px w-8" style={{ backgroundColor: accentColor }} />
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center gap-2 my-2 select-none opacity-60">
          <div className="h-px w-12" style={{ backgroundColor: accentColor }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className="h-px w-12" style={{ backgroundColor: accentColor }} />
        </div>
      );
  }
};

interface SectionDividerProps {
  config: TemplateConfig;
  accentColor: string;
}

export const TemplateSectionDivider: React.FC<SectionDividerProps> = ({ config, accentColor }) => {
  const { dividerOrnament } = config.decorations;

  switch (dividerOrnament) {
    case 'royal-shield':
      return (
        <div className="flex items-center justify-center gap-3 my-4 select-none opacity-85">
          <div
            className="h-px w-16 sm:w-28"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: accentColor }}>✦</span>
            <div
              className="w-5 h-5 rounded-full border flex items-center justify-center shadow-xs"
              style={{ borderColor: `${accentColor}80`, backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" />
              </svg>
            </div>
            <span className="text-[10px]" style={{ color: accentColor }}>✦</span>
          </div>
          <div
            className="h-px w-16 sm:w-28"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'moroccan-arch':
      return (
        <div className="flex items-center justify-center gap-3 my-4 select-none opacity-90">
          <div
            className="h-px w-16 sm:w-24"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          {/* Moroccan 8-point Star */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div
              className="w-3.5 h-3.5 border rotate-45"
              style={{ borderColor: accentColor, backgroundColor: `${accentColor}20` }}
            />
            <div
              className="w-3.5 h-3.5 border absolute inset-0 m-auto"
              style={{ borderColor: accentColor }}
            />
            <div className="w-1.5 h-1.5 rounded-full absolute inset-0 m-auto" style={{ backgroundColor: accentColor }} />
          </div>
          <div
            className="h-px w-16 sm:w-24"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'pearl-bead':
      return (
        <div className="flex items-center justify-center gap-2 my-4 select-none opacity-75">
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <div
            className="w-2.5 h-2.5 rounded-full border"
            style={{ borderColor: accentColor, backgroundColor: `${accentColor}25` }}
          />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'floral-botanical':
      return (
        <div className="flex items-center justify-center gap-2 my-4 select-none opacity-80">
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <span className="text-xs" style={{ color: accentColor }}>❧</span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-xs scale-x-[-1]" style={{ color: accentColor }}>❧</span>
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'celestial-stars':
      return (
        <div className="flex items-center justify-center gap-2.5 my-4 select-none opacity-85">
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <span className="text-[11px]" style={{ color: accentColor }}>✦</span>
          <span className="text-xs" style={{ color: accentColor }}>✧</span>
          <span className="text-[11px]" style={{ color: accentColor }}>✦</span>
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'sunburst':
      return (
        <div className="flex items-center justify-center gap-2.5 my-4 select-none opacity-80">
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <span className="text-sm font-serif" style={{ color: accentColor }}>☼</span>
          <div
            className="h-px w-12 sm:w-20"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );

    case 'minimal-dash':
      return (
        <div className="flex items-center justify-center gap-2 my-4 select-none opacity-40">
          <div className="h-px w-10 sm:w-16" style={{ backgroundColor: accentColor }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <div className="h-px w-10 sm:w-16" style={{ backgroundColor: accentColor }} />
        </div>
      );

    case 'geometric-star':
    default:
      return (
        <div className="flex items-center justify-center gap-2 my-4 select-none opacity-70">
          <div
            className="h-px w-14 sm:w-24"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }}
          />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: accentColor }} />
          <div
            className="h-px w-14 sm:w-24"
            style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
          />
        </div>
      );
  }
};

interface CornerOrnamentsProps {
  color: string;
  size?: number;
  style?: 'royal' | 'moroccan' | 'clean' | 'floral';
}

export const TemplateCornerAccents: React.FC<CornerOrnamentsProps> = ({
  color,
  size = 20,
  style = 'royal',
}) => {
  if (style === 'royal') {
    return (
      <>
        {/* Top-Right Corner */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute top-2 right-2 pointer-events-none opacity-80"
        >
          <path d="M24 0 H6 C2.68 0 0 2.68 0 6 V24" stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill={color} />
        </svg>
        {/* Top-Left Corner */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute top-2 left-2 pointer-events-none opacity-80"
        >
          <path d="M0 0 H18 C21.32 0 24 2.68 24 6 V24" stroke={color} strokeWidth="1.5" />
          <circle cx="16" cy="8" r="2" fill={color} />
        </svg>
        {/* Bottom-Right Corner */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute bottom-2 right-2 pointer-events-none opacity-80"
        >
          <path d="M24 24 H6 C2.68 24 0 21.32 0 18 V0" stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="16" r="2" fill={color} />
        </svg>
        {/* Bottom-Left Corner */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="absolute bottom-2 left-2 pointer-events-none opacity-80"
        >
          <path d="M0 24 H18 C21.32 24 24 21.32 24 18 V0" stroke={color} strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2" fill={color} />
        </svg>
      </>
    );
  }

  if (style === 'moroccan') {
    return (
      <>
        <div className="absolute top-2.5 right-2.5 pointer-events-none opacity-70">
          <div className="w-2.5 h-2.5 border rotate-45" style={{ borderColor: color }} />
        </div>
        <div className="absolute top-2.5 left-2.5 pointer-events-none opacity-70">
          <div className="w-2.5 h-2.5 border rotate-45" style={{ borderColor: color }} />
        </div>
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none opacity-70">
          <div className="w-2.5 h-2.5 border rotate-45" style={{ borderColor: color }} />
        </div>
        <div className="absolute bottom-2.5 left-2.5 pointer-events-none opacity-70">
          <div className="w-2.5 h-2.5 border rotate-45" style={{ borderColor: color }} />
        </div>
      </>
    );
  }

  if (style === 'floral') {
    return (
      <>
        <span className="absolute top-2 right-2 pointer-events-none text-xs opacity-60" style={{ color }}>
          ❧
        </span>
        <span className="absolute top-2 left-2 pointer-events-none text-xs opacity-60 scale-x-[-1]" style={{ color }}>
          ❧
        </span>
        <span className="absolute bottom-2 right-2 pointer-events-none text-xs opacity-60 scale-y-[-1]" style={{ color }}>
          ❧
        </span>
        <span className="absolute bottom-2 left-2 pointer-events-none text-xs opacity-60 scale-[-1]" style={{ color }}>
          ❧
        </span>
      </>
    );
  }

  // Clean-line
  return (
    <>
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 opacity-60 pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 opacity-60 pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 opacity-60 pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 opacity-60 pointer-events-none" style={{ borderColor: color }} />
    </>
  );
};

interface BackgroundPatternOverlayProps {
  config: TemplateConfig;
}

export const TemplateBackgroundPatternOverlay: React.FC<BackgroundPatternOverlayProps> = ({ config }) => {
  const { patternType, patternOpacity = 0.05 } = config.backgrounds;

  if (!patternType || patternType === 'none') return null;

  if (patternType === 'moroccan-zellij') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
        style={{
          opacity: patternOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C5A059' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20zm0 10l10 10-10 10-10-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '60px 60px',
        }}
      />
    );
  }

  if (patternType === 'geometric-stars') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
        style={{
          opacity: patternOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12z' fill='%23D4AF37' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '40px 40px',
        }}
      />
    );
  }

  if (patternType === 'floral') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          opacity: patternOpacity,
          backgroundImage: `radial-gradient(#C89382 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    );
  }

  if (patternType === 'subtle-grain') {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 80%)`,
        }}
      />
    );
  }

  return null;
};
