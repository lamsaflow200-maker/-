/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { buildWhatsAppShareUrl } from '../../utils/phone';
import {
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  MessageSquare,
  X,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

export interface InvitationShareProps {
  slug: string;
  title: string;
  celebrantNames?: string;
  hostNames?: string;
  shortText?: string;
  position?: 'bottom' | 'floating' | 'inline' | 'hero' | 'contact';
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: string;
  onTrackAction?: (actionName: string) => void;
  className?: string;
}

/**
 * Public Invitation Share System: InvitationShare
 *
 * CRITICAL REQUIREMENTS (Prompt 17 Requirements 19 - 30):
 * 1. Shares public canonical link: `/i/:slug`.
 * 2. Uses Native Web Share API (`navigator.share`) on supporting devices.
 * 3. Fallback options when Web Share API is unavailable or user opens sheet:
 *    - WhatsApp Share (official share URL, distinct from host_whatsapp!)
 *    - Facebook Messenger
 *    - Telegram
 *    - SMS
 *    - Copy Link
 * 4. Copy Link feedback: "تم نسخ رابط الدعوة" with visual checkmark and textarea fallback.
 * 5. Dynamic share text without leaking private guest list or internal notes.
 * 6. Triggers share event foundation:
 *    `share_open`, `share_whatsapp`, `share_messenger`, `share_telegram`, `share_sms`, `copy_link`, `native_share`.
 * 7. QR compatibility ready for Prompt 18.
 */
export const InvitationShare: React.FC<InvitationShareProps> = ({
  slug,
  title,
  celebrantNames,
  hostNames,
  shortText,
  position = 'bottom',
  primaryColor = '#5A1020',
  accentColor = '#C9A45C',
  borderRadius = '14px',
  onTrackAction,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Canonical public invitation URL
  const invitationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/i/${slug}`
      : `https://mnasbati.ma/i/${slug}`;

  // Dynamic share text (no private guest details)
  const dynamicShareText = [
    `دعوة خاصة لمناسبة مميزة ✨`,
    celebrantNames ? `يسعدنا دعوتكم لمشاركتنا فرحتنا بمناسبة ${title || celebrantNames} ❤️` : `يسعدنا دعوتكم لحضور: ${title} ❤️`,
    shortText ? `"${shortText.slice(0, 100)}..."` : null,
    `تفضلوا بمشاهدة بطاقة الدعوة الإلكترونية عبر الرابط:`,
  ]
    .filter(Boolean)
    .join('\n');

  // Full text with URL included
  const fullShareTextWithUrl = `${dynamicShareText}\n\n${invitationUrl}`;

  // Track helper
  const track = (action: string) => {
    try {
      onTrackAction?.(action);
    } catch {
      // safe
    }
  };

  // 1. Copy Link Action with robust fallback
  const handleCopyLink = async () => {
    track('copy_link');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(invitationUrl);
        setCopied(true);
      } else {
        // Fallback for older browsers or restricted iframe environments
        const textArea = document.createElement('textarea');
        textArea.value = invitationUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
      }
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
      // Even if direct copy fails, select prompt
      window.prompt('انسخ رابط الدعوة من هنا:', invitationUrl);
    }

    setTimeout(() => setCopied(false), 2800);
  };

  // 2. Primary Trigger (Native Share or Fallback Modal)
  const handleShareTrigger = async () => {
    track('share_open');

    // If mobile browser supports navigator.share, attempt native share first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        track('native_share');
        await navigator.share({
          title: `دعوة: ${title}`,
          text: dynamicShareText,
          url: invitationUrl,
        });
        return; // Successfully shared natively
      } catch (err: any) {
        // If user cancelled, don't force open sheet unless abort was due to error
        if (err?.name === 'AbortError') return;
      }
    }

    // Open fallback share modal
    setIsOpen(true);
  };

  // Official share URL builders (Requirement 23: official WhatsApp Share, not host_whatsapp!)
  const whatsappShareUrl = buildWhatsAppShareUrl(dynamicShareText, invitationUrl);
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationUrl)}&text=${encodeURIComponent(dynamicShareText)}`;
  const messengerShareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(invitationUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(invitationUrl)}`;
  const smsShareUrl = `sms:?body=${encodeURIComponent(fullShareTextWithUrl)}`;

  // Floating Button Trigger Variant
  if (position === 'floating') {
    return (
      <>
        <aside
          aria-label="مشاركة الدعوة"
          dir="rtl"
          className="fixed bottom-6 left-4 z-40 select-none motion-fade-in print:hidden"
        >
          <button
            type="button"
            onClick={handleShareTrigger}
            title="مشاركة رابط الدعوة"
            className="flex items-center gap-2 bg-[#5A1020] hover:bg-[#721529] text-[#FAF7F2] px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer font-serif text-xs font-bold border border-[#C9A45C]/40 backdrop-blur-xs"
            style={{
              boxShadow: '0 8px 24px -4px rgba(90, 16, 32, 0.4)',
            }}
          >
            <Share2 className="w-4 h-4 text-[#C9A45C]" />
            <span>مشاركة الدعوة</span>
          </button>
        </aside>

        {isOpen && renderShareModal()}
      </>
    );
  }

  // Hero / Inline Button Trigger Variant
  if (position === 'hero' || position === 'inline') {
    return (
      <div dir="rtl" className={`inline-block select-none ${className}`}>
        <button
          type="button"
          onClick={handleShareTrigger}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs hover:shadow-sm cursor-pointer border"
          style={{
            borderColor: `${accentColor}60`,
            backgroundColor: `${primaryColor}15`,
            color: primaryColor,
            borderRadius,
          }}
        >
          <Share2 className="w-3.5 h-3.5 text-[#C9A45C]" />
          <span>مشاركة الدعوة</span>
        </button>

        {isOpen && renderShareModal()}
      </div>
    );
  }

  // Default: Bottom Card / Bar Variant
  return (
    <div dir="rtl" className={`w-full max-w-xl mx-auto px-4 py-3 select-none motion-fade-in ${className}`}>
      <div
        className="p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-xs backdrop-blur-xs"
        style={{
          borderColor: `${accentColor}40`,
          backgroundColor: '#FAF7F2',
          borderRadius,
        }}
      >
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-serif font-bold text-[#171316] flex items-center justify-center sm:justify-start gap-1.5">
            <Share2 className="w-4 h-4 text-[#C9A45C]" />
            <span>مشاركة بطاقة الدعوة مع الأحباب</span>
          </h4>
          <p className="text-[11px] text-[#6F6668] leading-relaxed font-serif">
            شاركونا الفرحة وأرسلوا رابط هذه الدعوة الفاخرة لأقاربكم وأصدقائكم
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-serif font-semibold border border-[#E8DED8] bg-white text-[#171316] hover:bg-[#FAF7F2] transition cursor-pointer shadow-2xs"
            style={{ borderRadius }}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#175E27]" />
                <span className="text-[#175E27] font-bold">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6F6668]" />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareTrigger}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-serif font-bold text-[#FAF7F2] transition shadow-xs hover:shadow-md cursor-pointer hover:opacity-95"
            style={{
              backgroundColor: primaryColor,
              borderRadius,
            }}
          >
            <Share2 className="w-3.5 h-3.5 text-[#C9A45C]" />
            <span>خيارات المشاركة</span>
          </button>
        </div>
      </div>

      {isOpen && renderShareModal()}
    </div>
  );

  // Render Fallback Share Modal Sheet
  function renderShareModal() {
    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 motion-fade-in"
        onClick={() => setIsOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl border border-[#E8DED8] shadow-2xl p-6 space-y-5 animate-slide-up text-right text-[#171316]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8DED8] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#5A1020] text-[#C9A45C]">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-serif font-bold text-[#5A1020]">
                  مشاركة بطاقة الدعوة
                </h3>
                <p className="text-[11px] text-[#6F6668] font-serif">
                  اختر وسيلة المشاركة المفضلة لديك
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#9A8F92] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Copy Link Direct Box */}
          <div className="p-3 rounded-2xl bg-white border border-[#E8DED8] space-y-2">
            <span className="text-[11px] font-semibold text-[#6F6668] block">
              رابط الدعوة المباشر:
            </span>
            <div className="flex items-center justify-between gap-2 bg-[#FAF7F2] p-2 rounded-xl border border-[#E8DED8]">
              <span className="text-xs font-mono text-[#5A1020] truncate ltr text-left flex-1 px-1">
                {invitationUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-[#EDF7EE] text-[#175E27] border border-[#BFE4C6]'
                    : 'bg-[#5A1020] text-[#FAF7F2] hover:bg-[#721529]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ ✨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C9A45C]" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Fallback Channels Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#6F6668] block">
              مشاركة سريعة عبر التطبيقات:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp Share (Distinct from host contact!) */}
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('share_whatsapp');
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 transition cursor-pointer text-xs font-serif font-bold text-[#1E7E34]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 fill-white text-white" />
                </div>
                <span>واتساب (WhatsApp)</span>
              </a>

              {/* Telegram Share */}
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('share_telegram');
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#2AABEE]/30 bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 transition cursor-pointer text-xs font-serif font-bold text-[#0088CC]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#2AABEE] text-white flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <span>تيليجرام (Telegram)</span>
              </a>

              {/* SMS Share */}
              <a
                href={smsShareUrl}
                onClick={() => {
                  track('share_sms');
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#6F6668]/30 bg-white hover:bg-[#FAF7F2] transition cursor-pointer text-xs font-serif font-bold text-[#171316]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#6F6668] text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span>رسالة SMS</span>
              </a>

              {/* Messenger Share */}
              <a
                href={messengerShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track('share_messenger');
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#0084FF]/30 bg-[#0084FF]/10 hover:bg-[#0084FF]/20 transition cursor-pointer text-xs font-serif font-bold text-[#0084FF]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0084FF] text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span>ماسينجر (Messenger)</span>
              </a>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="text-[10px] text-[#9A8F92] text-center font-serif">
            🔒 رابط الدعوة عام ولا يحتوي على أي بيانات شخصية خاصة بضيوف المناسبة
          </p>
        </div>
      </div>
    );
  }
};
