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
  Users,
  User,
  Phone,
  Navigation,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MINIMAL_WHITE_CONFIG } from './configs';

export const MinimalWhiteTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Minimal White Palette: Luxury through Simplicity
  const charcoal = '#171717';
  const warmGray = '#737373';
  const lightGray = '#E5E5E5';
  const softIvory = theme?.background_color || '#FAFAF8';
  const pureWhite = '#FFFFFF';
  const champagne = theme?.accent_color || '#A38F78';

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
      setErrorMsg('يرجى إدخال الاسم الكريم للمدعو');
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
    wedding: 'دعوة زفاف',
    engagement: 'دعوة خطوبة',
    aqiqah: 'دعوة عقيقة',
    graduation: 'حفل تخرج',
    birthday: 'ذكرى ميلاد',
    anniversary: 'ذكرى سنوية',
    family_event: 'لقاء عائلي',
    private_event: 'مناسبة خاصة',
  }[eventType as string] || 'دعوة خاصة';

  const dateValue = content.dateIso || invitation.eventDate;
  const timeValue = content.timeText || invitation.eventTime;

  let formattedArabicDate = dateValue;
  let parsedDay = '';
  let parsedMonth = '';
  let parsedYear = '';

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
        parsedDay = String(parsedDate.getDate());
        parsedMonth = parsedDate.toLocaleDateString('ar-MA', { month: 'long' });
        parsedYear = String(parsedDate.getFullYear());
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
      className="min-h-screen w-full relative transition-colors duration-300 font-sans antialiased text-[#171717] select-none"
      style={{
        backgroundColor: softIvory,
      }}
    >
      {/* Floating Minimal Music Button */}
      {invitation.music && settings.enableMusic !== false && (
        <div className="fixed top-5 left-5 z-50">
          <audio ref={audioRef} src={invitation.music.audio_url} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            aria-label="تشغيل الموسيقى"
            className="w-9 h-9 rounded-full border border-neutral-300 bg-white text-neutral-800 flex items-center justify-center shadow-xs transition hover:bg-neutral-100 cursor-pointer"
          >
            {isPlayingMusic ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-60" />
            )}
          </button>
        </div>
      )}

      {/* Main Container with Generous Whitespace */}
      <div className="max-w-xl mx-auto px-6 py-12 sm:py-20 space-y-16 relative z-10">
        {/* ===================== HERO SECTION: PURE MINIMALISM ===================== */}
        <section className="text-center space-y-8 pt-4 pb-8">
          {/* Subtle Tag */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-mono block">
              {eventTypeLabel}
            </span>
            <div className="w-8 h-px bg-neutral-300 mx-auto" />
          </div>

          {/* Traditional Bismillah in Clean Naskh/Serif */}
          <p className="text-xs sm:text-sm tracking-widest text-neutral-600 font-serif opacity-90">
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names Announcement */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
              تتشرف {content.hostNames} بدعوتكم لحضور
            </p>
          )}

          {/* Celebrant Names: Hero Typographic Centerpiece */}
          <div className="py-4 space-y-4">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-neutral-900">
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-1">
                  <div className="w-6 h-px bg-neutral-300" />
                  <span className="italic font-serif text-lg text-neutral-400">&</span>
                  <div className="w-6 h-px bg-neutral-300" />
                </div>
                <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-neutral-900">
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-neutral-900">
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {/* Clean Editorial Date Typography Block */}
          {parsedDay && parsedMonth && parsedYear ? (
            <div className="flex items-center justify-center gap-4 py-2 font-mono text-xs tracking-widest text-neutral-600">
              <span>{parsedDay}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-400" />
              <span>{parsedMonth}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-400" />
              <span>{parsedYear}</span>
            </div>
          ) : dateValue ? (
            <p className="text-xs font-mono text-neutral-600 tracking-wider">
              {formattedArabicDate}
            </p>
          ) : null}

          {/* Minimal Cover Photo */}
          {invitation.coverImageUrl && (
            <div className="max-w-[280px] mx-auto mt-6">
              <div className="overflow-hidden rounded-md border border-neutral-200 bg-white p-1">
                <img
                  src={invitation.coverImageUrl}
                  alt={invitation.title}
                  className="w-full h-72 object-cover rounded-sm filter grayscale-[20%] contrast-[105%]"
                />
              </div>
            </div>
          )}
        </section>

        {/* Thin Hairline Divider */}
        <div className="w-full h-px bg-neutral-200" />

        {/* ===================== STORY / GREETING SECTION: CLEAN TEXT BLOCK ===================== */}
        {content.invitationText && (
          <section className="text-center space-y-4 max-w-lg mx-auto py-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-mono text-neutral-400">
              كلمة الترحيب
            </h3>
            <p className="text-sm sm:text-base text-neutral-800 leading-loose font-serif whitespace-pre-wrap">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <p className="text-xs text-neutral-500 pt-2 font-mono">
                قواعد اللباس: {content.dressCode}
              </p>
            )}
          </section>
        )}

        {/* ===================== COUNTDOWN: ULTRA CLEAN DIGITS ===================== */}
        {settings.enableCountdown !== false && dateValue && !timeLeft.isPast && (
          <section className="py-4 text-center space-y-4">
            <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 block">
              العد التنازلي
            </span>
            <div className="flex items-center justify-center gap-6 sm:gap-8 font-mono">
              {[
                { label: 'يوم', val: timeLeft.days },
                { label: 'ساعة', val: timeLeft.hours },
                { label: 'دقيقة', val: timeLeft.minutes },
                { label: 'ثانية', val: timeLeft.seconds },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-light text-neutral-900">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Thin Hairline Divider */}
        <div className="w-full h-px bg-neutral-200" />

        {/* ===================== DATE & TIME: FULL-WIDTH CLEAN SECTION ===================== */}
        {(dateValue || timeValue) && (
          <section className="space-y-6 text-center py-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-neutral-400 block">
              الموعد والتوقيت
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-md mx-auto pt-2">
              {dateValue && (
                <div className="space-y-1 text-center">
                  <span className="text-[11px] text-neutral-400 block font-mono">التاريخ</span>
                  <p className="text-base font-serif text-neutral-900 font-medium">
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <p className="text-xs text-neutral-500 font-serif">{content.hijriDate}</p>
                  )}
                </div>
              )}

              {timeValue && (
                <div className="space-y-1 text-center">
                  <span className="text-[11px] text-neutral-400 block font-mono">الساعة</span>
                  <p className="text-base font-serif text-neutral-900 font-medium">
                    {timeValue}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Thin Hairline Divider */}
        <div className="w-full h-px bg-neutral-200" />

        {/* ===================== VENUE SECTION: MINIMAL TEXT BLOCK & BLACK BUTTON ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section className="text-center space-y-5 py-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-neutral-400 block">
              المكان
            </span>
            <div className="space-y-1.5">
              <h4 className="text-lg font-serif text-neutral-900 font-medium">
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {content.venueCity ? `${content.venueCity} — ` : ''}
                  {content.venueAddress || invitation.venueAddress}
                </p>
              )}
            </div>

            {/* Minimal Black Filled Button */}
            {(content.googleMapsUrl || invitation.googleMapsUrl) && (
              <div className="pt-2">
                <a
                  href={content.googleMapsUrl || invitation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackAction?.('map_click')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-none text-xs font-mono uppercase tracking-wider transition duration-200 bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>الموقع على الخريطة</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            )}
          </section>
        )}

        {/* Thin Hairline Divider */}
        <div className="w-full h-px bg-neutral-200" />

        {/* ===================== GALLERY: CLEAN 2-COLUMN MINIMAL GRID ===================== */}
        {settings.enableGallery !== false && invitation.gallery && invitation.gallery.length > 0 && (
          <section className="space-y-6 text-center py-2">
            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-neutral-400 block">
              الصور
            </span>
            <div className="grid grid-cols-2 gap-3">
              {invitation.gallery.map((img, i) => (
                <div key={img.id || i} className="overflow-hidden bg-neutral-100">
                  <img
                    src={img.media_url}
                    alt={img.caption || `صورة ${i + 1}`}
                    className="w-full h-44 sm:h-56 object-cover filter contrast-[102%] hover:opacity-90 transition duration-300"
                    loading="lazy"
                  />
                  {img.caption && (
                    <p className="text-[10px] text-neutral-500 pt-1 text-center truncate">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================== RSVP: MINIMAL FORM ===================== */}
        {settings.allowRsvp && (
          <section className="border border-neutral-200 bg-white p-6 sm:p-10 space-y-6 text-right">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-neutral-400 block">
                تأكيد الحضور
              </span>
              <h3 className="text-lg font-serif font-normal text-neutral-900">
                يرجى موافاتنا بالرد
              </h3>
            </div>

            {submitted ? (
              <div className="p-6 border border-neutral-200 text-center space-y-2 bg-neutral-50">
                <CheckCircle2 className="w-6 h-6 mx-auto text-neutral-800" />
                <h4 className="text-sm font-medium text-neutral-900">
                  تم تسجيل الرد بنجاح
                </h4>
                <p className="text-xs text-neutral-500">
                  شكراً جزيلاً لكم، نسعد بحضوركم.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`py-2.5 px-3 text-xs font-mono uppercase tracking-wider transition cursor-pointer border ${
                      status === 'attending'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    يشرفني الحضور
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`py-2.5 px-3 text-xs font-mono uppercase tracking-wider transition cursor-pointer border ${
                      status === 'declined'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    أعتذر بكل لطف
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-neutral-700 font-mono mb-1">
                    الاسم الكامل <span className="text-neutral-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="الاسم واللقب"
                    className="w-full text-xs px-3 py-2.5 border border-neutral-200 bg-neutral-50 text-neutral-900 outline-none focus:border-neutral-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-700 font-mono mb-1">
                    رقم الهاتف <span className="text-[10px] text-neutral-400">(اختياري)</span>
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0661234567"
                    className="w-full text-xs px-3 py-2.5 border border-neutral-200 bg-neutral-50 text-neutral-900 outline-none focus:border-neutral-900 transition font-mono"
                  />
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs text-neutral-700 font-mono mb-1">
                      عدد المقاعد
                    </label>
                    <div className="flex items-center justify-between p-2 border border-neutral-200 bg-neutral-50">
                      <span className="text-xs text-neutral-600 font-mono">مجموع الحاضرين:</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 border border-neutral-300 bg-white text-xs font-mono hover:bg-neutral-100 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono text-sm font-medium w-4 text-center text-neutral-900">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 border border-neutral-300 bg-white text-xs font-mono hover:bg-neutral-100 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-neutral-700 font-mono mb-1">
                    رسالة أو تهنئة <span className="text-[10px] text-neutral-400">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="كلمة تهنئة..."
                    className="w-full text-xs p-3 border border-neutral-200 bg-neutral-50 text-neutral-900 outline-none focus:border-neutral-900 transition"
                  />
                </div>

                {errorMsg && <p className="text-xs text-red-600 text-center font-mono">{errorMsg}</p>}

                {/* Minimal Black Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-none text-xs font-mono uppercase tracking-wider bg-neutral-900 text-white transition hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال تأكيد الحضور'}</span>
                </button>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
