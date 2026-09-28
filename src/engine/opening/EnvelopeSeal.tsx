/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { OpeningPreset, OpeningPhase } from './types';

interface EnvelopeSealProps {
  preset: OpeningPreset;
  phase: OpeningPhase;
  onClick: () => void;
}

export const EnvelopeSeal: React.FC<EnvelopeSealProps> = ({ preset, phase, onClick }) => {
  const isBreaking = phase === 'opening-seal';
  const isBroken = phase !== 'closed' && phase !== 'opening-seal';

  const renderSealIcon = () => {
    switch (preset.sealType) {
      case 'moroccan-star':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Islamic 8-point geometric star */}
            <rect
              x="6"
              y="6"
              width="20"
              height="20"
              transform="rotate(0 16 16)"
              stroke={preset.sealBorder}
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
            />
            <rect
              x="6"
              y="6"
              width="20"
              height="20"
              transform="rotate(45 16 16)"
              stroke={preset.sealBorder}
              strokeWidth="1.5"
              fill="none"
              opacity="0.85"
            />
            <circle cx="16" cy="16" r="4" fill={preset.sealBorder} opacity="0.9" />
          </svg>
        );

      case 'pearl-embossed':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke={preset.sealBorder} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="16" cy="16" r="8" stroke={preset.sealBorder} strokeWidth="1.2" />
            <text
              x="16"
              y="19"
              textAnchor="middle"
              fill={preset.sealTextColor}
              fontSize="9"
              fontWeight="bold"
              fontFamily="serif"
            >
              M
            </text>
          </svg>
        );

      case 'floral-botanical':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Botanical rose petal motif */}
            <path
              d="M16 6 C12 10, 10 14, 16 20 C22 14, 20 10, 16 6 Z"
              fill={preset.sealTextColor}
              opacity="0.9"
            />
            <path
              d="M16 20 C14 23, 11 25, 8 25 C10 22, 13 21, 16 20 Z"
              fill={preset.sealTextColor}
              opacity="0.75"
            />
            <path
              d="M16 20 C18 23, 21 25, 24 25 C22 22, 19 21, 16 20 Z"
              fill={preset.sealTextColor}
              opacity="0.75"
            />
          </svg>
        );

      case 'black-obsidian':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Diamond / Hexagon Luxe Crest */}
            <polygon
              points="16,4 28,16 16,28 4,16"
              stroke={preset.sealBorder}
              strokeWidth="1.5"
              fill="none"
            />
            <polygon
              points="16,9 23,16 16,23 9,16"
              stroke={preset.sealBorder}
              strokeWidth="1"
              fill="none"
              opacity="0.7"
            />
            <circle cx="16" cy="16" r="2.5" fill={preset.sealTextColor} />
          </svg>
        );

      case 'sapphire-gem':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Celestial Star & Sapphire Facet */}
            <polygon
              points="16,3 20,12 29,16 20,20 16,29 12,20 3,16 12,12"
              fill="none"
              stroke={preset.sealBorder}
              strokeWidth="1.2"
            />
            <circle cx="16" cy="16" r="3.5" fill={preset.sealBorder} />
          </svg>
        );

      case 'rose-monogram':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke={preset.sealBorder} strokeWidth="1" />
            <path
              d="M11 21 V11 L16 17 L21 11 V21"
              stroke={preset.sealTextColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      case 'emerald-seal':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Royal Crown Crest */}
            <path
              d="M7 21 L5 11 L10 15 L16 8 L22 15 L27 11 L25 21 H7 Z"
              fill="none"
              stroke={preset.sealBorder}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="18" r="2" fill={preset.sealBorder} />
          </svg>
        );

      case 'minimal-mark':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="11" stroke={preset.sealBorder} strokeWidth="1" />
            <text
              x="16"
              y="19"
              textAnchor="middle"
              fill={preset.sealTextColor}
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="300"
              letterSpacing="1"
            >
              M
            </text>
          </svg>
        );

      case 'golden-sun':
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Radiant Sunburst */}
            <circle cx="16" cy="16" r="6" fill={preset.sealBorder} />
            <path
              d="M16 3 V7 M16 25 V29 M3 16 H7 M25 16 H29 M6.8 6.8 L9.6 9.6 M22.4 22.4 L25.2 25.2 M6.8 25.2 L9.6 22.4 M22.4 9.6 L25.2 6.8"
              stroke={preset.sealBorder}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'royal-crest':
      default:
        return (
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
            {/* Beaded rim and heraldic crown */}
            <circle cx="16" cy="16" r="12" stroke={preset.sealBorder} strokeWidth="1" strokeDasharray="2 1.5" />
            <path
              d="M8 21 L6 12 L11 15 L16 9 L21 15 L26 12 L24 21 H8 Z"
              fill={preset.sealTextColor}
              opacity="0.9"
            />
            <circle cx="16" cy="19.5" r="1.5" fill={preset.sealBorder} />
          </svg>
        );
    }
  };

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-40 transition-all select-none duration-500 cursor-pointer ${
        isBreaking
          ? 'scale-130 opacity-0 filter blur-xs'
          : isBroken
          ? 'opacity-0 pointer-events-none scale-75'
          : 'scale-100 opacity-100 hover:scale-108 active:scale-95'
      }`}
      style={{
        bottom: '-24px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      role="button"
      tabIndex={0}
      aria-label="ختم فتح الدعوة"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Outer Wax Irregular Rim */}
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-1.5 transition-transform"
        style={{
          background: preset.sealBg,
          border: `2px solid ${preset.sealBorder}`,
          boxShadow: preset.sealShadow,
        }}
      >
        {/* Inner Depressed Stamped Medallion */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center border border-white/20 shadow-inner"
          style={{
            color: preset.sealTextColor,
          }}
        >
          {renderSealIcon()}
        </div>
      </div>

      {/* Subtle Wax Seal Gleam Animation */}
      {phase === 'closed' && (
        <span className="absolute -inset-1 rounded-full animate-ping opacity-25 pointer-events-none"
          style={{ backgroundColor: preset.glowColor }}
        />
      )}
    </div>
  );
};
