/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Heart,
  Users,
  User,
  Phone,
  Navigation,
  ExternalLink,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  Hourglass,
  Film,
  Camera,
} from 'lucide-react';
import { SAPPHIRE_NIGHT_CONFIG } from './configs';
import { TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';

export const SapphireNightTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Sapphire Night Palette: Deep Celestial Midnight & Starlight Silver
  const sapphire = theme?.primary_color || SAPPHIRE_NIGHT_CONFIG.colors.primary; // #4A90E2
  const silver = theme?.accent_color || SAPPHIRE_NIGHT_CONFIG.colors.accent; // #D0DEEE
  const bg = theme?.background_color || SAPPHIRE_NIGHT_CONFIG.colors.background; // #0A1128
  const cardBg = SAPPHIRE_NIGHT_CONFIG.colors.surface; // #101B3D
  const textColor = theme?.text_color || SAPPHIRE_NIGHT_CONFIG.colors.text; // #F0F4FC

  // RSVP Form state
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'declined'>('attending');
  const [partySize, setPartySize] = useState(1);
  const [wishes, setWishes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Music state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
    onTrackAction?.('music_toggle');
  };

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg('يرجى كتابة الاسم الكريم للمدعو');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (onRsvpSubmit) {
        const ok = await onRsvpSubmit({
          guestName: guestName.trim(),
          phone: phone.trim() || undefined,
          attendanceStatus: status,
          partySize: status === 'attending' ? partySize : 0,
          notesOrWishes: wishes.trim() || undefined,
        });
        if (ok) setSubmitted(true);
      } else {
        setSubmitted(true);
      }
      onTrackAction?.('rsvp_submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypeLabel = {
    wedding: 'دعوة لحضور حفل الزفاف الليلي البهيج',
    engagement: 'حفل الخطوبة السعيد في ليلة الياقوت',
    aqiqah: 'حفل العقيقة المباركة',
    graduation: 'حفل التخرج والتكريم الباهر',
    birthday: 'حفل ذكرى الميلاد الأنيق',
    anniversary: 'أمسية الاحتفال بذكرى سعيدة',
    family_event: 'لقاء عائلي ساهر بهيج',
    private_event: 'أمسية خاصة استثنائية',
  }[eventType as string] || 'دعوة كريمة وساهرة';

  const dateValue = content.dateIso || invitation.eventDate;
  const timeValue = content.timeText || invitation.eventTime;

  let formattedArabicDate = dateValue;
  if (dateValue) {
    try {
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        formattedArabicDate = parsedDate.toLocaleDateString('ar-MA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    } catch {
      // fallback
    }
  }

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!dateValue) return;
    const calculateTime = () => {
      const targetTime = new Date(dateValue).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPast: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [dateValue]);

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#F0F4FC] select-none"
      style={{
        backgroundColor: bg,
        backgroundImage: SAPPHIRE_NIGHT_CONFIG.backgrounds.primaryGradient,
      }}
    >
      {/* Background Subtle Stars / Night Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <span className="absolute top-[8%] left-[12%] text-xs" style={{ color: silver }}>✦</span>
        <span className="absolute top-[18%] right-[10%] text-sm" style={{ color: sapphire }}>✧</span>
        <span className="absolute top-[28%] left-[25%] text-[10px]" style={{ color: silver }}>✦</span>
        <span className="absolute top-[45%] right-[22%] text-xs" style={{ color: silver }}>✧</span>
        <span className="absolute top-[62%] left-[15%] text-xs" style={{ color: sapphire }}>✦</span>
        <span className="absolute top-[75%] right-[18%] text-[10px]" style={{ color: silver }}>✧</span>
        <span className="absolute top-[90%] left-[30%] text-xs" style={{ color: silver }}>✦</span>
      </div>

      {/* Floating Music Controller if track exists */}
      {invitation.music && settings.enableMusic !== false && (
        <div className="fixed top-4 left-4 z-50">
          <audio ref={audioRef} src={invitation.music.audio_url} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            aria-label="تشغيل الموسيقى"
            className="w-11 h-11 rounded-full border flex items-center justify-center shadow-xl backdrop-blur-md transition hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: 'rgba(16, 27, 61, 0.85)',
              borderColor: `${silver}80`,
              color: silver,
              boxShadow: `0 0 20px rgba(74, 144, 226, 0.35)`,
            }}
          >
            {isPlayingMusic ? (
              <Volume2 className="w-5 h-5 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 opacity-70" />
            )}
          </button>
        </div>
      )}

      {/* Silver Starlight Accent Line */}
      <div
        className="w-full h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${silver}80, ${sapphire}, ${silver}80, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: SAPPHIRE NIGHT ===================== */}
        <section
          className="relative p-6 sm:p-12 rounded-3xl border text-center space-y-6 overflow-hidden shadow-2xl"
          style={{
            borderColor: '#213361',
            backgroundColor: `${cardBg}EB`,
            boxShadow: `0 16px 48px -8px rgba(0, 0, 0, 0.8), 0 0 35px rgba(74, 144, 226, 0.25)`,
          }}
        >
          {/* Subtle Radial Glow in Center */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: sapphire }}
          />

          {/* Celestial Starlight Header with Silver Lines */}
          <div className="flex items-center justify-center gap-3 my-2 select-none">
            <span className="text-xs" style={{ color: silver }}>✦</span>
            <div className="h-px w-14" style={{ backgroundColor: '#213361' }} />
            <div
              className="w-8 h-8 rounded-full border flex items-center justify-center shadow-md"
              style={{
                borderColor: `${silver}70`,
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                color: silver,
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="h-px w-14" style={{ backgroundColor: '#213361' }} />
            <span className="text-xs" style={{ color: silver }}>✦</span>
          </div>

          {/* Traditional Basmala */}
          <p className="text-xs sm:text-sm tracking-widest opacity-90 font-serif" style={{ color: silver }}>
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-[#93A4C7] leading-relaxed px-4">
              تتشرف {content.hostNames} بدعوتكم
            </p>
          )}

          {/* Night Sapphire Badge */}
          <div className="inline-block">
            <span
              className="text-xs font-bold px-5 py-1.5 rounded-full border shadow-xs tracking-wide"
              style={{
                borderColor: `${silver}60`,
                backgroundColor: '#182752',
                color: silver,
              }}
            >
              {eventTypeLabel}
            </span>
          </div>

          {/* Celestial Cover Photo with Thin Silver Frame */}
          {invitation.coverImageUrl && (
            <div
              className="max-w-[220px] mx-auto overflow-hidden rounded-2xl border p-1 shadow-2xl transition-transform hover:scale-[1.02]"
              style={{
                borderColor: `${silver}80`,
                backgroundColor: '#0A1128',
                boxShadow: `0 0 35px rgba(74, 144, 226, 0.35), 0 0 10px rgba(208, 222, 238, 0.2)`,
              }}
            >
              <img
                src={invitation.coverImageUrl}
                alt={invitation.title}
                className="w-full h-52 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Names Typography: Large Centered Names as Main Element */}
          <div className="py-2 space-y-2">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{
                    color: silver,
                    textShadow: `0 0 30px rgba(74, 144, 226, 0.45)`,
                  }}
                >
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${silver})` }} />
                  <span className="italic text-2xl font-serif" style={{ color: sapphire }}>&</span>
                  <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${silver}, transparent)` }} />
                </div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{
                    color: silver,
                    textShadow: `0 0 30px rgba(74, 144, 226, 0.45)`,
                  }}
                >
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight"
                style={{
                  color: silver,
                  textShadow: `0 0 30px rgba(74, 144, 226, 0.45)`,
                }}
              >
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {content.eventTitle && content.eventTitle !== invitation.title && (
            <p className="text-xs sm:text-sm italic text-[#93A4C7] max-w-md mx-auto">
              {content.eventTitle}
            </p>
          )}

          <TemplateSectionDivider config={SAPPHIRE_NIGHT_CONFIG} accentColor={silver} />
        </section>

        {/* ===================== STORY / GREETING SECTION ===================== */}
        {content.invitationText && (
          <section
            className="p-6 sm:p-10 rounded-2xl border text-center space-y-4 shadow-xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}EB`,
            }}
          >
            <div
              className="w-10 h-10 rounded-full border mx-auto flex items-center justify-center"
              style={{
                borderColor: `${silver}60`,
                backgroundColor: 'rgba(74, 144, 226, 0.15)',
                color: silver,
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: silver }}>
              {content.eventTitle || 'يسعدنا تشريفكم لهذه الأمسية البهيجة'}
            </h3>
            <p className="text-xs sm:text-sm text-[#D0DEEE] leading-loose whitespace-pre-wrap px-4">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: '#213361', color: silver }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">قواعد اللباس: </span>
                <span>{content.dressCode}</span>
              </div>
            )}
          </section>
        )}

        {/* ===================== COUNTDOWN SECTION: CELESTIAL NIGHT ===================== */}
        {settings.enableCountdown !== false && dateValue && !timeLeft.isPast && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-5 shadow-xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}EB`,
            }}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest" style={{ color: silver }}>
              <Hourglass className="w-4 h-4" />
              <span>العد التنازلي للأمسية المرتقبة</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
              {[
                { label: 'أيام', val: timeLeft.days },
                { label: 'ساعات', val: timeLeft.hours },
                { label: 'دقائق', val: timeLeft.minutes },
                { label: 'ثوانٍ', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: '#0D1633',
                    borderColor: '#213361',
                  }}
                >
                  <span className="text-xl sm:text-3xl font-mono font-bold" style={{ color: silver }}>
                    {String(unit.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#93A4C7] mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== DATE & TIME SECTION: DARK BLUE PANEL ===================== */}
        {(dateValue || timeValue) && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-6 shadow-xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}EB`,
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: silver }}>
                توقيت اللقاء الساهر
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: silver }}>
                الموعد والزمان
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#0D1633',
                    borderColor: '#213361',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: silver, color: silver, backgroundColor: 'rgba(74, 144, 226, 0.2)' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#93A4C7]">التاريخ الميلادي</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-[11px]" style={{ color: silver }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#0D1633',
                    borderColor: '#213361',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: silver, color: silver, backgroundColor: 'rgba(74, 144, 226, 0.2)' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#93A4C7]">توقيت الحفل</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#7888A8] font-mono">
                    {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== VENUE & MAP SECTION: SILVER OUTLINED BUTTON ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-5 shadow-xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}EB`,
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: silver }}>
                الموقع والقاعة
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: silver }}>
                مكان الحفل والضيافة
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-white">
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#93A4C7] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: silver }} />
                  <span>
                    {content.venueCity ? `${content.venueCity} — ` : ''}
                    {content.venueAddress || invitation.venueAddress}
                  </span>
                </p>
              )}
            </div>

            {/* Silver Outlined Button */}
            {(content.googleMapsUrl || invitation.googleMapsUrl) && (
              <div className="pt-2">
                <a
                  href={content.googleMapsUrl || invitation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackAction?.('map_click')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition duration-300 shadow-md hover:bg-[#182752] cursor-pointer border"
                  style={{
                    backgroundColor: 'transparent',
                    color: silver,
                    borderColor: silver,
                    boxShadow: '0 0 15px rgba(208, 222, 238, 0.25)',
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  <span>📍 الوصول إلى مكان الحفل عبر Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            )}
          </section>
        )}

        {/* ===================== GALLERY SECTION: CINEMATIC FRAMES ===================== */}
        {settings.enableGallery !== false && invitation.gallery && invitation.gallery.length > 0 && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-6 shadow-xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}EB`,
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: silver }}>
                ذكريات وتفاصيل
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: silver }}>
                معرض الصور التذكارية
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {invitation.gallery.map((img, i) => (
                <div
                  key={img.id || i}
                  className="overflow-hidden rounded-xl border p-1 shadow-md transition-transform hover:scale-[1.03]"
                  style={{
                    borderColor: `${silver}50`,
                    backgroundColor: '#0D1633',
                  }}
                >
                  <img
                    src={img.media_url}
                    alt={img.caption || `صورة ${i + 1}`}
                    className="w-full h-36 sm:h-44 object-cover rounded-lg"
                    loading="lazy"
                  />
                  {img.caption && (
                    <p className="text-[10px] text-[#93A4C7] pt-1.5 truncate px-1">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== VIDEO SECTION ===================== */}
        {invitation.videos && invitation.videos.length > 0 && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-4 shadow-xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}EB`,
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: silver }}>
                مقطع تذكاري
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: silver }}>
                فيديو الدعوة
              </h3>
            </div>
            <div
              className="overflow-hidden rounded-xl border p-1"
              style={{ borderColor: `${silver}50`, backgroundColor: '#0D1633' }}
            >
              <div className="relative pt-[56.25%] w-full rounded-lg overflow-hidden bg-black">
                <iframe
                  src={invitation.videos[0].video_url}
                  title="Invitation Video"
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        )}

        {/* ===================== RSVP SECTION: PREMIUM DARK PANEL ===================== */}
        {settings.allowRsvp && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-right space-y-6 shadow-2xl"
            style={{
              borderColor: '#213361',
              backgroundColor: `${cardBg}FA`,
              boxShadow: '0 14px 44px rgba(0, 0, 0, 0.8), 0 0 25px rgba(74, 144, 226, 0.15)',
            }}
          >
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: silver }}>
                تأكيد الحضور
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: silver }}>
                يسعدنا تأكيد تشريفكم لمناسبتنا
              </h3>
              <p className="text-xs text-[#93A4C7]">
                يرجى موافاتنا بالرد لتنظيم استقبالكم في هذه الليلة المميزة
              </p>
            </div>

            {submitted ? (
              <div
                className="p-6 rounded-xl border text-center space-y-2"
                style={{
                  backgroundColor: 'rgba(74, 144, 226, 0.15)',
                  borderColor: `${silver}60`,
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: silver }} />
                <h4 className="text-sm font-bold" style={{ color: silver }}>
                  تم تسجيل الرد بنجاح!
                </h4>
                <p className="text-xs text-[#D0DEEE]">
                  شكراً جزيلاً، يسعدنا ويشرفنا حضوركم ومشاركتنا هذه الفرحة.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'attending' ? 'shadow-md' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? sapphire : '#0D1633',
                      color: status === 'attending' ? '#FFFFFF' : '#93A4C7',
                      borderColor: status === 'attending' ? silver : '#213361',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'declined' ? 'shadow-md' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? '#182752' : '#0D1633',
                      color: status === 'declined' ? '#F0F4FC' : '#93A4C7',
                      borderColor: status === 'declined' ? '#4A6296' : '#213361',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F0F4FC] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border outline-none bg-[#0A1128] border-[#213361] text-[#F0F4FC] focus:border-[#4A90E2]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#7888A8] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#F0F4FC] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#93A4C7] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border font-mono outline-none bg-[#0A1128] border-[#213361] text-[#F0F4FC] focus:border-[#4A90E2]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#7888A8] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#F0F4FC] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-[#0A1128] border-[#213361]">
                      <span className="text-xs text-[#93A4C7] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#4A90E2]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-lg border bg-[#101B3D] border-[#213361] text-xs font-bold hover:bg-[#182752] transition cursor-pointer text-white"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-[#4A90E2]">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-lg border bg-[#101B3D] border-[#213361] text-xs font-bold hover:bg-[#182752] transition cursor-pointer text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#F0F4FC] mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#93A4C7] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك وبالرفاه والبنين ودامت دياركم عامرة بالأفراح والمسرات..."
                    className="w-full text-xs p-3 rounded-lg border outline-none bg-[#0A1128] border-[#213361] text-[#F0F4FC] focus:border-[#4A90E2]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#FF6B6B] text-center">{errorMsg}</p>}

                {/* Silver outlined / gradient button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-lg hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: sapphire,
                    borderColor: `${silver}80`,
                    boxShadow: '0 4px 18px rgba(74, 144, 226, 0.35)',
                  }}
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>{isSubmitting ? 'جاري تسجيل الرد...' : 'إرسال تأكيد الحضور'}</span>
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
