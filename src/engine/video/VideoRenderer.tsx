/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file VideoRenderer component.
 * Renders invitation videos with template-specific styling and layout.
 */

import React, { useMemo } from 'react';
import { InvitationVideo } from '../../types/database';
import { TemplateStylePreset } from '../../types/engine';
import { InvitationVideoPlayer, VideoDisplayStyle } from './InvitationVideoPlayer';

export interface VideoRendererProps {
  videos: InvitationVideo[];
  style: TemplateStylePreset;
  templateId?: string;
  onTrackAction?: (actionName: string) => void;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({
  videos,
  style,
  templateId = 'classic-elegance',
  onTrackAction,
}) => {
  const visibleVideos = useMemo(() => {
    return videos
      .filter((v) => v.is_visible !== false)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [videos]);

  // Zero Fake Media rule: if no visible videos, omit section cleanly
  if (visibleVideos.length === 0) {
    return null;
  }

  // Derive template display style
  const displayStyle: VideoDisplayStyle = useMemo(() => {
    switch (templateId) {
      case 'royal-gold':
      case 'emerald-royal':
        return 'framed';
      case 'black-luxury':
      case 'golden-sunset':
        return 'cinematic';
      case 'rose-romance':
      case 'elegant-pearl':
        return 'editorial';
      case 'moroccan-palace':
      case 'minimal-white':
      case 'floral-romance':
      case 'sapphire-night':
      default:
        return 'contained';
    }
  }, [templateId]);

  return (
    <div className="w-full space-y-6">
      {visibleVideos.map((video) => (
        <div key={video.id} className="space-y-2">
          <InvitationVideoPlayer
            src={video.video_url}
            poster={video.thumbnail_url}
            title={video.title}
            description={video.description}
            accentColor={style.accentColor}
            displayStyle={displayStyle}
            onTrackAction={onTrackAction}
          />

          {video.description && (
            <p className="text-xs text-neutral-300 font-serif text-center px-4 leading-relaxed">
              {video.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
