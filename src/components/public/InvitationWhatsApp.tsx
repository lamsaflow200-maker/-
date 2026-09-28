/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  buildWhatsAppChatUrl,
  isValidWhatsAppNumber,
  normalizeWhatsAppNumber,
} from '../../utils/phone';
import { MessageCircle, ExternalLink } from 'lucide-react';

export interface InvitationWhatsAppProps {
  hostWhatsapp?: string | null;
  invitationTitle: string;
  hostNames?: string;
  celebrantNames?: string;
  invitationUrl?: string;
  position?: 'hero' | 'contact' | 'bottom' | 'floating';
  customMessage?: string;
  buttonLabel?: string;
  primaryColor?: string;
  accentColor?: string;
  borderRadius?: string;
  onTrackAction?: (actionName: string) => void;
  className?: string;
}

/**
 * Central Public WhatsApp Contact System: InvitationWhatsApp
 *
 * CRITICAL REQUIREMENTS (Prompt 17 Requirements 1 - 8):
 * 1. Depends strictly on `invitations.host_whatsapp`.
 * 2. If present and valid: renders "💬 تواصل معنا عبر WhatsApp".
 * 3. If NOT present or invalid: renders NULL. Never renders empty or disabled button.
 * 4. Safe official wa.me link with normalized E.164 Moroccan / international number.
 * 5. Pre-filled polite message with event info, WITHOUT any private guest data.
 * 6. Supports locations: Hero, Contact section, Bottom area, Floating button. Respects RTL.
 * 7. Mobile native app opening without unnecessary redirect or landing page.
 * 8. Triggers `whatsapp_click` event for analytics foundation.
 */
export const InvitationWhatsApp: React.FC<InvitationWhatsAppProps> = ({
  hostWhatsapp,
  invitationTitle,
  hostNames,
  celebrantNames,
  invitationUrl,
  position = 'contact',
  customMessage,
  buttonLabel = '💬 تواصل معنا عبر WhatsApp',
  primaryColor = '#1E7E34',
  accentColor = '#25D366',
  borderRadius = '14px',
  onTrackAction,
  className = '',
}) => {
  // Requirement 2: If host_whatsapp is missing or invalid, do not display. No empty or disabled button.
  if (!hostWhatsapp || !isValidWhatsAppNumber(hostWhatsapp)) {
    return null;
  }

  // Requirement 5: Polite prefilled message (no private guest details)
  const defaultMessage = customMessage || [
    'السلام عليكم ورحمة الله،',
    `أود الاستفسار بخصوص مناسبة: ${invitationTitle || celebrantNames || 'الدعوة الكريمة'}.`,
    invitationUrl ? `رابط الدعوة: ${invitationUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // Requirement 4: Safe wa.me URL
  const waUrl = buildWhatsAppChatUrl(hostWhatsapp, defaultMessage);
  if (!waUrl) return null;

  // Requirement 8: WhatsApp click event foundation
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      onTrackAction?.('whatsapp_click');
    } catch {
      // Continue navigation even if tracking fails
    }
  };

  // 1. Floating Button Variant
  if (position === 'floating') {
    return (
      <aside
        aria-label="تواصل عبر الواتساب"
        dir="rtl"
        className="fixed bottom-20 left-4 z-40 select-none motion-fade-in print:hidden"
      >
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          title="تواصل مع أصحاب الحفل عبر WhatsApp"
          className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer font-serif text-xs font-bold border-2 border-white/20 backdrop-blur-xs"
          style={{
            boxShadow: '0 8px 24px -4px rgba(37, 211, 102, 0.45)',
          }}
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 fill-white text-white" />
          </div>
          <span className="hidden sm:inline-block tracking-wide">
            تواصل عبر WhatsApp
          </span>
          <span className="sm:hidden tracking-wide">
            واتساب
          </span>
        </a>
      </aside>
    );
  }

  // 2. Hero Location Variant
  if (position === 'hero') {
    return (
      <div dir="rtl" className={`pt-2 text-center select-none ${className}`}>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md cursor-pointer hover:opacity-95"
          style={{
            backgroundColor: primaryColor || '#1E7E34',
            borderRadius,
          }}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{buttonLabel}</span>
          <ExternalLink className="w-3 h-3 opacity-75 rtl:rotate-180" />
        </a>
      </div>
    );
  }

  // 3. Bottom Area Variant
  if (position === 'bottom') {
    return (
      <div dir="rtl" className={`w-full max-w-md mx-auto px-4 py-3 text-center select-none ${className}`}>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-2xl text-xs sm:text-sm font-serif font-bold text-white transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
          style={{
            backgroundColor: primaryColor || '#1E7E34',
            borderRadius,
          }}
        >
          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
          <span>{buttonLabel}</span>
        </a>
      </div>
    );
  }

  // 4. Default: Contact Section Grouped Card Variant
  return (
    <div
      dir="rtl"
      className={`w-full max-w-xl mx-auto px-4 py-3 select-none motion-fade-in ${className}`}
    >
      <div className="p-4 sm:p-5 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/5 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-xs">
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-serif font-bold text-[#171316] flex items-center justify-center sm:justify-start gap-1.5">
            <span className="text-base">💬</span>
            <span>لأي استفسار أو تواصل مباشر</span>
          </h4>
          <p className="text-[11px] text-[#6F6668] leading-relaxed font-serif">
            يسعد أصحاب الحفل الرد على رسائلكم واستفساراتكم مباشرة عبر WhatsApp
          </p>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-serif font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap shrink-0 hover:scale-[1.02] active:scale-98"
          style={{
            backgroundColor: '#1E7E34',
            borderRadius,
          }}
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>{buttonLabel}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>
    </div>
  );
};
