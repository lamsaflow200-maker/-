/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { GalleryRenderer } from '../gallery';
import { Images } from 'lucide-react';

interface GalleryFoundationSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  onTrackAction?: (actionName: string) => void;
}

export const GalleryFoundationSection: React.FC<GalleryFoundationSectionProps> = ({
  invitation,
  style,
  onTrackAction,
}) => {
  const { gallery, settings } = invitation;

  if (!settings.enableGallery || !gallery || gallery.length === 0) {
    return null;
  }

  const visibleItems = gallery.filter((i) => i.is_visible !== false);
  if (visibleItems.length === 0) return null;

  return (
    <section className="w-full max-w-2xl mx-auto px-4 py-8 select-none text-center">
      <div
        className="p-6 sm:p-10 rounded-3xl border shadow-sm space-y-6"
        style={{
          backgroundColor: style.cardBg,
          borderColor: `${style.accentColor}35`,
          borderRadius: style.cardRadius,
        }}
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif border border-black/10 bg-black/5">
            <Images className="w-3.5 h-3.5" style={{ color: style.accentColor }} />
            <span style={{ color: style.accentColor }}>معرض الذكريات</span>
          </div>
          <h3
            className="text-xl sm:text-2xl font-serif font-bold"
            style={{ color: style.primaryColor }}
          >
            لحظات لا تُنسى
          </h3>
          <p className="text-xs text-neutral-400 font-serif max-w-md mx-auto">
            مجموعة مختارة من أجمل اللحظات والذكريات السعيدة
          </p>
        </div>

        {/* Dynamic Gallery Renderer per Template Layout */}
        <GalleryRenderer
          items={visibleItems}
          style={style}
          templateId={invitation.templateId}
          onTrackAction={onTrackAction}
        />
      </div>
    </section>
  );
};
