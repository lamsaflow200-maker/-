/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, Send, Sparkles, Share2 } from 'lucide-react';

export const ClassicEleganceTemplate: React.FC<InvitationTemplateProps> = ({
  invitation,
  isPreview = false,
  onRsvpSubmit,
  onTrackAction,
}) => {
  const { content, theme, settings } = invitation;

  const primary = theme?.primary_color || '#5A1020';
  const gold = theme?.accent_color || '#C9A45C';
  const bg = theme?.background_color || '#FAF7F2';
  const textColor = theme?.text_color || '#171316';

  // RSVP Form state
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'declined'>('attending');
  const [partySize, setPartySize] = useState(1);
  const [wishes, setWishes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setIsSubmitting(true);
    try {
      if (onRsvpSubmit) {
        const ok = await onRsvpSubmit({
          guestName,
          phone,
          attendanceStatus: status,
          partySize: status === 'attending' ? partySize : 0,
          notesOrWishes: wishes,
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

  const handleShare = () => {
    onTrackAction?.('share_click');
    if (navigator.share) {
      navigator
        .share({
          title: invitation.title,
          text: content.invitationText,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2500);
    }
  };

  const handleOpenMap = () => {
    onTrackAction?.('map_click');
    if (content.googleMapsUrl) {
      window.open(content.googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 relative overflow-x-hidden select-none"
      style={{
        backgroundColor: bg,
        color: textColor,
        fontFamily: theme?.font_family_arabic || 'Amiri, Georgia, serif',
      }}
    >
      {/* Background Subtle Ambiance */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: gold }}
        />
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: primary }}
        />
      </div>

      {/* Main Invitation Container (Mobile-first card) */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center motion-fade-in">
        {/* Subtle Luxury Frame Card */}
        <div className="w-full rounded-2xl border border-[#E8DED8] bg-[#FFFFFF] p-6 sm:p-9 shadow-md relative overflow-hidden text-right">
          {/* Top Corner Filigree Accents */}
          <div
            className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 pointer-events-none opacity-60"
            style={{ borderColor: gold }}
          />
          <div
            className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 pointer-events-none opacity-60"
            style={{ borderColor: gold }}
          />
          <div
            className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 pointer-events-none opacity-60"
            style={{ borderColor: gold }}
          />
          <div
            className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 pointer-events-none opacity-60"
            style={{ borderColor: gold }}
          />

          {/* Basmala / Top Emblem */}
          <div className="flex flex-col items-center mb-6 text-center">
            <span
              className="text-xs sm:text-sm tracking-widest font-serif"
              style={{ color: gold }}
            >
              بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
            </span>
            <div
              className="w-16 h-px mt-2 opacity-50"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${gold} 50%, transparent 100%)`,
              }}
            />
          </div>

          {/* Host Names / Intro */}
          {content.hostNames && (
            <p className="text-xs sm:text-sm font-medium mb-2.5 text-center leading-relaxed text-[#6F6668]">
              {content.hostNames}
            </p>
          )}

          {/* Event Title */}
          <h2
            className="text-[11px] uppercase tracking-widest mb-3 font-mono text-center font-semibold"
            style={{ color: gold }}
          >
            {content.eventTitle || 'دعوة كريمة'}
          </h2>

          {/* Celebrant Names (The centerpiece) */}
          <div
            className="my-5 py-3 border-y text-center"
            style={{ borderColor: `${gold}40` }}
          >
            <h1
              className="text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-relaxed"
              style={{ color: primary }}
            >
              {content.celebrantNames}
            </h1>
          </div>

          {/* Invitation Wording / Text */}
          <p className="text-xs sm:text-sm leading-relaxed text-[#6F6668] mb-7 max-w-sm mx-auto text-center font-normal">
            {content.invitationText}
          </p>

          {/* Event Key Details Box */}
          <div className="w-full bg-[#FAF7F2] rounded-xl border border-[#E8DED8] p-4 mb-6 space-y-3.5 text-right">
            {/* Date */}
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] shrink-0 mt-0.5"
                style={{ color: gold }}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#6F6668]">التاريخ والموعد</p>
                <p className="text-xs sm:text-sm font-semibold text-[#171316] font-mono">
                  {content.dateIso}
                </p>
                {content.hijriDate && (
                  <p className="text-[11px] text-[#6F6668]">{content.hijriDate}</p>
                )}
              </div>
            </div>

            {/* Time */}
            {content.timeText && (
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] shrink-0 mt-0.5"
                  style={{ color: gold }}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6F6668]">الوقت</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#171316]">
                    {content.timeText}
                  </p>
                </div>
              </div>
            )}

            {/* Venue & Location */}
            <div className="flex items-start gap-3">
              <div
                className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] shrink-0 mt-0.5"
                style={{ color: gold }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-[#6F6668]">المكان والموقع</p>
                <p className="text-xs sm:text-sm font-semibold text-[#171316]">
                  {content.venueName}
                </p>
                <p className="text-[11px] text-[#6F6668]">
                  {content.venueCity} {content.venueAddress ? `— ${content.venueAddress}` : ''}
                </p>
              </div>
            </div>

            {/* Dress code */}
            {content.dressCode && (
              <div className="flex items-start gap-3">
                <div
                  className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E8DED8] shrink-0 mt-0.5"
                  style={{ color: gold }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-[#6F6668]">الزي المقترح</p>
                  <p className="text-xs text-[#171316]">{content.dressCode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions (Map & Share) */}
          <div className="grid grid-cols-2 gap-2.5 mb-7 w-full">
            {content.googleMapsUrl && (
              <button
                type="button"
                onClick={handleOpenMap}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#171316] text-xs font-medium border border-[#E8DED8] transition cursor-pointer shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: gold }} />
                <span>خريطة الموقع</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF7F2] text-[#171316] text-xs font-medium border border-[#E8DED8] transition cursor-pointer shadow-xs ${
                !content.googleMapsUrl ? 'col-span-2' : ''
              }`}
            >
              <Share2 className="w-3.5 h-3.5" style={{ color: gold }} />
              <span>{shareFeedback ? 'تم نسخ الرابط!' : 'مشاركة الدعوة'}</span>
            </button>
          </div>

          {/* RSVP Section */}
          {settings.allowRsvp && (
            <div
              className="w-full pt-6 border-t text-right"
              style={{ borderColor: '#E8DED8' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-sm sm:text-base font-serif font-bold"
                  style={{ color: primary }}
                >
                  تأكيد الحضور (RSVP)
                </h3>
                {settings.rsvpDeadline && (
                  <span className="text-[10px] text-[#6F6668] font-mono">
                    آخر أجل: {settings.rsvpDeadline}
                  </span>
                )}
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#BFE4C6] text-center space-y-1.5">
                  <CheckCircle2 className="w-7 h-7 text-[#218739] mx-auto" />
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-[#175E27]">
                    تم استلام تأكيدكم بنجاح
                  </h4>
                  <p className="text-xs text-[#218739]">
                    يسعدنا حضوركم ونتطلع لمشاركتكم هذه المناسبة الغالية!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRsvp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#171316] mb-1">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="اكتب اسمكم الكريم"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020] focus:ring-1 focus:ring-[#C9A45C]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#171316] mb-1">
                      رقم الهاتف (اختياري)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06XXXXXXXX"
                      dir="ltr"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020] focus:ring-1 focus:ring-[#C9A45C]/30 text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#171316] mb-1">
                      هل ستشرفوننا بالحضور؟
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus('attending')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          status === 'attending'
                            ? 'bg-[#F6ECF0] border-[#5A1020] text-[#5A1020] font-semibold'
                            : 'bg-[#FAF7F2] border-[#E8DED8] text-[#6F6668]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>نعم، سأحضر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('declined')}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          status === 'declined'
                            ? 'bg-[#FEECEB] border-[#B42318] text-[#B42318] font-semibold'
                            : 'bg-[#FAF7F2] border-[#E8DED8] text-[#6F6668]'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>أعتذر عن الحضور</span>
                      </button>
                    </div>
                  </div>

                  {status === 'attending' && (
                    <div>
                      <label className="block text-xs font-medium text-[#171316] mb-1">
                        عدد المرافقين
                      </label>
                      <select
                        value={partySize}
                        onChange={(e) => setPartySize(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020]"
                      >
                        <option value={1}>1 (شخص واحد)</option>
                        <option value={2}>2 (شخصان)</option>
                        <option value={3}>3 (ثلاثة أشخاص)</option>
                        <option value={4}>4 (أربعة أشخاص)</option>
                      </select>
                    </div>
                  )}

                  {settings.enableGuestMessages && (
                    <div>
                      <label className="block text-xs font-medium text-[#171316] mb-1">
                        تهنئة أو كلمة لأصحاب الحفل
                      </label>
                      <textarea
                        rows={2}
                        value={wishes}
                        onChange={(e) => setWishes(e.target.value)}
                        placeholder="أطيب التهاني والتبريكات..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020] resize-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || isPreview}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#5A1020] hover:bg-[#460C18] text-[#FAF7F2] font-medium text-xs shadow-sm transition disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال تأكيد الحضور'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer branding */}
          <div className="mt-8 pt-4 border-t border-[#E8DED8] flex flex-col items-center justify-center text-center">
            <p className="text-[11px] text-[#6F6668] flex items-center gap-1 font-sans">
              تم إنشاء هذه الدعوة عبر
              <span className="text-[#5A1020] font-semibold">منسباتي — Mnasbati</span>
            </p>
            <p className="text-[10px] text-[#9A8F92] mt-0.5">دعوتك... بأسلوب يليق بمناسبتك</p>
          </div>
        </div>
      </div>
    </div>
  );
};
