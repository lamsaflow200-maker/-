/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PublicInvitationViewModel, TemplateStylePreset } from '../../types/engine';
import { VideoRenderer } from '../video';
import { Video as VideoIcon } from 'lucide-react';

interface VideoFoundationSectionProps {
  invitation: PublicInvitationViewModel;
  style: TemplateStylePreset;
  onTrackAction?: (actionName: string) => void;
}

export const VideoFoundationSection: React.FC<VideoFoundationSectionProps> = ({
  invitation,
  style,
  onTrackAction,
}) => {
  const { videos } = invitation;

  if (!videos || videos.length === 0) return null;
  const visibleVideos = videos.filter((v) => v.is_visible !== false);
  if (visibleVideos.length === 0) return null;

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
            <VideoIcon className="w-3.5 h-3.5" style={{ color: style.accentColor }} />
            <span style={{ color: style.accentColor }}>فيديو تذكاري</span>
          </div>
          <h3
            className="text-xl sm:text-2xl font-serif font-bold"
            style={{ color: style.primaryColor }}
          >
            مشاهد تخلد الفرحة
          </h3>
          <p className="text-xs text-neutral-400 font-serif max-w-md mx-auto">
            مقتطفات وفيديو تشويقي وتوثيقي خاص بهذه المناسبة
          </p>
        </div>

        {/* Dynamic Video Player per Template Style */}
        <VideoRenderer
          videos={visibleVideos}
          style={style}
          templateId={invitation.templateId}
          onTrackAction={onTrackAction}
        />
      </div>
    </section>
  );
};
