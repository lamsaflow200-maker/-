/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, Send, Heart, Users, User, Phone, Navigation, ExternalLink, Sparkles } from 'lucide-react';
import { MOROCCAN_PALACE_CONFIG } from './configs';
import { TemplateCornerAccents, TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';
import { CountdownSection } from '../engine/sections/CountdownSection';

export const MoroccanPalaceTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Moroccan Palace Palette
  const navy = theme?.primary_color || MOROCCAN_PALACE_CONFIG.colors.primary; // Majorelle Navy #152C4D
  const brass = theme?.accent_color || MOROCCAN_PALACE_CONFIG.colors.accent; // Antique Brass #C5A059
  const bg = theme?.background_color || MOROCCAN_PALACE_CONFIG.colors.background; // Moroccan Sand #FDFBF7
  const textColor = theme?.text_color || MOROCCAN_PALACE_CONFIG.colors.text;

  // RSVP Form state
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'declined'>('attending');
  const [partySize, setPartySize] = useState(1);
  const [wishes, setWishes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    wedding: 'حفل الزفاف المغربي الأصيل المبارك',
    engagement: 'حفل الخطوبة السعيد',
    aqiqah: 'حفل العقيقة المغربية المباركة',
    graduation: 'حفل التخرج والتكريم',
    birthday: 'حفل ذكرى الميلاد',
    anniversary: 'ذكرى بهيجة وسعيدة',
    family_event: 'مجلس عائلي مغربي بهيج',
    private_event: 'مناسبة خاصة ومميزة',
  }[eventType as string] || 'دعوة مغربية كريمة';

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

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#17202A] select-none"
      style={{
        backgroundColor: bg,
        backgroundImage: 'linear-gradient(180deg, #FDFBF7 0%, #F5EEE2 100%)',
      }}
    >
      {/* Moroccan Zellij Background Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay opacity-8"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C5A059' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20zm0 10l10 10-10 10-10-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top Andalusian Brass Trim */}
      <div
        className="w-full h-1.5 relative z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${brass}, ${navy}, ${brass}, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: MOROCCAN PALACE ===================== */}
        <section
          className="relative p-6 sm:p-12 rounded-t-[140px] rounded-b-3xl border-2 text-center space-y-6 overflow-hidden shadow-xl"
          style={{
            borderColor: brass,
            backgroundColor: '#FFFFFF',
            boxShadow: `0 14px 44px -8px rgba(21, 44, 77, 0.12), 0 0 20px rgba(197, 160, 89, 0.15)`,
          }}
        >
          {/* Moroccan 8-point Zellij Star Header */}
          <div className="flex flex-col items-center justify-center my-2 select-none">
            <svg width="140" height="28" viewBox="0 0 140 28" fill="none" className="opacity-95">
              <path
                d="M0 14 H45 C50 14 55 4 62 2 C67 0 73 0 78 2 C85 4 90 14 95 14 H140"
                stroke={brass}
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx="70" cy="11" r="3" fill={brass} />
              <polygon points="70,4 72,9 77,9 73,12 75,17 70,14 65,17 67,12 63,9 68,9" fill={brass} />
            </svg>
          </div>

          {/* Traditional Basmala */}
          <p className="text-xs sm:text-sm tracking-widest opacity-90" style={{ color: brass }}>
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-[#5D6D7E] leading-relaxed px-4">
              تتشرف {content.hostNames} بدعوتكم الكريمة
            </p>
          )}

          {/* Moroccan Tag Badge */}
          <div className="inline-block">
            <span
              className="text-xs font-bold px-5 py-1.5 rounded-lg border shadow-xs"
              style={{
                borderColor: `${brass}80`,
                backgroundColor: '#F7F3EB',
                color: navy,
              }}
            >
              {eventTypeLabel}
            </span>
          </div>

          {/* Moorish Andalusian Arch Photo Frame */}
          {invitation.coverImageUrl && (
            <div
              className="max-w-[220px] mx-auto overflow-hidden rounded-t-[120px] rounded-b-2xl border-2 p-1.5 shadow-xl transition-transform hover:scale-[1.02]"
              style={{
                borderColor: brass,
                backgroundColor: '#FDFBF7',
                boxShadow: `0 10px 30px rgba(21, 44, 77, 0.2)`,
              }}
            >
              <img
                src={invitation.coverImageUrl}
                alt={invitation.title}
                className="w-full h-52 object-cover rounded-t-[110px] rounded-b-xl"
              />
            </div>
          )}

          {/* Celebrants Typography */}
          <div className="py-2 space-y-2">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-wide"
                  style={{ color: navy }}
                >
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${brass})` }} />
                  <span className="text-2xl font-bold" style={{ color: brass }}>و</span>
                  <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${brass}, transparent)` }} />
                </div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-wide"
                  style={{ color: navy }}
                >
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-wide"
                style={{ color: navy }}
              >
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {content.eventTitle && content.eventTitle !== invitation.title && (
            <p className="text-xs sm:text-sm italic text-[#5D6D7E] max-w-md mx-auto">
              {content.eventTitle}
            </p>
          )}

          <TemplateSectionDivider config={MOROCCAN_PALACE_CONFIG} accentColor={brass} />
        </section>

        {/* ===================== STORY / GREETING SECTION ===================== */}
        {content.invitationText && (
          <section
            className="relative p-6 sm:p-10 rounded-2xl border-2 text-center space-y-4 bg-white shadow-sm"
            style={{ borderColor: '#E3D7C4' }}
          >
            <TemplateCornerAccents color={brass} size={18} style="moroccan" />
            <div
              className="w-10 h-10 rounded-full border mx-auto flex items-center justify-center"
              style={{
                borderColor: brass,
                backgroundColor: `${brass}18`,
                color: navy,
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: navy }}>
              {content.eventTitle || 'حضوركم شرف وابتهاج لمناسبتنا'}
            </h3>
            <p className="text-xs sm:text-sm text-[#2C3E50] leading-loose whitespace-pre-wrap px-4">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: '#E3D7C4', color: brass }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">اللباس المعتمد: </span>
                <span>{content.dressCode}</span>
              </div>
            )}
          </section>
        )}

        {/* ===================== DATE & TIME SECTION ===================== */}
        {(dateValue || timeValue) && (
          <section
            className="relative p-6 sm:p-8 rounded-2xl border-2 text-center space-y-6 bg-white shadow-sm"
            style={{ borderColor: '#E3D7C4' }}
          >
            <TemplateCornerAccents color={brass} size={18} style="moroccan" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: brass }}>
                الموعد والتوقيت
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: navy }}>
                تاريخ وميعاد الاستقبال
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: '#E3D7C4',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: brass, color: navy, backgroundColor: '#FFFFFF' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#5D6D7E]">التاريخ الميلادي</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-[11px]" style={{ color: brass }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: '#E3D7C4',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: brass, color: navy, backgroundColor: '#FFFFFF' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#5D6D7E]">توقيت الحفل</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#7F8C8D] font-mono">
                    {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================== COUNTDOWN SECTION ===================== */}
        {settings.enableCountdown !== false && (dateValue || invitation.eventDate) && (
          <CountdownSection
            invitation={invitation}
            style={{
              cardBg: '#0C1322',
              borderColor: '#C5A059',
              accentColor: brass,
              primaryColor: '#E5C178',
              textColor: '#FDFBF7',
              backgroundColor: '#0C1322',
              cardRadius: '1rem',
            }}
            config={MOROCCAN_PALACE_CONFIG}
          />
        )}

        {/* ===================== VENUE & MAP SECTION ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="relative p-6 sm:p-8 rounded-2xl border-2 text-center space-y-5 bg-white shadow-sm"
            style={{ borderColor: '#E3D7C4' }}
          >
            <TemplateCornerAccents color={brass} size={18} style="moroccan" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: brass }}>
                فضاء الاستقبال والرياض
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: navy }}>
                القصر والقاعة وموقع الحفل
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#5D6D7E] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: brass }} />
                  <span>
                    {content.venueCity ? `${content.venueCity} — ` : ''}
                    {content.venueAddress || invitation.venueAddress}
                  </span>
                </p>
              )}
            </div>

            {(content.googleMapsUrl || invitation.googleMapsUrl) && (
              <div className="pt-2">
                <a
                  href={content.googleMapsUrl || invitation.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onTrackAction?.('map_click')}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition duration-300 shadow-sm hover:shadow-md cursor-pointer border"
                  style={{
                    backgroundColor: navy,
                    color: '#FDFBF7',
                    borderColor: brass,
                    boxShadow: '0 4px 16px rgba(21, 44, 77, 0.25)',
                  }}
                >
                  <Navigation className="w-4 h-4 text-[#C5A059]" />
                  <span>📍 الوصول إلى مكان الحفل عبر Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            )}
          </section>
        )}

        {/* ===================== RSVP SECTION ===================== */}
        {settings.allowRsvp && (
          <section
            className="relative p-6 sm:p-8 rounded-2xl border-2 text-right space-y-6 bg-white shadow-sm"
            style={{ borderColor: '#E3D7C4' }}
          >
            <TemplateCornerAccents color={brass} size={18} style="moroccan" />
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: brass }}>
                تأكيد الحضور
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: navy }}>
                يسعدنا تأكيد تشريفكم لمناسبتنا
              </h3>
              <p className="text-xs text-[#5D6D7E]">
                يرجى موافاتنا بتأكيد حضوركم الكريم لتنظيم المقاعد بما يليق بكم
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#EDF7EE] border border-[#BFE4C6] text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#218739] mx-auto" />
                <h4 className="text-sm font-bold text-[#175E27]">
                  تم تسجيل تشريفكم بنجاح!
                </h4>
                <p className="text-xs text-[#175E27]/80">
                  شكراً جزيلاً، يسعدنا ويشرفنا حضوركم ومشاركتنا هذه الفرحة المغربية المباركة.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'attending' ? 'shadow-xs' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? navy : '#FDFBF7',
                      color: status === 'attending' ? '#FDFBF7' : '#5D6D7E',
                      borderColor: status === 'attending' ? brass : '#E3D7C4',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'declined' ? 'shadow-xs' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? '#2C3E50' : '#FDFBF7',
                      color: status === 'declined' ? '#FFFFFF' : '#5D6D7E',
                      borderColor: status === 'declined' ? '#2C3E50' : '#E3D7C4',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E3D7C4] bg-[#FFFFFF] outline-none focus:border-[#C5A059]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#7F8C8D] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#5D6D7E] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E3D7C4] bg-[#FFFFFF] font-mono outline-none focus:border-[#C5A059]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#7F8C8D] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#17202A] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E3D7C4] bg-[#FDFBF7]">
                      <span className="text-xs text-[#5D6D7E] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#C5A059]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-lg border border-[#E3D7C4] bg-[#FFFFFF] text-xs font-bold hover:bg-[#F5EEE2] transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-lg border border-[#E3D7C4] bg-[#FFFFFF] text-xs font-bold hover:bg-[#F5EEE2] transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#17202A] mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#5D6D7E] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك وبالرفاه والبنين ودامت دياركم عامرة بالأفراح والمسرات..."
                    className="w-full text-xs p-3 rounded-lg border border-[#E3D7C4] bg-[#FFFFFF] outline-none focus:border-[#C5A059]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#B42318] text-center">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 border"
                  style={{
                    backgroundColor: navy,
                    borderColor: brass,
                    boxShadow: '0 4px 16px rgba(21, 44, 77, 0.25)',
                  }}
                >
                  <Send className="w-4 h-4 text-[#C5A059]" />
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
