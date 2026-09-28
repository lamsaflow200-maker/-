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
  Crown,
  Sparkles,
  Navigation,
  ExternalLink,
  Heart,
  Users,
  User,
  Phone,
  Volume2,
  VolumeX,
  Hourglass,
} from 'lucide-react';
import { EMERALD_ROYAL_CONFIG } from './configs';
import { TemplateCornerAccents, TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';

export const EmeraldRoyalTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Emerald Dominant Palette
  const deepEmerald = theme?.primary_color || EMERALD_ROYAL_CONFIG.colors.primary; // #0D422C / #082F1E
  const darkGreenBg = '#051A10';
  const emeraldSurface = '#0A2B1D';
  const gold = theme?.accent_color || EMERALD_ROYAL_CONFIG.colors.accent; // #D4AF37
  const warmIvory = '#F5EFE6';
  const ivoryText = '#FAF8F5';

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
    wedding: 'حفل الزفاف الزمردي الملكي',
    engagement: 'حفل الخطوبة الملكي البهيج',
    aqiqah: 'حفل العقيقة المباركة',
    graduation: 'حفل التخرج والتكريم الملكي',
    birthday: 'حفل ذكرى الميلاد السعيد',
    anniversary: 'الاحتفال بالذكرى السنوية',
    family_event: 'لقاء عائلي ملكي فخم',
    private_event: 'أمسية خاصة وسلطانية',
  }[eventType as string] || 'دعوة ملكية خاصة';

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
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#F5EFE6] select-none"
      style={{
        backgroundColor: darkGreenBg,
        backgroundImage: 'radial-gradient(circle at 50% 15%, #0B3D26 0%, #051A10 80%)',
      }}
    >
      {/* Subtle Geometric Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage: `radial-gradient(${gold} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Music Controller */}
      {invitation.music && settings.enableMusic !== false && (
        <div className="fixed top-4 left-4 z-50">
          <audio ref={audioRef} src={invitation.music.audio_url} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            aria-label="تشغيل الموسيقى"
            className="w-11 h-11 rounded-full border-2 flex items-center justify-center shadow-xl backdrop-blur-md transition hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: 'rgba(10, 43, 29, 0.85)',
              borderColor: gold,
              color: gold,
              boxShadow: `0 0 20px ${gold}40`,
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

      {/* Royal Emerald & Gold Ribbon */}
      <div
        className="w-full h-1.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${gold}, #10B981, ${gold}, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: EMERALD ROYAL ===================== */}
        <section
          className="relative p-6 sm:p-12 rounded-3xl border-2 text-center space-y-6 overflow-hidden shadow-2xl"
          style={{
            borderColor: `${gold}90`,
            backgroundColor: `${emeraldSurface}F5`,
            boxShadow: `0 16px 50px -10px rgba(0, 0, 0, 0.8), 0 0 35px ${gold}25`,
          }}
        >
          {/* Royal Corner Accents */}
          <TemplateCornerAccents color={gold} size={28} style="royal" />

          {/* Symmetrical Royal Crown Crest */}
          <div className="flex flex-col items-center justify-center space-y-2 select-none">
            <div
              className="w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{
                borderColor: gold,
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                color: gold,
                boxShadow: `0 0 25px ${gold}40`,
              }}
            >
              <Crown className="w-7 h-7" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-16" style={{ background: `linear-gradient(90deg, transparent, ${gold})` }} />
              <span className="text-xs" style={{ color: gold }}>✦ ✦ ✦</span>
              <div className="h-px w-16" style={{ background: `linear-gradient(90deg, ${gold}, transparent)` }} />
            </div>
          </div>

          {/* Traditional Basmala */}
          <p className="text-xs sm:text-sm tracking-widest opacity-90 font-serif" style={{ color: gold }}>
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-[#C8DEC9] leading-relaxed px-4">
              تتشرف {content.hostNames} بدعوتكم
            </p>
          )}

          {/* Royal Emerald Badge */}
          <div className="inline-block">
            <span
              className="text-xs font-bold px-6 py-1.5 rounded-full border shadow-xs"
              style={{
                borderColor: gold,
                backgroundColor: '#051A10',
                color: gold,
              }}
            >
              {eventTypeLabel}
            </span>
          </div>

          {/* Framed Photo with Gold Border and Emerald Backing */}
          {invitation.coverImageUrl && (
            <div
              className="max-w-[220px] mx-auto overflow-hidden rounded-2xl border-2 p-1.5 shadow-2xl transition-transform hover:scale-[1.02]"
              style={{
                borderColor: gold,
                backgroundColor: '#051A10',
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px ${gold}30`,
              }}
            >
              <img
                src={invitation.coverImageUrl}
                alt={invitation.title}
                className="w-full h-52 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Celebrants Typography in Rich Gold */}
          <div className="py-2 space-y-2">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{
                    color: gold,
                    textShadow: `0 0 25px ${gold}50`,
                  }}
                >
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-16" style={{ background: `linear-gradient(90deg, transparent, ${gold})` }} />
                  <span className="italic text-2xl font-serif" style={{ color: '#10B981' }}>&</span>
                  <div className="h-px w-16" style={{ background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                </div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{
                    color: gold,
                    textShadow: `0 0 25px ${gold}50`,
                  }}
                >
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight"
                style={{
                  color: gold,
                  textShadow: `0 0 25px ${gold}50`,
                }}
              >
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {content.eventTitle && content.eventTitle !== invitation.title && (
            <p className="text-xs sm:text-sm italic text-[#C8DEC9] max-w-md mx-auto">
              {content.eventTitle}
            </p>
          )}

          <TemplateSectionDivider config={EMERALD_ROYAL_CONFIG} accentColor={gold} />
        </section>

        {/* ===================== STORY / GREETING SECTION: IVORY CONTENT BLOCK ===================== */}
        {content.invitationText && (
          <section
            className="relative p-6 sm:p-10 rounded-2xl border-2 text-center space-y-4 shadow-xl"
            style={{
              borderColor: gold,
              backgroundColor: warmIvory,
              color: '#082F1E',
            }}
          >
            <TemplateCornerAccents color={gold} size={20} style="royal" />
            <div
              className="w-11 h-11 rounded-full border-2 mx-auto flex items-center justify-center"
              style={{
                borderColor: gold,
                backgroundColor: 'rgba(8, 47, 30, 0.1)',
                color: '#082F1E',
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#082F1E' }}>
              {content.eventTitle || 'يسعدنا ويشرفنا حضوركم الكريم'}
            </h3>
            <p className="text-xs sm:text-sm text-[#133A26] leading-loose whitespace-pre-wrap px-4 font-medium">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: `${gold}60`, color: '#082F1E' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: gold }} />
                <span className="font-bold">قواعد اللباس: </span>
                <span>{content.dressCode}</span>
              </div>
            )}
          </section>
        )}

        {/* ===================== COUNTDOWN SECTION: EMERALD ROYAL ===================== */}
        {settings.enableCountdown !== false && dateValue && !timeLeft.isPast && (
          <section
            className="p-6 sm:p-8 rounded-2xl border-2 text-center space-y-5 shadow-xl"
            style={{
              borderColor: `${gold}80`,
              backgroundColor: `${emeraldSurface}EB`,
            }}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest" style={{ color: gold }}>
              <Hourglass className="w-4 h-4" />
              <span>العد التنازلي لليوم الملكي</span>
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
                  className="p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center shadow-md"
                  style={{
                    backgroundColor: '#051A10',
                    borderColor: `${gold}60`,
                  }}
                >
                  <span className="text-xl sm:text-3xl font-mono font-bold" style={{ color: gold }}>
                    {String(unit.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#C8DEC9] mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== DATE & TIME SECTION: FRAMED CARDS ===================== */}
        {(dateValue || timeValue) && (
          <section
            className="relative p-6 sm:p-8 rounded-2xl border-2 text-center space-y-6 shadow-xl"
            style={{
              borderColor: `${gold}80`,
              backgroundColor: `${emeraldSurface}EB`,
            }}
          >
            <TemplateCornerAccents color={gold} size={20} style="royal" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                التوقيت الملكي
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                الموعد والزمان
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 shadow-md"
                  style={{
                    backgroundColor: '#051A10',
                    borderColor: `${gold}50`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center mb-1"
                    style={{ borderColor: gold, color: gold, backgroundColor: 'rgba(212, 175, 55, 0.15)' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#C8DEC9]">التاريخ الميلادي</span>
                  <p className="text-sm sm:text-base font-bold text-white">
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-xs font-serif" style={{ color: gold }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 shadow-md"
                  style={{
                    backgroundColor: '#051A10',
                    borderColor: `${gold}50`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center mb-1"
                    style={{ borderColor: gold, color: gold, backgroundColor: 'rgba(212, 175, 55, 0.15)' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#C8DEC9]">توقيت الاستقبال</span>
                  <p className="text-sm sm:text-base font-bold text-white">
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#869E89] font-mono">
                    {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== VENUE & MAP SECTION: GOLD OUTLINE / GOLD FILLED BUTTON ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="relative p-6 sm:p-8 rounded-2xl border-2 text-center space-y-5 shadow-xl"
            style={{
              borderColor: `${gold}80`,
              backgroundColor: `${emeraldSurface}EB`,
            }}
          >
            <TemplateCornerAccents color={gold} size={20} style="royal" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                موقع الحفل والضيافة
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                مكان الاستقبال الملكي
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-white">
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#C8DEC9] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: gold }} />
                  <span>
                    {content.venueCity ? `${content.venueCity} — ` : ''}
                    {content.venueAddress || invitation.venueAddress}
                  </span>
                </p>
              )}
            </div>

            {/* Gold Filled Button with Emerald Text and Gold Outline */}
            {(content.googleMapsUrl || invitation.googleMapsUrl) && (
              <div className="pt-2">
                <a
                  href={content.googleMapsUrl || invitation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackAction?.('map_click')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition duration-300 shadow-lg hover:brightness-110 cursor-pointer border-2"
                  style={{
                    backgroundColor: gold,
                    color: '#051A10',
                    borderColor: '#FFF2C6',
                    boxShadow: `0 4px 20px ${gold}50`,
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

        {/* ===================== GALLERY SECTION: ROYAL CARDS IN GOLD FRAMES ===================== */}
        {settings.enableGallery !== false && invitation.gallery && invitation.gallery.length > 0 && (
          <section
            className="p-6 sm:p-8 rounded-2xl border-2 text-center space-y-6 shadow-xl"
            style={{
              borderColor: `${gold}80`,
              backgroundColor: `${emeraldSurface}EB`,
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                ذكريات تذكارية
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                معرض الصور الملكي
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {invitation.gallery.map((img, i) => (
                <div
                  key={img.id || i}
                  className="overflow-hidden rounded-xl border-2 p-1 shadow-md transition-transform hover:scale-[1.03]"
                  style={{
                    borderColor: gold,
                    backgroundColor: '#051A10',
                  }}
                >
                  <img
                    src={img.media_url}
                    alt={img.caption || `صورة ${i + 1}`}
                    className="w-full h-36 sm:h-44 object-cover rounded-lg"
                    loading="lazy"
                  />
                  {img.caption && (
                    <p className="text-[10px] text-[#C8DEC9] pt-1.5 truncate px-1">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== RSVP SECTION: ROYAL FRAMED PANEL ===================== */}
        {settings.allowRsvp && (
          <section
            className="relative p-6 sm:p-10 rounded-2xl border-2 text-right space-y-6 shadow-2xl"
            style={{
              borderColor: gold,
              backgroundColor: `${emeraldSurface}FA`,
              boxShadow: `0 14px 48px rgba(0, 0, 0, 0.9), 0 0 30px ${gold}25`,
            }}
          >
            <TemplateCornerAccents color={gold} size={22} style="royal" />
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                تأكيد الحضور الملكي
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                يسعدنا ويشرفنا حضوركم
              </h3>
              <p className="text-xs text-[#C8DEC9]">
                يرجى موافاتنا بالرد لتنظيم استقبالكم بما يليق بمقامكم الرفيع
              </p>
            </div>

            {submitted ? (
              <div
                className="p-6 rounded-xl border-2 text-center space-y-2"
                style={{
                  backgroundColor: 'rgba(212, 175, 55, 0.15)',
                  borderColor: gold,
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: gold }} />
                <h4 className="text-sm font-bold" style={{ color: gold }}>
                  تم تسجيل تشريفكم بنجاح!
                </h4>
                <p className="text-xs text-[#FAF8F5]">
                  شكراً جزيلاً، يسعدنا حضوركم ومشاركتنا هذا اليوم الأغر.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border-2 ${
                      status === 'attending' ? 'shadow-lg' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? gold : '#051A10',
                      color: status === 'attending' ? '#051A10' : '#C8DEC9',
                      borderColor: status === 'attending' ? '#FFF2C6' : `${gold}40`,
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border-2 ${
                      status === 'declined' ? 'shadow-lg' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? '#0B2618' : '#051A10',
                      color: status === 'declined' ? '#FFFFFF' : '#869E89',
                      borderColor: status === 'declined' ? '#A04354' : `${gold}40`,
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border-2 outline-none bg-[#051A10] border-[#D4AF37]/50 text-white focus:border-[#D4AF37]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#869E89] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#C8DEC9] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border-2 font-mono outline-none bg-[#051A10] border-[#D4AF37]/50 text-white focus:border-[#D4AF37]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#869E89] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border-2 bg-[#051A10] border-[#D4AF37]/50">
                      <span className="text-xs text-[#C8DEC9] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#D4AF37]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-lg border bg-[#0B2618] border-[#D4AF37]/60 text-xs font-bold hover:bg-[#133A26] transition cursor-pointer text-white"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-[#D4AF37]">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-lg border bg-[#0B2618] border-[#D4AF37]/60 text-xs font-bold hover:bg-[#133A26] transition cursor-pointer text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#C8DEC9] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك بالرفاه والبنين ودامت دياركم عامرة بالأفراح والمسرات..."
                    className="w-full text-xs p-3 rounded-lg border-2 outline-none bg-[#051A10] border-[#D4AF37]/50 text-white focus:border-[#D4AF37]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#FF6B6B] text-center">{errorMsg}</p>}

                {/* Gold Filled Button with Emerald Text and Gold Outline */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg hover:brightness-110 cursor-pointer flex items-center justify-center gap-2 border-2"
                  style={{
                    backgroundColor: gold,
                    color: '#051A10',
                    borderColor: '#FFF2C6',
                    boxShadow: `0 4px 20px ${gold}50`,
                  }}
                >
                  <Send className="w-4 h-4" />
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
