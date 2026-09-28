/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, Send, Heart, Users, User, Phone, Navigation, ExternalLink, Sparkles } from 'lucide-react';
import { ELEGANT_PEARL_CONFIG } from './configs';
import { TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';
import { CountdownSection } from '../engine/sections/CountdownSection';

export const ElegantPearlTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Elegant Pearl Palette
  const primary = theme?.primary_color || ELEGANT_PEARL_CONFIG.colors.primary; // Burgundy Wine #5A1020
  const champagne = theme?.accent_color || ELEGANT_PEARL_CONFIG.colors.accent; // Soft Gold #C9A45C
  const bg = theme?.background_color || ELEGANT_PEARL_CONFIG.colors.background; // Luminous Pearl #FAF9F6
  const textColor = theme?.text_color || ELEGANT_PEARL_CONFIG.colors.text;

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
    wedding: 'دعوة لحضور حفل الزفاف المبارك',
    engagement: 'دعوة لحضور حفل الخطوبة السعيد',
    aqiqah: 'دعوة لحضور حفل العقيقة المباركة',
    graduation: 'دعوة لحضور حفل التخرج والتكريم',
    birthday: 'دعوة للاحتفال بعيد الميلاد',
    anniversary: 'دعوة للاحتفال بذكرى سعيدة',
    family_event: 'دعوة لحضور لقاء عائلي بهيج',
    private_event: 'دعوة لحضور مناسبة خاصة',
  }[eventType as string] || 'دعوة كريمة';

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
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#1F1B1D] select-none"
      style={{
        backgroundColor: bg,
        backgroundImage: 'linear-gradient(180deg, #FAF9F6 0%, #F5EFEB 100%)',
      }}
    >
      {/* Delicate Top Pearl Line */}
      <div
        className="w-full h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${champagne}80, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: ELEGANT PEARL ===================== */}
        <section
          className="relative p-6 sm:p-12 rounded-3xl border text-center space-y-6 overflow-hidden shadow-sm"
          style={{
            borderColor: '#E8DFD5',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 32px rgba(90, 16, 32, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Pearl Bead Accent */}
          <div className="flex items-center justify-center gap-1.5 my-2 select-none">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: champagne }} />
            <div
              className="w-2.5 h-2.5 rounded-full border"
              style={{ borderColor: champagne, backgroundColor: `${champagne}25` }}
            />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: champagne }} />
          </div>

          {/* Traditional Basmala */}
          <p className="text-xs sm:text-sm tracking-widest opacity-85" style={{ color: champagne }}>
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-[#6E6669] leading-relaxed px-4">
              تتشرف {content.hostNames} بدعوتكم
            </p>
          )}

          {/* Soft Pill Badge */}
          <div className="inline-block">
            <span
              className="text-xs font-bold px-5 py-1.5 rounded-full border shadow-2xs"
              style={{
                borderColor: `${champagne}50`,
                backgroundColor: '#FAF5F0',
                color: primary,
              }}
            >
              {eventTypeLabel}
            </span>
          </div>

          {/* Oval Framed Portrait Photo */}
          {invitation.coverImageUrl && (
            <div
              className="max-w-[200px] mx-auto overflow-hidden rounded-[100px] border-2 p-1.5 shadow-md bg-white transition-transform hover:scale-[1.02]"
              style={{
                borderColor: `${champagne}60`,
                boxShadow: `0 8px 24px rgba(201, 164, 92, 0.18)`,
              }}
            >
              <img
                src={invitation.coverImageUrl}
                alt={invitation.title}
                className="w-full h-52 object-cover rounded-[92px]"
              />
            </div>
          )}

          {/* Names Typography */}
          <div className="py-2 space-y-2">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{ color: primary }}
                >
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-12" style={{ background: `linear-gradient(90deg, transparent, ${champagne})` }} />
                  <span className="italic text-2xl font-serif" style={{ color: champagne }}>&</span>
                  <div className="h-px w-12" style={{ background: `linear-gradient(90deg, ${champagne}, transparent)` }} />
                </div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{ color: primary }}
                >
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight"
                style={{ color: primary }}
              >
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {content.eventTitle && content.eventTitle !== invitation.title && (
            <p className="text-xs sm:text-sm italic text-[#6E6669] max-w-md mx-auto">
              {content.eventTitle}
            </p>
          )}

          <TemplateSectionDivider config={ELEGANT_PEARL_CONFIG} accentColor={champagne} />
        </section>

        {/* ===================== STORY / GREETING SECTION ===================== */}
        {content.invitationText && (
          <section
            className="p-6 sm:p-10 rounded-2xl border text-center space-y-4 bg-white shadow-xs"
            style={{ borderColor: '#E8DFD5' }}
          >
            <div
              className="w-10 h-10 rounded-full border mx-auto flex items-center justify-center"
              style={{
                borderColor: champagne,
                backgroundColor: `${champagne}15`,
                color: primary,
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: primary }}>
              {content.eventTitle || 'يسعدنا تشريفكم لحضور مناسبتنا'}
            </h3>
            <p className="text-xs sm:text-sm text-[#4A4245] leading-loose whitespace-pre-wrap px-4">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: '#F0E8DF', color: champagne }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">قواعد اللباس: </span>
                <span>{content.dressCode}</span>
              </div>
            )}
          </section>
        )}

        {/* ===================== DATE & TIME SECTION ===================== */}
        {(dateValue || timeValue) && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-6 bg-white shadow-xs"
            style={{ borderColor: '#E8DFD5' }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: champagne }}>
                الموعد والزمان
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: primary }}>
                توقيت الحفل واللقاء
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E8DFD5',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: champagne, color: primary, backgroundColor: '#FFFFFF' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#6E6669]">التاريخ الميلادي</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-[11px]" style={{ color: champagne }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#FAF9F6',
                    borderColor: '#E8DFD5',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: champagne, color: primary, backgroundColor: '#FFFFFF' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#6E6669]">توقيت الحفل</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#9A8F92] font-mono">
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
              cardBg: '#FFFFFF',
              borderColor: '#E8DED8',
              accentColor: champagne,
              primaryColor: primary,
              textColor: textColor,
              backgroundColor: '#FAF9F6',
              cardRadius: '1.5rem',
            }}
            config={ELEGANT_PEARL_CONFIG}
          />
        )}

        {/* ===================== VENUE & MAP SECTION ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-center space-y-5 bg-white shadow-xs"
            style={{ borderColor: '#E8DFD5' }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: champagne }}>
                مكان الحفل
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: primary }}>
                القاعة وموقع الضيافة
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#6E6669] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: champagne }} />
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
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-bold transition duration-300 shadow-sm hover:shadow-md cursor-pointer"
                  style={{
                    backgroundColor: primary,
                    color: '#FAF9F6',
                    boxShadow: '0 4px 16px rgba(90, 16, 32, 0.2)',
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

        {/* ===================== RSVP SECTION ===================== */}
        {settings.allowRsvp && (
          <section
            className="p-6 sm:p-8 rounded-2xl border text-right space-y-6 bg-white shadow-xs"
            style={{ borderColor: '#E8DFD5' }}
          >
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: champagne }}>
                تأكيد الحضور
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: primary }}>
                يسعدنا تأكيد تشريفكم
              </h3>
              <p className="text-xs text-[#6E6669]">
                يرجى موافاتنا بتأكيد حضوركم الكريم لتنظيم المقاعد بما يليق بكم
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#EDF7EE] border border-[#BFE4C6] text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#218739] mx-auto" />
                <h4 className="text-sm font-bold text-[#175E27]">
                  تم تسجيل ردكم الكريم بنجاح!
                </h4>
                <p className="text-xs text-[#175E27]/80">
                  شكراً جزيلاً، يسعدنا ويشرفنا حضوركم ومشاركتنا هذه الفرحة.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`p-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'attending'
                        ? 'shadow-xs'
                        : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? primary : '#FAF7F2',
                      color: status === 'attending' ? '#FAF9F6' : '#6E6669',
                      borderColor: status === 'attending' ? primary : '#E8DFD5',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'declined'
                        ? 'shadow-xs'
                        : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? '#1F1B1D' : '#FAF7F2',
                      color: status === 'declined' ? '#FFFFFF' : '#6E6669',
                      borderColor: status === 'declined' ? '#1F1B1D' : '#E8DFD5',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1B1D] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] outline-none focus:border-[#C9A45C]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#9A8F92] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F1B1D] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#6E6669] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] font-mono outline-none focus:border-[#C9A45C]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#9A8F92] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#1F1B1D] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E8DFD5] bg-[#FAF7F2]">
                      <span className="text-xs text-[#6E6669] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#C9A45C]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] text-xs font-bold hover:bg-[#F4ECE4] transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] text-xs font-bold hover:bg-[#F4ECE4] transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1F1B1D] mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#6E6669] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك وبالرفاه والبنين ودامت دياركم عامرة بالأفراح..."
                    className="w-full text-xs p-3 rounded-lg border border-[#E8DFD5] bg-[#FFFFFF] outline-none focus:border-[#C9A45C]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#B42318] text-center">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full text-xs sm:text-sm font-bold text-white transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: primary,
                    boxShadow: '0 4px 16px rgba(90, 16, 32, 0.2)',
                  }}
                >
                  <Send className="w-4 h-4 text-[#C9A45C]" />
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
