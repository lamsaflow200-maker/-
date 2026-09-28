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
  Camera,
} from 'lucide-react';
import { ROSE_ROMANCE_CONFIG } from './configs';

export const RoseRomanceTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Fashionable Romantic Editorial Palette
  const deepRose = theme?.primary_color || ROSE_ROMANCE_CONFIG.colors.primary; // #A04354 or #8B263E
  const gold = theme?.accent_color || ROSE_ROMANCE_CONFIG.colors.accent; // #D4AF37
  const warmIvory = theme?.background_color || '#FDFBF7';
  const blush = '#F8EFEF';
  const darkRoseText = '#2C1318';
  const dustyRose = '#C47A88';

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
    wedding: 'دعوة زفاف رومانسية فاخرة',
    engagement: 'حفل خطوبة أنيق وراقٍ',
    aqiqah: 'حفل عقيقة مبارك',
    graduation: 'حفل تخرج مميز',
    birthday: 'احتفال عيد ميلاد راقٍ',
    anniversary: 'ذكرى سنوية سعيدة',
    family_event: 'لقاء عائلي حميمي',
    private_event: 'أمسية خاصة واستثنائية',
  }[eventType as string] || 'دعوة خاصة';

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
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#2C1318] select-none"
      style={{
        backgroundColor: warmIvory,
      }}
    >
      {/* Floating Music Controller */}
      {invitation.music && settings.enableMusic !== false && (
        <div className="fixed top-4 left-4 z-50">
          <audio ref={audioRef} src={invitation.music.audio_url} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            aria-label="تشغيل الموسيقى"
            className="w-11 h-11 rounded-full border flex items-center justify-center shadow-lg backdrop-blur-md transition hover:scale-105 cursor-pointer"
            style={{
              backgroundColor: 'rgba(253, 251, 247, 0.9)',
              borderColor: gold,
              color: deepRose,
              boxShadow: `0 4px 15px rgba(160, 67, 84, 0.2)`,
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

      {/* Editorial Top Accent Stripe */}
      <div
        className="w-full h-1.5"
        style={{
          background: `linear-gradient(90deg, ${deepRose} 0%, ${gold} 50%, ${dustyRose} 100%)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-10 relative z-10">
        {/* ===================== HERO SECTION: EDITORIAL SPLIT ===================== */}
        <section
          className="relative rounded-3xl overflow-hidden border shadow-sm"
          style={{
            borderColor: '#ECDCD8',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Rose Color Block Header */}
          <div
            className="p-6 sm:p-8 text-center text-white relative overflow-hidden"
            style={{
              backgroundColor: deepRose,
            }}
          >
            {/* Fine gold lines ornament */}
            <div className="flex items-center justify-center gap-3 select-none mb-3 opacity-90">
              <div className="h-px w-12" style={{ backgroundColor: gold }} />
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#FAF0F2]">
                EDITORIAL INVITATION
              </span>
              <div className="h-px w-12" style={{ backgroundColor: gold }} />
            </div>

            <p className="text-xs sm:text-sm tracking-widest font-serif mb-2" style={{ color: gold }}>
              بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
            </p>

            {content.hostNames && (
              <p className="text-xs sm:text-sm text-[#FAF0F2] leading-relaxed max-w-md mx-auto">
                تتشرف {content.hostNames} بدعوتكم
              </p>
            )}

            <div className="inline-block mt-3">
              <span
                className="text-xs font-bold px-4 py-1 rounded-full border shadow-2xs"
                style={{
                  borderColor: `${gold}90`,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                }}
              >
                {eventTypeLabel}
              </span>
            </div>
          </div>

          {/* Split Content: Asymmetric Cover Photo + Large Editorial Names */}
          <div className="p-6 sm:p-10 space-y-6">
            {invitation.coverImageUrl && (
              <div className="relative max-w-[260px] mx-auto my-2">
                {/* Offset Decorative Rose Block Behind Image */}
                <div
                  className="absolute -inset-2 rounded-2xl opacity-40 blur-xs"
                  style={{ backgroundColor: blush }}
                />
                <div
                  className="relative overflow-hidden rounded-2xl border-2 p-1.5 shadow-xl bg-white rotate-[-2deg] transition-transform hover:rotate-0 duration-300"
                  style={{
                    borderColor: gold,
                    boxShadow: '0 14px 34px rgba(160, 67, 84, 0.18)',
                  }}
                >
                  <img
                    src={invitation.coverImageUrl}
                    alt={invitation.title}
                    className="w-full h-60 object-cover rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* High-Contrast Editorial Typography for Names */}
            <div className="text-center py-2 space-y-2">
              {content.firstCelebrantName && content.secondCelebrantName ? (
                <div>
                  <h1
                    className="text-3xl sm:text-5xl font-bold tracking-tight"
                    style={{ color: deepRose }}
                  >
                    {content.firstCelebrantName}
                  </h1>
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${gold})` }} />
                    <span className="italic text-2xl font-serif" style={{ color: gold }}>&</span>
                    <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                  </div>
                  <h1
                    className="text-3xl sm:text-5xl font-bold tracking-tight"
                    style={{ color: deepRose }}
                  >
                    {content.secondCelebrantName}
                  </h1>
                </div>
              ) : (
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{ color: deepRose }}
                >
                  {content.celebrantNames || invitation.title}
                </h1>
              )}

              {content.eventTitle && content.eventTitle !== invitation.title && (
                <p className="text-xs sm:text-sm italic text-[#7B676C] max-w-md mx-auto pt-2">
                  {content.eventTitle}
                </p>
              )}
            </div>

            {/* Fine Gold Curved Divider */}
            <div className="flex items-center justify-center gap-3 my-4 select-none opacity-80">
              <div className="h-px w-16" style={{ backgroundColor: gold }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: deepRose }} />
              <div className="h-px w-16" style={{ backgroundColor: gold }} />
            </div>
          </div>
        </section>

        {/* ===================== EDITORIAL COMPOSITION 1: IMAGE/ICON → TEXT ===================== */}
        {content.invitationText && (
          <section
            className="rounded-3xl border overflow-hidden shadow-xs flex flex-col sm:flex-row items-stretch"
            style={{
              borderColor: '#ECDCD8',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Color Block / Visual Anchor */}
            <div
              className="sm:w-1/3 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3"
              style={{
                backgroundColor: blush,
                borderLeft: '1px solid #ECDCD8',
              }}
            >
              <div
                className="w-12 h-12 rounded-full border flex items-center justify-center shadow-xs"
                style={{
                  borderColor: gold,
                  backgroundColor: '#FFFFFF',
                  color: deepRose,
                }}
              >
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: deepRose }}>
                كلمة الترحيب
              </span>
            </div>

            {/* Text Block */}
            <div className="sm:w-2/3 p-6 sm:p-8 flex flex-col justify-center text-right space-y-3">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: deepRose }}>
                {content.eventTitle || 'يسعدنا ويشرفنا حضوركم'}
              </h3>
              <p className="text-xs sm:text-sm text-[#4E3D42] leading-loose whitespace-pre-wrap">
                {content.invitationText}
              </p>
              {content.dressCode && (
                <div className="pt-2 text-xs flex items-center gap-2" style={{ color: deepRose }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: gold }} />
                  <span className="font-bold">قواعد اللباس: </span>
                  <span className="text-[#4E3D42]">{content.dressCode}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== EDITORIAL COMPOSITION 2: FULL-WIDTH DETAILS BLOCK ===================== */}
        {(dateValue || timeValue) && (
          <section
            className="rounded-3xl p-6 sm:p-10 border text-center space-y-6 shadow-xs"
            style={{
              borderColor: `${gold}60`,
              backgroundColor: blush,
            }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: deepRose }}>
                DETAILS & SCHEDULE
              </span>
              <h3 className="text-lg font-bold" style={{ color: deepRose }}>
                موعد وزمان الحفل
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-5 rounded-2xl border bg-white flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  style={{ borderColor: '#ECDCD8' }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center"
                    style={{ borderColor: gold, color: deepRose, backgroundColor: blush }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#7B676C]">التاريخ الميلادي</span>
                  <p className="text-sm sm:text-base font-bold" style={{ color: darkRoseText }}>
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-xs font-serif" style={{ color: deepRose }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-5 rounded-2xl border bg-white flex flex-col items-center justify-center space-y-2 shadow-2xs"
                  style={{ borderColor: '#ECDCD8' }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center"
                    style={{ borderColor: gold, color: deepRose, backgroundColor: blush }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#7B676C]">توقيت اللقاء</span>
                  <p className="text-sm sm:text-base font-bold" style={{ color: darkRoseText }}>
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#7B676C] font-mono">
                    {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== COUNTDOWN RIBBON ===================== */}
        {settings.enableCountdown !== false && dateValue && !timeLeft.isPast && (
          <section
            className="p-6 rounded-2xl border text-center space-y-4 shadow-2xs bg-white"
            style={{ borderColor: '#ECDCD8' }}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider" style={{ color: deepRose }}>
              <Hourglass className="w-4 h-4" style={{ color: gold }} />
              <span>العد التنازلي للمناسبة</span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm mx-auto">
              {[
                { label: 'أيام', val: timeLeft.days },
                { label: 'ساعات', val: timeLeft.hours },
                { label: 'دقائق', val: timeLeft.minutes },
                { label: 'ثوانٍ', val: timeLeft.seconds },
              ].map((unit, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: blush,
                    borderColor: '#ECDCD8',
                  }}
                >
                  <span className="text-lg sm:text-2xl font-mono font-bold" style={{ color: deepRose }}>
                    {String(unit.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-[#7B676C] mt-0.5">{unit.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== EDITORIAL COMPOSITION 3: TEXT → NAVIGATION BLOCK ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="rounded-3xl border p-6 sm:p-10 text-center space-y-6 shadow-xs bg-white"
            style={{ borderColor: '#ECDCD8' }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: deepRose }}>
                THE LOCATION
              </span>
              <h3 className="text-lg font-bold" style={{ color: deepRose }}>
                مكان الاستقبال والضيافة
              </h3>
            </div>

            <div className="space-y-2">
              <h4 className="text-base sm:text-lg font-bold" style={{ color: darkRoseText }}>
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#7B676C] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: deepRose }} />
                  <span>
                    {content.venueCity ? `${content.venueCity} — ` : ''}
                    {content.venueAddress || invitation.venueAddress}
                  </span>
                </p>
              )}
            </div>

            {/* Gold Filled Button with Dark Rose Outline */}
            {(content.googleMapsUrl || invitation.googleMapsUrl) && (
              <div className="pt-2">
                <a
                  href={content.googleMapsUrl || invitation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackAction?.('map_click')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold transition duration-300 shadow-md hover:brightness-105 cursor-pointer border"
                  style={{
                    backgroundColor: gold,
                    color: '#2C1318',
                    borderColor: deepRose,
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  <span>عرض خريطة الموقع عبر Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            )}
          </section>
        )}

        {/* ===================== EDITORIAL GALLERY: ASYMMETRIC LAYOUT ===================== */}
        {settings.enableGallery !== false && invitation.gallery && invitation.gallery.length > 0 && (
          <section
            className="rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xs bg-white text-center"
            style={{ borderColor: '#ECDCD8' }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: deepRose }}>
                MOMENTS & MEMORIES
              </span>
              <h3 className="text-lg font-bold" style={{ color: deepRose }}>
                معرض الصور التذكارية
              </h3>
            </div>

            {/* Asymmetric Gallery: One large feature portrait photo + stacked smaller supporting photos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
              {/* Feature Large Photo */}
              <div
                className="sm:col-span-2 overflow-hidden rounded-2xl border p-1 shadow-md"
                style={{ borderColor: gold, backgroundColor: blush }}
              >
                <img
                  src={invitation.gallery[0].media_url}
                  alt={invitation.gallery[0].caption || 'صورة رئيسية'}
                  className="w-full h-64 sm:h-80 object-cover rounded-xl"
                  loading="lazy"
                />
                {invitation.gallery[0].caption && (
                  <p className="text-xs text-[#7B676C] pt-2 text-center">{invitation.gallery[0].caption}</p>
                )}
              </div>

              {/* Supporting Photos Stack */}
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                {invitation.gallery.slice(1, 3).map((img, i) => (
                  <div
                    key={img.id || i}
                    className="overflow-hidden rounded-2xl border p-1 shadow-xs"
                    style={{ borderColor: '#ECDCD8', backgroundColor: '#FFFFFF' }}
                  >
                    <img
                      src={img.media_url}
                      alt={img.caption || `صورة ${i + 2}`}
                      className="w-full h-32 sm:h-38 object-cover rounded-xl"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===================== RSVP EDITORIAL PANEL ===================== */}
        {settings.allowRsvp && (
          <section
            className="rounded-3xl border-2 p-6 sm:p-10 text-right space-y-6 shadow-md bg-white"
            style={{
              borderColor: gold,
              boxShadow: '0 12px 36px rgba(160, 67, 84, 0.08)',
            }}
          >
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: deepRose }}>
                R. S. V. P.
              </span>
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: deepRose }}>
                تأكيد حضور المناسبة
              </h3>
              <p className="text-xs text-[#7B676C]">
                يسعدنا تسجيل حضوركم الكريم لتجهيز ضيافتكم بأرقى المعايير
              </p>
            </div>

            {submitted ? (
              <div
                className="p-6 rounded-2xl border text-center space-y-2"
                style={{
                  backgroundColor: blush,
                  borderColor: deepRose,
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: deepRose }} />
                <h4 className="text-sm font-bold" style={{ color: deepRose }}>
                  تم تسجيل ردكم الكريم بنجاح!
                </h4>
                <p className="text-xs text-[#4E3D42]">
                  شكراً جزيلاً لكم، في انتظار تشريفكم بكل مودة وفرحة.
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
                      backgroundColor: status === 'attending' ? deepRose : '#FFFFFF',
                      color: status === 'attending' ? '#FFFFFF' : '#7B676C',
                      borderColor: status === 'attending' ? gold : '#ECDCD8',
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
                      backgroundColor: status === 'declined' ? '#2C1318' : '#FFFFFF',
                      color: status === 'declined' ? '#FFFFFF' : '#7B676C',
                      borderColor: status === 'declined' ? '#2C1318' : '#ECDCD8',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1318] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ليلى الشرايبي"
                      className="w-full text-xs px-4 py-2.5 rounded-full border outline-none bg-[#FAF6F2] border-[#ECDCD8] text-[#2C1318] focus:border-[#A04354]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#A8989C] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C1318] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#7B676C] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-4 py-2.5 rounded-full border font-mono outline-none bg-[#FAF6F2] border-[#ECDCD8] text-[#2C1318] focus:border-[#A04354]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#A8989C] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#2C1318] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-full border bg-[#FAF6F2] border-[#ECDCD8] px-4">
                      <span className="text-xs text-[#7B676C] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#A04354]" />
                        <span>مجموع الحاضرين:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-full border bg-white border-[#ECDCD8] text-xs font-bold hover:bg-[#FAF0F2] transition cursor-pointer text-[#2C1318]"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-[#A04354]">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-full border bg-white border-[#ECDCD8] text-xs font-bold hover:bg-[#FAF0F2] transition cursor-pointer text-[#2C1318]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2C1318] mb-1">
                    تهنئة أو كلمة للعروسين <span className="text-[10px] text-[#7B676C] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="بارك الله لكما وبارك عليكما وجمع بينكما في خير..."
                    className="w-full text-xs p-3 rounded-2xl border outline-none bg-[#FAF6F2] border-[#ECDCD8] text-[#2C1318] focus:border-[#A04354]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#FF6B6B] text-center">{errorMsg}</p>}

                {/* Gold Filled Button with Dark Rose Outline */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold transition shadow-md hover:brightness-105 cursor-pointer flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: gold,
                    color: '#2C1318',
                    borderColor: deepRose,
                    boxShadow: '0 4px 18px rgba(212, 175, 55, 0.35)',
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
