/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, Send, Heart, Users, User, Phone, Navigation, ExternalLink, Sparkles } from 'lucide-react';
import { FLORAL_ROMANCE_CONFIG } from './configs';
import { TemplateCornerAccents, TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';

export const FloralRomanceTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Floral Romance Palette
  const rose = theme?.primary_color || FLORAL_ROMANCE_CONFIG.colors.primary; // Vintage Berry Rose #7A3847
  const roseGold = theme?.accent_color || FLORAL_ROMANCE_CONFIG.colors.accent; // Warm Rose Gold #C89382
  const bg = theme?.background_color || FLORAL_ROMANCE_CONFIG.colors.background; // Soft Blush Cream #FCF8F7
  const textColor = theme?.text_color || FLORAL_ROMANCE_CONFIG.colors.text; // #221A1D

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
    wedding: 'دعوة لحضور حفل الزفاف الرومانسي المبارك',
    engagement: 'حفل الخطوبة الرقيق السعيد',
    aqiqah: 'حفل العقيقة المباركة البهيجة',
    graduation: 'حفل التخرج والتكريم الأنيق',
    birthday: 'حفل ذكرى الميلاد البهيج',
    anniversary: 'الاحتفال بذكرى المحبة والوفاء',
    family_event: 'لقاء عائلي حميم بهيج',
    private_event: 'مناسبة خاصة مفعمة بالفرح',
  }[eventType as string] || 'دعوة كريمة ومفعمة بالمحبة';

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
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#221A1D] select-none"
      style={{
        backgroundColor: bg,
        backgroundImage: 'linear-gradient(180deg, #FCF8F7 0%, #F8EFEF 100%)',
      }}
    >
      {/* Top Rose Gold Border */}
      <div
        className="w-full h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${roseGold}, ${rose}, ${roseGold}, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: FLORAL ROMANCE ===================== */}
        <section
          className="relative p-6 sm:p-12 rounded-[2.5rem] border text-center space-y-6 overflow-hidden shadow-sm"
          style={{
            borderColor: '#F0E2DE',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 12px 36px rgba(122, 56, 71, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Floral Corner Accents */}
          <TemplateCornerAccents color={roseGold} size={22} style="floral" />

          {/* Botanical Vine Flourish Header */}
          <div className="flex items-center justify-center gap-2 my-2 select-none opacity-90">
            <svg width="150" height="22" viewBox="0 0 150 22" fill="none">
              <path
                d="M10 11 C35 7, 50 15, 65 11 C70 9, 75 9, 80 11 C95 15, 110 7, 140 11"
                stroke={roseGold}
                strokeWidth="1.2"
              />
              <path d="M73 7 C75 4, 79 5, 78 8 C76 9, 74 8, 73 7 Z" fill={roseGold} />
              <path d="M77 15 C75 18, 71 17, 72 14 C74 13, 76 14, 77 15 Z" fill={roseGold} />
              <circle cx="75" cy="11" r="2.5" fill={roseGold} />
            </svg>
          </div>

          {/* Traditional Basmala */}
          <p className="text-xs sm:text-sm tracking-widest opacity-85" style={{ color: roseGold }}>
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-[#77696E] leading-relaxed px-4">
              تتشرف {content.hostNames} بدعوتكم الكريمة
            </p>
          )}

          {/* Soft Pill Badge */}
          <div className="inline-block">
            <span
              className="text-xs font-bold px-6 py-1.5 rounded-full border shadow-2xs"
              style={{
                borderColor: `${roseGold}60`,
                backgroundColor: '#FBF0EE',
                color: rose,
              }}
            >
              {eventTypeLabel}
            </span>
          </div>

          {/* Soft Curved Frame Photo */}
          {invitation.coverImageUrl && (
            <div
              className="max-w-[210px] mx-auto overflow-hidden rounded-[2rem] border-2 p-1.5 shadow-md bg-white transition-transform hover:scale-[1.02]"
              style={{
                borderColor: `${roseGold}70`,
                boxShadow: `0 10px 28px rgba(122, 56, 71, 0.12)`,
              }}
            >
              <img
                src={invitation.coverImageUrl}
                alt={invitation.title}
                className="w-full h-50 object-cover rounded-[1.6rem]"
              />
            </div>
          )}

          {/* Poetic Names Typography */}
          <div className="py-2 space-y-2">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{ color: rose }}
                >
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-12" style={{ background: `linear-gradient(90deg, transparent, ${roseGold})` }} />
                  <span className="italic text-2xl font-serif" style={{ color: roseGold }}>&</span>
                  <div className="h-px w-12" style={{ background: `linear-gradient(90deg, ${roseGold}, transparent)` }} />
                </div>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight"
                  style={{ color: rose }}
                >
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1
                className="text-3xl sm:text-5xl font-bold tracking-tight"
                style={{ color: rose }}
              >
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {content.eventTitle && content.eventTitle !== invitation.title && (
            <p className="text-xs sm:text-sm italic text-[#77696E] max-w-md mx-auto">
              {content.eventTitle}
            </p>
          )}

          <TemplateSectionDivider config={FLORAL_ROMANCE_CONFIG} accentColor={roseGold} />
        </section>

        {/* ===================== STORY / GREETING SECTION ===================== */}
        {content.invitationText && (
          <section
            className="p-6 sm:p-10 rounded-3xl border text-center space-y-4 bg-white shadow-xs"
            style={{ borderColor: '#F0E2DE' }}
          >
            <div
              className="w-10 h-10 rounded-full border mx-auto flex items-center justify-center"
              style={{
                borderColor: `${roseGold}80`,
                backgroundColor: `${roseGold}18`,
                color: rose,
              }}
            >
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: rose }}>
              {content.eventTitle || 'يسعدنا تشريفكم لتكتمل بهجتنا'}
            </h3>
            <p className="text-xs sm:text-sm text-[#4E4146] leading-loose whitespace-pre-wrap px-4">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: '#F5ECE9', color: roseGold }}>
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
            className="p-6 sm:p-8 rounded-3xl border text-center space-y-6 bg-white shadow-xs"
            style={{ borderColor: '#F0E2DE' }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: roseGold }}>
                موعد اللقاء
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: rose }}>
                الزمان والموعد
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#FCF8F7',
                    borderColor: '#F0E2DE',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: roseGold, color: rose, backgroundColor: '#FFFFFF' }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#77696E]">التاريخ الميلادي</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-[11px]" style={{ color: roseGold }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-2xl border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#FCF8F7',
                    borderColor: '#F0E2DE',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                    style={{ borderColor: roseGold, color: rose, backgroundColor: '#FFFFFF' }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#77696E]">توقيت الحفل</span>
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

        {/* ===================== VENUE & MAP SECTION ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="p-6 sm:p-8 rounded-3xl border text-center space-y-5 bg-white shadow-xs"
            style={{ borderColor: '#F0E2DE' }}
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: roseGold }}>
                الموقع والقاعة
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: rose }}>
                مكان الحفل والضيافة
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold" style={{ color: textColor }}>
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#77696E] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: roseGold }} />
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
                    backgroundColor: rose,
                    color: '#FCF8F7',
                    boxShadow: '0 4px 16px rgba(122, 56, 71, 0.25)',
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
            className="p-6 sm:p-8 rounded-3xl border text-right space-y-6 bg-white shadow-xs"
            style={{ borderColor: '#F0E2DE' }}
          >
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: roseGold }}>
                تأكيد الحضور
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: rose }}>
                يسعدنا تأكيد تشريفكم
              </h3>
              <p className="text-xs text-[#77696E]">
                يرجى موافاتنا بتأكيد حضوركم الكريم لتنظيم المقاعد بما يليق بكم
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#EDF7EE] border border-[#BFE4C6] text-center space-y-2">
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
                      status === 'attending' ? 'shadow-xs' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? rose : '#FCF8F7',
                      color: status === 'attending' ? '#FFFFFF' : '#77696E',
                      borderColor: status === 'attending' ? rose : '#F0E2DE',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'declined' ? 'shadow-xs' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? '#221A1D' : '#FCF8F7',
                      color: status === 'declined' ? '#FFFFFF' : '#77696E',
                      borderColor: status === 'declined' ? '#221A1D' : '#F0E2DE',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221A1D] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#F0E2DE] bg-[#FFFFFF] outline-none focus:border-[#C89382]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#9A8F92] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221A1D] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#77696E] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#F0E2DE] bg-[#FFFFFF] font-mono outline-none focus:border-[#C89382]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#9A8F92] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#221A1D] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#F0E2DE] bg-[#FCF8F7]">
                      <span className="text-xs text-[#77696E] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#C89382]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-full border border-[#F0E2DE] bg-[#FFFFFF] text-xs font-bold hover:bg-[#F5ECE9] transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-full border border-[#F0E2DE] bg-[#FFFFFF] text-xs font-bold hover:bg-[#F5ECE9] transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#221A1D] mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#77696E] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك وبالرفاه والبنين ودامت دياركم عامرة بالأفراح..."
                    className="w-full text-xs p-3 rounded-xl border border-[#F0E2DE] bg-[#FFFFFF] outline-none focus:border-[#C89382]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#B42318] text-center">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold text-white transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: rose,
                    boxShadow: '0 4px 16px rgba(122, 56, 71, 0.25)',
                  }}
                >
                  <Send className="w-4 h-4 text-[#F8EFEF]" />
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
