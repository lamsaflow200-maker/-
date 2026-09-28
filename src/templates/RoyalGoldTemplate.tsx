/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, Send, Crown, Sparkles, Navigation, ExternalLink, Heart, Users, User, Phone } from 'lucide-react';
import { ROYAL_GOLD_CONFIG } from './configs';
import { TemplateCornerAccents, TemplateSectionDivider } from '../engine/decorations/TemplateDecorations';
import { CountdownSection } from '../engine/sections/CountdownSection';
import { InvitationRSVP } from '../engine/rsvp/InvitationRSVP';
import {
  SectionReveal,
  TextReveal,
  ImageReveal,
  StaggerContainer,
  StaggerItem,
  InteractiveButton,
  InteractiveCard,
} from '../engine/animation';

export const RoyalGoldTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings, eventType } = invitation;

  // Royal Gold Palette
  const gold = theme?.accent_color || ROYAL_GOLD_CONFIG.colors.primary;
  const darkGold = ROYAL_GOLD_CONFIG.colors.secondary;
  const bg = theme?.background_color || ROYAL_GOLD_CONFIG.colors.background;
  const cardBg = ROYAL_GOLD_CONFIG.colors.surface;
  const textColor = theme?.text_color || ROYAL_GOLD_CONFIG.colors.text;

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
    wedding: 'حفل الزفاف الملكي المبارك',
    engagement: 'حفل الخطوبة السعيد الفاخر',
    aqiqah: 'حفل العقيقة المباركة',
    graduation: 'حفل التخرج والتكريم البهيج',
    birthday: 'حفل ذكرى الميلاد',
    anniversary: 'الاحتفال بذكرى سعيدة',
    family_event: 'لقاء عائلي ملكي بهيج',
    private_event: 'مناسبة خاصة فاخرة',
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

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative transition-colors duration-500 font-serif antialiased text-[#F5F5F7] select-none"
      style={{
        backgroundColor: bg,
        backgroundImage: ROYAL_GOLD_CONFIG.backgrounds.primaryGradient,
      }}
    >
      {/* 24K Top Gold Accent Border */}
      <div
        className="w-full h-1.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${gold}, ${darkGold}, ${gold}, transparent)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-14 space-y-8 relative z-10">
        {/* ===================== HERO SECTION: ROYAL GOLD ===================== */}
        <SectionReveal immediate={true} duration={750}>
          <section className="relative p-6 sm:p-12 rounded-3xl border-2 text-center space-y-6 overflow-hidden shadow-2xl"
            style={{
              borderColor: `${gold}60`,
              backgroundColor: `${cardBg}E6`,
              boxShadow: `0 16px 48px -8px rgba(0, 0, 0, 0.9), 0 0 30px ${gold}20`,
            }}
          >
            {/* Royal Corner Accents */}
            <TemplateCornerAccents color={gold} size={28} style="royal" />

            {/* Royal Crest Monogram */}
            <div className="flex flex-col items-center justify-center space-y-2 select-none">
              <div
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                style={{
                  borderColor: gold,
                  backgroundColor: `${gold}18`,
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
            <TextReveal variant="fade" delay={100} duration={600}>
              <p className="text-xs sm:text-sm tracking-widest opacity-90" style={{ color: gold }}>
                بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
              </p>
            </TextReveal>

            {/* Host Families Announcement */}
            {content.hostNames && (
              <TextReveal variant="slide-up" delay={180}>
                <p className="text-xs sm:text-sm text-[#E8DED8] leading-relaxed px-4">
                  تتشرف {content.hostNames} بدعوتكم
                </p>
              </TextReveal>
            )}

            {/* Event Badge */}
            <div className="inline-block">
              <span
                className="text-xs font-bold px-5 py-1.5 rounded-full border shadow-sm"
                style={{
                  borderColor: `${gold}70`,
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: gold,
                }}
              >
                {eventTypeLabel}
              </span>
            </div>

            {/* Framed Celebrants Image (Double Gold Hairline) */}
            {invitation.coverImageUrl && (
              <div
                className="max-w-[230px] mx-auto overflow-hidden rounded-2xl border-2 p-1.5 shadow-2xl transition-transform hover:scale-[1.02]"
                style={{
                  borderColor: gold,
                  backgroundColor: '#0E0E11',
                  boxShadow: `0 0 30px ${gold}30, 0 0 0 1px ${gold}40`,
                }}
              >
                <ImageReveal
                  src={invitation.coverImageUrl}
                  alt={invitation.title}
                  variant="scale"
                  duration={900}
                  aspectRatio="aspect-3/4"
                  imageClassName="rounded-xl"
                />
              </div>
            )}

            {/* Celebrants Typography */}
            <div className="py-2 space-y-2">
              {content.firstCelebrantName && content.secondCelebrantName ? (
                <div>
                  <TextReveal variant="mask" delay={250}>
                    <h1
                      className="text-3xl sm:text-5xl font-bold tracking-wide"
                      style={{
                        color: gold,
                        textShadow: `0 0 30px ${gold}40`,
                      }}
                    >
                      {content.firstCelebrantName}
                    </h1>
                  </TextReveal>
                  <div className="flex items-center justify-center gap-3 py-2">
                    <div className="h-px w-14" style={{ background: `linear-gradient(90deg, transparent, ${gold})` }} />
                    <span className="italic text-2xl" style={{ color: darkGold }}>&</span>
                    <div className="h-px w-14" style={{ background: `linear-gradient(90deg, ${gold}, transparent)` }} />
                  </div>
                  <TextReveal variant="mask" delay={320}>
                    <h1
                      className="text-3xl sm:text-5xl font-bold tracking-wide"
                      style={{
                        color: gold,
                        textShadow: `0 0 30px ${gold}40`,
                      }}
                    >
                      {content.secondCelebrantName}
                    </h1>
                  </TextReveal>
                </div>
              ) : (
                <TextReveal variant="mask" delay={250}>
                  <h1
                    className="text-3xl sm:text-5xl font-bold tracking-wide"
                    style={{
                      color: gold,
                      textShadow: `0 0 30px ${gold}40`,
                    }}
                  >
                    {content.celebrantNames || invitation.title}
                  </h1>
                </TextReveal>
              )}
            </div>

            {content.eventTitle && content.eventTitle !== invitation.title && (
              <p className="text-xs sm:text-sm italic text-[#D4D0D2] max-w-md mx-auto">
                {content.eventTitle}
              </p>
            )}

            <TemplateSectionDivider config={ROYAL_GOLD_CONFIG} accentColor={gold} />
          </section>
        </SectionReveal>

        {/* ===================== STORY / GREETING SECTION ===================== */}
        {content.invitationText && (
          <SectionReveal delay={60}>
            <section
              className="relative p-6 sm:p-10 rounded-2xl border-2 text-center space-y-4 shadow-xl"
              style={{
                borderColor: `${gold}40`,
                backgroundColor: `${cardBg}CC`,
              }}
            >
              <TemplateCornerAccents color={gold} size={20} style="royal" />
              <div
                className="w-10 h-10 rounded-full border mx-auto flex items-center justify-center"
                style={{
                  borderColor: gold,
                  backgroundColor: `${gold}15`,
                  color: gold,
                }}
              >
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: gold }}>
                فرحتنا تكتمل بوجودكم
              </h3>
              <p className="text-xs sm:text-sm text-[#EDEDF2] leading-loose whitespace-pre-wrap px-4">
                {content.invitationText}
              </p>
              {content.dressCode && (
                <div className="pt-3 border-t text-xs flex items-center justify-center gap-2" style={{ borderColor: `${gold}30`, color: darkGold }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="font-bold">قواعد اللباس: </span>
                  <span>{content.dressCode}</span>
                </div>
              )}
            </section>
          </SectionReveal>
        )}

        {/* ===================== DATE & TIME SECTION ===================== */}
        {(dateValue || timeValue) && (
          <SectionReveal delay={80}>
            <section
              className="relative p-6 sm:p-8 rounded-2xl border-2 text-center space-y-6 shadow-xl"
              style={{
                borderColor: `${gold}40`,
                backgroundColor: `${cardBg}CC`,
              }}
            >
              <TemplateCornerAccents color={gold} size={20} style="royal" />
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                  موعد المناسبة الملكية
                </span>
                <h3 className="text-lg font-bold" style={{ color: gold }}>
                  الزمان والموعد
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dateValue && (
                  <InteractiveCard
                    elevation={4}
                    className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                    style={{
                      backgroundColor: '#121216',
                      borderColor: `${gold}30`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                      style={{ borderColor: gold, color: gold, backgroundColor: `${gold}18` }}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-[#A19EA8]">التاريخ الميلادي</span>
                    <p className="text-sm font-bold" style={{ color: textColor }}>
                      {formattedArabicDate}
                    </p>
                    {content.hijriDate && (
                      <span className="text-[11px]" style={{ color: darkGold }}>
                        {content.hijriDate}
                      </span>
                    )}
                  </InteractiveCard>
                )}

                {timeValue && (
                  <InteractiveCard
                    elevation={4}
                    className="p-4 rounded-xl border flex flex-col items-center justify-center space-y-2"
                    style={{
                      backgroundColor: '#121216',
                      borderColor: `${gold}30`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border flex items-center justify-center mb-1"
                      style={{ borderColor: gold, color: gold, backgroundColor: `${gold}18` }}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] text-[#A19EA8]">توقيت الحفل</span>
                    <p className="text-sm font-bold" style={{ color: textColor }}>
                      {timeValue}
                    </p>
                    <span className="text-[10px] text-[#8D8C96] font-mono">
                      {invitation.timezone || 'Africa/Casablanca (GMT+1)'}
                    </span>
                  </InteractiveCard>
                )}
              </div>
            </section>
          </SectionReveal>
        )}

        {/* ===================== COUNTDOWN SECTION ===================== */}
        {settings.enableCountdown !== false && (dateValue || invitation.eventDate) && (
          <SectionReveal delay={90}>
            <CountdownSection
              invitation={invitation}
              style={{
                cardBg: '#0E0E12',
                borderColor: '#D4AF37',
                accentColor: '#D4AF37',
                primaryColor: '#D4AF37',
                textColor: '#F5F5F7',
                backgroundColor: '#0E0E11',
                cardRadius: '1rem',
              }}
              config={ROYAL_GOLD_CONFIG}
            />
          </SectionReveal>
        )}

        {/* ===================== VENUE & MAP SECTION ===================== */}
        {(content.venueName || invitation.venueName || content.googleMapsUrl || invitation.googleMapsUrl) && (
          <SectionReveal delay={100}>
            <section
              className="relative p-6 sm:p-8 rounded-2xl border-2 text-center space-y-5 shadow-xl"
              style={{
                borderColor: `${gold}40`,
                backgroundColor: `${cardBg}CC`,
              }}
            >
              <TemplateCornerAccents color={gold} size={20} style="royal" />
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                  مكان الاستقبال الملكي
                </span>
                <h3 className="text-lg font-bold" style={{ color: gold }}>
                  القاعة وموقع الحفل
                </h3>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {content.venueName || invitation.venueName}
                </h4>
                {(content.venueCity || content.venueAddress || invitation.venueAddress) && (
                  <p className="text-xs sm:text-sm text-[#A19EA8] max-w-md mx-auto flex items-center justify-center gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: gold }} />
                    <span>
                      {content.venueCity ? `${content.venueCity} — ` : ''}
                      {content.venueAddress || invitation.venueAddress}
                    </span>
                  </p>
                )}
              </div>

              {/* Gold Outlined / Filled Map Button with Glow */}
              {(content.googleMapsUrl || invitation.googleMapsUrl) && (
                <div className="pt-2">
                  <a
                    href={content.googleMapsUrl || invitation.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onTrackAction?.('map_click')}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition duration-300 shadow-lg hover:shadow-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: gold,
                      color: '#0E0E11',
                      boxShadow: `0 4px 20px ${gold}40`,
                    }}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>📍 الوصول إلى مكان الحفل عبر Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              )}
            </section>
          </SectionReveal>
        )}

        {/* ===================== RSVP ROYAL PANEL ===================== */}
        {settings.allowRsvp && (
          <SectionReveal delay={120}>
            <section
              className="relative p-6 sm:p-8 rounded-2xl border-2 text-right space-y-6 shadow-2xl"
              style={{
                borderColor: `${gold}50`,
                backgroundColor: `${cardBg}F2`,
                boxShadow: `0 12px 40px rgba(0,0,0,0.8), 0 0 25px ${gold}20`,
              }}
            >
              <TemplateCornerAccents color={gold} size={20} style="royal" />

              <div className="text-center space-y-1">
                <span className="text-[11px] font-mono tracking-widest uppercase block" style={{ color: gold }}>
                  تأكيد الحضور الملكي
                </span>
                <h3 className="text-lg font-bold" style={{ color: gold }}>
                  يسعدنا ويشرفنا حضوركم
                </h3>
                <p className="text-xs text-[#A19EA8]">
                  يرجى تأكيد الحضور لتنظيم استقبالكم بما يليق بمقامكم الكريم
                </p>
              </div>

              {submitted ? (
                <div
                  className="p-6 rounded-xl border text-center space-y-2"
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    borderColor: `${gold}60`,
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: gold }} />
                  <h4 className="text-sm font-bold" style={{ color: gold }}>
                    تم تسجيل تشريفكم بنجاح!
                  </h4>
                  <p className="text-xs text-[#E8DED8]">
                    شكراً جزيلاً، نتطلع بشوق لمشاركتكم هذا اليوم الملكي البهيج.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRsvp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setStatus('attending')}
                      className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                        status === 'attending' ? 'shadow-lg' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: status === 'attending' ? gold : '#141418',
                        color: status === 'attending' ? '#0E0E11' : '#A19EA8',
                        borderColor: status === 'attending' ? darkGold : '#28272E',
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>يشرفني الحضور</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('declined')}
                      className={`p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
                        status === 'declined' ? 'shadow-lg' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor: status === 'declined' ? '#242129' : '#141418',
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
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border outline-none bg-[#121216] border-[#3A3222] text-[#F5F5F7] focus:border-[#D4AF37]"
                      />
                      <User className="w-4 h-4 absolute left-3 top-3 text-[#8D8C96] pointer-events-none" />
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
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border font-mono outline-none bg-[#121216] border-[#3A3222] text-[#F5F5F7] focus:border-[#D4AF37]"
                      />
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-[#8D8C96] pointer-events-none" />
                    </div>
                  </div>

                  {status === 'attending' && (
                    <div>
                      <label className="block text-xs font-bold text-[#EDEDF2] mb-1">
                        عدد المقاعد المرجوة
                      </label>
                      <div className="flex items-center justify-between p-2.5 rounded-lg border bg-[#121216] border-[#3A3222]">
                        <span className="text-xs text-[#A19EA8] flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#D4AF37]" />
                          <span>مجموع الحاضرين معكم:</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                            className="w-7 h-7 rounded-lg border bg-[#1A1A22] border-[#3A3222] text-xs font-bold hover:bg-[#252530] transition cursor-pointer text-white"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-sm w-4 text-center text-[#D4AF37]">
                            {partySize}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPartySize((p) => Math.min(settings.maxPartySize || 4, p + 1))}
                            className="w-7 h-7 rounded-lg border bg-[#1A1A22] border-[#3A3222] text-xs font-bold hover:bg-[#252530] transition cursor-pointer text-white"
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
                      placeholder="ألف مبروك بالرفاه والبنين ودامت دياركم عامرة بالأفراح..."
                      className="w-full text-xs p-3 rounded-lg border outline-none bg-[#121216] border-[#3A3222] text-[#F5F5F7] focus:border-[#D4AF37]"
                    />
                  </div>

                  {errorMsg && <p className="text-xs text-[#FF6B6B] text-center">{errorMsg}</p>}

                  <InteractiveButton
                    type="submit"
                    disabled={isSubmitting}
                    glow
                    accentColor={gold}
                    className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: gold,
                      color: '#0E0E11',
                      boxShadow: `0 4px 20px ${gold}40`,
                    }}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'جاري تسجيل الرد...' : 'إرسال تأكيد الحضور'}</span>
                  </InteractiveButton>
                </form>
              )}
            </section>
          </SectionReveal>
        )}
      </div>
    </div>
  );
};
