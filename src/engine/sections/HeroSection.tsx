/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { Sparkles, Crown } from 'lucide-react';
import { TemplateTopOrnament, TemplateCornerAccents } from '../decorations/TemplateDecorations';
import { TextReveal } from '../animation';

interface HeroSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  config?: TemplateConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ invitation, style, config }) => {
  const { title, coverImageUrl, content, eventType } = invitation;

  const eventTypeLabel = {
    wedding: 'دعوة لحضور حفل الزفاف المبارك',
    engagement: 'دعوة لحضور حفل الخطوبة السعيد',
    aqiqah: 'دعوة لحضور حفل العقيقة المباركة',
    graduation: 'دعوة لحضور حفل التخرج والتكريم',
    birthday: 'دعوة للاحتفال بعيد الميلاد',
    anniversary: 'دعوة للاحتفال بذكرى سعيدة',
    family_event: 'دعوة لحضور لقاء عائلي بهيج',
    family: 'دعوة لحضور لقاء عائلي بهيج',
    private_event: 'دعوة لحضور مناسبة خاصة',
    private: 'دعوة لحضور مناسبة خاصة',
    other: 'دعوة كريمة لحضور مناسبة مميزة',
  }[eventType as string] || 'دعوة كريمة';

  const composition = config?.hero?.composition || 'arch-frame';
  const showBismillah = config?.hero?.showBismillah !== false;
  const isDarkTemplate =
    style.backgroundColor === '#0E0E11' ||
    style.backgroundColor === '#08080A' ||
    style.backgroundColor === '#0A1128';

  return (
    <section className="relative w-full overflow-hidden text-center select-none pt-10 pb-14 sm:py-20 px-4">
      {/* Background Layer: Cover Image or Gradient */}
      {coverImageUrl && composition === 'cinematic-fullscreen' ? (
        <div className="absolute inset-0 z-0">
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover filter brightness-[0.28] contrast-125 scale-105 transform motion-safe:transition-transform duration-1000"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 25%, rgba(243, 198, 79, 0.12) 0%, rgba(8, 8, 10, 0.85) 60%, ${style.backgroundColor} 100%)`,
            }}
          />
        </div>
      ) : coverImageUrl && composition !== 'arch-frame' && composition !== 'pearl-embossed' && composition !== 'royal-monogram' ? (
        <div className="absolute inset-0 z-0">
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover filter brightness-[0.35] scale-105 transform motion-safe:transition-transform duration-1000"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isDarkTemplate
                ? `linear-gradient(to bottom, rgba(8,8,10,0.6) 0%, rgba(8,8,10,0.92) 75%, ${style.backgroundColor} 100%)`
                : `linear-gradient(to bottom, rgba(23,19,22,0.6) 0%, rgba(23,19,22,0.85) 75%, ${style.backgroundColor} 100%)`,
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              config?.backgrounds?.primaryGradient ||
              `radial-gradient(circle at 50% 30%, ${style.primaryColor}18 0%, ${style.backgroundColor} 85%)`,
          }}
        />
      )}

      {/* Main Hero Container */}
      <div
        className={`relative z-10 max-w-xl mx-auto space-y-6 ${
          composition === 'royal-monogram'
            ? 'p-6 sm:p-10 rounded-2xl border-2'
            : composition === 'cinematic-fullscreen'
            ? 'p-6 sm:p-8'
            : ''
        }`}
        style={
          composition === 'royal-monogram'
            ? {
                borderColor: `${style.accentColor}50`,
                backgroundColor: `${style.cardBg}88`,
                boxShadow: `0 0 35px ${style.accentColor}18, inset 0 0 15px ${style.accentColor}10`,
              }
            : undefined
        }
      >
        {/* Royal Corner Accents if Royal Monogram */}
        {composition === 'royal-monogram' && (
          <TemplateCornerAccents color={style.accentColor} size={24} style="royal" />
        )}
        {composition === 'cinematic-fullscreen' && (
          <TemplateCornerAccents color={style.accentColor} size={18} style="clean" />
        )}

        {/* Top Ornament / Monogram */}
        {composition === 'royal-monogram' ? (
          <div className="flex flex-col items-center justify-center space-y-2 select-none">
            <div
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg"
              style={{
                borderColor: style.accentColor,
                backgroundColor: `${style.accentColor}20`,
                color: style.accentColor,
                boxShadow: `0 0 20px ${style.accentColor}33`,
              }}
            >
              <Crown className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${style.accentColor})` }} />
              <span className="text-[10px]" style={{ color: style.accentColor }}>✦ ✦ ✦</span>
              <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${style.accentColor}, transparent)` }} />
            </div>
          </div>
        ) : config ? (
          <TemplateTopOrnament config={config} accentColor={style.accentColor} />
        ) : (
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 sm:w-20" style={{ backgroundColor: style.accentColor }} />
            <div
              className="w-8 h-8 rounded-full border flex items-center justify-center"
              style={{
                borderColor: style.accentColor,
                backgroundColor: `${style.accentColor}18`,
                color: style.accentColor,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="h-px w-12 sm:w-20" style={{ backgroundColor: style.accentColor }} />
          </div>
        )}

        {/* Traditional Basmala */}
        {showBismillah && (
          <p
            className="text-xs sm:text-sm tracking-widest font-serif opacity-90"
            style={{ color: style.accentColor }}
          >
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>
        )}

        {/* Host Families Announcement */}
        {content.hostNames && (
          <p
            className="text-xs sm:text-sm font-serif leading-relaxed px-4 opacity-90"
            style={{ color: isDarkTemplate ? '#E8DED8' : style.textColor }}
          >
            تتشرف {content.hostNames} بدعوتكم
          </p>
        )}

        {/* Event Type Badge */}
        <div className="inline-block">
          <span
            className={`text-xs font-serif font-bold px-4 py-1.5 border shadow-xs ${
              config?.buttons?.radius === '9999px' ? 'rounded-full' : 'rounded-lg'
            }`}
            style={{
              borderColor: `${style.accentColor}60`,
              backgroundColor: isDarkTemplate ? 'rgba(23,19,22,0.7)' : `${style.accentColor}18`,
              color: style.accentColor,
            }}
          >
            {eventTypeLabel}
          </span>
        </div>

        {/* 1. Arch Frame for Moroccan Palace */}
        {coverImageUrl && composition === 'arch-frame' && (
          <div
            className="max-w-[220px] mx-auto overflow-hidden rounded-t-[110px] rounded-b-2xl border-2 shadow-xl p-1.5 my-2"
            style={{
              borderColor: style.accentColor,
              backgroundColor: `${style.cardBg}60`,
              boxShadow: `0 8px 25px rgba(21, 44, 77, 0.25)`,
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-52 object-cover rounded-t-[100px] rounded-b-xl"
            />
          </div>
        )}

        {/* 2. Oval Frame for Elegant Pearl */}
        {coverImageUrl && composition === 'pearl-embossed' && (
          <div
            className="max-w-[200px] mx-auto overflow-hidden rounded-[100px] border-2 shadow-md p-1.5 my-2"
            style={{
              borderColor: `${style.accentColor}60`,
              backgroundColor: '#FFFFFF',
              boxShadow: `0 8px 24px rgba(201, 164, 92, 0.15)`,
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-52 object-cover rounded-[92px]"
            />
          </div>
        )}

        {/* 3. Double Gold Framed Photo for Royal Gold & Emerald Royal */}
        {coverImageUrl && composition === 'royal-monogram' && (
          <div
            className="max-w-[210px] mx-auto overflow-hidden rounded-xl border-2 shadow-2xl p-1.5 my-2"
            style={{
              borderColor: style.accentColor,
              backgroundColor: `${style.cardBg}90`,
              boxShadow: `0 0 25px ${style.accentColor}25, 0 0 0 1px ${style.accentColor}40`,
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* 4. Floral Wreath Photo for Floral Romance */}
        {coverImageUrl && (composition === 'floral-wreath' || config?.decorations?.ornamentStyle === 'floral-botanical') && (
          <div
            className="max-w-[210px] mx-auto overflow-hidden rounded-3xl border-2 shadow-md p-1.5 my-2"
            style={{
              borderColor: `${style.accentColor}70`,
              backgroundColor: '#FFFFFF',
              boxShadow: `0 8px 24px rgba(122, 56, 71, 0.12)`,
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-48 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* 5. Celestial Night Silver Frame for Sapphire Night */}
        {coverImageUrl && composition === 'celestial-night' && (
          <div
            className="max-w-[220px] mx-auto overflow-hidden rounded-2xl border p-1.5 shadow-2xl my-2"
            style={{
              borderColor: `${style.accentColor}90`,
              backgroundColor: '#0A1128',
              boxShadow: `0 0 30px rgba(74, 144, 226, 0.3), 0 0 10px rgba(208, 222, 238, 0.2)`,
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-50 object-cover rounded-xl"
            />
          </div>
        )}

        {/* 6. Editorial Split Frame for Rose Romance */}
        {coverImageUrl && composition === 'split-crest' && (
          <div
            className="max-w-[220px] mx-auto overflow-hidden rounded-2xl border-2 p-1 shadow-lg my-2 rotate-[-1deg] transition-transform hover:rotate-0"
            style={{
              borderColor: style.accentColor,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 12px 32px rgba(160, 67, 84, 0.15)',
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-52 object-cover rounded-xl"
            />
          </div>
        )}

        {/* 7. Minimal Clean Photo for Minimal White */}
        {coverImageUrl && composition === 'minimal-centered' && (
          <div
            className="max-w-[200px] mx-auto overflow-hidden rounded-lg border my-2"
            style={{
              borderColor: '#EAEAEA',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        {/* 8. Sunset Radiance Warm Glow Photo for Golden Sunset */}
        {coverImageUrl && composition === 'sunset-radiance' && (
          <div
            className="max-w-[220px] mx-auto overflow-hidden rounded-2xl border-2 p-1.5 shadow-xl my-2"
            style={{
              borderColor: style.accentColor,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 10px 30px rgba(229, 159, 61, 0.25)',
            }}
          >
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-50 object-cover rounded-xl"
            />
          </div>
        )}

        {/* Celebrant Names (Huge Typography Styled Per Identity) */}
        <div className="py-2">
          {content.firstCelebrantName && content.secondCelebrantName ? (
            <div className="space-y-1 sm:space-y-2">
              <TextReveal delay={150}>
                <h1
                  className="text-3xl sm:text-5xl font-serif font-bold tracking-tight"
                  style={{
                    color: isDarkTemplate ? style.primaryColor : style.primaryColor,
                    fontFamily: style.fontFamilyArabic,
                    textShadow: isDarkTemplate ? `0 0 25px ${style.accentColor}40` : undefined,
                  }}
                >
                  {content.firstCelebrantName}
                </h1>
              </TextReveal>
              <div className="flex items-center justify-center gap-3 py-1">
                <div
                  className="h-px w-8 sm:w-14"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${style.accentColor})`,
                  }}
                />
                <span
                  className="font-serif italic text-lg sm:text-2xl"
                  style={{ color: style.accentColor }}
                >
                  {composition === 'arch-frame' ? 'و' : '&'}
                </span>
                <div
                  className="h-px w-8 sm:w-14"
                  style={{
                    background: `linear-gradient(90deg, ${style.accentColor}, transparent)`,
                  }}
                />
              </div>
              <TextReveal delay={240}>
                <h1
                  className="text-3xl sm:text-5xl font-serif font-bold tracking-tight"
                  style={{
                    color: isDarkTemplate ? style.primaryColor : style.primaryColor,
                    fontFamily: style.fontFamilyArabic,
                    textShadow: isDarkTemplate ? `0 0 25px ${style.accentColor}40` : undefined,
                  }}
                >
                  {content.secondCelebrantName}
                </h1>
              </TextReveal>
            </div>
          ) : (
            <TextReveal delay={180}>
              <h1
                className="text-3xl sm:text-5xl font-serif font-bold tracking-tight leading-snug px-4"
                style={{
                  color: isDarkTemplate ? style.primaryColor : style.primaryColor,
                  fontFamily: style.fontFamilyArabic,
                  textShadow: isDarkTemplate ? `0 0 25px ${style.accentColor}40` : undefined,
                }}
              >
                {content.celebrantNames || title}
              </h1>
            </TextReveal>
          )}
        </div>

        {/* Sub-headline / Event Greeting Line */}
        {content.eventTitle && content.eventTitle !== title && (
          <p
            className="text-xs sm:text-sm font-serif italic max-w-md mx-auto opacity-90 px-4"
            style={{ color: isDarkTemplate ? '#D4D0D2' : style.textColor }}
          >
            {content.eventTitle}
          </p>
        )}

        {/* Decorative Bottom Divider */}
        <div className="pt-2 flex items-center justify-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: style.accentColor }}
          />
          <div
            className="w-2.5 h-2.5 rotate-45 border"
            style={{
              borderColor: style.accentColor,
              backgroundColor: `${style.accentColor}33`,
            }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: style.accentColor }}
          />
        </div>
      </div>
    </section>
  );
};
