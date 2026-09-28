/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvitationTemplateProps } from '../types/engine';
import { MapPin, CheckCircle2, XCircle, Share2, Sparkles } from 'lucide-react';

export const RoyalMinimalistTemplate: React.FC<InvitationTemplateProps> = ({
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

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'attending' | 'declined'>('attending');
  const [partySize, setPartySize] = useState(1);
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

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start py-10 px-4 sm:px-6 relative select-none"
      style={{
        backgroundColor: bg,
        color: textColor,
        fontFamily: theme?.font_family_arabic || 'Amiri, serif',
      }}
    >
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center motion-fade-in">
        {/* Sleek Minimalist Luxury Card */}
        <div className="w-full rounded-2xl border border-[#E8DED8] bg-[#FFFFFF] p-7 sm:p-9 shadow-sm text-right">
          <div
            className="w-9 h-9 mx-auto mb-6 rounded-xl border border-[#E8DED8] bg-[#FAF7F2] flex items-center justify-center text-xs"
            style={{ color: gold }}
          >
            <Sparkles className="w-4 h-4" />
          </div>

          {content.hostNames && (
            <p
              className="text-xs uppercase tracking-widest font-semibold mb-2 text-center"
              style={{ color: primary }}
            >
              {content.hostNames}
            </p>
          )}

          <h2 className="text-[11px] text-[#6F6668] mb-5 font-mono text-center">
            {content.eventTitle || 'دعوة كريمة'}
          </h2>

          <h1
            className="text-3xl sm:text-4xl font-serif font-bold mb-6 leading-tight text-center"
            style={{ color: primary }}
          >
            {content.celebrantNames}
          </h1>

          <p className="text-xs sm:text-sm text-[#6F6668] leading-relaxed font-normal mb-8 max-w-xs mx-auto text-center">
            {content.invitationText}
          </p>

          {/* Details Bar */}
          <div className="grid grid-cols-2 gap-3 py-4 border-y border-[#E8DED8] mb-6 text-right">
            <div>
              <span className="text-[10px] text-[#9A8F92] block">الموعد</span>
              <span className="text-xs font-semibold text-[#171316] font-mono">
                {content.dateIso}
              </span>
              {content.timeText && (
                <span className="text-[11px] text-[#6F6668] block">{content.timeText}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] text-[#9A8F92] block">المكان</span>
              <span className="text-xs font-semibold text-[#171316]">{content.venueName}</span>
              <span className="text-[11px] text-[#6F6668] block">{content.venueCity}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {content.googleMapsUrl && (
              <button
                type="button"
                onClick={() => {
                  onTrackAction?.('map_click');
                  window.open(content.googleMapsUrl, '_blank', 'noopener,noreferrer');
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#FAF7F2] hover:bg-[#F4ECE4] text-[#171316] text-xs font-medium border border-[#E8DED8] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: gold }} />
                <span>الموقع على الخريطة</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="py-2 px-3 rounded-lg bg-[#FAF7F2] hover:bg-[#F4ECE4] text-[#171316] text-xs font-medium border border-[#E8DED8] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" style={{ color: gold }} />
              <span>{shareFeedback ? 'تم النسخ' : 'مشاركة'}</span>
            </button>
          </div>

          {/* RSVP */}
          {settings.allowRsvp && (
            <div className="pt-6 border-t border-[#E8DED8] text-right">
              <h3
                className="text-sm font-serif font-bold mb-4"
                style={{ color: primary }}
              >
                تأكيد الحضور
              </h3>

              {submitted ? (
                <div className="p-3.5 rounded-xl bg-[#EDF7EE] border border-[#BFE4C6] text-center">
                  <CheckCircle2 className="w-6 h-6 text-[#218739] mx-auto mb-1.5" />
                  <p className="text-xs text-[#175E27] font-medium">نشكركم على تأكيد حضوركم</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRsvp} className="space-y-3">
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="اسم الضيف الكريم *"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020]"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="رقم الهاتف"
                    dir="ltr"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF7F2] border border-[#E8DED8] text-[#171316] focus:outline-none focus:border-[#5A1020] text-right"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('attending')}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-1 cursor-pointer ${
                        status === 'attending'
                          ? 'bg-[#F6ECF0] border-[#5A1020] text-[#5A1020] font-semibold'
                          : 'bg-[#FAF7F2] border-[#E8DED8] text-[#6F6668]'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>سأحضر</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('declined')}
                      className={`py-2 px-2 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-1 cursor-pointer ${
                        status === 'declined'
                          ? 'bg-[#FEECEB] border-[#B42318] text-[#B42318] font-semibold'
                          : 'bg-[#FAF7F2] border-[#E8DED8] text-[#6F6668]'
                      }`}
                    >
                      <XCircle className="w-3 h-3" />
                      <span>أعتذر</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isPreview}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#5A1020] hover:bg-[#460C18] text-[#FAF7F2] font-medium text-xs shadow-xs transition disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الحضور'}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-[#E8DED8] text-center">
            <p className="text-[10px] text-[#6F6668]">
              منسباتي — Mnasbati | دعوتك... بأسلوب يليق بمناسبتك
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
