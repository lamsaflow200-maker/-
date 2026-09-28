/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { Sparkles, Heart } from 'lucide-react';

interface ContactSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  invitation,
  style,
}) => {
  return (
    <footer className="w-full max-w-xl mx-auto px-4 pt-8 pb-16 text-center select-none motion-fade-in space-y-4">
      {/* Decorative Golden Motif */}
      <div className="flex items-center justify-center gap-3">
        <div className="h-px w-10" style={{ backgroundColor: style.accentColor }} />
        <div
          className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px]"
          style={{ borderColor: style.accentColor, color: style.accentColor }}
        >
          ✦
        </div>
        <div className="h-px w-10" style={{ backgroundColor: style.accentColor }} />
      </div>

      <p className="text-xs font-serif" style={{ color: style.textColor }}>
        دامت دياركم عامرة بالأفراح والمسرات
      </p>

      {/* Mnasbati Brand Signature */}
      <div className="pt-4 border-t border-[#E8DED8]/60 space-y-1">
        <p className="text-[11px] font-serif font-bold text-[#5A1020]">
          منسباتي — Mnasbati
        </p>
        <p className="text-[10px] text-[#9A8F92] font-serif">
          دعوتك... بأسلوب يليق بمناسبتك
        </p>
      </div>
    </footer>
  );
};
