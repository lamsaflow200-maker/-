/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { isValidGoogleMapsUrl } from '../../utils/datetime';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';
import { TemplateCornerAccents } from '../decorations/TemplateDecorations';

export interface EventLocationSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
  locale?: string;
  onTrackAction?: (actionName: string) => void;
}

export const EventLocationSection: React.FC<EventLocationSectionProps> = ({
  invitation,
  style,
  config,
  locale = 'ar-MA',
  onTrackAction,
}) => {
  const { content, templateId } = invitation;

  const venueName = content?.venueName || invitation.venueName;
  const venueCity = content?.venueCity;
  const venueAddress = content?.venueAddress || invitation.venueAddress;
  const rawMapsUrl = content?.googleMapsUrl || invitation.googleMapsUrl;

  const hasValidMapUrl = isValidGoogleMapsUrl(rawMapsUrl);
  const mapsUrl = hasValidMapUrl ? rawMapsUrl!.trim() : undefined;

  // Requirement 17: If no location data exists, do NOT render an empty section!
  if (!venueName && !venueAddress && !mapsUrl) {
    return null;
  }

  const handleMapsClick = () => {
    onTrackAction?.('map_click');
  };

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

  // Determine button styling based on template
  const btnRadius = config?.buttons?.radius || style.buttonRadius || '1rem';
  const btnBg = config?.buttons?.primaryBg || style.primaryColor;
  const btnText = config?.buttons?.primaryText || '#FFFFFF';

  const isEn = locale.startsWith('en');
  const isFr = locale.startsWith('fr');

  const normTpl = (templateId || '').toLowerCase();
  const isRoyal = normTpl.includes('royal-gold');
  const isMoroccan = normTpl.includes('moroccan-palace');

  return (
    <section
      aria-label="موقع ومكان الحفل"
      className="w-full max-w-xl mx-auto px-4 py-4 select-none motion-fade-in"
    >
      <div
        className={`relative p-6 sm:p-8 rounded-2xl border shadow-md text-center space-y-5 ${
          isDoubleBorder ? 'border-2' : ''
        }`}
        style={{
          backgroundColor: style.cardBg,
          borderColor: style.borderColor,
          borderRadius: style.cardRadius,
          boxShadow: config?.shadows?.cardShadow,
        }}
      >
        <TemplateCornerAccents color={style.accentColor} size={18} style={cornerStyle} />

        {/* Section Header */}
        <div className="space-y-1">
          <span
            className="text-[11px] font-mono tracking-widest uppercase block"
            style={{ color: style.accentColor }}
          >
            {isEn ? 'Event Venue' : isFr ? 'Lieu de Réception' : 'الموقع والقاعة'}
          </span>
          <h3
            className="text-base sm:text-lg font-serif font-bold"
            style={{ color: style.primaryColor }}
          >
            {isEn
              ? 'Reception & Celebration Venue'
              : isFr
              ? 'Lieu de la Cérémonie'
              : 'مكان الحفل والاستقبال'}
          </h3>
        </div>

        {/* Venue Information */}
        <div className="space-y-2 py-1">
          {venueName && (
            <h4
              className="text-lg sm:text-xl font-serif font-bold tracking-wide"
              style={{ color: style.textColor }}
            >
              {venueName}
            </h4>
          )}

          {(venueCity || venueAddress) && (
            <p
              className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed flex items-center justify-center gap-2"
              style={{ color: isDark ? '#A19EA8' : '#6F6668' }}
            >
              {isMoroccan || isRoyal ? (
                <Compass className="w-4 h-4 shrink-0 text-[#C9A45C]" />
              ) : (
                <MapPin className="w-4 h-4 shrink-0" style={{ color: style.accentColor }} />
              )}
              <span>
                {venueCity ? `${venueCity} — ` : ''}
                {venueAddress}
              </span>
            </p>
          )}
        </div>

        {/* Requirement 20 & 23: GOOGLE MAPS BUTTON (Only rendered if URL is valid) */}
        {mapsUrl && (
          <div className="pt-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMapsClick}
              aria-label={
                isEn
                  ? `Open directions to ${venueName || 'venue'} in Google Maps (opens in new tab)`
                  : isFr
                  ? `Ouvrir l'itinéraire vers ${venueName || 'le lieu'} sur Google Maps`
                  : `الوصول إلى مكان الحفل عبر خرائط جوجل (${venueName || 'المكان'}) يفتح في نافذة جديدة`
              }
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 text-xs sm:text-sm font-serif font-bold transition duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                backgroundColor: isRoyal ? '#D4AF37' : btnBg,
                color: isRoyal ? '#0E0E11' : btnText,
                borderRadius: btnRadius,
                border: config?.buttons?.primaryBorder
                  ? `1px solid ${config.buttons.primaryBorder}`
                  : undefined,
                boxShadow: isRoyal
                  ? '0 4px 20px rgba(212, 175, 55, 0.35)'
                  : config?.buttons?.primaryShadow,
              }}
            >
              <Navigation className="w-4 h-4" />
              <span>
                {isEn
                  ? '📍 Directions via Google Maps'
                  : isFr
                  ? '📍 Itinéraire sur Google Maps'
                  : '📍 الوصول إلى مكان الحفل'}
              </span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
