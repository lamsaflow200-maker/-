/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TemplateStylePreset } from '../../types/engine';
import { TemplateConfig } from '../../types/template';
import { getEventTargetTimestamp } from '../../utils/datetime';
import { Sparkles, Heart, Clock, Award } from 'lucide-react';
import { TemplateCornerAccents } from '../decorations/TemplateDecorations';

export type CountdownState = 'upcoming' | 'happening_now' | 'event-completed';

export interface CountdownTimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  state: CountdownState;
  totalSeconds: number;
}

export interface InvitationCountdownProps {
  dateIso?: string;
  timeStr?: string;
  timezone?: string;
  templateId?: string;
  style?: Partial<TemplateStylePreset>;
  config?: TemplateConfig;
  locale?: string;
}

export const InvitationCountdown: React.FC<InvitationCountdownProps> = ({
  dateIso,
  timeStr,
  timezone = 'Africa/Casablanca',
  templateId = 'royal-gold',
  style = {},
  config,
  locale = 'ar-MA',
}) => {
  const normTpl = (templateId || 'royal-gold').toLowerCase();

  // Calculate target timestamp based on timezone
  const targetTimestamp = useMemo(() => {
    return getEventTargetTimestamp(dateIso, timeStr, timezone);
  }, [dateIso, timeStr, timezone]);

  const [timeLeft, setTimeLeft] = useState<CountdownTimeLeft>(() => {
    if (!targetTimestamp) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, state: 'upcoming', totalSeconds: 0 };
    }
    const diff = targetTimestamp - Date.now();
    if (diff <= -21600000) {
      // 6 hours after start -> completed
      return { days: 0, hours: 0, minutes: 0, seconds: 0, state: 'event-completed', totalSeconds: 0 };
    }
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, state: 'happening_now', totalSeconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, state: 'upcoming', totalSeconds: Math.floor(diff / 1000) };
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!targetTimestamp) return;

    const tick = () => {
      const now = Date.now();
      const diff = targetTimestamp - now;

      // 6 hours after event start, transition to completed
      if (diff <= -21600000) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          state: 'event-completed',
          totalSeconds: 0,
        });
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      // Event is currently happening (within 6 hours of start)
      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          state: 'happening_now',
          totalSeconds: 0,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        state: 'upcoming',
        totalSeconds: Math.floor(diff / 1000),
      });
    };

    tick();
    timerRef.current = window.setInterval(tick, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [targetTimestamp]);

  if (!targetTimestamp) return null;

  const isDark =
    style.backgroundColor === '#0E0E11' ||
    style.backgroundColor === '#08080A' ||
    style.backgroundColor === '#0A1128' ||
    style.backgroundColor === '#050B14' ||
    style.backgroundColor === '#06100B';

  // Localized units
  const isEn = locale.startsWith('en');
  const isFr = locale.startsWith('fr');
  const isEs = locale.startsWith('es');
  const isDe = locale.startsWith('de');

  const unitLabels = isEn
    ? { days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' }
    : isFr
    ? { days: 'Jours', hours: 'Heures', minutes: 'Minutes', seconds: 'Secondes' }
    : isEs
    ? { days: 'Días', hours: 'Horas', minutes: 'Minutos', seconds: 'Segundos' }
    : isDe
    ? { days: 'Tage', hours: 'Stunden', minutes: 'Minuten', seconds: 'Sekunden' }
    : { days: 'يوم', hours: 'ساعة', minutes: 'دقيقة', seconds: 'ثانية' };

  // =========================================================================
  // STATE 1: EVENT COMPLETED (نتمنى أن تكون مناسبتكم قد كانت رائعة)
  // =========================================================================
  if (timeLeft.state === 'event-completed') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 rounded-2xl border text-center space-y-3 transition duration-500 shadow-md"
        style={{
          backgroundColor: isDark ? '#14141A' : `${style.backgroundColor}F0`,
          borderColor: `${style.accentColor}50`,
          borderRadius: style.cardRadius,
        }}
      >
        <div
          className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center mb-1"
          style={{
            borderColor: style.accentColor,
            backgroundColor: `${style.accentColor}15`,
            color: style.accentColor,
          }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <h4 className="text-base sm:text-lg font-serif font-bold" style={{ color: style.primaryColor }}>
          {isEn
            ? 'Event Completed'
            : isFr
            ? 'Événement Terminé'
            : 'انقضت المناسبة المباركة'}
        </h4>
        <p className="text-xs sm:text-sm max-w-sm mx-auto leading-relaxed" style={{ color: style.textColor }}>
          {isEn
            ? 'We hope your celebration was truly wonderful and memorable ❤️'
            : isFr
            ? 'Nous espérons que votre célébration a été inoubliable ❤️'
            : 'نتمنى أن تكون مناسبتكم قد كانت رائعة وحافلة بالمسرات ❤️'}
        </p>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: HAPPENING NOW (حان وقت المناسبة ✨)
  // =========================================================================
  if (timeLeft.state === 'happening_now') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 sm:p-8 rounded-2xl border-2 text-center space-y-3 transition duration-500 shadow-xl animate-pulse"
        style={{
          backgroundColor: isDark ? '#151520' : `${style.cardBg}F5`,
          borderColor: style.accentColor,
          borderRadius: style.cardRadius,
          boxShadow: `0 0 25px ${style.accentColor}30`,
        }}
      >
        <div
          className="w-12 h-12 rounded-full border mx-auto flex items-center justify-center mb-1"
          style={{
            borderColor: style.accentColor,
            backgroundColor: `${style.accentColor}20`,
            color: style.accentColor,
          }}
        >
          <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <h4 className="text-lg sm:text-xl font-serif font-bold" style={{ color: style.primaryColor }}>
          {isEn
            ? 'The Event is Happening Now! ✨'
            : isFr
            ? "C'est l'heure de la fête ! ✨"
            : 'حان وقت المناسبة المباركة ✨'}
        </h4>
        <p className="text-xs sm:text-sm font-serif max-w-sm mx-auto" style={{ color: style.textColor }}>
          {isEn
            ? 'Welcome everyone, we are delighted to celebrate this joyous moment with you!'
            : isFr
            ? 'Bienvenue à tous, nous sommes ravis de partager ce moment avec vous !'
            : 'أهلاً وسهلاً بجميع ضيوفنا الكرام، أنرتم حفلنا بحضوركم البهي!'}
        </p>
      </div>
    );
  }

  // =========================================================================
  // STATE 3: UPCOMING COUNTDOWN (10 BESPOKE TEMPLATE STYLES)
  // =========================================================================
  const units = [
    { label: unitLabels.days, value: timeLeft.days },
    { label: unitLabels.hours, value: timeLeft.hours },
    { label: unitLabels.minutes, value: timeLeft.minutes },
    { label: unitLabels.seconds, value: timeLeft.seconds },
  ];

  const accessibleText = `الوقت المتبقي حتى موعد الحفل: ${timeLeft.days} ${unitLabels.days}، ${timeLeft.hours} ${unitLabels.hours}، ${timeLeft.minutes} ${unitLabels.minutes}، و ${timeLeft.seconds} ${unitLabels.seconds}`;

  // 1. ROYAL GOLD: Framed Luxury Countdown (24K Gold Hairlines, Royal Monogram Corners)
  if (normTpl.includes('royal-gold')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="relative p-5 sm:p-7 rounded-2xl border-2 shadow-2xl space-y-4"
        style={{
          borderColor: '#D4AF37',
          backgroundColor: '#0E0E12',
          boxShadow: '0 0 35px rgba(212, 175, 55, 0.25)',
        }}
      >
        <TemplateCornerAccents color="#D4AF37" size={18} style="royal" />
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl border border-[#D4AF37]/40 bg-[#14141A] text-center shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              <span className="text-xl sm:text-3xl font-mono font-bold text-[#D4AF37] tracking-wider transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-serif text-[#C9A45C] mt-1 font-medium">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. ELEGANT PEARL: Soft Clean Countdown (Embossed pearl cards, warm ivory glow)
  if (normTpl.includes('elegant-pearl')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="p-4 sm:p-6 rounded-3xl border border-[#E8DED8] bg-[#FAF9F6]/90 shadow-sm space-y-3"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl border border-[#EDE4DC] bg-white text-center shadow-xs flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
            >
              <span className="text-xl sm:text-3xl font-serif font-bold text-[#5A1020] transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#8E8B94] mt-0.5">{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. MOROCCAN PALACE: Decorative Geometric Framing (Zellij arches, copper/brass hues)
  if (normTpl.includes('moroccan-palace')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="relative p-5 sm:p-7 rounded-2xl border-2 border-[#C9A45C]/60 bg-[#0C1322] shadow-xl space-y-3"
      >
        <TemplateCornerAccents color="#C9A45C" size={18} style="moroccan" />
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl border border-[#C9A45C]/30 bg-[#121B2E] text-center shadow-inner flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              <span className="text-xl sm:text-3xl font-mono font-bold text-[#E5C178] transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-serif text-[#C9A45C] mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. BLACK LUXURY: Editorial Minimal Countdown (Razor hairline borders, high-contrast monospace)
  if (normTpl.includes('black-luxury')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="p-4 sm:p-6 rounded-none border-y border-[#333333] bg-[#0A0A0C] space-y-3"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 border-r border-[#222222] last:border-none text-center flex flex-col items-center justify-center"
            >
              <span className="text-2xl sm:text-4xl font-mono font-bold text-white tracking-widest transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] sm:text-[11px] font-mono uppercase tracking-widest text-[#777777] mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. FLORAL ROMANCE: Soft Romantic Cards (Blush pink backdrop, rounded soft petals)
  if (normTpl.includes('floral-romance')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="p-4 sm:p-6 rounded-3xl border border-[#F2D6DC] bg-[#FFF8F9] shadow-sm space-y-3"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl border border-[#FCE8ED] bg-white text-center shadow-xs flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              <span className="text-xl sm:text-3xl font-serif font-bold text-[#8C2D43] transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#A8727E] mt-1 font-serif">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 6. SAPPHIRE NIGHT: Dark Blue + Silver Elegant Countdown (Sapphire navy, starlight silver)
  if (normTpl.includes('sapphire-night')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="relative p-5 sm:p-7 rounded-2xl border border-[#94A3B8]/40 bg-[#070D1E] shadow-2xl space-y-3"
        style={{ boxShadow: '0 0 30px rgba(56, 189, 248, 0.15)' }}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl border border-[#38BDF8]/20 bg-[#0E1A38] text-center shadow-inner flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              <span className="text-xl sm:text-3xl font-mono font-bold text-[#E2E8F0] tracking-wide transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-serif text-[#38BDF8] mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. ROSE ROMANCE: Editorial Rose Blocks (Terracotta / dusty rose cards)
  if (normTpl.includes('rose-romance')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="p-4 sm:p-6 rounded-2xl border border-[#E5C2BD] bg-[#FAF3F0] shadow-sm space-y-3"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl border border-[#ECD1CC] bg-[#FFFFFF] text-center shadow-xs flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              <span className="text-xl sm:text-3xl font-serif font-bold text-[#7E3D35] transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#9B6B64] mt-0.5 font-serif">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. EMERALD ROYAL: Emerald Framed Countdown (Deep emerald with royal gold accents)
  if (normTpl.includes('emerald-royal')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="relative p-5 sm:p-7 rounded-2xl border-2 border-[#D4AF37]/50 bg-[#071911] shadow-2xl space-y-3"
      >
        <TemplateCornerAccents color="#D4AF37" size={16} style="royal" />
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-xl border border-[#D4AF37]/30 bg-[#0E2C1E] text-center shadow-md flex flex-col items-center justify-center transition-transform hover:scale-105"
            >
              <span className="text-xl sm:text-3xl font-mono font-bold text-[#F3E5AB] transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs font-serif text-[#D4AF37] mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 9. MINIMAL WHITE: Typography-focused Minimal Countdown (Monochrome clean lines)
  if (normTpl.includes('minimal-white') || normTpl.includes('royal-minimalist')) {
    return (
      <div
        role="timer"
        aria-label={accessibleText}
        className="p-5 sm:p-6 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-3"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map((unit, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 text-center border-r border-neutral-100 last:border-none flex flex-col items-center justify-center"
            >
              <span className="text-2xl sm:text-4xl font-mono font-light text-neutral-900 tracking-tight transition-opacity duration-300">
                {String(unit.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-400 mt-1 uppercase tracking-widest font-mono">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 10. GOLDEN SUNSET (and default): Warm Cinematic Countdown (Amber / Sunset warm gradient)
  return (
    <div
      role="timer"
      aria-label={accessibleText}
      className="p-5 sm:p-7 rounded-2xl border border-[#D97706]/40 bg-[#1F1610] shadow-xl space-y-3"
      style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
    >
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {units.map((unit, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-4 rounded-xl border border-[#F59E0B]/30 bg-[#2E2015] text-center shadow-inner flex flex-col items-center justify-center transition-transform hover:scale-105"
          >
            <span className="text-xl sm:text-3xl font-mono font-bold text-[#FDE68A] transition-opacity duration-300">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-serif text-[#F59E0B] mt-1 font-medium">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
