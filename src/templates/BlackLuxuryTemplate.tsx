/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, Send, Heart, Users, User, Phone, Navigation, ExternalLink, Sparkles } from 'lucide-react';
import { BLACK_LUXURY_CONFIG } from './configs';
import { TemplateCornerAccents, TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';
import { CountdownSection } from '../engine/sections/CountdownSection';

export const BlackLuxuryTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Black Luxury Palette
  const gold = theme?.accent_color || BLACK_LUXURY_CONFIG.colors.primary; // Radiant Gold Leaf #F3C64F
  const brightGold = BLACK_LUXURY_CONFIG.colors.secondary; // #FFDF78
  const bg = theme?.background_color || BLACK_LUXURY_CONFIG.colors.background; // Pure Midnight #08080A
  const cardBg = BLACK_LUXURY_CONFIG.colors.surface; // #121215
  const textColor = theme?.text_color || BLACK_LUXURY_CONFIG.colors.text;

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
    wedding: 'دعوة لحضور حفل الزفاف السينمائي الفاخر',
    engagement: 'حفل الخطوبة السعيد VIP',
    aqiqah: 'حفل العقيقة المباركة',
    graduation: 'حفل التخرج والتكريم الباهر',
    birthday: 'حفل ذكرى الميلاد الحصري',
    anniversary: 'الاحتفال بالذكرى السنوية الفاخرة',
    family_event: 'لقاء عائلي استثنائي فاخر',
    private_event: 'أمسية خاصة حصرية VIP',
  }[eventType as string] || 'مناسبة استثنائية فاخرة';

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
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#EDEDF2] select-none"
      style={{
        backgroundColor: bg,
        backgroundImage: BLACK_LUXURY_CONFIG.backgrounds.primaryGradient,
      }}
    >
      {/* Top Gold Leaf Trim */}
      <div
        className="w-full h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${gold}, ${brightGold}, ${gold}, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: BLACK LUXURY ===================== */}
        <section
          className="relative p-6 sm:p-12 rounded-2xl border text-center space-y-6 overflow-hidden shadow-2xl"
          style={{
            borderColor: '#28272E',
            backgroundColor: `${cardBg}FA`,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(243, 198, 79, 0.15)`,
          }}
        >
          {/* Clean Line Corner Accents */}
          <TemplateCornerAccents color={gold} size={20} style="clean" />

          {/* Minimal Geometric Star Ornaments */}
          <div className="flex items-center justify-center gap-3 my-2 select-none">
            <span className="text-xs" style={{ color: gold }}>✦</span>
            <div className="h-px w-14" style={{ backgroundColor: '#28272E' }} />
            <div
              className="w-8 h-8 rounded-lg border flex items-center justify-center shadow-md rotate-45"
              style={{
                borderColor: `${gold}80`,
                backgroundColor: `${gold}15`,
                color: gold,
              }}
            >
              <Sparkles className="w-4 h-4 -rotate-45" />
            </div>
            <div className="h-px w-14" style={{ backgroundColor: '#28272E' }} />
            <span className="text-xs" style={{ color: gold }}>✦</span>
          </div>

          {/* Traditional Basmala */}
          <p className="text-xs sm:text-sm tracking-widest opacity-90 font-serif" style={{ color: gold }}>
            بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>

          {/* Host Names */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm text-[#8D8C96] leading-relaxed px-4">
              تتشرف {content.hostNames} بدعوتكم
            </p>
          )}

          {/* VIP Badge */}
          <div className="inline-block">
            <span
              className="text-xs font-bold px-5 py-1.5 rounded-md border tracking-wider shadow-sm"
              style={{
                borderColor: `${gold}60`,
                backgroundColor: '#1F1B12',
                color: gold,
              }}
            >
              {eventTypeLabel}
            </span>
          </div>

          {/* Cinematic Cover Image (Sharp Beveled Frame) */}
          {invitation.coverImageUrl && (
            <div
              className="max-w-[240px] mx-auto overflow-hidden rounded-xl border p-1 shadow-2xl transition-transform hover:scale-[1.02]"
              style={{
                borderColor: `${gold}80`,
                backgroundColor: '#08080A',
                boxShadow: `0 0 35px rgba(243, 198, 79, 0.25)`,
              }}
            >
              <img
                src={invitation.coverImageUrl}
                alt={invitation.title}
                className="w-full h-52 object-cover rounded-lg filter brightness-90 contrast-110"
              />
            </div>
          )}

          {/* Monumental Celebrants Typography */}
          <div className="py-2 space-y-2">
            {content.firstCelebrantName && content.secondCelebrantName ? (
              <div>
                <h1
                  className="text-3xl sm:text-6xl font-bold tracking-tight"
                  style={{
                    color: gold,
                    textShadow: `0 0 35px rgba(243, 198, 79, 0.4)`,
                  }}
                >
                  {content.firstCelebrantName}
                </h1>
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${gold})` }} />
                  <span className="italic text-2xl" style={{ color: brightGold }}>&</span>
                  <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                </div>
                <h1
                  className="text-3xl sm:text-6xl font-bold tracking-tight"
                  style={{
                    color: gold,
                    textShadow: `0 0 35px rgba(243, 198, 79, 0.4)`,
                  }}
                >
                  {content.secondCelebrantName}
                </h1>
              </div>
            ) : (
              <h1
                className="text-3xl sm:text-6xl font-bold tracking-tight"
                style={{
                  color: gold,
                  textShadow: `0 0 35px rgba(243, 198, 79, 0.4)`,
                }}
              >
                {content.celebrantNames || invitation.title}
              </h1>
            )}
          </div>

          {content.eventTitle && content.eventTitle !== invitation.title && (
            <p className="text-xs sm:text-sm italic text-[#8D8C96] max-w-md mx-auto">
              {content.eventTitle}
            </p>
          )}

          <TemplateSectionDivider config={BLACK_LUXURY_CONFIG} accentColor={gold} />
        </section>

        {/* ===================== STORY / GREETING SECTION ===================== */}
        {content.invitationText && (
          <section
            className="relative p-6 sm:p-10 rounded-xl border text-center space-y-4 shadow-xl"
            style={{
              borderColor: '#28272E',
              backgroundColor: `${cardBg}F2`,
            }}
          >
            <TemplateCornerAccents color={gold} size={18} style="clean" />
            <div
              className="w-10 h-10 rounded-lg border mx-auto flex items-center justify-center rotate-45"
              style={{
                borderColor: `${gold}60`,
                backgroundColor: `${gold}15`,
                color: gold,
              }}
            >
              <Heart className="w-5 h-5 fill-current -rotate-45" />
            </div>
            <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
              {content.eventTitle || 'يسعدنا تشريفكم وحضوركم الكريم'}
            </h3>
            <p className="text-xs sm:text-sm text-[#D4D3DC] leading-loose whitespace-pre-wrap px-4">
              {content.invitationText}
            </p>
            {content.dressCode && (
              <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: '#28272E', color: gold }}>
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
            className="relative p-6 sm:p-8 rounded-xl border text-center space-y-6 shadow-xl"
            style={{
              borderColor: '#28272E',
              backgroundColor: `${cardBg}F2`,
            }}
          >
            <TemplateCornerAccents color={gold} size={18} style="clean" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                توقيت المناسبة
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                الزمان والموعد
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dateValue && (
                <div
                  className="p-4 rounded-lg border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#0E0E11',
                    borderColor: '#28272E',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg border flex items-center justify-center mb-1"
                    style={{ borderColor: gold, color: gold, backgroundColor: `${gold}18` }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#8D8C96]">التاريخ الميلادي</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {formattedArabicDate}
                  </p>
                  {content.hijriDate && (
                    <span className="text-[11px]" style={{ color: brightGold }}>
                      {content.hijriDate}
                    </span>
                  )}
                </div>
              )}

              {timeValue && (
                <div
                  className="p-4 rounded-lg border flex flex-col items-center justify-center space-y-2"
                  style={{
                    backgroundColor: '#0E0E11',
                    borderColor: '#28272E',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg border flex items-center justify-center mb-1"
                    style={{ borderColor: gold, color: gold, backgroundColor: `${gold}18` }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#8D8C96]">توقيت الحفل</span>
                  <p className="text-sm font-bold" style={{ color: textColor }}>
                    {timeValue}
                  </p>
                  <span className="text-[10px] text-[#706E7A] font-mono">
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
              cardBg: '#0A0A0C',
              borderColor: '#222222',
              accentColor: gold,
              primaryColor: '#FFFFFF',
              textColor: '#E0E0E0',
              backgroundColor: '#08080A',
              cardRadius: '0.25rem',
            }}
            config={BLACK_LUXURY_CONFIG}
          />
        )}

        {/* ===================== VENUE & MAP SECTION ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <section
            className="relative p-6 sm:p-8 rounded-xl border text-center space-y-5 shadow-xl"
            style={{
              borderColor: '#28272E',
              backgroundColor: `${cardBg}F2`,
            }}
          >
            <TemplateCornerAccents color={gold} size={18} style="clean" />
            <div className="space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                موقع الاستقبال
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                مكان الحفل والضيافة
              </h3>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold text-white">
                {content.venueName || invitation.venueName}
              </h4>
              {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                <p className="text-xs sm:text-sm text-[#8D8C96] max-w-md mx-auto flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: gold }} />
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
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg text-xs sm:text-sm font-bold transition duration-300 shadow-lg hover:brightness-110 cursor-pointer"
                  style={{
                    backgroundColor: gold,
                    color: '#08080A',
                    boxShadow: `0 4px 20px rgba(243, 198, 79, 0.4)`,
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

        {/* ===================== RSVP VIP PANEL ===================== */}
        {settings.allowRsvp && (
          <section
            className="relative p-6 sm:p-8 rounded-xl border text-right space-y-6 shadow-2xl"
            style={{
              borderColor: '#28272E',
              backgroundColor: `${cardBg}F8`,
              boxShadow: `0 14px 44px rgba(0,0,0,0.95), 0 0 25px rgba(243, 198, 79, 0.15)`,
            }}
          >
            <TemplateCornerAccents color={gold} size={18} style="clean" />

            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                تأكيد الحضور VIP
              </span>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: gold }}>
                يسعدنا تأكيد حضوركم الكريم
              </h3>
              <p className="text-xs text-[#8D8C96]">
                يرجى موافاتنا بالرد لتنظيم استقبالكم الحصري
              </p>
            </div>

            {submitted ? (
              <div
                className="p-6 rounded-lg border text-center space-y-2"
                style={{
                  backgroundColor: 'rgba(243, 198, 79, 0.1)',
                  borderColor: `${gold}60`,
                }}
              >
                <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: gold }} />
                <h4 className="text-sm font-bold" style={{ color: gold }}>
                  تم تسجيل الرد بنجاح!
                </h4>
                <p className="text-xs text-[#EDEDF2]">
                  شكراً جزيلاً، يسعدنا ويشرفنا حضوركم في هذه الأمسية الاستثنائية.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRsvp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('attending')}
                    className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'attending' ? 'shadow-md' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'attending' ? gold : '#0E0E11',
                      color: status === 'attending' ? '#08080A' : '#8D8C96',
                      borderColor: status === 'attending' ? brightGold : '#28272E',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>يشرفني الحضور</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                      status === 'declined' ? 'shadow-md' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: status === 'declined' ? '#222026' : '#0E0E11',
                      color: status === 'declined' ? '#EDEDF2' : '#8D8C96',
                      borderColor: status === 'declined' ? '#6E6669' : '#28272E',
                    }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>أعتذر بكل محبة</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#EDEDF2] mb-1">
                    الاسم الكريم <span className="text-[#B42318]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="مثال: ذ. عبد الكريم بنجلون"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border outline-none bg-[#08080A] border-[#28272E] text-[#EDEDF2] focus:border-[#F3C64F]"
                    />
                    <User className="w-4 h-4 absolute left-3 top-3 text-[#706E7A] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#EDEDF2] mb-1">
                    رقم الهاتف <span className="text-[10px] text-[#8D8C96] font-normal">(اختياري)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0661234567"
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border font-mono outline-none bg-[#08080A] border-[#28272E] text-[#EDEDF2] focus:border-[#F3C64F]"
                    />
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-[#706E7A] pointer-events-none" />
                  </div>
                </div>

                {status === 'attending' && (
                  <div>
                    <label className="block text-xs font-bold text-[#EDEDF2] mb-1">
                      عدد المقاعد المرجوة
                    </label>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border bg-[#08080A] border-[#28272E]">
                      <span className="text-xs text-[#8D8C96] flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#F3C64F]" />
                        <span>مجموع الحاضرين معكم:</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                          className="w-7 h-7 rounded-md border bg-[#151518] border-[#28272E] text-xs font-bold hover:bg-[#202025] transition cursor-pointer text-white"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-sm w-4 text-center text-[#F3C64F]">
                          {partySize}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                          className="w-7 h-7 rounded-md border bg-[#151518] border-[#28272E] text-xs font-bold hover:bg-[#202025] transition cursor-pointer text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#EDEDF2] mb-1">
                    تهنئة أو كلمة لأصحاب المناسبة <span className="text-[10px] text-[#8D8C96] font-normal">(اختياري)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={wishes}
                    onChange={(e) => setWishes(e.target.value)}
                    placeholder="ألف مبروك وبالرفاه والبنين ودامت دياركم عامرة بالأفراح..."
                    className="w-full text-xs p-3 rounded-lg border outline-none bg-[#08080A] border-[#28272E] text-[#EDEDF2] focus:border-[#F3C64F]"
                  />
                </div>

                {errorMsg && <p className="text-xs text-[#FF6B6B] text-center">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-lg hover:brightness-110 cursor-pointer flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: gold,
                    color: '#08080A',
                    boxShadow: `0 4px 20px rgba(243, 198, 79, 0.4)`,
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
