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
  Volume2,
  VolumeX,
  Hourglass,
  Sun,
} from 'lucide-react';
import { GOLDEN_SUNSET_CONFIG } from './configs';

export const GoldenSunsetTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Golden Sunset Palette: Warm, Romantic, Emotional, Cinematic
  const warmGold = theme?.accent_color || GOLDEN_SUNSET_CONFIG.colors.accent; // #E59F3D
  const sunsetAmber = GOLDEN_SUNSET_CONFIG.colors.primary; // #B85D19 or #D97724
  const terracotta = '#C2572B';
  const softPeach = '#FBE9DC';
  const deepWarmBrown = '#2D150B';
  const cream = theme?.background_color || '#FDF8F3';

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
    wedding: 'دعوة زفاف ذهبية في ألق الغروب',
    engagement: 'حفل خطوبة في دفء الغروب البهيج',
    aqiqah: 'حفل عقيقة مباركة وسعيدة',
    graduation: 'حفل تخرج باهر ومشرق',
    birthday: 'احتفال عيد ميلاد دافئ',
    anniversary: 'أمسية الاحتفال بذكرى سعيدة',
    family_event: 'لقاء عائلي حميمي ودافئ',
    private_event: 'أمسية خاصة استثنائية',
  }[eventType as string] || 'دعوة كريمة وسعيدة';

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
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#2D150B] select-none"
      style={{
        backgroundColor: cream,
        backgroundImage: 'linear-gradient(180deg, #FDF8F3 0%, #FAEDE2 50%, #F5E0D0 100%)',
      }}
    >
      {/* Background Soft Sun Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none rounded-full blur-3xl opacity-25 bg-[#E59F3D]" />

      {/* Floating Music Controller */}
      {invitation.music && settings.enableMusic !== false && (
        <div className="fixed top-4 left-4 z-50">
          <audio ref={audioRef} src={invitation.music.audio_url} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            aria-label="تشغيل الموسيقى"
            className="w-11 h-11 rounded-full border-2 flex items-center justify-center shadow-lg backdrop-blur-md transition hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: 'rgba(253, 248, 243, 0.9)',
              borderColor: warmGold,
              color: sunsetAmber,
              boxShadow: '0 4px 20px rgba(229, 159, 61, 0.35)',
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

      {/* Sunset Amber & Gold Gradient Ribbon */}
      <div
        className="w-full h-1.5"
        style={{
          background: `linear-gradient(90deg, ${terracotta} 0%, ${sunsetAmber} 30%, ${warmGold} 70%, ${terracotta} 100%)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-9 relative z-10">
        {/* ===================== HERO SECTION: CINEMATIC WARM SUNSET ===================== */}
        <section
          className="relative rounded-3xl overflow-hidden border shadow-xl text-center"
          style={{
            borderColor: '#F0DBCB',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 16px 45px rgba(184, 93, 25, 0.12), 0 0 25px rgba(229, 159, 61, 0.2)',
          }}
        >
          {/* Top Sunset Glow Banner */}
          <div
            className="p-6 sm:p-10 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #B85D19 0%, #D97724 60%, #E59F3D 100%)',
              color: '#FFFFFF',
            }}
          >
            {/* Sunburst Icon & Curved Lines */}
            <div className="flex items-center justify-center gap-3 select-none mb-3 opacity-90">
              <div className="h-px w-14 bg-white/40" />
              <div className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center bg-white/10 shadow-xs">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <div className="h-px w-14 bg-white/40" />
            </div>

            {/* Traditional Basmala */}
            <p className="text-xs sm:text-sm tracking-widest font-serif opacity-95 text-[#FFF5EA] mb-2">
              بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
            </p>

            {/* Host Names */}
            {content.hostNames && (
              <p className="text-xs sm:text-sm text-[#FDEBDD] leading-relaxed max-w-md mx-auto">
                تتشرف {content.hostNames} بدعوتكم
              </p>
            )}

            {/* Event Tag */}
            <div className="inline-block mt-3">
              <span
                className="text-xs font-bold px-5 py-1.5 rounded-full border shadow-2xs tracking-wide"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                }}
              >
                {eventTypeLabel}
              </span>
            </div>
          </div>

          {/* Large Cinematic Cover Photo with Warm Overlay */}
          {invitation.coverImageUrl && (
            <div className="p-4 sm:p-6 bg-[#FDF8F3]">
              <div
                className="relative overflow-hidden rounded-2xl border-2 p-1.5 shadow-xl max-w-md mx-auto"
                style={{
                  borderColor: warmGold,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 12px 35px rgba(184, 93, 25, 0.2)',
                }}
              >
                <img
                  src={invitation.coverImageUrl}
                  alt={invitation.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-xl"
                />
                {/* Subtle Sunset Warm Gradient Overlay on Image */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(180deg, transparent 65%, rgba(45, 21, 11, 0.5) 100%)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Golden Typography for Names */}
          <div className="p-6 sm:p-8 space-y-4 bg-white">
            <div className="space-y-2">
              {content.firstCelebrantName && content.secondCelebrantName ? (
                <div>
                  <h1
                    className="text-3xl sm:text-5xl font-bold tracking-tight"
                    style={{
                      color: sunsetAmber,
                      textShadow: '0 2px 10px rgba(229, 159, 61, 0.25)',
                    }}
                  >
                    {content.firstCelebrantName}
                  </h1>
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${warmGold})` }} />
                    <span className="italic text-2xl font-serif" style={{ color: warmGold }}>&</span>
                    <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${warmGold}, transparent)` }} />
                  </div>
                  <h1
                    className="text-3xl sm:text-5xl font-bold tracking-tight"
                    style={{
                      color: sunsetAmber,
                      textShadow: '0 2px 10px rgba(229, 159, 61, 0.25)',
                    }}
                  >
                    {content.secondCelebrantName}
                  </h1>
                </div>
              ) : (
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{
                    color: sunsetAmber,
                    textShadow: '0 2px 10px rgba(229, 159, 61, 0.25)',
                  }}
                >
                  {content.celebrantNames || invitation.title}
                </h1>
              )}
            </div>

            {content.eventTitle && content.eventTitle !== invitation.title && (
              <p className="text-xs sm:text-sm italic text-[#7D6155] max-w-md mx-auto">
                {content.eventTitle}
              </p>
            )}

            {/* Sunburst Bottom Flourish */}
            <div className="flex items-center justify-center gap-3 pt-2 opacity-80">
              <div className="h-px w-16" style={{ background: `linear-gradient(90deg, transparent, ${warmGold})` }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sunsetAmber }} />
              <div className="h-px w-16" style={{ background: `linear-gradient(90deg, ${warmGold}, transparent)` }} />
            </div>
          </div>
        </section>

        {/* ===================== STORY / GREETING: WARM CREAM SECTION ===================== */}
        {content.invitationText && (
          <section
            className="p-6 sm:p-10 rounded-3xl border text-center space-y-4 shadow-sm"
            style={{
              borderColor: '#F0DBCB',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div
              className="w-11 h-11 rounded-full border mx-auto flex items-center justify-center shadow-xs"
              style={{
                borderColor: warmGold,
                backgroundColor: softPeach,
                color: sunsetAmber,
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: sunsetAmber }}>
              {content.eventTitle || 'يسعدنا تشريفكم لهذه المناسبة الكريمة'}
            </h3>
            <p className="text-xs sm:text-sm text-[#4E2D1D] leading-loose whitespace-pre-wrap px-4 font-medium">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: '#F0DBCB', color: sunsetAmber }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: warmGold }} />
                <span className="font-bold">قواعد اللباس: </span>
                <span className="text-[#4E2D1D]">{content.dressCode}</span>
              </div>
            )}
          </section>
        )}

        {/* ===================== COUNTDOWN SECTION: SUNSET GLOW ===================== */}
        {settings.enableCountdown !== false && dateValue && !timeLeft.isPast && (
          <section
            className="p-6 sm:p-8 rounded-3xl border text-center space-y-5 shadow-sm"
            style={{
              borderColor: '#F0DBCB',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-widest" style={{ color: sunsetAmber }}>
              <Hourglass className="w-4 h-4" style={{ color: warmGold }} />
              <span>العد التنازلي للموعد الذهبي</span>
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
                  className="p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center shadow-xs"
                  style={{
                    backgroundColor: softPeach,
                    borderColor: '#F0DBCB',
                  }}
                >
                  <span className="text-xl sm:text-3xl font-mono font-bold" style={{ color: sunsetAmber }}>
                    {String(unit.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#7D6155] mt-1">{unit.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== DATE & TIME: WARM COLOR BLOCKS ===================== */}
        {(dateValue || timeValue) && (
          <section
            className="p-6 sm:p-8 rounded-3xl border text-center space-y-6 shadow-sm"
            style={{
              borderColor: '#F0DBCB',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: sunsetAmber }}>
                الموعد والزمان
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: sunsetAmber }}>
                توقيت اللقاء السعيد
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  style={{
                    backgroundColor: softPeach,
                    borderColor: '#F0DBCB',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: warmGold, color: sunsetAmber, backgroundColor: '#FFFFFF' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#7D6155]">التاريخ الميلادي</span>
                  <p className="text-sm sm:text-base font-bold text-[#2D150B]">
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-xs font-serif" style={{ color: sunsetAmber }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  style={{
                    backgroundColor: softPeach,
                    borderColor: '#F0DBCB',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: warmGold, color: sunsetAmber, backgroundColor: '#FFFFFF' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#7D6155]">توقيت الحفل</span>
                  <p className="text-sm sm:text-base font-bold text-[#2D150B]">
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#7D6155] font-mono">
                    {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== VENUE & MAP: WARM GOLD BUTTON ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="p-6 sm:p-8 rounded-3xl border text-center space-y-5 shadow-sm"
            style={{
              borderColor: '#F0DBCB',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: sunsetAmber }}>
                المكان والاستقبال
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: sunsetAmber }}>
                قاعة وموقع الحفل
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-[#2D150B]">
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#7D6155] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: sunsetAmber }} />
                  <span>
                    {content.venueCity ? `${content.venueCity} — ` : ''}
                    {content.venueAddress || invitation.venueAddress}
                  </span>
                </p>
              )}
            </div>

            {/* Warm Gold Filled Button with Deep Warm Brown Text */}
            {(content.googleMapsUrl || invitation.googleMapsUrl) && (
              <div className="pt-2">
                <a
                  href={content.googleMapsUrl || invitation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackAction?.('map_click')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold transition duration-300 shadow-md hover:brightness-105 cursor-pointer border"
                  style={{
                    backgroundColor: warmGold,
                    color: deepWarmBrown,
                    borderColor: '#D4AF37',
                    boxShadow: '0 4px 18px rgba(229, 159, 61, 0.35)',
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

        {/* ===================== GALLERY SECTION: WARM OVERLAYS & ROUNDED CORNERS ===================== */}
        {settings.enableGallery !== false && invitation.gallery && invitation.gallery.length > 0 && (
          <section
            className="p-6 sm:p-8 rounded-3xl border text-center space-y-6 shadow-sm"
            style={{
              borderColor: '#F0DBCB',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: sunsetAmber }}>
                الذكريات المصورة
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: sunsetAmber }}>
                معرض صور الحفل
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {invitation.gallery.map((img, i) => (
                <div
                  key={img.id || i}
                  className="overflow-hidden rounded-2xl border p-1 shadow-xs transition-transform hover:scale-[1.03]"
                  style={{
                    borderColor: '#F0DBCB',
                    backgroundColor: softPeach,
                  }}
                >
                  <img
                    src={img.media_url}
                    alt={img.caption || `صورة ${i + 1}`}
                    className="w-full h-36 sm:h-44 object-cover rounded-xl filter contrast-[103%]"
                    loading="lazy"
                  />
                  {img.caption && (
                    <p className="text-[10px] text-[#7D6155] pt-1.5 truncate px-1">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== RSVP SECTION: WARM SUNSET PANEL ===================== */}
        {settings.allowRsvp && (
          <section
            className="p-6 sm:p-10 rounded-3xl border-2 text-right space-y-6 shadow-md"
            style={{
              borderColor: warmGold,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 12px 35px rgba(184, 93, 25, 0.1)',
            }}
          >
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: sunsetAmber }}>
                تأكيد الحضور
              </span>
              <h3 className="text-lg font-bold" style={{ color: sunsetAmber }}>
                يسعدنا تسجيل حضوركم الكريم
              </h3>
              <p className="text-xs text-[#7D6155]">
                يرجى تأكيد الحضور لمشاركتنا فرحة هذا اليوم المشرق
              </p>
            </div>

            {submitted ? (
              <div
                className="p-6 rounded-2xl border text-center space-y-2"
                style={{
                  backgroundColor: softPeach,
                  borderColor: warmGold,
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: sunsetAmber }} />
                <h4 className="text-sm font-bold" style={{ color: sunsetAmber }}>
                  تم تسجيل ردكم الكريم بنجاح!
                </h4>
                <p className="text-xs text-[#4E2D1D]">
                  شكراً جزيلاً لكم، نتطلع بشوق لاستقبالكم في هذا اليوم المميز.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`p-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'attending' ? 'shadow-md' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? warmGold : '#FFFFFF',
                      color: status === 'attending' ? deepWarmBrown : '#7D6155',
                      borderColor: status === 'attending' ? sunsetAmber : '#F0DBCB',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'declined' ? 'shadow-md' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? deepWarmBrown : '#FFFFFF',
                      color: status === 'declined' ? '#FFFFFF' : '#7D6155',
                      borderColor: status === 'declined' ? deepWarmBrown : '#F0DBCB',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D150B] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-4 py-2.5 rounded-full border outline-none bg-[#FDF8F3] border-[#F0DBCB] text-[#2D150B] focus:border-[#E59F3D]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#A89286] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D150B] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#7D6155] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-4 py-2.5 rounded-full border font-mono outline-none bg-[#FDF8F3] border-[#F0DBCB] text-[#2D150B] focus:border-[#E59F3D]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#A89286] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#2D150B] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-full border bg-[#FDF8F3] border-[#F0DBCB] px-4">
                      <span className="text-xs text-[#7D6155] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#B85D19]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-full border bg-white border-[#F0DBCB] text-xs font-bold hover:bg-[#FBE9DC] transition cursor-pointer text-[#2D150B]"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-[#B85D19]">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-full border bg-white border-[#F0DBCB] text-xs font-bold hover:bg-[#FBE9DC] transition cursor-pointer text-[#2D150B]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2D150B] mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#7D6155] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك وبالرفاه والبنين ودامت دياركم عامرة بالأفراح والمسرات..."
                    className="w-full text-xs p-3 rounded-2xl border outline-none bg-[#FDF8F3] border-[#F0DBCB] text-[#2D150B] focus:border-[#E59F3D]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#FF6B6B] text-center">{errorMsg}</p>}

                {/* Warm Gold Filled Button with Deep Warm Brown Text */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold transition shadow-md hover:brightness-105 cursor-pointer flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: warmGold,
                    color: deepWarmBrown,
                    borderColor: '#D4AF37',
                    boxShadow: '0 4px 18px rgba(229, 159, 61, 0.35)',
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
